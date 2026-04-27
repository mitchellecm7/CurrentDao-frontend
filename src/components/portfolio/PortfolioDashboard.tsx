import React from 'react';
import { usePortfolioManagement } from '../../hooks/usePortfolioManagement';
import { PerformanceMetrics } from './PerformanceMetrics';
import { RiskAssessment } from './RiskAssessment';
import { RebalancingTools } from './RebalancingTools';

export const PortfolioDashboard: React.FC = () => {
  const { portfolio, analytics, riskAssessment, isLoading, rebalancingSuggestions } = usePortfolioManagement('default-portfolio');

  if (isLoading || !portfolio || !analytics) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-blue-500 font-bold text-xs">LOADING</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 lg:p-10 font-sans">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded border border-blue-500/20">
              Institutional
            </div>
            <h1 className="text-4xl font-black tracking-tight">{portfolio.name}</h1>
          </div>
          <p className="text-gray-500 text-sm font-medium">Last updated: {portfolio.updatedAt.toLocaleTimeString()}</p>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Valuation</div>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
            ${portfolio.totalValue.toLocaleString()}
          </div>
          <div className={`mt-2 font-bold flex items-center justify-end gap-2 ${portfolio.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <span>{portfolio.totalReturn >= 0 ? '▲' : '▼'} ${Math.abs(portfolio.totalReturn).toLocaleString()}</span>
            <span className="px-2 py-0.5 bg-current/10 rounded text-xs">({portfolio.returnPercentage}%)</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* Performance Overview */}
        <section className="col-span-12 lg:col-span-8 space-y-8">
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Annualized Return', value: `${analytics.metrics.annualizedReturn.toFixed(2)}%`, icon: '📈' },
              { label: 'Sharpe Ratio', value: analytics.metrics.sharpeRatio.toFixed(2), icon: '📊' },
              { label: 'Volatility', value: `${(analytics.metrics.volatility * 100).toFixed(2)}%`, icon: '📉' }
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all group">
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-2xl font-black text-white">{stat.value}</div>
              </div>
            ))}
          </div>
          
          <PerformanceMetrics metrics={analytics.metrics} />
          
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400">Asset Allocation</h3>
              <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300">DETAILS →</button>
            </div>
            <div className="p-8">
              <div className="flex h-3 rounded-full overflow-hidden bg-white/5 mb-8">
                {analytics.allocation.map((a, i) => (
                  <div 
                    key={i}
                    style={{ width: `${a.percentage}%` }}
                    className={`h-full ${
                      i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-emerald-500' : i === 2 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {analytics.allocation.map((a, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${
                        i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-emerald-500' : i === 2 ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{a.assetType}</span>
                    </div>
                    <div className="text-lg font-black">${a.value.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{a.percentage.toFixed(1)}% of total</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar: Risk & Rebalancing */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          <RiskAssessment assessment={riskAssessment} />
          <RebalancingTools suggestions={rebalancingSuggestions} />
        </aside>
      </main>
    </div>
  );
};
