import React from 'react';

interface RiskAssessmentProps {
  assessment: any;
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({ assessment }) => {
  if (!assessment) return null;

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8">
      <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-8 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        Risk Exposure
      </h3>

      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Value at Risk (VaR)</span>
            <span className="text-xl font-black text-white">${assessment.var.toLocaleString()}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 w-[65%]" />
          </div>
          <p className="text-[10px] text-gray-500 mt-2 italic">95% confidence 1-day maximum potential loss</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Concentration</div>
            <div className="text-xl font-black text-white">{assessment.concentrationScore.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">CVaR</div>
            <div className="text-xl font-black text-white">${assessment.cvar.toLocaleString()}</div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Stress Scenarios</div>
          <div className="space-y-3">
            {Object.entries(assessment.stressTests).map(([scenario, impact]: [string, any]) => (
              <div key={scenario} className="flex justify-between items-center group cursor-help">
                <span className="text-xs text-gray-400 capitalize">{scenario.replace('_', ' ')}</span>
                <span className="text-xs font-bold text-rose-400">-${Math.abs(impact).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        
        <button className="w-full py-4 mt-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
          Run Full Stress Test
        </button>
      </div>
    </div>
  );
};
