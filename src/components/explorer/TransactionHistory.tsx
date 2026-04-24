'use client'

import React, { useState } from 'react'
import { Transaction, ExportOptions } from '@/types/explorer'
import { 
  getTransactionTypeLabel, 
  getStatusColor, 
  formatTransactionAmount,
  exportToCSV,
  exportToPDF
} from '@/utils/explorerHelpers'
import { 
  Eye, 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter
} from 'lucide-react'

interface TransactionHistoryProps {
  transactions: Transaction[]
  loading?: boolean
  onTransactionSelect?: (transaction: Transaction) => void
  className?: string
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  loading = false,
  onTransactionSelect,
  className = ''
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv')
  const [showExportOptions, setShowExportOptions] = useState(false)
  
  const transactionsPerPage = 10
  const totalPages = Math.ceil(transactions.length / transactionsPerPage)
  
  const startIndex = (currentPage - 1) * transactionsPerPage
  const endIndex = startIndex + transactionsPerPage
  const currentTransactions = transactions.slice(startIndex, endIndex)

  const handleExport = async (format: 'csv' | 'pdf') => {
    const transactionsToExport = selectedTransactions.length > 0
      ? transactions.filter(tx => selectedTransactions.includes(tx.id))
      : transactions

    const exportOptions: ExportOptions = {
      format,
      includeDetails: true,
      includeMetadata: true
    }

    if (format === 'csv') {
      exportToCSV(transactionsToExport, exportOptions)
    } else {
      await exportToPDF(transactionsToExport, exportOptions)
    }
    
    setShowExportOptions(false)
    setSelectedTransactions([])
  }

  const handleTransactionSelect = (transaction: Transaction) => {
    if (onTransactionSelect) {
      onTransactionSelect(transaction)
    }
  }

  const handleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions(prev =>
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    )
  }

  const handleSelectAll = () => {
    if (selectedTransactions.length === currentTransactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(currentTransactions.map(tx => tx.id))
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Transaction History</h3>
            <p className="text-sm text-gray-500 mt-1">
              Showing {transactions.length} transactions
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Export Button */}
            <div className="relative">
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              
              {showExportOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="p-2">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      Export as PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      {selectedTransactions.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedTransactions.length} transaction{selectedTransactions.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedTransactions([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedTransactions.length === currentTransactions.length && currentTransactions.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From/To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.includes(transaction.id)}
                    onChange={() => handleSelectTransaction(transaction.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div>{new Date(transaction.timestamp).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getTransactionTypeLabel(transaction.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">
                    {formatTransactionAmount(transaction.amount, transaction.asset.code)}
                  </div>
                  <div className="text-xs text-gray-500">{transaction.asset.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="max-w-xs truncate">
                    <div className="font-mono text-xs">
                      {transaction.from.substring(0, 8)}...
                    </div>
                    <div className="font-mono text-xs text-gray-500">
                      → {transaction.to.substring(0, 8)}...
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.fee} stroops
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTransactionSelect(transaction)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={`https://stellar.expert/explorer/public/tx/${transaction.stellarTransactionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                      title="View in Explorer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {transactions.length === 0 && !loading && (
        <div className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-500">
            Your transaction history will appear here once you start making transactions.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, transactions.length)} of{' '}
              {transactions.length} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1
                  const isCurrent = page === currentPage
                  const isNearCurrent = Math.abs(page - currentPage) <= 2
                  const isFirstOrLast = page === 1 || page === totalPages
                  
                  if (!isNearCurrent && !isFirstOrLast && totalPages > 7) {
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span key={page} className="px-3 py-1 text-sm text-gray-500">
                          ...
                        </span>
                      )
                    }
                    return null
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
