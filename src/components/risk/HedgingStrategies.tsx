'use client'

import { useState } from 'react'
import { HedgingStrategy as HedgingStrategyType } from '@/types/risk'
import { TrendingDown, Plus, CheckCircle, Clock, Archive, AlertCircle } from 'lucide-react'

interface HedgingStrategiesProps {
  strategies: HedgingStrategyType[]
  onOptimize: (targetRiskReduction: number) => Promise<HedgingStrategyType>
  onUpdateStatus: (strategyId: string, status: string) => void
  isLoading: boolean
}

/**
 * Hedging Strategies Component
 * Displays and manages risk hedging strategies with performance tracking
 */
export function HedgingStrategies({ strategies, onOptimize, onUpdateStatus, isLoading }: HedgingStrategiesProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [targetReduction, setTargetReduction] = useState(30)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleOptimize = async () => {
    setIsOptimizing(true)
    try {
      await onOptimize(targetReduction)
      setShowForm(false)
      setTargetReduction(30)
    } finally {
      setIsOptimizing(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'proposed':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'archived':
        return 'bg-gray-200 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingDown className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'archived':
        return <Archive className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (isLoading && strategies.length === 0) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded-lg" />
        <div className="space-y-4">
          <div className="h-40 bg-gray-200 rounded-lg" />
          <div className="h-40 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hedging Strategies</h2>
          <p className="text-gray-600 text-sm mt-1">
            Design and implement risk reduction strategies targeting 30% risk reduction
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Strategy
        </button>
      </div>

      {/* Strategy Creation Form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Hedging Strategy</h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Risk Reduction: {targetReduction}%
              </label>
              <input
                type="range"
                min="10"
                max="80"
                value={targetReduction}
                onChange={e => setTargetReduction(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 mt-2">
                Higher reduction targets may require more complex hedging instruments and incur higher costs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hedging Objective</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="reduce-to-target">Reduce to Target</option>
                  <option value="minimize">Minimize Risk</option>
                  <option value="optimize">Optimize Return</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="3m">3 Months</option>
                  <option value="6m">6 Months</option>
                  <option value="1y">1 Year</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded p-4 border border-blue-100">
              <p className="text-sm font-medium text-gray-900 mb-2">Estimated Strategy Impact:</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Risk Reduction</p>
                  <p className="font-bold text-green-600 text-lg">{targetReduction}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Estimated Cost</p>
                  <p className="font-bold text-orange-600 text-lg">~${(50 * targetReduction).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Effectiveness</p>
                  <p className="font-bold text-blue-600 text-lg">{(75 + targetReduction * 0.25).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isOptimizing ? 'Creating Strategy...' : 'Create Hedging Strategy'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Strategies */}
      {strategies.length > 0 ? (
        <div className="space-y-4">
          {strategies.map(strategy => (
            <div
              key={strategy.id}
              className={`rounded-lg border-2 p-6 transition-colors cursor-pointer ${
                selectedStrategy === strategy.id
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setSelectedStrategy(selectedStrategy === strategy.id ? null : strategy.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Strategy #{strategy.id.slice(-4)}</h3>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(strategy.status)}`}>
                      {getStatusIcon(strategy.status)}
                      {strategy.status.charAt(0).toUpperCase() + strategy.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Created {new Date(strategy.createdAt).toLocaleDateString()} • Active until {new Date(strategy.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm text-gray-600">Risk Reduction</p>
                  <p className="text-2xl font-bold text-green-600">{strategy.targetRiskReduction}%</p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600">Instruments</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{strategy.instruments.length}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600">Estimated Cost</p>
                  <p className="text-lg font-bold text-orange-600 mt-1">${strategy.estimatedCost.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600">Effectiveness</p>
                  <p className="text-lg font-bold text-blue-600 mt-1">{strategy.effectiveness}%</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600">Cost Actual</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">${strategy.performance.costActual.toLocaleString()}</p>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedStrategy === strategy.id && (
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  {/* Risk Type and Objective */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Risk Type Being Hedged</p>
                      <p className="text-gray-900 capitalize">{strategy.riskType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Hedging Objective</p>
                      <p className="text-gray-900 capitalize">{strategy.objective.replace('-', ' ')}</p>
                    </div>
                  </div>

                  {/* Hedging Instruments */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Hedging Instruments</p>
                    <div className="space-y-2">
                      {strategy.instruments.map((instrument, i) => (
                        <div key={i} className="bg-gray-50 rounded p-3 border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{instrument.underlying}</p>
                              <p className="text-xs text-gray-600 capitalize">{instrument.type} • Qty: {instrument.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">${instrument.cost.toLocaleString()}</p>
                              <p className="text-xs text-gray-600">Effectiveness: {instrument.effectiveness}%</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div>
                              <span className="text-gray-600">Delta:</span>
                              <span className="font-bold text-gray-900 ml-1">{instrument.delta.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Gamma:</span>
                              <span className="font-bold text-gray-900 ml-1">{instrument.gamma.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Theta:</span>
                              <span className="font-bold text-gray-900 ml-1">{instrument.theta.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Vega:</span>
                              <span className="font-bold text-gray-900 ml-1">{instrument.vega.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance */}
                  {strategy.status === 'active' && (
                    <div className="bg-green-50 rounded p-4 border border-green-200">
                      <p className="text-sm font-medium text-green-900 mb-3">Current Performance</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-green-700">Actual Reduction</p>
                          <p className="font-bold text-green-900 text-lg mt-1">{strategy.performance.actualRiskReduction}%</p>
                        </div>
                        <div>
                          <p className="text-green-700">Cost vs Estimate</p>
                          <p className={`font-bold text-lg mt-1 ${strategy.performance.costActual <= strategy.performance.costEstimated ? 'text-green-900' : 'text-red-900'}`}>
                            ${(strategy.performance.costEstimated - strategy.performance.costActual).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-green-700">ROI</p>
                          <p className="font-bold text-green-900 text-lg mt-1">{strategy.performance.roi.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-green-700">Effectiveness</p>
                          <p className="font-bold text-green-900 text-lg mt-1">{strategy.performance.effectiveness}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {strategy.status === 'proposed' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(strategy.id, 'active')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Activate Strategy
                        </button>
                        <button
                          onClick={() => onUpdateStatus(strategy.id, 'archived')}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                        >
                          Archive
                        </button>
                      </>
                    )}
                    {strategy.status === 'active' && (
                      <button
                        onClick={() => onUpdateStatus(strategy.id, 'completed')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Mark as Completed
                      </button>
                    )}
                    {strategy.status === 'completed' && (
                      <button
                        onClick={() => onUpdateStatus(strategy.id, 'archived')}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <TrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Hedging Strategies Yet</h3>
          <p className="text-gray-600 mb-4">Create your first hedging strategy to start reducing portfolio risk</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Strategy
          </button>
        </div>
      )}

      {/* Strategy Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Hedging Best Practices</p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• Target 30%+ risk reduction through diversified hedging instruments</li>
              <li>• Monitor Greeks (Delta, Gamma, Vega, Theta) to ensure proper hedge exposure</li>
              <li>• Rebalance strategies monthly to maintain effectiveness</li>
              <li>• Track actual vs. estimated costs to optimize future strategies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
