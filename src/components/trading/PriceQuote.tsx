import React from 'react';
import { PriceQuote as PriceQuoteType } from '../../types/quickTrade';

interface PriceQuoteProps {
  quote: PriceQuoteType | null;
  isLoading: boolean;
}

export default function PriceQuote({ quote, isLoading }: PriceQuoteProps) {
  if (!quote) return null;

  return (
    <div className="bg-zinc-900/70 border border-zinc-700 rounded-2xl p-4 mb-6">
      <div className="flex justify-between items-center text-sm">
        <span className="text-zinc-400">Best Price</span>
        <span className="font-mono font-medium">
          1 {quote.price.toFixed(6)}
        </span>
      </div>
      <div className="text-xs text-emerald-400 mt-1">
        Updated just now • Impact: {quote.priceImpact.toFixed(2)}%
      </div>
    </div>
  );
}