import { Portfolio, PerformanceMetrics } from '../../types/portfolio';

export class RiskModels {
  /**
   * Value at Risk (VaR) using Variance-Covariance method
   * Estimates the maximum potential loss over a 1-day period with 95% confidence
   */
  public static calculateVaR(portfolio: Portfolio, confidence: number = 0.95): number {
    const dailyVolatility = 0.02; // 2% daily volatility (mock)
    const zScore = 1.645; // For 95% confidence
    return portfolio.totalValue * dailyVolatility * zScore;
  }

  /**
   * Conditional Value at Risk (CVaR)
   * Average loss in the worst (1 - confidence)% cases
   */
  public static calculateCVaR(portfolio: Portfolio, confidence: number = 0.95): number {
    const var95 = this.calculateVaR(portfolio, confidence);
    return var95 * 1.25; // Simple heuristic for mock
  }

  /**
   * Stress Test: Simulate specific market events
   */
  public static runStressTest(portfolio: Portfolio, scenario: 'grid_failure' | 'solar_storm' | 'market_crash'): number {
    const impacts = {
      grid_failure: -0.15, // 15% loss
      solar_storm: -0.08,  // 8% loss
      market_crash: -0.30   // 30% loss
    };
    return portfolio.totalValue * impacts[scenario];
  }

  /**
   * Sharpe Ratio calculation
   */
  public static calculateSharpeRatio(metrics: PerformanceMetrics): number {
    return metrics.sharpeRatio;
  }

  /**
   * Concentration Risk analysis
   */
  public static getConcentrationScore(portfolio: Portfolio): number {
    if (portfolio.assets.length === 0) return 0;
    const squaredAllocations = portfolio.assets.map(a => Math.pow(a.allocation / 100, 2));
    const herfindahlIndex = squaredAllocations.reduce((a, b) => a + b, 0);
    return herfindahlIndex * 100; // 0 (perfect diversification) to 100 (single asset)
  }
}
