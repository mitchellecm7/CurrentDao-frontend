/**
 * AI Trading Assistant Types and Interfaces
 * Defines data structures for AI-powered trading recommendations and insights
 */

export interface TradingRecommendation {
  id: string;
  type: 'buy' | 'sell' | 'hold';
  asset: string;
  confidence: number; // 0-1, representing 80%+ accuracy requirement
  reason: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: number;
  timeHorizon: 'short' | 'medium' | 'long';
  timestamp: Date;
  explainableFactors: ExplainableFactor[];
  marketConditions: MarketCondition[];
}

export interface ExplainableFactor {
  factor: string;
  weight: number; // 0-1, contribution to decision
  value: number | string;
  description: string;
  category: 'technical' | 'fundamental' | 'sentiment' | 'market';
}

export interface MarketCondition {
  indicator: string;
  value: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  significance: 'high' | 'medium' | 'low';
}

export interface MarketInsight {
  id: string;
  title: string;
  description: string;
  category: 'trend' | 'volatility' | 'volume' | 'sentiment' | 'news';
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  data: Record<string, any>;
  actionable: boolean;
  relatedAssets: string[];
}

export interface AIUserProfile {
  id: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
  preferredAssets: string[];
  tradingHistory: TradingHistory[];
  behaviorPatterns: BehaviorPattern[];
  learningProgress: LearningProgress;
}

export interface TradingHistory {
  asset: string;
  action: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: Date;
  outcome: 'profit' | 'loss' | 'neutral';
  profitLoss: number;
}

export interface BehaviorPattern {
  pattern: string;
  frequency: number;
  accuracy: number;
  lastObserved: Date;
  description: string;
}

export interface LearningProgress {
  recommendationsGiven: number;
  accuracyRate: number;
  userFeedbackScore: number;
  adaptationRate: number;
  lastUpdated: Date;
}

export interface VoiceCommand {
  command: string;
  intent: string;
  parameters: Record<string, any>;
  confidence: number;
  timestamp: Date;
}

export interface AIAssistantState {
  isActive: boolean;
  isProcessing: boolean;
  currentRecommendation: TradingRecommendation | null;
  insights: MarketInsight[];
  userProfile: AIUserProfile | null;
  voiceEnabled: boolean;
  lastUpdate: Date;
  performance: AIPerformance;
}

export interface AIPerformance {
  responseTime: number; // in milliseconds, target < 500ms
  accuracy: number; // 0-1, target > 0.8
  uptime: number; // percentage
  errorRate: number; // 0-1
  recommendationsProcessed: number;
}

export interface AIQuery {
  type: 'recommendation' | 'insight' | 'analysis' | 'prediction' | 'explanation';
  query: string;
  context?: Record<string, any>;
  parameters?: Record<string, any>;
}

export interface AIResponse {
  id: string;
  query: AIQuery;
  response: any;
  confidence: number;
  processingTime: number;
  timestamp: Date;
  explainable: boolean;
  reasoning?: string;
}

export interface RealTimeMarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  timestamp: Date;
  indicators: TechnicalIndicators;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    ema20: number;
    ema50: number;
  };
  volume: {
    current: number;
    average: number;
    ratio: number;
  };
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  factors: RiskFactor[];
  recommendation: string;
  mitigation: string[];
}

export interface RiskFactor {
  factor: string;
  level: number; // 0-1
  impact: 'low' | 'medium' | 'high';
  description: string;
}

export interface AIConfig {
  modelVersion: string;
  accuracyThreshold: number;
  responseTimeThreshold: number;
  learningEnabled: boolean;
  voiceEnabled: boolean;
  realTimeUpdates: boolean;
  explainableAI: boolean;
  riskAssessmentEnabled: boolean;
}

export interface AIEvent {
  type: 'recommendation_generated' | 'insight_created' | 'user_feedback' | 'model_updated' | 'error';
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}

// Voice interaction types
export interface VoiceInteraction {
  id: string;
  transcript: string;
  intent: string;
  confidence: number;
  response: string;
  timestamp: Date;
  successful: boolean;
}

// Learning system types
export interface LearningData {
  userId: string;
  interactionType: string;
  userInput: any;
  aiResponse: any;
  userFeedback: 'positive' | 'negative' | 'neutral';
  outcome: any;
  timestamp: Date;
}

export interface ModelUpdate {
  version: string;
  accuracyImprovement: number;
  newFeatures: string[];
  bugFixes: string[];
  timestamp: Date;
  changelog: string;
}
