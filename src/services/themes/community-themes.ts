import { 
  CommunityTheme, 
  ThemeReview, 
  ThemeSearchFilters, 
  ThemeAnalytics,
  CustomTheme,
  ThemeCategory,
  AccessibilityLevel 
} from '@/types/theme-engine'

export class CommunityThemesService {
  private static instance: CommunityThemesService
  private cache: Map<string, CommunityTheme> = new Map()
  private cacheExpiry: Map<string, Date> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private constructor() {}

  static getInstance(): CommunityThemesService {
    if (!CommunityThemesService.instance) {
      CommunityThemesService.instance = new CommunityThemesService()
    }
    return CommunityThemesService.instance
  }

  async getFeaturedThemes(limit: number = 10): Promise<CommunityTheme[]> {
    try {
      const cacheKey = `featured-${limit}`
      const cached = this.getCached(cacheKey)
      if (cached) return cached

      // In a real implementation, this would fetch from an API
      const mockThemes = await this.generateMockThemes()
      const featured = mockThemes
        .filter(theme => theme.communityData.featured)
        .slice(0, limit)

      this.setCached(cacheKey, featured)
      return featured
    } catch (error) {
      console.error('Failed to get featured themes:', error)
      throw error
    }
  }

  async getTrendingThemes(limit: number = 10): Promise<CommunityTheme[]> {
    try {
      const cacheKey = `trending-${limit}`
      const cached = this.getCached(cacheKey)
      if (cached) return cached

      const mockThemes = await this.generateMockThemes()
      const trending = mockThemes
        .filter(theme => theme.communityData.trending)
        .sort((a, b) => b.communityData.downloadCount - a.communityData.downloadCount)
        .slice(0, limit)

      this.setCached(cacheKey, trending)
      return trending
    } catch (error) {
      console.error('Failed to get trending themes:', error)
      throw error
    }
  }

  async searchThemes(query: string, filters?: ThemeSearchFilters): Promise<CommunityTheme[]> {
    try {
      const cacheKey = `search-${JSON.stringify({ query, filters })}`
      const cached = this.getCached(cacheKey)
      if (cached) return cached

      const mockThemes = await this.generateMockThemes()
      let filtered = [...mockThemes]

      // Apply search query
      if (query) {
        const searchTerm = query.toLowerCase()
        filtered = filtered.filter(theme =>
          theme.name.toLowerCase().includes(searchTerm) ||
          theme.description.toLowerCase().includes(searchTerm) ||
          theme.communityData.authorName.toLowerCase().includes(searchTerm) ||
          theme.communityData.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
      }

      // Apply filters
      if (filters) {
        if (filters.category) {
          filtered = filtered.filter(theme => theme.category === filters.category)
        }
        if (filters.accessibilityLevel) {
          filtered = filtered.filter(theme => theme.accessibilityLevel === filters.accessibilityLevel)
        }
        if (filters.rating) {
          filtered = filtered.filter(theme => theme.communityData.averageRating >= filters.rating!)
        }
        if (filters.featured) {
          filtered = filtered.filter(theme => theme.communityData.featured)
        }
        if (filters.trending) {
          filtered = filtered.filter(theme => theme.communityData.trending)
        }
        if (filters.tags && filters.tags.length > 0) {
          filtered = filtered.filter(theme =>
            filters.tags!.some(tag => theme.communityData.tags.includes(tag))
          )
        }
        if (filters.author) {
          filtered = filtered.filter(theme =>
            theme.communityData.authorName.toLowerCase().includes(filters.author!.toLowerCase())
          )
        }
      }

      this.setCached(cacheKey, filtered)
      return filtered
    } catch (error) {
      console.error('Failed to search themes:', error)
      throw error
    }
  }

  async getThemeById(id: string): Promise<CommunityTheme | null> {
    try {
      const cacheKey = `theme-${id}`
      const cached = this.getCached(cacheKey)
      if (cached) return cached[0]

      const mockThemes = await this.generateMockThemes()
      const theme = mockThemes.find(t => t.id === id) || null

      if (theme) {
        this.setCached(cacheKey, [theme])
      }

      return theme
    } catch (error) {
      console.error('Failed to get theme by ID:', error)
      throw error
    }
  }

  async getThemesByAuthor(authorId: string): Promise<CommunityTheme[]> {
    try {
      const cacheKey = `author-${authorId}`
      const cached = this.getCached(cacheKey)
      if (cached) return cached

      const mockThemes = await this.generateMockThemes()
      const authorThemes = mockThemes.filter(theme => theme.communityData.authorId === authorId)

      this.setCached(cacheKey, authorThemes)
      return authorThemes
    } catch (error) {
      console.error('Failed to get themes by author:', error)
      throw error
    }
  }

  async uploadTheme(theme: CustomTheme, isPublic: boolean): Promise<CommunityTheme> {
    try {
      // In a real implementation, this would upload to an API
      const communityTheme: CommunityTheme = {
        ...theme,
        communityData: {
          authorId: 'current-user',
          authorName: 'Current User',
          authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser',
          isVerified: false,
          downloadCount: 0,
          ratingCount: 0,
          averageRating: 0,
          reviews: [],
          featured: false,
          trending: false,
          tags: theme.metadata.tags,
        },
        sharing: {
          isPublic,
          shareableLink: isPublic ? `https://themes.currentdao.com/${theme.id}` : undefined,
          embedCode: isPublic ? `<iframe src="https://themes.currentdao.com/${theme.id}/embed" />` : undefined,
          qrCode: isPublic ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://themes.currentdao.com/${theme.id}` : undefined,
        }
      }

      // Add to cache
      this.cache.set(theme.id, communityTheme)
      const expiry = new Date(Date.now() + this.CACHE_DURATION)
      this.cacheExpiry.set(theme.id, expiry)

      return communityTheme
    } catch (error) {
      console.error('Failed to upload theme:', error)
      throw error
    }
  }

  async rateTheme(themeId: string, rating: number, review?: string): Promise<void> {
    try {
      const theme = await this.getThemeById(themeId)
      if (!theme) {
        throw new Error('Theme not found')
      }

      // Update rating
      const newRatingCount = theme.communityData.ratingCount + 1
      const newAverageRating = (
        (theme.communityData.averageRating * theme.communityData.ratingCount + rating) / 
        newRatingCount
      )

      const updatedTheme: CommunityTheme = {
        ...theme,
        communityData: {
          ...theme.communityData,
          ratingCount: newRatingCount,
          averageRating: newAverageRating,
          reviews: review ? [...theme.communityData.reviews, {
            id: `review-${Date.now()}`,
            userId: 'current-user',
            userName: 'Current User',
            rating,
            title: review.split('\n')[0] || '',
            content: review,
            createdAt: new Date(),
            helpful: 0,
            verified: false,
          }] : theme.communityData.reviews
        }
      }

      // Update cache
      this.cache.set(themeId, updatedTheme)
      const expiry = new Date(Date.now() + this.CACHE_DURATION)
      this.cacheExpiry.set(themeId, expiry)

    } catch (error) {
      console.error('Failed to rate theme:', error)
      throw error
    }
  }

  async downloadTheme(themeId: string): Promise<CommunityTheme> {
    try {
      const theme = await this.getThemeById(themeId)
      if (!theme) {
        throw new Error('Theme not found')
      }

      // Increment download count
      const updatedTheme: CommunityTheme = {
        ...theme,
        communityData: {
          ...theme.communityData,
          downloadCount: theme.communityData.downloadCount + 1,
        },
        metadata: {
          ...theme.metadata,
          downloads: theme.metadata.downloads + 1,
        }
      }

      // Update cache
      this.cache.set(themeId, updatedTheme)
      const expiry = new Date(Date.now() + this.CACHE_DURATION)
      this.cacheExpiry.set(themeId, expiry)

      return updatedTheme
    } catch (error) {
      console.error('Failed to download theme:', error)
      throw error
    }
  }

  async getThemeReviews(themeId: string): Promise<ThemeReview[]> {
    try {
      const theme = await this.getThemeById(themeId)
      if (!theme) {
        throw new Error('Theme not found')
      }

      return theme.communityData.reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.error('Failed to get theme reviews:', error)
      throw error
    }
  }

  async addReview(themeId: string, review: Omit<ThemeReview, 'id' | 'createdAt' | 'helpful'>): Promise<ThemeReview> {
    try {
      const theme = await this.getThemeById(themeId)
      if (!theme) {
        throw new Error('Theme not found')
      }

      const newReview: ThemeReview = {
        ...review,
        id: `review-${Date.now()}`,
        createdAt: new Date(),
        helpful: 0,
      }

      const updatedTheme: CommunityTheme = {
        ...theme,
        communityData: {
          ...theme.communityData,
          reviews: [...theme.communityData.reviews, newReview],
        }
      }

      // Update cache
      this.cache.set(themeId, updatedTheme)
      const expiry = new Date(Date.now() + this.CACHE_DURATION)
      this.cacheExpiry.set(themeId, expiry)

      return newReview
    } catch (error) {
      console.error('Failed to add review:', error)
      throw error
    }
  }

  async getAnalytics(): Promise<ThemeAnalytics> {
    try {
      const cacheKey = 'analytics'
      const cached = this.getCached(cacheKey)
      if (cached) {
        return cached[0] as any // Type assertion for simplicity
      }

      const mockThemes = await this.generateMockThemes()
      
      const totalThemes = mockThemes.length
      const communityThemes = mockThemes.filter(t => t.sharing.isPublic).length
      const customThemes = totalThemes - communityThemes
      const downloads = mockThemes.reduce((sum, t) => sum + t.communityData.downloadCount, 0)
      const ratings = mockThemes.reduce((sum, t) => sum + t.communityData.ratingCount, 0)
      const averageRating = mockThemes.reduce((sum, t) => sum + t.communityData.averageRating, 0) / totalThemes

      const categoryCounts = mockThemes.reduce((acc, theme) => {
        acc[theme.category] = (acc[theme.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const trendingThemes = mockThemes
        .filter(t => t.communityData.trending)
        .sort((a, b) => b.communityData.downloadCount - a.communityData.downloadCount)
        .slice(0, 5)

      const analytics: ThemeAnalytics = {
        totalThemes,
        communityThemes,
        customThemes,
        downloads,
        ratings,
        averageRating,
        topCategories,
        trendingThemes,
      }

      this.setCached(cacheKey, [analytics] as any)
      return analytics
    } catch (error) {
      console.error('Failed to get analytics:', error)
      throw error
    }
  }

  async reportTheme(themeId: string, reason: string, description: string): Promise<void> {
    try {
      // In a real implementation, this would send a report to moderators
      console.log('Theme reported:', { themeId, reason, description })
    } catch (error) {
      console.error('Failed to report theme:', error)
      throw error
    }
  }

  private async generateMockThemes(): Promise<CommunityTheme[]> {
    // Return mock community themes
    return [
      {
        id: 'theme-ocean-breeze',
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
        id: 'theme-dark-pro',
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
    ]
  }

  private getCached(key: string): any[] | null {
    const expiry = this.cacheExpiry.get(key)
    if (expiry && expiry < new Date()) {
      this.cache.delete(key)
      this.cacheExpiry.delete(key)
      return null
    }

    const cached = this.cache.get(key)
    return cached ? [cached] : null
  }

  private setCached(key: string, data: any): void {
    this.cache.set(key, data)
    const expiry = new Date(Date.now() + this.CACHE_DURATION)
    this.cacheExpiry.set(key, expiry)
  }

  clearCache(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
  }
}

// Export singleton instance
export const communityThemesService = CommunityThemesService.getInstance()
