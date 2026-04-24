import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar
} from 'recharts';
import { 
  PriceDataPoint, 
  Timeframe, 
  IndicatorConfig, 
  DrawingTool, 
  ChartComparison,
  ChartExportOptions,
  ChartViewport
} from '@/types/charts';
import { useRealTimeChart } from '@/hooks/useRealTimeChart';
import { useTechnicalIndicators } from '@/hooks/useTechnicalIndicators';
import { ChartCalculations } from '@/utils/chartCalculations';
import TimeframeSelector from './TimeframeSelector';
import TechnicalIndicators from './TechnicalIndicators';
import DrawingTools from './DrawingTools';
import ChartComparison from './ChartComparison';
import { 
  Settings, 
  Download, 
  Maximize2, 
  RefreshCw, 
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';

interface RealTimePriceChartProps {
  symbol: string;
  energyType: string;
  initialTimeframe?: Timeframe;
  className?: string;
  height?: number;
  showVolume?: boolean;
  showIndicators?: boolean;
  showDrawingTools?: boolean;
  showComparison?: boolean;
  enableExport?: boolean;
  maxDataPoints?: number;
}

const RealTimePriceChart: React.FC<RealTimePriceChartProps> = ({
  symbol,
  energyType,
  initialTimeframe = '1h',
  className = '',
  height = 400,
  showVolume = true,
  showIndicators = true,
  showDrawingTools = true,
  showComparison = true,
  enableExport = true,
  maxDataPoints = 10000,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>(initialTimeframe);
  const [indicators, setIndicators] = useState<IndicatorConfig[]>([]);
  const [drawings, setDrawings] = useState<DrawingTool[]>([]);
  const [comparisons, setComparisons] = useState<ChartComparison[]>([]);
  const [selectedTool, setSelectedTool] = useState<DrawingTool['type'] | null>(null);
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area' | 'bar'>('candlestick');
  const [showGrid, setShowGrid] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewport, setViewport] = useState<ChartViewport>({
    startIndex: 0,
    endIndex: 100,
    visibleRange: 100,
  });

  const chartRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isConnected,
    lastUpdate,
    error,
    loading,
    connect,
    disconnect,
    reconnect,
    clearData,
  } = useRealTimeChart({
    symbol,
    timeframe,
    maxDataPoints,
  });

  const {
    calculatedIndicators,
    addIndicator,
    removeIndicator,
    updateIndicator,
    clearAllIndicators,
    isCalculating,
  } = useTechnicalIndicators({
    data,
    indicators,
  });

  const formatChartData = useCallback(() => {
    return data.slice(viewport.startIndex, viewport.endIndex).map((point, index) => {
      const baseData = {
        timestamp: point.timestamp,
        time: new Date(point.timestamp).toLocaleTimeString(),
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume,
        date: new Date(point.timestamp).toLocaleDateString(),
      };

      calculatedIndicators.forEach(indicator => {
        const indicatorData = indicator.data.find(d => d.x === viewport.startIndex + index);
        if (indicatorData) {
          baseData[indicator.name] = indicatorData.y;
        }
      });

      comparisons.forEach(comparison => {
        if (comparison.visible && comparison.data[index]) {
          baseData[comparison.symbol] = comparison.data[index].close;
        }
      });

      return baseData;
    });
  }, [data, calculatedIndicators, comparisons, viewport]);

  const chartData = formatChartData();

  const handleExport = useCallback(async (options: ChartExportOptions) => {
    if (!exportRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = options.width;
      canvas.height = options.height;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL(`image/${options.format.toLowerCase()}`);
      const link = document.createElement('a');
      link.download = `${symbol}-${timeframe}-${Date.now()}.${options.format.toLowerCase()}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [symbol, timeframe]);

  const handleDrawingComplete = useCallback((drawing: DrawingTool) => {
    setDrawings(prev => [...prev, drawing]);
  }, []);

  const handleDrawingUpdate = useCallback((drawingId: string, updates: Partial<DrawingTool>) => {
    setDrawings(prev => 
      prev.map(drawing => 
        drawing.id === drawingId ? { ...drawing, ...updates } : drawing
      )
    );
  }, []);

  const handleDrawingDelete = useCallback((drawingId: string) => {
    setDrawings(prev => prev.filter(drawing => drawing.id !== drawingId));
  }, []);

  const handleComparisonAdd = useCallback((comparison: ChartComparison) => {
    setComparisons(prev => [...prev, comparison]);
  }, []);

  const handleComparisonRemove = useCallback((symbol: string) => {
    setComparisons(prev => prev.filter(comp => comp.symbol !== symbol));
  }, []);

  const handleComparisonToggle = useCallback((symbol: string, visible: boolean) => {
    setComparisons(prev => 
      prev.map(comp => 
        comp.symbol === symbol ? { ...comp, visible } : comp
      )
    );
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen && chartRef.current) {
      chartRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {new Date(label).toLocaleString()}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-center">
            <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {loading ? 'Loading chart data...' : 'No data available'}
            </p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              name={symbol}
            />
            {calculatedIndicators.map((indicator, index) => (
              indicator.visible && (
                <Line
                  key={indicator.name}
                  type="monotone"
                  dataKey={indicator.name}
                  stroke={indicator.color}
                  strokeWidth={indicator.strokeWidth}
                  dot={false}
                  name={indicator.name}
                />
              )
            ))}
            {comparisons.map((comparison) => (
              comparison.visible && (
                <Line
                  key={comparison.symbol}
                  type="monotone"
                  dataKey={comparison.symbol}
                  stroke={comparison.color}
                  strokeWidth={2}
                  dot={false}
                  name={comparison.symbol}
                />
              )
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
              name={symbol}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <ComposedChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              yAxisId="price"
              stroke="#6b7280"
              fontSize={12}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <YAxis 
              yAxisId="volume"
              orientation="right"
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="price" dataKey="close" fill="#3b82f6" name={symbol} />
            {showVolume && (
              <Bar yAxisId="volume" dataKey="volume" fill="#10b981" opacity={0.3} name="Volume" />
            )}
          </ComposedChart>
        );

      default: // candlestick
        return (
          <ComposedChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="high" 
              fill="#10b981" 
              opacity={0.8}
              name="High"
            />
            <Bar 
              dataKey="low" 
              fill="#ef4444" 
              opacity={0.8}
              name="Low"
            />
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              name="Close"
            />
          </ComposedChart>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {energyType} ({symbol})
            </h2>
          </div>
          
          <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <TimeframeSelector
            selectedTimeframe={timeframe}
            onTimeframeChange={setTimeframe}
            disabled={loading}
          />
          
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <Maximize2 size={18} />
          </button>
          
          {enableExport && (
            <button
              onClick={() => handleExport({
                format: 'PNG',
                width: 1920,
                height: 1080,
                includeIndicators: true,
                includeDrawingTools: true,
              })}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <Download size={18} />
            </button>
          )}
          
          <button
            onClick={isConnected ? disconnect : connect}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {isConnected ? <RefreshCw size={18} /> : <Activity size={18} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div 
            ref={chartRef}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
            style={{ height: isFullscreen ? '100vh' : height }}
          >
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                <p className="text-sm">{error}</p>
                <button 
                  onClick={reconnect}
                  className="mt-2 text-sm underline"
                >
                  Try reconnecting
                </button>
              </div>
            )}
            
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>

          {showVolume && (
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Volume</h3>
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={chartData}>
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {showIndicators && (
            <TechnicalIndicators
              indicators={indicators}
              calculatedIndicators={calculatedIndicators}
              onIndicatorAdd={addIndicator}
              onIndicatorRemove={removeIndicator}
              onIndicatorUpdate={updateIndicator}
              onIndicatorToggle={(name, visible) => {
                const indicator = indicators.find(ind => `${ind.type}(${ind.period})` === name);
                if (indicator) {
                  updateIndicator(name, { visible });
                }
              }}
            />
          )}

          {showComparison && (
            <ChartComparison
              comparisons={comparisons}
              onComparisonAdd={handleComparisonAdd}
              onComparisonRemove={handleComparisonRemove}
              onComparisonToggle={handleComparisonToggle}
            />
          )}

          {showDrawingTools && (
            <DrawingTools
              onToolSelect={setSelectedTool}
              selectedTool={selectedTool}
              onDrawingComplete={handleDrawingComplete}
              drawings={drawings}
              onDrawingUpdate={handleDrawingUpdate}
              onDrawingDelete={handleDrawingDelete}
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div>
          Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
        </div>
        <div>
          Data points: {data.length} / {maxDataPoints}
        </div>
      </div>
    </div>
  );
};

export default RealTimePriceChart;
