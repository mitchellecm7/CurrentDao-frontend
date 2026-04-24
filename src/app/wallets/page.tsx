'use client'

import React, { useState } from 'react'
import { useMultiWallet } from '@/hooks/useMultiWallet'
import { MultiWallet, WalletGroup, WalletImport, WalletExport } from '@/types/wallet'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  Settings, 
  Download, 
  Upload, 
  Shield, 
  Activity,
  Wallet as WalletIcon,
  Users,
  RefreshCw,
  MoreVertical,
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash2
} from 'lucide-react'

export default function MultiWalletPage() {
  const {
    state,
    addWallet,
    removeWallet,
    updateWallet,
    setDefaultWallet,
    switchWallet,
    createGroup,
    updateGroup,
    deleteGroup,
    addWalletToGroup,
    removeWalletFromGroup,
    importWallet,
    exportWallet,
    backupWallet,
    connectWallet,
    disconnectWallet,
    searchWallets,
    filterWallets
  } = useMultiWallet()

  const [activeTab, setActiveTab] = useState<'wallets' | 'groups' | 'activity' | 'security'>('wallets')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddWallet, setShowAddWallet] = useState(false)
  const [showImportWallet, setShowImportWallet] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<MultiWallet | null>(null)
  const [showBalances, setShowBalances] = useState<Record<string, boolean>>({})

  const filteredWallets = searchQuery 
    ? searchWallets(searchQuery)
    : state.wallets

  const stats = {
    totalWallets: state.wallets.length,
    activeWallets: state.wallets.filter(w => w.isActive).length,
    totalBalance: state.wallets.reduce((sum, w) => {
      const xlmBalance = w.balances.find(b => b.asset_code === 'XLM')
      return sum + parseFloat(xlmBalance?.balance || '0')
    }, 0).toFixed(2),
    totalGroups: state.groups.length
  }

  const tabs = [
    { id: 'wallets', label: 'Wallets', icon: WalletIcon },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  const handleAddWallet = async (walletData: Omit<MultiWallet, 'id' | 'createdAt'>) => {
    try {
      await addWallet(walletData)
      setShowAddWallet(false)
    } catch (error) {
      console.error('Failed to add wallet:', error)
    }
  }

  const handleImportWallet = async (importData: WalletImport) => {
    try {
      await importWallet(importData)
      setShowImportWallet(false)
    } catch (error) {
      console.error('Failed to import wallet:', error)
    }
  }

  const handleCreateGroup = async (groupData: Omit<WalletGroup, 'id' | 'createdAt'>) => {
    try {
      await createGroup(groupData)
      setShowCreateGroup(false)
    } catch (error) {
      console.error('Failed to create group:', error)
    }
  }

  const toggleBalanceVisibility = (walletId: string) => {
    setShowBalances(prev => ({
      ...prev,
      [walletId]: !prev[walletId]
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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
                Multi-Wallet Management
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowImportWallet(true)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </button>
              
              <button
                onClick={() => setShowAddWallet(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Wallet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <WalletIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">{stats.totalWallets}</h3>
                <p className="text-sm text-gray-600">Total Wallets</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">{stats.activeWallets}</h3>
                <p className="text-sm text-gray-600">Active Wallets</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Download className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">{stats.totalBalance} XLM</h3>
                <p className="text-sm text-gray-600">Total Balance</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">{stats.totalGroups}</h3>
                <p className="text-sm text-gray-600">Groups</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        {/* Wallets Tab */}
        {activeTab === 'wallets' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search wallets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>

            {/* Wallet List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWallets.map((wallet) => (
                <div key={wallet.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full ${wallet.metadata.color || 'bg-gray-500'} flex items-center justify-center text-white font-semibold`}>
                        {wallet.type.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium">{wallet.name}</h3>
                        <p className="text-sm text-gray-600">{wallet.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {wallet.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Default
                        </span>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Network</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        wallet.network === 'mainnet' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {wallet.network}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        wallet.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {wallet.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Balance</span>
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleBalanceVisibility(wallet.id)}
                          className="mr-2 text-gray-400 hover:text-gray-600"
                        >
                          {showBalances[wallet.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <span className="text-sm font-medium">
                          {showBalances[wallet.id] 
                            ? `${parseFloat(wallet.balances.find(b => b.asset_code === 'XLM')?.balance || '0').toFixed(2)} XLM`
                            : '••••••'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{wallet.publicKey.substring(0, 10)}...{wallet.publicKey.substring(wallet.publicKey.length - 8)}</span>
                        <button
                          onClick={() => copyToClipboard(wallet.publicKey)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        {wallet.isActive ? (
                          <button
                            onClick={() => disconnectWallet(wallet.id)}
                            className="flex-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            onClick={() => connectWallet(wallet.id)}
                            className="flex-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
                          >
                            Connect
                          </button>
                        )}
                        
                        <button
                          onClick={() => switchWallet(wallet.id)}
                          className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                        >
                          Switch
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Wallet Groups</h2>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.groups.map((group) => (
                <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full ${group.color || 'bg-gray-500'} flex items-center justify-center text-white`}>
                        {group.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium">{group.name}</h3>
                        <p className="text-sm text-gray-600">{group.wallets.length} wallets</p>
                      </div>
                    </div>
                    
                    {group.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  
                  {group.description && (
                    <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                  )}
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm">
                      View
                    </button>
                    <button className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            
            <div className="bg-white rounded-lg shadow-md">
              <div className="divide-y divide-gray-200">
                {state.activities.slice(0, 20).map((activity) => (
                  <div key={activity.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          activity.type === 'connected' ? 'bg-green-500' :
                          activity.type === 'disconnected' ? 'bg-red-500' :
                          activity.type === 'transaction' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Security Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-medium mb-4">Security Score</h3>
                <div className="space-y-3">
                  {state.wallets.map((wallet) => {
                    const score = Math.floor(Math.random() * 100) // Mock score
                    return (
                      <div key={wallet.id} className="flex items-center justify-between">
                        <span className="text-sm">{wallet.name}</span>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                score > 80 ? 'bg-green-500' :
                                score > 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{score}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-medium mb-4">Security Recommendations</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Enable two-factor authentication for all wallets</li>
                  <li>• Use strong, unique passwords for each wallet</li>
                  <li>• Regularly backup your wallet keys</li>
                  <li>• Keep your wallet software updated</li>
                  <li>• Review connected applications regularly</li>
                  <li>• Use hardware wallets for large amounts</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Wallet Modal */}
      {showAddWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Wallet</h2>
              <AddWalletForm
                onSubmit={handleAddWallet}
                onCancel={() => setShowAddWallet(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Import Wallet Modal */}
      {showImportWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Import Wallet</h2>
              <ImportWalletForm
                onSubmit={handleImportWallet}
                onCancel={() => setShowImportWallet(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Create Wallet Group</h2>
              <CreateGroupForm
                onSubmit={handleCreateGroup}
                onCancel={() => setShowCreateGroup(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Add Wallet Form Component
function AddWalletForm({ onSubmit, onCancel }: { onSubmit: (wallet: Omit<MultiWallet, 'id' | 'createdAt'>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'freighter' as const,
    network: 'mainnet' as const,
    metadata: {
      description: '',
      tags: [''],
      color: 'bg-blue-500',
      customName: '',
      notes: ''
    },
    settings: {
      autoConnect: true,
      showBalance: true,
      notifications: true,
      security: {
        requirePassword: false,
        sessionTimeout: 30,
        biometricAuth: false,
        twoFactorAuth: false,
        whitelist: []
      },
      privacy: {
        shareAnalytics: false,
        shareUsageData: false,
        hideZeroBalances: true,
        privateMode: false
      }
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      publicKey: `G${Math.random().toString(16).substr(2, 55).toUpperCase()}`,
      isActive: false,
      isDefault: false,
      lastUsedAt: undefined,
      balances: []
    })
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
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="freighter">Freighter</option>
            <option value="albedo">Albedo</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
          <select
            value={formData.network}
            onChange={(e) => setFormData({ ...formData, network: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.metadata.description}
          onChange={(e) => setFormData({ 
            ...formData, 
            metadata: { ...formData.metadata, description: e.target.value }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
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
          Add Wallet
        </button>
      </div>
    </form>
  )
}

// Import Wallet Form Component
function ImportWalletForm({ onSubmit, onCancel }: { onSubmit: (data: WalletImport) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    source: 'mnemonic' as const,
    data: '',
    encryption: '',
    metadata: {
      tags: [''],
      color: 'bg-blue-500',
      customName: ''
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Import Source</label>
        <select
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="mnemonic">Mnemonic Phrase</option>
          <option value="private_key">Private Key</option>
          <option value="file">JSON File</option>
          <option value="hardware">Hardware Wallet</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {formData.source === 'mnemonic' ? 'Mnemonic Phrase' : 
           formData.source === 'private_key' ? 'Private Key' :
           formData.source === 'file' ? 'Select File' : 'Connect Hardware'}
        </label>
        {formData.source === 'file' ? (
          <input
            type="file"
            onChange={(e) => setFormData({ ...formData, data: e.target.files?.[0] || '' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          <textarea
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder={formData.source === 'mnemonic' ? 'Enter your 12 or 24 word mnemonic phrase...' : 'Enter your private key...'}
            required
          />
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Name (Optional)</label>
        <input
          type="text"
          value={formData.metadata.customName}
          onChange={(e) => setFormData({ 
            ...formData, 
            metadata: { ...formData.metadata, customName: e.target.value }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
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
          Import Wallet
        </button>
      </div>
    </form>
  )
}

// Create Group Form Component
function CreateGroupForm({ onSubmit, onCancel }: { onSubmit: (group: Omit<WalletGroup, 'id' | 'createdAt'>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    wallets: [] as string[],
    color: 'bg-blue-500',
    isDefault: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          Create Group
        </button>
      </div>
    </form>
  )
}
