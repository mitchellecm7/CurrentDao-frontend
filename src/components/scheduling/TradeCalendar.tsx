'use client';

import { useState, useMemo } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Bell,
  Filter,
  Plus
} from 'lucide-react';
import { useScheduledTrading } from '@/hooks/useScheduledTrading';
import { CalendarEvent, SchedulingView } from '@/types/scheduling';
import { SchedulingHelpers } from '@/utils/schedulingHelpers';
import { cn } from '@/lib/utils';

interface TradeCalendarProps {
  className?: string;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

export function TradeCalendar({ className, onEventClick, onDateClick }: TradeCalendarProps) {
  const { 
    trades, 
    calendarEvents, 
    timezone, 
    filters, 
    setFilters,
    stats 
  } = useScheduledTrading();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<SchedulingView>('calendar');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Navigate calendar
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  // Format month name
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Get day name
  const getDayName = (dayIndex: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Get event color based on type
  const getEventIndicator = (event: CalendarEvent) => {
    const baseClass = "w-2 h-2 rounded-full";
    
    switch (event.type) {
      case 'scheduled_trade':
        return cn(baseClass, "bg-blue-500");
      case 'recurring_trade':
        return cn(baseClass, "bg-green-500");
      case 'market_event':
        return cn(baseClass, "bg-orange-500");
      case 'reminder':
        return cn(baseClass, "bg-purple-500");
      default:
        return cn(baseClass, "bg-gray-500");
    }
  };

  return (
    <div className={cn("bg-card rounded-lg border p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Trading Calendar</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{timezone.name}</span>
            <span>({timezone.offset})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setView('calendar')}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium transition-colors",
                view === 'calendar' 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium transition-colors",
                view === 'list' 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              List
            </button>
            <button
              onClick={() => setView('analytics')}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium transition-colors",
                view === 'analytics' 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Analytics
            </button>
          </div>

          {/* Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Add Trade */}
          <button
            onClick={() => {/* Navigate to create trade */}}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
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
            <DollarSign className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">24h Volume</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalVolume24h.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="space-y-4">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-semibold">
              {formatMonth(currentDate)}
            </h3>

            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {getDayName(i)}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((date, index) => {
              const events = getEventsForDate(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  onClick={() => onDateClick?.(date)}
                  className={cn(
                    "min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    !isCurrentMonthDay && "opacity-50",
                    isTodayDate && "bg-primary/10 border-primary"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-sm font-medium",
                      isTodayDate && "text-primary"
                    )}>
                      {date.getDate()}
                    </span>
                    {events.length > 0 && (
                      <div className="flex items-center gap-1">
                        {events.slice(0, 3).map((event, i) => (
                          <div key={i} className={getEventIndicator(event)} />
                        ))}
                        {events.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{events.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Events List */}
                  <div className="space-y-1">
                    {events.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        className="text-xs p-1 rounded cursor-pointer hover:bg-accent/50"
                        style={{ backgroundColor: event.color + '20' }}
                      >
                        <div className="flex items-center gap-1">
                          {event.type === 'scheduled_trade' && <TrendingUp className="w-3 h-3" />}
                          {event.type === 'recurring_trade' && <Clock className="w-3 h-3" />}
                          {event.type === 'market_event' && <Bell className="w-3 h-3" />}
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-2">
          {trades.map((trade) => (
            <div
              key={trade.id}
              onClick={() => onEventClick?.(calendarEvents.find(e => e.trade?.id === trade.id)!)}
              className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    trade.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
                  )} />
                  <div>
                    <div className="font-medium">
                      {trade.type.toUpperCase()} {trade.amount} {trade.token.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {SchedulingHelpers.formatDateTime(trade.scheduledAt, trade.timezone)}
                    </div>
                  </div>
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
                  {trade.recurrence && (
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics View */}
      {view === 'analytics' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Performance Overview</h3>
            <p className="text-muted-foreground">
              Track your automated trading performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-muted rounded-lg">
              <h4 className="font-medium mb-4">Execution Statistics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Executed</span>
                  <span className="font-medium">{stats.completedToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-medium">{stats.successRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Recurring</span>
                  <span className="font-medium">{stats.activeRecurringOrders}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-muted rounded-lg">
              <h4 className="font-medium mb-4">Volume Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Volume</span>
                  <span className="font-medium">{stats.totalVolume24h.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending Volume</span>
                  <span className="font-medium">
                    {trades
                      .filter(t => t.status === 'pending')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Trade Size</span>
                  <span className="font-medium">
                    {trades.length > 0 
                      ? Math.round(trades.reduce((sum, t) => sum + t.amount, 0) / trades.length)
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TradeCalendar;
