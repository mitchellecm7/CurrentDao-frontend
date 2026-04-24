import React, { useState } from 'react';
import { IndicatorConfig, TechnicalIndicatorData } from '@/types/charts';
import { Plus, Settings, Eye, EyeOff, Trash2 } from 'lucide-react';

interface TechnicalIndicatorsProps {
  indicators: IndicatorConfig[];
  calculatedIndicators: TechnicalIndicatorData[];
  onIndicatorAdd: (indicator: IndicatorConfig) => void;
  onIndicatorRemove: (indicatorName: string) => void;
  onIndicatorUpdate: (indicatorName: string, updates: Partial<IndicatorConfig>) => void;
  onIndicatorToggle: (indicatorName: string, visible: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const defaultIndicatorConfigs: Omit<IndicatorConfig, 'color'>[] = [
  { type: 'SMA', period: 20, visible: true },
  { type: 'EMA', period: 20, visible: true },
  { type: 'RSI', period: 14, visible: true },
  { type: 'MACD', period: 0, visible: true, parameters: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } },
  { type: 'BB', period: 20, visible: true, parameters: { stdDev: 2 } },
  { type: 'STOCH', period: 14, visible: true, parameters: { dPeriod: 3 } },
];

const indicatorColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#000000'
];

const getNextAvailableColor = (existingIndicators: IndicatorConfig[]): string => {
  const usedColors = existingIndicators.map(ind => ind.color);
  return indicatorColors.find(color => !usedColors.includes(color)) || indicatorColors[0];
};

export const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({
  indicators,
  calculatedIndicators,
  onIndicatorAdd,
  onIndicatorRemove,
  onIndicatorUpdate,
  onIndicatorToggle,
  disabled = false,
  className = '',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<IndicatorConfig>>({});

  const handleAddIndicator = (type: IndicatorConfig['type']) => {
    const defaultConfig = defaultIndicatorConfigs.find(config => config.type === type);
    if (!defaultConfig) return;

    const newIndicator: IndicatorConfig = {
      ...defaultConfig,
      color: getNextAvailableColor(indicators),
      strokeWidth: 2,
    };

    onIndicatorAdd(newIndicator);
    setShowAddModal(false);
  };

  const handleUpdateIndicator = (indicatorName: string) => {
    const indicator = indicators.find(ind => `${ind.type}(${ind.period})` === indicatorName);
    if (!indicator) return;

    onIndicatorUpdate(indicatorName, formData);
    setEditingIndicator(null);
    setFormData({});
  };

  const renderIndicatorForm = (indicator?: IndicatorConfig) => {
    const isEditing = !!indicator;
    const type = indicator?.type || formData.type;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Indicator Type
          </label>
          <select
            value={type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as IndicatorConfig['type'] })}
            disabled={isEditing}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {defaultIndicatorConfigs.map(config => (
              <option key={config.type} value={config.type}>
                {config.type}
              </option>
            ))}
          </select>
        </div>

        {type && type !== 'MACD' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Period
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={indicator?.period || formData.period || 14}
              onChange={(e) => setFormData({ ...formData, period: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        )}

        {type === 'MACD' && (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fast Period
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={indicator?.parameters?.fastPeriod || formData.parameters?.fastPeriod || 12}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, fastPeriod: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Slow Period
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={indicator?.parameters?.slowPeriod || formData.parameters?.slowPeriod || 26}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, slowPeriod: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Signal Period
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={indicator?.parameters?.signalPeriod || formData.parameters?.signalPeriod || 9}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: { ...formData.parameters, signalPeriod: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        )}

        {type === 'BB' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Standard Deviation
            </label>
            <input
              type="number"
              min="0.1"
              max="5"
              step="0.1"
              value={indicator?.parameters?.stdDev || formData.parameters?.stdDev || 2}
              onChange={(e) => setFormData({
                ...formData,
                parameters: { ...formData.parameters, stdDev: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        )}

        {type === 'STOCH' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              D Period
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={indicator?.parameters?.dPeriod || formData.parameters?.dPeriod || 3}
              onChange={(e) => setFormData({
                ...formData,
                parameters: { ...formData.parameters, dPeriod: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Color
          </label>
          <div className="flex space-x-2">
            {indicatorColors.map((color) => (
              <button
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                className={`
                  w-8 h-8 rounded-full border-2 transition-all duration-200
                  ${indicator?.color === formData.color || (!indicator && formData.color === color)
                    ? 'border-gray-900 dark:border-white scale-110'
                    : 'border-gray-300 dark:border-gray-600'
                  }
                  hover:scale-105
                `}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stroke Width
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={indicator?.strokeWidth || formData.strokeWidth || 2}
            onChange={(e) => setFormData({ ...formData, strokeWidth: Number(e.target.value) })}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {indicator?.strokeWidth || formData.strokeWidth || 2}px
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => isEditing ? handleUpdateIndicator(`${indicator.type}(${indicator.period})`) : handleAddIndicator(type!)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {isEditing ? 'Update' : 'Add'}
          </button>
          <button
            onClick={() => {
              setShowAddModal(false);
              setEditingIndicator(null);
              setFormData({});
            }}
            className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Technical Indicators
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={disabled}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          <span>Add</span>
        </button>
      </div>

      {indicators.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No indicators added yet. Click "Add" to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {indicators.map((indicator) => {
            const indicatorName = `${indicator.type}(${indicator.period})`;
            const calculatedIndicator = calculatedIndicators.find(ind => ind.name === indicatorName);
            
            return (
              <div
                key={indicatorName}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: indicator.color }}
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {indicatorName}
                    </div>
                    {calculatedIndicator && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Last: {calculatedIndicator.data[calculatedIndicator.data.length - 1]?.y?.toFixed(2) || 'N/A'}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onIndicatorToggle(indicatorName, !indicator.visible)}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    {indicator.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditingIndicator(indicatorName);
                      setFormData(indicator);
                    }}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    <Settings size={16} />
                  </button>
                  
                  <button
                    onClick={() => onIndicatorRemove(indicatorName)}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showAddModal || editingIndicator) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {editingIndicator ? 'Edit Indicator' : 'Add Technical Indicator'}
            </h3>
            {renderIndicatorForm(indicators.find(ind => `${ind.type}(${ind.period})` === editingIndicator))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalIndicators;
