export type EnergyAssetType = 
  | 'WATT' 
  | 'SOLAR' 
  | 'WIND' 
  | 'HYDRO' 
  | 'GEOTHERMAL' 
  | 'BIOMASS'
  | 'NATURAL_GAS'
  | 'COAL'
  | 'NUCLEAR'
  | 'CARBON_CREDITS'

export interface ExchangeRate {
  from: EnergyAssetType
  to: EnergyAssetType
  rate: number
  spread: number
  lastUpdated: number
  volume24h: number
  liquidity: number
}

export interface PriceData {
  asset: EnergyAssetType
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  lastUpdated: number
}

export class ConversionEngine {
  private rates: Map<string, ExchangeRate> = new Map()
  private priceData: Map<EnergyAssetType, PriceData> = new Map()
  private updateInterval: NodeJS.Timeout | null = null
  private readonly MAX_SPREAD = 0.001 // 0.1% maximum spread
  private readonly UPDATE_INTERVAL = 5000 // 5 seconds

  constructor() {
    this.initializeRates()
    this.startRealTimeUpdates()
  }

  private initializeRates(): void {
    // Base prices relative to USD
    const basePrices: Record<EnergyAssetType, number> = {
      'WATT': 1.00,
      'SOLAR': 0.95,
      'WIND': 0.92,
      'HYDRO': 0.88,
      'GEOTHERMAL': 0.94,
      'BIOMASS': 0.86,
      'NATURAL_GAS': 0.78,
      'COAL': 0.72,
      'NUCLEAR': 0.96,
      'CARBON_CREDITS': 1.12
    }

    // Initialize price data
    Object.entries(basePrices).forEach(([asset, price]) => {
      this.priceData.set(asset as EnergyAssetType, {
        asset: asset as EnergyAssetType,
        price,
        change24h: (Math.random() - 0.5) * 10, // ±5% random change
        volume24h: Math.random() * 1000000,
        marketCap: price * (Math.random() * 10000000 + 1000000),
        lastUpdated: Date.now()
      })
    })

    // Initialize exchange rates
    this.updateAllRates()
  }

  private updateAllRates(): void {
    const assets: EnergyAssetType[] = [
      'WATT', 'SOLAR', 'WIND', 'HYDRO', 'GEOTHERMAL', 
      'BIOMASS', 'NATURAL_GAS', 'COAL', 'NUCLEAR', 'CARBON_CREDITS'
    ]

    assets.forEach(fromAsset => {
      assets.forEach(toAsset => {
        if (fromAsset !== toAsset) {
          const fromPrice = this.priceData.get(fromAsset)?.price || 1
          const toPrice = this.priceData.get(toAsset)?.price || 1
          const rate = fromPrice / toPrice
          
          // Add small random spread to simulate market conditions
          const spread = (Math.random() * this.MAX_SPREAD * 2 - this.MAX_SPREAD)
          const adjustedRate = rate * (1 + spread)
          
          this.rates.set(`${fromAsset}-${toAsset}`, {
            from: fromAsset,
            to: toAsset,
            rate: adjustedRate,
            spread: Math.abs(spread),
            lastUpdated: Date.now(),
            volume24h: Math.random() * 500000,
            liquidity: Math.random() * 5000000 + 1000000
          })
        }
      })
    })
  }

  private startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.simulateMarketMovements()
      this.updateAllRates()
    }, this.UPDATE_INTERVAL)
  }

  private simulateMarketMovements(): void {
    this.priceData.forEach((data, asset) => {
      // Simulate price movements with realistic volatility
      const volatility = this.getAssetVolatility(asset)
      const priceChange = (Math.random() - 0.5) * volatility
      const newPrice = Math.max(0.01, data.price * (1 + priceChange))
      
      // Update price data
      this.priceData.set(asset, {
        ...data,
        price: newPrice,
        change24h: ((newPrice - data.price) / data.price) * 100,
        volume24h: data.volume24h * (1 + (Math.random() - 0.5) * 0.2),
        lastUpdated: Date.now()
      })
    })
  }

  private getAssetVolatility(asset: EnergyAssetType): number {
    // Different assets have different volatility profiles
    const volatilityMap: Record<EnergyAssetType, number> = {
      'WATT': 0.002,      // Low volatility (base currency)
      'SOLAR': 0.008,     // Medium volatility
      'WIND': 0.010,      // Medium-high volatility
      'HYDRO': 0.006,     // Low-medium volatility
      'GEOTHERMAL': 0.005, // Low volatility
      'BIOMASS': 0.012,   // High volatility
      'NATURAL_GAS': 0.015, // High volatility
      'COAL': 0.018,      // Very high volatility
      'NUCLEAR': 0.004,   // Very low volatility
      'CARBON_CREDITS': 0.020 // Very high volatility
    }
    return volatilityMap[asset] || 0.01
  }

  public getExchangeRate(from: EnergyAssetType, to: EnergyAssetType): number {
    if (from === to) return 1.0
    
    const rate = this.rates.get(`${from}-${to}`)
    if (!rate) {
      // Calculate rate if not found
      const fromPrice = this.priceData.get(from)?.price || 1
      const toPrice = this.priceData.get(to)?.price || 1
      return fromPrice / toPrice
    }
    
    return rate.rate
  }

  public getExchangeRateWithSpread(from: EnergyAssetType, to: EnergyAssetType): ExchangeRate | null {
    if (from === to) {
      return {
        from,
        to,
        rate: 1.0,
        spread: 0,
        lastUpdated: Date.now(),
        volume24h: 0,
        liquidity: 0
      }
    }
    
    return this.rates.get(`${from}-${to}`) || null
  }

  public getAllRates(): ExchangeRate[] {
    return Array.from(this.rates.values())
  }

  public getPriceData(asset: EnergyAssetType): PriceData | null {
    return this.priceData.get(asset) || null
  }

  public getAllPriceData(): PriceData[] {
    return Array.from(this.priceData.values())
  }

  public calculateOptimalRoute(
    from: EnergyAssetType, 
    to: EnergyAssetType, 
    amount: number
  ): {
    route: EnergyAssetType[]
    outputAmount: number
    totalFee: number
    slippage: number
  } {
    // Simple direct route for now - could be enhanced for multi-hop routing
    const rate = this.getExchangeRate(from, to)
    const outputAmount = amount * rate
    const fee = this.calculateFee(from, amount)
    const slippage = this.calculateSlippage(from, to, amount)
    
    return {
      route: [from, to],
      outputAmount,
      totalFee: fee,
      slippage
    }
  }

  public calculateFee(asset: EnergyAssetType, amount: number): number {
    // Dynamic fee structure based on asset type and amount
    const baseFeeRate = this.getAssetFeeRate(asset)
    const volumeDiscount = this.getVolumeDiscount(amount)
    const feeRate = baseFeeRate * (1 - volumeDiscount)
    
    return amount * feeRate
  }

  private getAssetFeeRate(asset: EnergyAssetType): number {
    // Different fee rates for different assets
    const feeRates: Record<EnergyAssetType, number> = {
      'WATT': 0.001,        // 0.1%
      'SOLAR': 0.0015,      // 0.15%
      'WIND': 0.0015,       // 0.15%
      'HYDRO': 0.0012,      // 0.12%
      'GEOTHERMAL': 0.0012, // 0.12%
      'BIOMASS': 0.002,     // 0.2%
      'NATURAL_GAS': 0.002, // 0.2%
      'COAL': 0.0025,       // 0.25%
      'NUCLEAR': 0.001,     // 0.1%
      'CARBON_CREDITS': 0.003 // 0.3%
    }
    return feeRates[asset] || 0.0015
  }

  private getVolumeDiscount(amount: number): number {
    // Volume-based discounts
    if (amount >= 1000000) return 0.5      // 50% discount for >1M
    if (amount >= 100000) return 0.3       // 30% discount for >100K
    if (amount >= 10000) return 0.15      // 15% discount for >10K
    return 0
  }

  public calculateSlippage(from: EnergyAssetType, to: EnergyAssetType, amount: number): number {
    const liquidity = this.rates.get(`${from}-${to}`)?.liquidity || 1000000
    const slippageRate = Math.min(0.05, amount / liquidity * 0.01) // Max 5% slippage
    return slippageRate
  }

  public getLiquidityDepth(from: EnergyAssetType, to: EnergyAssetType): number {
    return this.rates.get(`${from}-${to}`)?.liquidity || 0
  }

  public get24HourVolume(from: EnergyAssetType, to: EnergyAssetType): number {
    return this.rates.get(`${from}-${to}`)?.volume24h || 0
  }

  public isRateStale(from: EnergyAssetType, to: EnergyAssetType, maxAgeMs: number = 60000): boolean {
    const rate = this.rates.get(`${from}-${to}`)
    if (!rate) return true
    
    return Date.now() - rate.lastUpdated > maxAgeMs
  }

  public forceUpdate(): void {
    this.simulateMarketMovements()
    this.updateAllRates()
  }

  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  // Advanced features
  public getArbitrageOpportunities(): Array<{
    path: EnergyAssetType[]
    profit: number
    profitPercentage: number
    confidence: number
  }> {
    const opportunities: Array<{
      path: EnergyAssetType[]
      profit: number
      profitPercentage: number
      confidence: number
    }> = []

    const assets: EnergyAssetType[] = [
      'WATT', 'SOLAR', 'WIND', 'HYDRO', 'GEOTHERMAL', 
      'BIOMASS', 'NATURAL_GAS', 'COAL', 'NUCLEAR', 'CARBON_CREDITS'
    ]

    // Simple triangular arbitrage detection
    assets.forEach(assetA => {
      assets.forEach(assetB => {
        assets.forEach(assetC => {
          if (assetA !== assetB && assetB !== assetC && assetA !== assetC) {
            const rateAB = this.getExchangeRate(assetA, assetB)
            const rateBC = this.getExchangeRate(assetB, assetC)
            const rateCA = this.getExchangeRate(assetC, assetA)
            
            const impliedRate = rateAB * rateBC
            const actualRate = rateCA
            
            if (impliedRate > actualRate * 1.001) { // 0.1% threshold
              const profit = impliedRate - actualRate
              const profitPercentage = (profit / actualRate) * 100
              
              opportunities.push({
                path: [assetA, assetB, assetC, assetA],
                profit,
                profitPercentage,
                confidence: Math.min(1, profitPercentage / 5) // Confidence based on profit margin
              })
            }
          }
        })
      })
    })

    return opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage).slice(0, 10)
  }

  public getMarketMetrics(): {
    totalVolume24h: number
    totalLiquidity: number
    averageSpread: number
    mostActivePair: { from: EnergyAssetType; to: EnergyAssetType; volume: number }
    priceVolatility: Record<EnergyAssetType, number>
  } {
    const rates = Array.from(this.rates.values())
    const totalVolume24h = rates.reduce((sum, rate) => sum + rate.volume24h, 0)
    const totalLiquidity = rates.reduce((sum, rate) => sum + rate.liquidity, 0)
    const averageSpread = rates.reduce((sum, rate) => sum + rate.spread, 0) / rates.length
    
    const mostActivePair = rates.reduce((max, rate) => 
      rate.volume24h > max.volume ? rate : max, 
      { from: 'WATT', to: 'SOLAR', volume: 0 }
    )

    const priceVolatility: Record<EnergyAssetType, number> = {} as any
    this.priceData.forEach((data, asset) => {
      priceVolatility[asset] = Math.abs(data.change24h)
    })

    return {
      totalVolume24h,
      totalLiquidity,
      averageSpread,
      mostActivePair: { from: mostActivePair.from, to: mostActivePair.to, volume: mostActivePair.volume24h },
      priceVolatility
    }
  }
}
