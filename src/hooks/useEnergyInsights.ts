'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

// Types
interface ConsumptionData {
  timestamp: Date
  consumption: number
  cost: number
  appliance?: string
}

interface AnomalyData {
  id: string
  timestamp: Date
  type: 'spike' | 'drop' | 'unusual_pattern'
  severity: 'low' | 'medium' | 'high' | 'critical'
  value: number
  expectedValue: number
  deviation: number
  description: string
  possibleCauses: string[]
  recommendations: string[]
  resolved?: boolean
}

interface EfficiencyData {
  overall: number
  categories: {
    consumption: number
    timing: number
    consistency: number
    renewable: number
    peakManagement: number
  }
  rank: {
    percentile: number
    totalUsers: number
    rank: number
  }
  improvements: Array<{
    priority: 'high' | 'medium' | 'low'
    category: string
    description: string
    potentialSavings: number
    effort: 'easy' | 'moderate' | 'significant'
    actions: string[]
  }>
  trends: Array<{
    period: string
    score: number
  }>
}

interface CostData {
  currentMonthlyCost: number
  projectedSavings: number
  optimizedCost: number
  savingsPercentage: number
  tariffComparison: {
    current: {
      name: string
      type: string
      baseRate: number
      peakRate: number
      offPeakRate: number
      monthlyFee: number
    }
    recommended: {
      name: string
      type: string
      baseRate: number
      peakRate: number
      offPeakRate: number
      monthlyFee: number
    }
    savings: number
  }
  peakHourCosts: Array<{
    hour: string
    cost: number
    consumption: number
    rate: number
  }>
  monthlyBreakdown: Array<{
    month: string
    currentCost: number
    optimizedCost: number
    savings: number
  }>
  recommendations: Array<{
    type: 'tariff' | 'timing' | 'usage' | 'efficiency'
    priority: 'high' | 'medium' | 'low'
    description: string
    potentialSavings: number
    implementation: string
    paybackPeriod: string
  }>
}

interface EnergyInsightsResponse {
  consumptionData: ConsumptionData[]
  anomalies: AnomalyData[]
  efficiencyData: EfficiencyData
  costData: CostData
}

// Mock API service
const fetchEnergyInsights = async (userId?: string, timeRange?: string): Promise<EnergyInsightsResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock data - in real implementation, this would call actual API
  const consumptionData: ConsumptionData[] = Array.from({ length: 168 }, (_, i) => ({
    timestamp: new Date(Date.now() - (168 - i) * 3600000),
    consumption: Math.random() * 5 + 1,
    cost: (Math.random() * 5 + 1) * 0.12,
    appliance: ['HVAC', 'Lighting', 'Appliances', 'Electronics', 'Other'][Math.floor(Math.random() * 5)]
  }))

  const anomalies: AnomalyData[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 24 * 3600000),
      type: 'spike',
      severity: 'high',
      value: 8.5,
      expectedValue: 3.2,
      deviation: 2.66,
      description: 'Unusual consumption spike detected at 7PM',
      possibleCauses: [
        'HVAC system running longer than usual',
        'Multiple appliances running simultaneously',
        'Guest visit or special event'
      ],
      recommendations: [
        'Check thermostat settings',
        'Review appliance usage schedule',
        'Consider smart home automation'
      ]
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 48 * 3600000),
      type: 'drop',
      severity: 'medium',
      value: 0.8,
      expectedValue: 2.5,
      deviation: -0.68,
      description: 'Lower than expected consumption',
      possibleCauses: [
        'Away from home',
        'Power outage',
        'System maintenance'
      ],
      recommendations: [
        'Verify if this pattern is expected',
        'Check for any system issues'
      ]
    }
  ]

  const efficiencyData: EfficiencyData = {
    overall: 72,
    categories: {
      consumption: 68,
      timing: 85,
      consistency: 74,
      renewable: 45,
      peakManagement: 88
    },
    rank: {
      percentile: 68,
      totalUsers: 1247,
      rank: 423
    },
    improvements: [
      {
        priority: 'high',
        category: 'renewable',
        description: 'Increase renewable energy usage',
        potentialSavings: 25.50,
        effort: 'moderate',
        actions: [
          'Switch to green energy tariff',
          'Install solar panels',
          'Purchase renewable energy credits'
        ]
      },
      {
        priority: 'medium',
        category: 'consumption',
        description: 'Reduce overall consumption',
        potentialSavings: 18.75,
        effort: 'easy',
        actions: [
          'Upgrade to LED lighting',
          'Improve insulation',
          'Use energy-efficient appliances'
        ]
      }
    ],
    trends: [
      { period: 'Jan', score: 65 },
      { period: 'Feb', score: 67 },
      { period: 'Mar', score: 70 },
      { period: 'Apr', score: 72 },
      { period: 'May', score: 71 },
      { period: 'Jun', score: 72 }
    ]
  }

  const costData: CostData = {
    currentMonthlyCost: 156.80,
    projectedSavings: 42.50,
    optimizedCost: 114.30,
    savingsPercentage: 27.1,
    tariffComparison: {
      current: {
        name: 'Standard Residential',
        type: 'standard',
        baseRate: 0.12,
        peakRate: 0.15,
        offPeakRate: 0.08,
        monthlyFee: 10.00
      },
      recommended: {
        name: 'Time-of-Use Plus',
        type: 'time-of-use',
        baseRate: 0.10,
        peakRate: 0.22,
        offPeakRate: 0.06,
        monthlyFee: 8.00
      },
      savings: 28.40
    },
    peakHourCosts: Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      cost: Math.random() * 15 + 2,
      consumption: Math.random() * 5 + 1,
      rate: hour >= 18 && hour <= 22 ? 0.22 : hour >= 6 && hour <= 10 ? 0.15 : 0.06
    })),
    monthlyBreakdown: [
      { month: 'Jan', currentCost: 145.20, optimizedCost: 112.80, savings: 32.40 },
      { month: 'Feb', currentCost: 138.50, optimizedCost: 108.20, savings: 30.30 },
      { month: 'Mar', currentCost: 156.80, optimizedCost: 114.30, savings: 42.50 },
      { month: 'Apr', currentCost: 142.30, optimizedCost: 109.60, savings: 32.70 },
      { month: 'May', currentCost: 148.90, optimizedCost: 115.40, savings: 33.50 },
      { month: 'Jun', currentCost: 165.40, optimizedCost: 125.80, savings: 39.60 }
    ],
    recommendations: [
      {
        type: 'tariff',
        priority: 'high',
        description: 'Switch to Time-of-Use tariff plan',
        potentialSavings: 28.40,
        implementation: 'Contact utility provider to change tariff plan',
        paybackPeriod: 'Immediate'
      },
      {
        type: 'timing',
        priority: 'high',
        description: 'Shift heavy usage to off-peak hours',
        potentialSavings: 18.75,
        implementation: 'Run dishwasher, laundry, and charging during off-peak hours',
        paybackPeriod: '1 month'
      }
    ]
  }

  return {
    consumptionData,
    anomalies,
    efficiencyData,
    costData
  }
}

export const useEnergyInsights = (userId?: string, timeRange?: string) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('week')
  const [refreshInterval, setRefreshInterval] = useState<number>(30000) // 30 seconds

  const {
    data: insightsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['energyInsights', userId, timeRange || selectedTimeRange],
    queryFn: () => fetchEnergyInsights(userId, timeRange || selectedTimeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: refreshInterval,
    enabled: true
  })

  // Extract specific data for components
  const consumptionData = insightsData?.consumptionData || []
  const anomalies = insightsData?.anomalies || []
  const efficiencyData = insightsData?.efficiencyData
  const costData = insightsData?.costData

  // Manual refresh function
  const refresh = useCallback(() => {
    refetch()
  }, [refetch])

  // Update refresh interval
  const updateRefreshInterval = useCallback((interval: number) => {
    setRefreshInterval(interval)
  }, [])

  // Update time range
  const updateTimeRange = useCallback((range: string) => {
    setSelectedTimeRange(range)
  }, [])

  // Get anomaly statistics
  const getAnomalyStats = useCallback(() => {
    if (!anomalies.length) return null

    const total = anomalies.length
    const critical = anomalies.filter(a => a.severity === 'critical').length
    const high = anomalies.filter(a => a.severity === 'high').length
    const medium = anomalies.filter(a => a.severity === 'medium').length
    const low = anomalies.filter(a => a.severity === 'low').length
    const resolved = anomalies.filter(a => a.resolved).length

    return { total, critical, high, medium, low, resolved }
  }, [anomalies])

  // Get consumption summary
  const getConsumptionSummary = useCallback(() => {
    if (!consumptionData.length) return null

    const totalConsumption = consumptionData.reduce((sum, data) => sum + data.consumption, 0)
    const totalCost = consumptionData.reduce((sum, data) => sum + data.cost, 0)
    const averageConsumption = totalConsumption / consumptionData.length
    const averageCost = totalCost / consumptionData.length

    return {
      totalConsumption,
      totalCost,
      averageConsumption,
      averageCost,
      dataPoints: consumptionData.length
    }
  }, [consumptionData])

  // Get efficiency insights
  const getEfficiencyInsights = useCallback(() => {
    if (!efficiencyData) return null

    const { overall, categories, rank, improvements, trends } = efficiencyData

    return {
      overall,
      categories,
      rank,
      improvements,
      trends,
      topPriorityImprovement: improvements.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })[0],
      trendDirection: trends.length > 1 ? 
        (trends[trends.length - 1].score > trends[trends.length - 2].score ? 'up' : 'down') : 'stable'
    }
  }, [efficiencyData])

  // Get cost optimization insights
  const getCostInsights = useCallback(() => {
    if (!costData) return null

    const {
      currentMonthlyCost,
      projectedSavings,
      optimizedCost,
      savingsPercentage,
      tariffComparison,
      recommendations
    } = costData

    const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0)
    const highPrioritySavings = recommendations
      .filter(rec => rec.priority === 'high')
      .reduce((sum, rec) => sum + rec.potentialSavings, 0)

    return {
      currentMonthlyCost,
      projectedSavings,
      optimizedCost,
      savingsPercentage,
      tariffComparison,
      totalPotentialSavings,
      highPrioritySavings,
      recommendations: recommendations.sort((a, b) => b.potentialSavings - a.potentialSavings),
      annualSavings: projectedSavings * 12
    }
  }, [costData])

  return {
    // Raw data
    consumptionData,
    anomalies,
    efficiencyData,
    costData,
    
    // Loading and error states
    isLoading,
    error,
    
    // Actions
    refresh,
    updateRefreshInterval,
    updateTimeRange,
    
    // Computed insights
    anomalyStats: getAnomalyStats(),
    consumptionSummary: getConsumptionSummary(),
    efficiencyInsights: getEfficiencyInsights(),
    costInsights: getCostInsights(),
    
    // Current settings
    selectedTimeRange,
    refreshInterval
  }
}

export default useEnergyInsights
