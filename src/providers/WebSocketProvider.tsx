import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  WebSocketMessage, 
  WebSocketMessageType, 
  WebSocketContextType, 
  ConnectionState, 
  WebSocketStats,
  WebSocketConfig 
} from '@/types/websocket';
import { getWebSocketManager, initializeWebSocket } from '@/lib/websocket';
import { createWebSocketLogger } from '@/utils/websocketHelpers';

interface WebSocketProviderProps {
  children: ReactNode;
  config?: WebSocketConfig;
  autoConnect?: boolean;
  enableLogging?: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

export function WebSocketProvider({ 
  children, 
  config,
  autoConnect = true,
  enableLogging = false 
}: WebSocketProviderProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    reconnectAttempts: 0
  });
  const [stats, setStats] = useState<WebSocketStats>({
    messagesReceived: 0,
    messagesSent: 0,
    connectionTime: 0,
    reconnections: 0,
    averageLatency: 0,
    uptime: 0
  });
  const [manager, setManager] = useState<ReturnType<typeof getWebSocketManager> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const logger = createWebSocketLogger(enableLogging);

  // Initialize WebSocket manager
  useEffect(() => {
    if (config && !isInitialized) {
      try {
        const wsManager = initializeWebSocket(config);
        setManager(wsManager);
        setIsInitialized(true);

        // Set up event listeners
        wsManager.onStateChange((state: ConnectionState) => {
          setConnectionState(state);
          logger.log('Connection state changed', state);
        });

        wsManager.onError((error: Error) => {
          logger.error('WebSocket error', error);
        });

        // Update stats periodically
        const statsInterval = setInterval(() => {
          setStats(wsManager.getStats());
        }, 1000);

        // Auto-connect if enabled
        if (autoConnect) {
          wsManager.connect().catch((error: Error) => {
            logger.error('Failed to connect', error);
          });
        }

        return () => {
          clearInterval(statsInterval);
          wsManager.disconnect();
        };
      } catch (error) {
        logger.error('Failed to initialize WebSocket', error);
      }
    }
  }, [config, autoConnect, isInitialized, logger]);

  // Context value
  const contextValue: WebSocketContextType = {
    connectionState,
    isConnected: connectionState.status === 'connected',
    subscribe: (subscription) => {
      if (!manager) {
        throw new Error('WebSocket manager not initialized');
      }
      return manager.subscribe(subscription);
    },
    unsubscribe: (subscriptionId: string) => {
      if (manager) {
        manager.unsubscribe(subscriptionId);
      }
    },
    sendMessage: (message: Omit<WebSocketMessage, 'id' | 'timestamp'>) => {
      if (!manager) {
        throw new Error('WebSocket manager not initialized');
      }
      manager.sendMessage(message);
    },
    stats,
    reconnect: () => {
      if (manager) {
        manager.reconnect();
      }
    },
    disconnect: () => {
      if (manager) {
        manager.disconnect();
      }
    }
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Higher-order component for WebSocket-enabled components
export function withWebSocket<P extends object>(
  Component: React.ComponentType<P & { websocket: WebSocketContextType }>
) {
  return function WebSocketComponent(props: P) {
    const websocket = useWebSocketContext();
    return <Component {...props} websocket={websocket} />;
  };
}

// Hook for subscribing to specific message types
export function useWebSocketSubscription<T = any>(
  messageType: WebSocketMessageType,
  callback: (message: WebSocketMessage) => void,
  filters?: Record<string, any>
) {
  const { subscribe, unsubscribe } = useWebSocketContext();
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    const id = subscribe({
      type: messageType,
      filters,
      callback
    });
    setSubscriptionId(id);

    return () => {
      if (id) {
        unsubscribe(id);
      }
    };
  }, [messageType, filters, callback, subscribe, unsubscribe]);

  return subscriptionId;
}

// Hook for real-time data with context
export function useRealTimeData<T = any>(
  messageType: WebSocketMessageType,
  filters?: Record<string, any>
) {
  const [data, setData] = useState<T | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useWebSocketSubscription<T>(messageType, (message: WebSocketMessage) => {
    setData(message.payload as T);
    setLastUpdate(Date.now());
  }, filters);

  return { data, lastUpdate };
}

// Provider configuration helper
export function createWebSocketConfig(url: string, overrides?: Partial<WebSocketConfig>): WebSocketConfig {
  return {
    url,
    protocols: [],
    reconnectAttempts: 5,
    reconnectDelay: 1000,
    heartbeatInterval: 30000,
    messageQueueSize: 100,
    enableCompression: true,
    ...overrides
  };
}

// Connection monitoring hook
export function useConnectionMonitor() {
  const { connectionState, stats } = useWebSocketContext();
  const [isHealthy, setIsHealthy] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'unknown'>('unknown');

  useEffect(() => {
    const healthy = connectionState.status === 'connected' && 
                   (!connectionState.latency || connectionState.latency < 5000) &&
                   connectionState.reconnectAttempts < 3;
    setIsHealthy(healthy);

    if (connectionState.latency) {
      const quality = connectionState.latency < 100 ? 'excellent' :
                     connectionState.latency < 300 ? 'good' :
                     connectionState.latency < 1000 ? 'fair' : 'poor';
      setConnectionQuality(quality);
    } else {
      setConnectionQuality('unknown');
    }
  }, [connectionState]);

  return {
    isHealthy,
    connectionQuality,
    connectionState,
    stats
  };
}

// Message broadcasting hook
export function useMessageBroadcaster() {
  const { sendMessage } = useWebSocketContext();

  const broadcast = useCallback((
    type: WebSocketMessageType,
    payload: any,
    channelId?: string
  ) => {
    sendMessage({
      type,
      payload,
      channelId
    });
  }, [sendMessage]);

  const broadcastToChannel = useCallback((
    channelId: string,
    type: WebSocketMessageType,
    payload: any
  ) => {
    sendMessage({
      type,
      payload,
      channelId
    });
  }, [sendMessage]);

  const broadcastToUser = useCallback((
    userId: string,
    type: WebSocketMessageType,
    payload: any
  ) => {
    sendMessage({
      type,
      payload,
      userId
    });
  }, [sendMessage]);

  return {
    broadcast,
    broadcastToChannel,
    broadcastToUser
  };
}

// Event aggregation hook
export function useEventAggregator() {
  const [events, setEvents] = useState<WebSocketMessage[]>([]);
  const { subscribe, unsubscribe } = useWebSocketContext();
  const subscriptions = useRef<Map<string, string>>(new Map());

  const addEventType = useCallback((
    eventType: WebSocketMessageType,
    filters?: Record<string, any>
  ) => {
    const subscriptionId = subscribe({
      type: eventType,
      filters,
      callback: (message: WebSocketMessage) => {
        setEvents(prev => [...prev.slice(-99), message]); // Keep last 100 events
      }
    });
    
    subscriptions.current.set(eventType, subscriptionId);
    return subscriptionId;
  }, [subscribe]);

  const removeEventType = useCallback((eventType: WebSocketMessageType) => {
    const subscriptionId = subscriptions.current.get(eventType);
    if (subscriptionId) {
      unsubscribe(subscriptionId);
      subscriptions.current.delete(eventType);
    }
  }, [unsubscribe]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const getEventsByType = useCallback((type: WebSocketMessageType) => {
    return events.filter(event => event.type === type);
  }, [events]);

  const getEventsByTimeRange = useCallback((startTime: number, endTime: number) => {
    return events.filter(event => 
      event.timestamp >= startTime && event.timestamp <= endTime
    );
  }, [events]);

  return {
    events,
    addEventType,
    removeEventType,
    clearEvents,
    getEventsByType,
    getEventsByTimeRange
  };
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const { stats, connectionState } = useWebSocketContext();
  const [metrics, setMetrics] = useState({
    messagesPerSecond: 0,
    averageMessageSize: 0,
    connectionStability: 0,
    reconnectionRate: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const uptime = stats.uptime;
      
      // Calculate messages per second
      const messagesPerSecond = uptime > 0 ? 
        (stats.messagesReceived + stats.messagesSent) / (uptime / 1000) : 0;

      // Calculate connection stability (percentage of time connected)
      const connectionStability = uptime > 0 ? 
        (stats.connectionTime / uptime) * 100 : 0;

      // Calculate reconnection rate
      const reconnectionRate = uptime > 0 ? 
        (stats.reconnections / (uptime / 1000)) : 0;

      setMetrics({
        messagesPerSecond,
        averageMessageSize: 0, // Would need to track message sizes
        connectionStability,
        reconnectionRate
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [stats, connectionState]);

  return {
    ...metrics,
    stats,
    connectionState
  };
}
