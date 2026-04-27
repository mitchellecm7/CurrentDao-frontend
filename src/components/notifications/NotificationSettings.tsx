import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  BellRing, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Smartphone, 
  Clock, 
  Settings, 
  Check, 
  X,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
  User,
  MessageSquare
} from 'lucide-react';
import { 
  NotificationPreferences, 
  NotificationType, 
  NotificationCategory 
} from '../../types/notifications';
import { useNotifications } from '../../hooks/useNotifications';
import { usePushNotifications } from '../../hooks/usePushNotifications';

interface NotificationSettingsProps {
  onClose?: () => void;
  className?: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  onClose, 
  className = '' 
}) => {
  const { preferences, updatePreferences } = useNotifications();
  const { 
    isSupported: pushSupported, 
    isSubscribed, 
    subscribe: subscribeToPush, 
    unsubscribe: unsubscribeFromPush,
    permission: pushPermission 
  } = usePushNotifications();

  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences>(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  // Get category icon
  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'trading': return <TrendingUp className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'wallet': return <Zap className="w-4 h-4" />;
      case 'dao': return <User className="w-4 h-4" />;
      case 'energy': return <Zap className="w-4 h-4" />;
      case 'marketplace': return <TrendingUp className="w-4 h-4" />;
      case 'profile': return <User className="w-4 h-4" />;
      case 'general':
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  // Get type icon
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'info':
      default: return <Info className="w-4 h-4" />;
    }
  };

  const handleGlobalToggle = (field: keyof NotificationPreferences) => {
    const updated = { ...localPreferences, [field]: !localPreferences[field] };
    setLocalPreferences(updated);
    setHasChanges(true);
  };

  const handleCategoryToggle = (category: NotificationCategory, setting: string) => {
    const updated = {
      ...localPreferences,
      categories: {
        ...localPreferences.categories,
        [category]: {
          ...localPreferences.categories[category],
          [setting]: !localPreferences.categories[category][setting as keyof typeof localPreferences.categories[typeof category]]
        }
      }
    };
    setLocalPreferences(updated);
    setHasChanges(true);
  };

  const handleTypeToggle = (type: NotificationType, setting: string) => {
    const updated = {
      ...localPreferences,
      types: {
        ...localPreferences.types,
        [type]: {
          ...localPreferences.types[type],
          [setting]: !localPreferences.types[type][setting as keyof typeof localPreferences.types[typeof type]]
        }
      }
    };
    setLocalPreferences(updated);
    setHasChanges(true);
  };

  const handleQuietHoursToggle = () => {
    const updated = {
      ...localPreferences,
      quietHours: {
        ...localPreferences.quietHours,
        enabled: !localPreferences.quietHours.enabled
      }
    };
    setLocalPreferences(updated);
    setHasChanges(true);
  };

  const handleQuietHoursTimeChange = (field: 'start' | 'end', value: string) => {
    const updated = {
      ...localPreferences,
      quietHours: {
        ...localPreferences.quietHours,
        [field]: value
      }
    };
    setLocalPreferences(updated);
    setHasChanges(true);
  };

  const handleMaxVisibleChange = (value: number) => {
    const updated = { ...localPreferences, maxVisible: value };
    setLocalPreferences(updated);
    setHasChanges(true);
  };

  const handleAutoMarkAsReadToggle = () => {
    const updated = {
      ...localPreferences,
      autoMarkAsRead: !localPreferences.autoMarkAsRead
    };
    setLocalPreferences(updated);
    setHasChanges(true);
  };

  const handleAutoMarkAsReadDelayChange = (value: number) => {
    const updated = { ...localPreferences, autoMarkAsReadDelay: value };
    setLocalPreferences(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    updatePreferences(localPreferences);
    setHasChanges(false);
    onClose?.();
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  };

  const handlePushSubscribe = async () => {
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
      } else {
        await subscribeToPush();
      }
    } catch (error) {
      console.error('Failed to toggle push notifications:', error);
    }
  };

  return (
    <motion.div
      className={`p-6 space-y-6 ${className}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Notification Settings
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Global Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Global Settings</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {localPreferences.enabled ? <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <BellOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Enable Notifications
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Turn all notifications on or off
                </p>
              </div>
            </div>
            <button
              onClick={() => handleGlobalToggle('enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localPreferences.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localPreferences.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {localPreferences.soundEnabled ? <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Sound Effects
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Play sound for notifications
                </p>
              </div>
            </div>
            <button
              onClick={() => handleGlobalToggle('soundEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localPreferences.soundEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localPreferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Desktop Notifications
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Show desktop notifications
                </p>
              </div>
            </div>
            <button
              onClick={() => handleGlobalToggle('desktopEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localPreferences.desktopEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localPreferences.desktopEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {pushSupported && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Push Notifications
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {pushPermission === 'granted' 
                      ? isSubscribed ? 'Subscribed to push notifications' : 'Enable push notifications'
                      : pushPermission === 'denied'
                      ? 'Push notifications blocked in browser settings'
                      : 'Request permission for push notifications'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handlePushSubscribe}
                disabled={pushPermission === 'denied'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isSubscribed ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                } ${pushPermission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isSubscribed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>
        <div className="flex items-center space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationSettings;
