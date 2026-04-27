'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Award, 
  Clock, 
  DollarSign, 
  Zap, 
  Sun, 
  Wind, 
  Droplet, 
  Flame, 
  Leaf,
  Plus,
  Minus,
  Info,
  Calendar,
  BarChart3,
  Target,
  Gift
} from 'lucide-react'
import { useEnergyExchange } from '../../hooks/useEnergyExchange'
import { toast } from 'react-hot-toast'

export type EnergyAssetType = 
  | 'WATT' 
  | 'SOLAR' 
  | 'WIND' 
  | 'HYDRO' 
  | 'GEOTHERMAL' 
  | 'BIOMASS'
  | 'NATURAL_GAS'
  | 'COAL'
  | 'NUCLEAR'
  | 'CARBON_CREDITS'

interface Farm {
  id: string
  name: string
  description: string
  stakedToken: EnergyAssetType
  rewardTokens: {
    token: EnergyAssetType
    apr: number
    dailyReward: number
  }[]
  totalStaked: number
  myStaked: number
  lockPeriod: number
  multiplier: number
  isActive: boolean
  endsAt?: number
  performanceFee: number
}

interface FarmPosition {
  farmId: string
  stakedAmount: number
  pendingRewards: {
    token: EnergyAssetType
    amount: number
  }[]
  stakeTimestamp: number
  lockEndTimestamp: number
  isLocked: boolean
}

export function YieldFarming() {
  const [activeTab, setActiveTab] = useState<'farms' | 'positions'>('farms')
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null)
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [showUnstakeModal, setShowUnstakeModal] = useState(false)
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [unstakePercentage, setUnstakePercentage] = useState('100')
  
  const {
    farms,
    userPositions,
    isLoading,
    stake,
    unstake,
    claimRewards,
    calculateRewards,
    getFarmMultiplier
  } = useEnergyExchange()

  const mockFarms: Farm[] = [
    {
      id: 'watt-single',
      name: 'WATT Single Stake',
      description: 'Stake WATT tokens to earn additional WATT rewards',
      stakedToken: 'WATT',
      rewardTokens: [
        { token: 'WATT', apr: 8.5, dailyReward: 0.0233 }
      ],
      totalStaked: 2500000,
      myStaked: 12500,
      lockPeriod: 0,
      multiplier: 1.0,
      isActive: true,
      performanceFee: 0.1
    },
    {
      id: 'solar-watt-lp',
      name: 'SOLAR-WATT LP Farm',
      description: 'Stake SOLAR-WATT LP tokens to earn multiple rewards',
      stakedToken: 'SOLAR-WATT-LP',
      rewardTokens: [
        { token: 'WATT', apr: 12.5, dailyReward: 0.0342 },
        { token: 'SOLAR', apr: 6.2, dailyReward: 0.0170 }
      ],
      totalStaked: 1850000,
      myStaked: 25000,
      lockPeriod: 30,
      multiplier: 1.5,
      isActive: true,
      performanceFee: 0.15
    },
    {
      id: 'multi-energy',
      name: 'Multi-Energy Booster',
      description: 'Stake any energy asset for boosted rewards',
      stakedToken: 'ANY',
      rewardTokens: [
        { token: 'WATT', apr: 15.2, dailyReward: 0.0416 },
        { token: 'CARBON_CREDITS', apr: 8.8, dailyReward: 0.0241 }
      ],
      totalStaked: 3200000,
      myStaked: 0,
      lockPeriod: 90,
      multiplier: 2.0,
      isActive: true,
      endsAt: Date.now() + 90 * 24 * 60 * 60 * 1000,
      performanceFee: 0.2
    },
    {
      id: 'carbon-offset',
      name: 'Carbon Offset Program',
      description: 'Stake carbon credits for environmental rewards',
      stakedToken: 'CARBON_CREDITS',
      rewardTokens: [
        { token: 'WATT', apr: 18.7, dailyReward: 0.0512 },
        { token: 'CARBON_CREDITS', apr: 12.3, dailyReward: 0.0337 }
      ],
      totalStaked: 980000,
      myStaked: 15000,
      lockPeriod: 180,
      multiplier: 2.5,
      isActive: true,
      performanceFee: 0.25
    },
    {
      id: 'renewable-bonus',
      name: 'Renewable Energy Bonus',
      description: 'Bonus rewards for renewable energy stakers',
      stakedToken: 'RENEWABLE',
      rewardTokens: [
        { token: 'WATT', apr: 22.1, dailyReward: 0.0605 },
        { token: 'SOLAR', apr: 10.5, dailyReward: 0.0288 },
        { token: 'WIND', apr: 8.9, dailyReward: 0.0244 }
      ],
      totalStaked: 1450000,
      myStaked: 0,
      lockPeriod: 60,
      multiplier: 1.8,
      isActive: false,
      endsAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      performanceFee: 0.18
    }
  ]

  const mockPositions: FarmPosition[] = [
    {
      farmId: 'watt-single',
      stakedAmount: 12500,
      pendingRewards: [
        { token: 'WATT', amount: 145.8 }
      ],
      stakeTimestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
      lockEndTimestamp: 0,
      isLocked: false
    },
    {
      farmId: 'solar-watt-lp',
      stakedAmount: 25000,
      pendingRewards: [
        { token: 'WATT', amount: 289.2 },
        { token: 'SOLAR', amount: 143.6 }
      ],
      stakeTimestamp: Date.now() - 25 * 24 * 60 * 60 * 1000,
      lockEndTimestamp: Date.now() + 5 * 24 * 60 * 60 * 1000,
      isLocked: true
    },
    {
      farmId: 'carbon-offset',
      stakedAmount: 15000,
      pendingRewards: [
        { token: 'WATT', amount: 412.7 },
        { token: 'CARBON_CREDITS', amount: 272.1 }
      ],
      stakeTimestamp: Date.now() - 45 * 24 * 60 * 60 * 1000,
      lockEndTimestamp: Date.now() + 135 * 24 * 60 * 60 * 1000,
      isLocked: true
    }
  ]

  const getFarmById = (id: string) => mockFarms.find(farm => farm.id === id)

  const getTokenIcon = (token: EnergyAssetType) => {
    const icons = {
      'WATT': <Zap className="w-4 h-4" />,
      'SOLAR': <Sun className="w-4 h-4" />,
      'WIND': <Wind className="w-4 h-4" />,
      'HYDRO': <Droplet className="w-4 h-4" />,
      'GEOTHERMAL': <Flame className="w-4 h-4" />,
      'BIOMASS': <Leaf className="w-4 h-4" />,
      'NATURAL_GAS': <Flame className="w-4 h-4" />,
      'COAL': <Flame className="w-4 h-4" />,
      'NUCLEAR': <Zap className="w-4 h-4" />,
      'CARBON_CREDITS': <Leaf className="w-4 h-4" />
    }
    return icons[token] || <Zap className="w-4 h-4" />
  }

  const handleStake = async () => {
    if (!selectedFarm || !stakeAmount) {
      toast.error('Please enter a valid stake amount')
      return
    }

    try {
      await stake({
        farmId: selectedFarm,
        amount: parseFloat(stakeAmount)
      })
      
      toast.success('Staked successfully')
      setShowStakeModal(false)
      setStakeAmount('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Stake failed')
    }
  }

  const handleUnstake = async () => {
    if (!selectedFarm || !unstakeAmount) {
      toast.error('Please enter a valid unstake amount')
      return
    }

    try {
      await unstake({
        farmId: selectedFarm,
        amount: parseFloat(unstakeAmount),
        percentage: parseFloat(unstakePercentage)
      })
      
      toast.success('Unstaked successfully')
      setShowUnstakeModal(false)
      setUnstakeAmount('')
      setUnstakePercentage('100')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unstake failed')
    }
  }

  const handleClaimRewards = async (farmId: string) => {
    try {
      await claimRewards(farmId)
      toast.success('Rewards claimed successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to claim rewards')
    }
  }

  const totalStaked = mockFarms.reduce((sum, farm) => sum + farm.myStaked, 0)
  const totalPendingRewards = mockPositions.reduce((sum, pos) => 
    sum + pos.pendingRewards.reduce((rewardSum, reward) => rewardSum + reward.amount, 0), 0
  )

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Yield Farming</h2>
            <p className="text-sm text-gray-600">Stake assets and earn multiple rewards</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Staked</p>
            <p className="text-xl font-bold text-gray-900">${totalStaked.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Pending Rewards</p>
            <p className="text-xl font-bold text-green-600">${totalPendingRewards.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('farms')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'farms' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Available Farms ({mockFarms.filter(f => f.isActive).length})
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'positions' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          My Positions ({mockPositions.length})
        </button>
      </div>

      {activeTab === 'farms' ? (
        <div className="space-y-4">
          {mockFarms.map((farm) => (
            <div key={farm.id} className={`bg-gray-50 rounded-lg p-4 ${!farm.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{farm.name}</h3>
                    <p className="text-sm text-gray-600">{farm.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        farm.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {farm.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {farm.multiplier > 1 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                          {farm.multiplier}x Multiplier
                        </span>
                      )}
                      {farm.lockPeriod > 0 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                          {farm.lockPeriod} days lock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total APR</p>
                    <p className="font-semibold text-green-600">
                      {farm.rewardTokens.reduce((sum, r) => sum + r.apr, 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">TVL</p>
                    <p className="font-semibold text-gray-900">${(farm.totalStaked / 1000).toFixed(0)}K</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFarm(farm.id)
                      setShowStakeModal(true)
                    }}
                    disabled={!farm.isActive}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Stake
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Reward Tokens</p>
                  <div className="space-y-1">
                    {farm.rewardTokens.map((reward, index) => (
                      <div key={index} className="flex items-center gap-1">
                        {getTokenIcon(reward.token)}
                        <span className="font-medium text-gray-900">
                          {reward.apr}% {reward.token}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Your Stake</p>
                  <p className="font-medium text-gray-900">
                    {farm.myStaked > 0 ? `${farm.myStaked.toLocaleString()} ${farm.stakedToken}` : 'Not staking'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Performance Fee</p>
                  <p className="font-medium text-gray-900">{(farm.performanceFee * 100).toFixed(1)}%</p>
                  {farm.endsAt && (
                    <p className="text-xs text-orange-600 mt-1">
                      Ends {new Date(farm.endsAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {mockPositions.map((position) => {
            const farm = getFarmById(position.farmId)
            return (
              <div key={position.farmId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{farm?.name}</h3>
                      <p className="text-sm text-gray-600">
                        Staked: {new Date(position.stakeTimestamp).toLocaleDateString()}
                      </p>
                      {position.isLocked && (
                        <p className="text-xs text-orange-600">
                          Locked until {new Date(position.lockEndTimestamp).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Staked Amount</p>
                      <p className="font-semibold text-gray-900">{position.stakedAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Pending Rewards</p>
                      <p className="font-semibold text-green-600">
                        ${position.pendingRewards.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleClaimRewards(position.farmId)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Claim
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFarm(position.farmId)
                          setShowUnstakeModal(true)
                        }}
                        disabled={position.isLocked}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        Unstake
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Pending Rewards Breakdown</p>
                    <div className="space-y-1">
                      {position.pendingRewards.map((reward, index) => (
                        <div key={index} className="flex items-center gap-1">
                          {getTokenIcon(reward.token)}
                          <span className="font-medium text-gray-900">
                            {reward.amount.toFixed(4)} {reward.token}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Farm Performance</p>
                    <p className="font-medium text-gray-900">
                      APR: {farm?.rewardTokens.reduce((sum, r) => sum + r.apr, 0).toFixed(1)}%
                    </p>
                    <p className="font-medium text-gray-900">
                      Multiplier: {farm?.multiplier}x
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Stake Modal */}
      {showStakeModal && selectedFarm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Stake in {getFarmById(selectedFarm)?.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Stake
                </label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Estimated Daily Rewards</p>
                <div className="space-y-1">
                  {getFarmById(selectedFarm)?.rewardTokens.map((reward, index) => (
                    <p key={index} className="text-sm font-medium text-gray-900">
                      {(parseFloat(stakeAmount || '0') * reward.dailyReward / 100).toFixed(6)} {reward.token}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleStake}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Stake
                </button>
                <button
                  onClick={() => setShowStakeModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unstake Modal */}
      {showUnstakeModal && selectedFarm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Unstake from {getFarmById(selectedFarm)?.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Unstake
                </label>
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentage ({unstakePercentage}%)
                </label>
                <input
                  type="range"
                  value={unstakePercentage}
                  onChange={(e) => setUnstakePercentage(e.target.value)}
                  min="1"
                  max="100"
                  className="w-full"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUnstake}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Unstake
                </button>
                <button
                  onClick={() => setShowUnstakeModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
