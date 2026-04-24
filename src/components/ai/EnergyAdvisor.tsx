import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAIAdvisor } from '../../hooks/useAIAdvisor';
import { getRecommendationEngine } from '../../services/ai/recommendation-engine';

interface Recommendation {
  id: string;
  type: 'optimization' | 'maintenance' | 'behavioral';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  implemented: boolean;
}

export const EnergyAdvisor: React.FC = () => {
  const { recommendations, loading, error, implementRecommendation } = useAIAdvisor();
  const [efficiencyScore, setEfficiencyScore] = useState(75);

  useEffect(() => {
    const recommendationEngine = getRecommendationEngine();
    recommendationEngine.initialize();
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

  if (loading) {
    return (
      <div className="energy-card">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="energy-card">
        <div className="flex items-center text-red-600">
          <AlertTriangle className="mr-2" />
          <span>Error loading recommendations: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="energy-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">AI Energy Advisor</h2>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Efficiency Score</span>
          <div className="flex items-center">
            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
              <div 
                className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                style={{ width: `${efficiencyScore}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">{efficiencyScore}%</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8" />
              <div className="text-right">
                <p className="text-2xl font-bold">{recommendations.length}</p>
                <p className="text-xs opacity-80">Active Recommendations</p>
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8" />
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${recommendations.reduce((sum, rec) => sum + rec.savings, 0).toFixed(0)}
                </p>
                <p className="text-xs opacity-80">Potential Savings</p>
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8" />
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {recommendations.filter(rec => rec.type === 'maintenance').length}
                </p>
                <p className="text-xs opacity-80">Maintenance Alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h3>
        {recommendations.slice(0, 5).map((recommendation) => (
          <div key={recommendation.id} className={`recommendation-item ${recommendation.implemented ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(recommendation.impact)}`}>
                    {recommendation.impact} impact
                  </span>
                  <span className={`ml-2 text-xs font-medium ${getDifficultyColor(recommendation.difficulty)}`}>
                    {recommendation.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">
                    ${recommendation.savings.toFixed(2)} potential savings
                  </span>
                  {recommendation.implemented ? (
                    <span className="text-sm text-green-600 font-medium">
                      ✓ Implemented
                    </span>
                  ) : (
                    <button
                      onClick={() => implementRecommendation(recommendation.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Implement
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            View All Recommendations ({recommendations.length})
          </button>
        </div>
      )}
    </div>
  );
};
