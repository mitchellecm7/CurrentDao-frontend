import React from 'react';

const ProviderNetwork: React.FC = () => {
  const providers = [
    { name: 'Chainlink', type: 'Decentralized', latency: '45ms', reliability: '99.99%', stake: '$1.2B' },
    { name: 'Pyth Network', type: 'Low Latency', latency: '12ms', reliability: '99.95%', stake: '$450M' },
    { name: 'Band Protocol', type: 'Cross-chain', latency: '120ms', reliability: '99.90%', stake: '$85M' },
    { name: 'Switchboard', type: 'Customizable', latency: '65ms', reliability: '99.85%', stake: '$12M' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 bg-slate-800/20">
        <h2 className="text-xl font-bold text-white">Oracle Provider Network</h2>
        <p className="text-slate-400 text-sm mt-1">Real-time status of connected data providers</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-800/30 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Provider</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Latency</th>
              <th className="px-6 py-4">Reliability</th>
              <th className="px-6 py-4 text-right">Stake</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {providers.map((p) => (
              <tr key={p.name} className="hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">
                      {p.name[0]}
                    </div>
                    <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{p.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{p.type}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-blue-400">{p.latency}</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-emerald-400">{p.reliability}</td>
                <td className="px-6 py-4 text-sm text-slate-200 text-right font-mono">{p.stake}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProviderNetwork;
