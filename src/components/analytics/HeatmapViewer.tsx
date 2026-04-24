import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Download, 
  Settings, 
  Maximize2, 
  Grid3X3,
  MousePointer,
  Scroll,
  Layers,
  Calendar,
  Filter,
  RefreshCw,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  type: 'click' | 'scroll' | 'hover' | 'movement';
  timestamp: string;
  element?: string;
}

interface HeatmapData {
  points: HeatmapPoint[];
  viewport: {
    width: number;
    height: number;
  };
  metadata: {
    url: string;
    dateRange: {
      start: string;
      end: string;
    };
    totalSessions: number;
    totalInteractions: number;
  };
}

interface HeatmapViewerProps {
  data: HeatmapData;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  onFilterChange?: (filters: HeatmapFilters) => void;
}

interface HeatmapFilters {
  type: 'all' | 'click' | 'scroll' | 'hover' | 'movement';
  intensity: {
    min: number;
    max: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
  showElements: boolean;
  opacity: number;
  colorScheme: 'hot' | 'cool' | 'viridis' | 'plasma';
}

export const HeatmapViewer: React.FC<HeatmapViewerProps> = ({
  data,
  isLoading = false,
  error = null,
  className = '',
  onExport,
  onFilterChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<HeatmapFilters>({
    type: 'all',
    intensity: { min: 0, max: 100 },
    dateRange: { start: '', end: '' },
    showElements: true,
    opacity: 0.7,
    colorScheme: 'hot',
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<HeatmapPoint | null>(null);
  const [stats, setStats] = useState({
    totalPoints: 0,
    averageIntensity: 0,
    hotspots: 0,
    coverage: 0,
  });

  const getColorScheme = useCallback((intensity: number, scheme: string): string => {
    const normalizedIntensity = Math.min(1, Math.max(0, intensity / 100));
    
    switch (scheme) {
      case 'hot':
        return `rgba(255, ${Math.floor(255 * (1 - normalizedIntensity))}, 0, ${filters.opacity})`;
      case 'cool':
        return `rgba(0, ${Math.floor(255 * (1 - normalizedIntensity))}, 255, ${filters.opacity})`;
      case 'viridis':
        const r = Math.floor(68 + normalizedIntensity * 187);
        const g = Math.floor(1 + normalizedIntensity * 254);
        const b = Math.floor(84 + normalizedIntensity * 171);
        return `rgba(${r}, ${g}, ${b}, ${filters.opacity})`;
      case 'plasma':
        const pr = Math.floor(13 + normalizedIntensity * 242);
        const pg = Math.floor(8 + normalizedIntensity * 247);
        const pb = Math.floor(135 + normalizedIntensity * 120);
        return `rgba(${pr}, ${pg}, ${pb}, ${filters.opacity})`;
      default:
        return `rgba(255, 0, 0, ${filters.opacity})`;
    }
  }, [filters.opacity]);

  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = data.viewport;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const filteredPoints = data.points.filter(point => {
      if (filters.type !== 'all' && point.type !== filters.type) return false;
      if (point.intensity < filters.intensity.min || point.intensity > filters.intensity.max) return false;
      return true;
    });

    const gridSize = 20;
    const heatmapGrid: Record<string, number> = {};

    filteredPoints.forEach(point => {
      const gridX = Math.floor(point.x / gridSize);
      const gridY = Math.floor(point.y / gridSize);
      const key = `${gridX},${gridY}`;
      heatmapGrid[key] = (heatmapGrid[key] || 0) + point.intensity;
    });

    Object.entries(heatmapGrid).forEach(([key, intensity]) => {
      const [gridX, gridY] = key.split(',').map(Number);
      const x = gridX * gridSize;
      const y = gridY * gridSize;

      ctx.fillStyle = getColorScheme(intensity, filters.colorScheme);
      ctx.fillRect(x, y, gridSize, gridSize);
    });

    if (filters.showElements) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      filteredPoints.forEach(point => {
        if (point.element) {
          ctx.strokeRect(point.x - 10, point.y - 10, 20, 20);
        }
      });
    }

    updateStats(filteredPoints);
  }, [data, filters, getColorScheme]);

  const updateStats = useCallback((points: HeatmapPoint[]) => {
    const totalPoints = points.length;
    const averageIntensity = points.length > 0 
      ? points.reduce((sum, point) => sum + point.intensity, 0) / points.length 
      : 0;
    
    const hotspots = points.filter(point => point.intensity > 80).length;
    const uniquePositions = new Set(points.map(p => `${Math.floor(p.x/20)},${Math.floor(p.y/20)}`));
    const coverage = (uniquePositions.size / (data.viewport.width * data.viewport.height / 400)) * 100;

    setStats({
      totalPoints,
      averageIntensity,
      hotspots,
      coverage: Math.min(100, coverage),
    });
  }, [data.viewport]);

  useEffect(() => {
    drawHeatmap();
  }, [drawHeatmap]);

  const handleFilterChange = (newFilters: Partial<HeatmapFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const handleExport = (format: 'png' | 'svg' | 'csv') => {
    if (format === 'png' && canvasRef.current) {
      const link = document.createElement('a');
      link.download = `heatmap-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
    onExport?.(format);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-blue-600">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-lg font-medium">Loading heatmap data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <div>
            <h3 className="font-medium">Error loading heatmap</h3>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">User Interaction Heatmap</h2>
            <p className="text-sm text-gray-500">
              {data.metadata.url} • {data.metadata.totalSessions} sessions • {data.metadata.totalInteractions} interactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <div className="relative group">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('png')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Export as PNG
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Export as CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalPoints.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.averageIntensity.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Avg Intensity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.hotspots.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Hotspots</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.coverage.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Coverage</div>
          </div>
        </div>
      </div>

      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-gray-200 p-4 bg-gray-50"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interaction Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange({ type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Interactions</option>
                <option value="click">Clicks</option>
                <option value="scroll">Scrolls</option>
                <option value="hover">Hovers</option>
                <option value="movement">Movement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
              <select
                value={filters.colorScheme}
                onChange={(e) => handleFilterChange({ colorScheme: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="hot">Hot</option>
                <option value="cool">Cool</option>
                <option value="viridis">Viridis</option>
                <option value="plasma">Plasma</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Opacity: {filters.opacity.toFixed(1)}</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={filters.opacity}
                onChange={(e) => handleFilterChange({ opacity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showElements"
                checked={filters.showElements}
                onChange={(e) => handleFilterChange({ showElements: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="showElements" className="text-sm font-medium text-gray-700">
                Show Elements
              </label>
            </div>
          </div>
        </motion.div>
      )}

      <div ref={containerRef} className="relative bg-gray-100 overflow-auto" style={{ maxHeight: '600px' }}>
        <canvas
          ref={canvasRef}
          className="border border-gray-300 cursor-crosshair"
          onMouseMove={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const point = data.points.find(p => 
                Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 10
              );
              setHoveredPoint(point || null);
            }
          }}
        />
        
        {hoveredPoint && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
            <div className="text-sm">
              <div className="font-medium">{hoveredPoint.type}</div>
              <div className="text-gray-500">Intensity: {hoveredPoint.intensity}%</div>
              <div className="text-gray-500">Element: {hoveredPoint.element || 'Unknown'}</div>
              <div className="text-gray-500">Time: {new Date(hoveredPoint.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
