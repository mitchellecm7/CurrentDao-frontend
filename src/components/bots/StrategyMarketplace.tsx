import React from 'react';
import { TradingStrategy } from '../../types/bots';

interface StrategyMarketplaceProps {
  strategies: TradingStrategy[];
}

export const StrategyMarketplace: React.FC<StrategyMarketplaceProps> = ({ strategies }) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-xl font-black text-white">Strategy Marketplace</h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Discover and clone top-performing energy algorithms</p>
        </div>
        <div className="flex gap-2">
           {['Trending', 'Most Used', 'High Yield'].map(f => (
             <button key={f} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all">
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto space-y-4 pr-2 custom-scrollbar">
        {strategies.map(strat => (
          <div key={strat.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors mb-1">{strat.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 max-w-xs">{strat.description}</p>
              </div>
              <div className="text-right">
                <div className="text-amber-400 text-xs font-black">★ {strat.rating}</div>
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">{strat.usageCount} CLONES</div>
              </div>
            </div>

            <div className="flex justify-between items-end mt-6">
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-widest rounded border border-blue-500/20">
                  {strat.type}
                </span>
                <span className="px-2 py-1 bg-white/5 text-gray-500 text-[9px] font-bold uppercase tracking-widest rounded border border-white/5">
                  BY {strat.author}
                </span>
              </div>
              <button className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:scale-105 transition-transform active:scale-95">
                Clone
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-8 border-t border-white/5">
         <div className="bg-gradient-to-r from-indigo-600/20 to-blue-600/20 border border-blue-500/20 rounded-2xl p-6">
            <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-2">Publish Your Algorithm</h4>
            <p className="text-xs text-gray-400 mb-4">Earn DAO tokens when other traders use your strategy.</p>
            <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300">GET STARTED →</button>
         </div>
      </div>
    </div>
  );
};
