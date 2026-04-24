'use client'

import React from 'react'
import { HistoricalFeeData } from '@/types/gas'
import { formatFee, getNetworkCongestionColor } from '@/utils/gasCalculations'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react'

interface FeeHistoryProps {
  data: HistoricalFeeData[]
  loading?: boolean
  timeRange?: '24h' | '7d' | '30d'
  onTimeRangeChange?: (range: '24h' | '7d' | '30d') => void
}

export const FeeHistory: React.FC<FeeHistoryProps> = ({ 
  data, 
  loading = false,
  timeRange = '7d',
  onTimeRangeChange
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No historical data available</p>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const chartData = data.map(item => ({
    time: new Date(item.timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: timeRange === '24h' ? 'numeric' : undefined
    }),
    baseFee: item.baseFee,
    priorityFee: item.priorityFee,
    totalFee: item.baseFee + item.priorityFee,
    congestion: item.networkCongestion
  })).slice(-50) // Show last 50 data points

  // Calculate statistics
  const latestData = data[data.length - 1]
  const previousData = data[data.length - 2] || data[0]
  const avgFee = data.reduce((sum, item) => sum + item.baseFee + item.priorityFee, 0) / data.length
  const maxFee = Math.max(...data.map(item => item.baseFee + item.priorityFee))
  const minFee = Math.min(...data.map(item => item.baseFee + item.priorityFee))
  
  const feeChange = latestData.baseFee - previousData.baseFee
  const feeChangePercentage = (feeChange / previousData.baseFee) * 100

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{data.time}</p>
          <p className="text-sm text-gray-600">Base: {formatFee(data.baseFee)}</p>
          <p className="text-sm text-gray-600">Priority: {formatFee(data.priorityFee)}</p>
          <p className="text-sm text-gray-600">Total: {formatFee(data.totalFee)}</p>
          <p className="text-sm text-gray-600">Congestion: {data.congestion}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold">Historical Fee Analysis</h3>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange?.(range)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Current Fee</span>
            <div className={`flex items-center text-sm ${
              feeChange >= 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {feeChange >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(feeChangePercentage).toFixed(1)}%
            </div>
          </div>
          <div className="text-xl font-semibold">
            {formatFee(latestData.baseFee + latestData.priorityFee)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-1">
            <Calendar className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm text-gray-600">Average Fee</span>
          </div>
          <div className="text-xl font-semibold">
            {formatFee(avgFee)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-1">
            <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-gray-600">Max Fee</span>
          </div>
          <div className="text-xl font-semibold text-green-600">
            {formatFee(maxFee)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-1">
            <TrendingDown className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">Min Fee</span>
          </div>
          <div className="text-xl font-semibold text-blue-600">
            {formatFee(minFee)}
          </div>
        </div>
      </div>

      {/* Fee Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Fee Trends</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorPriority" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="baseFee"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorBase)"
              name="Base Fee"
            />
            <Area
              type="monotone"
              dataKey="priorityFee"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="url(#colorPriority)"
              name="Priority Fee"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Congestion Analysis */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Network Congestion Pattern</h4>
        <div className="grid grid-cols-3 gap-4">
          {(['low', 'medium', 'high'] as const).map((congestion) => {
            const count = data.filter(item => item.networkCongestion === congestion).length
            const percentage = (count / data.length) * 100
            
            return (
              <div key={congestion} className="text-center">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getNetworkCongestionColor(congestion)}`}>
                  {congestion.charAt(0).toUpperCase() + congestion.slice(1)}
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{percentage.toFixed(0)}%</div>
                  <div className="text-xs text-gray-500">{count} occurrences</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Fee Patterns */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Fee Patterns & Insights</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span>Peak hours typically show {feeChange > 0 ? 'higher' : 'lower'} fees</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            <span>Priority fees account for ~{((latestData.priorityFee / (latestData.baseFee + latestData.priorityFee)) * 100).toFixed(0)}% of total cost</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>Best time for transactions: {data.reduce((best, current) => 
              (current.baseFee + current.priorityFee) < (best.baseFee + best.priorityFee) ? current : best
            ).timestamp.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
