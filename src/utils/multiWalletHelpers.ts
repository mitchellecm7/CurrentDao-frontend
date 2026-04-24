import {
  MultiWallet,
  WalletGroup,
  WalletActivity,
  WalletBackup,
  WalletImport,
  WalletExport,
  WalletFilters,
  WalletStats,
  WalletSecurityAudit,
  SecurityIssue,
  WalletBalance,
  WalletType
} from '@/types/wallet'

export const generateMockWallet = (id: string, type: WalletType): MultiWallet => {
  const now = new Date()
  return {
    id,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Wallet ${id}`,
    type,
    publicKey: `G${Math.random().toString(16).substr(2, 55).toUpperCase()}`,
    network: Math.random() > 0.5 ? 'mainnet' : 'testnet',
    isActive: Math.random() > 0.3,
    isDefault: id === '1',
    createdAt: new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    lastUsedAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    balances: generateMockBalances(),
    metadata: {
      description: `My ${type} wallet for daily transactions`,
      tags: ['personal', 'daily'],
      color: getRandomColor(),
      icon: type,
      customName: `${type.charAt(0).toUpperCase() + type.slice(1)} Wallet`,
      notes: 'Created for testing purposes'
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
        whitelist: ['currentdao.io', 'stellar.expert']
      },
      privacy: {
        shareAnalytics: false,
        shareUsageData: false,
        hideZeroBalances: true,
        privateMode: false
      }
    }
  }
}

export const generateMockBalances = (): WalletBalance[] => {
  const assets = [
    { code: 'XLM', issuer: undefined, type: 'native' as const },
    { code: 'WATT', issuer: 'GD5DJQDZYJAE2UQKGRZ44Q3YWFZPAHIKMXLTMNUP5EIXRDQGWK4C5CBF', type: 'credit_alphanum4' as const },
    { code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM3XDX3ASTERXMCO4Z37G6H5M5A3M', type: 'credit_alphanum4' as const }
  ]
  
  return assets.map(asset => ({
    asset_code: asset.code,
    asset_issuer: asset.issuer,
    balance: (Math.random() * 10000).toFixed(7),
    asset_type: asset.type
  }))
}

export const generateMockGroup = (id: string): WalletGroup => {
  return {
    id,
    name: `Group ${id}`,
    description: `Wallet group for ${['Personal', 'Business', 'Trading', 'Savings'][parseInt(id) - 1]}`,
    wallets: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => `wallet-${i + 1}`),
    color: getRandomColor(),
    icon: 'folder',
    createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
    isDefault: id === '1'
  }
}

export const generateMockActivity = (walletId: string): WalletActivity => {
  const types: WalletActivity['type'][] = ['connected', 'disconnected', 'transaction', 'balance_update', 'settings_changed']
  const type = types[Math.floor(Math.random() * types.length)]
  
  return {
    id: `activity-${Date.now()}-${Math.random().toString(16).substr(2, 8)}`,
    walletId,
    type,
    description: getActivityDescription(type),
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    metadata: getActivityMetadata(type)
  }
}

export const getActivityDescription = (type: WalletActivity['type']): string => {
  switch (type) {
    case 'connected':
      return 'Wallet connected successfully'
    case 'disconnected':
      return 'Wallet disconnected'
    case 'transaction':
      return 'Transaction sent/received'
    case 'balance_update':
      return 'Balance updated'
    case 'settings_changed':
      return 'Wallet settings updated'
    default:
      return 'Unknown activity'
  }
}

export const getActivityMetadata = (type: WalletActivity['type']): Record<string, any> => {
  switch (type) {
    case 'transaction':
      return {
        transactionId: `tx-${Math.random().toString(16).substr(2, 64)}`,
        amount: (Math.random() * 1000).toFixed(2),
        asset: 'XLM'
      }
    case 'balance_update':
      return {
        previousBalance: (Math.random() * 1000).toFixed(2),
        newBalance: (Math.random() * 1000).toFixed(2),
        asset: 'XLM'
      }
    default:
      return {}
  }
}

export const calculateWalletStats = (wallets: MultiWallet[], activities: WalletActivity[]): WalletStats => {
  const activeWallets = wallets.filter(w => w.isActive)
  const totalBalance = wallets.reduce((sum, wallet) => {
    const xlmBalance = wallet.balances.find(b => b.asset_code === 'XLM')
    return sum + parseFloat(xlmBalance?.balance || '0')
  }, 0)
  
  const recentTransactions = activities.filter(a => a.type === 'transaction').length
  const networkCounts = wallets.reduce((acc, wallet) => {
    acc[wallet.network]++
    return acc
  }, { mainnet: 0, testnet: 0 })
  
  const typeCounts = wallets.reduce((acc, wallet) => {
    acc[wallet.type]++
    return acc
  }, { freighter: 0, albedo: 0 })
  
  return {
    totalWallets: wallets.length,
    activeWallets: activeWallets.length,
    totalBalance: totalBalance.toFixed(7),
    totalTransactions: recentTransactions,
    networks: networkCounts,
    types: typeCounts,
    recentActivity: activities.slice(0, 10)
  }
}

export const filterWallets = (wallets: MultiWallet[], filters: WalletFilters): MultiWallet[] => {
  return wallets.filter(wallet => {
    // Type filter
    if (filters.type && !filters.type.includes(wallet.type)) {
      return false
    }
    
    // Network filter
    if (filters.network && !filters.network.includes(wallet.network)) {
      return false
    }
    
    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        wallet.metadata.tags.includes(tag)
      )
      if (!hasMatchingTag) return false
    }
    
    // Active filter
    if (filters.isActive !== undefined && wallet.isActive !== filters.isActive) {
      return false
    }
    
    // Balance filter
    if (filters.hasBalance !== undefined) {
      const hasBalance = wallet.balances.some(b => parseFloat(b.balance) > 0)
      if (hasBalance !== filters.hasBalance) {
        return false
      }
    }
    
    // Date range filter
    if (filters.dateRange) {
      const walletDate = wallet.createdAt
      if (walletDate < filters.dateRange.start || walletDate > filters.dateRange.end) {
        return false
      }
    }
    
    return true
  })
}

export const searchWallets = (wallets: MultiWallet[], query: string): MultiWallet[] => {
  const lowerQuery = query.toLowerCase()
  return wallets.filter(wallet => 
    wallet.name.toLowerCase().includes(lowerQuery) ||
    wallet.publicKey.toLowerCase().includes(lowerQuery) ||
    wallet.metadata.description?.toLowerCase().includes(lowerQuery) ||
    wallet.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

export const formatAddress = (address: string, length: number = 8): string => {
  if (!address || address.length < length * 2) return address
  return `${address.substring(0, length)}...${address.substring(address.length - length)}`
}

export const formatBalance = (balance: string, decimals: number = 2): string => {
  const num = parseFloat(balance)
  if (num === 0) return '0'
  if (num < 0.000001) return '< 0.000001'
  return num.toFixed(decimals)
}

export const getWalletIcon = (type: WalletType): string => {
  switch (type) {
    case 'freighter':
      return '🚢'
    case 'albedo':
      return '🌅'
    default:
      return '👛'
  }
}

export const getNetworkColor = (network: 'mainnet' | 'testnet'): string => {
  return network === 'mainnet' ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100'
}

export const getRandomColor = (): string => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export const validateWalletImport = (importData: WalletImport): string[] => {
  const errors: string[] = []
  
  if (!importData.data) {
    errors.push('Import data is required')
  }
  
  if (importData.source === 'mnemonic') {
    const words = (importData.data as string).split(' ').filter(word => word.length > 0)
    if (words.length !== 12 && words.length !== 24) {
      errors.push('Mnemonic must be 12 or 24 words')
    }
  }
  
  if (importData.source === 'private_key') {
    const key = importData.data as string
    if (!key.startsWith('S') || key.length !== 56) {
      errors.push('Invalid private key format')
    }
  }
  
  return errors
}

export const validateWalletExport = (exportOptions: WalletExport): string[] => {
  const errors: string[] = []
  
  if (exportOptions.includePrivateKeys && !exportOptions.password) {
    errors.push('Password is required when exporting private keys')
  }
  
  if (exportOptions.password && exportOptions.password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  
  return errors
}

export const createSecurityAudit = (wallet: MultiWallet): WalletSecurityAudit => {
  const issues: SecurityIssue[] = []
  let score = 100
  
  // Check for weak security settings
  if (!wallet.settings.security.requirePassword) {
    issues.push({
      type: 'weak_password',
      severity: 'medium',
      description: 'Wallet does not require password for access',
      recommendation: 'Enable password protection for better security'
    })
    score -= 20
  }
  
  // Check for old backups
  const daysSinceCreation = (Date.now() - wallet.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceCreation > 30) {
    issues.push({
      type: 'old_backup',
      severity: 'low',
      description: 'Wallet has not been backed up recently',
      recommendation: 'Create a fresh backup of your wallet'
    })
    score -= 10
  }
  
  // Check for suspicious activity
  const recentConnections = 0 // This would be calculated from actual connection data
  if (recentConnections > 10) {
    issues.push({
      type: 'suspicious_activity',
      severity: 'high',
      description: 'Unusual connection activity detected',
      recommendation: 'Review recent connections and change password if necessary'
    })
    score -= 30
  }
  
  const recommendations = [
    'Enable two-factor authentication',
    'Use a strong, unique password',
    'Regularly backup your wallet',
    'Keep your wallet software updated'
  ]
  
  return {
    id: `audit-${wallet.id}-${Date.now()}`,
    walletId: wallet.id,
    timestamp: new Date(),
    issues,
    score: Math.max(0, score),
    recommendations
  }
}

export const exportWalletData = (wallet: MultiWallet, options: WalletExport): string => {
  const exportData: any = {
    id: wallet.id,
    name: wallet.name,
    type: wallet.type,
    publicKey: wallet.publicKey,
    network: wallet.network,
    metadata: wallet.metadata,
    createdAt: wallet.createdAt
  }
  
  if (options.includeSettings) {
    exportData.settings = wallet.settings
  }
  
  if (options.includeTransactions) {
    exportData.transactions = [] // This would include actual transaction data
  }
  
  if (options.includePrivateKeys) {
    exportData.privateKey = 'S' + '1'.repeat(55) // Mock private key
  }
  
  return JSON.stringify(exportData, null, 2)
}

export const importWalletFromData = (importData: WalletImport): Omit<MultiWallet, 'id' | 'createdAt'> => {
  const baseWallet = {
    name: importData.metadata?.customName || 'Imported Wallet',
    type: 'freighter' as WalletType,
    publicKey: 'G' + Math.random().toString(16).substr(2, 55).toUpperCase(),
    network: 'mainnet' as const,
    isActive: false,
    isDefault: false,
    lastUsedAt: undefined,
    balances: generateMockBalances(),
    metadata: {
      description: importData.metadata?.description || 'Imported wallet',
      tags: importData.metadata?.tags || ['imported'],
      color: importData.metadata?.color || getRandomColor(),
      icon: importData.metadata?.icon || 'import',
      customName: importData.metadata?.customName,
      notes: importData.metadata?.notes || 'Imported from external source'
    },
    settings: {
      autoConnect: false,
      showBalance: true,
      notifications: true,
      security: {
        requirePassword: true,
        sessionTimeout: 15,
        biometricAuth: false,
        twoFactorAuth: false,
        whitelist: []
      },
      privacy: {
        shareAnalytics: false,
        shareUsageData: false,
        hideZeroBalances: false,
        privateMode: true
      }
    }
  }
  
  return baseWallet
}

export const calculateTotalBalance = (wallets: MultiWallet[], assetCode?: string): string => {
  const total = wallets.reduce((sum, wallet) => {
    const balances = assetCode 
      ? wallet.balances.filter(b => b.asset_code === assetCode)
      : wallet.balances.filter(b => b.asset_code === 'XLM')
    
    return sum + balances.reduce((walletSum, balance) => 
      walletSum + parseFloat(balance.balance || '0'), 0)
  }, 0)
  
  return total.toFixed(7)
}

export const getWalletHealthScore = (wallet: MultiWallet): number => {
  let score = 100
  
  // Activity score (40%)
  if (!wallet.lastUsedAt) {
    score -= 40
  } else {
    const daysSinceLastUse = (Date.now() - wallet.lastUsedAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceLastUse > 30) score -= 20
    else if (daysSinceLastUse > 7) score -= 10
  }
  
  // Security score (30%)
  if (!wallet.settings.security.requirePassword) score -= 15
  if (!wallet.settings.security.twoFactorAuth) score -= 10
  if (wallet.settings.security.sessionTimeout > 60) score -= 5
  
  // Balance score (20%)
  const hasBalance = wallet.balances.some(b => parseFloat(b.balance) > 0)
  if (!hasBalance) score -= 20
  
  // Settings score (10%)
  if (!wallet.settings.notifications) score -= 5
  if (!wallet.settings.autoConnect) score -= 5
  
  return Math.max(0, score)
}

export const formatTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  
  return date.toLocaleDateString()
}
