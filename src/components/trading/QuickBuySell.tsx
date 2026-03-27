import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface QuickBuySellProps {
  fromToken: string;
  toToken: string;
  amount: string;
  onAmountChange: (value: string) => void;
  onSwitchTokens: () => void;
}

export default function QuickBuySell({
  fromToken,
  toToken,
  amount,
  onAmountChange,
  onSwitchTokens,
}: QuickBuySellProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">You Pay</label>
        <div className="flex gap-3">
          <div className="bg-zinc-800 px-4 py-3 rounded-2xl flex items-center font-mono text-lg">
            {fromToken}
          </div>
          <input
            type="text"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-3 text-2xl font-medium focus:outline-none focus:border-yellow-400"
          />
        </div>
      </div>

      <div className="flex justify-center -my-2">
        <button
          onClick={onSwitchTokens}
          className="bg-zinc-800 hover:bg-zinc-700 p-3 rounded-full transition-all active:scale-90"
        >
          <ArrowUpDown size={20} className="text-yellow-400" />
        </button>
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">You Receive</label>
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 text-2xl font-medium text-right">
          {amount ? '~0.00' : '0.00'} {toToken}
        </div>
      </div>
    </div>
  );
}