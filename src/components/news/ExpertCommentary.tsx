'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Star, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Filter,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Settings,
  Download,
  ExternalLink,
  Award,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useEnergyNews } from '@/hooks/useEnergyNews'

interface ExpertCommentaryProps {
  className?: string
  showControls?: boolean
  showDetails?: boolean
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d'
  refreshInterval?: number
  autoRefresh?: boolean
  maxCommentaries?: number
}

interface Expert {
  id: string
  name: string
  title: string
  organization: string
  expertise: string[]
  credentials: string[]
  avatar?: string
  rating: number
  totalCommentaries: number
  verified: boolean
  bio?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    website?: string
  }
}

interface Commentary {
  id: string
  expert: Expert
  timestamp: Date
  title: string
  content: string
  summary: string
  keyPoints: string[]
  sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  relatedNews: string[]
  tags: string[]
  sector: string
  commodity: string
  region?: string
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term'
  impact: 'high' | 'medium' | 'low'
  engagement: {
    likes: number
    dislikes: number
    shares: number
    bookmarks: number
    replies: number
  }
  verified: boolean
  featured: boolean
}

const mockExperts: Expert[] = [
  {
    id: 'expert-1',
    name: 'Dr. Sarah Chen',
    title: 'Senior Energy Analyst',
    organization: 'Global Energy Institute',
    expertise: ['crude-oil', 'natural-gas', 'renewables'],
    credentials: ['PhD in Energy Economics', '15 years experience'],
    avatar: '/avatars/sarah-chen.jpg',
    rating: 4.8,
    totalCommentaries: 342,
    verified: true,
    bio: 'Leading expert in energy market analysis with focus on oil and gas markets.',
    socialLinks: {
      twitter: '@drsarahchen',
      linkedin: 'sarah-chen-energy',
      website: 'www.sarahchen.energy'
    }
  },
  {
    id: 'expert-2',
    name: 'Michael Rodriguez',
    title: 'Renewable Energy Specialist',
    organization: 'Clean Energy Futures',
    expertise: ['solar', 'wind', 'energy-storage'],
    credentials: ['MS in Environmental Engineering', '12 years experience'],
    avatar: '/avatars/michael-rodriguez.jpg',
    rating: 4.6,
    totalCommentaries: 256,
    verified: true,
    bio: 'Specialist in renewable energy markets and policy analysis.'
  },
  {
    id: 'expert-3',
    name: 'Prof. James Mitchell',
    title: 'Energy Policy Expert',
    organization: 'International Energy Council',
    expertise: ['energy-policy', 'nuclear', 'carbon-markets'],
    credentials: ['PhD in Political Science', '20 years experience'],
    avatar: '/avatars/james-mitchell.jpg',
    rating: 4.9,
    totalCommentaries: 418,
    verified: true,
    bio: 'Expert in energy policy and regulatory frameworks globally.'
  }
]

const generateMockCommentaries = (): Commentary[] => {
  const commentaries: Commentary[] = []
  const sentiments: Array<'bullish' | 'bearish' | 'neutral'> = ['bullish', 'bearish', 'neutral']
  const timeframes: Array<'immediate' | 'short-term' | 'medium-term' | 'long-term'> = ['immediate', 'short-term', 'medium-term', 'long-term']
  const impacts: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low']
  const sectors = ['oil-gas', 'renewables', 'nuclear', 'energy-storage']
  const commodities = ['crude-oil', 'natural-gas', 'solar', 'wind', 'nuclear']
  
  mockExperts.forEach(expert => {
    for (let i = 0; i < 5; i++) {
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)]
      const timeframe = timeframes[Math.floor(Math.random() * timeframes.length)]
      const impact = impacts[Math.floor(Math.random() * impacts.length)]
      const sector = sectors[Math.floor(Math.random() * sectors.length)]
      const commodity = commodities[Math.floor(Math.random() * commodities.length)]
      
      commentaries.push({
        id: `commentary-${expert.id}-${i}`,
        expert,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        title: `Analysis of ${commodity.replace('-', ' ')} market trends and ${timeframe} outlook`,
        content: `Based on recent market developments and policy changes, I anticipate significant movements in the ${commodity} sector. The current market conditions suggest ${sentiment} momentum driven by supply-demand dynamics and regulatory factors. Key factors include production levels, inventory data, and geopolitical considerations that are likely to impact prices in the ${timeframe}.`,
        summary: `Expert analysis of ${commodity} market with ${sentiment} outlook for ${timeframe} timeframe.`,
        keyPoints: [
          `Supply constraints are expected to tighten in the next quarter`,
          `Demand growth remains strong from emerging markets`,
          `Policy changes could significantly impact market dynamics`,
          `Technical indicators suggest ${sentiment} momentum`
        ],
        sentiment,
        confidence: Math.random() * 0.4 + 0.6,
        relatedNews: [`news-${Math.floor(Math.random() * 100)}`, `news-${Math.floor(Math.random() * 100)}`],
        tags: [commodity, sector, sentiment, timeframe],
        sector,
        commodity,
        region: 'Global',
        timeframe,
        impact,
        engagement: {
          likes: Math.floor(Math.random() * 100),
          dislikes: Math.floor(Math.random() * 20),
          shares: Math.floor(Math.random() * 50),
          bookmarks: Math.floor(Math.random() * 30),
          replies: Math.floor(Math.random() * 25)
        },
        verified: Math.random() > 0.2,
        featured: Math.random() > 0.8
      })
    }
  })
  
  return commentaries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export const ExpertCommentary: React.FC<ExpertCommentaryProps> = ({
  className = '',
  showControls = true,
  showDetails = true,
  timeRange = '24h',
  refreshInterval = 300,
  autoRefresh = true,
  maxCommentaries = 20
}) => {
  const [localState, setLocalState] = useState({
    selectedTimeRange: timeRange,
    selectedExpert: '',
    selectedSector: '',
    selectedSentiment: '',
    selectedTimeframe: '',
    searchTerm: '',
    expandedCommentaries: new Set<string>(),
    showVerifiedOnly: false,
    showFeaturedOnly: false,
    sortBy: 'timestamp' as 'timestamp' | 'expert' | 'engagement' | 'confidence',
    sortOrder: 'desc' as 'asc' | 'desc',
    viewMode: 'list' as 'list' | 'grid' | 'detailed'
  })

  const [commentaries, setCommentaries] = useState<Commentary[]>([])

  useEffect(() => {
    setCommentaries(generateMockCommentaries())
  }, [])

  const filteredCommentaries = useMemo(() => {
    let filtered = [...commentaries]
    
    // Time range filter
    const hours = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 168,
      '30d': 720
    }
    const cutoffTime = new Date(Date.now() - hours[localState.selectedTimeRange] * 60 * 60 * 1000)
    filtered = filtered.filter(c => c.timestamp >= cutoffTime)
    
    // Expert filter
    if (localState.selectedExpert) {
      filtered = filtered.filter(c => c.expert.id === localState.selectedExpert)
    }
    
    // Sector filter
    if (localState.selectedSector) {
      filtered = filtered.filter(c => c.sector === localState.selectedSector)
    }
    
    // Sentiment filter
    if (localState.selectedSentiment) {
      filtered = filtered.filter(c => c.sentiment === localState.selectedSentiment)
    }
    
    // Timeframe filter
    if (localState.selectedTimeframe) {
      filtered = filtered.filter(c => c.timeframe === localState.selectedTimeframe)
    }
    
    // Search filter
    if (localState.searchTerm) {
      const searchLower = localState.searchTerm.toLowerCase()
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.content.toLowerCase().includes(searchLower) ||
        c.summary.toLowerCase().includes(searchLower) ||
        c.expert.name.toLowerCase().includes(searchLower) ||
        c.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    
    // Verified only
    if (localState.showVerifiedOnly) {
      filtered = filtered.filter(c => c.verified)
    }
    
    // Featured only
    if (localState.showFeaturedOnly) {
      filtered = filtered.filter(c => c.featured)
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aValue: number
      let bValue: number
      
      switch (localState.sortBy) {
        case 'expert':
          aValue = a.expert.rating
          bValue = b.expert.rating
          break
        case 'engagement':
          aValue = a.engagement.likes + a.engagement.shares + a.engagement.bookmarks
          bValue = b.engagement.likes + b.engagement.shares + b.engagement.bookmarks
          break
        case 'confidence':
          aValue = a.confidence
          bValue = b.confidence
          break
        case 'timestamp':
        default:
          aValue = a.timestamp.getTime()
          bValue = b.timestamp.getTime()
          break
      }
      
      return localState.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })
    
    return filtered.slice(0, maxCommentaries)
  }, [
    commentaries,
    localState.selectedTimeRange,
    localState.selectedExpert,
    localState.selectedSector,
    localState.selectedSentiment,
    localState.selectedTimeframe,
    localState.searchTerm,
    localState.showVerifiedOnly,
    localState.showFeaturedOnly,
    localState.sortBy,
    localState.sortOrder,
    maxCommentaries
  ])

  const getSentimentIcon = (sentiment: Commentary['sentiment']) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-4 h-4" />
      case 'bearish': return <TrendingDown className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getSentimentColor = (sentiment: Commentary['sentiment']) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 bg-green-50'
      case 'bearish': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getImpactColor = (impact: Commentary['impact']) => {
    switch (impact) {
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const toggleCommentary = (id: string) => {
    setLocalState(prev => {
      const expanded = new Set(prev.expandedCommentaries)
      if (expanded.has(id)) {
        expanded.delete(id)
      } else {
        expanded.add(id)
      }
      return { ...prev, expandedCommentaries: expanded }
    })
  }

  const exportCommentaryData = () => {
    const data = {
      commentaries: filteredCommentaries,
      experts: mockExperts,
      timestamp: new Date().toISOString(),
      filters: {
        timeRange: localState.selectedTimeRange,
        expert: localState.selectedExpert,
        sector: localState.selectedSector,
        sentiment: localState.selectedSentiment
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expert-commentary-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Expert commentary data exported successfully')
  }

  const refreshCommentaries = () => {
    setCommentaries(generateMockCommentaries())
    toast.success('Expert commentaries refreshed')
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Expert Commentary</h2>
              <p className="text-gray-600">Insights from leading energy market experts</p>
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-3">
              {/* View Mode */}
              <select
                value={localState.viewMode}
                onChange={(e) => setLocalState(prev => ({ ...prev, viewMode: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="list">List View</option>
                <option value="grid">Grid View</option>
                <option value="detailed">Detailed View</option>
              </select>

              {/* Refresh */}
              <button
                onClick={refreshCommentaries}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Export */}
              <button
                onClick={exportCommentaryData}
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

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search commentaries..."
              value={localState.searchTerm}
              onChange={(e) => setLocalState(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Expert Filter */}
          <select
            value={localState.selectedExpert}
            onChange={(e) => setLocalState(prev => ({ ...prev, selectedExpert: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Experts</option>
            {mockExperts.map(expert => (
              <option key={expert.id} value={expert.id}>
                {expert.name} - {expert.organization}
              </option>
            ))}
          </select>

          {/* Sentiment Filter */}
          <select
            value={localState.selectedSentiment}
            onChange={(e) => setLocalState(prev => ({ ...prev, selectedSentiment: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sentiments</option>
            <option value="bullish">Bullish</option>
            <option value="bearish">Bearish</option>
            <option value="neutral">Neutral</option>
          </select>

          {/* Timeframe Filter */}
          <select
            value={localState.selectedTimeframe}
            onChange={(e) => setLocalState(prev => ({ ...prev, selectedTimeframe: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Timeframes</option>
            <option value="immediate">Immediate</option>
            <option value="short-term">Short-term</option>
            <option value="medium-term">Medium-term</option>
            <option value="long-term">Long-term</option>
          </select>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setLocalState(prev => ({ ...prev, showVerifiedOnly: !prev.showVerifiedOnly }))}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              localState.showVerifiedOnly
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-gray-100 text-gray-700 border-gray-300'
            } border`}
          >
            <CheckCircle className="w-3 h-3 inline mr-1" />
            Verified Only
          </button>
          
          <button
            onClick={() => setLocalState(prev => ({ ...prev, showFeaturedOnly: !prev.showFeaturedOnly }))}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              localState.showFeaturedOnly
                ? 'bg-orange-100 text-orange-700 border-orange-300'
                : 'bg-gray-100 text-gray-700 border-gray-300'
            } border`}
          >
            <Award className="w-3 h-3 inline mr-1" />
            Featured Only
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{filteredCommentaries.length}</div>
          <div className="text-sm text-gray-500">Total Commentaries</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{mockExperts.length}</div>
          <div className="text-sm text-gray-500">Expert Analysts</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {filteredCommentaries.filter(c => c.sentiment === 'bullish').length}
          </div>
          <div className="text-sm text-gray-500">Bullish Views</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {filteredCommentaries.filter(c => c.sentiment === 'bearish').length}
          </div>
          <div className="text-sm text-gray-500">Bearish Views</div>
        </div>
      </div>

      {/* Commentaries List */}
      <div className="space-y-4">
        {filteredCommentaries.map((commentary, index) => (
          <motion.div
            key={commentary.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {commentary.expert.avatar ? (
                    <img src={commentary.expert.avatar} alt={commentary.expert.name} className="w-full h-full rounded-full" />
                  ) : (
                    <User className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">{commentary.expert.name}</h4>
                    {commentary.expert.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                    {commentary.featured && (
                      <Award className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {commentary.expert.title} at {commentary.expert.organization}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">{commentary.expert.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-600">
                      {commentary.timestamp.toLocaleDateString()} {commentary.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(commentary.sentiment)}`}>
                  {getSentimentIcon(commentary.sentiment)}
                  <span className="ml-1">{commentary.sentiment}</span>
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(commentary.impact)}`}>
                  {commentary.impact} impact
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{commentary.title}</h3>
              <p className="text-gray-700 mb-3">{commentary.summary}</p>
              
              <AnimatePresence>
                {localState.expandedCommentaries.has(commentary.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Full Analysis</h4>
                      <p className="text-gray-700">{commentary.content}</p>
                    </div>

                    {/* Key Points */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Points</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {commentary.keyPoints.map((point, idx) => (
                          <li key={idx} className="text-gray-700">{point}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Expert Info */}
                    {showDetails && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">About the Expert</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Expertise:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {commentary.expert.expertise.map(exp => (
                                <span key={exp} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                  {exp.replace('-', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <div className="flex items-center mt-1">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${commentary.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-gray-900">{(commentary.confidence * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {commentary.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">{commentary.engagement.likes}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600">
                  <ThumbsDown className="w-4 h-4" />
                  <span className="text-sm">{commentary.engagement.dislikes}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">{commentary.engagement.shares}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-600 hover:text-purple-600">
                  <Bookmark className="w-4 h-4" />
                  <span className="text-sm">{commentary.engagement.bookmarks}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">{commentary.engagement.replies}</span>
                </button>
              </div>

              <button
                onClick={() => toggleCommentary(commentary.id)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
              >
                {localState.expandedCommentaries.has(commentary.id) ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span className="text-sm">Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span className="text-sm">Read More</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCommentaries.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Commentaries Found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  )
}

export default ExpertCommentary
