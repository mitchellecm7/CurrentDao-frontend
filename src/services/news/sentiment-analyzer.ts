// AI-Powered Sentiment Analysis Service for Energy Market News

// Types
export interface SentimentScore {
  score: number // -1 (very negative) to 1 (very positive)
  confidence: number // 0 to 1
  magnitude: number // 0 to 1, how strong the sentiment is
  label: 'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive'
}

export interface SentimentAnalysis {
  id: string
  articleId: string
  overall: SentimentScore
  aspects: {
    market: SentimentScore
    policy: SentimentScore
    technology: SentimentScore
    environmental: SentimentScore
    economic: SentimentScore
  }
  emotions: {
    fear: number
    greed: number
    optimism: number
    uncertainty: number
    excitement: number
    concern: number
  }
  keywords: {
    positive: string[]
    negative: string[]
    neutral: string[]
    energy: string[]
  }
  entities: Array<{
    text: string
    type: 'company' | 'person' | 'location' | 'commodity' | 'technology'
    sentiment: SentimentScore
    confidence: number
  }>
  processingTime: number
  model: string
  version: string
  analyzedAt: Date
}

export interface MarketSentiment {
  timestamp: Date
  overall: SentimentScore
  sectors: Record<string, SentimentScore>
  commodities: Record<string, SentimentScore>
  regions: Record<string, SentimentScore>
  volume: number // number of articles analyzed
  trend: 'improving' | 'declining' | 'stable'
  volatility: number // 0-1
  confidence: number
}

export interface SentimentModel {
  id: string
  name: string
  type: 'transformer' | 'bert' | 'roberta' | 'custom'
  accuracy: number // 0-1
  trainedOn: string
  lastUpdated: Date
  categories: string[]
  languages: string[]
  isActive: boolean
}

export interface SentimentAlert {
  id: string
  type: 'spike' | 'trend' | 'threshold' | 'anomaly'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  data: {
    current: SentimentScore
    previous?: SentimentScore
    change?: number
    threshold?: number
  }
  timestamp: Date
  acknowledged: boolean
}

export class SentimentAnalyzer {
  private models: Map<string, SentimentModel> = new Map()
  private cache: Map<string, SentimentAnalysis> = new Map()
  private marketHistory: MarketSentiment[] = []
  private alerts: SentimentAlert[] = []
  private eventListeners: Map<string, Function[]> = new Map()

  // Energy-specific sentiment lexicons
  private energyLexicon = {
    positive: [
      'breakthrough', 'innovation', 'growth', 'expansion', 'investment', 'profitable',
      'efficient', 'sustainable', 'clean', 'renewable', 'advancement', 'success',
      'opportunity', 'demand', 'bullish', 'optimistic', 'upward', 'strong'
    ],
    negative: [
      'decline', 'crisis', 'shortage', 'disruption', 'shutdown', 'loss', 'bearish',
      'concern', 'risk', 'uncertainty', 'volatility', 'recession', 'cut', 'reduce',
      'delay', 'failure', 'accident', 'spill', 'pollution', 'controversy'
    ],
    energy: [
      'oil', 'gas', 'petroleum', 'crude', 'natural gas', 'lng', 'shale', 'fracking',
      'solar', 'wind', 'renewable', 'clean energy', 'green energy', 'sustainable',
      'nuclear', 'fission', 'fusion', 'uranium', 'atomic', 'power plant',
      'electricity', 'grid', 'transmission', 'distribution', 'generation',
      'battery', 'storage', 'hydrogen', 'biofuel', 'geothermal', 'hydropower',
      'coal', 'mining', 'extraction', 'refinery', 'pipeline', 'infrastructure'
    ]
  }

  // Aspect-specific keywords
  private aspectKeywords = {
    market: ['price', 'market', 'trading', 'futures', 'commodity', 'supply', 'demand', 'bullish', 'bearish'],
    policy: ['regulation', 'policy', 'government', 'law', 'legislation', 'treaty', 'agreement', 'mandate'],
    technology: ['innovation', 'technology', 'research', 'development', 'breakthrough', 'advancement', 'patent'],
    environmental: ['environment', 'climate', 'emissions', 'carbon', 'green', 'sustainable', 'renewable', 'clean'],
    economic: ['economy', 'gdp', 'growth', 'recession', 'inflation', 'employment', 'investment', 'profit']
  }

  // Emotion indicators
  private emotionIndicators = {
    fear: ['fear', 'panic', 'crash', 'collapse', 'disaster', 'emergency', 'threat', 'danger'],
    greed: ['greed', 'fomo', 'euphoria', 'bubble', 'overvalued', 'speculation', 'mania'],
    optimism: ['optimistic', 'hopeful', 'positive', 'bullish', 'confident', 'bright', 'promising'],
    uncertainty: ['uncertain', 'unclear', 'unknown', 'volatile', 'unstable', 'unpredictable', 'mixed'],
    excitement: ['exciting', 'breakthrough', 'revolutionary', 'game-changer', 'milestone', 'historic'],
    concern: ['concern', 'worry', 'caution', 'warning', 'alert', 'risk', 'challenge']
  }

  constructor() {
    this.initializeModels()
  }

  // Initialize sentiment analysis models
  private initializeModels(): void {
    const models: SentimentModel[] = [
      {
        id: 'energy-transformer-v1',
        name: 'Energy-Specific Transformer Model',
        type: 'transformer',
        accuracy: 0.89,
        trainedOn: '10M+ energy news articles',
        lastUpdated: new Date('2024-01-15'),
        categories: ['market', 'policy', 'technology', 'environmental', 'economic'],
        languages: ['en', 'es', 'fr', 'de'],
        isActive: true
      },
      {
        id: 'financial-bert-v2',
        name: 'Financial BERT Model',
        type: 'bert',
        accuracy: 0.86,
        trainedOn: '5M+ financial documents',
        lastUpdated: new Date('2024-02-01'),
        categories: ['market', 'economic'],
        languages: ['en'],
        isActive: true
      },
      {
        id: 'multilingual-roberta',
        name: 'Multilingual RoBERTa',
        type: 'roberta',
        accuracy: 0.84,
        trainedOn: '20M+ multilingual texts',
        lastUpdated: new Date('2024-01-20'),
        categories: ['general'],
        languages: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar'],
        isActive: false
      }
    ]

    models.forEach(model => {
      this.models.set(model.id, model)
    })
  }

  // Analyze sentiment of a single article
  async analyzeArticle(
    articleId: string,
    title: string,
    content: string,
    metadata?: any
  ): Promise<SentimentAnalysis> {
    // Check cache first
    const cacheKey = `${articleId}-${title.length}-${content.length}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const startTime = Date.now()

    // Get active model
    const model = this.getActiveModel()
    if (!model) {
      throw new Error('No active sentiment analysis model available')
    }

    // Preprocess text
    const processedText = this.preprocessText(`${title} ${content}`)

    // Analyze overall sentiment
    const overall = await this.calculateSentiment(processedText, model)

    // Analyze aspect-specific sentiments
    const aspects = await this.analyzeAspects(processedText, model)

    // Analyze emotions
    const emotions = await this.analyzeEmotions(processedText)

    // Extract keywords
    const keywords = this.extractKeywords(processedText)

    // Extract entities (simplified)
    const entities = this.extractEntities(processedText)

    const analysis: SentimentAnalysis = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      articleId,
      overall,
      aspects,
      emotions,
      keywords,
      entities,
      processingTime: Date.now() - startTime,
      model: model.id,
      version: model.name,
      analyzedAt: new Date()
    }

    // Cache result
    this.cache.set(cacheKey, analysis)

    // Emit event
    this.emit('articleAnalyzed', analysis)

    return analysis
  }

  // Analyze sentiment of multiple articles
  async analyzeBatch(articles: Array<{
    id: string
    title: string
    content: string
    metadata?: any
  }>): Promise<SentimentAnalysis[]> {
    const batchSize = 10
    const results: SentimentAnalysis[] = []

    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize)
      const batchPromises = batch.map(article => 
        this.analyzeArticle(article.id, article.title, article.content, article.metadata)
      )

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Small delay to prevent overwhelming the system
      if (i + batchSize < articles.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    this.emit('batchAnalyzed', { articles: results })
    return results
  }

  // Calculate overall sentiment
  private async calculateSentiment(text: string, model: SentimentModel): Promise<SentimentScore> {
    // Simplified sentiment calculation - in production would use actual ML model
    const words = text.toLowerCase().split(/\s+/)
    
    let positiveScore = 0
    let negativeScore = 0
    let totalWords = 0

    words.forEach(word => {
      totalWords++
      
      if (this.energyLexicon.positive.some(pos => word.includes(pos))) {
        positiveScore += 1
      }
      if (this.energyLexicon.negative.some(neg => word.includes(neg))) {
        negativeScore += 1
      }
    })

    // Calculate normalized score
    const rawScore = (positiveScore - negativeScore) / Math.max(totalWords, 1)
    const score = Math.max(-1, Math.min(1, rawScore * 10)) // Scale to -1 to 1

    // Calculate confidence based on text length and keyword density
    const keywordDensity = (positiveScore + negativeScore) / Math.max(totalWords, 1)
    const lengthConfidence = Math.min(text.length / 1000, 1) // More text = higher confidence
    const confidence = Math.min(keywordDensity * 2 * lengthConfidence, 1)

    // Calculate magnitude (how strong the sentiment is)
    const magnitude = Math.abs(score) * confidence

    // Determine label
    let label: SentimentScore['label']
    if (score < -0.6) label = 'very-negative'
    else if (score < -0.2) label = 'negative'
    else if (score < 0.2) label = 'neutral'
    else if (score < 0.6) label = 'positive'
    else label = 'very-positive'

    return {
      score,
      confidence,
      magnitude,
      label
    }
  }

  // Analyze aspect-specific sentiments
  private async analyzeAspects(text: string, model: SentimentModel): Promise<SentimentAnalysis['aspects']> {
    const aspects: SentimentAnalysis['aspects'] = {
      market: { score: 0, confidence: 0, magnitude: 0, label: 'neutral' },
      policy: { score: 0, confidence: 0, magnitude: 0, label: 'neutral' },
      technology: { score: 0, confidence: 0, magnitude: 0, label: 'neutral' },
      environmental: { score: 0, confidence: 0, magnitude: 0, label: 'neutral' },
      economic: { score: 0, confidence: 0, magnitude: 0, label: 'neutral' }
    }

    for (const [aspect, keywords] of Object.entries(this.aspectKeywords)) {
      const aspectText = this.extractAspectText(text, keywords)
      if (aspectText.length > 50) {
        aspects[aspect as keyof typeof aspects] = await this.calculateSentiment(aspectText, model)
      }
    }

    return aspects
  }

  // Extract text related to specific aspect
  private extractAspectText(text: string, keywords: string[]): string {
    const sentences = text.split(/[.!?]+/)
    const relevantSentences = sentences.filter(sentence =>
      keywords.some(keyword => sentence.toLowerCase().includes(keyword))
    )
    
    return relevantSentences.join('. ')
  }

  // Analyze emotions in text
  private async analyzeEmotions(text: string): Promise<SentimentAnalysis['emotions']> {
    const words = text.toLowerCase().split(/\s+/)
    const emotions: SentimentAnalysis['emotions'] = {
      fear: 0,
      greed: 0,
      optimism: 0,
      uncertainty: 0,
      excitement: 0,
      concern: 0
    }

    for (const [emotion, indicators] of Object.entries(this.emotionIndicators)) {
      const count = indicators.reduce((sum, indicator) => {
        return sum + words.filter(word => word.includes(indicator)).length
      }, 0)
      
      emotions[emotion as keyof typeof emotions] = count / words.length
    }

    return emotions
  }

  // Extract keywords from text
  private extractKeywords(text: string): SentimentAnalysis['keywords'] {
    const words = text.toLowerCase().split(/\s+/)
    
    const keywords: SentimentAnalysis['keywords'] = {
      positive: [],
      negative: [],
      neutral: [],
      energy: []
    }

    words.forEach(word => {
      if (this.energyLexicon.positive.includes(word) && !keywords.positive.includes(word)) {
        keywords.positive.push(word)
      }
      if (this.energyLexicon.negative.includes(word) && !keywords.negative.includes(word)) {
        keywords.negative.push(word)
      }
      if (this.energyLexicon.energy.includes(word) && !keywords.energy.includes(word)) {
        keywords.energy.push(word)
      }
    })

    // Add some neutral keywords (common energy terms)
    const commonTerms = ['energy', 'power', 'sector', 'industry', 'market', 'company']
    commonTerms.forEach(term => {
      if (words.includes(term) && !keywords.neutral.includes(term)) {
        keywords.neutral.push(term)
      }
    })

    return keywords
  }

  // Extract entities from text (simplified)
  private extractEntities(text: string): SentimentAnalysis['entities'] {
    const entities: SentimentAnalysis['entities'] = []
    
    // Simple entity extraction based on patterns
    const patterns = {
      company: /\b[A-Z][a-z]+ (?:Energy|Oil|Gas|Power|Renewable|Solar|Wind)\b/g,
      commodity: /\b(Crude Oil|Natural Gas|Solar|Wind|Nuclear|Coal|Hydrogen)\b/g,
      technology: /\b(Solar|Wind|Battery|Hydrogen|Nuclear|Smart Grid|AI|IoT)\b/g,
      location: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Country|State|Province|City)\b/g
    }

    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => {
          entities.push({
            text: match,
            type: type as SentimentAnalysis['entities'][0]['type'],
            sentiment: { score: 0, confidence: 0.5, magnitude: 0, label: 'neutral' },
            confidence: 0.7
          })
        })
      }
    }

    return entities
  }

  // Preprocess text for analysis
  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  // Get active sentiment model
  private getActiveModel(): SentimentModel | null {
    for (const model of this.models.values()) {
      if (model.isActive) {
        return model
      }
    }
    return null
  }

  // Calculate market sentiment from multiple analyses
  calculateMarketSentiment(analyses: SentimentAnalysis[]): MarketSentiment {
    if (analyses.length === 0) {
      throw new Error('No sentiment analyses provided')
    }

    const overall = this.aggregateSentimentScores(analyses.map(a => a.overall))
    
    // Calculate sector-specific sentiments
    const sectors: Record<string, SentimentScore> = {}
    const sectorGroups = this.groupBySector(analyses)
    
    for (const [sector, sectorAnalyses] of Object.entries(sectorGroups)) {
      sectors[sector] = this.aggregateSentimentScores(sectorAnalyses.map(a => a.overall))
    }

    // Calculate commodity-specific sentiments
    const commodities: Record<string, SentimentScore> = {}
    const commodityGroups = this.groupByCommodity(analyses)
    
    for (const [commodity, commodityAnalyses] of Object.entries(commodityGroups)) {
      commodities[commodity] = this.aggregateSentimentScores(commodityAnalyses.map(a => a.overall))
    }

    // Calculate regional sentiments
    const regions: Record<string, SentimentScore> = {}
    const regionGroups = this.groupByRegion(analyses)
    
    for (const [region, regionAnalyses] of Object.entries(regionGroups)) {
      regions[region] = this.aggregateSentimentScores(regionAnalyses.map(a => a.overall))
    }

    // Calculate trend
    const trend = this.calculateTrend(analyses)
    
    // Calculate volatility
    const volatility = this.calculateVolatility(analyses.map(a => a.overall.score))

    const marketSentiment: MarketSentiment = {
      timestamp: new Date(),
      overall,
      sectors,
      commodities,
      regions,
      volume: analyses.length,
      trend,
      volatility,
      confidence: overall.confidence
    }

    // Store in history
    this.marketHistory.push(marketSentiment)
    
    // Keep only last 1000 entries
    if (this.marketHistory.length > 1000) {
      this.marketHistory = this.marketHistory.slice(-1000)
    }

    // Check for alerts
    this.checkSentimentAlerts(marketSentiment)

    this.emit('marketSentimentCalculated', marketSentiment)

    return marketSentiment
  }

  // Aggregate multiple sentiment scores
  private aggregateSentimentScores(scores: SentimentScore[]): SentimentScore {
    if (scores.length === 0) {
      return { score: 0, confidence: 0, magnitude: 0, label: 'neutral' }
    }

    const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length
    const avgConfidence = scores.reduce((sum, s) => sum + s.confidence, 0) / scores.length
    const avgMagnitude = scores.reduce((sum, s) => sum + s.magnitude, 0) / scores.length

    let label: SentimentScore['label']
    if (avgScore < -0.6) label = 'very-negative'
    else if (avgScore < -0.2) label = 'negative'
    else if (avgScore < 0.2) label = 'neutral'
    else if (avgScore < 0.6) label = 'positive'
    else label = 'very-positive'

    return {
      score: avgScore,
      confidence: avgConfidence,
      magnitude: avgMagnitude,
      label
    }
  }

  // Group analyses by sector
  private groupBySector(analyses: SentimentAnalysis[]): Record<string, SentimentAnalysis[]> {
    const groups: Record<string, SentimentAnalysis[]> = {}
    
    analyses.forEach(analysis => {
      // Determine sector based on keywords and aspects
      let sector = 'general'
      
      if (analysis.aspects.market.magnitude > 0.3) sector = 'market'
      else if (analysis.aspects.technology.magnitude > 0.3) sector = 'technology'
      else if (analysis.aspects.environmental.magnitude > 0.3) sector = 'environmental'
      else if (analysis.aspects.policy.magnitude > 0.3) sector = 'policy'
      else if (analysis.aspects.economic.magnitude > 0.3) sector = 'economic'
      
      if (!groups[sector]) groups[sector] = []
      groups[sector].push(analysis)
    })

    return groups
  }

  // Group analyses by commodity
  private groupByCommodity(analyses: SentimentAnalysis[]): Record<string, SentimentAnalysis[]> {
    const groups: Record<string, SentimentAnalysis[]> = {}
    
    analyses.forEach(analysis => {
      analysis.keywords.energy.forEach(commodity => {
        if (!groups[commodity]) groups[commodity] = []
        groups[commodity].push(analysis)
      })
    })

    return groups
  }

  // Group analyses by region
  private groupByRegion(analyses: SentimentAnalysis[]): Record<string, SentimentAnalysis[]> {
    const groups: Record<string, SentimentAnalysis[]> = { 'global': [] }
    
    analyses.forEach(analysis => {
      // Simple region extraction - in production would use more sophisticated NER
      const regions = ['north america', 'europe', 'asia', 'middle east', 'africa', 'south america']
      let detectedRegion = 'global'
      
      regions.forEach(region => {
        if (analysis.keywords.energy.some(keyword => keyword.includes(region))) {
          detectedRegion = region
        }
      })
      
      if (!groups[detectedRegion]) groups[detectedRegion] = []
      groups[detectedRegion].push(analysis)
    })

    return groups
  }

  // Calculate sentiment trend
  private calculateTrend(analyses: SentimentAnalysis[]): 'improving' | 'declining' | 'stable' {
    if (this.marketHistory.length < 2) return 'stable'

    const current = this.aggregateSentimentScores(analyses.map(a => a.overall))
    const previous = this.marketHistory[this.marketHistory.length - 1].overall

    const change = current.score - previous.score
    
    if (change > 0.1) return 'improving'
    if (change < -0.1) return 'declining'
    return 'stable'
  }

  // Calculate volatility
  private calculateVolatility(scores: number[]): number {
    if (scores.length < 2) return 0

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)

    // Normalize to 0-1 range
    return Math.min(standardDeviation * 2, 1)
  }

  // Check for sentiment alerts
  private checkSentimentAlerts(marketSentiment: MarketSentiment): void {
    const alerts: SentimentAlert[] = []

    // Check for significant sentiment changes
    if (this.marketHistory.length > 1) {
      const previous = this.marketHistory[this.marketHistory.length - 2]
      const scoreChange = Math.abs(marketSentiment.overall.score - previous.overall.score)
      
      if (scoreChange > 0.3) {
        alerts.push({
          id: `alert-${Date.now()}-spike`,
          type: 'spike',
          severity: scoreChange > 0.5 ? 'high' : 'medium',
          message: `Significant sentiment change detected: ${scoreChange.toFixed(2)}`,
          data: {
            current: marketSentiment.overall,
            previous: previous.overall,
            change: scoreChange
          },
          timestamp: new Date(),
          acknowledged: false
        })
      }
    }

    // Check for threshold breaches
    if (marketSentiment.overall.score > 0.7) {
      alerts.push({
        id: `alert-${Date.now()}-positive-threshold`,
        type: 'threshold',
        severity: 'medium',
        message: 'Market sentiment reached very positive levels',
        data: {
          current: marketSentiment.overall,
          threshold: 0.7
        },
        timestamp: new Date(),
        acknowledged: false
      })
    } else if (marketSentiment.overall.score < -0.7) {
      alerts.push({
        id: `alert-${Date.now()}-negative-threshold`,
        type: 'threshold',
        severity: 'high',
        message: 'Market sentiment reached very negative levels',
        data: {
          current: marketSentiment.overall,
          threshold: -0.7
        },
        timestamp: new Date(),
        acknowledged: false
      })
    }

    // Add alerts to list
    alerts.forEach(alert => {
      this.alerts.push(alert)
      this.emit('sentimentAlert', alert)
    })

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }
  }

  // Get sentiment history
  getMarketHistory(hours?: number): MarketSentiment[] {
    if (!hours) return this.marketHistory

    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    return this.marketHistory.filter(entry => entry.timestamp >= cutoff)
  }

  // Get alerts
  getAlerts(severity?: SentimentAlert['severity']): SentimentAlert[] {
    let alerts = this.alerts
    
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity)
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Acknowledge alert
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      this.emit('alertAcknowledged', alert)
    }
  }

  // Get available models
  getModels(): SentimentModel[] {
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

  // Clear cache
  clearCache(): void {
    this.cache.clear()
    this.emit('cacheCleared')
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

export default SentimentAnalyzer
