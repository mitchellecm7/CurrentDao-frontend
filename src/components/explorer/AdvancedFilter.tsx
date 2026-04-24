'use client'

import React, { useState } from 'react'
import { TransactionFilter, Transaction } from '@/types/explorer'
import { Calendar, Filter, Search, X } from 'lucide-react'

interface AdvancedFilterProps {
  filter: TransactionFilter
  onFilterChange: (filter: TransactionFilter) => void
  onClear: () => void
}

const transactionTypes: Transaction['type'][] = [
  'payment',
  'create_account',
  'manage_data',
  'set_options',
  'change_trust',
  'allow_trust',
  'account_merge',
  'inflation',
  'manage_buy_offer',
  'manage_sell_offer',
  'create_passive_sell_offer',
  'path_payment_strict_receive',
  'path_payment_strict_send'
]

const statusOptions: Transaction['status'][] = ['pending', 'confirmed', 'failed']

const commonAssets = ['XLM', 'USDC', 'EURT', 'BTC', 'ETH']

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  filter,
  onFilterChange,
  onClear
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState(filter.searchQuery || '')

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    const newDateRange = {
      ...filter.dateRange,
      [type]: new Date(value)
    }
    onFilterChange({
      ...filter,
      dateRange: newDateRange
    })
  }

  const handleAmountRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0
    const newAmountRange = {
      ...filter.amountRange,
      [type]: numValue
    }
    onFilterChange({
      ...filter,
      amountRange: newAmountRange
    })
  }

  const handleTypeToggle = (type: Transaction['type']) => {
    const currentTypes = filter.types || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    
    onFilterChange({
      ...filter,
      types: newTypes.length > 0 ? newTypes : undefined
    })
  }

  const handleStatusToggle = (status: Transaction['status']) => {
    const currentStatus = filter.status || []
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status]
    
    onFilterChange({
      ...filter,
      status: newStatus.length > 0 ? newStatus : undefined
    })
  }

  const handleAssetToggle = (asset: string) => {
    const currentAssets = filter.assets || []
    const newAssets = currentAssets.includes(asset)
      ? currentAssets.filter(a => a !== asset)
      : [...currentAssets, asset]
    
    onFilterChange({
      ...filter,
      assets: newAssets.length > 0 ? newAssets : undefined
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({
      ...filter,
      searchQuery: searchQuery.trim() || undefined
    })
  }

  const hasActiveFilters = !!(
    filter.dateRange ||
    filter.amountRange ||
    filter.types?.length ||
    filter.status?.length ||
    filter.assets?.length ||
    filter.searchQuery
  )

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold">Advanced Filters</h3>
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Calendar className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by transaction ID, address, or memo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </form>

      {/* Expandable Filters */}
      {isExpanded && (
        <div className="space-y-6 border-t pt-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  onChange={(e) => handleAmountRangeChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  onChange={(e) => handleAmountRangeChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Transaction Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {transactionTypes.map(type => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filter.types?.includes(type) || false}
                    onChange={() => handleTypeToggle(type)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(status => (
                <label key={status} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filter.status?.includes(status) || false}
                    onChange={() => handleStatusToggle(status)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Assets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assets
            </label>
            <div className="flex flex-wrap gap-2">
              {commonAssets.map(asset => (
                <label key={asset} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filter.assets?.includes(asset) || false}
                    onChange={() => handleAssetToggle(asset)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{asset}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
