import React, { useState } from 'react';
import { TradingStatistics, TaxReport } from '../../types/portfolio';

interface TradingStatisticsProps {
  statistics: TradingStatistics;
  taxReports: TaxReport[];
  className?: string;
}

export const TradingStatistics: React.FC<TradingStatisticsProps> = ({
  statistics,
  taxReports,
  className = ''
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showTaxDetails, setShowTaxDetails] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getEfficiencyRating = (winRate: number, profitFactor: number) => {
    if (winRate > 60 && profitFactor > 1.5) return { rating: 'Excellent', color: 'text-green-600' };
    if (winRate > 50 && profitFactor > 1.2) return { rating: 'Good', color: 'text-blue-600' };
    if (winRate > 40 && profitFactor > 1.0) return { rating: 'Average', color: 'text-yellow-600' };
    return { rating: 'Needs Improvement', color: 'text-red-600' };
  };

  const getActivityLevel = (tradeFrequency: number) => {
    if (tradeFrequency > 5) return { level: 'Very Active', color: 'text-red-600' };
    if (tradeFrequency > 2) return { level: 'Active', color: 'text-orange-600' };
    if (tradeFrequency > 1) return { level: 'Moderate', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  const currentTaxReport = taxReports.find(report => report.year === selectedYear) || taxReports[0];

  const exportToCSV = () => {
    const headers = ['Metric', 'Value', 'Description'];
    const rows = [
      ['Total Trades', statistics.totalTrades.toString(), 'All completed trades'],
      ['Buy Trades', statistics.buyTrades.toString(), 'Purchase transactions'],
      ['Sell Trades', statistics.sellTrades.toString(), 'Sale transactions'],
      ['Average Trade Size', formatCurrency(statistics.averageTradeSize), 'Average value per trade'],
      ['Average Holding Period', `${statistics.averageHoldingPeriod.toFixed(1)} days`, 'Average time held'],
      ['Trade Frequency', statistics.tradeFrequency.toFixed(2), 'Trades per day'],
      ['Trading Volume', formatCurrency(statistics.tradingVolume), 'Total transaction value'],
      ['Fees Paid', formatCurrency(statistics.feesPaid), 'Total trading fees'],
      ['Tax Liability', formatCurrency(statistics.taxLiability), 'Estimated tax obligation']
    ];

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-statistics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const efficiencyRating = getEfficiencyRating(
    (statistics.buyTrades + statistics.sellTrades) > 0 ? (statistics.buyTrades / (statistics.buyTrades + statistics.sellTrades)) * 100 : 0,
    1.5
  );
  const activityLevel = getActivityLevel(statistics.tradeFrequency);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Trading Statistics</h2>
        <div className="flex space-x-4">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Trading Activity</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Total Trades</p>
              <p className="text-lg font-bold text-gray-900">{statistics.totalTrades}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Activity Level</p>
              <p className={`text-sm font-medium ${activityLevel.color}`}>
                {activityLevel.level}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Trade Distribution</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Buy Trades</p>
              <p className="text-lg font-bold text-green-600">{statistics.buyTrades}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sell Trades</p>
              <p className="text-lg font-bold text-red-600">{statistics.sellTrades}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Trading Volume</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Total Volume</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(statistics.tradingVolume)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg Trade Size</p>
              <p className="text-sm font-medium text-gray-900">{formatCurrency(statistics.averageTradeSize)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Trading Costs</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Fees Paid</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(statistics.feesPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Tax Liability</p>
              <p className="text-sm font-medium text-orange-600">{formatCurrency(statistics.taxLiability)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Patterns</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Trade Frequency</span>
              <span className="font-medium text-gray-900">{formatNumber(statistics.tradeFrequency)} trades/day</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Holding Period</span>
              <span className="font-medium text-gray-900">{formatNumber(statistics.averageHoldingPeriod)} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Most Traded Asset</span>
              <span className="font-medium text-gray-900">{statistics.mostTradedAsset}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Best Performer</span>
              <span className="font-medium text-green-600">{statistics.bestPerformingAsset}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Worst Performer</span>
              <span className="font-medium text-red-600">{statistics.worstPerformingAsset}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Analysis</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Fees</span>
              <span className="font-medium text-red-600">{formatCurrency(statistics.feesPaid)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fee Ratio</span>
              <span className="font-medium text-gray-900">
                {statistics.tradingVolume > 0 ? formatPercentage((statistics.feesPaid / statistics.tradingVolume) * 100) : '0%'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estimated Tax</span>
              <span className="font-medium text-orange-600">{formatCurrency(statistics.taxLiability)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tax Efficiency</span>
              <span className="font-medium text-gray-900">
                {statistics.tradingVolume > 0 ? formatPercentage((statistics.taxLiability / statistics.tradingVolume) * 100) : '0%'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Net Cost Ratio</span>
              <span className="font-medium text-gray-900">
                {statistics.tradingVolume > 0 ? formatPercentage(((statistics.feesPaid + statistics.taxLiability) / statistics.tradingVolume) * 100) : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tax Reports</h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {taxReports.map(report => (
                <option key={report.year} value={report.year}>
                  {report.year}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowTaxDetails(!showTaxDetails)}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              {showTaxDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>
        </div>

        {currentTaxReport && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Gains</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Short-term</span>
                  <span className="text-sm font-medium text-green-600">{formatCurrency(currentTaxReport.shortTermGains)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Long-term</span>
                  <span className="text-sm font-medium text-green-600">{formatCurrency(currentTaxReport.longTermGains)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Total Gains</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(currentTaxReport.totalGains)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Losses & Net</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Losses</span>
                  <span className="text-sm font-medium text-red-600">{formatCurrency(currentTaxReport.losses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Net Gains</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(currentTaxReport.netGains)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Tax Rate</span>
                  <span className="text-sm font-medium text-gray-900">{formatPercentage(currentTaxReport.taxRate * 100)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Tax Estimate</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Estimated Tax</span>
                  <span className="text-sm font-bold text-red-600">{formatCurrency(currentTaxReport.estimatedTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Effective Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentTaxReport.netGains > 0 ? formatPercentage((currentTaxReport.estimatedTax / currentTaxReport.netGains) * 100) : '0%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Trade Count</span>
                  <span className="text-sm font-medium text-gray-900">{currentTaxReport.trades.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {showTaxDetails && currentTaxReport && (
          <div className="mt-4 bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Taxable Transactions ({currentTaxReport.trades.length})</h4>
            <div className="max-h-48 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gain/Loss</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTaxReport.trades.slice(0, 10).map((trade, index) => (
                    <tr key={index} className="text-sm">
                      <td className="px-4 py-2 text-gray-900">
                        {trade.timestamp.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-gray-900">{trade.asset}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          trade.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(trade.totalValue * 0.1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {currentTaxReport.trades.length > 10 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  ... and {currentTaxReport.trades.length - 10} more transactions
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-3">Trading Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium">Trading Style:</p>
            <p>
              {activityLevel.level} trading with {formatNumber(statistics.tradeFrequency)} trades per day
            </p>
          </div>
          <div>
            <p className="font-medium">Cost Efficiency:</p>
            <p>
              {statistics.tradingVolume > 0 && (statistics.feesPaid / statistics.tradingVolume) < 0.01 ? 'Excellent' : 
               statistics.tradingVolume > 0 && (statistics.feesPaid / statistics.tradingVolume) < 0.02 ? 'Good' : 'Needs Review'} 
              {' '}fee management
            </p>
          </div>
          <div>
            <p className="font-medium">Holding Strategy:</p>
            <p>
              {statistics.averageHoldingPeriod < 7 ? 'Day trading' : 
               statistics.averageHoldingPeriod < 30 ? 'Swing trading' : 
               statistics.averageHoldingPeriod < 365 ? 'Position trading' : 'Long-term investing'}
            </p>
          </div>
          <div>
            <p className="font-medium">Tax Optimization:</p>
            <p>
              {currentTaxReport && currentTaxReport.longTermGains > currentTaxReport.shortTermGains 
                ? 'Good long-term strategy' 
                : 'Consider holding periods for tax efficiency'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full ${efficiencyRating.color === 'text-green-600' ? 'bg-green-100' : efficiencyRating.color === 'text-blue-600' ? 'bg-blue-100' : efficiencyRating.color === 'text-yellow-600' ? 'bg-yellow-100' : 'bg-red-100'}`}>
            <span className={`text-sm font-medium ${efficiencyRating.color}`}>
              {efficiencyRating.rating}
            </span>
          </div>
          <span className="text-sm text-gray-600">Overall Trading Efficiency</span>
        </div>
        
        <div className="flex space-x-4">
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Generate Tax Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Download Full Report
          </button>
        </div>
      </div>
    </div>
  );
};
