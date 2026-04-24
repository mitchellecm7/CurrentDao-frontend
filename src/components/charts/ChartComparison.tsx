import React, { useState } from 'react';
import { ChartComparison, PriceDataPoint } from '@/types/charts';
import { Plus, Eye, EyeOff, Trash2, TrendingUp } from 'lucide-react';

interface ChartComparisonProps {
  comparisons: ChartComparison[];
  onComparisonAdd: (comparison: ChartComparison) => void;
  onComparisonRemove: (symbol: string) => void;
  onComparisonToggle: (symbol: string, visible: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const availableEnergyTypes = [
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { symbol: 'SOL', name: 'Solana', color: '#00FFA3' },
  { symbol: 'ADA', name: 'Cardano', color: '#0033AD' },
  { symbol: 'DOT', name: 'Polkadot', color: '#E6007A' },
  { symbol: 'MATIC', name: 'Polygon', color: '#8247E5' },
  { symbol: 'AVAX', name: 'Avalanche', color: '#E84142' },
  { symbol: 'LINK', name: 'Chainlink', color: '#2A5ADA' },
];

const generateMockComparisonData = (symbol: string, count: number = 100): PriceDataPoint[] => {
  const data: PriceDataPoint[] = [];
  const now = Date.now();
  const basePrice = 50 + Math.random() * 200;
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - (i * 60000);
    const volatility = 0.02 + Math.random() * 0.03;
    const trend = Math.sin(i * 0.1) * 0.01;
    
    const open = basePrice + (Math.random() - 0.5) * basePrice * 0.1;
    const change = (Math.random() - 0.5 + trend) * volatility;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * open;
    const low = Math.min(open, close) - Math.random() * volatility * open;
    const volume = Math.floor(500000 + Math.random() * 2000000);
    
    data.push({
      timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
  }
  
  return data;
};

export const ChartComparison: React.FC<ChartComparisonProps> = ({
  comparisons,
  onComparisonAdd,
  onComparisonRemove,
  onComparisonToggle,
  disabled = false,
  className = '',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEnergyType, setSelectedEnergyType] = useState<typeof availableEnergyTypes[0] | null>(null);

  const handleAddComparison = () => {
    if (!selectedEnergyType) return;

    const existingComparison = comparisons.find(c => c.symbol === selectedEnergyType.symbol);
    if (existingComparison) {
      setShowAddModal(false);
      setSelectedEnergyType(null);
      return;
    }

    const newComparison: ChartComparison = {
      symbol: selectedEnergyType.symbol,
      name: selectedEnergyType.name,
      color: selectedEnergyType.color,
      data: generateMockComparisonData(selectedEnergyType.symbol),
      visible: true,
    };

    onComparisonAdd(newComparison);
    setShowAddModal(false);
    setSelectedEnergyType(null);
  };

  const calculatePerformance = (data: PriceDataPoint[]): number => {
    if (data.length < 2) return 0;
    const firstClose = data[0].close;
    const lastClose = data[data.length - 1].close;
    return ((lastClose - firstClose) / firstClose) * 100;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <TrendingUp size={20} />
          <span>Chart Comparison</span>
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={disabled || comparisons.length >= 4}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          <span>Add</span>
        </button>
      </div>

      {comparisons.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
          <p>No comparisons added yet.</p>
          <p className="text-sm">Click "Add" to compare different energy types.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comparisons.map((comparison) => {
            const performance = calculatePerformance(comparison.data);
            const isPositive = performance >= 0;

            return (
              <div
                key={comparison.symbol}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: comparison.color }}
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {comparison.name} ({comparison.symbol})
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {comparison.data.length} data points
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isPositive ? '+' : ''}{performance.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ${comparison.data[comparison.data.length - 1]?.close.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onComparisonToggle(comparison.symbol, !comparison.visible)}
                      className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    >
                      {comparison.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    
                    <button
                      onClick={() => onComparisonRemove(comparison.symbol)}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {comparisons.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performance Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            {comparisons.map((comparison) => {
              const performance = calculatePerformance(comparison.data);
              const isPositive = performance >= 0;
              
              return (
                <div key={comparison.symbol} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: comparison.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {comparison.symbol}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositive ? '+' : ''}{performance.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Add Energy Type Comparison
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Energy Type
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {availableEnergyTypes.map((energyType) => {
                    const isAlreadyAdded = comparisons.some(c => c.symbol === energyType.symbol);
                    
                    return (
                      <button
                        key={energyType.symbol}
                        onClick={() => !isAlreadyAdded && setSelectedEnergyType(energyType)}
                        disabled={isAlreadyAdded}
                        className={`
                          p-3 rounded-lg border-2 transition-all duration-200
                          ${selectedEnergyType?.symbol === energyType.symbol
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : isAlreadyAdded
                            ? 'border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: energyType.color }}
                          />
                          <div className="text-left">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {energyType.symbol}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {energyType.name}
                            </div>
                          </div>
                        </div>
                        {isAlreadyAdded && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Already added
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleAddComparison}
                  disabled={!selectedEnergyType}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Comparison
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedEnergyType(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartComparison;
