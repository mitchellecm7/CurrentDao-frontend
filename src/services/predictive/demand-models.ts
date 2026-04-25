/**
 * Advanced Demand Forecasting Models for CurrentDao Energy Trading
 * Implements multiple ML models with ensemble methods and external factor integration
 */

import {
  DemandForecast,
  DemandForecastingConfig,
  DemandModelType,
  DemandFactors,
  TimeSeriesData,
  ModelMetrics,
  ConfidenceInterval,
  ExternalFactor,
  WeatherImpact,
  EconomicImpact,
  SeasonalImpact,
  HistoricalImpact,
  ExternalImpact
} from '../../types/predictive/analytics';

// Base class for demand forecasting models
export abstract class DemandForecastingModel {
  protected model: any;
  protected isTrained: boolean = false;
  protected metrics: ModelMetrics | null = null;
  protected config: DemandForecastingConfig;

  constructor(config: DemandForecastingConfig) {
    this.config = config;
  }

  abstract train(data: TimeSeriesData[]): Promise<void>;
  abstract predict(horizon: number, factors?: DemandFactors): Promise<DemandForecast[]>;
  abstract evaluate(testData: TimeSeriesData[]): Promise<ModelMetrics>;

  protected calculateConfidenceInterval(
    predictions: number[],
    confidence: number = 0.95
  ): ConfidenceInterval {
    const mean = predictions.reduce((a, b) => a + b, 0) / predictions.length;
    const variance = predictions.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / predictions.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate z-score for confidence level
    const zScore = this.getZScore(confidence);
    const margin = zScore * stdDev;
    
    return {
      lower: mean - margin,
      upper: mean + margin,
      level: confidence,
      method: 'normal'
    };
  }

  private getZScore(confidence: number): number {
    // Approximate z-scores for common confidence levels
    const zScores: Record<number, number> = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576
    };
    return zScores[confidence] || 1.96;
  }

  protected calculateMetrics(actual: number[], predicted: number[]): ModelMetrics {
    const n = actual.length;
    
    // Calculate errors
    const errors = actual.map((a, i) => a - predicted[i]);
    const absoluteErrors = errors.map(e => Math.abs(e));
    const squaredErrors = errors.map(e => e * e);
    const percentageErrors = actual.map((a, i) => Math.abs((a - predicted[i]) / a));
    
    // Calculate metrics
    const mae = absoluteErrors.reduce((a, b) => a + b, 0) / n;
    const mse = squaredErrors.reduce((a, b) => a + b, 0) / n;
    const rmse = Math.sqrt(mse);
    const mape = percentageErrors.reduce((a, b) => a + b, 0) / n;
    
    // Calculate R²
    const actualMean = actual.reduce((a, b) => a + b, 0) / n;
    const totalSumSquares = actual.reduce((acc, val) => acc + Math.pow(val - actualMean, 2), 0);
    const residualSumSquares = squaredErrors.reduce((a, b) => a + b, 0);
    const r2 = 1 - (residualSumSquares / totalSumSquares);
    
    // Calculate accuracy
    const accuracy = Math.max(0, (1 - mape) * 100);
    
    return {
      mae,
      mse,
      rmse,
      mape,
      r2,
      accuracy
    };
  }
}

// ARIMA Model for demand forecasting
export class ARIMADemandModel extends DemandForecastingModel {
  private p: number; // AutoRegressive order
  private d: number; // Differencing order
  private q: number; // Moving Average order

  constructor(config: DemandForecastingConfig, p: number = 1, d: number = 1, q: number = 1) {
    super(config);
    this.p = p;
    this.d = d;
    this.q = q;
  }

  async train(data: TimeSeriesData[]): Promise<void> {
    // Implement ARIMA training logic
    // This would typically use a statistical library
    console.log('Training ARIMA model with parameters:', { p: this.p, d: this.d, q: this.q });
    
    // Simulate training
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.isTrained = true;
    this.model = {
      type: 'ARIMA',
      parameters: { p: this.p, d: this.d, q: this.q },
      coefficients: this.calculateCoefficients(data)
    };
  }

  async predict(horizon: number, factors?: DemandFactors): Promise<DemandForecast[]> {
    if (!this.isTrained) {
      throw new Error('Model must be trained before prediction');
    }

    const forecasts: DemandForecast[] = [];
    const lastValue = this.getLastValue();
    const trend = this.calculateTrend();
    
    for (let i = 1; i <= horizon; i++) {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() + i);
      
      // Base ARIMA prediction
      let prediction = lastValue + (trend * i);
      
      // Apply external factors
      if (factors) {
        prediction = this.applyFactors(prediction, factors, i);
      }
      
      // Calculate confidence bounds
      const confidence = this.calculateConfidenceInterval([prediction], this.config.confidence);
      
      forecasts.push({
        timestamp,
        demand: 0, // Will be filled with actual value when available
        predictedDemand: prediction,
        confidence: this.config.confidence,
        upperBound: confidence.upper,
        lowerBound: confidence.lower,
        factors: factors || this.getDefaultFactors(),
        model: 'arima'
      });
    }
    
    return forecasts;
  }

  async evaluate(testData: TimeSeriesData[]): Promise<ModelMetrics> {
    // Implement ARIMA evaluation logic
    const predictions = await this.predict(testData.length);
    const actual = testData.map(d => d.value);
    const predicted = predictions.map(p => p.predictedDemand);
    
    this.metrics = this.calculateMetrics(actual, predicted);
    return this.metrics;
  }

  private calculateCoefficients(data: TimeSeriesData[]): number[] {
    // Simplified coefficient calculation
    // In practice, this would use maximum likelihood estimation
    const values = data.map(d => d.value);
    return [0.7, -0.3, 0.2]; // AR and MA coefficients
  }

  private getLastValue(): number {
    // Return last observed value
    return 1000; // Placeholder
  }

  private calculateTrend(): number {
    // Calculate trend component
    return 5; // Placeholder
  }

  private applyFactors(prediction: number, factors: DemandFactors, horizon: number): number {
    let adjusted = prediction;
    
    // Weather impact
    adjusted *= (1 + factors.weather.impact);
    
    // Economic impact
    adjusted *= (1 + factors.economic.impact);
    
    // Seasonal impact
    adjusted *= (1 + factors.seasonal.seasonality);
    
    // Historical impact
    adjusted *= (1 + factors.historical.yearOverYear);
    
    // External impact
    adjusted *= (1 + factors.external.impact);
    
    return adjusted;
  }

  private getDefaultFactors(): DemandFactors {
    return {
      weather: { temperature: 20, humidity: 60, precipitation: 0, windSpeed: 10, impact: 0, confidence: 0.5 },
      economic: { gdpGrowth: 0.02, inflation: 0.03, unemployment: 0.05, energyPrices: 0.1, impact: 0, confidence: 0.5 },
      seasonal: { seasonality: 0, trend: 0, holiday: 0, weekly: 0, confidence: 0.5 },
      historical: { dayOfWeek: 0, monthOfYear: 0, yearOverYear: 0, movingAverage: 0, volatility: 0, confidence: 0.5 },
      external: { events: [], disruptions: [], policy: [], impact: 0, confidence: 0.5 }
    };
  }
}

// LSTM Neural Network Model for demand forecasting
export class LSTMDemandModel extends DemandForecastingModel {
  private sequenceLength: number;
  private hiddenUnits: number;
  private epochs: number;

  constructor(
    config: DemandForecastingConfig,
    sequenceLength: number = 30,
    hiddenUnits: number = 50,
    epochs: number = 100
  ) {
    super(config);
    this.sequenceLength = sequenceLength;
    this.hiddenUnits = hiddenUnits;
    this.epochs = epochs;
  }

  async train(data: TimeSeriesData[]): Promise<void> {
    console.log('Training LSTM model with sequence length:', this.sequenceLength);
    
    // Prepare sequences for LSTM
    const sequences = this.prepareSequences(data);
    
    // Simulate LSTM training
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.isTrained = true;
    this.model = {
      type: 'LSTM',
      sequenceLength: this.sequenceLength,
      hiddenUnits: this.hiddenUnits,
      weights: this.generateWeights()
    };
  }

  async predict(horizon: number, factors?: DemandFactors): Promise<DemandForecast[]> {
    if (!this.isTrained) {
      throw new Error('Model must be trained before prediction');
    }

    const forecasts: DemandForecast[] = [];
    let currentSequence = this.getCurrentSequence();
    
    for (let i = 1; i <= horizon; i++) {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() + i);
      
      // LSTM prediction
      let prediction = this.predictLSTM(currentSequence);
      
      // Apply external factors
      if (factors) {
        prediction = this.applyFactors(prediction, factors, i);
      }
      
      // Calculate confidence bounds (LSTM typically provides wider intervals)
      const confidence = this.calculateConfidenceInterval([prediction], this.config.confidence);
      
      forecasts.push({
        timestamp,
        demand: 0,
        predictedDemand: prediction,
        confidence: this.config.confidence,
        upperBound: confidence.upper,
        lowerBound: confidence.lower,
        factors: factors || this.getDefaultFactors(),
        model: 'lstm'
      });
      
      // Update sequence for next prediction
      currentSequence = this.updateSequence(currentSequence, prediction);
    }
    
    return forecasts;
  }

  async evaluate(testData: TimeSeriesData[]): Promise<ModelMetrics> {
    const predictions = await this.predict(testData.length);
    const actual = testData.map(d => d.value);
    const predicted = predictions.map(p => p.predictedDemand);
    
    this.metrics = this.calculateMetrics(actual, predicted);
    return this.metrics;
  }

  private prepareSequences(data: TimeSeriesData[]): number[][] {
    const sequences: number[][] = [];
    const values = data.map(d => d.value);
    
    for (let i = 0; i <= values.length - this.sequenceLength; i++) {
      sequences.push(values.slice(i, i + this.sequenceLength));
    }
    
    return sequences;
  }

  private getCurrentSequence(): number[] {
    // Return current sequence for prediction
    return Array(this.sequenceLength).fill(1000); // Placeholder
  }

  private predictLSTM(sequence: number[]): number {
    // Simulate LSTM prediction
    // In practice, this would use the trained neural network
    const lastValue = sequence[sequence.length - 1];
    const trend = this.calculateTrend(sequence);
    return lastValue + trend;
  }

  private calculateTrend(sequence: number[]): number {
    // Calculate trend from sequence
    const recent = sequence.slice(-5);
    const older = sequence.slice(-10, -5);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    return recentAvg - olderAvg;
  }

  private updateSequence(sequence: number[], prediction: number): number[] {
    const newSequence = [...sequence.slice(1), prediction];
    return newSequence;
  }

  private generateWeights(): number[][] {
    // Generate random weights for simulation
    return Array(this.hiddenUnits).fill(0).map(() => 
      Array(this.sequenceLength).fill(0).map(() => Math.random())
    );
  }

  private applyFactors(prediction: number, factors: DemandFactors, horizon: number): number {
    // Similar to ARIMA factor application
    let adjusted = prediction;
    adjusted *= (1 + factors.weather.impact);
    adjusted *= (1 + factors.economic.impact);
    adjusted *= (1 + factors.seasonal.seasonality);
    adjusted *= (1 + factors.historical.yearOverYear);
    adjusted *= (1 + factors.external.impact);
    return adjusted;
  }

  private getDefaultFactors(): DemandFactors {
    return {
      weather: { temperature: 20, humidity: 60, precipitation: 0, windSpeed: 10, impact: 0, confidence: 0.5 },
      economic: { gdpGrowth: 0.02, inflation: 0.03, unemployment: 0.05, energyPrices: 0.1, impact: 0, confidence: 0.5 },
      seasonal: { seasonality: 0, trend: 0, holiday: 0, weekly: 0, confidence: 0.5 },
      historical: { dayOfWeek: 0, monthOfYear: 0, yearOverYear: 0, movingAverage: 0, volatility: 0, confidence: 0.5 },
      external: { events: [], disruptions: [], policy: [], impact: 0, confidence: 0.5 }
    };
  }
}

// Random Forest Model for demand forecasting
export class RandomForestDemandModel extends DemandForecastingModel {
  private nEstimators: number;
  private maxDepth: number;
  private minSamplesSplit: number;

  constructor(
    config: DemandForecastingConfig,
    nEstimators: number = 100,
    maxDepth: number = 10,
    minSamplesSplit: number = 2
  ) {
    super(config);
    this.nEstimators = nEstimators;
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  async train(data: TimeSeriesData[]): Promise<void> {
    console.log('Training Random Forest model with', this.nEstimators, 'estimators');
    
    // Prepare features for Random Forest
    const features = this.prepareFeatures(data);
    
    // Simulate Random Forest training
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    this.isTrained = true;
    this.model = {
      type: 'RandomForest',
      nEstimators: this.nEstimators,
      maxDepth: this.maxDepth,
      featureImportance: this.calculateFeatureImportance()
    };
  }

  async predict(horizon: number, factors?: DemandFactors): Promise<DemandForecast[]> {
    if (!this.isTrained) {
      throw new Error('Model must be trained before prediction');
    }

    const forecasts: DemandForecast[] = [];
    
    for (let i = 1; i <= horizon; i++) {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() + i);
      
      // Random Forest prediction
      const features = this.preparePredictionFeatures(i, factors);
      let prediction = this.predictRandomForest(features);
      
      // Apply external factors
      if (factors) {
        prediction = this.applyFactors(prediction, factors, i);
      }
      
      // Calculate confidence bounds (Random Forest provides natural uncertainty estimates)
      const confidence = this.calculateConfidenceInterval([prediction], this.config.confidence);
      
      forecasts.push({
        timestamp,
        demand: 0,
        predictedDemand: prediction,
        confidence: this.config.confidence,
        upperBound: confidence.upper,
        lowerBound: confidence.lower,
        factors: factors || this.getDefaultFactors(),
        model: 'random_forest'
      });
    }
    
    return forecasts;
  }

  async evaluate(testData: TimeSeriesData[]): Promise<ModelMetrics> {
    const predictions = await this.predict(testData.length);
    const actual = testData.map(d => d.value);
    const predicted = predictions.map(p => p.predictedDemand);
    
    this.metrics = this.calculateMetrics(actual, predicted);
    return this.metrics;
  }

  private prepareFeatures(data: TimeSeriesData[]): number[][] {
    const features: number[][] = [];
    
    for (let i = 0; i < data.length; i++) {
      const feature: number[] = [];
      
      // Time-based features
      const date = new Date(data[i].timestamp);
      feature.push(date.getMonth() + 1); // Month
      feature.push(date.getDate()); // Day
      feature.push(date.getDay()); // Day of week
      feature.push(date.getHours()); // Hour
      
      // Lag features
      if (i > 0) feature.push(data[i - 1].value);
      if (i > 1) feature.push(data[i - 2].value);
      if (i > 6) feature.push(data[i - 7].value); // Week ago
      
      // Moving averages
      if (i >= 7) {
        const weekAvg = data.slice(i - 7, i).reduce((sum, d) => sum + d.value, 0) / 7;
        feature.push(weekAvg);
      }
      
      features.push(feature);
    }
    
    return features;
  }

  private preparePredictionFeatures(horizon: number, factors?: DemandFactors): number[] {
    const feature: number[] = [];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + horizon);
    
    // Time-based features
    feature.push(futureDate.getMonth() + 1);
    feature.push(futureDate.getDate());
    feature.push(futureDate.getDay());
    feature.push(futureDate.getHours());
    
    // Add factor features if available
    if (factors) {
      feature.push(factors.weather.temperature);
      feature.push(factors.weather.humidity);
      feature.push(factors.economic.gdpGrowth);
      feature.push(factors.economic.inflation);
    }
    
    return feature;
  }

  private predictRandomForest(features: number[]): number {
    // Simulate Random Forest prediction
    // In practice, this would aggregate predictions from all trees
    const basePrediction = 1000; // Base demand
    const featureSum = features.reduce((a, b) => a + b, 0);
    return basePrediction + (featureSum * 0.1);
  }

  private calculateFeatureImportance(): Record<string, number> {
    // Simulate feature importance
    return {
      month: 0.25,
      day: 0.15,
      dayOfWeek: 0.20,
      hour: 0.10,
      lag1: 0.15,
      lag2: 0.05,
      weekAgo: 0.10
    };
  }

  private applyFactors(prediction: number, factors: DemandFactors, horizon: number): number {
    let adjusted = prediction;
    adjusted *= (1 + factors.weather.impact);
    adjusted *= (1 + factors.economic.impact);
    adjusted *= (1 + factors.seasonal.seasonality);
    adjusted *= (1 + factors.historical.yearOverYear);
    adjusted *= (1 + factors.external.impact);
    return adjusted;
  }

  private getDefaultFactors(): DemandFactors {
    return {
      weather: { temperature: 20, humidity: 60, precipitation: 0, windSpeed: 10, impact: 0, confidence: 0.5 },
      economic: { gdpGrowth: 0.02, inflation: 0.03, unemployment: 0.05, energyPrices: 0.1, impact: 0, confidence: 0.5 },
      seasonal: { seasonality: 0, trend: 0, holiday: 0, weekly: 0, confidence: 0.5 },
      historical: { dayOfWeek: 0, monthOfYear: 0, yearOverYear: 0, movingAverage: 0, volatility: 0, confidence: 0.5 },
      external: { events: [], disruptions: [], policy: [], impact: 0, confidence: 0.5 }
    };
  }
}

// Ensemble Model that combines multiple models
export class EnsembleDemandModel extends DemandForecastingModel {
  private models: DemandForecastingModel[];
  private weights: number[];

  constructor(config: DemandForecastingConfig, models: DemandForecastingModel[], weights?: number[]) {
    super(config);
    this.models = models;
    this.weights = weights || models.map(() => 1 / models.length);
  }

  async train(data: TimeSeriesData[]): Promise<void> {
    console.log('Training ensemble model with', this.models.length, 'base models');
    
    // Train all base models
    await Promise.all(this.models.map(model => model.train(data)));
    
    this.isTrained = true;
    this.model = {
      type: 'Ensemble',
      models: this.models.map(m => m.model),
      weights: this.weights
    };
  }

  async predict(horizon: number, factors?: DemandFactors): Promise<DemandForecast[]> {
    if (!this.isTrained) {
      throw new Error('Model must be trained before prediction');
    }

    // Get predictions from all models
    const modelPredictions = await Promise.all(
      this.models.map(model => model.predict(horizon, factors))
    );

    const forecasts: DemandForecast[] = [];
    
    for (let i = 0; i < horizon; i++) {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() + i + 1);
      
      // Weighted ensemble prediction
      const predictions = modelPredictions.map(p => p[i].predictedDemand);
      const ensemblePrediction = this.weightedAverage(predictions);
      
      // Calculate ensemble confidence bounds
      const allPredictions = modelPredictions.map(p => p[i].predictedDemand);
      const confidence = this.calculateConfidenceInterval(allPredictions, this.config.confidence);
      
      forecasts.push({
        timestamp,
        demand: 0,
        predictedDemand: ensemblePrediction,
        confidence: this.config.confidence,
        upperBound: confidence.upper,
        lowerBound: confidence.lower,
        factors: factors || this.getDefaultFactors(),
        model: 'ensemble'
      });
    }
    
    return forecasts;
  }

  async evaluate(testData: TimeSeriesData[]): Promise<ModelMetrics> {
    const predictions = await this.predict(testData.length);
    const actual = testData.map(d => d.value);
    const predicted = predictions.map(p => p.predictedDemand);
    
    this.metrics = this.calculateMetrics(actual, predicted);
    return this.metrics;
  }

  private weightedAverage(values: number[]): number {
    return values.reduce((sum, value, index) => sum + value * this.weights[index], 0);
  }

  private getDefaultFactors(): DemandFactors {
    return {
      weather: { temperature: 20, humidity: 60, precipitation: 0, windSpeed: 10, impact: 0, confidence: 0.5 },
      economic: { gdpGrowth: 0.02, inflation: 0.03, unemployment: 0.05, energyPrices: 0.1, impact: 0, confidence: 0.5 },
      seasonal: { seasonality: 0, trend: 0, holiday: 0, weekly: 0, confidence: 0.5 },
      historical: { dayOfWeek: 0, monthOfYear: 0, yearOverYear: 0, movingAverage: 0, volatility: 0, confidence: 0.5 },
      external: { events: [], disruptions: [], policy: [], impact: 0, confidence: 0.5 }
    };
  }
}

// Demand Forecasting Service
export class DemandForecastingService {
  private models: Map<DemandModelType, DemandForecastingModel> = new Map();
  private currentModel: DemandForecastingModel | null = null;

  constructor(config: DemandForecastingConfig) {
    this.initializeModels(config);
  }

  private initializeModels(config: DemandForecastingConfig): void {
    // Initialize all available models
    this.models.set('arima', new ARIMADemandModel(config));
    this.models.set('lstm', new LSTMDemandModel(config));
    this.models.set('random_forest', new RandomForestDemandModel(config));
    
    // Select best model based on configuration
    const primaryModel = config.models[0];
    this.currentModel = this.models.get(primaryModel) || null;
  }

  async trainModel(modelType: DemandModelType, data: TimeSeriesData[]): Promise<void> {
    const model = this.models.get(modelType);
    if (!model) {
      throw new Error(`Model ${modelType} not found`);
    }
    
    await model.train(data);
  }

  async trainAllModels(data: TimeSeriesData[]): Promise<void> {
    await Promise.all(
      Array.from(this.models.entries()).map(([type, model]) => model.train(data))
    );
  }

  async predictDemand(
    horizon: number,
    modelType?: DemandModelType,
    factors?: DemandFactors
  ): Promise<DemandForecast[]> {
    const model = modelType ? this.models.get(modelType) : this.currentModel;
    
    if (!model) {
      throw new Error('No model available for prediction');
    }
    
    return model.predict(horizon, factors);
  }

  async evaluateModel(modelType: DemandModelType, testData: TimeSeriesData[]): Promise<ModelMetrics> {
    const model = this.models.get(modelType);
    if (!model) {
      throw new Error(`Model ${modelType} not found`);
    }
    
    return model.evaluate(testData);
  }

  async getBestModel(testData: TimeSeriesData[]): Promise<DemandModelType> {
    const evaluations = await Promise.all(
      Array.from(this.models.entries()).map(async ([type, model]) => ({
        type,
        metrics: await model.evaluate(testData)
      }))
    );

    // Find model with best accuracy
    const bestModel = evaluations.reduce((best, current) => 
      current.metrics.accuracy > best.metrics.accuracy ? current : best
    );

    return bestModel.type;
  }

  async createEnsemble(
    modelTypes: DemandModelType[],
    weights?: number[]
  ): Promise<EnsembleDemandModel> {
    const models = modelTypes.map(type => this.models.get(type)).filter(Boolean) as DemandForecastingModel[];
    
    if (models.length === 0) {
      throw new Error('No valid models provided for ensemble');
    }

    const config = this.currentModel?.config || {
      horizon: 30,
      models: modelTypes,
      confidence: 0.95,
      includeSeasonality: true,
      includeWeather: true,
      includeEconomic: true
    };

    const ensemble = new EnsembleDemandModel(config, models, weights);
    return ensemble;
  }

  getModelMetrics(modelType: DemandModelType): ModelMetrics | null {
    const model = this.models.get(modelType);
    return model?.metrics || null;
  }

  isModelTrained(modelType: DemandModelType): boolean {
    const model = this.models.get(modelType);
    return model?.isTrained || false;
  }
}

export default DemandForecastingService;
