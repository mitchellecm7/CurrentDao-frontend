'use client'

import React, { useState } from 'react'
import { BatchTransaction, BatchTransactionGroup } from '@/types/gas'
import { formatFee, formatTime } from '@/utils/gasCalculations'
import { Plus, Trash2, Play, Pause, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'

interface BatchTransactionsProps {
  batches: BatchTransactionGroup[]
  onCreateBatch?: (transactions: BatchTransaction[]) => void
  onExecuteBatch?: (batchId: string) => void
  onCancelBatch?: (batchId: string) => void
  className?: string
}

export const BatchTransactions: React.FC<BatchTransactionsProps> = ({ 
  batches,
  onCreateBatch,
  onExecuteBatch,
  onCancelBatch,
  className = ''
}) => {
  const [selectedTransactions, setSelectedTransactions] = useState<BatchTransaction[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    type: 'payment' as BatchTransaction['type'],
    recipient: '',
    amount: '',
    data: ''
  })

  const handleAddTransaction = () => {
    if (newTransaction.recipient && (newTransaction.amount || newTransaction.type === 'contract_call')) {
      const transaction: BatchTransaction = {
        id: Date.now().toString(),
        type: newTransaction.type,
        recipient: newTransaction.recipient,
        amount: newTransaction.amount || undefined,
        data: newTransaction.data || undefined,
        estimatedGas: newTransaction.type === 'payment' ? 21000 : 50000
      }
      
      setSelectedTransactions([...selectedTransactions, transaction])
      setNewTransaction({
        type: 'payment',
        recipient: '',
        amount: '',
        data: ''
      })
    }
  }

  const handleRemoveTransaction = (id: string) => {
    setSelectedTransactions(selectedTransactions.filter(tx => tx.id !== id))
  }

  const handleCreateBatch = () => {
    if (selectedTransactions.length > 0 && onCreateBatch) {
      onCreateBatch(selectedTransactions)
      setSelectedTransactions([])
      setShowCreateForm(false)
    }
  }

  const getStatusIcon = (status: BatchTransactionGroup['status']) => {
    switch (status) {
      case 'draft':
        return Clock
      case 'pending':
        return Play
      case 'executing':
        return Pause
      case 'completed':
        return CheckCircle
      case 'failed':
        return XCircle
      default:
        return Clock
    }
  }

  const getStatusColor = (status: BatchTransactionGroup['status']) => {
    switch (status) {
      case 'draft':
        return 'text-gray-600 bg-gray-100'
      case 'pending':
        return 'text-blue-600 bg-blue-100'
      case 'executing':
        return 'text-yellow-600 bg-yellow-100'
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const totalGas = selectedTransactions.reduce((sum, tx) => sum + tx.estimatedGas, 0)
  const estimatedFee = totalGas * 0.00000002 // Rough estimate

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ArrowRight className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold">Batch Transactions</h3>
        </div>
        
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Batch
        </button>
      </div>

      {/* Create Batch Form */}
      {showCreateForm && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-4">Create New Batch</h4>
          
          {/* Transaction Form */}
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as BatchTransaction['type']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="payment">Payment</option>
                  <option value="contract_call">Contract Call</option>
                  <option value="token_transfer">Token Transfer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={newTransaction.recipient}
                  onChange={(e) => setNewTransaction({...newTransaction, recipient: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0x..."
                />
              </div>
              
              {(newTransaction.type === 'payment' || newTransaction.type === 'token_transfer') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="text"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              )}
              
              {newTransaction.type === 'contract_call' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Call Data (optional)
                  </label>
                  <input
                    type="text"
                    value={newTransaction.data}
                    onChange={(e) => setNewTransaction({...newTransaction, data: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0x..."
                  />
                </div>
              )}
            </div>
            
            <button
              onClick={handleAddTransaction}
              disabled={!newTransaction.recipient}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Transaction
            </button>
          </div>

          {/* Selected Transactions */}
          {selectedTransactions.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-gray-700">
                  Selected Transactions ({selectedTransactions.length})
                </h5>
                <div className="text-sm text-gray-600">
                  Est. Gas: {totalGas.toLocaleString()} | Est. Fee: {formatFee(estimatedFee)}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {selectedTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{tx.type.replace('_', ' ')}</div>
                      <div className="text-xs text-gray-600">
                        To: {tx.recipient.substring(0, 10)}...
                        {tx.amount && ` | Amount: ${tx.amount}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveTransaction(tx.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleCreateBatch}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Batch ({selectedTransactions.length} transactions)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Existing Batches */}
      <div className="space-y-4">
        {batches.map((batch) => {
          const StatusIcon = getStatusIcon(batch.status)
          const statusColor = getStatusColor(batch.status)
          
          return (
            <div key={batch.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <StatusIcon className={`w-5 h-5 mr-2 ${statusColor.split(' ')[0]}`} />
                  <div>
                    <h4 className="font-medium">{batch.name}</h4>
                    <div className="text-sm text-gray-600">
                      {batch.transactions.length} transactions | Created {formatTime(Date.now() - batch.createdAt.getTime())} ago
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                    {batch.status}
                  </span>
                  
                  {batch.status === 'draft' && onExecuteBatch && (
                    <button
                      onClick={() => onExecuteBatch(batch.id)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  
                  {(batch.status === 'pending' || batch.status === 'executing') && onCancelBatch && (
                    <button
                      onClick={() => onCancelBatch(batch.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Batch Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Gas:</span>
                  <span className="ml-2 font-medium">{batch.totalGas.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Est. Fee:</span>
                  <span className="ml-2 font-medium">{formatFee(batch.totalFee)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Avg per Tx:</span>
                  <span className="ml-2 font-medium">
                    {formatFee(batch.totalFee / batch.transactions.length)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Savings:</span>
                  <span className="ml-2 font-medium text-green-600">~15%</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              {(batch.status === 'executing' || batch.status === 'completed') && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {batch.status === 'completed' ? '100%' : '45%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: batch.status === 'completed' ? '100%' : '45%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {batches.length === 0 && !showCreateForm && (
        <div className="text-center text-gray-500 py-8">
          <ArrowRight className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No batch transactions created yet</p>
          <p className="text-sm">Create a batch to save on gas fees</p>
        </div>
      )}

      {/* Benefits */}
      <div className="mt-6 p-4 bg-purple-50 rounded-lg">
        <h5 className="text-sm font-medium text-purple-800 mb-2">Batch Benefits</h5>
        <ul className="space-y-1 text-sm text-purple-700">
          <li>• Save up to 30% on gas fees by batching transactions</li>
          <li>• Execute multiple operations in a single transaction</li>
          <li>• Reduce blockchain congestion and network load</li>
          <li>• Simplify complex multi-step operations</li>
        </ul>
      </div>
    </div>
  )
}
