'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  DollarSign,
  Zap,
  Clock,
  Target,
  Shield,
  RefreshCw,
  Settings,
  Download,
  Filter,
  Calendar,
  Eye,
  TrendingUp as TrendIcon,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useEnergyNews } from '@/hooks/useEnergyNews'
import { MarketImpact, PricePrediction, MarketMetrics } from '@/types/news'

interface ImpactAssessmentProps {
  className?: string
  showControls?: boolean
  showDetails?: boolean
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d'
  refreshInterval?: number
  autoRefresh?: boolean
  commodities?: string[]
}

export const ImpactAssessment: React.FC<ImpactAssessmentProps> = ({
  className = '',
  showControls = true,
  showDetails = true,
  timeRange = '24h',
  refreshInterval = 300,
  autoRefresh = true,
  commodities = ['crude-oil', 'natural-gas', 'solar', 'wind', 'nuclear']
}) => {
  const {
    state,
    getImpactHistory,
    getPricePredictions,
    getMarketMetrics,
    exportData,
    refetchImpacts,
    refetchPredictions
  } = useEnergyNews({
    autoRefresh,
    refreshInterval,
    enableImpact: true,
    enableAlerts: true
  })

  const [localState, setLocalState] = useState({
    selectedTimeRange: timeRange,
    selectedCommodity: '',
    expandedSections: new Set<string>(),
    showHighImpactOnly: false,
    showRiskAnalysis: true,
    showPredictions: true,
    showRecommendations: true,
    riskLevelFilter: 'all' as 'all' | MarketImpact['riskLevel'],
    sortBy: 'timestamp' as 'timestamp' | 'impact' | 'confidence' | 'risk',
    sortOrder: 'desc' as 'asc' | 'desc',
    viewMode: 'dashboard' as 'dashboard' | 'detailed' | 'comparison'
  })

  const impactHistory = useMemo(() => {
    const hours = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 168,
      '30d': 720
    }
    
    let impacts = getImpactHistory(undefined, hours[localState.selectedTimeRange])
    
    if (localState.selectedCommodity) {
      impacts = impacts.filter(impact => impact.commodity === localState.selectedCommodity)
    }
    
    if (localState.showHighImpactOnly) {
      impacts = impacts.filter(impact => Math.abs(impact.impact.priceChange) > 0.05)
    }
    
    if (localState.riskLevelFilter !== 'all') {
      impacts = impacts.filter(impact => impact.riskLevel === localState.riskLevelFilter)
    }
    
    // Sort impacts
    impacts.sort((a, b) => {
      let aValue = 0
      let bValue = 0
      
      switch (localState.sortBy) {
        case 'impact':
          aValue = Math.abs(a.impact.priceChange)
          bValue = Math.abs(b.impact.priceChange)
          break
        case 'confidence':
          aValue = a.impact.confidence
          bValue = b.impact.confidence
          break
        case 'risk':
          const riskLevels = { 'very-low': 1, 'low': 2, 'medium': 3, 'high': 4, 'very-high': 5 }
          aValue = riskLevels[a.riskLevel as keyof typeof riskLevels] || 0
          bValue = riskLevels[b.riskLevel as keyof typeof riskLevels] || 0
          break
        case 'timestamp':
        default:
          aValue = a.timestamp.getTime()
          bValue = b.timestamp.getTime()
          break
      }
      
      return localState.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })
    
    return impacts
  }, [
    getImpactHistory,
    localState.selectedTimeRange,
    localState.selectedCommodity,
    localState.showHighImpactOnly,
    localState.riskLevelFilter,
    localState.sortBy,
    localState.sortOrder
  ])

  const pricePredictions = useMemo(() => {
    const predictions = new Map<string, PricePrediction[]>()
    
    commodities.forEach(commodity => {
      const commodityPredictions = getPricePredictions(commodity)
      if (commodityPredictions.length > 0) {
        predictions.set(commodity, commodityPredictions)
      }
    })
    
    return predictions
  }, [getPricePredictions, commodities])

  const marketMetrics = useMemo(() => {
    const metrics = new Map<string, MarketMetrics[]>()
    
    commodities.forEach(commodity => {
      const commodityMetrics = getMarketMetrics(commodity, 24)
      if (commodityMetrics.length > 0) {
        metrics.set(commodity, commodityMetrics)
      }
    })
    
    return metrics
  }, [getMarketMetrics, commodities])

  const getImpactIcon = (impact: MarketImpact) => {
    const change = impact.impact.priceChange
    if (Math.abs(change) > 0.1) return <Zap className="w-5 h-5" />
    if (Math.abs(change) > 0.05) return <Activity className="w-5 h-5" />
    return <BarChart3 className="w-5 h-5" />
  }

  const getImpactColor = (impact: MarketImpact) => {
    const change = Math.abs(impact.impact.priceChange)
    if (change > 0.1) return 'text-red-600'
    if (change > 0.05) return 'text-orange-600'
    if (change > 0.02) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getRiskColor = (riskLevel: MarketImpact['riskLevel']) => {
    switch (riskLevel) {
      case 'very-high': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      case 'very-low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatImpact = (change: number) => {
    return `${change > 0 ? '+' : ''}${(change * 100).toFixed(2)}%`
  }

  const toggleSection = (section: string) => {
    setLocalState(prev => {
      const expanded = new Set(prev.expandedSections)
      if (expanded.has(section)) {
        expanded.delete(section)
      } else {
        expanded.add(section)
      }
      return { ...prev, expandedSections: expanded }
    })
  }

  const exportImpactData = () => {
    const data = {
      impactHistory,
      pricePredictions: Array.from(pricePredictions.entries()),
      marketMetrics: Array.from(marketMetrics.entries()),
      timestamp: new Date().toISOString(),
      timeRange: localState.selectedTimeRange
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `impact-assessment-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Impact data exported successfully')
  }

  const getCommodityStats = (commodity: string) => {
    const commodityImpacts = impactHistory.filter(impact => impact.commodity === commodity)
    
    if (commodityImpacts.length === 0) {
      return {
        totalImpacts: 0,
        avgImpact: 0,
        maxImpact: 0,
        minImpact: 0,
        highRiskCount: 0,
        avgConfidence: 0
      }
    }
    
    const impacts = commodityImpacts.map(i => i.impact.priceChange)
    const confidences = commodityImpacts.map(i => i.impact.confidence)
    const highRisks = commodityImpacts.filter(i => 
      ['high', 'very-high'].includes(i.riskLevel)
    ).length
    
    return {
      totalImpacts: commodityImpacts.length,
      avgImpact: impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length,
      maxImpact: Math.max(...impacts),
      minImpact: Math.min(...impacts),
      highRiskCount: highRisks,
      avgConfidence: confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length
    }
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-orange-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Market Impact Assessment</h2>
              <p className="text-gray-600">Real-time market impact analysis and predictions</p>
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-3">
              {/* Time Range Selector */}
              <select
                value={localState.selectedTimeRange}
                onChange={(e) => setLocalState(prev => ({ ...prev, selectedTimeRange: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>

              {/* Commodity Filter */}
              <select
                value={localState.selectedCommodity}
                onChange={(e) => setLocalState(prev => ({ ...prev, selectedCommodity: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Commodities</option>
                {commodities.map(commodity => (
                  <option key={commodity} value={commodity}>
                    {commodity.replace('-', ' ').toUpperCase()}
                  </option>
                ))}
              </select>

              {/* Risk Level Filter */}
              <select
                value={localState.riskLevelFilter}
                onChange={(e) => setLocalState(prev => ({ ...prev, riskLevelFilter: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Risk Levels</option>
                <option value="very-high">Very High</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="very-low">Very Low</option>
              </select>

              {/* High Impact Toggle */}
              <button
                onClick={() => setLocalState(prev => ({ ...prev, showHighImpactOnly: !prev.showHighImpactOnly }))}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  localState.showHighImpactOnly
                    ? 'bg-orange-100 border-orange-300 text-orange-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Zap className="w-4 h-4 mr-1" />
                High Impact Only
              </button>

              {/* Refresh */}
              <button
                onClick={() => {
                  refetchImpacts()
                  refetchPredictions()
                  toast.success('Impact data refreshed')
                }}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Export */}
              <button
                onClick={exportImpactData}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Download className="w-5 h-5" />
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{impactHistory.length}</div>
            <div className="text-sm text-gray-500">Total Impacts</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {impactHistory.filter(i => Math.abs(i.impact.priceChange) > 0.05).length}
            </div>
            <div className="text-sm text-gray-500">High Impacts</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {impactHistory.filter(i => ['high', 'very-high'].includes(i.riskLevel)).length}
            </div>
            <div className="text-sm text-gray-500">High Risk Events</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {pricePredictions.size}
            </div>
            <div className="text-sm text-gray-500">Commodities Tracked</div>
          </div>
        </div>
      </div>

      {/* Commodity Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Commodity Impact Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commodities.map(commodity => {
            const stats = getCommodityStats(commodity)
            const latestImpact = impactHistory
              .filter(i => i.commodity === commodity)
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
            
            return (
              <div key={commodity} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 capitalize">
                    {commodity.replace('-', ' ')}
                  </h4>
                  {latestImpact && (
                    <div className={`p-2 rounded-full ${getImpactColor(latestImpact)}`}>
                      {getImpactIcon(latestImpact)}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Impacts:</span>
                    <span className="text-sm font-medium">{stats.totalImpacts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Impact:</span>
                    <span className={`text-sm font-medium ${stats.avgImpact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatImpact(stats.avgImpact)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Max Impact:</span>
                    <span className={`text-sm font-medium ${stats.maxImpact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatImpact(stats.maxImpact)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">High Risk:</span>
                    <span className="text-sm font-medium text-red-600">{stats.highRiskCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className="text-sm font-medium">
                      {(stats.avgConfidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Impacts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Market Impacts</h3>
          <div className="flex items-center space-x-2">
            {/* Sort Options */}
            <select
              value={localState.sortBy}
              onChange={(e) => setLocalState(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
            >
              <option value="timestamp">Time</option>
              <option value="impact">Impact</option>
              <option value="confidence">Confidence</option>
              <option value="risk">Risk Level</option>
            </select>
            
            <select
              value={localState.sortOrder}
              onChange={(e) => setLocalState(prev => ({ ...prev, sortOrder: e.target.value as any }))}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {impactHistory.slice(0, 10).map((impact, index) => (
            <motion.div
              key={impact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-full ${getImpactColor(impact)}`}>
                      {getImpactIcon(impact)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">
                        {impact.commodity.replace('-', ' ')}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {impact.sector} • {impact.region || 'Global'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(impact.riskLevel)}`}>
                      {impact.riskLevel}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Price Impact:</span>
                      <span className={`ml-2 font-medium ${impact.impact.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatImpact(impact.impact.priceChange)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Volume Impact:</span>
                      <span className="ml-2 font-medium">
                        {impact.impact.volumeChange > 0 ? '+' : ''}{(impact.impact.volumeChange * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Confidence:</span>
                      <span className="ml-2 font-medium">
                        {(impact.impact.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <span className="ml-2 font-medium">
                        {impact.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleSection(impact.id)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  {localState.expandedSections.has(impact.id) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              <AnimatePresence>
                {localState.expandedSections.has(impact.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Timeframe Analysis */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Timeframe Analysis</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Immediate (0-1h):</span>
                            <span className="font-medium">{formatImpact(impact.timeframe.immediate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Short (1-24h):</span>
                            <span className="font-medium">{formatImpact(impact.timeframe.short)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Medium (1-7d):</span>
                            <span className="font-medium">{formatImpact(impact.timeframe.medium)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Long (1-4w):</span>
                            <span className="font-medium">{formatImpact(impact.timeframe.long)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Impact Factors */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Key Factors</h5>
                        <div className="space-y-1">
                          {impact.factors.slice(0, 3).map((factor, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{factor.type}:</span>
                              <span className="font-medium">
                                {(factor.influence * 100).toFixed(1)}% ({(factor.confidence * 100).toFixed(0)}% conf)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {showDetails && localState.showRecommendations && impact.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Recommendations</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {impact.recommendations.slice(0, 3).map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {impactHistory.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Impact Data</h3>
            <p className="text-gray-500">No market impact data available for the selected time range</p>
          </div>
        )}
      </div>

      {/* Price Predictions */}
      {showDetails && localState.showPredictions && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Price Predictions</h3>
            <button
              onClick={() => toggleSection('predictions')}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {localState.expandedSections.has('predictions') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {localState.expandedSections.has('predictions') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from(pricePredictions.entries()).map(([commodity, predictions]) => (
                    <div key={commodity} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3 capitalize">
                        {commodity.replace('-', ' ')}
                      </h4>
                      <div className="space-y-3">
                        {predictions.slice(0, 3).map((prediction, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                {prediction.timeframe}
                              </span>
                              <span className="text-xs text-gray-500">
                                {(prediction.confidence * 100).toFixed(0)}% confidence
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Current:</span>
                                <span className="font-medium">${prediction.currentPrice.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Predicted:</span>
                                <span className={`font-medium ${
                                  prediction.predictedPrice > prediction.currentPrice ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  ${prediction.predictedPrice.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Range:</span>
                                <span className="font-medium text-gray-700">
                                  ${prediction.lowerBound.toFixed(2)} - ${prediction.upperBound.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Risk Analysis */}
      {showDetails && localState.showRiskAnalysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Analysis</h3>
            <button
              onClick={() => toggleSection('risk')}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {localState.expandedSections.has('risk') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {localState.expandedSections.has('risk') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Risk Distribution */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Risk Distribution</h4>
                    <div className="space-y-2">
                      {['very-high', 'high', 'medium', 'low', 'very-low'].map(riskLevel => {
                        const count = impactHistory.filter(i => i.riskLevel === riskLevel).length
                        const percentage = impactHistory.length > 0 ? (count / impactHistory.length) * 100 : 0
                        
                        return (
                          <div key={riskLevel} className="flex items-center space-x-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getRiskColor(riskLevel as MarketImpact['riskLevel'])}`}>
                              {riskLevel}
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  riskLevel === 'very-high' || riskLevel === 'high' ? 'bg-red-500' :
                                  riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700 w-12 text-right">
                              {count}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Risk Insights */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Risk Insights</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">
                              {impactHistory.filter(i => ['high', 'very-high'].includes(i.riskLevel)).length}
                            </span>{' '}
                            high-risk events detected in the selected period
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-700">
                            Average confidence level:{' '}
                            <span className="font-medium">
                              {impactHistory.length > 0 
                                ? (impactHistory.reduce((sum, i) => sum + i.impact.confidence, 0) / impactHistory.length * 100).toFixed(0)
                                : 0}%
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-700">
                            Most impacted commodity:{' '}
                            <span className="font-medium capitalize">
                              {commodities.reduce((max, commodity) => {
                                const maxCount = impactHistory.filter(i => i.commodity === max).length
                                const commodityCount = impactHistory.filter(i => i.commodity === commodity).length
                                return commodityCount > maxCount ? commodity : max
                              }, commodities[0]).replace('-', ' ')}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default ImpactAssessment
