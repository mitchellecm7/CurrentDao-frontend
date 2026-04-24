import React from 'react';

const DataValidation: React.FC = () => {
  const events = [
    { time: '22:57:10', type: 'Consensus', msg: 'Median price for XLM updated to $0.1245', status: 'success' },
    { time: '22:56:45', type: 'Outlier', msg: 'Switchboard provider value rejected (delta > 5%)', status: 'warning' },
    { time: '22:55:30', type: 'Sync', msg: 'Weather data synced across 5 nodes', status: 'success' },
    { time: '22:54:12', type: 'Failover', msg: 'Band Protocol primary node down, switching to backup', status: 'error' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl h-full flex flex-col">
      <div className="p-6 border-b border-slate-800 bg-slate-800/20">
        <h2 className="text-xl font-bold text-white">Validation Log</h2>
        <p className="text-slate-400 text-sm mt-1">Real-time consensus auditing</p>
      </div>

      <div className="p-6 space-y-4 flex-1">
        {events.map((event, i) => (
          <div key={i} className="flex gap-4 group">
            <div className="text-[10px] font-mono text-slate-500 pt-1 w-12 shrink-0">{event.time}</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${
                  event.status === 'success' ? 'bg-emerald-500' : 
                  event.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{event.type}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed group-hover:text-white transition-colors">{event.msg}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-800/20 border-t border-slate-800">
        <button className="w-full text-center text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors py-2">
          View Full Audit Trail
        </button>
      </div>
    </div>
  );
};

export default DataValidation;
