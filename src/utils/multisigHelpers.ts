import {
  MultiSigWallet,
  MultiSigTransaction,
  Signer,
  Signature,
  MultiSigProposal,
  ProposalVote,
  MultiSigSettings,
  MultiSigActivity,
  CreateWalletRequest,
  CreateTransactionRequest
} from '@/types/multisig'

export const calculateSignerWeight = (signers: Signer[]): number => {
  return signers.filter(s => s.isActive).reduce((total, signer) => total + signer.weight, 0)
}

export const canExecuteTransaction = (transaction: MultiSigTransaction): boolean => {
  return transaction.currentWeight >= transaction.requiredSignatures
}

export const hasUserSigned = (transaction: MultiSigTransaction, userAddress: string): boolean => {
  return transaction.signatures.some(sig => sig.signerAddress === userAddress && sig.isValid)
}

export const getRemainingSignatures = (transaction: MultiSigTransaction): number => {
  const remainingWeight = transaction.requiredSignatures - transaction.currentWeight
  return Math.max(0, remainingWeight)
}

export const getTransactionProgress = (transaction: MultiSigTransaction): number => {
  return Math.min(100, (transaction.currentWeight / transaction.requiredSignatures) * 100)
}

export const validateTransactionRequest = (request: CreateTransactionRequest, wallet: MultiSigWallet): string[] => {
  const errors: string[] = []
  
  if (!request.to || request.to.trim() === '') {
    errors.push('Recipient address is required')
  }
  
  if (request.type === 'payment' || request.type === 'token_transfer') {
    if (!request.amount || parseFloat(request.amount) <= 0) {
      errors.push('Valid amount is required')
    }
  }
  
  if (request.type === 'contract_call' && !request.data) {
    errors.push('Contract call data is required')
  }
  
  // Check if wallet has sufficient balance (simplified check)
  if (request.amount && wallet.balance && parseFloat(request.amount) > parseFloat(wallet.balance)) {
    errors.push('Insufficient wallet balance')
  }
  
  return errors
}

export const createSignature = (signer: Signer, transactionId: string): Signature => {
  return {
    id: `${signer.id}-${transactionId}-${Date.now()}`,
    signerId: signer.id,
    signerAddress: signer.address,
    signerName: signer.name,
    weight: signer.weight,
    signedAt: new Date(),
    signature: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock signature
    isValid: true
  }
}

export const addSignatureToTransaction = (
  transaction: MultiSigTransaction,
  signature: Signature
): MultiSigTransaction => {
  const existingSignatureIndex = transaction.signatures.findIndex(
    sig => sig.signerAddress === signature.signerAddress
  )
  
  let updatedSignatures: Signature[]
  if (existingSignatureIndex >= 0) {
    updatedSignatures = [...transaction.signatures]
    updatedSignatures[existingSignatureIndex] = signature
  } else {
    updatedSignatures = [...transaction.signatures, signature]
  }
  
  const currentWeight = updatedSignatures
    .filter(sig => sig.isValid)
    .reduce((total, sig) => total + sig.weight, 0)
  
  const status = currentWeight >= transaction.requiredSignatures ? 'signed' : 'pending'
  
  return {
    ...transaction,
    signatures: updatedSignatures,
    currentWeight,
    status
  }
}

export const generateMockWallet = (id: string): MultiSigWallet => {
  const signers: Signer[] = [
    {
      id: 'signer-1',
      address: '0x1234567890123456789012345678901234567890',
      name: 'Alice',
      role: 'owner',
      weight: 2,
      isActive: true,
      joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'signer-2',
      address: '0x2345678901234567890123456789012345678901',
      name: 'Bob',
      role: 'admin',
      weight: 1,
      isActive: true,
      joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'signer-3',
      address: '0x3456789012345678901234567890123456789012',
      name: 'Charlie',
      role: 'signer',
      weight: 1,
      isActive: true,
      joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    }
  ]
  
  return {
    id,
    name: `Multi-Sig Wallet ${id}`,
    address: `0x${Math.random().toString(16).substr(2, 40)}`,
    threshold: 3,
    signers,
    balance: (Math.random() * 10000).toFixed(2),
    asset: 'XLM',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isActive: true,
    description: `Multi-signature wallet for team ${id}`
  }
}

export const generateMockTransaction = (walletId: string): MultiSigTransaction => {
  const types: MultiSigTransaction['type'][] = ['payment', 'contract_call', 'token_transfer', 'custom']
  const statuses: MultiSigTransaction['status'][] = ['pending', 'signed', 'executed']
  
  return {
    id: `tx-${Date.now()}-${Math.random().toString(16).substr(2, 8)}`,
    walletId,
    type: types[Math.floor(Math.random() * types.length)],
    to: `0x${Math.random().toString(16).substr(2, 40)}`,
    amount: Math.random() > 0.5 ? (Math.random() * 1000).toFixed(2) : undefined,
    asset: 'XLM',
    data: Math.random() > 0.7 ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined,
    creator: `0x${Math.random().toString(16).substr(2, 40)}`,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    signatures: [],
    requiredSignatures: 3,
    totalWeight: 4,
    currentWeight: Math.floor(Math.random() * 4),
    description: `Transaction ${Math.floor(Math.random() * 1000)}`,
    networkFee: (Math.random() * 0.01).toFixed(7)
  }
}

export const generateMockProposal = (walletId: string): MultiSigProposal => {
  const statuses: MultiSigProposal['status'][] = ['active', 'approved', 'rejected', 'executed']
  
  return {
    id: `proposal-${Date.now()}-${Math.random().toString(16).substr(2, 8)}`,
    title: `Proposal ${Math.floor(Math.random() * 100)}`,
    description: 'Multi-signature transaction proposal for funding new project',
    proposer: `0x${Math.random().toString(16).substr(2, 40)}`,
    walletId,
    transactions: [
      generateMockTransaction(walletId),
      generateMockTransaction(walletId)
    ],
    votingStartsAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000),
    votingEndsAt: new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    votes: [],
    requiredVotes: 3,
    totalVotes: Math.floor(Math.random() * 5),
    createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
  }
}

export const formatAddress = (address: string, length: number = 8): string => {
  if (!address || address.length < length * 2) return address
  return `${address.substring(0, length)}...${address.substring(address.length - length)}`
}

export const formatTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  
  return date.toLocaleDateString()
}

export const getTransactionStatusColor = (status: MultiSigTransaction['status']): string => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100'
    case 'signed':
      return 'text-blue-600 bg-blue-100'
    case 'executed':
      return 'text-green-600 bg-green-100'
    case 'failed':
      return 'text-red-600 bg-red-100'
    case 'expired':
      return 'text-gray-600 bg-gray-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export const getSignerRoleColor = (role: Signer['role']): string => {
  switch (role) {
    case 'owner':
      return 'text-purple-600 bg-purple-100'
    case 'admin':
      return 'text-blue-600 bg-blue-100'
    case 'signer':
      return 'text-gray-600 bg-gray-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export const createActivityLog = (
  walletId: string,
  type: MultiSigActivity['type'],
  actor: string,
  actorName: string,
  description: string,
  target?: string,
  metadata?: Record<string, any>
): MultiSigActivity => {
  return {
    id: `activity-${Date.now()}-${Math.random().toString(16).substr(2, 8)}`,
    walletId,
    type,
    actor,
    actorName,
    target,
    description,
    metadata: metadata || {},
    timestamp: new Date()
  }
}

export const validateWalletCreation = (request: CreateWalletRequest): string[] => {
  const errors: string[] = []
  
  if (!request.name || request.name.trim() === '') {
    errors.push('Wallet name is required')
  }
  
  if (request.threshold < 1) {
    errors.push('Threshold must be at least 1')
  }
  
  if (request.signers.length < 2) {
    errors.push('At least 2 signers are required')
  }
  
  const totalWeight = request.signers.reduce((sum, signer) => sum + signer.weight, 0)
  if (totalWeight < request.threshold) {
    errors.push('Total signer weight must be greater than or equal to threshold')
  }
  
  const activeSigners = request.signers.filter(s => s.isActive)
  if (activeSigners.length < 2) {
    errors.push('At least 2 active signers are required')
  }
  
  const duplicateAddresses = request.signers
    .map(s => s.address.toLowerCase())
    .filter((addr, index, arr) => arr.indexOf(addr) !== index)
  
  if (duplicateAddresses.length > 0) {
    errors.push('Duplicate signer addresses are not allowed')
  }
  
  return errors
}

export const calculateTransactionFees = (transactions: MultiSigTransaction[]): string => {
  const totalFees = transactions.reduce((sum, tx) => {
    const fee = parseFloat(tx.networkFee || '0')
    return sum + fee
  }, 0)
  
  return totalFees.toFixed(7)
}

export const getWalletStats = (wallet: MultiSigWallet, transactions: MultiSigTransaction[]) => {
  const pendingTransactions = transactions.filter(tx => tx.status === 'pending')
  const executedTransactions = transactions.filter(tx => tx.status === 'executed')
  const failedTransactions = transactions.filter(tx => tx.status === 'failed')
  
  const totalVolume = executedTransactions.reduce((sum, tx) => {
    return sum + parseFloat(tx.amount || '0')
  }, 0)
  
  const averageExecutionTime = executedTransactions.length > 0
    ? executedTransactions.reduce((sum, tx) => {
        const execTime = tx.signatures.length > 0
          ? Math.max(...tx.signatures.map(sig => sig.signedAt.getTime())) - tx.createdAt.getTime()
          : 0
        return sum + execTime
      }, 0) / executedTransactions.length / (1000 * 60 * 60) // Convert to hours
    : 0
  
  return {
    totalTransactions: transactions.length,
    pendingTransactions: pendingTransactions.length,
    executedTransactions: executedTransactions.length,
    failedTransactions: failedTransactions.length,
    successRate: transactions.length > 0 ? (executedTransactions.length / transactions.length) * 100 : 0,
    totalVolume,
    averageExecutionTime,
    activeSigners: wallet.signers.filter(s => s.isActive).length
  }
}
