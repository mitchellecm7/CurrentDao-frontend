export interface StakingPosition {
  id: string
  protocol: string
  stakedToken: string
  stakedAmount: number
  currentAPY: number
  accumulatedRewards: number
  rewardToken: string
  stakeDate: string
  lockPeriod?: number
  autoCompound: boolean
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH'
  contractAddress: string
  isActive: boolean
  historicalAPY: APYDataPoint[]
}

export interface APYDataPoint {
  date: string
  apy: number
}

export interface StakingProtocol {
  id: string
  name: string
  description: string
  contractAddress: string
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH'
  supportedTokens: string[]
  baseAPY: number
  lockPeriodOptions: number[]
  autoCompoundSupported: boolean
  performanceFee: number
  minimumStake: number
  isActive: boolean
  icon?: string
}

export interface RewardBreakdown {
  token: string
  amount: number
  valueUSD: number
  apy: number
}

export interface EarningsCalculation {
  principal: number
  apy: number
  compoundFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  timeHorizon: number // in days
  projectedEarnings: number
  totalValue: number
  breakdown: {
    period: string
    earnings: number
    totalValue: number
  }[]
}

export interface SorobanContract {
  contractId: string
  network: 'mainnet' | 'testnet'
  protocol: string
  functions: {
    stake: string
    unstake: string
    claimRewards: string
    getAPY: string
    getPosition: string
  }
}

export interface RiskMetrics {
  overall: 'LOW' | 'MEDIUM' | 'HIGH'
  factors: {
    smartContractRisk: number
    protocolRisk: number
    marketRisk: number
    liquidityRisk: number
  }
  score: number
  recommendation: string
}
