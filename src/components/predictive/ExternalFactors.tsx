/**
 * External Factors Component for CurrentDao Predictive Analytics
 * Interactive visualization and analysis of external factors impacting energy demand and prices
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ExternalFactor,
  ExternalFactorType,
  FactorCorrelation,
  DemandFactors,
  PriceFactors
} from '../../types/predictive/analytics';

// Chart components (simplified for this example)
const HeatmapChart: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <p className="text-gray-500">Correlation heatmap would go here</p>
    </div>
  </div>
);

const NetworkChart: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <p className="text-gray-500">Factor network visualization would go here</p>
    </div>
  </div>
);

const GaugeChart: React.FC<{ value: number; title: string; max: number }> = ({ value, title, max }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600">{value.toFixed(1)}%</div>
        <div className="text-sm text-gray-500">of {max}%</div>
      </div>
    </div>
  </div>
);

interface ExternalFactorsProps {
  location?: string;
  factors?: ExternalFactorType[];
  updateFrequency?: string;
  reliability?: number;
  onFactorsUpdate?: (factors: any) => void;
}

export const ExternalFactors: React.FC<ExternalFactorsProps> = ({
  location = 'default',
  factors = ['weather', 'economic', 'market', 'policy', 'social', 'environmental', 'technological'],
  updateFrequency = 'hourly',
  reliability = 0.8,
  onFactorsUpdate
}) => {
  const [externalFactors, setExternalFactors] = useState<ExternalFactor[]>([]);
  const [correlations, setCorrelations] = useState<FactorCorrelation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFactor, setSelectedFactor] = useState<ExternalFactorType | null>(null);
  const [showCorrelations, setShowCorrelations] = useState(true);
  const [showNetwork, setShowNetwork] = useState(true);
  const [showImpact, setShowImpact] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  // Mock data generation for demonstration
  const generateMockFactors = useCallback(async (
    factorTypes: ExternalFactorType[],
    location: string
  ): Promise<ExternalFactor[]> => {
    const mockFactors: ExternalFactor[] = [];
    
    factorTypes.forEach(factorType => {
      const factor: ExternalFactor = {
        id: `${factorType}_${location}`,
        name: getFactorName(factorType),
        type: factorType,
        source: getFactorSource(factorType),
        updateFrequency: getUpdateFrequency(factorType),
        reliability: 0.7 + Math.random() * 0.3,
        impact: (Math.random() - 0.5) * 0.4, // -20% to +20% impact
        data: generateMockData(factorType, 24) // 24 hours of data
      };
      
      mockFactors.push(factor);
    });
    
    return mockFactors;
  }, []);

  const getFactorName = (type: ExternalFactorType): string => {
    const names: Record<ExternalFactorType, string> = {
      weather: 'Weather Conditions',
      economic: 'Economic Indicators',
      market: 'Market Dynamics',
      policy: 'Policy Changes',
      social: 'Social Factors',
      environmental: 'Environmental Impact',
      technological: 'Technological Advances'
    };
    return names[type];
  };

  const getFactorSource = (type: ExternalFactorType): string => {
    const sources: Record<ExternalFactorType, string> = {
      weather: 'OpenWeatherMap API',
      economic: 'Federal Reserve Economic Data',
      market: 'Energy Market Exchanges',
      policy: 'Government APIs',
      social: 'Social Media Analytics',
      environmental: 'Environmental Protection Agency',
      technological: 'Technology Trend Databases'
    };
    return sources[type];
  };

  const getUpdateFrequency = (type: ExternalFactorType): string => {
    const frequencies: Record<ExternalFactorType, string> = {
      weather: 'hourly',
      economic: 'daily',
      market: 'real-time',
      policy: 'daily',
      social: 'hourly',
      environmental: 'daily',
      technological: 'weekly'
    };
    return frequencies[type];
  };

  const generateMockData = (type: ExternalFactorType, hours: number): any[] => {
    const data: any[] = [];
    const now = new Date();
    
    for (let i = 0; i < hours; i++) {
      const timestamp = new Date(now.getTime() - (hours - i) * 60 * 60 * 1000);
      let value = 0;
      let metadata = {};
      
      switch (type) {
        case 'weather':
          value = 15 + Math.sin(i / 12) * 10 + (Math.random() - 0.5) * 5;
          metadata = {
            temperature: value,
            humidity: 60 + Math.random() * 20,
            precipitation: Math.random() * 10,
            windSpeed: 5 + Math.random() * 10
          };
          break;
        case 'economic':
          value = 100 + Math.sin(i / 168) * 10 + (Math.random() - 0.5) * 5;
          metadata = {
            gdpGrowth: 0.02 + (Math.random() - 0.5) * 0.01,
            inflation: 0.03 + (Math.random() - 0.5) * 0.01,
            unemployment: 0.05 + (Math.random() - 0.5) * 0.02
          };
          break;
        case 'market':
          value = 0.12 + Math.sin(i / 24) * 0.02 + (Math.random() - 0.5) * 0.01;
          metadata = {
            electricityPrice: value,
            naturalGasPrice: 3.5 + (Math.random() - 0.5) * 1,
            crudeOilPrice: 80 + (Math.random() - 0.5) * 20
          };
          break;
        case 'policy':
          value = Math.random() > 0.8 ? 1 : 0; // Binary policy changes
          metadata = {
            policyType: value === 1 ? 'regulation' : 'status_quo',
            impact: value * 0.1
          };
          break;
        case 'social':
          value = 50 + Math.sin(i / 12) * 20 + (Math.random() - 0.5) * 10;
          metadata = {
            sentiment: value > 50 ? 'positive' : 'negative',
            socialMediaActivity: Math.random() * 100
          };
          break;
        case 'environmental':
          value = 100 + Math.sin(i / 168) * 20 + (Math.random() - 0.5) * 10;
          metadata = {
            airQuality: value,
            carbonEmissions: 400 + (Math.random() - 0.5) * 100,
            renewableEnergyShare: 0.3 + (Math.random() - 0.5) * 0.2
          };
          break;
        case 'technological':
          value = 80 + Math.sin(i / 720) * 10 + (Math.random() - 0.5) * 5;
          metadata = {
            innovationIndex: value,
            adoptionRate: 0.6 + (Math.random() - 0.5) * 0.3,
            efficiencyGains: value / 100
          };
          break;
      }
      
      data.push({
        timestamp,
        value,
        quality: 0.8 + Math.random() * 0.2,
        metadata
      });
    }
    
    return data;
  };

  const generateMockCorrelations = useCallback((factorTypes: ExternalFactorType[]): FactorCorrelation[] => {
    const correlations: FactorCorrelation[] = [];
    
    // Generate correlations between all factor pairs
    for (let i = 0; i < factorTypes.length; i++) {
      for (let j = i + 1; j < factorTypes.length; j++) {
        const factor1 = factorTypes[i];
        const factor2 = factorTypes[j];
        
        // Generate realistic correlation values
        let correlation = 0;
        let stability = Math.random();
        
        // Some factors are naturally correlated
        if ((factor1 === 'weather' && factor2 === 'environmental') ||
            (factor1 === 'economic' && factor2 === 'market') ||
            (factor1 === 'policy' && factor2 === 'economic')) {
          correlation = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
        } else if ((factor1 === 'weather' && factor2 === 'market') ||
                   (factor1 === 'social' && factor2 === 'market')) {
          correlation = -0.3 - Math.random() * 0.2; // -0.3 to -0.5
        } else {
          correlation = (Math.random() - 0.5) * 0.4; // -0.2 to 0.2
        }
        
        const significance = Math.random();
        const lag = Math.floor(Math.random() * 5); // 0 to 4 periods lag
        
        correlations.push({
          factor1: `${factor1}_${location}`,
          factor2: `${factor2}_${location}`,
          correlation,
          significance,
          lag,
          stability
        });
      }
    }
    
    return correlations;
  }, [location]);

  // Load factors
  const loadFactors = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load external factors
      const newFactors = await generateMockFactors(factors, location);
      setExternalFactors(newFactors);
      
      // Load correlations
      const newCorrelations = generateMockCorrelations(factors);
      setCorrelations(newCorrelations);
      
      const factorData = {
        factors: newFactors,
        correlations: newCorrelations
      };
      
      onFactorsUpdate?.(factorData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load external factors');
    } finally {
      setLoading(false);
    }
  }, [factors, location, generateMockFactors, generateMockCorrelations, onFactorsUpdate]);

  useEffect(() => {
    loadFactors();
  }, [loadFactors]);

  // Handle factor selection
  const handleFactorSelect = (factorType: ExternalFactorType) => {
    setSelectedFactor(factorType === selectedFactor ? null : factorType);
  };

  // Prepare chart data
  const correlationMatrixData = useMemo(() => {
    const matrix: any[] = [];
    
    correlations.forEach(correlation => {
      matrix.push({
        factor1: correlation.factor1,
        factor2: correlation.factor2,
        correlation: correlation.correlation,
        significance: correlation.significance,
        lag: correlation.lag,
        strength: Math.abs(correlation.correlation)
      });
    });
    
    return matrix;
  }, [correlations]);

  const networkData = useMemo(() => {
    const nodes = externalFactors.map(factor => ({
      id: factor.id,
      name: factor.name,
      type: factor.type,
      impact: factor.impact,
      reliability: factor.reliability
    }));
    
    const edges = correlations
      .filter(c => Math.abs(c.correlation) > 0.3) // Only show strong correlations
      .map(correlation => ({
        source: correlation.factor1,
        target: correlation.factor2,
        weight: Math.abs(correlation.correlation),
        type: correlation.correlation > 0 ? 'positive' : 'negative'
      }));
    
    return { nodes, edges };
  }, [externalFactors, correlations]);

  const impactData = useMemo(() => {
    return externalFactors.map(factor => ({
      name: factor.name,
      type: factor.type,
      impact: Math.abs(factor.impact) * 100,
      reliability: factor.reliability * 100,
      dataPoints: factor.data.length,
      lastUpdate: factor.data[factor.data.length - 1]?.timestamp || new Date()
    }));
  }, [externalFactors]);

  const selectedFactorData = useMemo(() => {
    if (!selectedFactor) return null;
    
    const factor = externalFactors.find(f => f.type === selectedFactor);
    if (!factor) return null;
    
    return {
      factor,
      correlations: correlations.filter(c => 
        c.factor1 === factor.id || c.factor2 === factor.id
      ),
      timeSeries: factor.data.map(d => ({
        timestamp: d.timestamp,
        value: d.value,
        quality: d.quality,
        metadata: d.metadata
      }))
    };
  }, [selectedFactor, externalFactors, correlations]);

  const reliabilityScore = useMemo(() => {
    if (externalFactors.length === 0) return 0;
    
    const avgReliability = externalFactors.reduce((sum, factor) => 
      sum + factor.reliability, 0) / externalFactors.length;
    
    return avgReliability * 100;
  }, [externalFactors]);

  const impactScore = useMemo(() => {
    if (externalFactors.length === 0) return 0;
    
    const avgImpact = externalFactors.reduce((sum, factor) => 
      sum + Math.abs(factor.impact), 0) / externalFactors.length;
    
    return avgImpact * 100;
  }, [externalFactors]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">External Factors Analysis</h2>
        <p className="text-gray-600">
          Comprehensive analysis of external factors impacting energy demand and prices with correlation analysis
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              value={location}
              onChange={(e) => {/* Handle location change */}}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">Default</option>
              <option value="new_york">New York</option>
              <option value="california">California</option>
              <option value="texas">Texas</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          
          <div className="flex items-end space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showCorrelations}
                onChange={(e) => setShowCorrelations(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Correlations</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showNetwork}
                onChange={(e) => setShowNetwork(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Network</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showImpact}
                onChange={(e) => setShowImpact(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Impact</span>
            </label>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={loadFactors}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Factors'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Factors</h3>
          <p className="text-2xl font-bold text-gray-900">{externalFactors.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Correlations</h3>
          <p className="text-2xl font-bold text-gray-900">{correlations.length}</p>
        </div>
        
        <GaugeChart
          value={reliabilityScore}
          title="Average Reliability"
          max={100}
        />
        
        <GaugeChart
          value={impactScore}
          title="Average Impact"
          max={50}
        />
      </div>

      {/* Factor Selection */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Factor Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {factors.map(factorType => {
            const factor = externalFactors.find(f => f.type === factorType);
            const isSelected = selectedFactor === factorType;
            
            return (
              <div
                key={factorType}
                onClick={() => handleFactorSelect(factorType)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">
                    {getFactorName(factorType)}
                  </h4>
                  {factor && (
                    <span className={`px-2 py-1 text-xs rounded ${
                      factor.impact > 0.1 
                        ? 'bg-red-100 text-red-700'
                        : factor.impact < -0.1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {factor.impact > 0.1 ? 'High Impact' : 
                       factor.impact < -0.1 ? 'Negative Impact' : 'Low Impact'}
                    </span>
                  )}
                </div>
                
                {factor && (
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Source: {factor.source}</p>
                    <p>Update: {factor.updateFrequency}</p>
                    <p>Reliability: {(factor.reliability * 100).toFixed(0)}%</p>
                    <p>Impact: {(factor.impact * 100).toFixed(1)}%</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Correlation Matrix */}
      {showCorrelations && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Factor Correlations</h3>
          <HeatmapChart
            data={correlationMatrixData}
            title="Correlation Strength Matrix"
          />
          
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Strongest Correlations</h4>
            <div className="space-y-2">
              {correlations
                .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
                .slice(0, 5)
                .map((correlation, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border border-gray-200 rounded">
                    <div>
                      <p className="font-medium">
                        {correlation.factor1.replace(`_${location}`, '')} ↔ {correlation.factor2.replace(`_${location}`, '')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Lag: {correlation.lag} periods
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        correlation.correlation > 0.5 ? 'text-green-600' :
                        correlation.correlation < -0.5 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {correlation.correlation.toFixed(3)}
                      </p>
                      <p className="text-sm text-gray-500">
                        p: {correlation.significance.toFixed(3)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Network Visualization */}
      {showNetwork && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Factor Network</h3>
          <NetworkChart
            data={networkData}
            title="Factor Correlation Network"
          />
        </div>
      )}

      {/* Impact Analysis */}
      {showImpact && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Impact Analysis</h3>
          <div className="space-y-4">
            {impactData
              .sort((a, b) => b.impact - a.impact)
              .map((factor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{factor.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{factor.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{factor.impact.toFixed(1)}%</p>
                      <p className="text-sm text-gray-500">Impact</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Reliability</p>
                      <p className="font-medium">{factor.reliability.toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Data Points</p>
                      <p className="font-medium">{factor.dataPoints}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Update</p>
                      <p className="font-medium">
                        {factor.lastUpdate.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Selected Factor Detail */}
      {selectedFactorData && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {selectedFactorData.factor.name} - Detailed Analysis
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Time Series Data</h4>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <p className="text-gray-500">Time series chart would go here</p>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Value</span>
                  <span className="font-medium">
                    {selectedFactorData.timeSeries[selectedFactorData.timeSeries.length - 1]?.value.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">24h Change</span>
                  <span className="font-medium">
                    {((selectedFactorData.timeSeries[selectedFactorData.timeSeries.length - 1]?.value || 0) -
                      (selectedFactorData.timeSeries[0]?.value || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Data Quality</span>
                  <span className="font-medium">
                    {(selectedFactorData.timeSeries.reduce((sum, d) => sum + d.quality, 0) / selectedFactorData.timeSeries.length * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Correlations with Other Factors</h4>
              <div className="space-y-2">
                {selectedFactorData.correlations
                  .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
                  .slice(0, 5)
                  .map((correlation, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border border-gray-200 rounded">
                      <div>
                        <p className="font-medium text-sm">
                          {correlation.factor1 === selectedFactorData.factor.id 
                            ? correlation.factor2.replace(`_${location}`, '')
                            : correlation.factor1.replace(`_${location}`, '')}
                        </p>
                        <p className="text-xs text-gray-500">
                          Lag: {correlation.lag} periods
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${
                          correlation.correlation > 0.3 ? 'text-green-600' :
                          correlation.correlation < -0.3 ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {correlation.correlation.toFixed(3)}
                        </p>
                        <p className="text-xs text-gray-500">
                          p: {correlation.significance.toFixed(3)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Active Factors</p>
            <p className="text-xl font-bold">{externalFactors.length}</p>
            <p className="text-xs text-gray-500">
              {externalFactors.filter(f => f.reliability > 0.8).length} high reliability
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Strong Correlations</p>
            <p className="text-xl font-bold">
              {correlations.filter(c => Math.abs(c.correlation) > 0.5).length}
            </p>
            <p className="text-xs text-gray-500">
              |correlation| > 0.5
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Significant Factors</p>
            <p className="text-xl font-bold">
              {correlations.filter(c => c.significance < 0.05).length}
            </p>
            <p className="text-xs text-gray-500">
              p < 0.05
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Update Frequency</p>
            <p className="text-xl font-bold capitalize">{updateFrequency}</p>
            <p className="text-xs text-gray-500">
              Average reliability
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalFactors;
