import { useState, useEffect, useCallback, useMemo } from 'react';
import { PriceDataPoint, IndicatorConfig, TechnicalIndicatorData } from '@/types/charts';
import { ChartCalculations } from '@/utils/chartCalculations';

interface UseTechnicalIndicatorsOptions {
  data: PriceDataPoint[];
  indicators: IndicatorConfig[];
}

interface UseTechnicalIndicatorsReturn {
  calculatedIndicators: TechnicalIndicatorData[];
  addIndicator: (indicator: IndicatorConfig) => void;
  removeIndicator: (indicatorName: string) => void;
  updateIndicator: (indicatorName: string, updates: Partial<IndicatorConfig>) => void;
  clearAllIndicators: () => void;
  isCalculating: boolean;
}

export const useTechnicalIndicators = ({
  data,
  indicators,
}: UseTechnicalIndicatorsOptions): UseTechnicalIndicatorsReturn => {
  const [calculatedIndicators, setCalculatedIndicators] = useState<TechnicalIndicatorData[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateIndicator = useCallback((
    data: PriceDataPoint[],
    config: IndicatorConfig
  ): TechnicalIndicatorData | null => {
    if (data.length === 0) return null;

    const closePrices = data.map(d => d.close);
    let calculatedData: number[] = [];
    let name = '';

    try {
      switch (config.type) {
        case 'SMA':
          calculatedData = ChartCalculations.calculateSMA(closePrices, config.period);
          name = `SMA(${config.period})`;
          break;

        case 'EMA':
          calculatedData = ChartCalculations.calculateEMA(closePrices, config.period);
          name = `EMA(${config.period})`;
          break;

        case 'RSI':
          calculatedData = ChartCalculations.calculateRSI(closePrices, config.period);
          name = `RSI(${config.period})`;
          break;

        case 'MACD':
          const macdResult = ChartCalculations.calculateMACD(
            closePrices,
            config.parameters?.fastPeriod || 12,
            config.parameters?.slowPeriod || 26,
            config.parameters?.signalPeriod || 9
          );
          calculatedData = macdResult.macd;
          name = `MACD(${config.parameters?.fastPeriod || 12},${config.parameters?.slowPeriod || 26})`;
          break;

        case 'BB':
          const bbResult = ChartCalculations.calculateBollingerBands(
            closePrices,
            config.period,
            config.parameters?.stdDev || 2
          );
          calculatedData = bbResult.upper;
          name = `BB(${config.period},${config.parameters?.stdDev || 2})`;
          break;

        case 'STOCH':
          const stochResult = ChartCalculations.calculateStochastic(
            data,
            config.period,
            config.parameters?.dPeriod || 3
          );
          calculatedData = stochResult.k;
          name = `STOCH(${config.period},${config.parameters?.dPeriod || 3})`;
          break;

        default:
          return null;
      }

      return {
        name,
        data: calculatedData,
        color: config.color,
        strokeWidth: config.strokeWidth || 2,
        visible: config.visible,
      };
    } catch (error) {
      console.error(`Error calculating ${config.type}:`, error);
      return null;
    }
  }, []);

  const calculateAllIndicators = useCallback(async () => {
    if (data.length === 0 || indicators.length === 0) {
      setCalculatedIndicators([]);
      return;
    }

    setIsCalculating(true);

    try {
      const results = await Promise.all(
        indicators.map(config => {
          return new Promise<TechnicalIndicatorData | null>((resolve) => {
            setTimeout(() => {
              resolve(calculateIndicator(data, config));
            }, 0);
          });
        })
      );

      const validResults = results.filter(
        (result): result is TechnicalIndicatorData => result !== null
      );

      setCalculatedIndicators(validResults);
    } catch (error) {
      console.error('Error calculating indicators:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [data, indicators, calculateIndicator]);

  const addIndicator = useCallback((indicator: IndicatorConfig) => {
    setCalculatedIndicators(prev => {
      const existingIndex = prev.findIndex(ind => ind.name === indicator.type);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          name: `${indicator.type}(${indicator.period})`,
          data: [],
          color: indicator.color,
          strokeWidth: indicator.strokeWidth || 2,
          visible: indicator.visible,
        };
        return updated;
      }
      
      return [...prev, {
        name: `${indicator.type}(${indicator.period})`,
        data: [],
        color: indicator.color,
        strokeWidth: indicator.strokeWidth || 2,
        visible: indicator.visible,
      }];
    });
  }, []);

  const removeIndicator = useCallback((indicatorName: string) => {
    setCalculatedIndicators(prev => prev.filter(ind => !ind.name.includes(indicatorName)));
  }, []);

  const updateIndicator = useCallback((indicatorName: string, updates: Partial<IndicatorConfig>) => {
    setCalculatedIndicators(prev => 
      prev.map(ind => 
        ind.name.includes(indicatorName) 
          ? { ...ind, ...updates }
          : ind
      )
    );
  }, []);

  const clearAllIndicators = useCallback(() => {
    setCalculatedIndicators([]);
  }, []);

  const memoizedIndicators = useMemo(() => {
    return calculatedIndicators.map(indicator => ({
      ...indicator,
      data: indicator.data.map((value, index) => ({
        x: index,
        y: value,
        timestamp: data[index]?.timestamp || Date.now(),
      })),
    }));
  }, [calculatedIndicators, data]);

  useEffect(() => {
    calculateAllIndicators();
  }, [calculateAllIndicators]);

  return {
    calculatedIndicators: memoizedIndicators,
    addIndicator,
    removeIndicator,
    updateIndicator,
    clearAllIndicators,
    isCalculating,
  };
};
