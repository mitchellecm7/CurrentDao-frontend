'use client';

import { useState, useCallback, useEffect } from 'react';
import { QuickTradeState, PriceQuote, RecentPair } from '@/types/quickTrade';
import { getMockPriceQuote, getRecentPairs } from '@/utils/tradeHelpers';

export const useQuickTrade = () => {
  const [state, setState] = useState<QuickTradeState>({
    fromToken: 'XLM',
    toToken: 'USDC',
    amount: '',
    orderType: 'market',
    slippage: 0.5,
  });

  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [recentPairs, setRecentPairs] = useState<RecentPair[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!state.amount || parseFloat(state.amount) <= 0) {
      setQuote(null);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const newQuote = getMockPriceQuote(state.fromToken, state.toToken, parseFloat(state.amount));
      setQuote(newQuote);
      setIsLoading(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [state.fromToken, state.toToken, state.amount]);

  useEffect(() => {
    setRecentPairs(getRecentPairs());
  }, []);

  const updateAmount = useCallback((amount: string) => {
    setState(prev => ({ ...prev, amount }));
  }, []);

  const switchTokens = useCallback(() => {
    setState(prev => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      amount: prev.amount ? (parseFloat(prev.amount) * (quote?.price || 1)).toFixed(6) : '',
    }));
  }, [quote]);

  const setOrderType = useCallback((orderType: 'market' | 'limit') => {
    setState(prev => ({ ...prev, orderType }));
  }, []);

  const setLimitPrice = useCallback((limitPrice: string) => {
    setState(prev => ({ ...prev, limitPrice }));
  }, []);

  const executeTrade = useCallback(async (side: 'buy' | 'sell') => {
    if (!state.amount || parseFloat(state.amount) <= 0) return false;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 750));

    console.log(`[Quick Trade] ${side.toUpperCase()} executed:`, state);
    setIsLoading(false);
    return true;
  }, [state]);

  return {
    state,
    quote,
    recentPairs,
    isLoading,
    updateAmount,
    switchTokens,
    setOrderType,
    setLimitPrice,
    executeTrade,
  };
};