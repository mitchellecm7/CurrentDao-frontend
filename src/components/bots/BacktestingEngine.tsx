import React from 'react';

interface BacktestingEngineProps {
  result: any;
  onRun: () => void;
}

export const BacktestingEngine: React.FC<BacktestingEngineProps> = ({ result, onRun }) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full flex flex-col shadow-2xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-xl font-black text-white">Backtesting Engine</h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Simulate strategies against historical energy market data</p>
        </div>
        <button 
          onClick={onRun}
          className="px-8 py-3 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-all transform active:scale-95 shadow-xl shadow-white/10"
        >
          Run Simulation
        </button>
      </div>

      {result ? (
        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Total PnL', value: `$${result.totalPnL.toFixed(2)}`, trend: result.totalPnL > 0 ? 'up' : 'down' },
              { label: 'ROI', value: `${((result.totalPnL / result.initialBalance) * 100).toFixed(2)}%`, trend: result.totalPnL > 0 ? 'up' : 'down' },
              { label: 'Max Drawdown', value: `${result.maxDrawdown.toFixed(2)}%`, trend: 'down' },
              { label: 'Trades Executed', value: result.trades.length, trend: 'stable' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{stat.label}</div>
                <div className={`text-2xl font-black ${stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-white'}`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent" />
            <div className="h-full w-full flex items-end gap-1">
              {[...Array(40)].map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/60 transition-colors cursor-crosshair group relative"
                  style={{ height: `${30 + Math.random() * 60}%` }}
                >
                   <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-20">
                    <div className="bg-slate-800 text-white text-[10px] p-2 rounded border border-white/10 shadow-xl">
                      Equity: ${(10000 + Math.random() * 2000).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Equity Curve</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl opacity-40">
          <div className="text-6xl mb-6">📉</div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No simulation data</p>
          <p className="text-xs text-gray-600 mt-2">Select a strategy and timeframe to begin backtesting</p>
        </div>
      )}
    </div>
  );
};
