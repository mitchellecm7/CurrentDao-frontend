import { PriceDataPoint, IndicatorConfig } from '@/types/charts';

// Technical indicator calculation engine
export class IndicatorEngine {
  // Simple Moving Average (SMA)
  static calculateSMA(data: PriceDataPoint[], period: number): number[] {
    const result: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, point) => acc + point.close, 0);
      result.push(sum / period);
    }
    return result;
  }

  // Exponential Moving Average (EMA)
  static calculateEMA(data: PriceDataPoint[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // Start with SMA for first value
    const initialSMA = data.slice(0, period).reduce((acc, point) => acc + point.close, 0) / period;
    result.push(initialSMA);
    
    for (let i = period; i < data.length; i++) {
      const ema = (data[i].close - result[result.length - 1]) * multiplier + result[result.length - 1];
      result.push(ema);
    }
    return result;
  }

  // Relative Strength Index (RSI)
  static calculateRSI(data: PriceDataPoint[], period: number = 14): number[] {
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

  // MACD (Moving Average Convergence Divergence)
  static calculateMACD(data: PriceDataPoint[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): { macd: number[], signal: number[], histogram: number[] } {
    const fastEMA = this.calculateEMA(data, fastPeriod);
    const slowEMA = this.calculateEMA(data, slowPeriod);
    
    const macdLine = fastEMA.slice(slowEMA.length - fastEMA.length).map((fast, i) => fast - slowEMA[i + (slowEMA.length - fastEMA.length)]);
    const signalLine = this.calculateEMA(
      macdLine.map((val, i) => ({ close: val, timestamp: data[i + slowPeriod - 1].timestamp, open: val, high: val, low: val, volume: 0 })),
      signalPeriod
    );
    
    const histogram = macdLine.slice(signalPeriod - 1).map((macd, i) => macd - signalLine[i]);
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram
    };
  }

  // Bollinger Bands
  static calculateBollingerBands(data: PriceDataPoint[], period: number = 20, stdDev: number = 2): { upper: number[], middle: number[], lower: number[] } {
    const middle = this.calculateSMA(data, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = slice.reduce((acc, point) => acc + point.close, 0) / period;
      const variance = slice.reduce((acc, point) => acc + Math.pow(point.close - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upper.push(mean + (standardDeviation * stdDev));
      lower.push(mean - (standardDeviation * stdDev));
    }
    
    return { upper, middle, lower };
  }

  // Stochastic Oscillator
  static calculateStochastic(data: PriceDataPoint[], period: number = 14, dPeriod: number = 3): { k: number[], d: number[] } {
    const k: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const highest = Math.max(...slice.map(p => p.high));
      const lowest = Math.min(...slice.map(p => p.low));
      const current = data[i].close;
      
      const kValue = ((current - lowest) / (highest - lowest)) * 100;
      k.push(kValue);
    }
    
    const d = this.calculateSMA(
      k.map((val, i) => ({ close: val, timestamp: data[i + period - 1].timestamp, open: val, high: val, low: val, volume: 0 })),
      dPeriod
    );
    
    return { k, d };
  }

  // Williams %R
  static calculateWilliamsR(data: PriceDataPoint[], period: number = 14): number[] {
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

  // Commodity Channel Index (CCI)
  static calculateCCI(data: PriceDataPoint[], period: number = 20): number[] {
    const result: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const typicalPrices = slice.map(p => (p.high + p.low + p.close) / 3);
      const sma = typicalPrices.reduce((a, b) => a + b, 0) / period;
      
      const meanDeviation = typicalPrices.reduce((acc, tp) => acc + Math.abs(tp - sma), 0) / period;
      const cci = (typicalPrices[typicalPrices.length - 1] - sma) / (0.015 * meanDeviation);
      
      result.push(cci);
    }
    return result;
  }

  // Average True Range (ATR)
  static calculateATR(data: PriceDataPoint[], period: number = 14): number[] {
    const trueRanges: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = data[i - 1].close;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }
    
    return this.calculateSMA(
      trueRanges.map((val, i) => ({ close: val, timestamp: data[i + 1].timestamp, open: val, high: val, low: val, volume: 0 })),
      period
    );
  }

  // On-Balance Volume (OBV)
  static calculateOBV(data: PriceDataPoint[]): number[] {
    const result: number[] = [data[0].volume];
    
    for (let i = 1; i < data.length; i++) {
      const obv = data[i].close > data[i - 1].close 
        ? result[result.length - 1] + data[i].volume
        : data[i].close < data[i - 1].close 
        ? result[result.length - 1] - data[i].volume
        : result[result.length - 1];
      result.push(obv);
    }
    return result;
  }

  // Money Flow Index (MFI)
  static calculateMFI(data: PriceDataPoint[], period: number = 14): number[] {
    const result: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const typicalPrices = slice.map(p => (p.high + p.low + p.close) / 3);
      const rawMoneyFlow = typicalPrices.map((tp, j) => tp * slice[j].volume);
      
      let positiveFlow = 0;
      let negativeFlow = 0;
      
      for (let j = 1; j < typicalPrices.length; j++) {
        if (typicalPrices[j] > typicalPrices[j - 1]) {
          positiveFlow += rawMoneyFlow[j];
        } else if (typicalPrices[j] < typicalPrices[j - 1]) {
          negativeFlow += rawMoneyFlow[j];
        }
      }
      
      const moneyRatio = positiveFlow / negativeFlow;
      const mfi = 100 - (100 / (1 + moneyRatio));
      result.push(mfi);
    }
    return result;
  }

  // Volume Weighted Average Price (VWAP)
  static calculateVWAP(data: PriceDataPoint[]): number[] {
    const result: number[] = [];
    let cumulativeVolume = 0;
    let cumulativeVolumePrice = 0;
    
    for (const point of data) {
      const typicalPrice = (point.high + point.low + point.close) / 3;
      cumulativeVolume += point.volume;
      cumulativeVolumePrice += typicalPrice * point.volume;
      result.push(cumulativeVolumePrice / cumulativeVolume);
    }
    return result;
  }
}

// Main function to calculate technical indicators
export const calculateTechnicalIndicators = async (
  data: PriceDataPoint[], 
  config: IndicatorConfig
): Promise<number[]> => {
  const { type, period, parameters = {} } = config;
  
  switch (type) {
    case 'SMA':
      return IndicatorEngine.calculateSMA(data, period);
    
    case 'EMA':
      return IndicatorEngine.calculateEMA(data, period);
    
    case 'RSI':
      return IndicatorEngine.calculateRSI(data, period);
    
    case 'MACD':
      const macdResult = IndicatorEngine.calculateMACD(
        data, 
        parameters.fastPeriod || 12, 
        parameters.slowPeriod || 26, 
        parameters.signalPeriod || 9
      );
      return macdResult.macd;
    
    case 'BB':
      const bbResult = IndicatorEngine.calculateBollingerBands(
        data, 
        period, 
        parameters.stdDev || 2
      );
      return bbResult.middle;
    
    case 'STOCH':
      const stochResult = IndicatorEngine.calculateStochastic(
        data, 
        period, 
        parameters.dPeriod || 3
      );
      return stochResult.k;
    
    default:
      throw new Error(`Unknown indicator type: ${type}`);
  }
};

// Additional advanced indicators
export const calculateAdvancedIndicators = async (
  data: PriceDataPoint[], 
  indicators: string[]
): Promise<Record<string, number[]>> => {
  const results: Record<string, number[]> = {};
  
  for (const indicator of indicators) {
    switch (indicator) {
      case 'WILLIAMS_R':
        results[indicator] = IndicatorEngine.calculateWilliamsR(data);
        break;
      case 'CCI':
        results[indicator] = IndicatorEngine.calculateCCI(data);
        break;
      case 'ATR':
        results[indicator] = IndicatorEngine.calculateATR(data);
        break;
      case 'OBV':
        results[indicator] = IndicatorEngine.calculateOBV(data);
        break;
      case 'MFI':
        results[indicator] = IndicatorEngine.calculateMFI(data);
        break;
      case 'VWAP':
        results[indicator] = IndicatorEngine.calculateVWAP(data);
        break;
      default:
        console.warn(`Unknown advanced indicator: ${indicator}`);
    }
  }
  
  return results;
};

// Performance optimized batch calculation
export const batchCalculateIndicators = async (
  data: PriceDataPoint[], 
  configs: IndicatorConfig[]
): Promise<Record<string, number[]>> => {
  const results: Record<string, number[]> = {};
  
  // Group indicators by type for optimization
  const groupedConfigs = configs.reduce((acc, config) => {
    const key = config.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(config);
    return acc;
  }, {} as Record<string, IndicatorConfig[]>);
  
  // Calculate indicators in parallel where possible
  const promises = Object.entries(groupedConfigs).map(async ([type, configs]) => {
    for (const config of configs) {
      const key = `${config.type}(${config.period})`;
      results[key] = await calculateTechnicalIndicators(data, config);
    }
  });
  
  await Promise.all(promises);
  return results;
};
