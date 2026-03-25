# Scheduled Trading System Documentation

## Overview

This comprehensive scheduled trading system provides automated trading capabilities for the CurrentDao application. Users can set up recurring trades, time-based triggers, and conditional rules to automate their trading strategies with precision and reliability.

## Features

### ✅ Implemented Features

- **Trade Scheduling Calendar**: Visual calendar interface showing all scheduled trades with color-coded status
- **Recurring Order Setup**: Daily, weekly, monthly, and yearly recurring patterns
- **Time-Based Triggers**: Specific time, market open/close, price threshold, and volume spike triggers
- **Conditional Trading Rules**: Price, volume, market cap, RSI, MACD, and custom conditions
- **Scheduled Order Management**: Comprehensive management interface with bulk operations
- **Performance Tracking**: Real-time statistics and execution history
- **Alert Notifications**: Configurable alerts for executions and events
- **Time Zone Support**: Accurate timezone handling for global trading
- **Import/Export**: Trade configuration backup and sharing

## Architecture

### Core Files

```
src/
├── types/
│   └── scheduling.ts              # TypeScript type definitions
├── hooks/
│   └── useScheduledTrading.ts        # Core scheduling hook and state management
├── utils/
│   └── schedulingHelpers.ts         # Utility functions and helpers
├── components/scheduling/
│   ├── TradeCalendar.tsx          # Calendar view component
│   ├── RecurringOrders.tsx       # Recurring orders management
│   ├── TimeTriggers.tsx          # Time-based triggers
│   ├── ConditionalRules.tsx       # Conditional rules configuration
│   └── ScheduledManagement.tsx   # Comprehensive trade management
└── app/
    └── scheduling/
        └── page.tsx               # Main scheduling page
```

### Type System

```typescript
type ThemeMode = 'light' | 'dark' | 'system';
type RecurrencePattern = {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date;
  maxExecutions?: number;
};

type ConditionalRule = {
  type: 'price' | 'volume' | 'market_cap' | 'rsi' | 'macd' | 'custom';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
  value: number | [number, number];
  timeWindow?: number;
  isActive: boolean;
  description: string;
};

type TimeTrigger = {
  type: 'specific_time' | 'market_open' | 'market_close' | 'price_threshold' | 'volume_spike';
  name: string;
  time?: string;
  offset?: number;
  conditions?: ConditionalRule[];
  isActive: boolean;
};
```

## Usage

### Basic Setup

1. **Provider Setup**: The scheduling system is self-contained and ready to use

2. **Using the Hook**:

```tsx
import { useScheduledTrading } from '@/hooks/useScheduledTrading';

function MyComponent() {
  const { 
    trades, 
    createTrade, 
    cancelTrade, 
    executeTrade,
    stats,
    timezone 
  } = useScheduledTrading();

  return (
    <div>
      <p>Total Scheduled: {stats.totalScheduled}</p>
      <p>Success Rate: {stats.successRate}%</p>
    </div>
  );
}
```

### Components

#### TradeCalendar

```tsx
import { TradeCalendar } from '@/components/scheduling/TradeCalendar';

// Basic usage
<TradeCalendar />

// With event handling
<TradeCalendar 
  onEventClick={(event) => console.log('Event clicked:', event)}
  onDateClick={(date) => console.log('Date clicked:', date)}
/>
```

#### Recurring Orders

```tsx
import { RecurringOrders } from '@/components/scheduling/RecurringOrders';

// Basic usage
<RecurringOrders />

// With edit handling
<RecurringOrders 
  onEdit={(trade) => console.log('Edit trade:', trade)}
/>
```

#### Time Triggers

```tsx
import { TimeTriggers } from '@/components/scheduling/TimeTriggers';

// Basic usage
<TimeTriggers />
```

#### Conditional Rules

```tsx
import { ConditionalRules } from '@/components/scheduling/ConditionalRules';

// Basic usage
<ConditionalRules />

// With specific trade
<ConditionalRules 
  tradeId="trade-123"
  onRuleChange={(rules) => console.log('Rules updated:', rules)}
/>
```

#### Scheduled Management

```tsx
import { ScheduledManagement } from '@/components/scheduling/ScheduledManagement';

// Basic usage
<ScheduledManagement />

// With edit handling
<ScheduledManagement 
  onEdit={(trade) => console.log('Edit trade:', trade)}
/>
```

### Scheduling Page

```tsx
import SchedulingPage from '@/app/scheduling/page';

// The main scheduling interface
<SchedulingPage />
```

## Advanced Features

### Recurrence Patterns

```typescript
// Daily recurring
const dailyPattern = {
  type: 'daily',
  interval: 1,
  endDate: new Date('2024-12-31'),
  maxExecutions: 30
};

// Weekly recurring (Mondays and Wednesdays)
const weeklyPattern = {
  type: 'weekly',
  interval: 2,
  daysOfWeek: [1, 3], // Monday, Wednesday
  endDate: new Date('2024-12-31')
};

// Monthly recurring (15th of each month)
const monthlyPattern = {
  type: 'monthly',
  interval: 1,
  dayOfMonth: 15,
  endDate: new Date('2024-12-31')
};
```

### Conditional Rules

```typescript
// Price threshold rule
const priceRule = {
  type: 'price',
  operator: 'lt',
  value: 45,
  timeWindow: 60,
  isActive: true,
  description: 'Execute when price drops below $45'
};

// Volume spike detection
const volumeRule = {
  type: 'volume',
  operator: 'gt',
  value: 2000000,
  timeWindow: 15,
  isActive: true,
  description: 'Execute when volume spikes above 2M'
};

// RSI oversold condition
const rsiRule = {
  type: 'rsi',
  operator: 'lt',
  value: 30,
  isActive: true,
  description: 'Execute when RSI drops below 30'
};

// Between range condition
const rangeRule = {
  type: 'price',
  operator: 'between',
  value: [48, 52],
  isActive: true,
  description: 'Execute when price is between $48-$52'
};
```

### Time Triggers

```typescript
// Market open trigger (5 minutes before)
const marketOpenTrigger = {
  type: 'market_open',
  offset: -5,
  isActive: true,
  description: 'Execute 5 minutes before market opens'
};

// Specific time trigger
const timeTrigger = {
  type: 'specific_time',
  time: '15:30',
  isActive: true,
  description: 'Execute at 3:30 PM daily'
};

// Price threshold trigger
const priceTrigger = {
  type: 'price_threshold',
  conditions: [
    {
      type: 'price',
      operator: 'lt',
      value: 50,
      timeWindow: 30,
      isActive: true,
      description: 'Price drops below $50'
    }
  ]
};
```

## Performance Tracking

The system automatically tracks:

- **Execution Statistics**: Success rate, average execution time, total volume
- **Performance Metrics**: Profit/loss tracking, win rate calculations
- **Historical Data**: Complete execution history with detailed metadata
- **Real-time Monitoring**: Live status updates and condition evaluation

## Time Zone Support

- **Automatic Detection**: System timezone detection and conversion
- **Market Hours**: Support for different market trading hours
- **Accurate Scheduling**: Precise timezone-aware execution timing
- **Global Compatibility**: Works across different time zones and regions

## Security Considerations

- **Input Validation**: Comprehensive validation for all scheduling parameters
- **Safe Execution**: Multiple safety checks before trade execution
- **Error Handling**: Robust error handling and recovery mechanisms
- **Rate Limiting**: Built-in protection against excessive API calls
- **Permission Checks**: Proper authorization verification for sensitive operations

## Mobile Optimization

- **Responsive Design**: All components optimized for mobile devices
- **Touch-Friendly**: Touch-optimized interfaces for mobile trading
- **Compact Views**: Mobile-optimized layouts for scheduling management
- **Performance**: Efficient rendering and state management for mobile devices

## Browser Compatibility

- **Modern Browser Support**: Full support for Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Graceful Degradation**: Functional fallbacks for older browsers
- **Progressive Enhancement**: Enhanced features in modern browsers
- **Cross-Platform**: Consistent behavior across different platforms

## API Integration

The scheduling system is designed to integrate seamlessly with:

- **Trading APIs**: Connection to various trading platforms and protocols
- **Market Data Feeds**: Real-time market data integration
- **Notification Services**: Email, SMS, and push notification support
- **Storage Solutions**: Local storage, database, and cloud storage options
- **Analytics Platforms**: Integration with analytics and reporting tools

## Configuration

### Default Configuration

```typescript
const defaultConfig = {
  defaultTimezone: 'UTC',
  executionBuffer: 5, // minutes
  maxConcurrentExecutions: 10,
  retryAttempts: 3,
  retryDelay: 5, // minutes
  enableNotifications: true,
  enablePriceProtection: true,
  maxSlippage: 2.0 // percentage
};
```

### Customization Options

- **Theme Integration**: Seamless integration with the application theme system
- **Localization**: Support for multiple languages and regions
- **Custom Rules**: Extensible rule engine for custom conditions
- **Custom Triggers**: Flexible trigger system for custom time-based events
- **Performance Metrics**: Customizable performance tracking and reporting

## Testing

### Manual Testing

1. **Calendar Interface**: Test calendar view with different date ranges and filters
2. **Recurring Orders**: Verify recurring patterns execute correctly
3. **Time Triggers**: Test various trigger types and conditions
4. **Conditional Rules**: Validate rule evaluation and execution
5. **Management Interface**: Test bulk operations and search functionality

### Automated Testing

1. **Unit Tests**: Comprehensive test coverage for all components and utilities
2. **Integration Tests**: End-to-end testing of scheduling workflows
3. **Performance Tests**: Load testing and performance benchmarking
4. **Cross-Browser Tests**: Compatibility testing across different browsers
5. **Mobile Tests**: Responsive design and touch interaction testing

## Troubleshooting

### Common Issues

1. **Triggers Not Executing**
   - Check timezone configuration
   - Verify market data availability
   - Ensure conditions are active
   - Review execution logs

2. **Recurring Orders Not Working**
   - Validate recurrence pattern configuration
   - Check end date and execution limits
   - Verify timezone handling
   - Review execution history

3. **Performance Issues**
   - Check for excessive API calls
   - Optimize condition evaluation
   - Reduce unnecessary re-renders
   - Enable performance monitoring

4. **Time Zone Problems**
   - Verify system timezone detection
   - Check market hours configuration
   - Test with different time zones
   - Validate date/time calculations

### Debug Tools

- **Console Logging**: Detailed logging for debugging scheduling issues
- **Performance Monitoring**: Built-in performance tracking and reporting
- **Error Tracking**: Comprehensive error logging and reporting
- **Status Indicators**: Visual status indicators for system health
- **Diagnostic Tools**: Built-in diagnostic and troubleshooting tools

## Best Practices

### Scheduling Best Practices

1. **Conservative Scheduling**: Use conservative time estimates and buffers
2. **Diversification**: Spread trades across different times and conditions
3. **Risk Management**: Implement proper risk management and position sizing
4. **Regular Review**: Regular review and optimization of scheduling strategies
5. **Documentation**: Maintain clear documentation of scheduling strategies and rules

### Performance Best Practices

1. **Efficient Evaluation**: Optimize condition evaluation for performance
2. **Batch Processing**: Use batch processing where possible for efficiency
3. **Caching**: Implement appropriate caching for frequently used data
4. **Resource Management**: Proper resource management and cleanup
5. **Monitoring**: Continuous monitoring of system performance and health

### Security Best Practices

1. **Input Validation**: Always validate user input and parameters
2. **Safe Execution**: Implement multiple safety checks before execution
3. **Permission Checks**: Verify permissions before sensitive operations
4. **Rate Limiting**: Implement appropriate rate limiting
5. **Audit Trail**: Maintain clear audit trail for all scheduling activities

## Advanced Usage Examples

### Complex Trading Strategy

```typescript
// Example: DCA (Dollar Cost Averaging) strategy
const dcaStrategy = {
  name: 'DCA Strategy',
  description: 'Buy $100 of SOL weekly regardless of price',
  recurrence: {
    type: 'weekly',
    interval: 1,
    daysOfWeek: [1], // Monday
    endDate: new Date('2024-12-31'),
    maxExecutions: 52 // 1 year of weekly purchases
  },
  conditions: [
    {
      type: 'volume',
      operator: 'gt',
      value: 1000000,
      timeWindow: 60,
      isActive: true,
      description: 'Only execute if volume is above 1M'
    }
  ]
};

// Example: Mean reversion strategy
const meanReversionStrategy = {
  name: 'Mean Reversion Strategy',
  description: 'Buy more when price drops, sell when price rises',
  conditions: [
    {
      type: 'price',
      operator: 'lt',
      value: 45,
      timeWindow: 60,
      isActive: true,
      description: 'Buy when price drops below $45'
    },
    {
      type: 'price',
      operator: 'gt',
      value: 55,
      timeWindow: 60,
      isActive: true,
      description: 'Sell when price rises above $55'
    }
  ]
};
```

### Multi-Condition Strategy

```typescript
// Example: Complex multi-condition strategy
const complexStrategy = {
  name: 'Complex Strategy',
  description: 'Execute when multiple conditions are met',
  conditions: [
    {
      type: 'price',
      operator: 'between',
      value: [40, 60],
      timeWindow: 30,
      isActive: true,
      description: 'Price in optimal range'
    },
    {
      type: 'volume',
      operator: 'gt',
      value: 500000,
      timeWindow: 15,
      isActive: true,
      description: 'Sufficient volume'
    },
    {
      type: 'rsi',
      operator: 'lt',
      value: 70,
      timeWindow: 60,
      isActive: true,
      description: 'Not overbought'
    }
  ]
};
```

This comprehensive scheduled trading system provides powerful automation capabilities while maintaining security, performance, and user-friendliness. The modular architecture allows for easy customization and extension to meet specific trading requirements.
