'use client'

import React, { useState } from 'react'
import { FeeOptimization } from '@/types/gas'
import { formatFee, formatTime } from '@/utils/gasCalculations'
import { TrendingDown, Lightbulb, Calculator, CheckCircle } from 'lucide-react'

interface FeeOptimizerProps {
  optimization: FeeOptimization | null
  loading?: boolean
  onOptimize?: (currentFee: number, targetTime: number) => void
}

export const FeeOptimizer: React.FC<FeeOptimizerProps> = ({ 
  optimization, 
  loading = false,
  onOptimize
}) => {
  const [currentFee, setCurrentFee] = useState<string>('250')
  const [targetTime, setTargetTime] = useState<string>('60')

  const handleOptimize = () => {
    if (onOptimize) {
      onOptimize(parseFloat(currentFee), parseInt(targetTime))
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <TrendingDown className="w-5 h-5 text-green-600 mr-2" />
        <h3 className="text-lg font-semibold">Fee Optimization</h3>
      </div>

      {/* Input Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Optimize Your Fee</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Current Fee (stroops)
            </label>
            <input
              type="number"
              value={currentFee}
              onChange={(e) => setCurrentFee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter fee"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Target Time (seconds)
            </label>
            <input
              type="number"
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Target time"
            />
          </div>
        </div>
        <button
          onClick={handleOptimize}
          disabled={!currentFee || !targetTime}
          className="mt-3 w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Calculator className="w-4 h-4 inline mr-2" />
          Optimize Fee
        </button>
      </div>

      {/* Optimization Results */}
      {optimization && (
        <div className="space-y-4">
          {/* Savings Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Optimization Results</span>
              </div>
              <div className={`text-sm font-medium ${
                optimization.savingsPercentage > 15 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {optimization.savingsPercentage > 0 ? 'Save' : 'Cost'}: {Math.abs(optimization.savingsPercentage).toFixed(1)}%
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Original Fee:</span>
                <span className="ml-2 font-medium">{formatFee(optimization.originalFee)}</span>
              </div>
              <div>
                <span className="text-gray-600">Optimized Fee:</span>
                <span className="ml-2 font-medium">{formatFee(optimization.optimizedFee)}</span>
              </div>
            </div>
            
            {optimization.savings > 0 && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <span className="text-green-800 font-medium">
                  You save: {formatFee(optimization.savings)}
                </span>
              </div>
            )}
          </div>

          {/* Strategy Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Lightbulb className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                Recommended Strategy: {optimization.strategy.charAt(0).toUpperCase() + optimization.strategy.slice(1)}
              </span>
            </div>
            <p className="text-sm text-blue-700">
              {optimization.strategy === 'slow' && 'Use lower fees for non-urgent transactions when network is congested.'}
              {optimization.strategy === 'standard' && 'Balanced approach for typical transactions.'}
              {optimization.strategy === 'fast' && 'Higher priority fee for faster confirmation during busy periods.'}
              {optimization.strategy === 'max' && 'Maximum priority fee for urgent transactions.'}
            </p>
          </div>

          {/* Recommendations */}
          {optimization.recommendations.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-yellow-800 mb-2">
                Additional Recommendations
              </h5>
              <ul className="space-y-1">
                {optimization.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cost Comparison Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Cost Comparison</h5>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Original Fee</span>
                  <span>{formatFee(optimization.originalFee)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Optimized Fee</span>
                  <span>{formatFee(optimization.optimizedFee)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(optimization.optimizedFee / optimization.originalFee) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Optimization Tips</h5>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>• Use lower fees during off-peak hours for better savings</li>
          <li>• Monitor network congestion before setting fees</li>
          <li>• Consider batch transactions to reduce overall costs</li>
          <li>• Set appropriate target times based on urgency</li>
        </ul>
      </div>
    </div>
  )
}
