import React, { useState, useMemo } from 'react';
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
  ReferenceLine,
} from 'recharts';
import {
  Leaf,
  TrendingDown,
  TrendingUp,
  TreePine,
  Factory,
  Car,
  Home,
  Zap,
  AlertCircle,
  Info,
  Target,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CarbonData, TimeRange } from '@/types/analytics';
import { formatNumber, formatPercentage, calculateCarbonReduction } from '@/utils/analytics/calculations';

interface CarbonTrackerProps {
  data?: CarbonData;
  timeRange: TimeRange;
  className?: string;
}

const EMISSION_SOURCE_COLORS = {
  energy: '#ef4444',
  transportation: '#f59e0b',
  industrial: '#8b5cf6',
  residential: '#3b82f6',
  commercial: '#06b6d4',
  agriculture: '#10b981',
};

const EMISSION_ICONS = {
  energy: <Factory className="w-4 h-4" />,
  transportation: <Car className="w-4 h-4" />,
  industrial: <Factory className="w-4 h-4" />,
  residential: <Home className="w-4 h-4" />,
  commercial: <Zap className="w-4 h-4" />,
  agriculture: <TreePine className="w-4 h-4" />,
};

const BENCHMARK_TYPES = [
  { key: 'industry', label: 'Industry Average', color: '#ef4444' },
  { key: 'regional', label: 'Regional Average', color: '#f59e0b' },
  { key: 'global', label: 'Global Average', color: '#10b981' },
];

export const CarbonTracker: React.FC<CarbonTrackerProps> = ({
  data,
  timeRange,
  className = '',
}) => {
  const [selectedBenchmark, setSelectedBenchmark] = useState<'industry' | 'regional' | 'global'>('industry');
  const [showTrends, setShowTrends] = useState(true);
  const [showCredits, setShowCredits] = useState(true);

  const emissionsTrend = useMemo(() => {
    if (!data?.trends) return [];
    return data.trends.map(trend => ({
      date: trend.date,
      emissions: trend.emissions,
      reduction: trend.reduction,
      cumulative: trend.emissions,
    }));
  }, [data]);

  const emissionsBySource = useMemo(() => {
    if (!data?.emissionsBySource) return [];
    return data.emissionsBySource.map(source => ({
      ...source,
      color: EMISSION_SOURCE_COLORS[source.source as keyof typeof EMISSION_SOURCE_COLORS] || '#6b7280',
    }));
  }, [data]);

  const benchmarkComparison = useMemo(() => {
    if (!data?.benchmarks) return null;
    
    const currentEmissions = data.totalEmissions;
    const benchmarkValue = data.benchmarks[selectedBenchmark];
    
    return {
      current: currentEmissions,
      benchmark: benchmarkValue,
      difference: currentEmissions - benchmarkValue,
      percentage: ((currentEmissions - benchmarkValue) / benchmarkValue) * 100,
    };
  }, [data, selectedBenchmark]);

  const carbonCreditsInfo = useMemo(() => {
    if (!data?.carbonCredits) return null;
    
    return {
      earned: data.carbonCredits.earned,
      used: data.carbonCredits.used,
      balance: data.carbonCredits.balance,
      utilizationRate: data.carbonCredits.used > 0 ? (data.carbonCredits.used / data.carbonCredits.earned) * 100 : 0,
    };
  }, [data]);

  const getEmissionIcon = (source: string) => {
    return EMISSION_ICONS[source as keyof typeof EMISSION_ICONS] || <Factory className="w-4 h-4" />;
  };

  const getReductionStatus = (reductionRate: number) => {
    if (reductionRate > 10) return { status: 'excellent', color: '#10b981', icon: <Award className="w-4 h-4" /> };
    if (reductionRate > 5) return { status: 'good', color: '#3b82f6', icon: <TrendingDown className="w-4 h-4" /> };
    if (reductionRate > 0) return { status: 'moderate', color: '#f59e0b', icon: <Activity className="w-4 h-4" /> };
    return { status: 'poor', color: '#ef4444', icon: <TrendingUp className="w-4 h-4" /> };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)} tons
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-gray-500">
          <Info className="w-5 h-5" />
          <p>No carbon data available</p>
        </div>
      </div>
    );
  }

  const reductionStatus = getReductionStatus(data.reductionRate);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Carbon Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Emissions</span>
            <Leaf className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(data.totalEmissions)} tons
          </div>
          <div className="text-sm text-gray-500">
            CO₂ equivalent
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Reduction Rate</span>
            <div style={{ color: reductionStatus.color }}>
              {reductionStatus.icon}
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: reductionStatus.color }}>
            {formatPercentage(data.reductionRate)}
          </div>
          <div className="text-sm text-gray-500 capitalize">
            {reductionStatus.status} performance
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Carbon Credits</span>
            <Award className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(carbonCreditsInfo?.balance || 0)}
          </div>
          <div className="text-sm text-gray-500">
            Available credits
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">vs {selectedBenchmark}</span>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {benchmarkComparison ? formatPercentage(benchmarkComparison.percentage) : '0%'}
          </div>
          <div className="text-sm text-gray-500">
            {benchmarkComparison && benchmarkComparison.difference > 0 ? 'Above' : 'Below'} average
          </div>
        </motion.div>
      </div>

      {/* Benchmark Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {BENCHMARK_TYPES.map((benchmark) => (
            <button
              key={benchmark.key}
              onClick={() => setSelectedBenchmark(benchmark.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedBenchmark === benchmark.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: benchmark.color }}
              />
              <span className="text-sm font-medium">{benchmark.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTrends(!showTrends)}
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-colors ${
              showTrends
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {showTrends ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Trends
          </button>
          <button
            onClick={() => setShowCredits(!showCredits)}
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-colors ${
              showCredits
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {showCredits ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Credits
          </button>
        </div>
      </div>

      {/* Emissions Trend Chart */}
      {showTrends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emissions Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={emissionsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `${formatNumber(value)} tons`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <ReferenceLine
                    y={benchmarkComparison?.benchmark || 0}
                    stroke={BENCHMARK_TYPES.find(b => b.key === selectedBenchmark)?.color}
                    strokeDasharray="3 3"
                    label={`${selectedBenchmark} Average`}
                  />
                  <Line
                    type="monotone"
                    dataKey="emissions"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 4 }}
                    name="Emissions"
                  />
                  <Line
                    type="monotone"
                    dataKey="reduction"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Reduction"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emissions by Source</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emissionsBySource}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${formatPercentage(percentage)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="emissions"
                  >
                    {emissionsBySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* Carbon Credits Management */}
      {showCredits && carbonCreditsInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Carbon Credits Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 mb-1">Credits Earned</div>
              <div className="text-xl font-bold text-green-900">
                {formatNumber(carbonCreditsInfo.earned)}
              </div>
              <div className="text-xs text-green-600 mt-1">
                From reduction activities
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 mb-1">Credits Used</div>
              <div className="text-xl font-bold text-red-900">
                {formatNumber(carbonCreditsInfo.used)}
              </div>
              <div className="text-xs text-red-600 mt-1">
                For offsetting emissions
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 mb-1">Available Balance</div>
              <div className="text-xl font-bold text-blue-900">
                {formatNumber(carbonCreditsInfo.balance)}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {formatPercentage(carbonCreditsInfo.utilizationRate)} utilized
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Emissions Sources Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emissions Sources Breakdown</h3>
        <div className="space-y-3">
          {emissionsBySource.map((source, index) => (
            <motion.div
              key={source.source}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: source.color }}
                />
                {getEmissionIcon(source.source)}
                <span className="font-medium text-gray-900 capitalize">{source.source}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(source.emissions)} tons
                </div>
                <div className="text-sm text-gray-500">
                  {formatPercentage(source.percentage)} of total
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Benchmark Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Benchmark Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BENCHMARK_TYPES.map((benchmark) => {
            const value = data.benchmarks[benchmark.key as keyof typeof data.benchmarks];
            const isCurrent = selectedBenchmark === benchmark.key;
            const difference = data.totalEmissions - value;
            const percentage = (difference / value) * 100;
            
            return (
              <motion.div
                key={benchmark.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * BENCHMARK_TYPES.indexOf(benchmark) }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  isCurrent 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => setSelectedBenchmark(benchmark.key as any)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{benchmark.label}</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: benchmark.color }}
                  />
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {formatNumber(value)} tons
                </div>
                <div className="text-sm">
                  <span className={difference > 0 ? 'text-red-600' : 'text-green-600'}>
                    {difference > 0 ? '+' : ''}{formatNumber(difference)} tons
                  </span>
                  <span className="text-gray-500 ml-1">
                    ({percentage > 0 ? '+' : ''}{formatPercentage(percentage)})
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Reduction Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reduction Goals & Progress</h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Current Reduction Target</span>
              </div>
              <span className="text-2xl font-bold text-green-900">
                {formatPercentage(data.reductionRate)}
              </span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, data.reductionRate * 10)}%` }}
              />
            </div>
            <div className="text-sm text-green-700 mt-2">
              Target: 10% reduction by 2025
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CarbonTracker;
