import React, { useState, useEffect } from 'react';
import { Leaf, TreePine, Globe, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface CarbonData {
  date: string;
  emissions: number;
  target: number;
  reduction: number;
}

interface CarbonSource {
  source: string;
  percentage: number;
  emissions: number;
  color: string;
}

interface ReductionStrategy {
  strategy: string;
  impact: 'high' | 'medium' | 'low';
  savings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeline: string;
}

export const CarbonTracker: React.FC = () => {
  const [carbonData, setCarbonData] = useState<CarbonData[]>([]);
  const [carbonSources, setCarbonSources] = useState<CarbonSource[]>([]);
  const [reductionStrategies, setReductionStrategies] = useState<ReductionStrategy[]>([]);
  const [totalEmissions, setTotalEmissions] = useState(0);
  const [reductionPercentage, setReductionPercentage] = useState(0);
  const [treesEquivalent, setTreesEquivalent] = useState(0);

  useEffect(() => {
    const mockCarbonData: CarbonData[] = [
      { date: 'Jan', emissions: 2.8, target: 2.5, reduction: 0.3 },
      { date: 'Feb', emissions: 2.6, target: 2.5, reduction: 0.5 },
      { date: 'Mar', emissions: 2.4, target: 2.5, reduction: 0.7 },
      { date: 'Apr', emissions: 2.2, target: 2.5, reduction: 0.9 },
      { date: 'May', emissions: 2.1, target: 2.5, reduction: 1.0 },
      { date: 'Jun', emissions: 2.0, target: 2.5, reduction: 1.1 },
    ];

    const mockCarbonSources: CarbonSource[] = [
      { source: 'Electricity', percentage: 45, emissions: 1.2, color: '#3B82F6' },
      { source: 'Natural Gas', percentage: 30, emissions: 0.8, color: '#EF4444' },
      { source: 'Transportation', percentage: 15, emissions: 0.4, color: '#F59E0B' },
      { source: 'Waste', percentage: 10, emissions: 0.3, color: '#8B5CF6' },
    ];

    const mockReductionStrategies: ReductionStrategy[] = [
      { strategy: 'Switch to Renewable Energy', impact: 'high', savings: 0.8, difficulty: 'medium', timeline: '3-6 months' },
      { strategy: 'Improve Home Insulation', impact: 'medium', savings: 0.3, difficulty: 'easy', timeline: '1-2 weeks' },
      { strategy: 'Install Solar Panels', impact: 'high', savings: 1.2, difficulty: 'hard', timeline: '2-3 months' },
      { strategy: 'Energy-Efficient Appliances', impact: 'medium', savings: 0.4, difficulty: 'easy', timeline: '1 month' },
      { strategy: 'Reduce Transportation Emissions', impact: 'medium', savings: 0.5, difficulty: 'easy', timeline: 'Immediate' },
    ];

    setCarbonData(mockCarbonData);
    setCarbonSources(mockCarbonSources);
    setReductionStrategies(mockReductionStrategies);
    setTotalEmissions(2.0);
    setReductionPercentage(28);
    setTreesEquivalent(12);
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="energy-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Leaf className="w-6 h-6 text-green-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Carbon Tracker</h2>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Monthly Reduction</span>
          <div className="flex items-center">
            <span className="text-sm font-medium text-green-600">{reductionPercentage}%</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8" />
              <div className="text-right">
                <p className="text-2xl font-bold">{totalEmissions}</p>
                <p className="text-xs opacity-80">Tons CO₂/Month</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <TreePine className="w-8 h-8" />
              <div className="text-right">
                <p className="text-2xl font-bold">{treesEquivalent}</p>
                <p className="text-xs opacity-80">Trees Equivalent</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <AlertCircle className="w-8 h-8" />
              <div className="text-right">
                <p className="text-2xl font-bold">{reductionPercentage}%</p>
                <p className="text-xs opacity-80">Reduction</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emissions Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={carbonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="emissions" stroke="#EF4444" fill="#FEE2E2" name="Actual Emissions" />
            <Area type="monotone" dataKey="target" stroke="#10B981" fill="#D1FAE5" name="Target" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Carbon Sources</h3>
        <div className="space-y-3">
          {carbonSources.map((source, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: source.color }}
                ></div>
                <span className="font-medium text-gray-900">{source.source}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{source.emissions} tons CO₂</span>
                <span className="text-sm font-medium text-gray-900">{source.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reduction Strategies</h3>
        <div className="space-y-3">
          {reductionStrategies.map((strategy, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{strategy.strategy}</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(strategy.impact)}`}>
                    {strategy.impact} impact
                  </span>
                  <span className={`text-xs font-medium ${getDifficultyColor(strategy.difficulty)}`}>
                    {strategy.difficulty}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Timeline: {strategy.timeline}</span>
                <span className="font-medium text-green-600">Save {strategy.savings} tons CO₂/year</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Environmental Impact</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-green-800 font-medium">Annual CO₂ Reduction</p>
            <p className="text-green-600">{(totalEmissions * reductionPercentage / 100 * 12).toFixed(1)} tons</p>
          </div>
          <div>
            <p className="text-green-800 font-medium">Trees Saved Equivalent</p>
            <p className="text-green-600">{Math.round(treesEquivalent * 12)} trees</p>
          </div>
        </div>
      </div>
    </div>
  );
};
