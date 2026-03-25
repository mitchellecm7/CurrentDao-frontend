export interface ScheduledTrade {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  amount: number;
  price?: number;
  token: {
    symbol: string;
    name: string;
    decimals: number;
  };
  status: 'pending' | 'executed' | 'cancelled' | 'failed';
  scheduledAt: Date;
  executedAt?: Date;
  timezone: string;
  recurrence?: RecurrencePattern;
  conditions?: ConditionalRule[];
  metadata?: {
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
  };
  performance?: TradePerformance;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // e.g., every 2 weeks, every 3 months
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) for weekly
  dayOfMonth?: number; // 1-31 for monthly
  endDate?: Date;
  maxExecutions?: number;
  executionCount?: number;
}

export interface ConditionalRule {
  id: string;
  type: 'price' | 'volume' | 'market_cap' | 'rsi' | 'macd' | 'custom';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
  value: number | [number, number];
  timeWindow?: number; // in minutes
  isActive: boolean;
  description: string;
}

export interface TimeTrigger {
  id: string;
  name: string;
  type: 'specific_time' | 'market_open' | 'market_close' | 'price_threshold' | 'volume_spike';
  time?: string; // HH:mm format for specific_time
  offset?: number; // minutes before/after market events
  conditions?: ConditionalRule[];
  isActive: boolean;
}

export interface TradePerformance {
  totalExecuted: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionPrice: number;
  totalVolume: number;
  profitLoss: number;
  profitLossPercentage: number;
  lastExecutionDate: Date;
  winRate: number;
}

export interface ScheduledOrder {
  id: string;
  tradeId: string;
  status: 'scheduled' | 'executed' | 'cancelled' | 'paused';
  createdAt: Date;
  scheduledFor: Date;
  modifiedAt?: Date;
  executionHistory: ExecutionHistory[];
}

export interface ExecutionHistory {
  id: string;
  executedAt: Date;
  status: 'success' | 'failed';
  price: number;
  amount: number;
  fees: number;
  error?: string;
  metadata?: {
    gasUsed?: number;
    transactionHash?: string;
    blockNumber?: number;
  };
}

export interface AlertNotification {
  id: string;
  userId: string;
  type: 'execution_success' | 'execution_failed' | 'condition_met' | 'schedule_reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    tradeId?: string;
    orderId?: string;
    conditionId?: string;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  type: 'scheduled_trade' | 'recurring_trade' | 'market_event' | 'reminder';
  status: 'pending' | 'executed' | 'cancelled';
  trade?: ScheduledTrade;
  color?: string;
  description?: string;
}

export interface SchedulingConfig {
  defaultTimezone: string;
  executionBuffer: number; // minutes before scheduled time to prepare
  maxConcurrentExecutions: number;
  retryAttempts: number;
  retryDelay: number; // minutes
  enableNotifications: boolean;
  enablePriceProtection: boolean;
  maxSlippage: number; // percentage
}

export interface MarketCondition {
  timestamp: Date;
  price: number;
  volume: number;
  marketCap: number;
  indicators?: {
    rsi: number;
    macd: {
      signal: number;
      histogram: number;
    };
  };
}

export interface SchedulingStats {
  totalScheduled: number;
  pendingExecutions: number;
  completedToday: number;
  successRate: number;
  averageExecutionTime: number; // seconds
  totalVolume24h: number;
  activeRecurringOrders: number;
}

export interface TimezoneInfo {
  name: string;
  offset: string;
  currentTime: Date;
  marketHours?: {
    open: string;
    close: string;
    timezone: string;
  };
}

export type SchedulingView = 'calendar' | 'list' | 'analytics';

export interface FilterOptions {
  status?: ScheduledTrade['status'][];
  type?: ScheduledTrade['type'][];
  dateRange?: {
    start: Date;
    end: Date;
  };
  token?: string[];
  recurrence?: RecurrencePattern['type'][];
}

export interface SortOptions {
  field: 'scheduledAt' | 'amount' | 'price' | 'status';
  direction: 'asc' | 'desc';
}
