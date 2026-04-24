// Wallet Components
export { default as WalletConnector } from './WalletConnector';
export { default as WalletModal } from './WalletModal';
export { default as TransactionHistory } from './TransactionHistory';
export { default as BalanceDisplay } from './BalanceDisplay';

// Wallet Hooks
export {
  WalletProvider,
  useStellarWallet,
  useWalletInfo,
  useWalletBalance,
  useWalletTransactions,
  useIsWalletConnected,
  useWalletAddress,
  useWalletAvailability,
  useTransactionHistory,
} from '@/hooks/useStellarWallet';

// Wallet Types
export type {
  WalletInfo,
  WalletBalance,
  StellarTransaction,
  StellarOperation,
  WalletState,
  WalletContextType,
  WalletType,
  WalletConnectorProps,
  WalletModalProps,
  BalanceDisplayProps,
  TransactionHistoryProps,
  WalletError,
  ConnectionResult,
  TransactionResult,
  WATTBalance,
  EnergyTransaction,
  WalletProviderProps,
  StellarNetworkConfig,
  WalletEvent,
  FreighterAPI,
  AlbedoAPI,
} from '@/types/wallet';

// Stellar Utilities
export {
  freighterWallet,
  albedoWallet,
  createStellarUtils,
  STELLAR_NETWORKS,
  WATT_ASSET,
  detectStellarNetwork,
  handleWalletError,
  formatAddress,
  formatBalance,
  isValidStellarAddress,
} from '@/lib/stellar';
