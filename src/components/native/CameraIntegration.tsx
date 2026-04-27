'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeResult } from 'html5-qrcode';
import { QRSecurityValidator, SecurityViolationType } from '../../services/qr/security-validator';
import { QRService } from '../../services/qr/qr-service';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle, Camera, CameraOff, RefreshCw } from 'lucide-react';

interface CameraIntegrationProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: SecurityViolationType) => void;
  performanceWarning?: (duration: number) => void;
  enableDocumentCapture?: boolean;
  onDocumentCapture?: (imageData: string) => void;
}

const CameraIntegration: React.FC<CameraIntegrationProps> = ({
  onScanSuccess,
  onScanError,
  performanceWarning,
  enableDocumentCapture = false,
  onDocumentCapture,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [scanStartTime, setScanStartTime] = useState<number | null>(null);
  const [lastScanTime, setLastScanTime] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [captureMode, setCaptureMode] = useState<'qr' | 'document'>('qr');
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Performance optimization: Use requestAnimationFrame for smooth scanning
  const optimizedScanCallback = useCallback((decodedText: string) => {
    const scanDuration = Date.now() - (scanStartTime || Date.now());

    // Target: <1 second for QR code scanning as per acceptance criteria
    if (scanDuration > 1000) {
      performanceWarning?.(scanDuration);
      console.warn(`Scan took ${scanDuration}ms (target: <1000ms)`);
    }

    const validation = QRSecurityValidator.validateXDRWithDetails(decodedText);

    if (validation.isValid) {
      setLastScanTime(scanDuration);
      setIsScanning(false);
      scannerRef.current?.clear();
      onScanSuccess(decodedText);
      toast.success(`Scan successful (${scanDuration}ms)`, {
        icon: <CheckCircle className="w-5 h-5" />,
      });
    } else {
      QRService.recordSecurityViolation();
      onScanError?.(validation.violation || SecurityViolationType.INVALID_XDR);

      const message = validation.message || 
        QRSecurityValidator.getSecurityMessage(validation.violation || SecurityViolationType.INVALID_XDR);

      setError(message);
      toast.error(message, {
        icon: <AlertCircle className="w-5 h-5" />,
      });
    }
  }, [onScanSuccess, onScanError, performanceWarning, scanStartTime]);

  // Initialize QR scanner
  const initializeQRScanner = useCallback(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        'native-qr-reader',
        {
          fps: 15, // Increased FPS for faster scanning
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0,
          disableFlip: false,
          // Mobile-specific optimizations
          supportedScanTypes: [0], // QR_CODE only for performance
        },
        false
      );
    }

    setScanStartTime(Date.now());
    setCameraActive(true);

    scannerRef.current.render(optimizedScanCallback, (err) => {
      if (err && !err.toString().includes('NotFoundException')) {
        console.debug('Scan error:', err);
      }
    });
  }, [optimizedScanCallback]);

  // Document capture functionality
  const captureDocument = useCallback(() => {
    if (videoRef.current && onDocumentCapture) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        onDocumentCapture(imageData);
        toast.success('Document captured successfully');
      }
    }
  }, [onDocumentCapture]);

  // Toggle torch/flashlight
  const toggleTorch = useCallback(async () => {
    if (torchAvailable && videoRef.current) {
      const stream = (videoRef.current.srcObject as MediaStream);
      const track = stream.getVideoTracks()[0];
      
      try {
        const capabilities = track.getCapabilities() as any;
        if ('torch' in capabilities) {
          await track.applyConstraints({
            advanced: [{ torch: !torchOn }] as any
          });
          setTorchOn(!torchOn);
        }
      } catch (err) {
        console.error('Failed to toggle torch:', err);
      }
    }
  }, [torchAvailable, torchOn]);

  // Check for torch availability
  useEffect(() => {
    const checkTorchAvailability = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length > 0) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities();
          setTorchAvailable('torch' in capabilities);
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.log('Torch not available');
      }
    };

    checkTorchAvailability();
  }, []);

  // Initialize scanner on mount
  useEffect(() => {
    if (captureMode === 'qr') {
      initializeQRScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => 
          console.error('Failed to clear scanner', error)
        );
      }
      setCameraActive(false);
    };
  }, [captureMode, initializeQRScanner]);

  // Switch between QR and document capture
  const switchMode = useCallback((mode: 'qr' | 'document') => {
    setCaptureMode(mode);
    setError(null);
    setIsScanning(true);
    
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => 
        console.error('Failed to clear scanner', error)
      );
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border-2 border-blue-500">
      <div className="flex items-center justify-between w-full mb-4">
        <h3 className="text-white font-bold text-lg">
          {captureMode === 'qr' ? 'QR Code Scanner' : 'Document Capture'}
        </h3>
        <div className="flex gap-2">
          {enableDocumentCapture && (
            <button
              onClick={() => switchMode(captureMode === 'qr' ? 'document' : 'qr')}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {captureMode === 'qr' ? <Camera className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
            </button>
          )}
          {torchAvailable && captureMode === 'qr' && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-lg transition-colors ${
                torchOn ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {torchOn ? '💡' : '🔦'}
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-6 text-center">
        {captureMode === 'qr' 
          ? 'Position the QR code within the frame for instant scanning.'
          : 'Position document clearly and tap capture to save.'
        }
      </p>

      {captureMode === 'qr' ? (
        <div
          id="native-qr-reader"
          className="w-full max-w-sm overflow-hidden rounded-md border-4 border-blue-500"
          style={{ minHeight: '320px' }}
        ></div>
      ) : (
        <div className="relative w-full max-w-sm">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-md border-4 border-blue-500"
            style={{ minHeight: '320px' }}
          />
          <button
            onClick={captureDocument}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-4 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {lastScanTime && (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-md">
          <p className="text-green-400 text-sm">
            ✓ Last scan: {lastScanTime}ms {lastScanTime < 1000 ? '(Optimal)' : '(Slow)'}
          </p>
        </div>
      )}

      {!isScanning && (
        <p className="text-gray-400 text-xs mt-4 text-center">
          Scan completed. Position your camera to scan another QR code.
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <div className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>Camera {cameraActive ? 'Active' : 'Inactive'}</span>
        {torchOn && <span>• Flashlight On</span>}
      </div>
    </div>
  );
};

export default CameraIntegration;
