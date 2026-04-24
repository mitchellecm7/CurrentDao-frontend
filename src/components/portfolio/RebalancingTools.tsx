import React from 'react';

interface RebalancingToolsProps {
  suggestions: any[];
}

export const RebalancingTools: React.FC<RebalancingToolsProps> = ({ suggestions }) => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8">
      <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-8">Rebalancing Tools</h3>

      {suggestions.length > 0 ? (
        <div className="space-y-4">
          {suggestions.map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center group hover:border-white/20 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                    s.action === 'buy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {s.action}
                  </span>
                  <span className="text-xs font-bold text-white capitalize">{s.assetType}</span>
                </div>
                <div className="text-lg font-black text-white">${s.amount.toLocaleString()}</div>
              </div>
              <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-black">
                →
              </button>
            </div>
          ))}
          
          <button className="w-full py-4 mt-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all transform active:scale-95">
            Execute Rebalance
          </button>
        </div>
      ) : (
        <div className="py-10 text-center">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Portfolio is Balanced</p>
          <p className="text-[10px] text-gray-600 mt-2">All assets are within 2% of target allocation.</p>
        </div>
      )}
    </div>
  );
};
