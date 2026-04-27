import { WebSocketMessage, WebSocketMessageType, ConnectionState } from '@/types/websocket';

// Message validation helpers
export function isValidWebSocketMessage(data: any): data is WebSocketMessage {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    Object.values(WebSocketMessageType).includes(data.type) &&
    typeof data.payload !== 'undefined' &&
    typeof data.timestamp === 'number'
  );
}

export function sanitizeMessage(message: Partial<WebSocketMessage>): WebSocketMessage {
  return {
    id: message.id || generateMessageId(),
    type: message.type || WebSocketMessageType.NOTIFICATION,
    payload: message.payload || {},
    timestamp: message.timestamp || Date.now(),
    userId: message.userId,
    channelId: message.channelId
  };
}

// Connection status helpers
export function getConnectionStatusText(status: ConnectionState['status']): string {
  switch (status) {
    case 'connecting':
      return 'Connecting...';
    case 'connected':
      return 'Connected';
    case 'disconnected':
      return 'Disconnected';
    case 'reconnecting':
      return 'Reconnecting...';
    case 'error':
      return 'Connection Error';
    default:
      return 'Unknown Status';
  }
}

export function getConnectionStatusColor(status: ConnectionState['status']): string {
  switch (status) {
    case 'connecting':
      return '#f59e0b'; // amber-500
    case 'connected':
      return '#10b981'; // emerald-500
    case 'disconnected':
      return '#6b7280'; // gray-500
    case 'reconnecting':
      return '#f59e0b'; // amber-500
    case 'error':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
}

export function isConnectionHealthy(state: ConnectionState): boolean {
  return (
    state.status === 'connected' &&
    (!state.latency || state.latency < 5000) &&
    state.reconnectAttempts < 3
  );
}

// Message filtering and routing helpers
export function createMessageFilter(filters: Record<string, any>) {
  return (message: WebSocketMessage): boolean => {
    return Object.entries(filters).every(([key, value]) => {
      const messageValue = message.payload?.[key];
      
      if (Array.isArray(value)) {
        return value.includes(messageValue);
      }
      
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(messageValue) === JSON.stringify(value);
      }
      
      return messageValue === value;
    });
  };
}

export function createMessageRouter() {
  const routes = new Map<WebSocketMessageType, Set<(message: WebSocketMessage) => void>>();
  
  return {
    subscribe: (type: WebSocketMessageType, callback: (message: WebSocketMessage) => void) => {
      if (!routes.has(type)) {
        routes.set(type, new Set());
      }
      routes.get(type)!.add(callback);
      
      return () => {
        routes.get(type)?.delete(callback);
        if (routes.get(type)?.size === 0) {
          routes.delete(type);
        }
      };
    },
    
    route: (message: WebSocketMessage) => {
      const callbacks = routes.get(message.type);
      if (callbacks) {
        callbacks.forEach(callback => callback(message));
      }
    },
    
    hasSubscribers: (type: WebSocketMessageType) => {
      return routes.has(type) && routes.get(type)!.size > 0;
    }
  };
}

// Performance optimization helpers
export function createMessageBatcher(batchSize: number = 10, flushInterval: number = 100) {
  let batch: WebSocketMessage[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  let flushCallback: ((messages: WebSocketMessage[]) => void) | null = null;
  
  const flush = () => {
    if (batch.length > 0 && flushCallback) {
      const messagesToSend = [...batch];
      batch = [];
      flushCallback(messagesToSend);
    }
    
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
  };
  
  return {
    add: (message: WebSocketMessage, callback: (messages: WebSocketMessage[]) => void) => {
      flushCallback = callback;
      batch.push(message);
      
      if (batch.length >= batchSize) {
        flush();
      } else if (!flushTimer) {
        flushTimer = setTimeout(flush, flushInterval);
      }
    },
    
    flush: () => flush(),
    
    clear: () => {
      batch = [];
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
    }
  };
}

export function createMessageDeduplicator(windowSize: number = 5000) {
  const seenMessages = new Map<string, number>();
  
  return {
    isDuplicate: (message: WebSocketMessage): boolean => {
      const key = `${message.type}_${JSON.stringify(message.payload)}`;
      const now = Date.now();
      const lastSeen = seenMessages.get(key);
      
      if (lastSeen && (now - lastSeen) < windowSize) {
        return true;
      }
      
      seenMessages.set(key, now);
      
      // Clean up old entries
      if (seenMessages.size > 1000) {
        const cutoff = now - windowSize;
        for (const [msgKey, timestamp] of seenMessages.entries()) {
          if (timestamp < cutoff) {
            seenMessages.delete(msgKey);
          }
        }
      }
      
      return false;
    },
    
    clear: () => seenMessages.clear()
  };
}

// Message serialization helpers
export function serializeMessage(message: WebSocketMessage): string {
  return JSON.stringify(message);
}

export function deserializeMessage(data: string): WebSocketMessage | null {
  try {
    const parsed = JSON.parse(data);
    return isValidWebSocketMessage(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// Compression helpers (basic implementation)
export function compressMessage(message: WebSocketMessage): string {
  const serialized = serializeMessage(message);
  
  // Simple compression: replace common patterns
  return serialized
    .replace(/"type":"([^"]+)"/g, '"t":"$1"')
    .replace(/"payload":/g, '"p":')
    .replace(/"timestamp":/g, '"ts":')
    .replace(/"userId":/g, '"uid":')
    .replace(/"channelId":/g, '"cid":');
}

export function decompressMessage(compressed: string): WebSocketMessage | null {
  try {
    // Reverse the compression
    const decompressed = compressed
      .replace(/"t":"/g, '"type":"')
      .replace(/"p":/g, '"payload":')
      .replace(/"ts":/g, '"timestamp":')
      .replace(/"uid":/g, '"userId":')
      .replace(/"cid":/g, '"channelId":');
    
    return deserializeMessage(decompressed);
  } catch {
    return null;
  }
}

// Utility functions
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateSubscriptionId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createWebSocketUrl(base: string, params?: Record<string, string>): string {
  const url = new URL(base);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}

// Error handling helpers
export function createWebSocketErrorHandler(
  onError?: (error: Error, context?: string) => void
) {
  return (error: Error | Event, context?: string) => {
    const errorObj = error instanceof Error ? error : new Error('WebSocket error occurred');
    const contextMessage = context ? `[${context}] ${errorObj.message}` : errorObj.message;
    
    console.error('WebSocket Error:', contextMessage, error);
    
    if (onError) {
      onError(errorObj, context);
    }
  };
}

// Mobile optimization helpers
export function isMobileDevice(): boolean {
  return typeof window !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function getBatteryLevel(): Promise<number> {
  if (typeof window !== 'undefined' && 'getBattery' in navigator) {
    return (navigator as any).getBattery().then((battery: any) => battery.level);
  }
  return Promise.resolve(1); // Assume full battery if API not available
}

export function getConnectionType(): string {
  if (typeof window !== 'undefined' && 'connection' in navigator) {
    return (navigator as any).connection?.effectiveType || 'unknown';
  }
  return 'unknown';
}

export function shouldOptimizeForBattery(): boolean {
  return isMobileDevice() && getConnectionType() === 'slow-2g';
}

export function shouldReduceActivity(): boolean {
  return typeof document !== 'undefined' && document.hidden;
}

// Message priority helpers
export enum MessagePriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

export function getMessagePriority(type: WebSocketMessageType): MessagePriority {
  switch (type) {
    case WebSocketMessageType.ERROR:
    case WebSocketMessageType.PING:
    case WebSocketMessageType.PONG:
      return MessagePriority.CRITICAL;
    case WebSocketMessageType.TRADE_UPDATE:
    case WebSocketMessageType.GOVERNANCE_UPDATE:
    case WebSocketMessageType.NOTIFICATION:
      return MessagePriority.HIGH;
    case WebSocketMessageType.PRICE_UPDATE:
    case WebSocketMessageType.MARKET_DATA:
      return MessagePriority.NORMAL;
    default:
      return MessagePriority.LOW;
  }
}

export function createPriorityQueue() {
  const queues = new Map<MessagePriority, WebSocketMessage[]>();
  
  Object.values(MessagePriority).forEach(priority => {
    if (typeof priority === 'number') {
      queues.set(priority, []);
    }
  });
  
  return {
    enqueue: (message: WebSocketMessage) => {
      const priority = getMessagePriority(message.type);
      queues.get(priority)!.push(message);
    },
    
    dequeue: (): WebSocketMessage | null => {
      // Check from highest to lowest priority
      for (let priority = MessagePriority.CRITICAL; priority >= MessagePriority.LOW; priority--) {
        const queue = queues.get(priority);
        if (queue && queue.length > 0) {
          return queue.shift() || null;
        }
      }
      return null;
    },
    
    size: () => {
      return Array.from(queues.values()).reduce((total, queue) => total + queue.length, 0);
    },
    
    clear: () => {
      queues.forEach(queue => queue.length = 0);
    }
  };
}

// Debug helpers
export function createWebSocketLogger(enabled: boolean = typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  return {
    log: (message: string, data?: any) => {
      if (enabled) {
        console.log(`[WebSocket] ${message}`, data);
      }
    },
    
    error: (message: string, error?: any) => {
      if (enabled) {
        console.error(`[WebSocket] ${message}`, error);
      }
    },
    
    warn: (message: string, data?: any) => {
      if (enabled) {
        console.warn(`[WebSocket] ${message}`, data);
      }
    }
  };
}
