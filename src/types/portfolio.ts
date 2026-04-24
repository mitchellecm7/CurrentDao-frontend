export interface Trade {
  id: string;
  timestamp: Date;
  type: 'buy' | 'sell';
  asset: string;
  assetType: 'solar' | 'wind' | 'hydro' | 'nuclear' | 'fossil' | 'battery' | 'grid';
  quantity: number;
  price: number;
  totalValue: number;
  fees: number;
  status: 'completed' | 'pending' | 'cancelled';
  portfolioId: string;
}

export interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  createdAt: Date;
  updatedAt: Date;
  assets: PortfolioAsset[];
  trades: Trade[];
}

export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  type: 'solar' | 'wind' | 'hydro' | 'nuclear' | 'fossil' | 'battery' | 'grid';
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  totalReturn: number;
  returnPercentage: number;
  allocation: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercentage: number;
  annualizedReturn: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  beta: number;
  alpha: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
}

export interface ProfitLossData {
  realizedPnL: number;
  unrealizedPnL: number;
  totalPnL: number;
  dailyPnL: number[];
  monthlyPnL: number[];
  yearlyPnL: number[];
  pnlByAsset: Record<string, number>;
  pnlByAssetType: Record<string, number>;
}

export interface AssetAllocation {
  assetType: string;
  value: number;
  percentage: number;
  targetPercentage: number;
  deviation: number;
  assets: PortfolioAsset[];
}

export interface TradingStatistics {
  totalTrades: number;
  buyTrades: number;
  sellTrades: number;
  averageTradeSize: number;
  averageHoldingPeriod: number;
  tradeFrequency: number;
  mostTradedAsset: string;
  bestPerformingAsset: string;
  worstPerformingAsset: string;
  tradingVolume: number;
  feesPaid: number;
  taxLiability: number;
}

export interface TaxReport {
  year: number;
  shortTermGains: number;
  longTermGains: number;
  totalGains: number;
  losses: number;
  netGains: number;
  taxRate: number;
  estimatedTax: number;
  trades: Trade[];
}

export interface BenchmarkComparison {
  benchmark: string;
  portfolioReturn: number;
  benchmarkReturn: number;
  excessReturn: number;
  correlation: number;
  trackingError: number;
  informationRatio: number;
}

export interface PortfolioAnalytics {
  portfolio: Portfolio;
  metrics: PerformanceMetrics;
  profitLoss: ProfitLossData;
  allocation: AssetAllocation[];
  statistics: TradingStatistics;
  taxReports: TaxReport[];
  benchmarks: BenchmarkComparison[];
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'json' | 'excel';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeMetrics: string[];
  includeCharts: boolean;
}
