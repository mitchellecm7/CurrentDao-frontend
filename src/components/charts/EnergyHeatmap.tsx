import React, { useState, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, Filter, Grid3X3 } from 'lucide-react';
import { BaseChart } from './BaseChart';
import { useChart, useChartAccessibility } from '../../hooks/useCharts';
import { 
  HeatmapData, 
  HeatmapConfig, 
  HeatmapViewType, 
  HeatmapTooltipData, 
  HeatmapInteractionState,
  HeatmapExportOptions 
} from '../../types/heatmap';
import { formatChartValue, formatChartDate, exportChart } from '../../utils/chartHelpers';

interface EnergyHeatmapProps {
  data: HeatmapData;
  config?: Partial<HeatmapConfig>;
  onCellClick?: (data: HeatmapTooltipData) => void;
  onExport?: (options: HeatmapExportOptions) => void;
  className?: string;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS_OF_DAY = Array.from({ length: 24 }, (_, i) => i);

const COLOR_SCHEMES = {
  blue: ['#f0f9ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
  orange: ['#fff7ed', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12', '#431407'],
  purple: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7c3aed', '#6d28d9', '#581c87']
};

export const EnergyHeatmap: React.FC<EnergyHeatmapProps> = ({
  data,
  config = {},
  onCellClick,
  onExport,
  className = '',
}) => {
  const [interactionState, setInteractionState] = useState<HeatmapInteractionState>({
    hoveredCell: null,
    selectedCell: null,
    isDragging: false,
  });

  const [viewType, setViewType] = useState<HeatmapViewType>(config.viewType || 'personal');
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipData, setTooltipData] = useState<HeatmapTooltipData | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const { announce } = useChartAccessibility();

  const currentConfig: HeatmapConfig = useMemo(() => ({
    viewType,
    dateRange: config.dateRange || {
      start: data.metadata.startDate,
      end: data.metadata.endDate,
    },
    colorScheme: config.colorScheme || 'blue',
    showLabels: config.showLabels ?? true,
    showGrid: config.showGrid ?? true,
    animationEnabled: config.animationEnabled ?? true,
  }), [viewType, config, data.metadata]);

  const colorScale = useMemo(() => {
    const values = data.week.map(point => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const colors = COLOR_SCHEMES[currentConfig.colorScheme];
    
    return {
      min: minValue,
      max: maxValue,
      colors,
      thresholds: colors.map((_, i) => minValue + (maxValue - minValue) * (i / (colors.length - 1))),
    };
  }, [data.week, currentConfig.colorScheme]);

  const getColorForValue = useCallback((value: number): string => {
    const { min, max, colors, thresholds } = colorScale;
    if (value <= min) return colors[0];
    if (value >= max) return colors[colors.length - 1];
    
    for (let i = 0; i < thresholds.length - 1; i++) {
      if (value >= thresholds[i] && value <= thresholds[i + 1]) {
        return colors[i];
      }
    }
    return colors[colors.length - 1];
  }, [colorScale]);

  const handleCellMouseEnter = useCallback((hour: number, day: number, event: React.MouseEvent) => {
    const dataPoint = data.week.find(
      point => point.hour === hour && point.day === day
    );
    
    if (dataPoint) {
      const tooltipData: HeatmapTooltipData = {
        hour,
        day: DAYS_OF_WEEK[day],
        value: dataPoint.value,
        formattedValue: formatChartValue(dataPoint.value, 'energy'),
        percentage: (dataPoint.value / data.metadata.peakConsumption) * 100,
        timestamp: dataPoint.timestamp,
      };
      
      setTooltipData(tooltipData);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
      setShowTooltip(true);
      setInteractionState(prev => ({
        ...prev,
        hoveredCell: { hour, day },
      }));
    }
  }, [data.week, data.metadata.peakConsumption]);

  const handleCellMouseLeave = useCallback(() => {
    setShowTooltip(false);
    setInteractionState(prev => ({
      ...prev,
      hoveredCell: null,
    }));
  }, []);

  const handleCellClick = useCallback((hour: number, day: number) => {
    const dataPoint = data.week.find(
      point => point.hour === hour && point.day === day
    );
    
    if (dataPoint && tooltipData) {
      setInteractionState(prev => ({
        ...prev,
        selectedCell: { hour, day },
      }));
      onCellClick?.(tooltipData);
      announce(`Selected ${tooltipData.day} at ${tooltipData.hour}:00 - ${tooltipData.formattedValue}`);
    }
  }, [data.week, tooltipData, onCellClick, announce]);

  const handleExport = useCallback(async (format: 'png' | 'csv') => {
    const options: HeatmapExportOptions = {
      format,
      filename: `energy-heatmap-${viewType}-${formatChartDate(new Date(), 'yyyy-MM-dd')}`,
      includeMetadata: true,
    };

    try {
      if (format === 'png' && chartRef.current) {
        await exportChart(chartRef.current, {
          format: 'png',
          filename: options.filename,
        });
      } else if (format === 'csv') {
        // Generate CSV content
        const csvContent = [
          ['Day', 'Hour', 'Consumption (kWh)', 'Timestamp'],
          ...data.week.map(point => [
            DAYS_OF_WEEK[point.day],
            point.hour,
            point.value.toFixed(2),
            point.timestamp ? formatChartDate(point.timestamp) : '',
          ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${options.filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      onExport?.(options);
      announce(`Heatmap exported as ${format.toUpperCase()}`);
    } catch (error) {
      announce('Failed to export heatmap');
    }
  }, [data.week, viewType, onExport, announce]);

  const renderHeatmapGrid = () => {
    return (
      <div className="relative">
        {/* Hour labels */}
        {currentConfig.showLabels && (
          <div className="flex mb-2">
            <div className="w-12"></div>
            {HOURS_OF_DAY.map(hour => (
              <div key={hour} className="flex-1 text-xs text-center text-gray-600">
                {hour}
              </div>
            ))}
          </div>
        )}
        
        {/* Heatmap grid */}
        <div className="flex">
          {currentConfig.showLabels && (
            <div className="w-12 pr-2">
              {DAYS_OF_WEEK.map((day, dayIndex) => (
                <div key={day} className="h-8 flex items-center justify-end text-xs text-gray-600">
                  {day}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex-1 grid grid-cols-24 gap-0.5">
            {data.week.map((dataPoint, index) => {
              const isHovered = interactionState.hoveredCell?.hour === dataPoint.hour && 
                              interactionState.hoveredCell?.day === dataPoint.day;
              const isSelected = interactionState.selectedCell?.hour === dataPoint.hour && 
                               interactionState.selectedCell?.day === dataPoint.day;
              
              return (
                <motion.div
                  key={`${dataPoint.day}-${dataPoint.hour}`}
                  className={`
                    aspect-square rounded cursor-pointer transition-all duration-200
                    ${currentConfig.showGrid ? 'border border-gray-200' : ''}
                    ${isHovered ? 'ring-2 ring-blue-400 z-10' : ''}
                    ${isSelected ? 'ring-2 ring-purple-500 z-10' : ''}
                  `}
                  style={{
                    backgroundColor: getColorForValue(dataPoint.value),
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    transition: { 
                      delay: currentConfig.animationEnabled ? index * 0.01 : 0,
                      duration: 0.3 
                    }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={(e) => handleCellMouseEnter(dataPoint.hour, dataPoint.day, e)}
                  onMouseLeave={handleCellMouseLeave}
                  onClick={() => handleCellClick(dataPoint.hour, dataPoint.day)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${DAYS_OF_WEEK[dataPoint.day]} at ${dataPoint.hour}:00 - ${formatChartValue(dataPoint.value, 'energy')}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCellClick(dataPoint.hour, dataPoint.day);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderColorScale = () => {
    return (
      <div className="mt-6 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">Low</span>
          <div className="flex space-x-1">
            {colorScale.colors.map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">High</span>
        </div>
        <div className="ml-4 text-xs text-gray-600">
          {formatChartValue(colorScale.min, 'energy')} - {formatChartValue(colorScale.max, 'energy')}
        </div>
      </div>
    );
  };

  const renderTooltip = () => {
    if (!showTooltip || !tooltipData) return null;
    
    return (
      <div
        className="fixed z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg pointer-events-none"
        style={{
          left: tooltipPosition.x + 10,
          top: tooltipPosition.y - 40,
        }}
      >
        <div className="text-sm font-semibold">{tooltipData.day} at {tooltipData.hour}:00</div>
        <div className="text-xs">{tooltipData.formattedValue}</div>
        <div className="text-xs text-gray-300">{tooltipData.percentage.toFixed(1)}% of peak</div>
      </div>
    );
  };

  return (
    <BaseChart
      title={`Energy Consumption Heatmap - ${viewType.charAt(0).toUpperCase() + viewType.slice(1)}`}
      description={`Weekly energy consumption patterns from ${formatChartDate(currentConfig.dateRange.start)} to ${formatChartDate(currentConfig.dateRange.end)}`}
      className={className}
      showControls={true}
      exportEnabled={true}
    >
      {/* View Type Selector */}
      <div className="flex justify-center mb-4 space-x-2">
        {(['personal', 'community', 'grid'] as HeatmapViewType[]).map(type => (
          <button
            key={type}
            onClick={() => setViewType(type)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Main heatmap */}
      <div ref={chartRef} className="p-4">
        {renderHeatmapGrid()}
        {renderColorScale()}
      </div>

      {/* Export controls */}
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={() => handleExport('png')}
          className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export PNG</span>
        </button>
        <button
          onClick={() => handleExport('csv')}
          className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Tooltip */}
      {renderTooltip()}
    </BaseChart>
  );
};

export default EnergyHeatmap;
