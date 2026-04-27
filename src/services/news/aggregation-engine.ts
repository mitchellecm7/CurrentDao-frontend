// Energy Market News Aggregation Engine

// Types
export interface NewsSource {
  id: string
  name: string
  type: 'rss' | 'api' | 'webhook' | 'social'
  url: string
  category: 'general' | 'renewable' | 'oil_gas' | 'nuclear' | 'policy' | 'markets' | 'technology'
  priority: 'high' | 'medium' | 'low'
  isActive: boolean
  apiKey?: string
  refreshInterval: number // in minutes
  lastFetched?: Date
  fetchCount: number
  errorCount: number
  reliability: number // 0-1 score
}

export interface NewsArticle {
  id: string
  title: string
  content: string
  summary: string
  author: string
  source: NewsSource
  publishedAt: Date
  updatedAt?: Date
  url: string
  imageUrl?: string
  tags: string[]
  category: string
  language: string
  wordCount: number
  readTime: number // in minutes
  isBreaking: boolean
  isVerified: boolean
  engagement: {
    views: number
    shares: number
    comments: number
    likes: number
  }
  metadata: {
    region?: string
    companies?: string[]
    commodities?: string[]
    keywords?: string[]
    relevanceScore: number // 0-1
  }
}

export interface AggregationConfig {
  maxArticlesPerSource: number
  updateInterval: number // in minutes
  enableRealTime: boolean
  enableSocialMedia: boolean
  enableExpertSources: boolean
  contentFilters: {
    minWordCount: number
    maxWordCount: number
    blockedKeywords: string[]
    requiredKeywords: string[]
    languages: string[]
  }
  deduplication: {
    enabled: boolean
    similarityThreshold: number // 0-1
    timeWindow: number // in hours
  }
}

export interface SocialMediaPost {
  id: string
  platform: 'twitter' | 'linkedin' | 'reddit' | 'telegram'
  author: {
    name: string
    handle: string
    followers: number
    verified: boolean
    influence: number // 0-1
  }
  content: string
  publishedAt: Date
  url: string
  hashtags: string[]
  mentions: string[]
  engagement: {
    likes: number
    shares: number
    comments: number
    impressions: number
  }
  sentiment?: {
    score: number // -1 to 1
    confidence: number // 0-1
  }
  isRetweet?: boolean
  isQuote?: boolean
}

export class NewsAggregationEngine {
  private sources: Map<string, NewsSource> = new Map()
  private articles: Map<string, NewsArticle> = new Map()
  private socialPosts: Map<string, SocialMediaPost> = new Map()
  private config: AggregationConfig
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()

  constructor(config?: Partial<AggregationConfig>) {
    this.config = {
      maxArticlesPerSource: 50,
      updateInterval: 5,
      enableRealTime: true,
      enableSocialMedia: true,
      enableExpertSources: true,
      contentFilters: {
        minWordCount: 100,
        maxWordCount: 5000,
        blockedKeywords: ['spam', 'advertisement'],
        requiredKeywords: ['energy', 'oil', 'gas', 'renewable', 'solar', 'wind'],
        languages: ['en', 'es', 'fr', 'de', 'zh', 'ja']
      },
      deduplication: {
        enabled: true,
        similarityThreshold: 0.8,
        timeWindow: 24
      },
      ...config
    }

    this.initializeDefaultSources()
  }

  // Initialize default energy news sources
  private initializeDefaultSources(): void {
    const defaultSources: NewsSource[] = [
      // Major Energy News Outlets
      {
        id: 'reuters-energy',
        name: 'Reuters Energy',
        type: 'rss',
        url: 'https://www.reuters.com/rssFeed/worldNews',
        category: 'general',
        priority: 'high',
        isActive: true,
        refreshInterval: 5,
        fetchCount: 0,
        errorCount: 0,
        reliability: 0.95
      },
      {
        id: 'bloomberg-energy',
        name: 'Bloomberg Energy',
        type: 'api',
        url: 'https://api.bloomberg.com/energy/news',
        category: 'markets',
        priority: 'high',
        isActive: true,
        apiKey: process.env.BLOOMBERG_API_KEY,
        refreshInterval: 3,
        fetchCount: 0,
        errorCount: 0,
        reliability: 0.98
      },
      {
        id: 'platts',
        name: 'S&P Global Platts',
        type: 'rss',
        url: 'https://www.platts.com/rss/news',
        category: 'oil_gas',
        priority: 'high',
        isActive: true,
        refreshInterval: 5,
        fetchCount: 0,
        errorCount: 0,
        reliability: 0.92
      },
      {
        id: 'iea-news',
        name: 'International Energy Agency',
        type: 'rss',
        url: 'https://www.iea.org/news/rss.xml',
        category: 'policy',
        priority: 'high',
        isActive: true,
        refreshInterval: 15,
        fetchCount: 0,
        errorCount: 0,
        reliability: 0.99
      },
      {
        id: 'renewable-energy-world',
        name: 'Renewable Energy World',
        type: 'rss',
        url: 'https://www.renewableenergyworld.com/rss.xml',
        category: 'renewable',
        priority: 'medium',
        isActive: true,
        refreshInterval: 10,
        fetchCount: 0,
        errorCount: 0,
        reliability: 0.85
      },
      {
        id: 'world-nuclear-news',
        name: 'World Nuclear News',
        type: 'rss',
        url: 'https://www.world-nuclear-news.org/rss.xml',
        category: 'nuclear',
        priority: 'medium',
        isActive: true,
        refreshInterval: 15,
        fetchCount: 0,
        errorCount: 0,
        reliability: 0.88
      },
      {
        id: 'energy-storage-news',
        name: 'Energy Storage News',
        type: 'rss',
        url: 'https://www.energy-storage.news/rss.xml',
        category: 'technology',
        priority: 'medium',
        isActive: true,
        refreshInterval: 10,
        fetchCount: 0,
        errorCount: 0,
        reliability: 0.82
      },
      // Regional Sources
      {
        id: 'oil-price',
        name: 'Oil Price.com',
        type: 'rss',
        url: 'https://oilprice.com/rss.xml',
        category: 'oil_gas',
        priority: 'high',
        isActive: true,
        refreshInterval: 5,
        fetchCount: 0,
        errorCount: 0,
        reliability: 0.90
      },
      {
        id: 'euractiv-energy',
        name: 'Euractiv Energy',
        type: 'rss',
        url: 'https://www.euractiv.com/section/energy/feed/',
        category: 'policy',
        priority: 'medium',
        isActive: true,
        refreshInterval: 15,
        fetchCount: 0,
        errorCount: 0,
        reliability: 0.87
      },
      // Social Media Sources
      {
        id: 'twitter-energy',
        name: 'Twitter Energy Trends',
        type: 'social',
        url: 'https://api.twitter.com/2/tweets/search/recent',
        category: 'general',
        priority: 'medium',
        isActive: this.config.enableSocialMedia,
        apiKey: process.env.TWITTER_API_KEY,
        refreshInterval: 2,
        fetchCount: 0,
        errorCount: 0,
        reliability: 0.75
      },
      {
        id: 'linkedin-energy',
        name: 'LinkedIn Energy Professionals',
        type: 'social',
        url: 'https://api.linkedin.com/v2/shares',
        category: 'general',
        priority: 'low',
        isActive: this.config.enableSocialMedia,
        apiKey: process.env.LINKEDIN_API_KEY,
        refreshInterval: 10,
        fetchCount: 0,
        errorCount: 0,
        reliability: 0.70
      }
    ]

    defaultSources.forEach(source => {
      this.sources.set(source.id, source)
    })
  }

  // Add custom news source
  addSource(source: NewsSource): void {
    this.sources.set(source.id, source)
    
    if (source.isActive) {
      this.startSourceUpdates(source.id)
    }
    
    this.emit('sourceAdded', source)
  }

  // Remove news source
  removeSource(sourceId: string): void {
    this.stopSourceUpdates(sourceId)
    this.sources.delete(sourceId)
    this.emit('sourceRemoved', sourceId)
  }

  // Start aggregation for all active sources
  startAggregation(): void {
    this.sources.forEach(source => {
      if (source.isActive) {
        this.startSourceUpdates(source.id)
      }
    })
  }

  // Stop aggregation
  stopAggregation(): void {
    this.updateIntervals.forEach(interval => {
      clearInterval(interval)
    })
    this.updateIntervals.clear()
  }

  // Start updates for specific source
  private startSourceUpdates(sourceId: string): void {
    const source = this.sources.get(sourceId)
    if (!source || !source.isActive) return

    // Clear existing interval
    this.stopSourceUpdates(sourceId)

    // Fetch immediately
    this.fetchFromSource(sourceId)

    // Set up recurring updates
    const interval = setInterval(() => {
      this.fetchFromSource(sourceId)
    }, source.refreshInterval * 60 * 1000)

    this.updateIntervals.set(sourceId, interval)
  }

  // Stop updates for specific source
  private stopSourceUpdates(sourceId: string): void {
    const interval = this.updateIntervals.get(sourceId)
    if (interval) {
      clearInterval(interval)
      this.updateIntervals.delete(sourceId)
    }
  }

  // Fetch news from specific source
  private async fetchFromSource(sourceId: string): Promise<void> {
    const source = this.sources.get(sourceId)
    if (!source) return

    try {
      let articles: NewsArticle[] = []

      switch (source.type) {
        case 'rss':
          articles = await this.fetchRSSFeed(source)
          break
        case 'api':
          articles = await this.fetchAPIFeed(source)
          break
        case 'social':
          await this.fetchSocialMedia(source)
          break
        case 'webhook':
          // Webhook sources are handled differently
          break
      }

      // Process and filter articles
      const processedArticles = await this.processArticles(articles, source)
      
      // Add to collection
      processedArticles.forEach(article => {
        this.articles.set(article.id, article)
      })

      // Update source stats
      source.fetchCount++
      source.lastFetched = new Date()

      // Emit events
      this.emit('articlesFetched', { sourceId, articles: processedArticles })

    } catch (error) {
      source.errorCount++
      console.error(`Failed to fetch from source ${sourceId}:`, error)
      this.emit('sourceError', { sourceId, error })
    }
  }

  // Fetch RSS feed
  private async fetchRSSFeed(source: NewsSource): Promise<NewsArticle[]> {
    // Mock RSS fetching - in production would use a proper RSS parser
    const mockArticles: NewsArticle[] = [
      {
        id: `rss-${Date.now()}-1`,
        title: 'Global Oil Prices Surge Amid Supply Concerns',
        content: 'Oil prices jumped significantly today as investors reacted to supply disruptions...',
        summary: 'Oil prices surge due to supply chain disruptions and geopolitical tensions.',
        author: 'Energy Correspondent',
        source,
        publishedAt: new Date(),
        url: 'https://example.com/article1',
        tags: ['oil', 'prices', 'supply'],
        category: source.category,
        language: 'en',
        wordCount: 450,
        readTime: 2,
        isBreaking: false,
        isVerified: true,
        engagement: { views: 1500, shares: 45, comments: 12, likes: 89 },
        metadata: {
          region: 'Global',
          companies: ['OPEC', 'Exxon'],
          commodities: ['Crude Oil', 'Brent'],
          keywords: ['oil', 'energy', 'market'],
          relevanceScore: 0.9
        }
      },
      {
        id: `rss-${Date.now()}-2`,
        title: 'Renewable Energy Investment Hits Record High',
        content: 'Investment in renewable energy projects reached an all-time high this quarter...',
        summary: 'Record investment levels in renewable energy projects signal market confidence.',
        author: 'Renewable Analyst',
        source,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        url: 'https://example.com/article2',
        tags: ['renewable', 'investment', 'solar'],
        category: source.category,
        language: 'en',
        wordCount: 380,
        readTime: 2,
        isBreaking: false,
        isVerified: true,
        engagement: { views: 2100, shares: 67, comments: 23, likes: 156 },
        metadata: {
          region: 'Global',
          companies: ['Tesla', 'NextEra'],
          commodities: ['Solar', 'Wind'],
          keywords: ['renewable', 'investment', 'clean energy'],
          relevanceScore: 0.85
        }
      }
    ]

    return mockArticles
  }

  // Fetch API feed
  private async fetchAPIFeed(source: NewsSource): Promise<NewsArticle[]> {
    // Mock API fetching - in production would make actual API calls
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return [
      {
        id: `api-${Date.now()}-1`,
        title: 'Natural Gas Futures Rise on Cold Weather Forecast',
        content: 'Natural gas futures climbed higher as weather forecasts predict colder temperatures...',
        summary: 'Natural gas prices increase due to expected higher demand from cold weather.',
        author: 'Market Analyst',
        source,
        publishedAt: new Date(),
        url: 'https://example.com/api-article1',
        tags: ['natural-gas', 'futures', 'weather'],
        category: source.category,
        language: 'en',
        wordCount: 320,
        readTime: 1,
        isBreaking: true,
        isVerified: true,
        engagement: { views: 800, shares: 25, comments: 8, likes: 45 },
        metadata: {
          region: 'North America',
          companies: ['Chesapeake Energy'],
          commodities: ['Natural Gas'],
          keywords: ['gas', 'futures', 'weather'],
          relevanceScore: 0.88
        }
      }
    ]
  }

  // Fetch social media posts
  private async fetchSocialMedia(source: NewsSource): Promise<void> {
    // Mock social media fetching
    const mockPosts: SocialMediaPost[] = [
      {
        id: `social-${Date.now()}-1`,
        platform: 'twitter',
        author: {
          name: 'Energy Expert',
          handle: '@energyexpert',
          followers: 50000,
          verified: true,
          influence: 0.8
        },
        content: 'Breaking: Major oil discovery announced in offshore drilling operation. Expect market impact.',
        publishedAt: new Date(),
        url: 'https://twitter.com/energyexpert/status/123456',
        hashtags: ['oil', 'energy', 'drilling'],
        mentions: ['@oilcompany'],
        engagement: {
          likes: 250,
          shares: 180,
          comments: 45,
          impressions: 15000
        },
        sentiment: {
          score: 0.3,
          confidence: 0.85
        }
      }
    ]

    mockPosts.forEach(post => {
      this.socialPosts.set(post.id, post)
    })

    this.emit('socialPostsFetched', { sourceId: source.id, posts: mockPosts })
  }

  // Process and filter articles
  private async processArticles(articles: NewsArticle[], source: NewsSource): Promise<NewsArticle[]> {
    let processed = articles

    // Apply content filters
    processed = processed.filter(article => {
      // Word count filter
      if (article.wordCount < this.config.contentFilters.minWordCount ||
          article.wordCount > this.config.contentFilters.maxWordCount) {
        return false
      }

      // Language filter
      if (!this.config.contentFilters.languages.includes(article.language)) {
        return false
      }

      // Keyword filters
      const hasRequiredKeywords = this.config.contentFilters.requiredKeywords.some(keyword =>
        article.title.toLowerCase().includes(keyword.toLowerCase()) ||
        article.content.toLowerCase().includes(keyword.toLowerCase())
      )

      const hasBlockedKeywords = this.config.contentFilters.blockedKeywords.some(keyword =>
        article.title.toLowerCase().includes(keyword.toLowerCase()) ||
        article.content.toLowerCase().includes(keyword.toLowerCase())
      )

      return hasRequiredKeywords && !hasBlockedKeywords
    })

    // Apply deduplication
    if (this.config.deduplication.enabled) {
      processed = await this.deduplicateArticles(processed)
    }

    // Limit articles per source
    processed = processed.slice(0, this.config.maxArticlesPerSource)

    return processed
  }

  // Deduplicate articles based on similarity
  private async deduplicateArticles(articles: NewsArticle[]): Promise<NewsArticle[]> {
    const deduplicated: NewsArticle[] = []
    const timeWindow = this.config.deduplication.timeWindow * 60 * 60 * 1000

    for (const article of articles) {
      const isDuplicate = deduplicated.some(existing => {
        // Check time window
        const timeDiff = Math.abs(article.publishedAt.getTime() - existing.publishedAt.getTime())
        if (timeDiff > timeWindow) return false

        // Calculate similarity (simplified)
        const titleSimilarity = this.calculateTextSimilarity(article.title, existing.title)
        const contentSimilarity = this.calculateTextSimilarity(article.summary, existing.summary)
        
        return Math.max(titleSimilarity, contentSimilarity) > this.config.deduplication.similarityThreshold
      })

      if (!isDuplicate) {
        deduplicated.push(article)
      }
    }

    return deduplicated
  }

  // Calculate text similarity (simplified cosine similarity)
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/)
    const words2 = text2.toLowerCase().split(/\s+/)
    
    const allWords = new Set([...words1, ...words2])
    const vector1 = Array.from(allWords).map(word => words1.includes(word) ? 1 : 0)
    const vector2 = Array.from(allWords).map(word => words2.includes(word) ? 1 : 0)
    
    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0)
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0))
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0))
    
    return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0
  }

  // Get articles with filtering
  getArticles(filters?: {
    category?: string
    source?: string
    dateFrom?: Date
    dateTo?: Date
    tags?: string[]
    isBreaking?: boolean
    minRelevance?: number
  }): NewsArticle[] {
    let articles = Array.from(this.articles.values())

    if (filters) {
      if (filters.category) {
        articles = articles.filter(article => article.category === filters.category)
      }
      if (filters.source) {
        articles = articles.filter(article => article.source.id === filters.source)
      }
      if (filters.dateFrom) {
        articles = articles.filter(article => article.publishedAt >= filters.dateFrom!)
      }
      if (filters.dateTo) {
        articles = articles.filter(article => article.publishedAt <= filters.dateTo!)
      }
      if (filters.tags && filters.tags.length > 0) {
        articles = articles.filter(article => 
          filters.tags!.some(tag => article.tags.includes(tag))
        )
      }
      if (filters.isBreaking !== undefined) {
        articles = articles.filter(article => article.isBreaking === filters.isBreaking)
      }
      if (filters.minRelevance !== undefined) {
        articles = articles.filter(article => article.metadata.relevanceScore >= filters.minRelevance!)
      }
    }

    // Sort by published date (newest first)
    return articles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  }

  // Get social media posts
  getSocialPosts(filters?: {
    platform?: string
    dateFrom?: Date
    dateTo?: Date
    minInfluence?: number
    hashtags?: string[]
  }): SocialMediaPost[] {
    let posts = Array.from(this.socialPosts.values())

    if (filters) {
      if (filters.platform) {
        posts = posts.filter(post => post.platform === filters.platform)
      }
      if (filters.dateFrom) {
        posts = posts.filter(post => post.publishedAt >= filters.dateFrom!)
      }
      if (filters.dateTo) {
        posts = posts.filter(post => post.publishedAt <= filters.dateTo!)
      }
      if (filters.minInfluence !== undefined) {
        posts = posts.filter(post => post.author.influence >= filters.minInfluence!)
      }
      if (filters.hashtags && filters.hashtags.length > 0) {
        posts = posts.filter(post => 
          filters.hashtags!.some(tag => post.hashtags.includes(tag))
        )
      }
    }

    return posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  }

  // Get statistics
  getStatistics(): {
    totalSources: number
    activeSources: number
    totalArticles: number
    totalSocialPosts: number
    articlesByCategory: Record<string, number>
    topSources: Array<{ source: NewsSource; articleCount: number }>
    avgReliability: number
  } {
    const activeSources = Array.from(this.sources.values()).filter(s => s.isActive)
    const articlesByCategory: Record<string, number> = {}
    
    this.articles.forEach(article => {
      articlesByCategory[article.category] = (articlesByCategory[article.category] || 0) + 1
    })

    const sourceCounts = new Map<string, number>()
    this.articles.forEach(article => {
      sourceCounts.set(article.source.id, (sourceCounts.get(article.source.id) || 0) + 1)
    })

    const topSources = Array.from(sourceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([sourceId, count]) => ({
        source: this.sources.get(sourceId)!,
        articleCount: count
      }))

    const avgReliability = activeSources.reduce((sum, source) => sum + source.reliability, 0) / activeSources.length

    return {
      totalSources: this.sources.size,
      activeSources: activeSources.length,
      totalArticles: this.articles.size,
      totalSocialPosts: this.socialPosts.size,
      articlesByCategory,
      topSources,
      avgReliability
    }
  }

  // Event handling
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // Search functionality
  searchArticles(query: string, options?: {
    fields?: ('title' | 'content' | 'summary' | 'tags')[]
    fuzzy?: boolean
    limit?: number
  }): NewsArticle[] {
    const fields = options?.fields || ['title', 'content', 'summary']
    const limit = options?.limit || 50
    const fuzzy = options?.fuzzy !== false

    const queryWords = query.toLowerCase().split(/\s+/)
    
    const scored = Array.from(this.articles.values()).map(article => {
      let score = 0
      let matches = 0

      fields.forEach(field => {
        const text = article[field as keyof NewsArticle]?.toString().toLowerCase() || ''
        
        if (fuzzy) {
          queryWords.forEach(word => {
            if (text.includes(word)) {
              score += 1
              matches++
            }
          })
        } else {
          if (text.includes(query.toLowerCase())) {
            score += 2
            matches++
          }
        }
      })

      // Boost for recent articles
      const hoursOld = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60)
      score += Math.max(0, 10 - hoursOld / 24)

      // Boost for breaking news
      if (article.isBreaking) score += 5

      // Boost for high relevance
      score += article.metadata.relevanceScore * 3

      return { article, score, matches }
    })

    return scored
      .filter(item => item.matches > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.article)
  }
}

export default NewsAggregationEngine
