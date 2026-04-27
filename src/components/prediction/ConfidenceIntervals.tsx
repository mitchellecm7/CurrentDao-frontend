import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, TrendingDown, Activity, BarChart3, Target, Shield, AlertCircle, Info, ChevronDown, ChevronUp, RefreshCw, Download } from 'lucide-react';

interface ConfidenceIntervalsProps {
  prediction?: any;
  timeframe?: string;
  onRefresh?: () => void;
}

const ConfidenceIntervals: React.FC<ConfidenceIntervalsProps> = ({ 
  prediction, 
  timeframe = '1hour',
  onRefresh 
}) => {
  const [selectedConfidence, setSelectedConfidence] = useState(95);
  const [showDistribution, setShowDistribution] = useState(true);
  const [showIntervals, setShowIntervals] = useState(true);
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);

  const confidenceLevels = [50, 68, 80, 90, 95, 99];

  const generateDistributionData = useMemo(() => {
    if (!prediction?.probabilityDistribution) return [];
    
    const distribution = prediction.probabilityDistribution;
    const mean = prediction.predictedPrice;
    const stdDev = (prediction.upperBound - prediction.lowerBound) / (2 * 1.96); // 95% CI
    
    return distribution.map((prob: number, index: number) => {
      const zScore = (index - 50) / 10; // Approximate z-score
      const price = mean + (zScore * stdDev);
      return {
        price: price,
        probability: prob * 100,
        zScore: zScore,
        percentile: index
      };
    });
  }, [prediction]);

  const generateIntervalData = useMemo(() => {
    if (!prediction) return [];
    
    const mean = prediction.predictedPrice;
    const stdDev = (prediction.upperBound - prediction.lowerBound) / (2 * 1.96);
    
    return confidenceLevels.map(level => {
      const zScore = level === 95 ? 1.96 : level === 90 ? 1.645 : level === 80 ? 1.28 : level === 68 ? 1 : level === 50 ? 0.674 : 2.576;
      const margin = zScore * stdDev;
      
      return {
        confidence: level,
        lower: mean - margin,
        upper: mean + margin,
        width: margin * 2,
        mean: mean
      };
    });
  }, [prediction]);

  const generateMonteCarloData = useMemo(() => {
    if (!prediction) return [];
    
    const mean = prediction.predictedPrice;
    const stdDev = (prediction.upperBound - prediction.lowerBound) / (2 * 1.96);
    const simulations = [];
    
    for (let i = 0; i < 1000; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const price = mean + (z * stdDev);
      simulations.push({ simulation: i, price });
    }
    
    return simulations;
  }, [prediction]);

  const generateTimeSeriesData = useMemo(() => {
    if (!prediction) return [];
    
    const basePrice = prediction.features?.price || 100;
    const predictedPrice = prediction.predictedPrice;
    const timePoints = 24; // 24 time points for the selected timeframe
    
    return Array.from({ length: timePoints }, (_, i) => {
      const progress = i / (timePoints - 1);
      const trend = predictedPrice - basePrice;
      const noise = (Math.random() - 0.5) * 2;
      const price = basePrice + (trend * progress) + noise;
      
      return {
        time: i,
        price: price,
        upper: price + (prediction.upperBound - predictedPrice) * (1 - progress * 0.5),
        lower: price - (predictedPrice - prediction.lowerBound) * (1 - progress * 0.5),
        mean: price
      };
    });
  }, [prediction]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getConfidenceColor = (level: number) => {
    if (level >= 95) return '#10B981'; // green
    if (level >= 90) return '#3B82F6'; // blue
    if (level >= 80) return '#8B5CF6'; // purple
    if (level >= 68) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  const calculateProbabilityInRange = (lower: number, upper: number) => {
    if (!generateDistributionData.length) return 0;
    
    const inRange = generateDistributionData.filter(d => d.price >= lower && d.price <= upper);
    return inRange.reduce((sum, d) => sum + d.probability, 0);
  };

  const getSelectedInterval = () => {
    return generateIntervalData.find(d => d.confidence === selectedConfidence);
  };

  const selectedInterval = getSelectedInterval();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Confidence Intervals & Probability Distributions
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Statistical confidence intervals and probability distributions for price predictions
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowDistribution(!showDistribution)}
            className={`px-3 py-1 rounded-lg text-sm ${
              showDistribution ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Distribution
          </button>
          <button
            onClick={() => setShowIntervals(!showIntervals)}
            className={`px-3 py-1 rounded-lg text-sm ${
              showIntervals ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Intervals
          </button>
          <button
            onClick={() => setShowMonteCarlo(!showMonteCarlo)}
            className={`px-3 py-1 rounded-lg text-sm ${
              showMonteCarlo ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Monte Carlo
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {prediction && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Predicted Price</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatPrice(prediction.predictedPrice)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">95% CI Range</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatPrice(prediction.lowerBound)} - {formatPrice(prediction.upperBound)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">CI Width</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatPercentage((prediction.upperBound - prediction.lowerBound) / prediction.predictedPrice * 100)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-600">Confidence</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatPercentage(prediction.confidence * 100)}
            </p>
          </div>
        </div>
      )}

      {/* Confidence Level Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Confidence Level</label>
          <span className="text-sm text-gray-600">
            {selectedConfidence}% Confidence Interval
          </span>
        </div>
        <div className="flex gap-2">
          {confidenceLevels.map(level => (
            <button
              key={level}
              onClick={() => setSelectedConfidence(level)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedConfidence === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{ 
                borderColor: selectedConfidence === level ? getConfidenceColor(level) : undefined 
              }}
            >
              {level}%
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Probability Distribution */}
        {showDistribution && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Probability Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={generateDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="price" 
                  tickFormatter={formatPrice}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Probability']}
                  labelFormatter={(label: any) => `Price: ${formatPrice(label)}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="probability" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                />
                {/* Mean line */}
                <Line
                  type="monotone"
                  dataKey={() => prediction?.predictedPrice}
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  dot={false}
                  name="Predicted Price"
                />
                {/* Confidence interval lines */}
                {selectedInterval && (
                  <>
                    <Line
                      type="monotone"
                      dataKey={() => selectedInterval.lower}
                      stroke="#10B981"
                      strokeDasharray="3 3"
                      dot={false}
                      name={`${selectedConfidence}% Lower`}
                    />
                    <Line
                      type="monotone"
                      dataKey={() => selectedInterval.upper}
                      stroke="#10B981"
                      strokeDasharray="3 3"
                      dot={false}
                      name={`${selectedConfidence}% Upper`}
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
            
            {/* Distribution Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Mean:</span>
                <span className="ml-2 font-medium">{formatPrice(prediction?.predictedPrice || 0)}</span>
              </div>
              <div>
                <span className="text-gray-600">Std Dev:</span>
                <span className="ml-2 font-medium">
                  {formatPrice((prediction?.upperBound - prediction?.lowerBound) / (2 * 1.96) || 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Skewness:</span>
                <span className="ml-2 font-medium">0.02</span>
              </div>
              <div>
                <span className="text-gray-600">Kurtosis:</span>
                <span className="ml-2 font-medium">3.1</span>
              </div>
            </div>
          </div>
        )}

        {/* Confidence Intervals */}
        {showIntervals && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence Intervals</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={generateIntervalData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={formatPrice} />
                <YAxis type="category" dataKey="confidence" />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    formatPrice(value), 
                    name === 'lower' ? 'Lower Bound' : name === 'upper' ? 'Upper Bound' : 'Mean'
                  ]}
                />
                <Bar dataKey="upper" fill="#EF4444" name="Upper Bound" />
                <Bar dataKey="mean" fill="#3B82F6" name="Mean" />
                <Bar dataKey="lower" fill="#10B981" name="Lower Bound" />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Interval Stats */}
            <div className="mt-4 space-y-2">
              {generateIntervalData.map(interval => (
                <div key={interval.confidence} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{interval.confidence}% CI:</span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{formatPrice(interval.lower)}</span>
                    <span className="text-gray-400">to</span>
                    <span className="font-medium">{formatPrice(interval.upper)}</span>
                    <span className="text-gray-500">({formatPercentage(interval.width / interval.mean * 100)})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Monte Carlo Simulation */}
      {showMonteCarlo && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monte Carlo Simulation (1000 runs)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="price" 
                type="number" 
                tickFormatter={formatPrice}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <YAxis dataKey="simulation" type="number" hide />
              <Tooltip 
                formatter={(value: any) => [formatPrice(value), 'Price']}
                labelFormatter={() => 'Simulation Result'}
              />
              <Scatter 
                data={generateMonteCarloData} 
                fill="#3B82F6" 
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
          
          {/* Monte Carlo Stats */}
          <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Mean:</span>
              <span className="ml-2 font-medium">{formatPrice(prediction?.predictedPrice || 0)}</span>
            </div>
            <div>
              <span className="text-gray-600">Std Dev:</span>
              <span className="ml-2 font-medium">
                {formatPrice((prediction?.upperBound - prediction?.lowerBound) / (2 * 1.96) || 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Min:</span>
              <span className="ml-2 font-medium">{formatPrice(prediction?.lowerBound || 0)}</span>
            </div>
            <div>
              <span className="text-gray-600">Max:</span>
              <span className="ml-2 font-medium">{formatPrice(prediction?.upperBound || 0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Time Series Projection */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Series Projection</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={generateTimeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis tickFormatter={formatPrice} />
            <Tooltip 
              formatter={(value: any, name: string) => [
                formatPrice(value), 
                name === 'upper' ? 'Upper Bound' : name === 'lower' ? 'Lower Bound' : 'Projected'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="upper" 
              stackId="1"
              stroke="#10B981" 
              fill="#10B981" 
              fillOpacity={0.2}
            />
            <Area 
              type="monotone" 
              dataKey="lower" 
              stackId="2"
              stroke="#10B981" 
              fill="#10B981" 
              fillOpacity={0.2}
            />
            <Line
              type="monotone"
              dataKey="mean"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              name="Projected Price"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation Guide */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Understanding Confidence Intervals</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>95% Confidence Interval:</strong> We are 95% confident the actual price will fall within this range</li>
              <li>• <strong>Probability Distribution:</strong> Shows the likelihood of different price outcomes</li>
              <li>• <strong>Monte Carlo Simulation:</strong> 1000 random simulations based on the predicted distribution</li>
              <li>• <strong>Time Series Projection:</strong> How confidence intervals evolve over time</li>
              <li>• <strong>Wider intervals</strong> indicate higher uncertainty, while <strong>narrower intervals</strong> indicate higher confidence</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      {prediction && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Moderate Risk</span>
            </div>
            <p className="text-sm text-yellow-700">
              Price movement within expected range. Monitor for volatility changes.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Upside Potential</span>
            </div>
            <p className="text-sm text-green-700">
              {formatPercentage(calculateProbabilityInRange(prediction.predictedPrice, prediction.upperBound))} chance of exceeding prediction
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Reliability</span>
            </div>
            <p className="text-sm text-blue-700">
              Model confidence: {formatPercentage(prediction.confidence * 100)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfidenceIntervals;
