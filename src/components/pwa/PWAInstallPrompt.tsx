import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  onRemindLater?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss,
  onRemindLater,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    if (checkInstalled()) {
      return; // Don't show prompt if already installed
    }

    // Check visit count for showing after 2nd visit
    const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0');
    const lastVisit = localStorage.getItem('pwa-last-visit');
    const today = new Date().toDateString();
    
    if (lastVisit !== today) {
      localStorage.setItem('pwa-visit-count', String(visitCount + 1));
      localStorage.setItem('pwa-last-visit', today);
    }

    // Show prompt after 2nd visit
    if (visitCount >= 1) {
      // Check if user has dismissed or reminded later
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const remindLater = localStorage.getItem('pwa-install-remind-later');
      
      if (remindLater) {
        const remindDate = new Date(remindLater);
        const now = new Date();
        if (now > remindDate) {
          setIsVisible(true);
        }
      } else if (!dismissed) {
        setIsVisible(true);
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        // Track install conversion
        localStorage.setItem('pwa-install-accepted', 'true');
        localStorage.setItem('pwa-install-date', new Date().toISOString());
        onInstall?.();
        setIsVisible(false);
      }
      
      setDeferredPrompt(null);
    } else if (isIOS) {
      // For iOS, show instructions
      onInstall?.();
    }
  }, [deferredPrompt, isIOS, onInstall]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setIsVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  const handleRemindLater = useCallback(() => {
    const remindDate = new Date();
    remindDate.setDate(remindDate.getDate() + 7); // Remind in 7 days
    localStorage.setItem('pwa-install-remind-later', remindDate.toISOString());
    setIsVisible(false);
    onRemindLater?.();
  }, [onRemindLater]);

  if (!isVisible || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            {isIOS ? <Smartphone className="w-5 h-5 text-blue-600" /> : <Download className="w-5 h-5 text-blue-600" />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Install CurrentDAO App</h3>
            <p className="text-sm text-gray-600">Get the full experience on your device</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        {isIOS ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 mb-2">
              <strong>iOS Instructions:</strong>
            </p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Tap the Share button in Safari</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" to install the app</li>
            </ol>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Monitor className="w-4 h-4" />
              <span>Works offline • Faster access • Native feel</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleInstall}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          {isIOS ? 'View Instructions' : 'Install App'}
        </button>
        <button
          onClick={handleRemindLater}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Remind Later
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
