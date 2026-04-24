import { EnergyAssetType } from './conversion-engine'

export interface LiquidityPool {
  id: string
  tokenA: EnergyAssetType
  tokenB: EnergyAssetType
  reserveA: number
  reserveB: number
  totalLiquidity: number
  apr: number
  volume24h: number
  fees24h: number
  tvl: number
  feeRate: number
  createdAt: number
}

export interface Farm {
  id: string
  name: string
  description: string
  stakedToken: EnergyAssetType
  rewardTokens: {
    token: EnergyAssetType
    apr: number
    dailyReward: number
  }[]
  totalStaked: number
  lockPeriod: number
  multiplier: number
  isActive: boolean
  endsAt?: number
  performanceFee: number
  createdAt: number
}

export interface UserPosition {
  type: 'pool' | 'farm'
  id: string
  liquidity: number
  sharePercentage: number
  valueUSD: number
  unclaimedFees: number
  unclaimedRewards: {
    token: EnergyAssetType
    amount: number
  }[]
  createdAt: number
  lastUpdated: number
}

export class LiquidityManagement {
  private pools: Map<string, LiquidityPool> = new Map()
  private farms: Map<string, Farm> = new Map()
  private userPositions: Map<string, UserPosition> = new Map()
  private updateInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializePools()
    this.initializeFarms()
    this.initializeUserPositions()
    this.startRealTimeUpdates()
  }

  private initializePools(): void {
    const poolData = [
      {
        id: 'WATT-SOLAR',
        tokenA: 'WATT' as EnergyAssetType,
        tokenB: 'SOLAR' as EnergyAssetType,
        reserveA: 1250000,
        reserveB: 1187500,
        totalLiquidity: 2437500,
        apr: 12.5,
        volume24h: 89000,
        fees24h: 267,
        feeRate: 0.003
      },
      {
        id: 'WATT-WIND',
        tokenA: 'WATT' as EnergyAssetType,
        tokenB: 'WIND' as EnergyAssetType,
        reserveA: 980000,
        reserveB: 901600,
        totalLiquidity: 1881600,
        apr: 15.2,
        volume24h: 76000,
        fees24h: 228,
        feeRate: 0.003
      },
      {
        id: 'SOLAR-WIND',
        tokenA: 'SOLAR' as EnergyAssetType,
        tokenB: 'WIND' as EnergyAssetType,
        reserveA: 650000,
        reserveB: 598000,
        totalLiquidity: 1248000,
        apr: 18.7,
        volume24h: 54000,
        fees24h: 162,
        feeRate: 0.003
      },
      {
        id: 'WATT-HYDRO',
        tokenA: 'WATT' as EnergyAssetType,
        tokenB: 'HYDRO' as EnergyAssetType,
        reserveA: 750000,
        reserveB: 660000,
        totalLiquidity: 1410000,
        apr: 14.3,
        volume24h: 42000,
        fees24h: 126,
        feeRate: 0.003
      },
      {
        id: 'GEOTHERMAL-CARBON_CREDITS',
        tokenA: 'GEOTHERMAL' as EnergyAssetType,
        tokenB: 'CARBON_CREDITS' as EnergyAssetType,
        reserveA: 320000,
        reserveB: 358400,
        totalLiquidity: 678400,
        apr: 22.1,
        volume24h: 28000,
        fees24h: 84,
        feeRate: 0.003
      }
    ]

    poolData.forEach(pool => {
      this.pools.set(pool.id, {
        ...pool,
        tvl: pool.totalLiquidity,
        createdAt: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      })
    })
  }

  private initializeFarms(): void {
    const farmData = [
      {
        id: 'watt-single',
        name: 'WATT Single Stake',
        description: 'Stake WATT tokens to earn additional WATT rewards',
        stakedToken: 'WATT' as EnergyAssetType,
        rewardTokens: [
          { token: 'WATT' as EnergyAssetType, apr: 8.5, dailyReward: 0.0233 }
        ],
        totalStaked: 2500000,
        lockPeriod: 0,
        multiplier: 1.0,
        performanceFee: 0.001
      },
      {
        id: 'solar-watt-lp',
        name: 'SOLAR-WATT LP Farm',
        description: 'Stake SOLAR-WATT LP tokens to earn multiple rewards',
        stakedToken: 'SOLAR-WATT-LP' as EnergyAssetType,
        rewardTokens: [
          { token: 'WATT' as EnergyAssetType, apr: 12.5, dailyReward: 0.0342 },
          { token: 'SOLAR' as EnergyAssetType, apr: 6.2, dailyReward: 0.0170 }
        ],
        totalStaked: 1850000,
        lockPeriod: 30,
        multiplier: 1.5,
        performanceFee: 0.0015
      },
      {
        id: 'multi-energy',
        name: 'Multi-Energy Booster',
        description: 'Stake any energy asset for boosted rewards',
        stakedToken: 'ANY' as EnergyAssetType,
        rewardTokens: [
          { token: 'WATT' as EnergyAssetType, apr: 15.2, dailyReward: 0.0416 },
          { token: 'CARBON_CREDITS' as EnergyAssetType, apr: 8.8, dailyReward: 0.0241 }
        ],
        totalStaked: 3200000,
        lockPeriod: 90,
        multiplier: 2.0,
        performanceFee: 0.002,
        endsAt: Date.now() + 90 * 24 * 60 * 60 * 1000
      },
      {
        id: 'carbon-offset',
        name: 'Carbon Offset Program',
        description: 'Stake carbon credits for environmental rewards',
        stakedToken: 'CARBON_CREDITS' as EnergyAssetType,
        rewardTokens: [
          { token: 'WATT' as EnergyAssetType, apr: 18.7, dailyReward: 0.0512 },
          { token: 'CARBON_CREDITS' as EnergyAssetType, apr: 12.3, dailyReward: 0.0337 }
        ],
        totalStaked: 980000,
        lockPeriod: 180,
        multiplier: 2.5,
        performanceFee: 0.0025
      }
    ]

    farmData.forEach(farm => {
      this.farms.set(farm.id, {
        ...farm,
        isActive: true,
        createdAt: Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000
      })
    })
  }

  private initializeUserPositions(): void {
    // Mock user positions
    const positions = [
      {
        type: 'pool' as const,
        id: 'WATT-SOLAR',
        liquidity: 12500,
        sharePercentage: 0.51,
        valueUSD: 12500,
        unclaimedFees: 12.50,
        unclaimedRewards: [
          { token: 'WATT' as EnergyAssetType, amount: 8.5 },
          { token: 'SOLAR' as EnergyAssetType, amount: 4.2 }
        ]
      },
      {
        type: 'pool' as const,
        id: 'SOLAR-WIND',
        liquidity: 25000,
        sharePercentage: 2.0,
        valueUSD: 25000,
        unclaimedFees: 25.00,
        unclaimedRewards: [
          { token: 'WATT' as EnergyAssetType, amount: 15.2 },
          { token: 'SOLAR' as EnergyAssetType, amount: 4.8 },
          { token: 'WIND' as EnergyAssetType, amount: 3.9 }
        ]
      },
      {
        type: 'farm' as const,
        id: 'watt-single',
        liquidity: 12500,
        sharePercentage: 0.5,
        valueUSD: 12500,
        unclaimedFees: 0,
        unclaimedRewards: [
          { token: 'WATT' as EnergyAssetType, amount: 145.8 }
        ]
      },
      {
        type: 'farm' as const,
        id: 'solar-watt-lp',
        liquidity: 25000,
        sharePercentage: 1.35,
        valueUSD: 25000,
        unclaimedFees: 0,
        unclaimedRewards: [
          { token: 'WATT' as EnergyAssetType, amount: 289.2 },
          { token: 'SOLAR' as EnergyAssetType, amount: 143.6 }
        ]
      }
    ]

    positions.forEach(position => {
      this.userPositions.set(`${position.type}-${position.id}`, {
        ...position,
        createdAt: Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
        lastUpdated: Date.now()
      })
    })
  }

  private startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.updateAPRs()
      this.updateVolumes()
      this.updateRewards()
    }, 10000) // Update every 10 seconds
  }

  private updateAPRs(): void {
    this.pools.forEach(pool => {
      // Simulate APR changes based on utilization
      const utilization = pool.volume24h / pool.tvl
      const baseAPR = 10 + utilization * 20 // Base 10% + utilization bonus
      pool.apr = baseAPR * (1 + (Math.random() - 0.5) * 0.1) // ±5% variation
    })

    this.farms.forEach(farm => {
      farm.rewardTokens.forEach(reward => {
        reward.apr = reward.apr * (1 + (Math.random() - 0.5) * 0.02) // ±1% variation
      })
    })
  }

  private updateVolumes(): void {
    this.pools.forEach(pool => {
      // Simulate volume changes
      const volumeChange = (Math.random() - 0.5) * 0.1 // ±10% change
      pool.volume24h = Math.max(1000, pool.volume24h * (1 + volumeChange))
      pool.fees24h = pool.volume24h * pool.feeRate
    })
  }

  private updateRewards(): void {
    this.userPositions.forEach(position => {
      if (position.type === 'farm') {
        position.unclaimedRewards.forEach(reward => {
          // Accumulate rewards over time
          const farm = this.farms.get(position.id)
          if (farm) {
            const rewardRate = farm.rewardTokens.find(r => r.token === reward.token)?.dailyReward || 0
            reward.amount += rewardRate * position.liquidity / 1000000 // Scaled reward accumulation
          }
        })
      } else if (position.type === 'pool') {
        // Accumulate fees
        const pool = this.pools.get(position.id)
        if (pool) {
          position.unclaimedFees += (pool.fees24h / 24 / 60 / 60) * position.sharePercentage / 100
        }
      }
      position.lastUpdated = Date.now()
    })
  }

  public calculateShare(poolId: string, liquidityAmount: number): number {
    const pool = this.pools.get(poolId)
    if (!pool) return 0

    return (liquidityAmount / pool.totalLiquidity) * 100
  }

  public estimateLiquidity(tokenA: EnergyAssetType, tokenB: EnergyAssetType, amountA: number): number {
    const poolId = `${tokenA}-${tokenB}`
    const pool = this.pools.get(poolId) || this.pools.get(`${tokenB}-${tokenA}`)
    
    if (!pool) return amountA // Return same amount if no pool exists

    // Calculate required amount of tokenB based on current reserves
    const amountB = (amountA * pool.reserveB) / pool.reserveA
    
    // Calculate LP tokens to be minted (simplified)
    return Math.sqrt(amountA * amountB)
  }

  public calculateRewards(farmId: string, stakedAmount: number): number {
    const farm = this.farms.get(farmId)
    if (!farm) return 0

    const totalDailyRewards = farm.rewardTokens.reduce((sum, reward) => 
      sum + (reward.dailyReward * farm.totalStaked), 0
    )

    return (stakedAmount / farm.totalStaked) * totalDailyRewards
  }

  public getFarmMultiplier(farmId: string): number {
    const farm = this.farms.get(farmId)
    return farm?.multiplier || 1.0
  }

  public getAllPools(): LiquidityPool[] {
    return Array.from(this.pools.values())
  }

  public getPool(poolId: string): LiquidityPool | null {
    return this.pools.get(poolId) || null
  }

  public getAllFarms(): Farm[] {
    return Array.from(this.farms.values())
  }

  public getFarm(farmId: string): Farm | null {
    return this.farms.get(farmId) || null
  }

  public getUserPositions(): UserPosition[] {
    return Array.from(this.userPositions.values())
  }

  public getUserPosition(type: 'pool' | 'farm', id: string): UserPosition | null {
    return this.userPositions.get(`${type}-${id}`) || null
  }

  public addLiquidity(poolId: string, amountA: number, amountB: number): {
    success: boolean
    liquidityTokens: number
    newShare: number
  } {
    const pool = this.pools.get(poolId)
    if (!pool) {
      return { success: false, liquidityTokens: 0, newShare: 0 }
    }

    // Update pool reserves
    pool.reserveA += amountA
    pool.reserveB += amountB
    pool.totalLiquidity += amountA + amountB

    // Calculate LP tokens
    const liquidityTokens = this.estimateLiquidity(pool.tokenA, pool.tokenB, amountA)
    const newShare = this.calculateShare(poolId, liquidityTokens)

    // Update or create user position
    const positionKey = `pool-${poolId}`
    const existingPosition = this.userPositions.get(positionKey)
    
    if (existingPosition) {
      existingPosition.liquidity += liquidityTokens
      existingPosition.sharePercentage = newShare
      existingPosition.valueUSD += amountA + amountB
      existingPosition.lastUpdated = Date.now()
    } else {
      this.userPositions.set(positionKey, {
        type: 'pool',
        id: poolId,
        liquidity: liquidityTokens,
        sharePercentage: newShare,
        valueUSD: amountA + amountB,
        unclaimedFees: 0,
        unclaimedRewards: [],
        createdAt: Date.now(),
        lastUpdated: Date.now()
      })
    }

    return { success: true, liquidityTokens, newShare }
  }

  public removeLiquidity(poolId: string, liquidityAmount: number, percentage: number): {
    success: boolean
    amountA: number
    amountB: number
    fees: number
  } {
    const pool = this.pools.get(poolId)
    const position = this.getUserPosition('pool', poolId)
    
    if (!pool || !position || liquidityAmount > position.liquidity) {
      return { success: false, amountA: 0, amountB: 0, fees: 0 }
    }

    const actualAmount = liquidityAmount * (percentage / 100)
    const shareOfPool = actualAmount / pool.totalLiquidity

    // Calculate amounts to return
    const amountA = pool.reserveA * shareOfPool
    const amountB = pool.reserveB * shareOfPool
    const fees = position.unclaimedFees * (percentage / 100)

    // Update pool
    pool.reserveA -= amountA
    pool.reserveB -= amountB
    pool.totalLiquidity -= actualAmount

    // Update user position
    position.liquidity -= actualAmount
    position.sharePercentage = this.calculateShare(poolId, position.liquidity)
    position.valueUSD -= amountA + amountB
    position.unclaimedFees -= fees
    position.lastUpdated = Date.now()

    // Remove position if no liquidity left
    if (position.liquidity <= 0) {
      this.userPositions.delete(`pool-${poolId}`)
    }

    return { success: true, amountA, amountB, fees }
  }

  public stake(farmId: string, amount: number): {
    success: boolean
    stakedAmount: number
    dailyRewards: number
  } {
    const farm = this.farms.get(farmId)
    if (!farm) {
      return { success: false, stakedAmount: 0, dailyRewards: 0 }
    }

    // Update farm
    farm.totalStaked += amount

    // Update or create user position
    const positionKey = `farm-${farmId}`
    const existingPosition = this.userPositions.get(positionKey)
    
    const dailyRewards = this.calculateRewards(farmId, amount)
    
    if (existingPosition) {
      existingPosition.liquidity += amount
      existingPosition.valueUSD += amount
      existingPosition.lastUpdated = Date.now()
    } else {
      this.userPositions.set(positionKey, {
        type: 'farm',
        id: farmId,
        liquidity: amount,
        sharePercentage: (amount / farm.totalStaked) * 100,
        valueUSD: amount,
        unclaimedFees: 0,
        unclaimedRewards: farm.rewardTokens.map(reward => ({
          token: reward.token,
          amount: 0
        })),
        createdAt: Date.now(),
        lastUpdated: Date.now()
      })
    }

    return { success: true, stakedAmount: amount, dailyRewards }
  }

  public unstake(farmId: string, amount: number, percentage: number): {
    success: boolean
    unstakedAmount: number
    rewards: number
  } {
    const farm = this.farms.get(farmId)
    const position = this.getUserPosition('farm', farmId)
    
    if (!farm || !position || amount > position.liquidity) {
      return { success: false, unstakedAmount: 0, rewards: 0 }
    }

    const actualAmount = amount * (percentage / 100)
    const rewards = this.calculateRewards(farmId, actualAmount)

    // Update farm
    farm.totalStaked -= actualAmount

    // Update user position
    position.liquidity -= actualAmount
    position.valueUSD -= actualAmount
    position.sharePercentage = farm.totalStaked > 0 ? (position.liquidity / farm.totalStaked) * 100 : 0
    position.lastUpdated = Date.now()

    // Remove position if no stake left
    if (position.liquidity <= 0) {
      this.userPositions.delete(`farm-${farmId}`)
    }

    return { success: true, unstakedAmount: actualAmount, rewards }
  }

  public claimFees(poolId: string): {
    success: boolean
    fees: number
  } {
    const position = this.getUserPosition('pool', poolId)
    if (!position || position.unclaimedFees <= 0) {
      return { success: false, fees: 0 }
    }

    const fees = position.unclaimedFees
    position.unclaimedFees = 0
    position.lastUpdated = Date.now()

    return { success: true, fees }
  }

  public claimRewards(farmId: string): {
    success: boolean
    rewards: Array<{ token: EnergyAssetType; amount: number }>
  } {
    const position = this.getUserPosition('farm', farmId)
    if (!position) {
      return { success: false, rewards: [] }
    }

    const rewards = position.unclaimedRewards.map(reward => ({ ...reward }))
    position.unclaimedRewards = position.unclaimedRewards.map(reward => ({
      ...reward,
      amount: 0
    }))
    position.lastUpdated = Date.now()

    return { success: true, rewards }
  }

  public getPoolMetrics(): {
    totalTVL: number
    totalVolume24h: number
    totalFees24h: number
    averageAPR: number
    mostActivePool: string
  } {
    const pools = this.getAllPools()
    const totalTVL = pools.reduce((sum, pool) => sum + pool.tvl, 0)
    const totalVolume24h = pools.reduce((sum, pool) => sum + pool.volume24h, 0)
    const totalFees24h = pools.reduce((sum, pool) => sum + pool.fees24h, 0)
    const averageAPR = pools.reduce((sum, pool) => sum + pool.apr, 0) / pools.length
    
    const mostActivePool = pools.reduce((max, pool) => 
      pool.volume24h > max.volume24h ? pool : max, pools[0])

    return {
      totalTVL,
      totalVolume24h,
      totalFees24h,
      averageAPR,
      mostActivePool: mostActivePool?.id || ''
    }
  }

  public getFarmMetrics(): {
    totalStaked: number
    totalRewardsAPR: number
    activeFarms: number
    averageMultiplier: number
  } {
    const farms = this.getAllFarms().filter(farm => farm.isActive)
    const totalStaked = farms.reduce((sum, farm) => sum + farm.totalStaked, 0)
    const totalRewardsAPR = farms.reduce((sum, farm) => 
      sum + farm.rewardTokens.reduce((rewardSum, reward) => rewardSum + reward.apr, 0), 0
    )
    const averageMultiplier = farms.reduce((sum, farm) => sum + farm.multiplier, 0) / farms.length

    return {
      totalStaked,
      totalRewardsAPR,
      activeFarms: farms.length,
      averageMultiplier
    }
  }

  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }
}
