import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Settings, Plus, Trash2, Save, Upload, Download, RefreshCw, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

interface CustomIndicator {
  id: string;
  name: string;
  type: 'simple' | 'exponential' | 'weighted' | 'custom';
  parameters: Record<string, number>;
  formula?: string;
  description: string;
  isActive: boolean;
  color: string;
}

interface IndicatorData {
  timestamp: Date;
  value: number;
  signal: 'buy' | 'sell' | 'hold';
  strength: number;
}

interface CustomIndicatorsProps {
  prediction?: any;
  onIndicatorsUpdate?: (indicators: CustomIndicator[]) => void;
  onGeneratePrediction?: (customFeatures: any) => void;
}

const CustomIndicators: React.FC<CustomIndicatorsProps> = ({ 
  prediction, 
  onIndicatorsUpdate,
  onGeneratePrediction
}) => {
  const [indicators, setIndicators] = useState<CustomIndicator[]>([
    {
      id: 'custom_ma',
      name: 'Custom Moving Average',
      type: 'simple',
      parameters: { period: 20, multiplier: 1.5 },
      description: 'Custom moving average with adjustable period and multiplier',
      isActive: true,
      color: '#3B82F6'
    },
    {
      id: 'custom_rsi',
      name: 'Adaptive RSI',
      type: 'exponential',
      parameters: { period: 14, oversold: 30, overbought: 70 },
      description: 'RSI with custom oversold/overbought levels',
      isActive: true,
      color: '#10B981'
    },
    {
      id: 'custom_vol',
      name: 'Volatility Index',
      type: 'custom',
      parameters: { window: 20, threshold: 0.02 },
      formula: 'STD(price, window) / MEAN(price, window)',
      description: 'Custom volatility index based on price standard deviation',
      isActive: false,
      color: '#F59E0B'
    }
  ]);

  const [selectedIndicator, setSelectedIndicator] = useState<CustomIndicator | null>(null);
  const [showFormula, setShowFormula] = useState(false);
  const [indicatorData, setIndicatorData] = useState<IndicatorData[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const indicatorTypes = [
    { value: 'simple', label: 'Simple Moving Average', description: 'Basic moving average calculation' },
    { value: 'exponential', label: 'Exponential', description: 'Exponential weighting for recent data' },
    { value: 'weighted', label: 'Weighted', description: 'Custom weighted average' },
    { value: 'custom', label: 'Custom Formula', description: 'Define your own formula' }
  ];

  const predefinedIndicators = [
    {
      name: 'Bollinger Bands',
      type: 'custom' as const,
      parameters: { period: 20, stdDev: 2 },
      formula: 'MA(price, period) ± STD(price, period) * stdDev',
      description: 'Bollinger Bands with custom period and standard deviation'
    },
    {
      name: 'MACD Custom',
      type: 'custom' as const,
      parameters: { fast: 12, slow: 26, signal: 9 },
      formula: 'EMA(price, fast) - EMA(price, slow)',
      description: 'MACD with custom fast/slow periods'
    },
    {
      name: 'Stochastic Oscillator',
      type: 'custom' as const,
      parameters: { kPeriod: 14, dPeriod: 3 },
      formula: '(CLOSE - LOW(14)) / (HIGH(14) - LOW(14)) * 100',
      description: 'Stochastic oscillator with custom periods'
    }
  ];

  useEffect(() => {
    generateIndicatorData();
  }, [indicators, prediction]);

  const generateIndicatorData = () => {
    const data: IndicatorData[] = [];
    const now = new Date();
    
    for (let i = 100; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000);
      const baseValue = prediction?.features?.price || 100;
      const noise = (Math.random() - 0.5) * 10;
      
      indicators.forEach(indicator => {
        if (indicator.isActive) {
          let value = baseValue + noise;
          
          // Apply indicator-specific calculations
          if (indicator.type === 'simple' && indicator.parameters.period) {
            value = value * (indicator.parameters.multiplier || 1);
          } else if (indicator.type === 'exponential' && indicator.parameters.period) {
            const alpha = 2 / (indicator.parameters.period + 1);
            value = value * alpha + baseValue * (1 - alpha);
          } else if (indicator.type === 'custom') {
            // Apply custom formula simulation
            if (indicator.name.includes('Volatility')) {
              value = Math.abs(noise) / baseValue;
            }
          }
          
          const signal = value > baseValue * 1.02 ? 'buy' : value < baseValue * 0.98 ? 'sell' : 'hold';
          const strength = Math.abs(value - baseValue) / baseValue;
          
          data.push({
            timestamp,
            value,
            signal,
            strength
          });
        }
      });
    }
    
    setIndicatorData(data.slice(-50)); // Keep last 50 data points
  };

  const addIndicator = (template?: typeof predefinedIndicators[0]) => {
    const newIndicator: CustomIndicator = {
      id: `custom_${Date.now()}`,
      name: template?.name || `Custom Indicator ${indicators.length + 1}`,
      type: template?.type || 'simple',
      parameters: template?.parameters || { period: 20 },
      formula: template?.formula,
      description: template?.description || 'Custom indicator definition',
      isActive: true,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
    
    setIndicators([...indicators, newIndicator]);
    setSelectedIndicator(newIndicator);
    setIsEditing(true);
  };

  const updateIndicator = (id: string, updates: Partial<CustomIndicator>) => {
    const updatedIndicators = indicators.map(ind => 
      ind.id === id ? { ...ind, ...updates } : ind
    );
    setIndicators(updatedIndicators);
    onIndicatorsUpdate?.(updatedIndicators);
  };

  const deleteIndicator = (id: string) => {
    const updatedIndicators = indicators.filter(ind => ind.id !== id);
    setIndicators(updatedIndicators);
    onIndicatorsUpdate?.(updatedIndicators);
    if (selectedIndicator?.id === id) {
      setSelectedIndicator(null);
    }
  };

  const toggleIndicator = (id: string) => {
    const indicator = indicators.find(ind => ind.id === id);
    if (indicator) {
      updateIndicator(id, { isActive: !indicator.isActive });
    }
  };

  const generateCustomFeatures = () => {
    const customFeatures: Record<string, number> = {};
    
    indicators.forEach(indicator => {
      if (indicator.isActive && indicatorData.length > 0) {
        const latestData = indicatorData[indicatorData.length - 1];
        customFeatures[indicator.name.toLowerCase().replace(/\s+/g, '_')] = latestData.value;
      }
    });
    
    onGeneratePrediction?.(customFeatures);
  };

  const exportIndicators = () => {
    const data = JSON.stringify(indicators, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_indicators.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importIndicators = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setIndicators(imported);
          onIndicatorsUpdate?.(imported);
        } catch (error) {
          console.error('Failed to import indicators:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return '#10B981';
      case 'sell': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy': return <TrendingUp className="w-4 h-4" />;
      case 'sell': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatValue = (value: number) => {
    return value.toFixed(4);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Custom Indicators & Parameters
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage custom technical indicators for enhanced predictions
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={exportIndicators}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <label className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importIndicators}
              className="hidden"
            />
          </label>
          <button
            onClick={generateCustomFeatures}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Apply to Prediction
          </button>
        </div>
      </div>

      {/* Indicator List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Indicators</h3>
            <button
              onClick={() => addIndicator()}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          
          <div className="space-y-2">
            {indicators.map(indicator => (
              <div
                key={indicator.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedIndicator?.id === indicator.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedIndicator(indicator)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: indicator.color }}
                    ></div>
                    <span className="font-medium text-gray-900">{indicator.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleIndicator(indicator.id);
                      }}
                      className={`p-1 rounded ${
                        indicator.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {indicator.isActive ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteIndicator(indicator.id);
                      }}
                      className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{indicator.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{indicator.type}</span>
                  {indicator.isActive && (
                    <span className="text-xs text-green-600">Active</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Predefined Templates */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Add Templates</h4>
            <div className="space-y-1">
              {predefinedIndicators.map((template, index) => (
                <button
                  key={index}
                  onClick={() => addIndicator(template)}
                  className="w-full text-left p-2 text-sm bg-gray-50 rounded hover:bg-gray-100"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Indicator Editor */}
        <div className="lg:col-span-2">
          {selectedIndicator ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Indicator Configuration</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    isEditing ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {isEditing ? 'Save' : 'Edit'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedIndicator.name}
                    onChange={(e) => updateIndicator(selectedIndicator.id, { name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={selectedIndicator.type}
                    onChange={(e) => updateIndicator(selectedIndicator.id, { type: e.target.value as any })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    {indicatorTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="color"
                    value={selectedIndicator.color}
                    onChange={(e) => updateIndicator(selectedIndicator.id, { color: e.target.value })}
                    disabled={!isEditing}
                    className="w-full h-10 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={selectedIndicator.description}
                    onChange={(e) => updateIndicator(selectedIndicator.id, { description: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Parameters */}
              <div className="mt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Parameters</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(selectedIndicator.parameters).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => updateIndicator(selectedIndicator.id, {
                          parameters: { ...selectedIndicator.parameters, [key]: parseFloat(e.target.value) }
                        })}
                        disabled={!isEditing}
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Formula */}
              {selectedIndicator.type === 'custom' && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-md font-medium text-gray-900">Formula</h4>
                    <button
                      onClick={() => setShowFormula(!showFormula)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showFormula ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {showFormula && (
                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                      {selectedIndicator.formula || 'No formula defined'}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select an indicator to configure</p>
            </div>
          )}
        </div>
      </div>

      {/* Indicator Charts */}
      {indicatorData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {indicators.filter(ind => ind.isActive).map(indicator => (
            <div key={indicator.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{indicator.name}</h3>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: indicator.color }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {formatValue(indicatorData[indicatorData.length - 1]?.value || 0)}
                  </span>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={indicatorData.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={(date) => new Date(date).toLocaleTimeString()} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [formatValue(value), 'Value']}
                    labelFormatter={(date: any) => new Date(date).toLocaleString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={indicator.color}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Signal Summary */}
              <div className="mt-4 flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      {indicatorData.filter(d => d.signal === 'buy').length} Buy
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-600">
                      {indicatorData.filter(d => d.signal === 'sell').length} Sell
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {indicatorData.filter(d => d.signal === 'hold').length} Hold
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Latest: {indicatorData[indicatorData.length - 1]?.signal?.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage Guide */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Custom Indicators Guide</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Simple Moving Average:</strong> Basic average over specified period</li>
              <li>• <strong>Exponential:</strong> Gives more weight to recent data points</li>
              <li>• <strong>Weighted:</strong> Custom weighting scheme for data points</li>
              <li>• <strong>Custom Formula:</strong> Define your own mathematical formula</li>
              <li>• <strong>Parameters:</strong> Adjust sensitivity and calculation periods</li>
              <li>• <strong>Apply to Prediction:</strong> Use custom indicators as features for AI models</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomIndicators;
