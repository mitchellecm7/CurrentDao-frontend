import { PriceQuote, RecentPair } from '../types/quickTrade';

export const getMockPriceQuote = (from: string, to: string, amount: number): PriceQuote => {
  const basePrice = from === 'XLM' ? 0.15 : 6.8;
  const impact = Math.min(amount * 0.008, 8);

  return {
    price: basePrice,
    lastUpdated: new Date(),
    priceImpact: impact,
    usdValue: amount * basePrice * 0.12,
  };
};

export const getRecentPairs = (): RecentPair[] => [
  { fromToken: 'XLM', toToken: 'USDC', lastTraded: new Date(), volume24h: 124000 },
  { fromToken: 'USDC', toToken: 'PYUSD', lastTraded: new Date(Date.now() - 1000000), volume24h: 89000 },
  { fromToken: 'XLM', toToken: 'BTC', lastTraded: new Date(Date.now() - 3600000), volume24h: 45000 },
];