'use client'

import React, { useState } from 'react'
import { useMultiSignature } from '@/hooks/useMultiSignature'
import { MultiSigWallet, CreateWalletRequest, CreateTransactionRequest } from '@/types/multisig'
import { ArrowLeft, Plus, Users, Clock, CheckCircle, AlertCircle, Settings, RefreshCw } from 'lucide-react'

export default function MultiSignaturePage() {
  const {
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
    signTransaction,
    executeTransaction,
    rejectTransaction,
    refreshData,
    getWalletTransactions,
    getPendingTransactions
  } = useMultiSignature()

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'proposals' | 'activity'>('overview')
  const [showCreateWallet, setShowCreateWallet] = useState(false)
  const [showCreateTransaction, setShowCreateTransaction] = useState(false)

  const handleCreateWallet = async (request: CreateWalletRequest) => {
    try {
      await createWallet(request)
      setShowCreateWallet(false)
    } catch (error) {
      console.error('Failed to create wallet:', error)
    }
  }

  const handleCreateTransaction = async (request: CreateTransactionRequest) => {
    try {
      await createTransaction(request)
      setShowCreateTransaction(false)
    } catch (error) {
      console.error('Failed to create transaction:', error)
    }
  }

  const currentWalletTransactions = currentWallet 
    ? getWalletTransactions(currentWallet.id)
    : []

  const pendingTransactions = currentWallet
    ? getPendingTransactions(currentWallet.id)
    : []

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'transactions', label: 'Transactions', icon: Clock },
    { id: 'proposals', label: 'Proposals', icon: Users },
    { id: 'activity', label: 'Activity', icon: AlertCircle }
  ]

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
                Multi-signature Transactions
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateWallet(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Wallet
              </button>
              
              <button
                onClick={refreshData}
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

      {/* Wallet Selector */}
      {wallets.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 py-4">
              <span className="text-sm font-medium text-gray-700">Selected Wallet:</span>
              <select
                value={currentWallet?.id || ''}
                onChange={(e) => selectWallet(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} ({wallet.balance} {wallet.asset})
                  </option>
                ))}
              </select>
              
              {currentWallet && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Threshold: {currentWallet.threshold}/{currentWallet.signers.reduce((sum, s) => sum + s.weight, 0)}</span>
                  <span>•</span>
                  <span>{currentWallet.signers.filter(s => s.isActive).length} active signers</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-1 py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading multi-signature data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold">{stats.totalWallets}</h3>
                    <p className="text-sm text-gray-600">Total Wallets</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold">{stats.pendingTransactions}</h3>
                    <p className="text-sm text-gray-600">Pending Transactions</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold">{stats.executedTransactions}</h3>
                    <p className="text-sm text-gray-600">Executed Transactions</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold">{stats.activeSigners}</h3>
                    <p className="text-sm text-gray-600">Active Signers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Wallet Info */}
            {currentWallet && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Current Wallet</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{currentWallet.name}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Address:</span>
                    <span className="ml-2 font-mono text-xs">
                      {currentWallet.address.substring(0, 10)}...{currentWallet.address.substring(currentWallet.address.length - 8)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Balance:</span>
                    <span className="ml-2 font-medium">{currentWallet.balance} {currentWallet.asset}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Threshold:</span>
                    <span className="ml-2 font-medium">{currentWallet.threshold}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Signers:</span>
                    <span className="ml-2 font-medium">{currentWallet.signers.length}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowCreateTransaction(true)}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Transaction
                </button>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Transactions</h2>
              <button
                onClick={() => setShowCreateTransaction(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Transaction
              </button>
            </div>
            
            {currentWalletTransactions.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Signatures
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentWalletTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.to.substring(0, 10)}...{transaction.to.substring(transaction.to.length - 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.amount || '-'} {transaction.asset}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'executed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'signed' ? 'bg-blue-100 text-blue-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.currentWeight}/{transaction.requiredSignatures}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {transaction.status === 'pending' && (
                            <button
                              onClick={() => signTransaction(transaction.id, '0x1234567890123456789012345678901234567890')}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Sign
                            </button>
                          )}
                          {transaction.status === 'signed' && (
                            <button
                              onClick={() => executeTransaction(transaction.id)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Execute
                            </button>
                          )}
                          <button
                            onClick={() => rejectTransaction(transaction.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-500 mb-4">Create your first multi-signature transaction to get started</p>
                <button
                  onClick={() => setShowCreateTransaction(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Transaction
                </button>
              </div>
            )}
          </div>
        )}

        {/* Proposals Tab */}
        {activeTab === 'proposals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Proposals</h2>
            </div>
            
            {proposals.length > 0 ? (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">{proposal.title}</h3>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        proposal.status === 'executed' ? 'bg-green-100 text-green-800' :
                        proposal.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        proposal.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {proposal.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{proposal.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{proposal.transactions.length} transactions</span>
                      <span>{proposal.totalVotes}/{proposal.requiredVotes} votes</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
                <p className="text-gray-500">Create proposals for complex multi-signature operations</p>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            
            {activities.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md">
                <div className="divide-y divide-gray-200">
                  {activities.slice(0, 20).map((activity) => (
                    <div key={activity.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            activity.type === 'transaction_executed' ? 'bg-green-500' :
                            activity.type === 'transaction_signed' ? 'bg-blue-500' :
                            activity.type === 'transaction_created' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500">
                              by {activity.actorName} • {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-500">Activity will appear here as you use multi-signature features</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Wallet Modal */}
      {showCreateWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Create Multi-signature Wallet</h2>
              <p className="text-gray-600 mb-6">Set up a new multi-signature wallet with multiple signers and threshold requirements.</p>
              
              <CreateWalletForm
                onSubmit={handleCreateWallet}
                onCancel={() => setShowCreateWallet(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Transaction Modal */}
      {showCreateTransaction && currentWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Create Transaction</h2>
              <p className="text-gray-600 mb-6">Create a new transaction that requires multi-signature approval.</p>
              
              <CreateTransactionForm
                wallet={currentWallet}
                onSubmit={handleCreateTransaction}
                onCancel={() => setShowCreateTransaction(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Create Wallet Form Component
function CreateWalletForm({ onSubmit, onCancel }: { onSubmit: (request: CreateWalletRequest) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    threshold: 2,
    description: ''
  })
  
  const [signers, setSigners] = useState([
    { address: '', name: '', role: 'owner' as const, weight: 1, isActive: true }
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: formData.name,
      threshold: formData.threshold,
      signers: signers.filter(s => s.address),
      description: formData.description,
      settings: {
        requireProposal: false,
        votingPeriod: 24,
        executionDelay: 0,
        maxTransactionAmount: '10000',
        allowedAssets: ['XLM'],
        dailyLimit: '50000',
        requireReason: false,
        autoExecute: false
      }
    })
  }

  const addSigner = () => {
    setSigners([...signers, { address: '', name: '', role: 'signer' as const, weight: 1, isActive: true }])
  }

  const removeSigner = (index: number) => {
    setSigners(signers.filter((_, i) => i !== index))
  }

  const updateSigner = (index: number, field: any, value: any) => {
    const updatedSigners = [...signers]
    updatedSigners[index] = { ...updatedSigners[index], [field]: value }
    setSigners(updatedSigners)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Threshold</label>
        <input
          type="number"
          value={formData.threshold}
          onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="1"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Signers</label>
          <button
            type="button"
            onClick={addSigner}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Signer
          </button>
        </div>
        
        <div className="space-y-2">
          {signers.map((signer, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 rounded">
              <input
                type="text"
                placeholder="Address"
                value={signer.address}
                onChange={(e) => updateSigner(index, 'address', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                required
              />
              <input
                type="text"
                placeholder="Name"
                value={signer.name}
                onChange={(e) => updateSigner(index, 'name', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                required
              />
              <select
                value={signer.role}
                onChange={(e) => updateSigner(index, 'role', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="signer">Signer</option>
              </select>
              <input
                type="number"
                placeholder="Weight"
                value={signer.weight}
                onChange={(e) => updateSigner(index, 'weight', parseInt(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                min="1"
                required
              />
              <button
                type="button"
                onClick={() => removeSigner(index)}
                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Wallet
        </button>
      </div>
    </form>
  )
}

// Create Transaction Form Component
function CreateTransactionForm({ 
  wallet, 
  onSubmit, 
  onCancel 
}: { 
  wallet: MultiSigWallet, 
  onSubmit: (request: CreateTransactionRequest) => void, 
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    type: 'payment' as const,
    to: '',
    amount: '',
    asset: 'XLM',
    data: '',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      walletId: wallet.id,
      type: formData.type,
      to: formData.to,
      amount: formData.amount || undefined,
      asset: formData.asset,
      data: formData.data || undefined,
      description: formData.description
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="payment">Payment</option>
          <option value="contract_call">Contract Call</option>
          <option value="token_transfer">Token Transfer</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
        <input
          type="text"
          value={formData.to}
          onChange={(e) => setFormData({ ...formData, to: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      {(formData.type === 'payment' || formData.type === 'token_transfer') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="text"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      )}
      
      {formData.type === 'contract_call' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Call Data</label>
          <textarea
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            required
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
        />
      </div>
      
      <div className="bg-gray-50 p-3 rounded">
        <p className="text-sm text-gray-600">
          This transaction will require {wallet.threshold} signatures from the wallet's signers.
          Current signers: {wallet.signers.filter(s => s.isActive).length}
        </p>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Transaction
        </button>
      </div>
    </form>
  )
}
