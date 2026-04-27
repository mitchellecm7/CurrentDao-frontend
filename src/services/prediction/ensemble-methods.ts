import AIModels, { ModelPrediction } from './ai-models';

interface EnsemblePrediction {
  predictedPrice: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  probabilityDistribution: number[];
  modelContributions: Map<string, number>;
  ensembleMethod: string;
  timestamp: Date;
  accuracy: number;
  variance: number;
  consensusScore: number;
}

interface ModelWeight {
  modelType: string;
  weight: number;
  accuracy: number;
  recentPerformance: number;
  volatility: number;
}

interface EnsembleConfig {
  method: 'weighted_average' | 'stacking' | 'bagging' | 'boosting' | 'voting';
  models: string[];
  weights: Map<string, number>;
  rebalanceFrequency: number; // in hours
  minConsensusThreshold: number; // 0-1
  maxVarianceThreshold: number;
  adaptiveWeighting: boolean;
}

class EnsembleMethods {
  private aiModels: AIModels;
  private ensembleConfigs: Map<string, EnsembleConfig> = new Map();
  private modelWeights: Map<string, ModelWeight> = new Map();
  private predictionHistory: EnsemblePrediction[] = [];
  private lastRebalanceTime: Date = new Date();

  constructor(aiModels: AIModels) {
    this.aiModels = aiModels;
    this.initializeEnsembleConfigs();
    this.initializeModelWeights();
  }

  private initializeEnsembleConfigs() {
    // Default ensemble configuration
    this.ensembleConfigs.set('default', {
      method: 'weighted_average',
      models: ['lstm', 'random_forest', 'gradient_boosting', 'neural_network', 'arima'],
      weights: new Map([
        ['lstm', 0.25],
        ['random_forest', 0.20],
        ['gradient_boosting', 0.20],
        ['neural_network', 0.25],
        ['arima', 0.10]
      ]),
      rebalanceFrequency: 24, // 24 hours
      minConsensusThreshold: 0.6,
      maxVarianceThreshold: 0.15,
      adaptiveWeighting: true
    });

    // High accuracy ensemble (uses only best performing models)
    this.ensembleConfigs.set('high_accuracy', {
      method: 'stacking',
      models: ['lstm', 'neural_network', 'gradient_boosting'],
      weights: new Map([
        ['lstm', 0.35],
        ['neural_network', 0.40],
        ['gradient_boosting', 0.25]
      ]),
      rebalanceFrequency: 12,
      minConsensusThreshold: 0.7,
      maxVarianceThreshold: 0.10,
      adaptiveWeighting: true
    });

    // Fast ensemble (for real-time predictions)
    this.ensembleConfigs.set('fast', {
      method: 'voting',
      models: ['random_forest', 'arima'],
      weights: new Map([
        ['random_forest', 0.6],
        ['arima', 0.4]
      ]),
      rebalanceFrequency: 48,
      minConsensusThreshold: 0.5,
      maxVarianceThreshold: 0.20,
      adaptiveWeighting: false
    });

    // Conservative ensemble (focuses on stability)
    this.ensembleConfigs.set('conservative', {
      method: 'bagging',
      models: ['lstm', 'random_forest', 'gradient_boosting', 'arima'],
      weights: new Map([
        ['lstm', 0.30],
        ['random_forest', 0.25],
        ['gradient_boosting', 0.25],
        ['arima', 0.20]
      ]),
      rebalanceFrequency: 36,
      minConsensusThreshold: 0.8,
      maxVarianceThreshold: 0.08,
      adaptiveWeighting: true
    });
  }

  private initializeModelWeights() {
    const models = this.aiModels.getAvailableModels();
    
    models.forEach(modelType => {
      const metrics = this.aiModels.getModelMetrics(modelType);
      const accuracy = metrics ? metrics.accuracy : 0.85;
      
      this.modelWeights.set(modelType, {
        modelType,
        weight: 1 / models.length, // Initially equal weights
        accuracy,
        recentPerformance: accuracy,
        volatility: 0.1
      });
    });
  }

  public async predict(
    ensembleName: string = 'default',
    timeframe: string,
    customFeatures?: any
  ): Promise<EnsemblePrediction> {
    const config = this.ensembleConfigs.get(ensembleName);
    if (!config) {
      throw new Error(`Ensemble configuration '${ensembleName}' not found`);
    }

    // Check if rebalancing is needed
    this.checkAndRebalanceWeights(config);

    // Get predictions from all models in the ensemble
    const modelPredictions: ModelPrediction[] = [];
    const modelContributions = new Map<string, number>();

    for (const modelType of config.models) {
      try {
        if (this.aiModels.isModelTrained(modelType)) {
          const prediction = await this.aiModels.predict(modelType, timeframe, customFeatures);
          modelPredictions.push(prediction);
          
          const weight = config.weights.get(modelType) || 0;
          modelContributions.set(modelType, weight);
        }
      } catch (error) {
        console.warn(`Failed to get prediction from model ${modelType}:`, error);
      }
    }

    if (modelPredictions.length === 0) {
      throw new Error('No models available for prediction');
    }

    // Generate ensemble prediction based on method
    let ensemblePrediction: EnsemblePrediction;

    switch (config.method) {
      case 'weighted_average':
        ensemblePrediction = this.weightedAverageEnsemble(modelPredictions, modelContributions, config);
        break;
      case 'stacking':
        ensemblePrediction = this.stackingEnsemble(modelPredictions, modelContributions, config);
        break;
      case 'bagging':
        ensemblePrediction = this.baggingEnsemble(modelPredictions, modelContributions, config);
        break;
      case 'boosting':
        ensemblePrediction = this.boostingEnsemble(modelPredictions, modelContributions, config);
        break;
      case 'voting':
        ensemblePrediction = this.votingEnsemble(modelPredictions, modelContributions, config);
        break;
      default:
        ensemblePrediction = this.weightedAverageEnsemble(modelPredictions, modelContributions, config);
    }

    // Store prediction history
    this.predictionHistory.push(ensemblePrediction);
    if (this.predictionHistory.length > 1000) {
      this.predictionHistory = this.predictionHistory.slice(-1000);
    }

    return ensemblePrediction;
  }

  private weightedAverageEnsemble(
    predictions: ModelPrediction[],
    contributions: Map<string, number>,
    config: EnsembleConfig
  ): EnsemblePrediction {
    let weightedPrice = 0;
    let weightedConfidence = 0;
    let weightedUpperBound = 0;
    let weightedLowerBound = 0;
    let totalWeight = 0;

    // Calculate weighted averages
    predictions.forEach(prediction => {
      const weight = contributions.get(prediction.modelType) || 0;
      weightedPrice += prediction.predictedPrice * weight;
      weightedConfidence += prediction.confidence * weight;
      weightedUpperBound += prediction.upperBound * weight;
      weightedLowerBound += prediction.lowerBound * weight;
      totalWeight += weight;
    });

    // Normalize weights
    if (totalWeight > 0) {
      weightedPrice /= totalWeight;
      weightedConfidence /= totalWeight;
      weightedUpperBound /= totalWeight;
      weightedLowerBound /= totalWeight;
    }

    // Calculate variance and consensus
    const variance = this.calculatePredictionVariance(predictions);
    const consensusScore = this.calculateConsensusScore(predictions);
    const probabilityDistribution = this.combineProbabilityDistributions(predictions, contributions);

    return {
      predictedPrice: weightedPrice,
      confidence: Math.min(weightedConfidence, 0.95), // Cap at 95%
      upperBound: weightedUpperBound,
      lowerBound: weightedLowerBound,
      probabilityDistribution,
      modelContributions: contributions,
      ensembleMethod: config.method,
      timestamp: new Date(),
      accuracy: this.calculateEnsembleAccuracy(predictions, contributions),
      variance,
      consensusScore
    };
  }

  private stackingEnsemble(
    predictions: ModelPrediction[],
    contributions: Map<string, number>,
    config: EnsembleConfig
  ): EnsemblePrediction {
    // Stacking uses a meta-model to combine predictions
    // For simplicity, we'll use a weighted approach with dynamic adjustment
    
    // Calculate meta-weights based on recent performance
    const metaWeights = this.calculateMetaWeights(predictions);
    
    let stackedPrice = 0;
    let stackedConfidence = 0;
    let stackedUpperBound = 0;
    let stackedLowerBound = 0;

    predictions.forEach(prediction => {
      const metaWeight = metaWeights.get(prediction.modelType) || 0;
      stackedPrice += prediction.predictedPrice * metaWeight;
      stackedConfidence += prediction.confidence * metaWeight;
      stackedUpperBound += prediction.upperBound * metaWeight;
      stackedLowerBound += prediction.lowerBound * metaWeight;
    });

    // Apply stacking correction factor
    const correctionFactor = this.calculateStackingCorrection(predictions);
    stackedPrice *= correctionFactor;
    stackedUpperBound *= correctionFactor;
    stackedLowerBound *= correctionFactor;

    const variance = this.calculatePredictionVariance(predictions);
    const consensusScore = this.calculateConsensusScore(predictions);
    const probabilityDistribution = this.combineProbabilityDistributions(predictions, metaWeights);

    return {
      predictedPrice: stackedPrice,
      confidence: Math.min(stackedConfidence, 0.95),
      upperBound: stackedUpperBound,
      lowerBound: stackedLowerBound,
      probabilityDistribution,
      modelContributions: metaWeights,
      ensembleMethod: config.method,
      timestamp: new Date(),
      accuracy: this.calculateEnsembleAccuracy(predictions, metaWeights),
      variance,
      consensusScore
    };
  }

  private baggingEnsemble(
    predictions: ModelPrediction[],
    contributions: Map<string, number>,
    config: EnsembleConfig
  ): EnsemblePrediction {
    // Bagging uses bootstrap sampling to reduce variance
    const nBootstrap = 10;
    const bootstrapPredictions: number[] = [];
    const bootstrapConfidences: number[] = [];

    for (let i = 0; i < nBootstrap; i++) {
      // Sample with replacement
      const sampledPredictions = this.bootstrapSample(predictions, contributions);
      const avgPrediction = sampledPredictions.reduce((sum, p) => sum + p.predictedPrice, 0) / sampledPredictions.length;
      const avgConfidence = sampledPredictions.reduce((sum, p) => sum + p.confidence, 0) / sampledPredictions.length;
      
      bootstrapPredictions.push(avgPrediction);
      bootstrapConfidences.push(avgConfidence);
    }

    // Calculate statistics from bootstrap samples
    const meanPrediction = bootstrapPredictions.reduce((sum, p) => sum + p, 0) / bootstrapPredictions.length;
    const meanConfidence = bootstrapConfidences.reduce((sum, c) => sum + c, 0) / bootstrapConfidences.length;
    
    const variance = bootstrapPredictions.reduce((sum, p) => sum + Math.pow(p - meanPrediction, 2), 0) / bootstrapPredictions.length;
    const stdDev = Math.sqrt(variance);
    
    const upperBound = meanPrediction + (1.96 * stdDev); // 95% confidence interval
    const lowerBound = meanPrediction - (1.96 * stdDev);

    const consensusScore = this.calculateConsensusScore(predictions);
    const probabilityDistribution = this.generateBootstrapDistribution(bootstrapPredictions);

    return {
      predictedPrice: meanPrediction,
      confidence: Math.min(meanConfidence, 0.95),
      upperBound,
      lowerBound,
      probabilityDistribution,
      modelContributions: contributions,
      ensembleMethod: config.method,
      timestamp: new Date(),
      accuracy: this.calculateEnsembleAccuracy(predictions, contributions),
      variance,
      consensusScore
    };
  }

  private boostingEnsemble(
    predictions: ModelPrediction[],
    contributions: Map<string, number>,
    config: EnsembleConfig
  ): EnsemblePrediction {
    // Boosting focuses on difficult cases by giving more weight to poorly performing models
    const boostedWeights = this.calculateBoostedWeights(predictions);
    
    let boostedPrice = 0;
    let boostedConfidence = 0;
    let boostedUpperBound = 0;
    let boostedLowerBound = 0;

    predictions.forEach(prediction => {
      const weight = boostedWeights.get(prediction.modelType) || 0;
      boostedPrice += prediction.predictedPrice * weight;
      boostedConfidence += prediction.confidence * weight;
      boostedUpperBound += prediction.upperBound * weight;
      boostedLowerBound += prediction.lowerBound * weight;
    });

    const variance = this.calculatePredictionVariance(predictions);
    const consensusScore = this.calculateConsensusScore(predictions);
    const probabilityDistribution = this.combineProbabilityDistributions(predictions, boostedWeights);

    return {
      predictedPrice: boostedPrice,
      confidence: Math.min(boostedConfidence, 0.95),
      upperBound: boostedUpperBound,
      lowerBound: boostedLowerBound,
      probabilityDistribution,
      modelContributions: boostedWeights,
      ensembleMethod: config.method,
      timestamp: new Date(),
      accuracy: this.calculateEnsembleAccuracy(predictions, boostedWeights),
      variance,
      consensusScore
    };
  }

  private votingEnsemble(
    predictions: ModelPrediction[],
    contributions: Map<string, number>,
    config: EnsembleConfig
  ): EnsemblePrediction {
    // Voting ensemble uses majority voting for direction and weighted average for magnitude
    
    // Determine price direction (up/down/sideways)
    const directions = predictions.map(p => {
      const currentPrice = p.features.price;
      if (p.predictedPrice > currentPrice * 1.01) return 'up';
      if (p.predictedPrice < currentPrice * 0.99) return 'down';
      return 'sideways';
    });

    const directionVotes = directions.reduce((acc, dir) => {
      acc[dir] = (acc[dir] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const majorityDirection = Object.entries(directionVotes)
      .sort(([,a], [,b]) => b - a)[0][0];

    // Apply direction bias to weighted average
    const weightedPrediction = this.weightedAverageEnsemble(predictions, contributions, config);
    let finalPrice = weightedPrediction.predictedPrice;

    if (majorityDirection === 'up' && finalPrice <= weightedPrediction.features.price) {
      finalPrice = weightedPrediction.features.price * 1.02;
    } else if (majorityDirection === 'down' && finalPrice >= weightedPrediction.features.price) {
      finalPrice = weightedPrediction.features.price * 0.98;
    }

    const variance = this.calculatePredictionVariance(predictions);
    const consensusScore = directionVotes[majorityDirection] / predictions.length;
    const probabilityDistribution = this.combineProbabilityDistributions(predictions, contributions);

    return {
      predictedPrice: finalPrice,
      confidence: weightedPrediction.confidence * consensusScore,
      upperBound: weightedPrediction.upperBound,
      lowerBound: weightedPrediction.lowerBound,
      probabilityDistribution,
      modelContributions: contributions,
      ensembleMethod: config.method,
      timestamp: new Date(),
      accuracy: this.calculateEnsembleAccuracy(predictions, contributions),
      variance,
      consensusScore
    };
  }

  private bootstrapSample(predictions: ModelPrediction[], contributions: Map<string, number>): ModelPrediction[] {
    const sample: ModelPrediction[] = [];
    const n = predictions.length;
    
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * n);
      sample.push(predictions[randomIndex]);
    }
    
    return sample;
  }

  private calculateMetaWeights(predictions: ModelPrediction[]): Map<string, number> {
    const metaWeights = new Map<string, number>();
    const recentPerformance = this.getRecentModelPerformance();
    
    predictions.forEach(prediction => {
      const baseWeight = 1 / predictions.length;
      const performanceBonus = recentPerformance.get(prediction.modelType) || 0;
      const accuracyBonus = prediction.accuracy * 0.1;
      
      metaWeights.set(prediction.modelType, baseWeight + performanceBonus + accuracyBonus);
    });
    
    // Normalize weights
    const totalWeight = Array.from(metaWeights.values()).reduce((sum, w) => sum + w, 0);
    metaWeights.forEach((weight, model) => {
      metaWeights.set(model, weight / totalWeight);
    });
    
    return metaWeights;
  }

  private calculateStackingCorrection(predictions: ModelPrediction[]): number {
    // Simple stacking correction based on consensus
    const consensus = this.calculateConsensusScore(predictions);
    return 0.95 + (consensus * 0.1); // 0.95 to 1.05 range
  }

  private calculateBoostedWeights(predictions: ModelPrediction[]): Map<string, number> {
    const boostedWeights = new Map<string, number>();
    const recentErrors = this.getRecentModelErrors();
    
    predictions.forEach(prediction => {
      const baseWeight = 1 / predictions.length;
      const error = recentErrors.get(prediction.modelType) || 0.1;
      const boostFactor = 1 + (error * 2); // Boost poorly performing models
      
      boostedWeights.set(prediction.modelType, baseWeight * boostFactor);
    });
    
    // Normalize weights
    const totalWeight = Array.from(boostedWeights.values()).reduce((sum, w) => sum + w, 0);
    boostedWeights.forEach((weight, model) => {
      boostedWeights.set(model, weight / totalWeight);
    });
    
    return boostedWeights;
  }

  private calculatePredictionVariance(predictions: ModelPrediction[]): number {
    if (predictions.length < 2) return 0;
    
    const prices = predictions.map(p => p.predictedPrice);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    
    return prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
  }

  private calculateConsensusScore(predictions: ModelPrediction[]): number {
    if (predictions.length < 2) return 1;
    
    const prices = predictions.map(p => p.predictedPrice);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const stdDev = Math.sqrt(prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length);
    
    // Consensus is higher when predictions are closer together
    const coefficientOfVariation = stdDev / mean;
    return Math.max(0, 1 - coefficientOfVariation);
  }

  private combineProbabilityDistributions(
    predictions: ModelPrediction[],
    weights: Map<string, number>
  ): number[] {
    if (predictions.length === 0) return [];
    
    const combinedDistribution = new Array(101).fill(0);
    
    predictions.forEach(prediction => {
      const weight = weights.get(prediction.modelType) || 0;
      prediction.probabilityDistribution.forEach((prob, index) => {
        combinedDistribution[index] += prob * weight;
      });
    });
    
    // Normalize
    const sum = combinedDistribution.reduce((a, b) => a + b, 0);
    return combinedDistribution.map(p => p / sum);
  }

  private generateBootstrapDistribution(bootstrapPredictions: number[]): number[] {
    const distribution = new Array(101).fill(0);
    const min = Math.min(...bootstrapPredictions);
    const max = Math.max(...bootstrapPredictions);
    const range = max - min;
    
    if (range === 0) {
      distribution[50] = 1; // All predictions are the same
      return distribution;
    }
    
    bootstrapPredictions.forEach(prediction => {
      const index = Math.floor(((prediction - min) / range) * 100);
      distribution[Math.min(index, 100)]++;
    });
    
    // Normalize
    const sum = distribution.reduce((a, b) => a + b, 0);
    return distribution.map(p => p / sum);
  }

  private calculateEnsembleAccuracy(
    predictions: ModelPrediction[],
    weights: Map<string, number>
  ): number {
    let weightedAccuracy = 0;
    let totalWeight = 0;
    
    predictions.forEach(prediction => {
      const weight = weights.get(prediction.modelType) || 0;
      weightedAccuracy += prediction.accuracy * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? weightedAccuracy / totalWeight : 0;
  }

  private getRecentModelPerformance(): Map<string, number> {
    const performance = new Map<string, number>();
    const recentPredictions = this.predictionHistory.slice(-50);
    
    this.aiModels.getAvailableModels().forEach(modelType => {
      const modelPredictions = recentPredictions.filter(p => 
        p.modelContributions.has(modelType)
      );
      
      if (modelPredictions.length > 0) {
        const avgPerformance = modelPredictions.reduce((sum, p) => 
          sum + (p.consensusScore * p.accuracy), 0) / modelPredictions.length;
        performance.set(modelType, avgPerformance * 0.1);
      } else {
        performance.set(modelType, 0);
      }
    });
    
    return performance;
  }

  private getRecentModelErrors(): Map<string, number> {
    const errors = new Map<string, number>();
    
    this.aiModels.getAvailableModels().forEach(modelType => {
      const metrics = this.aiModels.getModelMetrics(modelType);
      const error = metrics ? (1 - metrics.accuracy) : 0.15;
      errors.set(modelType, error);
    });
    
    return errors;
  }

  private checkAndRebalanceWeights(config: EnsembleConfig): void {
    if (!config.adaptiveWeighting) return;
    
    const now = new Date();
    const hoursSinceRebalance = (now.getTime() - this.lastRebalanceTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceRebalance >= config.rebalanceFrequency) {
      this.rebalanceWeights(config);
      this.lastRebalanceTime = now;
    }
  }

  private rebalanceWeights(config: EnsembleConfig): void {
    const newWeights = new Map<string, number>();
    
    config.models.forEach(modelType => {
      const metrics = this.aiModels.getModelMetrics(modelType);
      const accuracy = metrics ? metrics.accuracy : 0.85;
      const recentPerformance = this.getRecentModelPerformance().get(modelType) || 0;
      
      // Calculate new weight based on accuracy and recent performance
      const newWeight = accuracy * (1 + recentPerformance);
      newWeights.set(modelType, newWeight);
    });
    
    // Normalize weights
    const totalWeight = Array.from(newWeights.values()).reduce((sum, w) => sum + w, 0);
    newWeights.forEach((weight, model) => {
      newWeights.set(model, weight / totalWeight);
    });
    
    // Update config weights
    config.weights = newWeights;
  }

  public getEnsembleConfig(ensembleName: string): EnsembleConfig | undefined {
    return this.ensembleConfigs.get(ensembleName);
  }

  public getAvailableEnsembles(): string[] {
    return Array.from(this.ensembleConfigs.keys());
  }

  public updateEnsembleConfig(ensembleName: string, config: Partial<EnsembleConfig>): void {
    const existingConfig = this.ensembleConfigs.get(ensembleName);
    if (existingConfig) {
      this.ensembleConfigs.set(ensembleName, { ...existingConfig, ...config });
    }
  }

  public getPredictionHistory(limit: number = 100): EnsemblePrediction[] {
    return this.predictionHistory.slice(-limit);
  }

  public getEnsembleMetrics(ensembleName: string): {
    averageAccuracy: number;
    averageConsensus: number;
    averageVariance: number;
    predictionCount: number;
  } | undefined {
    const history = this.predictionHistory.filter(p => 
      p.ensembleMethod === this.getEnsembleConfig(ensembleName)?.method
    );
    
    if (history.length === 0) return undefined;
    
    const averageAccuracy = history.reduce((sum, p) => sum + p.accuracy, 0) / history.length;
    const averageConsensus = history.reduce((sum, p) => sum + p.consensusScore, 0) / history.length;
    const averageVariance = history.reduce((sum, p) => sum + p.variance, 0) / history.length;
    
    return {
      averageAccuracy,
      averageConsensus,
      averageVariance,
      predictionCount: history.length
    };
  }
}

export default EnsembleMethods;
