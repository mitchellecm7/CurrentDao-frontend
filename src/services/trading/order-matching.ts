import { OrderBookEntry, PriceLevel, LiveMatch, OrderBook } from '../../types/orderbook';

export class OrderMatchingEngine {
  private bids: OrderBookEntry[] = [];
  private asks: OrderBookEntry[] = [];
  private trades: LiveMatch[] = [];

  public addOrder(order: OrderBookEntry): LiveMatch[] {
    const matches: LiveMatch[] = [];
    
    if (order.side === 'buy') {
      this.matchBuyOrder(order, matches);
    } else {
      this.matchSellOrder(order, matches);
    }

    if (order.quantity > 0 && order.status !== 'filled') {
      this.insertIntoBook(order);
    }

    return matches;
  }

  private matchBuyOrder(order: OrderBookEntry, matches: LiveMatch[]): void {
    // Sort asks by price ascending
    this.asks.sort((a, b) => a.price - b.price);

    for (let i = 0; i < this.asks.length; i++) {
      const ask = this.asks[i];
      if (order.price >= ask.price || order.type === 'market') {
        const matchQuantity = Math.min(order.quantity, ask.quantity);
        
        matches.push(this.createMatch(order, ask, matchQuantity));
        
        order.quantity -= matchQuantity;
        ask.quantity -= matchQuantity;

        if (ask.quantity === 0) {
          this.asks.splice(i, 1);
          i--;
        }

        if (order.quantity === 0) {
          order.status = 'filled';
          break;
        } else {
          order.status = 'partial';
        }
      } else {
        break;
      }
    }
  }

  private matchSellOrder(order: OrderBookEntry, matches: LiveMatch[]): void {
    // Sort bids by price descending
    this.bids.sort((a, b) => b.price - a.price);

    for (let i = 0; i < this.bids.length; i++) {
      const bid = this.bids[i];
      if (order.price <= bid.price || order.type === 'market') {
        const matchQuantity = Math.min(order.quantity, bid.quantity);
        
        matches.push(this.createMatch(bid, order, matchQuantity));
        
        order.quantity -= matchQuantity;
        bid.quantity -= matchQuantity;

        if (bid.quantity === 0) {
          this.bids.splice(i, 1);
          i--;
        }

        if (order.quantity === 0) {
          order.status = 'filled';
          break;
        } else {
          order.status = 'partial';
        }
      } else {
        break;
      }
    }
  }

  private createMatch(buy: OrderBookEntry, sell: OrderBookEntry, quantity: number): LiveMatch {
    const match: LiveMatch = {
      id: Math.random().toString(36).substring(7),
      price: sell.price, // Matching at the existing order's price
      quantity,
      buyOrderId: buy.id,
      sellOrderId: sell.id,
      timestamp: Date.now(),
      aggressor: buy.timestamp > sell.timestamp ? 'buy' : 'sell'
    };
    this.trades.push(match);
    return match;
  }

  private insertIntoBook(order: OrderBookEntry): void {
    if (order.side === 'buy') {
      this.bids.push(order);
      this.bids.sort((a, b) => b.price - a.price);
    } else {
      this.asks.push(order);
      this.asks.sort((a, b) => a.price - b.price);
    }
  }

  public getOrderBook(): OrderBook {
    const bids = this.aggregateLevels(this.bids);
    const asks = this.aggregateLevels(this.asks);
    const bestBid = bids[0]?.price || 0;
    const bestAsk = asks[0]?.price || 0;
    const spread = bestAsk - bestBid;

    return {
      bids,
      asks,
      spread,
      spreadPercentage: bestAsk > 0 ? (spread / bestAsk) * 100 : 0,
      lastUpdate: Date.now(),
      totalVolume: this.trades.reduce((sum, t) => sum + t.quantity, 0),
      high24h: Math.max(...this.trades.map(t => t.price), 0),
      low24h: Math.min(...this.trades.map(t => t.price), Infinity) === Infinity ? 0 : Math.min(...this.trades.map(t => t.price))
    };
  }

  private aggregateLevels(orders: OrderBookEntry[]): PriceLevel[] {
    const levels: Map<number, PriceLevel> = new Map();
    
    orders.forEach(order => {
      const existing = levels.get(order.price);
      if (existing) {
        existing.quantity += order.quantity;
        existing.total += order.price * order.quantity;
        existing.orders += 1;
      } else {
        levels.set(order.price, {
          price: order.price,
          quantity: order.quantity,
          total: order.price * order.quantity,
          orders: 1,
          timestamp: order.timestamp
        });
      }
    });

    return Array.from(levels.values()).sort((a, b) => b.price - a.price);
  }

  public getTradeHistory(): LiveMatch[] {
    return [...this.trades].sort((a, b) => b.timestamp - a.timestamp);
  }
}

export const orderMatchingEngine = new OrderMatchingEngine();
