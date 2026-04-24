export interface MultiSigWallet {
  id: string
  name: string
  address: string
  threshold: number
  signers: Signer[]
  balance: string
  asset: string
  createdAt: Date
  isActive: boolean
  description?: string
}

export interface Signer {
  id: string
  address: string
  name: string
  role: 'owner' | 'admin' | 'signer'
  weight: number
  isActive: boolean
  joinedAt: Date
  lastSignedAt?: Date
}

export interface MultiSigTransaction {
  id: string
  walletId: string
  type: 'payment' | 'contract_call' | 'token_transfer' | 'custom'
  to: string
  amount?: string
  asset?: string
  data?: string
  creator: string
  createdAt: Date
  expiresAt?: Date
  status: 'pending' | 'signed' | 'executed' | 'failed' | 'expired'
  signatures: Signature[]
  requiredSignatures: number
  totalWeight: number
  currentWeight: number
  description?: string
  sequence?: number
  networkFee?: string
}

export interface Signature {
  id: string
  signerId: string
  signerAddress: string
  signerName: string
  weight: number
  signedAt: Date
  signature: string
  isValid: boolean
}

export interface MultiSigProposal {
  id: string
  title: string
  description: string
  proposer: string
  walletId: string
  transactions: MultiSigTransaction[]
  votingStartsAt: Date
  votingEndsAt: Date
  status: 'active' | 'approved' | 'rejected' | 'executed'
  votes: ProposalVote[]
  requiredVotes: number
  totalVotes: number
  createdAt: Date
}

export interface ProposalVote {
  id: string
  voterId: string
  voterAddress: string
  voterName: string
  vote: 'approve' | 'reject'
  weight: number
  votedAt: Date
  reason?: string
}

export interface MultiSigSettings {
  requireProposal: boolean
  votingPeriod: number // in hours
  executionDelay: number // in hours
  maxTransactionAmount: string
  allowedAssets: string[]
  dailyLimit: string
  requireReason: boolean
  autoExecute: boolean
}

export interface TransactionTemplate {
  id: string
  name: string
  description: string
  type: MultiSigTransaction['type']
  template: Partial<MultiSigTransaction>
  isPublic: boolean
  createdBy: string
  usageCount: number
  createdAt: Date
}

export interface MultiSigActivity {
  id: string
  walletId: string
  type: 'transaction_created' | 'transaction_signed' | 'transaction_executed' | 'signer_added' | 'signer_removed' | 'settings_updated'
  actor: string
  actorName: string
  target?: string
  description: string
  metadata: Record<string, any>
  timestamp: Date
}

export interface MultiSigStats {
  totalWallets: number
  activeWallets: number
  totalTransactions: number
  pendingTransactions: number
  executedTransactions: number
  totalSigners: number
  activeSigners: number
  averageExecutionTime: number // in hours
  successRate: number // percentage
}

export interface CreateWalletRequest {
  name: string
  threshold: number
  signers: Omit<Signer, 'id' | 'joinedAt' | 'lastSignedAt'>[]
  description?: string
  settings: MultiSigSettings
}

export interface CreateTransactionRequest {
  walletId: string
  type: MultiSigTransaction['type']
  to: string
  amount?: string
  asset?: string
  data?: string
  description?: string
  expiresAt?: Date
}

export interface BatchMultiSigRequest {
  walletId: string
  transactions: CreateTransactionRequest[]
  description?: string
}
