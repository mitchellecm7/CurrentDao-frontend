# CurrentDao JavaScript SDK

The official JavaScript SDK for interacting with the CurrentDao platform.

## Installation

```bash
npm install @currentdao/sdk
```

## Quick Start

```javascript
import { CurrentDaoClient } from '@currentdao/sdk';

const client = new CurrentDaoClient({
  apiKey: 'YOUR_API_KEY',
  network: 'mainnet'
});

// Execute a trade
const trade = await client.trading.execute({
  symbol: 'XLM/USDC',
  side: 'buy',
  amount: 100
});

console.log('Trade result:', trade);
```

## API Reference

### `client.trading`
- `execute(params)`: Executes a trade.
- `getMarketData(symbol)`: Fetches market data.

### `client.analytics`
- `getStats()`: Fetches platform statistics.

### `client.oracles`
- `getPrice(symbol)`: Fetches real-time price from the oracle network.
