export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  type: 'trend' | 'arbitrage' | 'mean_reversion' | 'grid';
  indicators: TechnicalIndicator[];
  conditions: StrategyCondition[];
  riskSettings: RiskSettings;
  createdAt: number;
  author: string;
  rating: number;
  usageCount: number;
}

export interface TechnicalIndicator {
  id: string;
  name: string;
  type: 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'Bollinger';
  params: Record<string, number>;
}

export interface StrategyCondition {
  id: string;
  indicatorId: string;
  operator: '>' | '<' | '==' | 'crosses_above' | 'crosses_below';
  value: number | string;
  action: 'buy' | 'sell' | 'close';
}

export interface RiskSettings {
  maxPositionSize: number;
  stopLoss: number;
  takeProfit: number;
  maxDrawdown: number;
  dailyLossLimit: number;
}

export interface TradingBot {
  id: string;
  name: string;
  strategyId: string;
  status: 'active' | 'paused' | 'stopped' | 'error';
  mode: 'live' | 'paper' | 'sandbox';
  performance: BotPerformance;
  logs: BotLog[];
  lastRuntime: number;
}

export interface BotPerformance {
  totalPnL: number;
  roi: number;
  winRate: number;
  tradesCount: number;
  sharpeRatio: number;
  equity: number[];
}

export interface BotLog {
  timestamp: number;
  type: 'info' | 'warning' | 'error' | 'trade';
  message: string;
  payload?: any;
}

export interface BacktestResult {
  strategyId: string;
  startDate: number;
  endDate: number;
  initialBalance: number;
  finalBalance: number;
  totalPnL: number;
  maxDrawdown: number;
  trades: any[];
}
