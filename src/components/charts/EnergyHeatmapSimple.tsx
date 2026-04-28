import React, { useState, useCallback, useMemo } from 'react';

// Simplified types without external dependencies
interface HeatmapDataPoint {
  hour: number;
  day: number;
  value: number;
  timestamp?: Date;
}

interface HeatmapData {
  week: HeatmapDataPoint[];
  metadata: {
    startDate: Date;
    endDate: Date;
    totalConsumption: number;
    averageConsumption: number;
    peakConsumption: number;
    peakHour: number;
    peakDay: number;
  };
}

type HeatmapViewType = 'personal' | 'community' | 'grid';

interface HeatmapTooltipData {
  hour: number;
  day: string;
  value: number;
  formattedValue: string;
  percentage: number;
  timestamp?: Date;
}

interface EnergyHeatmapSimpleProps {
  data: HeatmapData;
  viewType?: HeatmapViewType;
  onCellClick?: (data: HeatmapTooltipData) => void;
  onExport?: (format: 'png' | 'csv') => void;
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
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

// Utility functions
const formatChartValue = (value: number, type: 'currency' | 'percentage' | 'number' | 'energy' = 'number'): string => {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'energy':
      return `${value.toFixed(2)} kWh`;
    default:
      return value.toLocaleString();
  }
};

const formatChartDate = (date: Date, formatStr: string = 'MMM dd, yyyy'): string => {
  // Simple date formatting without date-fns
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};

export const EnergyHeatmapSimple: React.FC<EnergyHeatmapSimpleProps> = ({
  data,
  viewType = 'personal',
  onCellClick,
  onExport,
  onDateRangeChange,
  className = '',
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ hour: number; day: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ hour: number; day: number } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipData, setTooltipData] = useState<HeatmapTooltipData | null>(null);

  const colorScheme = 'blue'; // Default color scheme

  const colorScale = useMemo(() => {
    const values = data.week.map(point => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const colors = COLOR_SCHEMES[colorScheme];
    
    return {
      min: minValue,
      max: maxValue,
      colors,
      thresholds: colors.map((_, i) => minValue + (maxValue - minValue) * (i / (colors.length - 1))),
    };
  }, [data.week, colorScheme]);

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
      setHoveredCell({ hour, day });
    }
  }, [data.week, data.metadata.peakConsumption]);

  const handleCellMouseLeave = useCallback(() => {
    setShowTooltip(false);
    setHoveredCell(null);
  }, []);

  const handleCellClick = useCallback((hour: number, day: number) => {
    const dataPoint = data.week.find(
      point => point.hour === hour && point.day === day
    );
    
    if (dataPoint && tooltipData) {
      setSelectedCell({ hour, day });
      onCellClick?.(tooltipData);
    }
  }, [data.week, tooltipData, onCellClick]);

  const handleExport = useCallback((format: 'png' | 'csv') => {
    if (format === 'csv') {
      // Generate CSV content
      const headers = ['Day', 'Hour', 'Consumption (kWh)', 'Timestamp'];
      const rows = data.week.map(point => [
        DAYS_OF_WEEK[point.day],
        point.hour,
        point.value.toFixed(2),
        point.timestamp ? point.timestamp.toISOString() : '',
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `energy-heatmap-${viewType}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      onExport?.(format);
    } else if (format === 'png') {
      // For PNG export, we'll use a simple approach with canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size
      canvas.width = 1200;
      canvas.height = 800;
      
      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw title
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`Energy Consumption Heatmap - ${viewType}`, 50, 50);
      
      // Draw subtitle
      ctx.font = '14px Arial';
      ctx.fillText(`${formatChartDate(data.metadata.startDate)} - ${formatChartDate(data.metadata.endDate)}`, 50, 80);
      
      // Draw heatmap grid
      const cellSize = 30;
      const startX = 100;
      const startY = 120;
      
      // Draw hour labels
      ctx.font = '10px Arial';
      ctx.fillStyle = '#6b7280';
      HOURS_OF_DAY.forEach((hour, i) => {
        ctx.fillText(hour.toString(), startX + i * cellSize, startY - 10);
      });
      
      // Draw day labels and cells
      DAYS_OF_WEEK.forEach((day, dayIndex) => {
        // Day label
        ctx.fillText(day, startX - 30, startY + dayIndex * cellSize + 20);
        
        // Heatmap cells
        for (let hour = 0; hour < 24; hour++) {
          const dataPoint = data.week.find(p => p.day === dayIndex && p.hour === hour);
          if (dataPoint) {
            ctx.fillStyle = getColorForValue(dataPoint.value);
            ctx.fillRect(startX + hour * cellSize, startY + dayIndex * cellSize, cellSize - 2, cellSize - 2);
          }
        }
      });
      
      // Draw color scale
      const scaleStartY = startY + 7 * cellSize + 40;
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.fillText('Low', startX, scaleStartY + 10);
      ctx.fillText('High', startX + 20 * cellSize, scaleStartY + 10);
      
      colorScale.colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(startX + i * cellSize * 2, scaleStartY, cellSize * 2, 20);
      });
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `energy-heatmap-${viewType}-${new Date().toISOString().split('T')[0]}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
      
      onExport?.(format);
    }
  }, [data, viewType, colorScale, getColorForValue, onExport]);

  const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
    onDateRangeChange?.(startDate, endDate);
  }, [onDateRangeChange]);

  const renderHeatmapGrid = () => {
    return (
      <div className="relative">
        {/* Hour labels */}
        <div className="flex mb-2">
          <div className="w-12"></div>
          {HOURS_OF_DAY.map(hour => (
            <div key={hour} className="flex-1 text-xs text-center text-gray-600">
              {hour}
            </div>
          ))}
        </div>
        
        {/* Heatmap grid */}
        <div className="flex">
          {/* Day labels */}
          <div className="w-12 pr-2">
            {DAYS_OF_WEEK.map((day, dayIndex) => (
              <div key={day} className="h-8 flex items-center justify-end text-xs text-gray-600">
                {day}
              </div>
            ))}
          </div>
          
          {/* Heatmap cells */}
          <div className="flex-1 grid grid-cols-24 gap-0.5">
            {data.week.map((dataPoint, index) => {
              const isHovered = hoveredCell?.hour === dataPoint.hour && 
                              hoveredCell?.day === dataPoint.day;
              const isSelected = selectedCell?.hour === dataPoint.hour && 
                               selectedCell?.day === dataPoint.day;
              
              return (
                <div
                  key={`${dataPoint.day}-${dataPoint.hour}`}
                  className={`
                    aspect-square rounded cursor-pointer transition-all duration-200
                    border border-gray-200
                    ${isHovered ? 'ring-2 ring-blue-400 z-10' : ''}
                    ${isSelected ? 'ring-2 ring-purple-500 z-10' : ''}
                  `}
                  style={{
                    backgroundColor: getColorForValue(dataPoint.value),
                  }}
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
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Energy Consumption Heatmap - {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
        </h2>
        <p className="text-sm text-gray-600">
          Weekly energy consumption patterns from {formatChartDate(data.metadata.startDate)} to {formatChartDate(data.metadata.endDate)}
        </p>
      </div>

      {/* View Type Selector */}
      <div className="flex justify-center mb-4 space-x-2">
        {(['personal', 'community', 'grid'] as HeatmapViewType[]).map(type => (
          <button
            key={type}
            disabled={type !== viewType} // Disable non-selected views for demo
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

      {/* Date Range Selection */}
      <div className="flex justify-center mb-4 space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">From:</label>
          <input
            type="date"
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            defaultValue={data.metadata.startDate.toISOString().split('T')[0]}
            onChange={(e) => {
              const newStartDate = new Date(e.target.value);
              handleDateRangeChange(newStartDate, data.metadata.endDate);
            }}
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">To:</label>
          <input
            type="date"
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            defaultValue={data.metadata.endDate.toISOString().split('T')[0]}
            onChange={(e) => {
              const newEndDate = new Date(e.target.value);
              handleDateRangeChange(data.metadata.startDate, newEndDate);
            }}
          />
        </div>
      </div>

      {/* Main heatmap */}
      <div className="p-4">
        {renderHeatmapGrid()}
        {renderColorScale()}
      </div>

      {/* Export Controls */}
      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={() => handleExport('csv')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export CSV</span>
        </button>
        <button
          onClick={() => handleExport('png')}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Export PNG</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatChartValue(data.metadata.totalConsumption, 'energy')}
          </div>
          <div className="text-xs text-gray-600">Total Consumption</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatChartValue(data.metadata.averageConsumption, 'energy')}
          </div>
          <div className="text-xs text-gray-600">Average Consumption</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {formatChartValue(data.metadata.peakConsumption, 'energy')}
          </div>
          <div className="text-xs text-gray-600">Peak Consumption</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {DAYS_OF_WEEK[data.metadata.peakDay]} {data.metadata.peakHour}:00
          </div>
          <div className="text-xs text-gray-600">Peak Time</div>
        </div>
      </div>

      {/* Tooltip */}
      {renderTooltip()}
    </div>
  );
};

export default EnergyHeatmapSimple;
