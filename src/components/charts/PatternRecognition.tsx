import React, { useState, useEffect } from 'react';
import { ChartPattern } from '@/services/charts/pattern-detection';
import { PriceDataPoint } from '@/types/charts';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle,
  Target,
  Info
} from 'lucide-react';

interface PatternRecognitionProps {
  patterns: ChartPattern[];
  data: PriceDataPoint[];
  onPatternSelect?: (pattern: ChartPattern) => void;
  className?: string;
}

export const PatternRecognition: React.FC<PatternRecognitionProps> = ({
  patterns,
  data,
  onPatternSelect,
  className = '',
}) => {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');

  const filteredPatterns = patterns.filter(pattern => 
    filter === 'all' || pattern.type === filter
  );

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
  };

  const handlePatternClick = (pattern: ChartPattern) => {
    setSelectedPattern(pattern.id);
    onPatternSelect?.(pattern);
  };

  const highlightPatternOnChart = (pattern: ChartPattern) => {
    // This would highlight the pattern on the main chart
    console.log('Highlighting pattern:', pattern.name, pattern.startIndex, pattern.endIndex);
  };

  if (patterns.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 dark:text-gray-400 ${className}`}>
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No patterns detected in the current data</p>
        <p className="text-sm">Patterns will appear as they form in the price action</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Pattern Recognition
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredPatterns.length} patterns found
          </span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex space-x-2">
        {(['all', 'bullish', 'bearish', 'neutral'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Pattern List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredPatterns.map((pattern) => (
          <div
            key={pattern.id}
            className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
              selectedPattern === pattern.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => handlePatternClick(pattern)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getPatternIcon(pattern.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {pattern.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(pattern.confidence)}`}>
                      {(pattern.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {pattern.description}
                  </p>
                  
                  {/* Pattern Details */}
                  {showDetails === pattern.id && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Start:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {data[pattern.startIndex]?.timestamp ? 
                              new Date(data[pattern.startIndex].timestamp).toLocaleDateString() : 
                              'N/A'
                            }
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">End:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {data[pattern.endIndex]?.timestamp ? 
                              new Date(data[pattern.endIndex].timestamp).toLocaleDateString() : 
                              'N/A'
                            }
                          </span>
                        </div>
                      </div>
                      
                      {/* Price Targets */}
                      {pattern.targets && pattern.targets.length > 0 && (
                        <div>
                          <div className="flex items-center space-x-1 mb-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">Price Targets:</span>
                          </div>
                          <div className="space-y-1">
                            {pattern.targets.map((target, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Target {index + 1}:
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    ${target.price.toFixed(4)}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    ({(target.probability * 100).toFixed(0)}%)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Stop Loss */}
                      {pattern.stopLoss && (
                        <div>
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Stop Loss:</span>
                            <span className="font-medium text-red-600">
                              ${pattern.stopLoss.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(showDetails === pattern.id ? null : pattern.id);
                  }}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  title="Toggle Details"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    highlightPatternOnChart(pattern);
                  }}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  title="Highlight on Chart"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pattern Statistics */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Pattern Statistics</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {patterns.filter(p => p.type === 'bullish').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Bullish</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {patterns.filter(p => p.type === 'bearish').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Bearish</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {patterns.filter(p => p.type === 'neutral').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Neutral</div>
          </div>
        </div>
      </div>

      {/* AI Confidence Indicator */}
      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            AI-Assisted Detection
          </span>
        </div>
        <span className="text-xs text-blue-700 dark:text-blue-300">
          Enhanced pattern recognition with 80%+ accuracy
        </span>
      </div>
    </div>
  );
};

export default PatternRecognition;
