import { RiskSettings, TradingBot } from '../../types/bots';

export class RiskManagementService {
  public static validateTrade(bot: TradingBot, riskSettings: RiskSettings, order: any): boolean {
    // 1. Check position size
    if (order.quantity > riskSettings.maxPositionSize) {
      console.warn(`Order rejected: Quantity ${order.quantity} exceeds maxPositionSize ${riskSettings.maxPositionSize}`);
      return false;
    }

    // 2. Check daily loss limit
    if (Math.abs(bot.performance.totalPnL) > riskSettings.dailyLossLimit && bot.performance.totalPnL < 0) {
      console.warn(`Order rejected: Daily loss limit reached`);
      return false;
    }

    // 3. Check max drawdown
    if (bot.performance.roi < -riskSettings.maxDrawdown) {
      console.warn(`Order rejected: Max drawdown reached`);
      return false;
    }

    return true;
  }

  public static calculatePositionSize(balance: number, riskPercentage: number, stopLoss: number): number {
    return (balance * (riskPercentage / 100)) / stopLoss;
  }
}
