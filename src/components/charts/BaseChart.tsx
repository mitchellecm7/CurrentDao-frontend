import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useChart, useChartAccessibility } from '@/hooks/useCharts';
import { ChartConfig, ChartExportOptions } from '@/types/charts';
import { defaultChartTheme } from '@/utils/chartHelpers';

interface BaseChartProps extends ChartConfig {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  showControls?: boolean;
  onDataPointClick?: (data: any) => void;
  ariaLabel?: string;
}

export const BaseChart: React.FC<BaseChartProps> = ({
  children,
  title,
  description,
  className = '',
  showControls = true,
  onDataPointClick,
  ariaLabel,
  animation = true,
  exportEnabled = true,
  zoomEnabled = false,
  ...config
}) => {
  const {
    chartRef,
    dimensions,
    interactionState,
    isLoading,
    error,
    handlers,
  } = useChart({
    ...config,
    animation,
    exportEnabled,
    zoomEnabled,
    onDataPointClick,
  });

  const { announce, announcements } = useChartAccessibility();

  const handleExport = async (format: 'png' | 'svg') => {
    try {
      await handlers.onExport({
        format,
        filename: title?.toLowerCase().replace(/\s+/g, '-') || 'chart',
      });
      announce(`Chart exported as ${format.toUpperCase()}`);
    } catch (err) {
      announce('Failed to export chart');
    }
  };

  const handleZoomIn = () => {
    announce('Zoomed in');
  };

  const handleZoomOut = () => {
    announce('Zoomed out');
  };

  const handleReset = () => {
    handlers.onReset();
    announce('Chart view reset');
  };

  useEffect(() => {
    if (title) {
      announceChartType(title);
    }
  }, [title]);

  const announceChartType = (chartName: string) => {
    announce(`Loaded ${chartName} chart`);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg p-4 ${className}`}
      role="region"
      aria-label={ariaLabel || title || 'Chart'}
      aria-describedby={description ? 'chart-description' : undefined}
    >
      {/* Header */}
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {title}
            </h2>
          )}
          {description && (
            <p id="chart-description" className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="flex justify-end items-center gap-2 mb-4">
          {zoomEnabled && (
            <>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Reset view"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}
          
          {exportEnabled && (
            <>
              <button
                onClick={() => handleExport('png')}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                aria-label="Export as PNG"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleExport('svg')}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                aria-label="Export as SVG"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4"
            role="alert"
          >
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Chart Container */}
      <AnimatePresence mode="wait">
        {!isLoading && !error && (
          <motion.div
            key="chart-content"
            ref={chartRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: animation ? 0.3 : 0 }}
            className="relative"
            style={{
              width: dimensions.width,
              height: dimensions.height,
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>

      {/* Interaction Status */}
      {interactionState.isZoomed && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Zoomed view - Click reset to return to default view
        </div>
      )}
    </div>
  );
};

export default BaseChart;
