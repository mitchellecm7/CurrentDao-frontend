/**
 * Intelligent Cache Manager for CurrentDao Offline Mode
 * Provides 7-day intelligent caching with compression, encryption, and priority-based eviction
 */

import { CacheEntry, CacheConfig, CacheStats, CachePriority, CacheMetadata } from '../../types/offline/offline';

// Compression utilities
const compressData = async (data: any): Promise<{ compressed: Uint8Array; originalSize: number }> => {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(jsonString);
  
  // Simple compression using LZ-string algorithm (in production, use a proper compression library)
  const compressed = await compressString(uint8Array);
  
  return {
    compressed,
    originalSize: uint8Array.length
  };
};

const decompressData = async (compressed: Uint8Array): Promise<any> => {
  const decompressed = await decompressString(compressed);
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(decompressed);
  return JSON.parse(jsonString);
};

// Simple LZ-string compression (placeholder - use proper library in production)
const compressString = async (data: Uint8Array): Promise<Uint8Array> => {
  // This is a simplified compression - in production use a proper library like pako or lz-string
  return data; // Placeholder
};

const decompressString = async (compressed: Uint8Array): Promise<Uint8Array> => {
  // This is a simplified decompression - in production use a proper library
  return compressed; // Placeholder
};

// Encryption utilities
const encryptData = async (data: Uint8Array, key: string): Promise<Uint8Array> => {
  // Simple XOR encryption (in production, use proper encryption like Web Crypto API)
  const keyBytes = new TextEncoder().encode(key);
  const encrypted = new Uint8Array(data.length);
  
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return encrypted;
};

const decryptData = async (encrypted: Uint8Array, key: string): Promise<Uint8Array> => {
  const keyBytes = new TextEncoder().encode(key);
  const decrypted = new Uint8Array(encrypted.length);
  
  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return decrypted;
};

export class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;
  private storage: Storage;
  private encryptionKey: string;
  private stats: CacheStats;
  private lastCleanup: Date;

  constructor(config: CacheConfig, encryptionKey: string = 'currentdao-cache-key') {
    this.config = config;
    this.encryptionKey = encryptionKey;
    this.storage = this.getStorage();
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      evictionCount: 0,
      compressionRatio: 0,
      oldestEntry: new Date(),
      newestEntry: new Date(),
      sizeByPriority: {
        essential: 0,
        important: 0,
        normal: 0,
        low: 0,
      },
    };
    this.lastCleanup = new Date();
  }

  private getStorage(): Storage {
    // Use IndexedDB for better performance and larger storage capacity
    if (typeof indexedDB !== 'undefined') {
      return new IndexedDBStorage('currentdao-cache');
    }
    // Fallback to localStorage
    return new LocalStorageStorage('currentdao-cache');
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      // Check memory cache first
      const memEntry = this.cache.get(key);
      if (memEntry && !this.isExpired(memEntry)) {
        this.updateStats('hit');
        return memEntry.data;
      }

      // Check persistent storage
      const storageEntry = await this.storage.get(key);
      if (storageEntry) {
        // Decrypt and decompress if needed
        let data = storageEntry.data;
        if (this.config.encryptionEnabled) {
          data = await decryptData(data, this.encryptionKey);
        }
        if (this.config.compressionEnabled) {
          data = await decompressData(data);
        }

        const entry: CacheEntry<T> = {
          ...storageEntry,
          data,
        };

        // Update memory cache
        this.cache.set(key, entry);
        this.updateStats('hit');
        return entry.data;
      }

      this.updateStats('miss');
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      this.updateStats('miss');
      return null;
    }
  }

  async set<T>(
    key: string,
    data: T,
    options: {
      expiresAt?: Date;
      priority?: CachePriority;
      metadata?: CacheMetadata;
      tags?: string[];
    } = {}
  ): Promise<void> {
    try {
      const now = new Date();
      const expiresAt = options.expiresAt || new Date(now.getTime() + this.config.maxAge);
      
      let processedData = data;
      let compressedData: Uint8Array;
      let originalSize = 0;

      // Compress data if enabled
      if (this.config.compressionEnabled) {
        const result = await compressData(data);
        compressedData = result.compressed;
        originalSize = result.originalSize;
        processedData = await decompressData(compressedData); // Verify decompression
      }

      // Encrypt data if enabled
      if (this.config.encryptionEnabled) {
        const dataString = JSON.stringify(processedData);
        const uint8Array = new TextEncoder().encode(dataString);
        compressedData = await encryptData(uint8Array, this.encryptionKey);
        originalSize = uint8Array.length;
      }

      const entry: CacheEntry<T> = {
        key,
        data: processedData,
        timestamp: now,
        expiresAt,
        size: compressedData.length || this.calculateSize(data),
        priority: options.priority || 'normal',
        metadata: {
          source: 'user',
          lastModified: now,
          ...options.metadata,
          tags: options.tags || [],
        },
        version: '1.0',
      };

      // Check storage quota
      await this.checkStorageQuota();

      // Add to memory cache
      this.cache.set(key, entry);

      // Add to persistent storage
      await this.storage.set(key, {
        data: compressedData || JSON.stringify(processedData),
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        size: entry.size,
        priority: entry.priority,
        metadata: entry.metadata,
        version: entry.version,
      });

      // Update stats
      this.stats.totalEntries++;
      this.stats.totalSize += entry.size;
      this.stats.sizeByPriority[entry.priority] += entry.size;
      
      if (this.stats.oldestEntry > now || this.stats.totalEntries === 1) {
        this.stats.oldestEntry = now;
      }
      if (this.stats.newestEntry < now || this.stats.totalEntries === 1) {
        this.stats.newestEntry = now;
      }

      // Cleanup if needed
      await this.cleanupIfNeeded();

    } catch (error) {
      console.error('Cache set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      // Remove from memory cache
      const entry = this.cache.get(key);
      if (entry) {
        this.stats.totalEntries--;
        this.stats.totalSize -= entry.size;
        this.stats.sizeByPriority[entry.priority] -= entry.size;
      }

      // Remove from persistent storage
      await this.storage.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      // Clear memory cache
      this.cache.clear();
      
      // Clear persistent storage
      await this.storage.clear();

      // Reset stats
      this.stats = {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        missRate: 0,
        evictionCount: 0,
        compressionRatio: 0,
        oldestEntry: new Date(),
        newestEntry: new Date(),
        sizeByPriority: {
          essential: 0,
          important: 0,
          normal: 0,
          low: 0,
        },
      };
    } catch (error) {
      console.error('Cache clear error:', error);
      throw error;
    }
  }

  async optimize(): Promise<void> {
    try {
      await this.cleanupIfNeeded(true);
    } catch (error) {
      console.error('Cache optimization error:', error);
    }
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private updateStats(type: 'hit' | 'miss' | 'eviction'): void {
    const total = this.stats.hitRate + this.stats.missRate;
    
    switch (type) {
      case 'hit':
        this.stats.hitRate = total > 0 ? (this.stats.hitRate + 1) / total : 1;
        break;
      case 'miss':
        this.stats.missRate = total > 0 ? (this.stats.missRate + 1) / total : 1;
        break;
      case 'eviction':
        this.stats.evictionCount++;
        break;
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return new Date() > entry.expiresAt;
  }

  private calculateSize(data: any): number {
    return JSON.stringify(data).length;
  }

  private async cleanupIfNeeded(force: boolean = false): Promise<void> {
    const now = new Date();
    const timeSinceCleanup = now.getTime() - this.lastCleanup.getTime();
    
    // Cleanup every hour or if forced
    if (!force && timeSinceCleanup < 3600000) {
      return;
    }

    // Check if cleanup is needed
    const needsCleanup = 
      this.stats.totalSize > this.config.maxSize ||
      this.stats.totalEntries > this.config.maxEntries ||
      this.getExpiredEntries().length > 0;

    if (!needsCleanup) {
      this.lastCleanup = now;
      return;
    }

    // Remove expired entries first
    const expiredEntries = this.getExpiredEntries();
    for (const key of expiredEntries) {
      await this.delete(key);
    }

    // If still over limits, remove by priority
    if (this.stats.totalSize > this.config.maxSize || this.stats.totalEntries > this.config.maxEntries) {
      await this.evictByPriority();
    }

    this.lastCleanup = now;
  }

  private getExpiredEntries(): string[] {
    const expired: string[] = [];
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expired.push(key);
      }
    }
    return expired;
  }

  private async evictByPriority(): Promise<void> {
    const entries = Array.from(this.cache.entries());
    
    // Sort by priority (low priority first) and then by age (oldest first)
    entries.sort((a, b) => {
      const priorityOrder = {
        low: 0,
        normal: 1,
        important: 2,
        essential: 3,
      };
      
      const priorityDiff = priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      const ageDiff = a[1].timestamp.getTime() - b[1].timestamp.getTime();
      return ageDiff;
    });

    // Remove entries until under limits
    while (
      (this.stats.totalSize > this.config.maxSize || 
       this.stats.totalEntries > this.config.maxEntries) && 
      entries.length > 0
    ) {
      const [key] = entries.shift()!;
      await this.delete(key);
    }
  }

  private async checkStorageQuota(): Promise<void> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const quota = await navigator.storage.estimate();
        const usage = quota.usage;
        const available = quota.quota;
        
        if (usage / available > 0.9) {
          console.warn('Storage quota nearly exceeded:', `${((usage / available) * 100).toFixed(1)}%`);
        }
      }
    } catch (error) {
      console.warn('Storage quota check failed:', error);
    }
  }

  // Batch operations
  async getMultiple(keys: string[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get(key);
        results[key] = value;
      })
    );
    
    return results;
  }

  async setMultiple(entries: Record<string, any>): Promise<void> {
    await Promise.all(
      Object.entries(entries).map(([key, value]) => this.set(key, value))
    );
  }

  // Cache warming
  async warmCache(keys: string[]): Promise<void> {
    // Preload essential data
    const essentialKeys = keys.filter(key => 
      key.includes('portfolio') || 
      key.includes('market') || 
      key.includes('user')
    );

    for (const key of essentialKeys) {
      // Trigger cache load (data would come from API)
      // This is a placeholder - in practice, you'd fetch from your APIs
      console.log(`Warming cache for key: ${key}`);
    }
  }

  // Cache validation
  async validateCache(): Promise<{
    valid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for corrupted entries
    for (const [key, entry] of this.cache.entries()) {
      try {
        if (this.isExpired(entry)) {
          issues.push(`Expired entry: ${key}`);
        }
        
        // Validate data integrity
        if (entry.data && typeof entry.data === 'object') {
          const size = this.calculateSize(entry.data);
          if (Math.abs(size - entry.size) > 100) { // Allow some variance due to compression
            issues.push(`Size mismatch for entry: ${key}`);
          }
        }
      } catch (error) {
        issues.push(`Corrupted entry: ${key}`);
      }
    }

    // Check compression ratio
    if (this.stats.compressionRatio < 0.3 && this.config.compressionEnabled) {
      recommendations.push('Consider enabling compression for better storage efficiency');
    }

    // Check hit rate
    if (this.stats.hitRate < 0.5) {
      recommendations.push('Consider caching more frequently accessed data');
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations,
    };
  }

  // Cache analytics
  async getAnalytics(): Promise<{
    topCategories: Array<{ category: string; size: number; entries: number; }>;
    performanceMetrics: {
      averageAccessTime: number;
      compressionRatio: number;
      evictionRate: number;
    };
    usagePatterns: Array<{
      key: string;
      accessCount: number;
      lastAccessed: Date;
      category: string;
    }>;
  }> {
    // Analyze cache usage patterns
    const categories: Record<string, { size: number; entries: number; }> = {};
    
    for (const [key, entry] of this.cache.entries()) {
      const category = this.categorizeKey(key);
      if (!categories[category]) {
        categories[category] = { size: 0, entries: 0 };
      }
      
      categories[category].size += entry.size;
      categories[category].entries++;
    }

    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 10)
      .map(([category, stats]) => ({
        category,
        size: stats.size,
        entries: stats.entries,
      }));

    return {
      topCategories,
      performanceMetrics: {
        averageAccessTime: 0, // Would need to track access times
        compressionRatio: this.stats.compressionRatio,
        evictionRate: this.stats.evictionCount / Math.max(1, this.stats.totalEntries),
      },
      usagePatterns: [], // Would need to track access patterns
    };
  }

  private categorizeKey(key: string): string {
    if (key.includes('portfolio')) return 'portfolio';
    if (key.includes('market')) return 'market';
    if (key.includes('user')) return 'user';
    if (key.includes('transaction')) return 'transaction';
    if (key.includes('analytics')) return 'analytics';
    if (key.includes('cache')) return 'cache';
    return 'other';
  }
}

// Storage interfaces
interface Storage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

class IndexedDBStorage implements Storage {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName: string, storeName: string = 'cache') {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1, this.storeName);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      const db = request.result;
      
      if (!db.objectStoreNames.contains(this.storeName)) {
        const store = db.createObjectStore(this.storeName, {
          keyPath: 'id',
          autoIncrement: false,
        });
        
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    });
  }

  async get(key: string): Promise<any> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async set(key: string, value: any): Promise<void> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(value, key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(key: string): Promise<void> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

class LocalStorageStorage implements Storage {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get(key: string): Promise<any> {
    const value = localStorage.getItem(this.getKey(key));
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any): Promise<void> {
    localStorage.setItem(this.getKey(key), JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.getKey(key));
  }

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.prefix)
    );
    
    keys.forEach(key => localStorage.removeItem(key));
  }
}

export default CacheManager;
