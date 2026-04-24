import React, { useState, useEffect } from 'react';
import { AdvancedCharting } from '@/components/charts/AdvancedCharting';
import { PriceDataPoint, IndicatorConfig, DrawingTool, Timeframe } from '@/types/charts';
import { analyzeTechnicalIndicators, generateTradingSignals } from '@/utils/charts/technical-analysis';
import { createPerformanceMonitor } from '@/utils/charts/performance';

// Sample data generator for demonstration
const generateSampleData = (points: number = 500): PriceDataPoint[] => {
  const data: PriceDataPoint[] = [];
  let basePrice = 100;
  const now = Date.now();
  
  for (let i = 0; i < points; i++) {
    const timestamp = now - (points - i) * 60000; // 1-minute intervals
    
    // Simulate price movement with trend and noise
    const trend = Math.sin(i * 0.02) * 10;
    const noise = (Math.random() - 0.5) * 2;
    const volatility = Math.random() * 3;
    
    const open = basePrice + trend + noise;
    const close = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    const volume = Math.floor(Math.random() * 1000000) + 500000;
    
    data.push({
      timestamp: new Date(timestamp),
      open,
      high,
      low,
      close,
      volume
    });
    
    basePrice = close;
  }
  
  return data;
};

// Sample indicators configuration
const sampleIndicators: IndicatorConfig[] = [
  {
    type: 'SMA',
    period: 20,
    color: '#3b82f6',
    visible: true,
    strokeWidth: 2
  },
  {
    type: 'EMA',
    period: 50,
    color: '#ef4444',
    visible: true,
    strokeWidth: 2
  },
  {
    type: 'RSI',
    period: 14,
    color: '#10b981',
    visible: true,
    strokeWidth: 1
  },
  {
    type: 'MACD',
    period: 0,
    parameters: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
    color: '#f59e0b',
    visible: true,
    strokeWidth: 2
  },
  {
    type: 'BB',
    period: 20,
    parameters: { stdDev: 2 },
    color: '#8b5cf6',
    visible: true,
    strokeWidth: 1
  }
];

// Sample drawings
const sampleDrawings: DrawingTool[] = [
  {
    id: 'trend-1',
    type: 'trendline',
    startPoint: { x: 100, y: 150 },
    endPoint: { x: 400, y: 100 },
    color: '#3b82f6',
    strokeWidth: 2,
    visible: true
  },
  {
    id: 'support-1',
    type: 'support',
    startPoint: { x: 50, y: 200 },
    endPoint: { x: 450, y: 200 },
    color: '#10b981',
    strokeWidth: 2,
    visible: true
  }
];

export const AdvancedChartingExample: React.FC = () => {
  const [data, setData] = useState<PriceDataPoint[]>([]);
  const [indicators, setIndicators] = useState<IndicatorConfig[]>(sampleIndicators);
  const [drawings, setDrawings] = useState<DrawingTool[]>(sampleDrawings);
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area' | 'bar'>('candlestick');
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [showVolume, setShowVolume] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [realTimeData, setRealTimeData] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  
  const performanceMonitor = createPerformanceMonitor();

  // Initialize data
  useEffect(() => {
    const sampleData = generateSampleData(500);
    setData(sampleData);
    
    // Analyze technical indicators
    const analysis = analyzeTechnicalIndicators(sampleData);
    const signals = generateTradingSignals(sampleData);
    
    console.log('Technical Analysis:', analysis);
    console.log('Trading Signals:', signals);
  }, []);

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = performanceMonitor.getMetrics();
      setPerformanceMetrics(metrics);
    }, 1000);

    return () => clearInterval(interval);
  }, [performanceMonitor]);

  // Handle real-time data simulation
  useEffect(() => {
    if (!realTimeData) return;

    const interval = setInterval(() => {
      setData(prevData => {
        if (prevData.length === 0) return prevData;
        
        const lastPoint = prevData[prevData.length - 1];
        const newPoint: PriceDataPoint = {
          timestamp: new Date(),
          open: lastPoint.close,
          high: lastPoint.close + Math.random() * 2,
          low: lastPoint.close - Math.random() * 2,
          close: lastPoint.close + (Math.random() - 0.5) * 2,
          volume: Math.floor(Math.random() * 1000000) + 500000
        };

        // Keep only last 500 points for performance
        const newData = [...prevData.slice(-499), newPoint];
        return newData;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [realTimeData]);

  const handleIndicatorAdd = (indicator: IndicatorConfig) => {
    setIndicators(prev => [...prev, indicator]);
  };

  const handleIndicatorRemove = (indicatorName: string) => {
    setIndicators(prev => prev.filter(ind => `${ind.type}(${ind.period})` !== indicatorName));
  };

  const handleDrawingComplete = (drawing: DrawingTool) => {
    setDrawings(prev => [...prev, drawing]);
  };

  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
    // In real app, this would fetch new data for the timeframe
    const newData = generateSampleData(getDataPointsForTimeframe(newTimeframe));
    setData(newData);
  };

  const handleExport = (format: 'png' | 'svg' | 'csv') => {
    console.log(`Exporting chart as ${format}`);
    // Export functionality would be implemented here
  };

  const getDataPointsForTimeframe = (timeframe: Timeframe): number => {
    switch (timeframe) {
      case '1m': return 60;
      case '5m': return 300;
      case '15m': return 200;
      case '30m': return 150;
      case '1h': return 500;
      case '4h': return 400;
      case '1d': return 365;
      case '1w': return 52;
      case '1M': return 24;
      default: return 500;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            CurrentDao Advanced Charting Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive technical analysis tools with real-time data processing and AI-assisted pattern recognition
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Chart Controls
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Chart Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chart Type
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="candlestick">Candlestick</option>
                <option value="line">Line</option>
                <option value="area">Area</option>
                <option value="bar">Bar</option>
              </select>
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => handleTimeframeChange(e.target.value as Timeframe)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="30m">30 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="1d">1 Day</option>
                <option value="1w">1 Week</option>
                <option value="1M">1 Month</option>
              </select>
            </div>

            {/* Show Volume */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showVolume"
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showVolume" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Volume
              </label>
            </div>

            {/* Show Grid */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showGrid"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showGrid" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Grid
              </label>
            </div>

            {/* Real-time Data */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="realTimeData"
                checked={realTimeData}
                onChange={(e) => setRealTimeData(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="realTimeData" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Real-time Data
              </label>
            </div>

            {/* Performance Metrics */}
            {performanceMetrics && (
              <div className="col-span-full">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">FPS:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {performanceMetrics.averageFPS.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Render Time:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {performanceMetrics.averageRenderTime.toFixed(2)}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Data Points:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {data.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Indicators:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {indicators.length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <AdvancedCharting
            data={data}
            chartType={chartType}
            timeframe={timeframe}
            indicators={indicators}
            drawings={drawings}
            height={600}
            showVolume={showVolume}
            showGrid={showGrid}
            realTimeData={realTimeData}
            onTimeframeChange={handleTimeframeChange}
            onIndicatorAdd={handleIndicatorAdd}
            onIndicatorRemove={handleIndicatorRemove}
            onDrawingComplete={handleDrawingComplete}
            onExport={handleExport}
            className="w-full"
          />
        </div>

        {/* Features Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              📊 Chart Types
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Candlestick charts with OHLC data</li>
              <li>• Line charts for trend analysis</li>
              <li>• Area charts with gradient fills</li>
              <li>• Bar charts for volume analysis</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              📈 Technical Indicators
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 50+ technical indicators</li>
              <li>• Moving averages (SMA, EMA)</li>
              <li>• Oscillators (RSI, MACD, Stochastic)</li>
              <li>• Volatility indicators (Bollinger Bands)</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              🎯 Pattern Recognition
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• AI-assisted pattern detection</li>
              <li>• Head and shoulders patterns</li>
              <li>• Double tops and bottoms</li>
              <li>• Triangle and flag patterns</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              ✏️ Drawing Tools
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Trend lines and channels</li>
              <li>• Support and resistance levels</li>
              <li>• Fibonacci retracements</li>
              <li>• Custom annotations</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              ⚡ Performance
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 60fps smooth rendering</li>
              <li>• 10,000+ data points support</li>
              <li>• Virtual scrolling</li>
              <li>• Memory-efficient processing</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              💾 Export Options
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• PNG image export</li>
              <li>• SVG vector export</li>
              <li>• PDF document export</li>
              <li>• CSV data export</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedChartingExample;
