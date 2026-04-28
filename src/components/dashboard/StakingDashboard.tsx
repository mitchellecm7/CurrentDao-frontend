'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Award,
  DollarSign,
  Calculator,
  Shield,
  Zap,
  Target,
  Calendar,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { StakingPosition, StakingProtocol, EarningsCalculation, RiskMetrics } from '../../types/staking'
import { useStaking } from '../../hooks/useStaking'
import { toast } from 'react-hot-toast'

const StakingDashboard: React.FC = () => {
  const [selectedPosition, setSelectedPosition] = useState<StakingPosition | null>(null)
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorData, setCalculatorData] = useState({
    principal: 1000,
    apy: 8.5,
    compoundFrequency: 'daily' as const,
    timeHorizon: 365
  })
  const [earningsProjection, setEarningsProjection] = useState<EarningsCalculation | null>(null)

  const {
    positions,
    protocols,
    isLoading,
    isRefreshing,
    loadStakingData,
    claimRewards,
    toggleAutoCompound,
    calculateEarnings
  } = useStaking()

  const handleClaimRewards = async (positionId: string) => {
    try {
      const position = positions.find(p => p.id === positionId)
      if (!position) return

      const success = await claimRewards(positionId)
      
      if (success) {
        toast.success(`Claimed ${position.accumulatedRewards.toFixed(2)} ${position.rewardToken}`)
      }
    } catch (error) {
      toast.error('Failed to claim rewards')
      console.error('Error claiming rewards:', error)
    }
  }

  const handleToggleAutoCompound = async (positionId: string, enabled: boolean) => {
    try {
      const success = await toggleAutoCompound(positionId, enabled)
      
      if (success) {
        toast.success(`Auto-compound ${enabled ? 'enabled' : 'disabled'}`)
      }
    } catch (error) {
      toast.error('Failed to toggle auto-compound')
      console.error('Error toggling auto-compound:', error)
    }
  }

  const handleCalculateEarnings = () => {
    const { principal, apy, compoundFrequency, timeHorizon } = calculatorData
    const projection = calculateEarnings(principal, apy, compoundFrequency, timeHorizon)
    setEarningsProjection(projection)
  }

  const getRiskColor = (rating: string) => {
    switch (rating) {
      case 'LOW': return 'text-green-600 bg-green-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'HIGH': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const totalStaked = positions.reduce((sum, pos) => sum + pos.stakedAmount, 0)
  const totalRewards = positions.reduce((sum, pos) => sum + pos.accumulatedRewards, 0)
  const averageAPY = positions.length > 0 
    ? positions.reduce((sum, pos) => sum + pos.currentAPY, 0) / positions.length 
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staking Dashboard</h1>
            <p className="text-gray-600">Track your staking positions and rewards across protocols</p>
          </div>
        </div>
        <button
          onClick={loadStakingData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Staked</span>
            <Wallet className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">${totalStaked.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Across {positions.length} positions</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Pending Rewards</span>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-600">${totalRewards.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">Ready to claim</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Average APY</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{averageAPY.toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">Weighted average</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Auto-Compound</span>
            <Settings className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {positions.filter(p => p.autoCompound).length}/{positions.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Positions enabled</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staking Positions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Staking Positions</h2>
            <div className="space-y-4">
              {positions.map((position) => (
                <div key={position.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Zap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{position.protocol}</h3>
                        <p className="text-sm text-gray-600">{position.stakedToken}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(position.riskRating)}`}>
                        {position.riskRating}
                      </span>
                      <button
                        onClick={() => setSelectedPosition(position)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Staked Amount</p>
                      <p className="font-semibold text-gray-900">${position.stakedAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current APY</p>
                      <p className="font-semibold text-green-600">{position.currentAPY}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Accumulated Rewards</p>
                      <p className="font-semibold text-blue-600">{position.accumulatedRewards.toFixed(2)} {position.rewardToken}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Staked Since</p>
                      <p className="font-semibold text-gray-900">{new Date(position.stakeDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Auto-compound:</span>
                      <button
                        onClick={() => handleToggleAutoCompound(position.id, !position.autoCompound)}
                        className="flex items-center gap-1"
                      >
                        {position.autoCompound ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={`text-sm ${position.autoCompound ? 'text-green-600' : 'text-gray-400'}`}>
                          {position.autoCompound ? 'Enabled' : 'Disabled'}
                        </span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleClaimRewards(position.id)}
                      disabled={position.accumulatedRewards === 0 || isRefreshing}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Claim Rewards
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* APY History Chart */}
          {selectedPosition && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                APY History - {selectedPosition.protocol}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={selectedPosition.historicalAPY}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'APY']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="apy" 
                    stroke="#3B82F6" 
                    fill="#93C5FD"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Earnings Calculator */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Earnings Calculator</h3>
              <Calculator className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Principal ($)</label>
                <input
                  type="number"
                  value={calculatorData.principal}
                  onChange={(e) => setCalculatorData(prev => ({ ...prev, principal: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">APY (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calculatorData.apy}
                  onChange={(e) => setCalculatorData(prev => ({ ...prev, apy: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compound Frequency</label>
                <select
                  value={calculatorData.compoundFrequency}
                  onChange={(e) => setCalculatorData(prev => ({ ...prev, compoundFrequency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Horizon (days)</label>
                <input
                  type="number"
                  value={calculatorData.timeHorizon}
                  onChange={(e) => setCalculatorData(prev => ({ ...prev, timeHorizon: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleCalculateEarnings}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Calculate Earnings
              </button>
              
              {earningsProjection && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Projection Results</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Principal:</span> ${earningsProjection.principal}</p>
                    <p><span className="text-gray-600">Projected Earnings:</span> <span className="text-green-600 font-semibold">${earningsProjection.projectedEarnings.toFixed(2)}</span></p>
                    <p><span className="text-gray-600">Total Value:</span> <span className="text-blue-600 font-semibold">${earningsProjection.totalValue.toFixed(2)}</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Low Risk Positions</span>
                <span className="text-sm font-semibold text-green-600">
                  {positions.filter(p => p.riskRating === 'LOW').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Medium Risk Positions</span>
                <span className="text-sm font-semibold text-yellow-600">
                  {positions.filter(p => p.riskRating === 'MEDIUM').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">High Risk Positions</span>
                <span className="text-sm font-semibold text-red-600">
                  {positions.filter(p => p.riskRating === 'HIGH').length}
                </span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Recommendation:</strong> Your portfolio is balanced with a mix of risk levels. Consider diversifying across different protocols to optimize returns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StakingDashboard
