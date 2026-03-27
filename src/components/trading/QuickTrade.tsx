'use client';

import React, { useState } from 'react';
import { Zap, ArrowRightLeft } from 'lucide-react';
import QuickBuySell from './QuickBuySell';
import OrderTypeSelector from './OrderTypeSelector';
import PriceQuote from './PriceQuote';
import RecentPairs from './RecentPairs';
import { useQuickTrade } from '@/hooks/useQuickTrade';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function QuickTrade() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    state,
    quote,
    recentPairs,
    isLoading,
    updateAmount,
    switchTokens,
    setOrderType,
    setLimitPrice,
    executeTrade,
  } = useQuickTrade();

  useKeyboardShortcuts({
    'b': () => executeTrade('buy'),
    's': () => executeTrade('sell'),
    'm': () => setOrderType('market'),
    'l': () => setOrderType('limit'),
    'Enter': () => executeTrade('buy'),
    'ArrowUp': switchTokens,
  });

  return (
    <div className="max-w-md mx-auto bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Quick Trade</h2>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          {showAdvanced ? 'Simple' : 'Advanced'}
        </button>
      </div>

      <OrderTypeSelector 
        orderType={state.orderType} 
        onChange={setOrderType} 
      />

      <QuickBuySell 
        fromToken={state.fromToken}
        toToken={state.toToken}
        amount={state.amount}
        onAmountChange={updateAmount}
        onSwitchTokens={switchTokens}
      />

      <PriceQuote 
        quote={quote} 
        isLoading={isLoading} 
      />

      <RecentPairs 
        pairs={recentPairs} 
        onSelect={(from, to) => {
          console.log('Selected pair:', from, to);
        }} 
      />

      <button
        onClick={() => executeTrade('buy')}
        disabled={isLoading || !state.amount}
        className="w-full mt-8 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-2xl transition-all active:scale-[0.985] text-lg"
      >
        {isLoading ? 'Executing Trade...' : `Execute ${state.orderType.toUpperCase()} Trade`}
      </button>

      <p className="text-center text-xs text-zinc-500 mt-6">
        Press <span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded">B</span> Buy • 
        <span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded">S</span> Sell • 
        <span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded">Enter</span> Confirm
      </p>
    </div>
  );
}