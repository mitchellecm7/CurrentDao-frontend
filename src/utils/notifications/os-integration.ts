import { Notification, NotificationType } from '../../types/notifications';

export interface OSNotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  dir?: 'auto' | 'ltr' | 'rtl';
  lang?: string;
  vibrate?: number[];
  timestamp?: number;
  renotify?: boolean;
  actions?: NotificationAction[];
  data?: Record<string, any>;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface OSIntegrationCapabilities {
  supported: boolean;
  permission: NotificationPermission;
  maxActions: number;
  supportsVibration: boolean;
  supportsSilent: boolean;
  supportsRequireInteraction: boolean;
  supportsImage: boolean;
  supportsBadge: boolean;
  supportsTag: boolean;
  supportsRenotify: boolean;
}

export interface OSNotificationMetrics {
  totalShown: number;
  totalClicked: number;
  totalClosed: number;
  totalErrors: number;
  averageDisplayTime: number;
  clickRate: number;
  errorRate: number;
  byType: Record<NotificationType, {
    shown: number;
    clicked: number;
    closed: number;
    errors: number;
  }>;
}

export class OSIntegration {
  private capabilities: OSIntegrationCapabilities;
  private metrics: OSNotificationMetrics;
  private activeNotifications: Map<string, Notification> = new Map();
  private notificationStartTime: Map<string, number> = new Map();
  private isInitialized = false;

  constructor() {
    this.capabilities = this.detectCapabilities();
    this.metrics = this.initializeMetrics();
    this.initializeEventListeners();
  }

  private detectCapabilities(): OSIntegrationCapabilities {
    const supported = 'Notification' in window;
    const permission = supported ? Notification.permission : 'denied';

    // Test capabilities
    let maxActions = 0;
    let supportsVibration = false;
    let supportsSilent = false;
    let supportsRequireInteraction = false;
    let supportsImage = false;
    let supportsBadge = false;
    let supportsTag = false;
    let supportsRenotify = false;

    if (supported) {
      // Create a test notification to check capabilities
      try {
        const testNotification = new Notification('', {
          silent: true,
          tag: 'test'
        });

        // Check if options were accepted
        supportsSilent = true;
        supportsTag = true;

        testNotification.close();

        // Check vibration support
        supportsVibration = 'vibrate' in navigator;

        // Check other capabilities based on browser
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('chrome')) {
          maxActions = 2;
          supportsRequireInteraction = true;
          supportsImage = true;
          supportsBadge = true;
          supportsRenotify = true;
        } else if (userAgent.includes('firefox')) {
          maxActions = 3;
          supportsRequireInteraction = true;
          supportsImage = true;
          supportsBadge = true;
          supportsRenotify = true;
        } else if (userAgent.includes('safari')) {
          maxActions = 0;
          supportsImage = true;
          supportsBadge = true;
        }

      } catch (error) {
        console.warn('Could not detect all notification capabilities:', error);
      }
    }

    return {
      supported,
      permission,
      maxActions,
      supportsVibration,
      supportsSilent,
      supportsRequireInteraction,
      supportsImage,
      supportsBadge,
      supportsTag,
      supportsRenotify
    };
  }

  private initializeMetrics(): OSNotificationMetrics {
    return {
      totalShown: 0,
      totalClicked: 0,
      totalClosed: 0,
      totalErrors: 0,
      averageDisplayTime: 0,
      clickRate: 0,
      errorRate: 0,
      byType: {} as Record<NotificationType, any>
    };
  }

  private initializeEventListeners(): void {
    // Listen for notification clicks globally
    if ('Notification' in window) {
      // This will be handled by individual notification instances
    }

    // Listen for visibility changes to track display time
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page hidden, track notification display times
        this.trackNotificationDisplayTimes();
      }
    });

    // Listen for page focus to close notifications
    window.addEventListener('focus', () => {
      this.closeAllNotifications();
    });
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      if (!this.capabilities.supported) {
        console.warn('OS notifications not supported');
        return false;
      }

      // Request permission if not granted
      if (this.capabilities.permission !== 'granted') {
        const permission = await this.requestPermission();
        this.capabilities.permission = permission;
        
        if (permission !== 'granted') {
          console.warn('Notification permission denied');
          return false;
        }
      }

      this.isInitialized = true;
      return true;

    } catch (error) {
      console.error('Failed to initialize OS integration:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission !== 'default') {
      return Notification.permission;
    }

    try {
      const permission = await Notification.requestPermission();
      this.capabilities.permission = permission;
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  async showNotification(notification: Notification, config?: Partial<OSNotificationConfig>): Promise<string> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('OS integration not initialized');
      }
    }

    try {
      const notificationConfig = this.buildNotificationConfig(notification, config);
      const osNotification = new Notification(notificationConfig.title, notificationConfig);

      const notificationId = this.generateNotificationId();
      
      // Store reference
      this.activeNotifications.set(notificationId, notification);
      this.notificationStartTime.set(notificationId, Date.now());

      // Setup event handlers
      this.setupNotificationEventHandlers(osNotification, notificationId, notification);

      // Update metrics
      this.updateMetrics(notification, 'shown');

      // Auto-close after timeout
      this.scheduleAutoClose(osNotification, notificationId, notification);

      return notificationId;

    } catch (error) {
      console.error('Failed to show OS notification:', error);
      this.updateMetrics(notification, 'error');
      throw error;
    }
  }

  private buildNotificationConfig(notification: Notification, config?: Partial<OSNotificationConfig>): OSNotificationConfig {
    const baseConfig: OSNotificationConfig = {
      title: notification.title,
      body: notification.message,
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      silent: notification.priority === 'low',
      data: {
        notificationId: notification.id,
        category: notification.category,
        type: notification.type,
        priority: notification.priority,
        source: notification.source,
        metadata: notification.metadata
      }
    };

    // Add icon based on type/category
    if (this.capabilities.supportsBadge) {
      baseConfig.badge = this.getBadgeUrl(notification);
    }

    if (this.capabilities.supportsImage) {
      baseConfig.icon = this.getIconUrl(notification);
    }

    // Add actions if supported
    if (this.capabilities.maxActions > 0 && notification.actions) {
      baseConfig.actions = notification.actions.slice(0, this.capabilities.maxActions).map(action => ({
        action: action.id,
        title: action.label,
        icon: action.icon
      }));
    }

    // Add vibration if supported
    if (this.capabilities.supportsVibration && notification.priority !== 'low') {
      baseConfig.vibrate = this.getVibrationPattern(notification);
    }

    // Add timestamp
    baseConfig.timestamp = notification.timestamp.getTime();

    // Add renotify for high priority
    if (this.capabilities.supportsRenotify && notification.priority === 'urgent') {
      baseConfig.renotify = true;
    }

    return { ...baseConfig, ...config };
  }

  private setupNotificationEventHandlers(osNotification: Notification, notificationId: string, originalNotification: Notification): void {
    // Click handler
    osNotification.onclick = (event) => {
      this.handleNotificationClick(notificationId, originalNotification, event);
    };

    // Close handler
    osNotification.onclose = () => {
      this.handleNotificationClose(notificationId, originalNotification);
    };

    // Error handler
    osNotification.onerror = (event) => {
      this.handleNotificationError(notificationId, originalNotification, event);
    };

    // Show handler
    osNotification.onshow = () => {
      this.handleNotificationShow(notificationId, originalNotification);
    };
  }

  private handleNotificationClick(notificationId: string, notification: Notification, event: Event): void {
    const displayTime = this.calculateDisplayTime(notificationId);
    
    // Update metrics
    this.updateMetrics(notification, 'clicked', displayTime);

    // Remove from active notifications
    this.activeNotifications.delete(notificationId);
    this.notificationStartTime.delete(notificationId);

    // Handle action clicks
    if (event && 'target' in event) {
      const target = event.target as any;
      if (target.action) {
        const action = notification.actions?.find(a => a.id === target.action);
        if (action) {
          action.handler();
        }
      }
    }

    // Focus window
    window.focus();

    // Emit event
    this.emit('notificationClicked', { notificationId, notification, displayTime });
  }

  private handleNotificationClose(notificationId: string, notification: Notification): void {
    const displayTime = this.calculateDisplayTime(notificationId);
    
    // Update metrics
    this.updateMetrics(notification, 'closed', displayTime);

    // Remove from active notifications
    this.activeNotifications.delete(notificationId);
    this.notificationStartTime.delete(notificationId);

    // Emit event
    this.emit('notificationClosed', { notificationId, notification, displayTime });
  }

  private handleNotificationError(notificationId: string, notification: Notification, event: Event): void {
    // Update metrics
    this.updateMetrics(notification, 'error');

    // Remove from active notifications
    this.activeNotifications.delete(notificationId);
    this.notificationStartTime.delete(notificationId);

    // Emit event
    this.emit('notificationError', { notificationId, notification, error: event });
  }

  private handleNotificationShow(notificationId: string, notification: Notification): void {
    // Emit event
    this.emit('notificationShown', { notificationId, notification });
  }

  private scheduleAutoClose(osNotification: Notification, notificationId: string, notification: Notification): void {
    const closeDelay = this.getAutoCloseDelay(notification);
    
    if (closeDelay > 0) {
      setTimeout(() => {
        if (this.activeNotifications.has(notificationId)) {
          osNotification.close();
        }
      }, closeDelay);
    }
  }

  private getAutoCloseDelay(notification: Notification): number {
    switch (notification.priority) {
      case 'urgent':
        return 0; // Don't auto-close urgent notifications
      case 'high':
        return 10000; // 10 seconds
      case 'medium':
        return 7000; // 7 seconds
      case 'low':
        return 5000; // 5 seconds
      default:
        return 7000;
    }
  }

  private getIconUrl(notification: Notification): string {
    // Return appropriate icon based on notification type and category
    const iconMap = {
      trading: '/icons/trading-notification.png',
      security: '/icons/security-notification.png',
      system: '/icons/system-notification.png',
      wallet: '/icons/wallet-notification.png',
      energy: '/icons/energy-notification.png',
      marketplace: '/icons/marketplace-notification.png',
      dao: '/icons/dao-notification.png',
      profile: '/icons/profile-notification.png',
      general: '/icons/general-notification.png'
    };

    return iconMap[notification.category] || iconMap.general;
  }

  private getBadgeUrl(notification: Notification): string {
    return '/icons/notification-badge.png';
  }

  private getVibrationPattern(notification: Notification): number[] {
    switch (notification.priority) {
      case 'urgent':
        return [200, 100, 200, 100, 200]; // Strong vibration
      case 'high':
        return [200, 100, 200]; // Medium vibration
      case 'medium':
        return [200]; // Light vibration
      case 'low':
        return []; // No vibration
      default:
        return [200];
    }
  }

  private calculateDisplayTime(notificationId: string): number {
    const startTime = this.notificationStartTime.get(notificationId);
    return startTime ? Date.now() - startTime : 0;
  }

  private trackNotificationDisplayTimes(): void {
    // This is called when page becomes hidden
    // We could track how long notifications are displayed
  }

  private updateMetrics(notification: Notification, event: 'shown' | 'clicked' | 'closed' | 'error', displayTime?: number): void {
    this.metrics.totalShown++;

    switch (event) {
      case 'clicked':
        this.metrics.totalClicked++;
        break;
      case 'closed':
        this.metrics.totalClosed++;
        break;
      case 'error':
        this.metrics.totalErrors++;
        break;
    }

    // Update type-specific metrics
    if (!this.metrics.byType[notification.type]) {
      this.metrics.byType[notification.type] = {
        shown: 0,
        clicked: 0,
        closed: 0,
        errors: 0
      };
    }

    const typeMetrics = this.metrics.byType[notification.type];
    typeMetrics.shown++;

    switch (event) {
      case 'clicked':
        typeMetrics.clicked++;
        break;
      case 'closed':
        typeMetrics.closed++;
        break;
      case 'error':
        typeMetrics.errors++;
        break;
    }

    // Calculate rates
    this.metrics.clickRate = (this.metrics.totalClicked / this.metrics.totalShown) * 100;
    this.metrics.errorRate = (this.metrics.totalErrors / this.metrics.totalShown) * 100;

    if (displayTime) {
      // Update average display time
      const totalDisplayTime = this.metrics.averageDisplayTime * (this.metrics.totalShown - 1) + displayTime;
      this.metrics.averageDisplayTime = totalDisplayTime / this.metrics.totalShown;
    }

    // Emit metrics update
    this.emit('metricsUpdated', this.metrics);
  }

  closeNotification(notificationId: string): boolean {
    const notification = this.activeNotifications.get(notificationId);
    if (!notification) return false;

    // Find and close the OS notification
    // Note: Browser doesn't provide a way to find notifications by ID
    // This would need to be implemented with a tracking system
    
    this.activeNotifications.delete(notificationId);
    this.notificationStartTime.delete(notificationId);

    return true;
  }

  closeAllNotifications(): void {
    // Close all active notifications
    this.activeNotifications.clear();
    this.notificationStartTime.clear();

    // Close all OS notifications
    if ('Notification' in window) {
      // Note: There's no direct way to close all notifications
      // This would require tracking all notification instances
    }
  }

  private generateNotificationId(): string {
    return `os-notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods
  getCapabilities(): OSIntegrationCapabilities {
    return { ...this.capabilities };
  }

  getMetrics(): OSNotificationMetrics {
    return { ...this.metrics };
  }

  getActiveNotifications(): Map<string, Notification> {
    return new Map(this.activeNotifications);
  }

  isInitialized(): boolean {
    return this.isInitialized;
  }

  // Event emitter functionality
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Cleanup
  destroy(): void {
    this.closeAllNotifications();
    this.listeners.clear();
    this.activeNotifications.clear();
    this.notificationStartTime.clear();
    this.isInitialized = false;
  }
}

// Singleton instance
export const osIntegration = new OSIntegration();
