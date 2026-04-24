import React from 'react';
import { PerformanceMetrics } from '../../types/portfolio';

interface PerformanceMetricsProps {
  metrics: PerformanceMetrics;
  className?: string;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  metrics,
  className = ''
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getMetricColor = (value: number, type: 'higher' | 'lower' = 'higher') => {
    if (type === 'higher') {
      return value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600';
    } else {
      return value < 0 ? 'text-green-600' : value > 0 ? 'text-red-600' : 'text-gray-600';
    }
  };

  const getQualityRating = (sharpeRatio: number) => {
    if (sharpeRatio > 2) return { rating: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (sharpeRatio > 1) return { rating: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (sharpeRatio > 0.5) return { rating: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { rating: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const qualityRating = getQualityRating(metrics.sharpeRatio);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Performance Metrics</h2>
        <div className={`px-3 py-1 rounded-full ${qualityRating.bg}`}>
          <span className={`text-sm font-medium ${qualityRating.color}`}>
            {qualityRating.rating}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Returns</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Total Return</p>
              <p className={`text-lg font-bold ${getMetricColor(metrics.totalReturn)}`}>
                {formatCurrency(metrics.totalReturn)}
              </p>
              <p className={`text-sm ${getMetricColor(metrics.totalReturnPercentage)}`}>
                {formatPercentage(metrics.totalReturnPercentage)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Annualized Return</p>
              <p className={`text-lg font-bold ${getMetricColor(metrics.annualizedReturn)}`}>
                {formatPercentage(metrics.annualizedReturn * 100)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Risk Metrics</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Sharpe Ratio</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(metrics.sharpeRatio)}
              </p>
              <p className="text-xs text-gray-500">Risk-adjusted return</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Volatility</p>
              <p className={`text-lg font-bold ${getMetricColor(metrics.volatility, 'lower')}`}>
                {formatPercentage(metrics.volatility)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Max Drawdown</p>
              <p className={`text-lg font-bold ${getMetricColor(metrics.maxDrawdown, 'lower')}`}>
                {formatPercentage(metrics.maxDrawdown)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Market Comparison</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Beta</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(metrics.beta)}
              </p>
              <p className="text-xs text-gray-500">Market sensitivity</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Alpha</p>
              <p className={`text-lg font-bold ${getMetricColor(metrics.alpha)}`}>
                {formatPercentage(metrics.alpha)}
              </p>
              <p className="text-xs text-gray-500">Excess return</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Trading Statistics</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Total Trades</p>
              <p className="text-lg font-bold text-gray-900">
                {metrics.totalTrades}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Win Rate</p>
              <p className={`text-lg font-bold ${getMetricColor(metrics.winRate)}`}>
                {formatPercentage(metrics.winRate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Profit Factor</p>
              <p className={`text-lg font-bold ${getMetricColor(metrics.profitFactor - 1)}`}>
                {formatNumber(metrics.profitFactor)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Trade Performance</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Average Win</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(metrics.averageWin)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Average Loss</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(metrics.averageLoss)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Win/Loss Ratio</p>
              <p className="text-lg font-bold text-gray-900">
                {metrics.averageLoss > 0 ? formatNumber(metrics.averageWin / metrics.averageLoss) : '∞'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Extreme Trades</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Largest Win</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(metrics.largestWin)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Largest Loss</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(metrics.largestLoss)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Winning Trades</p>
              <p className="text-lg font-bold text-gray-900">
                {metrics.winningTrades} / {metrics.totalTrades}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium">Risk-Adjusted Performance:</p>
            <p>
              {metrics.sharpeRatio > 1 ? 'Strong' : metrics.sharpeRatio > 0.5 ? 'Moderate' : 'Weak'} 
              {' '}risk-adjusted returns with Sharpe ratio of {formatNumber(metrics.sharpeRatio)}
            </p>
          </div>
          <div>
            <p className="font-medium">Trading Consistency:</p>
            <p>
              {metrics.winRate > 60 ? 'Excellent' : metrics.winRate > 40 ? 'Good' : 'Needs Improvement'} 
              {' '}win rate at {formatPercentage(metrics.winRate)}
            </p>
          </div>
          <div>
            <p className="font-medium">Volatility Profile:</p>
            <p>
              {metrics.volatility < 15 ? 'Low' : metrics.volatility < 25 ? 'Moderate' : 'High'} 
              {' '}volatility at {formatPercentage(metrics.volatility)}
            </p>
          </div>
          <div>
            <p className="font-medium">Drawdown Risk:</p>
            <p>
              {metrics.maxDrawdown < 10 ? 'Minimal' : metrics.maxDrawdown < 20 ? 'Moderate' : 'High'} 
              {' '}maximum drawdown of {formatPercentage(metrics.maxDrawdown)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Export Metrics
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          View Detailed Report
        </button>
      </div>
    </div>
  );
};
