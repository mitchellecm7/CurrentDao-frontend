interface AnalyticsData {
  portfolio: {
    value: number
    change24h: number
    change7d: number
    change30d: number
  }
  assets: Array<{
    id: string
    name: string
    value: number
    change: number
    allocation: number
  }>
  performance: {
    daily: Array<{ date: string; value: number }>
    weekly: Array<{ week: string; value: number }>
    monthly: Array<{ month: string; value: number }>
  }
  transactions: Array<{
    id: string
    type: string
    amount: number
    timestamp: string
    status: string
  }>
}

interface FetchOptions {
  useCache?: boolean
  signal?: AbortSignal
}

interface FetchParams {
  userId?: string
  portfolioId?: string
}

class MobileAnalyticsService {
  private readonly CACHE_KEY = 'mobile-analytics-cache'
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private isCacheValid(cacheData: any): boolean {
    if (!cacheData || !cacheData.timestamp) return false
    return Date.now() - cacheData.timestamp < this.CACHE_DURATION
  }

  private generateMockData(): AnalyticsData {
    const now = new Date()
    
    return {
      portfolio: {
        value: Math.floor(Math.random() * 100000) + 50000,
        change24h: Math.random() * 10 - 5,
        change7d: Math.random() * 20 - 10,
        change30d: Math.random() * 30 - 15
      },
      assets: [
        {
          id: '1',
          name: 'Energy Credits',
          value: Math.floor(Math.random() * 30000) + 10000,
          change: Math.random() * 10 - 5,
          allocation: 35
        },
        {
          id: '2',
          name: 'Stellar Lumens',
          value: Math.floor(Math.random() * 20000) + 5000,
          change: Math.random() * 15 - 7.5,
          allocation: 25
        },
        {
          id: '3',
          name: 'Carbon Credits',
          value: Math.floor(Math.random() * 15000) + 5000,
          change: Math.random() * 8 - 4,
          allocation: 20
        },
        {
          id: '4',
          name: 'Treasury Bonds',
          value: Math.floor(Math.random() * 10000) + 2000,
          change: Math.random() * 5 - 2.5,
          allocation: 15
        },
        {
          id: '5',
          name: 'Other Assets',
          value: Math.floor(Math.random() * 5000) + 1000,
          change: Math.random() * 3 - 1.5,
          allocation: 5
        }
      ],
      performance: {
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 10000) + 50000
        })),
        weekly: Array.from({ length: 12 }, (_, i) => ({
          week: `Week ${i + 1}`,
          value: Math.floor(Math.random() * 15000) + 45000
        })),
        monthly: Array.from({ length: 12 }, (_, i) => ({
          month: new Date(now.getFullYear(), now.getMonth() - (11 - i), 1).toLocaleDateString('en', { month: 'short' }),
          value: Math.floor(Math.random() * 20000) + 40000
        }))
      },
      transactions: Array.from({ length: 10 }, (_, i) => ({
        id: `tx_${i + 1}`,
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        amount: Math.floor(Math.random() * 5000) + 500,
        timestamp: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      }))
    }
  }

  async fetchData(params: FetchParams = {}, options: FetchOptions = {}): Promise<AnalyticsData> {
    const { useCache = true, signal } = options

    // Check cache first
    if (useCache && !signal?.aborted) {
      try {
        const cachedData = localStorage.getItem(this.CACHE_KEY)
        if (cachedData) {
          const parsedCache = JSON.parse(cachedData)
          if (this.isCacheValid(parsedCache) && parsedCache.data) {
            return parsedCache.data
          }
        }
      } catch (error) {
        console.warn('Failed to read from cache:', error)
      }
    }

    // Simulate network delay
    if (!signal?.aborted) {
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    }

    // Check if aborted
    if (signal?.aborted) {
      throw new Error('Request aborted')
    }

    // Generate mock data
    const data = this.generateMockData()

    // Cache the data
    if (useCache && !signal?.aborted) {
      try {
        const cacheData = {
          data,
          timestamp: Date.now(),
          params
        }
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData))
      } catch (error) {
        console.warn('Failed to cache data:', error)
      }
    }

    return data
  }

  async exportAnalytics(data: AnalyticsData): Promise<any> {
    const exportData = {
      exportedAt: new Date().toISOString(),
      portfolio: data.portfolio,
      assets: data.assets,
      performance: data.performance,
      transactions: data.transactions,
      summary: {
        totalAssets: data.assets.length,
        totalValue: data.portfolio.value,
        bestPerformer: data.assets.reduce((best, asset) => 
          asset.change > best.change ? asset : best
        ),
        worstPerformer: data.assets.reduce((worst, asset) => 
          asset.change < worst.change ? asset : worst
        )
      }
    }

    return exportData
  }

  clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY)
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }

  getCacheSize(): number {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY)
      return cachedData ? new Blob([cachedData]).size : 0
    } catch (error) {
      return 0
    }
  }

  async refreshData(params: FetchParams = {}): Promise<AnalyticsData> {
    return this.fetchData(params, { useCache: false })
  }
}

export const mobileAnalyticsService = new MobileAnalyticsService()
export const getMobileAnalytics = {
  fetchData: (params: FetchParams, options?: FetchOptions) => 
    mobileAnalyticsService.fetchData(params, options),
  exportAnalytics: (data: AnalyticsData) => 
    mobileAnalyticsService.exportAnalytics(data),
  clearCache: () => 
    mobileAnalyticsService.clearCache(),
  getCacheSize: () => 
    mobileAnalyticsService.getCacheSize(),
  refreshData: (params: FetchParams) => 
    mobileAnalyticsService.refreshData(params)
}
