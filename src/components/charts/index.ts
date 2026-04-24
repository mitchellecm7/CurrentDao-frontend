// Chart Components
export { default as BaseChart } from './BaseChart';
export { LineChart } from './LineChart';
export { BarChart } from './BarChart';
export { PieChart } from './PieChart';
export { AreaChart } from './AreaChart';

// Chart Types
export type {
  ChartDataPoint,
  ChartData,
  PieChartData,
  ChartTheme,
  ChartConfig,
  ChartTooltipProps,
  ChartLegendProps,
  ChartAxisProps,
  LineChartProps,
  BarChartProps,
  PieChartProps,
  AreaChartProps,
  ChartExportOptions,
  ChartInteractionState,
  ChartType,
  EnergyTradingData,
  MarketTrendData,
  UserAnalyticsData,
} from '@/types/charts';

// Chart Utilities
export {
  defaultChartTheme,
  energyTradingTheme,
  formatChartValue,
  formatChartDate,
  processEnergyTradingData,
  processMarketTrendData,
  processUserAnalyticsData,
  generateRandomData,
  calculateChartDimensions,
  exportChart,
  debounce,
  throttle,
  validateChartData,
  getColorScale,
  getResponsiveConfig,
} from '@/utils/chartHelpers';

// Chart Hooks
export {
  useChart,
  useChartData,
  useChartAnimation,
  useChartKeyboardNavigation,
  useChartPerformance,
  useChartAccessibility,
} from '@/hooks/useCharts';
