import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PriceDataPoint, IndicatorConfig, DrawingTool, ChartViewport, ChartInteraction, Timeframe } from '@/types/charts';
import { useAdvancedCharting } from '@/hooks/useAdvancedCharting';
import { calculateTechnicalIndicators } from '@/services/charts/indicator-engine';
import { detectPatterns } from '@/services/charts/pattern-detection';
import { TechnicalIndicators } from './TechnicalIndicators';
import { DrawingTools } from './DrawingTools';
import { PatternRecognition } from './PatternRecognition';
import { TimeframeSelector } from './TimeframeSelector';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ComposedChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Cell
} from 'recharts';
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Settings, 
  Grid, 
  Maximize2, 
  Share2,
  TrendingUp,
  Activity
} from 'lucide-react';

interface AdvancedChartingProps {
  data: PriceDataPoint[];
  chartType?: 'candlestick' | 'line' | 'area' | 'bar';
  timeframe?: Timeframe;
  indicators?: IndicatorConfig[];
  drawings?: DrawingTool[];
  height?: number;
  showVolume?: boolean;
  showGrid?: boolean;
  realTimeData?: boolean;
  onTimeframeChange?: (timeframe: Timeframe) => void;
  onIndicatorAdd?: (indicator: IndicatorConfig) => void;
  onIndicatorRemove?: (indicatorName: string) => void;
  onDrawingComplete?: (drawing: DrawingTool) => void;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  className?: string;
}

export const AdvancedCharting: React.FC<AdvancedChartingProps> = ({
  data,
  chartType = 'candlestick',
  timeframe = '1h',
  indicators = [],
  drawings = [],
  height = 600,
  showVolume = true,
  showGrid = true,
  realTimeData = false,
  onTimeframeChange,
  onIndicatorAdd,
  onIndicatorRemove,
  onDrawingComplete,
  onExport,
  className = '',
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<ChartViewport>({
    startIndex: 0,
    endIndex: Math.min(100, data.length),
    visibleRange: 100
  });
  
  const [interaction, setInteraction] = useState<ChartInteraction>({
    isPanning: false,
    isZooming: false,
    isDrawing: false,
    selectedTool: null
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showPatternRecognition, setShowPatternRecognition] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    processedData,
    calculatedIndicators,
    detectedPatterns,
    performance,
    handlers
  } = useAdvancedCharting({
    data,
    indicators,
    viewport,
    realTimeData
  });

  // Performance optimization: memoize visible data
  const visibleData = useMemo(() => {
    return processedData.slice(viewport.startIndex, viewport.endIndex);
  }, [processedData, viewport.startIndex, viewport.endIndex]);

  // Handle viewport changes for smooth scrolling
  const handleViewportChange = useCallback((newViewport: Partial<ChartViewport>) => {
    setViewport(prev => ({ ...prev, ...newViewport }));
  }, []);

  // Handle zoom functionality
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const zoomFactor = direction === 'in' ? 0.8 : 1.2;
    const newRange = Math.max(20, Math.min(data.length, Math.floor(viewport.visibleRange * zoomFactor)));
    
    setViewport(prev => ({
      ...prev,
      visibleRange: newRange,
      endIndex: Math.min(prev.startIndex + newRange, data.length)
    }));
  }, [viewport.visibleRange, data.length]);

  // Handle pan functionality
  const handlePan = useCallback((direction: 'left' | 'right') => {
    const panAmount = Math.floor(viewport.visibleRange * 0.2);
    
    setViewport(prev => {
      const newStartIndex = direction === 'left' 
        ? Math.max(0, prev.startIndex - panAmount)
        : Math.min(data.length - prev.visibleRange, prev.startIndex + panAmount);
      
      return {
        ...prev,
        startIndex: newStartIndex,
        endIndex: newStartIndex + prev.visibleRange
      };
    });
  }, [viewport.visibleRange, data.length]);

  // Render candlestick data
  const renderCandlestick = (data: any[]) => {
    return (
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={showGrid ? '#e5e7eb' : 'transparent'} />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          stroke="#6b7280"
        />
        <YAxis 
          domain={['dataMin - 0.1', 'dataMax + 0.1']}
          stroke="#6b7280"
        />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleString()}
          formatter={(value: any, name: string) => [
            typeof value === 'number' ? value.toFixed(4) : value,
            name
          ]}
        />
        <Legend />
        
        {/* Candlestick body */}
        <Bar 
          dataKey="close" 
          fill={(entry: any) => entry.close >= entry.open ? '#10b981' : '#ef4444'}
          shape={(props: any) => {
            const { x, y, width, height, payload } = props;
            const isGreen = payload.close >= payload.open;
            const bodyHeight = Math.abs(height * 0.8);
            const bodyY = y + (height - bodyHeight) / 2;
            
            return (
              <g>
                {/* Wick */}
                <line
                  x1={x + width / 2}
                  y1={y}
                  x2={x + width / 2}
                  y2={y + height}
                  stroke={isGreen ? '#10b981' : '#ef4444'}
                  strokeWidth={1}
                />
                {/* Body */}
                <rect
                  x={x + width * 0.2}
                  y={bodyY}
                  width={width * 0.6}
                  height={bodyHeight}
                  fill={isGreen ? '#10b981' : '#ef4444'}
                  stroke={isGreen ? '#10b981' : '#ef4444'}
                />
              </g>
            );
          }}
        />
        
        {/* Volume bars */}
        {showVolume && (
          <Bar 
            dataKey="volume" 
            fill="#9ca3af"
            opacity={0.3}
            yAxisId="volume"
          />
        )}
        
        {/* Technical indicators */}
        {calculatedIndicators.map((indicator) => (
          indicator.visible && (
            <Line
              key={indicator.name}
              type="monotone"
              dataKey={indicator.name}
              stroke={indicator.color}
              strokeWidth={indicator.strokeWidth || 2}
              dot={false}
            />
          )
        ))}
        
        {/* Drawing tools */}
        {drawings.map((drawing) => (
          drawing.visible && (
            <ReferenceLine
              key={drawing.id}
              y={drawing.startPoint.y}
              stroke={drawing.color}
              strokeWidth={drawing.strokeWidth}
              strokeDasharray={drawing.type === 'support' ? '5 5' : '0'}
            />
          )
        ))}
      </ComposedChart>
    );
  };

  // Render line chart
  const renderLineChart = (data: any[]) => {
    return (
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={showGrid ? '#e5e7eb' : 'transparent'} />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          stroke="#6b7280"
        />
        <YAxis 
          domain={['dataMin - 0.1', 'dataMax + 0.1']}
          stroke="#6b7280"
        />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleString()}
          formatter={(value: any) => [
            typeof value === 'number' ? value.toFixed(4) : value,
            'Price'
          ]}
        />
        <Legend />
        
        <Line
          type="monotone"
          dataKey="close"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
        
        {/* Technical indicators */}
        {calculatedIndicators.map((indicator) => (
          indicator.visible && (
            <Line
              key={indicator.name}
              type="monotone"
              dataKey={indicator.name}
              stroke={indicator.color}
              strokeWidth={indicator.strokeWidth || 2}
              dot={false}
            />
          )
        ))}
      </LineChart>
    );
  };

  // Render area chart
  const renderAreaChart = (data: any[]) => {
    return (
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={showGrid ? '#e5e7eb' : 'transparent'} />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          stroke="#6b7280"
        />
        <YAxis 
          domain={['dataMin - 0.1', 'dataMax + 0.1']}
          stroke="#6b7280"
        />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleString()}
          formatter={(value: any) => [
            typeof value === 'number' ? value.toFixed(4) : value,
            'Price'
          ]}
        />
        <Legend />
        
        <Area
          type="monotone"
          dataKey="close"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.3}
        />
        
        {/* Technical indicators */}
        {calculatedIndicators.map((indicator) => (
          indicator.visible && (
            <Line
              key={indicator.name}
              type="monotone"
              dataKey={indicator.name}
              stroke={indicator.color}
              strokeWidth={indicator.strokeWidth || 2}
              dot={false}
            />
          )
        ))}
      </AreaChart>
    );
  };

  // Render bar chart
  const renderBarChart = (data: any[]) => {
    return (
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={showGrid ? '#e5e7eb' : 'transparent'} />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          stroke="#6b7280"
        />
        <YAxis 
          domain={['dataMin - 0.1', 'dataMax + 0.1']}
          stroke="#6b7280"
        />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleString()}
          formatter={(value: any) => [
            typeof value === 'number' ? value.toFixed(4) : value,
            'Price'
          ]}
        />
        <Legend />
        
        <Bar 
          dataKey="close" 
          fill="#3b82f6"
          radius={[2, 2, 0, 0]}
        />
        
        {/* Technical indicators */}
        {calculatedIndicators.map((indicator) => (
          indicator.visible && (
            <Line
              key={indicator.name}
              type="monotone"
              dataKey={indicator.name}
              stroke={indicator.color}
              strokeWidth={indicator.strokeWidth || 2}
              dot={false}
            />
          )
        ))}
      </BarChart>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'candlestick':
        return renderCandlestick(visibleData);
      case 'line':
        return renderLineChart(visibleData);
      case 'area':
        return renderAreaChart(visibleData);
      case 'bar':
        return renderBarChart(visibleData);
      default:
        return renderLineChart(visibleData);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Energy Trading Chart
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Activity size={16} />
            <span>FPS: {performance.fps}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Timeframe selector */}
          <TimeframeSelector
            selectedTimeframe={timeframe}
            onTimeframeChange={onTimeframeChange || (() => {})}
          />
          
          {/* Chart controls */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => handleZoom('out')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={() => handleZoom('in')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => handlePan('left')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Pan Left"
            >
              <TrendingUp size={16} className="rotate-180" />
            </button>
            <button
              onClick={() => handlePan('right')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Pan Right"
            >
              <TrendingUp size={16} />
            </button>
          </div>
          
          {/* Additional controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded transition-colors ${
                showGrid ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="Toggle Grid"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Settings"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={() => onExport?.('png')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Export"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => setShowPatternRecognition(!showPatternRecognition)}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Pattern Recognition"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Chart Area */}
      <div className="relative" ref={chartRef}>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
        
        {/* Performance overlay */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
            <div>Points: {visibleData.length}</div>
            <div>Render: {performance.renderTime}ms</div>
            <div>FPS: {performance.fps}</div>
          </div>
        )}
      </div>
      
      {/* Technical Indicators Panel */}
      {showSettings && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <TechnicalIndicators
            indicators={indicators}
            calculatedIndicators={calculatedIndicators}
            onIndicatorAdd={onIndicatorAdd || (() => {})}
            onIndicatorRemove={onIndicatorRemove || (() => {})}
            onIndicatorUpdate={(name, updates) => {
              // Handle indicator updates
            }}
            onIndicatorToggle={(name, visible) => {
              // Handle indicator visibility toggle
            }}
          />
        </div>
      )}
      
      {/* Pattern Recognition Panel */}
      {showPatternRecognition && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <PatternRecognition
            patterns={detectedPatterns}
            data={visibleData}
            onPatternSelect={(pattern) => {
              // Handle pattern selection
            }}
          />
        </div>
      )}
      
      {/* Drawing Tools */}
      {interaction.isDrawing && (
        <div className="absolute inset-0 pointer-events-none">
          <DrawingTools
            onToolSelect={(tool) => setInteraction(prev => ({ ...prev, selectedTool: tool }))}
            selectedTool={interaction.selectedTool}
            onDrawingComplete={onDrawingComplete || (() => {})}
            drawings={drawings}
            onDrawingUpdate={(id, updates) => {
              // Handle drawing updates
            }}
            onDrawingDelete={(id) => {
              // Handle drawing deletion
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AdvancedCharting;
