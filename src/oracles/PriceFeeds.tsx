import React from 'react';
import { useOracleNetwork } from '../hooks/useOracleNetwork';

const PriceFeeds: React.FC = () => {
  const assets = ['XLM', 'USDC', 'BTC', 'ETH', 'ENERGY_X'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {assets.map((asset) => (
        <PriceCard key={asset} symbol={asset} />
      ))}
    </div>
  );
};

const PriceCard: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { price, loading, providers } = useOracleNetwork(symbol);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-slate-400 text-sm tracking-wider uppercase">{symbol}</h3>
        <span className={`h-2 w-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-white">
          ${price?.toFixed(4) || '---'}
        </span>
        <span className="text-emerald-500 text-xs font-bold">+1.2%</span>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span>Provider</span>
          <span>Status</span>
        </div>
        {providers.slice(0, 3).map((p) => (
          <div key={p.providerId} className="flex justify-between items-center text-xs">
            <span className="text-slate-300 capitalize">{p.providerId}</span>
            <span className={p.isOutlier ? 'text-rose-500' : 'text-emerald-500'}>
              {p.isOutlier ? 'Outlier' : 'Active'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceFeeds;
