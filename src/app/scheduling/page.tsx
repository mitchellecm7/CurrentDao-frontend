'use client';

import { useState } from 'react';
import { TradeCalendar } from '@/components/scheduling/TradeCalendar';
import { RecurringOrders } from '@/components/scheduling/RecurringOrders';
import { TimeTriggers } from '@/components/scheduling/TimeTriggers';
import { ConditionalRules } from '@/components/scheduling/ConditionalRules';
import { ScheduledManagement } from '@/components/scheduling/ScheduledManagement';
import { useScheduledTrading } from '@/hooks/useScheduledTrading';
import { Calendar, Clock, Target, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type SchedulingView = 'calendar' | 'recurring' | 'triggers' | 'rules' | 'management';

export default function SchedulingPage() {
  const { stats, timezone } = useScheduledTrading();
  const [activeView, setActiveView] = useState<SchedulingView>('calendar');

  const views = [
    {
      id: 'calendar' as SchedulingView,
      name: 'Calendar',
      description: 'View and manage scheduled trades on a calendar',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: 'recurring' as SchedulingView,
      name: 'Recurring Orders',
      description: 'Set up and manage recurring trade patterns',
      icon: <Clock className="w-5 h-5" />
    },
    {
      id: 'triggers' as SchedulingView,
      name: 'Time Triggers',
      description: 'Create time-based trading triggers',
      icon: <Target className="w-5 h-5" />
    },
    {
      id: 'rules' as SchedulingView,
      name: 'Conditional Rules',
      description: 'Configure market condition rules',
      icon: <Settings className="w-5 h-5" />
    },
    {
      id: 'management' as SchedulingView,
      name: 'Trade Management',
      description: 'Manage all scheduled trades',
      icon: <BarChart3 className="w-5 h-5" />
    }
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'calendar':
        return <TradeCalendar />;
      case 'recurring':
        return <RecurringOrders />;
      case 'triggers':
        return <TimeTriggers />;
      case 'rules':
        return <ConditionalRules />;
      case 'management':
        return <ScheduledManagement />;
      default:
        return <TradeCalendar />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Scheduled Trading</h1>
        <p className="text-lg text-muted-foreground">
          Automate your trading strategies with scheduled orders, recurring patterns, and conditional rules
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Total Scheduled</h3>
          </div>
          <div className="text-3xl font-bold text-primary">{stats.totalScheduled}</div>
          <p className="text-sm text-muted-foreground mt-2">
            Active and pending trades
          </p>
        </div>

        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Pending Execution</h3>
          </div>
          <div className="text-3xl font-bold text-orange-500">{stats.pendingExecutions}</div>
          <p className="text-sm text-muted-foreground mt-2">
            Trades waiting to execute
          </p>
        </div>

        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Success Rate</h3>
          </div>
          <div className="text-3xl font-bold text-green-500">{stats.successRate.toFixed(1)}%</div>
          <p className="text-sm text-muted-foreground mt-2">
            Execution success rate
          </p>
        </div>

        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">24h Volume</h3>
          </div>
          <div className="text-3xl font-bold text-blue-500">{stats.totalVolume24h.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground mt-2">
            Total trading volume
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b">
          <nav className="flex space-x-8">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeView === view.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  {view.icon}
                  <span>{view.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            {views.find(v => v.id === activeView)?.description}
          </p>
        </div>
      </div>

      {/* Active View */}
      <div className="mb-8">
        {renderActiveView()}
      </div>

      {/* Timezone Info */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Current Timezone:</span>
            <span className="text-sm">{timezone.name}</span>
            <span className="text-sm text-muted-foreground">({timezone.offset})</span>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Market Hours</div>
            <div className="text-sm font-medium">
              {timezone.marketHours?.open} - {timezone.marketHours?.close}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Quick Schedule</h3>
              <p className="text-sm text-muted-foreground">Set up a new scheduled trade</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-card border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold">Recurring Pattern</h3>
              <p className="text-sm text-muted-foreground">Create a recurring trade setup</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-card border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Conditional Rule</h3>
              <p className="text-sm text-muted-foreground">Add a market condition</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3">Calendar View</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Click on any date to see scheduled trades</li>
              <li>• Switch between calendar, list, and analytics views</li>
              <li>• Use filters to find specific trades</li>
              <li>• Export calendar data for external tools</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">Recurring Orders</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Set daily, weekly, monthly, or yearly patterns</li>
              <li>• Specify end dates or maximum executions</li>
              <li>• Combine with conditional rules for smart trading</li>
              <li>• Monitor performance and adjust as needed</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">Time Triggers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Execute trades at specific times</li>
              <li>• Set offsets for market open/close events</li>
              <li>• Create price and volume triggers</li>
              <li>• Combine multiple conditions for complex strategies</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">Conditional Rules</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Set price thresholds (above/below)</li>
              <li>• Configure volume spike detection</li>
              <li>• Use technical indicators (RSI, MACD)</li>
              <li>• Test rules against current market data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
