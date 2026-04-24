import { OrderBook, PriceLevelAnalysis } from '../../types/orderbook';

export class PriceDiscovery {
  public static calculateFairPrice(orderBook: OrderBook): number {
    if (orderBook.bids.length === 0 || orderBook.asks.length === 0) return 0;

    const bestBid = orderBook.bids[0].price;
    const bestAsk = orderBook.asks[0].price;
    
    // Mid-price as base
    const midPrice = (bestBid + bestAsk) / 2;

    // Volume-weighted adjustment
    const bidVolume = orderBook.bids.slice(0, 5).reduce((sum, b) => sum + b.quantity, 0);
    const askVolume = orderBook.asks.slice(0, 5).reduce((sum, a) => sum + a.quantity, 0);
    
    const totalVolume = bidVolume + askVolume;
    if (totalVolume === 0) return midPrice;

    const volumeImbalance = (bidVolume - askVolume) / totalVolume;
    const spread = bestAsk - bestBid;
    
    // Adjust fair price based on volume imbalance
    return midPrice + (volumeImbalance * spread * 0.1);
  }

  public static analyzeMarketDepth(orderBook: OrderBook): PriceLevelAnalysis[] {
    const analysis: PriceLevelAnalysis[] = [];
    const allLevels = [...orderBook.bids, ...orderBook.asks];

    allLevels.forEach(level => {
      const support = this.calculateSupportStrength(level, orderBook.bids);
      const resistance = this.calculateResistanceStrength(level, orderBook.asks);
      
      analysis.push({
        price: level.price,
        support,
        resistance,
        strength: Math.max(support, resistance),
        volume: level.quantity,
        orders: level.orders,
        trend: support > resistance ? 'bullish' : resistance > support ? 'bearish' : 'neutral'
      });
    });

    return analysis.sort((a, b) => b.price - a.price);
  }

  private static calculateSupportStrength(level: any, bids: any[]): number {
    const totalBidVolume = bids.reduce((sum, b) => sum + b.quantity, 0);
    if (totalBidVolume === 0) return 0;
    return (level.quantity / totalBidVolume) * 100;
  }

  private static calculateResistanceStrength(level: any, asks: any[]): number {
    const totalAskVolume = asks.reduce((sum, a) => sum + a.quantity, 0);
    if (totalAskVolume === 0) return 0;
    return (level.quantity / totalAskVolume) * 100;
  }
}
