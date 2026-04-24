'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Transaction, NetworkStats, TransactionFilter } from '@/types/explorer'
import { filterTransactions } from '@/utils/explorerHelpers'

interface UseBlockchainExplorerReturn {
  transactions: Transaction[]
  networkStats: NetworkStats | null
  loading: boolean
  error: string | null
  filteredTransactions: Transaction[]
  filter: TransactionFilter
  setFilter: (filter: TransactionFilter) => void
  refreshTransactions: () => void
  refreshNetworkStats: () => void
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    hash: '0x1234567890abcdef1234567890abcdef12345678',
    stellarTransactionId: '1234567890abcdef1234567890abcdef12345678',
    type: 'payment',
    status: 'confirmed',
    from: 'GD5QJL6Y3X...',
    to: 'GB5XVA3JHK...',
    amount: '100.0000000',
    asset: { code: 'XLM' },
    fee: 100,
    timestamp: new Date('2024-03-28T10:30:00Z'),
    memo: 'Payment for services',
    operations: [
      {
        id: 'op1',
        type: 'payment',
        sourceAccount: 'GD5QJL6Y3X...',
        amount: '100.0000000',
        asset: { code: 'XLM' },
        destination: 'GB5XVA3JHK...'
      }
    ],
    network: 'mainnet',
    blockHeight: 123456,
    ledgerSequence: 123456,
    metadata: { source: 'web' }
  },
  {
    id: '2',
    hash: '0x2345678901bcdef12345678901bcdef12345678',
    stellarTransactionId: '2345678901bcdef12345678901bcdef12345678',
    type: 'create_account',
    status: 'confirmed',
    from: 'GD5QJL6Y3X...',
    to: 'GC5XVA3JHK...',
    amount: '1.5000000',
    asset: { code: 'XLM' },
    fee: 100,
    timestamp: new Date('2024-03-28T09:15:00Z'),
    operations: [
      {
        id: 'op2',
        type: 'create_account',
        sourceAccount: 'GD5QJL6Y3X...',
        amount: '1.5000000',
        asset: { code: 'XLM' },
        destination: 'GC5XVA3JHK...'
      }
    ],
    network: 'mainnet',
    blockHeight: 123455,
    ledgerSequence: 123455
  },
  {
    id: '3',
    hash: '0x3456789012cdef123456789012cdef12345678',
    stellarTransactionId: '3456789012cdef123456789012cdef12345678',
    type: 'payment',
    status: 'pending',
    from: 'GB5XVA3JHK...',
    to: 'GD5QJL6Y3X...',
    amount: '50.0000000',
    asset: { code: 'USDC' },
    fee: 100,
    timestamp: new Date('2024-03-28T11:00:00Z'),
    operations: [
      {
        id: 'op3',
        type: 'payment',
        sourceAccount: 'GB5XVA3JHK...',
        amount: '50.0000000',
        asset: { code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' },
        destination: 'GD5QJL6Y3X...'
      }
    ],
    network: 'mainnet',
    metadata: { priority: 'high' }
  }
]

const mockNetworkStats: NetworkStats = {
  networkStatus: 'online',
  currentLedger: 123456,
  latestLedger: 123456,
  ledgerCloseTime: 5000,
  transactionCount: 1500,
  operationsCount: 3200,
  accountsCount: 50000,
  baseFee: 100,
  baseReserve: 0.5,
  maxTxSetSize: 100,
  protocolVersion: 20
}

export const useBlockchainExplorer = (): UseBlockchainExplorerReturn => {
  const [filter, setFilter] = useState<TransactionFilter>({})

  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockTransactions
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000 // 1 minute
  })

  const {
    data: networkStats = null,
    isLoading: networkStatsLoading,
    error: networkStatsError,
    refetch: refetchNetworkStats
  } = useQuery({
    queryKey: ['networkStats'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockNetworkStats
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000 // 30 seconds
  })

  const filteredTransactions = filterTransactions(transactions, filter)

  const loading = transactionsLoading || networkStatsLoading
  const error = transactionsError?.message || networkStatsError?.message || null

  const refreshTransactions = useCallback(() => {
    refetchTransactions()
  }, [refetchTransactions])

  const refreshNetworkStats = useCallback(() => {
    refetchNetworkStats()
  }, [refetchNetworkStats])

  return {
    transactions,
    networkStats,
    loading,
    error,
    filteredTransactions,
    filter,
    setFilter,
    refreshTransactions,
    refreshNetworkStats
  }
}
