import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Leaf,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Battery,
  Wind,
  Sun,
  Droplet,
  FileText,
  Share2,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ROITracker } from './ROITracker';
import { ConsumptionPatterns } from './ConsumptionPatterns';
import { CarbonTracker } from './CarbonTracker';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { 
  EnergyData, 
  ROIMetrics, 
  ConsumptionData, 
  CarbonData, 
  MarketBenchmark,
  TimeRange 
} from '@/types/analytics';

interface AdvancedDashboardProps {
  className?: string;
  initialTimeRange?: TimeRange;
  showRealTime?: boolean;
}

const ENERGY_COLORS = {
  solar: '#f59e0b',
  wind: '#3b82f6',
  hydro: '#06b6d4',
  nuclear: '#8b5cf6',
  fossil: '#ef4444',
  renewable: '#10b981',
};

const TIME_RANGES = [
  { value: '1h', label: '1 Hour' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
];

export const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
  className = '',
  initialTimeRange = '24h',
  showRealTime = true,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'roi' | 'consumption' | 'carbon'>('overview');
  const [showDetails, setShowDetails] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(showRealTime);

  const {
    energyData,
    roiMetrics,
    consumptionData,
    carbonData,
    marketBenchmarks,
    predictiveData,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    exportToPDF,
    exportToCSV,
  } = useAdvancedAnalytics(timeRange);

  useEffect(() => {
    if (autoRefresh && showRealTime) {
      const interval = setInterval(() => {
        refreshData();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, showRealTime, refreshData]);

  const handleExport = async (format: 'pdf' | 'csv') => {
    setIsExporting(true);
    try {
      if (format === 'pdf') {
        await exportToPDF();
      } else {
        await exportToCSV();
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total ROI</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {roiMetrics?.totalROI ? `${roiMetrics.totalROI.toFixed(2)}%` : '0.00%'}
          </div>
          <div className="text-sm text-gray-500">
            {roiMetrics?.monthlyChange > 0 ? '+' : ''}{roiMetrics?.monthlyChange?.toFixed(2)}% this month
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Energy Consumed</span>
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {consumptionData?.totalConsumption ? `${consumptionData.totalConsumption.toFixed(0)} MWh` : '0 MWh'}
          </div>
          <div className="text-sm text-gray-500">
            {consumptionData?.efficiency ? `${(consumptionData.efficiency * 100).toFixed(1)}% efficient` : '0% efficient'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Carbon Footprint</span>
            <Leaf className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {carbonData?.totalEmissions ? `${carbonData.totalEmissions.toFixed(1)} tons` : '0 tons'}
          </div>
          <div className="text-sm text-gray-500">
            {carbonData?.reductionRate ? `${(carbonData.reductionRate * 100).toFixed(1)}% reduction` : '0% reduction'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Market Performance</span>
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {marketBenchmarks?.performance ? `${marketBenchmarks.performance.toFixed(1)}%` : '0%'}
          </div>
          <div className="text-sm text-gray-500">
            vs market average
          </div>
        </motion.div>
      </div>

      {/* Energy Mix Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Mix Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={energyData?.energyMix || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${(percentage * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {energyData?.energyMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ENERGY_COLORS[entry.type as keyof typeof ENERGY_COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Trends & Predictions</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={predictiveData?.pricePredictions || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `$${Number(value).toFixed(2)}`, 
                    name === 'actualPrice' ? 'Actual Price' : 'Predicted Price'
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actualPrice"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Actual Price"
                />
                <Line
                  type="monotone"
                  dataKey="predictedPrice"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Predicted Price"
                />
                <ReferenceLine
                  y={marketBenchmarks?.averagePrice}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label="Market Avg"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Consumption Patterns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumption Patterns</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={consumptionData?.hourlyPattern || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="hour" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `${value} MWh`}
              />
              <Tooltip 
                formatter={(value: any) => [`${Number(value).toFixed(2)} MWh`, 'Consumption']}
              />
              <Area
                type="monotone"
                dataKey="consumption"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );

  const renderContent = () => {
    switch (selectedMetric) {
      case 'overview':
        return renderOverview();
      case 'roi':
        return <ROITracker data={roiMetrics} timeRange={timeRange} />;
      case 'consumption':
        return <ConsumptionPatterns data={consumptionData} timeRange={timeRange} />;
      case 'carbon':
        return <CarbonTracker data={carbonData} timeRange={timeRange} />;
      default:
        return renderOverview();
    }
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Error Loading Analytics</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics Dashboard</h1>
            <p className="text-sm text-gray-500">
              Energy insights, ROI tracking, and portfolio performance analytics
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIME_RANGES.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>

            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </button>

            {/* Export Options */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="flex items-center gap-1 px-3 py-1 text-sm rounded hover:bg-white transition-colors disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="flex items-center gap-1 px-3 py-1 text-sm rounded hover:bg-white transition-colors disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </div>

            {/* Manual Refresh */}
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex space-x-8 px-4">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'roi', label: 'ROI Tracking', icon: TrendingUp },
            { id: 'consumption', label: 'Consumption', icon: Zap },
            { id: 'carbon', label: 'Carbon Footprint', icon: Leaf },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedMetric(id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-colors ${
                selectedMetric === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading analytics data...</span>
          </div>
        ) : (
          renderContent()
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}</span>
            <span>•</span>
            <span>Data accuracy: {predictiveData?.accuracy ? `${(predictiveData.accuracy * 100).toFixed(1)}%` : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span>System operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
