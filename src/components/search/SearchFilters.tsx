import React, { useState } from 'react';
import { X, Plus, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { SearchFilter, SearchFilterConfig } from '@/types/search';

interface SearchFiltersProps {
  filters: SearchFilter[];
  onFilterUpdate: (filter: SearchFilter) => void;
  onFilterRemove: (field: string) => void;
  className?: string;
}

export function SearchFilters({
  filters,
  onFilterUpdate,
  onFilterRemove,
  className = ''
}: SearchFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'energy', 'location']));
  const [newFilterField, setNewFilterField] = useState('');
  const [newFilterValue, setNewFilterValue] = useState('');

  const filterConfigs: SearchFilterConfig[] = [
    {
      field: 'type',
      label: 'Content Type',
      type: 'select',
      options: [
        { label: 'Energy Trade', value: 'energy_trade' },
        { label: 'DAO Proposal', value: 'dao_proposal' },
        { label: 'Market Data', value: 'market_data' },
        { label: 'Transaction', value: 'transaction' },
        { label: 'User', value: 'user' }
      ]
    },
    {
      field: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'Enter city, state, or region'
    },
    {
      field: 'energyType',
      label: 'Energy Type',
      type: 'select',
      options: [
        { label: 'Solar', value: 'solar' },
        { label: 'Wind', value: 'wind' },
        { label: 'Hydro', value: 'hydro' },
        { label: 'Geothermal', value: 'geothermal' },
        { label: 'Nuclear', value: 'nuclear' },
        { label: 'Natural Gas', value: 'natural_gas' },
        { label: 'Coal', value: 'coal' }
      ]
    },
    {
      field: 'price',
      label: 'Price ($/kWh)',
      type: 'range',
      min: 0,
      max: 0.5,
      step: 0.01
    },
    {
      field: 'volume',
      label: 'Volume (MWh)',
      type: 'range',
      min: 0,
      max: 10000,
      step: 100
    },
    {
      field: 'rating',
      label: 'Rating',
      type: 'range',
      min: 0,
      max: 5,
      step: 0.1
    },
    {
      field: 'availability',
      label: 'Availability',
      type: 'select',
      options: [
        { label: 'Immediate', value: 'immediate' },
        { label: 'Same Day', value: 'same_day' },
        { label: 'Next Day', value: 'next_day' },
        { label: 'Flexible', value: 'flexible' }
      ]
    },
    {
      field: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' }
      ]
    },
    {
      field: 'dateRange',
      label: 'Date Range',
      type: 'date'
    }
  ];

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const addFilter = () => {
    if (!newFilterField || !newFilterValue) return;

    const config = filterConfigs.find(c => c.field === newFilterField);
    if (!config) return;

    let operator: SearchFilter['operator'] = 'equals';
    let value: any = newFilterValue;

    switch (config.type) {
      case 'range':
        const [min, max] = newFilterValue.split('-').map(Number);
        operator = 'range';
        value = [min, max];
        break;
      case 'text':
        operator = 'contains';
        break;
      case 'select':
        operator = 'equals';
        break;
      case 'number':
        operator = 'greater_than';
        value = Number(value);
        break;
    }

    onFilterUpdate({
      field: newFilterField,
      operator,
      value,
      label: config.label
    });

    setNewFilterField('');
    setNewFilterValue('');
  };

  const renderFilterInput = (config: SearchFilterConfig) => {
    switch (config.type) {
      case 'select':
        return (
          <select
            value={newFilterField === config.field ? newFilterValue : ''}
            onChange={(e) => {
              setNewFilterField(config.field);
              setNewFilterValue(e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select {config.label}</option>
            {config.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'range':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              min={config.min}
              max={config.max}
              step={config.step}
              onChange={(e) => {
                setNewFilterField(config.field);
                const currentValue = newFilterValue.split('-');
                setNewFilterValue(`${e.target.value}-${currentValue[1] || ''}`);
              }}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              min={config.min}
              max={config.max}
              step={config.step}
              onChange={(e) => {
                setNewFilterField(config.field);
                const currentValue = newFilterValue.split('-');
                setNewFilterValue(`${currentValue[0] || ''}-${e.target.value}`);
              }}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            placeholder={config.placeholder}
            min={config.min}
            max={config.max}
            step={config.step}
            onChange={(e) => {
              setNewFilterField(config.field);
              setNewFilterValue(e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            onChange={(e) => {
              setNewFilterField(config.field);
              setNewFilterValue(e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      default:
        return (
          <input
            type="text"
            placeholder={config.placeholder}
            onChange={(e) => {
              setNewFilterField(config.field);
              setNewFilterValue(e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  };

  const formatFilterValue = (filter: SearchFilter): string => {
    if (filter.operator === 'range' && Array.isArray(filter.value)) {
      return `${filter.value[0]} - ${filter.value[1]}`;
    }
    return String(filter.value);
  };

  const getFilterIcon = (field: string): string => {
    switch (field) {
      case 'location': return '📍';
      case 'energyType': return '⚡';
      case 'price': return '💰';
      case 'volume': return '📊';
      case 'rating': return '⭐';
      case 'availability': return '⏰';
      case 'status': return '📋';
      case 'type': return '📄';
      default: return '🔧';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Active Filters */}
      {filters.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Active Filters</h3>
          <div className="space-y-2">
            {filters.map((filter) => (
              <div
                key={filter.field}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <span>{getFilterIcon(filter.field)}</span>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      {filter.label || filter.field}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {formatFilterValue(filter)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onFilterRemove(filter.field)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Categories */}
      <div className="space-y-3">
        {/* Basic Filters */}
        <div>
          <button
            onClick={() => toggleSection('basic')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-medium text-gray-900">Basic Filters</h3>
            {expandedSections.has('basic') ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {expandedSections.has('basic') && (
            <div className="mt-3 space-y-3">
              {filterConfigs
                .filter(config => ['type', 'status'].includes(config.field))
                .map(config => (
                  <div key={config.field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {config.label}
                    </label>
                    {renderFilterInput(config)}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Energy Filters */}
        <div>
          <button
            onClick={() => toggleSection('energy')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-medium text-gray-900">Energy Filters</h3>
            {expandedSections.has('energy') ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {expandedSections.has('energy') && (
            <div className="mt-3 space-y-3">
              {filterConfigs
                .filter(config => ['energyType', 'price', 'volume', 'rating'].includes(config.field))
                .map(config => (
                  <div key={config.field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {config.label}
                    </label>
                    {renderFilterInput(config)}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Location Filters */}
        <div>
          <button
            onClick={() => toggleSection('location')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-medium text-gray-900">Location & Time</h3>
            {expandedSections.has('location') ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {expandedSections.has('location') && (
            <div className="mt-3 space-y-3">
              {filterConfigs
                .filter(config => ['location', 'availability', 'dateRange'].includes(config.field))
                .map(config => (
                  <div key={config.field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {config.label}
                    </label>
                    {renderFilterInput(config)}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Filter Button */}
      {(newFilterField || newFilterValue) && (
        <div className="pt-3 border-t">
          <button
            onClick={addFilter}
            disabled={!newFilterField || !newFilterValue}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>Add Filter</span>
          </button>
        </div>
      )}

      {/* Quick Filter Presets */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Quick Filters</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onFilterUpdate({
              field: 'energyType',
              operator: 'in',
              value: ['solar', 'wind'],
              label: 'Renewable Only'
            })}
            className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100"
          >
            🌱 Renewable Only
          </button>
          <button
            onClick={() => onFilterUpdate({
              field: 'price',
              operator: 'less_than',
              value: 0.10,
              label: 'Under $0.10/kWh'
            })}
            className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
          >
            💰 Under $0.10/kWh
          </button>
          <button
            onClick={() => onFilterUpdate({
              field: 'rating',
              operator: 'greater_than',
              value: 4.5,
              label: 'High Rated'
            })}
            className="px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100"
          >
            ⭐ High Rated
          </button>
          <button
            onClick={() => onFilterUpdate({
              field: 'availability',
              operator: 'equals',
              value: 'immediate',
              label: 'Available Now'
            })}
            className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
            >
            ⚡ Available Now
          </button>
        </div>
      </div>
    </div>
  );
}
