import { 
  ScheduledTrade, 
  RecurrencePattern, 
  ConditionalRule, 
  CalendarEvent, 
  TimezoneInfo,
  MarketCondition,
  FilterOptions,
  SortOptions 
} from '@/types/scheduling';

export class SchedulingHelpers {
  // Timezone utilities
  static getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  static convertToTimezone(date: Date, timezone: string): Date {
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  }

  static getTimezoneOffset(timezone: string): string {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60);
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  static getTimezoneInfo(timezone: string): TimezoneInfo {
    const now = new Date();
    return {
      name: timezone,
      offset: this.getTimezoneOffset(timezone),
      currentTime: this.convertToTimezone(now, timezone),
      marketHours: {
        open: '09:30',
        close: '16:00',
        timezone: 'America/New_York'
      }
    };
  }

  // Recurrence pattern utilities
  static getNextExecutionDate(
    startDate: Date, 
    pattern: RecurrencePattern, 
    timezone: string
  ): Date | null {
    const now = new Date();
    const current = this.convertToTimezone(now, timezone);
    let nextDate = new Date(startDate);

    switch (pattern.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + pattern.interval);
        break;

      case 'weekly':
        const targetDay = pattern.daysOfWeek?.[0] || startDate.getDay();
        const daysUntilTarget = (targetDay - nextDate.getDay() + 7) % 7;
        nextDate.setDate(nextDate.getDate() + daysUntilTarget + (pattern.interval - 1) * 7);
        break;

      case 'monthly':
        const targetDay = pattern.dayOfMonth || startDate.getDate();
        nextDate.setMonth(nextDate.getMonth() + pattern.interval);
        nextDate.setDate(Math.min(targetDay, this.getDaysInMonth(nextDate.getFullYear(), nextDate.getMonth())));
        break;

      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
        break;
    }

    // Check if we've exceeded the end date or max executions
    if (pattern.endDate && nextDate > pattern.endDate) {
      return null;
    }

    if (pattern.maxExecutions && pattern.executionCount && pattern.executionCount >= pattern.maxExecutions) {
      return null;
    }

    return nextDate <= current ? null : nextDate;
  }

  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  static generateRecurringDates(
    startDate: Date, 
    pattern: RecurrencePattern, 
    timezone: string,
    count: number = 10
  ): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    let executionCount = 0;

    while (executionCount < count && currentDate <= new Date()) {
      const nextDate = this.getNextExecutionDate(currentDate, pattern, timezone);
      if (!nextDate) break;
      
      dates.push(nextDate);
      currentDate = nextDate;
      executionCount++;
    }

    return dates;
  }

  // Conditional rule utilities
  static evaluateCondition(
    rule: ConditionalRule, 
    marketData: MarketCondition
  ): boolean {
    let value: number;

    switch (rule.type) {
      case 'price':
        value = marketData.price;
        break;
      case 'volume':
        value = marketData.volume;
        break;
      case 'market_cap':
        value = marketData.marketCap;
        break;
      case 'rsi':
        value = marketData.indicators?.rsi || 0;
        break;
      case 'macd':
        value = marketData.indicators?.macd.signal || 0;
        break;
      default:
        return false;
    }

    return this.compareValues(value, rule.operator, rule.value);
  }

  static compareValues(
    actual: number, 
    operator: ConditionalRule['operator'], 
    expected: number | [number, number]
  ): boolean {
    switch (operator) {
      case 'gt':
        return actual > (expected as number);
      case 'lt':
        return actual < (expected as number);
      case 'eq':
        return actual === (expected as number);
      case 'gte':
        return actual >= (expected as number);
      case 'lte':
        return actual <= (expected as number);
      case 'between':
        const [min, max] = expected as [number, number];
        return actual >= min && actual <= max;
      default:
        return false;
    }
  }

  static evaluateAllConditions(
    conditions: ConditionalRule[], 
    marketData: MarketCondition
  ): boolean {
    return conditions.every(condition => 
      condition.isActive && this.evaluateCondition(condition, marketData)
    );
  }

  // Calendar utilities
  static generateCalendarEvents(
    trades: ScheduledTrade[], 
    timezone: string
  ): CalendarEvent[] {
    return trades.map(trade => ({
      id: trade.id,
      title: `${trade.type.toUpperCase()} ${trade.amount} ${trade.token.symbol}`,
      start: this.convertToTimezone(trade.scheduledAt, timezone),
      end: trade.executedAt ? this.convertToTimezone(trade.executedAt, timezone) : undefined,
      type: trade.recurrence ? 'recurring_trade' : 'scheduled_trade',
      status: trade.status,
      trade,
      color: this.getEventColor(trade),
      description: trade.metadata?.notes
    }));
  }

  static getEventColor(trade: ScheduledTrade): string {
    switch (trade.status) {
      case 'pending':
        return trade.type === 'buy' ? '#10b981' : '#ef4444';
      case 'executed':
        return '#3b82f6';
      case 'cancelled':
        return '#6b7280';
      case 'failed':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  }

  // Date formatting utilities
  static formatDate(date: Date, timezone: string, format: 'short' | 'long' = 'short'): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: format === 'long' ? 'long' : 'short',
      day: 'numeric'
    };

    if (format === 'long') {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return date.toLocaleString('en-US', options);
  }

  static formatTime(date: Date, timezone: string): string {
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  static formatDateTime(date: Date, timezone: string): string {
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  // Validation utilities
  static validateScheduledTrade(trade: Partial<ScheduledTrade>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!trade.amount || trade.amount <= 0) {
      errors.push('Trade amount must be greater than 0');
    }

    if (!trade.token) {
      errors.push('Token is required');
    }

    if (!trade.scheduledAt || trade.scheduledAt <= new Date()) {
      errors.push('Scheduled time must be in the future');
    }

    if (!trade.timezone) {
      errors.push('Timezone is required');
    }

    if (trade.recurrence) {
      const recurrenceErrors = this.validateRecurrencePattern(trade.recurrence);
      errors.push(...recurrenceErrors);
    }

    if (trade.conditions) {
      trade.conditions.forEach((condition, index) => {
        const conditionErrors = this.validateConditionalRule(condition);
        errors.push(...conditionErrors.map(error => `Condition ${index + 1}: ${error}`));
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateRecurrencePattern(pattern: RecurrencePattern): string[] {
    const errors: string[] = [];

    if (!pattern.type) {
      errors.push('Recurrence type is required');
    }

    if (!pattern.interval || pattern.interval <= 0) {
      errors.push('Interval must be greater than 0');
    }

    if (pattern.type === 'weekly' && (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0)) {
      errors.push('Days of week are required for weekly recurrence');
    }

    if (pattern.type === 'monthly' && !pattern.dayOfMonth) {
      errors.push('Day of month is required for monthly recurrence');
    }

    if (pattern.endDate && pattern.endDate <= new Date()) {
      errors.push('End date must be in the future');
    }

    return errors;
  }

  static validateConditionalRule(rule: ConditionalRule): string[] {
    const errors: string[] = [];

    if (!rule.type) {
      errors.push('Condition type is required');
    }

    if (!rule.operator) {
      errors.push('Operator is required');
    }

    if (rule.value === undefined || rule.value === null) {
      errors.push('Value is required');
    }

    if (rule.operator === 'between' && !Array.isArray(rule.value)) {
      errors.push('Value must be an array for between operator');
    }

    return errors;
  }

  // Sorting and filtering utilities
  static filterTrades(trades: ScheduledTrade[], filters: FilterOptions): ScheduledTrade[] {
    return trades.filter(trade => {
      if (filters.status && !filters.status.includes(trade.status)) {
        return false;
      }

      if (filters.type && !filters.type.includes(trade.type)) {
        return false;
      }

      if (filters.dateRange) {
        const tradeDate = new Date(trade.scheduledAt);
        if (tradeDate < filters.dateRange.start || tradeDate > filters.dateRange.end) {
          return false;
        }
      }

      if (filters.token && !filters.token.includes(trade.token.symbol)) {
        return false;
      }

      if (filters.recurrence && trade.recurrence && !filters.recurrence.includes(trade.recurrence.type)) {
        return false;
      }

      return true;
    });
  }

  static sortTrades(trades: ScheduledTrade[], sort: SortOptions): ScheduledTrade[] {
    return [...trades].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.field) {
        case 'scheduledAt':
          aValue = new Date(a.scheduledAt).getTime();
          bValue = new Date(b.scheduledAt).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sort.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sort.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Performance calculation utilities
  static calculateTradePerformance(trades: ScheduledTrade[]): {
    totalExecuted: number;
    successRate: number;
    totalVolume: number;
    averageExecutionPrice: number;
  } {
    const executedTrades = trades.filter(trade => trade.status === 'executed');
    const totalExecuted = executedTrades.length;
    const successRate = trades.length > 0 ? (totalExecuted / trades.length) * 100 : 0;
    const totalVolume = executedTrades.reduce((sum, trade) => sum + trade.amount, 0);
    const averageExecutionPrice = totalExecuted > 0 
      ? executedTrades.reduce((sum, trade) => sum + (trade.price || 0), 0) / totalExecuted 
      : 0;

    return {
      totalExecuted,
      successRate,
      totalVolume,
      averageExecutionPrice
    };
  }

  // Market hours utilities
  static isMarketOpen(timezone: string): boolean {
    const now = this.convertToTimezone(new Date(), timezone);
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;
    
    const marketOpen = 9 * 60 + 30; // 9:30 AM
    const marketClose = 16 * 60; // 4:00 PM
    
    return currentTime >= marketOpen && currentTime < marketClose;
  }

  static getNextMarketOpen(timezone: string): Date {
    const now = this.convertToTimezone(new Date(), timezone);
    const nextOpen = new Date(now);
    
    // If it's after market close on Friday, go to Monday
    if (now.getDay() === 5 && now.getHours() >= 16) {
      nextOpen.setDate(nextOpen.getDate() + 3);
    }
    // If it's Saturday, go to Monday
    else if (now.getDay() === 6) {
      nextOpen.setDate(nextOpen.getDate() + 2);
    }
    // If it's Sunday, go to Monday
    else if (now.getDay() === 0) {
      nextOpen.setDate(nextOpen.getDate() + 1);
    }
    // If it's after market close, go to next day
    else if (now.getHours() >= 16) {
      nextOpen.setDate(nextOpen.getDate() + 1);
    }
    
    nextOpen.setHours(9, 30, 0, 0);
    return nextOpen;
  }

  // Notification utilities
  static shouldSendNotification(trade: ScheduledTrade, currentTime: Date): boolean {
    const timeUntilExecution = trade.scheduledAt.getTime() - currentTime.getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    return timeUntilExecution <= fiveMinutes && timeUntilExecution > 0 && trade.status === 'pending';
  }

  static generateNotificationMessage(trade: ScheduledTrade): string {
    switch (trade.status) {
      case 'executed':
        return `Successfully executed ${trade.type} order for ${trade.amount} ${trade.token.symbol}`;
      case 'failed':
        return `Failed to execute ${trade.type} order for ${trade.amount} ${trade.token.symbol}`;
      case 'cancelled':
        return `Cancelled ${trade.type} order for ${trade.amount} ${trade.token.symbol}`;
      default:
        return `Scheduled ${trade.type} order for ${trade.amount} ${trade.token.symbol} at ${this.formatDateTime(trade.scheduledAt, trade.timezone)}`;
    }
  }
}
