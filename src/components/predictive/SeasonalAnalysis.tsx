/**
 * Seasonal Analysis Component for CurrentDao Predictive Analytics
 * Interactive visualization and analysis of seasonal patterns and decomposition
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SeasonalPattern,
  SeasonalDecomposition,
  SeasonalForecast,
  TimeSeriesData
} from '../../types/predictive/analytics';

// Chart components (simplified for this example)
const LineChart: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <p className="text-gray-500">Seasonal analysis chart would go here</p>
    </div>
  </div>
);

const StackedAreaChart: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <p className="text-gray-500">Decomposition chart would go here</p>
    </div>
  </div>
);

const RadarChart: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <p className="text-gray-500">Pattern strength radar would go here</p>
    </div>
  </div>
);

interface SeasonalAnalysisProps {
  location?: string;
  periods?: number[];
  significance?: number;
  confidence?: number;
  onAnalysisUpdate?: (analysis: any) => void;
}

export const SeasonalAnalysis: React.FC<SeasonalAnalysisProps> = ({
  location = 'default',
  periods = [7, 30, 365],
  significance = 0.05,
  confidence = 0.95,
  onAnalysisUpdate
}) => {
  const [patterns, setPatterns] = useState<SeasonalPattern[]>([]);
  const [decomposition, setDecomposition] = useState<SeasonalDecomposition | null>(null);
  const [forecasts, setForecasts] = useState<SeasonalForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [showDecomposition, setShowDecomposition] = useState(true);
  const [showForecasts, setShowForecasts] = useState(true);
  const [showSignificance, setShowSignificance] = useState(true);

  // Mock data generation for demonstration
  const generateMockPatterns = useCallback(async (periods: number[]): Promise<SeasonalPattern[]> => {
    const mockPatterns: SeasonalPattern[] = [];
    
    periods.forEach(period => {
      const periodType = classifyPeriod(period);
      const strength = 0.3 + Math.random() * 0.6;
      const phase = Math.random() * Math.PI * 2;
      
      // Generate pattern values
      const pattern: number[] = [];
      for (let i = 0; i < period; i++) {
        const value = Math.sin((i / period) * Math.PI * 2 + phase) * strength * 100;
        pattern.push(value);
      }
      
      mockPatterns.push({
        period: periodType,
        strength,
        phase,
        confidence: 0.8 + Math.random() * 0.2,
        significance: Math.random() * 0.1,
        pattern
      });
    });
    
    return mockPatterns.sort((a, b) => b.strength - a.strength);
  }, []);

  const classifyPeriod = (period: number): 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' => {
    if (period < 2) return 'daily';
    if (period < 8) return 'weekly';
    if (period < 32) return 'monthly';
    if (period < 92) return 'quarterly';
    return 'yearly';
  };

  const generateMockDecomposition = useCallback(async (period: number): Promise<SeasonalDecomposition> => {
    const data: TimeSeriesData[] = [];
    const days = 365;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      // Generate realistic seasonal decomposition
      const trend = 1000 + i * 0.5; // Linear trend
      const seasonal = Math.sin((i / period) * Math.PI * 2) * 200;
      const residual = (Math.random() - 0.5) * 50;
      const value = trend + seasonal + residual;
      
      data.push({ timestamp: date, value });
    }
    
    // Extract components
    const trendComponent = data.map((d, i) => ({
      timestamp: d.timestamp,
      value: 1000 + i * 0.5
    }));
    
    const seasonalComponent = data.map((d, i) => ({
      timestamp: d.timestamp,
      value: Math.sin((i / period) * Math.PI * 2) * 200
    }));
    
    const residualComponent = data.map((d, i) => ({
      timestamp: d.timestamp,
      value: (Math.random() - 0.5) * 50
    }));
    
    return {
      trend: trendComponent,
      seasonal: seasonalComponent,
      residual: residualComponent,
      original: data,
      strength: {
        trend: 0.7,
        seasonal: 0.8
      },
      confidence: 0.9
    };
  }, []);

  const generateMockForecasts = useCallback(async (
    decomposition: SeasonalDecomposition,
    horizon: number
  ): Promise<SeasonalForecast[]> => {
    const forecasts: SeasonalForecast[] = [];
    
    for (let i = 1; i <= horizon; i++) {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() + i);
      
      // Forecast components
      const lastTrend = decomposition.trend[decomposition.trend.length - 1].value;
      const trendComponent = lastTrend + i * 0.5;
      
      const seasonalPattern = decomposition.seasonal.slice(0, 30).map(s => s.value);
      const seasonalComponent = seasonalPattern[i % seasonalPattern.length];
      
      const forecast = trendComponent + seasonalComponent;
      
      // Calculate confidence bounds
      const residualVariance = decomposition.residual.reduce((sum, r) => 
        sum + Math.pow(r.value, 0), 0) / decomposition.residual.length;
      const margin = Math.sqrt(residualVariance) * Math.sqrt(i) * 1.96;
      
      forecasts.push({
        timestamp,
        seasonalComponent,
        trendComponent,
        residualComponent: 0,
        forecast,
        confidence,
        pattern: {
          period: 'daily',
          strength: decomposition.strength.seasonal,
          phase: 0,
          confidence: decomposition.confidence,
          significance: 0.05,
          pattern: seasonalPattern
        }
      });
    }
    
    return forecasts;
  }, [confidence]);

  // Load analysis
  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load patterns
      const newPatterns = await generateMockPatterns(periods);
      setPatterns(newPatterns);
      
      // Load decomposition
      const newDecomposition = await generateMockDecomposition(selectedPeriod);
      setDecomposition(newDecomposition);
      
      // Load forecasts
      const newForecasts = await generateMockForecasts(newDecomposition, 30);
      setForecasts(newForecasts);
      
      const analysis = {
        patterns: newPatterns,
        decomposition: newDecomposition,
        forecasts: newForecasts
      };
      
      onAnalysisUpdate?.(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load seasonal analysis');
    } finally {
      setLoading(false);
    }
  }, [periods, selectedPeriod, generateMockPatterns, generateMockDecomposition, generateMockForecasts, onAnalysisUpdate]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  // Prepare chart data
  const patternsChartData = useMemo(() => {
    return patterns.map(pattern => ({
      period: pattern.period,
      strength: pattern.strength * 100,
      confidence: pattern.confidence * 100,
      significance: pattern.significance * 100,
      pattern: pattern.pattern
    }));
  }, [patterns]);

  const decompositionChartData = useMemo(() => {
    if (!decomposition) return [];
    
    return decomposition.original.map((original, i) => ({
      timestamp: original.timestamp,
      original: original.value,
      trend: decomposition.trend[i]?.value || 0,
      seasonal: decomposition.seasonal[i]?.value || 0,
      residual: decomposition.residual[i]?.value || 0
    }));
  }, [decomposition]);

  const forecastsChartData = useMemo(() => {
    return forecasts.map(forecast => ({
      timestamp: forecast.timestamp,
      forecast: forecast.forecast,
      trend: forecast.trendComponent,
      seasonal: forecast.seasonalComponent,
      upperBound: forecast.forecast + 50, // Simplified confidence bounds
      lowerBound: forecast.forecast - 50
    }));
  }, [forecasts]);

  const strengthRadarData = useMemo(() => {
    if (!decomposition) return [];
    
    return [
      { axis: 'Trend', value: decomposition.strength.trend * 100 },
      { axis: 'Seasonal', value: decomposition.strength.seasonal * 100 },
      { axis: 'Daily', value: patterns.find(p => p.period === 'daily')?.strength * 100 || 0 },
      { axis: 'Weekly', value: patterns.find(p => p.period === 'weekly')?.strength * 100 || 0 },
      { axis: 'Monthly', value: patterns.find(p => p.period === 'monthly')?.strength * 100 || 0 },
      { axis: 'Yearly', value: patterns.find(p => p.period === 'yearly')?.strength * 100 || 0 }
    ];
  }, [decomposition, patterns]);

  const significantPatterns = useMemo(() => {
    return patterns.filter(p => p.significance < significance);
  }, [patterns, significance]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seasonal Analysis</h2>
        <p className="text-gray-600">
          Advanced seasonal pattern detection, decomposition, and forecasting with statistical significance testing
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analysis Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>7 Days (Weekly)</option>
              <option value={30}>30 Days (Monthly)</option>
              <option value={90}>90 Days (Quarterly)</option>
              <option value={365}>365 Days (Yearly)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Significance Level
            </label>
            <select
              value={significance}
              onChange={(e) => setShowSignificance(true)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0.01}>1% (Very Strict)</option>
              <option value={0.05}>5% (Standard)</option>
              <option value={0.1}>10% (Lenient)</option>
            </select>
          </div>
          
          <div className="flex items-end space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showDecomposition}
                onChange={(e) => setShowDecomposition(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Decomposition</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showForecasts}
                onChange={(e) => setShowForecasts(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Forecasts</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showSignificance}
                onChange={(e) => setShowSignificance(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Significance</span>
            </label>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={loadAnalysis}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Refresh Analysis'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Seasonal Patterns */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Detected Seasonal Patterns</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Pattern Strength</h4>
            <div className="space-y-2">
              {patterns.map((pattern, index) => (
                <div key={index} className="flex justify-between items-center p-2 border border-gray-200 rounded">
                  <div>
                    <p className="font-medium capitalize">{pattern.period}</p>
                    <p className="text-sm text-gray-500">
                      Strength: {(pattern.strength * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Confidence: {(pattern.confidence * 100).toFixed(0)}%
                    </p>
                    {showSignificance && (
                      <p className={`text-sm ${
                        pattern.significance < significance ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {pattern.significance < significance ? 'Significant' : 'Not Significant'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Pattern Visualization</h4>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">Pattern visualization would go here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decomposition */}
      {showDecomposition && decomposition && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Seasonal Decomposition</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StackedAreaChart
              data={decompositionChartData}
              title="Time Series Decomposition"
            />
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Component Strength</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 border border-gray-200 rounded">
                  <span>Trend Strength</span>
                  <span className="font-medium">{(decomposition.strength.trend * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-2 border border-gray-200 rounded">
                  <span>Seasonal Strength</span>
                  <span className="font-medium">{(decomposition.strength.seasonal * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-2 border border-gray-200 rounded">
                  <span>Overall Confidence</span>
                  <span className="font-medium">{(decomposition.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <RadarChart
                data={strengthRadarData}
                title="Pattern Strength Radar"
              />
            </div>
          </div>
        </div>
      )}

      {/* Forecasts */}
      {showForecasts && forecasts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Seasonal Forecasts</h3>
          <LineChart
            data={forecastsChartData}
            title="Seasonal Forecast with Confidence Bounds"
          />
          
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Forecast Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Average Forecast</p>
                <p className="text-xl font-bold">
                  {(forecasts.reduce((sum, f) => sum + f.forecast, 0) / forecasts.length).toFixed(0)} MWh
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Seasonal Contribution</p>
                <p className="text-xl font-bold">
                  {(forecasts.reduce((sum, f) => sum + f.seasonalComponent, 0) / forecasts.length).toFixed(0)} MWh
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Trend Contribution</p>
                <p className="text-xl font-bold">
                  {(forecasts.reduce((sum, f) => sum + f.trendComponent, 0) / forecasts.length).toFixed(0)} MWh
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistical Significance */}
      {showSignificance && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Statistical Significance Analysis</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Significant Patterns (p &lt; {significance})</h4>
              {significantPatterns.length > 0 ? (
                <div className="space-y-2">
                  {significantPatterns.map((pattern, index) => (
                    <div key={index} className="p-3 border border-green-200 bg-green-50 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium capitalize">{pattern.period}</p>
                          <p className="text-sm text-gray-600">
                            p-value: {pattern.significance.toFixed(4)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Strength: {(pattern.strength * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            Statistically Significant
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No statistically significant patterns detected at the current significance level.</p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Non-Significant Patterns</h4>
              {patterns.filter(p => p.significance >= significance).length > 0 ? (
                <div className="space-y-2">
                  {patterns.filter(p => p.significance >= significance).map((pattern, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium capitalize">{pattern.period}</p>
                          <p className="text-sm text-gray-600">
                            p-value: {pattern.significance.toFixed(4)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Strength: {(pattern.strength * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-red-600 font-medium">
                            Not Significant
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">All detected patterns are statistically significant.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analysis */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Analysis Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Patterns</p>
                <p className="text-xl font-bold">{patterns.length}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Significant Patterns</p>
                <p className="text-xl font-bold">{significantPatterns.length}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Strongest Pattern</p>
                <p className="text-xl font-bold capitalize">
                  {patterns.length > 0 ? patterns[0].period : 'N/A'}
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Analysis Period</p>
                <p className="text-xl font-bold">{selectedPeriod} days</p>
              </div>
            </div>
          </div>
          
          {decomposition && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Decomposition Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Trend Strength</p>
                  <p className="text-xl font-bold">{(decomposition.strength.trend * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">
                    {decomposition.strength.trend > 0.7 ? 'Strong' : 
                     decomposition.strength.trend > 0.4 ? 'Moderate' : 'Weak'}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Seasonal Strength</p>
                  <p className="text-xl font-bold">{(decomposition.strength.seasonal * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">
                    {decomposition.strength.seasonal > 0.7 ? 'Strong' : 
                     decomposition.strength.seasonal > 0.4 ? 'Moderate' : 'Weak'}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Model Confidence</p>
                  <p className="text-xl font-bold">{(decomposition.confidence * 100).toFixed(0)}%</p>
                  <p className="text-xs text-gray-500">
                    {decomposition.confidence > 0.9 ? 'Excellent' : 
                     decomposition.confidence > 0.8 ? 'Good' : 'Fair'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeasonalAnalysis;
