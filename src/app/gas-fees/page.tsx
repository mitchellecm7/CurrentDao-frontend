'use client'

import React, { useState } from 'react'
import { useGasFees } from '@/hooks/useGasFees'
import { SpeedCostOption, FeeOptimization } from '@/types/gas'
import { GasEstimator } from '@/components/gas/GasEstimator'
import { FeeOptimizer } from '@/components/gas/FeeOptimizer'
import { SpeedCostSlider } from '@/components/gas/SpeedCostSlider'
import { FeeHistory } from '@/components/gas/FeeHistory'
import { FeeAlerts } from '@/components/gas/FeeAlerts'
import { BatchTransactions } from '@/components/gas/BatchTransactions'
import { ArrowLeft, RefreshCw, Settings } from 'lucide-react'

export default function GasFeesPage() {
  const {
    currentEstimate,
    speedOptions,
    historicalData,
    alerts,
    loading,
    error,
    optimizeCurrentFee,
    calculateTransactionFee,
    acknowledgeAlert,
    refreshData,
    networkCongestion
  } = useGasFees()

  const [selectedSpeedOption, setSelectedSpeedOption] = useState<SpeedCostOption | null>(null)
  const [feeOptimization, setFeeOptimization] = useState<FeeOptimization | null>(null)
  const [historyTimeRange, setHistoryTimeRange] = useState<'24h' | '7d' | '30d'>('7d')
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'alerts' | 'batch'>('overview')

  const handleSpeedOptionSelect = (option: SpeedCostOption) => {
    setSelectedSpeedOption(option)
    // Auto-optimize based on selected speed
    const optimization = optimizeCurrentFee(option.fee, option.estimatedTime)
    setFeeOptimization(optimization)
  }

  const handleOptimize = (currentFee: number, targetTime: number) => {
    const optimization = optimizeCurrentFee(currentFee, targetTime)
    setFeeOptimization(optimization)
  }

  const handleRefresh = () => {
    refreshData()
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'history', label: 'History', icon: ArrowLeft },
    { id: 'alerts', label: 'Alerts', icon: Settings },
    { id: 'batch', label: 'Batch', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Gas Fee Estimation & Optimization
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Network:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  networkCongestion === 'low' ? 'text-green-600 bg-green-100' :
                  networkCongestion === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                  'text-red-600 bg-red-100'
                }`}>
                  {networkCongestion.charAt(0).toUpperCase() + networkCongestion.slice(1)}
                </span>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-1 py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading gas data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gas Estimator */}
            <GasEstimator
              estimate={currentEstimate}
              loading={loading}
              error={error}
            />

            {/* Speed Cost Slider */}
            <SpeedCostSlider
              options={speedOptions}
              selectedOption={selectedSpeedOption}
              onOptionSelect={handleSpeedOptionSelect}
            />

            {/* Fee Optimizer */}
            <FeeOptimizer
              optimization={feeOptimization}
              loading={loading}
              onOptimize={handleOptimize}
            />

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Network</span>
                  <span className="font-medium capitalize">{networkCongestion}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Speed Options</span>
                  <span className="font-medium">{speedOptions.length} available</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Historical Data</span>
                  <span className="font-medium">{historicalData.length} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Alerts</span>
                  <span className="font-medium">{alerts.filter(a => !a.acknowledged).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="font-medium">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <FeeHistory
            data={historicalData}
            loading={loading}
            timeRange={historyTimeRange}
            onTimeRangeChange={setHistoryTimeRange}
          />
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <FeeAlerts
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
          />
        )}

        {/* Batch Tab */}
        {activeTab === 'batch' && (
          <BatchTransactions
            batches={[]}
            onCreateBatch={(transactions) => {
              console.log('Creating batch:', transactions)
            }}
            onExecuteBatch={(batchId) => {
              console.log('Executing batch:', batchId)
            }}
            onCancelBatch={(batchId) => {
              console.log('Cancelling batch:', batchId)
            }}
          />
        )}
      </div>
    </div>
  )
}
