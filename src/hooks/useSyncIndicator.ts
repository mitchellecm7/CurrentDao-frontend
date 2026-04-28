import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface SyncStatus {
  isSyncing: boolean;
  lastUpdated: number | null;
  isStale: boolean;
  hasError: boolean;
  error: string | null;
  retryCount: number;
}

export interface SyncIndicatorOptions {
  queryKey: any[];
  staleTime?: number; // in milliseconds, default 5 minutes
  refetchInterval?: number; // in milliseconds
  enableBackgroundSync?: boolean;
  maxRetries?: number;
}

export function useSyncIndicator(options: SyncIndicatorOptions) {
  const {
    queryKey,
    staleTime = 5 * 60 * 1000, // 5 minutes default
    refetchInterval = 30000, // 30 seconds default
    enableBackgroundSync = true,
    maxRetries = 3
  } = options;

  const queryClient = useQueryClient();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastUpdated: null,
    isStale: false,
    hasError: false,
    error: null,
    retryCount: 0
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update sync status based on query state
  const updateSyncStatus = useCallback((query: any) => {
    const now = Date.now();
    const lastUpdated = query.dataUpdatedAt || null;
    const isStale = lastUpdated ? (now - lastUpdated) > staleTime : true;
    
    setSyncStatus(prev => ({
      ...prev,
      isSyncing: query.isFetching || false,
      lastUpdated,
      isStale,
      hasError: !!query.error,
      error: query.error?.message || null,
      retryCount: query.failureCount || 0
    }));
  }, [staleTime]);

  // Get current query state
  const getCurrentQuery = useCallback(() => {
    return queryClient.getQueryCache().find(queryKey);
  }, [queryClient, queryKey]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, hasError: false, error: null }));
      await queryClient.refetchQueries({ queryKey });
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        hasError: true,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, [queryClient, queryKey]);

  // Retry function with exponential backoff
  const retry = useCallback(() => {
    const query = getCurrentQuery();
    if (!query) return;

    const retryDelay = Math.min(1000 * Math.pow(2, syncStatus.retryCount), 10000);
    
    retryTimeoutRef.current = setTimeout(() => {
      refresh();
    }, retryDelay);
  }, [getCurrentQuery, syncStatus.retryCount, refresh]);

  // Setup background sync
  useEffect(() => {
    if (enableBackgroundSync && refetchInterval > 0) {
      backgroundSyncIntervalRef.current = setInterval(() => {
        const query = getCurrentQuery();
        if (query && !query.isFetching) {
          refresh();
        }
      }, refetchInterval);

      return () => {
        if (backgroundSyncIntervalRef.current) {
          clearInterval(backgroundSyncIntervalRef.current);
        }
      };
    }
  }, [enableBackgroundSync, refetchInterval, getCurrentQuery, refresh]);

  // Monitor query changes
  useEffect(() => {
    const query = getCurrentQuery();
    if (query) {
      updateSyncStatus(query);

      // Subscribe to query state changes
      const unsubscribe = queryClient.getQueryCache().subscribe({
        callback: (event) => {
          if (event.type === 'updated' && event.query.queryKey === queryKey) {
            updateSyncStatus(event.query);
          }
        }
      });

      return unsubscribe;
    }
  }, [getCurrentQuery, updateSyncStatus, queryClient, queryKey]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (backgroundSyncIntervalRef.current) {
        clearInterval(backgroundSyncIntervalRef.current);
      }
    };
  }, []);

  // Format last updated time
  const formatLastUpdated = useCallback(() => {
    if (!syncStatus.lastUpdated) return 'Never';
    
    const now = Date.now();
    const diff = now - syncStatus.lastUpdated;
    
    if (diff < 1000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)} seconds ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  }, [syncStatus.lastUpdated]);

  // Check if should show stale warning
  const shouldShowStaleWarning = syncStatus.isStale && !syncStatus.isSyncing;

  // Check if can retry
  const canRetry = syncStatus.hasError && syncStatus.retryCount < maxRetries;

  return {
    syncStatus,
    refresh,
    retry,
    formatLastUpdated,
    shouldShowStaleWarning,
    canRetry,
    isBackgroundSyncEnabled: enableBackgroundSync
  };
}

// Hook for creating sync-enabled queries
export function useSyncedQuery<T>(
  queryKey: any[],
  queryFn: () => Promise<T>,
  options: {
    staleTime?: number;
    refetchInterval?: number;
    enableBackgroundSync?: boolean;
    maxRetries?: number;
    queryOptions?: any;
  } = {}
) {
  const {
    staleTime,
    refetchInterval,
    enableBackgroundSync,
    maxRetries,
    queryOptions = {}
  } = options;

  const query = useQuery({
    queryKey,
    queryFn,
    staleTime,
    refetchInterval,
    ...queryOptions
  });

  const syncIndicator = useSyncIndicator({
    queryKey,
    staleTime,
    refetchInterval,
    enableBackgroundSync,
    maxRetries
  });

  return {
    ...query,
    syncIndicator
  };
}
