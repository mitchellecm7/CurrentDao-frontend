import React, { useState } from 'react';
import { ProfitLossData } from '../../types/portfolio';

interface ProfitLossProps {
  profitLoss: ProfitLossData;
  className?: string;
}

export const ProfitLoss: React.FC<ProfitLossProps> = ({
  profitLoss,
  className = ''
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [showDetails, setShowDetails] = useState(false);

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

  const getProfitColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getProfitBgColor = (value: number) => {
    if (value > 0) return 'bg-green-100';
    if (value < 0) return 'bg-red-100';
    return 'bg-gray-100';
  };

  const getPeriodData = () => {
    switch (selectedPeriod) {
      case 'daily':
        return profitLoss.dailyPnL;
      case 'monthly':
        return profitLoss.monthlyPnL;
      case 'yearly':
        return profitLoss.yearlyPnL;
      default:
        return profitLoss.dailyPnL;
    }
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'daily':
        return 'Daily P&L';
      case 'monthly':
        return 'Monthly P&L';
      case 'yearly':
        return 'Yearly P&L';
      default:
        return 'Daily P&L';
    }
  };

  const totalInvested = Object.values(profitLoss.pnlByAsset).reduce((sum, val) => sum + Math.abs(val), 0);
  const totalValue = profitLoss.totalPnL;

  const exportToCSV = () => {
    const headers = ['Asset', 'P&L', 'Asset Type', 'P&L'];
    const assetRows = Object.entries(profitLoss.pnlByAsset).map(([asset, pnl]) => [
      asset,
      formatCurrency(pnl),
      '',
      ''
    ]);
    
    const typeRows = Object.entries(profitLoss.pnlByAssetType).map(([type, pnl]) => [
      '',
      '',
      type,
      formatCurrency(pnl)
    ]);

    const csv = [headers, ...assetRows, ...typeRows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-loss-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profit & Loss Analysis</h2>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={`p-4 rounded-lg ${getProfitBgColor(profitLoss.totalPnL)}`}>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total P&L</h3>
          <p className={`text-2xl font-bold ${getProfitColor(profitLoss.totalPnL)}`}>
            {formatCurrency(profitLoss.totalPnL)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Combined realized + unrealized
          </p>
        </div>

        <div className={`p-4 rounded-lg ${getProfitBgColor(profitLoss.realizedPnL)}`}>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Realized P&L</h3>
          <p className={`text-2xl font-bold ${getProfitColor(profitLoss.realizedPnL)}`}>
            {formatCurrency(profitLoss.realizedPnL)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            From completed trades
          </p>
        </div>

        <div className={`p-4 rounded-lg ${getProfitBgColor(profitLoss.unrealizedPnL)}`}>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Unrealized P&L</h3>
          <p className={`text-2xl font-bold ${getProfitColor(profitLoss.unrealizedPnL)}`}>
            {formatCurrency(profitLoss.unrealizedPnL)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            From current holdings
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">P&L Trends</h3>
          <div className="flex space-x-2">
            {(['daily', 'monthly', 'yearly'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{getPeriodLabel()}</span>
            <span className={`text-sm font-bold ${getProfitColor(getPeriodData().reduce((a, b) => a + b, 0))}`}>
              {formatCurrency(getPeriodData().reduce((a, b) => a + b, 0))}
            </span>
          </div>
          
          <div className="space-y-2">
            {getPeriodData().slice(0, 10).map((pnl, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedPeriod === 'daily' ? `Day ${index + 1}` : 
                   selectedPeriod === 'monthly' ? `Month ${index + 1}` : 
                   `Year ${index + 1}`}
                </span>
                <span className={`text-sm font-medium ${getProfitColor(pnl)}`}>
                  {formatCurrency(pnl)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">P&L by Asset</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {Object.entries(profitLoss.pnlByAsset)
                .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                .slice(0, 8)
                .map(([asset, pnl]) => (
                  <div key={asset} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getProfitBgColor(pnl)}`} />
                      <span className="text-sm font-medium text-gray-900">{asset}</span>
                    </div>
                    <span className={`text-sm font-bold ${getProfitColor(pnl)}`}>
                      {formatCurrency(pnl)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">P&L by Asset Type</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {Object.entries(profitLoss.pnlByAssetType)
                .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                .map(([assetType, pnl]) => (
                  <div key={assetType} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getProfitBgColor(pnl)}`} />
                      <span className="text-sm font-medium text-gray-900 capitalize">{assetType}</span>
                    </div>
                    <span className={`text-sm font-bold ${getProfitColor(pnl)}`}>
                      {formatCurrency(pnl)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-3">P&L Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium">Performance Summary:</p>
            <p>
              {profitLoss.totalPnL > 0 ? 'Profitable' : profitLoss.totalPnL < 0 ? 'Loss' : 'Break-even'} 
              {' '}portfolio with {formatCurrency(Math.abs(profitLoss.totalPnL))} 
              {' '}{profitLoss.totalPnL > 0 ? 'gain' : 'loss'}
            </p>
          </div>
          <div>
            <p className="font-medium">Realization Rate:</p>
            <p>
              {totalInvested > 0 ? formatPercentage((profitLoss.realizedPnL / totalInvested) * 100) : '0%'} 
              {' '}of total P&L is realized
            </p>
          </div>
          <div>
            <p className="font-medium">Best Performer:</p>
            <p>
              {Object.entries(profitLoss.pnlByAsset).length > 0 
                ? Object.entries(profitLoss.pnlByAsset)
                    .sort(([, a], [, b]) => b - a)[0][0]
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="font-medium">Risk Assessment:</p>
            <p>
              {Math.abs(profitLoss.unrealizedPnL) > profitLoss.realizedPnL 
                ? 'High unrealized exposure' 
                : 'Balanced realized/unrealized'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {showDetails ? 'Hide' : 'Show'} Detailed Analysis
        </button>
        
        <div className="flex space-x-4">
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Generate Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View Charts
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Top Gainers</h4>
              <div className="space-y-2">
                {Object.entries(profitLoss.pnlByAsset)
                  .filter(([, pnl]) => pnl > 0)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([asset, pnl]) => (
                    <div key={asset} className="flex justify-between text-sm">
                      <span className="text-gray-700">{asset}</span>
                      <span className="text-green-600 font-medium">{formatCurrency(pnl)}</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Top Losers</h4>
              <div className="space-y-2">
                {Object.entries(profitLoss.pnlByAsset)
                  .filter(([, pnl]) => pnl < 0)
                  .sort(([, a], [, b]) => a - b)
                  .slice(0, 5)
                  .map(([asset, pnl]) => (
                    <div key={asset} className="flex justify-between text-sm">
                      <span className="text-gray-700">{asset}</span>
                      <span className="text-red-600 font-medium">{formatCurrency(pnl)}</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Win Rate</span>
                  <span className="text-gray-900 font-medium">
                    {Object.values(profitLoss.pnlByAsset).filter(pnl => pnl > 0).length > 0
                      ? formatPercentage((Object.values(profitLoss.pnlByAsset).filter(pnl => pnl > 0).length / Object.values(profitLoss.pnlByAsset).length) * 100)
                      : '0%'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Avg Profit</span>
                  <span className="text-gray-900 font-medium">
                    {Object.values(profitLoss.pnlByAsset).filter(pnl => pnl > 0).length > 0
                      ? formatCurrency(Object.values(profitLoss.pnlByAsset).filter(pnl => pnl > 0).reduce((a, b) => a + b, 0) / Object.values(profitLoss.pnlByAsset).filter(pnl => pnl > 0).length)
                      : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Avg Loss</span>
                  <span className="text-gray-900 font-medium">
                    {Object.values(profitLoss.pnlByAsset).filter(pnl => pnl < 0).length > 0
                      ? formatCurrency(Object.values(profitLoss.pnlByAsset).filter(pnl => pnl < 0).reduce((a, b) => a + b, 0) / Object.values(profitLoss.pnlByAsset).filter(pnl => pnl < 0).length)
                      : '$0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
