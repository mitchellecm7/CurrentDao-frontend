import { Portfolio, DrawdownAnalysis, DrawdownData, DrawdownPeriod, DrawdownAlert } from '../../types/portfolio';

export class DrawdownCalculator {
  static calculateDrawdownAnalysis(
    portfolio: Portfolio,
    historicalValues: { timestamp: Date; value: number }[],
    alertThresholds: number[] = [10, 20, 30]
  ): DrawdownAnalysis {
    if (historicalValues.length === 0) {
      return this.getEmptyDrawdownAnalysis();
    }

    const timeSeries = this.calculateTimeSeries(historicalValues);
    const drawdownPeriods = this.identifyDrawdownPeriods(timeSeries);
    const currentDrawdown = this.getCurrentDrawdown(timeSeries);
    const maxDrawdown = this.getMaxDrawdown(timeSeries);
    const alerts = this.checkAlerts(currentDrawdown, alertThresholds);

    return {
      currentDrawdown: currentDrawdown.percentage,
      currentDrawdownDollar: currentDrawdown.amount,
      maxDrawdown: maxDrawdown.percentage,
      maxDrawdownDollar: maxDrawdown.amount,
      maxDrawdownDate: maxDrawdown.date,
      averageDrawdown: this.calculateAverageDrawdown(timeSeries),
      drawdownPeriods,
      underwaterDays: this.calculateUnderwaterDays(drawdownPeriods),
      recoveryDays: this.calculateRecoveryDays(drawdownPeriods),
      alerts,
      timeSeries
    };
  }

  private static calculateTimeSeries(historicalValues: { timestamp: Date; value: number }[]): DrawdownData[] {
    let peakValue = historicalValues[0].value;
    let peakDate = historicalValues[0].timestamp;
    const timeSeries: DrawdownData[] = [];

    historicalValues.forEach((point, index) => {
      if (point.value > peakValue) {
        peakValue = point.value;
        peakDate = point.timestamp;
      }

      const drawdown = peakValue - point.value;
      const drawdownPercentage = peakValue > 0 ? (drawdown / peakValue) * 100 : 0;
      const daysSincePeak = Math.floor((point.timestamp.getTime() - peakDate.getTime()) / (1000 * 60 * 60 * 24));

      timeSeries.push({
        timestamp: point.timestamp,
        portfolioValue: point.value,
        drawdown,
        drawdownPercentage,
        isUnderwater: drawdownPercentage > 0,
        peakValue,
        daysSincePeak
      });
    });

    return timeSeries;
  }

  private static identifyDrawdownPeriods(timeSeries: DrawdownData[]): DrawdownPeriod[] {
    const periods: DrawdownPeriod[] = [];
    let currentPeriod: Partial<DrawdownPeriod> | null = null;

    for (let i = 0; i < timeSeries.length; i++) {
      const current = timeSeries[i];
      
      if (current.isUnderwater && !currentPeriod) {
        // Start of a new drawdown period
        currentPeriod = {
          startDate: current.timestamp,
          startValue: current.portfolioValue,
          peakValue: current.peakValue,
          drawdownAmount: current.drawdown,
          drawdownPercentage: current.drawdownPercentage,
          recovered: false
        };
      } else if (currentPeriod) {
        // Update trough if we're still in drawdown
        if (current.drawdown > (currentPeriod.troughValue || 0)) {
          currentPeriod.troughValue = current.peakValue - current.drawdown;
          currentPeriod.drawdownAmount = current.drawdown;
          currentPeriod.drawdownPercentage = current.drawdownPercentage;
        }

        // Check if we've recovered
        if (!current.isUnderwater) {
          currentPeriod.endDate = current.timestamp;
          currentPeriod.endValue = current.portfolioValue;
          currentPeriod.duration = Math.floor((current.timestamp.getTime() - currentPeriod.startDate!.getTime()) / (1000 * 60 * 60 * 24));
          currentPeriod.recoveryTime = currentPeriod.duration;
          currentPeriod.recovered = true;
          periods.push(currentPeriod as DrawdownPeriod);
          currentPeriod = null;
        }
      }
    }

    // Handle ongoing drawdown period
    if (currentPeriod) {
      const lastPoint = timeSeries[timeSeries.length - 1];
      currentPeriod.endDate = lastPoint.timestamp;
      currentPeriod.endValue = lastPoint.portfolioValue;
      currentPeriod.duration = Math.floor((lastPoint.timestamp.getTime() - currentPeriod.startDate!.getTime()) / (1000 * 60 * 60 * 24));
      currentPeriod.recoveryTime = 0; // Not recovered yet
      currentPeriod.recovered = false;
      periods.push(currentPeriod as DrawdownPeriod);
    }

    return periods;
  }

  private static getCurrentDrawdown(timeSeries: DrawdownData[]): { amount: number; percentage: number } {
    if (timeSeries.length === 0) return { amount: 0, percentage: 0 };
    
    const current = timeSeries[timeSeries.length - 1];
    return {
      amount: current.drawdown,
      percentage: current.drawdownPercentage
    };
  }

  private static getMaxDrawdown(timeSeries: DrawdownData[]): { amount: number; percentage: number; date: Date } {
    if (timeSeries.length === 0) return { amount: 0, percentage: 0, date: new Date() };
    
    let maxDrawdown = 0;
    let maxDrawdownAmount = 0;
    let maxDrawdownDate = timeSeries[0].timestamp;

    timeSeries.forEach(point => {
      if (point.drawdownPercentage > maxDrawdown) {
        maxDrawdown = point.drawdownPercentage;
        maxDrawdownAmount = point.drawdown;
        maxDrawdownDate = point.timestamp;
      }
    });

    return {
      amount: maxDrawdownAmount,
      percentage: maxDrawdown,
      date: maxDrawdownDate
    };
  }

  private static calculateAverageDrawdown(timeSeries: DrawdownData[]): number {
    const underwaterPoints = timeSeries.filter(point => point.isUnderwater);
    if (underwaterPoints.length === 0) return 0;
    
    const totalDrawdown = underwaterPoints.reduce((sum, point) => sum + point.drawdownPercentage, 0);
    return totalDrawdown / underwaterPoints.length;
  }

  private static calculateUnderwaterDays(periods: DrawdownPeriod[]): number {
    return periods.reduce((total, period) => total + period.duration, 0);
  }

  private static calculateRecoveryDays(periods: DrawdownPeriod[]): number {
    return periods
      .filter(period => period.recovered)
      .reduce((total, period) => total + period.recoveryTime, 0);
  }

  private static checkAlerts(currentDrawdown: { amount: number; percentage: number }, thresholds: number[]): DrawdownAlert[] {
    const alerts: DrawdownAlert[] = [];
    
    thresholds.forEach((threshold, index) => {
      if (currentDrawdown.percentage >= threshold) {
        alerts.push({
          id: `alert-${threshold}-${Date.now()}`,
          threshold,
          currentValue: currentDrawdown.percentage,
          triggeredAt: new Date(),
          acknowledged: false
        });
      }
    });

    return alerts;
  }

  private static getEmptyDrawdownAnalysis(): DrawdownAnalysis {
    return {
      currentDrawdown: 0,
      currentDrawdownDollar: 0,
      maxDrawdown: 0,
      maxDrawdownDollar: 0,
      maxDrawdownDate: new Date(),
      averageDrawdown: 0,
      drawdownPeriods: [],
      underwaterDays: 0,
      recoveryDays: 0,
      alerts: [],
      timeSeries: []
    };
  }

  static generateMockHistoricalValues(portfolio: Portfolio, days: number = 365): { timestamp: Date; value: number }[] {
    const values: { timestamp: Date; value: number }[] = [];
    const now = new Date();
    let currentValue = portfolio.totalInvested;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      
      // Simulate market movements with some volatility
      const dailyReturn = (Math.random() - 0.48) * 0.04; // Slight negative bias for drawdowns
      currentValue = currentValue * (1 + dailyReturn);
      
      // Add some major drawdown events
      if (i === 200) currentValue *= 0.85; // 15% drop
      if (i === 100) currentValue *= 0.75; // Additional 25% drop from previous
      if (i === 50) currentValue *= 1.10; // Partial recovery
      
      values.push({
        timestamp: date,
        value: currentValue
      });
    }

    // Ensure final value matches current portfolio value
    if (values.length > 0) {
      values[values.length - 1].value = portfolio.totalValue;
    }

    return values;
  }
}
