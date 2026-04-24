import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Notification, 
  NotificationPreferences, 
  NotificationFilter, 
  NotificationStats,
  NotificationContextState,
  NotificationContextActions,
  NotificationType,
  NotificationCategory
} from '../types/notifications';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  soundEnabled: true,
  pushEnabled: false,
  desktopEnabled: true,
  categories: {
    trading: { enabled: true, sound: true, push: false, desktop: true },
    system: { enabled: true, sound: true, push: false, desktop: true },
    security: { enabled: true, sound: true, push: true, desktop: true },
    wallet: { enabled: true, sound: true, push: false, desktop: true },
    dao: { enabled: true, sound: false, push: false, desktop: true },
    energy: { enabled: true, sound: false, push: false, desktop: true },
    marketplace: { enabled: true, sound: true, push: false, desktop: true },
    profile: { enabled: true, sound: false, push: false, desktop: true },
    general: { enabled: true, sound: false, push: false, desktop: true }
  },
  types: {
    info: { enabled: true, sound: false, push: false, desktop: true },
    success: { enabled: true, sound: false, push: false, desktop: true },
    warning: { enabled: true, sound: true, push: false, desktop: true },
    error: { enabled: true, sound: true, push: true, desktop: true }
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  maxVisible: 5,
  autoMarkAsRead: false,
  autoMarkAsReadDelay: 5
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const audioRefs = useRef<Record<NotificationType, HTMLAudioElement | null>>({});

  // Calculate statistics
  const stats: NotificationStats = useCallback(() => {
    const unread = notifications.filter(n => !n.read).length;
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<NotificationType, number>);
    
    const byCategory = notifications.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    }, {} as Record<NotificationCategory, number>);
    
    const byPriority = notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<'low' | 'medium' | 'high' | 'urgent', number>);

    return {
      total: notifications.length,
      unread,
      byType,
      byCategory,
      byPriority
    };
  }, [notifications])();

  const unreadCount = stats.unread;

  // Check if we're in quiet hours
  const isQuietHours = useCallback(() => {
    if (!preferences.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }, [preferences.quietHours]);

  // Play notification sound
  const playSound = useCallback((type: NotificationType) => {
    if (!preferences.soundEnabled || isQuietHours()) return;
    if (!preferences.types[type].sound) return;

    try {
      const audio = audioRefs.current[type];
      if (audio) {
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Handle autoplay restrictions
        });
      }
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, [preferences.soundEnabled, isQuietHours, preferences.types]);

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    if (!preferences.enabled) return;
    
    // Check category and type preferences
    if (!preferences.categories[notification.category].enabled) return;
    if (!preferences.types[notification.type].enabled) return;

    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Keep only the max visible notifications
      return updated.slice(0, preferences.maxVisible * 2);
    });

    // Play sound if enabled
    if (preferences.categories[notification.category].sound) {
      playSound(notification.type);
    }

    // Auto mark as read if enabled
    if (preferences.autoMarkAsRead) {
      setTimeout(() => {
        markAsRead(newNotification.id);
      }, preferences.autoMarkAsReadDelay * 1000);
    }
  }, [preferences, playSound]);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Mark as unread
  const markAsUnread = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: false } : n
    ));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Update preferences
  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
    // Save to localStorage
    try {
      localStorage.setItem('notification-preferences', JSON.stringify({ ...preferences, ...newPreferences }));
    } catch (error) {
      console.warn('Failed to save notification preferences:', error);
    }
  }, [preferences]);

  // Toggle notification center visibility
  const toggleNotificationCenter = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  // Filter notifications
  const filterNotifications = useCallback((filter: NotificationFilter) => {
    return notifications.filter(notification => {
      if (filter.types && !filter.types.includes(notification.type)) return false;
      if (filter.categories && !filter.categories.includes(notification.category)) return false;
      if (filter.read !== undefined && notification.read !== filter.read) return false;
      if (filter.priority && !filter.priority.includes(notification.priority)) return false;
      if (filter.dateRange) {
        const notifTime = notification.timestamp.getTime();
        if (notifTime < filter.dateRange.start.getTime() || notifTime > filter.dateRange.end.getTime()) {
          return false;
        }
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return notification.title.toLowerCase().includes(searchLower) ||
               notification.message.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [notifications]);

  // Search notifications
  const searchNotifications = useCallback((query: string) => {
    return filterNotifications({ search: query });
  }, [filterNotifications]);

  // Export notifications
  const exportNotifications = useCallback(() => {
    try {
      const data = JSON.stringify(notifications, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notifications-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export notifications:', error);
    }
  }, [notifications]);

  // Import notifications
  const importNotifications = useCallback((data: Notification[]) => {
    try {
      setNotifications(prev => [...data, ...prev]);
    } catch (error) {
      console.error('Failed to import notifications:', error);
    }
  }, []);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('notification-preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load notification preferences:', error);
    }
  }, []);

  // Initialize audio elements
  useEffect(() => {
    const sounds: Record<NotificationType, string> = {
      info: '/sounds/notification-info.mp3',
      success: '/sounds/notification-success.mp3',
      warning: '/sounds/notification-warning.mp3',
      error: '/sounds/notification-error.mp3'
    };

    Object.entries(sounds).forEach(([type, src]) => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audioRefs.current[type as NotificationType] = audio;
    });

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  // Clean up expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNotifications(prev => prev.filter(n => !n.expiresAt || n.expiresAt > now));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const state: NotificationContextState = {
    notifications,
    preferences,
    stats,
    isLoading,
    error,
    unreadCount,
    isVisible
  };

  const actions: NotificationContextActions = {
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    clearNotifications,
    updatePreferences,
    toggleNotificationCenter,
    playSound,
    sendPushNotification: async () => {},
    subscribeToPushNotifications: async () => ({ endpoint: '', keys: { p256dh: '', auth: '' } }),
    unsubscribeFromPushNotifications: async () => {},
    filterNotifications,
    searchNotifications,
    exportNotifications,
    importNotifications
  };

  return { ...state, ...actions };
};
