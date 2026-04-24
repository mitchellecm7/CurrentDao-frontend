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
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Battery,
  Sun,
  Wind,
  Droplet,
  AlertCircle,
  Info,
  Filter,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ConsumptionData, TimeRange } from '@/types/analytics';
import { formatNumber, formatPercentage, calculateLoadFactor } from '@/utils/analytics/calculations';

interface ConsumptionPatternsProps {
  data?: ConsumptionData;
  timeRange: TimeRange;
  className?: string;
}

const ENERGY_TYPE_COLORS = {
  solar: '#f59e0b',
  wind: '#3b82f6',
  hydro: '#06b6d4',
  nuclear: '#8b5cf6',
  natural_gas: '#ef4444',
  coal: '#6b7280',
  biomass: '#10b981',
};

const TIME_PERIODS = [
  { value: 'hourly', label: 'Hourly', icon: Clock },
  { value: 'daily', label: 'Daily', icon: Calendar },
  { value: 'monthly', label: 'Monthly', icon: BarChart3 },
];

export const ConsumptionPatterns: React.FC<ConsumptionPatternsProps> = ({
  data,
  timeRange,
  className = '',
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'hourly' | 'daily' | 'monthly'>('hourly');
  const [showPeakHours, setShowPeakHours] = useState(true);
  const [showEfficiency, setShowEfficiency] = useState(true);

  const chartData = useMemo(() => {
    if (!data) return [];

    switch (selectedPeriod) {
      case 'hourly':
        return data.hourlyPattern || [];
      case 'daily':
        return data.dailyPattern || [];
      case 'monthly':
        return data.monthlyPattern || [];
      default:
        return [];
    }
  }, [data, selectedPeriod]);

  const peakHoursData = useMemo(() => {
    if (!data?.peakHours) return [];
    return data.peakHours.sort((a, b) => b.consumption - a.consumption).slice(0, 10);
  }, [data]);

  const energyTypeDistribution = useMemo(() => {
    if (!data?.byEnergyType) return [];
    return data.byEnergyType.map(type => ({
      ...type,
      color: ENERGY_TYPE_COLORS[type.type as keyof typeof ENERGY_TYPE_COLORS] || '#6b7280',
    }));
  }, [data]);

  const efficiencyMetrics = useMemo(() => {
    if (!data) return null;

    const avgConsumption = data.totalConsumption / 24; // Daily average
    const peakConsumption = Math.max(...(data.hourlyPattern?.map(h => h.consumption) || [0]));
    const loadFactor = calculateLoadFactor(avgConsumption, peakConsumption);

    return {
      avgConsumption,
      peakConsumption,
      loadFactor,
      efficiency: data.efficiency || 0,
      totalConsumption: data.totalConsumption,
    };
  }, [data]);

  const getEnergyIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'solar':
        return <Sun className="w-4 h-4" />;
      case 'wind':
        return <Wind className="w-4 h-4" />;
      case 'hydro':
        return <Droplet className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)} MWh
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
          <p>No consumption data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Consumption Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Consumption</span>
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(data.totalConsumption)} MWh
          </div>
          <div className="text-sm text-gray-500">
            {timeRange} period
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Efficiency</span>
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatPercentage(data.efficiency)}
          </div>
          <div className="text-sm text-gray-500">
            System efficiency
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Peak Demand</span>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(efficiencyMetrics?.peakConsumption || 0)} MWh
          </div>
          <div className="text-sm text-gray-500">
            Highest consumption
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Load Factor</span>
            <Battery className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatPercentage(efficiencyMetrics?.loadFactor || 0)}
          </div>
          <div className="text-sm text-gray-500">
            Utilization rate
          </div>
        </motion.div>
      </div>

      {/* Time Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {TIME_PERIODS.map((period) => {
            const Icon = period.icon;
            return (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{period.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPeakHours(!showPeakHours)}
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-colors ${
              showPeakHours
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {showPeakHours ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Peak Hours
          </button>
          <button
            onClick={() => setShowEfficiency(!showEfficiency)}
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-colors ${
              showEfficiency
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {showEfficiency ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Efficiency
          </button>
        </div>
      </div>

      {/* Consumption Pattern Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedPeriod === 'hourly' ? 'Hourly' : selectedPeriod === 'daily' ? 'Daily' : 'Monthly'} Consumption Pattern
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey={selectedPeriod === 'hourly' ? 'hour' : selectedPeriod === 'daily' ? 'day' : 'month'}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${formatNumber(value)} MWh`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                {showEfficiency && (
                  <ReferenceLine
                    y={efficiencyMetrics?.avgConsumption || 0}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label="Average"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Type Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={energyTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${formatPercentage(percentage)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="consumption"
                >
                  {energyTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Peak Hours Analysis */}
      {showPeakHours && peakHoursData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Consumption Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {peakHoursData.map((hour, index) => (
              <motion.div
                key={hour.hour}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {hour.hour}:00 - {hour.hour + 1}:00
                    </div>
                    <div className="text-sm text-gray-600">
                      Frequency: {hour.frequency} times
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-900">
                    {formatNumber(hour.consumption)} MWh
                  </div>
                  <div className="text-xs text-orange-600">
                    Peak #{index + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Energy Type Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumption by Energy Type</h3>
        <div className="space-y-3">
          {energyTypeDistribution.map((type, index) => (
            <motion.div
              key={type.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
                {getEnergyIcon(type.type)}
                <span className="font-medium text-gray-900 capitalize">{type.type}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(type.consumption)} MWh
                </div>
                <div className="text-sm text-gray-500">
                  {formatPercentage(type.percentage)} of total
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Efficiency Metrics */}
      {showEfficiency && efficiencyMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 mb-1">Average Load</div>
              <div className="text-xl font-bold text-blue-900">
                {formatNumber(efficiencyMetrics.avgConsumption)} MWh
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 mb-1">Peak Load</div>
              <div className="text-xl font-bold text-green-900">
                {formatNumber(efficiencyMetrics.peakConsumption)} MWh
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 mb-1">Load Factor</div>
              <div className="text-xl font-bold text-purple-900">
                {formatPercentage(efficiencyMetrics.loadFactor)}
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-sm text-orange-600 mb-1">System Efficiency</div>
              <div className="text-xl font-bold text-orange-900">
                {formatPercentage(efficiencyMetrics.efficiency)}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ConsumptionPatterns;
