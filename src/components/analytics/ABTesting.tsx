import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Beaker, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Settings,
  Play,
  Pause,
  Square,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MousePointer,
  Zap,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';

interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficAllocation: number;
  conversions: number;
  visitors: number;
  conversionRate: number;
  revenue?: number;
  avgOrderValue?: number;
  isControl?: boolean;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  startDate?: string;
  endDate?: string;
  targetMetric: 'conversion_rate' | 'revenue' | 'click_through_rate' | 'bounce_rate' | 'avg_session_duration';
  confidenceLevel: number;
  statisticalSignificance: number;
  sampleSize: number;
  minSampleSize: number;
  variants: ABTestVariant[];
  winner?: string;
  createdAt: string;
  lastUpdated: string;
  trafficSplitType: 'equal' | 'manual' | 'weighted';
  targetingCriteria: {
    deviceTypes: string[];
    browsers: string[];
    locations: string[];
    userSegments: string[];
  };
}

interface ABTestingProps {
  tests: ABTest[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  onCreateTest?: () => void;
  onEditTest?: (testId: string) => void;
  onDeleteTest?: (testId: string) => void;
  onStartTest?: (testId: string) => void;
  onPauseTest?: (testId: string) => void;
  onStopTest?: (testId: string) => void;
  onExport?: (testId: string, format: 'csv' | 'json') => void;
  onRefresh?: () => void;
}

interface TestFilters {
  status: 'all' | 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  metric: 'all' | 'conversion_rate' | 'revenue' | 'click_through_rate' | 'bounce_rate' | 'avg_session_duration';
  sortBy: 'name' | 'startDate' | 'conversionRate' | 'statisticalSignificance';
  sortOrder: 'asc' | 'desc';
}

export const ABTesting: React.FC<ABTestingProps> = ({
  tests,
  isLoading = false,
  error = null,
  className = '',
  onCreateTest,
  onEditTest,
  onDeleteTest,
  onStartTest,
  onPauseTest,
  onStopTest,
  onExport,
  onRefresh,
}) => {
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [filters, setFilters] = useState<TestFilters>({
    status: 'all',
    metric: 'all',
    sortBy: 'startDate',
    sortOrder: 'desc',
  });
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'details' | 'results'>('overview');

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesStatus = filters.status === 'all' || test.status === filters.status;
      const matchesMetric = filters.metric === 'all' || test.targetMetric === filters.metric;
      return matchesStatus && matchesMetric;
    }).sort((a, b) => {
      let aValue: number | string, bValue: number | string;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'startDate':
          aValue = a.startDate || '';
          bValue = b.startDate || '';
          break;
        case 'conversionRate':
          aValue = Math.max(...a.variants.map(v => v.conversionRate));
          bValue = Math.max(...b.variants.map(v => v.conversionRate));
          break;
        case 'statisticalSignificance':
          aValue = a.statisticalSignificance;
          bValue = b.statisticalSignificance;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return filters.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return filters.sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    });
  }, [tests, filters]);

  const calculateStatisticalSignificance = (control: ABTestVariant, variant: ABTestVariant): number => {
    const p1 = control.conversionRate / 100;
    const p2 = variant.conversionRate / 100;
    const n1 = control.visitors;
    const n2 = variant.visitors;
    
    const pooledProportion = (control.conversions + variant.conversions) / (n1 + n2);
    const standardError = Math.sqrt(pooledProportion * (1 - pooledProportion) * (1/n1 + 1/n2));
    const zScore = Math.abs(p2 - p1) / standardError;
    
    const normalCDF = (x: number) => {
      const t = 1 / (1 + 0.2316419 * Math.abs(x));
      const d = 0.3989423 * Math.exp(-x * x / 2);
      const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
      return x > 0 ? 1 - prob : prob;
    };
    
    return (1 - normalCDF(zScore)) * 100;
  };

  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'draft': return 'text-gray-600 bg-gray-50';
      case 'archived': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: ABTest['status']) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'archived': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getMetricLabel = (metric: ABTest['targetMetric']) => {
    switch (metric) {
      case 'conversion_rate': return 'Conversion Rate';
      case 'revenue': return 'Revenue';
      case 'click_through_rate': return 'Click-Through Rate';
      case 'bounce_rate': return 'Bounce Rate';
      case 'avg_session_duration': return 'Avg Session Duration';
      default: return metric;
    }
  };

  const formatMetricValue = (value: number, metric: ABTest['targetMetric']) => {
    switch (metric) {
      case 'conversion_rate':
      case 'click_through_rate':
      case 'bounce_rate':
        return `${value.toFixed(2)}%`;
      case 'revenue':
        return `$${value.toFixed(2)}`;
      case 'avg_session_duration':
        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value % 60);
        return `${minutes}m ${seconds}s`;
      default:
        return value.toString();
    }
  };

  const renderTestOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTests.map((test) => (
        <motion.div
          key={test.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setSelectedTest(test)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{test.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{test.description}</p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(test.status)}`}>
              {getStatusIcon(test.status)}
              {test.status}
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Metric:</span>
              <span className="font-medium">{getMetricLabel(test.targetMetric)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Variants:</span>
              <span className="font-medium">{test.variants.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Significance:</span>
              <span className={`font-medium ${
                test.statisticalSignificance >= 95 ? 'text-green-600' :
                test.statisticalSignificance >= 80 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {test.statisticalSignificance.toFixed(1)}%
              </span>
            </div>
          </div>

          {test.variants.length > 0 && (
            <div className="border-t pt-3">
              <div className="text-sm text-gray-500 mb-2">Top Performing:</div>
              {test.variants
                .sort((a, b) => b.conversionRate - a.conversionRate)
                .slice(0, 2)
                .map((variant, index) => (
                  <div key={variant.id} className="flex items-center justify-between text-sm mb-1">
                    <span className="truncate">{variant.name}</span>
                    <span className="font-medium">{variant.conversionRate.toFixed(2)}%</span>
                  </div>
                ))}
            </div>
          )}

          {test.winner && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Winner: {test.variants.find(v => v.id === test.winner)?.name}</span>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );

  const renderTestDetails = () => {
    if (!selectedTest) return null;

    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{selectedTest.name}</h3>
              <p className="text-gray-600 mt-1">{selectedTest.description}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${getStatusColor(selectedTest.status)}`}>
              {getStatusIcon(selectedTest.status)}
              {selectedTest.status}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {selectedTest.variants.reduce((sum, v) => sum + v.visitors, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Visitors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {selectedTest.statisticalSignificance.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Statistical Significance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {selectedTest.variants.length}
              </div>
              <div className="text-sm text-gray-500">Variants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {selectedTest.sampleSize.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Sample Size</div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Test Hypothesis</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900">{selectedTest.hypothesis}</p>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Variants Performance</h4>
          <div className="space-y-4">
            {selectedTest.variants.map((variant) => {
              const isWinner = selectedTest.winner === variant.id;
              const controlVariant = selectedTest.variants.find(v => v.isControl);
              const significance = controlVariant && !variant.isControl 
                ? calculateStatisticalSignificance(controlVariant, variant)
                : 0;

              return (
                <motion.div
                  key={variant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`border rounded-lg p-4 ${
                    isWinner ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h5 className="font-semibold text-gray-900">{variant.name}</h5>
                      {variant.isControl && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Control</span>
                      )}
                      {isWinner && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Winner</span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {variant.conversionRate.toFixed(2)}%
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{variant.description}</p>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Visitors:</span>
                      <span className="ml-2 font-medium">{variant.visitors.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Conversions:</span>
                      <span className="ml-2 font-medium">{variant.conversions.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Traffic:</span>
                      <span className="ml-2 font-medium">{variant.trafficAllocation}%</span>
                    </div>
                    {significance > 0 && (
                      <div>
                        <span className="text-gray-500">vs Control:</span>
                        <span className={`ml-2 font-medium ${
                          significance >= 95 ? 'text-green-600' :
                          significance >= 80 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {significance.toFixed(1)}% sig.
                        </span>
                      </div>
                    )}
                  </div>

                  {variant.revenue && (
                    <div className="mt-3 pt-3 border-t text-sm">
                      <span className="text-gray-500">Revenue:</span>
                      <span className="ml-2 font-medium">${variant.revenue.toFixed(2)}</span>
                      {variant.avgOrderValue && (
                        <>
                          <span className="ml-4 text-gray-500">AOV:</span>
                          <span className="ml-2 font-medium">${variant.avgOrderValue.toFixed(2)}</span>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-blue-600">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-lg font-medium">Loading A/B tests...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <h3 className="font-medium">Error loading A/B tests</h3>
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
            <h2 className="text-xl font-bold text-gray-900">A/B Testing</h2>
            <p className="text-sm text-gray-500">
              {tests.length} tests • {tests.filter(t => t.status === 'running').length} running
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCreateTest}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Test
            </button>
            <button
              onClick={onRefresh}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="running">Running</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Metric</label>
              <select
                value={filters.metric}
                onChange={(e) => setFilters(prev => ({ ...prev, metric: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Metrics</option>
                <option value="conversion_rate">Conversion Rate</option>
                <option value="revenue">Revenue</option>
                <option value="click_through_rate">Click-Through Rate</option>
                <option value="bounce_rate">Bounce Rate</option>
                <option value="avg_session_duration">Avg Session Duration</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="name">Name</option>
                <option value="startDate">Start Date</option>
                <option value="conversionRate">Conversion Rate</option>
                <option value="statisticalSignificance">Statistical Significance</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {!selectedTest ? (
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-lg font-medium ${
                viewMode === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('results')}
              className={`px-4 py-2 rounded-lg font-medium ${
                viewMode === 'results' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Results
            </button>
          </div>

          {viewMode === 'overview' ? renderTestOverview() : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Results View</h3>
              <p className="text-gray-600">Comprehensive results analysis and comparison tools</p>
            </div>
          )}

          {filteredTests.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Beaker className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No A/B tests found</h3>
              <p className="text-sm mb-4">Create your first test to start optimizing conversion rates</p>
              <button
                onClick={onCreateTest}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Test
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border-b border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setSelectedTest(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Tests
            </button>
          </div>

          <div className="p-6">
            {renderTestDetails()}
          </div>
        </div>
      )}
    </div>
  );
};
