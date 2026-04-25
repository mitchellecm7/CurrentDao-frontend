/**
 * Data Freshness Indicators for CurrentDao Offline Mode
 * Provides data freshness tracking, reliability assessment, and cache management
 */

import {
  DataFreshness,
  FreshnessLevel,
  ReliabilityLevel,
  FreshnessConfig,
  CacheEntry
} from '../../types/offline/offline';

export class DataFreshnessManager {
  private config: FreshnessConfig;
  private freshnessMap: Map<string, DataFreshness> = new Map();
  private reliabilityFactors: Map<string, number> = new Map();
  private lastUpdate: Date;

  constructor(config: FreshnessConfig) {
    this.config = config;
    this.lastUpdate = new Date();
    
    // Initialize reliability factors
    this.initializeReliabilityFactors();
  }

  private initializeReliabilityFactors(): void {
    // Set default reliability factors for different data sources
    this.reliabilityFactors.set('api', 0.95);
    this.reliabilityFactors.set('cache', 0.85);
    this.reliabilityFactors.set('websocket', 0.98);
    this.reliabilityFactors.set('localStorage', 0.70);
    this.reliabilityFactors.set('indexedDB', 0.80);
    this.reliabilityFactors.set('memory', 0.90);
  }

  getFreshness(key: string): DataFreshness {
    const freshness = this.freshnessMap.get(key);
    
    if (!freshness) {
      return this.createDefaultFreshness(key);
    }

    // Update freshness based on age
    const updatedFreshness = this.updateFreshness(freshness);
    this.freshnessMap.set(key, updatedFreshness);
    
    return updatedFreshness;
  }

  updateFreshness(key: string, timestamp?: Date): void {
    const now = new Date();
    const updateTimestamp = timestamp || now;
    
    const freshness: DataFreshness = {
      lastUpdate: updateTimestamp,
      age: now.getTime() - updateTimestamp.getTime(),
      freshness: this.calculateFreshnessLevel(now, updateTimestamp),
      reliability: this.calculateReliabilityLevel(key, updateTimestamp),
      nextUpdate: this.calculateNextUpdate(updateTimestamp),
      source: this.getSourceFromKey(key),
    };

    this.freshnessMap.set(key, freshness);
    this.lastUpdate = now;
  }

  checkAll(): Record<string, DataFreshness> {
    const result: Record<string, DataFreshness> = {};
    
    for (const [key, freshness] of this.freshnessMap.entries()) {
      result[key] = this.updateFreshness(freshness);
    }
    
    return result;
  }

  getStaleKeys(threshold?: FreshnessLevel): string[] {
    const staleThreshold = threshold || 'stale';
    const staleKeys: string[] = [];
    
    for (const [key, freshness] of this.freshnessMap.entries()) {
      const updatedFreshness = this.updateFreshness(freshness);
      
      if (this.isStale(updatedFreshness.freshness, staleThreshold)) {
        staleKeys.push(key);
      }
    }
    
    return staleKeys;
  }

  getReliabilityScore(key: string): number {
    const freshness = this.getFreshness(key);
    return freshness.reliability === 'high' ? 0.95 :
           freshness.reliability === 'medium' ? 0.80 :
           freshness.reliability === 'low' ? 0.60 :
           freshness.reliability === 'very_low' ? 0.40 : 0.50;
  }

  getFreshnessScore(key: string): number {
    const freshness = this.getFreshness(key);
    return freshness.freshness === 'realtime' ? 1.0 :
           freshness.freshness === 'fresh' ? 0.85 :
           freshness.freshness === 'stale' ? 0.60 :
           freshness.freshness === 'very_stale' ? 0.35 :
           freshness.freshness === 'expired' ? 0.10 : 0.50;
  }

  getCompositeScore(key: string): number {
    const freshnessScore = this.getFreshnessScore(key);
    const reliabilityScore = this.getReliabilityScore(key);
    
    // Weight freshness more heavily (70%) than reliability (30%)
    return (freshnessScore * 0.7) + (reliabilityScore * 0.3);
  }

  getRecommendations(key: string): string[] {
    const freshness = this.getFreshness(key);
    const recommendations: string[] = [];
    
    switch (freshness.freshness) {
      case 'expired':
        recommendations.push('Data is expired - refresh immediately');
        recommendations.push('Consider clearing cache and re-fetching');
        break;
      case 'very_stale':
        recommendations.push('Data is very stale - refresh recommended');
        recommendations.push('Check network connectivity');
        break;
      case 'stale':
        recommendations.push('Data is stale - consider refreshing');
        break;
      case 'fresh':
        recommendations.push('Data is fresh - no action needed');
        break;
      case 'realtime':
        recommendations.push('Data is real-time - optimal');
        break;
    }
    
    switch (freshness.reliability) {
      case 'very_low':
        recommendations.push('Data reliability is very low - verify source');
        recommendations.push('Consider using alternative data source');
        break;
      case 'low':
        recommendations.push('Data reliability is low - use with caution');
        break;
      case 'medium':
        recommendations.push('Data reliability is medium - acceptable');
        break;
      case 'high':
        recommendations.push('Data reliability is high - trustworthy');
        break;
    }
    
    return recommendations;
  }

  shouldRefresh(key: string, threshold?: FreshnessLevel): boolean {
    const freshness = this.getFreshness(key);
    const refreshThreshold = threshold || 'stale';
    
    return this.isStale(freshness.freshness, refreshThreshold);
  }

  getOptimalRefreshTime(key: string): Date {
    const freshness = this.getFreshness(key);
    const source = freshness.source;
    const reliabilityFactor = this.reliabilityFactors.get(source) || 0.8;
    
    // Calculate optimal refresh interval based on source reliability
    const baseInterval = 60000; // 1 minute
    const reliabilityMultiplier = 1 / reliabilityFactor;
    const freshnessMultiplier = this.getFreshnessMultiplier(freshness.freshness);
    
    const optimalInterval = baseInterval * reliabilityMultiplier * freshnessMultiplier;
    
    return new Date(freshness.lastUpdate.getTime() + optimalInterval);
  }

  batchUpdate(entries: Array<{ key: string; timestamp?: Date; source?: string }>): void {
    for (const entry of entries) {
      this.updateFreshness(entry.key, entry.timestamp);
    }
  }

  cleanup(maxAge: number): void {
    const now = new Date();
    const keysToDelete: string[] = [];
    
    for (const [key, freshness] of this.freshnessMap.entries()) {
      if (now.getTime() - freshness.lastUpdate.getTime() > maxAge) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.freshnessMap.delete(key);
    }
  }

  getStats(): {
    totalEntries: number;
    averageAge: number;
    freshnessDistribution: Record<FreshnessLevel, number>;
    reliabilityDistribution: Record<ReliabilityLevel, number>;
    sourceDistribution: Record<string, number>;
    lastUpdate: Date;
  } {
    const entries = Array.from(this.freshnessMap.values());
    
    const freshnessDistribution: Record<FreshnessLevel, number> = {
      realtime: 0,
      fresh: 0,
      stale: 0,
      very_stale: 0,
      expired: 0,
      unknown: 0,
    };
    
    const reliabilityDistribution: Record<ReliabilityLevel, number> = {
      high: 0,
      medium: 0,
      low: 0,
      very_low: 0,
      unknown: 0,
    };
    
    const sourceDistribution: Record<string, number> = {};
    
    let totalAge = 0;
    
    for (const freshness of entries) {
      totalAge += freshness.age;
      
      freshnessDistribution[freshness.freshness]++;
      reliabilityDistribution[freshness.reliability]++;
      
      sourceDistribution[freshness.source] = (sourceDistribution[freshness.source] || 0) + 1;
    }
    
    return {
      totalEntries: entries.length,
      averageAge: entries.length > 0 ? totalAge / entries.length : 0,
      freshnessDistribution,
      reliabilityDistribution,
      sourceDistribution,
      lastUpdate: this.lastUpdate,
    };
  }

  private createDefaultFreshness(key: string): DataFreshness {
    const now = new Date();
    const source = this.getSourceFromKey(key);
    
    return {
      lastUpdate: now,
      age: 0,
      freshness: 'unknown',
      reliability: this.calculateReliabilityLevel(key, now),
      source,
    };
  }

  private updateFreshness(freshness: DataFreshness): DataFreshness {
    const now = new Date();
    const age = now.getTime() - freshness.lastUpdate.getTime();
    
    return {
      ...freshness,
      age,
      freshness: this.calculateFreshnessLevel(now, freshness.lastUpdate),
      reliability: this.calculateReliabilityLevel(freshness.source, freshness.lastUpdate),
      nextUpdate: this.calculateNextUpdate(freshness.lastUpdate),
    };
  }

  private calculateFreshnessLevel(now: Date, lastUpdate: Date): FreshnessLevel {
    const age = now.getTime() - lastUpdate.getTime();
    
    if (age <= this.config.realtimeThreshold) return 'realtime';
    if (age <= this.config.freshThreshold) return 'fresh';
    if (age <= this.config.staleThreshold) return 'stale';
    if (age <= this.config.veryStaleThreshold) return 'very_stale';
    if (age <= this.config.expiredThreshold) return 'expired';
    return 'unknown';
  }

  private calculateReliabilityLevel(keyOrSource: string, lastUpdate: Date): ReliabilityLevel {
    const source = typeof keyOrSource === 'string' ? keyOrSource : this.getSourceFromKey(keyOrSource);
    const baseReliability = this.reliabilityFactors.get(source) || 0.5;
    
    // Adjust reliability based on age
    const age = Date.now() - lastUpdate.getTime();
    const ageFactor = Math.max(0, 1 - (age / (24 * 60 * 60 * 1000))); // Decay over 24 hours
    
    const adjustedReliability = baseReliability * ageFactor;
    
    if (adjustedReliability >= 0.95) return 'high';
    if (adjustedReliability >= 0.80) return 'medium';
    if (adjustedReliability >= 0.60) return 'low';
    if (adjustedReliability >= 0.40) return 'very_low';
    return 'unknown';
  }

  private calculateNextUpdate(lastUpdate: Date): Date {
    const source = this.getSourceFromKey(lastUpdate.toString());
    const reliability = this.reliabilityFactors.get(source) || 0.5;
    
    // Calculate next update time based on source reliability
    const baseInterval = 60000; // 1 minute
    const reliabilityMultiplier = 1 / reliability;
    const interval = baseInterval * reliabilityMultiplier;
    
    return new Date(lastUpdate.getTime() + interval);
  }

  private getSourceFromKey(key: string): string {
    if (key.includes('api')) return 'api';
    if (key.includes('cache')) return 'cache';
    if (key.includes('websocket') || key.includes('ws')) return 'websocket';
    if (key.includes('localStorage')) return 'localStorage';
    if (key.includes('indexedDB') || key.includes('idb')) return 'indexedDB';
    if (key.includes('memory')) return 'memory';
    return 'unknown';
  }

  private isStale(currentLevel: FreshnessLevel, threshold: FreshnessLevel): boolean {
    const levels = ['realtime', 'fresh', 'stale', 'very_stale', 'expired'];
    const currentIndex = levels.indexOf(currentLevel);
    const thresholdIndex = levels.indexOf(threshold);
    
    return currentIndex >= thresholdIndex;
  }

  private getFreshnessMultiplier(freshness: FreshnessLevel): number {
    const multipliers = {
      realtime: 0.5,    // Refresh more frequently
      fresh: 1.0,       // Normal refresh
      stale: 2.0,       // Refresh less frequently
      very_stale: 4.0,  // Refresh much less frequently
      expired: 8.0,     // Refresh very infrequently
      unknown: 2.0,     // Default to less frequent
    };
    
    return multipliers[freshness] || 2.0;
  }

  setReliabilityFactor(source: string, factor: number): void {
    this.reliabilityFactors.set(source, Math.max(0, Math.min(1, factor)));
  }

  getReliabilityFactor(source: string): number {
    return this.reliabilityFactors.get(source) || 0.5;
  }

  configure(config: Partial<FreshnessConfig>): void {
    this.config = { ...this.config, ...config };
  }

  export(): string {
    const data = {
      config: this.config,
      freshnessMap: Object.fromEntries(this.freshnessMap),
      reliabilityFactors: Object.fromEntries(this.reliabilityFactors),
      lastUpdate: this.lastUpdate,
    };
    
    return JSON.stringify(data);
  }

  import(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.config) {
        this.config = { ...this.config, ...parsed.config };
      }
      
      if (parsed.freshnessMap) {
        this.freshnessMap = new Map(Object.entries(parsed.freshnessMap));
      }
      
      if (parsed.reliabilityFactors) {
        this.reliabilityFactors = new Map(Object.entries(parsed.reliabilityFactors));
      }
      
      if (parsed.lastUpdate) {
        this.lastUpdate = new Date(parsed.lastUpdate);
      }
    } catch (error) {
      console.error('Failed to import data freshness data:', error);
    }
  }
}

// Freshness indicator utilities
export class FreshnessIndicator {
  private static getFreshnessColor(freshness: FreshnessLevel): string {
    const colors = {
      realtime: '#10b981', // green
      fresh: '#3b82f6',    // blue
      stale: '#f59e0b',     // yellow
      very_stale: '#f97316', // orange
      expired: '#ef4444',   // red
      unknown: '#6b7280',   // gray
    };
    
    return colors[freshness] || colors.unknown;
  }

  private static getReliabilityColor(reliability: ReliabilityLevel): string {
    const colors = {
      high: '#10b981',      // green
      medium: '#3b82f6',    // blue
      low: '#f59e0b',       // yellow
      very_low: '#ef4444',  // red
      unknown: '#6b7280',   // gray
    };
    
    return colors[reliability] || colors.unknown;
  }

  static getIndicator(freshness: DataFreshness): {
    color: string;
    icon: string;
    text: string;
    description: string;
  } {
    const freshnessColor = this.getFreshnessColor(freshness.freshness);
    const reliabilityColor = this.getReliabilityColor(freshness.reliability);
    
    const freshnessIcons = {
      realtime: '🟢',
      fresh: '🔵',
      stale: '🟡',
      very_stale: '🟠',
      expired: '🔴',
      unknown: '⚪',
    };
    
    const reliabilityIcons = {
      high: '✓',
      medium: '~',
      low: '!',
      very_low: '✗',
      unknown: '?',
    };
    
    const freshnessText = {
      realtime: 'Real-time',
      fresh: 'Fresh',
      stale: 'Stale',
      very_stale: 'Very Stale',
      expired: 'Expired',
      unknown: 'Unknown',
    };
    
    const reliabilityText = {
      high: 'High Reliability',
      medium: 'Medium Reliability',
      low: 'Low Reliability',
      very_low: 'Very Low Reliability',
      unknown: 'Unknown Reliability',
    };
    
    return {
      color: freshnessColor,
      icon: `${freshnessIcons[freshness.freshness]} ${reliabilityIcons[freshness.reliability]}`,
      text: `${freshnessText[freshness.freshness]} - ${reliabilityText[freshness.reliability]}`,
      description: `Last updated ${this.formatAge(freshness.age)} ago. Source: ${freshness.source}`,
    };
  }

  static getProgressBar(freshness: DataFreshness): {
    percentage: number;
    color: string;
    label: string;
  } {
    const freshnessScore = this.getFreshnessScore(freshness.freshness);
    const reliabilityScore = this.getReliabilityScore(freshness.reliability);
    const compositeScore = (freshnessScore * 0.7) + (reliabilityScore * 0.3);
    
    let color: string;
    let label: string;
    
    if (compositeScore >= 0.8) {
      color = '#10b981';
      label = 'Excellent';
    } else if (compositeScore >= 0.6) {
      color = '#3b82f6';
      label = 'Good';
    } else if (compositeScore >= 0.4) {
      color = '#f59e0b';
      label = 'Fair';
    } else if (compositeScore >= 0.2) {
      color = '#f97316';
      label = 'Poor';
    } else {
      color = '#ef4444';
      label = 'Very Poor';
    }
    
    return {
      percentage: Math.round(compositeScore * 100),
      color,
      label,
    };
  }

  private static formatAge(age: number): string {
    const seconds = Math.floor(age / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
  }

  private static getFreshnessScore(freshness: FreshnessLevel): number {
    const scores = {
      realtime: 1.0,
      fresh: 0.85,
      stale: 0.60,
      very_stale: 0.35,
      expired: 0.10,
      unknown: 0.50,
    };
    
    return scores[freshness] || 0.50;
  }

  private static getReliabilityScore(reliability: ReliabilityLevel): number {
    const scores = {
      high: 0.95,
      medium: 0.80,
      low: 0.60,
      very_low: 0.40,
      unknown: 0.50,
    };
    
    return scores[reliability] || 0.50;
  }
}

// Cache entry freshness utilities
export class CacheFreshnessTracker {
  private freshnessManager: DataFreshnessManager;
  private cacheEntries: Map<string, CacheEntry<any>> = new Map();

  constructor(config: FreshnessConfig) {
    this.freshnessManager = new DataFreshnessManager(config);
  }

  trackEntry(key: string, entry: CacheEntry<any>): void {
    this.cacheEntries.set(key, entry);
    this.freshnessManager.updateFreshness(key, entry.timestamp);
  }

  getEntryFreshness(key: string): DataFreshness {
    const entry = this.cacheEntries.get(key);
    if (!entry) {
      return this.freshnessManager.getFreshness(key);
    }
    
    return this.freshnessManager.getFreshness(key);
  }

  getStaleEntries(threshold?: FreshnessLevel): Array<{ key: string; entry: CacheEntry<any>; freshness: DataFreshness }> {
    const staleKeys = this.freshnessManager.getStaleEntries(threshold);
    const staleEntries: Array<{ key: string; entry: CacheEntry<any>; freshness: DataFreshness }> = [];
    
    for (const key of staleKeys) {
      const entry = this.cacheEntries.get(key);
      if (entry) {
        const freshness = this.freshnessManager.getFreshness(key);
        staleEntries.push({ key, entry, freshness });
      }
    }
    
    return staleEntries;
  }

  shouldEvictEntry(key: string, maxAge: number): boolean {
    const freshness = this.freshnessManager.getFreshness(key);
    const entry = this.cacheEntries.get(key);
    
    if (!entry) return false;
    
    // Evict if expired or too old
    return freshness.freshness === 'expired' || freshness.age > maxAge;
  }

  getOptimalEvictionCandidates(maxCount: number): string[] {
    const allEntries = Array.from(this.cacheEntries.entries());
    
    // Sort by composite score (lowest first - most likely to evict)
    allEntries.sort((a, b) => {
      const scoreA = this.freshnessManager.getCompositeScore(a[0]);
      const scoreB = this.freshnessManager.getCompositeScore(b[0]);
      return scoreA - scoreB;
    });
    
    return allEntries.slice(0, maxCount).map(([key]) => key);
  }

  updateEntryAccess(key: string): void {
    const entry = this.cacheEntries.get(key);
    if (entry) {
      // Update last access time
      entry.metadata = {
        ...entry.metadata,
        lastAccessed: new Date(),
      };
      
      // Update freshness
      this.freshnessManager.updateFreshness(key);
    }
  }

  removeEntry(key: string): void {
    this.cacheEntries.delete(key);
    // Note: We don't remove from freshness manager as it might be useful for analytics
  }

  getFreshnessStats(): {
    totalEntries: number;
    averageFreshness: number;
    averageReliability: number;
    staleEntries: number;
    expiredEntries: number;
    byPriority: Record<string, { count: number; avgFreshness: number; avgReliability: number; }>;
  } {
    const entries = Array.from(this.cacheEntries.entries());
    const byPriority: Record<string, { count: number; avgFreshness: number; avgReliability: number; }> = {};
    
    let totalFreshness = 0;
    let totalReliability = 0;
    let staleCount = 0;
    let expiredCount = 0;
    
    for (const [key, entry] of entries) {
      const freshness = this.freshnessManager.getFreshness(key);
      
      totalFreshness += this.freshnessManager.getFreshnessScore(key);
      totalReliability += this.freshnessManager.getReliabilityScore(key);
      
      if (freshness.freshness === 'stale' || freshness.freshness === 'very_stale') {
        staleCount++;
      }
      if (freshness.freshness === 'expired') {
        expiredCount++;
      }
      
      const priority = entry.priority;
      if (!byPriority[priority]) {
        byPriority[priority] = { count: 0, avgFreshness: 0, avgReliability: 0 };
      }
      
      byPriority[priority].count++;
      byPriority[priority].avgFreshness += this.freshnessManager.getFreshnessScore(key);
      byPriority[priority].avgReliability += this.freshnessManager.getReliabilityScore(key);
    }
    
    // Calculate averages by priority
    for (const priority of Object.keys(byPriority)) {
      const stats = byPriority[priority];
      stats.avgFreshness /= stats.count;
      stats.avgReliability /= stats.count;
    }
    
    return {
      totalEntries: entries.length,
      averageFreshness: entries.length > 0 ? totalFreshness / entries.length : 0,
      averageReliability: entries.length > 0 ? totalReliability / entries.length : 0,
      staleEntries: staleCount,
      expiredEntries: expiredCount,
      byPriority,
    };
  }
}

export default DataFreshnessManager;
