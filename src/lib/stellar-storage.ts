import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Account,
  Keypair
} from '@stellar/stellar-sdk';
import {
  StellarAccountData,
  AccountDataEntry,
  IdentityStorageConfig,
  PortableIdentityCredential,
  DIDDocument,
  DIDError
} from '@/types/did';
import { STELLAR_NETWORKS, getHorizonServer } from '@/lib/stellar';

export class StellarIdentityStorage {
  private static instance: StellarIdentityStorage;
  private server: Horizon.Server;
  private network: 'mainnet' | 'testnet';

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.network = network;
    this.server = getHorizonServer(network);
  }

  static getInstance(network?: 'mainnet' | 'testnet'): StellarIdentityStorage {
    if (!StellarIdentityStorage.instance) {
      StellarIdentityStorage.instance = new StellarIdentityStorage(network);
    }
    return StellarIdentityStorage.instance;
  }

  // Store a DID document in Stellar account data
  async storeDIDDocument(
    publicKey: string,
    didDocument: DIDDocument,
    config: IdentityStorageConfig = this.getDefaultConfig()
  ): Promise<string> {
    try {
      const dataKey = `${config.dataKeyPrefix}did_doc`;
      const documentJson = JSON.stringify(didDocument);
      
      let processedValue = documentJson;
      
      // Apply compression if enabled
      if (config.compressionEnabled) {
        processedValue = await this.compressData(documentJson);
      }
      
      // Apply encryption if enabled
      if (config.encryptionEnabled) {
        processedValue = await this.encryptData(processedValue);
      }
      
      // Convert to base64 for Stellar storage
      const base64Value = Buffer.from(processedValue).toString('base64');
      
      // Check size limit
      if (base64Value.length > config.maxDataSize) {
        throw new DIDError('Data exceeds maximum size limit', 'SIZE_LIMIT_EXCEEDED');
      }
      
      // Create and submit transaction
      const transactionHash = await this.setDataEntry(
        publicKey,
        dataKey,
        base64Value,
        'did_document'
      );
      
      return transactionHash;
    } catch (error) {
      throw new DIDError('Failed to store DID document', 'STORAGE_ERROR', error);
    }
  }

  // Retrieve a DID document from Stellar account data
  async retrieveDIDDocument(
    publicKey: string,
    config: IdentityStorageConfig = this.getDefaultConfig()
  ): Promise<DIDDocument | null> {
    try {
      const dataKey = `${config.dataKeyPrefix}did_doc`;
      const dataEntry = await this.getDataEntry(publicKey, dataKey);
      
      if (!dataEntry) {
        return null;
      }
      
      let processedValue = dataEntry.value;
      
      // Decode from base64
      const decodedValue = Buffer.from(processedValue, 'base64').toString();
      
      // Apply decryption if enabled
      if (config.encryptionEnabled) {
        processedValue = await this.decryptData(decodedValue);
      } else {
        processedValue = decodedValue;
      }
      
      // Apply decompression if enabled
      if (config.compressionEnabled) {
        processedValue = await this.decompressData(processedValue);
      }
      
      // Parse JSON
      const didDocument = JSON.parse(processedValue) as DIDDocument;
      
      return didDocument;
    } catch (error) {
      throw new DIDError('Failed to retrieve DID document', 'RETRIEVAL_ERROR', error);
    }
  }

  // Store a portable credential in Stellar account data
  async storeCredential(
    publicKey: string,
    credential: PortableIdentityCredential,
    config: IdentityStorageConfig = this.getDefaultConfig()
  ): Promise<string> {
    try {
      const credentialId = this.generateCredentialId(credential);
      const dataKey = `${config.dataKeyPrefix}credential_${credentialId}`;
      const credentialJson = JSON.stringify(credential);
      
      let processedValue = credentialJson;
      
      // Apply compression if enabled
      if (config.compressionEnabled) {
        processedValue = await this.compressData(credentialJson);
      }
      
      // Apply encryption if enabled
      if (config.encryptionEnabled) {
        processedValue = await this.encryptData(processedValue);
      }
      
      // Convert to base64 for Stellar storage
      const base64Value = Buffer.from(processedValue).toString('base64');
      
      // Check size limit
      if (base64Value.length > config.maxDataSize) {
        throw new DIDError('Credential exceeds maximum size limit', 'SIZE_LIMIT_EXCEEDED');
      }
      
      // Create and submit transaction
      const transactionHash = await this.setDataEntry(
        publicKey,
        dataKey,
        base64Value,
        'credential'
      );
      
      // Update credential index
      await this.updateCredentialIndex(publicKey, credentialId, config);
      
      return transactionHash;
    } catch (error) {
      throw new DIDError('Failed to store credential', 'STORAGE_ERROR', error);
    }
  }

  // Retrieve a portable credential from Stellar account data
  async retrieveCredential(
    publicKey: string,
    credentialId: string,
    config: IdentityStorageConfig = this.getDefaultConfig()
  ): Promise<PortableIdentityCredential | null> {
    try {
      const dataKey = `${config.dataKeyPrefix}credential_${credentialId}`;
      const dataEntry = await this.getDataEntry(publicKey, dataKey);
      
      if (!dataEntry) {
        return null;
      }
      
      let processedValue = dataEntry.value;
      
      // Decode from base64
      const decodedValue = Buffer.from(processedValue, 'base64').toString();
      
      // Apply decryption if enabled
      if (config.encryptionEnabled) {
        processedValue = await this.decryptData(decodedValue);
      } else {
        processedValue = decodedValue;
      }
      
      // Apply decompression if enabled
      if (config.compressionEnabled) {
        processedValue = await this.decompressData(processedValue);
      }
      
      // Parse JSON
      const credential = JSON.parse(processedValue) as PortableIdentityCredential;
      
      return credential;
    } catch (error) {
      throw new DIDError('Failed to retrieve credential', 'RETRIEVAL_ERROR', error);
    }
  }

  // List all stored credentials for an account
  async listCredentials(
    publicKey: string,
    config: IdentityStorageConfig = this.getDefaultConfig()
  ): Promise<string[]> {
    try {
      const indexKey = `${config.dataKeyPrefix}credential_index`;
      const indexEntry = await this.getDataEntry(publicKey, indexKey);
      
      if (!indexEntry) {
        return [];
      }
      
      const indexData = Buffer.from(indexEntry.value, 'base64').toString();
      return JSON.parse(indexData) as string[];
    } catch (error) {
      throw new DIDError('Failed to list credentials', 'LIST_ERROR', error);
    }
  }

  // Delete a credential from Stellar account data
  async deleteCredential(
    publicKey: string,
    credentialId: string,
    config: IdentityStorageConfig = this.getDefaultConfig()
  ): Promise<string> {
    try {
      const dataKey = `${config.dataKeyPrefix}credential_${credentialId}`;
      
      // Create and submit transaction to remove data entry
      const transactionHash = await this.removeDataEntry(publicKey, dataKey);
      
      // Update credential index
      await this.removeFromCredentialIndex(publicKey, credentialId, config);
      
      return transactionHash;
    } catch (error) {
      throw new DIDError('Failed to delete credential', 'DELETION_ERROR', error);
    }
  }

  // Get all account data entries for an account
  async getAccountData(publicKey: string): Promise<StellarAccountData> {
    try {
      const account = await this.server.loadAccount(publicKey);
      const dataEntries: AccountDataEntry[] = [];
      
      if (account.data_attr) {
        for (const [key, value] of Object.entries(account.data_attr)) {
          dataEntries.push({
            key,
            value: value as string,
            type: this.detectDataType(key, value as string),
            lastModified: new Date().toISOString() // Stellar doesn't provide timestamps for data entries
          });
        }
      }
      
      return {
        account: publicKey,
        dataEntries
      };
    } catch (error) {
      throw new DIDError('Failed to get account data', 'ACCOUNT_DATA_ERROR', error);
    }
  }

  // Private helper methods

  private async setDataEntry(
    publicKey: string,
    dataKey: string,
    dataValue: string,
    dataType: string
  ): Promise<string> {
    try {
      const account = await this.server.loadAccount(publicKey);
      
      const transaction = new TransactionBuilder(account, {
        fee: (await this.server.fetchBaseFee()).toString(),
        networkPassphrase: STELLAR_NETWORKS[this.network].passphrase,
      })
        .addOperation(Operation.manageData({
          name: dataKey,
          value: dataValue
        }))
        .setTimeout(30)
        .build();
      
      // In a real implementation, this would be signed by the user's wallet
      // For now, we'll return a placeholder hash
      const placeholderHash = 'tx_' + Date.now().toString();
      
      return placeholderHash;
    } catch (error) {
      throw new DIDError('Failed to set data entry', 'TRANSACTION_ERROR', error);
    }
  }

  private async removeDataEntry(
    publicKey: string,
    dataKey: string
  ): Promise<string> {
    try {
      const account = await this.server.loadAccount(publicKey);
      
      const transaction = new TransactionBuilder(account, {
        fee: (await this.server.fetchBaseFee()).toString(),
        networkPassphrase: STELLAR_NETWORKS[this.network].passphrase,
      })
        .addOperation(Operation.manageData({
          name: dataKey,
          value: null // Setting to null removes the data entry
        }))
        .setTimeout(30)
        .build();
      
      // In a real implementation, this would be signed by the user's wallet
      // For now, we'll return a placeholder hash
      const placeholderHash = 'tx_' + Date.now().toString();
      
      return placeholderHash;
    } catch (error) {
      throw new DIDError('Failed to remove data entry', 'TRANSACTION_ERROR', error);
    }
  }

  private async getDataEntry(
    publicKey: string,
    dataKey: string
  ): Promise<AccountDataEntry | null> {
    try {
      const account = await this.server.loadAccount(publicKey);
      
      if (account.data_attr && account.data_attr[dataKey]) {
        return {
          key: dataKey,
          value: account.data_attr[dataKey] as string,
          type: this.detectDataType(dataKey, account.data_attr[dataKey] as string),
          lastModified: new Date().toISOString()
        };
      }
      
      return null;
    } catch (error) {
      throw new DIDError('Failed to get data entry', 'RETRIEVAL_ERROR', error);
    }
  }

  private async updateCredentialIndex(
    publicKey: string,
    credentialId: string,
    config: IdentityStorageConfig
  ): Promise<void> {
    try {
      const indexKey = `${config.dataKeyPrefix}credential_index`;
      const indexEntry = await this.getDataEntry(publicKey, indexKey);
      
      let credentialIds: string[] = [];
      
      if (indexEntry) {
        const indexData = Buffer.from(indexEntry.value, 'base64').toString();
        credentialIds = JSON.parse(indexData) as string[];
      }
      
      // Add new credential ID if not already present
      if (!credentialIds.includes(credentialId)) {
        credentialIds.push(credentialId);
        
        // Store updated index
        const indexJson = JSON.stringify(credentialIds);
        const indexBase64 = Buffer.from(indexJson).toString('base64');
        
        await this.setDataEntry(publicKey, indexKey, indexBase64, 'json');
      }
    } catch (error) {
      throw new DIDError('Failed to update credential index', 'INDEX_UPDATE_ERROR', error);
    }
  }

  private async removeFromCredentialIndex(
    publicKey: string,
    credentialId: string,
    config: IdentityStorageConfig
  ): Promise<void> {
    try {
      const indexKey = `${config.dataKeyPrefix}credential_index`;
      const indexEntry = await this.getDataEntry(publicKey, indexKey);
      
      if (indexEntry) {
        const indexData = Buffer.from(indexEntry.value, 'base64').toString();
        let credentialIds = JSON.parse(indexData) as string[];
        
        // Remove credential ID
        credentialIds = credentialIds.filter(id => id !== credentialId);
        
        // Store updated index
        const indexJson = JSON.stringify(credentialIds);
        const indexBase64 = Buffer.from(indexJson).toString('base64');
        
        await this.setDataEntry(publicKey, indexKey, indexBase64, 'json');
      }
    } catch (error) {
      throw new DIDError('Failed to remove from credential index', 'INDEX_UPDATE_ERROR', error);
    }
  }

  private generateCredentialId(credential: PortableIdentityCredential): string {
    // Generate a unique ID based on credential hash
    const credentialString = JSON.stringify({
      issuer: credential.issuer,
      subject: credential.credentialSubject.id,
      issuanceDate: credential.issuanceDate,
      type: credential.type
    });
    
    return Buffer.from(credentialString).toString('base64').slice(0, 16);
  }

  private detectDataType(key: string, value: string): 'string' | 'json' | 'did_document' | 'credential' {
    if (key.includes('did_doc')) {
      return 'did_document';
    } else if (key.includes('credential')) {
      return 'credential';
    } else if (key.includes('index')) {
      return 'json';
    }
    
    // Try to parse as JSON
    try {
      JSON.parse(Buffer.from(value, 'base64').toString());
      return 'json';
    } catch {
      return 'string';
    }
  }

  private getDefaultConfig(): IdentityStorageConfig {
    return {
      dataKeyPrefix: 'did_',
      encryptionEnabled: false,
      compressionEnabled: true,
      maxDataSize: 64 * 1024 // 64KB (Stellar limit)
    };
  }

  // Placeholder compression/decompression methods
  private async compressData(data: string): Promise<string> {
    // In a real implementation, this would use a compression library
    return data;
  }

  private async decompressData(data: string): Promise<string> {
    // In a real implementation, this would use a decompression library
    return data;
  }

  // Placeholder encryption/decryption methods
  private async encryptData(data: string): Promise<string> {
    // In a real implementation, this would use proper encryption
    return data;
  }

  private async decryptData(data: string): Promise<string> {
    // In a real implementation, this would use proper decryption
    return data;
  }
}

export const stellarIdentityStorage = StellarIdentityStorage.getInstance();
