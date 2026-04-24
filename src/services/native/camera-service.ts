export interface CameraDevice {
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput' | 'audiooutput';
  capabilities?: MediaTrackCapabilities;
}

export interface CameraConfig {
  deviceId?: string;
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
  frameRate?: number;
  torch?: boolean;
}

export interface QRScanResult {
  text: string;
  timestamp: Date;
  scanDuration: number;
  confidence?: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DocumentCaptureResult {
  imageData: string;
  timestamp: Date;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

class CameraService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private scanStartTime: number = 0;
  private isScanning: boolean = false;
  private scanCallback: ((result: QRScanResult) => void) | null = null;

  /**
   * Get available camera devices
   */
  async getAvailableDevices(): Promise<CameraDevice[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}`,
          kind: device.kind as 'videoinput',
        }));
    } catch (error) {
      console.error('Failed to enumerate camera devices:', error);
      return [];
    }
  }

  /**
   * Check camera permissions
   */
  async checkCameraPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasPermission = devices.some(device => device.label !== '');
      
      if (hasPermission) {
        return 'granted';
      }

      // Try to get permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      stream.getTracks().forEach(track => track.stop());
      
      return 'granted';
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        return 'denied';
      }
      return 'prompt';
    }
  }

  /**
   * Request camera permission
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  /**
   * Initialize camera with specific configuration
   */
  async initializeCamera(config: CameraConfig = {}): Promise<MediaStream> {
    try {
      // Stop existing stream
      if (this.stream) {
        this.stopCamera();
      }

      // Get available devices if no specific device is requested
      let deviceId = config.deviceId;
      if (!deviceId) {
        const devices = await this.getAvailableDevices();
        if (devices.length === 0) {
          throw new Error('No camera devices available');
        }
        
        // Prefer back camera for QR scanning
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('environment')
        );
        deviceId = backCamera?.deviceId || devices[0].deviceId;
      }

      // Set default configuration
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: config.facingMode || 'environment',
          width: { ideal: config.width || 1280 },
          height: { ideal: config.height || 720 },
          frameRate: { ideal: config.frameRate || 30 },
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.stream;
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      throw error;
    }
  }

  /**
   * Start QR code scanning
   */
  async startQRScanning(
    videoElement: HTMLVideoElement,
    callback: (result: QRScanResult) => void,
    config: CameraConfig = {}
  ): Promise<void> {
    try {
      // Initialize camera
      await this.initializeCamera(config);
      this.videoElement = videoElement;
      this.scanCallback = callback;
      this.isScanning = true;

      // Set video stream
      videoElement.srcObject = this.stream;
      await videoElement.play();

      // Start scanning loop
      this.scanQRCode();
    } catch (error) {
      console.error('Failed to start QR scanning:', error);
      throw error;
    }
  }

  /**
   * QR code scanning loop
   */
  private async scanQRCode(): Promise<void> {
    if (!this.isScanning || !this.videoElement || !this.stream) {
      return;
    }

    try {
      // Use html5-qrcode library for QR scanning
      const { Html5Qrcode } = await import('html5-qrcode');
      
      const html5QrCode = new Html5Qrcode('qr-reader', {
        formatsToSupport: [0], // QR_CODE only
      });

      html5QrCode.start(
        this.videoElement,
        {
          fps: 15,
          qrbox: { width: 280, height: 280 },
        },
        (decodedText) => {
          const scanResult: QRScanResult = {
            text: decodedText,
            timestamp: new Date(),
            scanDuration: Date.now() - this.scanStartTime,
          };

          this.scanCallback?.(scanResult);
          this.stopScanning();
        },
        (error) => {
          // Ignore scan errors (no QR found in frame)
        }
      );

      this.scanStartTime = Date.now();
    } catch (error) {
      console.error('QR scanning error:', error);
      
      // Fallback: try again after delay
      if (this.isScanning) {
        setTimeout(() => this.scanQRCode(), 1000);
      }
    }
  }

  /**
   * Capture document/image
   */
  async captureDocument(
    videoElement: HTMLVideoElement,
    quality: number = 0.9
  ): Promise<DocumentCaptureResult> {
    try {
      // Create canvas if not exists
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
      }

      const canvas = this.canvas;
      const video = videoElement;

      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          quality
        );
      });

      // Convert to data URL
      const imageData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      return {
        imageData,
        timestamp: new Date(),
        metadata: {
          width: canvas.width,
          height: canvas.height,
          format: 'jpeg',
          size: blob.size,
        },
      };
    } catch (error) {
      console.error('Failed to capture document:', error);
      throw error;
    }
  }

  /**
   * Toggle torch/flashlight
   */
  async toggleTorch(enable: boolean): Promise<boolean> {
    if (!this.stream) {
      return false;
    }

    try {
      const videoTrack = this.stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities() as any;

      if (capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: enable }] as any,
        });
        return true;
      }
    } catch (error) {
      console.error('Failed to toggle torch:', error);
    }

    return false;
  }

  /**
   * Check if torch is available
   */
  async isTorchAvailable(): Promise<boolean> {
    if (!this.stream) {
      return false;
    }

    try {
      const videoTrack = this.stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities() as any;
      return capabilities.torch || false;
    } catch {
      return false;
    }
  }

  /**
   * Get camera capabilities
   */
  async getCameraCapabilities(): Promise<MediaTrackCapabilities | null> {
    if (!this.stream) {
      return null;
    }

    try {
      const videoTrack = this.stream.getVideoTracks()[0];
      return videoTrack.getCapabilities();
    } catch (error) {
      console.error('Failed to get camera capabilities:', error);
      return null;
    }
  }

  /**
   * Optimize camera for battery
   */
  async optimizeForBattery(): Promise<void> {
    if (!this.stream) {
      return;
    }

    try {
      const videoTrack = this.stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();

      // Apply battery-optimized settings
      const constraints = {
        width: { ideal: 640 },  // Lower resolution
        height: { ideal: 480 },
        frameRate: { ideal: 15 }, // Lower frame rate
      };

      await videoTrack.applyConstraints(constraints);
    } catch (error) {
      console.error('Failed to optimize camera for battery:', error);
    }
  }

  /**
   * Get camera statistics
   */
  getCameraStats(): {
    isActive: boolean;
    deviceLabel: string;
    resolution: { width: number; height: number } | null;
    frameRate: number | null;
  } {
    if (!this.stream) {
      return {
        isActive: false,
        deviceLabel: '',
        resolution: null,
        frameRate: null,
      };
    }

    const videoTrack = this.stream.getVideoTracks()[0];
    const settings = videoTrack.getSettings();

    return {
      isActive: true,
      deviceLabel: videoTrack.label || 'Unknown Camera',
      resolution: settings.width && settings.height ? {
        width: settings.width,
        height: settings.height,
      } : null,
      frameRate: settings.frameRate || null,
    };
  }

  /**
   * Stop scanning
   */
  stopScanning(): void {
    this.isScanning = false;
    this.scanCallback = null;
  }

  /**
   * Stop camera
   */
  stopCamera(): void {
    this.stopScanning();

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopCamera();
    this.canvas = null;
  }
}

// Export singleton instance
export const cameraService = new CameraService();
export default cameraService;
