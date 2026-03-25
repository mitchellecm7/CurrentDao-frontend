'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Play,
  Pause,
  Square,
  Trash2,
  Edit2,
  Download,
  Upload,
  Filter,
  Search,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Bell,
  ChevronDown
} from 'lucide-react';
import { useScheduledTrading } from '@/hooks/useScheduledTrading';
import { ScheduledTrade, FilterOptions, SortOptions } from '@/types/scheduling';
import { SchedulingHelpers } from '@/utils/schedulingHelpers';
import { cn } from '@/lib/utils';

interface ScheduledManagementProps {
  className?: string;
  onEdit?: (trade: ScheduledTrade) => void;
}

export function ScheduledManagement({ className, onEdit }: ScheduledManagementProps) {
  const { 
    trades, 
    timezone, 
    filters, 
    setFilters,
    sort, 
    setSort,
    clearFilters,
    cancelTrade,
    pauseTrade,
    resumeTrade,
    executeTrade,
    exportTrades,
    importTrades,
    refreshTrades,
    loading,
    error,
    stats
  } = useScheduledTrading();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Filter trades based on search term
  const filteredTrades = trades.filter(trade => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      trade.token.symbol.toLowerCase().includes(searchLower) ||
      trade.token.name.toLowerCase().includes(searchLower) ||
      trade.type.toLowerCase().includes(searchLower) ||
      (trade.metadata?.notes && trade.metadata.notes.toLowerCase().includes(searchLower))
    );
  });

  // Handle bulk selection
  const handleSelectTrade = (tradeId: string) => {
    setSelectedTrades(prev => 
      prev.includes(tradeId) 
        ? prev.filter(id => id !== tradeId)
        : [...prev, tradeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTrades.length === filteredTrades.length) {
      setSelectedTrades([]);
    } else {
      setSelectedTrades(filteredTrades.map(trade => trade.id));
    }
  };

  // Bulk actions
  const handleBulkCancel = async () => {
    for (const tradeId of selectedTrades) {
      await cancelTrade(tradeId);
    }
    setSelectedTrades([]);
    setShowBulkActions(false);
  };

  const handleBulkPause = async () => {
    for (const tradeId of selectedTrades) {
      await pauseTrade(tradeId);
    }
    setSelectedTrades([]);
    setShowBulkActions(false);
  };

  const handleBulkExecute = async () => {
    for (const tradeId of selectedTrades) {
      await executeTrade(tradeId);
    }
    setSelectedTrades([]);
    setShowBulkActions(false);
  };

  // File operations
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importTrades(file);
    }
  };

  // Get status color
  const getStatusColor = (status: ScheduledTrade['status']) => {
    switch (status) {
      case 'pending':
        return 'text-blue-600 bg-blue-100';
      case 'executed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status: ScheduledTrade['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'executed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <Square className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Format trade amount
  const formatAmount = (amount: number, decimals: number) => {
    return (amount / Math.pow(10, decimals)).toFixed(4);
  };

  return (
    <div className={cn("bg-card rounded-lg border p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Scheduled Trades Management</h2>
          <span className="text-sm text-muted-foreground">
            ({filteredTrades.length} total)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshTrades}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Filter className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-accent transition-colors"
            >
              <span>Bulk Actions</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showBulkActions && selectedTrades.length > 0 && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-background border rounded-lg shadow-lg z-10">
                <button
                  onClick={handleBulkExecute}
                  className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Execute Selected
                </button>
                <button
                  onClick={handleBulkPause}
                  className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause Selected
                </button>
                <button
                  onClick={handleBulkCancel}
                  className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Cancel Selected
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={exportTrades}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-accent transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-accent transition-colors">
              <Upload className="w-4 h-4" />
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Total Scheduled</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalScheduled}</div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <div className="text-2xl font-bold">{stats.pendingExecutions}</div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Success Rate</span>
          </div>
          <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">24h Volume</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalVolume24h.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select 
                className="w-full p-2 border rounded-md bg-background"
                value={filters.status?.[0] || ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  status: e.target.value ? [e.target.value as any] : undefined 
                })}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="executed">Executed</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select 
                className="w-full p-2 border rounded-md bg-background"
                value={filters.type?.[0] || ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  type: e.target.value ? [e.target.value as any] : undefined 
                })}
              >
                <option value="">All Types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select 
                className="w-full p-2 border rounded-md bg-background"
                value={`${sort.field}-${sort.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSort({ 
                    field: field as SortOptions['field'], 
                    direction: direction as SortOptions['direction'] 
                  });
                }}
              >
                <option value="scheduledAt-asc">Date (Oldest First)</option>
                <option value="scheduledAt-desc">Date (Newest First)</option>
                <option value="amount-asc">Amount (Low to High)</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded-md bg-background"
                onChange={(e) => {
                  if (e.target.value) {
                    const endDate = new Date(e.target.value);
                    endDate.setDate(endDate.getDate() + 30);
                    setFilters({
                      ...filters,
                      dateRange: {
                        start: new Date(e.target.value),
                        end: endDate
                      }
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search trades by token, type, or notes..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bulk Selection Controls */}
      {selectedTrades.length > 0 && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedTrades.length} trade{selectedTrades.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedTrades([])}
              className="text-sm text-primary hover:underline"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkExecute}
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
            >
              Execute
            </button>
            <button
              onClick={handleBulkPause}
              className="px-3 py-1 border rounded text-sm hover:bg-accent"
            >
              Pause
            </button>
            <button
              onClick={handleBulkCancel}
              className="px-3 py-1 border border-destructive text-destructive rounded text-sm hover:bg-destructive/10"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Trades List */}
      <div className="space-y-2">
        {filteredTrades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No scheduled trades found</p>
            <p className="text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first scheduled trade to get started'}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-muted p-3 border-b">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedTrades.length === filteredTrades.length}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Token</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Scheduled</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y">
              {filteredTrades.map((trade) => (
                <div key={trade.id} className="p-3 hover:bg-accent/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Checkbox */}
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedTrades.includes(trade.id)}
                        onChange={() => handleSelectTrade(trade.id)}
                        className="rounded"
                      />
                    </div>

                    {/* Type */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          trade.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
                        )} />
                        <span className="font-medium capitalize">{trade.type}</span>
                      </div>
                    </div>

                    {/* Token */}
                    <div className="col-span-2">
                      <div>
                        <div className="font-medium">{trade.token.symbol}</div>
                        <div className="text-sm text-muted-foreground">{trade.token.name}</div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="col-span-2">
                      <div>
                        <div className="font-medium">
                          {formatAmount(trade.amount, trade.token.decimals)} {trade.token.symbol}
                        </div>
                        {trade.price && (
                          <div className="text-sm text-muted-foreground">
                            @ ${trade.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scheduled Time */}
                    <div className="col-span-2">
                      <div>
                        <div className="font-medium">
                          {SchedulingHelpers.formatDate(trade.scheduledAt, trade.timezone)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {SchedulingHelpers.formatTime(trade.scheduledAt, trade.timezone)}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        getStatusColor(trade.status)
                      )}>
                        {getStatusIcon(trade.status)}
                        <span className="capitalize">{trade.status}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit?.(trade)}
                          className="p-1 rounded hover:bg-accent transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        {trade.status === 'pending' && (
                          <button
                            onClick={() => executeTrade(trade.id)}
                            className="p-1 rounded hover:bg-accent transition-colors"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                        )}

                        {trade.status === 'pending' && (
                          <button
                            onClick={() => pauseTrade(trade.id)}
                            className="p-1 rounded hover:bg-accent transition-colors"
                          >
                            <Pause className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          onClick={() => cancelTrade(trade.id)}
                          className="p-1 rounded hover:bg-accent transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {trade.metadata?.notes && (
                    <div className="col-span-12 mt-2 text-sm text-muted-foreground">
                      <strong>Notes:</strong> {trade.metadata.notes}
                    </div>
                  )}

                  {/* Recurrence Info */}
                  {trade.recurrence && (
                    <div className="col-span-12 mt-2 text-sm text-muted-foreground">
                      <strong>Recurring:</strong> {trade.recurrence.type} (every {trade.recurrence.interval})
                    </div>
                  )}

                  {/* Conditions Info */}
                  {trade.conditions && trade.conditions.length > 0 && (
                    <div className="col-span-12 mt-2 text-sm text-muted-foreground">
                      <strong>Conditions:</strong> {trade.conditions.length} rule{trade.conditions.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-2">
          <Settings className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Management Features:</p>
            <ul className="space-y-1 text-xs">
              <li>• View and manage all scheduled trades in one place</li>
              <li>• Filter and sort trades to find what you need</li>
              <li>• Bulk actions for efficient management</li>
              <li>• Import/export trade configurations</li>
              <li>• Real-time status updates and notifications</li>
              <li>• Search functionality for quick access</li>
              <li>• Performance tracking and analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduledManagement;
