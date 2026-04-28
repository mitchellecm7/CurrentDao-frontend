import React, { useEffect, useState, useCallback, useRef } from 'react';

export interface ServiceWorkerMessage {
  type: string;
  data?: any;
  timestamp?: number;
  queryKey?: any[];
  error?: string;
}

export interface SyncStatus {
  queue: Array<[string, any]>;
  status: Array<[string, any]>;
  backgroundSyncEnabled: boolean;
  lastSync: number | null;
}

export function useServiceWorkerSync() {
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [lastMessage, setLastMessage] = useState<ServiceWorkerMessage | null>(null);
  
  const serviceWorkerRef = useRef<ServiceWorker | null>(null);
  const messageChannelRef = useRef<MessageChannel | null>(null);

  // Initialize service worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        serviceWorkerRef.current = registration.active;
        setIsServiceWorkerReady(true);
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        
        // Start background sync
        startBackgroundSync();
      }).catch((error) => {
        console.error('Service worker registration failed:', error);
      });

      return () => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
        }
      };
    }
  }, []);

  const handleServiceWorkerMessage = useCallback((event: MessageEvent) => {
    const message = event.data as ServiceWorkerMessage;
    setLastMessage(message);

    switch (message.type) {
      case 'SYNC_SUCCESS':
        console.log('Background sync successful:', message.queryKey);
        break;
      case 'SYNC_FAILURE':
        console.error('Background sync failed:', message.queryKey, message.error);
        break;
      case 'BACKGROUND_SYNC_TRIGGER':
        console.log('Background sync triggered:', message.timestamp);
        break;
    }
  }, []);

  const startBackgroundSync = useCallback((config?: any) => {
    if (serviceWorkerRef.current) {
      serviceWorkerRef.current.postMessage({
        type: 'START_BACKGROUND_SYNC',
        data: config
      });
    }
  }, []);

  const stopBackgroundSync = useCallback(() => {
    if (serviceWorkerRef.current) {
      serviceWorkerRef.current.postMessage({
        type: 'STOP_BACKGROUND_SYNC'
      });
    }
  }, []);

  const requestSync = useCallback((queryKey: any[], endpoint: string) => {
    if (serviceWorkerRef.current) {
      serviceWorkerRef.current.postMessage({
        type: 'SYNC_REQUEST',
        data: { queryKey, endpoint }
      });
    }
  }, []);

  const getSyncStatus = useCallback(async (): Promise<SyncStatus | null> => {
    if (!serviceWorkerRef.current) return null;

    try {
      const channel = new MessageChannel();
      messageChannelRef.current = channel;

      return new Promise((resolve) => {
        channel.port1.onmessage = (event) => {
          if (event.data.type === 'SYNC_STATUS_RESPONSE') {
            setSyncStatus(event.data.status);
            resolve(event.data.status);
          }
        };

        serviceWorkerRef.current!.postMessage(
          { type: 'GET_SYNC_STATUS' },
          [channel.port2]
        );
      });
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return null;
    }
  }, []);

  // Periodic status updates
  useEffect(() => {
    if (!isServiceWorkerReady) return;

    const interval = setInterval(() => {
      getSyncStatus();
    }, 10000); // Update status every 10 seconds

    return () => clearInterval(interval);
  }, [isServiceWorkerReady, getSyncStatus]);

  return {
    isServiceWorkerReady,
    syncStatus,
    lastMessage,
    startBackgroundSync,
    stopBackgroundSync,
    requestSync,
    getSyncStatus
  };
}
