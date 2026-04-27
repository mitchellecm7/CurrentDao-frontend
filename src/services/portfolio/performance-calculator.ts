import { Portfolio, PerformanceMetrics, ProfitLossData, Trade } from '../../types/portfolio';

export class PerformanceCalculator {
  public static calculateMetrics(portfolio: Portfolio): PerformanceMetrics {
    const { trades, assets } = portfolio;
    const totalReturn = portfolio.totalReturn;
    const totalReturnPercentage = portfolio.returnPercentage;
    
    // Simplified Sharpe Ratio calculation (assuming risk-free rate of 0)
    const returns = trades.map(t => (t.totalValue - (t.price * t.quantity)) / (t.price * t.quantity));
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length || 0;
    const stdDev = Math.sqrt(returns.map(r => Math.pow(r - avgReturn, 2)).reduce((a, b) => a + b, 0) / returns.length) || 0;
    const sharpeRatio = stdDev === 0 ? 0 : (avgReturn / stdDev) * Math.sqrt(252); // Annualized

    const winTrades = trades.filter(t => t.totalValue > (t.price * t.quantity));
    const lossTrades = trades.filter(t => t.totalValue <= (t.price * t.quantity));

    return {
      totalReturn,
      totalReturnPercentage,
      annualizedReturn: totalReturnPercentage * (365 / this.getDaysSince(portfolio.createdAt)),
      sharpeRatio,
      volatility: stdDev,
      maxDrawdown: this.calculateMaxDrawdown(trades),
      beta: 1.1, // Mock beta
      alpha: 0.05, // Mock alpha
      winRate: (winTrades.length / trades.length) * 100 || 0,
      profitFactor: this.calculateProfitFactor(winTrades, lossTrades),
      averageWin: winTrades.reduce((a, b) => a + (b.totalValue - b.price * b.quantity), 0) / winTrades.length || 0,
      averageLoss: Math.abs(lossTrades.reduce((a, b) => a + (b.totalValue - b.price * b.quantity), 0) / lossTrades.length) || 0,
      largestWin: Math.max(...trades.map(t => t.totalValue - t.price * t.quantity), 0),
      largestLoss: Math.min(...trades.map(t => t.totalValue - t.price * t.quantity), 0),
      totalTrades: trades.length,
      winningTrades: winTrades.length,
      losingTrades: lossTrades.length,
    };
  }

  public static calculatePnL(portfolio: Portfolio): ProfitLossData {
    const unrealizedPnL = portfolio.assets.reduce((sum, asset) => 
      sum + (asset.currentPrice - asset.averageBuyPrice) * asset.quantity, 0);
    
    const realizedPnL = portfolio.trades.reduce((sum, trade) => 
      sum + (trade.totalValue - (trade.price * trade.quantity)), 0);

    return {
      realizedPnL,
      unrealizedPnL,
      totalPnL: realizedPnL + unrealizedPnL,
      dailyPnL: [], // Historical data would go here
      monthlyPnL: [],
      yearlyPnL: [],
      pnlByAsset: portfolio.assets.reduce((acc, asset) => ({
        ...acc,
        [asset.symbol]: (asset.currentPrice - asset.averageBuyPrice) * asset.quantity
      }), {}),
      pnlByAssetType: portfolio.assets.reduce((acc, asset) => ({
        ...acc,
        [asset.type]: (acc[asset.type] || 0) + (asset.currentPrice - asset.averageBuyPrice) * asset.quantity
      }), {} as Record<string, number>),
    };
  }

  private static getDaysSince(date: Date): number {
    return Math.max(1, (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  }

  private static calculateMaxDrawdown(trades: Trade[]): number {
    let peak = -Infinity;
    let maxDrawdown = 0;
    let currentBalance = 0;

    trades.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).forEach(t => {
      currentBalance += (t.totalValue - t.price * t.quantity);
      if (currentBalance > peak) peak = currentBalance;
      const drawdown = peak - currentBalance;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    return peak === 0 ? 0 : (maxDrawdown / peak) * 100;
  }

  private static calculateProfitFactor(wins: Trade[], losses: Trade[]): number {
    const grossProfit = wins.reduce((a, b) => a + (b.totalValue - b.price * b.quantity), 0);
    const grossLoss = Math.abs(losses.reduce((a, b) => a + (b.totalValue - b.price * b.quantity), 0));
    return grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
  }
}
