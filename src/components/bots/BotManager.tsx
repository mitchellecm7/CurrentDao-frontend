import React from 'react';
import { TradingBot } from '../../types/bots';

interface BotManagerProps {
  bots: TradingBot[];
  onStart: (id: string) => void;
  onStop: (id: string) => void;
}

export const BotManager: React.FC<BotManagerProps> = ({ bots, onStart, onStop }) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-xl font-black text-white">Bot Fleet</h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Monitoring active automation units</p>
        </div>
        <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
          <span className="text-sm">⚙️</span>
        </button>
      </div>

      <div className="space-y-6">
        {bots.map(bot => (
          <div key={bot.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 group hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                  🤖
                </div>
                <div>
                  <h3 className="text-sm font-black text-white mb-1">{bot.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${bot.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}></span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{bot.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => bot.status === 'active' ? onStop(bot.id) : onStart(bot.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    bot.status === 'active' ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white'
                  }`}
                >
                  {bot.status === 'active' ? 'Stop' : 'Launch'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total PnL</div>
                <div className="text-sm font-black text-green-400">+${bot.performance.totalPnL.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Win Rate</div>
                <div className="text-sm font-black text-white">{bot.performance.winRate}%</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Trades</div>
                <div className="text-sm font-black text-white">{bot.performance.tradesCount}</div>
              </div>
            </div>
            
            <div className="mt-6">
               <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Live Signals</div>
               <div className="bg-black/20 rounded-xl p-3 h-20 overflow-hidden font-mono text-[9px] text-blue-400/60 leading-relaxed">
                  [14:22:04] SIG: RSI_CROSS_UP_30 (0.24) <br/>
                  [14:22:05] EXEC: LIMIT_BUY (SOL-A @ 45.22) <br/>
                  [14:25:12] SIG: VOL_SPIKE_DETECTED (3.2x) <br/>
               </div>
            </div>
          </div>
        ))}
        
        <button className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white hover:border-white/30 transition-all">
          + Add New Bot
        </button>
      </div>
    </div>
  );
};
