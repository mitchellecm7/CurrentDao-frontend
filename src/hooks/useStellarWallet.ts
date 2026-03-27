import { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import {
  WalletState,
  WalletContextType,
  WalletType,
  WalletInfo,
  WalletError,
  TransactionResult,
  ConnectionResult
} from '@/types/wallet';
import {
  freighterWallet,
  albedoWallet,
  createStellarUtils,
  handleWalletError
} from '@/lib/stellar';

// Initial state
const initialState: WalletState = {
  wallet: null,
  balance: [],
  transactions: [],
  isLoading: false,
  error: null,
  network: 'testnet',
};

// Action types
type WalletAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_WALLET'; payload: WalletInfo | null }
  | { type: 'SET_BALANCE'; payload: any[] }
  | { type: 'SET_TRANSACTIONS'; payload: any[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_NETWORK'; payload: 'mainnet' | 'testnet' };

// Reducer
const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_WALLET':
      return { ...state, wallet: action.payload };
    case 'SET_BALANCE':
      return { ...state, balance: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_NETWORK':
      return { ...state, network: action.payload };
    default:
      return state;
  }
};

// Create context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
export const WalletProvider: React.FC<{
  children: ReactNode;
  network?: 'mainnet' | 'testnet';
  autoConnect?: boolean;
}> = ({
  children,
  network = 'testnet',
  autoConnect = false
}) => {
    const [state, dispatch] = useReducer(walletReducer, {
      ...initialState,
      network,
    });

    const stellarUtils = createStellarUtils(network);

    // Auto-connect on mount if enabled
    useEffect(() => {
      if (autoConnect) {
        attemptAutoConnect();
      }
    }, [autoConnect]);

    const attemptAutoConnect = async () => {
      try {
        // Try to connect to Freighter first
        const freighterResult = await freighterWallet.connect(network);
        if (freighterResult.success && freighterResult.wallet) {
          dispatch({ type: 'SET_WALLET', payload: freighterResult.wallet });
          await loadWalletData(freighterResult.wallet.publicKey);
          return;
        }

        // Try Albedo if Freighter fails
        const albedoResult = await albedoWallet.connect(network);
        if (albedoResult.success && albedoResult.wallet) {
          dispatch({ type: 'SET_WALLET', payload: albedoResult.wallet });
          await loadWalletData(albedoResult.wallet.publicKey);
        }
      } catch (error) {
        console.error('Auto-connect failed:', error);
      }
    };

    const loadWalletData = async (publicKey: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        // Load balance and transactions in parallel
        const [balance, transactions] = await Promise.all([
          stellarUtils.getAccountBalance(publicKey),
          stellarUtils.getTransactions(publicKey, 10),
        ]);

        dispatch({ type: 'SET_BALANCE', payload: balance });
        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
      } catch (error) {
        const walletError = handleWalletError(error, 'freighter');
        dispatch({ type: 'SET_ERROR', payload: walletError.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    const connectWallet = async (walletType: WalletType): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        let result: ConnectionResult;

        switch (walletType) {
          case 'freighter':
            result = await freighterWallet.connect(network);
            break;
          case 'albedo':
            result = await albedoWallet.connect(network);
            break;
          default:
            throw new Error(`Unsupported wallet type: ${walletType}`);
        }

        if (result.success && result.wallet) {
          dispatch({ type: 'SET_WALLET', payload: result.wallet });
          await loadWalletData(result.wallet.publicKey);
        } else {
          dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Connection failed' });
        }
      } catch (error) {
        const walletError = handleWalletError(error, walletType);
        dispatch({ type: 'SET_ERROR', payload: walletError.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    const disconnectWallet = async (): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        if (state.wallet) {
          // Disconnect from the appropriate wallet
          if (state.wallet.name?.toLowerCase() === 'freighter') {
            await freighterWallet.disconnect();
          }
          // Albedo doesn't have a specific disconnect method
        }

        // Clear state
        dispatch({ type: 'SET_WALLET', payload: null });
        dispatch({ type: 'SET_BALANCE', payload: [] });
        dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
        dispatch({ type: 'CLEAR_ERROR' });
      } catch (error) {
        const walletError = handleWalletError(error, 'freighter');
        dispatch({ type: 'SET_ERROR', payload: walletError.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    const refreshBalance = async (): Promise<void> => {
      if (!state.wallet) return;

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const balance = await stellarUtils.getAccountBalance(state.wallet.publicKey);
        dispatch({ type: 'SET_BALANCE', payload: balance });
        dispatch({ type: 'CLEAR_ERROR' });
      } catch (error) {
        const walletError = handleWalletError(error, 'freighter');
        dispatch({ type: 'SET_ERROR', payload: walletError.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    const refreshTransactions = async (): Promise<void> => {
      if (!state.wallet) return;

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const transactions = await stellarUtils.getTransactions(state.wallet.publicKey, 10);
        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
        dispatch({ type: 'CLEAR_ERROR' });
      } catch (error) {
        const walletError = handleWalletError(error, 'freighter');
        dispatch({ type: 'SET_ERROR', payload: walletError.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    const sendTransaction = async (
      destination: string,
      amount: string,
      asset?: string
    ): Promise<string> => {
      if (!state.wallet) {
        throw new Error('No wallet connected');
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        // Validate destination address
        if (!stellarUtils.isValidStellarAddress(destination)) {
          throw new Error('Invalid destination address');
        }

        let transactionHash: string;

        // This would need to be implemented with proper transaction building and signing
        // For now, throw an error as a placeholder
        throw new Error('Transaction sending not yet implemented');

        return transactionHash;
      } catch (error) {
        const walletError = handleWalletError(error, 'freighter');
        dispatch({ type: 'SET_ERROR', payload: walletError.message });
        throw walletError;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    const contextValue: WalletContextType = {
      state,
      connectWallet,
      disconnectWallet,
      refreshBalance,
      refreshTransactions,
      sendTransaction,
    };

    return (
      <WalletContext.Provider value= { contextValue } >
      { children }
      </WalletContext.Provider>
  );
};

// Hook to use wallet context
export const useStellarWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useStellarWallet must be used within a WalletProvider');
  }
  return context;
};

// Additional hooks for specific wallet data
export const useWalletInfo = (): WalletInfo | null => {
  const { state } = useStellarWallet();
  return state.wallet;
};

export const useWalletBalance = () => {
  const { state, refreshBalance } = useStellarWallet();
  return {
    balance: state.balance,
    isLoading: state.isLoading,
    error: state.error,
    refreshBalance,
  };
};

export const useWalletTransactions = () => {
  const { state, refreshTransactions } = useStellarWallet();
  return {
    transactions: state.transactions,
    isLoading: state.isLoading,
    error: state.error,
    refreshTransactions,
  };
};

export const useIsWalletConnected = (): boolean => {
  const { state } = useStellarWallet();
  return !!state.wallet?.isConnected;
};

export const useWalletAddress = (): string | null => {
  const { state } = useStellarWallet();
  return state.wallet?.publicKey || null;
};

// Hook for wallet availability
export const useWalletAvailability = () => {
  const [freighterAvailable, setFreighterAvailable] = useState(false);
  const [albedoAvailable, setAlbedoAvailable] = useState(false);

  useEffect(() => {
    const checkWalletAvailability = async () => {
      const freighter = await freighterWallet.isAvailable();
      const albedo = await albedoWallet.connect(); // Albedo loads on demand

      setFreighterAvailable(freighter);
      setAlbedoAvailable(true); // Albedo is always available (loads SDK)
    };

    checkWalletAvailability();
  }, []);

  return {
    freighterAvailable,
    albedoAvailable,
  };
};

// Hook for transaction history with pagination
export const useTransactionHistory = (limit: number = 10) => {
  const { state, refreshTransactions } = useStellarWallet();
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = async () => {
    if (!state.wallet || loadingMore) return;

    try {
      setLoadingMore(true);
      const stellarUtils = createStellarUtils(state.network);
      const moreTransactions = await stellarUtils.getTransactions(
        state.wallet.publicKey,
        state.transactions.length + limit
      );

      // This would update the transactions with the new ones
      // For now, just refresh
      await refreshTransactions();
    } catch (error) {
      console.error('Failed to load more transactions:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  return {
    transactions: state.transactions.slice(0, limit),
    loadingMore,
    loadMore,
    hasMore: state.transactions.length > limit,
  };
};
