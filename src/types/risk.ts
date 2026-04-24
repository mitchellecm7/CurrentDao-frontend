/**
 * Risk Management Types
 * Comprehensive type definitions for risk assessment, portfolio analysis, and monitoring
 */

// Risk Assessment Types
export interface RiskMetrics {
  value: number
  confidence: number
  unit: string
  timestamp: Date
  trend: 'up' | 'down' | 'stable'
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface RiskAssessment {
  id: string
  portfolioId: string
  timestamp: Date
  overallRiskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  VaRMetrics: VaRMetrics
  creditRisk: RiskMetrics
  marketRisk: RiskMetrics
  operationalRisk: RiskMetrics
  liquidityRisk: RiskMetrics
  counterpartyRisk: RiskMetrics
  recommendations: string[]
  updatedAt: Date
}

// VaR Calculation Types
export interface VaRMetrics {
  value: number
  confidence95: number
  confidence99: number
  expectedShortfall: number
  unit: string
  calculationMethod: 'historical' | 'parametric' | 'monteCarlo'
  timestamp: Date
}

export interface VaRCalculation {
  portfolioId: string
  value: number
  confidence: number // 95 or 99
  period: number // days
  method: 'historical' | 'parametric' | 'monteCarlo'
  expectedShortfall: number
  historicalData: number[]
  timestamp: Date
}

// Portfolio Risk Types
export interface PortfolioPosition {
  id: string
  assetId: string
  assetName: string
  assetType: 'energy' | 'derivative' | 'futures' | 'option' | 'swap'
  quantity: number
  currentPrice: number
  marketValue: number
  costBasis: number
  unrealizedPnL: number
  realizedPnL: number
  riskContribution: number
  beta: number
  duration: number
  convexity?: number
  greeks?: OptionGreeks
  timestamp: Date
}

export interface OptionGreeks {
  delta: number
  gamma: number
  vega: number
  theta: number
  rho: number
}

export interface PortfolioAnalysis {
  id: string
  portfolioId: string
  totalValue: number
  positions: PortfolioPosition[]
  riskDistribution: RiskDistribution
  correlationMatrix: number[][]
  concentrationRisk: ConcentrationRisk
  diversificationRatio: number
  riskAttributionByAsset: RiskAttribution[]
  riskAttributionByFactor: RiskAttribution[]
  timestamp: Date
}

export interface RiskDistribution {
  byAssetType: Record<string, number>
  byRiskFactor: Record<string, number>
  bySector: Record<string, number>
  byMaturities: Record<string, number>
}

export interface ConcentrationRisk {
  hhi: number // Herfindahl-Hirschman Index
  top10Concentration: number
  top20Concentration: number
  maxPositionSize: number
  maxAssetClassExposure: number
}

export interface RiskAttribution {
  name: string
  value: number
  percentage: number
  marginalRisk: number
}

// Hedging Strategy Types
export interface HedgeInstrument {
  id: string
  type: 'futures' | 'options' | 'swaps' | 'forwards'
  underlying: string
  quantity: number
  strikePrice?: number
  expirationDate?: Date
  delta: number
  gamma: number
  theta: number
  vega: number
  cost: number
  effectiveness: number // percentage 0-100
}

export interface HedgingStrategy {
  id: string
  portfolioId: string
  riskType: string
  objective: 'minimize' | 'reduce-to-target' | 'optimize'
  targetRiskReduction: number // percentage
  instruments: HedgeInstrument[]
  estimatedCost: number
  projectedRiskReduction: number
  effectiveness: number
  status: 'proposed' | 'active' | 'completed' | 'archived'
  createdAt: Date
  startDate: Date
  endDate: Date
  performance: StrategyPerformance
}

export interface StrategyPerformance {
  actualRiskReduction: number
  costActual: number
  costEstimated: number
  roi: number
  effectiveness: number
  createdAt: Date
}

// Real-Time Monitoring Types
export interface RiskAlert {
  id: string
  portfolioId: string
  type: 'threshold-breach' | 'anomaly' | 'correlation-spike' | 'liquidity-warning' | 'counterparty-warning'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  riskMetric: string
  currentValue: number
  threshold: number
  timestamp: Date
  acknowledged: boolean
  acknowledgedAt?: Date
  acknowledgedBy?: string
  actionRequired: boolean
  suggestedAction?: string
}

export interface RealTimeMonitoringData {
  portfolioId: string
  currentRiskScore: number
  alerts: RiskAlert[]
  recentBreaches: RiskAlert[]
  healthStatus: 'healthy' | 'warning' | 'critical'
  lastUpdate: Date
  updateFrequency: number // milliseconds
  dataPoints: RiskDataPoint[]
}

export interface RiskDataPoint {
  timestamp: Date
  riskScore: number
  marketPrice: number
  volatility: number
  correlation: number
  liquiditySpread: number
}

// Stress Testing Types
export interface StressScenario {
  id: string
  name: string
  description: string
  variables: ScenarioVariable[]
  probability?: number
  impact: 'low' | 'medium' | 'high' | 'severe'
}

export interface ScenarioVariable {
  name: string
  baseValue: number
  stressValue: number
  changePercentage: number
}

export interface StressTestResult {
  id: string
  portfolioId: string
  scenarioId: string
  scenarioName: string
  pnlChange: number
  riskMetricChange: number
  affectedPositions: PortfolioPosition[]
  recommendations: string[]
  timestamp: Date
}

export interface StressTestingAnalysis {
  portfolioId: string
  scenarios: StressScenario[]
  results: StressTestResult[]
  worstCaseScenario: StressTestResult
  bestCaseScenario: StressTestResult
  riskMetrics: Record<string, StressTestResult[]>
  timestamp: Date
}

// Risk Reporting Types
export interface RiskReport {
  id: string
  portfolioId: string
  reportDate: Date
  reportPeriod: {
    start: Date
    end: Date
  }
  executiveSummary: string
  riskAssessment: RiskAssessment
  portfolioAnalysis: PortfolioAnalysis
  hedgingStrategies: HedgingStrategy[]
  stressTestResults: StressTestingAnalysis
  alerts: RiskAlert[]
  recommendations: string[]
  keyMetrics: Record<string, number>
  generatedAt: Date
}

export interface ReportExportOptions {
  format: 'pdf' | 'csv' | 'json'
  includeCharts: boolean
  includeTables: boolean
  detailLevel: 'summary' | 'detailed' | 'comprehensive'
}

// Risk Management Configuration
export interface RiskManagementConfig {
  portfolioId: string
  updateFrequency: number // milliseconds
  varConfidenceLevels: number[] // [95, 99]
  stressScenarios: string[] // scenario IDs
  alertThresholds: Record<string, number>
  hedgingObjective: 'minimize-risk' | 'optimize-return' | 'target-reduction'
  targetRiskReduction: number
  rebalancingFrequency: 'daily' | 'weekly' | 'monthly'
}

// Dashboard State Types
export interface RiskDashboardState {
  isLoading: boolean
  error: string | null
  riskAssessment: RiskAssessment | null
  portfolioAnalysis: PortfolioAnalysis | null
  realtimeData: RealTimeMonitoringData | null
  hedgingStrategies: HedgingStrategy[]
  stressTestingAnalysis: StressTestingAnalysis | null
  alerts: RiskAlert[]
  lastUpdate: Date | null
  autoRefresh: boolean
  refreshInterval: number
}

// API Response Types
export interface RiskDataResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: Date
}

export interface RiskBatchResponse {
  assessments: RiskAssessment[]
  portfolioAnalysis: PortfolioAnalysis
  hedgingStrategies: HedgingStrategy[]
  stressTestResults: StressTestingAnalysis
  alerts: RiskAlert[]
  timestamp: Date
}
