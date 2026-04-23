import { EventEmitter } from 'events'

export interface Alert {
  id: string
  type: 'breaking-news' | 'sentiment-shift' | 'price-alert' | 'impact-alert' | 'expert-commentary' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  timestamp: Date
  source?: string
  data?: any
  read: boolean
  acknowledged: boolean
  expiresAt?: Date
  category?: string
  tags?: string[]
  actions?: AlertAction[]
  metadata?: {
    articleId?: string
    sentimentScore?: number
    priceChange?: number
    impactLevel?: string
    expertId?: string
    commodity?: string
    sector?: string
  }
}

export interface AlertAction {
  id: string
  label: string
  type: 'primary' | 'secondary' | 'danger'
  action: () => void | Promise<void>
  icon?: string
}

export interface AlertPreferences {
  enabled: boolean
  types: Alert['type'][]
  severity: Alert['severity'][]
  categories: string[]
  commodities: string[]
  sectors: string[]
  quietHours: {
    enabled: boolean
    start: string // HH:mm format
    end: string // HH:mm format
    timezone: string
  }
  frequency: 'immediate' | 'batched' | 'scheduled'
  channels: {
    inApp: boolean
    email: boolean
    push: boolean
    sms: boolean
    webhook: boolean
  }
  filters: {
    minSentimentChange: number
    minPriceChange: number
    minImpactLevel: 'low' | 'medium' | 'high'
    excludeDuplicateSources: boolean
    maxAlertsPerHour: number
  }
}

export interface NotificationChannel {
  id: string
  name: string
  type: 'email' | 'push' | 'sms' | 'webhook' | 'slack' | 'discord'
  enabled: boolean
  config: {
    email?: string
    pushToken?: string
    phoneNumber?: string
    webhookUrl?: string
    slackChannel?: string
    discordChannel?: string
  }
  lastSent?: Date
  deliveryCount: number
  errorCount: number
}

export class AlertManager extends EventEmitter {
  private alerts: Map<string, Alert> = new Map()
  private preferences: AlertPreferences
  private channels: Map<string, NotificationChannel> = new Map()
  private deliveryQueue: Alert[] = []
  private isProcessing = false
  private batchTimer?: NodeJS.Timeout
  private quietHoursTimer?: NodeJS.Timeout

  constructor() {
    super()
    this.preferences = this.getDefaultPreferences()
    this.initializeChannels()
    this.startQuietHoursCheck()
  }

  private getDefaultPreferences(): AlertPreferences {
    return {
      enabled: true,
      types: ['breaking-news', 'sentiment-shift', 'price-alert', 'impact-alert'],
      severity: ['medium', 'high', 'critical'],
      categories: [],
      commodities: ['crude-oil', 'natural-gas', 'solar', 'wind'],
      sectors: ['oil-gas', 'renewables', 'nuclear'],
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC'
      },
      frequency: 'immediate',
      channels: {
        inApp: true,
        email: false,
        push: true,
        sms: false,
        webhook: false
      },
      filters: {
        minSentimentChange: 0.1,
        minPriceChange: 0.02,
        minImpactLevel: 'medium',
        excludeDuplicateSources: true,
        maxAlertsPerHour: 20
      }
    }
  }

  private initializeChannels(): void {
    // Initialize default notification channels
    const defaultChannels: NotificationChannel[] = [
      {
        id: 'in-app',
        name: 'In-App Notifications',
        type: 'push',
        enabled: true,
        config: {},
        deliveryCount: 0,
        errorCount: 0
      }
    ]

    defaultChannels.forEach(channel => {
      this.channels.set(channel.id, channel)
    })
  }

  // Alert creation and management
  createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'read' | 'acknowledged'>): string {
    const alert: Alert = {
      ...alertData,
      id: this.generateAlertId(),
      timestamp: new Date(),
      read: false,
      acknowledged: false,
      expiresAt: alertData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours default
    }

    // Validate alert against preferences
    if (!this.shouldCreateAlert(alert)) {
      return alert.id // Return ID but don't process
    }

    this.alerts.set(alert.id, alert)
    this.emit('alertCreated', alert)

    // Process delivery based on frequency
    if (this.preferences.frequency === 'immediate') {
      this.processAlert(alert)
    } else {
      this.addToBatch(alert)
    }

    return alert.id
  }

  private shouldCreateAlert(alert: Alert): boolean {
    if (!this.preferences.enabled) return false

    // Check type preferences
    if (!this.preferences.types.includes(alert.type)) return false

    // Check severity preferences
    if (!this.preferences.severity.includes(alert.severity)) return false

    // Check quiet hours
    if (this.isQuietHours() && alert.severity !== 'critical') return false

    // Check category filters
    if (alert.category && this.preferences.categories.length > 0) {
      if (!this.preferences.categories.includes(alert.category)) return false
    }

    // Check commodity filters
    if (alert.metadata?.commodity && this.preferences.commodities.length > 0) {
      if (!this.preferences.commodities.includes(alert.metadata.commodity)) return false
    }

    // Check sector filters
    if (alert.metadata?.sector && this.preferences.sectors.length > 0) {
      if (!this.preferences.sectors.includes(alert.metadata.sector)) return false
    }

    // Check duplicate sources
    if (this.preferences.filters.excludeDuplicateSources && alert.source) {
      const recentAlerts = Array.from(this.alerts.values())
        .filter(a => a.source === alert.source && 
                   a.timestamp > new Date(Date.now() - 30 * 60 * 1000)) // Last 30 minutes
      if (recentAlerts.length > 0) return false
    }

    // Check minimum thresholds
    if (alert.metadata?.sentimentChange) {
      if (Math.abs(alert.metadata.sentimentChange) < this.preferences.filters.minSentimentChange) {
        return false
      }
    }

    if (alert.metadata?.priceChange) {
      if (Math.abs(alert.metadata.priceChange) < this.preferences.filters.minPriceChange) {
        return false
      }
    }

    // Check rate limiting
    const alertsLastHour = Array.from(this.alerts.values())
      .filter(a => a.timestamp > new Date(Date.now() - 60 * 60 * 1000))
    if (alertsLastHour.length >= this.preferences.filters.maxAlertsPerHour) {
      return false
    }

    return true
  }

  private isQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) return false

    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:mm format
    const startTime = this.preferences.quietHours.start
    const endTime = this.preferences.quietHours.end

    if (startTime <= endTime) {
      // Same day range (e.g., 22:00 - 08:00 crosses midnight)
      return currentTime >= startTime || currentTime <= endTime
    } else {
      // Cross-midnight range
      return currentTime >= startTime && currentTime <= endTime
    }
  }

  private startQuietHoursCheck(): void {
    // Check every minute
    this.quietHoursTimer = setInterval(() => {
      this.emit('quietHoursChanged', this.isQuietHours())
    }, 60 * 1000)
  }

  private async processAlert(alert: Alert): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true

    try {
      // Send to enabled channels
      const enabledChannels = Array.from(this.channels.values())
        .filter(channel => channel.enabled && this.preferences.channels[channel.type as keyof typeof this.preferences.channels])

      for (const channel of enabledChannels) {
        try {
          await this.sendToChannel(alert, channel)
          channel.deliveryCount++
          channel.lastSent = new Date()
        } catch (error) {
          console.error(`Failed to send alert to channel ${channel.id}:`, error)
          channel.errorCount++
          this.emit('deliveryError', { alert, channel, error })
        }
      }

      this.emit('alertProcessed', alert)
    } finally {
      this.isProcessing = false
    }
  }

  private async sendToChannel(alert: Alert, channel: NotificationChannel): Promise<void> {
    switch (channel.type) {
      case 'email':
        return this.sendEmailAlert(alert, channel)
      case 'push':
        return this.sendPushAlert(alert, channel)
      case 'sms':
        return this.sendSMSAlert(alert, channel)
      case 'webhook':
        return this.sendWebhookAlert(alert, channel)
      case 'slack':
        return this.sendSlackAlert(alert, channel)
      case 'discord':
        return this.sendDiscordAlert(alert, channel)
      default:
        throw new Error(`Unsupported channel type: ${channel.type}`)
    }
  }

  private async sendEmailAlert(alert: Alert, channel: NotificationChannel): Promise<void> {
    // Mock email implementation
    console.log(`Sending email alert to ${channel.config.email}:`, alert.title)
    // In real implementation, integrate with email service like SendGrid, AWS SES, etc.
  }

  private async sendPushAlert(alert: Alert, channel: NotificationChannel): Promise<void> {
    // Mock push notification implementation
    console.log(`Sending push notification:`, alert.title)
    // In real implementation, integrate with FCM, APNs, or web push
    this.emit('pushNotification', alert)
  }

  private async sendSMSAlert(alert: Alert, channel: NotificationChannel): Promise<void> {
    // Mock SMS implementation
    console.log(`Sending SMS to ${channel.config.phoneNumber}:`, alert.title)
    // In real implementation, integrate with Twilio, AWS SNS, etc.
  }

  private async sendWebhookAlert(alert: Alert, channel: NotificationChannel): Promise<void> {
    // Mock webhook implementation
    console.log(`Sending webhook to ${channel.config.webhookUrl}:`, alert)
    // In real implementation, make HTTP POST request
  }

  private async sendSlackAlert(alert: Alert, channel: NotificationChannel): Promise<void> {
    // Mock Slack implementation
    console.log(`Sending Slack alert to ${channel.config.slackChannel}:`, alert.title)
    // In real implementation, use Slack API
  }

  private async sendDiscordAlert(alert: Alert, channel: NotificationChannel): Promise<void> {
    // Mock Discord implementation
    console.log(`Sending Discord alert to ${channel.config.discordChannel}:`, alert.title)
    // In real implementation, use Discord API
  }

  private addToBatch(alert: Alert): void {
    this.deliveryQueue.push(alert)

    if (this.preferences.frequency === 'batched') {
      // Process batch every 5 minutes
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.processBatch()
        }, 5 * 60 * 1000)
      }
    }
  }

  private async processBatch(): Promise<void> {
    if (this.deliveryQueue.length === 0) return

    const batchAlerts = [...this.deliveryQueue]
    this.deliveryQueue = []
    this.batchTimer = undefined

    // Group alerts by type and severity for efficient delivery
    const groupedAlerts = this.groupAlerts(batchAlerts)

    for (const [groupKey, alerts] of groupedAlerts.entries()) {
      await this.processAlertGroup(alerts)
    }

    this.emit('batchProcessed', batchAlerts)
  }

  private groupAlerts(alerts: Alert[]): Map<string, Alert[]> {
    const grouped = new Map<string, Alert[]>()

    alerts.forEach(alert => {
      const key = `${alert.type}-${alert.severity}`
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(alert)
    })

    return grouped
  }

  private async processAlertGroup(alerts: Alert[]): Promise<void> {
    // Create a summary alert for the group
    const summaryAlert: Alert = {
      id: this.generateAlertId(),
      type: 'system',
      severity: 'medium',
      title: `Energy Market Alert Summary`,
      message: `${alerts.length} new alerts: ${alerts.map(a => a.title).join(', ')}`,
      timestamp: new Date(),
      read: false,
      acknowledged: false,
      category: 'summary',
      data: { alerts }
    }

    await this.processAlert(summaryAlert)
  }

  // Alert retrieval and management
  getAlerts(options: {
    unread?: boolean
    type?: Alert['type']
    severity?: Alert['severity']
    category?: string
    limit?: number
    offset?: number
  } = {}): Alert[] {
    let alerts = Array.from(this.alerts.values())

    // Apply filters
    if (options.unread !== undefined) {
      alerts = alerts.filter(alert => alert.read !== options.unread)
    }

    if (options.type) {
      alerts = alerts.filter(alert => alert.type === options.type)
    }

    if (options.severity) {
      alerts = alerts.filter(alert => alert.severity === options.severity)
    }

    if (options.category) {
      alerts = alerts.filter(alert => alert.category === options.category)
    }

    // Sort by timestamp (newest first)
    alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Apply pagination
    if (options.offset) {
      alerts = alerts.slice(options.offset)
    }

    if (options.limit) {
      alerts = alerts.slice(0, options.limit)
    }

    return alerts
  }

  getAlert(id: string): Alert | undefined {
    return this.alerts.get(id)
  }

  markAsRead(id: string): void {
    const alert = this.alerts.get(id)
    if (alert && !alert.read) {
      alert.read = true
      this.emit('alertUpdated', alert)
    }
  }

  markAsAcknowledged(id: string): void {
    const alert = this.alerts.get(id)
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true
      this.emit('alertAcknowledged', alert)
    }
  }

  markAllAsRead(): void {
    this.alerts.forEach(alert => {
      if (!alert.read) {
        alert.read = true
      }
    })
    this.emit('allAlertsRead')
  }

  deleteAlert(id: string): void {
    const alert = this.alerts.get(id)
    if (alert) {
      this.alerts.delete(id)
      this.emit('alertDeleted', alert)
    }
  }

  clearExpiredAlerts(): void {
    const now = new Date()
    const expiredAlerts: Alert[] = []

    this.alerts.forEach((alert, id) => {
      if (alert.expiresAt && alert.expiresAt < now) {
        expiredAlerts.push(alert)
        this.alerts.delete(id)
      }
    })

    if (expiredAlerts.length > 0) {
      this.emit('alertsExpired', expiredAlerts)
    }
  }

  // Preferences management
  updatePreferences(updates: Partial<AlertPreferences>): void {
    this.preferences = { ...this.preferences, ...updates }
    this.emit('preferencesUpdated', this.preferences)
  }

  getPreferences(): AlertPreferences {
    return { ...this.preferences }
  }

  // Channel management
  addChannel(channel: NotificationChannel): void {
    this.channels.set(channel.id, channel)
    this.emit('channelAdded', channel)
  }

  updateChannel(id: string, updates: Partial<NotificationChannel>): void {
    const channel = this.channels.get(id)
    if (channel) {
      const updatedChannel = { ...channel, ...updates }
      this.channels.set(id, updatedChannel)
      this.emit('channelUpdated', updatedChannel)
    }
  }

  removeChannel(id: string): void {
    const channel = this.channels.get(id)
    if (channel) {
      this.channels.delete(id)
      this.emit('channelRemoved', channel)
    }
  }

  getChannels(): NotificationChannel[] {
    return Array.from(this.channels.values())
  }

  getChannel(id: string): NotificationChannel | undefined {
    return this.channels.get(id)
  }

  // Statistics and monitoring
  getStatistics(): {
    totalAlerts: number
    unreadAlerts: number
    alertsByType: Record<Alert['type'], number>
    alertsBySeverity: Record<Alert['severity'], number>
    deliveryStats: Record<string, { delivered: number; errors: number }>
    alertsLast24h: number
    alertsLast7d: number
  } {
    const alerts = Array.from(this.alerts.values())
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const alertsByType: Record<Alert['type'], number> = {} as any
    const alertsBySeverity: Record<Alert['severity'], number> = {} as any

    alerts.forEach(alert => {
      alertsByType[alert.type] = (alertsByType[alert.type] || 0) + 1
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1
    })

    const deliveryStats: Record<string, { delivered: number; errors: number }> = {}
    this.channels.forEach(channel => {
      deliveryStats[channel.id] = {
        delivered: channel.deliveryCount,
        errors: channel.errorCount
      }
    })

    return {
      totalAlerts: alerts.length,
      unreadAlerts: alerts.filter(a => !a.read).length,
      alertsByType,
      alertsBySeverity,
      deliveryStats,
      alertsLast24h: alerts.filter(a => a.timestamp >= last24h).length,
      alertsLast7d: alerts.filter(a => a.timestamp >= last7d).length
    }
  }

  // Utility methods
  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Cleanup
  destroy(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
    }
    if (this.quietHoursTimer) {
      clearInterval(this.quietHoursTimer)
    }
    this.removeAllListeners()
  }
}

// Singleton instance
export const alertManager = new AlertManager()
