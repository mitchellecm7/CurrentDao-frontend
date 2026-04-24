'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Brain,
  Signal
} from 'lucide-react'
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis'

interface MarketMoodProps {
  className?: string
  autoRefresh?: boolean
  showPredictions?: boolean
}

const MOOD_COLORS = {
  very_bullish: 'bg-green-500 text-white',
  bullish: 'bg-green-400 text-white',
  neutral: 'bg-gray-400 text-white',
  bearish: 'bg-red-400 text-white',
  very_bearish: 'bg-red-500 text-white'
}

const STRENGTH_COLORS = {
  strong: 'text-purple-600 bg-purple-50',
  moderate: 'text-blue-600 bg-blue-50',
  weak: 'text-gray-600 bg-gray-50'
}

export const MarketMood: React.FC<MarketMoodProps> = ({
  className = '',
  autoRefresh = true,
  showPredictions = true
}) => {
  const sentimentData = useSentimentAnalysis({
    keywords: ['energy', 'oil', 'gas', 'renewable'],
    platforms: ['twitter', 'reddit'],
    timeWindow: 24,
    updateInterval: 300,
    enableRealTime: autoRefresh,
    enablePredictions: showPredictions
  })

  const [timeRange, setTimeRange] = useState<'1h' | '4h' | '24h' | '7d'>('24h')
  const [selectedMetric, setSelectedMetric] = useState<'overall' | 'social' | 'news' | 'signals'>('overall')

  // Mock market mood data
  const mockMarketMood = {
    overall: {
      sentiment: 0.35,
      confidence: 0.78,
      trend: 'bullish' as const,
      strength: 'moderate' as const,
      change: 0.12,
      volume: 1250000,
      volatility: 0.15,
      lastUpdated: new Date()
    },
    social: {
      sentiment: 0.42,
      confidence: 0.82,
      trend: 'bullish' as const,
      strength: 'strong' as const,
      volume: 45000,
      engagement: 78,
      reach: 2500000,
      lastUpdated: new Date()
    },
    news: {
      sentiment: 0.28,
      confidence: 0.71,
      trend: 'neutral' as const,
      strength: 'weak' as const,
      articleCount: 156,
      credibility: 0.85,
      lastUpdated: new Date()
    },
    signals: {
      sentiment: 0.51,
      confidence: 0.69,
      trend: 'bullish' as const,
      strength: 'moderate' as const,
      signalCount: 23,
      successRate: 0.57,
      lastUpdated: new Date()
    }
  }

  const mockPredictions = [
    {
      timestamp: new Date(Date.now() + 3600000),
      predictedSentiment: 0.38,
      confidence: 0.75,
      predictedPrice: 102.50,
      predictionHorizon: 1,
      modelAccuracy: 0.68,
      factors: [
        { name: 'social momentum', weight: 0.4, contribution: 0.15 },
        { name: 'news sentiment', weight: 0.3, contribution: 0.08 },
        { name: 'technical indicators', weight: 0.2, contribution: 0.12 },
        { name: 'market volume', weight: 0.1, contribution: 0.03 }
      ]
    },
    {
      timestamp: new Date(Date.now() + 7200000),
      predictedSentiment: 0.41,
      confidence: 0.71,
      predictedPrice: 103.25,
      predictionHorizon: 2,
      modelAccuracy: 0.65,
      factors: [
        { name: 'social momentum', weight: 0.4, contribution: 0.18 },
        { name: 'news sentiment', weight: 0.3, contribution: 0.10 },
        { name: 'technical indicators', weight: 0.2, contribution: 0.09 },
        { name: 'market volume', weight: 0.1, contribution: 0.04 }
      ]
    }
  ]

  const getMoodColor = (sentiment: number) => {
    if (sentiment > 0.6) return MOOD_COLORS.very_bullish
    if (sentiment > 0.2) return MOOD_COLORS.bullish
    if (sentiment < -0.6) return MOOD_COLORS.very_bearish
    if (sentiment < -0.2) return MOOD_COLORS.bearish
    return MOOD_COLORS.neutral
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="w-5 h-5" />
      case 'bearish': return <TrendingDown className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const getStrengthBadge = (strength: string) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STRENGTH_COLORS[strength as keyof typeof STRENGTH_COLORS]}`}>
        {strength.charAt(0).toUpperCase() + strength.slice(1)}
      </span>
    )
  }

  const currentMood = mockMarketMood[selectedMetric as keyof typeof mockMarketMood]

  if (sentimentData.market.error) {
    return (
      <div className={`rounded-lg bg-red-50 p-4 border border-red-200 ${className}`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">Failed to load market mood data</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Market Mood Indicators</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Updated {new Date(currentMood.lastUpdated).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg border border-gray-200">
        {Object.keys(mockMarketMood).map((metric) => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedMetric === metric
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {metric.charAt(0).toUpperCase() + metric.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Mood Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Mood Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Mood</h3>
            {getStrengthBadge(currentMood.strength)}
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${getMoodColor(currentMood.sentiment)}`}>
              {getTrendIcon(currentMood.trend)}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {currentMood.sentiment > 0 ? '+' : ''}{currentMood.sentiment.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 capitalize">{currentMood.trend}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Confidence</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentMood.confidence * 100}%` }}
                    className="h-full bg-green-500"
                  />
                </div>
                <span className="text-sm font-medium">{(currentMood.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Change</span>
              <span className={`text-sm font-medium ${('change' in currentMood && currentMood.change > 0) ? 'text-green-600' : 'text-red-600'}`}>
                {'change' in currentMood ? (currentMood.change > 0 ? '+' : '') + (currentMood.change * 100).toFixed(1) + '%' : 'N/A'}
              </span>
            </div>

            {selectedMetric === 'overall' && 'volume' in currentMood && 'volatility' in currentMood && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Volume</span>
                  <span className="text-sm font-medium">{currentMood.volume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Volatility</span>
                  <span className="text-sm font-medium">{(currentMood.volatility * 100).toFixed(1)}%</span>
                </div>
              </>
            )}

            {selectedMetric === 'social' && 'engagement' in currentMood && 'reach' in currentMood && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Engagement</span>
                  <span className="text-sm font-medium">{currentMood.engagement}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reach</span>
                  <span className="text-sm font-medium">{(currentMood.reach / 1000000).toFixed(1)}M</span>
                </div>
              </>
            )}

            {selectedMetric === 'news' && 'articleCount' in currentMood && 'credibility' in currentMood && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Articles</span>
                  <span className="text-sm font-medium">{currentMood.articleCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Credibility</span>
                  <span className="text-sm font-medium">{(currentMood.credibility * 100).toFixed(0)}%</span>
                </div>
              </>
            )}

            {selectedMetric === 'signals' && 'signalCount' in currentMood && 'successRate' in currentMood && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Signals</span>
                  <span className="text-sm font-medium">{currentMood.signalCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium">{(currentMood.successRate * 100).toFixed(0)}%</span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Mood History Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood History</h3>
          
          {/* Mock chart visualization */}
          <div className="h-48 flex items-end justify-between gap-2 mb-4">
            {[0.2, -0.1, 0.3, 0.45, 0.35, currentMood.sentiment].map((value, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${Math.abs(value) * 100}%` }}
                transition={{ delay: index * 0.1 }}
                className={`flex-1 rounded-t ${
                  value > 0 ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between text-xs text-gray-600">
            <span>6h ago</span>
            <span>Now</span>
          </div>
        </motion.div>
      </div>

      {/* Predictions */}
      {showPredictions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sentiment Predictions</h3>
          </div>

          <div className="space-y-3">
            {mockPredictions.map((prediction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getMoodColor(prediction.predictedSentiment)}`}>
                      {getTrendIcon(prediction.predictedSentiment > 0.1 ? 'bullish' : prediction.predictedSentiment < -0.1 ? 'bearish' : 'neutral')}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {prediction.predictionHorizon}h Forecast
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(prediction.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {prediction.predictedSentiment > 0 ? '+' : ''}{prediction.predictedSentiment.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      ${(prediction.confidence * 100).toFixed(0)}% conf.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Predicted Price:</span>
                    <span className="ml-2 font-medium">${prediction.predictedPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Model Accuracy:</span>
                    <span className="ml-2 font-medium">{(prediction.modelAccuracy * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-2">Key Factors:</div>
                  <div className="flex flex-wrap gap-2">
                    {prediction.factors.map((factor, factorIndex) => (
                      <div
                        key={factorIndex}
                        className="px-2 py-1 bg-white rounded text-xs border border-gray-200"
                      >
                        <span className="font-medium">{factor.name}</span>
                        <span className="text-gray-600 ml-1">
                          ({(factor.weight * 100).toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <Signal className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Active Signals</p>
          <p className="text-lg font-bold text-gray-900">23</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <Zap className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Mood Strength</p>
          <p className="text-lg font-bold text-gray-900 capitalize">{currentMood.strength}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Accuracy</p>
          <p className="text-lg font-bold text-gray-900">68%</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Volatility</p>
          <p className="text-lg font-bold text-gray-900">15%</p>
        </div>
      </div>
    </div>
  )
}
