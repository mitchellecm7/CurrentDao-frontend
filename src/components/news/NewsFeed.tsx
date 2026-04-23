'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Newspaper, 
  TrendingUp, 
  Clock, 
  Filter, 
  Search, 
  RefreshCw, 
  Bell,
  AlertCircle,
  Eye,
  Share2,
  Bookmark,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart3,
  MessageSquare,
  Heart,
  X,
  Settings,
  Download,
  Calendar,
  Tag,
  Globe,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useEnergyNews } from '@/hooks/useEnergyNews'
import { NewsArticle, SentimentAnalysis, MarketImpact } from '@/types/news'

interface NewsFeedProps {
  className?: string
  maxArticles?: number
  showFilters?: boolean
  showSearch?: boolean
  enableRealTime?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export const NewsFeed: React.FC<NewsFeedProps> = ({
  className = '',
  maxArticles = 50,
  showFilters = true,
  showSearch = true,
  enableRealTime = true,
  autoRefresh = true,
  refreshInterval = 300
}) => {
  const {
    state,
    filters,
    searchOptions,
    updateFilters,
    clearFilters,
    searchNews,
    acknowledgeAlert,
    refreshAll,
    getArticleSentiment,
    getArticleImpact,
    getUnacknowledgedAlerts,
    getBreakingNews,
    getTopStories,
    exportData
  } = useEnergyNews({
    autoRefresh,
    refreshInterval,
    enableRealTime,
    maxArticles,
    enableSentiment: true,
    enableImpact: true,
    enableAlerts: true
  })

  const [localState, setLocalState] = useState({
    selectedArticle: null as NewsArticle | null,
    expandedArticles: new Set<string>(),
    bookmarkedArticles: new Set<string>(),
    readArticles: new Set<string>(),
    showFiltersPanel: false,
    showSearchPanel: false,
    searchQuery: '',
    selectedCategory: '',
    selectedSource: '',
    selectedTimeRange: '24h' as '1h' | '6h' | '24h' | '7d' | '30d',
    sortBy: 'date' as 'date' | 'relevance' | 'sentiment' | 'impact',
    sortOrder: 'desc' as 'asc' | 'desc',
    viewMode: 'list' as 'list' | 'grid' | 'compact',
    showSentiment: true,
    showImpact: true,
    showOnlyBreaking: false,
    showOnlyHighImpact: false
  })

  const [alerts, setAlerts] = useState(getUnacknowledgedAlerts())

  // Update alerts when they change
  useEffect(() => {
    setAlerts(getUnacknowledgedAlerts())
  }, [state.alerts, getUnacknowledgedAlerts])

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let articles = [...state.articles]

    // Apply search
    if (localState.searchQuery) {
      articles = articles.filter(article =>
        article.title.toLowerCase().includes(localState.searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(localState.searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(localState.searchQuery.toLowerCase()))
      )
    }

    // Apply filters
    if (localState.selectedCategory) {
      articles = articles.filter(article => article.category === localState.selectedCategory)
    }

    if (localState.selectedSource) {
      articles = articles.filter(article => article.source.id === localState.selectedSource)
    }

    if (localState.showOnlyBreaking) {
      articles = articles.filter(article => article.isBreaking)
    }

    if (localState.showOnlyHighImpact) {
      articles = articles.filter(article => {
        const impact = getArticleImpact(article.id)
        return impact && Math.abs(impact.impact.priceChange) > 0.05
      })
    }

    // Apply time range
    if (localState.selectedTimeRange !== 'all') {
      const now = new Date()
      const cutoff = new Date()
      
      switch (localState.selectedTimeRange) {
        case '1h':
          cutoff.setHours(now.getHours() - 1)
          break
        case '6h':
          cutoff.setHours(now.getHours() - 6)
          break
        case '24h':
          cutoff.setDate(now.getDate() - 1)
          break
        case '7d':
          cutoff.setDate(now.getDate() - 7)
          break
        case '30d':
          cutoff.setDate(now.getDate() - 30)
          break
      }
      
      articles = articles.filter(article => article.publishedAt >= cutoff)
    }

    // Sort articles
    articles.sort((a, b) => {
      let aValue = 0
      let bValue = 0

      switch (localState.sortBy) {
        case 'date':
          aValue = a.publishedAt.getTime()
          bValue = b.publishedAt.getTime()
          break
        case 'relevance':
          aValue = a.metadata.relevanceScore
          bValue = b.metadata.relevanceScore
          break
        case 'sentiment':
          aValue = getArticleSentiment(a.id)?.overall.score || 0
          bValue = getArticleSentiment(b.id)?.overall.score || 0
          break
        case 'impact':
          aValue = Math.abs(getArticleImpact(a.id)?.impact.priceChange || 0)
          bValue = Math.abs(getArticleImpact(b.id)?.impact.priceChange || 0)
          break
      }

      return localState.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return articles.slice(0, maxArticles)
  }, [
    state.articles,
    localState.searchQuery,
    localState.selectedCategory,
    localState.selectedSource,
    localState.showOnlyBreaking,
    localState.showOnlyHighImpact,
    localState.selectedTimeRange,
    localState.sortBy,
    localState.sortOrder,
    maxArticles,
    getArticleSentiment,
    getArticleImpact
  ])

  // Get unique categories and sources
  const categories = useMemo(() => {
    const cats = new Set(state.articles.map(article => article.category))
    return Array.from(cats).sort()
  }, [state.articles])

  const sources = useMemo(() => {
    const uniqueSources = new Map()
    state.articles.forEach(article => {
      if (!uniqueSources.has(article.source.id)) {
        uniqueSources.set(article.source.id, article.source)
      }
    })
    return Array.from(uniqueSources.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [state.articles])

  // Toggle article expansion
  const toggleArticleExpansion = useCallback((articleId: string) => {
    setLocalState(prev => {
      const expanded = new Set(prev.expandedArticles)
      if (expanded.has(articleId)) {
        expanded.delete(articleId)
      } else {
        expanded.add(articleId)
      }
      return { ...prev, expandedArticles: expanded }
    })
  }, [])

  // Toggle bookmark
  const toggleBookmark = useCallback((articleId: string) => {
    setLocalState(prev => {
      const bookmarked = new Set(prev.bookmarkedArticles)
      if (bookmarked.has(articleId)) {
        bookmarked.delete(articleId)
        toast.success('Bookmark removed')
      } else {
        bookmarked.add(articleId)
        toast.success('Article bookmarked')
      }
      return { ...prev, bookmarkedArticles: bookmarked }
    })
  }, [])

  // Mark as read
  const markAsRead = useCallback((articleId: string) => {
    setLocalState(prev => {
      const read = new Set(prev.readArticles)
      read.add(articleId)
      return { ...prev, readArticles: read }
    })
  }, [])

  // Get sentiment color
  const getSentimentColor = (sentiment: SentimentAnalysis['overall']) => {
    if (!sentiment) return 'text-gray-500'
    
    if (sentiment.score > 0.3) return 'text-green-600'
    if (sentiment.score > 0.1) return 'text-green-500'
    if (sentiment.score < -0.3) return 'text-red-600'
    if (sentiment.score < -0.1) return 'text-red-500'
    return 'text-gray-500'
  }

  // Get impact color
  const getImpactColor = (impact: MarketImpact) => {
    const change = Math.abs(impact.impact.priceChange)
    
    if (change > 0.1) return 'text-red-600'
    if (change > 0.05) return 'text-orange-600'
    if (change > 0.02) return 'text-yellow-600'
    return 'text-gray-600'
  }

  // Format time
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  // Share article
  const shareArticle = useCallback((article: NewsArticle) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: article.url
      })
    } else {
      navigator.clipboard.writeText(article.url)
      toast.success('Article URL copied to clipboard')
    }
  }, [])

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setLocalState(prev => ({ ...prev, searchQuery: query }))
  }, [])

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setLocalState(prev => ({
      ...prev,
      searchQuery: '',
      selectedCategory: '',
      selectedSource: '',
      selectedTimeRange: '24h',
      showOnlyBreaking: false,
      showOnlyHighImpact: false
    }))
    clearFilters()
  }, [clearFilters])

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Newspaper className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Energy Market News</h1>
            <p className="text-gray-600">
              Real-time news aggregation with AI-powered sentiment analysis
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Alerts */}
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-gray-900 relative">
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={refreshAll}
            disabled={state.isLoading}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${state.isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export */}
          <button
            onClick={() => exportData('json')}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{state.statistics.totalArticles}</div>
            <div className="text-sm text-gray-500">Total Articles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{state.statistics.totalSources}</div>
            <div className="text-sm text-gray-500">Sources</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getSentimentColor({ score: state.statistics.avgSentiment } as any)}`}>
              {state.statistics.avgSentiment > 0 ? '+' : ''}{state.statistics.avgSentiment.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">Avg Sentiment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{state.statistics.activeAlerts}</div>
            <div className="text-sm text-gray-500">Active Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{getBreakingNews().length}</div>
            <div className="text-sm text-gray-500">Breaking News</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {getTopStories().length}
            </div>
            <div className="text-sm text-gray-500">Top Stories</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            {showSearch && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={localState.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-2">
                {/* Category Filter */}
                <select
                  value={localState.selectedCategory}
                  onChange={(e) => setLocalState(prev => ({ ...prev, selectedCategory: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Source Filter */}
                <select
                  value={localState.selectedSource}
                  onChange={(e) => setLocalState(prev => ({ ...prev, selectedSource: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sources</option>
                  {sources.map(source => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>

                {/* Time Range */}
                <select
                  value={localState.selectedTimeRange}
                  onChange={(e) => setLocalState(prev => ({ ...prev, selectedTimeRange: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1h">Last Hour</option>
                  <option value="6h">Last 6 Hours</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>

                {/* Sort */}
                <select
                  value={localState.sortBy}
                  onChange={(e) => setLocalState(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="relevance">Relevance</option>
                  <option value="sentiment">Sentiment</option>
                  <option value="impact">Market Impact</option>
                </select>

                {/* Quick Filters */}
                <button
                  onClick={() => setLocalState(prev => ({ ...prev, showOnlyBreaking: !prev.showOnlyBreaking }))}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    localState.showOnlyBreaking
                      ? 'bg-red-100 border-red-300 text-red-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Breaking
                </button>

                <button
                  onClick={() => setLocalState(prev => ({ ...prev, showOnlyHighImpact: !prev.showOnlyHighImpact }))}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    localState.showOnlyHighImpact
                      ? 'bg-orange-100 border-orange-300 text-orange-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  High Impact
                </button>

                {/* Clear Filters */}
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* News Articles */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={clearAllFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredArticles.map((article, index) => {
            const sentiment = getArticleSentiment(article.id)
            const impact = getArticleImpact(article.id)
            const isExpanded = localState.expandedArticles.has(article.id)
            const isBookmarked = localState.bookmarkedArticles.has(article.id)
            const isRead = localState.readArticles.has(article.id)

            return (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all ${
                  isRead ? 'opacity-75' : ''
                } ${article.isBreaking ? 'border-red-300' : ''}`}
              >
                {/* Article Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {article.isBreaking && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            <Zap className="w-3 h-3 inline mr-1" />
                            BREAKING
                          </span>
                        )}
                        
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {article.category}
                        </span>

                        {sentiment && localState.showSentiment && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(sentiment.overall)}`}>
                            {sentiment.overall.label}
                          </span>
                        )}

                        {impact && localState.showImpact && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(impact)}`}>
                            {impact.impact.priceChange > 0 ? '+' : ''}{(impact.impact.priceChange * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={() => markAsRead(article.id)}
                        >
                          {article.title}
                        </a>
                      </h3>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{article.author}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <span>{article.source.name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(article.publishedAt)}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{article.engagement.views}</span>
                        </div>
                      </div>
                    </div>

                    {/* Article Image */}
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-32 h-24 object-cover rounded-lg ml-4"
                      />
                    )}
                  </div>

                  {/* Summary */}
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {article.summary}
                  </p>

                  {/* Tags */}
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.tags.slice(0, 5).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {article.tags.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{article.tags.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleArticleExpansion(article.id)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            <span>Show Less</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            <span>Read More</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => toggleBookmark(article.id)}
                        className={`flex items-center space-x-1 text-sm ${
                          isBookmarked ? 'text-yellow-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                      </button>

                      <button
                        onClick={() => shareArticle(article)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 text-sm"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>

                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => markAsRead(article.id)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Read Full</span>
                      </a>
                    </div>

                    {/* Engagement */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{article.engagement.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{article.engagement.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="w-4 h-4" />
                        <span>{article.engagement.shares}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-6">
                        {/* Full Content */}
                        <div className="prose max-w-none mb-6">
                          <p className="text-gray-700 leading-relaxed">
                            {article.content}
                          </p>
                        </div>

                        {/* Sentiment Analysis */}
                        {sentiment && localState.showSentiment && (
                          <div className="bg-blue-50 rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-blue-900 mb-2">Sentiment Analysis</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Overall:</span>
                                <span className={`ml-2 font-medium ${getSentimentColor(sentiment.overall)}`}>
                                  {sentiment.overall.label} ({sentiment.overall.score.toFixed(2)})
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Confidence:</span>
                                <span className="ml-2 font-medium">
                                  {(sentiment.overall.confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Magnitude:</span>
                                <span className="ml-2 font-medium">
                                  {(sentiment.overall.magnitude * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Market:</span>
                                <span className={`ml-2 font-medium ${getSentimentColor(sentiment.aspects.market)}`}>
                                  {sentiment.aspects.market.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Market Impact */}
                        {impact && localState.showImpact && (
                          <div className="bg-orange-50 rounded-lg p-4">
                            <h4 className="font-semibold text-orange-900 mb-2">Market Impact</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Price Impact:</span>
                                <span className={`ml-2 font-medium ${getImpactColor(impact)}`}>
                                  {impact.impact.priceChange > 0 ? '+' : ''}{(impact.impact.priceChange * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Volume:</span>
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
                                <span className="text-gray-600">Risk Level:</span>
                                <span className="ml-2 font-medium capitalize">
                                  {impact.riskLevel}
                                </span>
                              </div>
                            </div>

                            {/* Recommendations */}
                            {impact.recommendations.length > 0 && (
                              <div className="mt-4">
                                <h5 className="font-medium text-orange-900 mb-2">Recommendations:</h5>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                  {impact.recommendations.slice(0, 3).map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })
        )}
      </div>

      {/* Load More */}
      {filteredArticles.length >= maxArticles && (
        <div className="text-center">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Load More Articles
          </button>
        </div>
      )}

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <div className="fixed bottom-4 right-4 w-80 max-h-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="bg-red-600 text-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Market Alerts</h3>
              <button
                onClick={() => setAlerts([])}
                className="text-white hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {alert.severity}
                  </span>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Acknowledge
                  </button>
                </div>
                <p className="text-sm text-gray-700">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {alert.timestamp.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NewsFeed
