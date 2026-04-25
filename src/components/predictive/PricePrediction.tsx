/**
 * Price Prediction Component for CurrentDao Predictive Analytics
 * Interactive visualization and analysis of price predictions with external factor integration
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PricePrediction,
  PriceModelType,
  PriceFactors,
  PriceFactorType,
  ModelMetrics
} from '../../types/predictive/analytics';

// Chart components (simplified for this example)
const LineChart: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <p className="text-gray-500">Price prediction chart would go here</p>
    </div>
  </div>
);

const HeatmapChart: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <p className="text-gray-500">Factor correlation heatmap would go here</p>
    </div>
  </div>
);

interface PricePredictionProps {
  location?: string;
  horizon?: number;
  models?: PriceModelType[];
  factors?: PriceFactorType[];
  onPredictionUpdate?: (predictions: PricePrediction[]) => void;
}

export const PricePrediction: React.FC<PricePredictionProps> = ({
  location = 'default',
  horizon = 30,
  models = ['arima', 'lstm', 'random_forest', 'neural_network', 'ensemble'],
  factors = ['demand', 'supply', 'weather', 'economic', 'market_sentiment', 'policy', 'seasonal', 'competition'],
  onPredictionUpdate
}) => {
  const [predictions, setPredictions] = useState<PricePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<PriceModelType>('ensemble');
  const [selectedHorizon, setSelectedHorizon] = useState(horizon);
  const [showVolatility, setShowVolatility] = useState(true);
  const [showFactors, setShowFactors] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [factorWeights, setFactorWeights] = useState<Record<PriceFactorType, number>>({} as any);
  const [modelMetrics, setModelMetrics] = useState<Record<PriceModelType, ModelMetrics>>({} as any);

  // Initialize factor weights
  useEffect(() => {
    const defaultWeights: Record<PriceFactorType, number> = {
      demand: 0.25,
      supply: 0.20,
      weather: 0.15,
      economic: 0.15,
      market_sentiment: 0.10,
      policy: 0.05,
      seasonal: 0.05,
      competition: 0.05
    };
    setFactorWeights(defaultWeights);
  }, []);

  // Mock data generation for demonstration
  const generateMockPredictions = useCallback(async (
    model: PriceModelType,
    days: number,
    factorWeights: Record<PriceFactorType, number>
  ): Promise<PricePrediction[]> => {
    const predictions: PricePrediction[] = [];
    const basePrice = 0.15; // $0.15 per kWh
    
    for (let i = 1; i <= days; i++) {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() + i);
      
      // Generate model-specific patterns
      let predictedPrice = basePrice;
      const confidence = 0.95;
      
      switch (model) {
        case 'arima':
          predictedPrice += Math.sin(i / 7) * 0.02 + (Math.random() - 0.5) * 0.01;
          break;
        case 'lstm':
          predictedPrice += Math.sin(i / 14) * 0.025 + (Math.random() - 0.5) * 0.008;
          break;
        case 'random_forest':
          predictedPrice += Math.sin(i / 10) * 0.022 + (Math.random() - 0.5) * 0.012;
          break;
        case 'neural_network':
          predictedPrice += Math.sin(i / 12) * 0.028 + (Math.random() - 0.5) * 0.006;
          break;
        case 'ensemble':
          // Weighted average of other models
          const arima = basePrice + Math.sin(i / 7) * 0.02;
          const lstm = basePrice + Math.sin(i / 14) * 0.025;
          const rf = basePrice + Math.sin(i / 10) * 0.022;
          const nn = basePrice + Math.sin(i / 12) * 0.028;
          predictedPrice = (arima * 0.3 + lstm * 0.3 + rf * 0.2 + nn * 0.2) + (Math.random() - 0.5) * 0.005;
          break;
      }
      
      // Apply factor weights
      const factorImpact = calculateFactorImpact(factorWeights, i);
      predictedPrice *= (1 + factorImpact);
      
      // Calculate volatility
      const volatility = calculateVolatility(model, i);
      
      // Calculate confidence bounds
      const margin = predictedPrice * volatility * 2; // 2-sigma confidence interval
      
      predictions.push({
        timestamp,
        price: 0, // Will be filled with actual price when available
        predictedPrice,
        confidence,
        upperBound: predictedPrice + margin,
        lowerBound: predictedPrice - margin,
        volatility,
        factors: generateMockFactors(factorWeights),
        model
      });
    }
    
    return predictions;
  }, []);

  const calculateFactorImpact = (weights: Record<PriceFactorType, number>, day: number): number => {
    let impact = 0;
    
    // Simulate factor impacts over time
    Object.entries(weights).forEach(([factor, weight]) => {
      let factorValue = 0;
      
      switch (factor) {
        case 'demand':
          factorValue = Math.sin(day / 7) * 0.1;
          break;
        case 'supply':
          factorValue = Math.cos(day / 10) * 0.08;
          break;
        case 'weather':
          factorValue = Math.sin(day / 5) * 0.05;
          break;
        case 'economic':
          factorValue = (Math.random() - 0.5) * 0.06;
          break;
        case 'market_sentiment':
          factorValue = Math.sin(day / 3) * 0.04;
          break;
        case 'policy':
          factorValue = (Math.random() - 0.5) * 0.03;
          break;
        case 'seasonal':
          factorValue = Math.sin(day / 30) * 0.02;
          break;
        case 'competition':
          factorValue = (Math.random() - 0.5) * 0.02;
          break;
      }
      
      impact += factorValue * weight;
    });
    
    return impact;
  };

  const calculateVolatility = (model: PriceModelType, day: number): number => {
    const baseVolatility = 0.02; // 2% base volatility
    
    switch (model) {
      case 'arima':
        return baseVolatility * (1 + Math.sin(day / 14) * 0.5);
      case 'lstm':
        return baseVolatility * 0.8; // LSTM typically has lower volatility
      case 'random_forest':
        return baseVolatility * (1 + Math.cos(day / 10) * 0.3);
      case 'neural_network':
        return baseVolatility * 0.9;
      case 'ensemble':
        return baseVolatility * 0.7; // Ensemble reduces volatility
      default:
        return baseVolatility;
    }
  };

  const generateMockFactors = (weights: Record<PriceFactorType, number>): PriceFactors => {
    return {
      demand: Math.random() * 0.2 - 0.1,
      supply: Math.random() * 0.15 - 0.075,
      weather: Math.random() * 0.1 - 0.05,
      economic: Math.random() * 0.12 - 0.06,
      marketSentiment: Math.random() * 0.08 - 0.04,
      policy: Math.random() * 0.05 - 0.025,
      seasonal: Math.sin(new Date().getDay() / 7 * Math.PI * 2) * 0.03,
      competition: Math.random() * 0.04 - 0.02,
      weights
    };
  };

  const generateMockMetrics = (model: PriceModelType): ModelMetrics => ({
    mae: 0.005 + Math.random() * 0.003,
    mse: 0.00004 + Math.random() * 0.00002,
    rmse: 0.006 + Math.random() * 0.004,
    mape: 0.03 + Math.random() * 0.02,
    r2: 0.88 + Math.random() * 0.08,
    accuracy: 88 + Math.random() * 8
  });

  // Load predictions
  const loadPredictions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newPredictions = await generateMockPredictions(selectedModel, selectedHorizon, factorWeights);
      setPredictions(newPredictions);
      
      // Generate metrics for all models
      const metrics: Record<PriceModelType, ModelMetrics> = {} as any;
      for (const model of models) {
        metrics[model] = generateMockMetrics(model);
      }
      setModelMetrics(metrics);
      
      onPredictionUpdate?.(newPredictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load predictions');
    } finally {
      setLoading(false);
    }
  }, [selectedModel, selectedHorizon, factorWeights, generateMockPredictions, models, onPredictionUpdate]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  // Handle factor weight changes
  const handleFactorWeightChange = (factor: PriceFactorType, weight: number) => {
    setFactorWeights(prev => {
      const newWeights = { ...prev, [factor]: weight };
      
      // Normalize weights to sum to 1
      const total = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
      if (total !== 1) {
        Object.keys(newWeights).forEach(key => {
          newWeights[key as PriceFactorType] /= total;
        });
      }
      
      return newWeights;
    });
  };

  // Prepare chart data
  const predictionChartData = useMemo(() => {
    return predictions.map(prediction => ({
      timestamp: prediction.timestamp,
      predicted: prediction.predictedPrice,
      upperBound: prediction.upperBound,
      lowerBound: prediction.lowerBound,
      volatility: prediction.volatility,
      model: prediction.model
    }));
  }, [predictions]);

  const factorsChartData = useMemo(() => {
    if (!showFactors || predictions.length === 0) return [];
    
    return predictions.slice(0, 7).map(prediction => ({
      timestamp: prediction.timestamp,
      demand: prediction.factors.demand * 100,
      supply: prediction.factors.supply * 100,
      weather: prediction.factors.weather * 100,
      economic: prediction.factors.economic * 100,
      marketSentiment: prediction.factors.marketSentiment * 100,
      policy: prediction.factors.policy * 100,
      seasonal: prediction.factors.seasonal * 100,
      competition: prediction.factors.competition * 100
    }));
  }, [predictions, showFactors]);

  const volatilityChartData = useMemo(() => {
    return predictions.map(prediction => ({
      timestamp: prediction.timestamp,
      volatility: prediction.volatility * 100,
      price: prediction.predictedPrice
    }));
  }, [predictions]);

  const correlationData = useMemo(() => {
    return factors.map(factor => ({
      factor,
      weight: factorWeights[factor] * 100,
      impact: predictions.length > 0 ? predictions[0].factors[factor] * 100 : 0
    }));
  }, [factors, factorWeights, predictions]);

  const metricsChartData = useMemo(() => {
    return models.map(model => ({
      model,
      accuracy: modelMetrics[model]?.accuracy || 0,
      mae: (modelMetrics[model]?.mae || 0) * 100,
      rmse: (modelMetrics[model]?.rmse || 0) * 100,
      r2: modelMetrics[model]?.r2 || 0
    }));
  }, [models, modelMetrics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Price Prediction</h2>
        <p className="text-gray-600">
          Advanced price prediction with external factor integration and volatility modeling
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as PriceModelType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {models.map(model => (
                <option key={model} value={model}>
                  {model.charAt(0).toUpperCase() + model.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forecast Horizon
            </label>
            <select
              value={selectedHorizon}
              onChange={(e) => setSelectedHorizon(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
              <option value={90}>90 Days</option>
            </select>
          </div>
          
          <div className="flex items-end space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showVolatility}
                onChange={(e) => setShowVolatility(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Volatility</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showFactors}
                onChange={(e) => setShowFactors(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Factors</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showConfidence}
                onChange={(e) => setShowConfidence(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Confidence</span>
            </label>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={loadPredictions}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Predictions'}
          </button>
        </div>
      </div>

      {/* Factor Weights */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Factor Weights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {factors.map(factor => (
            <div key={factor} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {factor.replace(/_/g, ' ')}
                </label>
                <span className="text-sm text-gray-500">
                  {(factorWeights[factor] * 100).toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={factorWeights[factor]}
                onChange={(e) => handleFactorWeightChange(factor, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Main Prediction Chart */}
      <LineChart
        data={predictionChartData}
        title={`Price Prediction - ${selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)} Model`}
      />

      {/* Volatility Chart */}
      {showVolatility && (
        <LineChart
          data={volatilityChartData}
          title="Price Volatility Analysis"
        />
      )}

      {/* Factor Impact Chart */}
      {showFactors && (
        <BarChart
          data={factorsChartData}
          title="External Factor Impact on Prices"
        />
      )}

      {/* Factor Correlation Heatmap */}
      <HeatmapChart
        data={correlationData}
        title="Factor Correlation Matrix"
      />

      {/* Model Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Model Performance Metrics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accuracy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MAE (cents)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RMSE (cents)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  R²
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {models.map(model => (
                <tr key={model}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {model.charAt(0).toUpperCase() + model.slice(1).replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {modelMetrics[model]?.accuracy?.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(modelMetrics[model]?.mae * 100)?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(modelMetrics[model]?.rmse * 100)?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {modelMetrics[model]?.r2?.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prediction Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Prediction Details</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {predictions.slice(0, 10).map((prediction, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {prediction.timestamp.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {prediction.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    ${prediction.predictedPrice.toFixed(3)}/kWh
                  </p>
                  <p className="text-sm text-gray-500">
                    {prediction.confidence * 100}% confidence
                  </p>
                </div>
              </div>
              
              {showVolatility && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Volatility: {(prediction.volatility * 100).toFixed(2)}%</span>
                    <span>Risk: {prediction.volatility > 0.03 ? 'High' : prediction.volatility > 0.02 ? 'Medium' : 'Low'}</span>
                  </div>
                </div>
              )}
              
              {showConfidence && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Lower: ${prediction.lowerBound.toFixed(3)}</span>
                    <span>Upper: ${prediction.upperBound.toFixed(3)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${((prediction.predictedPrice - prediction.lowerBound) / (prediction.upperBound - prediction.lowerBound)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-2 text-xs text-gray-500">
                Model: {prediction.model}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Factor Analysis Summary */}
      {predictions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Factor Analysis Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(predictions[0].factors).map(([key, value]) => {
              if (key === 'weights') return null;
              return (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 capitalize mb-2">
                    {key.replace(/_/g, ' ')}
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Impact: {(value * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      Weight: {(factorWeights[key as PriceFactorType] * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      Contribution: {((value * factorWeights[key as PriceFactorType]) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricePrediction;
