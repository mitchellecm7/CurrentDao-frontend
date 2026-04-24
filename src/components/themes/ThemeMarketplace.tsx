'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Search,
  Filter,
  Star,
  Download,
  Heart,
  Eye,
  Share2,
  TrendingUp,
  Clock,
  User,
  Check,
  X,
  Grid3x3,
  List,
  Palette,
  Zap,
  Award,
  MessageSquare,
  ChevronDown,
  Upload,
  ExternalLink,
} from 'lucide-react'
import { CommunityTheme, ThemeCategory, ThemeSearchFilters, AccessibilityLevel } from '@/types/theme-engine'

interface ThemeMarketplaceProps {
  onThemeSelect?: (theme: CommunityTheme) => void
  onThemeDownload?: (theme: CommunityTheme) => void
  onThemeUpload?: (theme: CommunityTheme) => void
  className?: string
}

export function ThemeMarketplace({ 
  onThemeSelect, 
  onThemeDownload, 
  onThemeUpload,
  className = '' 
}: ThemeMarketplaceProps) {
  const [themes, setThemes] = useState<CommunityTheme[]>([])
  const [filteredThemes, setFilteredThemes] = useState<CommunityTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'trending' | 'popular' | 'newest' | 'rating'>('trending')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<CommunityTheme | null>(null)
  const [filters, setFilters] = useState<ThemeSearchFilters>({})
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    loadCommunityThemes()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [themes, searchQuery, filters, sortBy])

  const loadCommunityThemes = useCallback(async () => {
    setLoading(true)
    try {
      // Mock data - in real app, this would fetch from API
      const mockThemes: CommunityTheme[] = [
        {
          id: 'theme-1',
          name: 'Ocean Breeze',
          description: 'A calming blue theme inspired by ocean colors with smooth gradients',
          category: 'professional',
          accessibilityLevel: 'standard',
          mode: 'light',
          colors: {
            light: {
              background: '0 0% 98%',
              foreground: '210 40% 8%',
              card: '0 0% 100%',
              cardForeground: '210 40% 8%',
              popover: '0 0% 100%',
              popoverForeground: '210 40% 8%',
              primary: '210 100% 50%',
              primaryForeground: '0 0% 100%',
              secondary: '210 40% 96%',
              secondaryForeground: '210 40% 8%',
              muted: '210 40% 96%',
              mutedForeground: '215.4 16.3% 46.9%',
              accent: '210 100% 50%',
              accentForeground: '0 0% 100%',
              destructive: '0 84.2% 60.2%',
              destructiveForeground: '0 0% 100%',
              border: '214.3 31.8% 91.4%',
              input: '214.3 31.8% 91.4%',
              ring: '210 100% 50%',
            },
            dark: {
              background: '210 40% 8%',
              foreground: '0 0% 98%',
              card: '210 40% 8%',
              cardForeground: '0 0% 98%',
              popover: '210 40% 8%',
              popoverForeground: '0 0% 98%',
              primary: '210 100% 60%',
              primaryForeground: '210 40% 8%',
              secondary: '217.2 32.6% 17.5%',
              secondaryForeground: '0 0% 98%',
              muted: '217.2 32.6% 17.5%',
              mutedForeground: '215 20.2% 65.1%',
              accent: '210 100% 60%',
              accentForeground: '210 40% 8%',
              destructive: '0 62.8% 30.6%',
              destructiveForeground: '0 0% 98%',
              border: '217.2 32.6% 17.5%',
              input: '217.2 32.6% 17.5%',
              ring: '210 100% 60%',
            },
          },
          brand: {
            logoSize: 'medium',
            brandColors: {
              primary: '#3B82F6',
              secondary: '#06B6D4',
              accent: '#0EA5E9',
            },
            borderRadius: 'medium',
            spacing: 'normal',
          },
          transitions: {
            enabled: true,
            duration: 300,
            easing: 'ease-in-out',
          },
          effects: {
            shadows: true,
            animations: true,
            hoverEffects: true,
            gradients: true,
          },
          metadata: {
            author: 'Sarah Chen',
            version: '1.2.0',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-03-10'),
            tags: ['blue', 'professional', 'calm'],
            downloads: 15420,
            rating: 4.8,
            featured: true,
          },
          communityData: {
            authorId: 'user-1',
            authorName: 'Sarah Chen',
            authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
            isVerified: true,
            downloadCount: 15420,
            ratingCount: 324,
            averageRating: 4.8,
            reviews: [],
            featured: true,
            trending: true,
            tags: ['blue', 'professional', 'calm'],
          },
          sharing: {
            isPublic: true,
            shareableLink: 'https://themes.currentdao.com/ocean-breeze',
            embedCode: '<iframe src="https://themes.currentdao.com/ocean-breeze/embed"></iframe>',
          },
        },
        {
          id: 'theme-2',
          name: 'Dark Mode Pro',
          description: 'Professional dark theme optimized for low-light environments',
          category: 'professional',
          accessibilityLevel: 'high-contrast',
          mode: 'dark',
          colors: {
            light: {
              background: '0 0% 100%',
              foreground: '0 0% 3.9%',
              card: '0 0% 100%',
              cardForeground: '0 0% 3.9%',
              popover: '0 0% 100%',
              popoverForeground: '0 0% 3.9%',
              primary: '0 0% 9%',
              primaryForeground: '0 0% 98%',
              secondary: '0 0% 96.1%',
              secondaryForeground: '0 0% 9%',
              muted: '0 0% 96.1%',
              mutedForeground: '0 0% 45.1%',
              accent: '0 0% 9%',
              accentForeground: '0 0% 98%',
              destructive: '0 84.2% 60.2%',
              destructiveForeground: '0 0% 98%',
              border: '0 0% 9%',
              input: '0 0% 9%',
              ring: '0 0% 9%',
            },
            dark: {
              background: '0 0% 3.9%',
              foreground: '0 0% 98%',
              card: '0 0% 3.9%',
              cardForeground: '0 0% 98%',
              popover: '0 0% 3.9%',
              popoverForeground: '0 0% 98%',
              primary: '0 0% 98%',
              primaryForeground: '0 0% 9%',
              secondary: '0 0% 14.9%',
              secondaryForeground: '0 0% 98%',
              muted: '0 0% 14.9%',
              mutedForeground: '0 0% 63.9%',
              accent: '0 0% 98%',
              accentForeground: '0 0% 9%',
              destructive: '0 62.8% 30.6%',
              destructiveForeground: '0 0% 98%',
              border: '0 0% 14.9%',
              input: '0 0% 14.9%',
              ring: '0 0% 83.1%',
            },
          },
          brand: {
            logoSize: 'medium',
            brandColors: {
              primary: '#000000',
              secondary: '#FFFFFF',
              accent: '#808080',
            },
            borderRadius: 'small',
            spacing: 'comfortable',
          },
          transitions: {
            enabled: true,
            duration: 200,
            easing: 'ease-out',
          },
          effects: {
            shadows: false,
            animations: true,
            hoverEffects: true,
            gradients: false,
          },
          metadata: {
            author: 'Alex Kumar',
            version: '2.1.0',
            createdAt: new Date('2024-02-20'),
            updatedAt: new Date('2024-03-15'),
            tags: ['dark', 'professional', 'high-contrast'],
            downloads: 8934,
            rating: 4.6,
            featured: false,
          },
          communityData: {
            authorId: 'user-2',
            authorName: 'Alex Kumar',
            authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
            isVerified: false,
            downloadCount: 8934,
            ratingCount: 156,
            averageRating: 4.6,
            reviews: [],
            featured: false,
            trending: false,
            tags: ['dark', 'professional', 'high-contrast'],
          },
          sharing: {
            isPublic: true,
            shareableLink: 'https://themes.currentdao.com/dark-mode-pro',
          },
        },
        {
          id: 'theme-3',
          name: 'Neon Dreams',
          description: 'Vibrant neon theme with glowing effects perfect for creative projects',
          category: 'creative',
          accessibilityLevel: 'standard',
          mode: 'dark',
          colors: {
            light: {
              background: '0 0% 100%',
              foreground: '0 0% 3.9%',
              card: '0 0% 100%',
              cardForeground: '0 0% 3.9%',
              popover: '0 0% 100%',
              popoverForeground: '0 0% 3.9%',
              primary: '326 100% 54%',
              primaryForeground: '0 0% 100%',
              secondary: '0 0% 96.1%',
              secondaryForeground: '0 0% 3.9%',
              muted: '0 0% 96.1%',
              mutedForeground: '0 0% 45.1%',
              accent: '280 100% 70%',
              accentForeground: '0 0% 100%',
              destructive: '0 84.2% 60.2%',
              destructiveForeground: '0 0% 100%',
              border: '0 0% 9%',
              input: '0 0% 9%',
              ring: '326 100% 54%',
            },
            dark: {
              background: '0 0% 3.9%',
              foreground: '0 0% 98%',
              card: '0 0% 3.9%',
              cardForeground: '0 0% 98%',
              popover: '0 0% 3.9%',
              popoverForeground: '0 0% 98%',
              primary: '326 100% 64%',
              primaryForeground: '0 0% 3.9%',
              secondary: '0 0% 14.9%',
              secondaryForeground: '0 0% 98%',
              muted: '0 0% 14.9%',
              mutedForeground: '0 0% 63.9%',
              accent: '280 100% 75%',
              accentForeground: '0 0% 3.9%',
              destructive: '0 62.8% 30.6%',
              destructiveForeground: '0 0% 98%',
              border: '0 0% 14.9%',
              input: '0 0% 14.9%',
              ring: '326 100% 64%',
            },
          },
          brand: {
            logoSize: 'large',
            brandColors: {
              primary: '#FF00FF',
              secondary: '#00FFFF',
              accent: '#FFFF00',
            },
            borderRadius: 'full',
            spacing: 'spacious',
          },
          transitions: {
            enabled: true,
            duration: 400,
            easing: 'ease-in-out',
          },
          effects: {
            shadows: true,
            animations: true,
            hoverEffects: true,
            gradients: true,
          },
          metadata: {
            author: 'Maya Rodriguez',
            version: '1.0.0',
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date('2024-03-18'),
            tags: ['neon', 'creative', 'glowing'],
            downloads: 5678,
            rating: 4.9,
            featured: true,
          },
          communityData: {
            authorId: 'user-3',
            authorName: 'Maya Rodriguez',
            authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya',
            isVerified: true,
            downloadCount: 5678,
            ratingCount: 89,
            averageRating: 4.9,
            reviews: [],
            featured: true,
            trending: true,
            tags: ['neon', 'creative', 'glowing'],
          },
          sharing: {
            isPublic: true,
            shareableLink: 'https://themes.currentdao.com/neon-dreams',
          },
        },
      ]
      
      setThemes(mockThemes)
    } catch (error) {
      console.error('Failed to load community themes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const applyFilters = useCallback(() => {
    let filtered = [...themes]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(theme =>
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(theme => theme.category === filters.category)
    }

    // Accessibility filter
    if (filters.accessibilityLevel) {
      filtered = filtered.filter(theme => theme.accessibilityLevel === filters.accessibilityLevel)
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(theme => theme.communityData.averageRating >= filters.rating!)
    }

    // Featured filter
    if (filters.featured) {
      filtered = filtered.filter(theme => theme.communityData.featured)
    }

    // Trending filter
    if (filters.trending) {
      filtered = filtered.filter(theme => theme.communityData.trending)
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(theme =>
        filters.tags!.some(tag => theme.communityData.tags.includes(tag))
      )
    }

    // Author filter
    if (filters.author) {
      filtered = filtered.filter(theme =>
        theme.communityData.authorName.toLowerCase().includes(filters.author!.toLowerCase())
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'trending':
          return b.communityData.downloadCount - a.communityData.downloadCount
        case 'popular':
          return b.communityData.ratingCount - a.communityData.ratingCount
        case 'newest':
          return b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime()
        case 'rating':
          return b.communityData.averageRating - a.communityData.averageRating
        default:
          return 0
      }
    })

    setFilteredThemes(filtered)
  }, [themes, searchQuery, filters, sortBy])

  const handleThemeDownload = useCallback((theme: CommunityTheme) => {
    onThemeDownload?.(theme)
    // Update download count
    setThemes(prev => prev.map(t => 
      t.id === theme.id 
        ? {
            ...t,
            communityData: {
              ...t.communityData,
              downloadCount: t.communityData.downloadCount + 1
            },
            metadata: {
              ...t.metadata,
              downloads: t.metadata.downloads + 1
            }
          }
        : t
    ))
  }, [onThemeDownload])

  const handleThemeLike = useCallback((themeId: string) => {
    // In a real app, this would call an API
    console.log('Like theme:', themeId)
  }, [])

  const handleThemeShare = useCallback((theme: CommunityTheme) => {
    if (navigator.share) {
      navigator.share({
        title: theme.name,
        text: theme.description,
        url: theme.communityData.shareableLink,
      })
    } else {
      navigator.clipboard.writeText(theme.communityData.shareableLink || '')
    }
  }, [])

  const categories: ThemeCategory[] = ['professional', 'creative', 'minimal', 'accessibility', 'seasonal', 'brand']
  const accessibilityLevels: AccessibilityLevel[] = ['standard', 'high-contrast', 'colorblind-friendly', 'large-text']
  const popularTags = ['blue', 'dark', 'minimal', 'professional', 'creative', 'colorful', 'modern', 'classic']

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Theme Marketplace
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Discover and share beautiful themes from the community
            </p>
          </div>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Theme
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              {Object.values(filters).some(v => v) && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="trending">Trending</option>
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
            </select>

            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accessibility
                </label>
                <select
                  value={filters.accessibilityLevel || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, accessibilityLevel: e.target.value as any || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All Levels</option>
                  {accessibilityLevels.map(level => (
                    <option key={level} value={level}>
                      {level.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Special
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.featured || false}
                      onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.checked || undefined }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.trending || false}
                      onChange={(e) => setFilters(prev => ({ ...prev, trending: e.target.checked || undefined }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Trending</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const currentTags = filters.tags || []
                      if (currentTags.includes(tag)) {
                        setFilters(prev => ({ ...prev, tags: currentTags.filter(t => t !== tag) }))
                      } else {
                        setFilters(prev => ({ ...prev, tags: [...currentTags, tag] }))
                      }
                    }}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filters.tags?.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setFilters({})}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="p-6">
        {filteredThemes.length === 0 ? (
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No themes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredThemes.map((theme) => (
              <div
                key={theme.id}
                className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedTheme(theme)}
              >
                {/* Theme Preview */}
                <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-lg shadow-md" 
                         style={{ backgroundColor: theme.colors.light.primary }}></div>
                  </div>
                  
                  {theme.communityData.featured && (
                    <div className="absolute top-2 left-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                    </div>
                  )}
                  
                  {theme.communityData.trending && (
                    <div className="absolute top-2 right-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {theme.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={theme.communityData.authorAvatar}
                      alt={theme.communityData.authorName}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {theme.communityData.authorName}
                    </span>
                    {theme.communityData.isVerified && (
                      <Check className="w-3 h-3 text-blue-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {theme.communityData.averageRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({theme.communityData.ratingCount})
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Download className="w-3 h-3" />
                      {theme.communityData.downloadCount.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {theme.communityData.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {theme.communityData.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                        +{theme.communityData.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleThemeDownload(theme)
                      }}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    >
                      <Download className="w-3 h-3 inline mr-1" />
                      Download
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleThemeShare(theme)
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleThemeLike(theme.id)
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Theme Detail Modal */}
      {selectedTheme && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedTheme.name}
                </h2>
                <button
                  onClick={() => setSelectedTheme(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  {/* Theme Preview */}
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-4">
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-lg shadow-lg mx-auto mb-4" 
                             style={{ backgroundColor: selectedTheme.colors.light.primary }}></div>
                        <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                          <div className="h-8 rounded" style={{ backgroundColor: selectedTheme.colors.light.secondary }}></div>
                          <div className="h-8 rounded" style={{ backgroundColor: selectedTheme.colors.light.accent }}></div>
                          <div className="h-8 rounded" style={{ backgroundColor: selectedTheme.colors.light.background }}></div>
                          <div className="h-8 rounded" style={{ backgroundColor: selectedTheme.colors.light.foreground }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Theme Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedTheme.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Features</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {selectedTheme.category.charAt(0).toUpperCase() + selectedTheme.category.slice(1)} Category
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {selectedTheme.accessibilityLevel.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {selectedTheme.mode.charAt(0).toUpperCase() + selectedTheme.mode.slice(1)} Mode
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {selectedTheme.transitions.enabled ? 'Smooth Transitions' : 'No Transitions'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTheme.communityData.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-6">
                    <img
                      src={selectedTheme.communityData.authorAvatar}
                      alt={selectedTheme.communityData.authorName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {selectedTheme.communityData.authorName}
                        </h3>
                        {selectedTheme.communityData.isVerified && (
                          <Check className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Theme Creator
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedTheme.communityData.downloadCount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedTheme.communityData.averageRating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        handleThemeDownload(selectedTheme)
                        setSelectedTheme(null)
                      }}
                      className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      <Download className="w-4 h-4 inline mr-2" />
                      Download Theme
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleThemeShare(selectedTheme)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Share2 className="w-4 h-4 inline mr-2" />
                        Share
                      </button>
                      
                      <button
                        onClick={() => {
                          onThemeSelect?.(selectedTheme)
                          setSelectedTheme(null)
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Eye className="w-4 h-4 inline mr-2" />
                        Preview
                      </button>
                    </div>

                    <div className="text-center">
                      <a
                        href={selectedTheme.communityData.shareableLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View in Browser
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Upload Your Theme
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop your theme file here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    or click to browse
                  </p>
                  <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Choose File
                  </button>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Supported formats: JSON, CSS, TSX
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
