import React from 'react';
import { TrendingUp, Clock, Target, Activity, Search, Filter } from 'lucide-react';
import { SearchAnalytics as SearchAnalyticsType } from '@/types/search';

interface SearchAnalyticsProps {
  analytics: SearchAnalyticsType | null;
  className?: string;
}

export function SearchAnalytics({ analytics, className = '' }: SearchAnalyticsProps) {
  if (!analytics) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No analytics data available</p>
      </div>
    );
  }

  // Prepare data for simple displays
  const popularQueriesData = Array.from(analytics.popularQueries.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const filterUsageData = Array.from(analytics.filterUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const formatResponseTime = (time: number): string => {
    if (time < 1000) return `${Math.round(time)}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const getPerformanceGrade = (avgTime: number): { grade: string; color: string } => {
    if (avgTime < 200) return { grade: 'A', color: 'text-green-600' };
    if (avgTime < 500) return { grade: 'B', color: 'text-blue-600' };
    if (avgTime < 1000) return { grade: 'C', color: 'text-yellow-600' };
    return { grade: 'D', color: 'text-red-600' };
  };

  const performance = getPerformanceGrade(analytics.averageResponseTime);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Searches</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalSearches.toLocaleString()}</p>
            </div>
            <Search className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{formatResponseTime(analytics.averageResponseTime)}</p>
              <p className={`text-xs font-medium ${performance.color}`}>Performance: {performance.grade}</p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Queries</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.popularQueries.size}</p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Filter Usage</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.filterUsage.size}</p>
            </div>
            <Filter className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Simple Data Displays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Queries */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Search Queries</h3>
          {popularQueriesData.length > 0 ? (
            <div className="space-y-2">
              {popularQueriesData.map(([query, count], index) => (
                <div key={query} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700 truncate">{query}</span>
                  <span className="text-sm text-gray-500">{count} searches</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No search data available</p>
            </div>
          )}
        </div>

        {/* Filter Usage */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Usage</h3>
          {filterUsageData.length > 0 ? (
            <div className="space-y-2">
              {filterUsageData.map(([filter, count], index) => (
                <div key={filter} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">{filter}</span>
                  <span className="text-sm text-gray-500">{count} uses</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No filter usage data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Insights</h3>
        <div className="space-y-4">
          {/* Performance Insights */}
          <div className="flex items-start space-x-3">
            <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Performance Analysis</h4>
              <p className="text-sm text-gray-600 mt-1">
                Average response time is {formatResponseTime(analytics.averageResponseTime)}. 
                {analytics.averageResponseTime < 500 
                  ? ' Search performance is excellent and meets the 500ms target.'
                  : ' Consider optimizing search queries or indexing for better performance.'
                }
              </p>
            </div>
          </div>

          {/* Query Patterns */}
          <div className="flex items-start space-x-3">
            <Search className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Query Patterns</h4>
              <p className="text-sm text-gray-600 mt-1">
                Users have performed {analytics.totalSearches} searches with {analytics.popularQueries.size} unique queries.
                {analytics.popularQueries.size > 0 && (
                  <> The most popular search term has been used {Math.max(...analytics.popularQueries.values())} times.</>
                )}
              </p>
            </div>
          </div>

          {/* Filter Engagement */}
          <div className="flex items-start space-x-3">
            <Filter className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Filter Engagement</h4>
              <p className="text-sm text-gray-600 mt-1">
                {analytics.filterUsage.size > 0 
                  ? `Users are actively using ${analytics.filterUsage.size} different filters. The most used filter has been applied ${Math.max(...analytics.filterUsage.values())} times.`
                  : 'No filter usage detected yet. Consider promoting advanced filtering features.'
                }
              </p>
            </div>
          </div>

          {/* Click-through Analysis */}
          <div className="flex items-start space-x-3">
            <Target className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Result Engagement</h4>
              <p className="text-sm text-gray-600 mt-1">
                {analytics.resultClicks.size > 0 
                  ? `${analytics.resultClicks.size} different results have been clicked, showing good search relevance.`
                  : 'No result clicks tracked yet. Monitor user engagement to improve search relevance.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Recommendations</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {analytics.averageResponseTime > 500 && (
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Optimize search indexing to improve response times below 500ms</span>
            </li>
          )}
          {analytics.filterUsage.size < 3 && analytics.totalSearches > 10 && (
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Promote advanced filtering features to help users find more relevant results</span>
            </li>
          )}
          {analytics.popularQueries.size < analytics.totalSearches * 0.3 && (
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Consider implementing search suggestions to guide users to popular queries</span>
            </li>
          )}
          {analytics.resultClicks.size === 0 && analytics.totalSearches > 5 && (
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Track result clicks to analyze search relevance and improve ranking algorithm</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
