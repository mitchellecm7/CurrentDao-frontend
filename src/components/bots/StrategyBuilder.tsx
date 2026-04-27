import React, { useState } from 'react';

export const StrategyBuilder: React.FC = () => {
  const [nodes, setNodes] = useState([
    { id: '1', type: 'indicator', name: 'RSI (14)', pos: { x: 100, y: 100 } },
    { id: '2', type: 'condition', name: 'Crosses Above 70', pos: { x: 350, y: 100 } },
    { id: '3', type: 'action', name: 'Sell Order', pos: { x: 600, y: 100 } },
  ]);

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden h-full flex flex-col shadow-2xl">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
        <div>
          <h2 className="text-xl font-black text-white">Visual Strategy Builder</h2>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1">Drag and drop nodes to build automation</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Save Draft</button>
          <button className="px-6 py-2 bg-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all">Deploy Strategy</button>
        </div>
      </div>

      <div className="flex-1 relative bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]">
        {/* Simplified Node Interface */}
        <div className="absolute inset-0 p-10">
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path d="M 230 135 L 350 135" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeDasharray="4,4" />
            <path d="M 480 135 L 600 135" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeDasharray="4,4" />
          </svg>

          {nodes.map(node => (
            <div 
              key={node.id}
              className="absolute bg-slate-800 border border-white/10 rounded-2xl p-5 w-44 shadow-xl hover:border-blue-500/50 transition-all cursor-grab active:cursor-grabbing group"
              style={{ left: node.pos.x, top: node.pos.y }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  node.type === 'indicator' ? 'bg-amber-500/10 text-amber-400' :
                  node.type === 'condition' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {node.type === 'indicator' ? '📊' : node.type === 'condition' ? '⚖️' : '⚡'}
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-white">×</button>
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{node.type}</div>
              <div className="text-sm font-bold text-white">{node.name}</div>
              <div className="mt-4 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-700" />
                <div className="w-2 h-2 rounded-full bg-slate-700" />
              </div>
            </div>
          ))}

          {/* Sidebar Tools */}
          <div className="absolute top-10 right-10 w-64 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Components</h3>
            <div className="space-y-3">
              {['Indicators', 'Conditions', 'Actions', 'Risk Guards'].map(tool => (
                <div key={tool} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 cursor-pointer group">
                  <span className="text-xs font-bold text-gray-300">{tool}</span>
                  <span className="text-lg opacity-30 group-hover:opacity-100 transition-opacity">+</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
