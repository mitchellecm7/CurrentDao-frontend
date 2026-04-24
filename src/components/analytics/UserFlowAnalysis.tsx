import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Users, 
  TrendingDown, 
  TrendingUp, 
  Filter,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  Target,
  Route,
  Clock,
  MousePointer,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';

interface FlowStep {
  id: string;
  name: string;
  path: string;
  type: 'page' | 'action' | 'conversion' | 'exit';
  users: number;
  conversionRate: number;
  avgTimeSpent: number;
  dropoffRate: number;
  previousStep?: string;
  nextSteps: string[];
}

interface UserFlow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  totalUsers: number;
  completedUsers: number;
  overallConversionRate: number;
  avgFunnelTime: number;
  dropoffPoints: string[];
  entryPoints: string[];
  exitPoints: string[];
  createdAt: string;
  lastUpdated: string;
}

interface UserFlowAnalysisProps {
  flows: UserFlow[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  onExport?: (flowId: string, format: 'png' | 'csv' | 'json') => void;
  onRefresh?: () => void;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface FlowFilters {
  conversionRateRange: {
    min: number;
    max: number;
  };
  userCount: {
    min: number;
    max: number;
  };
  stepType: 'all' | 'page' | 'action' | 'conversion' | 'exit';
  sortBy: 'conversionRate' | 'userCount' | 'dropoffRate' | 'avgTimeSpent';
  sortOrder: 'asc' | 'desc';
}

export const UserFlowAnalysis: React.FC<UserFlowAnalysisProps> = ({
  flows,
  isLoading = false,
  error = null,
  className = '',
  onExport,
  onRefresh,
  dateRange,
}) => {
  const [selectedFlow, setSelectedFlow] = useState<UserFlow | null>(null);
  const [filters, setFilters] = useState<FlowFilters>({
    conversionRateRange: { min: 0, max: 100 },
    userCount: { min: 0, max: 10000 },
    stepType: 'all',
    sortBy: 'conversionRate',
    sortOrder: 'desc',
  });
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'funnel' | 'sankey' | 'timeline'>('funnel');

  const filteredFlows = useMemo(() => {
    return flows.filter(flow => {
      const inConversionRange = flow.overallConversionRate >= filters.conversionRateRange.min &&
                               flow.overallConversionRate <= filters.conversionRateRange.max;
      const inUserCountRange = flow.totalUsers >= filters.userCount.min &&
                              flow.totalUsers <= filters.userCount.max;
      return inConversionRange && inUserCountRange;
    }).sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (filters.sortBy) {
        case 'conversionRate':
          aValue = a.overallConversionRate;
          bValue = b.overallConversionRate;
          break;
        case 'userCount':
          aValue = a.totalUsers;
          bValue = b.totalUsers;
          break;
        case 'dropoffRate':
          aValue = a.steps.reduce((sum, step) => sum + step.dropoffRate, 0) / a.steps.length;
          bValue = b.steps.reduce((sum, step) => sum + step.dropoffRate, 0) / b.steps.length;
          break;
        case 'avgTimeSpent':
          aValue = a.avgFunnelTime;
          bValue = b.avgFunnelTime;
          break;
        default:
          return 0;
      }
      
      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [flows, filters]);

  const getConversionColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600 bg-green-50';
    if (rate >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getDropoffColor = (rate: number) => {
    if (rate <= 10) return 'text-green-600 bg-green-50';
    if (rate <= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const renderFunnelChart = (flow: UserFlow) => {
    const maxUsers = Math.max(...flow.steps.map(step => step.users));
    
    return (
      <div className="space-y-2">
        {flow.steps.map((step, index) => {
          const widthPercentage = (step.users / maxUsers) * 100;
          const isDropoff = index > 0 && step.users < flow.steps[index - 1].users;
          const dropoffPercentage = isDropoff 
            ? ((flow.steps[index - 1].users - step.users) / flow.steps[index - 1].users) * 100 
            : 0;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-gray-700 truncate">
                  {step.name}
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <div 
                      className={`h-12 rounded-lg flex items-center justify-between px-4 ${
                        step.type === 'conversion' ? 'bg-green-500' :
                        step.type === 'exit' ? 'bg-red-500' :
                        'bg-blue-500'
                      } text-white`}
                      style={{ width: `${widthPercentage}%` }}
                    >
                      <span className="text-sm font-medium">
                        {step.users.toLocaleString()} users
                      </span>
                      <span className="text-sm">
                        {step.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                    {isDropoff && dropoffPercentage > 0 && (
                      <div className="absolute right-0 top-0 -translate-y-full mb-2 text-sm text-red-600 font-medium">
                        -{dropoffPercentage.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-24 text-right">
                  <div className="text-sm text-gray-600">{formatTime(step.avgTimeSpent)}</div>
                  {step.type === 'conversion' && (
                    <CheckCircle className="w-4 h-4 text-green-600 mx-auto mt-1" />
                  )}
                  {step.type === 'exit' && (
                    <XCircle className="w-4 h-4 text-red-600 mx-auto mt-1" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderSankeyDiagram = (flow: UserFlow) => {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center text-gray-500">
          <Route className="w-12 h-12 mx-auto mb-2" />
          <p>Sankey diagram visualization</p>
          <p className="text-sm">Shows user flow paths and transitions</p>
        </div>
      </div>
    );
  };

  const renderTimelineView = (flow: UserFlow) => {
    return (
      <div className="space-y-4">
        {flow.steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4"
          >
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full ${
                step.type === 'conversion' ? 'bg-green-500' :
                step.type === 'exit' ? 'bg-red-500' :
                'bg-blue-500'
              }`} />
              {index < flow.steps.length - 1 && (
                <div className="w-0.5 h-16 bg-gray-300 mt-2" />
              )}
            </div>
            <div className="flex-1">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{step.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getConversionColor(step.conversionRate)}`}>
                    {step.conversionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Users:</span>
                    <span className="ml-2 font-medium">{step.users.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg Time:</span>
                    <span className="ml-2 font-medium">{formatTime(step.avgTimeSpent)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Dropoff:</span>
                    <span className={`ml-2 font-medium ${getDropoffColor(step.dropoffRate)}`}>
                      {step.dropoffRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-blue-600">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-lg font-medium">Analyzing user flows...</span>
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
            <h3 className="font-medium">Error loading user flows</h3>
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
            <h2 className="text-xl font-bold text-gray-900">User Flow Analysis</h2>
            <p className="text-sm text-gray-500">
              {flows.length} flows analyzed • {filteredFlows.length} results
            </p>
          </div>
          <div className="flex items-center gap-2">
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
            {selectedFlow && (
              <div className="relative group">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => onExport?.(selectedFlow.id, 'png')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    Export as PNG
                  </button>
                  <button
                    onClick={() => onExport?.(selectedFlow.id, 'csv')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => onExport?.(selectedFlow.id, 'json')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            )}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Conversion Rate Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.conversionRateRange.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    conversionRateRange: { ...prev.conversionRateRange, min: parseFloat(e.target.value) || 0 }
                  }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.conversionRateRange.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    conversionRateRange: { ...prev.conversionRateRange, max: parseFloat(e.target.value) || 100 }
                  }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Count Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.userCount.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    userCount: { ...prev.userCount, min: parseFloat(e.target.value) || 0 }
                  }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.userCount.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    userCount: { ...prev.userCount, max: parseFloat(e.target.value) || 10000 }
                  }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="conversionRate">Conversion Rate</option>
                <option value="userCount">User Count</option>
                <option value="dropoffRate">Dropoff Rate</option>
                <option value="avgTimeSpent">Avg Time Spent</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {!selectedFlow ? (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlows.map((flow) => (
              <motion.div
                key={flow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedFlow(flow)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{flow.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{flow.description}</p>
                  </div>
                  <Route className="w-5 h-5 text-blue-600" />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {flow.overallConversionRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">Conversion Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {flow.totalUsers.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Total Users</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(flow.avgFunnelTime)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getConversionColor(flow.overallConversionRate)}`}>
                    {flow.overallConversionRate >= 70 ? 'High' : 
                     flow.overallConversionRate >= 40 ? 'Medium' : 'Low'}
                  </span>
                </div>

                {flow.dropoffPoints.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{flow.dropoffPoints.length} dropoff points</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {filteredFlows.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Route className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No user flows found</h3>
              <p className="text-sm">Try adjusting your filters or check back later for new data</p>
            </div>
          )}
        </div>
      ) : (
        <div className="border-b border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedFlow(null)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Flows
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('funnel')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    viewMode === 'funnel' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Funnel
                </button>
                <button
                  onClick={() => setViewMode('sankey')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    viewMode === 'sankey' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Route className="w-4 h-4 inline mr-1" />
                  Sankey
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    viewMode === 'timeline' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-1" />
                  Timeline
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedFlow.name}</h3>
              <p className="text-gray-600 mb-4">{selectedFlow.description}</p>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedFlow.overallConversionRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Overall Conversion</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedFlow.totalUsers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedFlow.completedUsers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(selectedFlow.avgFunnelTime)}
                  </div>
                  <div className="text-sm text-gray-500">Avg Time</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {viewMode === 'funnel' && renderFunnelChart(selectedFlow)}
            {viewMode === 'sankey' && renderSankeyDiagram(selectedFlow)}
            {viewMode === 'timeline' && renderTimelineView(selectedFlow)}
          </div>
        </div>
      )}
    </div>
  );
};
