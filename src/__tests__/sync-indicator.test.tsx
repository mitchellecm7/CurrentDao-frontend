import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SyncIndicator } from '@/components/common/SyncIndicator';
import { useSyncIndicator } from '@/hooks/useSyncIndicator';

// Mock the service worker
global.navigator = {
  serviceWorker: {
    ready: Promise.resolve({
      active: {
        postMessage: jest.fn()
      }
    })
  }
} as any;

// Test wrapper component
const TestComponent = ({ queryKey = ['test'] }) => {
  const { syncStatus, refresh, formatLastUpdated, shouldShowStaleWarning } = useSyncIndicator({
    queryKey,
    staleTime: 5000, // 5 seconds for testing
    refetchInterval: 1000, // 1 second for testing
    enableBackgroundSync: true,
    maxRetries: 3
  });

  return (
    <div>
      <SyncIndicator
        queryKey={queryKey}
        staleTime={5000}
        refetchInterval={1000}
        enableBackgroundSync={true}
        maxRetries={3}
      />
      <div data-testid="sync-status">
        <span data-testid="last-updated">{formatLastUpdated()}</span>
        <span data-testid="is-syncing">{syncStatus.isSyncing.toString()}</span>
        <span data-testid="is-stale">{syncStatus.isStale.toString()}</span>
        <span data-testid="has-error">{syncStatus.hasError.toString()}</span>
        <span data-testid="stale-warning">{shouldShowStaleWarning.toString()}</span>
      </div>
      <button data-testid="refresh-button" onClick={refresh}>
        Refresh
      </button>
    </div>
  );
};

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 5000,
        refetchInterval: 1000,
      },
    },
  });
};

describe('SyncIndicator', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  });

  it('renders sync indicator component', () => {
    render(
      <TestComponent />,
      { wrapper }
    );

    // Check if sync indicator is rendered
    expect(screen.getByText('Data Sync')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
  });

  it('shows initial sync status', () => {
    render(
      <TestComponent />,
      { wrapper }
    );

    expect(screen.getByTestId('is-syncing')).toHaveTextContent('false');
    expect(screen.getByTestId('last-updated')).toHaveTextContent('Never');
  });

  it('handles manual refresh', async () => {
    render(
      <TestComponent />,
      { wrapper }
    );

    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByTestId('is-syncing')).toHaveTextContent('true');
    });
  });

  it('shows stale warning after threshold', async () => {
    jest.useFakeTimers();

    render(
      <TestComponent />,
      { wrapper }
    );

    // Fast-forward time beyond stale threshold
    jest.advanceTimersByTime(6000);

    await waitFor(() => {
      expect(screen.getByTestId('is-stale')).toHaveTextContent('true');
      expect(screen.getByTestId('stale-warning')).toHaveTextContent('true');
    });

    jest.useRealTimers();
  });

  it('formats last updated time correctly', () => {
    render(
      <TestComponent />,
      { wrapper }
    );

    const lastUpdatedElement = screen.getByTestId('last-updated');
    expect(lastUpdatedElement).toHaveTextContent('Never');
  });
});

describe('useSyncIndicator hook', () => {
  it('provides correct sync status', () => {
    const TestHookComponent = () => {
      const { syncStatus, refresh, formatLastUpdated, shouldShowStaleWarning } = useSyncIndicator({
        queryKey: ['hook-test'],
        staleTime: 5000,
        refetchInterval: 1000,
        enableBackgroundSync: true,
        maxRetries: 3
      });

      return (
        <div>
          <span data-testid="hook-is-syncing">{syncStatus.isSyncing.toString()}</span>
          <span data-testid="hook-last-updated">{formatLastUpdated()}</span>
          <span data-testid="hook-stale-warning">{shouldShowStaleWarning.toString()}</span>
          <button data-testid="hook-refresh" onClick={refresh}>Refresh</button>
        </div>
      );
    };

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    render(<TestHookComponent />, { wrapper });

    expect(screen.getByTestId('hook-is-syncing')).toHaveTextContent('false');
    expect(screen.getByTestId('hook-last-updated')).toHaveTextContent('Never');
    expect(screen.getByTestId('hook-stale-warning')).toHaveTextContent('true');
  });

  it('handles refresh correctly', async () => {
    const TestHookComponent = () => {
      const { syncStatus, refresh } = useSyncIndicator({
        queryKey: ['refresh-test'],
        staleTime: 5000,
        refetchInterval: 1000,
        enableBackgroundSync: true,
        maxRetries: 3
      });

      return (
        <div>
          <span data-testid="refresh-test-is-syncing">{syncStatus.isSyncing.toString()}</span>
          <button data-testid="refresh-test-refresh" onClick={refresh}>Refresh</button>
        </div>
      );
    };

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    render(<TestHookComponent />, { wrapper });

    const refreshButton = screen.getByTestId('refresh-test-refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByTestId('refresh-test-is-syncing')).toHaveTextContent('true');
    });
  });
});

// Integration tests for service worker communication
describe('Service Worker Integration', () => {
  beforeEach(() => {
    // Mock service worker messages
    const mockServiceWorker = {
      postMessage: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };

    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          active: mockServiceWorker
        }),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      },
      writable: true
    });
  });

  it('initializes service worker communication', async () => {
    const { useServiceWorkerSync } = require('@/hooks/useServiceWorkerSync');
    
    // This would test service worker initialization
    // Since we can't actually test service worker in this environment,
    // we'll just ensure the hook doesn't crash
    expect(() => {
      // Mock component that uses the hook
      const TestComponent = () => {
        const { isServiceWorkerReady } = useServiceWorkerSync();
        return <div data-testid="sw-ready">{isServiceWorkerReady.toString()}</div>;
      };
      
      render(<TestComponent />);
    }).not.toThrow();
  });
});
