'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Clock,
  Globe,
  Filter,
  ExternalLink,
  BarChart3,
  AlertCircle
} from 'lucide-react'
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis'

interface NewsSentimentProps {
  showLimit?: number
  className?: string
  autoRefresh?: boolean
}

const SENTIMENT_COLORS = {
  very_positive: 'bg-green-100 text-green-800 border-green-200',
  positive: 'bg-lime-100 text-lime-800 border-lime-200',
  neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  negative: 'bg-orange-100 text-orange-800 border-orange-200',
  very_negative: 'bg-red-100 text-red-800 border-red-200'
}

const SOURCE_COLORS: Record<string, string> = {
  reuters: 'bg-blue-50 text-blue-700 border-blue-200',
  bloomberg: 'bg-purple-50 text-purple-700 border-purple-200',
  'financial-times': 'bg-pink-50 text-pink-700 border-pink-200',
  cnbc: 'bg-yellow-50 text-yellow-700 border-yellow-200'
}

export const NewsSentiment: React.FC<NewsSentimentProps> = ({
  showLimit = 10,
  className = '',
  autoRefresh = true
}) => {
  const sentimentData = useSentimentAnalysis({
    keywords: ['energy', 'oil', 'gas', 'renewable', 'solar', 'wind'],
    platforms: ['twitter', 'reddit'],
    timeWindow: 24,
    updateInterval: 600,
    enableRealTime: autoRefresh
  })

  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'sentiment' | 'relevance' | 'latest'>('relevance')
  const [sentimentFilter, setSentimentFilter] = useState<string>('all')

  // Mock news data for demonstration
  const mockArticles = [
    {
      id: '1',
      title: 'Oil Prices Surge as Supply Constraints Hit Global Markets',
      summary: 'Crude oil prices jumped 5% following OPEC+ production cuts and geopolitical tensions in key producing regions.',
      source: 'Reuters',
      author: 'Energy Correspondent',
      publishedAt: new Date(Date.now() - 7200000),
      url: 'https://reuters.com/article/oil-prices',
      sentiment: -0.4,
      confidence: 0.85,
      relevanceScore: 0.92,
      credibility: 0.9,
      readTime: 3,
      shareCount: 156,
      commentCount: 89,
      tags: ['oil', 'opec', 'geopolitics'],
      language: 'en'
    },
    {
      id: '2',
      title: 'Solar Energy Costs Hit Record Low, Accelerating Global Adoption',
      summary: 'The levelized cost of solar power has fallen by 89% since 2010, making it the cheapest source of electricity in many regions.',
      source: 'Bloomberg',
      author: 'Clean Energy Reporter',
      publishedAt: new Date(Date.now() - 3600000),
      url: 'https://bloomberg.com/article/solar-costs',
      sentiment: 0.7,
      confidence: 0.92,
      relevanceScore: 0.88,
      credibility: 0.85,
      readTime: 4,
      shareCount: 342,
      commentCount: 167,
      tags: ['solar', 'renewable', 'costs'],
      language: 'en'
    },
    {
      id: '3',
      title: 'Natural Gas Futures Decline on Mild Weather Forecasts',
      summary: 'Natural gas prices fell 3% as weather models predict warmer-than-expected temperatures across major consuming regions.',
      source: 'Financial Times',
      author: 'Commodities Analyst',
      publishedAt: new Date(Date.now() - 1800000),
      url: 'https://ft.com/article/gas-prices',
      sentiment: -0.2,
      confidence: 0.78,
      relevanceScore: 0.81,
      credibility: 0.88,
      readTime: 2,
      shareCount: 98,
      commentCount: 45,
      tags: ['natural-gas', 'weather', 'futures'],
      language: 'en'
    }
  ]

  // Filter and sort articles
  const filteredArticles = mockArticles
    .filter((article: any) => {
      const sourceMatch = selectedSource === 'all' || article.source.toLowerCase().includes(selectedSource.toLowerCase())
      const sentimentMatch = sentimentFilter === 'all' || 
        (sentimentFilter === 'positive' && article.sentiment > 0.1) ||
        (sentimentFilter === 'negative' && article.sentiment < -0.1) ||
        (sentimentFilter === 'neutral' && Math.abs(article.sentiment) <= 0.1)
      return sourceMatch && sentimentMatch
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'sentiment') {
        return b.sentiment - a.sentiment
      } else if (sortBy === 'relevance') {
        return b.relevanceScore - a.relevanceScore
      } else {
        return b.publishedAt.getTime() - a.publishedAt.getTime()
      }
    })
    .slice(0, showLimit)

  const sources = Array.from(new Set(mockArticles.map((a: any) => a.source.toLowerCase())))

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.5) return SENTIMENT_COLORS.very_positive
    if (sentiment > 0.1) return SENTIMENT_COLORS.positive
    if (sentiment < -0.5) return SENTIMENT_COLORS.very_negative
    if (sentiment < -0.1) return SENTIMENT_COLORS.negative
    return SENTIMENT_COLORS.neutral
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.1) return <TrendingUp className="w-4 h-4" />
    if (sentiment < -0.1) return <TrendingDown className="w-4 h-4" />
    return <BarChart3 className="w-4 h-4" />
  }

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.5) return 'Very Positive'
    if (sentiment > 0.1) return 'Positive'
    if (sentiment < -0.5) return 'Very Negative'
    if (sentiment < -0.1) return 'Negative'
    return 'Neutral'
  }

  if (sentimentData.news.error) {
    return (
      <div className={`rounded-lg bg-red-50 p-4 border border-red-200 ${className}`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">Failed to load news sentiment data</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">News Sentiment Analysis</h2>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
            {filteredArticles.length}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Source:</label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSource('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedSource === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Sources
            </button>

            {sources.map((source) => (
              <button
                key={source}
                onClick={() => setSelectedSource(source)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedSource === source
                    ? `${SOURCE_COLORS[source] || 'bg-gray-200 text-gray-700'} border-2 border-current`
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="sentiment">Sort by Sentiment</option>
            <option value="latest">Sort by Latest</option>
          </select>

          <select
            value={sentimentFilter}
            onChange={(e: any) => setSentimentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>
      </div>

      {/* News Articles */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {sentimentData.news.isLoading && filteredArticles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-8"
            >
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </motion.div>
          ) : filteredArticles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 bg-gray-50 rounded-lg"
            >
              <Newspaper className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No articles found</p>
            </motion.div>
          ) : (
            filteredArticles.map((article: any, index: number) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow bg-white"
              >
                {/* Article Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${
                        SOURCE_COLORS[article.source.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {article.source}
                      </span>
                      
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${getSentimentColor(article.sentiment)}`}
                      >
                        {getSentimentIcon(article.sentiment)}
                        {getSentimentLabel(article.sentiment)}
                      </span>

                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime} min read
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors flex items-center gap-1"
                      >
                        {article.title}
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      </a>
                    </h3>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                      {article.summary}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>By {article.author}</span>
                      <span>•</span>
                      <span>{new Date(article.publishedAt).toLocaleString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {article.language.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {article.tags.slice(0, 5).map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metrics */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Sentiment:</span>
                      <span className={`font-bold ${article.sentiment > 0 ? 'text-green-600' : article.sentiment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {article.sentiment > 0 ? '+' : ''}{article.sentiment.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="font-medium">Confidence:</span>
                      <span className="font-bold text-blue-600">
                        {(article.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="font-medium">Credibility:</span>
                      <span className="font-bold text-purple-600">
                        {(article.credibility * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{article.shareCount} shares</span>
                    <span>{article.commentCount} comments</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-600">Total Articles</p>
            <p className="text-lg font-bold text-gray-900">{mockArticles.length}</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600">Avg. Sentiment</p>
            <p className="text-lg font-bold text-gray-900">
              {mockArticles.length > 0
                ? (mockArticles.reduce((sum: number, a: any) => sum + a.sentiment, 0) / mockArticles.length).toFixed(2)
                : '0.00'
              }
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600">Positive</p>
            <p className="text-lg font-bold text-green-600">
              {mockArticles.filter((a: any) => a.sentiment > 0.1).length}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600">Negative</p>
            <p className="text-lg font-bold text-red-600">
              {mockArticles.filter((a: any) => a.sentiment < -0.1).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
