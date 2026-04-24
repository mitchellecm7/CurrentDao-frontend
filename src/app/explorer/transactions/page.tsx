'use client'

import React, { useState } from 'react'
import { useBlockchainExplorer } from '@/hooks/useBlockchainExplorer'
import { TransactionFilter } from '@/types/explorer'
import { TransactionHistory } from '@/components/explorer/TransactionHistory'
import { TransactionDetails } from '@/components/explorer/TransactionDetails'
import { AdvancedFilter } from '@/components/explorer/AdvancedFilter'
import { StatusTracker } from '@/components/explorer/StatusTracker'
import { NetworkStats } from '@/components/explorer/NetworkStats'
import { ArrowLeft, RefreshCw, Filter } from 'lucide-react'

export default function TransactionsPage() {
  const {
    transactions,
    networkStats,
    loading,
    error,
    filteredTransactions,
    filter,
    setFilter,
    refreshTransactions,
    refreshNetworkStats
  } = useBlockchainExplorer()

  const [selectedTransaction, setSelectedTransaction] = useState<typeof transactions[0] | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (newFilter: TransactionFilter) => {
    setFilter(newFilter)
  }

  const handleClearFilters = () => {
    setFilter({})
  }

  const handleTransactionSelect = (transaction: typeof transactions[0]) => {
    setSelectedTransaction(transaction)
  }

  const handleCloseDetails = () => {
    setSelectedTransaction(null)
  }

  const handleRefresh = () => {
    refreshTransactions()
    refreshNetworkStats()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Transaction Explorer
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {Object.keys(filter).length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                    {Object.keys(filter).length}
                  </span>
                )}
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            {showFilters && (
              <AdvancedFilter
                filter={filter}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error loading data
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction History */}
            <TransactionHistory
              transactions={filteredTransactions}
              loading={loading}
              onTransactionSelect={handleTransactionSelect}
            />

            {/* Transaction Details Modal */}
            {selectedTransaction && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <TransactionDetails
                    transaction={selectedTransaction}
                    onClose={handleCloseDetails}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Network Stats */}
            <NetworkStats
              stats={networkStats}
              loading={loading}
            />

            {/* Status Tracker */}
            <StatusTracker
              transactions={filteredTransactions}
            />

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Transactions</span>
                  <span className="font-semibold">{filteredTransactions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Filtered Results</span>
                  <span className="font-semibold">
                    {transactions.length > 0 
                      ? `${Math.round((filteredTransactions.length / transactions.length) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-500">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
