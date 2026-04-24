export interface GasFeeEstimate {
  baseFee: number
  priorityFee: number
  maxFee: number
  estimatedTime: number // in seconds
  confidence: number // 0-100
  networkCongestion: 'low' | 'medium' | 'high'
  timestamp: Date
}

export interface FeeOptimization {
  originalFee: number
  optimizedFee: number
  savings: number
  savingsPercentage: number
  recommendations: string[]
  strategy: 'slow' | 'standard' | 'fast' | 'max'
}

export interface SpeedCostOption {
  id: string
  name: string
  description: string
  fee: number
  estimatedTime: number
  confidence: number
  color: string
  icon: 'turtle' | 'rabbit' | 'cheetah' | 'rocket'
}

export interface HistoricalFeeData {
  timestamp: Date
  baseFee: number
  priorityFee: number
  networkCongestion: 'low' | 'medium' | 'high'
  blockNumber?: number
}

export interface FeeAlert {
  id: string
  type: 'optimal_window' | 'congestion_spike' | 'fee_drop'
  message: string
  timestamp: Date
  acknowledged: boolean
  feeData?: GasFeeEstimate
}

export interface BatchTransaction {
  id: string
  type: 'payment' | 'contract_call' | 'token_transfer'
  recipient: string
  amount?: string
  data?: string
  estimatedGas: number
}

export interface BatchTransactionGroup {
  id: string
  name: string
  transactions: BatchTransaction[]
  totalGas: number
  totalFee: number
  status: 'draft' | 'pending' | 'executing' | 'completed' | 'failed'
  createdAt: Date
  executedAt?: Date
}

export interface GasCalculatorInputs {
  gasLimit: number
  gasPrice: number
  priorityFee?: number
  complexity: 'simple' | 'medium' | 'complex'
  network: 'mainnet' | 'testnet'
}

export interface GasCalculatorResult {
  totalFee: number
  breakdown: {
    baseFee: number
    priorityFee: number
    l1Fee?: number
  }
  estimatedTime: number
  recommendations: string[]
}
