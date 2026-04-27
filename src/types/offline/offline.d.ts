/**
 * TypeScript definitions for CurrentDao Offline Mode System
 * Comprehensive type definitions for offline caching, transaction queuing, sync management, and conflict resolution
 */

// Base offline types
export interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  lastSync: Date | null;
  cacheSize: number;
  queueSize: number;
  syncInProgress: boolean;
  hasConflicts: boolean;
}

export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: Date;
  expiresAt: Date;
  size: number;
  priority: CachePriority;
  metadata?: CacheMetadata;
  version: string;
}

export type CachePriority = 'essential' | 'important' | 'normal' | 'low';

export interface CacheMetadata {
  source: string;
  lastModified?: Date;
  etag?: string;
  checksum?: string;
  dependencies?: string[];
  tags?: string[];
}

// Cache management types
export interface CacheConfig {
  maxSize: number; // in bytes
  maxAge: number; // in milliseconds
  maxEntries: number;
  storageQuota: number; // in bytes
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  priorityThresholds: Record<CachePriority, number>;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  compressionRatio: number;
  oldestEntry: Date;
  newestEntry: Date;
  sizeByPriority: Record<CachePriority, number>;
}

// Transaction queue types
export interface QueuedTransaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  data: TransactionData;
  createdAt: Date;
  scheduledAt?: Date;
  retryCount: number;
  maxRetries: number;
  priority: TransactionPriority;
  conflicts: TransactionConflict[];
  metadata: TransactionMetadata;
}

export type TransactionType = 
  | 'buy'
  | 'sell'
  | 'transfer'
  | 'stake'
  | 'unstake'
  | 'create_order'
  'cancel_order'
  'update_order'
  'swap';

export type TransactionStatus = 
  | 'pending'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'conflicted'
  | 'cancelled'
  | 'expired';

export type TransactionPriority = 'critical' | 'high' | 'normal' | 'low';

export interface TransactionData {
  userId: string;
  asset: string;
  amount: number;
  price?: number;
  from?: string;
  to?: string;
  gasLimit?: number;
  nonce?: number;
  signature?: string;
  [key: string]: any;
}

export interface TransactionMetadata {
  userAgent: string;
  timestamp: number;
  networkId: number;
  blockNumber?: number;
  blockHash?: string;
  transactionHash?: string;
  gasUsed?: number;
  effectiveGasPrice?: number;
  [key: string]: any;
}

// Conflict resolution types
export interface TransactionConflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  conflictingTransaction: QueuedTransaction;
  resolution?: ConflictResolution;
  detectedAt: Date;
  resolvedAt?: Date;
}

export type ConflictType = 
  | 'nonce_collision'
  | 'insufficient_balance'
  | 'price_slippage'
  | 'gas_limit_exceeded'
  | 'state_collision'
  | 'market_price_changed'
  | 'liquidity_insufficient'
  | 'approval_required';

export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ConflictResolution {
  type: ResolutionType;
  action: ResolutionAction;
  newPrice?: number;
  newAmount?: number;
  newGasLimit?: number;
  retryDelay?: number;
  message?: string;
  autoResolved: boolean;
}

export type ResolutionType = 
  | 'retry'
  | 'adjust_price'
  | 'adjust_amount'
  | 'adjust_gas'
  | 'split_transaction'
  | 'cancel'
  | 'manual_intervention';

export type ResolutionAction = 
  | 'increase_price'
  | 'decrease_price'
  | 'increase_amount'
  | 'decrease_amount'
  | 'increase_gas'
  | 'decrease_gas'
  | 'wait_and_retry'
  | 'cancel'
  | 'manual';

// Sync management types
export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // in milliseconds
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
  conflictResolution: 'auto' | 'manual' | 'priority';
  priorityOrder: TransactionPriority[];
}

export interface SyncSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: SyncStatus;
  processed: number;
  failed: number;
  conflicts: number;
  errors: SyncError[];
  metadata: SyncMetadata;
}

export type SyncStatus = 
  | 'idle'
  | 'connecting'
  | 'syncing'
  | 'conflicted'
  | 'failed'
  | 'completed';

export interface SyncError {
  transactionId: string;
  error: string;
  code: string;
  timestamp: Date;
  resolved: boolean;
  retryCount: number;
}

export interface SyncMetadata {
  networkId: number;
  blockNumber: number;
  gasPrice: number;
  networkLoad: NetworkLoad;
  serverVersion: string;
  clientVersion: string;
}

export interface NetworkLoad {
  blockNumber: number;
  gasPrice: number;
  networkUtilization: number;
  averageBlockTime: number;
  pendingTransactions: number;
}

// Data freshness types
export interface DataFreshness {
  lastUpdate: Date;
  age: number; // in milliseconds
  freshness: FreshnessLevel;
  reliability: ReliabilityLevel;
  nextUpdate?: Date;
  source: string;
}

export type FreshnessLevel = 
  | 'realtime'    // < 1 minute old
  | 'fresh'       // < 5 minutes old
  | 'stale'       // < 1 hour old
  | 'very_stale'  // < 6 hours old
  | 'expired'     // > 6 hours old
  | 'unknown';

export type ReliabilityLevel = 
  | 'high'        // > 95% confidence
  | 'medium'      // > 80% confidence
  | 'low'         // > 60% confidence
  | 'very_low'     // < 60% confidence
  | 'unknown';

export interface FreshnessConfig {
  realtimeThreshold: number;  // milliseconds
  freshThreshold: number;
  staleThreshold: number;
  veryStaleThreshold: number;
  expiredThreshold: number;
  reliabilityFactors: Record<string, number>;
}

// Offline analytics types
export interface OfflineAnalytics {
  portfolioData: PortfolioSnapshot;
  tradingHistory: TradingActivity[];
  performanceMetrics: PerformanceMetrics;
  cacheMetrics: CacheMetrics;
  syncMetrics: SyncMetrics;
  userActivity: UserActivity;
}

export interface PortfolioSnapshot {
  timestamp: Date;
  assets: Asset[];
  totalValue: number;
  totalValueChange24h: number;
  totalValueChange7d: number;
  assetAllocation: AssetAllocation;
  performance: PortfolioPerformance;
  metadata: SnapshotMetadata;
}

export interface Asset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  price: number;
  priceChange24h: number;
  priceChange7d: number;
  type: AssetType;
  protocol: string;
  metadata: AssetMetadata;
}

export type AssetType = 
  | 'token'
  | 'nft'
  'liquidity'
  'staking'
  'governance'
  'other';

export interface AssetMetadata {
  decimals: number;
  address?: string;
  chainId?: number;
  contractType?: string;
  lastUpdated: Date;
  [key: string]: any;
}

export interface AssetAllocation {
  byType: Record<AssetType, number>;
  byProtocol: Record<string, number>;
  byRisk: Record<RiskLevel, number>;
  topAssets: Array<{ symbol: string; percentage: number }>;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface PortfolioPerformance {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  alpha: number;
  beta: number;
  winRate: number;
  period: PerformancePeriod;
}

export type PerformancePeriod = '1d' | '7d' | '30d' | '90d' | '1y' | 'all';

export interface SnapshotMetadata {
  isOffline: boolean;
  dataSource: 'cache' | 'live';
  completeness: number; // 0-1 scale
  confidence: number; // 0-1 scale
  estimatedValue?: number;
  [key: string]: any;
}

export interface TradingActivity {
  timestamp: Date;
  type: ActivityType;
  status: ActivityStatus;
  details: ActivityDetails;
  metadata: ActivityMetadata;
}

export type ActivityType = 
  | 'order_created'
  | 'order_filled'
  | 'order_cancelled'
  | 'swap_executed'
  'stake_added'
  'stake_removed'
  'reward_claimed'
  'transfer_sent'
  'transfer_received';

export type ActivityStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ActivityDetails {
  transactionId?: string;
  orderId?: string;
  poolId?: string;
  amount?: number;
  price?: number;
  from?: string;
  to?: string;
  token?: string;
  [key: string]: any;
}

export interface ActivityMetadata {
  blockNumber?: number;
  blockHash?: string;
  transactionHash?: string;
  gasUsed?: number;
  gasPrice?: number;
  isOffline: boolean;
  isSimulated: boolean;
  [key: string]: any;
}

export interface PerformanceMetrics {
  cacheHitRate: number;
  averageResponseTime: number;
  syncSuccessRate: number;
  conflictResolutionRate: number;
  offlineUptime: number;
  dataFreshness: Record<string, DataFreshness>;
}

export interface CacheMetrics {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionRate: number;
  compressionRatio: number;
  averageAge: number;
  sizeByPriority: Record<CachePriority, number>;
  topCategories: Array<{ category: string; size: number; entries: number }>;
}

export interface SyncMetrics {
  totalSyncs: number;
  successRate: number;
  averageDuration: number;
  conflictRate: number;
  autoResolutionRate: number;
  queueSize: number;
  throughput: number;
  lastSync: Date;
}

export interface UserActivity {
  lastSeen: Date;
  sessionDuration: number;
  actionsTaken: number;
  featuresUsed: string[];
  offlineTime: number;
  deviceInfo: DeviceInfo;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screenResolution: string;
  isMobile: boolean;
  isTablet: boolean;
  [key: string]: any;
}

// Offline simulation types
export interface SimulationConfig {
  enabled: boolean;
  marketConditions: MarketConditions;
  networkLatency: number;
  packetLoss: number;
  priceVolatility: number;
  liquidityDepth: number;
  slippage: number;
}

export type MarketConditions = 
  | 'normal'
  | 'volatile'
  | 'illiquid'
  | 'congested'
  | 'maintenance';

export interface SimulationResult {
  id: string;
  timestamp: Date;
  config: SimulationConfig;
  results: SimulationResults;
  recommendations: SimulationRecommendation[];
  confidence: number;
}

export interface SimulationResults {
  successRate: number;
  averageSlippage: number;
  averageDelay: number;
  failedTransactions: number;
  conflictsResolved: number;
  estimatedValue: number;
  riskAssessment: RiskAssessment;
}

export interface SimulationRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  action: string;
  expectedImpact: string;
  confidence: number;
}

export type RecommendationType = 
  | 'increase_gas'
  | 'decrease_gas'
  'adjust_price'
  'split_transaction'
  'delay_execution'
  'cancel_transaction'
  'increase_priority'
  'check_connectivity';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface RiskAssessment {
  overall: RiskLevel;
  factors: RiskFactor[];
  mitigation: string[];
  confidence: number;
}

export interface RiskFactor {
  factor: string;
  level: RiskLevel;
  impact: number;
  description: string;
  mitigation: string;
}

// Progressive loading types
export interface LoadingConfig {
  essentialOnly: boolean;
  progressiveLoading: boolean;
  priorityOrder: LoadingPriority[];
  batchSize: number;
  timeout: number;
  retryAttempts: number;
}

export type LoadingPriority = 
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export interface LoadingState {
  phase: LoadingPhase;
  progress: number;
  loaded: string[];
  pending: string[];
  failed: string[];
  estimatedTimeRemaining: number;
}

export type LoadingPhase = 
  | 'initializing'
  | 'loading_cache'
  | 'loading_queue'
  | 'loading_analytics'
  | 'loading_portfolio'
  | 'loading_settings'
  | 'ready';

export interface LoadingProgress {
  phase: LoadingPhase;
  percentage: number;
  item: string;
  loaded: boolean;
  estimatedTime: number;
}

// Hook return types
export interface OfflineModeReturn {
  status: OfflineStatus;
  cache: {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, data: T, options?: CacheOptions) => Promise<void>;
    delete: (key: string) => Promise<void>;
    clear: () => Promise<void>;
    stats: () => CacheStats;
    optimize: () => Promise<void>;
  };
  queue: {
    add: (transaction: QueuedTransaction) => Promise<void>;
    remove: (id: string) => Promise<void>;
    get: (id: string) => QueuedTransaction | null;
    getAll: () => QueuedTransaction[];
    clear: () => Promise<void>;
    process: () => Promise<ProcessingResult>;
    getStats: () => QueueStats;
  };
  sync: {
    start: () => Promise<void>;
    stop: () => Promise<void>;
    getStatus: () => SyncStatus;
    getHistory: () => SyncSession[];
    configure: (config: Partial<SyncConfig>) => void;
  };
  analytics: {
    getPortfolio: () => Promise<PortfolioSnapshot>;
    getHistory: (period?: PerformancePeriod) => Promise<TradingActivity[]>;
    getMetrics: () => Promise<PerformanceMetrics>;
    simulate: (config: SimulationConfig) => Promise<SimulationResult>;
  };
  freshness: {
    getFreshness: (key: string) => DataFreshness;
    updateFreshness: (key: string) => void;
    checkAll: () => Record<string, DataFreshness>;
    getStaleKeys: () => string[];
  };
  loading: {
    start: (config?: LoadingConfig) => Promise<void>;
    getState: () => LoadingState;
    getProgress: () => LoadingProgress[];
    isReady: () => boolean;
  };
  refresh: () => Promise<void>;
  configure: (config: OfflineConfig) => void;
}

export interface CacheOptions {
  expiresAt?: Date;
  priority?: CachePriority;
  metadata?: CacheMetadata;
  tags?: string[];
}

export interface ProcessingResult {
  processed: number;
  failed: number;
  conflicts: number;
  duration: number;
  errors: string[];
}

export interface QueueStats {
  total: number;
  byStatus: Record<TransactionStatus, number>;
  byPriority: Record<TransactionPriority, number>;
  averageAge: number;
  oldestTransaction: Date;
  estimatedProcessingTime: number;
}

export interface OfflineConfig {
  cache: CacheConfig;
  queue: {
    maxSize: number;
    maxRetries: number;
    priorityThresholds: Record<TransactionPriority, number>;
  };
  sync: SyncConfig;
  analytics: {
    enableSimulation: boolean;
    maxHistoryDays: number;
    refreshInterval: number;
  };
  freshness: FreshnessConfig;
  loading: LoadingConfig;
  simulation: SimulationConfig;
}

// Event types
export interface OfflineEvent {
  type: OfflineEventType;
  timestamp: Date;
  data: any;
  metadata?: any;
}

export type OfflineEventType = 
  | 'status_changed'
  | 'cache_updated'
  | 'transaction_queued'
  | 'transaction_processed'
  | 'sync_started'
  | 'sync_completed'
  | 'sync_failed'
  | 'conflict_detected'
  | 'conflict_resolved'
  | 'data_expired'
  | 'connectivity_changed'
  | 'storage_quota_exceeded'
  | 'error';

// Error types
export class OfflineError extends Error {
  constructor(
    message: string,
    public code: string,
    public type: OfflineErrorType,
    public timestamp: Date,
    public metadata?: any
  ) {
    super(message);
    this.name = 'OfflineError';
  }
}

export type OfflineErrorType = 
  | 'cache_error'
  | 'queue_error'
  | 'sync_error'
  | 'conflict_error'
  | 'storage_error'
  | 'network_error'
  | 'validation_error'
  | 'permission_error'
  | 'quota_error'
  | 'timeout_error';

// Utility types
export interface CacheKey {
  namespace: string;
  identifier: string;
  version?: string;
  params?: Record<string, any>;
}

export interface StorageQuota {
  used: number;
  available: number;
  total: number;
  usage: number;
}

export interface NetworkInfo {
  online: boolean;
  effectiveType: string;
  downlink: string;
  rtt: number;
  saveData: boolean;
  onLine: boolean;
  onLine: boolean;
  offLine: boolean;
  onLine: boolean;
  onLine: boolean;
}

// Export all types
export * from './offline';
