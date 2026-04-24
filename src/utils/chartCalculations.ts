import { PriceDataPoint, TechnicalIndicatorData, IndicatorConfig } from '@/types/charts';

export class ChartCalculations {
  static calculateSMA(data: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  static calculateEMA(data: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    if (data.length === 0) return ema;
    
    ema[0] = data[0];
    
    for (let i = 1; i < data.length; i++) {
      ema[i] = (data[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
    }
    
    return ema;
  }

  static calculateRSI(data: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
    
    return rsi;
  }

  static calculateMACD(data: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): {
    macd: number[];
    signal: number[];
    histogram: number[];
  } {
    const emaFast = this.calculateEMA(data, fastPeriod);
    const emaSlow = this.calculateEMA(data, slowPeriod);
    
    const macd: number[] = [];
    const startIndex = Math.max(0, slowPeriod - fastPeriod);
    
    for (let i = startIndex; i < emaFast.length; i++) {
      macd.push(emaFast[i] - emaSlow[i - startIndex]);
    }
    
    const signal = this.calculateEMA(macd, signalPeriod);
    const histogram = macd.slice(signalPeriod - 1).map((val, i) => val - signal[i + signalPeriod - 1]);
    
    return { macd, signal, histogram };
  }

  static calculateBollingerBands(data: number[], period: number = 20, stdDev: number = 2): {
    upper: number[];
    middle: number[];
    lower: number[];
  } {
    const sma = this.calculateSMA(data, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upper.push(mean + (standardDeviation * stdDev));
      lower.push(mean - (standardDeviation * stdDev));
    }
    
    return { upper, middle: sma, lower };
  }

  static calculateStochastic(data: PriceDataPoint[], kPeriod: number = 14, dPeriod: number = 3): {
    k: number[];
    d: number[];
  } {
    const k: number[] = [];
    
    for (let i = kPeriod - 1; i < data.length; i++) {
      const slice = data.slice(i - kPeriod + 1, i + 1);
      const highestHigh = Math.max(...slice.map(d => d.high));
      const lowestLow = Math.min(...slice.map(d => d.low));
      const currentClose = data[i].close;
      
      const kValue = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
      k.push(kValue);
    }
    
    const d = this.calculateSMA(k, dPeriod);
    
    return { k, d };
  }

  static calculateFibonacciRetracement(high: number, low: number): {
    level0: number;
    level236: number;
    level382: number;
    level5: number;
    level618: number;
    level786: number;
    level1: number;
  } {
    const diff = high - low;
    
    return {
      level0: high,
      level236: high - (diff * 0.236),
      level382: high - (diff * 0.382),
      level5: high - (diff * 0.5),
      level618: high - (diff * 0.618),
      level786: high - (diff * 0.786),
      level1: low
    };
  }

  static calculatePivotPoints(high: number, low: number, close: number): {
    pivot: number;
    r1: number;
    r2: number;
    r3: number;
    s1: number;
    s2: number;
    s3: number;
  } {
    const pivot = (high + low + close) / 3;
    
    return {
      pivot,
      r1: (2 * pivot) - low,
      r2: pivot + (high - low),
      r3: high + (2 * (pivot - low)),
      s1: (2 * pivot) - high,
      s2: pivot - (high - low),
      s3: low - (2 * (high - pivot))
    };
  }

  static calculateVolumeProfile(data: PriceDataPoint[], bins: number = 50): {
    priceLevels: number[];
    volumes: number[];
    maxVolume: number;
  } {
    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const binSize = (maxPrice - minPrice) / bins;
    
    const priceLevels: number[] = [];
    const volumes: number[] = [];
    
    for (let i = 0; i < bins; i++) {
      const lowerBound = minPrice + (i * binSize);
      const upperBound = minPrice + ((i + 1) * binSize);
      const priceLevel = (lowerBound + upperBound) / 2;
      
      let volume = 0;
      for (const candle of data) {
        if (candle.high >= lowerBound && candle.low <= upperBound) {
          volume += candle.volume;
        }
      }
      
      priceLevels.push(priceLevel);
      volumes.push(volume);
    }
    
    const maxVolume = Math.max(...volumes);
    
    return { priceLevels, volumes, maxVolume };
  }

  static calculateATR(data: PriceDataPoint[], period: number = 14): number[] {
    const tr: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = data[i - 1].close;
      
      const trueRange = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      
      tr.push(trueRange);
    }
    
    return this.calculateEMA(tr, period);
  }

  static calculateVWAP(data: PriceDataPoint[]): number[] {
    const vwap: number[] = [];
    let cumulativeVolume = 0;
    let cumulativeVolumePrice = 0;
    
    for (const candle of data) {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      cumulativeVolume += candle.volume;
      cumulativeVolumePrice += typicalPrice * candle.volume;
      
      vwap.push(cumulativeVolumePrice / cumulativeVolume);
    }
    
    return vwap;
  }

  static detectSupportResistance(data: PriceDataPoint[], lookback: number = 20, tolerance: number = 0.02): {
    support: { price: number; strength: number }[];
    resistance: { price: number; strength: number }[];
  } {
    const support: { price: number; strength: number }[] = [];
    const resistance: { price: number; strength: number }[] = [];
    
    for (let i = lookback; i < data.length - lookback; i++) {
      const currentLow = data[i].low;
      const currentHigh = data[i].high;
      
      const isSupport = data.slice(i - lookback, i + lookback + 1).every(d => d.low >= currentLow * (1 - tolerance));
      const isResistance = data.slice(i - lookback, i + lookback + 1).every(d => d.high <= currentHigh * (1 + tolerance));
      
      if (isSupport) {
        support.push({ price: currentLow, strength: lookback });
      }
      
      if (isResistance) {
        resistance.push({ price: currentHigh, strength: lookback });
      }
    }
    
    return { support, resistance };
  }
}
