import {
  StellarAccountData,
  AccountDataEntry,
  IdentityStorageConfig,
  PortableIdentityCredential,
  DIDDocument,
  DIDError
} from '../types/did';

export class SimpleStellarIdentityStorage {
  private static instance: SimpleStellarIdentityStorage;
  private network: 'mainnet' | 'testnet';

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.network = network;
  }

  static getInstance(network?: 'mainnet' | 'testnet'): SimpleStellarIdentityStorage {
    if (!SimpleStellarIdentityStorage.instance) {
      SimpleStellarIdentityStorage.instance = new SimpleStellarIdentityStorage(network);
    }
    return SimpleStellarIdentityStorage.instance;
  }

  // Store a DID document in localStorage (fallback for development)
  async storeDIDDocument(
    publicKey: string,
    didDocument: DIDDocument,
    config: IdentityStorageConfig = this.getDefaultConfig()
  ): Promise<string> {
    try {
      const dataKey = `${config.dataKeyPrefix}did_doc_${publicKey}`;
      const documentJson = JSON.stringify(didDocument);
      
      let processedValue = documentJson;
      
      // Apply compression if enabled (placeholder)
      if (config.compressionEnabled) {
        processedValue = await this.compressData(documentJson);
      }
      
      // Apply encryption if enabled (placeholder)
      if (config.encryptionEnabled) {
        processedValue = await this.encryptData(processedValue);
      }
      
      // Convert to base64 for storage
      const base64Value = btoa(processedValue);
      
      // Check size limit
      if (base64Value.length > config.maxDataSize) {
        throw new DIDError('Data exceeds maximum size limit', 'SIZE_LIMIT_EXCEEDED');
      }
      
      // Store in localStorage (in production, this would be on Stellar)
      localStorage.setItem(dataKey, base64Value);
      
      // Return a placeholder transaction hash
      const transactionHash = 'tx_' + Date.now().toString();
      return transactionHash;
    } catch (error) {
      throw new DIDError('Failed to store DID document', 'STORAGE_ERROR', error);
    }
  }

  // Retrieve a DID document from localStorage
  async retrieveDIDDocument(
    publicKey: string,
    config: IdentityStorageConfig = this.getDefaultConfig()
  ): Promise<DIDDocument | null> {
    try {
      const dataKey = `${config.dataKeyPrefix}did_doc_${publicKey}`;
      const base64Value = localStorage.getItem(dataKey);
      
      if (!base64Value) {
        return null;
      }
      
      let processedValue = base64Value;
      
      // Decode from base64
      const decodedValue = atob(base64Value);
      
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

  // Store a portable credential in localStorage
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
      
      // Convert to base64 for storage
      const base64Value = btoa(processedValue);
      
      // Check size limit
      if (base64Value.length > config.maxDataSize) {
        throw new DIDError('Credential exceeds maximum size limit', 'SIZE_LIMIT_EXCEEDED');
      }
      
      // Store in localStorage
      localStorage.setItem(dataKey, base64Value);
      
      // Update credential index
      await this.updateCredentialIndex(publicKey, credentialId, config);
      
      // Return a placeholder transaction hash
      const transactionHash = 'tx_' + Date.now().toString();
      return transactionHash;
    } catch (error) {
      throw new DIDError('Failed to store credential', 'STORAGE_ERROR', error);
    }
  }

  // Retrieve a portable credential from localStorage
  async retrieveCredential(
    publicKey: string,
    credentialId: string,
    config: IdentityStorageConfig = this.getDefaultConfig()
  ): Promise<PortableIdentityCredential | null> {
    try {
      const dataKey = `${config.dataKeyPrefix}credential_${credentialId}`;
      const base64Value = localStorage.getItem(dataKey);
      
      if (!base64Value) {
        return null;
      }
      
      let processedValue = base64Value;
      
      // Decode from base64
      const decodedValue = atob(base64Value);
      
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
      const indexKey = `${config.dataKeyPrefix}credential_index_${publicKey}`;
      const indexData = localStorage.getItem(indexKey);
      
      if (!indexData) {
        return [];
      }
      
      const decodedIndex = atob(indexData);
      return JSON.parse(decodedIndex) as string[];
    } catch (error) {
      throw new DIDError('Failed to list credentials', 'LIST_ERROR', error);
    }
  }

  // Delete a credential from localStorage
  async deleteCredential(
    publicKey: string,
    credentialId: string,
    config: IdentityStorageConfig = this.getDefaultConfig()
  ): Promise<string> {
    try {
      const dataKey = `${config.dataKeyPrefix}credential_${credentialId}`;
      
      // Remove from localStorage
      localStorage.removeItem(dataKey);
      
      // Update credential index
      await this.removeFromCredentialIndex(publicKey, credentialId, config);
      
      // Return a placeholder transaction hash
      const transactionHash = 'tx_' + Date.now().toString();
      return transactionHash;
    } catch (error) {
      throw new DIDError('Failed to delete credential', 'DELETION_ERROR', error);
    }
  }

  // Get all account data entries for an account (mock implementation)
  async getAccountData(publicKey: string): Promise<StellarAccountData> {
    try {
      const dataEntries: AccountDataEntry[] = [];
      
      // Get all localStorage keys that match our pattern
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(publicKey)) {
          const value = localStorage.getItem(key);
          if (value) {
            dataEntries.push({
              key,
              value,
              type: this.detectDataType(key, value),
              lastModified: new Date().toISOString()
            });
          }
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

  private async updateCredentialIndex(
    publicKey: string,
    credentialId: string,
    config: IdentityStorageConfig
  ): Promise<void> {
    try {
      const indexKey = `${config.dataKeyPrefix}credential_index_${publicKey}`;
      const indexData = localStorage.getItem(indexKey);
      
      let credentialIds: string[] = [];
      
      if (indexData) {
        const decodedIndex = atob(indexData);
        credentialIds = JSON.parse(decodedIndex) as string[];
      }
      
      // Add new credential ID if not already present
      if (credentialIds.indexOf(credentialId) === -1) {
        credentialIds.push(credentialId);
        
        // Store updated index
        const indexJson = JSON.stringify(credentialIds);
        const indexBase64 = btoa(indexJson);
        
        localStorage.setItem(indexKey, indexBase64);
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
      const indexKey = `${config.dataKeyPrefix}credential_index_${publicKey}`;
      const indexData = localStorage.getItem(indexKey);
      
      if (indexData) {
        const decodedIndex = atob(indexData);
        let credentialIds = JSON.parse(decodedIndex) as string[];
        
        // Remove credential ID
        credentialIds = credentialIds.filter(id => id !== credentialId);
        
        // Store updated index
        const indexJson = JSON.stringify(credentialIds);
        const indexBase64 = btoa(indexJson);
        
        localStorage.setItem(indexKey, indexBase64);
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
    
    return btoa(credentialString).slice(0, 16);
  }

  private detectDataType(key: string, value: string): 'string' | 'json' | 'did_document' | 'credential' {
    if (key.indexOf('did_doc') !== -1) {
      return 'did_document';
    } else if (key.indexOf('credential') !== -1) {
      return 'credential';
    } else if (key.indexOf('index') !== -1) {
      return 'json';
    }
    
    // Try to parse as JSON
    try {
      JSON.parse(atob(value));
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

export const simpleStellarIdentityStorage = SimpleStellarIdentityStorage.getInstance();
