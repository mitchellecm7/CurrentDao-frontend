import { useState, useEffect, useMemo } from 'react';
import { Portfolio, PortfolioAnalytics } from '../types/portfolio';
import { PerformanceCalculator } from '../services/portfolio/performance-calculator';
import { RiskModels } from '../services/portfolio/risk-models';
import { DiversificationAnalysis } from '../utils/portfolio/diversification-analysis';

export const usePortfolioManagement = (portfolioId: string) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock fetching portfolio data
    const mockPortfolio: Portfolio = {
      id: portfolioId,
      name: "Green Energy Fund",
      totalValue: 125400.50,
      totalInvested: 98000.00,
      totalReturn: 27400.50,
      returnPercentage: 27.96,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date(),
      assets: [
        { id: '1', symbol: 'SOL-A', name: 'Solar Asset A', type: 'solar', quantity: 500, averageBuyPrice: 45.20, currentPrice: 58.40, totalValue: 29200, totalReturn: 6600, returnPercentage: 29.2, allocation: 23.28 },
        { id: '2', symbol: 'WIN-B', name: 'Wind Farm B', type: 'wind', quantity: 1200, averageBuyPrice: 12.80, currentPrice: 15.60, totalValue: 18720, totalReturn: 3360, returnPercentage: 21.8, allocation: 14.93 },
        { id: '3', symbol: 'HYD-C', name: 'Hydro Station C', type: 'hydro', quantity: 50, averageBuyPrice: 850, currentPrice: 920, totalValue: 46000, totalReturn: 3500, returnPercentage: 8.2, allocation: 36.68 },
      ],
      trades: [] // In a real app, this would be populated
    };

    setTimeout(() => {
      setPortfolio(mockPortfolio);
      setIsLoading(false);
    }, 1000);
  }, [portfolioId]);

  const analytics = useMemo((): PortfolioAnalytics | null => {
    if (!portfolio) return null;

    const metrics = PerformanceCalculator.calculateMetrics(portfolio);
    const pnl = PerformanceCalculator.calculatePnL(portfolio);
    const allocation = DiversificationAnalysis.analyze(portfolio);

    return {
      portfolio,
      metrics,
      profitLoss: pnl,
      allocation,
      statistics: {
        totalTrades: portfolio.trades.length,
        buyTrades: 0,
        sellTrades: 0,
        averageTradeSize: 0,
        averageHoldingPeriod: 0,
        tradeFrequency: 0,
        mostTradedAsset: '',
        bestPerformingAsset: 'SOL-A',
        worstPerformingAsset: 'HYD-C',
        tradingVolume: 0,
        feesPaid: 0,
        taxLiability: 0
      },
      taxReports: [],
      benchmarks: []
    };
  }, [portfolio]);

  const riskAssessment = useMemo(() => {
    if (!portfolio) return null;
    return {
      var: RiskModels.calculateVaR(portfolio),
      cvar: RiskModels.calculateCVaR(portfolio),
      concentrationScore: RiskModels.getConcentrationScore(portfolio),
      stressTests: {
        grid_failure: RiskModels.runStressTest(portfolio, 'grid_failure'),
        solar_storm: RiskModels.runStressTest(portfolio, 'solar_storm'),
        market_crash: RiskModels.runStressTest(portfolio, 'market_crash'),
      }
    };
  }, [portfolio]);

  return {
    portfolio,
    analytics,
    riskAssessment,
    isLoading,
    rebalancingSuggestions: analytics ? DiversificationAnalysis.getRebalancingSuggestions(analytics.allocation) : []
  };
};
