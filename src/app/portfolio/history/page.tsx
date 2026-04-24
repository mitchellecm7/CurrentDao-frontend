import React, { useState } from 'react';
import { usePortfolioAnalytics } from '../../../hooks/usePortfolioAnalytics';
import { TradingHistory } from '../../../components/portfolio/TradingHistory';
import { PerformanceMetrics } from '../../../components/portfolio/PerformanceMetrics';
import { ProfitLoss } from '../../../components/portfolio/ProfitLoss';
import { AssetAllocation } from '../../../components/portfolio/AssetAllocation';
import { TradingStatistics } from '../../../components/portfolio/TradingStatistics';
import { ExportOptions } from '../../../types/portfolio';

export default function PortfolioHistoryPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'metrics' | 'pnl' | 'allocation' | 'statistics'>('overview');
  const [dateRange, setDateRange] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const { analytics, loading, error, trades, portfolio, exportData, refreshData, addTrade, updateTrade, deleteTrade } = usePortfolioAnalytics();

  const handleExport = async (format: 'csv' | 'pdf' | 'json' | 'excel') => {
    if (!analytics) return;

    setIsExporting(true);
    try {
      const exportOptions: ExportOptions = {
        format,
        dateRange: {
          start: dateRange === 'all' ? new Date('2020-01-01') : new Date(Date.now() - (dateRange === '1m' ? 30 : dateRange === '3m' ? 90 : dateRange === '6m' ? 180 : 365) * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        includeMetrics: ['performance', 'allocation', 'pnl', 'statistics'],
        includeCharts: true
      };

      const data = await exportData(exportOptions);
      
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 
              format === 'csv' ? 'text/csv' : 
              format === 'pdf' ? 'application/pdf' : 
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No portfolio data available</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'history', label: 'Trading History', icon: '📜' },
    { id: 'metrics', label: 'Performance', icon: '📈' },
    { id: 'pnl', label: 'P&L Analysis', icon: '💰' },
    { id: 'allocation', label: 'Allocation', icon: '🎯' },
    { id: 'statistics', label: 'Statistics', icon: '📊' }
  ];

  const dateRanges = [
    { id: '1m', label: '1 Month' },
    { id: '3m', label: '3 Months' },
    { id: '6m', label: '6 Months' },
    { id: '1y', label: '1 Year' },
    { id: 'all', label: 'All Time' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Analytics</h1>
              <p className="text-gray-600 mt-1">
                {portfolio?.name || 'Energy Trading Portfolio'} • 
                Total Value: {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0
                }).format(analytics.portfolio.totalValue)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dateRanges.map(range => (
                  <option key={range.id} value={range.id}>{range.label}</option>
                ))}
              </select>
              <button
                onClick={refreshData}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Refresh
              </button>
              <div className="relative">
                <button
                  onClick={() => {}}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>Export</span>
                  <span>⬇️</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 hidden">
                  <div className="py-1">
                    {['csv', 'pdf', 'json', 'excel'].map(format => (
                      <button
                        key={format}
                        onClick={() => handleExport(format as any)}
                        disabled={isExporting}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        Export as {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceMetrics metrics={analytics.metrics} />
              <ProfitLoss profitLoss={analytics.profitLoss} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AssetAllocation allocation={analytics.allocation} />
              <TradingStatistics 
                statistics={analytics.statistics} 
                taxReports={analytics.taxReports} 
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <TradingHistory 
            trades={trades}
            onTradeUpdate={updateTrade}
            onTradeDelete={deleteTrade}
          />
        )}

        {activeTab === 'metrics' && (
          <PerformanceMetrics metrics={analytics.metrics} />
        )}

        {activeTab === 'pnl' && (
          <ProfitLoss profitLoss={analytics.profitLoss} />
        )}

        {activeTab === 'allocation' && (
          <AssetAllocation allocation={analytics.allocation} />
        )}

        {activeTab === 'statistics' && (
          <TradingStatistics 
            statistics={analytics.statistics} 
            taxReports={analytics.taxReports} 
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('history')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-blue-200"
            >
              <span>📜</span>
              <span className="text-sm font-medium text-gray-900">View All Trades</span>
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-blue-200"
            >
              <span>📈</span>
              <span className="text-sm font-medium text-gray-900">Performance Report</span>
            </button>
            <button
              onClick={() => setActiveTab('allocation')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-blue-200"
            >
              <span>🎯</span>
              <span className="text-sm font-medium text-gray-900">Rebalance Portfolio</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-blue-200 disabled:opacity-50"
            >
              <span>📄</span>
              <span className="text-sm font-medium text-gray-900">Tax Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
