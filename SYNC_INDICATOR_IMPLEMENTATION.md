# Data Sync Indicator Implementation

## Overview

This implementation addresses issue #222: 🔄 Data Sync Indicator - Background Sync Status & Last Updated. The feature provides users with real-time visibility into data synchronization status across data-heavy pages in the CurrentDao frontend application.

## Features Implemented

### ✅ Acceptance Criteria Met

1. **"Last updated X seconds ago" indicator on data-heavy pages**
   - Implemented in `useSyncIndicator` hook with `formatLastUpdated()` function
   - Shows relative time (seconds, minutes, hours, days ago)
   - Updates in real-time as data changes

2. **Spinning indicator during active sync**
   - Animated refresh icon using Framer Motion
   - Visual feedback when data is being fetched/synced
   - Different states: syncing, success, error, stale

3. **Manual refresh button per data section**
   - Refresh button integrated into each sync indicator
   - Clickable with hover states and disabled state during sync
   - Triggers immediate data refetch

4. **Stale data warning after 5 minutes without update**
   - Configurable stale time (default 5 minutes)
   - Visual warning indicator with clock icon
   - Tooltip prompting user to refresh

5. **Background sync using Service Worker**
   - Enhanced service worker with sync queue management
   - Periodic background sync with configurable intervals
   - Offline support and retry logic

6. **Sync error state with retry button**
   - Error display with detailed error messages
   - Retry button with exponential backoff
   - Maximum retry limit (default 3 attempts)

## Architecture

### Core Components

#### 1. `useSyncIndicator` Hook (`src/hooks/useSyncIndicator.ts`)
- Manages sync state tracking with timestamps
- Integrates with React Query for data fetching
- Provides sync status, refresh functions, and utilities
- Handles stale data detection and error management

#### 2. `SyncIndicator` Component (`src/components/common/SyncIndicator.tsx`)
- Visual component displaying sync status
- Multiple display modes: full, compact, badge
- Configurable positioning and styling
- Animated icons and transitions

#### 3. Service Worker Enhancement (`public/service-worker.js`)
- Background sync queue management
- Periodic sync triggers
- Error handling and retry logic
- Client communication for sync events

#### 4. `useServiceWorkerSync` Hook (`src/hooks/useServiceWorkerSync.ts`)
- Service worker communication interface
- Background sync control and monitoring
- Sync status reporting

### Integration Points

#### Data-Heavy Pages Updated:
1. **Dashboard** (`src/app/dashboard/page.tsx`)
   - Query key: `['dashboard-data']`
   - Real-time portfolio and market data sync

2. **Marketplace** (`src/app/marketplace/page.tsx`)
   - Query key: `['marketplace-listings']`
   - Energy listings and trading data sync

3. **Portfolio History** (`src/app/portfolio/history/page.tsx`)
   - Query key: `['portfolio-analytics']`
   - Historical portfolio data and analytics sync

## Configuration

### Sync Indicator Options
```typescript
interface SyncIndicatorOptions {
  queryKey: any[];                    // React Query key for data
  staleTime?: number;                 // Time before data is stale (ms)
  refetchInterval?: number;            // Background sync interval (ms)
  enableBackgroundSync?: boolean;     // Enable service worker sync
  maxRetries?: number;                // Maximum retry attempts
}
```

### Default Configuration
```typescript
const defaultOptions = {
  staleTime: 5 * 60 * 1000,           // 5 minutes
  refetchInterval: 30000,              // 30 seconds
  enableBackgroundSync: true,
  maxRetries: 3
};
```

## Usage Examples

### Basic Usage
```tsx
import { SyncIndicator } from '@/components/common/SyncIndicator';

function DataPage() {
  return (
    <div>
      <SyncIndicator
        queryKey={['my-data']}
        staleTime={5 * 60 * 1000}
        refetchInterval={30000}
        enableBackgroundSync={true}
        maxRetries={3}
      />
      
      {/* Your page content */}
    </div>
  );
}
```

### Compact Mode
```tsx
<SyncIndicator
  queryKey={['market-data']}
  compact={true}
  showLabel={false}
  position="top-right"
/>
```

### Custom Hook Usage
```tsx
import { useSyncIndicator } from '@/hooks/useSyncIndicator';

function MyComponent() {
  const {
    syncStatus,
    refresh,
    formatLastUpdated,
    shouldShowStaleWarning,
    canRetry
  } = useSyncIndicator({
    queryKey:['my-data'],
    staleTime: 10000,
    refetchInterval: 5000
  });

  return (
    <div>
      <p>Last updated: {formatLastUpdated()}</p>
      <button onClick={refresh}>Refresh</button>
      {shouldShowStaleWarning && <p>Data is stale!</p>}
    </div>
  );
}
```

## Visual States

### 1. Syncing State
- Spinning refresh icon (blue)
- "Syncing..." status
- Disabled refresh button

### 2. Success State
- Green checkmark icon
- "Last updated X seconds ago"
- Enabled refresh button

### 3. Stale State
- Yellow warning triangle
- Clock icon with tooltip
- "Data is stale" warning

### 4. Error State
- Red WiFi/offline icon
- Error message display
- Retry button (if retries available)

## Service Worker Integration

### Background Sync Flow
1. Service worker receives sync requests
2. Queues sync operations with retry logic
3. Performs periodic sync at configured intervals
4. Communicates results back to clients
5. Handles offline scenarios gracefully

### Sync Queue Management
- Automatic retry with exponential backoff
- Maximum retry limits
- Error tracking and reporting
- Queue cleanup on success/failure

## Testing

### Test Coverage
- Unit tests for `useSyncIndicator` hook
- Component tests for `SyncIndicator`
- Service worker integration tests
- End-to-end sync flow tests

### Test Files
- `src/__tests__/sync-indicator.test.tsx` - Comprehensive test suite

## Performance Considerations

### Optimizations
- Efficient React Query integration
- Minimal re-renders with proper dependencies
- Debounced refresh operations
- Optimized service worker communication

### Memory Management
- Cleanup of timers and intervals
- Service worker message channel cleanup
- Query cache management

## Browser Compatibility

### Supported Features
- Modern browsers with Service Worker support
- React Query for data fetching
- Framer Motion for animations
- TypeScript for type safety

### Fallbacks
- Graceful degradation without service worker
- Static sync indicators without animations
- Basic refresh functionality

## Future Enhancements

### Potential Improvements
1. **Real-time WebSocket Integration**
   - Live data updates without polling
   - Connection status indicators

2. **Advanced Sync Strategies**
   - Conflict resolution for collaborative editing
   - Delta sync for large datasets

3. **Offline-First Architecture**
   - IndexedDB for offline storage
   - Sync queue persistence

4. **Performance Analytics**
   - Sync performance metrics
   - User behavior tracking

## Troubleshooting

### Common Issues
1. **Service Worker Not Registering**
   - Check HTTPS requirement
   - Verify service worker scope

2. **Sync Not Updating**
   - Verify React Query configuration
   - Check query key consistency

3. **Background Sync Not Working**
   - Ensure service worker is active
   - Check browser permissions

### Debug Tools
- React Query DevTools
- Service Worker DevTools
- Console logging for sync events

## Files Modified/Created

### New Files
- `src/hooks/useSyncIndicator.ts` - Core sync logic
- `src/hooks/useServiceWorkerSync.ts` - Service worker integration
- `src/components/common/SyncIndicator.tsx` - UI component
- `src/__tests__/sync-indicator.test.tsx` - Test suite

### Modified Files
- `public/service-worker.js` - Enhanced with sync capabilities
- `src/app/dashboard/page.tsx` - Added sync indicator
- `src/app/marketplace/page.tsx` - Added sync indicator
- `src/app/portfolio/history/page.tsx` - Added sync indicator

## Conclusion

This implementation provides a comprehensive data synchronization indicator system that meets all acceptance criteria for issue #222. The solution is modular, reusable, and integrates seamlessly with the existing CurrentDao frontend architecture.

The feature enhances user experience by providing transparency into data synchronization status, manual control over refresh operations, and robust error handling with retry mechanisms.
