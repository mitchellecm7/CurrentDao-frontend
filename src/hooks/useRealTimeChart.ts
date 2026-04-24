import { useState, useEffect, useCallback, useRef } from 'react';
import { PriceDataPoint, RealTimeChartState, Timeframe } from '@/types/charts';

interface UseRealTimeChartOptions {
  symbol: string;
  timeframe: Timeframe;
  updateInterval?: number;
  maxDataPoints?: number;
  autoReconnect?: boolean;
}

interface UseRealTimeChartReturn extends RealTimeChartState {
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  addDataPoint: (dataPoint: PriceDataPoint) => void;
  clearData: () => void;
  setTimeframe: (timeframe: Timeframe) => void;
}

const getTimeframeInMilliseconds = (timeframe: Timeframe): number => {
  const timeframeMap: Record<Timeframe, number> = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '1M': 30 * 24 * 60 * 60 * 1000,
  };
  return timeframeMap[timeframe];
};

const generateMockPriceData = (symbol: string, timeframe: Timeframe, count: number = 100): PriceDataPoint[] => {
  const data: PriceDataPoint[] = [];
  const now = Date.now();
  const interval = getTimeframeInMilliseconds(timeframe);
  let basePrice = 100 + Math.random() * 50;
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - (i * interval);
    const volatility = 0.01 + Math.random() * 0.02;
    const trend = Math.sin(i * 0.1) * 0.005;
    
    const open = basePrice;
    const change = (Math.random() - 0.5 + trend) * volatility;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * basePrice;
    const low = Math.min(open, close) - Math.random() * volatility * basePrice;
    const volume = Math.floor(1000000 + Math.random() * 5000000);
    
    data.push({
      timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
    
    basePrice = close;
  }
  
  return data;
};

export const useRealTimeChart = ({
  symbol,
  timeframe,
  updateInterval = 1000,
  maxDataPoints = 10000,
  autoReconnect = true,
}: UseRealTimeChartOptions): UseRealTimeChartReturn => {
  const [state, setState] = useState<RealTimeChartState>({
    data: [],
    isConnected: false,
    lastUpdate: 0,
    error: null,
    loading: true,
  });

  const [currentTimeframe, setCurrentTimeframe] = useState<Timeframe>(timeframe);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const generateNewDataPoint = useCallback((lastDataPoint: PriceDataPoint | null): PriceDataPoint => {
    const now = Date.now();
    const interval = getTimeframeInMilliseconds(currentTimeframe);
    
    if (lastDataPoint && (now - lastDataPoint.timestamp) < interval) {
      return lastDataPoint;
    }
    
    const lastPrice = lastDataPoint?.close || (100 + Math.random() * 50);
    const volatility = 0.01 + Math.random() * 0.02;
    const trend = Math.sin(now * 0.0001) * 0.005;
    
    const change = (Math.random() - 0.5 + trend) * volatility;
    const close = lastPrice + change;
    const open = lastPrice;
    const high = Math.max(open, close) + Math.random() * volatility * lastPrice;
    const low = Math.min(open, close) - Math.random() * volatility * lastPrice;
    const volume = Math.floor(1000000 + Math.random() * 5000000);
    
    return {
      timestamp: now,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    };
  }, [currentTimeframe]);

  const connect = useCallback(() => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const initialData = generateMockPriceData(symbol, currentTimeframe, 100);
      
      setState(prev => ({
        ...prev,
        data: initialData,
        isConnected: true,
        lastUpdate: Date.now(),
        loading: false,
      }));

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (!prev.isConnected || prev.data.length === 0) return prev;
          
          const lastDataPoint = prev.data[prev.data.length - 1];
          const newDataPoint = generateNewDataPoint(lastDataPoint);
          
          if (newDataPoint.timestamp === lastDataPoint.timestamp) {
            return prev;
          }
          
          const updatedData = [...prev.data, newDataPoint];
          if (updatedData.length > maxDataPoints) {
            updatedData.shift();
          }
          
          return {
            ...prev,
            data: updatedData,
            lastUpdate: Date.now(),
          };
        });
      }, updateInterval);

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Connection failed',
        isConnected: false,
        loading: false,
      }));
    }
  }, [symbol, currentTimeframe, updateInterval, maxDataPoints, generateNewDataPoint]);

  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      error: null,
    }));
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  const addDataPoint = useCallback((dataPoint: PriceDataPoint) => {
    setState(prev => {
      const updatedData = [...prev.data, dataPoint];
      if (updatedData.length > maxDataPoints) {
        updatedData.shift();
      }
      
      return {
        ...prev,
        data: updatedData,
        lastUpdate: Date.now(),
        error: null,
      };
    });
  }, [maxDataPoints]);

  const clearData = useCallback(() => {
    setState(prev => ({
      ...prev,
      data: [],
      lastUpdate: 0,
    }));
  }, []);

  const setTimeframe = useCallback((newTimeframe: Timeframe) => {
    setCurrentTimeframe(newTimeframe);
    setState(prev => ({ ...prev, loading: true }));
    
    const newData = generateMockPriceData(symbol, newTimeframe, 100);
    
    setState(prev => ({
      ...prev,
      data: newData,
      loading: false,
      lastUpdate: Date.now(),
    }));
  }, [symbol]);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    if (!state.isConnected && autoReconnect && !state.loading) {
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [state.isConnected, autoReconnect, state.loading, connect]);

  return {
    ...state,
    connect,
    disconnect,
    reconnect,
    addDataPoint,
    clearData,
    setTimeframe,
  };
};
