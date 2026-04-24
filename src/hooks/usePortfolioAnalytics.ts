import { useState, useEffect, useMemo } from 'react';
import { PortfolioAnalytics, Trade, Portfolio, PortfolioAsset, ExportOptions } from '../types/portfolio';
import { PortfolioCalculator } from '../utils/portfolioCalculations';

export const usePortfolioAnalytics = (portfolioId?: string) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        setError(null);

        const mockPortfolio: Portfolio = {
          id: portfolioId || 'portfolio-1',
          name: 'Energy Trading Portfolio',
          totalValue: 1250000,
          totalInvested: 1000000,
          totalReturn: 250000,
          returnPercentage: 25,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date(),
          assets: generateMockAssets(),
          trades: generateMockTrades()
        };

        const mockPrices: Record<string, number> = {
          'SOLAR': 150,
          'WIND': 120,
          'HYDRO': 80,
          'NUCLEAR': 200,
          'FOSSIL': 60,
          'BATTERY': 90,
          'GRID': 45
        };

        setPortfolio(mockPortfolio);
        setTrades(mockPortfolio.trades);
        setCurrentPrices(mockPrices);
      } catch (err) {
        setError('Failed to fetch portfolio data');
        console.error('Portfolio data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [portfolioId]);

  const analytics = useMemo(() => {
    if (!portfolio || !trades.length) return null;

    const metrics = PortfolioCalculator.calculateReturns(trades, currentPrices);
    const profitLoss = PortfolioCalculator.calculateProfitLoss(trades, currentPrices);
    const allocation = PortfolioCalculator.calculateAssetAllocation(portfolio.assets);
    const statistics = PortfolioCalculator.calculateTradingStatistics(trades);
    
    const taxReports = [
      PortfolioCalculator.generateTaxReports(trades, new Date().getFullYear()),
      PortfolioCalculator.generateTaxReports(trades, new Date().getFullYear() - 1)
    ];

    const benchmarks = [
      PortfolioCalculator.compareWithBenchmark(metrics.totalReturnPercentage, 12, metrics.volatility, 15),
      PortfolioCalculator.compareWithBenchmark(metrics.totalReturnPercentage, 8, metrics.volatility, 12)
    ];

    return {
      portfolio,
      metrics,
      profitLoss,
      allocation,
      statistics,
      taxReports,
      benchmarks
    } as PortfolioAnalytics;
  }, [portfolio, trades, currentPrices]);

  const exportData = async (options: ExportOptions): Promise<string> => {
    if (!analytics) throw new Error('No analytics data available');

    const exportData = {
      portfolio: analytics.portfolio,
      metrics: analytics.metrics,
      profitLoss: analytics.profitLoss,
      allocation: analytics.allocation,
      statistics: analytics.statistics,
      taxReports: analytics.taxReports,
      benchmarks: analytics.benchmarks,
      exportDate: new Date().toISOString(),
      options
    };

    switch (options.format) {
      case 'json':
        return JSON.stringify(exportData, null, 2);
      
      case 'csv':
        return convertToCSV(exportData, options);
      
      case 'pdf':
        return await convertToPDF(exportData, options);
      
      case 'excel':
        return await convertToExcel(exportData, options);
      
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (portfolio) {
        const updatedPrices = { ...currentPrices };
        Object.keys(updatedPrices).forEach(key => {
          updatedPrices[key] = updatedPrices[key] * (1 + (Math.random() - 0.5) * 0.02);
        });
        setCurrentPrices(updatedPrices);
      }
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const addTrade = async (trade: Omit<Trade, 'id'>): Promise<void> => {
    try {
      const newTrade: Trade = {
        ...trade,
        id: `trade-${Date.now()}`,
        timestamp: new Date()
      };

      setTrades(prev => [...prev, newTrade]);
      
      if (portfolio) {
        const updatedAssets = updatePortfolioAssets(portfolio.assets, newTrade, currentPrices);
        setPortfolio(prev => prev ? {
          ...prev,
          assets: updatedAssets,
          updatedAt: new Date()
        } : null);
      }
    } catch (err) {
      setError('Failed to add trade');
      throw err;
    }
  };

  const updateTrade = async (tradeId: string, updates: Partial<Trade>): Promise<void> => {
    try {
      setTrades(prev => prev.map(trade => 
        trade.id === tradeId ? { ...trade, ...updates } : trade
      ));
    } catch (err) {
      setError('Failed to update trade');
      throw err;
    }
  };

  const deleteTrade = async (tradeId: string): Promise<void> => {
    try {
      setTrades(prev => prev.filter(trade => trade.id !== tradeId));
    } catch (err) {
      setError('Failed to delete trade');
      throw err;
    }
  };

  return {
    analytics,
    loading,
    error,
    trades,
    portfolio,
    currentPrices,
    exportData,
    refreshData,
    addTrade,
    updateTrade,
    deleteTrade
  };
};

function generateMockAssets(): PortfolioAsset[] {
  return [
    {
      id: 'asset-1',
      symbol: 'SOLAR',
      name: 'Solar Energy Corp',
      type: 'solar',
      quantity: 1000,
      averageBuyPrice: 140,
      currentPrice: 150,
      totalValue: 150000,
      totalReturn: 10000,
      returnPercentage: 7.14,
      allocation: 12
    },
    {
      id: 'asset-2',
      symbol: 'WIND',
      name: 'Wind Power Inc',
      type: 'wind',
      quantity: 2000,
      averageBuyPrice: 110,
      currentPrice: 120,
      totalValue: 240000,
      totalReturn: 20000,
      returnPercentage: 9.09,
      allocation: 19.2
    },
    {
      id: 'asset-3',
      symbol: 'HYDRO',
      name: 'Hydroelectric Systems',
      type: 'hydro',
      quantity: 1500,
      averageBuyPrice: 75,
      currentPrice: 80,
      totalValue: 120000,
      totalReturn: 7500,
      returnPercentage: 6.67,
      allocation: 9.6
    },
    {
      id: 'asset-4',
      symbol: 'NUCLEAR',
      name: 'Nuclear Energy Ltd',
      type: 'nuclear',
      quantity: 500,
      averageBuyPrice: 180,
      currentPrice: 200,
      totalValue: 100000,
      totalReturn: 10000,
      returnPercentage: 11.11,
      allocation: 8
    },
    {
      id: 'asset-5',
      symbol: 'FOSSIL',
      name: 'Fossil Fuel Corp',
      type: 'fossil',
      quantity: 3000,
      averageBuyPrice: 55,
      currentPrice: 60,
      totalValue: 180000,
      totalReturn: 15000,
      returnPercentage: 9.09,
      allocation: 14.4
    },
    {
      id: 'asset-6',
      symbol: 'BATTERY',
      name: 'Battery Storage Tech',
      type: 'battery',
      quantity: 1200,
      averageBuyPrice: 85,
      currentPrice: 90,
      totalValue: 108000,
      totalReturn: 6000,
      returnPercentage: 5.88,
      allocation: 8.64
    },
    {
      id: 'asset-7',
      symbol: 'GRID',
      name: 'Smart Grid Solutions',
      type: 'grid',
      quantity: 2500,
      averageBuyPrice: 40,
      currentPrice: 45,
      totalValue: 112500,
      totalReturn: 12500,
      returnPercentage: 12.5,
      allocation: 9
    }
  ];
}

function generateMockTrades(): Trade[] {
  const trades: Trade[] = [];
  const assets = ['SOLAR', 'WIND', 'HYDRO', 'NUCLEAR', 'FOSSIL', 'BATTERY', 'GRID'];
  const assetTypes: ('solar' | 'wind' | 'hydro' | 'nuclear' | 'fossil' | 'battery' | 'grid')[] = 
    ['solar', 'wind', 'hydro', 'nuclear', 'fossil', 'battery', 'grid'];
  
  for (let i = 0; i < 50; i++) {
    const assetIndex = Math.floor(Math.random() * assets.length);
    const isBuy = Math.random() > 0.5;
    const quantity = Math.floor(Math.random() * 500) + 100;
    const price = Math.random() * 100 + 50;
    
    trades.push({
      id: `trade-${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      type: isBuy ? 'buy' : 'sell',
      asset: assets[assetIndex],
      assetType: assetTypes[assetIndex],
      quantity,
      price,
      totalValue: quantity * price,
      fees: price * quantity * 0.001,
      status: 'completed',
      portfolioId: 'portfolio-1'
    });
  }
  
  return trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function updatePortfolioAssets(assets: PortfolioAsset[], trade: Trade, currentPrices: Record<string, number>): PortfolioAsset[] {
  return assets.map(asset => {
    if (asset.symbol === trade.asset) {
      if (trade.type === 'buy') {
        const newQuantity = asset.quantity + trade.quantity;
        const newTotalCost = (asset.averageBuyPrice * asset.quantity) + trade.totalValue;
        const newAveragePrice = newTotalCost / newQuantity;
        const currentPrice = currentPrices[trade.asset] || asset.currentPrice;
        const newTotalValue = newQuantity * currentPrice;
        
        return {
          ...asset,
          quantity: newQuantity,
          averageBuyPrice: newAveragePrice,
          currentPrice,
          totalValue: newTotalValue,
          totalReturn: newTotalValue - newTotalCost,
          returnPercentage: ((newTotalValue - newTotalCost) / newTotalCost) * 100
        };
      } else {
        const newQuantity = Math.max(0, asset.quantity - trade.quantity);
        const currentPrice = currentPrices[trade.asset] || asset.currentPrice;
        const newTotalValue = newQuantity * currentPrice;
        const totalCost = asset.averageBuyPrice * newQuantity;
        
        return {
          ...asset,
          quantity: newQuantity,
          currentPrice,
          totalValue: newTotalValue,
          totalReturn: newTotalValue - totalCost,
          returnPercentage: newQuantity > 0 ? ((newTotalValue - totalCost) / totalCost) * 100 : 0
        };
      }
    }
    return asset;
  });
}

function convertToCSV(data: any, options: ExportOptions): string {
  const headers = ['Metric', 'Value'];
  const rows = [
    ['Total Return', data.metrics.totalReturn.toFixed(2)],
    ['Return %', data.metrics.totalReturnPercentage.toFixed(2)],
    ['Sharpe Ratio', data.metrics.sharpeRatio.toFixed(2)],
    ['Volatility', data.metrics.volatility.toFixed(2)],
    ['Win Rate', data.metrics.winRate.toFixed(2)],
    ['Total Trades', data.metrics.totalTrades.toString()],
    ['Portfolio Value', data.portfolio.totalValue.toFixed(2)]
  ];
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

async function convertToPDF(data: any, options: ExportOptions): Promise<string> {
  return 'PDF export functionality would be implemented here';
}

async function convertToExcel(data: any, options: ExportOptions): Promise<string> {
  return 'Excel export functionality would be implemented here';
}
