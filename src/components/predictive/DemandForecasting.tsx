/**
 * Demand Forecasting Component for CurrentDao Predictive Analytics
 * Interactive visualization and analysis of demand forecasts with multiple models
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  DemandForecast,
  DemandModelType,
  DemandFactors,
  TimeSeriesData,
  ModelMetrics
} from '../../types/predictive/analytics';

// Chart components (simplified for this example)
const LineChart: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <p className="text-gray-500">Chart visualization would go here</p>
    </div>
  </div>
);

const BarChart: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <p className="text-gray-500">Bar chart visualization would go here</p>
    </div>
  </div>
);

interface DemandForecastingProps {
  location?: string;
  horizon?: number;
  models?: DemandModelType[];
  onForecastUpdate?: (forecasts: DemandForecast[]) => void;
}

export const DemandForecasting: React.FC<DemandForecastingProps> = ({
  location = 'default',
  horizon = 30,
  models = ['arima', 'lstm', 'random_forest', 'ensemble'],
  onForecastUpdate
}) => {
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<DemandModelType>('ensemble');
  const [selectedHorizon, setSelectedHorizon] = useState(horizon);
  const [showConfidence, setShowConfidence] = useState(true);
  const [showFactors, setShowFactors] = useState(false);
  const [modelMetrics, setModelMetrics] = useState<Record<DemandModelType, ModelMetrics>>({} as any);

  // Mock data generation for demonstration
  const generateMockForecasts = useCallback(async (
    model: DemandModelType,
    days: number
  ): Promise<DemandForecast[]> => {
    const forecasts: DemandForecast[] = [];
    const baseDemand = 1000;
    
    for (let i = 1; i <= days; i++) {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() + i);
      
      // Generate model-specific patterns
      let predictedDemand = baseDemand;
      const confidence = 0.95;
      
      switch (model) {
        case 'arima':
          predictedDemand += Math.sin(i / 7) * 100 + (Math.random() - 0.5) * 50;
          break;
        case 'lstm':
          predictedDemand += Math.sin(i / 14) * 150 + (Math.random() - 0.5) * 30;
          break;
        case 'random_forest':
          predictedDemand += Math.sin(i / 10) * 120 + (Math.random() - 0.5) * 40;
          break;
        case 'ensemble':
          // Average of other models
          const arima = baseDemand + Math.sin(i / 7) * 100;
          const lstm = baseDemand + Math.sin(i / 14) * 150;
          const rf = baseDemand + Math.sin(i / 10) * 120;
          predictedDemand = (arima + lstm + rf) / 3 + (Math.random() - 0.5) * 20;
          break;
      }
      
      // Calculate confidence bounds
      const margin = predictedDemand * 0.1; // 10% confidence interval
      
      forecasts.push({
        timestamp,
        demand: 0, // Will be filled with actual value when available
        predictedDemand,
        confidence,
        upperBound: predictedDemand + margin,
        lowerBound: predictedDemand - margin,
        factors: generateMockFactors(),
        model
      });
    }
    
    return forecasts;
  }, []);

  const generateMockFactors = (): DemandFactors => ({
    weather: {
      temperature: 20 + Math.random() * 15,
      humidity: 60 + Math.random() * 20,
      precipitation: Math.random() * 10,
      windSpeed: 5 + Math.random() * 10,
      impact: (Math.random() - 0.5) * 0.2,
      confidence: 0.8 + Math.random() * 0.2
    },
    economic: {
      gdpGrowth: 0.02 + (Math.random() - 0.5) * 0.01,
      inflation: 0.03 + (Math.random() - 0.5) * 0.01,
      unemployment: 0.05 + (Math.random() - 0.5) * 0.02,
      energyPrices: 0.1 + (Math.random() - 0.5) * 0.05,
      impact: (Math.random() - 0.5) * 0.15,
      confidence: 0.7 + Math.random() * 0.3
    },
    seasonal: {
      seasonality: Math.sin(new Date().getDay() / 7 * Math.PI * 2) * 0.1,
      trend: 0.01,
      holiday: 0,
      weekly: new Date().getDay() === 0 || new Date().getDay() === 6 ? -0.05 : 0.02,
      confidence: 0.9
    },
    historical: {
      dayOfWeek: new Date().getDay(),
      monthOfYear: new Date().getMonth(),
      yearOverYear: 0.03,
      movingAverage: 1000,
      volatility: 0.1,
      confidence: 0.8
    },
    external: {
      events: [],
      disruptions: [],
      policy: [],
      impact: (Math.random() - 0.5) * 0.1,
      confidence: 0.6
    }
  });

  const generateMockMetrics = (model: DemandModelType): ModelMetrics => ({
    mae: 50 + Math.random() * 30,
    mse: 3000 + Math.random() * 2000,
    rmse: 55 + Math.random() * 20,
    mape: 0.05 + Math.random() * 0.03,
    r2: 0.85 + Math.random() * 0.1,
    accuracy: 85 + Math.random() * 10
  });

  // Load forecasts
  const loadForecasts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newForecasts = await generateMockForecasts(selectedModel, selectedHorizon);
      setForecasts(newForecasts);
      
      // Generate metrics for all models
      const metrics: Record<DemandModelType, ModelMetrics> = {} as any;
      for (const model of models) {
        metrics[model] = generateMockMetrics(model);
      }
      setModelMetrics(metrics);
      
      onForecastUpdate?.(newForecasts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forecasts');
    } finally {
      setLoading(false);
    }
  }, [selectedModel, selectedHorizon, generateMockForecasts, models, onForecastUpdate]);

  useEffect(() => {
    loadForecasts();
  }, [loadForecasts]);

  // Prepare chart data
  const forecastChartData = useMemo(() => {
    return forecasts.map(forecast => ({
      timestamp: forecast.timestamp,
      predicted: forecast.predictedDemand,
      upperBound: forecast.upperBound,
      lowerBound: forecast.lowerBound,
      model: forecast.model
    }));
  }, [forecasts]);

  const factorsChartData = useMemo(() => {
    if (!showFactors || forecasts.length === 0) return [];
    
    return forecasts.slice(0, 7).map(forecast => ({
      timestamp: forecast.timestamp,
      weather: forecast.factors.weather.impact * 100,
      economic: forecast.factors.economic.impact * 100,
      seasonal: forecast.factors.seasonal.seasonality * 100,
      external: forecast.factors.external.impact * 100
    }));
  }, [forecasts, showFactors]);

  const metricsChartData = useMemo(() => {
    return models.map(model => ({
      model,
      accuracy: modelMetrics[model]?.accuracy || 0,
      mae: modelMetrics[model]?.mae || 0,
      rmse: modelMetrics[model]?.rmse || 0,
      r2: modelMetrics[model]?.r2 || 0
    }));
  }, [models, modelMetrics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Demand Forecasting</h2>
        <p className="text-gray-600">
          Advanced demand forecasting with multiple ML models and external factor integration
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as DemandModelType)}
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
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showConfidence}
                onChange={(e) => setShowConfidence(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show Confidence</span>
            </label>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showFactors}
                onChange={(e) => setShowFactors(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show Factors</span>
            </label>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={loadForecasts}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Forecasts'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Main Forecast Chart */}
      <LineChart
        data={forecastChartData}
        title={`Demand Forecast - ${selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)} Model`}
      />

      {/* Factor Impact Chart */}
      {showFactors && (
        <BarChart
          data={factorsChartData}
          title="External Factor Impact on Demand"
        />
      )}

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
                  MAE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RMSE
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
                    {modelMetrics[model]?.mae?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {modelMetrics[model]?.rmse?.toFixed(2)}
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

      {/* Forecast Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Forecast Details</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {forecasts.slice(0, 10).map((forecast, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {forecast.timestamp.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {forecast.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    {forecast.predictedDemand.toFixed(0)} MWh
                  </p>
                  <p className="text-sm text-gray-500">
                    {forecast.confidence * 100}% confidence
                  </p>
                </div>
              </div>
              
              {showConfidence && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Lower Bound: {forecast.lowerBound.toFixed(0)} MWh</span>
                    <span>Upper Bound: {forecast.upperBound.toFixed(0)} MWh</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${((forecast.predictedDemand - forecast.lowerBound) / (forecast.upperBound - forecast.lowerBound)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-2 text-xs text-gray-500">
                Model: {forecast.model}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* External Factors Summary */}
      {forecasts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">External Factors Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(forecasts[0].factors).map(([key, factor]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 capitalize mb-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Impact: {(factor.impact * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Confidence: {(factor.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandForecasting;
