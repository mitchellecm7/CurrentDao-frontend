import { 
  WebSocketMessage, 
  WebSocketMessageType, 
  WebSocketConfig, 
  WebSocketSubscription, 
  ConnectionState, 
  QueuedMessage, 
  WebSocketStats,
  MobileOptimizationConfig
} from '@/types/websocket';

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private subscriptions: Map<string, WebSocketSubscription> = new Map();
  private messageQueue: QueuedMessage[] = [];
  private connectionState: ConnectionState;
  private stats: WebSocketStats;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private latencyTimer: ReturnType<typeof setTimeout> | null = null;
  private lastPingTime: number = 0;
  private messageIdCounter: number = 0;
  private mobileConfig: MobileOptimizationConfig;
  
  // Event listeners
  private onStateChangeCallbacks: ((state: ConnectionState) => void)[] = [];
  private onMessageCallbacks: ((message: WebSocketMessage) => void)[] = [];
  private onErrorCallbacks: ((error: Error) => void)[] = [];

  constructor(config: WebSocketConfig, mobileConfig?: Partial<MobileOptimizationConfig>) {
    this.config = {
      protocols: [],
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      messageQueueSize: 100,
      enableCompression: true,
      ...config
    };

    this.mobileConfig = {
      enableBackgroundSync: true,
      adaptiveHeartbeat: true,
      compressionThreshold: 1024,
      batteryOptimization: true,
      networkAwareReconnect: true,
      ...mobileConfig
    };

    this.connectionState = {
      status: 'disconnected',
      reconnectAttempts: 0
    };

    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      connectionTime: 0,
      reconnections: 0,
      averageLatency: 0,
      uptime: 0
    };

    this.setupMobileOptimizations();
  }

  // Connection management
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.updateConnectionState('connecting');
      
      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);
        
        this.ws.onopen = () => {
          this.handleConnectionOpen();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          this.handleConnectionClose(event);
        };

        this.ws.onerror = (error) => {
          this.handleError(error);
          reject(error);
        };

      } catch (error) {
        this.handleError(error as Error);
        reject(error);
      }
    });
  }

  public disconnect(): void {
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.updateConnectionState('disconnected');
    this.messageQueue = [];
  }

  public reconnect(): void {
    this.disconnect();
    
    if (this.connectionState.reconnectAttempts < this.config.reconnectAttempts) {
      const delay = this.calculateReconnectDelay();
      this.updateConnectionState('reconnecting');
      
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(() => {
          // Connection failed, will trigger retry logic
        });
      }, delay);
    } else {
      this.updateConnectionState('error', 'Maximum reconnection attempts reached');
    }
  }

  // Message handling
  public sendMessage(message: Omit<WebSocketMessage, 'id' | 'timestamp'>): void {
    const fullMessage: WebSocketMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: Date.now()
    };

    if (this.isConnected()) {
      this.sendWebSocketMessage(fullMessage);
    } else {
      this.queueMessage(fullMessage);
    }
  }

  private sendWebSocketMessage(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const payload = JSON.stringify(message);
      
      // Apply compression if enabled and message is large enough
      if (this.config.enableCompression && payload.length > this.mobileConfig.compressionThreshold) {
        // In a real implementation, you might apply compression here
        // For now, we'll send as-is
      }

      this.ws.send(payload);
      this.stats.messagesSent++;
      
    } catch (error) {
      this.handleError(error as Error);
      this.queueMessage(message);
    }
  }

  // Subscription management
  public subscribe(subscription: Omit<WebSocketSubscription, 'id' | 'active'>): string {
    const id = this.generateSubscriptionId();
    const fullSubscription: WebSocketSubscription = {
      ...subscription,
      id,
      active: true
    };

    this.subscriptions.set(id, fullSubscription);

    // Send subscription message to server
    this.sendMessage({
      type: WebSocketMessageType.SUBSCRIPTION_CONFIRMED,
      payload: {
        subscriptionType: subscription.type,
        filters: subscription.filters,
        subscriptionId: id
      }
    });

    return id;
  }

  public unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.active = false;
      this.subscriptions.delete(subscriptionId);

      // Send unsubscription message to server
      this.sendMessage({
        type: WebSocketMessageType.UNSUBSCRIPTION_CONFIRMED,
        payload: {
          subscriptionId
        }
      });
    }
  }

  // Event listeners
  public onStateChange(callback: (state: ConnectionState) => void): void {
    this.onStateChangeCallbacks.push(callback);
  }

  public onMessage(callback: (message: WebSocketMessage) => void): void {
    this.onMessageCallbacks.push(callback);
  }

  public onError(callback: (error: Error) => void): void {
    this.onErrorCallbacks.push(callback);
  }

  // Getters
  public getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  public getStats(): WebSocketStats {
    return { ...this.stats };
  }

  public isConnected(): boolean {
    return this.connectionState.status === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  // Private methods
  private handleConnectionOpen(): void {
    this.updateConnectionState('connected');
    this.connectionState.lastConnected = Date.now();
    this.connectionState.reconnectAttempts = 0;
    this.stats.connectionTime = Date.now();
    this.stats.reconnections++;

    // Start heartbeat
    this.startHeartbeat();
    
    // Send queued messages
    this.flushMessageQueue();
    
    // Resubscribe to active subscriptions
    this.resubscribeAll();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.stats.messagesReceived++;

      // Handle ping/pong
      if (message.type === WebSocketMessageType.PING) {
        this.sendMessage({
          type: WebSocketMessageType.PONG,
          payload: { timestamp: Date.now() }
        });
        return;
      }

      if (message.type === WebSocketMessageType.PONG) {
        this.calculateLatency(message.payload?.timestamp);
        return;
      }

      // Route message to subscriptions
      this.routeMessage(message);
      
      // Notify general listeners
      this.onMessageCallbacks.forEach(callback => callback(message));

    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private handleConnectionClose(event: CloseEvent): void {
    this.clearTimers();
    this.updateConnectionState('disconnected');
    this.connectionState.lastDisconnected = Date.now();

    if (!event.wasClean) {
      this.reconnect();
    }
  }

  private handleError(error: Error | Event): void {
    const errorObj = error instanceof Error ? error : new Error('WebSocket error occurred');
    this.updateConnectionState('error', errorObj.message);
    
    this.onErrorCallbacks.forEach(callback => callback(errorObj));
  }

  private updateConnectionState(status: ConnectionState['status'], error?: string): void {
    this.connectionState.status = status;
    if (error) {
      this.connectionState.error = error;
    }
    
    if (status === 'reconnecting') {
      this.connectionState.reconnectAttempts++;
    }

    this.onStateChangeCallbacks.forEach(callback => callback(this.connectionState));
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    const interval = this.mobileConfig.adaptiveHeartbeat 
      ? this.calculateAdaptiveHeartbeatInterval()
      : this.config.heartbeatInterval;

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.lastPingTime = Date.now();
        this.sendMessage({
          type: WebSocketMessageType.PING,
          payload: { timestamp: this.lastPingTime }
        });
      }
    }, interval);
  }

  private clearTimers(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.latencyTimer) {
      clearTimeout(this.latencyTimer);
      this.latencyTimer = null;
    }
  }

  private queueMessage(message: WebSocketMessage): void {
    if (this.messageQueue.length >= this.config.messageQueueSize) {
      // Remove oldest message
      this.messageQueue.shift();
    }

    this.messageQueue.push({
      message,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3
    });
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const queued = this.messageQueue.shift();
      if (queued) {
        this.sendWebSocketMessage(queued.message);
      }
    }
  }

  private routeMessage(message: WebSocketMessage): void {
    this.subscriptions.forEach(subscription => {
      if (subscription.active && subscription.type === message.type) {
        // Apply filters if present
        if (subscription.filters && !this.matchesFilters(message, subscription.filters)) {
          return;
        }
        
        subscription.callback(message);
      }
    });
  }

  private matchesFilters(message: WebSocketMessage, filters: Record<string, any>): boolean {
    return Object.entries(filters).every(([key, value]) => {
      return message.payload?.[key] === value;
    });
  }

  private resubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      if (subscription.active) {
        this.sendMessage({
          type: WebSocketMessageType.SUBSCRIPTION_CONFIRMED,
          payload: {
            subscriptionType: subscription.type,
            filters: subscription.filters,
            subscriptionId: subscription.id
          }
        });
      }
    });
  }

  private calculateReconnectDelay(): number {
    // Exponential backoff with jitter
    const baseDelay = this.config.reconnectDelay;
    const exponentialDelay = baseDelay * Math.pow(2, this.connectionState.reconnectAttempts - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
  }

  private calculateLatency(pingTimestamp: number): void {
    if (pingTimestamp) {
      const latency = Date.now() - pingTimestamp;
      this.connectionState.latency = latency;
      
      // Update average latency
      this.stats.averageLatency = (this.stats.averageLatency + latency) / 2;
    }
  }

  private calculateAdaptiveHeartbeatInterval(): number {
    // Adjust heartbeat based on connection quality and battery level
    let interval = this.config.heartbeatInterval;
    
    if (this.mobileConfig.batteryOptimization) {
      // Reduce frequency if battery is low (in real implementation, check battery API)
      interval *= 1.5;
    }
    
    if (this.connectionState.latency && this.connectionState.latency > 1000) {
      // Increase interval for high latency connections
      interval *= 1.2;
    }
    
    return interval;
  }

  private setupMobileOptimizations(): void {
    if (typeof window !== 'undefined' && 'online' in navigator) {
      // Monitor network status
      window.addEventListener('online', () => {
        if (this.mobileConfig.networkAwareReconnect && this.connectionState.status === 'disconnected') {
          this.reconnect();
        }
      });

      window.addEventListener('offline', () => {
        if (this.mobileConfig.networkAwareReconnect) {
          this.disconnect();
        }
      });
    }

    // Handle page visibility for battery optimization
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (this.mobileConfig.batteryOptimization) {
          if (document.hidden) {
            // Reduce activity when page is hidden
            this.clearTimers();
          } else if (this.isConnected()) {
            // Resume normal activity
            this.startHeartbeat();
          }
        }
      });
    }
  }

  private generateMessageId(): string {
    return `msg_${++this.messageIdCounter}_${Date.now()}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance for app-wide WebSocket management
let webSocketManager: WebSocketManager | null = null;

export function getWebSocketManager(config?: WebSocketConfig): WebSocketManager {
  if (!webSocketManager && config) {
    webSocketManager = new WebSocketManager(config);
  }
  return webSocketManager!;
}

export function initializeWebSocket(config: WebSocketConfig): WebSocketManager {
  webSocketManager = new WebSocketManager(config);
  return webSocketManager;
}
