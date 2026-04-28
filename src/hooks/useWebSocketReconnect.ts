import { useCallback, useEffect, useRef, useState } from 'react';

export type ReconnectStatus = 'connected' | 'reconnecting' | 'disconnected';

export interface ReconnectState {
  status: ReconnectStatus;
  attempt: number;
  nextRetryIn: number; // seconds
  log: string[];
}

interface UseWebSocketReconnectOptions {
  url: string;
  /** Initial delay in ms. Doubles each attempt up to maxDelay. Default: 1000 */
  initialDelay?: number;
  /** Maximum delay in ms. Default: 60000 */
  maxDelay?: number;
  /** Maximum reconnect attempts (0 = unlimited). Default: 0 */
  maxAttempts?: number;
  /** Heartbeat interval in ms. Default: 30000 */
  heartbeatInterval?: number;
  onMessage?: (event: MessageEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

const MAX_LOG_ENTRIES = 50;

function addLog(prev: string[], msg: string): string[] {
  const entry = `[${new Date().toISOString()}] ${msg}`;
  return [...prev.slice(-(MAX_LOG_ENTRIES - 1)), entry];
}

export function useWebSocketReconnect({
  url,
  initialDelay = 1000,
  maxDelay = 60000,
  maxAttempts = 0,
  heartbeatInterval = 30000,
  onMessage,
  onOpen,
  onClose,
}: UseWebSocketReconnectOptions) {
  const [state, setState] = useState<ReconnectState>({
    status: 'disconnected',
    attempt: 0,
    nextRetryIn: 0,
    log: [],
  });

  const wsRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageQueueRef = useRef<string[]>([]);
  const attemptRef = useRef(0);
  const mountedRef = useRef(true);
  const manualDisconnectRef = useRef(false);

  // Queued messages to replay on reconnect
  const missedEventsRef = useRef<MessageEvent[]>([]);

  const clearTimers = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
  }, []);

  const startHeartbeat = useCallback((ws: WebSocket) => {
    heartbeatRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, heartbeatInterval);
  }, [heartbeatInterval]);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    manualDisconnectRef.current = false;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        attemptRef.current = 0;
        setState(prev => ({
          status: 'connected',
          attempt: 0,
          nextRetryIn: 0,
          log: addLog(prev.log, 'Connected'),
        }));

        // Flush queued messages
        while (messageQueueRef.current.length > 0) {
          const msg = messageQueueRef.current.shift()!;
          ws.send(msg);
        }

        startHeartbeat(ws);
        onOpen?.();
      };

      ws.onmessage = (event) => {
        // Filter out pong responses
        try {
          const data = JSON.parse(event.data);
          if (data?.type === 'pong') return;
        } catch {}
        onMessage?.(event);
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        clearTimers();

        if (manualDisconnectRef.current) {
          setState(prev => ({
            status: 'disconnected',
            attempt: 0,
            nextRetryIn: 0,
            log: addLog(prev.log, 'Disconnected (manual)'),
          }));
          onClose?.();
          return;
        }

        attemptRef.current += 1;
        const attempt = attemptRef.current;

        if (maxAttempts > 0 && attempt > maxAttempts) {
          setState(prev => ({
            status: 'disconnected',
            attempt,
            nextRetryIn: 0,
            log: addLog(prev.log, `Max reconnect attempts (${maxAttempts}) reached`),
          }));
          return;
        }

        const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
        const delaySec = Math.round(delay / 1000);

        setState(prev => ({
          status: 'reconnecting',
          attempt,
          nextRetryIn: delaySec,
          log: addLog(prev.log, `Disconnected (code ${event.code}). Reconnecting in ${delaySec}s (attempt ${attempt})`),
        }));

        // Countdown timer
        let remaining = delaySec;
        countdownRef.current = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            if (countdownRef.current) clearInterval(countdownRef.current);
          }
          setState(prev => ({ ...prev, nextRetryIn: Math.max(0, remaining) }));
        }, 1000);

        retryTimerRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, delay);

        onClose?.();
      };

      ws.onerror = () => {
        setState(prev => ({
          ...prev,
          log: addLog(prev.log, 'WebSocket error'),
        }));
      };
    } catch (err) {
      setState(prev => ({
        ...prev,
        log: addLog(prev.log, `Failed to create WebSocket: ${err}`),
      }));
    }
  }, [url, initialDelay, maxDelay, maxAttempts, startHeartbeat, clearTimers, onMessage, onOpen, onClose]);

  const disconnect = useCallback(() => {
    manualDisconnectRef.current = true;
    clearTimers();
    wsRef.current?.close();
  }, [clearTimers]);

  const reconnect = useCallback(() => {
    clearTimers();
    wsRef.current?.close();
    attemptRef.current = 0;
    setState(prev => ({
      ...prev,
      attempt: 0,
      nextRetryIn: 0,
      log: addLog(prev.log, 'Manual reconnect triggered'),
    }));
    connect();
  }, [clearTimers, connect]);

  const sendMessage = useCallback((data: string | object) => {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(payload);
    } else {
      // Queue for when connection is restored
      messageQueueRef.current.push(payload);
      setState(prev => ({
        ...prev,
        log: addLog(prev.log, `Message queued (queue size: ${messageQueueRef.current.length})`),
      }));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      manualDisconnectRef.current = true;
      clearTimers();
      wsRef.current?.close();
    };
  }, [connect, clearTimers]);

  return { state, reconnect, disconnect, sendMessage };
}
