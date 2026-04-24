'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  Brain, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Settings,
  Download,
  Calendar,
  Filter,
  Eye,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useEnergyNews } from '@/hooks/useEnergyNews'
import { SentimentAnalysis, MarketSentiment, SentimentScore } from '@/types/news'

interface SentimentAnalysisProps {
  className?: string
  showControls?: boolean
  showDetails?: boolean
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d'
  refreshInterval?: number
  autoRefresh?: boolean
}

export const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({
  className = '',
  showControls = true,
  showDetails = true,
  timeRange = '24h',
  refreshInterval = 300,
  autoRefresh = true
}) => {
  const {
    state,
    getMarketSentiment,
    getPricePredictions,
    exportData,
    refetchSentiment,
    refetchMarketSentiment
  } = useEnergyNews({
    autoRefresh,
    refreshInterval,
    enableSentiment: true,
    enableImpact: true
  })

  const [localState, setLocalState] = useState({
    selectedTimeRange: timeRange,
    expandedSections: new Set<string>(),
    showAdvancedMetrics: false,
    showEmotionalAnalysis: true,
    showAspectBreakdown: true,
    showTrendAnalysis: true,
    showPredictions: true,
    comparisonMode: false,
    selectedCommodities: [] as string[],
    viewMode: 'dashboard' as 'dashboard' | 'detailed' | 'comparison'
  })

  const marketSentiments = useMemo(() => {
    const hours = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 168,
      '30d': 720
    }
    return getMarketSentiment(hours[localState.selectedTimeRange])
  }, [getMarketSentiment, localState.selectedTimeRange])

  const currentSentiment = marketSentiments[marketSentiments.length - 1]
  const previousSentiment = marketSentiments[marketSentiments.length - 2]

  const sentimentTrend = useMemo(() => {
    if (!currentSentiment || !previousSentiment) return 'stable'
    const change = currentSentiment.overall.score - previousSentiment.overall.score
    if (change > 0.1) return 'improving'
    if (change < -0.1) return 'declining'
    return 'stable'
  }, [currentSentiment, previousSentiment])

  const getSentimentIcon = (sentiment: SentimentScore) => {
    if (sentiment.score > 0.2) return <TrendingUp className="w-5 h-5" />
    if (sentiment.score < -0.2) return <TrendingDown className="w-5 h-5" />
    return <Minus className="w-5 h-5" />
  }

  const getSentimentColor = (sentiment: SentimentScore) => {
    if (sentiment.score > 0.3) return 'text-green-600'
    if (sentiment.score > 0.1) return 'text-green-500'
    if (sentiment.score < -0.3) return 'text-red-600'
    if (sentiment.score < -0.1) return 'text-red-500'
    return 'text-gray-500'
  }

  const getSentimentBgColor = (sentiment: SentimentScore) => {
    if (sentiment.score > 0.3) return 'bg-green-100'
    if (sentiment.score > 0.1) return 'bg-green-50'
    if (sentiment.score < -0.3) return 'bg-red-100'
    if (sentiment.score < -0.1) return 'bg-red-50'
    return 'bg-gray-50'
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

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1)
  }

  const getChangeIndicator = (current: number, previous: number) => {
    const change = current - previous
    const changePercent = ((change / Math.abs(previous)) * 100).toFixed(1)
    
    if (Math.abs(change) < 0.01) return { text: '0.0%', color: 'text-gray-500' }
    
    return {
      text: `${change > 0 ? '+' : ''}${changePercent}%`,
      color: change > 0 ? 'text-green-600' : 'text-red-600'
    }
  }

  const exportSentimentData = () => {
    const data = {
      marketSentiments,
      sentimentAnalyses: Array.from(state.sentimentAnalyses.entries()),
      timestamp: new Date().toISOString(),
      timeRange: localState.selectedTimeRange
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sentiment-analysis-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Sentiment data exported successfully')
  }

  if (!currentSentiment) {
    return (
      <div className={`w-full p-6 bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Sentiment Analysis</h3>
            <p className="text-gray-500">Analyzing market sentiment...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sentiment Analysis</h2>
              <p className="text-gray-600">AI-powered market sentiment insights</p>
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-3">
              {/* Time Range Selector */}
              <select
                value={localState.selectedTimeRange}
                onChange={(e) => setLocalState(prev => ({ ...prev, selectedTimeRange: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>

              {/* View Mode */}
              <select
                value={localState.viewMode}
                onChange={(e) => setLocalState(prev => ({ ...prev, viewMode: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="dashboard">Dashboard</option>
                <option value="detailed">Detailed</option>
                <option value="comparison">Comparison</option>
              </select>

              {/* Refresh */}
              <button
                onClick={() => {
                  refetchSentiment()
                  refetchMarketSentiment()
                  toast.success('Sentiment data refreshed')
                }}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Export */}
              <button
                onClick={exportSentimentData}
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

        {/* Overall Sentiment Score */}
        <div className={`p-6 rounded-lg ${getSentimentBgColor(currentSentiment.overall)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${getSentimentColor(currentSentiment.overall)}`}>
                {getSentimentIcon(currentSentiment.overall)}
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {formatScore(currentSentiment.overall.score)}%
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(currentSentiment.overall)}`}>
                    {currentSentiment.overall.label}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">
                  Confidence: {(currentSentiment.overall.confidence * 100).toFixed(0)}% | 
                  Magnitude: {(currentSentiment.overall.magnitude * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Trend Indicator */}
            {previousSentiment && (
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Trend:</span>
                  <span className={`text-sm font-medium ${
                    sentimentTrend === 'improving' ? 'text-green-600' :
                    sentimentTrend === 'declining' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {sentimentTrend}
                  </span>
                </div>
                <div className={`text-sm ${getChangeIndicator(currentSentiment.overall.score, previousSentiment.overall.score).color}`}>
                  {getChangeIndicator(currentSentiment.overall.score, previousSentiment.overall.score).text}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {currentSentiment.volume}
            </div>
            <div className="text-sm text-gray-500">Articles Analyzed</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${getSentimentColor(currentSentiment.overall)}`}>
              {formatScore(currentSentiment.volatility)}%
            </div>
            <div className="text-sm text-gray-500">Volatility</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(currentSentiment.sectors).length}
            </div>
            <div className="text-sm text-gray-500">Sectors Tracked</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(currentSentiment.commodities).length}
            </div>
            <div className="text-sm text-gray-500">Commodities</div>
          </div>
        </div>
      </div>

      {/* Aspect Breakdown */}
      {showDetails && localState.showAspectBreakdown && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Aspect Analysis</h3>
            <button
              onClick={() => toggleSection('aspects')}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {localState.expandedSections.has('aspects') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {localState.expandedSections.has('aspects') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(currentSentiment.aspects).map(([aspect, sentiment]) => (
                    <div key={aspect} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 capitalize">{aspect}</h4>
                        <div className={`p-2 rounded-full ${getSentimentColor(sentiment)}`}>
                          {getSentimentIcon(sentiment)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${getSentimentColor(sentiment)}`}>
                          {formatScore(sentiment.score)}%
                        </span>
                        <span className="text-sm text-gray-500">
                          {(sentiment.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              sentiment.score > 0 ? 'bg-green-500' : 
                              sentiment.score < 0 ? 'bg-red-500' : 'bg-gray-500'
                            }`}
                            style={{ width: `${Math.abs(sentiment.score) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Sector and Commodity Breakdown */}
      {showDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sectors */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sector Sentiment</h3>
            <div className="space-y-3">
              {Object.entries(currentSentiment.sectors).map(([sector, sentiment]) => (
                <div key={sector} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getSentimentColor(sentiment)}`}>
                      {getSentimentIcon(sentiment)}
                    </div>
                    <span className="font-medium text-gray-900 capitalize">{sector}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold ${getSentimentColor(sentiment)}`}>
                      {formatScore(sentiment.score)}%
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          sentiment.score > 0 ? 'bg-green-500' : 
                          sentiment.score < 0 ? 'bg-red-500' : 'bg-gray-500'
                        }`}
                        style={{ width: `${Math.abs(sentiment.score) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commodities */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Commodity Sentiment</h3>
            <div className="space-y-3">
              {Object.entries(currentSentiment.commodities).map(([commodity, sentiment]) => (
                <div key={commodity} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getSentimentColor(sentiment)}`}>
                      {getSentimentIcon(sentiment)}
                    </div>
                    <span className="font-medium text-gray-900 capitalize">{commodity}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold ${getSentimentColor(sentiment)}`}>
                      {formatScore(sentiment.score)}%
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          sentiment.score > 0 ? 'bg-green-500' : 
                          sentiment.score < 0 ? 'bg-red-500' : 'bg-gray-500'
                        }`}
                        style={{ width: `${Math.abs(sentiment.score) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Emotional Analysis */}
      {showDetails && localState.showEmotionalAnalysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Emotional Analysis</h3>
            <button
              onClick={() => toggleSection('emotions')}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {localState.expandedSections.has('emotions') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {localState.expandedSections.has('emotions') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { emotion: 'fear', icon: AlertTriangle, color: 'text-red-600' },
                    { emotion: 'greed', icon: TrendingUp, color: 'text-green-600' },
                    { emotion: 'optimism', icon: CheckCircle, color: 'text-blue-600' },
                    { emotion: 'uncertainty', icon: Info, color: 'text-yellow-600' },
                    { emotion: 'excitement', icon: Zap, color: 'text-purple-600' },
                    { emotion: 'concern', icon: Activity, color: 'text-orange-600' }
                  ].map(({ emotion, icon: Icon, color }) => {
                    // Mock emotion data - in real implementation would come from sentiment analysis
                    const emotionValue = Math.random() * 0.5 + 0.1
                    
                    return (
                      <div key={emotion} className="text-center p-4 border border-gray-200 rounded-lg">
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
                        <h4 className="font-medium text-gray-900 capitalize">{emotion}</h4>
                        <div className="text-2xl font-bold text-gray-900">
                          {(emotionValue * 100).toFixed(0)}%
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${color.replace('text', 'bg')}`}
                              style={{ width: `${emotionValue * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Trend Analysis */}
      {showDetails && localState.showTrendAnalysis && marketSentiments.length > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
            <button
              onClick={() => toggleSection('trends')}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {localState.expandedSections.has('trends') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {localState.expandedSections.has('trends') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  {/* Trend Summary */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-900">Market Trend</h4>
                        <p className="text-blue-700">
                          Current trend is <span className="font-semibold">{sentimentTrend}</span> with 
                          <span className="font-semibold"> {currentSentiment.volatility > 0.3 ? 'high' : 'moderate'}</span> volatility
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Sentiment Changes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recent Changes</h4>
                      <div className="space-y-2">
                        {marketSentiments.slice(-5).reverse().map((sentiment, index) => {
                          const prevSentiment = marketSentiments[marketSentiments.length - index - 2]
                          const change = prevSentiment ? 
                            sentiment.overall.score - prevSentiment.overall.score : 0
                          
                          return (
                            <div key={sentiment.timestamp.getTime()} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm text-gray-600">
                                {sentiment.timestamp.toLocaleTimeString()}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${getSentimentColor(sentiment.overall)}`}>
                                  {formatScore(sentiment.overall.score)}%
                                </span>
                                {Math.abs(change) > 0.01 && (
                                  <span className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {change > 0 ? '+' : ''}{formatScore(change)}
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                          <p className="text-sm text-gray-700">
                            Sentiment has {sentimentTrend === 'improving' ? 'improved' : 'declined'} by{' '}
                            {Math.abs(currentSentiment.overall.score - (previousSentiment?.overall.score || 0)).toFixed(2)} points
                          </p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Activity className="w-4 h-4 text-orange-600 mt-0.5" />
                          <p className="text-sm text-gray-700">
                            Volatility is {currentSentiment.volatility > 0.3 ? 'elevated' : 'normal'} at{' '}
                            {(currentSentiment.volatility * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Eye className="w-4 h-4 text-purple-600 mt-0.5" />
                          <p className="text-sm text-gray-700">
                            Analysis based on {currentSentiment.volume} recent articles
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

      {/* Predictions */}
      {showDetails && localState.showPredictions && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sentiment Predictions</h3>
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
                  {['24h', '7d', '30d'].map(timeframe => {
                    // Mock prediction data
                    const predictedChange = (Math.random() - 0.5) * 0.2
                    const confidence = Math.random() * 0.3 + 0.6
                    
                    return (
                      <div key={timeframe} className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">{timeframe} Forecast</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Predicted Change:</span>
                            <span className={`font-bold ${predictedChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {predictedChange > 0 ? '+' : ''}{formatScore(predictedChange)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Confidence:</span>
                            <span className="font-medium text-gray-900">
                              {(confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  predictedChange > 0 ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.abs(predictedChange) * 500}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default SentimentAnalysis
