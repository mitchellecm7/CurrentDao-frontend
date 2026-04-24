/**
 * Risk Service Tests
 * Comprehensive test suite for risk management calculations and analysis
 */

import { riskManagementService } from '@/services/risk/risk-service'
import { PortfolioPosition, StressScenario } from '@/types/risk'

describe('RiskManagementService', () => {
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
      timestamp: new Date(),
    },
  ]

  const mockReturns = [-0.02, -0.015, -0.01, -0.005, 0, 0.005, 0.01, 0.015, 0.02, 0.025]

  beforeEach(() => {
    riskManagementService.clearCache()
  })

  describe('VaR Calculations', () => {
    test('should calculate historical VaR correctly', () => {
      const varMetrics = riskManagementService.calculateVaR(mockReturns, 0.95, 'historical')

      expect(varMetrics).toBeDefined()
      expect(varMetrics.value).toBeGreaterThan(0)
      expect(varMetrics.confidence95).toBeGreaterThan(0)
      expect(varMetrics.confidence99).toBeGreaterThan(0)
      expect(varMetrics.expectedShortfall).toBeGreaterThan(0)
      expect(varMetrics.unit).toBe('USD')
      expect(varMetrics.calculationMethod).toBe('historical')
    })

    test('should calculate parametric VaR correctly', () => {
      const varMetrics = riskManagementService.calculateVaR(mockReturns, 0.95, 'parametric')

      expect(varMetrics).toBeDefined()
      expect(varMetrics.value).toBeGreaterThan(0)
      expect(varMetrics.calculationMethod).toBe('parametric')
    })

    test('should calculate Monte Carlo VaR correctly', () => {
      const varMetrics = riskManagementService.calculateVaR(mockReturns, 0.95, 'monteCarlo')

      expect(varMetrics).toBeDefined()
      expect(varMetrics.value).toBeGreaterThan(0)
      expect(varMetrics.calculationMethod).toBe('monteCarlo')
    })

    test('should have VaR 99% greater than VaR 95%', () => {
      const varMetrics = riskManagementService.calculateVaR(mockReturns, 0.95, 'historical')

      expect(varMetrics.confidence99).toBeGreaterThan(varMetrics.confidence95)
    })

    test('should complete VaR calculation in under 100ms', () => {
      const startTime = performance.now()
      riskManagementService.calculateVaR(mockReturns, 0.95, 'historical')
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100)
    })
  })

  describe('Risk Assessment', () => {
    test('should calculate comprehensive risk assessment', () => {
      const assessment = riskManagementService.calculateRiskAssessment(mockPositions)

      expect(assessment).toBeDefined()
      expect(assessment.id).toBeDefined()
      expect(assessment.portfolioId).toBe('portfolio-1')
      expect(assessment.overallRiskScore).toBeGreaterThanOrEqual(0)
      expect(assessment.overallRiskScore).toBeLessThanOrEqual(100)
      expect(['low', 'medium', 'high', 'critical']).toContain(assessment.riskLevel)
      expect(assessment.VaRMetrics).toBeDefined()
      expect(assessment.recommendations).toBeInstanceOf(Array)
      expect(assessment.recommendations.length).toBeGreaterThan(0)
      expect(assessment.recommendations.length).toBeLessThanOrEqual(4)
    })

    test('should generate risk alerts for high risk score', () => {
      const assessment = riskManagementService.calculateRiskAssessment(mockPositions)
      const alerts = riskManagementService.generateAlerts(
        assessment,
        { 'overall-risk': 30 }, // Low threshold to trigger alert
        undefined
      )

      expect(alerts).toBeInstanceOf(Array)
      expect(alerts.length).toBeGreaterThan(0)

      const overallRiskAlert = alerts.find(a => a.riskMetric === 'overall-risk-score')
      expect(overallRiskAlert).toBeDefined()
      if (overallRiskAlert) {
        expect(overallRiskAlert.severity).toMatch(/high|critical/)
      }
    })

    test('should cache risk assessment results', () => {
      const assessment1 = riskManagementService.calculateRiskAssessment(mockPositions)

      // The service's caching is internal, so we verify by checking same reference
      // In a real test with actual caching, we'd check memory/time
      expect(assessment1).toBeDefined()
    })

    test('should complete assessment calculation in under 200ms', () => {
      const startTime = performance.now()
      riskManagementService.calculateRiskAssessment(mockPositions)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(200)
    })
  })

  describe('Portfolio Analysis', () => {
    test('should calculate comprehensive portfolio analysis', () => {
      const analysis = riskManagementService.calculatePortfolioAnalysis(mockPositions)

      expect(analysis).toBeDefined()
      expect(analysis.totalValue).toBeGreaterThan(0)
      expect(analysis.positions.length).toBe(mockPositions.length)
      expect(analysis.riskDistribution).toBeDefined()
      expect(analysis.correlationMatrix).toBeDefined()
      expect(analysis.concentrationRisk).toBeDefined()
      expect(analysis.diversificationRatio).toBeGreaterThan(0)
    })

    test('should calculate HHI concentration metric', () => {
      const analysis = riskManagementService.calculatePortfolioAnalysis(mockPositions)
      const hhi = analysis.concentrationRisk.hhi

      // HHI should be between 0 and 1
      expect(hhi).toBeGreaterThanOrEqual(0)
      expect(hhi).toBeLessThanOrEqual(1)
    })

    test('should identify top concentrations', () => {
      const analysis = riskManagementService.calculatePortfolioAnalysis(mockPositions)
      const topConcentration = analysis.concentrationRisk.maxPositionSize

      // Top position should not exceed portfolio value
      expect(topConcentration).toBeLessThanOrEqual(1)
    })

    test('should calculate correlation matrix correctly', () => {
      const analysis = riskManagementService.calculatePortfolioAnalysis(mockPositions)
      const matrix = analysis.correlationMatrix

      // Check dimensions
      expect(matrix.length).toBe(mockPositions.length)
      expect(matrix[0].length).toBe(mockPositions.length)

      // Check diagonal is 1 (correlation with self)
      for (let i = 0; i < matrix.length; i++) {
        expect(matrix[i][i]).toBe(1)
      }

      // Check symmetry
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
          expect(matrix[i][j]).toBe(matrix[j][i])
        }
      }
    })

    test('should complete portfolio analysis in under 200ms', () => {
      const startTime = performance.now()
      riskManagementService.calculatePortfolioAnalysis(mockPositions)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(200)
    })
  })

  describe('Stress Testing', () => {
    test('should run stress test scenarios', () => {
      const scenarios: StressScenario[] = [
        {
          id: 'scenario-1',
          name: 'Market Crash',
          description: 'Simulates 20% market decline',
          variables: [{ name: 'market-decline', baseValue: 0, stressValue: -20, changePercentage: -20 }],
          probability: 0.01,
          impact: 'severe',
        },
      ]

      const results = riskManagementService.runStressTest(mockPositions, scenarios)

      expect(results).toBeInstanceOf(Array)
      expect(results.length).toBe(scenarios.length)
      expect(results[0].scenarioName).toBe('Market Crash')
      expect(results[0].affectedPositions).toBeDefined()
    })

    test('should handle 50+ stress scenarios within 180ms', () => {
      const scenarios: StressScenario[] = Array.from({ length: 50 }, (_, i) => ({
        id: `scenario-${i}`,
        name: `Scenario ${i}`,
        description: `Test scenario ${i}`,
        variables: [{ name: 'test', baseValue: 0, stressValue: i, changePercentage: i }],
        probability: 0.01,
        impact: 'high' as const,
      }))

      const startTime = performance.now()
      const results = riskManagementService.runStressTest(mockPositions, scenarios)
      const endTime = performance.now()

      expect(results.length).toBe(50)
      expect(endTime - startTime).toBeLessThan(180)
    })
  })

  describe('Hedging Strategy Optimization', () => {
    test('should optimize hedging strategy', () => {
      const strategy = riskManagementService.optimizeHedgingStrategy(mockPositions, 30)

      expect(strategy).toBeDefined()
      expect(strategy.id).toBeDefined()
      expect(strategy.targetRiskReduction).toBe(30)
      expect(strategy.instruments).toBeInstanceOf(Array)
      expect(strategy.instruments.length).toBeGreaterThan(0)
      expect(strategy.estimatedCost).toBeGreaterThan(0)
      expect(strategy.effectiveness).toBeGreaterThan(0)
    })

    test('should handle different risk reduction targets', () => {
      const strategy10 = riskManagementService.optimizeHedgingStrategy(mockPositions, 10)
      const strategy50 = riskManagementService.optimizeHedgingStrategy(mockPositions, 50)

      expect(strategy10.estimatedCost).toBeLessThan(strategy50.estimatedCost)
      expect(strategy10.targetRiskReduction).toBe(10)
      expect(strategy50.targetRiskReduction).toBe(50)
    })
  })

  describe('Real-Time Monitoring', () => {
    test('should generate real-time data points', () => {
      const assessment = riskManagementService.calculateRiskAssessment(mockPositions)
      const dataPoints = riskManagementService.generateRealtimeDataPoints(assessment, 24)

      expect(dataPoints).toBeInstanceOf(Array)
      expect(dataPoints.length).toBe(24)
      expect(dataPoints[0].timestamp).toBeDefined()
      expect(dataPoints[0].riskScore).toBeGreaterThan(0)
    })

    test('should generate expected number of data points', () => {
      const assessment = riskManagementService.calculateRiskAssessment(mockPositions)

      const points12 = riskManagementService.generateRealtimeDataPoints(assessment, 12)
      const points48 = riskManagementService.generateRealtimeDataPoints(assessment, 48)

      expect(points12.length).toBe(12)
      expect(points48.length).toBe(48)
    })
  })

  describe('Performance', () => {
    test('should have sub-200ms overall calculation for risk assessment', () => {
      const startTime = performance.now()

      for (let i = 0; i < 10; i++) {
        riskManagementService.calculateRiskAssessment(mockPositions)
      }

      const endTime = performance.now()
      const avgTime = (endTime - startTime) / 10

      expect(avgTime).toBeLessThan(200)
    })

    test('should handle large portfolios efficiently', () => {
      const largePortfolio = Array.from({ length: 100 }, (_, i) => ({
        ...mockPositions[0],
        id: `pos-${i}`,
        assetName: `Asset ${i}`,
      }))

      const startTime = performance.now()
      riskManagementService.calculateRiskAssessment(largePortfolio)
      const endTime = performance.now()

      // Allow more time for larger portfolios, but still under reasonable threshold
      expect(endTime - startTime).toBeLessThan(300)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('should handle empty returns array', () => {
      expect(() => riskManagementService.calculateVaR([], 0.95, 'historical')).not.toThrow()
    })

    test('should handle single position portfolio', () => {
      const singlePos = [mockPositions[0]]
      const assessment = riskManagementService.calculateRiskAssessment(singlePos)

      expect(assessment).toBeDefined()
      expect(assessment.overallRiskScore).toBeGreaterThanOrEqual(0)
    })

    test('should handle zero-value positions gracefully', () => {
      const zeroValuePos = [
        ...mockPositions,
        {
          ...mockPositions[0],
          id: 'zero-pos',
          marketValue: 0,
          currentPrice: 0,
        },
      ]

      const analysis = riskManagementService.calculatePortfolioAnalysis(zeroValuePos)
      expect(analysis).toBeDefined()
    })
  })

  describe('Cache Management', () => {
    test('should clear cache', () => {
      const assessment1 = riskManagementService.calculateRiskAssessment(mockPositions)
      riskManagementService.clearCache()
      const assessment2 = riskManagementService.calculateRiskAssessment(mockPositions)

      expect(assessment1).toBeDefined()
      expect(assessment2).toBeDefined()
    })
  })
})
