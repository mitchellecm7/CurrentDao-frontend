import React, { useState } from 'react';
import { AssetAllocation, PortfolioAsset } from '../../types/portfolio';

interface AssetAllocationProps {
  allocation: AssetAllocation[];
  className?: string;
}

export const AssetAllocation: React.FC<AssetAllocationProps> = ({
  allocation,
  className = ''
}) => {
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

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

  const getAssetTypeColor = (assetType: string) => {
    const colors: Record<string, string> = {
      solar: '#FCD34D',
      wind: '#60A5FA',
      hydro: '#67E8F9',
      nuclear: '#A78BFA',
      fossil: '#9CA3AF',
      battery: '#34D399',
      grid: '#FB923C'
    };
    return colors[assetType] || '#9CA3AF';
  };

  const getAssetTypeIcon = (assetType: string) => {
    const icons: Record<string, string> = {
      solar: '☀️',
      wind: '💨',
      hydro: '💧',
      nuclear: '⚛️',
      fossil: '🏭',
      battery: '🔋',
      grid: '⚡'
    };
    return icons[assetType] || '📊';
  };

  const totalValue = allocation.reduce((sum, item) => sum + item.value, 0);

  const getAllocationStatus = (current: number, target: number) => {
    const deviation = Math.abs(current - target);
    if (deviation <= 2) return { status: 'Balanced', color: 'text-green-600' };
    if (deviation <= 5) return { status: 'Minor Deviation', color: 'text-yellow-600' };
    return { status: 'Rebalancing Needed', color: 'text-red-600' };
  };

  const exportToCSV = () => {
    const headers = ['Asset Type', 'Value', 'Current %', 'Target %', 'Deviation', 'Status'];
    const rows = allocation.map(item => {
      const status = getAllocationStatus(item.percentage, item.targetPercentage);
      return [
        item.assetType,
        formatCurrency(item.value),
        formatPercentage(item.percentage),
        formatPercentage(item.targetPercentage),
        formatPercentage(item.deviation),
        status.status
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asset-allocation-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Asset Allocation</h2>
        <div className="flex space-x-4">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'chart'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Chart View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Table View
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Total Portfolio Value: <span className="font-bold text-gray-900">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Allocation Distribution</h3>
            <div className="space-y-4">
              {allocation.map((item) => (
                <div key={item.assetType} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getAssetTypeIcon(item.assetType)}</span>
                      <span className="font-medium text-gray-900 capitalize">{item.assetType}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{formatPercentage(item.percentage)}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        Target: {formatPercentage(item.targetPercentage)}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div
                        className="h-8 rounded-full flex items-center justify-center text-white text-xs font-medium transition-all duration-300"
                        style={{
                          width: `${Math.min(item.percentage, 100)}%`,
                          backgroundColor: getAssetTypeColor(item.assetType)
                        }}
                      >
                        {item.percentage >= 5 && formatPercentage(item.percentage)}
                      </div>
                    </div>
                    {item.targetPercentage > 0 && (
                      <div
                        className="absolute top-0 h-8 border-l-2 border-dashed border-red-400"
                        style={{ left: `${item.targetPercentage}%` }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{formatCurrency(item.value)}</span>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const status = getAllocationStatus(item.percentage, item.targetPercentage);
                        return (
                          <>
                            <span className={status.color}>{status.status}</span>
                            <button
                              onClick={() => setSelectedAssetType(
                                selectedAssetType === item.assetType ? null : item.assetType
                              )}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {selectedAssetType === item.assetType ? 'Hide' : 'Show'} Details
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rebalancing Recommendations</h3>
            <div className="space-y-3">
              {allocation
                .filter(item => Math.abs(item.deviation) > 2)
                .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation))
                .map((item) => (
                  <div key={item.assetType} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getAssetTypeIcon(item.assetType)}</span>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{item.assetType}</p>
                        <p className="text-sm text-gray-600">
                          Current: {formatPercentage(item.percentage)} vs Target: {formatPercentage(item.targetPercentage)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${item.percentage > item.targetPercentage ? 'text-red-600' : 'text-green-600'}`}>
                        {item.percentage > item.targetPercentage ? 'Reduce' : 'Increase'} by {formatPercentage(Math.abs(item.deviation))}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency((Math.abs(item.deviation) / 100) * totalValue)}
                      </p>
                    </div>
                  </div>
                ))}
              {allocation.filter(item => Math.abs(item.deviation) > 2).length === 0 && (
                <p className="text-green-600 font-medium">Portfolio is well balanced!</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deviation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allocation.map((item) => {
                const status = getAllocationStatus(item.percentage, item.targetPercentage);
                return (
                  <tr key={item.assetType} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getAssetTypeIcon(item.assetType)}</span>
                        <span className="font-medium text-gray-900 capitalize">{item.assetType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPercentage(item.percentage)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {formatPercentage(item.targetPercentage)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        item.deviation > 0 ? 'text-red-600' : item.deviation < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {formatPercentage(item.deviation)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        status.color === 'text-green-600' ? 'bg-green-100 text-green-800' :
                        status.color === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {status.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setSelectedAssetType(
                          selectedAssetType === item.assetType ? null : item.assetType
                        )}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {selectedAssetType === item.assetType ? 'Hide' : 'Show'} Assets
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedAssetType && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {getAssetTypeIcon(selectedAssetType)} {selectedAssetType.charAt(0).toUpperCase() + selectedAssetType.slice(1)} Assets
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Buy Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allocation
                  .find(item => item.assetType === selectedAssetType)
                  ?.assets.map((asset: PortfolioAsset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {asset.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {asset.quantity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(asset.averageBuyPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(asset.currentPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(asset.totalValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          asset.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(asset.returnPercentage)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-3">Allocation Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium">Diversification Score:</p>
            <p>
              {allocation.length >= 5 ? 'Excellent' : allocation.length >= 3 ? 'Good' : 'Limited'} 
              {' '}diversification across {allocation.length} energy types
            </p>
          </div>
          <div>
            <p className="font-medium">Rebalancing Priority:</p>
            <p>
              {allocation.filter(item => Math.abs(item.deviation) > 5).length} 
              {' '}asset types require immediate attention
            </p>
          </div>
          <div>
            <p className="font-medium">Largest Allocation:</p>
            <p>
              {allocation.length > 0 
                ? `${allocation.sort((a, b) => b.value - a.value)[0].assetType} (${formatPercentage(allocation.sort((a, b) => b.value - a.value)[0].percentage)})`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="font-medium">Allocation Efficiency:</p>
            <p>
              {allocation.filter(item => Math.abs(item.deviation) <= 2).length / allocation.length >= 0.7 
                ? 'Well balanced' 
                : 'Needs optimization'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
