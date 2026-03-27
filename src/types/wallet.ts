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
