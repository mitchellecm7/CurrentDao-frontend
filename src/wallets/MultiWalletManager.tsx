'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wallet, 
  Plus, 
  Settings, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Shield, 
  Smartphone, 
  Usb, 
  Bluetooth,
  Search,
  Filter,
  Grid3x3,
  List,
  MoreVertical,
  Download,
  Upload,
  RefreshCw,
  Users,
  Folder,
  Star,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

// Types
interface ExternalWallet {
  id: string
  name: string
  type: 'hardware' | 'mobile' | 'web' | 'paper'
  publicKey: string
  network: 'mainnet' | 'testnet'
  isActive: boolean
  isDefault: boolean
  createdAt: Date
  lastUsedAt?: Date
  balance: string
  metadata: {
    description?: string
    tags: string[]
    color?: string
    icon?: string
    customName?: string
    notes?: string
  }
  settings: {
    autoConnect: boolean
    showBalance: boolean
    notifications: boolean
    security: {
      requirePassword: boolean
      sessionTimeout: number
      biometricAuth: boolean
      twoFactorAuth: boolean
    }
  }
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error'
  deviceInfo?: {
    manufacturer: string
    model: string
    firmwareVersion: string
    batteryLevel?: number
  }
}

interface WalletGroup {
  id: string
  name: string
  description?: string
  wallets: string[]
  color?: string
  icon?: string
  createdAt: Date
  isDefault: boolean
}

interface MultiWalletManagerProps {
  wallets: ExternalWallet[]
  groups: WalletGroup[]
  onWalletSelect: (walletId: string) => void
  onWalletAdd: () => void
  onWalletUpdate: (walletId: string, updates: Partial<ExternalWallet>) => void
  onWalletDelete: (walletId: string) => void
  onGroupCreate: () => void
  onGroupUpdate: (groupId: string, updates: Partial<WalletGroup>) => void
  onGroupDelete: (groupId: string) => void
  currentWalletId?: string
}

export const MultiWalletManager: React.FC<MultiWalletManagerProps> = ({
  wallets,
  groups,
  onWalletSelect,
  onWalletAdd,
  onWalletUpdate,
  onWalletDelete,
  onGroupCreate,
  onGroupUpdate,
  onGroupDelete,
  currentWalletId
}) => {
  const [state, setState] = useState({
    viewMode: 'grid' as 'grid' | 'list',
    searchQuery: '',
    selectedWallets: new Set<string>(),
    showBalances: true,
    sortBy: 'name' as 'name' | 'created' | 'balance' | 'lastUsed',
    sortOrder: 'asc' as 'asc' | 'desc',
    showGroups: true,
    activeGroupId: null as string | null,
    contextMenu: null as { walletId: string; x: number; y: number } | null,
    draggedWallet: null as string | null,
    draggedOverGroup: null as string | null
  })

  // Filter and sort wallets
  const filteredWallets = wallets
    .filter(wallet => {
      const matchesSearch = wallet.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                          wallet.publicKey.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                          wallet.metadata.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()))
      
      const matchesGroup = !state.activeGroupId || 
                          groups.find(g => g.id === state.activeGroupId)?.wallets.includes(wallet.id)
      
      return matchesSearch && matchesGroup
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (state.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case 'balance':
          comparison = parseFloat(a.balance) - parseFloat(b.balance)
          break
        case 'lastUsed':
          comparison = (a.lastUsedAt?.getTime() || 0) - (b.lastUsedAt?.getTime() || 0)
          break
      }
      
      return state.sortOrder === 'asc' ? comparison : -comparison
    })

  // Get wallet icon
  const getWalletIcon = (wallet: ExternalWallet) => {
    switch (wallet.type) {
      case 'hardware':
        return <Usb className="w-5 h-5" />
      case 'mobile':
        return <Smartphone className="w-5 h-5" />
      case 'web':
        return <Globe className="w-5 h-5" />
      case 'paper':
        return <FileText className="w-5 h-5" />
      default:
        return <Wallet className="w-5 h-5" />
    }
  }

  // Get connection status indicator
  const getConnectionStatus = (status: ExternalWallet['connectionStatus']) => {
    switch (status) {
      case 'connected':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case 'connecting':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full" />
    }
  }

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }, [])

  // Handle wallet selection
  const handleWalletSelect = useCallback((walletId: string) => {
    onWalletSelect(walletId)
  }, [onWalletSelect])

  // Handle wallet actions
  const handleWalletAction = useCallback((walletId: string, action: string) => {
    switch (action) {
      case 'connect':
        onWalletUpdate(walletId, { connectionStatus: 'connecting' })
        setTimeout(() => {
          onWalletUpdate(walletId, { connectionStatus: 'connected', isActive: true, lastUsedAt: new Date() })
        }, 2000)
        break
      case 'disconnect':
        onWalletUpdate(walletId, { connectionStatus: 'disconnected', isActive: false })
        break
      case 'setDefault':
        wallets.forEach(w => onWalletUpdate(w.id, { isDefault: false }))
        onWalletUpdate(walletId, { isDefault: true })
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this wallet?')) {
          onWalletDelete(walletId)
        }
        break
      case 'export':
        toast.success('Export functionality coming soon!')
        break
      case 'backup':
        toast.success('Backup functionality coming soon!')
        break
    }
    setState(prev => ({ ...prev, contextMenu: null }))
  }, [wallets, onWalletUpdate, onWalletDelete])

  // Handle drag and drop
  const handleDragStart = useCallback((walletId: string) => {
    setState(prev => ({ ...prev, draggedWallet: walletId }))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, groupId?: string) => {
    e.preventDefault()
    setState(prev => ({ ...prev, draggedOverGroup: groupId || null }))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, groupId?: string) => {
    e.preventDefault()
    const { draggedWallet, draggedOverGroup } = state
    
    if (draggedWallet && groupId && draggedOverGroup === groupId) {
      // Add wallet to group
      const group = groups.find(g => g.id === groupId)
      if (group && !group.wallets.includes(draggedWallet)) {
        onGroupUpdate(groupId, { wallets: [...group.wallets, draggedWallet] })
      }
    }
    
    setState(prev => ({ ...prev, draggedWallet: null, draggedOverGroup: null }))
  }, [state, groups, onGroupUpdate])

  // Format balance
  const formatBalance = (balance: string) => {
    const value = parseFloat(balance)
    if (value === 0) return '0 XLM'
    if (value < 0.001) return '< 0.001 XLM'
    return `${value.toFixed(3)} XLM`
  }

  // Get wallet stats
  const getWalletStats = () => {
    const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0)
    const connectedCount = wallets.filter(w => w.connectionStatus === 'connected').length
    const activeCount = wallets.filter(w => w.isActive).length
    
    return {
      totalBalance: formatBalance(totalBalance.toString()),
      connectedCount,
      activeCount,
      totalCount: wallets.length
    }
  }

  const stats = getWalletStats()

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Multi-Wallet Manager</h2>
          <p className="text-gray-600 mt-1">Manage and organize your external wallets</p>
        </div>
        <button
          onClick={onWalletAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Wallet</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalBalance}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Connected</p>
              <p className="text-lg font-semibold text-gray-900">{stats.connectedCount}</p>
            </div>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-lg font-semibold text-gray-900">{stats.activeCount}</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Wallets</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalCount}</p>
            </div>
            <Wallet className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search wallets..."
                value={state.searchQuery}
                onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <select
              value={`${state.sortBy}-${state.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                setState(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }))
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="created-asc">Created (Oldest)</option>
              <option value="created-desc">Created (Newest)</option>
              <option value="balance-asc">Balance (Low-High)</option>
              <option value="balance-desc">Balance (High-Low)</option>
              <option value="lastUsed-asc">Last Used (Oldest)</option>
              <option value="lastUsed-desc">Last Used (Recent)</option>
            </select>

            {/* Groups */}
            <select
              value={state.activeGroupId || ''}
              onChange={(e) => setState(prev => ({ ...prev, activeGroupId: e.target.value || null }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Wallets</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                className={`p-2 ${state.viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                className={`p-2 ${state.viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Show Balances Toggle */}
            <button
              onClick={() => setState(prev => ({ ...prev, showBalances: !prev.showBalances }))}
              className={`p-2 rounded-lg ${state.showBalances ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
            >
              {state.showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Create Group */}
            <button
              onClick={onGroupCreate}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <Folder className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Groups */}
      {state.showGroups && groups.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Groups</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groups.map(group => (
              <div
                key={group.id}
                className={`bg-white p-4 rounded-lg border-2 transition-colors cursor-move ${
                  state.draggedOverGroup === group.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                }`}
                onDragOver={(e) => handleDragOver(e, group.id)}
                onDrop={(e) => handleDrop(e, group.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Folder className="w-5 h-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">{group.name}</h4>
                    {group.isDefault && <Star className="w-4 h-4 text-yellow-500" />}
                  </div>
                  <button
                    onClick={() => onGroupDelete(group.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-2">{group.description}</p>
                <p className="text-xs text-gray-400">{group.wallets.length} wallets</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallets Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={
            state.viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }
        >
          {filteredWallets.map(wallet => (
            <motion.div
              key={wallet.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className={`bg-white rounded-lg border-2 transition-all cursor-pointer ${
                currentWalletId === wallet.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
              }`}
              draggable
              onDragStart={() => handleDragStart(wallet.id)}
              onDragOver={handleDragOver}
              onClick={() => handleWalletSelect(wallet.id)}
              onContextMenu={(e) => {
                e.preventDefault()
                setState(prev => ({ ...prev, contextMenu: { walletId: wallet.id, x: e.clientX, y: e.clientY } }))
              }}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      wallet.connectionStatus === 'connected' ? 'bg-green-50' : 'bg-gray-50'
                    }`}>
                      {getWalletIcon(wallet)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{wallet.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{wallet.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getConnectionStatus(wallet.connectionStatus)}
                    {wallet.isDefault && <Star className="w-4 h-4 text-yellow-500" />}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setState(prev => ({ ...prev, contextMenu: { walletId: wallet.id, x: e.clientX, y: e.clientY } }))
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Balance */}
                {state.showBalances && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className="text-lg font-semibold text-gray-900">{formatBalance(wallet.balance)}</p>
                  </div>
                )}

                {/* Public Key */}
                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-1">Public Key</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-mono text-gray-700 truncate">
                      {wallet.publicKey}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(wallet.publicKey)
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {wallet.metadata.tags.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {wallet.metadata.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {wallet.metadata.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{wallet.metadata.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Last Used */}
                {wallet.lastUsedAt && (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Last used {wallet.lastUsedAt.toLocaleDateString()}</span>
                    </div>
                    <span className="capitalize">{wallet.network}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredWallets.length === 0 && (
        <div className="text-center py-12">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No wallets found</h3>
          <p className="text-gray-500 mb-4">
            {state.searchQuery ? 'Try adjusting your search terms' : 'Add your first wallet to get started'}
          </p>
          {!state.searchQuery && (
            <button
              onClick={onWalletAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Wallet
            </button>
          )}
        </div>
      )}

      {/* Context Menu */}
      {state.contextMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          style={{
            left: state.contextMenu.x,
            top: state.contextMenu.y
          }}
          onClick={() => setState(prev => ({ ...prev, contextMenu: null }))}
        >
          {wallets.find(w => w.id === state.contextMenu.walletId)?.connectionStatus === 'disconnected' && (
            <button
              onClick={() => handleWalletAction(state.contextMenu!.walletId, 'connect')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Usb className="w-4 h-4" />
              <span>Connect</span>
            </button>
          )}
          
          {wallets.find(w => w.id === state.contextMenu.walletId)?.connectionStatus === 'connected' && (
            <button
              onClick={() => handleWalletAction(state.contextMenu!.walletId, 'disconnect')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Bluetooth className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          )}
          
          <button
            onClick={() => handleWalletAction(state.contextMenu!.walletId, 'setDefault')}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Star className="w-4 h-4" />
            <span>Set as Default</span>
          </button>
          
          <button
            onClick={() => handleWalletAction(state.contextMenu!.walletId, 'export')}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={() => handleWalletAction(state.contextMenu!.walletId, 'backup')}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>Backup</span>
          </button>
          
          <div className="border-t border-gray-200 my-2" />
          
          <button
            onClick={() => handleWalletAction(state.contextMenu!.walletId, 'delete')}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </motion.div>
      )}
    </div>
  )
}

// Missing icons - these would need to be added to lucide-react
const Globe = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
    <path strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>
)

export default MultiWalletManager
