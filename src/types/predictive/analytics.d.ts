/**
 * TypeScript definitions for CurrentDao Predictive Analytics System
 * Comprehensive type definitions for demand forecasting, price prediction, and external factor integration
 */

// Base types
export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface PredictionResult {
  predicted: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  timestamp: Date;
  model: string;
  accuracy?: number;
}

export interface ModelMetrics {
  mae: number; // Mean Absolute Error
  mse: number; // Mean Squared Error
  rmse: number; // Root Mean Squared Error
  mape: number; // Mean Absolute Percentage Error
  r2: number; // R-squared
  accuracy: number; // Overall accuracy percentage
}

// Demand Forecasting Types
export interface DemandForecastingConfig {
  horizon: number; // Days to forecast
  models: DemandModelType[];
  confidence: number; // Confidence level (0-1)
  includeSeasonality: boolean;
  includeWeather: boolean;
  includeEconomic: boolean;
}

export type DemandModelType = 
  | 'arima'
  | 'prophet'
  | 'lstm'
  | 'random_forest'
  | 'gradient_boost'
  | 'ensemble';

export interface DemandForecast {
  timestamp: Date;
  demand: number;
  predictedDemand: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  factors: DemandFactors;
  model: DemandModelType;
}

export interface DemandFactors {
  weather: WeatherImpact;
  economic: EconomicImpact;
  seasonal: SeasonalImpact;
  historical: HistoricalImpact;
  external: ExternalImpact;
}

export interface WeatherImpact {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  impact: number; // -1 to 1 scale
  confidence: number;
}

export interface EconomicImpact {
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  energyPrices: number;
  impact: number;
  confidence: number;
}

export interface SeasonalImpact {
  seasonality: number; // Seasonal factor
  trend: number; // Trend component
  holiday: number; // Holiday impact
  weekly: number; // Weekly pattern
  confidence: number;
}

export interface HistoricalImpact {
  dayOfWeek: number;
  monthOfYear: number;
  yearOverYear: number;
  movingAverage: number;
  volatility: number;
  confidence: number;
}

export interface ExternalImpact {
  events: ExternalEvent[];
  disruptions: SupplyDisruption[];
  policy: PolicyChange[];
  impact: number;
  confidence: number;
}

export interface ExternalEvent {
  id: string;
  type: 'sporting' | 'concert' | 'conference' | 'holiday' | 'other';
  name: string;
  date: Date;
  location: string;
  expectedImpact: number;
  confidence: number;
}

export interface SupplyDisruption {
  id: string;
  type: 'maintenance' | 'outage' | 'weather' | 'market' | 'regulatory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration: number; // Hours
  impact: number;
  probability: number;
  timeframe: {
    start: Date;
    end: Date;
  };
}

export interface PolicyChange {
  id: string;
  type: 'regulation' | 'subsidy' | 'tax' | 'incentive';
  description: string;
  effectiveDate: Date;
  impact: number;
  probability: number;
}

// Price Prediction Types
export interface PricePredictionConfig {
  horizon: number; // Days to predict
  models: PriceModelType[];
  factors: PriceFactorType[];
  confidence: number;
  includeVolatility: boolean;
}

export type PriceModelType = 
  | 'arima'
  | 'garch'
  | 'lstm'
  | 'random_forest'
  | 'gradient_boost'
  | 'neural_network'
  | 'ensemble';

export type PriceFactorType = 
  | 'demand'
  | 'supply'
  | 'weather'
  | 'economic'
  | 'market_sentiment'
  | 'policy'
  | 'seasonal'
  | 'competition';

export interface PricePrediction {
  timestamp: Date;
  price: number;
  predictedPrice: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  volatility: number;
  factors: PriceFactors;
  model: PriceModelType;
}

export interface PriceFactors {
  demand: number;
  supply: number;
  weather: number;
  economic: number;
  marketSentiment: number;
  policy: number;
  seasonal: number;
  competition: number;
  weights: Record<PriceFactorType, number>;
}

// Seasonal Analysis Types
export interface SeasonalPattern {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  strength: number; // 0-1 scale
  phase: number; // Phase offset
  confidence: number;
  significance: number; // Statistical significance (p-value)
  pattern: number[]; // Pattern values
}

export interface SeasonalDecomposition {
  trend: TimeSeriesData[];
  seasonal: TimeSeriesData[];
  residual: TimeSeriesData[];
  original: TimeSeriesData[];
  strength: {
    trend: number;
    seasonal: number;
  };
  confidence: number;
}

export interface SeasonalForecast {
  timestamp: Date;
  seasonalComponent: number;
  trendComponent: number;
  residualComponent: number;
  forecast: number;
  confidence: number;
  pattern: SeasonalPattern;
}

// External Factors Integration Types
export interface ExternalFactor {
  id: string;
  name: string;
  type: ExternalFactorType;
  source: string;
  updateFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  reliability: number; // 0-1 scale
  impact: number; // -1 to 1 scale
  data: ExternalFactorData[];
}

export type ExternalFactorType = 
  | 'weather'
  | 'economic'
  | 'market'
  | 'policy'
  | 'social'
  | 'environmental'
  | 'technological';

export interface ExternalFactorData {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
  quality: number; // Data quality score
}

export interface ExternalFactorIntegration {
  factors: ExternalFactor[];
  correlations: FactorCorrelation[];
  weights: Record<string, number>;
  lastUpdate: Date;
  confidence: number;
}

export interface FactorCorrelation {
  factor1: string;
  factor2: string;
  correlation: number; // -1 to 1
  significance: number; // p-value
  lag: number; // Lag in periods
  stability: number; // Stability over time
}

// Confidence and Uncertainty Types
export interface ConfidenceInterval {
  lower: number;
  upper: number;
  level: number; // Confidence level (0-1)
  method: 'normal' | 'bootstrap' | 'bayesian' | 'monte_carlo';
}

export interface UncertaintyQuantification {
  variance: number;
  standardDeviation: number;
  skewness: number;
  kurtosis: number;
  confidenceInterval: ConfidenceInterval;
  predictionDistribution: PredictionDistribution;
}

export interface PredictionDistribution {
  type: 'normal' | 'log_normal' | 'gamma' | 'beta' | 'custom';
  parameters: Record<string, number>;
  samples: number[];
  percentiles: Record<number, number>;
}

// Model Training and Evaluation Types
export interface ModelTrainingConfig {
  algorithm: string;
  parameters: Record<string, any>;
  crossValidation: CrossValidationConfig;
  featureEngineering: FeatureEngineeringConfig;
  hyperparameterTuning: HyperparameterTuningConfig;
}

export interface CrossValidationConfig {
  method: 'kfold' | 'time_series' | 'holdout';
  folds: number;
  shuffle: boolean;
  stratify: boolean;
}

export interface FeatureEngineeringConfig {
  scaling: 'standard' | 'minmax' | 'robust' | 'none';
  encoding: 'one_hot' | 'label' | 'target' | 'none';
  selection: 'univariate' | 'recursive' | 'lasso' | 'none';
  dimensionality: 'pca' | 'lda' | 'none';
}

export interface HyperparameterTuningConfig {
  method: 'grid' | 'random' | 'bayesian' | 'genetic';
  iterations: number;
  cvFolds: number;
  scoring: string;
}

export interface ModelEvaluation {
  model: string;
  metrics: ModelMetrics;
  featureImportance: FeatureImportance[];
  confusionMatrix?: number[][];
  rocCurve?: ROCPoint[];
  learningCurve?: LearningCurvePoint[];
  validationScore: number;
  trainingTime: number;
  inferenceTime: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
  direction: 'positive' | 'negative';
}

export interface ROCPoint {
  falsePositiveRate: number;
  truePositiveRate: number;
  threshold: number;
}

export interface LearningCurvePoint {
  trainingSize: number;
  trainingScore: number;
  validationScore: number;
}

// Scenario Modeling Types
export interface Scenario {
  id: string;
  name: string;
  description: string;
  type: 'baseline' | 'optimistic' | 'pessimistic' | 'custom';
  assumptions: ScenarioAssumption[];
  probability: number;
  timeframe: {
    start: Date;
    end: Date;
  };
}

export interface ScenarioAssumption {
  factor: string;
  value: number;
  change: number; // Percentage change from baseline
  confidence: number;
  description: string;
}

export interface ScenarioResult {
  scenario: Scenario;
  predictions: PredictionResult[];
  impact: ScenarioImpact;
  confidence: number;
  sensitivity: SensitivityAnalysis;
}

export interface ScenarioImpact {
  demand: number;
  price: number;
  revenue: number;
  costs: number;
  profitability: number;
  risk: number;
}

export interface SensitivityAnalysis {
  factor: string;
  sensitivity: number; // Elasticity
  range: {
    min: number;
    max: number;
  };
  impact: number;
}

// API Response Types
export interface PredictiveAnalyticsResponse<T> {
  success: boolean;
  data: T;
  metadata: ResponseMetadata;
  errors?: string[];
}

export interface ResponseMetadata {
  timestamp: Date;
  processingTime: number;
  requestId: string;
  version: string;
  cacheHit: boolean;
}

// Hook Return Types
export interface UsePredictiveAnalyticsReturn {
  demand: {
    forecasts: DemandForecast[];
    loading: boolean;
    error: string | null;
    accuracy: number;
    lastUpdate: Date;
  };
  price: {
    predictions: PricePrediction[];
    loading: boolean;
    error: string | null;
    accuracy: number;
    lastUpdate: Date;
  };
  seasonal: {
    patterns: SeasonalPattern[];
    decomposition: SeasonalDecomposition;
    loading: boolean;
    error: string | null;
  };
  external: {
    factors: ExternalFactor[];
    correlations: FactorCorrelation[];
    loading: boolean;
    error: string | null;
    lastUpdate: Date;
  };
  scenarios: {
    results: ScenarioResult[];
    loading: boolean;
    error: string | null;
  };
  refresh: () => Promise<void>;
  updateConfig: (config: Partial<PredictiveAnalyticsConfig>) => void;
}

export interface PredictiveAnalyticsConfig {
  demand: DemandForecastingConfig;
  price: PricePredictionConfig;
  seasonal: {
    periods: string[];
    significance: number;
    confidence: number;
  };
  external: {
    factors: string[];
    updateFrequency: string;
    reliability: number;
  };
  scenarios: {
    enabled: boolean;
    types: string[];
    probability: number;
  };
}

// Utility Types
export type TimeRange = {
  start: Date;
  end: Date;
};

export type Granularity = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type ModelStatus = 'training' | 'ready' | 'updating' | 'error' | 'deprecated';

export type DataQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'insufficient';

// Chart and Visualization Types
export interface ChartDataPoint {
  x: Date | string | number;
  y: number;
  y_upper?: number;
  y_lower?: number;
  metadata?: Record<string, any>;
}

export interface PredictionChartData {
  actual: ChartDataPoint[];
  predicted: ChartDataPoint[];
  confidence: ChartDataPoint[];
  factors?: Record<string, ChartDataPoint[]>;
}

export interface SeasonalChartData {
  original: ChartDataPoint[];
  trend: ChartDataPoint[];
  seasonal: ChartDataPoint[];
  residual: ChartDataPoint[];
}

export interface FactorImpactChartData {
  factor: string;
  impact: number;
  confidence: number;
  correlation: number;
  data: ChartDataPoint[];
}

// Export all types
export * from './analytics';
