import { useState, useEffect } from 'react'
import { StakingPosition, StakingProtocol, EarningsCalculation } from '../types/staking'
import { sorobanStakingService } from '../services/staking/soroban-integration'

export function useStaking() {
  const [positions, setPositions] = useState<StakingPosition[]>([])
  const [protocols, setProtocols] = useState<StakingProtocol[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadStakingData = async () => {
    try {
      setIsLoading(true)
      
      // Mock data for demonstration
      const mockPositions: StakingPosition[] = [
        {
          id: 'pos-1',
          protocol: 'CurrentDAO Staking',
          stakedToken: 'WATT',
          stakedAmount: 12500,
          currentAPY: 8.5,
          accumulatedRewards: 156.78,
          rewardToken: 'WATT',
          stakeDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          autoCompound: true,
          riskRating: 'LOW',
          contractAddress: 'CDLZFC3SYJYDZT7K67VZ75GJVFPNZ2GFEKCCUH5DUCJZABVMSHYVVU57',
          isActive: true,
          historicalAPY: generateMockAPYHistory()
        },
        {
          id: 'pos-2',
          protocol: 'Liquidity Pool Staking',
          stakedToken: 'SOLAR-WATT-LP',
          stakedAmount: 8500,
          currentAPY: 12.3,
          accumulatedRewards: 289.45,
          rewardToken: 'WATT',
          stakeDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          autoCompound: false,
          riskRating: 'MEDIUM',
          contractAddress: 'CA3D5KRYM6CB7OWDX6D7RPOWZOUX6Y5M566RXJGFOWIYRJCKJGRZFRNF',
          isActive: true,
          historicalAPY: generateMockAPYHistory()
        },
        {
          id: 'pos-3',
          protocol: 'Carbon Credit Staking',
          stakedToken: 'CARBON_CREDITS',
          stakedAmount: 5000,
          currentAPY: 15.7,
          accumulatedRewards: 412.33,
          rewardToken: 'WATT',
          stakeDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          autoCompound: true,
          riskRating: 'HIGH',
          contractAddress: 'CB3D5KRYM6CB7OWDX6D7RPOWZOUX6Y5M566RXJGFOWIYRJCKJGRZFRNF',
          isActive: true,
          historicalAPY: generateMockAPYHistory()
        }
      ]

      const mockProtocols: StakingProtocol[] = [
        {
          id: 'protocol-1',
          name: 'CurrentDAO Staking',
          description: 'Stake WATT tokens for governance and rewards',
          contractAddress: 'CDLZFC3SYJYDZT7K67VZ75GJVFPNZ2GFEKCCUH5DUCJZABVMSHYVVU57',
          riskRating: 'LOW',
          supportedTokens: ['WATT'],
          baseAPY: 8.5,
          lockPeriodOptions: [0, 7, 30, 90],
          autoCompoundSupported: true,
          performanceFee: 0.1,
          minimumStake: 100,
          isActive: true,
          icon: '⚡'
        },
        {
          id: 'protocol-2',
          name: 'Liquidity Pool Staking',
          description: 'Provide liquidity and earn trading fees',
          contractAddress: 'CA3D5KRYM6CB7OWDX6D7RPOWZOUX6Y5M566RXJGFOWIYRJCKJGRZFRNF',
          riskRating: 'MEDIUM',
          supportedTokens: ['WATT', 'SOLAR', 'WIND'],
          baseAPY: 12.3,
          lockPeriodOptions: [0, 30, 60],
          autoCompoundSupported: true,
          performanceFee: 0.15,
          minimumStake: 500,
          isActive: true,
          icon: '💧'
        }
      ]

      setPositions(mockPositions)
      setProtocols(mockProtocols)
    } catch (error) {
      console.error('Error loading staking data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockAPYHistory = () => {
    const history: { date: string; apy: number }[] = []
    const baseAPY = 8.5
    const days = 90
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const variation = (Math.random() - 0.5) * 4
      history.push({
        date: date.toISOString().split('T')[0],
        apy: baseAPY + variation
      })
    }
    
    return history
  }

  const claimRewards = async (positionId: string) => {
    try {
      const position = positions.find(p => p.id === positionId)
      if (!position) return

      setIsRefreshing(true)
      await sorobanStakingService.claimRewards(position.contractAddress)
      
      // Update position to reset rewards
      setPositions(prev => prev.map(p => 
        p.id === positionId ? { ...p, accumulatedRewards: 0 } : p
      ))
      
      return true
    } catch (error) {
      console.error('Error claiming rewards:', error)
      return false
    } finally {
      setIsRefreshing(false)
    }
  }

  const toggleAutoCompound = async (positionId: string, enabled: boolean) => {
    try {
      const position = positions.find(p => p.id === positionId)
      if (!position) return

      await sorobanStakingService.toggleAutoCompound(position.contractAddress, enabled)
      
      setPositions(prev => prev.map(p => 
        p.id === positionId ? { ...p, autoCompound: enabled } : p
      ))
      
      return true
    } catch (error) {
      console.error('Error toggling auto-compound:', error)
      return false
    }
  }

  const calculateEarningsProjection = (principal: number, apy: number, compoundFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly', timeHorizon: number): EarningsCalculation => {
    let compoundTimesPerYear = 1
    switch (compoundFrequency) {
      case 'daily': compoundTimesPerYear = 365; break
      case 'weekly': compoundTimesPerYear = 52; break
      case 'monthly': compoundTimesPerYear = 12; break
      case 'yearly': compoundTimesPerYear = 1; break
    }
    
    const rate = apy / 100 / compoundTimesPerYear
    const totalCompounds = (timeHorizon / 365) * compoundTimesPerYear
    const finalAmount = principal * Math.pow(1 + rate, totalCompounds)
    const earnings = finalAmount - principal
    
    const breakdown: { period: string; earnings: number; totalValue: number }[] = []
    const periods = Math.min(12, Math.ceil(timeHorizon / 30))
    
    for (let i = 1; i <= periods; i++) {
      const periodDays = Math.min(30, timeHorizon - (i - 1) * 30)
      const periodCompounds = (periodDays / 365) * compoundTimesPerYear
      const periodFinal = principal * Math.pow(1 + rate, i * (30 / 365) * compoundTimesPerYear)
      const periodEarnings = periodFinal - (i === 1 ? principal : breakdown[i - 2].totalValue)
      
      breakdown.push({
        period: `Month ${i}`,
        earnings: periodEarnings,
        totalValue: periodFinal
      })
    }
    
    return {
      principal,
      apy,
      compoundFrequency,
      timeHorizon,
      projectedEarnings: earnings,
      totalValue: finalAmount,
      breakdown
    }
  }

  useEffect(() => {
    loadStakingData()
  }, [])

  return {
    positions,
    protocols,
    isLoading,
    isRefreshing,
    loadStakingData,
    claimRewards,
    toggleAutoCompound,
    calculateEarnings: calculateEarningsProjection
  }
}
