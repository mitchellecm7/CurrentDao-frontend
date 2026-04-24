'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  GasFeeEstimate, 
  FeeOptimization, 
  SpeedCostOption, 
  HistoricalFeeData, 
  FeeAlert,
  GasCalculatorInputs,
  GasCalculatorResult
} from '@/types/gas'
import { 
  calculateGasEstimate, 
  optimizeFee, 
  getSpeedCostOptions, 
  generateHistoricalData,
  calculateGasFee,
  calculateOptimalFeeWindow
} from '@/utils/gasCalculations'

interface UseGasFeesReturn {
  currentEstimate: GasFeeEstimate | null
  speedOptions: SpeedCostOption[]
  historicalData: HistoricalFeeData[]
  alerts: FeeAlert[]
  loading: boolean
  error: string | null
  optimizeCurrentFee: (fee: number, targetTime: number) => FeeOptimization
  calculateTransactionFee: (inputs: GasCalculatorInputs) => GasCalculatorResult
  acknowledgeAlert: (alertId: string) => void
  refreshData: () => void
  networkCongestion: 'low' | 'medium' | 'high'
}

// Mock data for demonstration
const mockAlerts: FeeAlert[] = [
  {
    id: '1',
    type: 'optimal_window',
    message: 'Network congestion is low - optimal time for transactions!',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    acknowledged: false
  },
  {
    id: '2',
    type: 'fee_drop',
    message: 'Base fee dropped by 15% in the last hour',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    acknowledged: false
  }
]

export const useGasFees = (): UseGasFeesReturn => {
  const [alerts, setAlerts] = useState<FeeAlert[]>(mockAlerts)
  const [networkCongestion, setNetworkCongestion] = useState<'low' | 'medium' | 'high'>('medium')

  // Simulate network congestion changes
  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random()
      setNetworkCongestion(random > 0.7 ? 'high' : random > 0.4 ? 'medium' : 'low')
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Fetch current gas estimate
  const {
    data: currentEstimate = null,
    isLoading: estimateLoading,
    error: estimateError,
    refetch: refetchEstimate
  } = useQuery({
    queryKey: ['gasEstimate', networkCongestion],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return calculateGasEstimate(networkCongestion)
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000 // 1 minute
  })

  // Fetch speed options
  const {
    data: speedOptions = [],
    isLoading: speedLoading,
    refetch: refetchSpeedOptions
  } = useQuery({
    queryKey: ['speedOptions', networkCongestion],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return getSpeedCostOptions(networkCongestion)
    },
    staleTime: 30000,
    refetchInterval: 60000
  })

  // Fetch historical data
  const {
    data: historicalData = [],
    isLoading: historicalLoading,
    refetch: refetchHistorical
  } = useQuery({
    queryKey: ['historicalFees'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 800))
      return generateHistoricalData(30) // 30 days
    },
    staleTime: 300000, // 5 minutes
    refetchInterval: 600000 // 10 minutes
  })

  // Simulate real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random()
      if (random > 0.9) {
        const newAlert: FeeAlert = {
          id: Date.now().toString(),
          type: random > 0.95 ? 'congestion_spike' : 'optimal_window',
          message: random > 0.95 
            ? 'Network congestion spike detected - fees may increase'
            : 'Optimal transaction window detected',
          timestamp: new Date(),
          acknowledged: false
        }
        setAlerts(prev => [newAlert, ...prev].slice(0, 5)) // Keep only last 5 alerts
      }
    }, 45000) // Check every 45 seconds

    return () => clearInterval(interval)
  }, [])

  const optimizeCurrentFee = useCallback((fee: number, targetTime: number): FeeOptimization => {
    return optimizeFee(fee, targetTime, networkCongestion)
  }, [networkCongestion])

  const calculateTransactionFee = useCallback((inputs: GasCalculatorInputs): GasCalculatorResult => {
    return calculateGasFee(inputs)
  }, [])

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    )
  }, [])

  const refreshData = useCallback(() => {
    refetchEstimate()
    refetchSpeedOptions()
    refetchHistorical()
  }, [refetchEstimate, refetchSpeedOptions, refetchHistorical])

  const loading = estimateLoading || speedLoading || historicalLoading
  const error = estimateError?.message || null

  return {
    currentEstimate,
    speedOptions,
    historicalData,
    alerts,
    loading,
    error,
    optimizeCurrentFee,
    calculateTransactionFee,
    acknowledgeAlert,
    refreshData,
    networkCongestion
  }
}
