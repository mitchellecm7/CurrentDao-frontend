# WebSocket Integration for Real-time Updates

This document describes the comprehensive WebSocket integration system implemented for CurrentDao to provide real-time updates across trading, governance, notifications, and collaborative features.

## Architecture Overview

The WebSocket system is built with the following components:

### Core Files Created

1. **`src/types/websocket.ts`** - Type definitions and interfaces
2. **`src/lib/websocket.ts`** - Core WebSocket management library
3. **`src/utils/websocketHelpers.ts`** - Utility functions and helpers
4. **`src/hooks/useWebSocket.ts`** - React hooks for WebSocket functionality
5. **`src/hooks/useRealTimeSync.ts`** - Real-time data synchronization hooks
6. **`src/components/common/ConnectionStatus.tsx`** - Connection status UI components
7. **`src/providers/WebSocketProvider.tsx`** - React context provider
8. **`src/app/layout.tsx`** - Integration with app layout

## Features Implemented

### ✅ Connection Management
- Automatic connection establishment
- Configurable reconnection with exponential backoff
- Connection status monitoring
- Graceful disconnection handling

### ✅ Real-time Data Synchronization
- Message queuing during disconnections
- Conflict resolution strategies
- Selective event subscriptions
- Performance optimization for high-volume updates

### ✅ Mobile Optimizations
- Battery-efficient connection management
- Adaptive heartbeat intervals
- Network-aware reconnection
- Background sync capabilities

### ✅ Performance Features
- Message batching and deduplication
- Compression for large messages
- Priority-based message handling
- Connection quality monitoring

### ✅ Developer Experience
- Comprehensive TypeScript support
- Debug logging capabilities
- Performance metrics
- Error handling and recovery

## Usage Examples

### Basic WebSocket Hook Usage

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

function MyComponent() {
  const { 
    isConnected, 
    connectionState, 
    sendMessage, 
    subscribe 
  } = useWebSocket({
    url: 'ws://localhost:8080/ws',
    autoConnect: true
  });

  useEffect(() => {
    const subscriptionId = subscribe({
      type: WebSocketMessageType.TRADE_UPDATE,
      callback: (message) => {
        console.log('Trade update received:', message.payload);
      }
    });

    return () => unsubscribe(subscriptionId);
  }, [subscribe]);

  const handleSendMessage = () => {
    sendMessage({
      type: WebSocketMessageType.NOTIFICATION,
      payload: { text: 'Hello World!' }
    });
  };

  return (
    <div>
      <p>Status: {connectionState.status}</p>
      <button onClick={handleSendMessage} disabled={!isConnected}>
        Send Message
      </button>
    </div>
  );
}
```

### Real-time Data Synchronization

```typescript
import { useRealTimeSync } from '@/hooks/useRealTimeSync';

function TradeData() {
  const { 
    data, 
    isSynced, 
    hasConflicts, 
    update, 
    forceSync 
  } = useRealTimeSync<TradeData>({
    entityType: 'trade',
    entityId: 'trade-123',
    config: {
      enabled: true,
      conflictResolution: 'merge',
      syncInterval: 5000
    }
  });

  const handleUpdate = (updates: Partial<TradeData>) => {
    update(updates);
  };

  return (
    <div>
      <p>Sync Status: {isSynced ? 'Synced' : 'Syncing...'}</p>
      {hasConflicts && <p>⚠️ Conflicts detected</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

### Connection Status Component

```typescript
import { ConnectionStatus } from '@/components/common/ConnectionStatus';

function AppHeader() {
  return (
    <header>
      <h1>CurrentDao</h1>
      <ConnectionStatus 
        showDetails={true}
        showLatency={true}
        showStats={true}
      />
    </header>
  );
}
```

### Provider Integration

```typescript
import { WebSocketProvider, createWebSocketConfig } from '@/providers/WebSocketProvider';

function App() {
  const wsConfig = createWebSocketConfig('ws://localhost:8080/ws', {
    reconnectAttempts: 5,
    heartbeatInterval: 30000,
    enableCompression: true
  });

  return (
    <WebSocketProvider config={wsConfig} autoConnect>
      <YourApp />
    </WebSocketProvider>
  );
}
```

## Configuration Options

### WebSocket Configuration

```typescript
interface WebSocketConfig {
  url: string;                    // WebSocket server URL
  protocols?: string[];          // WebSocket protocols
  reconnectAttempts?: number;    // Max reconnection attempts
  reconnectDelay?: number;        // Base reconnection delay
  heartbeatInterval?: number;     // Heartbeat ping interval
  messageQueueSize?: number;     // Max queued messages
  enableCompression?: boolean;   // Enable message compression
}
```

### Real-time Sync Configuration

```typescript
interface RealTimeSyncConfig {
  enabled: boolean;              // Enable synchronization
  syncInterval?: number;          // Auto-sync interval
  conflictResolution?: 'local' | 'remote' | 'merge';
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
}
```

### Mobile Optimization

```typescript
interface MobileOptimizationConfig {
  enableBackgroundSync: boolean;  // Sync when app is backgrounded
  adaptiveHeartbeat: boolean;    // Adjust heartbeat based on conditions
  compressionThreshold: number;  // Minimum size for compression
  batteryOptimization: boolean; // Reduce activity to save battery
  networkAwareReconnect: boolean; // Adjust reconnection based on network
}
```

## Message Types

The system supports the following message types:

- **Connection Management**: `CONNECT`, `DISCONNECT`, `PING`, `PONG`
- **Real-time Updates**: `TRADE_UPDATE`, `GOVERNANCE_UPDATE`, `NOTIFICATION`
- **Market Data**: `PRICE_UPDATE`, `MARKET_DATA`
- **Collaboration**: `USER_STATUS`, `COLLABORATION_UPDATE`, `CHAT_MESSAGE`
- **System**: `ERROR`, `ACKNOWLEDGMENT`, `SUBSCRIPTION_CONFIRMED`

## Performance Metrics

The system tracks and provides the following metrics:

- **Connection Statistics**: Uptime, reconnections, message counts
- **Performance Metrics**: Latency, messages per second, connection quality
- **Error Tracking**: Connection failures, retry attempts, error rates
- **Mobile Metrics**: Battery usage, network type, optimization status

## Security Considerations

1. **Authentication**: WebSocket connections should include proper authentication tokens
2. **Authorization**: Implement server-side authorization for message types
3. **Rate Limiting**: Prevent message flooding with rate limiting
4. **Data Validation**: Validate all incoming message payloads
5. **Secure Connections**: Use `wss://` for production environments

## Testing Strategy

### Unit Tests
- WebSocket manager functionality
- Message serialization/deserialization
- Connection state management
- Utility functions

### Integration Tests
- End-to-end message flow
- Reconnection scenarios
- Conflict resolution
- Mobile optimizations

### Performance Tests
- High-volume message handling
- Connection scaling
- Memory usage
- Battery impact

## Environment Variables

```bash
# WebSocket server URL
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws

# Enable debug logging (development only)
NEXT_PUBLIC_WS_DEBUG=true

# Connection timeout (milliseconds)
NEXT_PUBLIC_WS_TIMEOUT=30000
```

## Troubleshooting

### Common Issues

1. **Connection Fails**
   - Check WebSocket server is running
   - Verify URL and port configuration
   - Check network connectivity

2. **Frequent Reconnections**
   - Check server stability
   - Adjust heartbeat interval
   - Review network quality

3. **Message Not Received**
   - Verify subscription filters
   - Check message type matching
   - Review server-side routing

4. **Performance Issues**
   - Enable message compression
   - Reduce heartbeat frequency
   - Implement message batching

### Debug Logging

Enable debug logging to troubleshoot issues:

```typescript
const websocket = useWebSocket({
  url: 'ws://localhost:8080/ws',
  enableLogging: true  // Enable for development
});
```

## Migration Guide

### From Existing WebSocket Implementation

1. Replace direct WebSocket usage with hooks
2. Update message handling to use new types
3. Implement provider pattern for state management
4. Add connection status components
5. Configure mobile optimizations

### Example Migration

```typescript
// Before
const [ws, setWs] = useState(null);
useEffect(() => {
  const socket = new WebSocket('ws://localhost:8080/ws');
  setWs(socket);
  return () => socket.close();
}, []);

// After
const { isConnected, sendMessage, subscribe } = useWebSocket({
  url: 'ws://localhost:8080/ws',
  autoConnect: true
});
```

## Future Enhancements

1. **Server-Sent Events (SSE)**: Fallback for unsupported browsers
2. **WebRTC**: Peer-to-peer real-time communication
3. **GraphQL Subscriptions**: GraphQL-based real-time updates
4. **Offline Support**: Service worker integration
5. **Analytics**: Real-time usage analytics and monitoring

## Support and Maintenance

- Regular performance monitoring
- Security updates and patches
- Feature enhancements based on user feedback
- Documentation updates
- Testing coverage improvements

---

This WebSocket integration provides a robust, scalable foundation for real-time features in CurrentDao, ensuring reliable communication and excellent user experience across all devices and network conditions.
