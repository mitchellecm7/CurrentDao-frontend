// Energy Market News Impact Calculator

import { SentimentAnalysis, SentimentScore } from '@/services/news/sentiment-analyzer'
import { NewsArticle } from '@/services/news/aggregation-engine'

// Types
export interface MarketImpact {
  id: string
  articleId: string
  timestamp: Date
  commodity: string
  sector: string
  region?: string
  impact: {
    priceChange: number // percentage
    volumeChange: number // percentage
    volatilityChange: number // percentage
    confidence: number // 0-1
  }
  timeframe: {
    immediate: number // 0-1 hours
    short: number // 1-24 hours
    medium: number // 1-7 days
    long: number // 1-4 weeks
  }
  factors: ImpactFactor[]
  riskLevel: 'very-low' | 'low' | 'medium' | 'high' | 'very-high'
  recommendations: string[]
  relatedAssets: string[]
}

export interface ImpactFactor {
  type: 'sentiment' | 'volume' | 'source' | 'timing' | 'entity' | 'technical'
  weight: number // 0-1
  influence: number // -1 to 1
  confidence: number // 0-1
  description: string
}

export interface PricePrediction {
  commodity: string
  currentPrice: number
  predictedPrice: number
  timeframe: string
  confidence: number
  upperBound: number
  lowerBound: number
  factors: string[]
  lastUpdated: Date
}

export interface MarketMetrics {
  commodity: string
  price: number
  volume: number
  volatility: number
  marketCap: number
  openInterest: number
  timestamp: Date
}

export interface CorrelationData {
  commodity1: string
  commodity2: string
  correlation: number // -1 to 1
  pValue: number
  sampleSize: number
  timeframe: string
  lastCalculated: Date
}

export interface ImpactModel {
  id: string
  name: string
  type: 'linear' | 'neural' | 'ensemble' | 'time-series'
  accuracy: number // 0-1
  trainedOn: string
  lastUpdated: Date
  commodities: string[]
  isActive: boolean
}

export class ImpactCalculator {
  private models: Map<string, ImpactModel> = new Map()
  private marketHistory: Map<string, MarketMetrics[]> = new Map()
  private correlations: Map<string, CorrelationData> = new Map()
  private impactHistory: MarketImpact[] = []
  private eventListeners: Map<string, Function[]> = new Map()

  // Commodity-specific impact weights
  private commodityWeights = {
    'crude-oil': {
      sentiment: 0.35,
      volume: 0.25,
      source: 0.15,
      timing: 0.10,
      entity: 0.10,
      technical: 0.05
    },
    'natural-gas': {
      sentiment: 0.30,
      volume: 0.30,
      source: 0.15,
      timing: 0.10,
      entity: 0.10,
      technical: 0.05
    },
    'solar': {
      sentiment: 0.25,
      volume: 0.20,
      source: 0.20,
      timing: 0.15,
      entity: 0.15,
      technical: 0.05
    },
    'wind': {
      sentiment: 0.25,
      volume: 0.20,
      source: 0.20,
      timing: 0.15,
      entity: 0.15,
      technical: 0.05
    },
    'nuclear': {
      sentiment: 0.40,
      volume: 0.15,
      source: 0.20,
      timing: 0.10,
      entity: 0.10,
      technical: 0.05
    }
  }

  // Source reliability scores
  private sourceReliability = {
    'reuters-energy': 0.95,
    'bloomberg-energy': 0.98,
    'platts': 0.92,
    'iea-news': 0.99,
    'renewable-energy-world': 0.85,
    'world-nuclear-news': 0.88,
    'energy-storage-news': 0.82,
    'oil-price': 0.90,
    'euractiv-energy': 0.87,
    'twitter-energy': 0.75,
    'linkedin-energy': 0.70
  }

  // Time-based multipliers
  private timeMultipliers = {
    'market-hours': 1.2,
    'after-hours': 0.8,
    'weekend': 0.6,
    'holiday': 0.5
  }

  constructor() {
    this.initializeModels()
    this.initializeMarketData()
  }

  // Initialize impact models
  private initializeModels(): void {
    const models: ImpactModel[] = [
      {
        id: 'energy-impact-neural-v1',
        name: 'Energy Market Neural Network',
        type: 'neural',
        accuracy: 0.87,
        trainedOn: '5 years of market data',
        lastUpdated: new Date('2024-02-01'),
        commodities: ['crude-oil', 'natural-gas', 'solar', 'wind', 'nuclear'],
        isActive: true
      },
      {
        id: 'commodity-ensemble-v2',
        name: 'Commodity Ensemble Model',
        type: 'ensemble',
        accuracy: 0.89,
        trainedOn: '10 years of commodity data',
        lastUpdated: new Date('2024-01-15'),
        commodities: ['crude-oil', 'natural-gas'],
        isActive: true
      },
      {
        id: 'renewable-linear-v1',
        name: 'Renewable Energy Linear Model',
        type: 'linear',
        accuracy: 0.82,
        trainedOn: '3 years of renewable data',
        lastUpdated: new Date('2024-01-20'),
        commodities: ['solar', 'wind'],
        isActive: false
      }
    ]

    models.forEach(model => {
      this.models.set(model.id, model)
    })
  }

  // Initialize mock market data
  private initializeMarketData(): void {
    const commodities = ['crude-oil', 'natural-gas', 'solar', 'wind', 'nuclear']
    
    commodities.forEach(commodity => {
      const history: MarketMetrics[] = []
      const basePrice = this.getBasePrice(commodity)
      
      // Generate 30 days of mock data
      for (let i = 30; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        const randomChange = (Math.random() - 0.5) * 0.05 // ±2.5% daily change
        
        history.push({
          commodity,
          price: basePrice * (1 + randomChange),
          volume: Math.floor(Math.random() * 1000000) + 500000,
          volatility: Math.random() * 0.3 + 0.1,
          marketCap: basePrice * 1000000,
          openInterest: Math.floor(Math.random() * 500000) + 100000,
          timestamp: date
        })
      }
      
      this.marketHistory.set(commodity, history)
    })

    // Initialize correlations
    this.initializeCorrelations()
  }

  // Get base price for commodity
  private getBasePrice(commodity: string): number {
    const basePrices = {
      'crude-oil': 75.50,
      'natural-gas': 3.25,
      'solar': 0.08,
      'wind': 0.06,
      'nuclear': 0.12
    }
    
    return basePrices[commodity as keyof typeof basePrices] || 100
  }

  // Initialize correlations between commodities
  private initializeCorrelations(): void {
    const correlations: CorrelationData[] = [
      {
        commodity1: 'crude-oil',
        commodity2: 'natural-gas',
        correlation: 0.75,
        pValue: 0.001,
        sampleSize: 1000,
        timeframe: '30d',
        lastCalculated: new Date()
      },
      {
        commodity1: 'solar',
        commodity2: 'wind',
        correlation: 0.85,
        pValue: 0.0001,
        sampleSize: 800,
        timeframe: '30d',
        lastCalculated: new Date()
      },
      {
        commodity1: 'crude-oil',
        commodity2: 'nuclear',
        correlation: -0.45,
        pValue: 0.05,
        sampleSize: 600,
        timeframe: '30d',
        lastCalculated: new Date()
      }
    ]

    correlations.forEach(correlation => {
      const key = `${correlation.commodity1}-${correlation.commodity2}`
      this.correlations.set(key, correlation)
    })
  }

  // Calculate market impact for a news article
  async calculateImpact(
    article: NewsArticle,
    sentiment: SentimentAnalysis
  ): Promise<MarketImpact> {
    const commodities = this.extractCommodities(article)
    const impacts: MarketImpact[] = []

    for (const commodity of commodities) {
      const impact = await this.calculateCommodityImpact(article, sentiment, commodity)
      impacts.push(impact)
    }

    // Return the highest impact
    const highestImpact = impacts.reduce((max, current) => 
      Math.abs(current.impact.priceChange) > Math.abs(max.impact.priceChange) ? current : max
    )

    this.impactHistory.push(highestImpact)
    
    // Keep only last 1000 impacts
    if (this.impactHistory.length > 1000) {
      this.impactHistory = this.impactHistory.slice(-1000)
    }

    this.emit('impactCalculated', highestImpact)
    return highestImpact
  }

  // Calculate impact for specific commodity
  private async calculateCommodityImpact(
    article: NewsArticle,
    sentiment: SentimentAnalysis,
    commodity: string
  ): Promise<MarketImpact> {
    const factors = await this.calculateImpactFactors(article, sentiment, commodity)
    const weights = this.commodityWeights[commodity as keyof typeof this.commodityWeights] || 
                    this.commodityWeights['crude-oil']

    // Calculate weighted impact
    let priceChange = 0
    let volumeChange = 0
    let volatilityChange = 0
    let totalConfidence = 0

    factors.forEach(factor => {
      const weight = weights[factor.type as keyof typeof weights] || 0.1
      const influence = factor.influence * factor.confidence * weight
      
      switch (factor.type) {
        case 'sentiment':
          priceChange += influence * 0.15 // 15% max price impact from sentiment
          volumeChange += Math.abs(influence) * 0.10
          volatilityChange += Math.abs(influence) * 0.20
          break
        case 'volume':
          volumeChange += influence * 0.25
          priceChange += influence * 0.05
          break
        case 'source':
          priceChange += influence * 0.08
          totalConfidence += factor.confidence * weight
          break
        case 'timing':
          priceChange += influence * 0.05
          volumeChange += influence * 0.03
          break
        case 'entity':
          priceChange += influence * 0.12
          volumeChange += influence * 0.08
          break
        case 'technical':
          volatilityChange += influence * 0.15
          break
      }
      
      totalConfidence += factor.confidence * weight
    })

    // Apply time-based multiplier
    const timeMultiplier = this.getTimeMultiplier(article.publishedAt)
    priceChange *= timeMultiplier
    volumeChange *= timeMultiplier

    // Calculate timeframe impacts
    const timeframes = this.calculateTimeframeImpacts(priceChange, commodity)

    // Determine risk level
    const riskLevel = this.calculateRiskLevel(priceChange, volatilityChange, totalConfidence)

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      priceChange, 
      volumeChange, 
      riskLevel, 
      commodity
    )

    // Find related assets
    const relatedAssets = this.findRelatedAssets(commodity)

    const impact: MarketImpact = {
      id: `impact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      articleId: article.id,
      timestamp: new Date(),
      commodity,
      sector: this.getCommoditySector(commodity),
      region: article.metadata.region,
      impact: {
        priceChange,
        volumeChange,
        volatilityChange,
        confidence: Math.min(totalConfidence, 1)
      },
      timeframe: timeframes,
      factors,
      riskLevel,
      recommendations,
      relatedAssets
    }

    return impact
  }

  // Calculate impact factors
  private async calculateImpactFactors(
    article: NewsArticle,
    sentiment: SentimentAnalysis,
    commodity: string
  ): Promise<ImpactFactor[]> {
    const factors: ImpactFactor[] = []

    // Sentiment factor
    factors.push({
      type: 'sentiment',
      weight: 0.35,
      influence: sentiment.overall.score,
      confidence: sentiment.overall.confidence,
      description: `Overall sentiment: ${sentiment.overall.label} (${sentiment.overall.score.toFixed(2)})`
    })

    // Volume factor (based on article engagement)
    const engagementScore = Math.min(article.engagement.views / 10000, 1)
    factors.push({
      type: 'volume',
      weight: 0.25,
      influence: engagementScore * (sentiment.overall.score > 0 ? 1 : -1),
      confidence: 0.7,
      description: `Article engagement score: ${engagementScore.toFixed(2)}`
    })

    // Source reliability factor
    const sourceReliability = this.sourceReliability[article.source.id as keyof typeof this.sourceReliability] || 0.5
    factors.push({
      type: 'source',
      weight: 0.15,
      influence: sourceReliability * (sentiment.overall.score > 0 ? 1 : -1),
      confidence: 0.9,
      description: `Source reliability: ${(sourceReliability * 100).toFixed(0)}%`
    })

    // Timing factor
    const timingScore = this.getTimingScore(article.publishedAt)
    factors.push({
      type: 'timing',
      weight: 0.10,
      influence: timingScore,
      confidence: 0.8,
      description: `Timing score: ${timingScore.toFixed(2)}`
    })

    // Entity factor (based on mentioned companies/entities)
    const entityScore = this.calculateEntityImpact(article.entities, commodity)
    factors.push({
      type: 'entity',
      weight: 0.10,
      influence: entityScore,
      confidence: 0.6,
      description: `Entity impact score: ${entityScore.toFixed(2)}`
    })

    // Technical factor (based on market conditions)
    const technicalScore = this.calculateTechnicalImpact(commodity)
    factors.push({
      type: 'technical',
      weight: 0.05,
      influence: technicalScore,
      confidence: 0.5,
      description: `Technical market conditions: ${technicalScore.toFixed(2)}`
    })

    return factors
  }

  // Extract commodities from article
  private extractCommodities(article: NewsArticle): string[] {
    const commodities = ['crude-oil', 'natural-gas', 'solar', 'wind', 'nuclear']
    const found: string[] = []

    const text = `${article.title} ${article.content} ${article.tags.join(' ')}`.toLowerCase()

    commodities.forEach(commodity => {
      const keywords = {
        'crude-oil': ['oil', 'crude', 'petroleum', 'wti', 'brent'],
        'natural-gas': ['gas', 'natural gas', 'lng', 'methane'],
        'solar': ['solar', 'photovoltaic', 'pv', 'sun', 'solar panel'],
        'wind': ['wind', 'turbine', 'windmill', 'wind energy'],
        'nuclear': ['nuclear', 'atomic', 'fission', 'fusion', 'uranium']
      }

      const commodityKeywords = keywords[commodity as keyof typeof keywords]
      if (commodityKeywords.some(keyword => text.includes(keyword))) {
        found.push(commodity)
      }
    })

    return found.length > 0 ? found : ['crude-oil'] // Default to crude oil
  }

  // Get time multiplier based on publishing time
  private getTimeMultiplier(publishedAt: Date): number {
    const hour = publishedAt.getHours()
    const dayOfWeek = publishedAt.getDay()
    
    // Check if weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return this.timeMultipliers['weekend']
    }
    
    // Check if market hours (9 AM - 4 PM EST)
    if (hour >= 9 && hour <= 16) {
      return this.timeMultipliers['market-hours']
    }
    
    // After hours
    return this.timeMultipliers['after-hours']
  }

  // Get timing score
  private getTimingScore(publishedAt: Date): number {
    const hoursSinceOpen = this.getHoursSinceMarketOpen(publishedAt)
    
    // Higher score for news published during active trading hours
    if (hoursSinceOpen >= 0 && hoursSinceOpen <= 7) {
      return 1.0 - (hoursSinceOpen * 0.1)
    }
    
    return 0.3
  }

  // Get hours since market open
  private getHoursSinceMarketOpen(publishedAt: Date): number {
    const estTime = new Date(publishedAt.toLocaleString("en-US", {timeZone: "America/New_York"}))
    const marketOpen = new Date(estTime)
    marketOpen.setHours(9, 30, 0, 0)
    
    return (estTime.getTime() - marketOpen.getTime()) / (1000 * 60 * 60)
  }

  // Calculate entity impact
  private calculateEntityImpact(entities: any[], commodity: string): number {
    // Mock entity impact calculation
    const majorCompanies = {
      'crude-oil': ['exxon', 'shell', 'chevron', 'bp', 'total'],
      'natural-gas': ['chesapeake', 'eog', 'pioneer', 'cabot'],
      'solar': ['first solar', 'sunpower', 'tesla', 'enphase'],
      'wind': ['ge', 'vestas', 'siemens', 'nordex'],
      'nuclear': ['exelon', 'duke', 'nextera', 'entergy']
    }

    const relevantCompanies = majorCompanies[commodity as keyof typeof majorCompanies] || []
    let impact = 0

    entities.forEach(entity => {
      if (relevantCompanies.some(company => 
        entity.text.toLowerCase().includes(company)
      )) {
        impact += 0.2
      }
    })

    return Math.min(impact, 1.0)
  }

  // Calculate technical impact
  private calculateTechnicalImpact(commodity: string): number {
    const history = this.marketHistory.get(commodity)
    if (!history || history.length < 2) return 0

    const latest = history[history.length - 1]
    const previous = history[history.length - 2]

    // Calculate recent trend
    const priceChange = (latest.price - previous.price) / previous.price
    const volumeChange = (latest.volume - previous.volume) / previous.volume

    // High volatility and volume increase may amplify news impact
    if (latest.volatility > 0.3 && volumeChange > 0.1) {
      return 0.5
    }

    // Strong trend may continue
    if (Math.abs(priceChange) > 0.02) {
      return priceChange > 0 ? 0.3 : -0.3
    }

    return 0
  }

  // Calculate timeframe impacts
  private calculateTimeframeImpacts(
    priceChange: number,
    commodity: string
  ): MarketImpact['timeframe'] {
    // Immediate impact (0-1 hours)
    const immediate = priceChange * 0.8

    // Short-term impact (1-24 hours)
    const short = priceChange * 0.6

    // Medium-term impact (1-7 days)
    const medium = priceChange * 0.4

    // Long-term impact (1-4 weeks)
    const long = priceChange * 0.2

    return {
      immediate,
      short,
      medium,
      long
    }
  }

  // Calculate risk level
  private calculateRiskLevel(
    priceChange: number,
    volatilityChange: number,
    confidence: number
  ): MarketImpact['riskLevel'] {
    const impactMagnitude = Math.abs(priceChange)
    const volatilityMagnitude = Math.abs(volatilityChange)
    
    const riskScore = (impactMagnitude * 0.5) + 
                    (volatilityMagnitude * 0.3) + 
                    ((1 - confidence) * 0.2)

    if (riskScore > 0.8) return 'very-high'
    if (riskScore > 0.6) return 'high'
    if (riskScore > 0.4) return 'medium'
    if (riskScore > 0.2) return 'low'
    return 'very-low'
  }

  // Generate recommendations
  private generateRecommendations(
    priceChange: number,
    volumeChange: number,
    riskLevel: MarketImpact['riskLevel'],
    commodity: string
  ): string[] {
    const recommendations: string[] = []

    if (Math.abs(priceChange) > 0.05) {
      if (priceChange > 0) {
        recommendations.push('Consider taking profits on existing positions')
        recommendations.push('Monitor for potential reversal signals')
      } else {
        recommendations.push('Consider defensive positioning')
        recommendations.push('Look for support levels before entry')
      }
    }

    if (volumeChange > 0.2) {
      recommendations.push('High volume suggests strong market conviction')
      recommendations.push('Monitor for institutional activity')
    }

    if (riskLevel === 'high' || riskLevel === 'very-high') {
      recommendations.push('Use smaller position sizes due to elevated risk')
      recommendations.push('Consider options for defined risk exposure')
    }

    // Commodity-specific recommendations
    const commodityRecommendations = {
      'crude-oil': 'Monitor OPEC announcements and inventory data',
      'natural-gas': 'Watch weather forecasts and storage levels',
      'solar': 'Track policy changes and installation targets',
      'wind': 'Monitor government subsidies and grid integration',
      'nuclear': 'Follow regulatory updates and safety reports'
    }

    recommendations.push(commodityRecommendations[commodity as keyof typeof commodityRecommendations] || 
                       'Monitor sector-specific developments')

    return recommendations
  }

  // Find related assets
  private findRelatedAssets(commodity: string): string[] {
    const relatedAssets = {
      'crude-oil': ['Brent Crude', 'WTI Crude', 'Oil ETFs', 'Energy Stocks'],
      'natural-gas': ['Henry Hub', 'LNG', 'Gas ETFs', 'Utility Stocks'],
      'solar': ['Solar ETFs', 'Panel Manufacturers', 'Installers'],
      'wind': ['Wind ETFs', 'Turbine Manufacturers', 'Wind Farms'],
      'nuclear': ['Nuclear ETFs', 'Uranium Stocks', 'Utility Companies']
    }

    return relatedAssets[commodity as keyof typeof relatedAssets] || []
  }

  // Get commodity sector
  private getCommoditySector(commodity: string): string {
    const sectors = {
      'crude-oil': 'Oil & Gas',
      'natural-gas': 'Oil & Gas',
      'solar': 'Renewable Energy',
      'wind': 'Renewable Energy',
      'nuclear': 'Nuclear Energy'
    }

    return sectors[commodity as keyof typeof sectors] || 'Energy'
  }

  // Generate price predictions
  async generatePricePredictions(
    commodity: string,
    timeframes: string[] = ['24h', '7d', '30d']
  ): Promise<PricePrediction[]> {
    const history = this.marketHistory.get(commodity)
    if (!history || history.length < 10) {
      throw new Error(`Insufficient data for ${commodity} price prediction`)
    }

    const currentPrice = history[history.length - 1].price
    const predictions: PricePrediction[] = []

    for (const timeframe of timeframes) {
      const prediction = await this.calculatePricePrediction(
        commodity,
        currentPrice,
        timeframe
      )
      predictions.push(prediction)
    }

    return predictions
  }

  // Calculate price prediction for specific timeframe
  private async calculatePricePrediction(
    commodity: string,
    currentPrice: number,
    timeframe: string
  ): Promise<PricePrediction> {
    // Get recent impacts for this commodity
    const recentImpacts = this.impactHistory
      .filter(impact => impact.commodity === commodity)
      .slice(-20) // Last 20 impacts

    // Calculate average impact
    const avgPriceChange = recentImpacts.reduce((sum, impact) => 
      sum + impact.impact.priceChange, 0) / Math.max(recentImpacts.length, 1)

    // Apply timeframe decay
    const timeDecay = this.getTimeDecay(timeframe)
    const predictedChange = avgPriceChange * timeDecay

    const predictedPrice = currentPrice * (1 + predictedChange)
    const confidence = this.calculatePredictionConfidence(recentImpacts, timeframe)

    // Calculate bounds based on volatility
    const history = this.marketHistory.get(commodity)
    const volatility = history?.[history.length - 1]?.volatility || 0.2
    const boundRange = volatility * 2 // 2 standard deviations

    return {
      commodity,
      currentPrice,
      predictedPrice,
      timeframe,
      confidence,
      upperBound: predictedPrice * (1 + boundRange),
      lowerBound: predictedPrice * (1 - boundRange),
      factors: [
        'Recent news sentiment',
        'Market volatility',
        'Historical price trends',
        'Seasonal patterns'
      ],
      lastUpdated: new Date()
    }
  }

  // Get time decay factor
  private getTimeDecay(timeframe: string): number {
    const decayFactors = {
      '1h': 0.9,
      '4h': 0.8,
      '24h': 0.6,
      '7d': 0.4,
      '30d': 0.2
    }

    return decayFactors[timeframe as keyof typeof decayFactors] || 0.5
  }

  // Calculate prediction confidence
  private calculatePredictionConfidence(
    impacts: MarketImpact[],
    timeframe: string
  ): number {
    if (impacts.length === 0) return 0.1

    const avgConfidence = impacts.reduce((sum, impact) => 
      sum + impact.impact.confidence, 0) / impacts.length

    const consistency = this.calculateImpactConsistency(impacts)
    const timeDecay = this.getTimeDecay(timeframe)

    return Math.min(avgConfidence * consistency * timeDecay, 0.95)
  }

  // Calculate impact consistency
  private calculateImpactConsistency(impacts: MarketImpact[]): number {
    if (impacts.length < 2) return 0.5

    const priceChanges = impacts.map(impact => impact.impact.priceChange)
    const mean = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length
    const variance = priceChanges.reduce((sum, change) => 
      sum + Math.pow(change - mean, 2), 0) / priceChanges.length
    const standardDeviation = Math.sqrt(variance)

    // Lower variance = higher consistency
    return Math.max(0, 1 - standardDeviation)
  }

  // Update market metrics
  updateMarketMetrics(commodity: string, metrics: MarketMetrics): void {
    const history = this.marketHistory.get(commodity) || []
    history.push(metrics)
    
    // Keep only last 1000 entries
    if (history.length > 1000) {
      history.splice(0, history.length - 1000)
    }
    
    this.marketHistory.set(commodity, history)
    this.emit('marketMetricsUpdated', { commodity, metrics })
  }

  // Get market metrics
  getMarketMetrics(commodity: string, hours?: number): MarketMetrics[] {
    const history = this.marketHistory.get(commodity)
    if (!history) return []

    if (!hours) return history

    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    return history.filter(metrics => metrics.timestamp >= cutoff)
  }

  // Get impact history
  getImpactHistory(
    commodity?: string,
    hours?: number,
    minRiskLevel?: MarketImpact['riskLevel']
  ): MarketImpact[] {
    let impacts = this.impactHistory

    if (commodity) {
      impacts = impacts.filter(impact => impact.commodity === commodity)
    }

    if (hours) {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
      impacts = impacts.filter(impact => impact.timestamp >= cutoff)
    }

    if (minRiskLevel) {
      const riskLevels = ['very-low', 'low', 'medium', 'high', 'very-high']
      const minIndex = riskLevels.indexOf(minRiskLevel)
      impacts = impacts.filter(impact => 
        riskLevels.indexOf(impact.riskLevel) >= minIndex
      )
    }

    return impacts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Get available models
  getModels(): ImpactModel[] {
    return Array.from(this.models.values())
  }

  // Activate model
  activateModel(modelId: string): void {
    const model = this.models.get(modelId)
    if (model) {
      // Deactivate all other models
      this.models.forEach(m => m.isActive = false)
      model.isActive = true
      this.emit('modelActivated', model)
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
}

export default ImpactCalculator
