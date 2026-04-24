export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationCategory = 
  | 'trading'
  | 'system'
  | 'security'
  | 'wallet'
  | 'dao'
  | 'energy'
  | 'marketplace'
  | 'profile'
  | 'general';

export interface NotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  pushEnabled: boolean;
  desktopEnabled: boolean;
  categories: Record<NotificationCategory, {
    enabled: boolean;
    sound: boolean;
    push: boolean;
    desktop: boolean;
  }>;
  types: Record<NotificationType, {
    enabled: boolean;
    sound: boolean;
    push: boolean;
    desktop: boolean;
  }>;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
  maxVisible: number;
  autoMarkAsRead: boolean;
  autoMarkAsReadDelay: number; // in seconds
}

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  expiresAt?: Date;
  source: string;
  userId?: string;
  sessionId?: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: 'primary' | 'secondary' | 'danger';
  handler: () => void | Promise<void>;
  icon?: string;
}

export interface NotificationFilter {
  types?: NotificationType[];
  categories?: NotificationCategory[];
  read?: boolean;
  priority?: ('low' | 'medium' | 'high' | 'urgent')[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byCategory: Record<NotificationCategory, number>;
  byPriority: Record<'low' | 'medium' | 'high' | 'urgent', number>;
}

export interface NotificationSound {
  type: NotificationType;
  src: string;
  volume: number;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationContextState {
  notifications: Notification[];
  preferences: NotificationPreferences;
  stats: NotificationStats;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  isVisible: boolean;
}

export interface NotificationContextActions {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  markAsUnread: (id: string) => void;
  clearNotifications: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  toggleNotificationCenter: () => void;
  playSound: (type: NotificationType) => void;
  sendPushNotification: (payload: PushNotificationPayload) => Promise<void>;
  subscribeToPushNotifications: () => Promise<NotificationSubscription>;
  unsubscribeFromPushNotifications: () => Promise<void>;
  filterNotifications: (filter: NotificationFilter) => Notification[];
  searchNotifications: (query: string) => Notification[];
  exportNotifications: () => void;
  importNotifications: (data: Notification[]) => void;
}
