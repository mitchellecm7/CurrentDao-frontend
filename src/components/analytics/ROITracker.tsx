import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { ROIMetrics, TimeRange } from '@/types/analytics';
import { formatCurrency, formatPercentage } from '@/utils/analytics/calculations';

interface ROITrackerProps {
  data?: ROIMetrics;
  timeRange: TimeRange;
  className?: string;
}

const ROI_COLORS = {
  profit: '#10b981',
  loss: '#ef4444',
  breakEven: '#f59e0b',
  investment: '#3b82f6',
  return: '#8b5cf6',
};

const INVESTMENT_TYPES = [
  { name: 'Solar Panels', value: 35, color: '#f59e0b' },
  { name: 'Wind Turbines', value: 25, color: '#3b82f6' },
  { name: 'Battery Storage', value: 20, color: '#8b5cf6' },
  { name: 'Grid Infrastructure', value: 15, color: '#06b6d4' },
  { name: 'Smart Meters', value: 5, color: '#10b981' },
];

export const ROITracker: React.FC<ROITrackerProps> = ({
  data,
  timeRange,
  className = '',
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [showDetails, setShowDetails] = useState(false);

  const roiTrendData = useMemo(() => {
    if (!data?.historicalROI) return [];
    
    return data.historicalROI.map(item => ({
      date: item.date,
      roi: item.roi,
      investment: item.investment,
      returns: item.returns,
      netProfit: item.returns - item.investment,
      cumulative: item.cumulativeROI || 0,
    }));
  }, [data]);

  const performanceMetrics = useMemo(() => {
    if (!data) return null;

    const totalInvestment = data.totalInvestment || 0;
    const totalReturns = data.totalReturns || 0;
    const netProfit = totalReturns - totalInvestment;
    const roiPercentage = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

    return {
      totalInvestment,
      totalReturns,
      netProfit,
      roiPercentage,
      paybackPeriod: data.paybackPeriod || 0,
      annualizedROI: data.annualizedROI || 0,
      monthlyChange: data.monthlyChange || 0,
      yearlyChange: data.yearlyChange || 0,
    };
  }, [data]);

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (value < 0) return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('ROI') ? formatPercentage(entry.value) : formatCurrency(entry.value)}
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
          <p>No ROI data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ROI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total ROI</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatPercentage(performanceMetrics?.roiPercentage || 0)}
          </div>
          <div className="flex items-center gap-1 text-sm">
            {getTrendIcon(performanceMetrics?.monthlyChange || 0)}
            <span className={getTrendColor(performanceMetrics?.monthlyChange || 0)}>
              {performanceMetrics?.monthlyChange > 0 ? '+' : ''}{formatPercentage(performanceMetrics?.monthlyChange || 0)} this month
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Net Profit</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(performanceMetrics?.netProfit || 0)}
          </div>
          <div className="text-sm text-gray-500">
            Total returns: {formatCurrency(performanceMetrics?.totalReturns || 0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Payback Period</span>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {performanceMetrics?.paybackPeriod ? `${performanceMetrics.paybackPeriod.toFixed(1)} years` : 'N/A'}
          </div>
          <div className="text-sm text-gray-500">
            Estimated break-even
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Annualized ROI</span>
            <Activity className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatPercentage(performanceMetrics?.annualizedROI || 0)}
          </div>
          <div className="flex items-center gap-1 text-sm">
            {getTrendIcon(performanceMetrics?.yearlyChange || 0)}
            <span className={getTrendColor(performanceMetrics?.yearlyChange || 0)}>
              {performanceMetrics?.yearlyChange > 0 ? '+' : ''}{formatPercentage(performanceMetrics?.yearlyChange || 0)} YoY
            </span>
          </div>
        </motion.div>
      </div>

      {/* ROI Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ROI Performance Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roiTrendData}>
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
                  tickFormatter={(value) => formatPercentage(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="roi"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="ROI %"
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Cumulative ROI %"
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment vs Returns</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiTrendData}>
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
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="investment" fill={ROI_COLORS.investment} name="Investment" />
                <Bar dataKey="returns" fill={ROI_COLORS.return} name="Returns" />
                <Bar dataKey="netProfit" fill={ROI_COLORS.profit} name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Investment Portfolio Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Portfolio</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={INVESTMENT_TYPES}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {INVESTMENT_TYPES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ROI by Investment Type</h3>
          <div className="space-y-3">
            {INVESTMENT_TYPES.map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="font-medium text-gray-900">{type.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {formatPercentage(Math.random() * 30 - 5)} {/* Simulated ROI */}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency((performanceMetrics?.totalInvestment || 0) * (type.value / 100))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ROI Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">ROI Calculator</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Calculator className="w-4 h-4" />
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 mb-1">Total Investment</div>
            <div className="text-xl font-bold text-blue-900">
              {formatCurrency(performanceMetrics?.totalInvestment || 0)}
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 mb-1">Total Returns</div>
            <div className="text-xl font-bold text-green-900">
              {formatCurrency(performanceMetrics?.totalReturns || 0)}
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 mb-1">Net Profit</div>
            <div className="text-xl font-bold text-purple-900">
              {formatCurrency(performanceMetrics?.netProfit || 0)}
            </div>
          </div>
        </div>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <h4 className="font-medium text-gray-900 mb-3">ROI Calculation Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ROI Formula:</span>
                <span className="font-medium">(Returns - Investment) / Investment × 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Calculation:</span>
                <span className="font-medium">
                  ({formatCurrency(performanceMetrics?.totalReturns || 0)} - {formatCurrency(performanceMetrics?.totalInvestment || 0)}) / {formatCurrency(performanceMetrics?.totalInvestment || 0)} × 100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Result:</span>
                <span className="font-bold text-blue-600">{formatPercentage(performanceMetrics?.roiPercentage || 0)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ROITracker;
