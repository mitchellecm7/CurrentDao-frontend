'use client';

import { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Plus,
  Edit2,
  Trash2,
  Play,
  Pause,
  AlertTriangle,
  ChevronDown,
  Info,
  Settings
} from 'lucide-react';
import { useScheduledTrading } from '@/hooks/useScheduledTrading';
import { ConditionalRule, ScheduledTrade } from '@/types/scheduling';
import { SchedulingHelpers } from '@/utils/schedulingHelpers';
import { cn } from '@/lib/utils';

interface ConditionalRulesProps {
  className?: string;
  tradeId?: string;
  onEdit?: (rule: ConditionalRule) => void;
  onRuleChange?: (rules: ConditionalRule[]) => void;
}

export function ConditionalRules({ className, tradeId, onEdit, onRuleChange }: ConditionalRulesProps) {
  const { 
    trades, 
    timezone, 
    addCondition, 
    updateCondition, 
    removeCondition,
    createTrade
  } = useScheduledTrading();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRule, setNewRule] = useState<Partial<ConditionalRule>>({
    type: 'price',
    operator: 'gt',
    isActive: true
  });

  // Get rules for a specific trade or all rules
  const getRulesForTrade = (tradeId: string) => {
    const trade = trades.find(t => t.id === tradeId);
    return trade?.conditions || [];
  };

  const rules = tradeId ? getRulesForTrade(tradeId) : [];

  // Create new condition
  const handleCreateRule = async () => {
    if (!newRule.type || !newRule.operator || newRule.value === undefined) return;

    try {
      const rule: ConditionalRule = {
        id: Date.now().toString(),
        type: newRule.type,
        operator: newRule.operator,
        value: newRule.value,
        timeWindow: newRule.timeWindow,
        isActive: newRule.isActive || true,
        description: generateRuleDescription(newRule as ConditionalRule)
      } as ConditionalRule;

      if (tradeId) {
        await addCondition(tradeId, rule);
      } else {
        // Create a new trade with this condition
        await createTrade({
          type: 'buy',
          amount: 100,
          token: { symbol: 'SOL', name: 'Solana', decimals: 9 },
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          timezone: timezone.name,
          conditions: [rule],
          metadata: {
            notes: `Conditional trade: ${rule.description}`,
            tags: ['conditional', 'automated']
          }
        });
      }

      setShowCreateForm(false);
      setNewRule({ type: 'price', operator: 'gt', isActive: true });
      onRuleChange?.([...rules, rule]);
    } catch (err) {
      console.error('Failed to create condition:', err);
    }
  };

  // Update rule
  const handleUpdateRule = async (ruleId: string, updates: Partial<ConditionalRule>) => {
    if (tradeId) {
      await updateCondition(tradeId, ruleId, updates as ConditionalRule);
    }
    
    onRuleChange?.(rules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  // Delete rule
  const handleDeleteRule = async (ruleId: string) => {
    if (confirm('Are you sure you want to delete this condition?')) {
      if (tradeId) {
        await removeCondition(tradeId, ruleId);
      }
      
      onRuleChange?.(rules.filter(rule => rule.id !== ruleId));
    }
  };

  // Toggle rule active state
  const handleToggleRule = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      await handleUpdateRule(ruleId, { isActive: !rule.isActive });
    }
  };

  // Generate rule description
  const generateRuleDescription = (rule: ConditionalRule): string => {
    const { type, operator, value, timeWindow } = rule;
    
    let conditionText = '';
    switch (type) {
      case 'price':
        conditionText = `Price ${operator} ${typeof value === 'number' ? `$${value}` : `${value[0]} - $${value[1]}`}`;
        break;
      case 'volume':
        conditionText = `Volume ${operator} ${typeof value === 'number' ? value.toLocaleString() : `${value[0]} - ${value[1]}`}`;
        break;
      case 'market_cap':
        conditionText = `Market Cap ${operator} $${(typeof value === 'number' ? value : value[1]).toLocaleString()}`;
        break;
      case 'rsi':
        conditionText = `RSI ${operator} ${value}`;
        break;
      case 'macd':
        conditionText = `MACD ${operator} ${value}`;
        break;
      default:
        conditionText = 'Custom condition';
    }

    if (timeWindow) {
      conditionText += ` within ${timeWindow} minutes`;
    }

    return conditionText;
  };

  // Get rule icon
  const getRuleIcon = (type: ConditionalRule['type']) => {
    switch (type) {
      case 'price':
        return <TrendingUp className="w-4 h-4" />;
      case 'volume':
        return <Activity className="w-4 h-4" />;
      case 'market_cap':
        return <BarChart3 className="w-4 h-4" />;
      case 'rsi':
        return <TrendingUp className="w-4 h-4" />;
      case 'macd':
        return <Activity className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  // Get rule color
  const getRuleColor = (rule: ConditionalRule) => {
    if (!rule.isActive) return 'text-gray-600 bg-gray-100';
    
    switch (rule.type) {
      case 'price':
        return 'text-blue-600 bg-blue-100';
      case 'volume':
        return 'text-green-600 bg-green-100';
      case 'market_cap':
        return 'text-purple-600 bg-purple-100';
      case 'rsi':
        return 'text-orange-600 bg-orange-100';
      case 'macd':
        return 'text-pink-600 bg-pink-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Test rule against current market data
  const testRule = (rule: ConditionalRule) => {
    // Mock market data - in real app, this would come from API
    const mockMarketData = {
      timestamp: new Date(),
      price: 50.25,
      volume: 1000000,
      marketCap: 25000000000,
      indicators: {
        rsi: 65,
        macd: {
          signal: 0.5,
          histogram: 0.2
        }
      }
    };

    return SchedulingHelpers.evaluateCondition(rule, mockMarketData);
  };

  return (
    <div className={cn("bg-card rounded-lg border p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Conditional Rules</h2>
          <span className="text-sm text-muted-foreground">
            ({rules.filter(r => r.isActive).length} active)
          </span>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Rule</span>
        </button>
      </div>

      {/* Create Rule Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-4">Create Conditional Rule</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Condition Type</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={newRule.type}
                onChange={(e) => setNewRule({ 
                  ...newRule, 
                  type: e.target.value as ConditionalRule['type'] 
                })}
              >
                <option value="price">Price</option>
                <option value="volume">Volume</option>
                <option value="market_cap">Market Cap</option>
                <option value="rsi">RSI</option>
                <option value="macd">MACD</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Operator</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={newRule.operator}
                onChange={(e) => setNewRule({ 
                  ...newRule, 
                  operator: e.target.value as ConditionalRule['operator'] 
                })}
              >
                <option value="gt">Greater than (&gt;)</option>
                <option value="lt">Less than (&lt;)</option>
                <option value="eq">Equal to (=)</option>
                <option value="gte">Greater than or equal (&gt;=)</option>
                <option value="lte">Less than or equal (&lt;=)</option>
                <option value="between">Between</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Value</label>
              {newRule.operator === 'between' ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md bg-background"
                    value={(newRule.value as number[])?.[0] || ''}
                    onChange={(e) => setNewRule({ 
                      ...newRule, 
                      value: [parseFloat(e.target.value), (newRule.value as number[])?.[1] || 0] 
                    })}
                    placeholder="Min value"
                  />
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md bg-background"
                    value={(newRule.value as number[])?.[1] || ''}
                    onChange={(e) => setNewRule({ 
                      ...newRule, 
                      value: [(newRule.value as number[])?.[0] || 0, parseFloat(e.target.value)] 
                    })}
                    placeholder="Max value"
                  />
                </div>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border rounded-md bg-background"
                  value={newRule.value as number || ''}
                  onChange={(e) => setNewRule({ 
                    ...newRule, 
                    value: parseFloat(e.target.value) || 0 
                  })}
                  placeholder="Condition value"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time Window (minutes)</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md bg-background"
                value={newRule.timeWindow || ''}
                onChange={(e) => setNewRule({ 
                  ...newRule, 
                  timeWindow: parseInt(e.target.value) || undefined 
                })}
                placeholder="Optional: Time window for condition"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateRule}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Rule
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewRule({ type: 'price', operator: 'gt', isActive: true });
              }}
              className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No conditional rules set up</p>
            <p className="text-sm">Create rules to execute trades based on market conditions</p>
          </div>
        ) : (
          rules.map((rule) => {
            const isMet = testRule(rule);
            
            return (
              <div key={rule.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      getRuleColor(rule)
                    )}>
                      {getRuleIcon(rule.type)}
                    </div>

                    <div>
                      <div className="font-medium">{rule.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {rule.timeWindow && `Time window: ${rule.timeWindow} minutes`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit?.(rule)}
                      className="p-2 rounded hover:bg-accent transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className="p-2 rounded hover:bg-accent transition-colors"
                    >
                      {rule.isActive ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 rounded hover:bg-accent transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Rule Status */}
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      isMet && rule.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800",
                      !rule.isActive && "bg-gray-100 text-gray-800"
                    )}>
                      {isMet && rule.isActive ? 'Condition Met' : isMet ? 'Condition Met (Inactive)' : 'Not Met'}
                    </span>
                  </div>

                  {rule.isActive && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-muted-foreground">
                        Monitoring for condition match
                      </span>
                    </div>
                  )}
                </div>

                {/* Rule Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium capitalize">
                      {rule.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Operator: </span>
                    <span className="font-medium">
                      {rule.operator.replace('gt', '&gt;').replace('lt', '&lt;').replace('gte', '&gt;=').replace('lte', '&lt;=').replace('eq', '=')}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Value: </span>
                    <span className="font-medium">
                      {Array.isArray(rule.value) 
                        ? `$${rule.value[0]} - $${rule.value[1]}`
                        : typeof rule.value === 'number' 
                          ? rule.type === 'market_cap' 
                            ? `$${rule.value.toLocaleString()}`
                            : rule.value
                          : rule.value
                      }
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Active: </span>
                    <span className={cn(
                      "font-medium",
                      rule.isActive ? "text-green-600" : "text-gray-600"
                    )}>
                      {rule.isActive ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {/* Associated Trades */}
                {tradeId && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Applied to Trade:</div>
                    <div className="p-2 bg-muted rounded">
                      {trades
                        .filter(t => t.id === tradeId)
                        .map((trade) => (
                          <div key={trade.id} className="flex items-center justify-between">
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
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Rule Templates */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-3">Quick Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => {
              setNewRule({
                type: 'price',
                operator: 'lt',
                value: 45,
                isActive: true
              });
              setShowCreateForm(true);
            }}
            className="p-3 border rounded-lg hover:bg-accent transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="font-medium">Price Drop</span>
            </div>
            <p className="text-xs text-muted-foreground">Execute when price drops below $45</p>
          </button>

          <button
            onClick={() => {
              setNewRule({
                type: 'volume',
                operator: 'gt',
                value: 2000000,
                timeWindow: 15,
                isActive: true
              });
              setShowCreateForm(true);
            }}
            className="p-3 border rounded-lg hover:bg-accent transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="font-medium">Volume Spike</span>
            </div>
            <p className="text-xs text-muted-foreground">Execute when volume spikes above 2M</p>
          </button>

          <button
            onClick={() => {
              setNewRule({
                type: 'rsi',
                operator: 'lt',
                value: 30,
                isActive: true
              });
              setShowCreateForm(true);
            }}
            className="p-3 border rounded-lg hover:bg-accent transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              <span className="font-medium">RSI Oversold</span>
            </div>
            <p className="text-xs text-muted-foreground">Execute when RSI drops below 30</p>
          </button>

          <button
            onClick={() => {
              setNewRule({
                type: 'price',
                operator: 'between',
                value: [48, 52],
                isActive: true
              });
              setShowCreateForm(true);
            }}
            className="p-3 border rounded-lg hover:bg-accent transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Settings className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Price Range</span>
            </div>
            <p className="text-xs text-muted-foreground">Execute when price is between $48-$52</p>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">About Conditional Rules:</p>
            <ul className="space-y-1 text-xs">
              <li>• Execute trades automatically when market conditions are met</li>
              <li>• Set price, volume, and technical indicator conditions</li>
              <li>• Combine multiple rules for complex strategies</li>
              <li>• Use time windows for temporary conditions</li>
              <li>• Monitor rule performance in real-time</li>
              <li>• Test rules against current market data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConditionalRules;
