import React from 'react';
import { RecentPair } from '../../types/quickTrade';

interface RecentPairsProps {
  pairs: RecentPair[];
  onSelect: (from: string, to: string) => void;
}

export default function RecentPairs({ pairs, onSelect }: RecentPairsProps) {
  return (
    <div className="mb-6">
      <p className="text-xs text-zinc-400 mb-3">Recent Pairs</p>
      <div className="flex gap-2 flex-wrap">
        {pairs.slice(0, 6).map((pair, i) => (
          <button
            key={i}
            onClick={() => onSelect(pair.fromToken, pair.toToken)}
            className="bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-xl text-sm transition-all active:scale-95 border border-zinc-700"
          >
            {pair.fromToken}/{pair.toToken}
          </button>
        ))}
      </div>
    </div>
  );
}