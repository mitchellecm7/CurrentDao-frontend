import { useState, useEffect, useCallback } from 'react';

export interface NativeFeature {
  id: string;
  name: string;
  isSupported: boolean;
  isEnabled: boolean;
  permission: 'granted' | 'denied' | 'prompt';
  performance?: {
    scanTime?: number; // For QR code scanning in ms
    batteryUsage?: number; // Percentage
    memoryUsage?: number; // MB
  };
}

export interface DeviceCapabilities {
  platform: 'ios' | 'android' | 'web' | 'unknown';
  hasCamera: boolean;
  hasBiometric: boolean;
  hasWebAuthn: boolean;
  hasContacts: boolean;
  hasShareAPI: boolean;
  hasFileSystem: boolean;
  batteryLevel?: number;
  memoryInfo?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export interface NativeFeaturesState {
  features: Record<string, NativeFeature>;
  deviceCapabilities: DeviceCapabilities;
  isLoading: boolean;
  error: string | null;
}

const useNativeFeatures = () => {
  const [state, setState] = useState<NativeFeaturesState>({
    features: {},
    deviceCapabilities: {
      platform: 'unknown',
      hasCamera: false,
      hasBiometric: false,
      hasWebAuthn: false,
      hasContacts: false,
      hasShareAPI: false,
      hasFileSystem: false,
    },
    isLoading: true,
    error: null,
  });

  // Detect platform
  const detectPlatform = useCallback((): 'ios' | 'android' | 'web' | 'unknown' => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    } else if (/android/.test(userAgent)) {
      return 'android';
    } else {
      return 'web';
    }
  }, []);

  // Check feature support
  const checkFeatureSupport = useCallback(async (featureId: string): Promise<NativeFeature> => {
    let isSupported = false;
    let permission: 'granted' | 'denied' | 'prompt' = 'prompt';

    switch (featureId) {
      case 'camera':
        isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        if (isSupported) {
          try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            permission = 'granted';
          } catch (error: any) {
            permission = error.name === 'NotAllowedError' ? 'denied' : 'prompt';
          }
        }
        break;

      case 'biometric':
        isSupported = !!(window.PublicKeyCredential && 'credentials' in navigator);
        if (isSupported) {
          try {
            const available = await (PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable();
            isSupported = available;
            permission = available ? 'granted' : 'denied';
          } catch {
            permission = 'denied';
          }
        }
        break;

      case 'webauthn':
        isSupported = !!(window.PublicKeyCredential && 'credentials' in navigator);
        permission = isSupported ? 'granted' : 'denied';
        break;

      case 'contacts':
        isSupported = !!(navigator as any).contacts && 'ContactsManager' in window;
        permission = isSupported ? 'prompt' : 'denied';
        break;

      case 'share':
        isSupported = !!(navigator.share);
        permission = isSupported ? 'granted' : 'denied';
        break;

      case 'filesystem':
        isSupported = !!(window.showDirectoryPicker || (navigator as any).storage);
        permission = isSupported ? 'prompt' : 'denied';
        break;

      case 'battery':
        isSupported = !!(navigator.getBattery);
        permission = isSupported ? 'granted' : 'denied';
        break;

      case 'performance':
        isSupported = !!(window.performance && performance.memory);
        permission = 'granted';
        break;

      default:
        isSupported = false;
        permission = 'denied';
    }

    return {
      id: featureId,
      name: featureId.charAt(0).toUpperCase() + featureId.slice(1),
      isSupported,
      isEnabled: isSupported && permission === 'granted',
      permission,
    };
  }, []);

  // Get device capabilities
  const getDeviceCapabilities = useCallback(async (): Promise<DeviceCapabilities> => {
    const platform = detectPlatform();
    
    // Check basic capabilities
    const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasWebAuthn = !!(window.PublicKeyCredential && 'credentials' in navigator);
    const hasShareAPI = !!(navigator.share);
    const hasFileSystem = !!(window.showDirectoryPicker || (navigator as any).storage);

    // Check biometric support
    let hasBiometric = false;
    if (hasWebAuthn) {
      try {
        hasBiometric = await (PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable();
      } catch {
        hasBiometric = false;
      }
    }

    // Check contacts support
    const hasContacts = !!(navigator as any).contacts && 'ContactsManager' in window;

    // Get battery level if available
    let batteryLevel;
    if (navigator.getBattery) {
      try {
        const battery = await navigator.getBattery();
        batteryLevel = battery.level;
      } catch {
        batteryLevel = undefined;
      }
    }

    // Get memory info if available
    let memoryInfo;
    if (window.performance && (performance as any).memory) {
      memoryInfo = {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
      };
    }

    return {
      platform,
      hasCamera,
      hasBiometric,
      hasWebAuthn,
      hasContacts,
      hasShareAPI,
      hasFileSystem,
      batteryLevel,
      memoryInfo,
    };
  }, [detectPlatform]);

  // Initialize features and capabilities
  const initializeFeatures = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get device capabilities
      const capabilities = await getDeviceCapabilities();

      // Check all features
      const featureIds = ['camera', 'biometric', 'webauthn', 'contacts', 'share', 'filesystem', 'battery', 'performance'];
      const features: Record<string, NativeFeature> = {};

      for (const featureId of featureIds) {
        features[featureId] = await checkFeatureSupport(featureId);
      }

      setState({
        features,
        deviceCapabilities: capabilities,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize native features',
      }));
    }
  }, [getDeviceCapabilities, checkFeatureSupport]);

  // Request feature permission
  const requestPermission = useCallback(async (featureId: string): Promise<boolean> => {
    const feature = state.features[featureId];
    if (!feature?.isSupported) {
      return false;
    }

    try {
      let granted = false;

      switch (featureId) {
        case 'camera':
          try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            granted = true;
          } catch (error: any) {
            if (error.name === 'NotAllowedError') {
              granted = false;
            } else {
              // Try again with constraints
              await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
              });
              granted = true;
            }
          }
          break;

        case 'contacts':
          if ((navigator as any).contacts) {
            try {
              await (navigator as any).contacts.select(['name', 'email'], { multiple: true });
              granted = true;
            } catch {
              granted = false;
            }
          }
          break;

        case 'filesystem':
          if (window.showDirectoryPicker) {
            try {
              await window.showDirectoryPicker();
              granted = true;
            } catch {
              granted = false;
            }
          }
          break;

        case 'biometric':
          if (window.PublicKeyCredential) {
            try {
              const available = await (PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable();
              granted = available;
            } catch {
              granted = false;
            }
          }
          break;

        default:
          granted = feature.permission === 'granted';
      }

      // Update feature state
      setState(prev => ({
        ...prev,
        features: {
          ...prev.features,
          [featureId]: {
            ...prev.features[featureId],
            permission: granted ? 'granted' : 'denied',
            isEnabled: granted,
          },
        },
      }));

      return granted;
    } catch (error) {
      console.error(`Failed to request permission for ${featureId}:`, error);
      return false;
    }
  }, [state.features]);

  // Update feature performance metrics
  const updatePerformanceMetrics = useCallback((featureId: string, metrics: Partial<NativeFeature['performance']>) => {
    setState(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureId]: {
          ...prev.features[featureId],
          performance: {
            ...prev.features[featureId].performance,
            ...metrics,
          },
        },
      },
    }));
  }, []);

  // Optimize battery usage
  const optimizeBatteryUsage = useCallback(async (): Promise<number> => {
    if (!navigator.getBattery) {
      return 0;
    }

    try {
      const battery = await navigator.getBattery();
      const currentLevel = battery.level;
      
      // Simulate battery optimization (in real implementation, this would involve:
      // - Reducing scan frequency
      // - Lowering camera resolution
      // - Optimizing animations
      // - Reducing background processes)
      
      const optimizedReduction = currentLevel < 0.2 ? 20 : 
                                currentLevel < 0.5 ? 15 : 10;

      return optimizedReduction;
    } catch {
      return 0;
    }
  }, []);

  // Get platform-specific optimizations
  const getPlatformOptimizations = useCallback(() => {
    const { platform } = state.deviceCapabilities;
    
    switch (platform) {
      case 'ios':
        return {
          scanFrequency: 15, // fps
          cameraResolution: 'medium',
          animationDuration: 300,
          batchSize: 50,
        };

      case 'android':
        return {
          scanFrequency: 20, // fps
          cameraResolution: 'high',
          animationDuration: 250,
          batchSize: 100,
        };

      case 'web':
        return {
          scanFrequency: 10, // fps
          cameraResolution: 'low',
          animationDuration: 200,
          batchSize: 25,
        };

      default:
        return {
          scanFrequency: 10,
          cameraResolution: 'medium',
          animationDuration: 250,
          batchSize: 50,
        };
    }
  }, [state.deviceCapabilities]);

  // Initialize on mount
  useEffect(() => {
    initializeFeatures();
  }, [initializeFeatures]);

  // Monitor battery changes
  useEffect(() => {
    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        const handleBatteryChange = () => {
          setState(prev => ({
            ...prev,
            deviceCapabilities: {
              ...prev.deviceCapabilities,
              batteryLevel: battery.level,
            },
          }));
        };

        battery.addEventListener('levelchange', handleBatteryChange);
        return () => battery.removeEventListener('levelchange', handleBatteryChange);
      });
    }
  }, []);

  return {
    ...state,
    requestPermission,
    updatePerformanceMetrics,
    optimizeBatteryUsage,
    getPlatformOptimizations,
    refreshFeatures: initializeFeatures,
  };
};

export default useNativeFeatures;
