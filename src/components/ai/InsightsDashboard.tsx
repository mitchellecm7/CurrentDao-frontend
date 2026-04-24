/**
 * Insights Dashboard Component
 * Provides real-time market analysis and AI-generated insights
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertCircle, 
  Info,
  BarChart3,
  PieChart,
  Zap,
  Eye,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Globe
} from 'lucide-react';
import { MarketInsight, RealTimeMarketData, AIUserProfile } from '../../types/ai';
import { AIService } from '../../services/ai/ai-service';

interface InsightsDashboardProps {
  userProfile: AIUserProfile;
  onInsightClick?: (insight: MarketInsight) => void;
  refreshInterval?: number; // in seconds, default 30
  maxInsights?: number;
  showFilters?: boolean;
  className?: string;
}

const InsightsDashboard: React.FC<InsightsDashboardProps> = ({
  userProfile,
  onInsightClick,
  refreshInterval = 30,
  maxInsights = 50,
  showFilters = true,
  className = ''
}) => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [marketData, setMarketData] = useState<RealTimeMarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const aiService = AIService.getInstance();

  // Initialize dashboard
  useEffect(() => {
    loadInitialData();
  }, []);

  // Set up real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      updateRealTimeData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [initialInsights, initialMarketData] = await Promise.all([
        aiService.generateInsights([], userProfile),
        aiService.getRealTimeAnalysis(['BTC', 'ETH', 'ENERGY', 'SOL', 'ADA'])
      ]);

      setInsights(initialInsights);
      setMarketData(initialMarketData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRealTimeData = async () => {
    try {
      const [newInsights, newMarketData] = await Promise.all([
        aiService.generateInsights([], userProfile),
        aiService.getRealTimeAnalysis(['BTC', 'ETH', 'ENERGY', 'SOL', 'ADA'])
      ]);

      setInsights(prev => [...newInsights, ...prev].slice(0, maxInsights));
      setMarketData(newMarketData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Real-time update failed:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trend':
        return <TrendingUp size={16} />;
      case 'volatility':
        return <Activity size={16} />;
      case 'volume':
        return <BarChart3 size={16} />;
      case 'sentiment':
        return <PieChart size={16} />;
      case 'news':
        return <Globe size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trend':
        return 'text-green-600';
      case 'volatility':
        return 'text-orange-600';
      case 'volume':
        return 'text-blue-600';
      case 'sentiment':
        return 'text-purple-600';
      case 'news':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredInsights = insights.filter(insight => {
    const matchesCategory = selectedCategory === 'all' || insight.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || insight.severity === selectedSeverity;
    const matchesSearch = searchTerm === '' || 
      insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSeverity && matchesSearch;
  });

  const getMarketSummary = () => {
    const totalAssets = marketData.length;
    const positiveChanges = marketData.filter(d => d.change > 0).length;
    const negativeChanges = marketData.filter(d => d.change < 0).length;
    const avgChange = marketData.reduce((sum, d) => sum + d.changePercent, 0) / totalAssets;
    
    return { totalAssets, positiveChanges, negativeChanges, avgChange };
  };

  const marketSummary = getMarketSummary();

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Zap size={24} />
            <div>
              <h2 className="text-2xl font-bold">AI Insights Dashboard</h2>
              <p className="text-blue-100">Real-time market analysis and trading insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <div className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-lg">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Market Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold">{marketSummary.totalAssets}</div>
            <div className="text-sm text-blue-100">Assets Tracked</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-300">{marketSummary.positiveChanges}</div>
            <div className="text-sm text-blue-100">Gaining</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-300">{marketSummary.negativesChanges}</div>
            <div className="text-sm text-blue-100">Losing</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className={`text-2xl font-bold ${marketSummary.avgChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {marketSummary.avgChange >= 0 ? '+' : ''}{marketSummary.avgChange.toFixed(2)}%
            </div>
            <div className="text-sm text-blue-100">Avg Change</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="trend">Trends</option>
              <option value="volatility">Volatility</option>
              <option value="volume">Volume</option>
              <option value="sentiment">Sentiment</option>
              <option value="news">News</option>
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      )}

      {/* Market Data Overview */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 mb-3">Market Overview</h3>
        <div className="grid grid-cols-5 gap-3">
          {marketData.slice(0, 5).map((asset) => (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-50 p-3 rounded-lg"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">{asset.symbol}</span>
                {asset.change >= 0 ? (
                  <TrendingUp size={16} className="text-green-500" />
                ) : (
                  <TrendingDown size={16} className="text-red-500" />
                )}
              </div>
              <div className="text-lg font-semibold">${asset.price.toFixed(2)}</div>
              <div className={`text-sm ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {asset.change >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Insights List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            Latest Insights ({filteredInsights.length})
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Eye size={16} />
            <span>Real-time updates every {refreshInterval}s</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading insights...</p>
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Info size={48} className="mx-auto mb-4 opacity-50" />
            <p>No insights available</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onInsightClick?.(insight)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(insight.category)} bg-opacity-10`}>
                        {getCategoryIcon(insight.category)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(insight.severity)}`}>
                        {insight.severity}
                      </span>
                      {insight.actionable && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Actionable
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Calendar size={12} />
                        {insight.timestamp.toLocaleTimeString()}
                      </span>
                      <span className={`flex items-center space-x-1 ${getCategoryColor(insight.category)}`}>
                        {getCategoryIcon(insight.category)}
                        {insight.category}
                      </span>
                    </div>
                    {insight.relatedAssets.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <span>Related:</span>
                        {insight.relatedAssets.map((asset, i) => (
                          <span key={i} className="font-medium">
                            {asset}{i < insight.relatedAssets.length - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Insight Data Preview */}
                  {insight.data && Object.keys(insight.data).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(insight.data).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Powered by AI</span>
            <span>•</span>
            <span>Confidence: 85%+</span>
            <span>•</span>
            <span>Response time: &lt;500ms</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard;
