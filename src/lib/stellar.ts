import { 
  Horizon, 
  Server, 
  TransactionBuilder, 
  Networks, 
  Asset,
  Account,
  Keypair,
  Operation,
  Memo,
  MemoType
} from '@stellar/stellar-sdk';
import { 
  WalletInfo, 
  WalletBalance, 
  StellarTransaction, 
  StellarNetworkConfig,
  WalletError,
  ConnectionResult,
  TransactionResult,
  WATTBalance
} from '@/types/wallet';

// Stellar network configurations
export const STELLAR_NETWORKS: Record<string, StellarNetworkConfig> = {
  mainnet: {
    network: 'mainnet',
    horizonUrl: 'https://horizon.stellar.org',
    passphrase: Networks.PUBLIC,
  },
  testnet: {
    network: 'testnet',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    passphrase: Networks.TESTNET,
  },
};

// WATT token configuration (this would be your actual token details)
export const WATT_ASSET = {
  code: 'WATT',
  issuer: 'GD5...YOUR_WATT_ISSUER...', // Replace with actual WATT token issuer
};

// Initialize Horizon server
export const getHorizonServer = (network: 'mainnet' | 'testnet' = 'testnet'): Server => {
  const config = STELLAR_NETWORKS[network];
  return new Server(config.horizonUrl);
};

// Freighter wallet integration
export class FreighterWallet {
  private static instance: FreighterWallet;
  
  static getInstance(): FreighterWallet {
    if (!FreighterWallet.instance) {
      FreighterWallet.instance = new FreighterWallet();
    }
    return FreighterWallet.instance;
  }

  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
      return !!(window as any).freighter;
    } catch {
      return false;
    }
  }

  async isConnected(): Promise<boolean> {
    if (!await this.isAvailable()) return false;
    
    try {
      const isAllowed = await (window as any).freighter.isAllowed();
      return isAllowed;
    } catch {
      return false;
    }
  }

  async connect(network: 'mainnet' | 'testnet' = 'testnet'): Promise<ConnectionResult> {
    try {
      if (!await this.isAvailable()) {
        return {
          success: false,
          error: {
            code: 'FREIGHTER_NOT_AVAILABLE',
            message: 'Freighter wallet is not installed or available',
          },
        };
      }

      const isAllowed = await (window as any).freighter.isAllowed();
      if (!isAllowed) {
        await (window as any).freighter.connect();
      }

      const publicKey = await (window as any).freighter.getPublicKey();
      
      if (!publicKey) {
        return {
          success: false,
          error: {
            code: 'CONNECTION_FAILED',
            message: 'Failed to get public key from Freighter',
          },
        };
      }

      const wallet: WalletInfo = {
        publicKey,
        name: 'Freighter',
        isConnected: true,
        network,
      };

      return { success: true, wallet };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FREIGHTER_CONNECTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to connect to Freighter',
          details: error,
        },
      };
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (await this.isAvailable()) {
        await (window as any).freighter.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting Freighter:', error);
    }
  }

  async signTransaction(xdr: string, network: 'mainnet' | 'testnet' = 'testnet'): Promise<string> {
    try {
      const signedXdr = await (window as any).freighter.signTransaction(xdr, {
        network,
      });
      return signedXdr;
    } catch (error) {
      throw new Error(`Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Albedo wallet integration
export class AlbedoWallet {
  private static instance: AlbedoWallet;
  
  static getInstance(): AlbedoWallet {
    if (!AlbedoWallet.instance) {
      AlbedoWallet.instance = new AlbedoWallet();
    }
    return AlbedoWallet.instance;
  }

  async connect(network: 'mainnet' | 'testnet' = 'testnet'): Promise<ConnectionResult> {
    try {
      if (typeof window === 'undefined') {
        return {
          success: false,
          error: {
            code: 'ALBEDO_NOT_AVAILABLE',
            message: 'Albedo wallet requires browser environment',
          },
        };
      }

      // Load Albedo SDK
      await this.loadAlbedoSDK();
      
      const result = await (window as any).albedo.publicKey();
      
      if (!result || !result.publicKey) {
        return {
          success: false,
          error: {
            code: 'CONNECTION_FAILED',
            message: 'Failed to get public key from Albedo',
          },
        };
      }

      const wallet: WalletInfo = {
        publicKey: result.publicKey,
        name: 'Albedo',
        isConnected: true,
        network,
      };

      return { success: true, wallet };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ALBEDO_CONNECTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to connect to Albedo',
          details: error,
        },
      };
    }
  }

  private async loadAlbedoSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).albedo) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://albedo.link/lib/albedo.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async signTransaction(xdr: string, network: 'mainnet' | 'testnet' = 'testnet'): Promise<string> {
    try {
      const result = await (window as any).albedo.sign({
        xdr,
        network,
      });
      return result.signed_xdr;
    } catch (error) {
      throw new Error(`Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Stellar utility functions
export class StellarUtils {
  private server: Server;
  private network: 'mainnet' | 'testnet';

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.network = network;
    this.server = getHorizonServer(network);
  }

  async getAccountBalance(publicKey: string): Promise<WalletBalance[]> {
    try {
      const account = await this.server.loadAccount(publicKey);
      return account.balances.map((balance: any) => ({
        asset_code: balance.asset_code || 'XLM',
        asset_issuer: balance.asset_issuer,
        balance: balance.balance,
        asset_type: balance.asset_type,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch account balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTransactions(publicKey: string, limit: number = 10): Promise<StellarTransaction[]> {
    try {
      const transactions = await this.server
        .transactions()
        .forAccount(publicKey)
        .limit(limit)
        .order('desc')
        .call();

      return transactions.records.map((tx: any) => ({
        id: tx.id,
        hash: tx.hash,
        successful: tx.successful,
        source_account: tx.source_account,
        created_at: tx.created_at,
        transaction_envelope: tx.envelope_xdr,
        memo: tx.memo,
        operations: tx.operations.map((op: any) => ({
          id: op.id,
          type: op.type,
          source_account: op.source_account,
          created_at: op.created_at,
          transaction_hash: op.transaction_hash,
          asset_code: op.asset_code,
          amount: op.amount,
          from: op.from,
          to: op.to,
        })),
        fee_paid: tx.fee_paid,
        fee_charged: tx.fee_charged,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sendPayment(
    sourcePublicKey: string,
    destinationPublicKey: string,
    amount: string,
    asset: Asset = Asset.native(),
    memo?: string
  ): Promise<string> {
    try {
      const sourceAccount = await this.server.loadAccount(sourcePublicKey);
      
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: await this.server.fetchBaseFee(),
        networkPassphrase: STELLAR_NETWORKS[this.network].passphrase,
      })
        .addOperation(Operation.payment({
          destination: destinationPublicKey,
          asset,
          amount,
        }))
        .setTimeout(30)
        .build();

      if (memo) {
        transaction.addMemo(Memo.text(memo));
      }

      const transactionXDR = transaction.toXDR();
      const signedTransactionXDR = await this.signTransaction(transactionXDR);
      
      const signedTransaction = TransactionBuilder.fromXDR(signedTransactionXDR, STELLAR_NETWORKS[this.network].passphrase);
      const result = await this.server.submitTransaction(signedTransaction);
      
      return result.hash;
    } catch (error) {
      throw new Error(`Failed to send payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async signTransaction(xdr: string): Promise<string> {
    // This would be implemented based on the connected wallet
    // For now, return a placeholder
    throw new Error('No wallet connected for signing');
  }

  async getWATTBalance(publicKey: string): Promise<WATTBalance | null> {
    try {
      const balances = await this.getAccountBalance(publicKey);
      const wattBalance = balances.find(
        (balance) => balance.asset_code === WATT_ASSET.code && 
                     balance.asset_issuer === WATT_ASSET.issuer
      );

      if (!wattBalance) {
        return null;
      }

      return {
        balance: wattBalance.balance,
        available: wattBalance.balance, // Simplified - would calculate available balance
        reserved: '0',
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to fetch WATT balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  formatAddress(address: string, truncate: boolean = true): string {
    if (!truncate || address.length <= 10) return address;
    
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  formatBalance(balance: string, decimals: number = 7): string {
    const num = parseFloat(balance);
    return num.toFixed(decimals).replace(/\.?0+$/, '');
  }

  isValidStellarAddress(address: string): boolean {
    try {
      Keypair.fromPublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  async getAccountInfo(publicKey: string): Promise<Account> {
    try {
      return await this.server.loadAccount(publicKey);
    } catch (error) {
      throw new Error(`Failed to fetch account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export utility functions
export const createStellarUtils = (network: 'mainnet' | 'testnet' = 'testnet') => {
  return new StellarUtils(network);
};

export const freighterWallet = FreighterWallet.getInstance();
export const albedoWallet = AlbedoWallet.getInstance();

// Network detection and switching
export const detectStellarNetwork = (): 'mainnet' | 'testnet' => {
  // In production, this would check environment variables or config
  return process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet';
};

// Error handling utilities
export const handleWalletError = (error: any, walletType: 'freighter' | 'albedo'): WalletError => {
  if (error instanceof Error) {
    return {
      code: 'WALLET_ERROR',
      message: error.message,
      details: error,
      walletType,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    details: error,
    walletType,
  };
};
