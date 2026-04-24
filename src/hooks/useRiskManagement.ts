/**
 * useRiskManagement Hook
 * Manages risk dashboard state, data fetching, and real-time monitoring
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useQueries, UseQueryResult } from '@tanstack/react-query'
import {
  RiskAssessment,
  PortfolioAnalysis,
  RiskAlert,
  StressTestingAnalysis,
  HedgingStrategy,
  PortfolioPosition,
  RealTimeMonitoringData,
  RiskDashboardState,
  StressScenario,
} from '@/types/risk'
import { riskManagementService } from '@/services/risk/risk-service'

const DEFAULT_THRESHOLD = 70
const REFRESH_INTERVAL = 30000 // 30 seconds
const ALERT_THRESHOLDS = {
  'overall-risk': 70,
  'var': 0.05,
  'correlation-spike': 0.8,
  'liquidity-spread': 0.05,
}

export function useRiskManagement(portfolioId: string = 'portfolio-1') {
  const [state, setState] = useState<RiskDashboardState>({
    isLoading: false,
    error: null,
    riskAssessment: null,
    portfolioAnalysis: null,
    realtimeData: null,
    hedgingStrategies: [],
    stressTestingAnalysis: null,
    alerts: [],
    lastUpdate: null,
    autoRefresh: true,
    refreshInterval: REFRESH_INTERVAL,
  })

  const previousAssessmentRef = useRef<RiskAssessment | null>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()

  // Mock portfolio data - in production, fetch from API
  const mockPositions: PortfolioPosition[] = [
    {
      id: 'pos-1',
      assetId: 'energy-1',
      assetName: 'Solar Energy Futures',
      assetType: 'futures',
      quantity: 100,
      currentPrice: 45.2,
      marketValue: 4520,
      costBasis: 4500,
      unrealizedPnL: 20,
      realizedPnL: 150,
      riskContribution: 8.5,
      beta: 1.2,
      duration: 0.25,
      convexity: 0.02,
      timestamp: new Date(),
    },
    {
      id: 'pos-2',
      assetId: 'energy-2',
      assetName: 'Wind Power Swap',
      assetType: 'swap',
      quantity: 50,
      currentPrice: 52.3,
      marketValue: 2615,
      costBasis: 2600,
      unrealizedPnL: 15,
      realizedPnL: 200,
      riskContribution: 6.2,
      beta: 0.95,
      duration: 1.5,
      convexity: 0.05,
      timestamp: new Date(),
    },
    {
      id: 'pos-3',
      assetId: 'energy-3',
      assetName: 'Hydroelectric Options',
      assetType: 'option',
      quantity: 75,
      currentPrice: 28.5,
      marketValue: 2137.5,
      costBasis: 2100,
      unrealizedPnL: 37.5,
      realizedPnL: 100,
      riskContribution: 5.3,
      beta: 1.45,
      duration: 2,
      convexity: 0.8,
      greeks: {
        delta: 0.65,
        gamma: 0.02,
        vega: 0.15,
        theta: -0.05,
        rho: 0.1,
      },
      timestamp: new Date(),
    },
    {
      id: 'pos-4',
      assetId: 'energy-4',
      assetName: 'Geothermal Forward',
      assetType: 'energy',
      quantity: 200,
      currentPrice: 35.8,
      marketValue: 7160,
      costBasis: 7000,
      unrealizedPnL: 160,
      realizedPnL: 500,
      riskContribution: 10.1,
      beta: 0.8,
      duration: 0.5,
      convexity: 0.01,
      timestamp: new Date(),
    },
    {
      id: 'pos-5',
      assetId: 'energy-5',
      assetName: 'Battery Storage Rights',
      assetType: 'derivative',
      quantity: 60,
      currentPrice: 41.2,
      marketValue: 2472,
      costBasis: 2450,
      unrealizedPnL: 22,
      realizedPnL: 75,
      riskContribution: 4.9,
      beta: 1.1,
      duration: 1,
      convexity: 0.15,
      timestamp: new Date(),
    },
  ]

  /**
   * Fetch and calculate risk assessment
   */
  const fetchRiskAssessment = useCallback(async () => {
    try {
      setState((prev: RiskDashboardState) => ({ ...prev, isLoading: true, error: null }))

      // Calculate assessment using service
      const assessment = riskManagementService.calculateRiskAssessment(mockPositions)

      // Generate alerts based on thresholds
      const alerts = riskManagementService.generateAlerts(
        assessment,
        ALERT_THRESHOLDS,
        previousAssessmentRef.current || undefined
      )

      previousAssessmentRef.current = assessment

      setState((prev: RiskDashboardState) => ({
        ...prev,
        riskAssessment: assessment,
        alerts,
        lastUpdate: new Date(),
        isLoading: false,
      }))

      return assessment
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch risk assessment'
      setState((prev: RiskDashboardState) => ({ ...prev, error: errorMessage, isLoading: false }))
      throw error
    }
  }, [])

  /**
   * Fetch and calculate portfolio analysis
   */
  const fetchPortfolioAnalysis = useCallback(async () => {
    try {
      setState((prev: RiskDashboardState) => ({ ...prev, isLoading: true }))

      const analysis = riskManagementService.calculatePortfolioAnalysis(mockPositions)

      setState((prev: RiskDashboardState) => ({
        ...prev,
        portfolioAnalysis: analysis,
        lastUpdate: new Date(),
      }))

      return analysis
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch portfolio analysis'
      setState((prev: RiskDashboardState) => ({ ...prev, error: errorMessage }))
      throw error
    }
  }, [])

  /**
   * Fetch all dashboard data in parallel
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setState((prev: RiskDashboardState) => ({ ...prev, isLoading: true, error: null }))

      // Fetch in parallel for better performance
      const [assessment, analysis] = await Promise.all([
        fetchRiskAssessment(),
        fetchPortfolioAnalysis(),
      ])

      // Generate real-time monitoring data
      const realtimeData: RealTimeMonitoringData = {
        portfolioId,
        currentRiskScore: assessment.overallRiskScore,
        alerts: state.alerts,
        recentBreaches: state.alerts.filter((a: RiskAlert) => a.actionRequired),
        healthStatus: assessment.riskLevel === 'critical' ? 'critical' : assessment.riskLevel === 'high' ? 'warning' : 'healthy',
        lastUpdate: new Date(),
        updateFrequency: REFRESH_INTERVAL,
        dataPoints: riskManagementService.generateRealtimeDataPoints(assessment),
      }

      setState((prev: RiskDashboardState) => ({
        ...prev,
        realtimeData,
        isLoading: false,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data'
      setState((prev: RiskDashboardState) => ({ ...prev, error: errorMessage, isLoading: false }))
    }
  }, [portfolioId, fetchRiskAssessment, fetchPortfolioAnalysis, state.alerts])

  /**
   * Run stress testing
   */
  const runStressTest = useCallback(async (scenarios: StressScenario[]) => {
    try {
      setState((prev: RiskDashboardState) => ({ ...prev, isLoading: true }))

      const results = riskManagementService.runStressTest(mockPositions, scenarios)

      const stressTestingAnalysis: StressTestingAnalysis = {
        portfolioId,
        scenarios,
        results,
        worstCaseScenario: results.reduce((worst: any, current: any) =>
          Math.abs(current.pnlChange) > Math.abs(worst.pnlChange) ? current : worst
        ),
        bestCaseScenario: results.reduce((best: any, current: any) =>
          Math.abs(current.pnlChange) < Math.abs(best.pnlChange) ? current : best
        ),
        riskMetrics: {},
        timestamp: new Date(),
      }

      setState((prev: RiskDashboardState) => ({
        ...prev,
        stressTestingAnalysis,
        isLoading: false,
      }))

      return stressTestingAnalysis
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to run stress test'
      setState((prev: RiskDashboardState) => ({ ...prev, error: errorMessage, isLoading: false }))
      throw error
    }
  }, [portfolioId])

  /**
   * Optimize hedging strategy
   */
  const optimizeHedge = useCallback(async (targetRiskReduction: number) => {
    try {
      setState((prev: RiskDashboardState) => ({ ...prev, isLoading: true }))

      const strategy = riskManagementService.optimizeHedgingStrategy(mockPositions, targetRiskReduction)

      setState((prev: RiskDashboardState) => ({
        ...prev,
        hedgingStrategies: [...prev.hedgingStrategies, strategy],
        isLoading: false,
      }))

      return strategy
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to optimize hedging strategy'
      setState((prev: RiskDashboardState) => ({ ...prev, error: errorMessage, isLoading: false }))
      throw error
    }
  }, [])

  /**
   * Update hedging strategy status
   */
  const updateHedgeStrategy = useCallback((strategyId: string, status: string) => {
    setState((prev: RiskDashboardState) => ({
      ...prev,
      hedgingStrategies: prev.hedgingStrategies.map((s: HedgingStrategy) =>
        s.id === strategyId ? { ...s, status: status as any } : s
      ),
    }))
  }, [])

  /**
   * Acknowledge alert
   */
  const acknowledgeAlert = useCallback((alertId: string) => {
    setState((prev: RiskDashboardState) => ({
      ...prev,
      alerts: prev.alerts.map((a: RiskAlert) =>
        a.id === alertId
          ? { ...a, acknowledged: true, acknowledgedAt: new Date() }
          : a
      ),
    }))
  }, [])

  /**
   * Clear cache and refresh data
   */
  const refreshData = useCallback(async () => {
    riskManagementService.clearCache()
    await fetchDashboardData()
  }, [fetchDashboardData])

  /**
   * Set auto-refresh
   */
  const setAutoRefresh = useCallback((enabled: boolean) => {
    setState((prev: RiskDashboardState) => ({ ...prev, autoRefresh: enabled }))
  }, [])

  /**
   * Initial data fetch and auto-refresh setup
   */
  useEffect(() => {
    // Initial fetch
    fetchDashboardData()

    // Set up auto-refresh if enabled
    if (state.autoRefresh) {
      refreshTimeoutRef.current = setInterval(fetchDashboardData, state.refreshInterval)
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current)
      }
    }
  }, [state.autoRefresh, state.refreshInterval, fetchDashboardData])

  return {
    // State
    ...state,

    // Actions
    fetchDashboardData,
    fetchRiskAssessment,
    fetchPortfolioAnalysis,
    runStressTest,
    optimizeHedge,
    updateHedgeStrategy,
    acknowledgeAlert,
    refreshData,
    setAutoRefresh,

    // Utilities
    mockPositions,
  }
}
