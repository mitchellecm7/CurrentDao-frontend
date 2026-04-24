import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Brain, Target, AlertTriangle, CheckCircle, Settings, RefreshCw, Download, Upload, Clock, Zap, Shield, BarChart3 } from 'lucide-react';
import usePricePrediction from '../../hooks/usePricePrediction';

const PredictionDashboard: React.FC = () => {
  const {
    currentPrediction,
    ensemblePrediction,
    individualPredictions,
    isLoading,
    error,
    selectedTimeframe,
    selectedEnsemble,
    selectedModels,
    accuracyMetrics,
    alerts,
    generatePrediction,
    setTimeframe,
    setEnsembleMethod,
    setSelectedModels,
    retrainAllModels,
    clearAlerts,
    getTopPerformingModels,
    getModelComparison,
    getAccuracyTrend,
    getSummaryStats,
    getAvailableModels,
    getAvailableEnsembles
  } = usePricePrediction();

  const [showSettings, setShowSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60000);

  const timeframes = [
    { value: '1min', label: '1 Minute' },
    { value: '5min', label: '5 Minutes' },
    { value: '15min', label: '15 Minutes' },
    { value: '30min', label: '30 Minutes' },
    { value: '1hour', label: '1 Hour' },
    { value: '4hour', label: '4 Hours' },
    { value: '1day', label: '1 Day' },
    { value: '1week', label: '1 Week' },
    { value: '1month', label: '1 Month' }
  ];

  const ensembleMethods = [
    { value: 'default', label: 'Default (Weighted Average)' },
    { value: 'high_accuracy', label: 'High Accuracy (Stacking)' },
    { value: 'fast', label: 'Fast (Voting)' },
    { value: 'conservative', label: 'Conservative (Bagging)' }
  ];

  const availableModels = getAvailableModels();
  const availableEnsembles = getAvailableEnsembles();
  const summaryStats = getSummaryStats();
  const topModels = getTopPerformingModels(5);

  useEffect(() => {
    generatePrediction();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        generatePrediction();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, generatePrediction]);

  const handleTimeframeChange = (timeframe: string) => {
    setTimeframe(timeframe);
    generatePrediction();
  };

  const handleEnsembleChange = (ensemble: string) => {
    setEnsembleMethod(ensemble);
    generatePrediction();
  };

  const handleModelToggle = (modelType: string) => {
    const newSelectedModels = selectedModels.includes(modelType)
      ? selectedModels.filter(m => m !== modelType)
      : [...selectedModels, modelType];
    setSelectedModels(newSelectedModels);
    generatePrediction();
  };

  const handleRetrainAll = async () => {
    await retrainAllModels();
  };

  const getPredictionDirection = () => {
    if (!currentPrediction || !currentPrediction.features) return 'neutral';
    const currentPrice = currentPrediction.features.price;
    const predictedPrice = currentPrediction.predictedPrice;
    const change = (predictedPrice - currentPrice) / currentPrice;
    
    if (change > 0.01) return 'up';
    if (change < -0.01) return 'down';
    return 'neutral';
  };

  const getPredictionColor = () => {
    const direction = getPredictionDirection();
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getAccuracyData = () => {
    if (!accuracyMetrics) return [];
    
    return Array.from(accuracyMetrics.entries()).map(([key, metrics]) => ({
      model: key.split('-')[0],
      timeframe: key.split('-')[1],
      accuracy: metrics.accuracy * 100,
      predictions: metrics.totalPredictions,
      trend: metrics.trend
    }));
  };

  const getTrendData = () => {
    if (!currentPrediction) return [];
    
    const trend = getAccuracyTrend('ensemble', selectedTimeframe, 7);
    return trend.map(item => ({
      date: item.date.toLocaleDateString(),
      accuracy: item.accuracy * 100
    }));
  };

  const getModelComparisonData = () => {
    if (!currentPrediction) return [];
    
    const comparison = getModelComparison(selectedTimeframe);
    return comparison.map(item => ({
      model: item.modelType,
      accuracy: item.accuracy * 100,
      confidence: item.confidence * 100,
      error: item.error * 100
    }));
  };

  const getConfidenceData = () => {
    if (!currentPrediction) return [];
    
    const distribution = currentPrediction.probabilityDistribution || [];
    return distribution.map((prob: number, index: number) => ({
      range: index,
      probability: prob * 100
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" />
              AI Price Prediction Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Advanced AI-powered energy price forecasts with confidence intervals</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            
            <button
              onClick={() => generatePrediction()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={handleRetrainAll}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              Retrain All
            </button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">System Alerts</h3>
                  <ul className="mt-2 space-y-1">
                    {alerts.slice(0, 3).map((alert, index) => (
                      <li key={index} className="text-sm text-yellow-700">• {alert}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={clearAlerts}
                className="text-sm text-yellow-600 hover:text-yellow-800"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeframes.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ensemble Method</label>
            <select
              value={selectedEnsemble}
              onChange={(e) => handleEnsembleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ensembleMethods.map(em => (
                <option key={em.value} value={em.value}>{em.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Auto Refresh</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Every {refreshInterval / 1000}s</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Processing...</span>
                </>
              ) : error ? (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-600">Error</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Ready</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Prediction Display */}
      {currentPrediction && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Prediction */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Current Prediction</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getPredictionColor()}`}>
                    {getPredictionDirection() === 'up' && <TrendingUp />}
                    {getPredictionDirection() === 'down' && <TrendingDown />}
                    {getPredictionDirection() === 'neutral' && <Activity />}
                  </span>
                  <span className={`text-lg font-semibold ${getPredictionColor()}`}>
                    {formatPercentage((currentPrediction.predictedPrice - currentPrediction.features.price) / currentPrediction.features.price)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(currentPrediction.features.price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Predicted Price</p>
                  <p className={`text-2xl font-bold ${getPredictionColor()}`}>
                    {formatPrice(currentPrediction.predictedPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Confidence</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatPercentage(currentPrediction.confidence)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Timeframe</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {timeframes.find(tf => tf.value === selectedTimeframe)?.label}
                  </p>
                </div>
              </div>
              
              {/* Confidence Interval Chart */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Probability Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={getConfidenceData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="probability" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Model Performance */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Model Performance</h2>
              
              <div className="space-y-4">
                {individualPredictions.map((prediction, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{prediction.modelType}</span>
                      <span className="text-sm text-gray-600">{formatPercentage(prediction.accuracy)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{formatPrice(prediction.predictedPrice)}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${prediction.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Ensemble Info */}
              {ensemblePrediction && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">Ensemble ({ensemblePrediction.ensembleMethod})</span>
                    <span className="text-sm text-green-600">{formatPercentage(ensemblePrediction.accuracy)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Consensus: {formatPercentage(ensemblePrediction.consensusScore)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Variance: {formatPercentage(ensemblePrediction.variance)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Accuracy Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Accuracy Trend (7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Model Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Model Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getModelComparisonData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="accuracy" fill="#3B82F6" />
              <Bar dataKey="confidence" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{summaryStats.totalPredictions}</span>
          </div>
          <p className="text-sm text-gray-600">Total Predictions</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Brain className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{summaryStats.modelsTracked}</span>
          </div>
          <p className="text-sm text-gray-600">Models Tracked</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{formatPercentage(summaryStats.averageAccuracy)}</span>
          </div>
          <p className="text-sm text-gray-600">Average Accuracy</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">{summaryStats.alertsCount}</span>
          </div>
          <p className="text-sm text-gray-600">Active Alerts</p>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Prediction Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Model Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Active Models</h3>
                <div className="grid grid-cols-2 gap-3">
                  {availableModels.map(model => (
                    <label key={model} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model)}
                        onChange={() => handleModelToggle(model)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{model}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Refresh Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Auto Refresh</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Enable auto refresh</span>
                  </label>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Interval (seconds)</label>
                    <input
                      type="number"
                      value={refreshInterval / 1000}
                      onChange={(e) => setRefreshInterval(parseInt(e.target.value) * 1000)}
                      min="10"
                      max="300"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionDashboard;
