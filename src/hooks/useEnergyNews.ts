'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Import services and types
import { NewsAggregationEngine, NewsArticle, SocialMediaPost, NewsSource } from '@/services/news/aggregation-engine'
import { SentimentAnalyzer, SentimentAnalysis, MarketSentiment, SentimentAlert } from '@/services/news/sentiment-analyzer'
import { ImpactCalculator, MarketImpact, PricePrediction, MarketMetrics } from '@/utils/news/impact-calculator'

// Types
interface UseEnergyNewsOptions {
  autoRefresh?: boolean
  refreshInterval?: number // in seconds
  enableRealTime?: boolean
  enableSocialMedia?: boolean
  categories?: string[]
  sources?: string[]
  languages?: string[]
  maxArticles?: number
  enableSentiment?: boolean
  enableImpact?: boolean
  enableAlerts?: boolean
}

interface EnergyNewsState {
  articles: NewsArticle[]
  socialPosts: SocialMediaPost[]
  sentimentAnalyses: Map<string, SentimentAnalysis>
  marketSentiments: MarketSentiment[]
  marketImpacts: MarketImpact[]
  pricePredictions: Map<string, PricePrediction[]>
  alerts: SentimentAlert[]
  marketMetrics: Map<string, MarketMetrics[]>
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  statistics: {
    totalArticles: number
    totalSources: number
    avgSentiment: number
    activeAlerts: number
    topCommodities: string[]
  }
}

interface NewsFilters {
  category?: string
  source?: string
  dateFrom?: Date
  dateTo?: Date
  tags?: string[]
  isBreaking?: boolean
  minRelevance?: number
  sentimentRange?: [number, number]
  impactRange?: [number, number]
  riskLevel?: MarketImpact['riskLevel']
}

interface SearchOptions {
  query: string
  fields?: ('title' | 'content' | 'summary' | 'tags')[]
  fuzzy?: boolean
  limit?: number
  sortBy?: 'relevance' | 'date' | 'sentiment' | 'impact'
  sortOrder?: 'asc' | 'desc'
}

// Initialize services
const aggregationEngine = new NewsAggregationEngine()
const sentimentAnalyzer = new SentimentAnalyzer()
const impactCalculator = new ImpactCalculator()

export const useEnergyNews = (options: UseEnergyNewsOptions = {}) => {
  const queryClient = useQueryClient()
  const [state, setState] = useState<EnergyNewsState>({
    articles: [],
    socialPosts: [],
    sentimentAnalyses: new Map(),
    marketSentiments: [],
    marketImpacts: [],
    pricePredictions: new Map(),
    alerts: [],
    marketMetrics: new Map(),
    isLoading: false,
    error: null,
    lastUpdated: null,
    statistics: {
      totalArticles: 0,
      totalSources: 0,
      avgSentiment: 0,
      activeAlerts: 0,
      topCommodities: []
    }
  })

  const [filters, setFilters] = useState<NewsFilters>({})
  const [searchOptions, setSearchOptions] = useState<SearchOptions | null>(null)

  const opts = useMemo(() => ({
    autoRefresh: true,
    refreshInterval: 300, // 5 minutes
    enableRealTime: true,
    enableSocialMedia: true,
    categories: [],
    sources: [],
    languages: ['en'],
    maxArticles: 100,
    enableSentiment: true,
    enableImpact: true,
    enableAlerts: true,
    ...options
  }), [options])

  // Articles query
  const {
    data: articlesData = [],
    isLoading: articlesLoading,
    error: articlesError,
    refetch: refetchArticles
  } = useQuery({
    queryKey: ['energy-news-articles', filters],
    queryFn: async () => {
      const articles = aggregationEngine.getArticles(filters)
      return articles.slice(0, opts.maxArticles)
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: opts.autoRefresh ? opts.refreshInterval * 1000 : undefined,
    enabled: true
  })

  // Social posts query
  const {
    data: socialPostsData = [],
    isLoading: socialLoading,
    refetch: refetchSocialPosts
  } = useQuery({
    queryKey: ['energy-news-social', filters],
    queryFn: () => {
      if (!opts.enableSocialMedia) return []
      return aggregationEngine.getSocialPosts({
        platform: 'twitter',
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      })
    },
    staleTime: 60000, // 1 minute
    refetchInterval: opts.enableRealTime ? 60000 : undefined,
    enabled: opts.enableSocialMedia
  })

  // Sentiment analyses query
  const {
    data: sentimentData = new Map(),
    isLoading: sentimentLoading,
    refetch: refetchSentiment
  } = useQuery({
    queryKey: ['energy-news-sentiment', articlesData.map(a => a.id)],
    queryFn: async () => {
      if (!opts.enableSentiment) return new Map()
      
      const analyses = new Map<string, SentimentAnalysis>()
      const articlesToAnalyze = articlesData.slice(0, 20) // Limit for performance
      
      for (const article of articlesToAnalyze) {
        try {
          const analysis = await sentimentAnalyzer.analyzeArticle(
            article.id,
            article.title,
            article.content,
            article.metadata
          )
          analyses.set(article.id, analysis)
        } catch (error) {
          console.error(`Failed to analyze article ${article.id}:`, error)
        }
      }
      
      return analyses
    },
    staleTime: 300000, // 5 minutes
    enabled: opts.enableSentiment && articlesData.length > 0
  })

  // Market sentiment query
  const {
    data: marketSentimentData = [],
    refetch: refetchMarketSentiment
  } = useQuery({
    queryKey: ['energy-news-market-sentiment'],
    queryFn: () => {
      const analyses = Array.from(sentimentData.values())
      if (analyses.length === 0) return []
      
      return [sentimentAnalyzer.calculateMarketSentiment(analyses)]
    },
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    enabled: opts.enableSentiment && sentimentData.size > 0
  })

  // Market impacts query
  const {
    data: impactsData = [],
    isLoading: impactsLoading,
    refetch: refetchImpacts
  } = useQuery({
    queryKey: ['energy-news-impacts', articlesData.map(a => a.id)],
    queryFn: async () => {
      if (!opts.enableImpact) return []
      
      const impacts: MarketImpact[] = []
      const articlesToAnalyze = articlesData.slice(0, 10) // Limit for performance
      
      for (const article of articlesToAnalyze) {
        const sentiment = sentimentData.get(article.id)
        if (sentiment) {
          try {
            const impact = await impactCalculator.calculateImpact(article, sentiment)
            impacts.push(impact)
          } catch (error) {
            console.error(`Failed to calculate impact for article ${article.id}:`, error)
          }
        }
      }
      
      return impacts
    },
    staleTime: 300000, // 5 minutes
    enabled: opts.enableImpact && sentimentData.size > 0
  })

  // Price predictions query
  const {
    data: predictionsData = new Map(),
    refetch: refetchPredictions
  } = useQuery({
    queryKey: ['energy-news-predictions'],
    queryFn: async () => {
      if (!opts.enableImpact) return new Map()
      
      const predictions = new Map<string, PricePrediction[]>()
      const commodities = ['crude-oil', 'natural-gas', 'solar', 'wind']
      
      for (const commodity of commodities) {
        try {
          const commodityPredictions = await impactCalculator.generatePricePredictions(
            commodity,
            ['24h', '7d', '30d']
          )
          predictions.set(commodity, commodityPredictions)
        } catch (error) {
          console.error(`Failed to generate predictions for ${commodity}:`, error)
        }
      }
      
      return predictions
    },
    staleTime: 600000, // 10 minutes
    refetchInterval: 600000, // 10 minutes
    enabled: opts.enableImpact
  })

  // Alerts query
  const {
    data: alertsData = [],
    refetch: refetchAlerts
  } = useQuery({
    queryKey: ['energy-news-alerts'],
    queryFn: () => {
      if (!opts.enableAlerts) return []
      return sentimentAnalyzer.getAlerts()
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // 1 minute
    enabled: opts.enableAlerts
  })

  // Update state when data changes
  useEffect(() => {
    const statistics = calculateStatistics(
      articlesData,
      sentimentData,
      impactsData,
      alertsData
    )

    setState(prev => ({
      ...prev,
      articles: articlesData,
      socialPosts: socialPostsData,
      sentimentAnalyses: sentimentData,
      marketSentiments: marketSentimentData,
      marketImpacts: impactsData,
      pricePredictions: predictionsData,
      alerts: alertsData,
      isLoading: articlesLoading || socialLoading || sentimentLoading || impactsLoading,
      error: articlesError?.message || null,
      lastUpdated: new Date(),
      statistics
    }))
  }, [
    articlesData,
    socialPostsData,
    sentimentData,
    marketSentimentData,
    impactsData,
    predictionsData,
    alertsData,
    articlesLoading,
    socialLoading,
    sentimentLoading,
    impactsLoading,
    articlesError
  ])

  // Calculate statistics
  const calculateStatistics = (
    articles: NewsArticle[],
    sentiments: Map<string, SentimentAnalysis>,
    impacts: MarketImpact[],
    alerts: SentimentAlert[]
  ) => {
    const totalArticles = articles.length
    const totalSources = new Set(articles.map(a => a.source.id)).size
    
    const sentimentValues = Array.from(sentiments.values()).map(s => s.overall.score)
    const avgSentiment = sentimentValues.length > 0 
      ? sentimentValues.reduce((sum, score) => sum + score, 0) / sentimentValues.length 
      : 0
    
    const activeAlerts = alerts.filter(a => !a.acknowledged).length
    
    const commodityCounts = impacts.reduce((counts, impact) => {
      counts[impact.commodity] = (counts[impact.commodity] || 0) + 1
      return counts
    }, {} as Record<string, number>)
    
    const topCommodities = Object.entries(commodityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([commodity]) => commodity)

    return {
      totalArticles,
      totalSources,
      avgSentiment,
      activeAlerts,
      topCommodities
    }
  }

  // Search functionality
  const searchNews = useCallback(async (options: SearchOptions) => {
    setSearchOptions(options)
    
    try {
      const results = aggregationEngine.searchArticles(
        options.query,
        {
          fields: options.fields,
          fuzzy: options.fuzzy,
          limit: options.limit
        }
      )
      
      // Apply additional filters
      let filteredResults = results
      
      if (filters.category) {
        filteredResults = filteredResults.filter(article => article.category === filters.category)
      }
      
      if (filters.sentimentRange) {
        filteredResults = filteredResults.filter(article => {
          const sentiment = sentimentData.get(article.id)
          return sentiment && 
                 sentiment.overall.score >= filters.sentimentRange![0] && 
                 sentiment.overall.score <= filters.sentimentRange![1]
        })
      }
      
      if (filters.impactRange) {
        filteredResults = filteredResults.filter(article => {
          const impact = impactsData.find(i => i.articleId === article.id)
          return impact && 
                 Math.abs(impact.impact.priceChange) >= filters.impactRange![0] && 
                 Math.abs(impact.impact.priceChange) <= filters.impactRange![1]
        })
      }
      
      // Sort results
      filteredResults.sort((a, b) => {
        let aValue = 0
        let bValue = 0
        
        switch (options.sortBy) {
          case 'date':
            aValue = a.publishedAt.getTime()
            bValue = b.publishedAt.getTime()
            break
          case 'sentiment':
            aValue = sentimentData.get(a.id)?.overall.score || 0
            bValue = sentimentData.get(b.id)?.overall.score || 0
            break
          case 'impact':
            aValue = Math.abs(impactsData.find(i => i.articleId === a.id)?.impact.priceChange || 0)
            bValue = Math.abs(impactsData.find(i => i.articleId === b.id)?.impact.priceChange || 0)
            break
          case 'relevance':
          default:
            aValue = a.metadata.relevanceScore
            bValue = b.metadata.relevanceScore
            break
        }
        
        return options.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      })
      
      return filteredResults
    } catch (error) {
      console.error('Search failed:', error)
      return []
    }
  }, [filters, sentimentData, impactsData])

  // Filter management
  const updateFilters = useCallback((newFilters: Partial<NewsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setSearchOptions(null)
  }, [])

  // Article management
  const getArticleById = useCallback((id: string) => {
    return state.articles.find(article => article.id === id) || null
  }, [state.articles])

  const getArticleSentiment = useCallback((articleId: string) => {
    return state.sentimentAnalyses.get(articleId) || null
  }, [state.sentimentAnalyses])

  const getArticleImpact = useCallback((articleId: string) => {
    return state.marketImpacts.find(impact => impact.articleId === articleId) || null
  }, [state.marketImpacts])

  // Alert management
  const acknowledgeAlert = useCallback((alertId: string) => {
    sentimentAnalyzer.acknowledgeAlert(alertId)
    queryClient.invalidateQueries({ queryKey: ['energy-news-alerts'] })
  }, [queryClient])

  const getUnacknowledgedAlerts = useCallback(() => {
    return state.alerts.filter(alert => !alert.acknowledged)
  }, [state.alerts])

  // Market data
  const getMarketSentiment = useCallback((hours?: number) => {
    if (hours) {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
      return state.marketSentiments.filter(sentiment => sentiment.timestamp >= cutoff)
    }
    return state.marketSentiments
  }, [state.marketSentiments])

  const getPricePredictions = useCallback((commodity?: string) => {
    if (commodity) {
      return state.pricePredictions.get(commodity) || []
    }
    return state.pricePredictions
  }, [state.pricePredictions])

  const getMarketMetrics = useCallback((commodity: string, hours?: number) => {
    return impactCalculator.getMarketMetrics(commodity, hours)
  }, [])

  // Refresh functions
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refetchArticles(),
      refetchSocialPosts(),
      refetchSentiment(),
      refetchMarketSentiment(),
      refetchImpacts(),
      refetchPredictions(),
      refetchAlerts()
    ])
  }, [
    refetchArticles,
    refetchSocialPosts,
    refetchSentiment,
    refetchMarketSentiment,
    refetchImpacts,
    refetchPredictions,
    refetchAlerts
  ])

  // Breaking news
  const getBreakingNews = useCallback(() => {
    return state.articles.filter(article => article.isBreaking)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  }, [state.articles])

  // Top stories
  const getTopStories = useCallback((limit: number = 10) => {
    return state.articles
      .filter(article => article.metadata.relevanceScore > 0.7)
      .sort((a, b) => {
        const aSentiment = state.sentimentAnalyses.get(a.id)?.overall.score || 0
        const bSentiment = state.sentimentAnalyses.get(b.id)?.overall.score || 0
        
        // Sort by combination of relevance, engagement, and sentiment
        const aScore = a.metadata.relevanceScore + 
                      (a.engagement.views / 10000) + 
                      (Math.abs(aSentiment) * 0.2)
        const bScore = b.metadata.relevanceScore + 
                      (b.engagement.views / 10000) + 
                      (Math.abs(bSentiment) * 0.2)
        
        return bScore - aScore
      })
      .slice(0, limit)
  }, [state.articles, state.sentimentAnalyses])

  // Commodity-specific news
  const getCommodityNews = useCallback((commodity: string) => {
    const commodityKeywords = {
      'crude-oil': ['oil', 'crude', 'petroleum', 'wti', 'brent'],
      'natural-gas': ['gas', 'natural gas', 'lng', 'methane'],
      'solar': ['solar', 'photovoltaic', 'pv', 'sun'],
      'wind': ['wind', 'turbine', 'windmill'],
      'nuclear': ['nuclear', 'atomic', 'fission', 'fusion']
    }
    
    const keywords = commodityKeywords[commodity as keyof typeof commodityKeywords] || []
    
    return state.articles.filter(article => {
      const text = `${article.title} ${article.content} ${article.tags.join(' ')}`.toLowerCase()
      return keywords.some(keyword => text.includes(keyword))
    })
  }, [state.articles])

  // Export data
  const exportData = useCallback((format: 'json' | 'csv' = 'json') => {
    const exportData = {
      articles: state.articles,
      sentiments: Array.from(state.sentimentAnalyses.entries()),
      impacts: state.marketImpacts,
      predictions: Array.from(state.pricePredictions.entries()),
      alerts: state.alerts,
      exportedAt: new Date().toISOString()
    }
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `energy-news-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(exportData)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `energy-news-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [state])

  // Helper function to convert to CSV
  const convertToCSV = (data: any): string => {
    const headers = [
      'ID', 'Title', 'Source', 'Published At', 'Category', 'Sentiment Score',
      'Impact Price Change', 'Impact Confidence', 'Tags', 'URL'
    ]
    
    const rows = data.articles.map((article: NewsArticle) => {
      const sentiment = state.sentimentAnalyses.get(article.id)
      const impact = state.marketImpacts.find(i => i.articleId === article.id)
      
      return [
        article.id,
        `"${article.title.replace(/"/g, '""')}"`,
        article.source.name,
        article.publishedAt.toISOString(),
        article.category,
        sentiment?.overall.score || '',
        impact?.impact.priceChange || '',
        impact?.impact.confidence || '',
        `"${article.tags.join(', ')}"`,
        article.url
      ].join(',')
    })
    
    return [headers.join(','), ...rows].join('\n')
  }

  return {
    // State
    state,
    filters,
    searchOptions,
    
    // Data access
    articles: state.articles,
    socialPosts: state.socialPosts,
    sentimentAnalyses: state.sentimentAnalyses,
    marketSentiments: state.marketSentiments,
    marketImpacts: state.marketImpacts,
    pricePredictions: state.pricePredictions,
    alerts: state.alerts,
    statistics: state.statistics,
    
    // Loading states
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    updateFilters,
    clearFilters,
    searchNews,
    acknowledgeAlert,
    refreshAll,
    
    // Getters
    getArticleById,
    getArticleSentiment,
    getArticleImpact,
    getUnacknowledgedAlerts,
    getMarketSentiment,
    getPricePredictions,
    getMarketMetrics,
    getBreakingNews,
    getTopStories,
    getCommodityNews,
    
    // Export
    exportData,
    
    // Refetch functions
    refetchArticles,
    refetchSocialPosts,
    refetchSentiment,
    refetchMarketSentiment,
    refetchImpacts,
    refetchPredictions,
    refetchAlerts
  }
}

export default useEnergyNews
