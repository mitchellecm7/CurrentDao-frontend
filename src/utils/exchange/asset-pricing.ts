import { EnergyAssetType } from '../services/exchange/conversion-engine'

export interface TokenizedAsset {
  id: string
  name: string
  description: string
  assetType: EnergyAssetType
  totalSupply: number
  availableSupply: number
  pricePerToken: number
  marketCap: number
  dividends: {
    token: EnergyAssetType
    apr: number
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  }
  metadata: {
    location: string
    capacity: number
    efficiency: number
    certification: string
    carbonOffset: number
  }
  isActive: boolean
  createdAt: number
}

export interface UserHolding {
  assetId: string
  shares: number
  percentageOwned: number
  value: number
  dividendsEarned: number
  lastDividendClaim: number
  votingPower: number
  acquisitionCost: number
  unrealizedPnL: number
}

export interface PricingMetrics {
  assetId: string
  currentPrice: number
  priceChange24h: number
  priceChange7d: number
  volume24h: number
  marketCap: number
  circulatingSupply: number
  totalSupply: number
  priceHistory: Array<{
    timestamp: number
    price: number
    volume: number
  }>
}

export class AssetPricing {
  private tokenizedAssets: Map<string, TokenizedAsset> = new Map()
  private userHoldings: Map<string, UserHolding> = new Map()
  private pricingHistory: Map<string, PricingMetrics> = new Map()
  private updateInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeTokenizedAssets()
    this.initializeUserHoldings()
    this.initializePricingHistory()
    this.startRealTimeUpdates()
  }

  private initializeTokenizedAssets(): void {
    const assets = [
      {
        id: 'solar-farm-alpha',
        name: 'Solar Farm Alpha',
        description: '50MW solar farm in Arizona with advanced photovoltaic technology',
        assetType: 'SOLAR' as EnergyAssetType,
        totalSupply: 10000000,
        availableSupply: 2500000,
        pricePerToken: 0.85,
        dividends: {
          token: 'WATT' as EnergyAssetType,
          apr: 8.5,
          frequency: 'monthly' as const
        },
        metadata: {
          location: 'Arizona, USA',
          capacity: 50,
          efficiency: 92.5,
          certification: 'ISO-14001, Green-E',
          carbonOffset: 45000
        },
        isActive: true
      },
      {
        id: 'wind-turbine-beta',
        name: 'Wind Turbine Beta',
        description: 'Offshore wind farm with 30 turbines generating clean energy',
        assetType: 'WIND' as EnergyAssetType,
        totalSupply: 15000000,
        availableSupply: 3200000,
        pricePerToken: 0.72,
        dividends: {
          token: 'WATT' as EnergyAssetType,
          apr: 9.2,
          frequency: 'monthly' as const
        },
        metadata: {
          location: 'North Sea, Europe',
          capacity: 120,
          efficiency: 88.3,
          certification: 'ISO-14001',
          carbonOffset: 78000
        },
        isActive: true
      },
      {
        id: 'hydro-delta',
        name: 'Hydro Delta Project',
        description: 'Hydroelectric power plant with 200MW capacity',
        assetType: 'HYDRO' as EnergyAssetType,
        totalSupply: 20000000,
        availableSupply: 5000000,
        pricePerToken: 0.68,
        dividends: {
          token: 'WATT' as EnergyAssetType,
          apr: 7.8,
          frequency: 'weekly' as const
        },
        metadata: {
          location: 'Columbia River, USA',
          capacity: 200,
          efficiency: 94.2,
          certification: 'ISO-14001',
          carbonOffset: 120000
        },
        isActive: true
      },
      {
        id: 'geothermal-gamma',
        name: 'Geothermal Gamma',
        description: 'Geothermal energy plant with consistent baseload power',
        assetType: 'GEOTHERMAL' as EnergyAssetType,
        totalSupply: 8000000,
        availableSupply: 1800000,
        pricePerToken: 0.95,
        dividends: {
          token: 'WATT' as EnergyAssetType,
          apr: 10.5,
          frequency: 'monthly' as const
        },
        metadata: {
          location: 'Iceland',
          capacity: 75,
          efficiency: 96.8,
          certification: 'ISO-14001',
          carbonOffset: 35000
        },
        isActive: true
      },
      {
        id: 'carbon-offset-fund',
        name: 'Carbon Offset Fund',
        description: 'Tokenized carbon credits from reforestation projects',
        assetType: 'CARBON_CREDITS' as EnergyAssetType,
        totalSupply: 5000000,
        availableSupply: 1200000,
        pricePerToken: 1.25,
        dividends: {
          token: 'CARBON_CREDITS' as EnergyAssetType,
          apr: 12.3,
          frequency: 'quarterly' as const
        },
        metadata: {
          location: 'Global',
          capacity: 0,
          efficiency: 0,
          certification: 'Verified Carbon Standard',
          carbonOffset: 250000
        },
        isActive: true
      }
    ]

    assets.forEach(asset => {
      this.tokenizedAssets.set(asset.id, {
        ...asset,
        marketCap: asset.pricePerToken * asset.totalSupply,
        createdAt: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      })
    })
  }

  private initializeUserHoldings(): void {
    const holdings = [
      {
        assetId: 'solar-farm-alpha',
        shares: 125000,
        value: 106250,
        dividendsEarned: 8925,
        lastDividendClaim: Date.now() - 15 * 24 * 60 * 60 * 1000,
        acquisitionCost: 95000
      },
      {
        assetId: 'wind-turbine-beta',
        shares: 85000,
        value: 61200,
        dividendsEarned: 5628,
        lastDividendClaim: Date.now() - 20 * 24 * 60 * 60 * 1000,
        acquisitionCost: 58000
      },
      {
        assetId: 'geothermal-gamma',
        shares: 45000,
        value: 42750,
        dividendsEarned: 4489,
        lastDividendClaim: Date.now() - 25 * 24 * 60 * 60 * 1000,
        acquisitionCost: 40000
      },
      {
        assetId: 'carbon-offset-fund',
        shares: 25000,
        value: 31250,
        dividendsEarned: 3844,
        lastDividendClaim: Date.now() - 10 * 24 * 60 * 60 * 1000,
        acquisitionCost: 28000
      }
    ]

    holdings.forEach(holding => {
      const asset = this.tokenizedAssets.get(holding.assetId)
      if (asset) {
        const percentageOwned = (holding.shares / asset.totalSupply) * 100
        const votingPower = Math.floor(holding.shares / 1000) // 1 voting power per 1000 shares
        const unrealizedPnL = holding.value - holding.acquisitionCost

        this.userHoldings.set(holding.assetId, {
          ...holding,
          percentageOwned,
          votingPower,
          unrealizedPnL
        })
      }
    })
  }

  private initializePricingHistory(): void {
    this.tokenizedAssets.forEach((asset, assetId) => {
      const history: Array<{ timestamp: number; price: number; volume: number }> = []
      const now = Date.now()
      
      // Generate 30 days of price history
      for (let i = 30; i >= 0; i--) {
        const timestamp = now - i * 24 * 60 * 60 * 1000
        const priceVariation = (Math.random() - 0.5) * 0.1 // ±5% variation
        const price = asset.pricePerToken * (1 + priceVariation)
        const volume = Math.random() * 100000 + 50000
        
        history.push({ timestamp, price, volume })
      }

      this.pricingHistory.set(assetId, {
        assetId,
        currentPrice: asset.pricePerToken,
        priceChange24h: (Math.random() - 0.5) * 10, // ±5%
        priceChange7d: (Math.random() - 0.5) * 20, // ±10%
        volume24h: Math.random() * 500000 + 100000,
        marketCap: asset.marketCap,
        circulatingSupply: asset.totalSupply - asset.availableSupply,
        totalSupply: asset.totalSupply,
        priceHistory: history
      })
    })
  }

  private startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.updatePrices()
      this.updateDividends()
      this.updatePricingHistory()
    }, 15000) // Update every 15 seconds
  }

  private updatePrices(): void {
    this.tokenizedAssets.forEach((asset, assetId) => {
      // Simulate price movements based on market factors
      const volatility = this.getAssetVolatility(asset.assetType)
      const marketSentiment = (Math.random() - 0.5) * 2 // -1 to 1
      const priceChange = marketSentiment * volatility
      
      const newPrice = Math.max(0.01, asset.pricePerToken * (1 + priceChange))
      const priceChangePercentage = ((newPrice - asset.pricePerToken) / asset.pricePerToken) * 100
      
      // Update asset
      asset.pricePerToken = newPrice
      asset.marketCap = newPrice * asset.totalSupply
      
      // Update pricing metrics
      const metrics = this.pricingHistory.get(assetId)
      if (metrics) {
        metrics.currentPrice = newPrice
        metrics.priceChange24h = priceChangePercentage
        metrics.marketCap = asset.marketCap
        metrics.volume24h = metrics.volume24h * (1 + (Math.random() - 0.5) * 0.2)
      }
      
      // Update user holdings
      const holding = this.userHoldings.get(assetId)
      if (holding) {
        holding.value = holding.shares * newPrice
        holding.unrealizedPnL = holding.value - holding.acquisitionCost
      }
    })
  }

  private updateDividends(): void {
    this.userHoldings.forEach((holding, assetId) => {
      const asset = this.tokenizedAssets.get(assetId)
      if (!asset) return
      
      const frequencyMultiplier = this.getFrequencyMultiplier(asset.dividends.frequency)
      const dividendRate = asset.dividends.apr / 100 / 365 * frequencyMultiplier
      const dividendAmount = holding.value * dividendRate
      
      holding.dividendsEarned += dividendAmount
    })
  }

  private getFrequencyMultiplier(frequency: string): number {
    switch (frequency) {
      case 'daily': return 1
      case 'weekly': return 7
      case 'monthly': return 30
      case 'quarterly': return 90
      default: return 1
    }
  }

  private updatePricingHistory(): void {
    this.pricingHistory.forEach((metrics, assetId) => {
      const asset = this.tokenizedAssets.get(assetId)
      if (!asset) return
      
      // Add new price point
      metrics.priceHistory.push({
        timestamp: Date.now(),
        price: asset.pricePerToken,
        volume: metrics.volume24h / 24 // Convert daily to hourly
      })
      
      // Keep only last 30 days
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
      metrics.priceHistory = metrics.priceHistory.filter(point => point.timestamp > thirtyDaysAgo)
      
      // Update 7-day change
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const sevenDayPrice = metrics.priceHistory.find(point => point.timestamp <= sevenDaysAgo)?.price || asset.pricePerToken
      metrics.priceChange7d = ((asset.pricePerToken - sevenDayPrice) / sevenDayPrice) * 100
    })
  }

  private getAssetVolatility(assetType: EnergyAssetType): number {
    const volatilityMap: Record<EnergyAssetType, number> = {
      'WATT': 0.002,
      'SOLAR': 0.015,
      'WIND': 0.018,
      'HYDRO': 0.008,
      'GEOTHERMAL': 0.006,
      'BIOMASS': 0.020,
      'NATURAL_GAS': 0.025,
      'COAL': 0.030,
      'NUCLEAR': 0.004,
      'CARBON_CREDITS': 0.035
    }
    return volatilityMap[assetType] || 0.01
  }

  public calculateFee(asset: EnergyAssetType, amount: number): number {
    // Dynamic fee structure for tokenized assets
    const baseFeeRates: Record<EnergyAssetType, number> = {
      'WATT': 0.001,
      'SOLAR': 0.002,
      'WIND': 0.002,
      'HYDRO': 0.0015,
      'GEOTHERMAL': 0.0015,
      'BIOMASS': 0.0025,
      'NATURAL_GAS': 0.003,
      'COAL': 0.0035,
      'NUCLEAR': 0.001,
      'CARBON_CREDITS': 0.004
    }
    
    const baseFeeRate = baseFeeRates[asset] || 0.002
    const volumeDiscount = this.getVolumeDiscount(amount)
    const feeRate = baseFeeRate * (1 - volumeDiscount)
    
    return amount * feeRate
  }

  private getVolumeDiscount(amount: number): number {
    if (amount >= 100000) return 0.4      // 40% discount for >100K
    if (amount >= 50000) return 0.25      // 25% discount for >50K
    if (amount >= 10000) return 0.15      // 15% discount for >10K
    if (amount >= 1000) return 0.05       // 5% discount for >1K
    return 0
  }

  public calculateOwnership(assetId: string, shares: number): number {
    const asset = this.tokenizedAssets.get(assetId)
    if (!asset) return 0
    
    return (shares / asset.totalSupply) * 100
  }

  public getAssetMetadata(assetId: string): TokenizedAsset['metadata'] | null {
    const asset = this.tokenizedAssets.get(assetId)
    return asset ? asset.metadata : null
  }

  public getAllTokenizedAssets(): TokenizedAsset[] {
    return Array.from(this.tokenizedAssets.values())
  }

  public getTokenizedAsset(assetId: string): TokenizedAsset | null {
    return this.tokenizedAssets.get(assetId) || null
  }

  public getUserHoldings(): UserHolding[] {
    return Array.from(this.userHoldings.values())
  }

  public getUserHolding(assetId: string): UserHolding | null {
    return this.userHoldings.get(assetId) || null
  }

  public getPricingMetrics(assetId: string): PricingMetrics | null {
    return this.pricingHistory.get(assetId) || null
  }

  public getAllPricingMetrics(): PricingMetrics[] {
    return Array.from(this.pricingHistory.values())
  }

  public buyTokens(assetId: string, amount: number): {
    success: boolean
    cost: number
    newShares: number
    ownership: number
  } {
    const asset = this.tokenizedAssets.get(assetId)
    if (!asset || amount > asset.availableSupply) {
      return { success: false, cost: 0, newShares: 0, ownership: 0 }
    }

    const cost = amount * asset.pricePerToken
    const fee = this.calculateFee(asset.assetType, cost)
    const totalCost = cost + fee
    
    // Update asset
    asset.availableSupply -= amount
    
    // Update or create user holding
    const existingHolding = this.userHoldings.get(assetId)
    if (existingHolding) {
      existingHolding.shares += amount
      existingHolding.value += cost
      existingHolding.percentageOwned = this.calculateOwnership(assetId, existingHolding.shares)
      existingHolding.votingPower = Math.floor(existingHolding.shares / 1000)
      existingHolding.unrealizedPnL = existingHolding.value - existingHolding.acquisitionCost
    } else {
      this.userHoldings.set(assetId, {
        assetId,
        shares: amount,
        value: cost,
        dividendsEarned: 0,
        lastDividendClaim: Date.now(),
        votingPower: Math.floor(amount / 1000),
        acquisitionCost: cost,
        unrealizedPnL: 0,
        percentageOwned: this.calculateOwnership(assetId, amount)
      })
    }

    return {
      success: true,
      cost: totalCost,
      newShares: amount,
      ownership: this.calculateOwnership(assetId, this.userHoldings.get(assetId)?.shares || 0)
    }
  }

  public sellTokens(assetId: string, amount: number, percentage: number): {
    success: boolean
    proceeds: number
    fee: number
    netProceeds: number
  } {
    const asset = this.tokenizedAssets.get(assetId)
    const holding = this.userHoldings.get(assetId)
    
    if (!asset || !holding || amount > holding.shares) {
      return { success: false, proceeds: 0, fee: 0, netProceeds: 0 }
    }

    const actualAmount = amount * (percentage / 100)
    const proceeds = actualAmount * asset.pricePerToken
    const fee = this.calculateFee(asset.assetType, proceeds)
    const netProceeds = proceeds - fee
    
    // Update asset
    asset.availableSupply += actualAmount
    
    // Update user holding
    holding.shares -= actualAmount
    holding.value -= proceeds
    holding.percentageOwned = this.calculateOwnership(assetId, holding.shares)
    holding.votingPower = Math.floor(holding.shares / 1000)
    holding.unrealizedPnL = holding.value - holding.acquisitionCost
    
    // Remove holding if no shares left
    if (holding.shares <= 0) {
      this.userHoldings.delete(assetId)
    }
    
    return { success: true, proceeds, fee, netProceeds }
  }

  public claimDividends(assetId: string): {
    success: boolean
    dividends: number
    holding: UserHolding | null
  } {
    const holding = this.userHoldings.get(assetId)
    if (!holding || holding.dividendsEarned <= 0) {
      return { success: false, dividends: 0, holding: null }
    }

    const dividends = holding.dividendsEarned
    holding.dividendsEarned = 0
    holding.lastDividendClaim = Date.now()
    
    return { success: true, dividends, holding }
  }

  public createTokenizedAsset(params: {
    name: string
    assetType: EnergyAssetType
    description: string
    totalSupply: number
    pricePerToken: number
    dividendApr: number
    metadata: TokenizedAsset['metadata']
  }): {
    success: boolean
    assetId: string
    asset: TokenizedAsset | null
  } {
    const assetId = `asset_${Date.now()}`
    
    const asset: TokenizedAsset = {
      id: assetId,
      name: params.name,
      description: params.description,
      assetType: params.assetType,
      totalSupply: params.totalSupply,
      availableSupply: params.totalSupply, // All available initially
      pricePerToken: params.pricePerToken,
      marketCap: params.pricePerToken * params.totalSupply,
      dividends: {
        token: 'WATT', // Default to WATT dividends
        apr: params.dividendApr,
        frequency: 'monthly'
      },
      metadata: params.metadata,
      isActive: true,
      createdAt: Date.now()
    }
    
    this.tokenizedAssets.set(assetId, asset)
    
    // Initialize pricing history
    this.pricingHistory.set(assetId, {
      assetId,
      currentPrice: params.pricePerToken,
      priceChange24h: 0,
      priceChange7d: 0,
      volume24h: 0,
      marketCap: asset.marketCap,
      circulatingSupply: 0,
      totalSupply: params.totalSupply,
      priceHistory: [{
        timestamp: Date.now(),
        price: params.pricePerToken,
        volume: 0
      }]
    })
    
    return { success: true, assetId, asset }
  }

  public getPortfolioMetrics(): {
    totalValue: number
    totalDividends: number
    totalUnrealizedPnL: number
    totalVotingPower: number
    assetCount: number
    bestPerformer: { assetId: string; return: number }
    worstPerformer: { assetId: string; return: number }
  } {
    const holdings = this.getUserHoldings()
    
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
    const totalDividends = holdings.reduce((sum, h) => sum + h.dividendsEarned, 0)
    const totalUnrealizedPnL = holdings.reduce((sum, h) => sum + h.unrealizedPnL, 0)
    const totalVotingPower = holdings.reduce((sum, h) => sum + h.votingPower, 0)
    
    const returns = holdings.map(h => ({
      assetId: h.assetId,
      return: (h.unrealizedPnL / h.acquisitionCost) * 100
    }))
    
    const bestPerformer = returns.reduce((max, current) => 
      current.return > max.return ? current : max, 
      { assetId: '', return: 0 }
    )
    
    const worstPerformer = returns.reduce((min, current) => 
      current.return < min.return ? current : min, 
      { assetId: '', return: 0 }
    )
    
    return {
      totalValue,
      totalDividends,
      totalUnrealizedPnL,
      totalVotingPower,
      assetCount: holdings.length,
      bestPerformer,
      worstPerformer
    }
  }

  public getMarketMetrics(): {
    totalMarketCap: number
    totalVolume24h: number
    averagePrice: number
    mostValuableAsset: { assetId: string; marketCap: number }
    highestVolumeAsset: { assetId: string; volume: number }
    priceTrend: 'bullish' | 'bearish' | 'neutral'
  } {
    const assets = this.getAllTokenizedAssets()
    const metrics = this.getAllPricingMetrics()
    
    const totalMarketCap = assets.reduce((sum, a) => sum + a.marketCap, 0)
    const totalVolume24h = metrics.reduce((sum, m) => sum + m.volume24h, 0)
    const averagePrice = assets.reduce((sum, a) => sum + a.pricePerToken, 0) / assets.length
    
    const mostValuableAsset = assets.reduce((max, current) => 
      current.marketCap > max.marketCap ? current : max, 
      assets[0] || { id: '', marketCap: 0 }
    )
    
    const highestVolumeAsset = metrics.reduce((max, current) => 
      current.volume24h > max.volume ? current : max, 
      metrics[0] || { assetId: '', volume: 0 }
    )
    
    const avgPriceChange = metrics.reduce((sum, m) => sum + m.priceChange24h, 0) / metrics.length
    let priceTrend: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (avgPriceChange > 1) priceTrend = 'bullish'
    else if (avgPriceChange < -1) priceTrend = 'bearish'
    
    return {
      totalMarketCap,
      totalVolume24h,
      averagePrice,
      mostValuableAsset: { assetId: mostValuableAsset.id, marketCap: mostValuableAsset.marketCap },
      highestVolumeAsset: { assetId: highestVolumeAsset.assetId, volume: highestVolumeAsset.volume24h },
      priceTrend
    }
  }

  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }
}
