import { TradingBot, TradingStrategy, BotLog } from '../../types/bots';
import { orderMatchingEngine } from '../trading/order-matching';

export class StrategyExecutionService {
  private activeBots: Map<string, TradingBot> = new Map();

  public async startBot(bot: TradingBot, strategy: TradingStrategy): Promise<void> {
    this.activeBots.set(bot.id, { ...bot, status: 'active' });
    this.log(bot.id, 'info', `Bot ${bot.name} started with strategy ${strategy.name}`);
    
    // In a real app, this would start a runtime loop
    this.simulationLoop(bot.id);
  }

  public stopBot(botId: string): void {
    const bot = this.activeBots.get(botId);
    if (bot) {
      bot.status = 'stopped';
      this.log(botId, 'info', `Bot ${bot.name} stopped manually`);
    }
  }

  private async simulationLoop(botId: string) {
    const bot = this.activeBots.get(botId);
    if (!bot || bot.status !== 'active') return;

    // Mock strategy logic execution
    const randomSignal = Math.random();
    if (randomSignal > 0.95) {
      this.executeTrade(botId, 'buy');
    } else if (randomSignal < 0.05) {
      this.executeTrade(botId, 'sell');
    }

    setTimeout(() => this.simulationLoop(botId), 5000);
  }

  private executeTrade(botId: string, side: 'buy' | 'sell') {
    const bot = this.activeBots.get(botId);
    if (!bot) return;

    const price = 45.5 + (Math.random() - 0.5);
    const quantity = 10;

    orderMatchingEngine.addOrder({
      id: `bot-order-${Date.now()}`,
      price,
      quantity,
      side,
      type: 'limit',
      timestamp: Date.now(),
      status: 'active',
      userId: botId
    });

    this.log(botId, 'trade', `Executed ${side} order at ${price.toFixed(2)}`);
    bot.performance.tradesCount++;
    bot.performance.totalPnL += (side === 'buy' ? -0.1 : 0.1); // Mock PnL
  }

  private log(botId: string, type: BotLog['type'], message: string) {
    const bot = this.activeBots.get(botId);
    if (bot) {
      bot.logs.unshift({ timestamp: Date.now(), type, message });
      if (bot.logs.length > 100) bot.logs.pop();
    }
  }

  public getBotStatus(botId: string): TradingBot | undefined {
    return this.activeBots.get(botId);
  }
}

export const strategyExecutionService = new StrategyExecutionService();
