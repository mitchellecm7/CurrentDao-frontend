import React, { useMemo } from 'react';
import { PriceLevel } from '../../types/orderbook';

interface OrderBookProps {
  bids: PriceLevel[];
  asks: PriceLevel[];
  spread: number;
  spreadPercentage: number;
}

export const OrderBook: React.FC<OrderBookProps> = ({ bids, asks, spread, spreadPercentage }) => {
  const maxTotal = useMemo(() => {
    const all = [...bids, ...asks];
    return Math.max(...all.map(l => l.total), 1);
  }, [bids, asks]);

  const renderLevel = (level: PriceLevel, type: 'bid' | 'ask') => {
    const percentage = (level.total / maxTotal) * 100;
    const color = type === 'bid' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    const textColor = type === 'bid' ? 'text-green-400' : 'text-red-400';

    return (
      <div 
        key={level.price} 
        className="relative flex justify-between py-1 px-4 text-xs font-mono group hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div 
          className="absolute right-0 top-0 h-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
        <span className={`z-10 w-1/3 ${textColor}`}>{level.price.toFixed(4)}</span>
        <span className="z-10 w-1/3 text-right text-gray-300">{level.quantity.toFixed(2)}</span>
        <span className="z-10 w-1/3 text-right text-gray-500">{level.total.toFixed(2)}</span>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden h-full flex flex-col shadow-2xl">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
        <h3 className="text-sm font-semibold text-white">Order Book</h3>
        <div className="flex gap-2">
          <button className="p-1 hover:bg-white/10 rounded"><div className="w-3 h-3 border border-green-500/50 rounded-sm"></div></button>
          <button className="p-1 hover:bg-white/10 rounded"><div className="w-3 h-3 border border-red-500/50 rounded-sm"></div></button>
        </div>
      </div>

      <div className="flex justify-between px-4 py-2 text-[10px] uppercase tracking-wider font-bold text-gray-500 border-b border-white/5 bg-slate-900/30">
        <span className="w-1/3">Price (USDT)</span>
        <span className="w-1/3 text-right">Size (MWH)</span>
        <span className="w-1/3 text-right">Total</span>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Asks (Sells) - Show in reverse order (highest price at top) */}
        <div className="flex flex-col-reverse justify-end overflow-hidden h-1/2 border-b border-white/5">
          {asks.slice(0, 15).map(level => renderLevel(level, 'ask'))}
        </div>

        {/* Spread */}
        <div className="py-3 px-4 bg-white/5 flex justify-between items-center">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">{( (bids[0]?.price || 0) + (asks[0]?.price || 0) / 2).toFixed(4)}</span>
            <span className="text-[10px] text-green-400">≈ $24.52</span>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-gray-400">Spread: {spread.toFixed(4)}</div>
            <div className="text-[10px] font-mono text-gray-500">{spreadPercentage.toFixed(2)}%</div>
          </div>
        </div>

        {/* Bids (Buys) */}
        <div className="overflow-hidden h-1/2">
          {bids.slice(0, 15).map(level => renderLevel(level, 'bid'))}
        </div>
      </div>
    </div>
  );
};
