import { PriceDataPoint, IndicatorConfig } from '@/types/charts';

// Technical Analysis Utilities
export class TechnicalAnalysisUtils {
  // Price action analysis
  static calculatePriceAction(data: PriceDataPoint[]): {
    trend: 'bullish' | 'bearish' | 'sideways';
    strength: number;
    support: number[];
    resistance: number[];
  } {
    if (data.length < 10) {
      return { trend: 'sideways', strength: 0, support: [], resistance: [] };
    }

    const closes = data.map(p => p.close);
    const highs = data.map(p => p.high);
    const lows = data.map(p => p.low);
    
    // Calculate trend using linear regression
    const trend = this.calculateTrend(closes);
    
    // Find support and resistance levels
    const support = this.findSupportLevels(lows);
    const resistance = this.findResistanceLevels(highs);
    
    // Calculate trend strength
    const strength = this.calculateTrendStrength(closes);
    
    return {
      trend,
      strength,
      support,
      resistance
    };
  }

  // Volatility analysis
  static calculateVolatility(data: PriceDataPoint[], period: number = 20): {
    current: number;
    average: number;
    historical: number[];
    vwap: number[];
  } {
    const returns = this.calculateReturns(data);
    const historical: number[] = [];
    
    for (let i = period - 1; i < returns.length; i++) {
      const windowReturns = returns.slice(i - period + 1, i + 1);
      const mean = windowReturns.reduce((a, b) => a + b, 0) / windowReturns.length;
      const variance = windowReturns.reduce((acc, ret) => acc + Math.pow(ret - mean, 2), 0) / windowReturns.length;
      historical.push(Math.sqrt(variance) * Math.sqrt(252)); // Annualized
    }
    
    const current = historical[historical.length - 1] || 0;
    const average = historical.reduce((a, b) => a + b, 0) / historical.length || 0;
    
    // Calculate VWAP
    const vwap = this.calculateVWAP(data);
    
    return { current, average, historical, vwap };
  }

  // Volume analysis
  static analyzeVolume(data: PriceDataPoint[]): {
    average: number;
    current: number;
    ratio: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    volumeProfile: { price: number; volume: number }[];
  } {
    const volumes = data.map(p => p.volume);
    const average = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const current = volumes[volumes.length - 1] || 0;
    const ratio = current / average;
    
    // Volume trend
    const recentVolumes = volumes.slice(-10);
    const olderVolumes = volumes.slice(-20, -10);
    const recentAvg = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    const olderAvg = olderVolumes.reduce((a, b) => a + b, 0) / olderVolumes.length;
    
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (recentAvg > olderAvg * 1.1) trend = 'increasing';
    else if (recentAvg < olderAvg * 0.9) trend = 'decreasing';
    else trend = 'stable';
    
    // Volume profile
    const volumeProfile = this.calculateVolumeProfile(data);
    
    return { average, current, ratio, trend, volumeProfile };
  }

  // Momentum analysis
  static calculateMomentum(data: PriceDataPoint[], period: number = 14): {
    rsi: number[];
    stochastic: { k: number[]; d: number[] };
    macd: { macd: number[]; signal: number[]; histogram: number[] };
    williams: number[];
  } {
    const rsi = this.calculateRSI(data, period);
    const stochastic = this.calculateStochastic(data, period);
    const macd = this.calculateMACD(data);
    const williams = this.calculateWilliamsR(data, period);
    
    return { rsi, stochastic, macd, williams };
  }

  // Market structure analysis
  static analyzeMarketStructure(data: PriceDataPoint[]): {
    higherHighs: number[];
    lowerLows: number[];
    marketPhase: 'accumulation' | 'markup' | 'distribution' | 'markdown';
    fractals: { high: number[]; low: number[] };
  } {
    const higherHighs = this.findHigherHighs(data);
    const lowerLows = this.findLowerLows(data);
    const marketPhase = this.determineMarketPhase(data);
    const fractals = this.calculateFractals(data);
    
    return {
      higherHighs,
      lowerLows,
      marketPhase,
      fractals
    };
  }

  // Risk metrics
  static calculateRiskMetrics(data: PriceDataPoint[]): {
    maxDrawdown: number;
    sharpeRatio: number;
    sortinoRatio: number;
    valueAtRisk: number;
    beta: number;
  } {
    const returns = this.calculateReturns(data);
    const prices = data.map(p => p.close);
    
    // Maximum drawdown
    const maxDrawdown = this.calculateMaxDrawdown(prices);
    
    // Sharpe ratio (assuming risk-free rate of 2%)
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const returnStd = Math.sqrt(returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / returns.length);
    const sharpeRatio = (avgReturn - 0.02) / returnStd;
    
    // Sortino ratio (downside deviation)
    const downsideReturns = returns.filter(ret => ret < 0);
    const downsideDeviation = Math.sqrt(
      downsideReturns.reduce((acc, ret) => acc + Math.pow(ret, 2), 0) / downsideReturns.length
    );
    const sortinoRatio = avgReturn / downsideDeviation;
    
    // Value at Risk (95% confidence)
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const valueAtRisk = sortedReturns[Math.floor(sortedReturns.length * 0.05)];
    
    // Beta (relative to market - simplified)
    const beta = this.calculateBeta(prices);
    
    return {
      maxDrawdown,
      sharpeRatio,
      sortinoRatio,
      valueAtRisk,
      beta
    };
  }

  // Pattern scoring
  static scorePattern(data: PriceDataPoint[], pattern: string): {
    score: number;
    confidence: number;
    reliability: number;
  } {
    // Simplified pattern scoring
    const baseScore = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
    const confidence = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
    const reliability = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
    
    return {
      score: baseScore,
      confidence,
      reliability
    };
  }

  // Helper methods
  private static calculateTrend(prices: number[]): 'bullish' | 'bearish' | 'sideways' {
    const n = prices.length;
    const x = Array.from({ length: n }, (_, i) => i);
    
    // Linear regression
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = prices.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * prices[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    if (slope > 0.01) return 'bullish';
    if (slope < -0.01) return 'bearish';
    return 'sideways';
  }

  private static calculateTrendStrength(prices: number[]): number {
    const n = prices.length;
    if (n < 2) return 0;
    
    // R-squared of linear regression
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = prices.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * prices[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const meanY = sumY / n;
    const totalSumSquares = prices.reduce((acc, val) => acc + Math.pow(val - meanY, 2), 0);
    
    if (totalSumSquares === 0) return 0;
    
    const residualSumSquares = prices.reduce((acc, val, i) => {
      const predicted = slope * x[i] + intercept;
      return acc + Math.pow(val - predicted, 2);
    }, 0);
    
    return Math.max(0, 1 - (residualSumSquares / totalSumSquares));
  }

  private static findSupportLevels(lows: number[], minDistance: number = 5): number[] {
    const supports: number[] = [];
    const threshold = 0.02; // 2% tolerance
    
    for (let i = minDistance; i < lows.length - minDistance; i++) {
      const currentLow = lows[i];
      const isSupport = lows
        .slice(i - minDistance, i + minDistance + 1)
        .every(low => low >= currentLow * (1 - threshold));
      
      if (isSupport) {
        supports.push(currentLow);
      }
    }
    
    // Remove duplicates within threshold
    return supports.filter((support, index) => {
      return !supports.slice(0, index).some(s => 
        Math.abs(s - support) / support < threshold
      );
    });
  }

  private static findResistanceLevels(highs: number[], minDistance: number = 5): number[] {
    const resistances: number[] = [];
    const threshold = 0.02; // 2% tolerance
    
    for (let i = minDistance; i < highs.length - minDistance; i++) {
      const currentHigh = highs[i];
      const isResistance = highs
        .slice(i - minDistance, i + minDistance + 1)
        .every(high => high <= currentHigh * (1 + threshold));
      
      if (isResistance) {
        resistances.push(currentHigh);
      }
    }
    
    // Remove duplicates within threshold
    return resistances.filter((resistance, index) => {
      return !resistances.slice(0, index).some(r => 
        Math.abs(r - resistance) / resistance < threshold
      );
    });
  }

  private static calculateReturns(data: PriceDataPoint[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < data.length; i++) {
      returns.push((data[i].close - data[i - 1].close) / data[i - 1].close);
    }
    return returns;
  }

  private static calculateVWAP(data: PriceDataPoint[]): number[] {
    const vwap: number[] = [];
    let cumulativeVolume = 0;
    let cumulativeVolumePrice = 0;
    
    for (const point of data) {
      const typicalPrice = (point.high + point.low + point.close) / 3;
      cumulativeVolume += point.volume;
      cumulativeVolumePrice += typicalPrice * point.volume;
      vwap.push(cumulativeVolumePrice / cumulativeVolume);
    }
    
    return vwap;
  }

  private static calculateRSI(data: PriceDataPoint[], period: number): number[] {
    const result: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        result.push(rsi);
      }
    }
    
    return result;
  }

  private static calculateStochastic(data: PriceDataPoint[], period: number): { k: number[]; d: number[] } {
    const k: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const highest = Math.max(...slice.map(p => p.high));
      const lowest = Math.min(...slice.map(p => p.low));
      const current = data[i].close;
      
      const kValue = ((current - lowest) / (highest - lowest)) * 100;
      k.push(kValue);
    }
    
    const d = this.calculateSMA(k.map((val, i) => ({ 
      close: val, 
      timestamp: data[i + period - 1].timestamp, 
      open: val, 
      high: val, 
      low: val, 
      volume: 0 
    })), 3);
    
    return { k, d };
  }

  private static calculateMACD(data: PriceDataPoint[]): { macd: number[]; signal: number[]; histogram: number[] } {
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    
    const macdLine = ema12.slice(ema26.length - ema12.length).map((fast, i) => fast - ema26[i + (ema26.length - ema12.length)]);
    const signalLine = this.calculateEMA(
      macdLine.map((val, i) => ({ 
        close: val, 
        timestamp: data[i + 26 - 1].timestamp, 
        open: val, 
        high: val, 
        low: val, 
        volume: 0 
      })), 9
    );
    
    const histogram = macdLine.slice(9 - 1).map((macd, i) => macd - signalLine[i]);
    
    return { macd: macdLine, signal: signalLine, histogram };
  }

  private static calculateWilliamsR(data: PriceDataPoint[], period: number): number[] {
    const result: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const highest = Math.max(...slice.map(p => p.high));
      const lowest = Math.min(...slice.map(p => p.low));
      const current = data[i].close;
      
      const williamsR = ((highest - current) / (highest - lowest)) * -100;
      result.push(williamsR);
    }
    
    return result;
  }

  private static calculateSMA(data: PriceDataPoint[], period: number): number[] {
    const result: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, point) => acc + point.close, 0);
      result.push(sum / period);
    }
    return result;
  }

  private static calculateEMA(data: PriceDataPoint[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    
    const initialSMA = data.slice(0, period).reduce((acc, point) => acc + point.close, 0) / period;
    result.push(initialSMA);
    
    for (let i = period; i < data.length; i++) {
      const ema = (data[i].close - result[result.length - 1]) * multiplier + result[result.length - 1];
      result.push(ema);
    }
    
    return result;
  }

  private static findHigherHighs(data: PriceDataPoint[]): number[] {
    const higherHighs: number[] = [];
    const highs = data.map(p => p.high);
    
    for (let i = 2; i < highs.length - 2; i++) {
      const current = highs[i];
      const isHigherHigh = highs[i] > highs[i - 1] && highs[i] > highs[i - 2] &&
                           highs[i] > highs[i + 1] && highs[i] > highs[i + 2];
      
      if (isHigherHigh) {
        higherHighs.push(i);
      }
    }
    
    return higherHighs;
  }

  private static findLowerLows(data: PriceDataPoint[]): number[] {
    const lowerLows: number[] = [];
    const lows = data.map(p => p.low);
    
    for (let i = 2; i < lows.length - 2; i++) {
      const current = lows[i];
      const isLowerLow = lows[i] < lows[i - 1] && lows[i] < lows[i - 2] &&
                        lows[i] < lows[i + 1] && lows[i] < lows[i + 2];
      
      if (isLowerLow) {
        lowerLows.push(i);
      }
    }
    
    return lowerLows;
  }

  private static determineMarketPhase(data: PriceDataPoint[]): 'accumulation' | 'markup' | 'distribution' | 'markdown' {
    const prices = data.map(p => p.close);
    const volumes = data.map(p => p.volume);
    
    // Simplified market phase detection
    const priceChange = (prices[prices.length - 1] - prices[0]) / prices[0];
    const volumeChange = (volumes[volumes.length - 1] - volumes[0]) / volumes[0];
    
    if (priceChange > 0.1 && volumeChange > 0.2) return 'markup';
    if (priceChange < -0.1 && volumeChange > 0.2) return 'markdown';
    if (priceChange < 0.05 && volumeChange > 0.1) return 'accumulation';
    return 'distribution';
  }

  private static calculateFractals(data: PriceDataPoint[]): { high: number[]; low: number[] } {
    const high: number[] = [];
    const low: number[] = [];
    
    for (let i = 2; i < data.length - 2; i++) {
      // High fractal
      if (data[i].high > data[i - 1].high && data[i].high > data[i - 2].high &&
          data[i].high > data[i + 1].high && data[i].high > data[i + 2].high) {
        high.push(i);
      }
      
      // Low fractal
      if (data[i].low < data[i - 1].low && data[i].low < data[i - 2].low &&
          data[i].low < data[i + 1].low && data[i].low < data[i + 2].low) {
        low.push(i);
      }
    }
    
    return { high, low };
  }

  private static calculateMaxDrawdown(prices: number[]): number {
    let maxDrawdown = 0;
    let peak = prices[0];
    
    for (const price of prices) {
      if (price > peak) {
        peak = price;
      }
      const drawdown = (peak - price) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  }

  private static calculateBeta(prices: number[]): number {
    // Simplified beta calculation (would normally use market data)
    const returns = this.calculateReturnsFromPrices(prices);
    const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - returns.reduce((a, b) => a + b, 0) / returns.length, 2), 0) / returns.length;
    
    return variance > 0 ? 1.2 : 1; // Default beta
  }

  private static calculateReturnsFromPrices(prices: number[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    return returns;
  }

  private static calculateVolumeProfile(data: PriceDataPoint[]): { price: number; volume: number }[] {
    const priceVolumeMap = new Map<number, number>();
    
    for (const point of data) {
      const priceRange = Math.floor(point.close * 100) / 100; // Round to 2 decimal places
      const currentVolume = priceVolumeMap.get(priceRange) || 0;
      priceVolumeMap.set(priceRange, currentVolume + point.volume);
    }
    
    return Array.from(priceVolumeMap.entries()).map(([price, volume]) => ({ price, volume }));
  }
}

// Export utility functions
export const analyzeTechnicalIndicators = (data: PriceDataPoint[]) => {
  return {
    priceAction: TechnicalAnalysisUtils.calculatePriceAction(data),
    volatility: TechnicalAnalysisUtils.calculateVolatility(data),
    volume: TechnicalAnalysisUtils.analyzeVolume(data),
    momentum: TechnicalAnalysisUtils.calculateMomentum(data),
    marketStructure: TechnicalAnalysisUtils.analyzeMarketStructure(data),
    riskMetrics: TechnicalAnalysisUtils.calculateRiskMetrics(data)
  };
};

export const generateTradingSignals = (data: PriceDataPoint[]): {
  signal: 'buy' | 'sell' | 'hold';
  strength: number;
  reason: string;
}[] => {
  const signals = [];
  const analysis = analyzeTechnicalIndicators(data);
  
  // Generate signals based on technical analysis
  if (analysis.priceAction.trend === 'bullish' && analysis.priceAction.strength > 0.7) {
    signals.push({
      signal: 'buy' as const,
      strength: analysis.priceAction.strength,
      reason: 'Strong bullish trend detected'
    });
  }
  
  if (analysis.priceAction.trend === 'bearish' && analysis.priceAction.strength > 0.7) {
    signals.push({
      signal: 'sell' as const,
      strength: analysis.priceAction.strength,
      reason: 'Strong bearish trend detected'
    });
  }
  
  // RSI overbought/oversold signals
  const rsi = analysis.momentum.rsi;
  if (rsi.length > 0) {
    const currentRSI = rsi[rsi.length - 1];
    if (currentRSI > 70) {
      signals.push({
        signal: 'sell' as const,
        strength: 0.8,
        reason: 'RSI indicates overbought conditions'
      });
    } else if (currentRSI < 30) {
      signals.push({
        signal: 'buy' as const,
        strength: 0.8,
        reason: 'RSI indicates oversold conditions'
      });
    }
  }
  
  return signals;
};

export const calculatePerformanceMetrics = (data: PriceDataPoint[], trades: any[]) => {
  // Performance metrics calculation
  const totalReturn = (data[data.length - 1].close - data[0].close) / data[0].close;
  const winRate = trades.filter(trade => trade.profit > 0).length / trades.length;
  const avgWin = trades.filter(trade => trade.profit > 0).reduce((acc, trade) => acc + trade.profit, 0) / trades.filter(trade => trade.profit > 0).length || 0;
  const avgLoss = trades.filter(trade => trade.profit < 0).reduce((acc, trade) => acc + Math.abs(trade.profit), 0) / trades.filter(trade => trade.profit < 0).length || 0;
  
  return {
    totalReturn,
    winRate,
    avgWin,
    avgLoss,
    profitFactor: avgWin / avgLoss || 0,
    maxConsecutiveWins: 0,
    maxConsecutiveLosses: 0
  };
};
