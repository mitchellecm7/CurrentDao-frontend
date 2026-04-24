import React, { useState, useEffect } from 'react';
import { Battery, Zap, TrendingDown, Leaf, AlertCircle, Settings } from 'lucide-react';
import { EnergyAdvisor } from './EnergyAdvisor';
import { UsageOptimization } from './UsageOptimization';
import { CostSavings } from './CostSavings';
import { CarbonTracker } from './CarbonTracker';
import { useAIAdvisor } from '../../hooks/useAIAdvisor';

interface DashboardMetrics {
  totalSavings: number;
  efficiencyScore: number;
  carbonReduction: number;
  activeRecommendations: number;
  monthlyTrend: number;
}

export const EnergyDashboard: React.FC = () => {
  const { recommendations, getTotalSavings, getEfficiencyScore } = useAIAdvisor();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSavings: 0,
    efficiencyScore: 0,
    carbonReduction: 0,
    activeRecommendations: 0,
    monthlyTrend: 0
  });

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics({
        totalSavings: getTotalSavings(),
        efficiencyScore: getEfficiencyScore(),
        carbonReduction: recommendations.filter(r => r.implemented).length * 0.05,
        activeRecommendations: recommendations.filter(r => !r.implemented).length,
        monthlyTrend: Math.random() * 20 - 10 // Mock trend data
      });
    };

    updateMetrics();
  }, [recommendations, getTotalSavings, getEfficiencyScore]);

  const getTrendColor = (trend: number) => {
    return trend >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? '↑' : '↓';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">CurrentDao</h1>
              </div>
              <span className="ml-3 px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                AI Energy Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-5 h-5" />
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Battery className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${metrics.totalSavings.toFixed(2)}
                </p>
                <p className={`text-sm ${getTrendColor(metrics.monthlyTrend)}`}>
                  {getTrendIcon(metrics.monthlyTrend)} {Math.abs(metrics.monthlyTrend).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Efficiency Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.efficiencyScore}%
                </p>
                <p className="text-sm text-green-600">Good</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-full">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CO₂ Reduced</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.carbonReduction.toFixed(2)} tons
                </p>
                <p className="text-sm text-emerald-600">This month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Tips</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.activeRecommendations}
                </p>
                <p className="text-sm text-yellow-600">To review</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Energy Saved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(metrics.totalSavings * 2.5).toFixed(0)} kWh
                </p>
                <p className="text-sm text-purple-600">Lifetime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Components Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EnergyAdvisor />
          <UsageOptimization />
          <CostSavings />
          <CarbonTracker />
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Run Full Analysis
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Generate Report
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Export Data
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Schedule Maintenance
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Update Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
