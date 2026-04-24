'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  MultiWallet,
  WalletGroup,
  WalletActivity,
  WalletImport,
  WalletExport,
  WalletFilters,
  WalletStats,
  WalletBackup,
  MultiWalletState,
  MultiWalletContextType,
  WalletType
} from '@/types/wallet'
import { 
  generateMockWallet,
  generateMockGroup,
  generateMockActivity,
  calculateWalletStats,
  filterWallets,
  searchWallets,
  validateWalletImport,
  validateWalletExport,
  createSecurityAudit,
  exportWalletData,
  importWalletFromData,
  calculateTotalBalance,
  getWalletHealthScore
} from '@/utils/multiWalletHelpers'

// Mock data for demonstration
const mockWallets: MultiWallet[] = [
  generateMockWallet('1', 'freighter'),
  generateMockWallet('2', 'albedo'),
  generateMockWallet('3', 'freighter'),
  generateMockWallet('4', 'albedo'),
  generateMockWallet('5', 'freighter')
]

const mockGroups: WalletGroup[] = [
  generateMockGroup('1'),
  generateMockGroup('2'),
  generateMockGroup('3')
]

const mockActivities: WalletActivity[] = mockWallets.flatMap(wallet => 
  Array.from({ length: 5 }, () => generateMockActivity(wallet.id))
)

export const useMultiWallet = (): MultiWalletContextType => {
  const [state, setState] = useState<MultiWalletState>({
    wallets: mockWallets,
    groups: mockGroups,
    connections: [],
    activities: mockActivities,
    currentWallet: mockWallets.find(w => w.isDefault) || null,
    isLoading: false,
    error: null
  })

  // Fetch wallets data
  const {
    data: walletsData = mockWallets,
    isLoading: walletsLoading,
    error: walletsError,
    refetch: refetchWallets
  } = useQuery({
    queryKey: ['multi-wallets'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockWallets
    },
    staleTime: 30000,
    refetchInterval: 60000
  })

  // Fetch groups data
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

  // Fetch activities data
  const {
    data: activitiesData = mockActivities,
    isLoading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities
  } = useQuery({
    queryKey: ['wallet-activities'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockActivities
    },
    staleTime: 30000,
    refetchInterval: 60000
  })

  // Update state when data changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      wallets: walletsData,
      currentWallet: walletsData.find(w => w.isDefault) || prev.currentWallet,
      isLoading: walletsLoading || groupsLoading || activitiesLoading,
      error: walletsError?.message || groupsError?.message || activitiesError?.message || null
    }))
  }, [walletsData, groupsData, activitiesData, walletsLoading, groupsLoading, activitiesLoading])

  // Wallet Management
  const addWallet = useCallback(async (walletData: Omit<MultiWallet, 'id' | 'createdAt'>): Promise<string> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const newWallet: MultiWallet = {
      ...walletData,
      id: `wallet-${Date.now()}`,
      createdAt: new Date()
    }
    
    setState(prev => ({
      ...prev,
      wallets: [...prev.wallets, newWallet]
    }))
    
    // Add activity
    const activity: WalletActivity = {
      id: `activity-${Date.now()}`,
      walletId: newWallet.id,
      type: 'connected',
      description: `Added ${walletData.name} to wallet collection`,
      timestamp: new Date()
    }
    
    setState(prev => ({
      ...prev,
      activities: [activity, ...prev.activities]
    }))
    
    return newWallet.id
  }, [])

  const removeWallet = useCallback(async (walletId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setState(prev => ({
      ...prev,
      wallets: prev.wallets.filter(w => w.id !== walletId),
      currentWallet: prev.currentWallet?.id === walletId ? null : prev.currentWallet
    }))
    
    // Add activity
    const activity: WalletActivity = {
      id: `activity-${Date.now()}`,
      walletId,
      type: 'disconnected',
      description: 'Wallet removed from collection',
      timestamp: new Date()
    }
    
    setState(prev => ({
      ...prev,
      activities: [activity, ...prev.activities]
    }))
  }, [])

  const updateWallet = useCallback(async (walletId: string, updates: Partial<MultiWallet>): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400))
    
    setState(prev => ({
      ...prev,
      wallets: prev.wallets.map(w => 
        w.id === walletId ? { ...w, ...updates } : w
      ),
      currentWallet: prev.currentWallet?.id === walletId 
        ? { ...prev.currentWallet, ...updates } 
        : prev.currentWallet
    }))
    
    // Add activity
    const activity: WalletActivity = {
      id: `activity-${Date.now()}`,
      walletId,
      type: 'settings_changed',
      description: 'Wallet settings updated',
      timestamp: new Date()
    }
    
    setState(prev => ({
      ...prev,
      activities: [activity, ...prev.activities]
    }))
  }, [])

  const setDefaultWallet = useCallback(async (walletId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setState(prev => ({
      ...prev,
      wallets: prev.wallets.map(w => ({
        ...w,
        isDefault: w.id === walletId
      })),
      currentWallet: prev.wallets.find(w => w.id === walletId) || null
    }))
  }, [])

  const switchWallet = useCallback(async (walletId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const wallet = state.wallets.find(w => w.id === walletId)
    if (!wallet) throw new Error('Wallet not found')
    
    setState(prev => ({
      ...prev,
      currentWallet: wallet
    }))
  }, [state.wallets])

  // Group Management
  const createGroup = useCallback(async (groupData: Omit<WalletGroup, 'id' | 'createdAt'>): Promise<string> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const newGroup: WalletGroup = {
      ...groupData,
      id: `group-${Date.now()}`,
      createdAt: new Date()
    }
    
    setState(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup]
    }))
    
    return newGroup.id
  }, [])

  const updateGroup = useCallback(async (groupId: string, updates: Partial<WalletGroup>): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400))
    
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => 
        g.id === groupId ? { ...g, ...updates } : g
      )
    }))
  }, [])

  const deleteGroup = useCallback(async (groupId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setState(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g.id !== groupId)
    }))
  }, [])

  const addWalletToGroup = useCallback(async (groupId: string, walletId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200))
    
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => 
        g.id === groupId 
          ? { ...g, wallets: [...g.wallets, walletId] }
          : g
      )
    }))
  }, [])

  const removeWalletFromGroup = useCallback(async (groupId: string, walletId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200))
    
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => 
        g.id === groupId 
          ? { ...g, wallets: g.wallets.filter(id => id !== walletId) }
          : g
      )
    }))
  }, [])

  // Import/Export
  const importWallet = useCallback(async (importData: WalletImport): Promise<string> => {
    const errors = validateWalletImport(importData)
    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const walletData = importWalletFromData(importData)
    return await addWallet(walletData)
  }, [addWallet])

  const exportWallet = useCallback(async (walletId: string, exportOptions: WalletExport): Promise<void> => {
    const errors = validateWalletExport(exportOptions)
    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const wallet = state.wallets.find(w => w.id === walletId)
    if (!wallet) throw new Error('Wallet not found')
    
    const exportData = exportWalletData(wallet, exportOptions)
    
    // In a real implementation, this would trigger a file download
    console.log('Export data:', exportData)
  }, [state.wallets])

  const backupWallet = useCallback(async (walletId: string, backupType: WalletBackup['type']): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const wallet = state.wallets.find(w => w.id === walletId)
    if (!wallet) throw new Error('Wallet not found')
    
    // In a real implementation, this would create a backup
    console.log(`Creating ${backupType} backup for wallet ${walletId}`)
  }, [state.wallets])

  const restoreWallet = useCallback(async (backupId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // In a real implementation, this would restore from backup
    console.log(`Restoring wallet from backup ${backupId}`)
  }, [])

  // Connection Management
  const connectWallet = useCallback(async (walletId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600))
    
    await updateWallet(walletId, { isActive: true, lastUsedAt: new Date() })
    
    // Add activity
    const activity: WalletActivity = {
      id: `activity-${Date.now()}`,
      walletId,
      type: 'connected',
      description: 'Wallet connected',
      timestamp: new Date()
    }
    
    setState(prev => ({
      ...prev,
      activities: [activity, ...prev.activities]
    }))
  }, [updateWallet])

  const disconnectWallet = useCallback(async (walletId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400))
    
    await updateWallet(walletId, { isActive: false })
    
    // Add activity
    const activity: WalletActivity = {
      id: `activity-${Date.now()}`,
      walletId,
      type: 'disconnected',
      description: 'Wallet disconnected',
      timestamp: new Date()
    }
    
    setState(prev => ({
      ...prev,
      activities: [activity, ...prev.activities]
    }))
  }, [updateWallet])

  const refreshWallet = useCallback(async (walletId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // In a real implementation, this would refresh wallet data from blockchain
    console.log(`Refreshing wallet ${walletId}`)
  }, [])

  // Search and Filter
  const searchWallets = useCallback((query: string): MultiWallet[] => {
    return searchWallets(state.wallets, query)
  }, [state.wallets])

  const filterWallets = useCallback((filters: WalletFilters): MultiWallet[] => {
    return filterWallets(state.wallets, filters)
  }, [state.wallets])

  return {
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
    restoreWallet,
    connectWallet,
    disconnectWallet,
    refreshWallet,
    searchWallets,
    filterWallets
  }
}
