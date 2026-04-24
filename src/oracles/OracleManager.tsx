import React from 'react';
import PriceFeeds from './PriceFeeds';
import WeatherOracles from './WeatherOracles';
import ProviderNetwork from './ProviderNetwork';
import DataValidation from './DataValidation';

const OracleManager: React.FC = () => {
  return (
    <div className="p-8 space-y-12 max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
              Live Network
            </div>
            <span className="text-slate-500 text-sm font-medium italic">All systems operational</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Oracle <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Dashboard</span></h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Real-time data synchronization and validation across multiple oracle networks for price, weather, and energy demand metrics.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800 transition-all">
            Refresh All
          </button>
          <button className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20">
            Add Custom Oracle
          </button>
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Market Price Feeds</h2>
          <div className="flex gap-2">
             <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
             <span className="h-1.5 w-1.5 rounded-full bg-slate-800"></span>
             <span className="h-1.5 w-1.5 rounded-full bg-slate-800"></span>
          </div>
        </div>
        <PriceFeeds />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProviderNetwork />
        </div>
        <div>
          <DataValidation />
        </div>
      </div>

      <WeatherOracles />
    </div>
  );
};

export default OracleManager;
