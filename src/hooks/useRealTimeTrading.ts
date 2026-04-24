import { useState, useEffect, useCallback } from 'react';
import { tradingWebSocket } from '../services/trading/websocket-client';
import { orderMatchingEngine } from '../services/trading/order-matching';
import { PriceDiscovery } from '../services/trading/price-discovery';
import { OrderBook, OrderBookEntry, LiveMatch, OrderBookFilters } from '../types/orderbook';
import { WebSocketMessageType } from '../types/websocket';

export const useRealTimeTrading = (filters?: OrderBookFilters) => {
  const [orderBook, setOrderBook] = useState<OrderBook>(orderMatchingEngine.getOrderBook());
  const [trades, setTrades] = useState<LiveMatch[]>([]);
  const [fairPrice, setFairPrice] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState(tradingWebSocket.getState().status);

  const handleTradeUpdate = useCallback((trade: LiveMatch) => {
    setTrades(prev => [trade, ...prev].slice(0, 50));
  }, []);

  const handleMarketData = useCallback((data: any) => {
    // In a real app, this would update the engine with external data
    setOrderBook(orderMatchingEngine.getOrderBook());
  }, []);

  useEffect(() => {
    tradingWebSocket.connect();
    
    tradingWebSocket.subscribe(WebSocketMessageType.TRADE_UPDATE, handleTradeUpdate);
    tradingWebSocket.subscribe(WebSocketMessageType.MARKET_DATA, handleMarketData);

    const statusInterval = setInterval(() => {
      setConnectionStatus(tradingWebSocket.getState().status);
      const currentBook = orderMatchingEngine.getOrderBook();
      setOrderBook(currentBook);
      setFairPrice(PriceDiscovery.calculateFairPrice(currentBook));
    }, 100);

    return () => {
      tradingWebSocket.unsubscribe(WebSocketMessageType.TRADE_UPDATE);
      tradingWebSocket.unsubscribe(WebSocketMessageType.MARKET_DATA);
      clearInterval(statusInterval);
    };
  }, [handleTradeUpdate, handleMarketData]);

  const placeOrder = useCallback((order: Omit<OrderBookEntry, 'id' | 'timestamp' | 'status'>) => {
    const newOrder: OrderBookEntry = {
      ...order,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      status: 'active'
    };

    const matches = orderMatchingEngine.addOrder(newOrder);
    
    // Broadcast trades if any
    matches.forEach(match => {
      tradingWebSocket.sendMessage({
        type: WebSocketMessageType.TRADE_UPDATE,
        payload: match
      });
    });

    // Update local state immediately
    setOrderBook(orderMatchingEngine.getOrderBook());
    if (matches.length > 0) {
      setTrades(prev => [...matches, ...prev].slice(0, 50));
    }

    return { order: newOrder, matches };
  }, []);

  return {
    orderBook,
    trades,
    fairPrice,
    connectionStatus,
    placeOrder,
    stats: tradingWebSocket.getStats()
  };
};
