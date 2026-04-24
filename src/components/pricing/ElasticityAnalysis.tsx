import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { BarChart3, Info } from 'lucide-react';
import { PriceElasticity } from '@/types/pricing';

interface ElasticityAnalysisProps {
  data: PriceElasticity[];
  currentPrice: number;
}

export const ElasticityAnalysis: React.FC<ElasticityAnalysisProps> = ({ data, currentPrice }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Price Elasticity Analysis</h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <Info className="w-5 h-5" />
        </button>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="pricePoint" 
              label={{ value: 'Price ($)', position: 'insideBottomRight', offset: -5 }}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              label={{ value: 'Predicted Demand', angle: -90, position: 'insideLeft', offset: 15 }}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="predictedDemand" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorDemand)" 
            />
            <ReferenceLine x={currentPrice} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Current Price', fill: '#ef4444', fontSize: 12 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-xs font-medium text-blue-600 uppercase mb-1">Optimum Revenue Price</p>
          <p className="text-2xl font-bold text-gray-900">$0.11</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-xs font-medium text-green-600 uppercase mb-1">Price Sensitivty</p>
          <p className="text-2xl font-bold text-gray-900">Moderate</p>
        </div>
      </div>
    </div>
  );
};
