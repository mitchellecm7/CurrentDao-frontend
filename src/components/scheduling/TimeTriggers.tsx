'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Plus,
  Edit2,
  Trash2,
  Play,
  Pause,
  Bell,
  AlertTriangle,
  ChevronDown,
  Info
} from 'lucide-react';
import { useScheduledTrading } from '@/hooks/useScheduledTrading';
import { TimeTrigger, ScheduledTrade } from '@/types/scheduling';
import { SchedulingHelpers } from '@/utils/schedulingHelpers';
import { cn } from '@/lib/utils';

interface TimeTriggersProps {
  className?: string;
  onEdit?: (trigger: TimeTrigger) => void;
}

export function TimeTriggers({ className, onEdit }: TimeTriggersProps) {
  const { 
    trades, 
    timezone, 
    createTrade,
    cancelTrade,
    pauseTrade,
    resumeTrade,
    stats
  } = useScheduledTrading();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTrigger, setNewTrigger] = useState<Partial<TimeTrigger>>({
    type: 'specific_time',
    isActive: true
  });

  // Mock triggers - in real app, these would come from API
  const [triggers, setTriggers] = useState<TimeTrigger[]>([
    {
      id: '1',
      name: 'Market Open Buy',
      type: 'market_open',
      offset: -5, // 5 minutes before market open
      isActive: true,
      description: 'Buy SOL 5 minutes before market opens'
    },
    {
      id: '2',
      name: 'Price Drop Alert',
      type: 'price_threshold',
      conditions: [
        {
          id: 'cond1',
          type: 'price',
          operator: 'lt',
          value: 45,
          timeWindow: 60,
          isActive: true,
          description: 'Price drops below $45'
        }
      ],
      isActive: true,
      description: 'Execute when SOL drops below $45'
    },
    {
      id: '3',
      name: 'Daily 3 PM Trade',
      type: 'specific_time',
      time: '15:00',
      isActive: true,
      description: 'Daily trade at 3:00 PM'
    }
  ]);

  // Get trigger status
  const getTriggerStatus = (trigger: TimeTrigger) => {
    if (!trigger.isActive) return 'paused';
    
    switch (trigger.type) {
      case 'market_open':
        return SchedulingHelpers.isMarketOpen(timezone.name) ? 'active' : 'waiting';
      case 'market_close':
        return SchedulingHelpers.isMarketOpen(timezone.name) ? 'waiting' : 'active';
      case 'specific_time':
        const now = new Date();
        const [hours, minutes] = (trigger.time || '00:00').split(':').map(Number);
        const triggerTime = new Date(now);
        triggerTime.setHours(hours, minutes, 0, 0);
        return now >= triggerTime ? 'executed' : 'waiting';
      default:
        return 'active';
    }
  };

  // Get next execution time
  const getNextExecutionTime = (trigger: TimeTrigger) => {
    switch (trigger.type) {
      case 'market_open':
        return SchedulingHelpers.getNextMarketOpen(timezone.name);
      case 'market_close':
        const now = new Date();
        const closeTime = new Date(now);
        closeTime.setHours(16, 0, 0, 0);
        return closeTime > now ? closeTime : new Date(closeTime.getTime() + 24 * 60 * 60 * 1000);
      case 'specific_time':
        const today = new Date();
        const [hours, minutes] = (trigger.time || '00:00').split(':').map(Number);
        const executionTime = new Date(today);
        executionTime.setHours(hours, minutes, 0, 0);
        return executionTime > today ? executionTime : new Date(executionTime.getTime() + 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  };

  // Create new trigger
  const handleCreateTrigger = async () => {
    if (!newTrigger.name || !newTrigger.type) return;

    try {
      const trigger: TimeTrigger = {
        id: Date.now().toString(),
        name: newTrigger.name,
        type: newTrigger.type,
        time: newTrigger.time,
        offset: newTrigger.offset,
        conditions: newTrigger.conditions,
        isActive: newTrigger.isActive || true
      } as TimeTrigger;

      setTriggers(prev => [...prev, trigger]);
      setShowCreateForm(false);
      setNewTrigger({ type: 'specific_time', isActive: true });

      // Create associated trade if needed
      if (trigger.type === 'specific_time' && trigger.time) {
        const [hours, minutes] = trigger.time.split(':').map(Number);
        const scheduledDate = new Date();
        scheduledDate.setHours(hours, minutes, 0, 0);

        if (scheduledDate > new Date()) {
          await createTrade({
            type: 'buy',
            amount: 100,
            token: { symbol: 'SOL', name: 'Solana', decimals: 9 },
            scheduledAt: scheduledDate,
            timezone: timezone.name,
            metadata: {
              notes: `Triggered by: ${trigger.name}`,
              tags: ['automated', 'trigger']
            }
          });
        }
      }
    } catch (err) {
      console.error('Failed to create trigger:', err);
    }
  };

  // Update trigger
  const handleUpdateTrigger = async (triggerId: string, updates: Partial<TimeTrigger>) => {
    setTriggers(prev => prev.map(trigger => 
      trigger.id === triggerId ? { ...trigger, ...updates } : trigger
    ));
  };

  // Delete trigger
  const handleDeleteTrigger = async (triggerId: string) => {
    if (confirm('Are you sure you want to delete this trigger?')) {
      setTriggers(prev => prev.filter(trigger => trigger.id !== triggerId));
    }
  };

  // Toggle trigger active state
  const handleToggleTrigger = async (triggerId: string) => {
    const trigger = triggers.find(t => t.id === triggerId);
    if (trigger) {
      await handleUpdateTrigger(triggerId, { isActive: !trigger.isActive });
    }
  };

  // Get trigger icon
  const getTriggerIcon = (type: TimeTrigger['type']) => {
    switch (type) {
      case 'market_open':
        return <TrendingUp className="w-4 h-4" />;
      case 'market_close':
        return <TrendingDown className="w-4 h-4" />;
      case 'specific_time':
        return <Clock className="w-4 h-4" />;
      case 'price_threshold':
        return <Activity className="w-4 h-4" />;
      case 'volume_spike':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  // Get trigger color
  const getTriggerColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'waiting':
        return 'text-blue-600 bg-blue-100';
      case 'executed':
        return 'text-gray-600 bg-gray-100';
      case 'paused':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={cn("bg-card rounded-lg border p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Time Triggers</h2>
          <span className="text-sm text-muted-foreground">
            ({triggers.filter(t => t.isActive).length} active)
          </span>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Trigger</span>
        </button>
      </div>

      {/* Create Trigger Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-4">Create Time Trigger</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Trigger Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md bg-background"
                value={newTrigger.name || ''}
                onChange={(e) => setNewTrigger({ ...newTrigger, name: e.target.value })}
                placeholder="e.g., Market Open Buy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Trigger Type</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={newTrigger.type}
                onChange={(e) => setNewTrigger({ 
                  ...newTrigger, 
                  type: e.target.value as TimeTrigger['type'] 
                })}
              >
                <option value="specific_time">Specific Time</option>
                <option value="market_open">Market Open</option>
                <option value="market_close">Market Close</option>
                <option value="price_threshold">Price Threshold</option>
                <option value="volume_spike">Volume Spike</option>
              </select>
            </div>

            {newTrigger.type === 'specific_time' && (
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded-md bg-background"
                  value={newTrigger.time || ''}
                  onChange={(e) => setNewTrigger({ ...newTrigger, time: e.target.value })}
                />
              </div>
            )}

            {(newTrigger.type === 'market_open' || newTrigger.type === 'market_close') && (
              <div>
                <label className="block text-sm font-medium mb-2">Offset (minutes)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md bg-background"
                  value={newTrigger.offset || ''}
                  onChange={(e) => setNewTrigger({ 
                    ...newTrigger, 
                    offset: parseInt(e.target.value) || undefined 
                  })}
                  placeholder="Minutes before/after"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateTrigger}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Trigger
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewTrigger({ type: 'specific_time', isActive: true });
              }}
              className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Triggers List */}
      <div className="space-y-4">
        {triggers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No time triggers set up</p>
            <p className="text-sm">Create triggers to automate your trading based on time and market conditions</p>
          </div>
        ) : (
          triggers.map((trigger) => {
            const status = getTriggerStatus(trigger);
            const nextExecution = getNextExecutionTime(trigger);

            return (
              <div key={trigger.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      getTriggerColor(status)
                    )}>
                      {getTriggerIcon(trigger.type)}
                    </div>

                    <div>
                      <div className="font-medium">{trigger.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {trigger.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit?.(trigger)}
                      className="p-2 rounded hover:bg-accent transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleTrigger(trigger.id)}
                      className="p-2 rounded hover:bg-accent transition-colors"
                    >
                      {trigger.isActive ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteTrigger(trigger.id)}
                      className="p-2 rounded hover:bg-accent transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Trigger Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium capitalize">
                      {trigger.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Status: </span>
                    <span className={cn(
                      "font-medium capitalize",
                      status === 'active' && "text-green-600",
                      status === 'waiting' && "text-blue-600",
                      status === 'executed' && "text-gray-600",
                      status === 'paused' && "text-orange-600"
                    )}>
                      {status}
                    </span>
                  </div>

                  {trigger.time && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Time: </span>
                      <span className="font-medium">{trigger.time}</span>
                    </div>
                  )}

                  {trigger.offset !== undefined && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Offset: </span>
                      <span className="font-medium">
                        {trigger.offset > 0 ? '+' : ''}{trigger.offset} minutes
                      </span>
                    </div>
                  )}
                </div>

                {/* Next Execution */}
                {nextExecution && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div className="text-sm">
                      <div className="font-medium">Next Execution:</div>
                      <div>
                        {SchedulingHelpers.formatDateTime(nextExecution, timezone.name)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditions */}
                {trigger.conditions && trigger.conditions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Conditions:
                    </div>
                    <div className="space-y-1 pl-6">
                      {trigger.conditions.map((condition) => (
                        <div key={condition.id} className="text-sm text-muted-foreground">
                          {condition.description}
                          {!condition.isActive && (
                            <span className="ml-2 text-orange-600">(Inactive)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Associated Trades */}
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Associated Trades:</div>
                  <div className="space-y-1">
                    {trades
                      .filter(trade => 
                        trade.metadata?.tags?.includes('trigger') && 
                        trade.metadata?.notes?.includes(trigger.name)
                      )
                      .slice(0, 3)
                      .map((trade) => (
                        <div key={trade.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                          <div>
                            <span className="font-medium">
                              {trade.type.toUpperCase()} {trade.amount} {trade.token.symbol}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              {SchedulingHelpers.formatDateTime(trade.scheduledAt, trade.timezone)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              trade.status === 'pending' && "bg-orange-100 text-orange-800",
                              trade.status === 'executed' && "bg-green-100 text-green-800",
                              trade.status === 'cancelled' && "bg-gray-100 text-gray-800",
                              trade.status === 'failed' && "bg-red-100 text-red-800"
                            )}>
                              {trade.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats Overview */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-3">Trigger Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Active Triggers</span>
            <div className="font-medium">
              {triggers.filter(t => t.isActive).length}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Executed Today</span>
            <div className="font-medium">
              {stats.completedToday}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Success Rate</span>
            <div className="font-medium">
              {stats.successRate.toFixed(1)}%
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Pending Volume</span>
            <div className="font-medium">
              {trades
                .filter(t => t.status === 'pending')
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">About Time Triggers:</p>
            <ul className="space-y-1 text-xs">
              <li>• Execute trades based on specific times or market events</li>
              <li>• Set offsets for market open/close triggers</li>
              <li>• Combine with price and volume conditions</li>
              <li>• Automate recurring trading strategies</li>
              <li>• Monitor trigger performance and execution history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimeTriggers;
