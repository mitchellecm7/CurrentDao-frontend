import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PriceDataPoint, IndicatorConfig, ChartViewport } from '@/types/charts';
import { calculateTechnicalIndicators } from '@/services/charts/indicator-engine';
import { detectPatterns } from '@/services/charts/pattern-detection';

interface UseAdvancedChartingProps {
  data: PriceDataPoint[];
  indicators: IndicatorConfig[];
  viewport: ChartViewport;
  realTimeData?: boolean;
}

export const useAdvancedCharting = ({
  data,
  indicators,
  viewport,
  realTimeData = false
}: UseAdvancedChartingProps) => {
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [calculatedIndicators, setCalculatedIndicators] = useState<any[]>([]);
  const [detectedPatterns, setDetectedPatterns] = useState<any[]>([]);
  const [performance, setPerformance] = useState({
    fps: 60,
    renderTime: 0,
    lastUpdate: Date.now()
  });

  const frameRef = useRef<number>();
  const lastFrameTime = useRef<number>(Date.now());

  // Process raw data for chart rendering
  const processData = useCallback((rawData: PriceDataPoint[]) => {
    return rawData.map(point => ({
      ...point,
      timestamp: new Date(point.timestamp).getTime(),
      date: new Date(point.timestamp).toLocaleDateString(),
      time: new Date(point.timestamp).toLocaleTimeString()
    }));
  }, []);

  // Calculate technical indicators
  const calculateIndicators = useCallback(async (data: PriceDataPoint[], configs: IndicatorConfig[]) => {
    try {
      const results = await Promise.all(
        configs.map(async (config) => {
          const indicatorData = await calculateTechnicalIndicators(data, config);
          return {
            name: `${config.type}(${config.period})`,
            data: indicatorData,
            color: config.color,
            strokeWidth: config.strokeWidth,
            visible: config.visible
          };
        })
      );
      setCalculatedIndicators(results);
    } catch (error) {
      console.error('Error calculating indicators:', error);
    }
  }, []);

  // Detect patterns in data
  const performPatternDetection = useCallback(async (data: PriceDataPoint[]) => {
    try {
      const patterns = await detectPatterns(data);
      setDetectedPatterns(patterns);
    } catch (error) {
      console.error('Error detecting patterns:', error);
    }
  }, []);

  // Performance monitoring
  const measurePerformance = useCallback(() => {
    const now = Date.now();
    const deltaTime = now - lastFrameTime.current;
    const fps = Math.round(1000 / deltaTime);
    
    setPerformance(prev => ({
      fps,
      renderTime: deltaTime,
      lastUpdate: now
    }));
    
    lastFrameTime.current = now;
  }, []);

  // Main effect to process data and calculate indicators
  useEffect(() => {
    const visibleData = data.slice(viewport.startIndex, viewport.endIndex);
    const processed = processData(visibleData);
    setProcessedData(processed);
    
    if (indicators.length > 0) {
      calculateIndicators(visibleData, indicators);
    }
    
    performPatternDetection(visibleData);
  }, [data, viewport, indicators, processData, calculateIndicators, performPatternDetection]);

  // Real-time data updates
  useEffect(() => {
    if (!realTimeData) return;

    const interval = setInterval(() => {
      measurePerformance();
    }, 1000 / 60); // 60 FPS target

    return () => clearInterval(interval);
  }, [realTimeData, measurePerformance]);

  // Animation frame for smooth rendering
  useEffect(() => {
    const animate = () => {
      measurePerformance();
      frameRef.current = requestAnimationFrame(animate);
    };
    
    frameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [measurePerformance]);

  // Handlers for chart interactions
  const handlers = useMemo(() => ({
    onViewportChange: (newViewport: Partial<ChartViewport>) => {
      // Handle viewport changes
    },
    onIndicatorAdd: (indicator: IndicatorConfig) => {
      // Handle indicator addition
    },
    onIndicatorRemove: (indicatorName: string) => {
      // Handle indicator removal
    },
    onPatternSelect: (patternId: string) => {
      // Handle pattern selection
    }
  }), []);

  return {
    processedData,
    calculatedIndicators,
    detectedPatterns,
    performance,
    handlers
  };
};
