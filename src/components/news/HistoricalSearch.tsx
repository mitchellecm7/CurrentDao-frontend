'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  FileText,
  Globe,
  Tag,
  User,
  Settings,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Bookmark,
  Share2,
  ExternalLink,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Save,
  Trash2,
  Copy,
  Mail,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useEnergyNews } from '@/hooks/useEnergyNews'

interface HistoricalSearchProps {
  className?: string
  showControls?: boolean
  maxResults?: number
  defaultFilters?: SearchFilters
}

interface SearchFilters {
  query: string
  dateRange: {
    start: Date | null
    end: Date | null
    preset: 'all' | 'today' | 'yesterday' | 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom'
  }
  sources: string[]
  categories: string[]
  commodities: string[]
  sectors: string[]
  sentiment: 'all' | 'positive' | 'negative' | 'neutral'
  impactLevel: 'all' | 'high' | 'medium' | 'low'
  contentType: 'all' | 'articles' | 'social' | 'expert-commentary'
  language: string[]
  region: string[]
  author: string
  tags: string[]
  minRelevance: number
  excludeKeywords: string[]
}

interface SearchHistory {
  id: string
  query: string
  filters: SearchFilters
  timestamp: Date
  resultCount: number
}

interface SavedSearch {
  id: string
  name: string
  description: string
  filters: SearchFilters
  createdAt: Date
  lastUsed: Date
  usageCount: number
}

const defaultFilters: SearchFilters = {
  query: '',
  dateRange: {
    start: null,
    end: null,
    preset: 'last-7-days'
  },
  sources: [],
  categories: [],
  commodities: [],
  sectors: [],
  sentiment: 'all',
  impactLevel: 'all',
  contentType: 'all',
  language: ['en'],
  region: [],
  author: '',
  tags: [],
  minRelevance: 0.5,
  excludeKeywords: []
}

const mockSavedSearches: SavedSearch[] = [
  {
    id: 'search-1',
    name: 'Oil Price Volatility',
    description: 'High impact news affecting crude oil prices',
    filters: {
      ...defaultFilters,
      commodities: ['crude-oil'],
      impactLevel: 'high',
      contentType: 'articles'
    },
    createdAt: new Date('2024-01-15'),
    lastUsed: new Date('2024-01-20'),
    usageCount: 15
  },
  {
    id: 'search-2',
    name: 'Renewable Energy Policy',
    description: 'Government policies affecting renewable energy sector',
    filters: {
      ...defaultFilters,
      sectors: ['renewables'],
      categories: ['policy', 'regulation'],
      contentType: 'articles'
    },
    createdAt: new Date('2024-01-10'),
    lastUsed: new Date('2024-01-18'),
    usageCount: 8
  }
]

export const HistoricalSearch: React.FC<HistoricalSearchProps> = ({
  className = '',
  showControls = true,
  maxResults = 100,
  defaultFilters = defaultFilters
}) => {
  const {
    state,
    getHistoricalArticles,
    searchArticles,
    exportData
  } = useEnergyNews({
    autoRefresh: false,
    enableHistorical: true
  })

  const [localState, setLocalState] = useState({
    filters: { ...defaultFilters },
    searchHistory: [] as SearchHistory[],
    savedSearches: mockSavedSearches,
    showAdvancedFilters: false,
    showSavedSearches: false,
    showSearchHistory: false,
    isSearching: false,
    searchResults: [] as any[],
    totalResults: 0,
    currentPage: 1,
    resultsPerPage: 20,
    sortBy: 'relevance' as 'relevance' | 'date' | 'sentiment' | 'impact',
    sortOrder: 'desc' as 'asc' | 'desc',
    selectedResults: new Set<string>(),
    showPreview: false,
    previewArticle: null as any,
    exportFormat: 'json' as 'json' | 'csv' | 'excel'
  })

  const availableSources = [
    'Reuters', 'Bloomberg', 'Platts', 'IEA', 'EIA', 'Renewable Energy World',
    'Energy Voice', 'Oil & Gas Journal', 'World Oil', 'Natural Gas Intelligence'
  ]

  const availableCategories = [
    'market-analysis', 'policy', 'technology', 'infrastructure', 'exploration',
    'production', 'trading', 'regulation', 'sustainability', 'innovation'
  ]

  const availableCommodities = [
    'crude-oil', 'natural-gas', 'coal', 'uranium', 'solar', 'wind',
    'hydroelectric', 'geothermal', 'biomass', 'hydrogen', 'batteries'
  ]

  const availableSectors = [
    'oil-gas', 'renewables', 'nuclear', 'energy-storage', 'electricity',
    'carbon-markets', 'energy-efficiency', 'smart-grid', 'transportation'
  ]

  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' }
  ]

  const availableRegions = [
    'North America', 'Europe', 'Asia Pacific', 'Middle East', 'Africa', 'South America',
    'Global', 'OPEC', 'EU', 'US', 'China', 'India'
  ]

  // Apply date range preset
  const applyDatePreset = useCallback((preset: string) => {
    const now = new Date()
    let start: Date | null = null
    let end: Date | null = null

    switch (preset) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        end = now
        break
      case 'yesterday':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'last-7-days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        end = now
        break
      case 'last-30-days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        end = now
        break
      case 'last-90-days':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        end = now
        break
    }

    setLocalState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        dateRange: { start, end, preset: preset as any }
      }
    }))
  }, [])

  // Perform search
  const performSearch = useCallback(async () => {
    if (!localState.filters.query.trim() && localState.filters.dateRange.preset === 'all') {
      toast.error('Please enter a search query or select a date range')
      return
    }

    setLocalState(prev => ({ ...prev, isSearching: true }))

    try {
      const searchParams = {
        query: localState.filters.query,
        startDate: localState.filters.dateRange.start,
        endDate: localState.filters.dateRange.end,
        sources: localState.filters.sources,
        categories: localState.filters.categories,
        commodities: localState.filters.commodities,
        sectors: localState.filters.sectors,
        sentiment: localState.filters.sentiment,
        impactLevel: localState.filters.impactLevel,
        contentType: localState.filters.contentType,
        languages: localState.filters.language,
        regions: localState.filters.region,
        author: localState.filters.author,
        tags: localState.filters.tags,
        minRelevance: localState.filters.minRelevance,
        excludeKeywords: localState.filters.excludeKeywords,
        sortBy: localState.sortBy,
        sortOrder: localState.sortOrder,
        limit: maxResults
      }

      // Mock search implementation
      const mockResults = Array.from({ length: Math.min(50, Math.floor(Math.random() * 50) + 10) }, (_, index) => ({
        id: `search-result-${index}`,
        title: `Energy Market News Article ${index + 1}`,
        summary: `Search result for ${localState.filters.query}`,
        content: `Full article content for search result ${index + 1}`,
        source: availableSources[Math.floor(Math.random() * availableSources.length)],
        author: `Author ${index + 1}`,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        category: availableCategories[Math.floor(Math.random() * availableCategories.length)],
        commodity: availableCommodities[Math.floor(Math.random() * availableCommodities.length)],
        sector: availableSectors[Math.floor(Math.random() * availableSectors.length)],
        sentiment: Math.random() > 0.5 ? 'positive' : Math.random() > 0.5 ? 'negative' : 'neutral',
        impact: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        relevance: Math.random() * 0.5 + 0.5,
        url: `https://example.com/article-${index}`,
        tags: [availableCommodities[Math.floor(Math.random() * availableCommodities.length)]]
      }))

      setLocalState(prev => ({
        ...prev,
        searchResults: mockResults,
        totalResults: mockResults.length,
        isSearching: false,
        currentPage: 1
      }))

      // Add to search history
      const historyItem: SearchHistory = {
        id: `history-${Date.now()}`,
        query: localState.filters.query,
        filters: { ...localState.filters },
        timestamp: new Date(),
        resultCount: mockResults.length
      }

      setLocalState(prev => ({
        ...prev,
        searchHistory: [historyItem, ...prev.searchHistory.slice(0, 49)]
      }))

      toast.success(`Found ${mockResults.length} results`)
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed. Please try again.')
      setLocalState(prev => ({ ...prev, isSearching: false }))
    }
  }, [localState.filters, maxResults])

  // Clear filters
  const clearFilters = useCallback(() => {
    setLocalState(prev => ({
      ...prev,
      filters: { ...defaultFilters }
    }))
  }, [])

  // Save search
  const saveSearch = useCallback(() => {
    const name = prompt('Enter a name for this saved search:')
    if (!name) return

    const description = prompt('Enter a description (optional):') || ''

    const savedSearch: SavedSearch = {
      id: `saved-${Date.now()}`,
      name,
      description,
      filters: { ...localState.filters },
      createdAt: new Date(),
      lastUsed: new Date(),
      usageCount: 0
    }

    setLocalState(prev => ({
      ...prev,
      savedSearches: [savedSearch, ...prev.savedSearches]
    }))

    toast.success('Search saved successfully')
  }, [localState.filters])

  // Load saved search
  const loadSavedSearch = useCallback((savedSearch: SavedSearch) => {
    setLocalState(prev => ({
      ...prev,
      filters: { ...savedSearch.filters },
      savedSearches: prev.savedSearches.map(search =>
        search.id === savedSearch.id
          ? { ...search, lastUsed: new Date(), usageCount: search.usageCount + 1 }
          : search
      )
    }))

    toast.success(`Loaded saved search: ${savedSearch.name}`)
  }, [])

  // Export results
  const exportResults = useCallback(() => {
    if (localState.searchResults.length === 0) {
      toast.error('No results to export')
      return
    }

    const data = {
      query: localState.filters.query,
      filters: localState.filters,
      results: localState.searchResults,
      timestamp: new Date().toISOString(),
      totalResults: localState.totalResults
    }

    let content: string
    let filename: string
    let mimeType: string

    switch (localState.exportFormat) {
      case 'csv':
        content = convertToCSV(data.results)
        filename = `search-results-${new Date().toISOString().split('T')[0]}.csv`
        mimeType = 'text/csv'
        break
      case 'excel':
        // Mock Excel export (would use library like xlsx in real implementation)
        content = JSON.stringify(data, null, 2)
        filename = `search-results-${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
        break
      default:
        content = JSON.stringify(data, null, 2)
        filename = `search-results-${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    toast.success(`Results exported as ${localState.exportFormat.toUpperCase()}`)
  }, [localState.searchResults, localState.filters, localState.exportFormat])

  const convertToCSV = (results: any[]): string => {
    if (results.length === 0) return ''

    const headers = Object.keys(results[0])
    const csvHeaders = headers.join(',')
    const csvRows = results.map(result =>
      headers.map(header => `"${result[header] || ''}"`).join(',')
    )

    return [csvHeaders, ...csvRows].join('\n')
  }

  // Toggle result selection
  const toggleResultSelection = useCallback((resultId: string) => {
    setLocalState(prev => {
      const selected = new Set(prev.selectedResults)
      if (selected.has(resultId)) {
        selected.delete(resultId)
      } else {
        selected.add(resultId)
      }
      return { ...prev, selectedResults: selected }
    })
  }, [])

  // Select all results
  const selectAllResults = useCallback(() => {
    const currentPageResults = localState.searchResults.slice(
      (localState.currentPage - 1) * localState.resultsPerPage,
      localState.currentPage * localState.resultsPerPage
    )
    const allIds = new Set(currentPageResults.map(r => r.id))
    setLocalState(prev => ({ ...prev, selectedResults: allIds }))
  }, [localState.searchResults, localState.currentPage, localState.resultsPerPage])

  // Clear selection
  const clearSelection = useCallback(() => {
    setLocalState(prev => ({ ...prev, selectedResults: new Set() }))
  }, [])

  // Preview article
  const previewArticle = useCallback((article: any) => {
    setLocalState(prev => ({
      ...prev,
      showPreview: true,
      previewArticle: article
    }))
  }, [])

  // Paginated results
  const paginatedResults = useMemo(() => {
    const start = (localState.currentPage - 1) * localState.resultsPerPage
    const end = start + localState.resultsPerPage
    return localState.searchResults.slice(start, end)
  }, [localState.searchResults, localState.currentPage, localState.resultsPerPage])

  const totalPages = Math.ceil(localState.totalResults / localState.resultsPerPage)

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Search Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Historical Search</h2>
        </div>

        {/* Main Search Bar */}
        <div className="flex space-x-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search energy market news, analysis, and commentary..."
              value={localState.filters.query}
              onChange={(e) => setLocalState(prev => ({
                ...prev,
                filters: { ...prev.filters, query: e.target.value }
              }))}
              onKeyPress={(e) => e.key === 'Enter' && performSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={performSearch}
            disabled={localState.isSearching}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {localState.isSearching ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Search</span>
          </button>

          {showControls && (
            <button
              onClick={() => setLocalState(prev => ({ ...prev, showAdvancedFilters: !prev.showAdvancedFilters }))}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Advanced</span>
              {localState.showAdvancedFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={localState.filters.dateRange.preset}
            onChange={(e) => applyDatePreset(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last-7-days">Last 7 Days</option>
            <option value="last-30-days">Last 30 Days</option>
            <option value="last-90-days">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>

          <select
            value={localState.filters.contentType}
            onChange={(e) => setLocalState(prev => ({
              ...prev,
              filters: { ...prev.filters, contentType: e.target.value as any }
            }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Content</option>
            <option value="articles">Articles</option>
            <option value="social">Social Media</option>
            <option value="expert-commentary">Expert Commentary</option>
          </select>

          <select
            value={localState.filters.sentiment}
            onChange={(e) => setLocalState(prev => ({
              ...prev,
              filters: { ...prev.filters, sentiment: e.target.value as any }
            }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sentiment</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
          </select>

          <select
            value={localState.filters.impactLevel}
            onChange={(e) => setLocalState(prev => ({
              ...prev,
              filters: { ...prev.filters, impactLevel: e.target.value as any }
            }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Impact Levels</option>
            <option value="high">High Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="low">Low Impact</option>
          </select>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {localState.showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sources */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sources</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
                    {availableSources.map(source => (
                      <label key={source} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={localState.filters.sources.includes(source)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalState(prev => ({
                                ...prev,
                                filters: {
                                  ...prev.filters,
                                  sources: [...prev.filters.sources, source]
                                }
                              }))
                            } else {
                              setLocalState(prev => ({
                                ...prev,
                                filters: {
                                  ...prev.filters,
                                  sources: prev.filters.sources.filter(s => s !== source)
                                }
                              }))
                            }
                          }}
                          className="rounded"
                        />
                        <span>{source}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
                    {availableCategories.map(category => (
                      <label key={category} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={localState.filters.categories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalState(prev => ({
                                ...prev,
                                filters: {
                                  ...prev.filters,
                                  categories: [...prev.filters.categories, category]
                                }
                              }))
                            } else {
                              setLocalState(prev => ({
                                ...prev,
                                filters: {
                                  ...prev.filters,
                                  categories: prev.filters.categories.filter(c => c !== category)
                                }
                              }))
                            }
                          }}
                          className="rounded"
                        />
                        <span className="capitalize">{category.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Commodities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commodities</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
                    {availableCommodities.map(commodity => (
                      <label key={commodity} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={localState.filters.commodities.includes(commodity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalState(prev => ({
                                ...prev,
                                filters: {
                                  ...prev.filters,
                                  commodities: [...prev.filters.commodities, commodity]
                                }
                              }))
                            } else {
                              setLocalState(prev => ({
                                ...prev,
                                filters: {
                                  ...prev.filters,
                                  commodities: prev.filters.commodities.filter(c => c !== commodity)
                                }
                              }))
                            }
                          }}
                          className="rounded"
                        />
                        <span className="capitalize">{commodity.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sectors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sectors</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
                    {availableSectors.map(sector => (
                      <label key={sector} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={localState.filters.sectors.includes(sector)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalState(prev => ({
                                ...prev,
                                filters: {
                                  ...prev.filters,
                                  sectors: [...prev.filters.sectors, sector]
                                }
                              }))
                            } else {
                              setLocalState(prev => ({
                                ...prev,
                                filters: {
                                  ...prev.filters,
                                  sectors: prev.filters.sectors.filter(s => s !== sector)
                                }
                              }))
                            }
                          }}
                          className="rounded"
                        />
                        <span className="capitalize">{sector.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range */}
                {localState.filters.dateRange.preset === 'custom' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Date Range</label>
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        value={localState.filters.dateRange.start?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setLocalState(prev => ({
                          ...prev,
                          filters: {
                            ...prev.filters,
                            dateRange: {
                              ...prev.filters.dateRange,
                              start: e.target.value ? new Date(e.target.value) : null
                            }
                          }
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="self-center">to</span>
                      <input
                        type="date"
                        value={localState.filters.dateRange.end?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setLocalState(prev => ({
                          ...prev,
                          filters: {
                            ...prev.filters,
                            dateRange: {
                              ...prev.filters.dateRange,
                              end: e.target.value ? new Date(e.target.value) : null
                            }
                          }
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Exclude Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exclude Keywords</label>
                  <input
                    type="text"
                    placeholder="Enter keywords to exclude (comma-separated)"
                    value={localState.filters.excludeKeywords.join(', ')}
                    onChange={(e) => setLocalState(prev => ({
                      ...prev,
                      filters: {
                        ...prev.filters,
                        excludeKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
                <button
                  onClick={saveSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Save Search
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Results */}
      {localState.searchResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results ({localState.totalResults})
              </h3>
              <p className="text-sm text-gray-600">
                Showing {paginatedResults.length} of {localState.totalResults} results
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Sort Options */}
              <select
                value={localState.sortBy}
                onChange={(e) => setLocalState(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="sentiment">Sentiment</option>
                <option value="impact">Impact</option>
              </select>

              {/* Export Options */}
              <div className="flex items-center space-x-2">
                <select
                  value={localState.exportFormat}
                  onChange={(e) => setLocalState(prev => ({ ...prev, exportFormat: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                </select>
                <button
                  onClick={exportResults}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <button
                onClick={selectAllResults}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                Clear Selection
              </button>
              <span className="text-sm text-gray-600">
                {localState.selectedResults.size} selected
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLocalState(prev => ({ ...prev, showSavedSearches: !prev.showSavedSearches }))}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                <Star className="w-4 h-4 inline mr-1" />
                Saved Searches
              </button>
              <button
                onClick={() => setLocalState(prev => ({ ...prev, showSearchHistory: !prev.showSearchHistory }))}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Search History
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {paginatedResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow ${
                  localState.selectedResults.has(result.id) ? 'bg-blue-50 border-blue-300' : 'bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={localState.selectedResults.has(result.id)}
                    onChange={() => toggleResultSelection(result.id)}
                    className="mt-1 rounded"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 cursor-pointer">
                          {result.title}
                        </h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            {result.source}
                          </span>
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {result.author}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {result.publishedAt.toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            result.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                            result.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {result.sentiment}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            result.impact === 'high' ? 'bg-red-100 text-red-700' :
                            result.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {result.impact} impact
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => previewArticle(result)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Bookmark"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                      {result.summary}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {result.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setLocalState(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                disabled={localState.currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  const isActive = pageNum === localState.currentPage
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setLocalState(prev => ({ ...prev, currentPage: pageNum }))}
                      className={`px-3 py-1 rounded ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setLocalState(prev => ({ ...prev, currentPage: Math.min(totalPages, prev.currentPage + 1) }))}
                disabled={localState.currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {localState.searchResults.length === 0 && !localState.isSearching && localState.filters.query && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-500">Try adjusting your search terms or filters</p>
        </div>
      )}

      {/* Saved Searches Panel */}
      <AnimatePresence>
        {localState.showSavedSearches && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setLocalState(prev => ({ ...prev, showSavedSearches: false }))}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-96 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Saved Searches</h3>
                <button
                  onClick={() => setLocalState(prev => ({ ...prev, showSavedSearches: false }))}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {localState.savedSearches.map(savedSearch => (
                  <div
                    key={savedSearch.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => loadSavedSearch(savedSearch)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{savedSearch.name}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Delete saved search logic here
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{savedSearch.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {savedSearch.createdAt.toLocaleDateString()}</span>
                      <span>Used: {savedSearch.usageCount} times</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search History Panel */}
      <AnimatePresence>
        {localState.showSearchHistory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setLocalState(prev => ({ ...prev, showSearchHistory: false }))}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-96 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Search History</h3>
                <button
                  onClick={() => setLocalState(prev => ({ ...prev, showSearchHistory: false }))}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {localState.searchHistory.map((history, index) => (
                  <div
                    key={history.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setLocalState(prev => ({
                        ...prev,
                        filters: { ...history.filters },
                        showSearchHistory: false
                      }))
                      performSearch()
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{history.query}</h4>
                      <span className="text-xs text-gray-500">
                        {history.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {history.resultCount} results
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Article Preview Modal */}
      <AnimatePresence>
        {localState.showPreview && localState.previewArticle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setLocalState(prev => ({ ...prev, showPreview: false }))}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {localState.previewArticle.title}
                </h3>
                <button
                  onClick={() => setLocalState(prev => ({ ...prev, showPreview: false }))}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                <div className="prose max-w-none">
                  <div className="mb-4 text-sm text-gray-600">
                    <p><strong>Source:</strong> {localState.previewArticle.source}</p>
                    <p><strong>Author:</strong> {localState.previewArticle.author}</p>
                    <p><strong>Published:</strong> {localState.previewArticle.publishedAt.toLocaleDateString()}</p>
                    <p><strong>Sentiment:</strong> {localState.previewArticle.sentiment}</p>
                    <p><strong>Impact:</strong> {localState.previewArticle.impact}</p>
                  </div>
                  <div className="text-gray-700">
                    {localState.previewArticle.content}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                <a
                  href={localState.previewArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Read Full Article</span>
                </a>
                <button
                  onClick={() => setLocalState(prev => ({ ...prev, showPreview: false }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HistoricalSearch
