export interface WebSocketMessage {
  id: string;
  type: WebSocketMessageType;
  payload: any;
  timestamp: number;
  userId?: string;
  channelId?: string;
}

export enum WebSocketMessageType {
  // Connection management
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  PING = 'ping',
  PONG = 'pong',
  
  // Real-time data updates
  TRADE_UPDATE = 'trade_update',
  GOVERNANCE_UPDATE = 'governance_update',
  NOTIFICATION = 'notification',
  PRICE_UPDATE = 'price_update',
  MARKET_DATA = 'market_data',
  
  // Collaborative features
  USER_STATUS = 'user_status',
  COLLABORATION_UPDATE = 'collaboration_update',
  CHAT_MESSAGE = 'chat_message',
  
  // System events
  ERROR = 'error',
  ACKNOWLEDGMENT = 'ack',
  SUBSCRIPTION_CONFIRMED = 'subscription_confirmed',
  UNSUBSCRIPTION_CONFIRMED = 'unsubscription_confirmed'
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  messageQueueSize?: number;
  enableCompression?: boolean;
}

export interface WebSocketSubscription {
  id: string;
  type: WebSocketMessageType;
  filters?: Record<string, any>;
  callback: (message: WebSocketMessage) => void;
  active: boolean;
}

export interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';
  lastConnected?: number;
  lastDisconnected?: number;
  reconnectAttempts: number;
  error?: string;
  latency?: number;
}

export interface QueuedMessage {
  message: WebSocketMessage;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

export interface WebSocketStats {
  messagesReceived: number;
  messagesSent: number;
  connectionTime: number;
  reconnections: number;
  averageLatency: number;
  uptime: number;
}

export interface RealTimeSyncConfig {
  enabled: boolean;
  syncInterval?: number;
  conflictResolution?: 'local' | 'remote' | 'merge';
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
}

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
}

export interface WebSocketContextType {
  connectionState: ConnectionState;
  isConnected: boolean;
  subscribe: (subscription: Omit<WebSocketSubscription, 'id' | 'active'>) => string;
  unsubscribe: (subscriptionId: string) => void;
  sendMessage: (message: Omit<WebSocketMessage, 'id' | 'timestamp'>) => void;
  stats: WebSocketStats;
  reconnect: () => void;
  disconnect: () => void;
}

export interface MobileOptimizationConfig {
  enableBackgroundSync: boolean;
  adaptiveHeartbeat: boolean;
  compressionThreshold: number;
  batteryOptimization: boolean;
  networkAwareReconnect: boolean;
}
