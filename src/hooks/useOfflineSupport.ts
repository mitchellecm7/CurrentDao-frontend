'use client';

import { useState, useEffect, useCallback } from 'react';

interface OfflineStatus {
  isOnline: boolean;
  lastOnlineAt: number | null;
  hasOfflineData: boolean;
}

export function useOfflineSupport() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastOnlineAt: null,
    hasOfflineData: false,
  });

  const updateOnlineStatus = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      isOnline: navigator.onLine,
      lastOnlineAt: navigator.onLine ? Date.now() : prev.lastOnlineAt,
    }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [updateOnlineStatus]);

  const saveToOfflineCache = useCallback(async (key: string, data: any) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`offline_${key}`, JSON.stringify({
          data,
          timestamp: Date.now(),
        }));
        setStatus(prev => ({ ...prev, hasOfflineData: true }));
      }
    } catch (e) {
      console.error('Failed to save to offline cache:', e);
    }
  }, []);

  const getFromOfflineCache = useCallback((key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem(`offline_${key}`);
        return cached ? JSON.parse(cached) : null;
      }
    } catch (e) {
      console.error('Failed to get from offline cache:', e);
    }
    return null;
  }, []);

  return {
    ...status,
    saveToOfflineCache,
    getFromOfflineCache,
  };
}
