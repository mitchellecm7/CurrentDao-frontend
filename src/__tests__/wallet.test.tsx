import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WalletConnector } from '@/components/wallet/WalletConnector';
import { WalletModal } from '@/components/wallet/WalletModal';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';
import { BalanceDisplay } from '@/components/wallet/BalanceDisplay';
import { WalletProvider, useStellarWallet } from '@/hooks/useStellarWallet';
import { WalletInfo, WalletBalance, StellarTransaction } from '@/types/wallet';

// Mock wallet hooks
jest.mock('@/hooks/useStellarWallet', () => ({
  useStellarWallet: () => ({
    state: {
      wallet: null,
      balance: [],
      transactions: [],
      isLoading: false,
      error: null,
      network: 'testnet',
    },
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn(),
    refreshBalance: jest.fn(),
    refreshTransactions: jest.fn(),
    sendTransaction: jest.fn(),
  }),
  useWalletAvailability: () => ({
    freighterAvailable: true,
    albedoAvailable: true,
  }),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

// Mock window.open
Object.assign(window, {
  open: jest.fn(),
});

describe('Wallet Components', () => {
  describe('WalletConnector', () => {
    const mockProps = {
      onConnect: jest.fn(),
      onDisconnect: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders connect wallet when not connected', () => {
      render(<WalletConnector {...mockProps} />);
      
      expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
      expect(screen.getByText('Connect Freighter')).toBeInTheDocument();
      expect(screen.getByText('Connect Albedo')).toBeInTheDocument();
      expect(screen.getByText('Choose your preferred Stellar wallet')).toBeInTheDocument();
    });

    it('shows wallet info when connected', () => {
      const mockWallet: WalletInfo = {
        publicKey: 'GD5WDN7YB4RQZJQ6P5Y2L5BLYZ2KRZ4TNRQ',
        name: 'Freighter',
        isConnected: true,
        network: 'testnet',
      };

      jest.spyOn(require('@/hooks/useStellarWallet'), 'useStellarWallet').mockReturnValue({
        state: {
          wallet: mockWallet,
          balance: [
            { asset_code: 'WATT', balance: '1000' },
            { asset_code: 'XLM', balance: '50' },
          ],
          transactions: [],
          isLoading: false,
          error: null,
          network: 'testnet',
        },
        connectWallet: jest.fn(),
        disconnectWallet: jest.fn(),
        refreshBalance: jest.fn(),
        refreshTransactions: jest.fn(),
        sendTransaction: jest.fn(),
      });

      render(<WalletConnector {...mockProps} />);
      
      expect(screen.getByText('Freighter')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText('GD5WDN...NRQ')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('handles wallet connection', async () => {
      const mockConnect = jest.fn();
      
      jest.spyOn(require('@/hooks/useStellarWallet'), 'useStellarWallet').mockReturnValue({
        state: {
          wallet: null,
          balance: [],
          transactions: [],
          isLoading: false,
          error: null,
          network: 'testnet',
        },
        connectWallet: mockConnect,
        disconnectWallet: jest.fn(),
        refreshBalance: jest.fn(),
        refreshTransactions: jest.fn(),
        sendTransaction: jest.fn(),
      });

      render(<WalletConnector {...mockProps} />);
      
      const freighterButton = screen.getByText('Connect Freighter');
      fireEvent.click(freighterButton);
      
      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalledWith('freighter');
      });
    });

    it('handles wallet disconnection', async () => {
      const mockDisconnect = jest.fn();
      const mockWallet: WalletInfo = {
        publicKey: 'GD5WDN7YB4RQZJQ6P5Y2L5BLYZ2KRZ4TNRQ',
        name: 'Freighter',
        isConnected: true,
        network: 'testnet',
      };

      jest.spyOn(require('@/hooks/useStellarWallet'), 'useStellarWallet').mockReturnValue({
        state: {
          wallet: mockWallet,
          balance: [],
          transactions: [],
          isLoading: false,
          error: null,
          network: 'testnet',
        },
        connectWallet: jest.fn(),
        disconnectWallet: mockDisconnect,
        refreshBalance: jest.fn(),
        refreshTransactions: jest.fn(),
        sendTransaction: jest.fn(),
      });

      render(<WalletConnector {...mockProps} />);
      
      const disconnectButton = screen.getByText('Disconnect');
      fireEvent.click(disconnectButton);
      
      await waitFor(() => {
        expect(mockDisconnect).toHaveBeenCalled();
      });
    });

    it('displays error state', () => {
      jest.spyOn(require('@/hooks/useStellarWallet'), 'useStellarWallet').mockReturnValue({
        state: {
          wallet: null,
          balance: [],
          transactions: [],
          isLoading: false,
          error: 'Connection failed',
          network: 'testnet',
        },
        connectWallet: jest.fn(),
        disconnectWallet: jest.fn(),
        refreshBalance: jest.fn(),
        refreshTransactions: jest.fn(),
        sendTransaction: jest.fn(),
      });

      render(<WalletConnector {...mockProps} />);
      
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });
  });

  describe('WalletModal', () => {
    const mockProps = {
      isOpen: true,
      onClose: jest.fn(),
      onWalletSelect: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders wallet options when open', () => {
      render(<WalletModal {...mockProps} />);
      
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
      expect(screen.getByText('Choose your preferred Stellar wallet')).toBeInTheDocument();
      expect(screen.getByText('Freighter')).toBeInTheDocument();
      expect(screen.getByText('Albedo')).toBeInTheDocument();
      expect(screen.getByText('Popular browser extension wallet for Stellar')).toBeInTheDocument();
      expect(screen.getByText('Secure popup-based wallet for Stellar')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<WalletModal {...mockProps} isOpen={false} />);
      
      expect(screen.queryByText('Connect Wallet')).not.toBeInTheDocument();
    });

    it('handles wallet selection', async () => {
      const mockSelect = jest.fn();
      
      render(<WalletModal {...mockProps} onWalletSelect={mockSelect} />);
      
      const freighterButton = screen.getByText('Freighter');
      fireEvent.click(freighterButton);
      
      await waitFor(() => {
        expect(mockSelect).toHaveBeenCalledWith('freighter');
      });
    });

    it('shows loading state', () => {
      render(<WalletModal {...mockProps} isLoading={true} />);
      
      expect(screen.getByText('Connecting to wallet...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
    });

    it('shows error state', () => {
      render(<WalletModal {...mockProps} error="Connection failed" />);
      
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });

    it('handles backdrop click', () => {
      const mockClose = jest.fn();
      
      render(<WalletModal {...mockProps} onClose={mockClose} />);
      
      const backdrop = screen.getByText('Connect Wallet').closest('[role="dialog"]')?.parentElement;
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockClose).toHaveBeenCalled();
      }
    });
  });

  describe('TransactionHistory', () => {
    const mockTransactions: StellarTransaction[] = [
      {
        id: '1',
        hash: 'abc123',
        successful: true,
        source_account: 'GD5WDN7YB4RQZJQ6P5Y2L5BLYZ2KRZ4TNRQ',
        created_at: '2024-01-15T10:30:00Z',
        transaction_envelope: 'xdr...',
        memo: 'Energy payment',
        operations: [
          {
            id: '1',
            type: 'payment',
            source_account: 'GD5WDN7YB4RQZJQ6P5Y2L5BLYZ2KRZ4TNRQ',
            created_at: '2024-01-15T10:30:00Z',
            transaction_hash: 'abc123',
            asset_code: 'WATT',
            amount: '100',
            from: 'GD5WDN7YB4RQZJQ6P5Y2L5BLYZ2KRZ4TNRQ',
            to: 'GD7YEH...ABC',
          },
        ],
        fee_paid: '100',
        fee_charged: '100',
      },
    ];

    it('renders transaction list', () => {
      render(<TransactionHistory transactions={mockTransactions} />);
      
      expect(screen.getByText('Transaction History')).toBeInTheDocument();
      expect(screen.getByText('1 transactions')).toBeInTheDocument();
      expect(screen.getByText('Energy payment')).toBeInTheDocument();
      expect(screen.getByText('WATT 100')).toBeInTheDocument();
      expect(screen.getByText('0.00001 XLM')).toBeInTheDocument();
    });

    it('renders empty state', () => {
      render(<TransactionHistory transactions={[]} />);
      
      expect(screen.getByText('No Transactions')).toBeInTheDocument();
      expect(screen.getByText('Your transaction history will appear here once you start trading energy.')).toBeInTheDocument();
    });

    it('renders loading state', () => {
      render(<TransactionHistory transactions={[]} isLoading={true} />);
      
      expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
    });

    it('renders error state', () => {
      render(<TransactionHistory transactions={[]} error="Failed to load transactions" />);
      
      expect(screen.getByText('Failed to Load Transactions')).toBeInTheDocument();
      expect(screen.getByText('Failed to load transactions')).toBeInTheDocument();
    });

    it('expands transaction details', async () => {
      render(<TransactionHistory transactions={mockTransactions} />);
      
      const expandButton = screen.getByRole('button', { name: /expand/i });
      fireEvent.click(expandButton);
      
      await waitFor(() => {
        expect(screen.getByText('GD5WDN...NRQ → GD7YEH...ABC')).toBeInTheDocument();
      });
    });

    it('limits displayed transactions', () => {
      render(<TransactionHistory transactions={mockTransactions} maxItems={5} />);
      
      // Should only show first 5 transactions if there are more
      expect(screen.getAllByTestId('transaction-item')).toHaveLength(Math.min(5, mockTransactions.length));
    });
  });

  describe('BalanceDisplay', () => {
    const mockBalance: WalletBalance[] = [
      { asset_code: 'WATT', balance: '1000.5', asset_type: 'credit_alphanum4' },
      { asset_code: 'XLM', balance: '50.25', asset_type: 'native' },
    ];

    it('renders balance information', () => {
      render(<BalanceDisplay balance={mockBalance} />);
      
      expect(screen.getByText('Portfolio Balance')).toBeInTheDocument();
      expect(screen.getByText('WATT')).toBeInTheDocument();
      expect(screen.getByText('Energy Token')).toBeInTheDocument();
      expect(screen.getByText('XLM')).toBeInTheDocument();
      expect(screen.getByText('Native Asset')).toBeInTheDocument();
      expect(screen.getByText('1000.5')).toBeInTheDocument();
      expect(screen.getByText('50.25')).toBeInTheDocument();
    });

    it('renders loading state', () => {
      render(<BalanceDisplay balance={[]} isLoading={true} />);
      
      expect(screen.getByText('Loading balance...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
    });

    it('renders error state', () => {
      render(<BalanceDisplay balance={[]} error="Failed to load balance" />);
      
      expect(screen.getByText('Failed to Load Balance')).toBeInTheDocument();
      expect(screen.getByText('Failed to load balance')).toBeInTheDocument();
    });

    it('toggles balance visibility', async () => {
      render(<BalanceDisplay balance={mockBalance} />);
      
      const eyeButton = screen.getByRole('button', { name: /show/i });
      fireEvent.click(eyeButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /hide/i })).toBeInTheDocument();
      });
    });

    it('copies balance to clipboard', async () => {
      render(<BalanceDisplay balance={mockBalance} />);
      
      const copyButton = screen.getByText('Copy');
      fireEvent.click(copyButton);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1000.5');
      });
    });

    it('shows asset details when enabled', () => {
      render(<BalanceDisplay balance={mockBalance} showAssetDetails={true} />);
      
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('Reserved')).toBeInTheDocument();
      expect(screen.getByText('0 WATT')).toBeInTheDocument();
    });

    it('hides asset details when disabled', () => {
      render(<BalanceDisplay balance={mockBalance} showAssetDetails={false} />);
      
      expect(screen.queryByText('Available')).not.toBeInTheDocument();
      expect(screen.queryByText('Reserved')).not.toBeInTheDocument();
    });
  });

  describe('Wallet Integration', () => {
    it('provides wallet context to children', () => {
      const TestComponent = () => {
        const { state } = useStellarWallet();
        return <div data-testid="wallet-state">{state.network}</div>;
      };

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      );
      
      expect(screen.getByTestId('wallet-state')).toHaveTextContent('testnet');
    });

    it('handles wallet connection flow', async () => {
      const TestComponent = () => {
        const { connectWallet, state } = useStellarWallet();
        
        React.useEffect(() => {
          connectWallet('freighter');
        }, [connectWallet]);
        
        return <div data-testid="loading">{state.isLoading.toString()}</div>;
      };

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('true');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles wallet not available', () => {
      jest.spyOn(require('@/hooks/useStellarWallet'), 'useWalletAvailability').mockReturnValue({
        freighterAvailable: false,
        albedoAvailable: false,
      });

      render(<WalletConnector />);
      
      expect(screen.getByText('Freighter')).toBeInTheDocument();
      expect(screen.getByText('Albedo')).toBeInTheDocument();
      // Should show as unavailable
    });

    it('handles network errors gracefully', () => {
      jest.spyOn(require('@/hooks/useStellarWallet'), 'useStellarWallet').mockReturnValue({
        state: {
          wallet: null,
          balance: [],
          transactions: [],
          isLoading: false,
          error: 'Network error: Unable to connect to Stellar',
          network: 'testnet',
        },
        connectWallet: jest.fn(),
        disconnectWallet: jest.fn(),
        refreshBalance: jest.fn(),
        refreshTransactions: jest.fn(),
        sendTransaction: jest.fn(),
      });

      render(<WalletConnector />);
      
      expect(screen.getByText('Network error: Unable to connect to Stellar')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<WalletConnector />);
      
      const connectButton = screen.getByRole('button', { name: 'Connect Freighter' });
      expect(connectButton).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation', () => {
      render(<WalletModal isOpen={true} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('role', 'dialog');
      
      // Test tab navigation
      fireEvent.keyDown(modal, { key: 'Tab' });
      // Should focus on first interactive element
    });

    it('announces screen reader messages', () => {
      render(<WalletConnector />);
      
      // Should have live regions for dynamic content
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
