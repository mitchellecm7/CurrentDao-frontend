import { 
  Notification, 
  NotificationType, 
  NotificationCategory, 
  NotificationPreferences 
} from '../../types/notifications';
import { NotificationRule, NotificationCondition } from './notification-engine';

export interface RuleEvaluationContext {
  notification: Notification;
  userPreferences: NotificationPreferences;
  currentTime: Date;
  userProfile: {
    timezone: string;
    location: string;
    role: string;
    permissions: string[];
  };
  systemState: {
    quietHours: boolean;
    emergencyMode: boolean;
    maintenanceMode: boolean;
  };
  historicalData: {
    recentNotifications: Notification[];
    userActivity: {
      lastLogin: Date;
      sessionDuration: number;
      activeDevices: string[];
    };
    marketData: {
      priceChanges: Record<string, number>;
      volatility: Record<string, number>;
    };
  };
}

export interface RuleEvaluationResult {
  ruleId: string;
  matched: boolean;
  score: number;
  conditions: {
    conditionId: string;
    matched: boolean;
    weight: number;
    reason?: string;
  }[];
  executionPlan: {
    actions: string[];
    priority: number;
    delay: number;
    conditions: string[];
  };
  metadata: {
    evaluationTime: number;
    contextVersion: string;
    debugInfo?: Record<string, any>;
  };
}

export interface RuleProcessorConfig {
  enableDebugMode: boolean;
  maxEvaluationTime: number; // in milliseconds
  cacheEnabled: boolean;
  cacheTimeout: number; // in seconds
  parallelEvaluation: boolean;
  maxConcurrentEvaluations: number;
}

export class RuleProcessor {
  private config: RuleProcessorConfig;
  private evaluationCache: Map<string, RuleEvaluationResult> = new Map();
  private ruleMetrics: Map<string, {
    evaluations: number;
    matches: number;
    averageTime: number;
    lastEvaluation: Date;
  }> = new Map();

  constructor(config: Partial<RuleProcessorConfig> = {}) {
    this.config = {
      enableDebugMode: false,
      maxEvaluationTime: 5000,
      cacheEnabled: true,
      cacheTimeout: 300, // 5 minutes
      parallelEvaluation: true,
      maxConcurrentEvaluations: 10,
      ...config
    };
  }

  async evaluateRules(
    rules: NotificationRule[], 
    context: RuleEvaluationContext
  ): Promise<RuleEvaluationResult[]> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      if (this.config.cacheEnabled) {
        const cacheKey = this.generateCacheKey(rules, context);
        const cached = this.evaluationCache.get(cacheKey);
        if (cached && this.isCacheValid(cached)) {
          return [cached];
        }
      }

      // Filter applicable rules
      const applicableRules = this.filterApplicableRules(rules, context);
      
      // Evaluate rules
      const results = this.config.parallelEvaluation 
        ? await this.evaluateRulesParallel(applicableRules, context)
        : await this.evaluateRulesSequential(applicableRules, context);

      // Update cache
      if (this.config.cacheEnabled && results.length > 0) {
        const cacheKey = this.generateCacheKey(rules, context);
        this.evaluationCache.set(cacheKey, results[0]);
      }

      // Update metrics
      this.updateRuleMetrics(rules, results);

      // Check evaluation time
      const evaluationTime = Date.now() - startTime;
      if (evaluationTime > this.config.maxEvaluationTime) {
        console.warn(`Rule evaluation exceeded maximum time: ${evaluationTime}ms`);
      }

      return results;

    } catch (error) {
      console.error('Error evaluating rules:', error);
      return this.createErrorResults(rules, error);
    }
  }

  private filterApplicableRules(rules: NotificationRule[], context: RuleEvaluationContext): NotificationRule[] {
    return rules.filter(rule => {
      // Check if rule is enabled
      if (!rule.enabled) return false;

      // Check category match
      if (rule.category !== context.notification.category) return false;

      // Check quiet hours
      if (context.systemState.quietHours && !this.isEmergencyRule(rule)) {
        return false;
      }

      // Check emergency mode
      if (context.systemState.emergencyMode && !this.isEmergencyRule(rule)) {
        return false;
      }

      // Check maintenance mode
      if (context.systemState.maintenanceMode && !this.isMaintenanceRule(rule)) {
        return false;
      }

      return true;
    });
  }

  private async evaluateRulesParallel(
    rules: NotificationRule[], 
    context: RuleEvaluationContext
  ): Promise<RuleEvaluationResult[]> {
    const chunks = this.chunkArray(rules, this.config.maxConcurrentEvaluations);
    const results: RuleEvaluationResult[] = [];

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(rule => this.evaluateRule(rule, context));
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private async evaluateRulesSequential(
    rules: NotificationRule[], 
    context: RuleEvaluationContext
  ): Promise<RuleEvaluationResult[]> {
    const results: RuleEvaluationResult[] = [];

    for (const rule of rules) {
      const result = await this.evaluateRule(rule, context);
      results.push(result);
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private async evaluateRule(
    rule: NotificationRule, 
    context: RuleEvaluationContext
  ): Promise<RuleEvaluationResult> {
    const startTime = Date.now();
    
    try {
      const conditionResults = await this.evaluateConditions(rule.conditions, context);
      const overallMatch = this.calculateOverallMatch(conditionResults);
      const score = this.calculateRuleScore(rule, conditionResults, context);

      const result: RuleEvaluationResult = {
        ruleId: rule.id,
        matched: overallMatch,
        score,
        conditions: conditionResults,
        executionPlan: this.createExecutionPlan(rule, conditionResults, context),
        metadata: {
          evaluationTime: Date.now() - startTime,
          contextVersion: this.generateContextVersion(context),
          debugInfo: this.config.enableDebugMode ? {
            rule,
            context,
            conditionResults
          } : undefined
        }
      };

      return result;

    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
      return this.createErrorResult(rule, error);
    }
  }

  private async evaluateConditions(
    conditions: NotificationCondition[], 
    context: RuleEvaluationContext
  ): Promise<RuleEvaluationResult['conditions']> {
    const results: RuleEvaluationResult['conditions'] = [];

    for (const condition of conditions) {
      const startTime = Date.now();
      
      try {
        const matched = await this.evaluateCondition(condition, context);
        const weight = this.calculateConditionWeight(condition);
        const reason = this.generateConditionReason(condition, context, matched);

        results.push({
          conditionId: condition.id,
          matched,
          weight,
          reason
        });

      } catch (error) {
        console.error(`Error evaluating condition ${condition.id}:`, error);
        results.push({
          conditionId: condition.id,
          matched: false,
          weight: 0,
          reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return results;
  }

  private async evaluateCondition(
    condition: NotificationCondition, 
    context: RuleEvaluationContext
  ): Promise<boolean> {
    const fieldValue = this.extractFieldValue(condition.field, context);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'greater_than':
        return this.compareValues(fieldValue, conditionValue) > 0;
      case 'less_than':
        return this.compareValues(fieldValue, conditionValue) < 0;
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      case 'not_contains':
        return !String(fieldValue).includes(String(conditionValue));
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
      case 'not_in':
        return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
      case 'between':
        return this.isBetween(fieldValue, conditionValue);
      case 'not_between':
        return !this.isBetween(fieldValue, conditionValue);
      default:
        throw new Error(`Unknown operator: ${condition.operator}`);
    }
  }

  private extractFieldValue(field: string, context: RuleEvaluationContext): any {
    const parts = field.split('.');
    let value: any = context;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private compareValues(value1: any, value2: any): number {
    const num1 = Number(value1);
    const num2 = Number(value2);
    
    if (isNaN(num1) || isNaN(num2)) {
      return String(value1).localeCompare(String(value2));
    }
    
    return num1 - num2;
  }

  private isBetween(value: any, range: any[]): boolean {
    if (!Array.isArray(range) || range.length !== 2) return false;
    
    const num = Number(value);
    const min = Number(range[0]);
    const max = Number(range[1]);
    
    return !isNaN(num) && !isNaN(min) && !isNaN(max) && num >= min && num <= max;
  }

  private calculateOverallMatch(conditionResults: RuleEvaluationResult['conditions']): boolean {
    if (conditionResults.length === 0) return true;

    // Default to AND logic - all conditions must match
    return conditionResults.every(result => result.matched);
  }

  private calculateRuleScore(
    rule: NotificationRule, 
    conditionResults: RuleEvaluationResult['conditions'], 
    context: RuleEvaluationContext
  ): number {
    let score = rule.priority;

    // Add condition weights
    const conditionScore = conditionResults.reduce((sum, result) => {
      return sum + (result.matched ? result.weight : 0);
    }, 0);
    score += conditionScore;

    // Add context-based scoring
    score += this.calculateContextScore(rule, context);

    // Add time-based scoring
    score += this.calculateTimeScore(rule, context);

    return score;
  }

  private calculateConditionWeight(condition: NotificationCondition): number {
    // Base weight depends on condition type and operator
    const baseWeight = 10;

    switch (condition.type) {
      case 'security':
        return baseWeight * 3; // Security conditions are most important
      case 'price':
        return baseWeight * 2.5; // Price conditions are very important
      case 'trade':
        return baseWeight * 2; // Trade conditions are important
      case 'user_activity':
        return baseWeight * 1.5; // User activity is moderately important
      case 'time':
        return baseWeight * 1.2; // Time conditions are less important
      default:
        return baseWeight;
    }
  }

  private calculateContextScore(rule: NotificationRule, context: RuleEvaluationContext): number {
    let score = 0;

    // User preferences alignment
    if (context.userPreferences.categories[rule.category]?.enabled) {
      score += 5;
    }

    // User role alignment
    if (this.isRoleApplicable(rule, context.userProfile.role)) {
      score += 3;
    }

    // Location relevance
    if (this.isLocationRelevant(rule, context.userProfile.location)) {
      score += 2;
    }

    return score;
  }

  private calculateTimeScore(rule: NotificationRule, context: RuleEvaluationContext): number {
    let score = 0;

    const hour = context.currentTime.getHours();
    const dayOfWeek = context.currentTime.getDay();

    // Business hours bonus
    if (hour >= 9 && hour <= 17 && dayOfWeek >= 1 && dayOfWeek <= 5) {
      score += 2;
    }

    // Recent activity bonus
    const timeSinceLastActivity = context.currentTime.getTime() - context.historicalData.userActivity.lastLogin.getTime();
    if (timeSinceLastActivity < 24 * 60 * 60 * 1000) { // Last 24 hours
      score += 3;
    }

    return score;
  }

  private createExecutionPlan(
    rule: NotificationRule, 
    conditionResults: RuleEvaluationResult['conditions'], 
    context: RuleEvaluationContext
  ): RuleEvaluationResult['executionPlan'] {
    const matchedConditions = conditionResults.filter(r => r.matched);
    
    return {
      actions: rule.actions.map(action => action.id),
      priority: rule.priority,
      delay: this.calculateExecutionDelay(rule, context),
      conditions: matchedConditions.map(c => c.conditionId)
    };
  }

  private calculateExecutionDelay(rule: NotificationRule, context: RuleEvaluationContext): number {
    let delay = 0;

    // Add delay for quiet hours
    if (context.systemState.quietHours && !this.isEmergencyRule(rule)) {
      delay += 30 * 60 * 1000; // 30 minutes
    }

    // Add delay based on user activity
    const timeSinceLastActivity = context.currentTime.getTime() - context.historicalData.userActivity.lastLogin.getTime();
    if (timeSinceLastActivity > 60 * 60 * 1000) { // Inactive for more than 1 hour
      delay += 15 * 60 * 1000; // 15 minutes
    }

    return delay;
  }

  private generateConditionReason(
    condition: NotificationCondition, 
    context: RuleEvaluationContext, 
    matched: boolean
  ): string {
    const fieldValue = this.extractFieldValue(condition.field, context);
    
    return `${condition.field} ${condition.operator} ${condition.value} (actual: ${fieldValue}, matched: ${matched})`;
  }

  // Helper methods
  private isEmergencyRule(rule: NotificationRule): boolean {
    return rule.category === 'security' || rule.priority >= 80;
  }

  private isMaintenanceRule(rule: NotificationRule): boolean {
    return rule.category === 'system';
  }

  private isRoleApplicable(rule: NotificationRule, userRole: string): boolean {
    // This would be implemented based on specific role requirements
    return true;
  }

  private isLocationRelevant(rule: NotificationRule, userLocation: string): boolean {
    // This would be implemented based on location-based rules
    return true;
  }

  private generateCacheKey(rules: NotificationRule[], context: RuleEvaluationContext): string {
    const ruleIds = rules.map(r => r.id).sort().join(',');
    const contextHash = this.hashObject(context);
    return `${ruleIds}:${contextHash}`;
  }

  private isCacheValid(result: RuleEvaluationResult): boolean {
    const maxAge = this.config.cacheTimeout * 1000; // Convert to milliseconds
    return (Date.now() - result.metadata.evaluationTime) < maxAge;
  }

  private hashObject(obj: any): string {
    return btoa(JSON.stringify(obj));
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private generateContextVersion(context: RuleEvaluationContext): string {
    return `${context.currentTime.getTime()}-${context.systemState.quietHours}-${context.systemState.emergencyMode}`;
  }

  private updateRuleMetrics(rules: NotificationRule[], results: RuleEvaluationResult[]): void {
    for (const rule of rules) {
      const result = results.find(r => r.ruleId === rule.id);
      if (!result) continue;

      const existing = this.ruleMetrics.get(rule.id) || {
        evaluations: 0,
        matches: 0,
        averageTime: 0,
        lastEvaluation: new Date()
      };

      existing.evaluations++;
      if (result.matched) existing.matches++;
      existing.averageTime = (existing.averageTime * (existing.evaluations - 1) + result.metadata.evaluationTime) / existing.evaluations;
      existing.lastEvaluation = new Date();

      this.ruleMetrics.set(rule.id, existing);
    }
  }

  private createErrorResults(rules: NotificationRule[], error: any): RuleEvaluationResult[] {
    return rules.map(rule => this.createErrorResult(rule, error));
  }

  private createErrorResult(rule: NotificationRule, error: any): RuleEvaluationResult {
    return {
      ruleId: rule.id,
      matched: false,
      score: 0,
      conditions: [],
      executionPlan: {
        actions: [],
        priority: 0,
        delay: 0,
        conditions: []
      },
      metadata: {
        evaluationTime: 0,
        contextVersion: '',
        debugInfo: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    };
  }

  // Public methods
  getRuleMetrics(): Map<string, any> {
    return new Map(this.ruleMetrics);
  }

  clearCache(): void {
    this.evaluationCache.clear();
  }

  updateConfig(config: Partial<RuleProcessorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): RuleProcessorConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const ruleProcessor = new RuleProcessor();
