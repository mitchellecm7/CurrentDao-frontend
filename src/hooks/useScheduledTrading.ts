'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ScheduledTrade, 
  RecurrencePattern, 
  ConditionalRule, 
  CalendarEvent, 
  AlertNotification,
  SchedulingConfig,
  FilterOptions,
  SortOptions,
  SchedulingStats,
  TimezoneInfo
} from '@/types/scheduling';
import { SchedulingHelpers } from '@/utils/schedulingHelpers';

interface UseScheduledTradingReturn {
  // State
  trades: ScheduledTrade[];
  calendarEvents: CalendarEvent[];
  notifications: AlertNotification[];
  stats: SchedulingStats;
  timezone: TimezoneInfo;
  config: SchedulingConfig;
  filters: FilterOptions;
  sort: SortOptions;
  loading: boolean;
  error: string | null;

  // Actions
  createTrade: (trade: Partial<ScheduledTrade>) => Promise<void>;
  updateTrade: (id: string, updates: Partial<ScheduledTrade>) => Promise<void>;
  cancelTrade: (id: string) => Promise<void>;
  executeTrade: (id: string) => Promise<void>;
  pauseTrade: (id: string) => Promise<void>;
  resumeTrade: (id: string) => Promise<void>;

  // Recurrence
  addRecurrence: (tradeId: string, pattern: RecurrencePattern) => Promise<void>;
  removeRecurrence: (tradeId: string) => Promise<void>;
  updateRecurrence: (tradeId: string, pattern: RecurrencePattern) => Promise<void>;

  // Conditions
  addCondition: (tradeId: string, condition: ConditionalRule) => Promise<void>;
  updateCondition: (tradeId: string, conditionId: string, condition: ConditionalRule) => Promise<void>;
  removeCondition: (tradeId: string, conditionId: string) => Promise<void>;

  // Filtering and sorting
  setFilters: (filters: FilterOptions) => void;
  setSort: (sort: SortOptions) => void;
  clearFilters: () => void;

  // Timezone
  updateTimezone: (timezone: string) => void;

  // Notifications
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;

  // Utilities
  refreshTrades: () => Promise<void>;
  exportTrades: () => void;
  importTrades: (file: File) => Promise<void>;
}

const DEFAULT_CONFIG: SchedulingConfig = {
  defaultTimezone: SchedulingHelpers.getUserTimezone(),
  executionBuffer: 5,
  maxConcurrentExecutions: 10,
  retryAttempts: 3,
  retryDelay: 5,
  enableNotifications: true,
  enablePriceProtection: true,
  maxSlippage: 2.0
};

const DEFAULT_FILTERS: FilterOptions = {};

const DEFAULT_SORT: SortOptions = {
  field: 'scheduledAt',
  direction: 'asc'
};

export function useScheduledTrading(): UseScheduledTradingReturn {
  const [trades, setTrades] = useState<ScheduledTrade[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [config, setConfig] = useState<SchedulingConfig>(DEFAULT_CONFIG);
  const [filters, setFiltersState] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [sort, setSortState] = useState<SortOptions>(DEFAULT_SORT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [timezone, setTimezoneState] = useState<TimezoneInfo>(
    SchedulingHelpers.getTimezoneInfo(DEFAULT_CONFIG.defaultTimezone)
  );

  // Initialize data
  useEffect(() => {
    loadInitialData();
    startPolling();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Load initial data
  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTrades(),
        loadNotifications(),
        loadConfig()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Start polling for updates
  const startPolling = () => {
    intervalRef.current = setInterval(async () => {
      await checkPendingTrades();
      await checkMarketConditions();
    }, 60000); // Check every minute
  };

  // Load trades from API
  const loadTrades = async () => {
    // Simulate API call
    const mockTrades: ScheduledTrade[] = [
      {
        id: '1',
        userId: 'user1',
        type: 'buy',
        amount: 100,
        price: 50.25,
        token: {
          symbol: 'SOL',
          name: 'Solana',
          decimals: 9
        },
        status: 'pending',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        timezone: config.defaultTimezone,
        metadata: {
          notes: 'Regular investment',
          priority: 'medium',
          tags: ['investment', 'solana']
        }
      }
    ];
    setTrades(mockTrades);
  };

  // Load notifications
  const loadNotifications = async () => {
    // Simulate API call
    const mockNotifications: AlertNotification[] = [];
    setNotifications(mockNotifications);
  };

  // Load configuration
  const loadConfig = async () => {
    // Simulate API call
    setConfig(DEFAULT_CONFIG);
  };

  // Check pending trades for execution
  const checkPendingTrades = useCallback(async () => {
    const now = new Date();
    const pendingTrades = trades.filter(trade => 
      trade.status === 'pending' && 
      trade.scheduledAt <= now
    );

    for (const trade of pendingTrades) {
      try {
        await executeTrade(trade.id);
      } catch (err) {
        console.error(`Failed to execute trade ${trade.id}:`, err);
      }
    }
  }, [trades]);

  // Check market conditions for conditional trades
  const checkMarketConditions = useCallback(async () => {
    const conditionalTrades = trades.filter(trade => 
      trade.status === 'pending' && 
      trade.conditions && 
      trade.conditions.length > 0
    );

    for (const trade of conditionalTrades) {
      try {
        const marketData = await fetchMarketData(trade.token.symbol);
        const shouldExecute = SchedulingHelpers.evaluateAllConditions(
          trade.conditions, 
          marketData
        );

        if (shouldExecute) {
          await executeTrade(trade.id);
        }
      } catch (err) {
        console.error(`Failed to check conditions for trade ${trade.id}:`, err);
      }
    }
  }, [trades]);

  // Fetch market data
  const fetchMarketData = async (tokenSymbol: string) => {
    // Simulate API call
    return {
      timestamp: new Date(),
      price: 50.25,
      volume: 1000000,
      marketCap: 25000000000,
      indicators: {
        rsi: 65,
        macd: {
          signal: 0.5,
          histogram: 0.2
        }
      }
    };
  };

  // CRUD Operations
  const createTrade = useCallback(async (tradeData: Partial<ScheduledTrade>) => {
    setLoading(true);
    setError(null);

    try {
      const validation = SchedulingHelpers.validateScheduledTrade(tradeData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const newTrade: ScheduledTrade = {
        id: Date.now().toString(),
        userId: 'user1',
        type: tradeData.type || 'buy',
        amount: tradeData.amount || 0,
        price: tradeData.price,
        token: tradeData.token || { symbol: 'SOL', name: 'Solana', decimals: 9 },
        status: 'pending',
        scheduledAt: tradeData.scheduledAt || new Date(),
        timezone: tradeData.timezone || config.defaultTimezone,
        recurrence: tradeData.recurrence,
        conditions: tradeData.conditions,
        metadata: tradeData.metadata
      };

      setTrades(prev => [...prev, newTrade]);
      
      // Send notification
      if (config.enableNotifications) {
        await sendNotification({
          type: 'schedule_reminder',
          title: 'Trade Scheduled',
          message: SchedulingHelpers.generateNotificationMessage(newTrade),
          timestamp: new Date(),
          read: false,
          metadata: { tradeId: newTrade.id }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trade');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [config]);

  const updateTrade = useCallback(async (id: string, updates: Partial<ScheduledTrade>) => {
    setLoading(true);
    setError(null);

    try {
      setTrades(prev => prev.map(trade => 
        trade.id === id ? { ...trade, ...updates } : trade
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trade');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelTrade = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await updateTrade(id, { status: 'cancelled' });
      
      if (config.enableNotifications) {
        await sendNotification({
          type: 'execution_failed',
          title: 'Trade Cancelled',
          message: `Trade ${id} has been cancelled`,
          timestamp: new Date(),
          read: false,
          metadata: { tradeId: id }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel trade');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateTrade, config]);

  const executeTrade = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const trade = trades.find(t => t.id === id);
      if (!trade) {
        throw new Error('Trade not found');
      }

      // Simulate execution
      const executionPrice = trade.price || 50.25;
      const fees = trade.amount * 0.001; // 0.1% fee

      await updateTrade(id, {
        status: 'executed',
        executedAt: new Date(),
        performance: {
          totalExecuted: 1,
          successfulExecutions: 1,
          failedExecutions: 0,
          averageExecutionPrice: executionPrice,
          totalVolume: trade.amount,
          profitLoss: 0, // Calculate based on current price
          profitLossPercentage: 0,
          lastExecutionDate: new Date(),
          winRate: 100
        }
      });

      // Handle recurrence
      if (trade.recurrence) {
        const nextDate = SchedulingHelpers.getNextExecutionDate(
          trade.scheduledAt,
          trade.recurrence,
          trade.timezone
        );

        if (nextDate) {
          await createTrade({
            ...trade,
            id: undefined,
            scheduledAt: nextDate,
            recurrence: {
              ...trade.recurrence,
              executionCount: (trade.recurrence.executionCount || 0) + 1
            }
          });
        }
      }

      if (config.enableNotifications) {
        await sendNotification({
          type: 'execution_success',
          title: 'Trade Executed',
          message: `Successfully executed ${trade.type} order for ${trade.amount} ${trade.token.symbol}`,
          timestamp: new Date(),
          read: false,
          metadata: { tradeId: id }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute trade');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [trades, updateTrade, createTrade, config]);

  const pauseTrade = useCallback(async (id: string) => {
    // Implementation for pausing trades
    console.log('Pausing trade:', id);
  }, []);

  const resumeTrade = useCallback(async (id: string) => {
    // Implementation for resuming trades
    console.log('Resuming trade:', id);
  }, []);

  // Recurrence operations
  const addRecurrence = useCallback(async (tradeId: string, pattern: RecurrencePattern) => {
    await updateTrade(tradeId, { recurrence: pattern });
  }, [updateTrade]);

  const removeRecurrence = useCallback(async (tradeId: string) => {
    await updateTrade(tradeId, { recurrence: undefined });
  }, [updateTrade]);

  const updateRecurrence = useCallback(async (tradeId: string, pattern: RecurrencePattern) => {
    await updateTrade(tradeId, { recurrence: pattern });
  }, [updateTrade]);

  // Condition operations
  const addCondition = useCallback(async (tradeId: string, condition: ConditionalRule) => {
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return;

    const updatedConditions = [...(trade.conditions || []), condition];
    await updateTrade(tradeId, { conditions: updatedConditions });
  }, [trades, updateTrade]);

  const updateCondition = useCallback(async (tradeId: string, conditionId: string, condition: ConditionalRule) => {
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return;

    const updatedConditions = (trade.conditions || []).map(c => 
      c.id === conditionId ? condition : c
    );
    await updateTrade(tradeId, { conditions: updatedConditions });
  }, [trades, updateTrade]);

  const removeCondition = useCallback(async (tradeId: string, conditionId: string) => {
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return;

    const updatedConditions = (trade.conditions || []).filter(c => c.id !== conditionId);
    await updateTrade(tradeId, { conditions: updatedConditions });
  }, [trades, updateTrade]);

  // Filtering and sorting
  const setFilters = useCallback((newFilters: FilterOptions) => {
    setFiltersState(newFilters);
  }, []);

  const setSort = useCallback((newSort: SortOptions) => {
    setSortState(newSort);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Timezone operations
  const updateTimezone = useCallback((newTimezone: string) => {
    setTimezoneState(SchedulingHelpers.getTimezoneInfo(newTimezone));
    setConfig(prev => ({ ...prev, defaultTimezone: newTimezone }));
  }, []);

  // Notification operations
  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const clearNotifications = useCallback(async () => {
    setNotifications([]);
  }, []);

  const sendNotification = async (notification: Omit<AlertNotification, 'id' | 'userId'>) => {
    const newNotification: AlertNotification = {
      id: Date.now().toString(),
      userId: 'user1',
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Utilities
  const refreshTrades = useCallback(async () => {
    await loadTrades();
  }, []);

  const exportTrades = useCallback(() => {
    const dataStr = JSON.stringify(trades, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `scheduled-trades-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [trades]);

  const importTrades = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importedTrades = JSON.parse(text) as ScheduledTrade[];
      
      // Validate imported trades
      for (const trade of importedTrades) {
        const validation = SchedulingHelpers.validateScheduledTrade(trade);
        if (!validation.isValid) {
          throw new Error(`Invalid trade data: ${validation.errors.join(', ')}`);
        }
      }
      
      setTrades(prev => [...prev, ...importedTrades]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import trades');
      throw err;
    }
  }, []);

  // Computed values
  const filteredTrades = SchedulingHelpers.filterTrades(trades, filters);
  const sortedTrades = SchedulingHelpers.sortTrades(filteredTrades, sort);
  const calendarEvents = SchedulingHelpers.generateCalendarEvents(sortedTrades, timezone.name);

  const stats: SchedulingStats = {
    totalScheduled: trades.length,
    pendingExecutions: trades.filter(t => t.status === 'pending').length,
    completedToday: trades.filter(t => {
      const today = new Date();
      return t.status === 'executed' && 
             t.executedAt && 
             t.executedAt.toDateString() === today.toDateString();
    }).length,
    successRate: trades.length > 0 
      ? (trades.filter(t => t.status === 'executed').length / trades.length) * 100 
      : 0,
    averageExecutionTime: 0, // Calculate from execution history
    totalVolume24h: trades
      .filter(t => t.status === 'executed')
      .reduce((sum, t) => sum + t.amount, 0),
    activeRecurringOrders: trades.filter(t => t.recurrence).length
  };

  return {
    // State
    trades: sortedTrades,
    calendarEvents,
    notifications,
    stats,
    timezone,
    config,
    filters,
    sort,
    loading,
    error,

    // Actions
    createTrade,
    updateTrade,
    cancelTrade,
    executeTrade,
    pauseTrade,
    resumeTrade,

    // Recurrence
    addRecurrence,
    removeRecurrence,
    updateRecurrence,

    // Conditions
    addCondition,
    updateCondition,
    removeCondition,

    // Filtering and sorting
    setFilters,
    setSort,
    clearFilters,

    // Timezone
    updateTimezone,

    // Notifications
    markNotificationRead,
    clearNotifications,

    // Utilities
    refreshTrades,
    exportTrades,
    importTrades
  };
}
