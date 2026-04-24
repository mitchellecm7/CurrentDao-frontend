export interface WalletInfo {
  publicKey: string;
  name?: string;
  isConnected: boolean;
  network: 'mainnet' | 'testnet';
}

export interface WalletBalance {
  asset_code: string;
  asset_issuer?: string;
  balance: string;
  asset_type: 'native' | 'credit_alphanum4' | 'credit_alphanum12';
}

export interface StellarTransaction {
  id: string;
  hash: string;
  successful: boolean;
  source_account: string;
  created_at: string;
  transaction_envelope: string;
  memo?: string;
  operations: StellarOperation[];
  fee_paid: string;
  fee_charged: string;
}

export interface StellarOperation {
  id: string;
  type: string;
  source_account: string;
  created_at: string;
  transaction_hash: string;
  asset_code?: string;
  amount?: string;
  from?: string;
  to?: string;
}

export interface WalletState {
  wallet: WalletInfo | null;
  balance: WalletBalance[];
  transactions: StellarTransaction[];
  isLoading: boolean;
  error: string | null;
  network: 'mainnet' | 'testnet';
}

export interface WalletContextType {
  state: WalletState;
  connectWallet: (walletType: 'freighter' | 'albedo') => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  sendTransaction: (destination: string, amount: string, asset?: string) => Promise<string>;
}

export type WalletType = 'freighter' | 'albedo';

export interface WalletConnectorProps {
  onConnect?: (wallet: WalletInfo) => void;
  onDisconnect?: () => void;
  className?: string;
  showBalance?: boolean;
  showTransactions?: boolean;
}

export interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelect: (walletType: WalletType) => void;
  isLoading?: boolean;
  error?: string | null;
}

export interface BalanceDisplayProps {
  balance: WalletBalance[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  showAssetDetails?: boolean;
}

export interface TransactionHistoryProps {
  transactions: StellarTransaction[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  maxItems?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
}

export interface StellarNetworkConfig {
  network: 'mainnet' | 'testnet';
  horizonUrl: string;
  passphrase: string;
}

export interface WalletError {
  code: string;
  message: string;
  details?: any;
  walletType?: WalletType;
}

export interface ConnectionResult {
  success: boolean;
  wallet?: WalletInfo;
  error?: WalletError;
}

export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  error?: WalletError;
}

export interface WalletEvent {
  type: 'connected' | 'disconnected' | 'account_changed' | 'network_changed';
  wallet?: WalletInfo;
  data?: any;
}

// WATT token specific interfaces for CurrentDao
export interface WATTBalance {
  balance: string;
  available: string;
  reserved: string;
  lastUpdated: string;
}

export interface EnergyTransaction {
  id: string;
  type: 'buy' | 'sell' | 'transfer';
  amount: string;
  price: string;
  counterparty: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  energySource?: string;
  region?: string;
}

export interface WalletProviderProps {
  children: React.ReactNode;
  network?: 'mainnet' | 'testnet';
  autoConnect?: boolean;
}

// Freighter specific types
export interface FreighterAPI {
  isAllowed: () => Promise<boolean>;
  getUserInfo: () => Promise<{ publicKey: string; name?: string }>;
  getPublicKey: () => Promise<string>;
  signTransaction: (xdr: string, options?: { network: string }) => Promise<string>;
  signAuthEntry: (entryXdr: string) => Promise<string>;
  connect: () => Promise<{ publicKey: string; name?: string }>;
  disconnect: () => Promise<void>;
}

// Albedo specific types
export interface AlbedoAPI {
  publicKey: () => Promise<{ publicKey: string }>;
  sign: (xdr: string, options?: { network: string }) => Promise<{ signed_xdr: string }>;
  tx: (params: {
    xdr: string;
    description?: string;
    network?: string;
    callback?: string;
  }) => Promise<{ signed_xdr: string; network: string; result_xdr?: string }>;
  pay: (params: {
    destination: string;
    amount: string;
    asset_code?: string;
    asset_issuer?: string;
    description?: string;
    network?: string;
    callback?: string;
  }) => Promise<{ tx_hash: string; network: string }>;
  stream: (params: { pubkey: string; callback: string }) => void;
}

// Multi-Wallet Management Types
export interface MultiWallet {
  id: string
  name: string
  type: WalletType
  publicKey: string
  network: 'mainnet' | 'testnet'
  isActive: boolean
  isDefault: boolean
  createdAt: Date
  lastUsedAt?: Date
  balances: WalletBalance[]
  metadata: WalletMetadata
  settings: WalletSettings
}

export interface WalletMetadata {
  description?: string
  tags: string[]
  color?: string
  icon?: string
  customName?: string
  notes?: string
}

export interface WalletSettings {
  autoConnect: boolean
  showBalance: boolean
  notifications: boolean
  security: SecuritySettings
  privacy: PrivacySettings
}

export interface SecuritySettings {
  requirePassword: boolean
  sessionTimeout: number // in minutes
  biometricAuth: boolean
  twoFactorAuth: boolean
  whitelist: string[] // allowed domains
}

export interface PrivacySettings {
  shareAnalytics: boolean
  shareUsageData: boolean
  hideZeroBalances: boolean
  privateMode: boolean
}

export interface WalletGroup {
  id: string
  name: string
  description?: string
  wallets: string[] // wallet IDs
  color?: string
  icon?: string
  createdAt: Date
  isDefault: boolean
}

export interface WalletConnection {
  id: string
  walletId: string
  timestamp: Date
  ipAddress?: string
  userAgent?: string
  location?: string
  isActive: boolean
}

export interface WalletActivity {
  id: string
  walletId: string
  type: 'connected' | 'disconnected' | 'transaction' | 'balance_update' | 'settings_changed'
  description: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface WalletBackup {
  id: string
  walletId: string
  type: 'mnemonic' | 'private_key' | 'keystore' | 'hardware'
  encrypted: boolean
  backupDate: Date
  location?: string // cloud storage path
  checksum: string
}

export interface WalletImport {
  source: 'file' | 'mnemonic' | 'private_key' | 'hardware' | 'cloud'
  data: string | File
  encryption?: string
  metadata?: Partial<WalletMetadata>
}

export interface WalletExport {
  format: 'json' | 'mnemonic' | 'private_key' | 'keystore'
  includePrivateKeys: boolean
  includeTransactions: boolean
  includeSettings: boolean
  password?: string
}

export interface MultiWalletState {
  wallets: MultiWallet[]
  groups: WalletGroup[]
  connections: WalletConnection[]
  activities: WalletActivity[]
  currentWallet: MultiWallet | null
  isLoading: boolean
  error: string | null
}

export interface MultiWalletContextType {
  state: MultiWalletState
  // Wallet Management
  addWallet: (wallet: Omit<MultiWallet, 'id' | 'createdAt'>) => Promise<string>
  removeWallet: (walletId: string) => Promise<void>
  updateWallet: (walletId: string, updates: Partial<MultiWallet>) => Promise<void>
  setDefaultWallet: (walletId: string) => Promise<void>
  switchWallet: (walletId: string) => Promise<void>
  
  // Group Management
  createGroup: (group: Omit<WalletGroup, 'id' | 'createdAt'>) => Promise<string>
  updateGroup: (groupId: string, updates: Partial<WalletGroup>) => Promise<void>
  deleteGroup: (groupId: string) => Promise<void>
  addWalletToGroup: (groupId: string, walletId: string) => Promise<void>
  removeWalletFromGroup: (groupId: string, walletId: string) => Promise<void>
  
  // Import/Export
  importWallet: (importData: WalletImport) => Promise<string>
  exportWallet: (walletId: string, exportOptions: WalletExport) => Promise<void>
  backupWallet: (walletId: string, backupType: WalletBackup['type']) => Promise<void>
  restoreWallet: (backupId: string) => Promise<void>
  
  // Connection Management
  connectWallet: (walletId: string) => Promise<void>
  disconnectWallet: (walletId: string) => Promise<void>
  refreshWallet: (walletId: string) => Promise<void>
  
  // Search and Filter
  searchWallets: (query: string) => MultiWallet[]
  filterWallets: (filters: WalletFilters) => MultiWallet[]
}

export interface WalletFilters {
  type?: WalletType[]
  network?: ('mainnet' | 'testnet')[]
  tags?: string[]
  groups?: string[]
  isActive?: boolean
  hasBalance?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface WalletStats {
  totalWallets: number
  activeWallets: number
  totalBalance: string
  totalTransactions: number
  networks: {
    mainnet: number
    testnet: number
  }
  types: {
    freighter: number
    albedo: number
  }
  recentActivity: WalletActivity[]
}

export interface WalletNotification {
  id: string
  walletId: string
  type: 'transaction' | 'balance' | 'security' | 'connection'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

export interface WalletSecurityAudit {
  id: string
  walletId: string
  timestamp: Date
  issues: SecurityIssue[]
  score: number // 0-100
  recommendations: string[]
}

export interface SecurityIssue {
  type: 'weak_password' | 'old_backup' | 'suspicious_activity' | 'outdated_software'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  recommendation: string
}
