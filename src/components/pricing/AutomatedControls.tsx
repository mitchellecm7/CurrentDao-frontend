import React from 'react';
import { Settings, Play, Pause, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AutomatedControlsProps {
  isAutomated: boolean;
  onToggle: () => void;
  performanceScore: number;
}

export const AutomatedControls: React.FC<AutomatedControlsProps> = ({ 
  isAutomated, 
  onToggle,
  performanceScore
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Automated Pricing Controls</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isAutomated ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {isAutomated ? 'Autonomous' : 'Manual'}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
          <div>
            <p className="font-medium text-gray-900">Dynamic Adjustment Engine</p>
            <p className="text-sm text-gray-500">Auto-adjusts price based on 50+ signals</p>
          </div>
          <button
            onClick={onToggle}
            className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 ${isAutomated ? 'bg-green-600' : 'bg-gray-300'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isAutomated ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-gray-100 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-gray-500 uppercase">Calculations</span>
            </div>
            <p className="text-xl font-bold text-gray-900">42ms</p>
            <p className="text-[10px] text-green-600">Within SLAs</p>
          </div>
          <div className="p-4 border border-gray-100 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-gray-500 uppercase">Boundaries</span>
            </div>
            <p className="text-xl font-bold text-gray-900">$0.08 - $0.20</p>
            <p className="text-[10px] text-gray-400">Fixed Range</p>
          </div>
        </div>

        <div className="p-4 bg-gray-900 rounded-xl text-white">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium opacity-70 uppercase tracking-widest">Optimization Health</span>
            <span className="text-xl font-bold text-green-400">{performanceScore}%</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-green-400 h-full rounded-full transition-all duration-1000" 
              style={{ width: `${performanceScore}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
