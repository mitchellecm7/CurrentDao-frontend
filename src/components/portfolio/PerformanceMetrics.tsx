import React from 'react';
import { PerformanceMetrics as MetricsType } from '../../types/portfolio';

interface PerformanceMetricsProps {
  metrics: MetricsType;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  const stats = [
    { label: 'Win Rate', value: `${metrics.winRate.toFixed(1)}%`, sub: `${metrics.winningTrades} of ${metrics.totalTrades} trades` },
    { label: 'Profit Factor', value: metrics.profitFactor.toFixed(2), sub: 'Gross Profit / Gross Loss' },
    { label: 'Max Drawdown', value: `${metrics.maxDrawdown.toFixed(2)}%`, sub: 'Peak-to-trough decline' },
    { label: 'Avg Win', value: `$${metrics.averageWin.toFixed(0)}`, sub: 'Average profitable trade' },
    { label: 'Avg Loss', value: `$${metrics.averageLoss.toFixed(0)}`, sub: 'Average losing trade' },
    { label: 'Sharpe', value: metrics.sharpeRatio.toFixed(2), sub: 'Risk-adjusted return' },
  ];

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400">Advanced Analytics</h3>
        <div className="flex gap-2">
          {['1D', '1W', '1M', '1Y', 'ALL'].map(p => (
            <button key={p} className={`text-[10px] font-bold px-2 py-1 rounded ${p === 'ALL' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-white'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-8">
        {stats.map((stat, i) => (
          <div key={i} className="relative">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
            <div className="text-[10px] text-gray-600 font-medium">{stat.sub}</div>
            {i % 3 !== 2 && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-white/5 hidden md:block" />}
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-white/5">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Trading Efficiency</div>
            <div className="flex items-center gap-1">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-full h-8 rounded-sm ${i < 8 ? 'bg-blue-500/40' : 'bg-slate-800'}`}
                  style={{ height: `${20 + Math.random() * 60}%` }}
                />
              ))}
            </div>
          </div>
          <button className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};
