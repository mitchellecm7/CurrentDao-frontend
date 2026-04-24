'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  TrendingUp,
  Star,
  Shield,
  Twitter,
  MessageCircle,
  ExternalLink,
  Filter,
  BarChart3,
  Clock,
  Award,
  Zap
} from 'lucide-react'
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis'

interface InfluencerTrackingProps {
  showLimit?: number
  className?: string
  autoRefresh?: boolean
}

const PLATFORM_ICONS = {
  twitter: <Twitter className="w-4 h-4" />,
  reddit: <MessageCircle className="w-4 h-4" />,
  discord: <Users className="w-4 h-4" />,
  telegram: <MessageCircle className="w-4 h-4" />
}

const SENTIMENT_COLORS = {
  very_positive: 'bg-green-100 text-green-800 border-green-200',
  positive: 'bg-lime-100 text-lime-800 border-lime-200',
  neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  negative: 'bg-orange-100 text-orange-800 border-orange-200',
  very_negative: 'bg-red-100 text-red-800 border-red-200'
}

export const InfluencerTracking: React.FC<InfluencerTrackingProps> = ({
  showLimit = 20,
  className = '',
  autoRefresh = true
}) => {
  const sentimentData = useSentimentAnalysis({
    keywords: ['energy', 'oil', 'gas', 'renewable', 'solar', 'wind'],
    platforms: ['twitter', 'reddit', 'telegram'],
    timeWindow: 24,
    updateInterval: 600,
    enableRealTime: autoRefresh
  })

  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'influence' | 'sentiment' | 'followers' | 'engagement'>('influence')
  const [expertiseFilter, setExpertiseFilter] = useState<string>('all')

  // Mock influencer data
  const mockInfluencers = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      platform: 'twitter',
      followers: 125000,
      engagement: 85,
      sentiment: 0.42,
      credibility: 0.92,
      recentPosts: [
        {
          id: 'post1',
          content: 'Breaking: Major breakthrough in solar panel efficiency announced by leading research institute.',
          timestamp: new Date(Date.now() - 7200000),
          sentiment: 0.6,
          likes: 2340,
          shares: 892,
          comments: 156
        }
      ],
      influenceScore: 0.88,
      expertise: ['solar', 'renewable', 'research'],
      lastActive: new Date(Date.now() - 3600000),
      verified: true,
      bio: 'Energy researcher specializing in solar technology and renewable energy markets.',
      location: 'San Francisco, CA',
      website: 'https://sarahchen.energy'
    },
    {
      id: '2',
      name: 'Energy Markets Weekly',
      platform: 'twitter',
      followers: 89000,
      engagement: 78,
      sentiment: 0.15,
      credibility: 0.85,
      recentPosts: [
        {
          id: 'post2',
          content: 'Oil prices showing volatility as OPEC+ considers production adjustments. Markets watching closely.',
          timestamp: new Date(Date.now() - 1800000),
          sentiment: -0.1,
          likes: 1567,
          shares: 456,
          comments: 89
        }
      ],
      influenceScore: 0.76,
      expertise: ['oil', 'gas', 'markets'],
      lastActive: new Date(Date.now() - 900000),
      verified: true,
      bio: 'Weekly analysis of global energy markets and trading trends.',
      location: 'New York, NY',
      website: 'https://energymarkets.weekly'
    },
    {
      id: '3',
      name: 'Michael Rodriguez',
      platform: 'reddit',
      followers: 45000,
      engagement: 92,
      sentiment: 0.38,
      credibility: 0.78,
      recentPosts: [
        {
          id: 'post3',
          content: 'Deep dive: Why wind energy is becoming the most cost-effective option for new power generation.',
          timestamp: new Date(Date.now() - 5400000),
          sentiment: 0.55,
          likes: 3421,
          shares: 1234,
          comments: 567
        }
      ],
      influenceScore: 0.81,
      expertise: ['wind', 'renewable', 'policy'],
      lastActive: new Date(Date.now() - 7200000),
      verified: false,
      bio: 'Wind energy advocate and policy analyst focusing on sustainable energy transitions.',
      location: 'Austin, TX',
      website: 'https://windenergy.blog'
    },
    {
      id: '4',
      name: 'Gas Trader Pro',
      platform: 'twitter',
      followers: 67000,
      engagement: 71,
      sentiment: -0.05,
      credibility: 0.82,
      recentPosts: [
        {
          id: 'post4',
          content: 'Natural gas futures declining as mild weather forecasts reduce demand expectations.',
          timestamp: new Date(Date.now() - 2700000),
          sentiment: -0.25,
          likes: 892,
          shares: 234,
          comments: 45
        }
      ],
      influenceScore: 0.73,
      expertise: ['natural-gas', 'trading', 'futures'],
      lastActive: new Date(Date.now() - 1800000),
      verified: true,
      bio: 'Professional natural gas trader with 15+ years of experience in energy markets.',
      location: 'Houston, TX',
      website: 'https://gastrader.pro'
    },
    {
      id: '5',
      name: 'Clean Energy Insider',
      platform: 'telegram',
      followers: 34000,
      engagement: 88,
      sentiment: 0.51,
      credibility: 0.79,
      recentPosts: [
        {
          id: 'post5',
          content: 'Exclusive: Major utility company announces 10GW renewable energy expansion plan for 2024.',
          timestamp: new Date(Date.now() - 3600000),
          sentiment: 0.65,
          likes: 1876,
          shares: 678,
          comments: 234
        }
      ],
      influenceScore: 0.77,
      expertise: ['renewable', 'policy', 'utilities'],
      lastActive: new Date(Date.now() - 900000),
      verified: false,
      bio: 'Inside source for clean energy industry news and policy developments.',
      location: 'Washington, DC',
      website: 'https://cleanenergy.insider'
    }
  ]

  // Filter and sort influencers
  const filteredInfluencers = mockInfluencers
    .filter((influencer: any) => {
      const platformMatch = selectedPlatform === 'all' || influencer.platform === selectedPlatform
      const expertiseMatch = expertiseFilter === 'all' || influencer.expertise.includes(expertiseFilter)
      return platformMatch && expertiseMatch
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'influence') return b.influenceScore - a.influenceScore
      if (sortBy === 'sentiment') return b.sentiment - a.sentiment
      if (sortBy === 'followers') return b.followers - a.followers
      if (sortBy === 'engagement') return b.engagement - a.engagement
      return 0
    })
    .slice(0, showLimit)

  const platforms = Array.from(new Set(mockInfluencers.map((i: any) => i.platform)))
  const expertiseAreas = Array.from(new Set(mockInfluencers.flatMap((i: any) => i.expertise)))

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.5) return SENTIMENT_COLORS.very_positive
    if (sentiment > 0.1) return SENTIMENT_COLORS.positive
    if (sentiment < -0.5) return SENTIMENT_COLORS.very_negative
    if (sentiment < -0.1) return SENTIMENT_COLORS.negative
    return SENTIMENT_COLORS.neutral
  }

  const getRankBadge = (index: number) => {
    if (index === 0) return <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center gap-1"><Award className="w-3 h-3" /> Top</div>
    if (index === 1) return <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold flex items-center gap-1"><Star className="w-3 h-3" /> #2</div>
    if (index === 2) return <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold flex items-center gap-1"><Star className="w-3 h-3" /> #3</div>
    return <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">#{index + 1}</div>
  }

  if (sentimentData.socialMedia.error) {
    return (
      <div className={`rounded-lg bg-red-50 p-4 border border-red-200 ${className}`}>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-red-600" />
          <p className="text-red-700">Failed to load influencer data</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Influencer Tracking</h2>
          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
            {filteredInfluencers.length}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Platform:</label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedPlatform === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Platforms
            </button>

            {platforms.map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  selectedPlatform === platform
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS]}
                {platform}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="influence">Sort by Influence</option>
            <option value="sentiment">Sort by Sentiment</option>
            <option value="followers">Sort by Followers</option>
            <option value="engagement">Sort by Engagement</option>
          </select>

          <select
            value={expertiseFilter}
            onChange={(e: any) => setExpertiseFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Expertise</option>
            {expertiseAreas.map((area) => (
              <option key={area} value={area}>{area.charAt(0).toUpperCase() + area.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Influencers List */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {sentimentData.socialMedia.isLoading && filteredInfluencers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-8"
            >
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </motion.div>
          ) : filteredInfluencers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 bg-gray-50 rounded-lg"
            >
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No influencers found</p>
            </motion.div>
          ) : (
            filteredInfluencers.map((influencer: any, index: number) => (
              <motion.div
                key={influencer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Platform Icon */}
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {PLATFORM_ICONS[influencer.platform as keyof typeof PLATFORM_ICONS]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{influencer.name}</h3>
                        {influencer.verified && (
                          <Shield className="w-4 h-4 text-blue-600" title="Verified" />
                        )}
                        {getRankBadge(index)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{influencer.bio}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {(influencer.followers / 1000).toFixed(1)}K followers
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {influencer.engagement}% engagement
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Active {Math.floor((Date.now() - influencer.lastActive.getTime()) / 3600000)}h ago
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sentiment Badge */}
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold border ${getSentimentColor(influencer.sentiment)}`}
                  >
                    {influencer.sentiment > 0 ? '+' : ''}{influencer.sentiment.toFixed(2)}
                  </span>
                </div>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {influencer.expertise.slice(0, 4).map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-purple-600">
                      {(influencer.influenceScore * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Influence</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {(influencer.credibility * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Credibility</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {influencer.followers.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Followers</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-orange-600">
                      {influencer.engagement}%
                    </div>
                    <div className="text-xs text-gray-600">Engagement</div>
                  </div>
                </div>

                {/* Recent Post Preview */}
                {influencer.recentPosts.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-600 mb-2">Recent Activity</div>
                    <div className="p-2 bg-gray-50 rounded text-sm">
                      <p className="text-gray-700 mb-2 line-clamp-2">{influencer.recentPosts[0].content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(influencer.recentPosts[0].timestamp).toLocaleString()}</span>
                        <div className="flex items-center gap-3">
                          <span>{influencer.recentPosts[0].likes} likes</span>
                          <span>{influencer.recentPosts[0].shares} shares</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Location: {influencer.location}</span>
                  </div>
                  {influencer.website && (
                    <a
                      href={influencer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Website
                    </a>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <Award className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Top Influencers</p>
          <p className="text-lg font-bold text-gray-900">{mockInfluencers.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Avg. Influence</p>
          <p className="text-lg font-bold text-gray-900">
            {(mockInfluencers.reduce((sum: number, i: any) => sum + i.influenceScore, 0) / mockInfluencers.length * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Positive Sentiment</p>
          <p className="text-lg font-bold text-green-600">
            {mockInfluencers.filter((i: any) => i.sentiment > 0.1).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Total Reach</p>
          <p className="text-lg font-bold text-gray-900">
            {(mockInfluencers.reduce((sum: number, i: any) => sum + i.followers, 0) / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>
    </div>
  )
}
