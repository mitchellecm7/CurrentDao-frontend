'use client';

import { useState, useEffect } from 'react';
import { 
  Repeat, 
  Calendar, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  Pause, 
  Play,
  ChevronDown,
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useScheduledTrading } from '@/hooks/useScheduledTrading';
import { RecurrencePattern, ScheduledTrade } from '@/types/scheduling';
import { SchedulingHelpers } from '@/utils/schedulingHelpers';
import { cn } from '@/lib/utils';

interface RecurringOrdersProps {
  className?: string;
  onEdit?: (trade: ScheduledTrade) => void;
}

export function RecurringOrders({ className, onEdit }: RecurringOrdersProps) {
  const { 
    trades, 
    timezone, 
    addRecurrence, 
    removeRecurrence, 
    updateRecurrence,
    cancelTrade,
    pauseTrade,
    resumeTrade
  } = useScheduledTrading();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPattern, setEditingPattern] = useState<string | null>(null);
  const [newPattern, setNewPattern] = useState<Partial<RecurrencePattern>>({
    type: 'daily',
    interval: 1
  });

  // Filter recurring trades
  const recurringTrades = trades.filter(trade => trade.recurrence);

  // Get next execution dates for a trade
  const getNextExecutions = (trade: ScheduledTrade, count: number = 3) => {
    if (!trade.recurrence) return [];
    return SchedulingHelpers.generateRecurringDates(
      trade.scheduledAt,
      trade.recurrence,
      trade.timezone,
      count
    );
  };

  // Format recurrence description
  const formatRecurrenceDescription = (pattern: RecurrencePattern) => {
    const { type, interval, daysOfWeek, dayOfMonth } = pattern;
    
    const intervalText = interval === 1 ? '' : `every ${interval} `;
    
    switch (type) {
      case 'daily':
        return `Repeats ${intervalText}daily`;
      case 'weekly':
        const days = daysOfWeek?.map(day => 
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
        ).join(', ');
        return `Repeats ${intervalText}week on ${days}`;
      case 'monthly':
        return `Repeats ${intervalText}month on day ${dayOfMonth}`;
      case 'yearly':
        return `Repeats ${intervalText}year`;
      default:
        return 'No recurrence';
    }
  };

  // Create new recurring pattern
  const handleCreatePattern = async (tradeId: string) => {
    if (!newPattern.type || !newPattern.interval) return;

    const validation = SchedulingHelpers.validateRecurrencePattern(newPattern as RecurrencePattern);
    if (!validation.isValid) {
      alert(`Invalid pattern: ${validation.errors.join(', ')}`);
      return;
    }

    try {
      await addRecurrence(tradeId, newPattern as RecurrencePattern);
      setShowCreateForm(false);
      setNewPattern({ type: 'daily', interval: 1 });
    } catch (err) {
      console.error('Failed to create recurrence:', err);
    }
  };

  // Update existing pattern
  const handleUpdatePattern = async (tradeId: string, pattern: RecurrencePattern) => {
    const validation = SchedulingHelpers.validateRecurrencePattern(pattern);
    if (!validation.isValid) {
      alert(`Invalid pattern: ${validation.errors.join(', ')}`);
      return;
    }

    try {
      await updateRecurrence(tradeId, pattern);
      setEditingPattern(null);
    } catch (err) {
      console.error('Failed to update recurrence:', err);
    }
  };

  // Remove recurrence
  const handleRemoveRecurrence = async (tradeId: string) => {
    if (confirm('Are you sure you want to remove the recurrence pattern? This will not cancel the scheduled trade.')) {
      try {
        await removeRecurrence(tradeId);
      } catch (err) {
        console.error('Failed to remove recurrence:', err);
      }
    }
  };

  return (
    <div className={cn("bg-card rounded-lg border p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Recurring Orders</h2>
          <span className="text-sm text-muted-foreground">
            ({recurringTrades.length} active)
          </span>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Setup Recurrence</span>
        </button>
      </div>

      {/* Create Recurrence Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-4">Create Recurrence Pattern</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pattern Type</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={newPattern.type}
                onChange={(e) => setNewPattern({ 
                  ...newPattern, 
                  type: e.target.value as RecurrencePattern['type'] 
                })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Interval</label>
              <input
                type="number"
                min="1"
                className="w-full p-2 border rounded-md bg-background"
                value={newPattern.interval || 1}
                onChange={(e) => setNewPattern({ 
                  ...newPattern, 
                  interval: parseInt(e.target.value) || 1 
                })}
              />
            </div>

            {newPattern.type === 'weekly' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Days of Week</label>
                <div className="flex gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <label key={day} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={newPattern.daysOfWeek?.includes(index)}
                        onChange={(e) => {
                          const days = newPattern.daysOfWeek || [];
                          if (e.target.checked) {
                            setNewPattern({ 
                              ...newPattern, 
                              daysOfWeek: [...days, index] 
                            });
                          } else {
                            setNewPattern({ 
                              ...newPattern, 
                              daysOfWeek: days.filter(d => d !== index) 
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {newPattern.type === 'monthly' && (
              <div>
                <label className="block text-sm font-medium mb-2">Day of Month</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="w-full p-2 border rounded-md bg-background"
                  value={newPattern.dayOfMonth || 1}
                  onChange={(e) => setNewPattern({ 
                    ...newPattern, 
                    dayOfMonth: parseInt(e.target.value) || 1 
                  })}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md bg-background"
                onChange={(e) => setNewPattern({ 
                  ...newPattern, 
                  endDate: e.target.value ? new Date(e.target.value) : undefined 
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Executions (Optional)</label>
              <input
                type="number"
                min="1"
                className="w-full p-2 border rounded-md bg-background"
                value={newPattern.maxExecutions || ''}
                onChange={(e) => setNewPattern({ 
                  ...newPattern, 
                  maxExecutions: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {/* Apply to selected trade */}}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Apply to Trade
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewPattern({ type: 'daily', interval: 1 });
              }}
              className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Recurring Orders List */}
      <div className="space-y-4">
        {recurringTrades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Repeat className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recurring orders set up</p>
            <p className="text-sm">Create a recurring pattern to automate your trading strategy</p>
          </div>
        ) : (
          recurringTrades.map((trade) => {
            const nextExecutions = getNextExecutions(trade);
            const isEditing = editingPattern === trade.id;

            return (
              <div key={trade.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      trade.type === 'buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    )}>
                      {trade.type === 'buy' ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="font-medium">
                        {trade.type.toUpperCase()} {trade.amount} {trade.token.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {trade.price && `@ $${trade.price.toFixed(2)}`}
                      </div>
                      {trade.metadata?.notes && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {trade.metadata.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit?.(trade)}
                      className="p-2 rounded hover:bg-accent transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingPattern(isEditing ? null : trade.id)}
                      className="p-2 rounded hover:bg-accent transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveRecurrence(trade.id)}
                      className="p-2 rounded hover:bg-accent transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Recurrence Pattern */}
                {trade.recurrence && (
                  <div className="mb-4">
                    {isEditing ? (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select
                              className="w-full p-2 border rounded-md bg-background text-sm"
                              value={trade.recurrence.type}
                              onChange={(e) => handleUpdatePattern(trade.id, {
                                ...trade.recurrence,
                                type: e.target.value as RecurrencePattern['type']
                              })}
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Interval</label>
                            <input
                              type="number"
                              min="1"
                              className="w-full p-2 border rounded-md bg-background text-sm"
                              value={trade.recurrence.interval}
                              onChange={(e) => handleUpdatePattern(trade.id, {
                                ...trade.recurrence,
                                interval: parseInt(e.target.value) || 1
                              })}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => setEditingPattern(null)}
                            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPattern(null)}
                            className="px-3 py-1 border rounded text-sm hover:bg-accent"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <Repeat className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          {formatRecurrenceDescription(trade.recurrence)}
                        </span>
                        <div className="flex items-center gap-1 ml-auto">
                          <span className="text-xs text-muted-foreground">
                            Executed: {trade.recurrence.executionCount || 0}
                          </span>
                          {trade.recurrence.maxExecutions && (
                            <span className="text-xs text-muted-foreground">
                              / {trade.recurrence.maxExecutions}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Next Executions */}
                {nextExecutions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="w-4 h-4" />
                      Next Executions:
                    </div>
                    <div className="space-y-1">
                      {nextExecutions.map((date, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground pl-6">
                          <Clock className="w-3 h-3" />
                          <span>
                            {SchedulingHelpers.formatDateTime(date, trade.timezone)}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                              Next
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Summary */}
                {trade.performance && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Success Rate</span>
                        <div className="font-medium">
                          {trade.performance.winRate.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Volume</span>
                        <div className="font-medium">
                          {trade.performance.totalVolume.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">P&L</span>
                        <div className={cn(
                          "font-medium",
                          trade.performance.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {trade.performance.profitLoss >= 0 ? '+' : ''}
                          ${trade.performance.profitLoss.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Execution</span>
                        <div className="font-medium">
                          {SchedulingHelpers.formatDate(trade.performance.lastExecutionDate, trade.timezone)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => cancelTrade(trade.id)}
                    className="flex items-center gap-2 px-3 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Cancel All</span>
                  </button>
                  <button
                    onClick={() => pauseTrade(trade.id)}
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">About Recurring Orders:</p>
            <ul className="space-y-1 text-xs">
              <li>• Set up automated trades that repeat on your schedule</li>
              <li>• Choose from daily, weekly, monthly, or yearly patterns</li>
              <li>• Set end dates or maximum execution limits</li>
              <li>• Combine with conditional rules for smart trading</li>
              <li>• Monitor performance and adjust patterns as needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecurringOrders;
