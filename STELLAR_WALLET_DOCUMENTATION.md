# Stellar Wallet Integration Documentation

A comprehensive wallet connection system for CurrentDao energy trading platform, supporting Freighter and Albedo wallets with full Stellar network integration.

## Features

- **Multi-Wallet Support**: Freighter (browser extension) and Albedo (popup-based)
- **Real-time Balance**: Display WATT and XLM balances with live updates
- **Transaction History**: Complete transaction history with detailed operation breakdown
- **Security First**: Private keys never leave the wallet interface
- **Responsive Design**: Optimized for both mobile and desktop
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Accessibility**: Full WCAG compliance with screen reader support

## Quick Start

### Installation

The wallet system is already integrated into your CurrentDao application. All components are available from `@/components/wallet`.

### Basic Usage

```tsx
import { WalletConnector, WalletProvider } from '@/components/wallet';

// Wrap your app with WalletProvider (already done in app/providers.tsx)
<WalletProvider network="testnet" autoConnect={false}>
  <App />
</WalletProvider>

// Use WalletConnector in your components
<WalletConnector 
  onConnect={(wallet) => console.log('Connected:', wallet)}
  onDisconnect={() => console.log('Disconnected')}
  showBalance={true}
  showTransactions={true}
/>
```

## Components

### WalletConnector

The main wallet interface component that handles connection, disconnection, and displays wallet information.

```tsx
interface WalletConnectorProps {
  onConnect?: (wallet: WalletInfo) => void;
  onDisconnect?: () => void;
  className?: string;
  showBalance?: boolean;
  showTransactions?: boolean;
}
```

**Features:**
- One-click wallet connection
- Wallet address display with truncation
- Balance display for WATT and XLM
- Copy address functionality
- Network indicator (mainnet/testnet)
- Disconnect functionality
- Error state handling

### WalletModal

Modal component for wallet selection with enhanced UX.

```tsx
interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelect: (walletType: 'freighter' | 'albedo') => void;
  isLoading?: boolean;
  error?: string | null;
}
```

**Features:**
- Animated modal with backdrop
- Wallet option cards with descriptions
- Loading and error states
- Security notices
- Installation links for unsupported wallets

### TransactionHistory

Comprehensive transaction history with detailed operation breakdown.

```tsx
interface TransactionHistoryProps {
  transactions: StellarTransaction[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  maxItems?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
}
```

**Features:**
- Transaction list with status indicators
- Expandable transaction details
- Operation type icons and descriptions
- Transaction links to Stellar explorer
- Pagination support
- Loading and error states

### BalanceDisplay

Advanced balance display with portfolio overview.

```tsx
interface BalanceDisplayProps {
  balance: WalletBalance[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  showAssetDetails?: boolean;
}
```

**Features:**
- WATT and XLM balance display
- Balance change indicators
- Show/hide full balance
- Copy balance functionality
- Asset details (available/reserved)
- Total portfolio value estimation

## Hooks

### useStellarWallet

Main hook for wallet state and operations.

```tsx
const {
  state,
  connectWallet,
  disconnectWallet,
  refreshBalance,
  refreshTransactions,
  sendTransaction,
} = useStellarWallet();
```

### Specialized Hooks

```tsx
// Wallet info and connection status
const walletInfo = useWalletInfo();
const isConnected = useIsWalletConnected();
const address = useWalletAddress();

// Balance and transactions
const { balance, isLoading, error, refreshBalance } = useWalletBalance();
const { transactions, refreshTransactions } = useWalletTransactions();

// Wallet availability
const { freighterAvailable, albedoAvailable } = useWalletAvailability();

// Transaction history with pagination
const { transactions, loadingMore, loadMore, hasMore } = useTransactionHistory(10);
```

## Wallet Integration

### Freighter

Freighter is a browser extension wallet for Stellar. The integration includes:

- Automatic detection of Freighter availability
- Connection via extension API
- Transaction signing through Freighter interface
- Account switching support

**Installation:**
Users can install Freighter from [freighter.app](https://www.freighter.app/)

### Albedo

Albedo is a popup-based wallet that doesn't require browser extensions.

**Features:**
- Loads SDK on-demand
- Popup authentication
- Secure transaction signing
- Mobile-friendly

## Configuration

### Network Settings

The wallet system supports both mainnet and testnet:

```tsx
<WalletProvider 
  network="testnet" // or "mainnet"
  autoConnect={false}
>
  {children}
</WalletProvider>
```

### WATT Token Configuration

The system is pre-configured for the WATT token:

```typescript
export const WATT_ASSET = {
  code: 'WATT',
  issuer: 'GD5...YOUR_WATT_ISSUER...', // Replace with actual issuer
};
```

## Error Handling

### Error Types

The system provides comprehensive error handling:

```typescript
interface WalletError {
  code: string;
  message: string;
  details?: any;
  walletType?: 'freighter' | 'albedo';
}
```

### Common Error Scenarios

1. **Wallet Not Available**: When Freighter extension is not installed
2. **Connection Failed**: Network issues or user rejection
3. **Invalid Address**: Malformed Stellar addresses
4. **Insufficient Balance**: Not enough funds for transactions
5. **Network Errors**: Horizon API connectivity issues

### Error Recovery

The system includes automatic retry logic and user-friendly error messages with actionable guidance.

## Security Best Practices

### Private Key Security

- Private keys never leave the wallet interface
- All signing happens within the wallet
- No private key storage in the application
- Secure communication with wallet APIs

### Transaction Security

- Transaction details are validated before signing
- Users must confirm all transactions in their wallet
- Clear transaction memos and amounts
- Destination address validation

### Network Security

- HTTPS enforcement for all API calls
- Horizon server validation
- Testnet/mainnet separation
- Secure RPC endpoints

## Testing

### Unit Tests

Comprehensive test suite covering:

- Component rendering
- User interactions
- Error scenarios
- Accessibility features
- Wallet connection flows

Run tests:
```bash
npm test -- --testPathPattern=wallet.test.tsx
```

### Integration Testing

Test with Stellar testnet:

- Use testnet for development
- Test with Freighter testnet configuration
- Verify transaction flows
- Test error handling

## Mobile Optimization

### Responsive Design

- Touch-friendly button sizes
- Optimized modal layouts
- Simplified navigation
- Mobile-specific error messages

### Performance

- Lazy loading of wallet SDKs
- Optimized re-renders
- Efficient state management
- Minimal bundle size impact

## Troubleshooting

### Common Issues

1. **Freighter Not Detected**
   - Ensure Freighter extension is installed
   - Check browser compatibility
   - Refresh the page

2. **Albedo Popup Blocked**
   - Check popup blocker settings
   - Allow popups for the domain
   - Try manual connection

3. **Transaction Failures**
   - Check network connectivity
   - Verify sufficient balance
   - Confirm transaction details

4. **Balance Not Updating**
   - Refresh manually using the refresh button
   - Check network status
   - Verify wallet connection

### Debug Mode

Enable debug logging:

```typescript
// In development, wallet operations are logged to console
const DEBUG = process.env.NODE_ENV === 'development';
```

## Migration Guide

### From Existing Wallet System

1. Update imports to use new wallet components
2. Replace wallet connection logic with hooks
3. Update state management to use WalletProvider
4. Test with both Freighter and Albedo
5. Update error handling

### Configuration Updates

Update wallet configuration in `app/providers.tsx`:

```typescript
<WalletProvider 
  network={process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet'}
  autoConnect={false} // Set to true if desired
>
  {children}
</WalletProvider>
```

## Best Practices

### Development

- Use testnet for development
- Test both wallet types
- Implement proper error boundaries
- Monitor wallet connection state
- Test transaction flows end-to-end

### User Experience

- Provide clear connection instructions
- Show wallet availability status
- Use loading states for all operations
- Provide helpful error messages
- Include wallet installation links

### Security

- Never request private keys
- Validate all user inputs
- Use HTTPS for all communications
- Implement proper session management
- Regular security audits

## API Reference

### Wallet Types

```typescript
interface WalletInfo {
  publicKey: string;
  name?: string;
  isConnected: boolean;
  network: 'mainnet' | 'testnet';
}

interface WalletBalance {
  asset_code: string;
  asset_issuer?: string;
  balance: string;
  asset_type: 'native' | 'credit_alphanum4' | 'credit_alphanum12';
}

interface StellarTransaction {
  id: string;
  hash: string;
  successful: boolean;
  source_account: string;
  created_at: string;
  memo?: string;
  operations: StellarOperation[];
  fee_paid: string;
  fee_charged: string;
}
```

### Utility Functions

```typescript
// Address formatting
formatAddress(address: string, truncate?: boolean): string

// Balance formatting
formatBalance(balance: string, decimals?: number): string

// Address validation
isValidStellarAddress(address: string): boolean

// Network detection
detectStellarNetwork(): 'mainnet' | 'testnet'
```

## Support

### Documentation

- Component API documentation
- Integration guides
- Troubleshooting guides
- Security best practices

### Community

- GitHub issues for bug reports
- Discord community for support
- Regular updates and improvements

---

This wallet integration provides a secure, user-friendly way for CurrentDao users to connect their Stellar wallets and participate in the energy trading marketplace.
