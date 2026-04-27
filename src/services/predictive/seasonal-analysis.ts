/**
 * Seasonal Pattern Analysis and Decomposition Service
 * Implements advanced seasonal analysis with statistical significance testing and pattern detection
 */

import {
  SeasonalPattern,
  SeasonalDecomposition,
  SeasonalForecast,
  TimeSeriesData,
  ConfidenceInterval
} from '../../types/predictive/analytics';

// Statistical utilities for seasonal analysis
export class SeasonalStatistics {
  /**
   * Calculate autocorrelation function
   */
  static autocorrelation(values: number[], maxLag: number): number[] {
    const n = values.length;
    const meanValue = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - meanValue, 2), 0) / n;
    
    const autocorr: number[] = [];
    
    for (let lag = 0; lag <= maxLag; lag++) {
      if (lag === 0) {
        autocorr.push(1);
        continue;
      }
      
      let covariance = 0;
      for (let i = 0; i < n - lag; i++) {
        covariance += (values[i] - meanValue) * (values[i + lag] - meanValue);
      }
      covariance /= (n - lag);
      
      autocorr.push(covariance / variance);
    }
    
    return autocorr;
  }

  /**
   * Calculate partial autocorrelation function
   */
  static partialAutocorrelation(values: number[], maxLag: number): number[] {
    const pacf: number[] = [];
    const autocorr = this.autocorrelation(values, maxLag);
    
    for (let k = 0; k <= maxLag; k++) {
      if (k === 0) {
        pacf.push(1);
        continue;
      }
      
      if (k === 1) {
        pacf.push(autocorr[1]);
        continue;
      }
      
      // Durbin-Levinson algorithm for PACF
      const phi = this.durbinLevinson(autocorr.slice(1, k + 1));
      pacf.push(phi[phi.length - 1]);
    }
    
    return pacf;
  }

  /**
   * Durbin-Levinson algorithm for AR coefficients
   */
  private static durbinLevinson(autocorr: number[]): number[] {
    const n = autocorr.length;
    const phi: number[] = new Array(n).fill(0);
    const temp: number[] = new Array(n).fill(0);
    
    for (let k = 0; k < n; k++) {
      let numerator = autocorr[k];
      
      for (let j = 0; j < k; j++) {
        numerator -= phi[j] * autocorr[k - 1 - j];
      }
      
      let denominator = 1;
      for (let j = 0; j < k; j++) {
        denominator -= phi[j] * autocorr[j];
      }
      
      phi[k] = numerator / denominator;
      
      // Update previous coefficients
      for (let j = 0; j < k; j++) {
        temp[j] = phi[j] - phi[k] * autocorr[k - 1 - j];
      }
      
      for (let j = 0; j < k; j++) {
        phi[j] = temp[j];
      }
    }
    
    return phi;
  }

  /**
   * Perform Augmented Dickey-Fuller test for stationarity
   */
  static augmentedDickeyFuller(values: number[]): { statistic: number; pValue: number; stationary: boolean } {
    const n = values.length;
    const diffValues = this.difference(values);
    
    // Simple ADF test (simplified implementation)
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 1; i < n; i++) {
      numerator += diffValues[i - 1] * (values[i] - values[i - 1]);
      denominator += diffValues[i - 1] * diffValues[i - 1];
    }
    
    const statistic = numerator / denominator;
    
    // Simplified p-value calculation (would use proper distribution in practice)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(statistic)));
    const stationary = pValue < 0.05;
    
    return { statistic, pValue, stationary };
  }

  /**
   * Normal cumulative distribution function
   */
  private static normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  /**
   * Error function approximation
   */
  private static erf(x: number): number {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * Calculate difference of time series
   */
  static difference(values: number[]): number[] {
    const diff: number[] = [];
    for (let i = 1; i < values.length; i++) {
      diff.push(values[i] - values[i - 1]);
    }
    return diff;
  }

  /**
   * Calculate seasonal strength
   */
  static seasonalStrength(seasonal: number[], trend: number[]): number {
    const seasonalVar = this.variance(seasonal);
    const trendVar = this.variance(trend);
    const residualVar = this.variance(seasonal.map((s, i) => s - trend[i]));
    
    return seasonalVar / (seasonalVar + residualVar);
  }

  /**
   * Calculate trend strength
   */
  static trendStrength(trend: number[]): number {
    const n = trend.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const correlation = this.correlation(x, trend);
    return correlation * correlation;
  }

  /**
   * Calculate variance
   */
  static variance(values: number[]): number {
    const meanValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - meanValue, 2), 0) / values.length;
  }

  /**
   * Calculate correlation
   */
  static correlation(x: number[], y: number[]): number {
    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;
    
    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      numerator += diffX * diffY;
      sumXSquared += diffX * diffX;
      sumYSquared += diffY * diffY;
    }
    
    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    return denominator === 0 ? 0 : numerator / denominator;
  }
}

// Seasonal Pattern Detection
export class SeasonalPatternDetector {
  /**
   * Detect seasonal patterns using Fourier analysis
   */
  static detectFourierPatterns(values: number[], samplingRate: number = 1): SeasonalPattern[] {
    const n = values.length;
    const patterns: SeasonalPattern[] = [];
    
    // Perform FFT (simplified implementation)
    const frequencies = this.fourierTransform(values);
    
    // Find significant frequencies
    for (let k = 1; k < Math.floor(n / 2); k++) {
      const magnitude = Math.sqrt(frequencies[k].real * frequencies[k].real + frequencies[k].imag * frequencies[k].imag);
      const frequency = k / n * samplingRate;
      const period = 1 / frequency;
      
      // Test significance using threshold
      const threshold = this.calculateSignificanceThreshold(values, k);
      
      if (magnitude > threshold) {
        // Extract pattern for this frequency
        const pattern = this.extractPattern(values, period, k);
        
        patterns.push({
          period: this.classifyPeriod(period),
          strength: magnitude / frequencies[0].real, // Normalized by DC component
          phase: Math.atan2(frequencies[k].imag, frequencies[k].real),
          confidence: this.calculatePatternConfidence(magnitude, threshold),
          significance: this.calculateStatisticalSignificance(magnitude, threshold),
          pattern
        });
      }
    }
    
    return patterns.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Simplified Fourier Transform
   */
  private static fourierTransform(values: number[]): { real: number; imag: number }[] {
    const n = values.length;
    const transform: { real: number; imag: number }[] = [];
    
    for (let k = 0; k < n; k++) {
      let real = 0;
      let imag = 0;
      
      for (let i = 0; i < n; i++) {
        const angle = -2 * Math.PI * k * i / n;
        real += values[i] * Math.cos(angle);
        imag += values[i] * Math.sin(angle);
      }
      
      transform.push({ real, imag });
    }
    
    return transform;
  }

  /**
   * Calculate significance threshold for frequency
   */
  private static calculateSignificanceThreshold(values: number[], k: number): number {
    const n = values.length;
    const meanValue = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - meanValue, 2), 0) / n;
    
    // Simplified threshold based on noise level
    return Math.sqrt(variance / n) * 2;
  }

  /**
   * Extract pattern for specific period
   */
  private static extractPattern(values: number[], period: number, k: number): number[] {
    const patternLength = Math.round(period);
    const pattern: number[] = [];
    
    for (let i = 0; i < patternLength; i++) {
      let sum = 0;
      let count = 0;
      
      for (let j = i; j < values.length; j += patternLength) {
        sum += values[j];
        count++;
      }
      
      pattern.push(count > 0 ? sum / count : 0);
    }
    
    return pattern;
  }

  /**
   * Classify period into standard categories
   */
  private static classifyPeriod(period: number): 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' {
    if (period < 2) return 'daily';
    if (period < 8) return 'weekly';
    if (period < 32) return 'monthly';
    if (period < 92) return 'quarterly';
    return 'yearly';
  }

  /**
   * Calculate pattern confidence
   */
  private static calculatePatternConfidence(magnitude: number, threshold: number): number {
    const signalToNoise = magnitude / threshold;
    return Math.min(1, signalToNoise / 3); // Normalize to 0-1
  }

  /**
   * Calculate statistical significance
   */
  private static calculateStatisticalSignificance(magnitude: number, threshold: number): number {
    // Simplified p-value calculation
    const zScore = (magnitude - threshold) / threshold;
    return 2 * (1 - SeasonalStatistics.normalCDF(Math.abs(zScore)));
  }

  /**
   * Detect seasonal patterns using autocorrelation
   */
  static detectAutocorrelationPatterns(values: number[]): SeasonalPattern[] {
    const patterns: SeasonalPattern[] = [];
    const maxLag = Math.min(values.length / 2, 365); // Limit to reasonable range
    
    const autocorr = SeasonalStatistics.autocorrelation(values, maxLag);
    
    // Find significant peaks in autocorrelation
    for (let lag = 1; lag < autocorr.length; lag++) {
      if (autocorr[lag] > 0.3) { // Threshold for significance
        const period = lag;
        const pattern = this.extractPattern(values, period, lag);
        
        patterns.push({
          period: this.classifyPeriod(period),
          strength: autocorr[lag],
          phase: 0, // Not applicable for autocorrelation
          confidence: Math.min(1, autocorr[lag] / 0.8),
          significance: this.calculateAutocorrSignificance(autocorr[lag]),
          pattern
        });
      }
    }
    
    return patterns.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Calculate significance for autocorrelation
   */
  private static calculateAutocorrSignificance(autocorr: number): number {
    const standardError = 1 / Math.sqrt(autocorr);
    const zScore = autocorr / standardError;
    return 2 * (1 - SeasonalStatistics.normalCDF(Math.abs(zScore)));
  }
}

// Seasonal Decomposition
export class SeasonalDecomposer {
  /**
   * Classical seasonal decomposition using STL (Seasonal and Trend decomposition using Loess)
   */
  static decomposeSTL(
    data: TimeSeriesData[],
    period: number,
    seasonalWindow: number = 7,
    trendWindow: number = 15
  ): SeasonalDecomposition {
    const values = data.map(d => d.value);
    const timestamps = data.map(d => d.timestamp);
    
    // Step 1: Initial trend estimation using moving average
    const initialTrend = this.movingAverage(values, trendWindow);
    
    // Step 2: Detrend the series
    const detrended = values.map((v, i) => v - (initialTrend[i] || 0));
    
    // Step 3: Estimate seasonal component
    const seasonal = this.estimateSeasonalComponent(detrended, period, seasonalWindow);
    
    // Step 4: Re-estimate trend from seasonally adjusted data
    const seasonallyAdjusted = values.map((v, i) => v - (seasonal[i] || 0));
    const trend = this.loessSmoothing(seasonallyAdjusted, trendWindow);
    
    // Step 5: Calculate residual component
    const residual = values.map((v, i) => v - (trend[i] || 0) - (seasonal[i] || 0));
    
    // Calculate strength measures
    const trendStrength = SeasonalStatistics.trendStrength(trend);
    const seasonalStrength = SeasonalStatistics.seasonalStrength(seasonal, trend);
    
    return {
      trend: trend.map((value, i) => ({ timestamp: timestamps[i], value: value || 0 })),
      seasonal: seasonal.map((value, i) => ({ timestamp: timestamps[i], value: value || 0 })),
      residual: residual.map((value, i) => ({ timestamp: timestamps[i], value: value || 0 })),
      original: data,
      strength: {
        trend: trendStrength,
        seasonal: seasonalStrength
      },
      confidence: this.calculateDecompositionConfidence(trend, seasonal, residual)
    };
  }

  /**
   * Simple moving average
   */
  private static movingAverage(values: number[], window: number): number[] {
    const result: number[] = [];
    const halfWindow = Math.floor(window / 2);
    
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(values.length, i + halfWindow + 1);
      const windowValues = values.slice(start, end);
      result.push(windowValues.reduce((sum, val) => sum + val, 0) / windowValues.length);
    }
    
    return result;
  }

  /**
   * Loess smoothing (simplified implementation)
   */
  private static loessSmoothing(values: number[], window: number): number[] {
    const result: number[] = [];
    const halfWindow = Math.floor(window / 2);
    
    for (let i = 0; i < values.length; i++) {
      const weights: number[] = [];
      const weightedValues: number[] = [];
      
      for (let j = Math.max(0, i - halfWindow); j < Math.min(values.length, i + halfWindow + 1); j++) {
        const distance = Math.abs(j - i) / halfWindow;
        const weight = Math.pow(1 - Math.pow(distance, 3), 3);
        weights.push(weight);
        weightedValues.push(values[j] * weight);
      }
      
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      result.push(totalWeight > 0 ? weightedValues.reduce((sum, wv) => sum + wv, 0) / totalWeight : 0);
    }
    
    return result;
  }

  /**
   * Estimate seasonal component
   */
  private static estimateSeasonalComponent(
    detrended: number[],
    period: number,
    window: number
  ): number[] {
    const seasonal: number[] = [];
    
    // Initialize seasonal component
    for (let i = 0; i < period; i++) {
      seasonal.push(0);
    }
    
    // Calculate seasonal indices
    for (let i = 0; i < detrended.length; i++) {
      const seasonIndex = i % period;
      seasonal[seasonIndex] += detrended[i];
    }
    
    // Average seasonal indices
    for (let i = 0; i < period; i++) {
      const count = Math.floor(detrended.length / period) + (i < detrended.length % period ? 1 : 0);
      seasonal[i] = count > 0 ? seasonal[i] / count : 0;
    }
    
    // Normalize seasonal component (zero mean)
    const seasonalMean = seasonal.reduce((sum, val) => sum + val, 0) / period;
    for (let i = 0; i < period; i++) {
      seasonal[i] -= seasonalMean;
    }
    
    // Extend seasonal component to full length
    const fullSeasonal: number[] = [];
    for (let i = 0; i < detrended.length; i++) {
      fullSeasonal.push(seasonal[i % period]);
    }
    
    return fullSeasonal;
  }

  /**
   * Calculate decomposition confidence
   */
  private static calculateDecompositionConfidence(
    trend: number[],
    seasonal: number[],
    residual: number[]
  ): number {
    const totalVariance = SeasonalStatistics.variance(trend) + 
                         SeasonalStatistics.variance(seasonal) + 
                         SeasonalStatistics.variance(residual);
    
    const explainedVariance = SeasonalStatistics.variance(trend) + SeasonalStatistics.variance(seasonal);
    
    return totalVariance > 0 ? explainedVariance / totalVariance : 0;
  }

  /**
   * X-13-ARIMA-SEATS seasonal decomposition (simplified)
   */
  static decomposeX13(data: TimeSeriesData[], period: number): SeasonalDecomposition {
    // Simplified X-13 decomposition (would use actual X-13 implementation in practice)
    return this.decomposeSTL(data, period);
  }
}

// Seasonal Forecasting
export class SeasonalForecaster {
  /**
   * Forecast using seasonal decomposition
   */
  static forecastDecomposition(
    decomposition: SeasonalDecomposition,
    horizon: number,
    confidence: number = 0.95
  ): SeasonalForecast[] {
    const forecasts: SeasonalForecast[] = [];
    const { trend, seasonal } = decomposition;
    
    // Extract last seasonal pattern
    const seasonalPattern = this.extractSeasonalPattern(seasonal);
    
    for (let i = 1; i <= horizon; i++) {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() + i);
      
      // Forecast trend (simple linear extrapolation)
      const trendComponent = this.forecastTrend(trend, i);
      
      // Forecast seasonal component
      const seasonalComponent = seasonalPattern[i % seasonalPattern.length];
      
      // Combine components
      const forecast = trendComponent + seasonalComponent;
      
      // Calculate confidence bounds
      const { upperBound, lowerBound } = this.calculateForecastBounds(
        forecast,
        decomposition,
        confidence,
        i
      );
      
      forecasts.push({
        timestamp,
        seasonalComponent,
        trendComponent,
        residualComponent: 0, // Residuals are assumed to be zero mean
        forecast,
        confidence,
        pattern: {
          period: 'daily',
          strength: decomposition.strength.seasonal,
          phase: 0,
          confidence: decomposition.confidence,
          significance: 0.05,
          pattern: seasonalPattern
        }
      });
    }
    
    return forecasts;
  }

  /**
   * Extract seasonal pattern from seasonal component
   */
  private static extractSeasonalPattern(seasonal: TimeSeriesData[]): number[] {
    // Find the period by analyzing the seasonal component
    const values = seasonal.map(s => s.value);
    const autocorr = SeasonalStatistics.autocorrelation(values, Math.min(values.length / 2, 365));
    
    // Find the most significant lag
    let maxLag = 1;
    let maxAutocorr = 0;
    
    for (let lag = 1; lag < autocorr.length; lag++) {
      if (autocorr[lag] > maxAutocorr) {
        maxAutocorr = autocorr[lag];
        maxLag = lag;
      }
    }
    
    // Extract pattern for this period
    const pattern: number[] = [];
    for (let i = 0; i < maxLag; i++) {
      let sum = 0;
      let count = 0;
      
      for (let j = i; j < values.length; j += maxLag) {
        sum += values[j];
        count++;
      }
      
      pattern.push(count > 0 ? sum / count : 0);
    }
    
    return pattern;
  }

  /**
   * Forecast trend component
   */
  private static forecastTrend(trend: TimeSeriesData[], stepsAhead: number): number {
    const values = trend.map(t => t.value);
    
    // Simple linear trend extrapolation
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    
    // Calculate linear regression
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = values.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (values[i] - meanY);
      denominator += (x[i] - meanX) * (x[i] - meanX);
    }
    
    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // Forecast
    return intercept + slope * (n + stepsAhead - 1);
  }

  /**
   * Calculate forecast confidence bounds
   */
  private static calculateForecastBounds(
    forecast: number,
    decomposition: SeasonalDecomposition,
    confidence: number,
    stepsAhead: number
  ): { upperBound: number; lowerBound: number } {
    const residualVariance = SeasonalStatistics.variance(decomposition.residual.map(r => r.value));
    const standardError = Math.sqrt(residualVariance) * Math.sqrt(stepsAhead);
    
    const zScore = this.getZScore(confidence);
    const margin = zScore * standardError;
    
    return {
      upperBound: forecast + margin,
      lowerBound: forecast - margin
    };
  }

  /**
   * Get z-score for confidence level
   */
  private static getZScore(confidence: number): number {
    const zScores: Record<number, number> = {
      0.80: 1.282,
      0.85: 1.440,
      0.90: 1.645,
      0.95: 1.960,
      0.99: 2.576
    };
    
    return zScores[confidence] || 1.96;
  }

  /**
   * Forecast using exponential smoothing with seasonal adjustment
   */
  static forecastExponentialSmoothing(
    data: TimeSeriesData[],
    period: number,
    horizon: number,
    alpha: number = 0.3,
    beta: number = 0.1,
    gamma: number = 0.1,
    confidence: number = 0.95
  ): SeasonalForecast[] {
    const values = data.map(d => d.value);
    const n = values.length;
    
    // Initialize components
    const level: number[] = [];
    const trend: number[] = [];
    const seasonal: number[] = [];
    
    // Initial estimates
    level[0] = values[0];
    trend[0] = (values[1] - values[0]) / 1;
    
    // Initialize seasonal components
    for (let i = 0; i < period; i++) {
      seasonal[i] = 0;
    }
    
    // Holt-Winters exponential smoothing
    for (let i = 1; i < n; i++) {
      const seasonIndex = i % period;
      
      // Update level
      level[i] = alpha * (values[i] - seasonal[seasonIndex]) + 
                (1 - alpha) * (level[i - 1] + trend[i - 1]);
      
      // Update trend
      trend[i] = beta * (level[i] - level[i - 1]) + 
                 (1 - beta) * trend[i - 1];
      
      // Update seasonal
      seasonal[seasonIndex] = gamma * (values[i] - level[i]) + 
                              (1 - gamma) * seasonal[seasonIndex];
    }
    
    // Generate forecasts
    const forecasts: SeasonalForecast[] = [];
    
    for (let h = 1; h <= horizon; h++) {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() + h);
      
      const seasonIndex = (n - 1 + h) % period;
      const trendComponent = trend[n - 1];
      const seasonalComponent = seasonal[seasonIndex];
      const levelComponent = level[n - 1] + h * trend[n - 1];
      
      const forecast = levelComponent + seasonalComponent;
      
      // Calculate confidence bounds
      const { upperBound, lowerBound } = this.calculateExponentialSmoothingBounds(
        forecast,
        level,
        trend,
        seasonal,
        h,
        confidence
      );
      
      forecasts.push({
        timestamp,
        seasonalComponent,
        trendComponent,
        residualComponent: 0,
        forecast,
        confidence,
        pattern: {
          period: this.classifyPeriod(period),
          strength: Math.abs(seasonalComponent / forecast),
          phase: 0,
          confidence: 0.9,
          significance: 0.05,
          pattern: seasonal
        }
      });
    }
    
    return forecasts;
  }

  /**
   * Calculate confidence bounds for exponential smoothing
   */
  private static calculateExponentialSmoothingBounds(
    forecast: number,
    level: number[],
    trend: number[],
    seasonal: number[],
    h: number,
    confidence: number
  ): { upperBound: number; lowerBound: number } {
    // Simplified error estimation
    const errors = level.map((l, i) => {
      if (i === 0) return 0;
      const actual = level[i] + trend[i] + seasonal[i % seasonal.length];
      return Math.abs(actual - l);
    });
    
    const meanError = errors.reduce((sum, e) => sum + e, 0) / errors.length;
    const standardError = meanError * Math.sqrt(h);
    
    const zScore = this.getZScore(confidence);
    const margin = zScore * standardError;
    
    return {
      upperBound: forecast + margin,
      lowerBound: forecast - margin
    };
  }

  /**
   * Classify period
   */
  private static classifyPeriod(period: number): 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' {
    if (period < 2) return 'daily';
    if (period < 8) return 'weekly';
    if (period < 32) return 'monthly';
    if (period < 92) return 'quarterly';
    return 'yearly';
  }
}

// Main Seasonal Analysis Service
export class SeasonalAnalysisService {
  private data: TimeSeriesData[] = [];
  private patterns: SeasonalPattern[] = [];
  private decomposition: SeasonalDecomposition | null = null;

  constructor(data: TimeSeriesData[]) {
    this.data = data;
  }

  /**
   * Perform complete seasonal analysis
   */
  async analyzeSeasonality(periods: number[] = [7, 30, 365]): Promise<{
    patterns: SeasonalPattern[];
    decomposition: SeasonalDecomposition;
    forecasts: SeasonalForecast[];
  }> {
    // Detect seasonal patterns
    this.patterns = await this.detectPatterns();
    
    // Find best period for decomposition
    const bestPeriod = this.selectBestPeriod(periods);
    
    // Perform decomposition
    this.decomposition = SeasonalDecomposer.decomposeSTL(this.data, bestPeriod);
    
    // Generate forecasts
    const forecasts = SeasonalForecaster.forecastDecomposition(this.decomposition, 30);
    
    return {
      patterns: this.patterns,
      decomposition: this.decomposition,
      forecasts
    };
  }

  /**
   * Detect seasonal patterns
   */
  private async detectPatterns(): Promise<SeasonalPattern[]> {
    const values = this.data.map(d => d.value);
    
    // Detect patterns using multiple methods
    const fourierPatterns = SeasonalPatternDetector.detectFourierPatterns(values);
    const autocorrPatterns = SeasonalPatternDetector.detectAutocorrelationPatterns(values);
    
    // Combine and deduplicate patterns
    const allPatterns = [...fourierPatterns, ...autocorrPatterns];
    const uniquePatterns = this.deduplicatePatterns(allPatterns);
    
    return uniquePatterns;
  }

  /**
   * Select best period for decomposition
   */
  private selectBestPeriod(periods: number[]): number {
    let bestPeriod = periods[0];
    let bestScore = 0;
    
    for (const period of periods) {
      if (period >= this.data.length) continue;
      
      const autocorr = SeasonalStatistics.autocorrelation(
        this.data.map(d => d.value),
        period
      );
      
      const score = autocorr[period]; // Autocorrelation at this lag
      
      if (score > bestScore) {
        bestScore = score;
        bestPeriod = period;
      }
    }
    
    return bestPeriod;
  }

  /**
   * Deduplicate patterns
   */
  private deduplicatePatterns(patterns: SeasonalPattern[]): SeasonalPattern[] {
    const unique: SeasonalPattern[] = [];
    
    for (const pattern of patterns) {
      const existing = unique.find(p => 
        p.period === pattern.period && 
        Math.abs(p.phase - pattern.phase) < 0.1
      );
      
      if (!existing) {
        unique.push(pattern);
      } else if (pattern.strength > existing.strength) {
        // Replace with stronger pattern
        const index = unique.indexOf(existing);
        unique[index] = pattern;
      }
    }
    
    return unique;
  }

  /**
   * Get seasonal strength metrics
   */
  getSeasonalStrength(): { trend: number; seasonal: number } {
    if (!this.decomposition) {
      return { trend: 0, seasonal: 0 };
    }
    
    return this.decomposition.strength;
  }

  /**
   * Get significant seasonal patterns
   */
  getSignificantPatterns(significanceThreshold: number = 0.05): SeasonalPattern[] {
    return this.patterns.filter(p => p.significance < significanceThreshold);
  }

  /**
   * Update analysis with new data
   */
  updateData(newData: TimeSeriesData[]): void {
    this.data = newData;
    this.patterns = [];
    this.decomposition = null;
  }

  /**
   * Export analysis results
   */
  exportResults(): {
    data: TimeSeriesData[];
    patterns: SeasonalPattern[];
    decomposition: SeasonalDecomposition | null;
    timestamp: Date;
  } {
    return {
      data: this.data,
      patterns: this.patterns,
      decomposition: this.decomposition,
      timestamp: new Date()
    };
  }
}

export default SeasonalAnalysisService;
