'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  DollarSign, 
  Droplets, 
  Info,
  Settings,
  ChevronUp,
  ChevronDown,
  Wallet,
  Award,
  Activity
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

interface LiquidityPool {
  id: string
  tokenA: EnergyAssetType
  tokenB: EnergyAssetType
  reserveA: number
  reserveB: number
  totalLiquidity: number
  apr: number
  volume24h: number
  fees24h: number
  tvl: number
  myLiquidity: number
  myShare: number
  rewards: {
    token: EnergyAssetType
    apr: number
  }[]
}

interface PoolPosition {
  poolId: string
  liquidity: number
  sharePercentage: number
  valueUSD: number
  unclaimedFees: number
  unclaimedRewards: {
    token: EnergyAssetType
    amount: number
  }[]
}

export function LiquidityPools() {
  const [activeTab, setActiveTab] = useState<'pools' | 'positions'>('pools')
  const [selectedPool, setSelectedPool] = useState<string | null>(null)
  const [showAddLiquidity, setShowAddLiquidity] = useState(false)
  const [showRemoveLiquidity, setShowRemoveLiquidity] = useState(false)
  const [tokenAAmount, setTokenAAmount] = useState('')
  const [tokenBAmount, setTokenBAmount] = useState('')
  const [liquidityAmount, setLiquidityAmount] = useState('')
  const [lpPercentage, setLpPercentage] = useState('100')
  
  const {
    pools,
    userPositions,
    isLoading,
    addLiquidity,
    removeLiquidity,
    claimFees,
    claimRewards,
    calculatePoolShare,
    estimateLiquidity
  } = useEnergyExchange()

  const mockPools: LiquidityPool[] = [
    {
      id: 'WATT-SOLAR',
      tokenA: 'WATT',
      tokenB: 'SOLAR',
      reserveA: 1250000,
      reserveB: 1187500,
      totalLiquidity: 2437500,
      apr: 12.5,
      volume24h: 89000,
      fees24h: 267,
      tvl: 2437500,
      myLiquidity: 12500,
      myShare: 0.51,
      rewards: [
        { token: 'WATT', apr: 8.5 },
        { token: 'SOLAR', apr: 4.0 }
      ]
    },
    {
      id: 'WATT-WIND',
      tokenA: 'WATT',
      tokenB: 'WIND',
      reserveA: 980000,
      reserveB: 901600,
      totalLiquidity: 1881600,
      apr: 15.2,
      volume24h: 76000,
      fees24h: 228,
      tvl: 1881600,
      myLiquidity: 0,
      myShare: 0,
      rewards: [
        { token: 'WATT', apr: 10.2 },
        { token: 'WIND', apr: 5.0 }
      ]
    },
    {
      id: 'SOLAR-WIND',
      tokenA: 'SOLAR',
      tokenB: 'WIND',
      reserveA: 650000,
      reserveB: 598000,
      totalLiquidity: 1248000,
      apr: 18.7,
      volume24h: 54000,
      fees24h: 162,
      tvl: 1248000,
      myLiquidity: 25000,
      myShare: 2.0,
      rewards: [
        { token: 'WATT', apr: 12.0 },
        { token: 'SOLAR', apr: 3.7 },
        { token: 'WIND', apr: 3.0 }
      ]
    },
    {
      id: 'WATT-HYDRO',
      tokenA: 'WATT',
      tokenB: 'HYDRO',
      reserveA: 750000,
      reserveB: 660000,
      totalLiquidity: 1410000,
      apr: 14.3,
      volume24h: 42000,
      fees24h: 126,
      tvl: 1410000,
      myLiquidity: 0,
      myShare: 0,
      rewards: [
        { token: 'WATT', apr: 9.3 },
        { token: 'HYDRO', apr: 5.0 }
      ]
    },
    {
      id: 'GEOTHERMAL-CARBON_CREDITS',
      tokenA: 'GEOTHERMAL',
      tokenB: 'CARBON_CREDITS',
      reserveA: 320000,
      reserveB: 358400,
      totalLiquidity: 678400,
      apr: 22.1,
      volume24h: 28000,
      fees24h: 84,
      tvl: 678400,
      myLiquidity: 15000,
      myShare: 2.21,
      rewards: [
        { token: 'WATT', apr: 15.0 },
        { token: 'CARBON_CREDITS', apr: 7.1 }
      ]
    }
  ]

  const mockPositions: PoolPosition[] = [
    {
      poolId: 'WATT-SOLAR',
      liquidity: 12500,
      sharePercentage: 0.51,
      valueUSD: 12500,
      unclaimedFees: 12.50,
      unclaimedRewards: [
        { token: 'WATT', amount: 8.5 },
        { token: 'SOLAR', amount: 4.2 }
      ]
    },
    {
      poolId: 'SOLAR-WIND',
      liquidity: 25000,
      sharePercentage: 2.0,
      valueUSD: 25000,
      unclaimedFees: 25.00,
      unclaimedRewards: [
        { token: 'WATT', amount: 15.2 },
        { token: 'SOLAR', amount: 4.8 },
        { token: 'WIND', amount: 3.9 }
      ]
    },
    {
      poolId: 'GEOTHERMAL-CARBON_CREDITS',
      liquidity: 15000,
      sharePercentage: 2.21,
      valueUSD: 15000,
      unclaimedFees: 18.75,
      unclaimedRewards: [
        { token: 'WATT', amount: 12.1 },
        { token: 'CARBON_CREDITS', amount: 6.8 }
      ]
    }
  ]

  const getPoolById = (id: string) => mockPools.find(pool => pool.id === id)

  const handleAddLiquidity = async () => {
    if (!selectedPool || !tokenAAmount || !tokenBAmount) {
      toast.error('Please enter valid amounts')
      return
    }

    try {
      await addLiquidity({
        poolId: selectedPool,
        tokenAAmount: parseFloat(tokenAAmount),
        tokenBAmount: parseFloat(tokenBAmount)
      })
      
      toast.success('Liquidity added successfully')
      setShowAddLiquidity(false)
      setTokenAAmount('')
      setTokenBAmount('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add liquidity')
    }
  }

  const handleRemoveLiquidity = async () => {
    if (!selectedPool || !liquidityAmount) {
      toast.error('Please enter liquidity amount')
      return
    }

    try {
      await removeLiquidity({
        poolId: selectedPool,
        liquidityAmount: parseFloat(liquidityAmount),
        percentage: parseFloat(lpPercentage)
      })
      
      toast.success('Liquidity removed successfully')
      setShowRemoveLiquidity(false)
      setLiquidityAmount('')
      setLpPercentage('100')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove liquidity')
    }
  }

  const handleClaimFees = async (poolId: string) => {
    try {
      await claimFees(poolId)
      toast.success('Fees claimed successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to claim fees')
    }
  }

  const handleClaimRewards = async (poolId: string) => {
    try {
      await claimRewards(poolId)
      toast.success('Rewards claimed successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to claim rewards')
    }
  }

  const totalValueLocked = mockPools.reduce((sum, pool) => sum + pool.tvl, 0)
  const totalMyLiquidity = mockPools.reduce((sum, pool) => sum + pool.myLiquidity, 0)
  const totalUnclaimedFees = mockPositions.reduce((sum, pos) => sum + pos.unclaimedFees, 0)

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-600 rounded-full flex items-center justify-center">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Liquidity Pools</h2>
            <p className="text-sm text-gray-600">Provide liquidity and earn competitive APY</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total TVL</p>
            <p className="text-xl font-bold text-gray-900">${(totalValueLocked / 1000000).toFixed(2)}M</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">My Liquidity</p>
            <p className="text-xl font-bold text-blue-600">${totalMyLiquidity.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('pools')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'pools' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Pools
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'positions' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          My Positions ({mockPositions.length})
        </button>
      </div>

      {activeTab === 'pools' ? (
        <div className="space-y-4">
          {mockPools.map((pool) => (
            <div key={pool.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-xs font-bold text-yellow-600">{pool.tokenA.slice(0, 2)}</span>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-xs font-bold text-blue-600">{pool.tokenB.slice(0, 2)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{pool.tokenA} / {pool.tokenB}</h3>
                    <p className="text-sm text-gray-600">Pool #{pool.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">TVL</p>
                    <p className="font-semibold text-gray-900">${(pool.tvl / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">APR</p>
                    <p className="font-semibold text-green-600">{pool.apr}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">24h Volume</p>
                    <p className="font-semibold text-gray-900">${(pool.volume24h / 1000).toFixed(0)}K</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPool(pool.id)
                      setShowAddLiquidity(true)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Add Liquidity
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Reserves</p>
                  <p className="font-medium text-gray-900">
                    {pool.reserveA.toLocaleString()} {pool.tokenA} / {pool.reserveB.toLocaleString()} {pool.tokenB}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Your Share</p>
                  <p className="font-medium text-gray-900">
                    {pool.myLiquidity > 0 ? `${pool.myShare}%` : 'Not participating'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Rewards</p>
                  <div className="space-y-1">
                    {pool.rewards.map((reward, index) => (
                      <p key={index} className="font-medium text-gray-900">
                        {reward.apr}% {reward.token}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {mockPositions.map((position) => {
            const pool = getPoolById(position.poolId)
            return (
              <div key={position.poolId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-2">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-xs font-bold text-yellow-600">{pool?.tokenA.slice(0, 2)}</span>
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-xs font-bold text-blue-600">{pool?.tokenB.slice(0, 2)}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{pool?.tokenA} / {pool?.tokenB}</h3>
                      <p className="text-sm text-gray-600">{position.sharePercentage}% share</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Value</p>
                      <p className="font-semibold text-gray-900">${position.valueUSD.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Unclaimed Fees</p>
                      <p className="font-semibold text-orange-600">${position.unclaimedFees.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleClaimFees(position.poolId)}
                        className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                      >
                        Claim Fees
                      </button>
                      <button
                        onClick={() => handleClaimRewards(position.poolId)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Claim Rewards
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPool(position.poolId)
                          setShowRemoveLiquidity(true)
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Unclaimed Rewards</p>
                    <div className="space-y-1">
                      {position.unclaimedRewards.map((reward, index) => (
                        <p key={index} className="font-medium text-gray-900">
                          {reward.amount.toFixed(4)} {reward.token}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Liquidity Tokens</p>
                    <p className="font-medium text-gray-900">{position.liquidity.toLocaleString()} LP</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Liquidity Modal */}
      {showAddLiquidity && selectedPool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Liquidity</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getPoolById(selectedPool)?.tokenA} Amount
                </label>
                <input
                  type="number"
                  value={tokenAAmount}
                  onChange={(e) => setTokenAAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getPoolById(selectedPool)?.tokenB} Amount
                </label>
                <input
                  type="number"
                  value={tokenBAmount}
                  onChange={(e) => setTokenBAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddLiquidity}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add Liquidity
                </button>
                <button
                  onClick={() => setShowAddLiquidity(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Liquidity Modal */}
      {showRemoveLiquidity && selectedPool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Remove Liquidity</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LP Token Amount
                </label>
                <input
                  type="number"
                  value={liquidityAmount}
                  onChange={(e) => setLiquidityAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentage ({lpPercentage}%)
                </label>
                <input
                  type="range"
                  value={lpPercentage}
                  onChange={(e) => setLpPercentage(e.target.value)}
                  min="1"
                  max="100"
                  className="w-full"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRemoveLiquidity}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Remove Liquidity
                </button>
                <button
                  onClick={() => setShowRemoveLiquidity(false)}
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
