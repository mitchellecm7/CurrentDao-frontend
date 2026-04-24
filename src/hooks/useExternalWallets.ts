'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Import services and types
import { hardwareWalletService, HardwareWalletInfo } from '@/services/wallets/hardware-integration'
import { walletConnectService, WalletConnectSession } from '@/services/wallets/walletconnect-protocol'

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

interface ExternalWalletsState {
  wallets: ExternalWallet[]
  groups: WalletGroup[]
  currentWallet: ExternalWallet | null
  isLoading: boolean
  error: string | null
  hardwareDevices: HardwareWalletInfo[]
  walletConnectSessions: WalletConnectSession[]
}

interface UseExternalWalletsOptions {
  autoConnect?: boolean
  enableHardwareWallets?: boolean
  enableWalletConnect?: boolean
  network?: 'mainnet' | 'testnet'
}

// Mock data for demonstration
const generateMockWallet = (id: string, type: ExternalWallet['type']): ExternalWallet => ({
  id,
  name: `${type.charAt(0).toUpperCase() + type.slice(1)} Wallet ${id}`,
  type,
  publicKey: `G${Math.random().toString(36).substr(2, 55).toUpperCase()}`,
  network: 'mainnet',
  isActive: Math.random() > 0.5,
  isDefault: id === '1',
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  lastUsedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  balance: (Math.random() * 1000).toFixed(3),
  metadata: {
    description: `A ${type} wallet for managing Stellar assets`,
    tags: ['stellar', 'energy', 'dao'],
    color: '#3B82F6',
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
      biometricAuth: type === 'mobile',
      twoFactorAuth: false
    }
  },
  connectionStatus: Math.random() > 0.3 ? 'connected' : 'disconnected',
  deviceInfo: type === 'hardware' ? {
    manufacturer: 'Ledger',
    model: 'Nano X',
    firmwareVersion: '1.0.0',
    batteryLevel: Math.floor(Math.random() * 100)
  } : undefined
})

const generateMockGroup = (id: string): WalletGroup => ({
  id,
  name: `Group ${id}`,
  description: `A group of wallets for ${id === '1' ? 'personal' : 'business'} use`,
  wallets: [`1`, `2`, `3`].filter(w => Math.random() > 0.3),
  color: '#10B981',
  icon: '👛',
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  isDefault: id === '1'
})

const mockWallets: ExternalWallet[] = [
  generateMockWallet('1', 'hardware'),
  generateMockWallet('2', 'mobile'),
  generateMockWallet('3', 'web'),
  generateMockWallet('4', 'hardware'),
  generateMockWallet('5', 'mobile')
]

const mockGroups: WalletGroup[] = [
  generateMockGroup('1'),
  generateMockGroup('2'),
  generateMockGroup('3')
]

export const useExternalWallets = (options: UseExternalWalletsOptions = {}) => {
  const queryClient = useQueryClient()
  const [state, setState] = useState<ExternalWalletsState>({
    wallets: mockWallets,
    groups: mockGroups,
    currentWallet: mockWallets.find(w => w.isDefault) || null,
    isLoading: false,
    error: null,
    hardwareDevices: [],
    walletConnectSessions: []
  })

  const opts = useMemo(() => ({
    autoConnect: true,
    enableHardwareWallets: true,
    enableWalletConnect: true,
    network: 'mainnet' as const,
    ...options
  }), [options])

  // Queries
  const {
    data: walletsData = mockWallets,
    isLoading: walletsLoading,
    error: walletsError,
    refetch: refetchWallets
  } = useQuery({
    queryKey: ['external-wallets'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockWallets
    },
    staleTime: 30000,
    refetchInterval: 60000
  })

  const {
    data: groupsData = mockGroups,
    isLoading: groupsLoading,
    error: groupsError,
    refetch: refetchGroups
  } = useQuery({
    queryKey: ['wallet-groups'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 400))
      return mockGroups
    },
    staleTime: 30000,
    refetchInterval: 60000
  })

  const {
    data: hardwareDevicesData = [],
    isLoading: hardwareLoading,
    refetch: refetchHardwareDevices
  } = useQuery({
    queryKey: ['hardware-devices'],
    queryFn: async () => {
      if (!opts.enableHardwareWallets) return []
      return await hardwareWalletService.discoverDevices()
    },
    staleTime: 10000,
    refetchInterval: 30000,
    enabled: opts.enableHardwareWallets
  })

  const {
    data: walletConnectSessionsData = [],
    refetch: refetchWalletConnectSessions
  } = useQuery({
    queryKey: ['walletconnect-sessions'],
    queryFn: async () => {
      if (!opts.enableWalletConnect) return []
      return walletConnectService.getActiveSessions()
    },
    staleTime: 10000,
    refetchInterval: 30000,
    enabled: opts.enableWalletConnect
  })

  // Update state when data changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      wallets: walletsData,
      groups: groupsData,
      currentWallet: walletsData.find(w => w.isDefault) || prev.currentWallet,
      hardwareDevices: hardwareDevicesData,
      walletConnectSessions: walletConnectSessionsData,
      isLoading: walletsLoading || groupsLoading || hardwareLoading,
      error: walletsError?.message || groupsError?.message || null
    }))
  }, [walletsData, groupsData, hardwareDevicesData, walletConnectSessionsData, 
      walletsLoading, groupsLoading, hardwareLoading, walletsError, groupsError])

  // Auto-connect wallets
  useEffect(() => {
    if (opts.autoConnect && state.wallets.length > 0) {
      const walletsToConnect = state.wallets.filter(w => 
        w.settings.autoConnect && w.connectionStatus === 'disconnected'
      )
      
      walletsToConnect.forEach(wallet => {
        connectWallet(wallet.id)
      })
    }
  }, [opts.autoConnect, state.wallets])

  // Mutations
  const addWalletMutation = useMutation({
    mutationFn: async (walletData: Omit<ExternalWallet, 'id' | 'createdAt'>) => {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const newWallet: ExternalWallet = {
        ...walletData,
        id: `wallet-${Date.now()}`,
        createdAt: new Date()
      }
      
      return newWallet
    },
    onSuccess: (newWallet) => {
      setState(prev => ({
        ...prev,
        wallets: [...prev.wallets, newWallet]
      }))
      
      queryClient.invalidateQueries({ queryKey: ['external-wallets'] })
    }
  })

  const updateWalletMutation = useMutation({
    mutationFn: async ({ walletId, updates }: { walletId: string; updates: Partial<ExternalWallet> }) => {
      await new Promise(resolve => setTimeout(resolve, 400))
      return { walletId, updates }
    },
    onSuccess: ({ walletId, updates }) => {
      setState(prev => ({
        ...prev,
        wallets: prev.wallets.map(w => 
          w.id === walletId ? { ...w, ...updates } : w
        ),
        currentWallet: prev.currentWallet?.id === walletId 
          ? { ...prev.currentWallet, ...updates } 
          : prev.currentWallet
      }))
      
      queryClient.invalidateQueries({ queryKey: ['external-wallets'] })
    }
  })

  const removeWalletMutation = useMutation({
    mutationFn: async (walletId: string) => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return walletId
    },
    onSuccess: (walletId) => {
      setState(prev => ({
        ...prev,
        wallets: prev.wallets.filter(w => w.id !== walletId),
        currentWallet: prev.currentWallet?.id === walletId ? null : prev.currentWallet
      }))
      
      queryClient.invalidateQueries({ queryKey: ['external-wallets'] })
    }
  })

  // Wallet Management Functions
  const addWallet = useCallback(async (walletData: Omit<ExternalWallet, 'id' | 'createdAt'>) => {
    return addWalletMutation.mutateAsync(walletData)
  }, [addWalletMutation])

  const updateWallet = useCallback(async (walletId: string, updates: Partial<ExternalWallet>) => {
    return updateWalletMutation.mutateAsync({ walletId, updates })
  }, [updateWalletMutation])

  const removeWallet = useCallback(async (walletId: string) => {
    return removeWalletMutation.mutateAsync(walletId)
  }, [removeWalletMutation])

  const connectWallet = useCallback(async (walletId: string) => {
    const wallet = state.wallets.find(w => w.id === walletId)
    if (!wallet) throw new Error('Wallet not found')

    await updateWallet(walletId, { connectionStatus: 'connecting' })

    try {
      if (wallet.type === 'hardware') {
        // Connect to hardware wallet
        const device = state.hardwareDevices.find(d => d.id === walletId)
        if (device) {
          await hardwareWalletService.connectDevice(device)
        }
      } else if (wallet.type === 'mobile') {
        // Connect via WalletConnect
        const session = await walletConnectService.connect()
        console.log('WalletConnect session established:', session)
      }

      await updateWallet(walletId, { 
        connectionStatus: 'connected', 
        isActive: true, 
        lastUsedAt: new Date() 
      })
    } catch (error) {
      await updateWallet(walletId, { connectionStatus: 'error' })
      throw error
    }
  }, [state.wallets, state.hardwareDevices, updateWallet])

  const disconnectWallet = useCallback(async (walletId: string) => {
    const wallet = state.wallets.find(w => w.id === walletId)
    if (!wallet) throw new Error('Wallet not found')

    try {
      if (wallet.type === 'hardware') {
        await hardwareWalletService.disconnectDevice(walletId)
      } else if (wallet.type === 'mobile') {
        const session = state.walletConnectSessions.find(s => s.accounts.includes(wallet.publicKey))
        if (session) {
          await walletConnectService.disconnect(session.topic)
        }
      }

      await updateWallet(walletId, { connectionStatus: 'disconnected', isActive: false })
    } catch (error) {
      await updateWallet(walletId, { connectionStatus: 'error' })
      throw error
    }
  }, [state.wallets, state.walletConnectSessions, updateWallet])

  const switchWallet = useCallback(async (walletId: string) => {
    const wallet = state.wallets.find(w => w.id === walletId)
    if (!wallet) throw new Error('Wallet not found')

    // Disconnect current wallet
    if (state.currentWallet && state.currentWallet.id !== walletId) {
      await disconnectWallet(state.currentWallet.id)
    }

    // Connect new wallet if not already connected
    if (wallet.connectionStatus !== 'connected') {
      await connectWallet(walletId)
    }

    setState(prev => ({ ...prev, currentWallet: wallet }))
  }, [state.wallets, state.currentWallet, connectWallet, disconnectWallet])

  const setDefaultWallet = useCallback(async (walletId: string) => {
    // Set all wallets to non-default
    const updatePromises = state.wallets.map(w => 
      updateWallet(w.id, { isDefault: w.id === walletId })
    )
    
    await Promise.all(updatePromises)
  }, [state.wallets, updateWallet])

  // Group Management
  const createGroup = useCallback(async (groupData: Omit<WalletGroup, 'id' | 'createdAt'>) => {
    const newGroup: WalletGroup = {
      ...groupData,
      id: `group-${Date.now()}`,
      createdAt: new Date()
    }

    setState(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup]
    }))

    queryClient.invalidateQueries({ queryKey: ['wallet-groups'] })
    return newGroup.id
  }, [queryClient])

  const updateGroup = useCallback(async (groupId: string, updates: Partial<WalletGroup>) => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => 
        g.id === groupId ? { ...g, ...updates } : g
      )
    }))

    queryClient.invalidateQueries({ queryKey: ['wallet-groups'] })
  }, [queryClient])

  const deleteGroup = useCallback(async (groupId: string) => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g.id !== groupId)
    }))

    queryClient.invalidateQueries({ queryKey: ['wallet-groups'] })
  }, [queryClient])

  const addWalletToGroup = useCallback(async (groupId: string, walletId: string) => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => 
        g.id === groupId 
          ? { ...g, wallets: [...g.wallets, walletId] }
          : g
      )
    }))

    queryClient.invalidateQueries({ queryKey: ['wallet-groups'] })
  }, [queryClient])

  const removeWalletFromGroup = useCallback(async (groupId: string, walletId: string) => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => 
        g.id === groupId 
          ? { ...g, wallets: g.wallets.filter(id => id !== walletId) }
          : g
      )
    }))

    queryClient.invalidateQueries({ queryKey: ['wallet-groups'] })
  }, [queryClient])

  // Hardware Wallet Functions
  const refreshHardwareDevices = useCallback(async () => {
    await refetchHardwareDevices()
  }, [refetchHardwareDevices])

  const connectHardwareDevice = useCallback(async (deviceId: string) => {
    const device = state.hardwareDevices.find(d => d.id === deviceId)
    if (!device) throw new Error('Device not found')

    const connection = await hardwareWalletService.connectDevice(device)
    
    // Create wallet from hardware device
    const accounts = await hardwareWalletService.getAccounts(deviceId)
    if (accounts.length > 0) {
      const walletData: Omit<ExternalWallet, 'id' | 'createdAt'> = {
        name: device.name,
        type: 'hardware',
        publicKey: accounts[0].publicKey,
        network: opts.network,
        isActive: true,
        isDefault: false,
        balance: '0.000',
        metadata: {
          description: `Hardware wallet: ${device.name}`,
          tags: ['hardware', 'stellar'],
          color: '#8B5CF6'
        },
        settings: {
          autoConnect: true,
          showBalance: true,
          notifications: true,
          security: {
            requirePassword: false,
            sessionTimeout: 30,
            biometricAuth: false,
            twoFactorAuth: false
          }
        },
        connectionStatus: 'connected',
        deviceInfo: {
          manufacturer: device.name.split(' ')[0],
          model: device.name.split(' ').slice(1).join(' '),
          firmwareVersion: device.version
        }
      }

      await addWallet(walletData)
    }

    return connection
  }, [state.hardwareDevices, opts.network, addWallet])

  // WalletConnect Functions
  const connectMobileWallet = useCallback(async (walletId?: string) => {
    const session = await walletConnectService.connect(walletId)
    await refetchWalletConnectSessions()
    return session
  }, [refetchWalletConnectSessions])

  const disconnectMobileWallet = useCallback(async (sessionTopic: string) => {
    await walletConnectService.disconnect(sessionTopic)
    await refetchWalletConnectSessions()
  }, [refetchWalletConnectSessions])

  // Transaction Signing
  const signTransaction = useCallback(async (
    walletId: string, 
    transactionXDR: string, 
    network: 'mainnet' | 'testnet' = opts.network
  ) => {
    const wallet = state.wallets.find(w => w.id === walletId)
    if (!wallet) throw new Error('Wallet not found')
    if (wallet.connectionStatus !== 'connected') throw new Error('Wallet not connected')

    try {
      if (wallet.type === 'hardware') {
        const signature = await hardwareWalletService.signTransaction(
          walletId,
          { transactionXDR, network, fee: 100, operations: [] },
          "m/44'/148'/0'/0"
        )
        return signature.signature
      } else if (wallet.type === 'mobile') {
        const session = state.walletConnectSessions.find(s => s.accounts.includes(wallet.publicKey))
        if (!session) throw new Error('No active WalletConnect session')
        
        const signature = await walletConnectService.signStellarTransaction(session.topic, transactionXDR, network)
        return signature
      } else {
        throw new Error('Wallet type does not support signing')
      }
    } catch (error) {
      throw new Error(`Failed to sign transaction: ${error.message}`)
    }
  }, [state.wallets, state.walletConnectSessions, opts.network])

  // Utility Functions
  const getWalletBalance = useCallback(async (walletId: string) => {
    // Mock balance fetching
    await new Promise(resolve => setTimeout(resolve, 1000))
    const balance = (Math.random() * 1000).toFixed(3)
    
    await updateWallet(walletId, { balance })
    return balance
  }, [updateWallet])

  const refreshAllWallets = useCallback(async () => {
    const refreshPromises = state.wallets.map(wallet => 
      getWalletBalance(wallet.id)
    )
    
    await Promise.all(refreshPromises)
    await refetchWallets()
  }, [state.wallets, getWalletBalance, refetchWallets])

  const searchWallets = useCallback((query: string) => {
    return state.wallets.filter(wallet => 
      wallet.name.toLowerCase().includes(query.toLowerCase()) ||
      wallet.publicKey.toLowerCase().includes(query.toLowerCase()) ||
      wallet.metadata.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
  }, [state.wallets])

  const filterWallets = useCallback((filters: {
    type?: ExternalWallet['type'][]
    network?: ('mainnet' | 'testnet')[]
    tags?: string[]
    isActive?: boolean
    connectionStatus?: ExternalWallet['connectionStatus'][]
  }) => {
    return state.wallets.filter(wallet => {
      if (filters.type && !filters.type.includes(wallet.type)) return false
      if (filters.network && !filters.network.includes(wallet.network)) return false
      if (filters.tags && !filters.tags.some(tag => wallet.metadata.tags.includes(tag))) return false
      if (filters.isActive !== undefined && wallet.isActive !== filters.isActive) return false
      if (filters.connectionStatus && !filters.connectionStatus.includes(wallet.connectionStatus)) return false
      return true
    })
  }, [state.wallets])

  // Computed values
  const stats = useMemo(() => {
    const totalBalance = state.wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0)
    const connectedCount = state.wallets.filter(w => w.connectionStatus === 'connected').length
    const activeCount = state.wallets.filter(w => w.isActive).length
    
    return {
      totalBalance: totalBalance.toFixed(3),
      totalWallets: state.wallets.length,
      connectedCount,
      activeCount,
      hardwareCount: state.wallets.filter(w => w.type === 'hardware').length,
      mobileCount: state.wallets.filter(w => w.type === 'mobile').length,
      webCount: state.wallets.filter(w => w.type === 'web').length
    }
  }, [state.wallets])

  return {
    // State
    state,
    stats,
    
    // Wallet Management
    addWallet,
    updateWallet,
    removeWallet,
    connectWallet,
    disconnectWallet,
    switchWallet,
    setDefaultWallet,
    
    // Group Management
    createGroup,
    updateGroup,
    deleteGroup,
    addWalletToGroup,
    removeWalletFromGroup,
    
    // Hardware Wallets
    refreshHardwareDevices,
    connectHardwareDevice,
    
    // WalletConnect
    connectMobileWallet,
    disconnectMobileWallet,
    
    // Transaction Operations
    signTransaction,
    getWalletBalance,
    refreshAllWallets,
    
    // Search and Filter
    searchWallets,
    filterWallets,
    
    // Refetch functions
    refetchWallets,
    refetchGroups,
    refetchHardwareDevices,
    refetchWalletConnectSessions,
    
    // Loading states
    isLoading: state.isLoading || addWalletMutation.isPending || updateWalletMutation.isPending || removeWalletMutation.isPending,
    
    // Error handling
    error: state.error || addWalletMutation.error || updateWalletMutation.error || removeWalletMutation.error
  }
}
