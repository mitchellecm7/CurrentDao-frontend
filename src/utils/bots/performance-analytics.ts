import { BacktestResult, TradingStrategy } from '../../types/bots';

export class PerformanceAnalyticsUtils {
  public static calculateSharpeRatio(returns: number[]): number {
    if (returns.length < 2) return 0;
    const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(returns.map(r => Math.pow(r - avg, 2)).reduce((a, b) => a + b, 0) / returns.length);
    return stdDev === 0 ? 0 : (avg / stdDev) * Math.sqrt(252);
  }

  public static runBacktest(strategy: TradingStrategy, historicalData: any[]): BacktestResult {
    let balance = 10000;
    const initialBalance = balance;
    let maxDrawdown = 0;
    let peak = balance;
    const trades = [];

    // Simple simulation
    historicalData.forEach(candle => {
      // Mock execution: 1% chance of trade per candle
      if (Math.random() > 0.99) {
        const profit = candle.close * (Math.random() - 0.45) * 0.01;
        balance += profit * 100;
        trades.push({ timestamp: candle.timestamp, profit: profit * 100 });
        
        if (balance > peak) peak = balance;
        const drawdown = (peak - balance) / peak;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      }
    });

    return {
      strategyId: strategy.id,
      startDate: historicalData[0]?.timestamp || 0,
      endDate: historicalData[historicalData.length - 1]?.timestamp || 0,
      initialBalance,
      finalBalance: balance,
      totalPnL: balance - initialBalance,
      maxDrawdown: maxDrawdown * 100,
      trades
    };
  }
}
