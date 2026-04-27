import React, { useMemo } from 'react';
import { PriceLevel } from '../../types/orderbook';

interface MarketDepthProps {
  bids: PriceLevel[];
  asks: PriceLevel[];
}

export const MarketDepth: React.FC<MarketDepthProps> = ({ bids, asks }) => {
  const chartData = useMemo(() => {
    const buyLevels = bids.slice(0, 20).map((b, i, arr) => ({
      price: b.price,
      volume: arr.slice(0, i + 1).reduce((sum, curr) => sum + curr.quantity, 0),
      type: 'bid'
    }));

    const sellLevels = asks.slice(0, 20).map((a, i, arr) => ({
      price: a.price,
      volume: arr.slice(0, i + 1).reduce((sum, curr) => sum + curr.quantity, 0),
      type: 'ask'
    }));

    return { buyLevels, sellLevels };
  }, [bids, asks]);

  const maxVolume = Math.max(
    ...chartData.buyLevels.map(l => l.volume),
    ...chartData.sellLevels.map(l => l.volume),
    1
  );

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-white">Market Depth</h3>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider font-bold">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-400">Bids</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-gray-400">Asks</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative flex items-end gap-1 min-h-[200px]">
        {/* Buy Side */}
        <div className="flex-1 h-full flex items-end justify-end gap-[2px]">
          {chartData.buyLevels.reverse().map((level, i) => (
            <div 
              key={`bid-${i}`}
              className="flex-1 bg-green-500/20 border-t border-green-500/50 hover:bg-green-500/40 transition-all cursor-crosshair group relative"
              style={{ height: `${(level.volume / maxVolume) * 100}%` }}
            >
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-20">
                <div className="bg-slate-800 text-white text-[10px] p-2 rounded border border-white/10 shadow-xl whitespace-nowrap">
                  <div>Price: {level.price}</div>
                  <div>Volume: {level.volume.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sell Side */}
        <div className="flex-1 h-full flex items-end justify-start gap-[2px]">
          {chartData.sellLevels.map((level, i) => (
            <div 
              key={`ask-${i}`}
              className="flex-1 bg-red-500/20 border-t border-red-500/50 hover:bg-red-500/40 transition-all cursor-crosshair group relative"
              style={{ height: `${(level.volume / maxVolume) * 100}%` }}
            >
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-20">
                <div className="bg-slate-800 text-white text-[10px] p-2 rounded border border-white/10 shadow-xl whitespace-nowrap">
                  <div>Price: {level.price}</div>
                  <div>Volume: {level.volume.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price labels */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-gray-500 pt-2 border-t border-white/5">
          <span>{chartData.buyLevels[0]?.price.toFixed(2)}</span>
          <span className="text-white font-bold">Price</span>
          <span>{chartData.sellLevels[chartData.sellLevels.length - 1]?.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
