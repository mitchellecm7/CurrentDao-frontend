import { EventEmitter } from 'events';
import { 
  Notification, 
  NotificationType, 
  NotificationCategory, 
  NotificationPreferences,
  PushNotificationPayload,
  NotificationSubscription 
} from '../../types/notifications';

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  priority: number;
  category: NotificationCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationCondition {
  id: string;
  type: 'time' | 'location' | 'user_activity' | 'price' | 'trade' | 'security' | 'system';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'between' | 'not_between';
  field: string;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface NotificationAction {
  id: string;
  type: 'push' | 'email' | 'sms' | 'webhook' | 'in_app' | 'os_notification';
  config: {
    template?: string;
    delay?: number; // in seconds
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    sound?: string;
    vibration?: boolean;
    led?: boolean;
    url?: string;
    webhookUrl?: string;
    emailAddress?: string;
    phoneNumber?: string;
  };
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  timestamp: Date;
  attempts: number;
  lastAttempt?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

export interface NotificationMetrics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  averageDeliveryTime: number; // in milliseconds
  channelMetrics: Record<string, {
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
  }>;
  categoryMetrics: Record<NotificationCategory, {
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
  }>;
  typeMetrics: Record<NotificationType, {
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
  }>;
}

export class NotificationEngine extends EventEmitter {
  private rules: Map<string, NotificationRule> = new Map();
  private deliveries: Map<string, NotificationDelivery> = new Map();
  private metrics: NotificationMetrics;
  private processingQueue: Notification[] = [];
  private isProcessing = false;
  private retryQueue: NotificationDelivery[] = [];
  private quietHoursActive = false;
  private emergencyMode = false;

  constructor() {
    super();
    this.metrics = this.initializeMetrics();
    this.startMetricsCollection();
    this.startQuietHoursMonitoring();
  }

  private initializeMetrics(): NotificationMetrics {
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      deliveryRate: 0,
      averageDeliveryTime: 0,
      channelMetrics: {},
      categoryMetrics: {} as Record<NotificationCategory, any>,
      typeMetrics: {} as Record<NotificationType, any>
    };
  }

  // Rule Management
  createRule(ruleData: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>): string {
    const rule: NotificationRule = {
      ...ruleData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.rules.set(rule.id, rule);
    this.emit('ruleCreated', rule);
    return rule.id;
  }

  updateRule(id: string, updates: Partial<NotificationRule>): boolean {
    const rule = this.rules.get(id);
    if (!rule) return false;

    const updatedRule = { ...rule, ...updates, updatedAt: new Date() };
    this.rules.set(id, updatedRule);
    this.emit('ruleUpdated', updatedRule);
    return true;
  }

  deleteRule(id: string): boolean {
    const rule = this.rules.get(id);
    if (!rule) return false;

    this.rules.delete(id);
    this.emit('ruleDeleted', rule);
    return true;
  }

  getRules(filter?: { enabled?: boolean; category?: NotificationCategory }): NotificationRule[] {
    let rules = Array.from(this.rules.values());

    if (filter?.enabled !== undefined) {
      rules = rules.filter(rule => rule.enabled === filter.enabled);
    }

    if (filter?.category) {
      rules = rules.filter(rule => rule.category === filter.category);
    }

    return rules.sort((a, b) => b.priority - a.priority);
  }

  // Notification Processing
  async processNotification(notification: Notification): Promise<void> {
    if (this.isProcessing) {
      this.processingQueue.push(notification);
      return;
    }

    this.isProcessing = true;

    try {
      // Apply rules
      const matchingRules = this.findMatchingRules(notification);
      
      if (matchingRules.length === 0) {
        // Default processing if no rules match
        await this.defaultProcessNotification(notification);
      } else {
        // Process based on matching rules
        for (const rule of matchingRules) {
          await this.processRuleActions(notification, rule);
        }
      }

      this.updateMetrics(notification, 'sent');
      this.emit('notificationProcessed', notification);

    } catch (error) {
      console.error('Error processing notification:', error);
      this.updateMetrics(notification, 'failed');
      this.emit('processingError', { notification, error });
    } finally {
      this.isProcessing = false;
      
      // Process queue
      if (this.processingQueue.length > 0) {
        const next = this.processingQueue.shift();
        if (next) {
          await this.processNotification(next);
        }
      }
    }
  }

  private findMatchingRules(notification: Notification): NotificationRule[] {
    return Array.from(this.rules.values())
      .filter(rule => rule.enabled)
      .filter(rule => this.evaluateConditions(notification, rule.conditions))
      .sort((a, b) => b.priority - a.priority);
  }

  private evaluateConditions(notification: Notification, conditions: NotificationCondition[]): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let currentOperator: 'AND' | 'OR' = 'AND';

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(notification, condition);
      
      if (conditions.indexOf(condition) === 0) {
        result = conditionResult;
      } else {
        if (currentOperator === 'AND') {
          result = result && conditionResult;
        } else {
          result = result || conditionResult;
        }
      }

      currentOperator = condition.logicalOperator || 'AND';
    }

    return result;
  }

  private evaluateCondition(notification: Notification, condition: NotificationCondition): boolean {
    const fieldValue = this.getFieldValue(notification, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'not_contains':
        return !String(fieldValue).includes(String(condition.value));
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      case 'between':
        return Array.isArray(condition.value) && 
               Number(fieldValue) >= condition.value[0] && 
               Number(fieldValue) <= condition.value[1];
      case 'not_between':
        return Array.isArray(condition.value) && 
               (Number(fieldValue) < condition.value[0] || 
                Number(fieldValue) > condition.value[1]);
      default:
        return false;
    }
  }

  private getFieldValue(notification: Notification, field: string): any {
    const fieldParts = field.split('.');
    let value: any = notification;

    for (const part of fieldParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private async processRuleActions(notification: Notification, rule: NotificationRule): Promise<void> {
    for (const action of rule.actions) {
      await this.executeAction(notification, action, rule);
    }
  }

  private async executeAction(notification: Notification, action: NotificationAction, rule: NotificationRule): Promise<void> {
    const deliveryId = this.generateId();
    const delivery: NotificationDelivery = {
      id: deliveryId,
      notificationId: notification.id,
      channel: action.type,
      status: 'pending',
      timestamp: new Date(),
      attempts: 0
    };

    this.deliveries.set(deliveryId, delivery);

    try {
      switch (action.type) {
        case 'push':
          await this.sendPushNotification(notification, action.config);
          break;
        case 'email':
          await this.sendEmailNotification(notification, action.config);
          break;
        case 'sms':
          await this.sendSMSNotification(notification, action.config);
          break;
        case 'webhook':
          await this.sendWebhookNotification(notification, action.config);
          break;
        case 'in_app':
          await this.sendInAppNotification(notification, action.config);
          break;
        case 'os_notification':
          await this.sendOSNotification(notification, action.config);
          break;
      }

      delivery.status = 'delivered';
      delivery.lastAttempt = new Date();

    } catch (error) {
      delivery.status = 'failed';
      delivery.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Add to retry queue
      if (delivery.attempts < 3) {
        this.retryQueue.push(delivery);
      }
    }

    delivery.attempts++;
    this.emit('deliveryUpdated', delivery);
  }

  private async defaultProcessNotification(notification: Notification): Promise<void> {
    // Default in-app notification
    await this.sendInAppNotification(notification, {
      priority: notification.priority
    });
  }

  // Delivery Methods
  private async sendPushNotification(notification: Notification, config: any): Promise<void> {
    const payload: PushNotificationPayload = {
      title: notification.title,
      body: notification.message,
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge.png',
      tag: notification.id,
      data: notification.metadata,
      priority: config.priority || notification.priority,
      actions: notification.actions?.map(action => ({
        action: action.id,
        title: action.label,
        icon: action.icon
      }))
    };

    // Emit push notification event
    this.emit('pushNotification', { notification, payload, config });
    
    // Simulate delivery time
    await this.simulateDelivery();
  }

  private async sendEmailNotification(notification: Notification, config: any): Promise<void> {
    const emailData = {
      to: config.emailAddress,
      subject: notification.title,
      body: this.generateEmailTemplate(notification, config.template),
      priority: config.priority || notification.priority
    };

    this.emit('emailNotification', { notification, emailData, config });
    await this.simulateDelivery();
  }

  private async sendSMSNotification(notification: Notification, config: any): Promise<void> {
    const smsData = {
      to: config.phoneNumber,
      message: this.generateSMSTemplate(notification, config.template),
      priority: config.priority || notification.priority
    };

    this.emit('smsNotification', { notification, smsData, config });
    await this.simulateDelivery();
  }

  private async sendWebhookNotification(notification: Notification, config: any): Promise<void> {
    const webhookData = {
      url: config.webhookUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        notification,
        timestamp: new Date().toISOString(),
        ruleId: config.ruleId
      }
    };

    this.emit('webhookNotification', { notification, webhookData, config });
    await this.simulateDelivery();
  }

  private async sendInAppNotification(notification: Notification, config: any): Promise<void> {
    this.emit('inAppNotification', { notification, config });
    await this.simulateDelivery();
  }

  private async sendOSNotification(notification: Notification, config: any): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      const osNotification = new Notification(notification.title, {
        body: notification.message,
        icon: config.icon || '/icons/notification-icon.png',
        badge: config.badge || '/icons/badge.png',
        tag: notification.id,
        requireInteraction: config.priority === 'urgent',
        silent: !config.sound
      });

      if (notification.actions) {
        osNotification.onclick = () => {
          // Handle notification click
          this.emit('notificationClicked', { notification, action: 'default' });
        };
      }

      setTimeout(() => osNotification.close(), 5000);
    }

    this.emit('osNotification', { notification, config });
    await this.simulateDelivery();
  }

  // Template Generation
  private generateEmailTemplate(notification: Notification, template?: string): string {
    if (template) {
      return this.replaceTemplateVariables(template, notification);
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; margin-bottom: 20px;">${notification.title}</h2>
        <p style="color: #666; line-height: 1.6;">${notification.message}</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Category: ${notification.category}<br>
            Priority: ${notification.priority}<br>
            Time: ${notification.timestamp.toLocaleString()}
          </p>
        </div>
      </div>
    `;
  }

  private generateSMSTemplate(notification: Notification, template?: string): string {
    if (template) {
      return this.replaceTemplateVariables(template, notification);
    }

    return `${notification.title}: ${notification.message}`;
  }

  private replaceTemplateVariables(template: string, notification: Notification): string {
    return template
      .replace(/\{title\}/g, notification.title)
      .replace(/\{message\}/g, notification.message)
      .replace(/\{category\}/g, notification.category)
      .replace(/\{priority\}/g, notification.priority)
      .replace(/\{timestamp\}/g, notification.timestamp.toLocaleString())
      .replace(/\{id\}/g, notification.id);
  }

  // Helper Methods
  private async simulateDelivery(): Promise<void> {
    // Simulate network delay (100-500ms)
    const delay = Math.random() * 400 + 100;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Metrics and Monitoring
  private updateMetrics(notification: Notification, status: 'sent' | 'delivered' | 'failed'): void {
    this.metrics.totalSent++;

    if (status === 'delivered') {
      this.metrics.totalDelivered++;
    } else if (status === 'failed') {
      this.metrics.totalFailed++;
    }

    this.metrics.deliveryRate = (this.metrics.totalDelivered / this.metrics.totalSent) * 100;

    // Update category metrics
    if (!this.metrics.categoryMetrics[notification.category]) {
      this.metrics.categoryMetrics[notification.category] = {
        sent: 0,
        delivered: 0,
        failed: 0,
        deliveryRate: 0
      };
    }

    const categoryMetric = this.metrics.categoryMetrics[notification.category];
    categoryMetric.sent++;
    if (status === 'delivered') categoryMetric.delivered++;
    if (status === 'failed') categoryMetric.failed++;
    categoryMetric.deliveryRate = (categoryMetric.delivered / categoryMetric.sent) * 100;

    // Update type metrics
    if (!this.metrics.typeMetrics[notification.type]) {
      this.metrics.typeMetrics[notification.type] = {
        sent: 0,
        delivered: 0,
        failed: 0,
        deliveryRate: 0
      };
    }

    const typeMetric = this.metrics.typeMetrics[notification.type];
    typeMetric.sent++;
    if (status === 'delivered') typeMetric.delivered++;
    if (status === 'failed') typeMetric.failed++;
    typeMetric.deliveryRate = (typeMetric.delivered / typeMetric.sent) * 100;
  }

  private startMetricsCollection(): void {
    // Collect metrics every minute
    setInterval(() => {
      this.emit('metricsUpdated', this.getMetrics());
    }, 60 * 1000);
  }

  private startQuietHoursMonitoring(): void {
    // Check quiet hours every minute
    setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      
      // Default quiet hours: 22:00 - 08:00
      this.quietHoursActive = hour >= 22 || hour < 8;
      this.emit('quietHoursChanged', this.quietHoursActive);
    }, 60 * 1000);
  }

  // Public Methods
  getMetrics(): NotificationMetrics {
    return { ...this.metrics };
  }

  getDeliveries(filter?: { notificationId?: string; status?: string }): NotificationDelivery[] {
    let deliveries = Array.from(this.deliveries.values());

    if (filter?.notificationId) {
      deliveries = deliveries.filter(d => d.notificationId === filter.notificationId);
    }

    if (filter?.status) {
      deliveries = deliveries.filter(d => d.status === filter.status);
    }

    return deliveries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  setEmergencyMode(enabled: boolean): void {
    this.emergencyMode = enabled;
    this.emit('emergencyModeChanged', enabled);
  }

  // Retry failed deliveries
  async retryFailedDeliveries(): Promise<void> {
    const failedDeliveries = this.retryQueue.splice(0);
    
    for (const delivery of failedDeliveries) {
      try {
        // Retry logic would go here
        delivery.status = 'pending';
        delivery.attempts++;
        this.emit('deliveryRetry', delivery);
      } catch (error) {
        delivery.status = 'failed';
        delivery.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }
  }

  // Cleanup
  destroy(): void {
    this.removeAllListeners();
    this.processingQueue = [];
    this.retryQueue = [];
  }
}

// Singleton instance
export const notificationEngine = new NotificationEngine();
