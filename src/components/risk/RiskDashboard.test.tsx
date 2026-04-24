/**
 * Risk Dashboard Component Tests
 * Tests for the main risk management dashboard
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { RiskDashboard } from '@/components/risk/RiskDashboard'

// Mock the useRiskManagement hook
jest.mock('@/hooks/useRiskManagement', () => ({
  useRiskManagement: () => ({
    isLoading: false,
    error: null,
    riskAssessment: {
      id: 'risk-1',
      portfolioId: 'portfolio-1',
      timestamp: new Date(),
      overallRiskScore: 45,
      riskLevel: 'medium',
      VaRMetrics: {
        value: 0.035,
        confidence95: 0.035,
        confidence99: 0.055,
        expectedShortfall: 0.045,
        unit: 'USD',
        calculationMethod: 'historical',
        timestamp: new Date(),
      },
      creditRisk: {
        value: 500,
        confidence: 0.95,
        unit: 'USD',
        timestamp: new Date(),
        trend: 'stable',
        threshold: 1000,
        severity: 'low',
      },
      marketRisk: {
        value: 2.5,
        confidence: 0.95,
        unit: 'percent',
        timestamp: new Date(),
        trend: 'up',
        threshold: 5,
        severity: 'low',
      },
      operationalRisk: {
        value: 0.1,
        confidence: 0.9,
        unit: 'score',
        timestamp: new Date(),
        trend: 'stable',
        threshold: 0.5,
        severity: 'low',
      },
      liquidityRisk: {
        value: 0.05,
        confidence: 0.95,
        unit: 'basis-points',
        timestamp: new Date(),
        trend: 'stable',
        threshold: 0.05,
        severity: 'low',
      },
      counterpartyRisk: {
        value: 250,
        confidence: 0.95,
        unit: 'USD',
        timestamp: new Date(),
        trend: 'stable',
        threshold: 500,
        severity: 'low',
      },
      recommendations: ['Maintain current portfolio', 'Monitor VaR levels'],
      updatedAt: new Date(),
    },
    portfolioAnalysis: {
      id: 'portfolio-1',
      portfolioId: 'portfolio-1',
      totalValue: 20000,
      positions: [],
      riskDistribution: {
        byAssetType: { futures: 5, swap: 3 },
        byRiskFactor: {},
        bySector: {},
        byMaturities: {},
      },
      correlationMatrix: [[1, 0.5], [0.5, 1]],
      concentrationRisk: {
        hhi: 0.35,
        top10Concentration: 0.5,
        top20Concentration: 0.8,
        maxPositionSize: 0.25,
        maxAssetClassExposure: 0.4,
      },
      diversificationRatio: 1.5,
      riskAttributionByAsset: [],
      riskAttributionByFactor: [],
      timestamp: new Date(),
    },
    realtimeData: {
      portfolioId: 'portfolio-1',
      currentRiskScore: 45,
      alerts: [],
      recentBreaches: [],
      healthStatus: 'healthy',
      lastUpdate: new Date(),
      updateFrequency: 30000,
      dataPoints: [],
    },
    hedgingStrategies: [],
    stressTestingAnalysis: null,
    alerts: [],
    lastUpdate: new Date(),
    autoRefresh: true,
    refreshInterval: 30000,
    fetchDashboardData: jest.fn(),
    fetchRiskAssessment: jest.fn(),
    fetchPortfolioAnalysis: jest.fn(),
    runStressTest: jest.fn(),
    optimizeHedge: jest.fn(),
    updateHedgeStrategy: jest.fn(),
    acknowledgeAlert: jest.fn(),
    refreshData: jest.fn(),
    setAutoRefresh: jest.fn(),
    mockPositions: [],
  }),
}))

// Mock the sub-components
jest.mock('@/components/risk/PortfolioAnalysis', () => ({
  PortfolioAnalysis: () => 'Portfolio Analysis Mock',
}))

jest.mock('@/components/risk/VaRCalculations', () => ({
  VaRCalculations: () => 'VaR Calculations Mock',
}))

jest.mock('@/components/risk/RealTimeMonitoring', () => ({
  RealTimeMonitoring: () => 'Real Time Monitoring Mock',
}))

jest.mock('@/components/risk/HedgingStrategies', () => ({
  HedgingStrategies: () => 'Hedging Strategies Mock',
}))

jest.mock('@/components/StatsCard', () => ({
  StatsCard: ({ title, value }: any) => `${title}: ${value}`,
}))

describe('RiskDashboard Component', () => {
  test('should render dashboard with title', () => {
    render(<RiskDashboard />)

    const title = screen.getByText(/Risk Management Dashboard/i)
    expect(title).toBeInTheDocument()
  })

  test('should display risk assessment metrics', () => {
    render(<RiskDashboard />)

    expect(screen.getByText(/Value at Risk/i)).toBeInTheDocument()
    expect(screen.getByText(/Market Risk/i)).toBeInTheDocument()
    expect(screen.getByText(/Credit Risk/i)).toBeInTheDocument()
  })

  test('should have tab navigation', () => {
    render(<RiskDashboard />)

    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Var')).toBeInTheDocument()
    expect(screen.getByText('Monitoring')).toBeInTheDocument()
    expect(screen.getByText('Hedging')).toBeInTheDocument()
  })

  test('should allow tab switching', () => {
    render(<RiskDashboard />)

    const portfolioTab = screen.getByText('Portfolio')
    fireEvent.click(portfolioTab)

    expect(screen.getByText('Portfolio Analysis Mock')).toBeInTheDocument()
  })

  test('should have refresh button', () => {
    render(<RiskDashboard />)

    const refreshButton = screen.getByRole('button', { name: /Refresh/i })
    expect(refreshButton).toBeInTheDocument()
  })

  test('should have auto-refresh toggle', () => {
    render(<RiskDashboard />)

    expect(screen.getByText(/Auto-refresh/i)).toBeInTheDocument()
  })

  test('should display risk level', () => {
    render(<RiskDashboard />)

    expect(screen.getByText(/Risk Level/i)).toBeInTheDocument()
    expect(screen.getByText('MEDIUM')).toBeInTheDocument()
  })

  test('should display risk score', () => {
    render(<RiskDashboard />)

    expect(screen.getByText(/45.0/)).toBeInTheDocument()
  })
})
