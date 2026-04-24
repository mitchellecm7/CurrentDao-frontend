import { WebSocketMessage, WebSocketMessageType, WebSocketConfig, ConnectionState, WebSocketStats } from '../../types/websocket';

class TradingWebSocketClient {
  private socket: WebSocket | null = null;
  private config: WebSocketConfig;
  private state: ConnectionState = {
    status: 'disconnected',
    reconnectAttempts: 0
  };
  private stats: WebSocketStats = {
    messagesReceived: 0,
    messagesSent: 0,
    connectionTime: 0,
    reconnections: 0,
    averageLatency: 0,
    uptime: 0
  };
  private subscriptions: Map<string, (data: any) => void> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      ...config
    };
  }

  public connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.state.status = 'connecting';
    this.socket = new WebSocket(this.config.url);

    this.socket.onopen = () => {
      this.state.status = 'connected';
      this.state.lastConnected = Date.now();
      this.state.reconnectAttempts = 0;
      this.startHeartbeat();
      console.log('Trading WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      this.stats.messagesReceived++;
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      this.state.status = 'disconnected';
      this.state.lastDisconnected = Date.now();
      this.stopHeartbeat();
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      this.state.status = 'error';
      this.state.error = 'WebSocket error occurred';
      console.error('WebSocket error:', error);
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    const callback = this.subscriptions.get(message.type);
    if (callback) {
      callback(message.payload);
    }
  }

  public subscribe(type: WebSocketMessageType, callback: (data: any) => void): void {
    this.subscriptions.set(type, callback);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: WebSocketMessageType.SUBSCRIPTION_CONFIRMED,
        payload: { type }
      });
    }
  }

  public unsubscribe(type: WebSocketMessageType): void {
    this.subscriptions.delete(type);
  }

  public sendMessage(message: Partial<WebSocketMessage>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        ...message
      }));
      this.stats.messagesSent++;
    }
  }

  private attemptReconnect(): void {
    if (this.state.reconnectAttempts < (this.config.reconnectAttempts || 5)) {
      this.state.reconnectAttempts++;
      this.state.status = 'reconnecting';
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, this.config.reconnectDelay);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendMessage({ type: WebSocketMessageType.PING });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  public disconnect(): void {
    this.stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.socket?.close();
    this.socket = null;
  }

  public getState(): ConnectionState {
    return { ...this.state };
  }

  public getStats(): WebSocketStats {
    return { ...this.stats };
  }
}

export const tradingWebSocket = new TradingWebSocketClient({
  url: process.env.NEXT_PUBLIC_TRADING_WS_URL || 'wss://api.currentdao.org/trading'
});
