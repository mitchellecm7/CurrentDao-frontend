import React from 'react';
import { usePortfolioManagement } from '../hooks/usePortfolioManagement';
import { DrawdownAnalysisComponent } from '../components/portfolio/DrawdownAnalysis';
import { DrawdownBenchmarkComparison } from '../components/portfolio/DrawdownBenchmarkComparison';

export default function DrawdownAnalysisPage() {
  const { portfolio, analytics, isLoading } = usePortfolioManagement('default-portfolio');

  if (isLoading || !portfolio || !analytics || !analytics.drawdownAnalysis) {
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
      <header className="max-w-7xl mx-auto mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded border border-red-500/20">
            Risk Analysis
          </div>
          <h1 className="text-4xl font-black tracking-tight">Portfolio Drawdown Analysis</h1>
        </div>
        <p className="text-gray-500 text-sm font-medium">
          Track portfolio drawdowns and recovery periods to understand risk exposure
        </p>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <DrawdownAnalysisComponent 
          drawdownAnalysis={analytics.drawdownAnalysis} 
          portfolioValue={portfolio.totalValue}
        />
        
        <DrawdownBenchmarkComparison 
          drawdownAnalysis={analytics.drawdownAnalysis}
        />
      </main>
    </div>
  );
}
