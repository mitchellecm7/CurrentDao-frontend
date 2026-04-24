import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellRing, 
  X, 
  Search, 
  Filter, 
  Settings, 
  Check, 
  Archive,
  Trash2,
  Download,
  Upload,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { Notification, NotificationFilter, NotificationType } from '../../types/notifications';
import NotificationItem from './NotificationItem';
import NotificationSettings from './NotificationSettings';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const {
    notifications,
    preferences,
    stats,
    unreadCount,
    isVisible,
    isLoading,
    error,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    clearNotifications,
    updatePreferences,
    toggleNotificationCenter,
    filterNotifications,
    searchNotifications,
    exportNotifications,
    importNotifications
  } = useNotifications();

  const {
    isSupported: pushSupported,
    isSubscribed,
    permission: pushPermission,
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush
  } = usePushNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>({});
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter notifications based on search and active filters
  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications;

    // Apply search
    if (searchQuery) {
      filtered = searchNotifications(searchQuery);
    }

    // Apply filters
    if (Object.keys(activeFilter).length > 0) {
      filtered = filterNotifications(activeFilter);
    }

    return filtered;
  }, [notifications, searchQuery, activeFilter, searchNotifications, filterNotifications]);

  // Auto-refresh notifications
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      if (Math.random() > 0.8) {
        addNotification({
          type: ['info', 'success', 'warning', 'error'][Math.floor(Math.random() * 4)] as NotificationType,
          category: 'trading',
          title: 'Market Update',
          message: 'Energy prices have updated in your region',
          priority: 'medium',
          source: 'system'
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isVisible, addNotification]);

  // Focus search input when opening
  useEffect(() => {
    if (isVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isVisible]);

  // Handle notification selection
  const handleSelectNotification = useCallback((id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nid => nid !== id)
        : [...prev, id]
    );
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  }, [selectedNotifications.length, filteredNotifications]);

  // Handle bulk actions
  const handleBulkMarkAsRead = useCallback(() => {
    selectedNotifications.forEach(id => markAsRead(id));
    setSelectedNotifications([]);
  }, [selectedNotifications, markAsRead]);

  const handleBulkMarkAsUnread = useCallback(() => {
    selectedNotifications.forEach(id => markAsUnread(id));
    setSelectedNotifications([]);
  }, [selectedNotifications, markAsUnread]);

  const handleBulkDelete = useCallback(() => {
    selectedNotifications.forEach(id => removeNotification(id));
    setSelectedNotifications([]);
  }, [selectedNotifications, removeNotification]);

  // Handle file import
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importNotifications(data);
      } catch (error) {
        console.error('Failed to import notifications:', error);
      }
    };
    reader.readAsText(file);
  }, [importNotifications]);

  // Get notification type icon
  const getNotificationTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  if (!isVisible) {
    return (
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <motion.button
          onClick={toggleNotificationCenter}
          className="relative p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {unreadCount > 0 ? (
            <>
              <BellRing className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <motion.span
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            </>
          ) : (
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          )}
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      className={`fixed inset-0 z-50 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={toggleNotificationCenter}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Notification Panel */}
      <motion.div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold dark:text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <button
            onClick={toggleNotificationCenter}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 dark:text-gray-400" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b dark:border-gray-700 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="w-4 h-4 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Settings className="w-4 h-4 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setIsSelecting(!isSelecting)}
                className={`p-2 rounded-lg transition-colors ${
                  isSelecting 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Check className="w-4 h-4 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {isSelecting && selectedNotifications.length > 0 && (
                <>
                  <button
                    onClick={handleBulkMarkAsRead}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle className="w-4 h-4 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 dark:text-gray-400" />
                  </button>
                </>
              )}
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark all read
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="space-y-2"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="flex flex-wrap gap-2">
                  {(['info', 'success', 'warning', 'error'] as NotificationType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setActiveFilter(prev => ({
                          ...prev,
                          types: prev.types && prev.types.includes(type)
                            ? prev.types.filter(t => t !== type)
                            : [...(prev.types || []), type]
                        }));
                      }}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        activeFilter.types && activeFilter.types.includes(type)
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {getNotificationTypeIcon(type)}
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="border-b dark:border-gray-700"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <NotificationSettings onClose={() => setShowSettings(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {searchQuery || Object.keys(activeFilter).length > 0
                  ? 'Try adjusting your search or filters'
                  : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {isSelecting && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Select all ({filteredNotifications.length})
                    </span>
                  </label>
                </div>
              )}
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onSelect={handleSelectNotification}
                  isSelected={selectedNotifications.includes(notification.id)}
                  isSelecting={isSelecting}
                  onMarkAsRead={markAsRead}
                  onMarkAsUnread={markAsUnread}
                  onRemove={removeNotification}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{stats.total} total notifications</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportNotifications}
                className="hover:text-gray-800 dark:hover:text-gray-200"
                title="Export notifications"
              >
                <Download className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="hover:text-gray-800 dark:hover:text-gray-200"
                title="Import notifications"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={clearNotifications}
                className="hover:text-red-600 dark:hover:text-red-400"
                title="Clear all notifications"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationCenter;
