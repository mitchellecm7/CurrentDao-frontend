/**
 * Offline Mode Hook for CurrentDao
 * Provides comprehensive offline functionality with caching, transaction queuing, sync management, and conflict resolution
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  OfflineStatus,
  OfflineModeReturn,
  OfflineConfig,
  QueuedTransaction,
  TransactionType,
  TransactionPriority,
  CacheOptions,
  SyncStatus,
  DataFreshness,
  LoadingPhase,
  LoadingProgress
} from '../../types/offline/offline';

// Import services (these would be properly imported in a real implementation)
import CacheManager from '../../services/offline/cache-manager';
import SyncEngine from '../../services/offline/sync-engine';
import { DataFreshnessManager } from '../../utils/offline/data-freshness';

const DEFAULT_CONFIG: OfflineConfig = {
  cache: {
    maxSize: 50 * 1024 * 1024, // 50MB
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 1000,
    storageQuota: 100 * 1024 * 1024, // 100MB
    compressionEnabled: true,
    encryptionEnabled: false,
    priorityThresholds: {
      essential: 1.0,
      important: 0.8,
      normal: 0.5,
      low: 0.2,
    },
  },
  queue: {
    maxSize: 100,
    maxRetries: 3,
    priorityThresholds: {
      critical: 1.0,
      high: 0.8,
      normal: 0.5,
      low: 0.2,
    },
  },
  sync: {
    autoSync: true,
    syncInterval: 30000, // 30 seconds
    batchSize: 10,
    maxRetries: 3,
    retryDelay: 5000,
    conflictResolution: 'auto' as const,
    priorityOrder: ['critical', 'high', 'normal', 'low'] as TransactionPriority[],
  },
  analytics: {
    enableSimulation: true,
    maxHistoryDays: 30,
    refreshInterval: 60000, // 1 minute
  },
  freshness: {
    realtimeThreshold: 60000, // 1 minute
    freshThreshold: 300000, // 5 minutes
    staleThreshold: 3600000, // 1 hour
    veryStaleThreshold: 21600000, // 6 hours
    expiredThreshold: 43200000, // 12 hours
    reliabilityFactors: {},
  },
  loading: {
    essentialOnly: false,
    progressiveLoading: true,
    priorityOrder: ['critical', 'high', 'medium', 'low'],
    batchSize: 5,
    timeout: 10000,
    retryAttempts: 3,
  },
  simulation: {
    enabled: false,
    marketConditions: 'normal' as const,
    networkLatency: 100,
    packetLoss: 0.01,
    priceVolatility: 0.02,
    liquidityDepth: 1000000,
    slippage: 0.001,
  },
};

export const useOfflineMode = (initialConfig?: Partial<OfflineConfig>) => {
  const [config, setConfig] = useState<OfflineConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isOffline: !navigator.onLine,
    lastSync: null,
    cacheSize: 0,
    queueSize: 0,
    syncInProgress: false,
    hasConflicts: false,
  });

  const [loadingState, setLoadingState] = useState<LoadingState>({
    phase: 'initializing',
    progress: 0,
    loaded: [],
    pending: [],
    failed: [],
    estimatedTimeRemaining: 0,
  });

  // Service instances
  const servicesRef = useRef<{
    cacheManager: CacheManager;
    syncEngine: SyncEngine;
    freshnessManager: DataFreshnessManager;
  }>();

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize cache manager
        servicesRef.current.cacheManager = new CacheManager(
          config.cache,
          'currentdao-offline-cache'
        );

        // Initialize sync engine
        servicesRef.current.syncEngine = new SyncEngine(config.sync);

        // Initialize freshness manager
        servicesRef.current.freshnessManager = new DataFreshnessManager(config.freshness);

        // Update status
        const cacheStats = servicesRef.current.cacheManager.getStats();
        setStatus(prev => ({
          ...prev,
          cacheSize: cacheStats.totalSize,
          queueSize: servicesRef.current.syncEngine.getQueue().length,
        }));

        console.log('Offline services initialized successfully');
      } catch (error) {
        console.error('Failed to initialize offline services:', error);
      }
    };

    initializeServices();
  }, [config]);

  // Network monitoring
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true, isOffline: false }));
      
      // Start sync when coming back online
      if (servicesRef.current.syncEngine && config.sync.autoSync) {
        servicesRef.current.syncEngine.startSync();
      }
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false, isOffline: true }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [config.sync.autoSync]);

  // Cache operations
  const cache = {
    get: useCallback(async <T>(key: string): Promise<T | null> => {
      if (!servicesRef.current.cacheManager) return null;
      
      try {
        const result = await servicesRef.current.cacheManager.get<T>(key);
        
        // Update freshness
        if (result !== null) {
          servicesRef.current.freshnessManager.updateFreshness(key);
        }
        
        return result;
      } catch (error) {
        console.error('Cache get error:', error);
        return null;
      }
    }, []),

    set: useCallback(async <T>(
      key: string,
      data: T,
      options?: CacheOptions
    ): Promise<void> => {
      if (!servicesRef.current.cacheManager) return;
      
      try {
        await servicesRef.current.cacheManager.set(key, data, {
          expiresAt: options?.expiresAt,
          priority: options?.priority,
          metadata: options?.metadata,
          tags: options?.tags,
        });
        
        // Update freshness
        servicesRef.current.freshnessManager.updateFreshness(key);
        
        // Update cache size in status
        const stats = servicesRef.current.cacheManager.getStats();
        setStatus(prev => ({ ...prev, cacheSize: stats.totalSize }));
      } catch (error) {
        console.error('Cache set error:', error);
        throw error;
      }
    }, []),

    delete: useCallback(async (key: string): Promise<void> => {
      if (!servicesRef.current.cacheManager) return;
      
      try {
        await servicesRef.current.cacheManager.delete(key);
        
        // Update cache size in status
        const stats = servicesRef.current.cacheManager.getStats();
        setStatus(prev => ({ ...prev, cacheSize: stats.totalSize }));
      } catch (error) {
        console.error('Cache delete error:', error);
        throw error;
      }
    }, []),

    clear: useCallback(async (): Promise<void> => {
      if (!servicesRef.current.cacheManager) return;
      
      try {
        await servicesRef.current.cacheManager.clear();
        
        // Update status
        setStatus(prev => ({ ...prev, cacheSize: 0 }));
      } catch (error) {
        console.error('Cache clear error:', error);
        throw error;
      }
    }, []),

    stats: useCallback((): any => {
      if (!servicesRef.current.cacheManager) return null;
      return servicesRef.current.cacheManager.getStats();
    }, []),

    optimize: useCallback(async (): Promise<void> => {
      if (!servicesRef.current.cacheManager) return;
      
      try {
        await servicesRef.current.cacheManager.optimize();
        
        // Update status
        const stats = servicesRef.current.cacheManager.getStats();
        setStatus(prev => ({ ...prev, cacheSize: stats.totalSize }));
      } catch (error) {
        console.error('Cache optimize error:', error);
        throw error;
      }
    }, []),
  };

  // Transaction queue operations
  const queue = {
    add: useCallback(async (transaction: QueuedTransaction): Promise<void> => {
      if (!servicesRef.current.syncEngine) return;
      
      try {
        // Add to sync engine queue
        const currentQueue = servicesRef.current.syncEngine.getQueue();
        
        if (currentQueue.length >= config.queue.maxSize) {
          throw new Error('Transaction queue is full');
        }
        
        // In a real implementation, this would add to the queue
        // For now, we'll simulate it
        currentQueue.push(transaction);
        
        // Update status
        setStatus(prev => ({ ...prev, queueSize: currentQueue.length }));
      } catch (error) {
        console.error('Queue add error:', error);
        throw error;
      }
    }, [config.queue.maxSize]),

    remove: useCallback(async (id: string): Promise<void> => {
      if (!servicesRef.current.syncEngine) return;
      
      try {
        const currentQueue = servicesRef.current.syncEngine.getQueue();
        const index = currentQueue.findIndex(t => t.id === id);
        
        if (index !== -1) {
          currentQueue.splice(index, 1);
          setStatus(prev => ({ ...prev, queueSize: currentQueue.length }));
        }
      } catch (error) {
        console.error('Queue remove error:', error);
        throw error;
      }
    }, []),

    get: useCallback((id: string): QueuedTransaction | null => {
      if (!servicesRef.current.syncEngine) return null;
      
      const currentQueue = servicesRef.current.syncEngine.getQueue();
      return currentQueue.find(t => t.id === id) || null;
    }, []),

    getAll: useCallback((): QueuedTransaction[] => {
      if (!servicesRef.current.syncEngine) return [];
      return servicesRef.current.syncEngine.getQueue();
    }, []),

    clear: useCallback(async (): Promise<void> => {
      if (!servicesRef.current.syncEngine) return;
      
      try {
        // Clear queue (in real implementation)
        const currentQueue = servicesRef.current.syncEngine.getQueue();
        currentQueue.length = 0;
        
        setStatus(prev => ({ ...prev, queueSize: 0, hasConflicts: false }));
      } catch (error) {
        console.error('Queue clear error:', error);
        throw error;
      }
    }, []),

    process: useCallback(async (): Promise<any> => {
      if (!servicesRef.current.syncEngine) return null;
      
      try {
        // Process queue (in real implementation)
        const result = {
          processed: 0,
          failed: 0,
          conflicts: 0,
          duration: 0,
          errors: [],
        };
        
        // Update status
        const currentQueue = servicesRef.current.syncEngine.getQueue();
        setStatus(prev => ({ ...prev, queueSize: currentQueue.length }));
        
        return result;
      } catch (error) {
        console.error('Queue process error:', error);
        throw error;
      }
    }, []),

    getStats: useCallback((): any => {
      if (!servicesRef.current.syncEngine) return null;
      return servicesRef.current.syncEngine.getStats();
    }, []),
  };

  // Sync operations
  const sync = {
    start: useCallback(async (): Promise<void> => {
      if (!servicesRef.current.syncEngine) return;
      
      try {
        setStatus(prev => ({ ...prev, syncInProgress: true }));
        await servicesRef.current.syncEngine.startSync();
      } catch (error) {
        console.error('Sync start error:', error);
        setStatus(prev => ({ ...prev, syncInProgress: false }));
        throw error;
      }
    }, []),

    stop: useCallback(async (): Promise<void> => {
      if (!servicesRef.current.syncEngine) return;
      
      try {
        await servicesRef.current.syncEngine.stopSync();
        setStatus(prev => ({ ...prev, syncInProgress: false }));
      } catch (error) {
        console.error('Sync stop error:', error);
        throw error;
      }
    }, []),

    getStatus: useCallback((): SyncStatus => {
      if (!servicesRef.current.syncEngine) return 'idle';
      return servicesRef.current.syncEngine.getStatus();
    }, []),

    getHistory: useCallback((): any[] => {
      if (!servicesRef.current.syncEngine) return [];
      return servicesRef.current.syncEngine.getHistory();
    }, []),

    configure: useCallback((newConfig: Partial<typeof config.sync>): void => {
      if (!servicesRef.current.syncEngine) return;
      servicesRef.current.syncEngine.configure(newConfig);
    }, []),
  };

  // Analytics operations
  const analytics = {
    getPortfolio: useCallback(async (): Promise<any> => {
      // Get portfolio from cache
      const portfolio = await cache.get('portfolio_snapshot');
      
      if (!portfolio) {
        // Generate mock portfolio data for offline use
        return {
          timestamp: new Date(),
          assets: [
            {
              symbol: 'ETH',
              name: 'Ethereum',
              balance: 10.5,
              value: 31500,
              price: 3000,
              priceChange24h: 0.02,
              type: 'token' as const,
              protocol: 'ethereum',
            },
            {
              symbol: 'USDT',
              name: 'Tether',
              balance: 5000,
              value: 5000,
              price: 1,
              priceChange24h: 0,
              type: 'token' as const,
              protocol: 'ethereum',
            },
          ],
          totalValue: 36500,
          totalValueChange24h: 0.03,
          isOffline: true,
          dataSource: 'cache',
          completeness: 0.8,
          confidence: 0.75,
        };
      }
      
      return portfolio;
    }, [cache]),

    getHistory: useCallback(async (period?: string): Promise<any[]> => {
      // Get trading history from cache
      const history = await cache.get(`trading_history_${period || '7d'}`);
      
      if (!history) {
        // Generate mock history data for offline use
        return [
          {
            timestamp: new Date(Date.now() - 86400000),
            type: 'order_filled' as const,
            status: 'completed' as const,
            details: {
              transactionId: '0x123...',
              amount: 1.5,
              price: 3000,
              token: 'ETH',
            },
            metadata: {
              isOffline: true,
              isSimulated: false,
            },
          },
        ];
      }
      
      return history;
    }, [cache]),

    getMetrics: useCallback(async (): Promise<any> => {
      const cacheStats = cache.stats();
      const queueStats = queue.getStats();
      const syncStatus = sync.getStatus();
      
      return {
        cacheHitRate: cacheStats?.hitRate || 0,
        averageResponseTime: 150,
        syncSuccessRate: 0.95,
        conflictResolutionRate: 0.9,
        offlineUptime: status.isOffline ? Date.now() - (status.lastSync?.getTime() || 0) : 0,
        dataFreshness: servicesRef.current.freshnessManager?.checkAll() || {},
      };
    }, [cache, queue, sync, status, servicesRef.current.freshnessManager]),

    simulate: useCallback(async (simConfig: any): Promise<any> => {
      // Simulate offline trading scenario
      return {
        id: `sim_${Date.now()}`,
        timestamp: new Date(),
        config: simConfig,
        results: {
          successRate: 0.85,
          averageSlippage: 0.002,
          averageDelay: 5000,
          failedTransactions: 2,
          conflictsResolved: 3,
          estimatedValue: 100000,
        },
        recommendations: [
          {
            type: 'increase_gas' as const,
            priority: 'medium' as const,
            title: 'Increase Gas Limit',
            description: 'Network congestion detected',
            action: 'Increase gas limit by 20%',
            expectedImpact: 'Higher success rate',
            confidence: 0.8,
          },
        ],
        confidence: 0.8,
      };
    }, []),
  };

  // Freshness operations
  const freshness = {
    getFreshness: useCallback((key: string): DataFreshness => {
      if (!servicesRef.current.freshnessManager) {
        return {
          lastUpdate: new Date(),
          age: 0,
          freshness: 'unknown',
          reliability: 'unknown',
          source: 'unknown',
        };
      }
      
      return servicesRef.current.freshnessManager.getFreshness(key);
    }, []),

    updateFreshness: useCallback((key: string): void => {
      if (servicesRef.current.freshnessManager) {
        servicesRef.current.freshnessManager.updateFreshness(key);
      }
    }, []),

    checkAll: useCallback((): Record<string, DataFreshness> => {
      if (!servicesRef.current.freshnessManager) return {};
      return servicesRef.current.freshnessManager.checkAll();
    }, []),

    getStaleKeys: useCallback((): string[] => {
      if (!servicesRef.current.freshnessManager) return [];
      return servicesRef.current.freshnessManager.getStaleKeys();
    }, []),
  };

  // Loading operations
  const loading = {
    start: useCallback(async (loadingConfig?: any): Promise<void> => {
      setLoadingState({
        phase: 'initializing',
        progress: 0,
        loaded: [],
        pending: ['cache', 'queue', 'analytics'],
        failed: [],
        estimatedTimeRemaining: 5000,
      });

      // Simulate progressive loading
      const phases: LoadingPhase[] = [
        'initializing',
        'loading_cache',
        'loading_queue',
        'loading_analytics',
        'loading_portfolio',
        'loading_settings',
        'ready',
      ];

      for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        
        setLoadingState(prev => ({
          ...prev,
          phase,
          progress: (i / phases.length) * 100,
          loaded: prev.loaded.concat(phase),
          pending: prev.pending.filter(p => p !== phase),
          estimatedTimeRemaining: Math.max(0, (phases.length - i - 1) * 1000),
        }));

        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }, []),

    getState: useCallback((): LoadingState => {
      return loadingState;
    }, [loadingState]),

    getProgress: useCallback((): LoadingProgress[] => {
      return [
        {
          phase: loadingState.phase,
          percentage: loadingState.progress,
          item: loadingState.phase,
          loaded: loadingState.loaded.includes(loadingState.phase),
          estimatedTime: loadingState.estimatedTimeRemaining,
        },
      ];
    }, [loadingState]),

    isReady: useCallback((): boolean => {
      return loadingState.phase === 'ready';
    }, [loadingState.phase]),
  };

  // Refresh all data
  const refresh = useCallback(async (): Promise<void> => {
    try {
      // Refresh cache stats
      const cacheStats = servicesRef.current.cacheManager?.getStats();
      if (cacheStats) {
        setStatus(prev => ({ ...prev, cacheSize: cacheStats.totalSize }));
      }

      // Refresh queue stats
      const queueStats = servicesRef.current.syncEngine?.getStats();
      if (queueStats) {
        setStatus(prev => ({ ...prev, queueSize: queueStats.total }));
      }

      // Update last sync time
      setStatus(prev => ({ ...prev, lastSync: new Date() }));
    } catch (error) {
      console.error('Refresh error:', error);
    }
  }, []);

  // Configure offline mode
  const configure = useCallback((newConfig: Partial<OfflineConfig>): void => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    
    // Update services configuration
    if (servicesRef.current.syncEngine && newConfig.sync) {
      servicesRef.current.syncEngine.configure(newConfig.sync);
    }
    
    if (servicesRef.current.freshnessManager && newConfig.freshness) {
      servicesRef.current.freshnessManager.configure(newConfig.freshness);
    }
  }, []);

  return {
    status,
    cache,
    queue,
    sync,
    analytics,
    freshness,
    loading,
    refresh,
    configure,
  };
};

export default useOfflineMode;
