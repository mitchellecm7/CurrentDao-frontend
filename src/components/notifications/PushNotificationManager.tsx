import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellRing, 
  Settings, 
  X, 
  Smartphone, 
  Monitor, 
  Mail, 
  Clock,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  RefreshCw,
  TestTube
} from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationPreferences, NotificationType, NotificationCategory } from '../../types/notifications';

interface PushNotificationManagerProps {
  className?: string;
}

const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ className = '' }) => {
  const {
    isSupported,
    isSubscribed,
    subscription,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendNotification,
    requestPermission
  } = usePushNotifications();

  const { preferences, updatePreferences } = useNotifications();
  const [showSettings, setShowSettings] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [deliveryStats, setDeliveryStats] = useState({
    delivered: 0,
    failed: 0,
    lastDelivery: null as Date | null
  });

  // Test notification templates
  const testNotifications = [
    {
      title: 'Price Alert',
      body: 'Energy price increased by 5% in your region',
      type: 'price' as const,
      data: { category: 'trading', priceChange: 0.05 }
    },
    {
      title: 'Trade Executed',
      body: 'Your buy order for 100 MWh has been filled',
      type: 'trade' as const,
      data: { category: 'trading', amount: 100, action: 'buy' }
    },
    {
      title: 'Security Alert',
      body: 'New login detected from unrecognized device',
      type: 'security' as const,
      data: { category: 'security', severity: 'high' }
    }
  ];

  // Handle subscription toggle
  const handleSubscriptionToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        if (permission === 'default') {
          await requestPermission();
        }
        await subscribe();
      }
    } catch (err) {
      console.error('Failed to toggle subscription:', err);
    }
  };

  // Send test notification
  const handleTestNotification = async (template: typeof testNotifications[0]) => {
    if (!isSubscribed) return;

    try {
      await sendNotification({
        title: template.title,
        body: template.body,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge.png',
        tag: `test-${template.type}`,
        data: template.data,
        actions: [
          {
            action: 'view',
            title: 'View Details',
            icon: '/icons/view.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });

      setDeliveryStats(prev => ({
        ...prev,
        delivered: prev.delivered + 1,
        lastDelivery: new Date()
      }));
    } catch (err) {
      console.error('Failed to send test notification:', err);
      setDeliveryStats(prev => ({
        ...prev,
        failed: prev.failed + 1
      }));
    }
  };

  // Get status color
  const getStatusColor = () => {
    if (!isSupported) return 'text-gray-500';
    if (permission === 'denied') return 'text-red-500';
    if (isSubscribed) return 'text-green-500';
    if (permission === 'granted') return 'text-blue-500';
    return 'text-yellow-500';
  };

  // Get status text
  const getStatusText = () => {
    if (!isSupported) return 'Not Supported';
    if (permission === 'denied') return 'Blocked';
    if (isSubscribed) return 'Active';
    if (permission === 'granted') return 'Ready';
    return 'Permission Required';
  };

  if (!isSupported) {
    return (
      <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <WifiOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Push Notifications Not Supported
            </h4>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Your browser doesn't support push notifications. Try using a modern browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {isSubscribed ? (
              <BellRing className={`w-6 h-6 ${getStatusColor()}`} />
            ) : (
              <Bell className={`w-6 h-6 ${getStatusColor()}`} />
            )}
            {isSubscribed && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Push Notifications
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Status: <span className={`font-medium ${getStatusColor()}`}>{getStatusText()}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTestMode(!testMode)}
            className={`p-2 rounded-lg transition-colors ${
              testMode 
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Test Mode"
          >
            <TestTube className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Subscription Control */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Push Notifications
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isSubscribed 
                  ? 'Receiving notifications on this device'
                  : 'Enable to receive notifications'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleSubscriptionToggle}
            disabled={permission === 'denied' || isLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isSubscribed ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
            } ${permission === 'denied' || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isSubscribed ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Delivery Stats */}
        {(deliveryStats.delivered > 0 || deliveryStats.failed > 0) && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {deliveryStats.delivered} delivered
                </span>
              </div>
              {deliveryStats.failed > 0 && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {deliveryStats.failed} failed
                  </span>
                </div>
              )}
            </div>
            {deliveryStats.lastDelivery && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Last: {deliveryStats.lastDelivery.toLocaleTimeString()}
              </span>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Test Mode */}
        <AnimatePresence>
          {testMode && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Test Notifications
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {testNotifications.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleTestNotification(template)}
                    disabled={!isSubscribed}
                    className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      {template.type === 'price' && <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                      {template.type === 'trade' && <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                      {template.type === 'security' && <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {template.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {template.body}
                        </p>
                      </div>
                    </div>
                    <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Notification Settings
              </h4>
              
              {/* Channel Preferences */}
              <div className="space-y-3">
                {Object.entries(preferences.categories).map(([category, settings]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {category === 'trading' && <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                      {category === 'security' && <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                      {category === 'energy' && <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                      {category === 'system' && <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {category}
                      </span>
                    </div>
                    <button
                      onClick={() => updatePreferences({
                        categories: {
                          ...preferences.categories,
                          [category]: {
                            ...settings,
                            push: !settings.push
                          }
                        }
                      })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        settings.push ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          settings.push ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PushNotificationManager;
