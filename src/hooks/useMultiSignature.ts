'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  MultiSigWallet,
  MultiSigTransaction,
  MultiSigProposal,
  Signer,
  MultiSigActivity,
  MultiSigStats,
  CreateWalletRequest,
  CreateTransactionRequest,
  BatchMultiSigRequest
} from '@/types/multisig'
import { 
  generateMockWallet,
  generateMockTransaction,
  generateMockProposal,
  createSignature,
  addSignatureToTransaction,
  validateTransactionRequest,
  validateWalletCreation,
  createActivityLog,
  getWalletStats
} from '@/utils/multisigHelpers'

interface UseMultiSignatureReturn {
  // Data
  wallets: MultiSigWallet[]
  transactions: MultiSigTransaction[]
  proposals: MultiSigProposal[]
  activities: MultiSigActivity[]
  stats: MultiSigStats
  currentWallet: MultiSigWallet | null
  
  // Loading states
  loading: boolean
  error: string | null
  
  // Actions
  selectWallet: (walletId: string) => void
  createWallet: (request: CreateWalletRequest) => Promise<void>
  createTransaction: (request: CreateTransactionRequest) => Promise<void>
  createBatchTransaction: (request: BatchMultiSigRequest) => Promise<void>
  signTransaction: (transactionId: string, signerAddress: string) => Promise<void>
  executeTransaction: (transactionId: string) => Promise<void>
  rejectTransaction: (transactionId: string) => Promise<void>
  addSigner: (walletId: string, signer: Omit<Signer, 'id' | 'joinedAt' | 'lastSignedAt'>) => Promise<void>
  removeSigner: (walletId: string, signerId: string) => Promise<void>
  updateThreshold: (walletId: string, threshold: number) => Promise<void>
  
  // Utility functions
  refreshData: () => void
  getWalletTransactions: (walletId: string) => MultiSigTransaction[]
  getWalletProposals: (walletId: string) => MultiSigProposal[]
  getPendingTransactions: (walletId: string) => MultiSigTransaction[]
}

// Mock data for demonstration
const mockSigners: Signer[] = [
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

const currentUserAddress = '0x1234567890123456789012345678901234567890' // Alice's address

export const useMultiSignature = (): UseMultiSignatureReturn => {
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)
  const [wallets, setWallets] = useState<MultiSigWallet[]>([])
  const [transactions, setTransactions] = useState<MultiSigTransaction[]>([])
  const [proposals, setProposals] = useState<MultiSigProposal[]>([])
  const [activities, setActivities] = useState<MultiSigActivity[]>([])

  // Fetch wallets
  const {
    data: walletsData = [],
    isLoading: walletsLoading,
    error: walletsError,
    refetch: refetchWallets
  } = useQuery({
    queryKey: ['multisig-wallets'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return [
        generateMockWallet('wallet-1'),
        generateMockWallet('wallet-2'),
        generateMockWallet('wallet-3')
      ]
    },
    staleTime: 30000,
    refetchInterval: 60000
  })

  // Fetch transactions
  const {
    data: transactionsData = [],
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['multisig-transactions'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600))
      return Array.from({ length: 15 }, (_, i) => 
        generateMockTransaction(`wallet-${(i % 3) + 1}`)
      )
    },
    staleTime: 30000,
    refetchInterval: 60000
  })

  // Fetch proposals
  const {
    data: proposalsData = [],
    isLoading: proposalsLoading,
    error: proposalsError,
    refetch: refetchProposals
  } = useQuery({
    queryKey: ['multisig-proposals'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 400))
      return Array.from({ length: 5 }, (_, i) => 
        generateMockProposal(`wallet-${(i % 3) + 1}`)
      )
    },
    staleTime: 30000,
    refetchInterval: 60000
  })

  // Fetch activities
  const {
    data: activitiesData = [],
    isLoading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities
  } = useQuery({
    queryKey: ['multisig-activities'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return Array.from({ length: 20 }, (_, i) => 
        createActivityLog(
          `wallet-${(i % 3) + 1}`,
          ['transaction_created', 'transaction_signed', 'transaction_executed'][i % 3] as any,
          mockSigners[i % 3].address,
          mockSigners[i % 3].name,
          `Activity ${i + 1}`
        )
      )
    },
    staleTime: 30000,
    refetchInterval: 60000
  })

  // Update local state when data changes
  useEffect(() => {
    setWallets(walletsData)
  }, [walletsData])

  useEffect(() => {
    setTransactions(transactionsData)
  }, [transactionsData])

  useEffect(() => {
    setProposals(proposalsData)
  }, [proposalsData])

  useEffect(() => {
    setActivities(activitiesData)
  }, [activitiesData])

  // Calculate stats
  const stats: MultiSigStats = {
    totalWallets: wallets.length,
    activeWallets: wallets.filter(w => w.isActive).length,
    totalTransactions: transactions.length,
    pendingTransactions: transactions.filter(t => t.status === 'pending').length,
    executedTransactions: transactions.filter(t => t.status === 'executed').length,
    totalSigners: wallets.reduce((sum, w) => sum + w.signers.length, 0),
    activeSigners: wallets.reduce((sum, w) => sum + w.signers.filter(s => s.isActive).length, 0),
    averageExecutionTime: 2.5, // Mock value
    successRate: transactions.length > 0 ? (transactions.filter(t => t.status === 'executed').length / transactions.length) * 100 : 0
  }

  const currentWallet = selectedWalletId 
    ? wallets.find(w => w.id === selectedWalletId) || null
    : wallets[0] || null

  const loading = walletsLoading || transactionsLoading || proposalsLoading || activitiesLoading
  const error = walletsError?.message || transactionsError?.message || proposalsError?.message || activitiesError?.message || null

  const selectWallet = useCallback((walletId: string) => {
    setSelectedWalletId(walletId)
  }, [])

  const createWallet = useCallback(async (request: CreateWalletRequest) => {
    const errors = validateWalletCreation(request)
    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newWallet: MultiSigWallet = {
      id: `wallet-${Date.now()}`,
      name: request.name,
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      threshold: request.threshold,
      signers: request.signers.map((signer, index) => ({
        ...signer,
        id: `signer-${Date.now()}-${index}`,
        joinedAt: new Date()
      })),
      balance: '0.00',
      asset: 'XLM',
      createdAt: new Date(),
      isActive: true,
      description: request.description
    }

    setWallets(prev => [...prev, newWallet])
    setActivities(prev => [
      createActivityLog(
        newWallet.id,
        'signer_added',
        currentUserAddress,
        'Alice',
        'Multi-signature wallet created',
        newWallet.address
      ),
      ...prev
    ])
  }, [])

  const createTransaction = useCallback(async (request: CreateTransactionRequest) => {
    const wallet = wallets.find(w => w.id === request.walletId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    const errors = validateTransactionRequest(request, wallet)
    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    const newTransaction: MultiSigTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(16).substr(2, 8)}`,
      walletId: request.walletId,
      type: request.type,
      to: request.to,
      amount: request.amount,
      asset: request.asset || 'XLM',
      data: request.data,
      creator: currentUserAddress,
      createdAt: new Date(),
      expiresAt: request.expiresAt,
      status: 'pending',
      signatures: [],
      requiredSignatures: wallet.threshold,
      totalWeight: wallet.signers.reduce((sum, s) => sum + s.weight, 0),
      currentWeight: 0,
      description: request.description,
      networkFee: '0.0000100'
    }

    setTransactions(prev => [newTransaction, ...prev])
    setActivities(prev => [
      createActivityLog(
        request.walletId,
        'transaction_created',
        currentUserAddress,
        'Alice',
        `Created ${request.type} transaction`,
        newTransaction.id
      ),
      ...prev
    ])
  }, [wallets])

  const createBatchTransaction = useCallback(async (request: BatchMultiSigRequest) => {
    const wallet = wallets.find(w => w.id === request.walletId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    // Validate all transactions
    for (const txRequest of request.transactions) {
      const errors = validateTransactionRequest(txRequest, wallet)
      if (errors.length > 0) {
        throw new Error(`Transaction validation failed: ${errors.join(', ')}`)
      }
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200))

    const newTransactions = request.transactions.map((txRequest, index) => ({
      id: `batch-tx-${Date.now()}-${index}`,
      walletId: request.walletId,
      type: txRequest.type,
      to: txRequest.to,
      amount: txRequest.amount,
      asset: txRequest.asset || 'XLM',
      data: txRequest.data,
      creator: currentUserAddress,
      createdAt: new Date(),
      expiresAt: txRequest.expiresAt,
      status: 'pending' as const,
      signatures: [],
      requiredSignatures: wallet.threshold,
      totalWeight: wallet.signers.reduce((sum, s) => sum + s.weight, 0),
      currentWeight: 0,
      description: request.description || `Batch transaction ${index + 1}`,
      networkFee: '0.0000100'
    }))

    setTransactions(prev => [...newTransactions, ...prev])
    setActivities(prev => [
      createActivityLog(
        request.walletId,
        'transaction_created',
        currentUserAddress,
        'Alice',
        `Created batch with ${request.transactions.length} transactions`,
        newTransactions[0].id
      ),
      ...prev
    ])
  }, [wallets])

  const signTransaction = useCallback(async (transactionId: string, signerAddress: string) => {
    const transaction = transactions.find(t => t.id === transactionId)
    if (!transaction) {
      throw new Error('Transaction not found')
    }

    const wallet = wallets.find(w => w.id === transaction.walletId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    const signer = wallet.signers.find(s => s.address === signerAddress && s.isActive)
    if (!signer) {
      throw new Error('Signer not found or inactive')
    }

    // Check if already signed
    if (transaction.signatures.some(sig => sig.signerAddress === signerAddress)) {
      throw new Error('Transaction already signed by this signer')
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600))

    const signature = createSignature(signer, transactionId)
    const updatedTransaction = addSignatureToTransaction(transaction, signature)

    setTransactions(prev => 
      prev.map(t => t.id === transactionId ? updatedTransaction : t)
    )

    setActivities(prev => [
      createActivityLog(
        transaction.walletId,
        'transaction_signed',
        signerAddress,
        signer.name,
        `Signed transaction`,
        transactionId
      ),
      ...prev
    ])
  }, [transactions, wallets])

  const executeTransaction = useCallback(async (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId)
    if (!transaction) {
      throw new Error('Transaction not found')
    }

    if (transaction.status !== 'signed') {
      throw new Error('Transaction must be fully signed before execution')
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const executedTransaction = {
      ...transaction,
      status: 'executed' as const
    }

    setTransactions(prev => 
      prev.map(t => t.id === transactionId ? executedTransaction : t)
    )

    setActivities(prev => [
      createActivityLog(
        transaction.walletId,
        'transaction_executed',
        currentUserAddress,
        'Alice',
        `Executed transaction`,
        transactionId
      ),
      ...prev
    ])
  }, [transactions])

  const rejectTransaction = useCallback(async (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId)
    if (!transaction) {
      throw new Error('Transaction not found')
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const rejectedTransaction = {
      ...transaction,
      status: 'failed' as const
    }

    setTransactions(prev => 
      prev.map(t => t.id === transactionId ? rejectedTransaction : t)
    )

    setActivities(prev => [
      createActivityLog(
        transaction.walletId,
        'transaction_executed',
        currentUserAddress,
        'Alice',
        `Rejected transaction`,
        transactionId
      ),
      ...prev
    ])
  }, [transactions])

  const addSigner = useCallback(async (walletId: string, signerData: Omit<Signer, 'id' | 'joinedAt' | 'lastSignedAt'>) => {
    const wallet = wallets.find(w => w.id === walletId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    // Check for duplicate address
    if (wallet.signers.some(s => s.address === signerData.address)) {
      throw new Error('Signer with this address already exists')
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    const newSigner: Signer = {
      ...signerData,
      id: `signer-${Date.now()}`,
      joinedAt: new Date()
    }

    const updatedWallet = {
      ...wallet,
      signers: [...wallet.signers, newSigner]
    }

    setWallets(prev => 
      prev.map(w => w.id === walletId ? updatedWallet : w)
    )

    setActivities(prev => [
      createActivityLog(
        walletId,
        'signer_added',
        currentUserAddress,
        'Alice',
        `Added signer ${newSigner.name}`,
        newSigner.address
      ),
      ...prev
    ])
  }, [wallets])

  const removeSigner = useCallback(async (walletId: string, signerId: string) => {
    const wallet = wallets.find(w => w.id === walletId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    const signer = wallet.signers.find(s => s.id === signerId)
    if (!signer) {
      throw new Error('Signer not found')
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600))

    const updatedWallet = {
      ...wallet,
      signers: wallet.signers.filter(s => s.id !== signerId)
    }

    setWallets(prev => 
      prev.map(w => w.id === walletId ? updatedWallet : w)
    )

    setActivities(prev => [
      createActivityLog(
        walletId,
        'signer_removed',
        currentUserAddress,
        'Alice',
        `Removed signer ${signer.name}`,
        signer.address
      ),
      ...prev
    ])
  }, [wallets])

  const updateThreshold = useCallback(async (walletId: string, threshold: number) => {
    const wallet = wallets.find(w => w.id === walletId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    const totalWeight = wallet.signers.filter(s => s.isActive).reduce((sum, s) => sum + s.weight, 0)
    if (threshold > totalWeight) {
      throw new Error('Threshold cannot exceed total active signer weight')
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const updatedWallet = {
      ...wallet,
      threshold
    }

    setWallets(prev => 
      prev.map(w => w.id === walletId ? updatedWallet : w)
    )

    setActivities(prev => [
      createActivityLog(
        walletId,
        'settings_updated',
        currentUserAddress,
        'Alice',
        `Updated threshold to ${threshold}`
      ),
      ...prev
    ])
  }, [wallets])

  const refreshData = useCallback(() => {
    refetchWallets()
    refetchTransactions()
    refetchProposals()
    refetchActivities()
  }, [refetchWallets, refetchTransactions, refetchProposals, refetchActivities])

  const getWalletTransactions = useCallback((walletId: string) => {
    return transactions.filter(t => t.walletId === walletId)
  }, [transactions])

  const getWalletProposals = useCallback((walletId: string) => {
    return proposals.filter(p => p.walletId === walletId)
  }, [proposals])

  const getPendingTransactions = useCallback((walletId: string) => {
    return transactions.filter(t => t.walletId === walletId && t.status === 'pending')
  }, [transactions])

  return {
    wallets,
    transactions,
    proposals,
    activities,
    stats,
    currentWallet,
    loading,
    error,
    selectWallet,
    createWallet,
    createTransaction,
    createBatchTransaction,
    signTransaction,
    executeTransaction,
    rejectTransaction,
    addSigner,
    removeSigner,
    updateThreshold,
    refreshData,
    getWalletTransactions,
    getWalletProposals,
    getPendingTransactions
  }
}
