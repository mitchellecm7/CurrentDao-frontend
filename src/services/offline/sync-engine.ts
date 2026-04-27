/**
 * Sync Engine for CurrentDao Offline Mode
 * Handles transaction synchronization with conflict resolution and retry logic
 */

import { 
  QueuedTransaction, 
  SyncConfig, 
  SyncSession, 
  SyncStatus, 
  TransactionStatus,
  TransactionPriority,
  TransactionConflict,
  ConflictResolution,
  ResolutionType,
  ResolutionAction,
  SyncError,
  NetworkInfo
} from '../../types/offline/offline';

export class SyncEngine {
  private config: SyncConfig;
  private queue: QueuedTransaction[];
  private currentSession: SyncSession | null;
  private isOnline: boolean;
  private retryDelays: Record<TransactionPriority, number>;
  private conflictResolver: ConflictResolver;
  private networkMonitor: NetworkMonitor;

  constructor(config: SyncConfig) {
    this.config = config;
    this.queue = [];
    this.currentSession = null;
    this.isOnline = true;
    this.retryDelays = {
      critical: 1000,
      high: 5000,
      normal: 10000,
      low: 30000,
    };
    this.conflictResolver = new ConflictResolver();
    this.networkMonitor = new NetworkMonitor();
    
    this.setupNetworkMonitoring();
  }

  private setupNetworkMonitoring(): void {
    this.networkMonitor.onStatusChange((online) => {
      this.isOnline = online;
      
      if (online && this.queue.length > 0) {
        this.startSync();
      } else if (!online && this.currentSession?.status === 'syncing') {
        this.pauseSync();
      }
    });
  }

  async startSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    if (this.currentSession?.status === 'syncing') {
      return; // Already syncing
    }

    const session: SyncSession = {
      id: this.generateSessionId(),
      startTime: new Date(),
      status: 'syncing',
      processed: 0,
      failed: 0,
      conflicts: 0,
      errors: [],
      metadata: {
        networkId: 1, // Would get from blockchain
        blockNumber: 0,
        gasPrice: 0,
        networkLoad: {
          blockNumber: 0,
          gasPrice: 0,
          networkUtilization: 0,
          averageBlockTime: 0,
          pendingTransactions: 0,
        },
        serverVersion: '1.0.0',
        clientVersion: '1.0.0',
      },
    };

    this.currentSession = session;

    try {
      await this.processQueue();
      this.completeSession(session);
    } catch (error) {
      this.failSession(session, error);
    }
  }

  async stopSync(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.status = 'idle';
      this.currentSession.endTime = new Date();
    }
  }

  pauseSync(): void {
    if (this.currentSession) {
      this.currentSession.status = 'idle';
    }
  }

  resumeSync(): void {
    if (this.currentSession && this.currentSession.status === 'idle') {
      this.currentSession.status = 'syncing';
      this.processQueue();
    }
  }

  getStatus(): SyncStatus {
    if (!this.currentSession) return 'idle';
    return this.currentSession.status;
  }

  private async processQueue(): Promise<void> {
    if (!this.currentSession || this.currentSession.status !== 'syncing') {
      return;
    }

    const session = this.currentSession;
    const batch = this.prepareBatch();

    for (const transaction of batch) {
      try {
        const result = await this.processTransaction(transaction);
        
        if (result.success) {
          session.processed++;
        } else {
          session.failed++;
          session.errors.push({
            transactionId: transaction.id,
            error: result.error || 'Unknown error',
            code: result.code || 'UNKNOWN',
            timestamp: new Date(),
            resolved: false,
            retryCount: transaction.retryCount,
          });
        }
      } catch (error) {
        session.failed++;
        session.errors.push({
          transactionId: transaction.id,
          error: error.message,
          code: 'PROCESSING_ERROR',
          timestamp: new Date(),
          resolved: false,
          retryCount: 0,
        });
      }
    }

    this.updateSessionStats();
  }

  private prepareBatch(): QueuedTransaction[] {
    // Sort by priority and then by retry count
    const sortedQueue = [...this.queue].sort((a, b) => {
      const priorityOrder = {
        critical: 3,
        high: 2,
        normal: 1,
        low: 0,
      };
      
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      const retryDiff = a.retryCount - b.retryCount;
      return retryDiff;
    });

    // Take batch size worth of transactions
    return sortedQueue.slice(0, this.config.batchSize);
  }

  private async processTransaction(transaction: Promise<{
    success: boolean;
    error?: string;
    code?: string;
    conflicts?: TransactionConflict[];
  }> {
    try {
      // Check for conflicts
      const conflicts = await this.detectConflicts(transaction);
      
      if (conflicts.length > 0) {
        const resolution = await this.resolveConflicts(transaction, conflicts);
        
        if (!resolution.autoResolved) {
          return {
            success: false,
            error: `Unresolved conflicts: ${conflicts.map(c => c.description).join(', ')}`,
            code: 'CONFLICTS_DETECTED',
            conflicts,
          };
        }

        // Apply resolution
        transaction = this.applyResolution(transaction, resolution);
        transaction.conflicts = [];
      }

      // Execute transaction
      const result = await this.executeTransaction(transaction);
      
      // Remove from queue if successful
      if (result.success) {
        this.removeFromQueue(transaction.id);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'EXECUTION_ERROR',
      };
    }
  }

  private async detectConflicts(transaction: QueuedTransaction): Promise<TransactionConflict[]> {
    const conflicts: TransactionConflict[] = [];

    // Check for nonce collisions
    const nonceConflicts = await this.checkNonceCollision(transaction);
    conflicts.push(...nonceConflicts);

    // Check for price slippage
    const priceConflicts = await this.checkPriceSlippage(transaction);
    conflicts.push(...priceConflicts);

    // Check for insufficient balance
    const balanceConflicts = await this.checkBalance(transaction);
    conflicts.push(...balanceConflicts);

    // Check for gas limit issues
    const gasConflicts = await this.checkGasLimit(transaction);
    conflicts.push(...gasConflicts);

    // Check for state collisions
    const stateConflicts = await this.checkStateCollision(transaction);
    conflicts.push(...stateConflicts);

    return conflicts;
  }

  private async checkNonceCollision(transaction: QueuedTransaction): Promise<TransactionConflict[]> {
    const conflicts: TransactionConflict[] = [];
    
    // In a real implementation, this would check against pending transactions
    // For now, simulate nonce collision detection
    const nonce = transaction.data.nonce;
    const conflictingTransactions = this.queue.filter(t => 
      t.data.nonce === nonce && t.id !== transaction.id
    );

    for (const conflicting of conflictingTransactions) {
      conflicts.push({
        id: `nonce_${transaction.id}_${conflicting.id}`,
        type: 'nonce_collision',
        severity: 'high',
        description: `Nonce collision with transaction ${conflicting.id}`,
        conflictingTransaction,
        detectedAt: new Date(),
      });
    }

    return conflicts;
  }

  private async checkPriceSlippage(transaction: QueuedTransaction): Promise<TransactionConflict[]> {
    const conflicts: TransactionConflict[] = [];
    
    if (!transaction.data.price) return conflicts;

    // Get current market price (would fetch from oracle)
    const currentPrice = await this.getCurrentPrice(transaction.data.asset);
    
    if (currentPrice) {
      const priceDiff = Math.abs(transaction.data.price - currentPrice) / currentPrice;
      
      // If price difference is more than 2%, flag as conflict
      if (priceDiff > 0.02) {
        conflicts.push({
          id: `price_${transaction.id}`,
          type: 'price_slippage',
          severity: priceDiff > 0.05 ? 'high' : 'medium',
          description: `Price slippage: ${(priceDiff * 100).toFixed(2)}%`,
          conflictingTransaction: transaction,
          detectedAt: new Date(),
        });
      }
    }

    return conflicts;
  }

  private async getCurrentPrice(asset: string): Promise<number | null> {
    // In a real implementation, this would fetch from price oracle
    // For now, return simulated price
    const prices: Record<string, number> = {
      'ETH': 3000,
      'BTC': 60000,
      'USDT': 1,
      'DAI': 0.15,
      'USDC': 0.15,
    };
    
    return prices[asset] || null;
  }

  private async checkBalance(transaction: QueuedTransaction): Promise<TransactionConflict[]> {
    const conflicts: TransactionConflict[] = [];
    
    // In a real implementation, this would check user balance
    // For now, simulate balance check
    const balance = 10000; // Simulated balance
    
    if (transaction.data.amount > balance) {
      conflicts.push({
        id: `balance_${transaction.id}`,
        type: 'insufficient_balance',
        severity: 'high',
        description: `Insufficient balance for transaction amount: ${transaction.data.amount}`,
        conflictingTransaction: transaction,
        detectedAt: new Date(),
      });
    }

    return conflicts;
  }

  private async checkGasLimit(transaction: QueuedTransaction): Promise<TransactionConflict[]> {
    const conflicts: TransactionConflict[] = [];
    
    if (transaction.data.gasLimit) {
      const currentGasPrice = await this.getCurrentGasPrice();
      
      const estimatedGas = transaction.data.gasLimit;
      const gasCost = estimatedGas * currentGasPrice;
      
      // If estimated gas cost is too high, flag as conflict
      if (gasCost > 0.1) { // 0.1 ETH
        conflicts.push({
          id: `gas_${transaction.id}`,
          type: 'gas_limit_exceeded',
          severity: gasCost > 0.5 ? 'high' : 'medium',
          description: `Gas cost too high: ${gasCost.toFixed(4)} ETH`,
          conflictingTransaction: transaction,
          detectedAt: new Date(),
        });
      }
    }

    return conflicts;
  }

  private async getCurrentGasPrice(): Promise<number> {
    // In a real implementation, this would fetch current gas price
    // For now, return simulated gas price
    return 20; // 20 gwei
  }

  private async checkStateCollision(transaction: QueuedTransaction): Promise<TransactionConflict[]> {
    const conflicts: TransactionConflict[] = [];
    
    // In a real implementation, this would check for state conflicts
    // For now, simulate state collision detection
    const stateConflicts = this.queue.filter(t => 
      t.data.to === transaction.data.to &&
      t.id !== transaction.id &&
      t.data.asset === transaction.data.asset
    );

    for (const conflicting of stateConflicts) {
      conflicts.push({
        id: `state_${transaction.id}_${conflicting.id}`,
        type: 'state_collision',
        severity: 'medium',
        description: `State collision with transaction ${conflicting.id}`,
        conflictingTransaction: conflicting,
        detectedAt: new Date(),
      });
    }

    return conflicts;
  }

  private async resolveConflicts(
    transaction: QueuedTransaction,
    conflicts: TransactionConflict[]
  ): Promise<ConflictResolution> {
    const resolution = await this.conflictResolver.resolve(transaction, conflicts);
    
    // Update transaction with resolution
    transaction.conflicts = [];
    
    return resolution;
  }

  private applyResolution(
    transaction: QueuedTransaction,
    resolution: ConflictResolution
  ): QueuedTransaction {
    switch (resolution.action) {
      case 'increase_price':
        if (transaction.data.price) {
          transaction.data.price = resolution.newPrice || transaction.data.price * 1.02;
        }
        break;
      case 'decrease_price':
        if (transaction.data.price) {
          transaction.data.price = resolution.newPrice || transaction.data.price * 0.98;
        }
        break;
      case 'increase_amount':
        transaction.data.amount = resolution.newAmount || transaction.data.amount * 1.1;
        break;
      case 'decrease_amount':
        transaction.data.amount = resolution.newAmount || transaction.data.amount * 0.9;
        break;
      case 'increase_gas':
        if (transaction.data.gasLimit) {
          transaction.data.gasLimit = resolution.newGasLimit || transaction.data.gasLimit * 1.2;
        }
        break;
      case 'decrease_gas':
        if (transaction.data.gasLimit) {
          transaction.data.gasLimit = resolution.newGasLimit || transaction.data.gasLimit * 0.8;
        }
        break;
      case 'wait_and_retry':
        transaction.scheduledAt = new Date(Date.now() + (resolution.retryDelay || 5000));
        transaction.retryCount++;
        break;
      case 'cancel':
        transaction.status = 'cancelled';
        break;
      case 'manual_intervention':
        // Mark for manual resolution
        break;
    }
    
    return transaction;
  }

  private async executeTransaction(transaction: Promise<{
    success: boolean;
    transactionHash?: string;
    blockNumber?: number;
    gasUsed?: number;
    error?: string;
    code?: string;
  }> {
    try {
      // In a real implementation, this would execute the transaction on blockchain
      // For now, simulate execution
      const executionTime = Math.random() * 1000 + 500; // 500-1500ms
      
      await new Promise(resolve => setTimeout(resolve, executionTime));
      
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        // Generate transaction hash
        const transactionHash = this.generateTransactionHash(transaction);
        
        return {
          success: true,
          transactionHash,
          blockNumber: Math.floor(Math.random() * 100000) + 400000,
          gasUsed: transaction.data.gasLimit || 21000,
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed',
          code: 'EXECUTION_FAILED',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'EXECUTION_ERROR',
      };
    }
  }

  private generateTransactionHash(transaction: QueuedTransaction): string {
    // In a real implementation, this would generate a proper transaction hash
    // For now, return a simulated hash
    const dataString = JSON.stringify(transaction.data);
    let hash = 0;
    
    for (let i = 0; i < dataString.length; i++) {
      hash = ((hash << 5) - hash) + dataString.charCodeAt(i) + 128) >>> 0;
    }
    
    return hash.toString(16);
  }

  private generateSessionId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private removeFromQueue(transactionId: string): void {
    const index = this.queue.findIndex(t => t.id === transactionId);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  private updateSessionStats(): void {
    if (!this.currentSession) return;
    
    const session = this.currentSession;
    session.processed = this.queue.filter(t => 
      t.status === 'completed'
    ).length;
    session.failed = this.queue.filter(t => 
      t.status === 'failed'
    ).length;
    session.conflicts = this.queue.filter(t => 
      t.conflicts.length > 0
    ).length;
    
    this.currentSession = session;
  }

  private completeSession(session: SyncSession): void {
    session.status = 'completed';
    session.endTime = new Date();
    this.currentSession = null;
  }

  private failSession(session: SyncSession, error: any): void {
    session.status = 'failed';
    session.endTime = new Date();
    session.errors.push({
      error: error.message || 'Unknown sync error',
      code: error.code || 'SYNC_ERROR',
      timestamp: new Date(),
      resolved: false,
      retryCount: 0,
    });
    this.currentSession = null;
  }

  getQueue(): QueuedTransaction[] {
    return [...this.queue];
  }

  getHistory(): SyncSession[] {
    // In a real implementation, this would fetch from persistent storage
    return [];
  }

  configure(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update retry delays if changed
    if (config.priorityOrder) {
      this.config.priorityOrder = config.priorityOrder;
      this.retryDelays = {
        critical: config.priorityOrder.includes('critical') ? 1000 : 5000,
        high: config.priorityOrder.includes('high') ? 5000 : 10000,
        normal: config.priorityOrder.includes('normal') ? 10000 : 30000,
        low: config.priorityOrder.includes('low') ? 30000 : 60000,
      };
    }
  }

  getStats(): {
    return {
      queueSize: this.queue.length,
      byStatus: this.getQueueStats(),
      currentSession: this.currentSession,
      isOnline: this.isOnline,
      networkInfo: this.networkMonitor.getInfo(),
    };
  }

  private getQueueStats(): Record<TransactionStatus, number> {
    const stats: Record<TransactionStatus, number> = {
      pending: 0,
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      conflicted: 0,
      cancelled: 0,
      expired: 0,
    };

    for (const transaction of this.queue) {
      stats[transaction.status]++;
    }

    return stats;
  }
}

class ConflictResolver {
  private resolutionStrategies: Map<ConflictType, ResolutionType[]> = new Map([
    ['nonce_collision', ['retry', 'cancel', 'manual_intervention']],
    ['insufficient_balance', ['cancel', 'manual_intervention']],
    ['price_slippage', ['adjust_price', 'wait_and_retry', 'manual_intervention']],
    ['gas_limit_exceeded', ['adjust_gas', 'retry', 'manual_intervention']],
    ['state_collision', ['retry', 'cancel', 'manual_intervention']],
    ['market_price_changed', ['adjust_price', 'wait_and_retry', 'manual_intervention']],
    ['liquidity_insufficient', ['wait_and_retry', 'manual_intervention']],
    ['approval_required', ['wait_and_retry', 'manual_intervention']],
  ]);

  async resolve(
    transaction: QueuedTransaction,
    conflicts: TransactionConflict[]
  ): Promise<ConflictResolution> {
    const resolutions: ConflictResolution[] = [];
    
    for (const conflict of conflicts) {
      const possibleResolutions = this.resolutionStrategies.get(conflict.type) || ['manual_intervention'];
      
      let selectedResolution: ResolutionType = 'manual_intervention';
      let autoResolved = false;
      
      // Try automatic resolutions in order of priority
      for (const resolution of possibleResolutions) {
        const canAutoResolve = await this.canAutoResolve(conflict, resolution);
        
        if (canAutoResolve) {
          selectedResolution = resolution;
          autoResolved = true;
          break;
        }
      }

      const resolution: ConflictResolution = {
        type: selectedResolution,
        action: this.getActionForResolution(selectedResolution),
        autoResolved,
        message: this.getResolutionMessage(conflict, selectedResolution),
      };

      // Apply resolution parameters
      this.applyResolutionParams(resolution, conflict);
      
      resolutions.push(resolution);
    }

    // Return the first resolution (in case of multiple conflicts)
    return resolutions[0];
  }

  private async canAutoResolve(
    conflict: TransactionConflict,
    resolution: ResolutionType
  ): Promise<boolean> {
    switch (conflict.type) {
      case 'nonce_collision':
        return resolution === 'retry';
      case 'price_slippage':
        return resolution === 'adjust_price' || resolution === 'wait_and_retry';
      case 'gas_limit_exceeded':
        return resolution === 'adjust_gas' || resolution === 'retry';
      case 'state_collision':
        return resolution === 'retry';
      case 'insufficient_balance':
        return resolution === 'cancel';
      case 'liquidity_insufficient':
        return resolution === 'wait_and_retry';
      case 'approval_required':
        return resolution === 'wait_and_retry';
      default:
        return false;
    }
  }

  private getActionForResolution(resolution: ResolutionType): ResolutionAction {
    switch (resolution) {
      case 'retry':
        return 'wait_and_retry';
      case 'adjust_price':
        return conflict.type === 'price_slippage' ? 'increase_price' : 'decrease_price';
      case 'adjust_amount':
        return conflict.type === 'insufficient_balance' ? 'decrease_amount' : 'increase_amount';
      case 'adjust_gas':
        return 'increase_gas';
      case 'cancel':
        return 'cancel';
      case 'split_transaction':
        return 'manual_intervention';
      case 'manual_intervention':
        return 'manual_intervention';
      default:
        return 'manual_intervention';
    }
  }

  private getResolutionMessage(
    conflict: TransactionConflict,
    resolution: ResolutionType
  ): string {
    switch (conflict.type) {
      case 'nonce_collision':
        return `Nonce collision detected. ${resolution === 'retry' ? 'Retrying with new nonce.' : 'Manual intervention required.'}`;
      case 'price_slippage':
        return `Price changed by ${((conflict.conflictingTransaction.data.price - this.getCurrentPrice(conflict.conflictingTransaction.data.asset)) * 100).toFixed(2)}%. ${resolution === 'adjust_price' ? 'Adjusting price.' : 'Waiting for price stabilization.'}`;
      case 'insufficient_balance':
        return 'Insufficient balance. Transaction cancelled.';
      case 'gas_limit_exceeded':
        return `Gas limit too high. ${resolution === 'adjust_gas' ? 'Adjusting gas limit.' : 'Manual intervention required.'}`;
      case 'state_collision':
        return 'State conflict detected. Retrying...';
      case 'market_price_changed':
        return 'Market conditions changed. Adjusting price and retrying.';
      case 'liquidity_insufficient':
        return 'Liquidity insufficient. Waiting for better conditions.';
      case 'approval_required':
        return 'Approval required. Waiting for confirmation.';
      default:
        return 'Manual intervention required.';
    }
  }

  private applyResolutionParams(
    resolution: ConflictResolution,
    conflict: TransactionConflict
  ): void {
    switch (resolution.type) {
      case 'adjust_price':
        if (resolution.newPrice) {
          resolution.newPrice = this.calculateAdjustedPrice(
            conflict.conflictingTransaction.data.price,
            conflict.severity
          );
        }
        break;
      case 'adjust_amount':
        if (resolution.newAmount) {
          resolution.newAmount = this.calculateAdjustedAmount(
            conflict.conflictingTransaction.data.amount,
            conflict.severity
          );
        }
        break;
      case 'adjust_gas':
        if (resolution.newGasLimit) {
          resolution.newGasLimit = this.calculateAdjustedGasLimit(
            conflict.conflictingTransaction.data.gasLimit,
            conflict.severity
          );
        }
        break;
      case 'retry':
        if (resolution.retryDelay) {
          resolution.retryDelay = this.calculateRetryDelay(
            conflict.conflictingTransaction.retryCount,
            conflict.severity
          );
        }
        break;
    }
  }

  private calculateAdjustedPrice(
    currentPrice: number,
    severity: ConflictSeverity
  ): number {
    const adjustments = {
      low: 0.01,
      medium: 0.02,
      high: 0.05,
      critical: 0.1,
    };
    
    const adjustment = adjustments[severity] || 0.02;
    
    if (severity === 'high' || severity === 'critical') {
      return currentPrice * (1 + adjustment);
    } else {
      return currentPrice * (1 - adjustment);
    }
  }

  private calculateAdjustedAmount(
    currentAmount: number,
    severity: ConflictSeverity
  ): number {
    const adjustments = {
      low: 0.05,
      medium: 0.1,
      high: 0.2,
      critical: 0.5,
    };
    
    const adjustment = adjustments[severity] || 0.1;
    
    if (severity === 'high' || severity === 'critical') {
      return currentAmount * (1 - adjustment);
    } else {
      return currentAmount * (1 + adjustment);
    }
  }

  private calculateAdjustedGasLimit(
    currentGasLimit: number,
    severity: ConflictSeverity
  ): number {
    const adjustments = {
      low: 1.1,
      medium: 1.25,
      high: 1.5,
      critical: 2.0,
    };
    
    const adjustment = adjustments[severity] || 1.25;
    
    return Math.ceil(currentGasLimit * adjustment);
  }

  private calculateRetryDelay(retryCount: number, severity: ConflictSeverity): number {
    const baseDelays = {
      low: 5000,
      medium: 10000,
      high: 30000,
      critical: 60000,
    };
    
    const baseDelay = baseDelays[severity] || 10000;
    const exponentialBackoff = Math.min(60000, baseDelay * Math.pow(2, retryCount));
    
    return exponentialBackoff;
  }
}

class NetworkMonitor {
  private listeners: Array<(status: boolean) => void> = [];
  private currentStatus: NetworkInfo;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.currentStatus = {
      online: navigator.onLine,
      effectiveType: 'unknown',
      downlink: 'unknown',
      rtt: 0,
      saveData: false,
      onLine: navigator.onLine,
      offLine: navigator.offLine,
    };
    
    this.startMonitoring();
  }

  private startMonitoring(): void {
    this.checkInterval = setInterval(() => {
      this.updateStatus();
    }, 30000); // Check every 30 seconds
  }

  private updateStatus(): void {
    const online = navigator.onLine;
    
    if (online !== this.currentStatus.online) {
      this.currentStatus.online = online;
      this.currentStatus.onLine = online;
      
      // Notify listeners of status change
      this.listeners.forEach(listener => {
        listener(online);
      });
    }
  }

  onStatusChange(callback: (status: boolean) => {
    this.listeners.push(callback);
  }

  getInfo(): NetworkInfo {
    return this.currentStatus;
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export default SyncEngine;
