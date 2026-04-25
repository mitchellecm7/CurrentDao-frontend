/**
 * Confidence Interval and Uncertainty Quantification Utilities
 * Provides statistical methods for calculating confidence intervals and uncertainty bounds
 */

import {
  ConfidenceInterval,
  UncertaintyQuantification,
  PredictionDistribution,
  PredictionResult,
  TimeSeriesData
} from '../../types/predictive/analytics';

// Statistical utilities
export class StatisticalUtils {
  /**
   * Calculate mean of an array of numbers
   */
  static mean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Calculate standard deviation
   */
  static standardDeviation(values: number[]): number {
    const meanValue = this.mean(values);
    const variance = values.reduce((sum, value) => sum + Math.pow(value - meanValue, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate variance
   */
  static variance(values: number[]): number {
    const meanValue = this.mean(values);
    return values.reduce((sum, value) => sum + Math.pow(value - meanValue, 2), 0) / values.length;
  }

  /**
   * Calculate skewness
   */
  static skewness(values: number[]): number {
    const n = values.length;
    const meanValue = this.mean(values);
    const stdDev = this.standardDeviation(values);
    
    if (stdDev === 0) return 0;
    
    const skew = values.reduce((sum, value) => {
      return sum + Math.pow((value - meanValue) / stdDev, 3);
    }, 0) / n;
    
    return skew;
  }

  /**
   * Calculate kurtosis
   */
  static kurtosis(values: number[]): number {
    const n = values.length;
    const meanValue = this.mean(values);
    const stdDev = this.standardDeviation(values);
    
    if (stdDev === 0) return 0;
    
    const kurt = values.reduce((sum, value) => {
      return sum + Math.pow((value - meanValue) / stdDev, 4);
    }, 0) / n;
    
    return kurt - 3; // Excess kurtosis
  }

  /**
   * Calculate percentiles
   */
  static percentiles(values: number[], percentiles: number[]): Record<number, number> {
    const sorted = [...values].sort((a, b) => a - b);
    const result: Record<number, number> = {};
    
    percentiles.forEach(p => {
      const index = (p / 100) * (sorted.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      
      if (lower === upper) {
        result[p] = sorted[lower];
      } else {
        const weight = index - lower;
        result[p] = sorted[lower] * (1 - weight) + sorted[upper] * weight;
      }
    });
    
    return result;
  }

  /**
   * Get z-score for confidence level
   */
  static getZScore(confidence: number): number {
    // Approximate z-scores for common confidence levels
    const zScores: Record<number, number> = {
      0.80: 1.282,
      0.85: 1.440,
      0.90: 1.645,
      0.95: 1.960,
      0.99: 2.576,
      0.999: 3.291
    };
    
    // Linear interpolation for intermediate values
    const levels = Object.keys(zScores).map(Number).sort((a, b) => a - b);
    
    for (let i = 0; i < levels.length - 1; i++) {
      const lower = levels[i];
      const upper = levels[i + 1];
      
      if (confidence >= lower && confidence <= upper) {
        const weight = (confidence - lower) / (upper - lower);
        return zScores[lower] * (1 - weight) + zScores[upper] * weight;
      }
    }
    
    return zScores[0.95]; // Default to 95%
  }

  /**
   * Calculate correlation coefficient
   */
  static correlation(x: number[], y: number[]): number {
    if (x.length !== y.length) {
      throw new Error('Arrays must have the same length');
    }
    
    const n = x.length;
    const meanX = this.mean(x);
    const meanY = this.mean(y);
    
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

// Confidence Interval Calculator
export class ConfidenceIntervalCalculator {
  /**
   * Calculate confidence interval using normal distribution
   */
  static normalInterval(
    values: number[],
    confidence: number = 0.95
  ): ConfidenceInterval {
    const meanValue = StatisticalUtils.mean(values);
    const stdDev = StatisticalUtils.standardDeviation(values);
    const zScore = StatisticalUtils.getZScore(confidence);
    const margin = zScore * (stdDev / Math.sqrt(values.length));
    
    return {
      lower: meanValue - margin,
      upper: meanValue + margin,
      level: confidence,
      method: 'normal'
    };
  }

  /**
   * Calculate confidence interval using bootstrap method
   */
  static bootstrapInterval(
    values: number[],
    confidence: number = 0.95,
    iterations: number = 1000
  ): ConfidenceInterval {
    const bootstrapMeans: number[] = [];
    
    // Bootstrap sampling
    for (let i = 0; i < iterations; i++) {
      const sample = this.bootstrapSample(values);
      bootstrapMeans.push(StatisticalUtils.mean(sample));
    }
    
    const percentiles = StatisticalUtils.percentiles(bootstrapMeans, [
      (1 - confidence) * 50,
      50 + confidence * 50
    ]);
    
    return {
      lower: percentiles[(1 - confidence) * 50],
      upper: percentiles[50 + confidence * 50],
      level: confidence,
      method: 'bootstrap'
    };
  }

  /**
   * Calculate confidence interval using Bayesian method
   */
  static bayesianInterval(
    values: number[],
    confidence: number = 0.95,
    priorMean?: number,
    priorStdDev?: number
  ): ConfidenceInterval {
    const n = values.length;
    const sampleMean = StatisticalUtils.mean(values);
    const sampleStdDev = StatisticalUtils.standardDeviation(values);
    
    // Bayesian updating (simplified normal-normal conjugate)
    let posteriorMean: number;
    let posteriorStdDev: number;
    
    if (priorMean !== undefined && priorStdDev !== undefined) {
      const priorPrecision = 1 / (priorStdDev * priorStdDev);
      const samplePrecision = n / (sampleStdDev * sampleStdDev);
      const posteriorPrecision = priorPrecision + samplePrecision;
      
      posteriorMean = (priorPrecision * priorMean + samplePrecision * sampleMean) / posteriorPrecision;
      posteriorStdDev = Math.sqrt(1 / posteriorPrecision);
    } else {
      posteriorMean = sampleMean;
      posteriorStdDev = sampleStdDev / Math.sqrt(n);
    }
    
    const zScore = StatisticalUtils.getZScore(confidence);
    const margin = zScore * posteriorStdDev;
    
    return {
      lower: posteriorMean - margin,
      upper: posteriorMean + margin,
      level: confidence,
      method: 'bayesian'
    };
  }

  /**
   * Calculate confidence interval using Monte Carlo simulation
   */
  static monteCarloInterval(
    values: number[],
    confidence: number = 0.95,
    iterations: number = 10000,
    distribution: 'normal' | 'log_normal' | 'gamma' = 'normal'
  ): ConfidenceInterval {
    const meanValue = StatisticalUtils.mean(values);
    const stdDev = StatisticalUtils.standardDeviation(values);
    
    const simulations: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      let sample: number;
      
      switch (distribution) {
        case 'log_normal':
          const logMean = Math.log(meanValue);
          const logStd = stdDev / meanValue;
          sample = Math.exp(this.normalRandom(logMean, logStd));
          break;
        case 'gamma':
          const shape = (meanValue * meanValue) / (stdDev * stdDev);
          const scale = (stdDev * stdDev) / meanValue;
          sample = this.gammaRandom(shape, scale);
          break;
        default:
          sample = this.normalRandom(meanValue, stdDev);
      }
      
      simulations.push(sample);
    }
    
    const percentiles = StatisticalUtils.percentiles(simulations, [
      (1 - confidence) * 50,
      50 + confidence * 50
    ]);
    
    return {
      lower: percentiles[(1 - confidence) * 50],
      upper: percentiles[50 + confidence * 50],
      level: confidence,
      method: 'monte_carlo'
    };
  }

  /**
   * Generate bootstrap sample
   */
  private static bootstrapSample(values: number[]): number[] {
    const sample: number[] = [];
    const n = values.length;
    
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * n);
      sample.push(values[randomIndex]);
    }
    
    return sample;
  }

  /**
   * Generate normal random variable
   */
  private static normalRandom(mean: number, stdDev: number): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  /**
   * Generate gamma random variable
   */
  private static gammaRandom(shape: number, scale: number): number {
    // Marsaglia and Tsang's method
    if (shape < 1) {
      return this.gammaRandom(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
    }
    
    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
      let x = this.normalRandom(0, 1);
      let v = Math.pow(1 + c * x, 3);
      
      if (v > 0) {
        const u = Math.random();
        if (u < 1 - 0.0331 * x * x * x * x || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
          return d * v * scale;
        }
      }
    }
  }
}

// Uncertainty Quantification
export class UncertaintyQuantifier {
  /**
   * Calculate comprehensive uncertainty metrics
   */
  static quantifyUncertainty(
    values: number[],
    confidence: number = 0.95,
    method: 'normal' | 'bootstrap' | 'bayesian' | 'monte_carlo' = 'normal'
  ): UncertaintyQuantification {
    const variance = StatisticalUtils.variance(values);
    const standardDeviation = StatisticalUtils.standardDeviation(values);
    const skewness = StatisticalUtils.skewness(values);
    const kurtosis = StatisticalUtils.kurtosis(values);
    
    let confidenceInterval: ConfidenceInterval;
    
    switch (method) {
      case 'bootstrap':
        confidenceInterval = ConfidenceIntervalCalculator.bootstrapInterval(values, confidence);
        break;
      case 'bayesian':
        confidenceInterval = ConfidenceIntervalCalculator.bayesianInterval(values, confidence);
        break;
      case 'monte_carlo':
        confidenceInterval = ConfidenceIntervalCalculator.monteCarloInterval(values, confidence);
        break;
      default:
        confidenceInterval = ConfidenceIntervalCalculator.normalInterval(values, confidence);
    }
    
    const predictionDistribution = this.fitDistribution(values);
    
    return {
      variance,
      standardDeviation,
      skewness,
      kurtosis,
      confidenceInterval,
      predictionDistribution
    };
  }

  /**
   * Fit probability distribution to data
   */
  static fitDistribution(values: number[]): PredictionDistribution {
    const meanValue = StatisticalUtils.mean(values);
    const stdDev = StatisticalUtils.standardDeviation(values);
    const skewness = StatisticalUtils.skewness(values);
    const kurtosis = StatisticalUtils.kurtosis(values);
    
    // Determine best fitting distribution based on moments
    let distributionType: PredictionDistribution['type'] = 'normal';
    let parameters: Record<string, number> = {};
    
    // Simple distribution selection based on skewness and kurtosis
    if (Math.abs(skewness) < 0.5 && Math.abs(kurtosis) < 0.5) {
      // Normal distribution
      distributionType = 'normal';
      parameters = { mean: meanValue, stdDev };
    } else if (skewness > 0.5) {
      // Log-normal distribution (right-skewed)
      distributionType = 'log_normal';
      const logMean = Math.log(meanValue) - 0.5 * Math.log(1 + (stdDev * stdDev) / (meanValue * meanValue));
      const logStd = Math.sqrt(Math.log(1 + (stdDev * stdDev) / (meanValue * meanValue)));
      parameters = { mean: logMean, stdDev: logStd };
    } else if (skewness < -0.5) {
      // Could use other distributions, but default to normal for simplicity
      distributionType = 'normal';
      parameters = { mean: meanValue, stdDev };
    } else {
      // Gamma distribution for positive values
      if (values.every(v => v > 0)) {
        distributionType = 'gamma';
        const shape = (meanValue * meanValue) / (stdDev * stdDev);
        const scale = (stdDev * stdDev) / meanValue;
        parameters = { shape, scale };
      } else {
        distributionType = 'normal';
        parameters = { mean: meanValue, stdDev };
      }
    }
    
    // Generate samples for percentile calculation
    const samples = this.generateDistributionSamples(distributionType, parameters, 1000);
    const percentiles = StatisticalUtils.percentiles(samples, [5, 25, 50, 75, 95]);
    
    return {
      type: distributionType,
      parameters,
      samples,
      percentiles
    };
  }

  /**
   * Generate samples from fitted distribution
   */
  private static generateDistributionSamples(
    type: PredictionDistribution['type'],
    parameters: Record<string, number>,
    count: number
  ): number[] {
    const samples: number[] = [];
    
    for (let i = 0; i < count; i++) {
      let sample: number;
      
      switch (type) {
        case 'log_normal':
          const logMean = parameters.mean;
          const logStd = parameters.stdDev;
          sample = Math.exp(ConfidenceIntervalCalculator['normalRandom'](logMean, logStd));
          break;
        case 'gamma':
          const shape = parameters.shape;
          const scale = parameters.scale;
          sample = ConfidenceIntervalCalculator['gammaRandom'](shape, scale);
          break;
        default:
          const mean = parameters.mean;
          const stdDev = parameters.stdDev;
          sample = ConfidenceIntervalCalculator['normalRandom'](mean, stdDev);
      }
      
      samples.push(sample);
    }
    
    return samples;
  }

  /**
   * Calculate prediction intervals for time series
   */
  static predictionIntervals(
    historicalData: TimeSeriesData[],
    forecastHorizon: number,
    confidence: number = 0.95
  ): PredictionResult[] {
    const values = historicalData.map(d => d.value);
    const uncertainty = this.quantifyUncertainty(values, confidence);
    
    const predictions: PredictionResult[] = [];
    const lastValue = values[values.length - 1];
    const trend = this.calculateTrend(values);
    
    for (let i = 1; i <= forecastHorizon; i++) {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() + i);
      
      // Simple trend-based prediction
      const predicted = lastValue + (trend * i);
      
      // Adjust uncertainty for longer horizons
      const horizonMultiplier = Math.sqrt(i);
      const adjustedStdDev = uncertainty.standardDeviation * horizonMultiplier;
      
      const zScore = StatisticalUtils.getZScore(confidence);
      const margin = zScore * adjustedStdDev;
      
      predictions.push({
        predicted,
        confidence,
        upperBound: predicted + margin,
        lowerBound: predicted - margin,
        timestamp,
        model: 'trend_with_uncertainty'
      });
    }
    
    return predictions;
  }

  /**
   * Calculate trend from time series data
   */
  private static calculateTrend(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;
    
    // Simple linear trend
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const meanX = StatisticalUtils.mean(x);
    const meanY = StatisticalUtils.mean(y);
    
    const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Ensemble uncertainty from multiple models
   */
  static ensembleUncertainty(
    modelPredictions: PredictionResult[][],
    confidence: number = 0.95
  ): UncertaintyQuantification {
    // Combine predictions from all models
    const allPredictions: number[] = [];
    
    modelPredictions.forEach(predictions => {
      predictions.forEach(pred => {
        allPredictions.push(pred.predicted);
      });
    });
    
    return this.quantifyUncertainty(allPredictions, confidence);
  }

  /**
   * Calculate uncertainty reduction from ensemble
   */
  static uncertaintyReduction(
    individualUncertainties: UncertaintyQuantification[],
    ensembleUncertainty: UncertaintyQuantification
  ): number {
    const avgIndividualVariance = individualUncertainties.reduce(
      (sum, uncertainty) => sum + uncertainty.variance,
      0
    ) / individualUncertainties.length;
    
    const reduction = (avgIndividualVariance - ensembleUncertainty.variance) / avgIndividualVariance;
    return Math.max(0, reduction);
  }

  /**
   * Adaptive confidence intervals based on model performance
   */
  static adaptiveConfidence(
    predictions: number[],
    actuals: number[],
    baseConfidence: number = 0.95
  ): ConfidenceInterval {
    // Calculate prediction errors
    const errors = predictions.map((pred, i) => Math.abs(pred - actuals[i]));
    const meanError = StatisticalUtils.mean(errors);
    const errorStdDev = StatisticalUtils.standardDeviation(errors);
    
    // Adjust confidence based on error magnitude
    const errorRatio = meanError / StatisticalUtils.mean(actuals);
    const adjustedConfidence = Math.max(0.8, Math.min(0.99, baseConfidence - errorRatio * 0.5));
    
    return ConfidenceIntervalCalculator.normalInterval(predictions, adjustedConfidence);
  }

  /**
   * Time-varying uncertainty (heteroscedasticity)
   */
  static timeVaryingUncertainty(
    data: TimeSeriesData[],
    windowSize: number = 30
  ): UncertaintyQuantification[] {
    const uncertainties: UncertaintyQuantification[] = [];
    
    for (let i = windowSize; i < data.length; i++) {
      const window = data.slice(i - windowSize, i);
      const values = window.map(d => d.value);
      
      const uncertainty = this.quantifyUncertainty(values);
      uncertainties.push(uncertainty);
    }
    
    return uncertainties;
  }

  /**
   * Scenario-based uncertainty analysis
   */
  static scenarioUncertainty(
    scenarios: number[][],
    confidence: number = 0.95
  ): UncertaintyQuantification {
    // Flatten all scenario predictions
    const allPredictions: number[] = [];
    scenarios.forEach(scenario => {
      allPredictions.push(...scenario);
    });
    
    return this.quantifyUncertainty(allPredictions, confidence);
  }
}

// Advanced Uncertainty Methods
export class AdvancedUncertaintyMethods {
  /**
   * Bayesian Model Averaging uncertainty
   */
  static bayesianModelAveraging(
    modelPredictions: { predictions: PredictionResult[]; weight: number }[],
    confidence: number = 0.95
  ): UncertaintyQuantification {
    const weightedPredictions: number[] = [];
    
    modelPredictions.forEach(({ predictions, weight }) => {
      predictions.forEach(pred => {
        weightedPredictions.push(pred.predicted * weight);
      });
    });
    
    return UncertaintyQuantifier.quantifyUncertainty(weightedPredictions, confidence);
  }

  /**
   * Quantile Regression Forest uncertainty
   */
  static quantileRegressionForest(
    features: number[][],
    targets: number[],
    quantiles: number[] = [0.05, 0.25, 0.5, 0.75, 0.95]
  ): Record<number, number[]> {
    // Simplified quantile estimation
    const results: Record<number, number[]> = {};
    
    quantiles.forEach(q => {
      results[q] = targets.map(() => StatisticalUtils.percentiles(targets, [q])[q]);
    });
    
    return results;
  }

  /**
   * Conformal Prediction uncertainty
   */
  static conformalPrediction(
    predictions: number[],
    actuals: number[],
    alpha: number = 0.05
  ): ConfidenceInterval {
    // Calculate non-conformity scores
    const scores = predictions.map((pred, i) => Math.abs(pred - actuals[i]));
    const n = scores.length;
    
    // Calculate quantile of scores
    const quantile = StatisticalUtils.percentiles(scores, [(1 - alpha) * 100])[(1 - alpha) * 100];
    
    const meanPrediction = StatisticalUtils.mean(predictions);
    
    return {
      lower: meanPrediction - quantile,
      upper: meanPrediction + quantile,
      level: 1 - alpha,
      method: 'conformal'
    };
  }

  /**
   * Deep Learning Uncertainty (Monte Carlo Dropout)
   */
  static monteCarloDropout(
    model: any,
    input: number[],
    iterations: number = 100,
    confidence: number = 0.95
  ): UncertaintyQuantification {
    // Simulate dropout predictions
    const predictions: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      // In practice, this would run the model with dropout enabled
      const prediction = Math.random() * 100; // Placeholder
      predictions.push(prediction);
    }
    
    return UncertaintyQuantifier.quantifyUncertainty(predictions, confidence);
  }

  /**
   * Cross-validated uncertainty
   */
  static crossValidatedUncertainty(
    data: TimeSeriesData[],
    folds: number = 5,
    confidence: number = 0.95
  ): UncertaintyQuantification {
    const foldSize = Math.floor(data.length / folds);
    const allPredictions: number[] = [];
    
    for (let i = 0; i < folds; i++) {
      const testStart = i * foldSize;
      const testEnd = (i + 1) * foldSize;
      const testData = data.slice(testStart, testEnd);
      
      // Simple prediction (would use actual model in practice)
      testData.forEach((_, j) => {
        const prediction = 1000 + Math.random() * 100; // Placeholder
        allPredictions.push(prediction);
      });
    }
    
    return UncertaintyQuantifier.quantifyUncertainty(allPredictions, confidence);
  }
}

export default {
  StatisticalUtils,
  ConfidenceIntervalCalculator,
  UncertaintyQuantifier,
  AdvancedUncertaintyMethods
};
