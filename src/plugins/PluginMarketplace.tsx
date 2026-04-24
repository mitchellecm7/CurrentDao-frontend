import React, { useState } from 'react';

interface PluginCard {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviews: number;
  author: string;
  category: string;
  icon: string;
}

const mockPlugins: PluginCard[] = [
  {
    id: 'trading-bot-pro',
    name: 'Trading Bot Pro',
    description: 'Advanced automated trading strategies with AI-powered market analysis.',
    rating: 4.8,
    reviews: 1240,
    author: 'Quantum Labs',
    category: 'Trading',
    icon: '🤖',
  },
  {
    id: 'weather-alpha',
    name: 'Weather Alpha',
    description: 'Hyper-local weather forecasting for energy production optimization.',
    rating: 4.9,
    reviews: 850,
    author: 'GeoMetrics',
    category: 'Analytics',
    icon: '🌤️',
  },
  {
    id: 'security-shield',
    name: 'Security Shield',
    description: 'Enhanced transaction security and real-time fraud detection.',
    rating: 4.7,
    reviews: 2100,
    author: 'SafeNet',
    category: 'Security',
    icon: '🛡️',
  },
  {
    id: 'energy-viz',
    name: 'EnergyViz',
    description: 'Beautiful 3D visualizations of regional energy flows and demand.',
    rating: 4.6,
    reviews: 450,
    author: 'DataFlow',
    category: 'UI/UX',
    icon: '📊',
  },
];

const PluginMarketplace: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Trading', 'Analytics', 'Security', 'UI/UX'];

  const filteredPlugins = mockPlugins.filter(p => 
    (activeCategory === 'All' || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-12">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 bg-indigo-600/10 blur-[100px] rounded-full" />
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Plugin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Marketplace</span>
          </h1>
          <p className="text-slate-400 text-lg mt-4 leading-relaxed">
            Discover, install, and manage powerful extensions to customize your CurrentDao experience.
          </p>
          
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search plugins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
              <span className="absolute right-4 top-3.5 text-slate-500">🔍</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPlugins.map((plugin) => (
          <div
            key={plugin.id}
            className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:translate-y-[-4px]"
          >
            <div className="p-6 flex-1">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-3xl mb-4 border border-white/5 shadow-inner">
                {plugin.icon}
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                {plugin.name}
              </h3>
              <p className="text-slate-500 text-xs font-medium mb-3">by {plugin.author}</p>
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                {plugin.description}
              </p>
            </div>
            
            <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-amber-400 text-sm">★</span>
                <span className="text-white text-sm font-bold">{plugin.rating}</span>
                <span className="text-slate-500 text-xs font-medium">({plugin.reviews})</span>
              </div>
              <button className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
                Install
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PluginMarketplace;
