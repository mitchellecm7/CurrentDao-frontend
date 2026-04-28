'use client';

import React, { useState } from 'react';
import type { ReconnectState, ReconnectStatus } from '@/hooks/useWebSocketReconnect';

interface WebSocketStatusIndicatorProps {
  state: ReconnectState;
  onReconnect: () => void;
  onDisconnect?: () => void;
  showLog?: boolean;
}

const STATUS_CONFIG: Record<ReconnectStatus, { label: string; dotClass: string; badgeClass: string }> = {
  connected: {
    label: 'Connected',
    dotClass: 'bg-green-500 animate-pulse',
    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  reconnecting: {
    label: 'Reconnecting',
    dotClass: 'bg-yellow-500 animate-ping',
    badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  disconnected: {
    label: 'Disconnected',
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
};

export function WebSocketStatusIndicator({
  state,
  onReconnect,
  onDisconnect,
  showLog = false,
}: WebSocketStatusIndicatorProps) {
  const [logOpen, setLogOpen] = useState(false);
  const cfg = STATUS_CONFIG[state.status];

  return (
    <div className="inline-flex flex-col gap-2">
      {/* Status badge row */}
      <div className="inline-flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badgeClass}`}>
          <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
          {cfg.label}
          {state.status === 'reconnecting' && state.attempt > 0 && (
            <span className="opacity-75">(attempt {state.attempt})</span>
          )}
        </span>

        {state.status === 'reconnecting' && state.nextRetryIn > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Retry in {state.nextRetryIn}s
          </span>
        )}

        {/* Manual reconnect button */}
        {(state.status === 'disconnected' || state.status === 'reconnecting') && (
          <button
            onClick={onReconnect}
            className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            aria-label="Reconnect WebSocket"
          >
            Reconnect
          </button>
        )}

        {state.status === 'connected' && onDisconnect && (
          <button
            onClick={onDisconnect}
            className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-colors"
          >
            Disconnect
          </button>
        )}

        {showLog && state.log.length > 0 && (
          <button
            onClick={() => setLogOpen(o => !o)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            {logOpen ? 'Hide log' : 'Show log'}
          </button>
        )}
      </div>

      {/* Reconnection log */}
      {showLog && logOpen && state.log.length > 0 && (
        <div className="w-full max-w-lg bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-300 max-h-40 overflow-y-auto space-y-0.5">
          {[...state.log].reverse().map((entry, i) => (
            <div key={i} className="leading-relaxed">{entry}</div>
          ))}
        </div>
      )}
    </div>
  );
}
