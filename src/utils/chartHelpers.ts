import { format } from 'date-fns';
import { ChartData, ChartTheme, ChartExportOptions, EnergyTradingData, MarketTrendData, UserAnalyticsData } from '@/types/charts';

export const defaultChartTheme: ChartTheme = {
  backgroundColor: '#ffffff',
  gridColor: '#e5e7eb',
  textColor: '#374151',
  colors: [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#f97316', // orange-500
  ],
};

export const energyTradingTheme: ChartTheme = {
  backgroundColor: '#ffffff',
  gridColor: '#e5e7eb',
  textColor: '#374151',
  colors: [
    '#10b981', // emerald-500 for energy
    '#3b82f6', // blue-500 for trading
    '#f59e0b', // amber-500 for demand
    '#ef4444', // red-500 for supply
  ],
};

export const formatChartValue = (value: number, type: 'currency' | 'percentage' | 'number' | 'energy' = 'number'): string => {
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

export const formatChartDate = (date: string | number | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return format(dateObj, formatStr);
};

export const processEnergyTradingData = (rawData: EnergyTradingData[]): ChartData[] => {
  return [
    {
      name: 'Price',
      data: rawData.map(item => ({
        x: item.timestamp,
        y: item.price,
        label: formatChartDate(item.timestamp),
      })),
      color: energyTradingTheme.colors[1],
    },
    {
      name: 'Volume',
      data: rawData.map(item => ({
        x: item.timestamp,
        y: item.volume,
        label: formatChartDate(item.timestamp),
      })),
      color: energyTradingTheme.colors[0],
    },
    {
      name: 'Demand',
      data: rawData.map(item => ({
        x: item.timestamp,
        y: item.demand,
        label: formatChartDate(item.timestamp),
      })),
      color: energyTradingTheme.colors[2],
    },
    {
      name: 'Supply',
      data: rawData.map(item => ({
        x: item.timestamp,
        y: item.supply,
        label: formatChartDate(item.timestamp),
      })),
      color: energyTradingTheme.colors[3],
    },
  ];
};

export const processMarketTrendData = (rawData: MarketTrendData[]): ChartData[] => {
  return [
    {
      name: 'Market Change',
      data: rawData.map(item => ({
        x: item.period,
        y: item.change,
        label: item.period,
      })),
      color: defaultChartTheme.colors[0],
    },
    {
      name: 'Volume',
      data: rawData.map(item => ({
        x: item.period,
        y: item.volume,
        label: item.period,
      })),
      color: defaultChartTheme.colors[1],
    },
  ];
};

export const processUserAnalyticsData = (rawData: UserAnalyticsData[]): ChartData[] => {
  return [
    {
      name: 'Trades',
      data: rawData.map(item => ({
        x: item.timestamp,
        y: item.trades,
        label: formatChartDate(item.timestamp),
      })),
      color: defaultChartTheme.colors[0],
    },
    {
      name: 'Volume',
      data: rawData.map(item => ({
        x: item.timestamp,
        y: item.volume,
        label: formatChartDate(item.timestamp),
      })),
      color: defaultChartTheme.colors[1],
    },
    {
      name: 'Profit',
      data: rawData.map(item => ({
        x: item.timestamp,
        y: item.profit,
        label: formatChartDate(item.timestamp),
      })),
      color: defaultChartTheme.colors[2],
    },
    {
      name: 'Efficiency',
      data: rawData.map(item => ({
        x: item.timestamp,
        y: item.efficiency,
        label: formatChartDate(item.timestamp),
      })),
      color: defaultChartTheme.colors[3],
    },
  ];
};

export const generateRandomData = (points: number = 10, min: number = 0, max: number = 100): ChartData[] => {
  return [
    {
      name: 'Sample Data',
      data: Array.from({ length: points }, (_, i) => ({
        x: `Point ${i + 1}`,
        y: Math.floor(Math.random() * (max - min + 1)) + min,
        label: `Point ${i + 1}`,
      })),
      color: defaultChartTheme.colors[0],
    },
  ];
};

export const calculateChartDimensions = (containerWidth: number, containerHeight: number, aspectRatio: number = 16 / 9) => {
  const width = containerWidth;
  const height = Math.min(containerHeight, width / aspectRatio);

  return {
    width,
    height,
    margin: {
      top: 20,
      right: 30,
      bottom: 40,
      left: 60,
    },
  };
};

export const exportChart = async (chartElement: HTMLElement, options: ChartExportOptions): Promise<void> => {
  const { format: exportFormat, filename = 'chart', quality = 0.95, backgroundColor = '#ffffff' } = options;

  try {
    if (exportFormat === 'png') {
      // Dynamically import html2canvas to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(chartElement, {
        backgroundColor,
        scale: 2, // High DPI
        useCORS: true,
        allowTaint: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png', quality);
    } else if (exportFormat === 'svg') {
      // SVG export would require different implementation
      const svgData = new XMLSerializer().serializeToString(chartElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export chart');
  }
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const validateChartData = (data: ChartData[]): boolean => {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  return data.every(series =>
    series.name &&
    Array.isArray(series.data) &&
    series.data.every(point =>
      point.x !== undefined &&
      point.y !== undefined &&
      typeof point.y === 'number'
    )
  );
};

export const getColorScale = (data: ChartData[], theme: ChartTheme = defaultChartTheme): string[] => {
  const colors = data.map((series, index) =>
    series.color || theme.colors[index % theme.colors.length]
  );
  return colors;
};

export const getResponsiveConfig = (width: number) => {
  if (width < 640) {
    // Mobile
    return {
      margin: { top: 10, right: 10, bottom: 30, left: 40 },
      fontSize: 12,
      showLegend: false,
    };
  } else if (width < 1024) {
    // Tablet
    return {
      margin: { top: 15, right: 20, bottom: 35, left: 50 },
      fontSize: 14,
      showLegend: true,
    };
  } else {
    // Desktop
    return {
      margin: { top: 20, right: 30, bottom: 40, left: 60 },
      fontSize: 14,
      showLegend: true,
    };
  }
};
