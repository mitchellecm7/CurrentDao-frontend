import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  WebSocketMessage, 
  WebSocketMessageType, 
  WebSocketSubscription, 
  ConnectionState,
  WebSocketStats,
  WebSocketContextType 
} from '@/types/websocket';
import { getWebSocketManager, initializeWebSocket } from '@/lib/websocket';
import { createWebSocketLogger } from '@/utils/websocketHelpers';

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectOnMount?: boolean;
  enableLogging?: boolean;
}

interface UseWebSocketReturn extends Omit<WebSocketContextType, 'connectionState' | 'stats'> {
  connectionState: ConnectionState;
  stats: WebSocketStats;
  lastMessage: WebSocketMessage | null;
  error: string | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url,
    autoConnect = true,
    reconnectOnMount = false,
    enableLogging = false
  } = options;

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
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const managerRef = useRef<ReturnType<typeof getWebSocketManager> | null>(null);
  const subscriptionsRef = useRef<Map<string, WebSocketSubscription>>(new Map());
  const loggerRef = useRef(createWebSocketLogger(enableLogging));

  // Initialize WebSocket manager
  useEffect(() => {
    if (url) {
      try {
        const config = {
          url,
          reconnectAttempts: 5,
          reconnectDelay: 1000,
          heartbeatInterval: 30000,
          messageQueueSize: 100,
          enableCompression: true
        };

        managerRef.current = initializeWebSocket(config);
        
        // Set up event listeners
        managerRef.current.onStateChange((state) => {
          setConnectionState(state);
          loggerRef.current.log('Connection state changed', state);
        });

        managerRef.current.onMessage((message) => {
          setLastMessage(message);
          loggerRef.current.log('Message received', message);
        });

        managerRef.current.onError((err) => {
          setError(err.message);
          loggerRef.current.error('WebSocket error', err);
        });

        // Update stats periodically
        const statsInterval = setInterval(() => {
          if (managerRef.current) {
            setStats(managerRef.current.getStats());
          }
        }, 1000);

        // Auto-connect if enabled
        if (autoConnect) {
          managerRef.current.connect().catch((err) => {
            setError(err.message);
            loggerRef.current.error('Failed to connect', err);
          });
        }

        return () => {
          clearInterval(statsInterval);
          if (managerRef.current) {
            managerRef.current.disconnect();
          }
        };
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        loggerRef.current.error('Failed to initialize WebSocket', error);
      }
    }
  }, [url, autoConnect]);

  // Reconnect on mount if requested
  useEffect(() => {
    if (reconnectOnMount && managerRef.current && !managerRef.current.isConnected()) {
      managerRef.current.reconnect();
    }
  }, [reconnectOnMount]);

  const subscribe = useCallback((
    subscription: Omit<WebSocketSubscription, 'id' | 'active'>
  ): string => {
    if (!managerRef.current) {
      throw new Error('WebSocket manager not initialized');
    }

    const subscriptionId = managerRef.current.subscribe(subscription);
    subscriptionsRef.current.set(subscriptionId, {
      ...subscription,
      id: subscriptionId,
      active: true
    });

    loggerRef.current.log('Subscribed to event', { type: subscription.type, id: subscriptionId });
    return subscriptionId;
  }, []);

  const unsubscribe = useCallback((subscriptionId: string) => {
    if (managerRef.current) {
      managerRef.current.unsubscribe(subscriptionId);
      subscriptionsRef.current.delete(subscriptionId);
      loggerRef.current.log('Unsubscribed from event', { id: subscriptionId });
    }
  }, []);

  const sendMessage = useCallback((
    message: Omit<WebSocketMessage, 'id' | 'timestamp'>
  ) => {
    if (!managerRef.current) {
      throw new Error('WebSocket manager not initialized');
    }

    managerRef.current.sendMessage(message);
    loggerRef.current.log('Message sent', message);
  }, []);

  const reconnect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.reconnect();
      loggerRef.current.log('Manual reconnection triggered');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.disconnect();
      loggerRef.current.log('Manual disconnect triggered');
    }
  }, []);

  const isConnected = connectionState.status === 'connected';

  return {
    connectionState,
    isConnected,
    subscribe,
    unsubscribe,
    sendMessage,
    stats,
    reconnect,
    disconnect,
    lastMessage,
    error
  };
}

// Specialized hooks for common use cases
export function useRealTimeUpdates<T>(
  messageType: WebSocketMessageType,
  filters?: Record<string, any>,
  options?: UseWebSocketOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  
  const { subscribe, unsubscribe, ...websocketState } = useWebSocket(options);

  useEffect(() => {
    const subscriptionId = subscribe({
      type: messageType,
      filters,
      callback: (message: WebSocketMessage) => {
        setData(message.payload as T);
        setLastUpdate(Date.now());
      }
    });

    return () => {
      unsubscribe(subscriptionId);
    };
  }, [messageType, filters, subscribe, unsubscribe]);

  return {
    data,
    lastUpdate,
    subscribe,
    unsubscribe,
    ...websocketState
  };
}

export function useTradeUpdates(options?: UseWebSocketOptions) {
  return useRealTimeUpdates<any>(
    WebSocketMessageType.TRADE_UPDATE,
    undefined,
    options
  );
}

export function useGovernanceUpdates(options?: UseWebSocketOptions) {
  return useRealTimeUpdates<any>(
    WebSocketMessageType.GOVERNANCE_UPDATE,
    undefined,
    options
  );
}

export function useNotifications(options?: UseWebSocketOptions) {
  return useRealTimeUpdates<any>(
    WebSocketMessageType.NOTIFICATION,
    undefined,
    options
  );
}

export function useMarketData(symbol?: string, options?: UseWebSocketOptions) {
  const filters = symbol ? { symbol } : undefined;
  return useRealTimeUpdates<any>(
    WebSocketMessageType.MARKET_DATA,
    filters,
    options
  );
}

// Hook for connection status monitoring
export function useConnectionStatus(options?: UseWebSocketOptions) {
  const { connectionState, stats, ...websocketState } = useWebSocket(options);
  
  const isHealthy = connectionState.status === 'connected' && 
                   (!connectionState.latency || connectionState.latency < 5000) &&
                   connectionState.reconnectAttempts < 3;

  const connectionQuality = connectionState.latency ? 
    (connectionState.latency < 100 ? 'excellent' :
     connectionState.latency < 300 ? 'good' :
     connectionState.latency < 1000 ? 'fair' : 'poor') : 'unknown';

  return {
    connectionState,
    stats,
    isHealthy,
    connectionQuality,
    ...websocketState
  };
}

// Hook for mobile-optimized WebSocket usage
export function useMobileWebSocket(options?: UseWebSocketOptions) {
  const [isOptimized, setIsOptimized] = useState(false);
  
  const websocketState = useWebSocket({
    ...options,
    enableLogging: false // Disable logging on mobile by default
  });

  useEffect(() => {
    // Apply mobile optimizations
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    if (isMobile) {
      setIsOptimized(true);
      // Additional mobile-specific optimizations can be applied here
    }
  }, []);

  return {
    ...websocketState,
    isMobileOptimized: isOptimized
  };
}
