'use client'

import React from 'react'
import { GasFeeEstimate } from '@/types/gas'
import { formatFee, formatTime, getNetworkCongestionColor } from '@/utils/gasCalculations'
import { Activity, Clock, Zap, TrendingUp } from 'lucide-react'

interface GasEstimatorProps {
  estimate: GasFeeEstimate | null
  loading?: boolean
  error?: string | null
}

export const GasEstimator: React.FC<GasEstimatorProps> = ({ 
  estimate, 
  loading = false, 
  error = null 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center text-red-600">
          <Activity className="w-5 h-5 mr-2" />
          <span>Error loading gas estimates</span>
        </div>
      </div>
    )
  }

  if (!estimate) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No gas estimate available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Real-time Gas Estimate</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getNetworkCongestionColor(estimate.networkCongestion)}`}>
          {estimate.networkCongestion.charAt(0).toUpperCase() + estimate.networkCongestion.slice(1)} Congestion
        </div>
      </div>

      {/* Main Estimate Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Estimated Total Fee</div>
            <div className="text-3xl font-bold text-blue-600">
              {formatFee(estimate.maxFee)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Updated {new Date(estimate.timestamp).toLocaleTimeString()}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-green-600 mb-2">
              <Clock className="w-4 h-4 mr-1" />
              <span className="font-medium">{formatTime(estimate.estimatedTime)}</span>
            </div>
            <div className="text-sm text-gray-600">
              {estimate.confidence}% confidence
            </div>
          </div>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Zap className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium">Base Fee</span>
          </div>
          <div className="text-xl font-semibold text-gray-900">
            {formatFee(estimate.baseFee)}
          </div>
          <div className="text-xs text-gray-500">
            Network minimum
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600 mr-2" />
            <span className="text-sm font-medium">Priority Fee</span>
          </div>
          <div className="text-xl font-semibold text-gray-900">
            {formatFee(estimate.priorityFee)}
          </div>
          <div className="text-xs text-gray-500">
            For faster processing
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Activity className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm font-medium">Max Fee</span>
          </div>
          <div className="text-xl font-semibold text-gray-900">
            {formatFee(estimate.maxFee)}
          </div>
          <div className="text-xs text-gray-500">
              Total limit
          </div>
        </div>
      </div>

      {/* Network Status */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Network Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Congestion:</span>
            <span className="ml-2 font-medium capitalize">{estimate.networkCongestion}</span>
          </div>
          <div>
            <span className="text-gray-500">Est. Time:</span>
            <span className="ml-2 font-medium">{formatTime(estimate.estimatedTime)}</span>
          </div>
          <div>
            <span className="text-gray-500">Confidence:</span>
            <span className="ml-2 font-medium">{estimate.confidence}%</span>
          </div>
          <div>
            <span className="text-gray-500">Last Update:</span>
            <span className="ml-2 font-medium">
              {new Date(estimate.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Recommendation:</strong> 
          {estimate.networkCongestion === 'low' 
            ? ' Network congestion is low - good time for transactions with standard fees.'
            : estimate.networkCongestion === 'medium'
            ? ' Network is moderately busy - consider using priority fees for faster processing.'
            : ' Network is congested - expect delays or use higher priority fees.'
          }
        </div>
      </div>
    </div>
  )
}
