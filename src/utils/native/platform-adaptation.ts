export type Platform = 'ios' | 'android' | 'web' | 'unknown';

export interface PlatformConfig {
  camera: {
    defaultFacingMode: 'user' | 'environment';
    optimalResolution: {
      width: number;
      height: number;
    };
    frameRate: number;
    torchSupport: boolean;
  };
  performance: {
    scanFrequency: number; // fps for QR scanning
    animationDuration: number; // ms
    batchSize: number; // for processing
    memoryLimit: number; // MB
  };
  ui: {
    buttonSize: 'small' | 'medium' | 'large';
    spacing: 'compact' | 'normal' | 'relaxed';
    fontSize: 'small' | 'medium' | 'large';
    theme: 'light' | 'dark' | 'auto';
  };
  battery: {
    optimizationLevel: 'low' | 'medium' | 'high';
    lowBatteryThreshold: number; // 0-1
    powerSavingMode: boolean;
  };
  security: {
    biometricType: 'touch-id' | 'face-id' | 'fingerprint' | 'none';
    webAuthnSupport: boolean;
    platformAuthenticator: boolean;
  };
}

export interface DeviceInfo {
  platform: Platform;
  userAgent: string;
  isMobile: boolean;
  isTablet: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  memory?: number;
  cores?: number;
  batteryLevel?: number;
}

class PlatformAdaptation {
  private static readonly STORAGE_KEY = 'currentdao_platform_settings';
  private currentPlatform: Platform = 'unknown';
  private deviceInfo: DeviceInfo | null = null;
  private customSettings: Partial<PlatformConfig> = {};

  /**
   * Initialize platform detection and device info
   */
  async initialize(): Promise<void> {
    this.currentPlatform = this.detectPlatform();
    this.deviceInfo = await this.fetchDeviceInfo();
    this.loadCustomSettings();
  }

  /**
   * Detect current platform
   */
  private detectPlatform(): Platform {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    } else if (/android/.test(userAgent)) {
      return 'android';
    } else {
      return 'web';
    }
  }

  /**
   * Get device information
   */
  private async fetchDeviceInfo(): Promise<DeviceInfo> {
    const userAgent = navigator.userAgent;
    const isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|tablet|kindle|silk/i.test(userAgent);

    const deviceInfo: DeviceInfo = {
      platform: this.currentPlatform,
      userAgent,
      isMobile,
      isTablet,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1,
    };

    // Get memory info if available
    if ((performance as any).memory) {
      deviceInfo.memory = (performance as any).memory.jsHeapSizeLimit / 1024 / 1024; // MB
    }

    // Get hardware concurrency if available
    if (navigator.hardwareConcurrency) {
      deviceInfo.cores = navigator.hardwareConcurrency;
    }

    // Get battery level if available
    if ((navigator as any).getBattery) {
      try {
        const battery = await (navigator as any).getBattery();
        deviceInfo.batteryLevel = battery.level;
      } catch {
        // Battery API not available
      }
    }

    return deviceInfo;
  }

  /**
   * Get platform-specific configuration
   */
  getPlatformConfig(): PlatformConfig {
    const baseConfig = this.getBaseConfigForPlatform(this.currentPlatform);
    const batteryOptimized = this.applyBatteryOptimizations(baseConfig);
    const customConfig = this.applyCustomSettings(batteryOptimized);

    return customConfig;
  }

  /**
   * Get base configuration for platform
   */
  private getBaseConfigForPlatform(platform: Platform): PlatformConfig {
    switch (platform) {
      case 'ios':
        return {
          camera: {
            defaultFacingMode: 'environment',
            optimalResolution: { width: 1920, height: 1080 },
            frameRate: 30,
            torchSupport: true,
          },
          performance: {
            scanFrequency: 15,
            animationDuration: 300,
            batchSize: 50,
            memoryLimit: 512,
          },
          ui: {
            buttonSize: 'medium',
            spacing: 'normal',
            fontSize: 'medium',
            theme: 'auto',
          },
          battery: {
            optimizationLevel: 'medium',
            lowBatteryThreshold: 0.2,
            powerSavingMode: false,
          },
          security: {
            biometricType: 'touch-id',
            webAuthnSupport: true,
            platformAuthenticator: true,
          },
        };

      case 'android':
        return {
          camera: {
            defaultFacingMode: 'environment',
            optimalResolution: { width: 1920, height: 1080 },
            frameRate: 30,
            torchSupport: true,
          },
          performance: {
            scanFrequency: 20,
            animationDuration: 250,
            batchSize: 100,
            memoryLimit: 1024,
          },
          ui: {
            buttonSize: 'medium',
            spacing: 'normal',
            fontSize: 'medium',
            theme: 'auto',
          },
          battery: {
            optimizationLevel: 'medium',
            lowBatteryThreshold: 0.15,
            powerSavingMode: false,
          },
          security: {
            biometricType: 'fingerprint',
            webAuthnSupport: true,
            platformAuthenticator: true,
          },
        };

      case 'web':
        return {
          camera: {
            defaultFacingMode: 'environment',
            optimalResolution: { width: 1280, height: 720 },
            frameRate: 25,
            torchSupport: false,
          },
          performance: {
            scanFrequency: 10,
            animationDuration: 200,
            batchSize: 25,
            memoryLimit: 256,
          },
          ui: {
            buttonSize: 'large',
            spacing: 'relaxed',
            fontSize: 'medium',
            theme: 'auto',
          },
          battery: {
            optimizationLevel: 'low',
            lowBatteryThreshold: 0.1,
            powerSavingMode: false,
          },
          security: {
            biometricType: 'none',
            webAuthnSupport: true,
            platformAuthenticator: false,
          },
        };

      default:
        return this.getBaseConfigForPlatform('web');
    }
  }

  /**
   * Apply battery optimizations
   */
  private applyBatteryOptimizations(config: PlatformConfig): PlatformConfig {
    if (!this.deviceInfo?.batteryLevel) {
      return config;
    }

    const batteryLevel = this.deviceInfo.batteryLevel;
    const { lowBatteryThreshold } = config.battery;

    if (batteryLevel < lowBatteryThreshold) {
      return {
        ...config,
        battery: {
          ...config.battery,
          powerSavingMode: true,
          optimizationLevel: 'high',
        },
        camera: {
          ...config.camera,
          optimalResolution: { width: 640, height: 480 },
          frameRate: 15,
        },
        performance: {
          ...config.performance,
          scanFrequency: Math.max(5, config.performance.scanFrequency / 2),
          animationDuration: config.performance.animationDuration * 0.7,
          batchSize: Math.max(10, config.performance.batchSize / 2),
        },
      };
    }

    return config;
  }

  /**
   * Apply custom settings
   */
  private applyCustomSettings(config: PlatformConfig): PlatformConfig {
    return {
      camera: { ...config.camera, ...this.customSettings.camera },
      performance: { ...config.performance, ...this.customSettings.performance },
      ui: { ...config.ui, ...this.customSettings.ui },
      battery: { ...config.battery, ...this.customSettings.battery },
      security: { ...config.security, ...this.customSettings.security },
    };
  }

  /**
   * Load custom settings from storage
   */
  private loadCustomSettings(): void {
    try {
      const stored = localStorage.getItem(PlatformAdaptation.STORAGE_KEY);
      if (stored) {
        this.customSettings = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load custom settings:', error);
    }
  }

  /**
   * Save custom settings to storage
   */
  saveCustomSettings(settings: Partial<PlatformConfig>): void {
    try {
      this.customSettings = { ...this.customSettings, ...settings };
      localStorage.setItem(
        PlatformAdaptation.STORAGE_KEY,
        JSON.stringify(this.customSettings)
      );
    } catch (error) {
      console.error('Failed to save custom settings:', error);
    }
  }

  /**
   * Get optimized camera settings
   */
  getCameraSettings(): MediaTrackConstraints {
    const config = this.getPlatformConfig();
    const { camera } = config;

    return {
      facingMode: camera.defaultFacingMode,
      width: { ideal: camera.optimalResolution.width },
      height: { ideal: camera.optimalResolution.height },
      frameRate: { ideal: camera.frameRate },
    };
  }

  /**
   * Get optimized QR scanning settings
   */
  getQRScanningSettings(): {
    fps: number;
    qrbox: { width: number; height: number };
    aspectRatio: number;
    disableFlip: boolean;
  } {
    const config = this.getPlatformConfig();
    const { performance } = config;

    return {
      fps: performance.scanFrequency,
      qrbox: { width: 280, height: 280 },
      aspectRatio: 1.0,
      disableFlip: false,
    };
  }

  /**
   * Get UI theme and styling settings
   */
  getUISettings(): {
    buttonSize: string;
    spacing: string;
    fontSize: string;
    theme: string;
    colors: Record<string, string>;
  } {
    const config = this.getPlatformConfig();
    const { ui } = config;

    const colors = this.getPlatformColors();

    return {
      buttonSize: ui.buttonSize,
      spacing: ui.spacing,
      fontSize: ui.fontSize,
      theme: ui.theme,
      colors,
    };
  }

  /**
   * Get platform-specific color scheme
   */
  private getPlatformColors(): Record<string, string> {
    switch (this.currentPlatform) {
      case 'ios':
        return {
          primary: '#007AFF',
          secondary: '#5856D6',
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          background: '#F2F2F7',
          surface: '#FFFFFF',
          text: '#000000',
        };

      case 'android':
        return {
          primary: '#1976D2',
          secondary: '#7B1FA2',
          success: '#388E3C',
          warning: '#F57C00',
          error: '#D32F2F',
          background: '#FAFAFA',
          surface: '#FFFFFF',
          text: '#212121',
        };

      case 'web':
        return {
          primary: '#2563EB',
          secondary: '#7C3AED',
          success: '#059669',
          warning: '#D97706',
          error: '#DC2626',
          background: '#F9FAFB',
          surface: '#FFFFFF',
          text: '#111827',
        };

      default:
        return this.getPlatformColors();
    }
  }

  /**
   * Get performance optimization settings
   */
  getPerformanceSettings(): {
    scanFrequency: number;
    animationDuration: number;
    batchSize: number;
    memoryLimit: number;
    shouldUseWebWorkers: boolean;
    shouldLazyLoad: boolean;
  } {
    const config = this.getPlatformConfig();
    const { performance } = config;

    return {
      ...performance,
      shouldUseWebWorkers: this.deviceInfo?.cores ? this.deviceInfo.cores > 2 : false,
      shouldLazyLoad: this.deviceInfo?.memory ? this.deviceInfo.memory < 512 : true,
    };
  }

  /**
   * Check if feature is supported on current platform
   */
  isFeatureSupported(feature: string): boolean {
    switch (feature) {
      case 'torch':
        return this.getPlatformConfig().camera.torchSupport;
      
      case 'biometric':
        return this.getPlatformConfig().security.biometricType !== 'none';
      
      case 'webauthn':
        return this.getPlatformConfig().security.webAuthnSupport;
      
      case 'platform-authenticator':
        return this.getPlatformConfig().security.platformAuthenticator;
      
      case 'battery-api':
        return !!(navigator as any).getBattery;
      
      case 'contacts-api':
        return !!(navigator as any).contacts && 'ContactsManager' in window;
      
      case 'share-api':
        return !!(navigator as any).share;
      
      case 'filesystem-api':
        return !!(window as any).showDirectoryPicker;
      
      default:
        return false;
    }
  }

  /**
   * Get platform-specific error messages
   */
  getErrorMessage(errorType: string): string {
    const messages = {
      'camera-denied': this.currentPlatform === 'ios' 
        ? 'Camera access was denied. Please enable camera access in Settings > Privacy > Camera.'
        : 'Camera access was denied. Please enable camera access in your browser settings.',
      
      'biometric-denied': this.currentPlatform === 'ios'
        ? 'Biometric authentication was denied. Please enable Face ID/Touch ID in Settings.'
        : 'Biometric authentication was denied. Please enable fingerprint authentication in your device settings.',
      
      'contacts-denied': this.currentPlatform === 'ios'
        ? 'Contacts access was denied. Please enable contacts access in Settings > Privacy > Contacts.'
        : 'Contacts access was denied. Please enable contacts access in your browser settings.',
      
      'unsupported-feature': 'This feature is not supported on your device or browser.',
      
      'network-error': 'Network error occurred. Please check your internet connection.',
      
      'general-error': 'An error occurred. Please try again.',
    };

    return messages[errorType as keyof typeof messages] || messages['general-error'];
  }

  /**
   * Get platform-specific success messages
   */
  getSuccessMessage(action: string): string {
    const messages = {
      'scan-complete': this.currentPlatform === 'ios'
        ? 'QR code scanned successfully!'
        : 'QR code scanned successfully!',
      
      'sync-complete': this.currentPlatform === 'ios'
        ? 'Contacts synced successfully!'
        : 'Contacts synced successfully!',
      
      'auth-complete': this.currentPlatform === 'ios'
        ? 'Authentication successful!'
        : 'Authentication successful!',
      
      'share-complete': this.currentPlatform === 'ios'
        ? 'Content shared successfully!'
        : 'Content shared successfully!',
    };

    return messages[action as keyof typeof messages] || 'Operation completed successfully!';
  }

  /**
   * Get device info (public method)
   */
  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  /**
   * Get current platform
   */
  getCurrentPlatform(): Platform {
    return this.currentPlatform;
  }

  /**
   * Reset custom settings
   */
  resetCustomSettings(): void {
    this.customSettings = {};
    try {
      localStorage.removeItem(PlatformAdaptation.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset custom settings:', error);
    }
  }

  /**
   * Monitor battery changes and apply optimizations
   */
  startBatteryMonitoring(): void {
    if (!(navigator as any).getBattery) {
      return;
    }

    (navigator as any).getBattery().then((battery: any) => {
      const handleBatteryChange = () => {
        // Re-apply optimizations when battery level changes
        // This will trigger UI updates if needed
        console.log('Battery level changed:', battery.level);
      };

      battery.addEventListener('levelchange', handleBatteryChange);
      battery.addEventListener('chargingchange', handleBatteryChange);
    });
  }

  /**
   * Get accessibility settings for current platform
   */
  getAccessibilitySettings(): {
    reducedMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
  } {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const prefersLargeText = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;

    return {
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
      largeText: prefersLargeText,
    };
  }

  /**
   * Apply accessibility optimizations
   */
  applyAccessibilityOptimizations(config: PlatformConfig): PlatformConfig {
    const accessibility = this.getAccessibilitySettings();

    if (accessibility.reducedMotion) {
      config.performance.animationDuration = 0;
    }

    if (accessibility.highContrast) {
      // Adjust colors for high contrast
      const colors = this.getPlatformColors();
      // This would be used by the UI components
    }

    if (accessibility.largeText) {
      config.ui.fontSize = 'large';
    }

    return config;
  }
}

// Export singleton instance
export const platformAdaptation = new PlatformAdaptation();
export default platformAdaptation;
