export type OrderType = 'market' | 'limit';

export interface QuickTradeState {
  fromToken: string;
  toToken: string;
  amount: string;
  orderType: OrderType;
  limitPrice?: string;
  slippage: number;
}

export interface PriceQuote {
  price: number;
  lastUpdated: Date;
  priceImpact: number;
  usdValue?: number;
}

export interface RecentPair {
  fromToken: string;
  toToken: string;
  lastTraded: Date;
  volume24h?: number;
}