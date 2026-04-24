// Analytics calculation utilities for CurrentDao Energy Trading Platform

/**
 * Format currency values with proper decimal places and currency symbol
 */
export const formatCurrency = (value: number, currency: string = '$'): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return `${currency}0.00`;
  }
  
  return `${currency}${Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format percentage values with proper decimal places
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0.00%';
  }
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with appropriate suffixes (K, M, B, T)
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }
  
  if (value === 0) return '0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1e12) {
    return `${sign}${(absValue / 1e12).toFixed(decimals)}T`;
  }
  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(decimals)}B`;
  }
  if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(decimals)}M`;
  }
  if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(decimals)}K`;
  }
  
  return `${sign}${absValue.toFixed(decimals)}`;
};

/**
 * Calculate ROI percentage
 */
export const calculateROI = (investment: number, returns: number): number => {
  if (investment === 0) return 0;
  return ((returns - investment) / investment) * 100;
};

/**
 * Calculate annualized ROI
 */
export const calculateAnnualizedROI = (totalROI: number, years: number): number => {
  if (years <= 0) return 0;
  return (Math.pow(1 + (totalROI / 100), 1 / years) - 1) * 100;
};

/**
 * Calculate payback period in years
 */
export const calculatePaybackPeriod = (investment: number, annualReturns: number): number => {
  if (annualReturns <= 0) return Infinity;
  return investment / annualReturns;
};

/**
 * Calculate compound annual growth rate (CAGR)
 */
export const calculateCAGR = (startValue: number, endValue: number, years: number): number => {
  if (startValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
};

/**
 * Calculate moving average
 */
export const calculateMovingAverage = (data: number[], period: number): number[] => {
  if (data.length < period) return [];
  
  const result: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  
  return result;
};

/**
 * Calculate exponential moving average
 */
export const calculateEMA = (data: number[], period: number): number[] => {
  if (data.length === 0) return [];
  
  const multiplier = 2 / (period + 1);
  const ema: number[] = [data[0]];
  
  for (let i = 1; i < data.length; i++) {
    ema.push((data[i] * multiplier) + (ema[i - 1] * (1 - multiplier)));
  }
  
  return ema;
};

/**
 * Calculate relative strength index (RSI)
 */
export const calculateRSI = (data: number[], period: number = 14): number[] => {
  if (data.length < period + 1) return [];
  
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  const avgGains = calculateMovingAverage(gains, period);
  const avgLosses = calculateMovingAverage(losses, period);
  
  const rsi: number[] = [];
  for (let i = 0; i < avgGains.length; i++) {
    if (avgLosses[i] === 0) {
      rsi.push(100);
    } else {
      const rs = avgGains[i] / avgLosses[i];
      rsi.push(100 - (100 / (1 + rs)));
    }
  }
  
  return rsi;
};

/**
 * Calculate Bollinger Bands
 */
export const calculateBollingerBands = (
  data: number[], 
  period: number = 20, 
  stdDev: number = 2
): { upper: number[]; middle: number[]; lower: number[] } => {
  const middle = calculateMovingAverage(data, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / slice.length;
    const standardDeviation = Math.sqrt(variance);
    
    upper.push(mean + (standardDeviation * stdDev));
    lower.push(mean - (standardDeviation * stdDev));
  }
  
  return { upper, middle, lower };
};

/**
 * Calculate volatility (standard deviation of returns)
 */
export const calculateVolatility = (prices: number[], period: number = 252): number => {
  if (prices.length < 2) return 0;
  
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance * period) * 100; // Annualized volatility
};

/**
 * Calculate correlation coefficient between two datasets
 */
export const calculateCorrelation = (data1: number[], data2: number[]): number => {
  if (data1.length !== data2.length || data1.length === 0) return 0;
  
  const n = data1.length;
  const sum1 = data1.reduce((a, b) => a + b, 0);
  const sum2 = data2.reduce((a, b) => a + b, 0);
  const sum1Sq = data1.reduce((a, b) => a + b * b, 0);
  const sum2Sq = data2.reduce((a, b) => a + b * b, 0);
  const sumProduct = data1.reduce((a, b, i) => a + b * data2[i], 0);
  
  const numerator = sumProduct - (sum1 * sum2 / n);
  const denominator = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

/**
 * Calculate energy efficiency
 */
export const calculateEnergyEfficiency = (output: number, input: number): number => {
  if (input === 0) return 0;
  return (output / input) * 100;
};

/**
 * Calculate carbon footprint reduction
 */
export const calculateCarbonReduction = (
  baselineEmissions: number, 
  currentEmissions: number
): number => {
  if (baselineEmissions === 0) return 0;
  return ((baselineEmissions - currentEmissions) / baselineEmissions) * 100;
};

/**
 * Calculate peak demand
 */
export const calculatePeakDemand = (consumptionData: { hour: number; consumption: number }[]): number => {
  if (consumptionData.length === 0) return 0;
  return Math.max(...consumptionData.map(d => d.consumption));
};

/**
 * Calculate load factor
 */
export const calculateLoadFactor = (averageLoad: number, peakLoad: number): number => {
  if (peakLoad === 0) return 0;
  return (averageLoad / peakLoad) * 100;
};

/**
 * Calculate energy cost savings
 */
export const calculateEnergySavings = (
  baselineConsumption: number,
  currentConsumption: number,
  costPerUnit: number
): number => {
  const savings = (baselineConsumption - currentConsumption) * costPerUnit;
  return Math.max(0, savings);
};

/**
 * Calculate predictive model accuracy
 */
export const calculateModelAccuracy = (predictions: number[], actual: number[]): number => {
  if (predictions.length !== actual.length || predictions.length === 0) return 0;
  
  let correct = 0;
  for (let i = 0; i < predictions.length; i++) {
    // For directional accuracy (up/down prediction)
    if (i > 0) {
      const predDirection = predictions[i] > predictions[i - 1] ? 1 : -1;
      const actualDirection = actual[i] > actual[i - 1] ? 1 : -1;
      if (predDirection === actualDirection) correct++;
    }
  }
  
  return (correct / (predictions.length - 1)) * 100;
};

/**
 * Calculate mean absolute percentage error (MAPE)
 */
export const calculateMAPE = (predictions: number[], actual: number[]): number => {
  if (predictions.length !== actual.length || predictions.length === 0) return 0;
  
  let totalError = 0;
  let validCount = 0;
  
  for (let i = 0; i < predictions.length; i++) {
    if (actual[i] !== 0) {
      totalError += Math.abs((actual[i] - predictions[i]) / actual[i]);
      validCount++;
    }
  }
  
  return validCount > 0 ? (totalError / validCount) * 100 : 0;
};

/**
 * Round number to specified decimal places
 */
export const roundToDecimals = (value: number, decimals: number = 2): number => {
  if (typeof value !== 'number' || isNaN(value)) return 0;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Generate color based on value (green for positive, red for negative)
 */
export const getValueColor = (value: number, threshold: number = 0): string => {
  if (value > threshold) return '#10b981'; // green-500
  if (value < threshold) return '#ef4444'; // red-500
  return '#f59e0b'; // yellow-500
};

/**
 * Generate trend direction based on values
 */
export const getTrendDirection = (values: number[]): 'up' | 'down' | 'stable' => {
  if (values.length < 2) return 'stable';
  
  const recent = values.slice(-5); // Last 5 values
  const older = values.slice(-10, -5); // Previous 5 values
  
  if (recent.length === 0 || older.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const difference = recentAvg - olderAvg;
  const threshold = Math.abs(olderAvg) * 0.05; // 5% threshold
  
  if (difference > threshold) return 'up';
  if (difference < -threshold) return 'down';
  return 'stable';
};

/**
 * Calculate percentile rank
 */
export const calculatePercentile = (value: number, data: number[]): number => {
  if (data.length === 0) return 0;
  
  const sorted = [...data].sort((a, b) => a - b);
  const index = sorted.findIndex(v => v >= value);
  
  return (index / sorted.length) * 100;
};

/**
 * Calculate standard deviation
 */
export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  
  return Math.sqrt(variance);
};

/**
 * Calculate confidence interval
 */
export const calculateConfidenceInterval = (
  values: number[], 
  confidence: number = 0.95
): { lower: number; upper: number } => {
  if (values.length === 0) return { lower: 0, upper: 0 };
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = calculateStandardDeviation(values);
  const margin = 1.96 * (stdDev / Math.sqrt(values.length)); // 95% confidence
  
  return {
    lower: mean - margin,
    upper: mean + margin,
  };
};
