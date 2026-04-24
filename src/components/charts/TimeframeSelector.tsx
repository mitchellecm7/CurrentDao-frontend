import React from 'react';
import { Timeframe } from '@/types/charts';

interface TimeframeSelectorProps {
  selectedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  disabled?: boolean;
  className?: string;
}

const timeframes: { value: Timeframe; label: string; description: string }[] = [
  { value: '1m', label: '1m', description: '1 minute' },
  { value: '5m', label: '5m', description: '5 minutes' },
  { value: '15m', label: '15m', description: '15 minutes' },
  { value: '30m', label: '30m', description: '30 minutes' },
  { value: '1h', label: '1h', description: '1 hour' },
  { value: '4h', label: '4h', description: '4 hours' },
  { value: '1d', label: '1D', description: '1 day' },
  { value: '1w', label: '1W', description: '1 week' },
  { value: '1M', label: '1M', description: '1 month' },
];

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selectedTimeframe,
  onTimeframeChange,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ${className}`}>
      {timeframes.map((timeframe) => (
        <button
          key={timeframe.value}
          onClick={() => onTimeframeChange(timeframe.value)}
          disabled={disabled}
          title={timeframe.description}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
            ${selectedTimeframe === timeframe.value
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }
            ${disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
            }
          `}
        >
          {timeframe.label}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;
