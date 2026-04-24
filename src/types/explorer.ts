export interface Transaction {
  id: string
  hash: string
  stellarTransactionId: string
  type: 'payment' | 'create_account' | 'manage_data' | 'set_options' | 'change_trust' | 'allow_trust' | 'account_merge' | 'inflation' | 'manage_buy_offer' | 'manage_sell_offer' | 'create_passive_sell_offer' | 'path_payment_strict_receive' | 'path_payment_strict_send'
  status: 'pending' | 'confirmed' | 'failed'
  from: string
  to: string
  amount: string
  asset: {
    code: string
    issuer?: string
  }
  fee: number
  timestamp: Date
  memo?: string
  operations: TransactionOperation[]
  network: 'testnet' | 'mainnet'
  blockHeight?: number
  ledgerSequence?: number
  metadata?: Record<string, any>
}

export interface TransactionOperation {
  id: string
  type: string
  sourceAccount: string
  amount?: string
  asset?: {
    code: string
    issuer?: string
  }
  destination?: string
  price?: string
  sellingAsset?: {
    code: string
    issuer?: string
  }
  buyingAsset?: {
    code: string
    issuer?: string
  }
}

export interface TransactionFilter {
  dateRange?: {
    start: Date
    end: Date
  }
  amountRange?: {
    min: number
    max: number
  }
  types?: Transaction['type'][]
  status?: Transaction['status'][]
  assets?: string[]
  searchQuery?: string
}

export interface NetworkStats {
  networkStatus: 'online' | 'offline' | 'degraded'
  currentLedger: number
  latestLedger: number
  ledgerCloseTime: number
  transactionCount: number
  operationsCount: number
  accountsCount: number
  baseFee: number
  baseReserve: number
  maxTxSetSize: number
  protocolVersion: number
}

export interface ExportOptions {
  format: 'csv' | 'pdf'
  dateRange?: {
    start: Date
    end: Date
  }
  includeDetails?: boolean
  includeMetadata?: boolean
}

export interface BlockchainExplorerLink {
  network: 'testnet' | 'mainnet'
  transactionId: string
  url: string
}
