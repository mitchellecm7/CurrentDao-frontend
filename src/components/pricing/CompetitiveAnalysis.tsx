import React from 'react';
import { Globe, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { CompetitorPrice } from '@/types/pricing';

interface CompetitiveAnalysisProps {
  competitors: CompetitorPrice[];
}

export const CompetitiveAnalysis: React.FC<CompetitiveAnalysisProps> = ({ competitors }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Competitive Landscape</h3>
        </div>
        <span className="text-xs text-gray-500">Updated 2m ago</span>
      </div>

      <div className="space-y-4">
        {competitors.map((competitor) => (
          <div key={competitor.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">{competitor.competitorName}</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Market Leader</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-gray-900">${competitor.price.toFixed(2)}</span>
                <span className="text-[10px] text-gray-400 italic">per kWh</span>
              </div>
              
              <div className={`p-2 rounded-full ${
                competitor.trend === 'up' ? 'bg-red-50 text-red-600' : 
                competitor.trend === 'down' ? 'bg-green-50 text-green-600' : 
                'bg-gray-50 text-gray-400'
              }`}>
                {competitor.trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
                {competitor.trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
                {competitor.trend === 'stable' && <Minus className="w-4 h-4" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Market Average</span>
          <span className="font-bold text-gray-900">$0.124</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-2">
          <span className="text-gray-500">Our Position</span>
          <span className="font-bold text-green-600">-3.2% vs Avg</span>
        </div>
      </div>
    </div>
  );
};
