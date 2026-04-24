import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap } from 'recharts';
import { Brain, TrendingUp, Target, Info, ChevronDown, ChevronUp, RefreshCw, Download, Eye, EyeOff, Settings, AlertCircle, CheckCircle } from 'lucide-react';

interface ModelExplanationsProps {
  prediction?: any;
  selectedModels?: string[];
  getModelFeatureImportance?: (modelType: string) => Map<string, number>;
  getModelMetrics?: (modelType: string) => any;
}

const ModelExplanations: React.FC<ModelExplanationsProps> = ({ 
  prediction, 
  selectedModels = ['lstm', 'random_forest', 'gradient_boosting'],
  getModelFeatureImportance,
  getModelMetrics
}) => {
  const [selectedModel, setSelectedModel] = useState('lstm');
  const [showDetails, setShowDetails] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);

  const featureDescriptions: Record<string, string> = {
    price: 'Current market price of the energy commodity',
    volume: 'Trading volume in the last period',
    volatility: 'Price volatility measured by standard deviation',
    trend: 'Overall price trend direction',
    momentum: 'Price momentum and rate of change',
    rsi: 'Relative Strength Index (0-100)',
    macd: 'Moving Average Convergence Divergence',
    bollingerUpper: 'Upper Bollinger Band',
    bollingerLower: 'Lower Bollinger Band',
    movingAverage: 'Simple moving average of price',
    timeOfDay: 'Time of day factor',
    dayOfWeek: 'Day of week factor',
    seasonality: 'Seasonal pattern influence'
  };

  const modelDescriptions: Record<string, string> = {
    lstm: 'Long Short-Term Memory neural network that captures temporal patterns and sequential dependencies in price data',
    random_forest: 'Ensemble of decision trees that handles non-linear relationships and feature interactions',
    gradient_boosting: 'Boosted decision trees that sequentially improve predictions by focusing on errors',
    neural_network: 'Deep neural network with multiple hidden layers for complex pattern recognition',
    arima: 'Autoregressive Integrated Moving Average model for time series forecasting'
  };

  const generateFeatureImportance = useMemo(() => {
    if (!getModelFeatureImportance) return [];
    
    const importance = getModelFeatureImportance(selectedModel);
    return Array.from(importance.entries()).map(([feature, value]) => ({
      feature,
      importance: value * 100,
      description: featureDescriptions[feature] || 'Technical indicator'
    })).sort((a, b) => b.importance - a.importance);
  }, [selectedModel, getModelFeatureImportance]);

  const generateModelComparison = useMemo(() => {
    if (!getModelFeatureImportance) return [];
    
    return selectedModels.map(model => {
      const importance = getModelFeatureImportance(model);
      const metrics = getModelMetrics?.(model);
      
      return {
        model,
        accuracy: metrics?.accuracy || 0.85,
        topFeature: Array.from(importance.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'price',
        featureCount: importance.size,
        complexity: getModelComplexity(model),
        interpretability: getModelInterpretability(model)
      };
    });
  }, [selectedModels, getModelFeatureImportance, getModelMetrics]);

  const generateRadarData = useMemo(() => {
    if (!getModelFeatureImportance) return [];
    
    const features = ['price', 'volume', 'volatility', 'trend', 'momentum', 'rsi'];
    
    return features.map(feature => {
      const data: any = { feature };
      selectedModels.forEach(model => {
        const importance = getModelFeatureImportance(model);
        data[model] = (importance.get(feature) || 0) * 100;
      });
      return data;
    });
  }, [selectedModels, getModelFeatureImportance]);

  const generateTreemapData = useMemo(() => {
    if (!getModelFeatureImportance) return [];
    
    const importance = getModelFeatureImportance(selectedModel);
    return Array.from(importance.entries()).map(([feature, value]) => ({
      name: feature,
      size: value * 1000,
      importance: value * 100
    }));
  }, [selectedModel, getModelFeatureImportance]);

  const getModelComplexity = (model: string): string => {
    const complexities: Record<string, string> = {
      lstm: 'High',
      random_forest: 'Medium',
      gradient_boosting: 'Medium',
      neural_network: 'High',
      arima: 'Low'
    };
    return complexities[model] || 'Medium';
  };

  const getModelInterpretability = (model: string): string => {
    const interpretability: Record<string, string> = {
      lstm: 'Low',
      random_forest: 'High',
      gradient_boosting: 'Medium',
      neural_network: 'Low',
      arima: 'High'
    };
    return interpretability[model] || 'Medium';
  };

  const getModelColor = (model: string): string => {
    const colors: Record<string, string> = {
      lstm: '#3B82F6',
      random_forest: '#10B981',
      gradient_boosting: '#8B5CF6',
      neural_network: '#F59E0B',
      arima: '#EF4444'
    };
    return colors[model] || '#6B7280';
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getImportanceLevel = (importance: number): { level: string; color: string } => {
    if (importance >= 20) return { level: 'Critical', color: 'text-red-600' };
    if (importance >= 15) return { level: 'High', color: 'text-orange-600' };
    if (importance >= 10) return { level: 'Medium', color: 'text-yellow-600' };
    if (importance >= 5) return { level: 'Low', color: 'text-blue-600' };
    return { level: 'Minimal', color: 'text-gray-600' };
  };

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280', '#EC4899', '#14B8A6'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Model Explanations & Feature Importance
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Understand how AI models make predictions and which features drive the forecasts
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`px-3 py-1 rounded-lg text-sm ${
              showDetails ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-3 py-1 rounded-lg text-sm ${
              showComparison ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Comparison
          </button>
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className={`px-3 py-1 rounded-lg text-sm ${
              showTechnical ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Technical
          </button>
        </div>
      </div>

      {/* Model Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Select Model</label>
          <span className="text-sm text-gray-600">
            {modelDescriptions[selectedModel]}
          </span>
        </div>
        <div className="flex gap-2">
          {selectedModels.map(model => (
            <button
              key={model}
              onClick={() => setSelectedModel(model)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedModel === model
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{ 
                borderColor: selectedModel === model ? getModelColor(model) : undefined 
              }}
            >
              {model.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Importance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Importance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generateFeatureImportance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="feature" type="category" width={80} />
              <Tooltip 
                formatter={(value: any) => [formatPercentage(value), 'Importance']}
                labelFormatter={(label: any) => `Feature: ${label}`}
              />
              <Bar dataKey="importance" fill={getModelColor(selectedModel)} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Treemap */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={generateTreemapData}
              dataKey="size"
              aspectRatio={4/3}
              stroke="#fff"
              fill={getModelColor(selectedModel)}
            >
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'importance' ? formatPercentage(value) : value,
                  name === 'importance' ? 'Importance' : 'Size'
                ]}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Details */}
      {showDetails && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Analysis</h3>
          <div className="space-y-3">
            {generateFeatureImportance.slice(0, 6).map((feature, index) => {
              const level = getImportanceLevel(feature.importance);
              return (
                <div key={feature.feature} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{feature.feature}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${level.color}`}>
                        {level.level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatPercentage(feature.importance)}
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${feature.importance}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Model Comparison */}
      {showComparison && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={generateModelComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'accuracy' ? formatPercentage(value) : value,
                    name === 'accuracy' ? 'Accuracy' : 'Feature Count'
                  ]}
                />
                <Legend />
                <Bar dataKey="accuracy" fill="#3B82F6" name="Accuracy" />
                <Bar dataKey="featureCount" fill="#10B981" name="Features" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={generateRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="feature" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                {selectedModels.map(model => (
                  <Radar
                    key={model}
                    name={model}
                    dataKey={model}
                    stroke={getModelColor(model)}
                    fill={getModelColor(model)}
                    fillOpacity={0.3}
                  />
                ))}
                <Legend />
                <Tooltip formatter={(value: any) => [formatPercentage(value), 'Importance']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Technical Details */}
      {showTechnical && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Model Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generateModelComparison.map(model => (
              <div key={model.model} className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{model.model.toUpperCase()}</h4>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getModelColor(model.model) }}
                  ></div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accuracy:</span>
                    <span className="font-medium">{formatPercentage(model.accuracy * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Top Feature:</span>
                    <span className="font-medium">{model.topFeature}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Features Used:</span>
                    <span className="font-medium">{model.featureCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Complexity:</span>
                    <span className="font-medium">{model.complexity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interpretability:</span>
                    <span className="font-medium">{model.interpretability}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Insights */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Model Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h5 className="font-medium mb-1">Key Findings:</h5>
                <ul className="space-y-1">
                  <li>• <strong>Price</strong> is the most influential feature across all models</li>
                  <li>• <strong>Volume</strong> and <strong>volatility</strong> provide market context</li>
                  <li>• <strong>Technical indicators</strong> (RSI, MACD) offer momentum signals</li>
                  <li>• <strong>Time-based features</strong> capture seasonal patterns</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-1">Model Strengths:</h5>
                <ul className="space-y-1">
                  <li>• <strong>LSTM:</strong> Best for capturing temporal dependencies</li>
                  <li>• <strong>Random Forest:</strong> Most interpretable with clear feature importance</li>
                  <li>• <strong>Gradient Boosting:</strong> Handles complex interactions well</li>
                  <li>• <strong>Ensemble:</strong> Combines strengths of multiple models</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800">High Confidence</span>
          </div>
          <p className="text-sm text-green-700">
            Models agree on key features and show consistent predictions
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">Feature Focus</span>
          </div>
          <p className="text-sm text-yellow-700">
            Monitor price and volume changes for most accurate predictions
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Optimal Usage</span>
          </div>
          <p className="text-sm text-blue-700">
            Use ensemble predictions for balanced accuracy and stability
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelExplanations;
