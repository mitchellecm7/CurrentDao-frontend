import { useState, useEffect, useCallback } from 'react';
import { TradingBot, TradingStrategy, BacktestResult } from '../types/bots';
import { strategyExecutionService } from '../services/bots/strategy-execution';
import { PerformanceAnalyticsUtils } from '../utils/bots/performance-analytics';

export const useAutomatedTrading = () => {
  const [bots, setBots] = useState<TradingBot[]>([]);
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

  useEffect(() => {
    // Mock initial data
    const mockStrategy: TradingStrategy = {
      id: 'strat-1',
      name: 'Solar Grid Arbitrage',
      description: 'Capitalizes on price differences between regional microgrids.',
      type: 'arbitrage',
      indicators: [],
      conditions: [],
      riskSettings: { maxPositionSize: 100, stopLoss: 5, takeProfit: 10, maxDrawdown: 15, dailyLossLimit: 500 },
      createdAt: Date.now(),
      author: 'CurrentDao Core',
      rating: 4.8,
      usageCount: 1240
    };

    const mockBot: TradingBot = {
      id: 'bot-1',
      name: 'SunRunner Alpha',
      strategyId: 'strat-1',
      status: 'paused',
      mode: 'paper',
      performance: { totalPnL: 1250.40, roi: 12.5, winRate: 64.2, tradesCount: 156, sharpeRatio: 1.8, equity: [1000, 1050, 1030, 1100, 1250] },
      logs: [],
      lastRuntime: Date.now()
    };

    setStrategies([mockStrategy]);
    setBots([mockBot]);
  }, []);

  const startBot = useCallback((botId: string) => {
    const bot = bots.find(b => b.id === botId);
    const strategy = strategies.find(s => s.id === bot?.strategyId);
    if (bot && strategy) {
      strategyExecutionService.startBot(bot, strategy);
      setBots(prev => prev.map(b => b.id === botId ? { ...b, status: 'active' } : b));
    }
  }, [bots, strategies]);

  const stopBot = useCallback((botId: string) => {
    strategyExecutionService.stopBot(botId);
    setBots(prev => prev.map(b => b.id === botId ? { ...b, status: 'stopped' } : b));
  }, []);

  const runBacktest = useCallback((strategyId: string) => {
    const strategy = strategies.find(s => s.id === strategyId);
    if (strategy) {
      // Mock historical data
      const historicalData = Array.from({ length: 100 }, (_, i) => ({
        timestamp: Date.now() - (100 - i) * 3600000,
        close: 45 + Math.random() * 5
      }));
      const result = PerformanceAnalyticsUtils.runBacktest(strategy, historicalData);
      setBacktestResult(result);
    }
  }, [strategies]);

  return {
    bots,
    strategies,
    backtestResult,
    startBot,
    stopBot,
    runBacktest
  };
};
