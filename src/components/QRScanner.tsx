'use client'

import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeResult } from 'html5-qrcode';
import { QRSecurityValidator, SecurityViolationType } from '../services/qr/security-validator';
import { QRService } from '../services/qr/qr-service';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: SecurityViolationType) => void;
  performanceWarning?: (duration: number) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanError,
  performanceWarning,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [scanStartTime, setScanStartTime] = useState<number | null>(null);
  const [lastScanTime, setLastScanTime] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // 1. Initialize the scanner
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
      },
      /* verbose= */ false
    );

    setScanStartTime(Date.now());

    const onScan = (decodedText: string) => {
      const scanDuration = Date.now() - (scanStartTime || Date.now());

      // 2. Security Validation with details
      const validation = QRSecurityValidator.validateXDRWithDetails(decodedText);

      if (validation.isValid) {
        // Performance check (target: <2 seconds)
        if (scanDuration > 2000) {
          performanceWarning?.(scanDuration);
          console.warn(
            `Scan took ${scanDuration}ms (target: <2000ms)`
          );
        }

        setLastScanTime(scanDuration);
        setIsScanning(false);
        scanner.clear();
        onScanSuccess(decodedText);
        toast.success(
          `Scan successful (${scanDuration}ms)`,
          {
            icon: <CheckCircle className="w-5 h-5" />,
          }
        );
      } else {
        // Security violation detected
        QRService.recordSecurityViolation();
        onScanError?.(validation.violation || SecurityViolationType.INVALID_XDR);

        const message =
          validation.message ||
          QRSecurityValidator.getSecurityMessage(
            validation.violation || SecurityViolationType.INVALID_XDR
          );

        setError(message);
        toast.error(message, {
          icon: <AlertCircle className="w-5 h-5" />,
        });

        console.error('Security Warning:', validation);
      }
    };

    scanner.render(onScan, (err) => {
      // Internal scan errors (like 'no QR found in frame') are usually ignored
      if (err && !err.toString().includes('NotFoundException')) {
        console.debug('Scan error:', err);
      }
    });

    return () => {
      scanner.clear().catch(error => console.error('Failed to clear scanner', error));
      setIsScanning(false);
    };
  }, [onScanSuccess, onScanError, performanceWarning, scanStartTime]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border-2 border-blue-500">
      <h3 className="text-white mb-2 font-bold text-lg">Scan Energy Trade QR</h3>
      <p className="text-gray-400 text-sm mb-6">
        Position the QR code within the frame to execute trade.
      </p>

      <div
        id="qr-reader"
        className="w-full max-w-sm overflow-hidden rounded-md border-4 border-blue-500"
        style={{ minHeight: '300px' }}
      ></div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {lastScanTime && (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-md">
          <p className="text-green-400 text-sm">
            ✓ Last scan: {lastScanTime}ms
          </p>
        </div>
      )}

      {!isScanning && (
        <p className="text-gray-400 text-xs mt-4">
          Scan completed. Position your camera to scan another QR code.
        </p>
      )}
    </div>
  );
};

export default QRScanner;