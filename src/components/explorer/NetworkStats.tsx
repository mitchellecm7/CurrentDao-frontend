'use client'

import { NetworkStats } from '@/types/explorer'
import { calculateNetworkHealth, getNetworkHealthColor } from '@/utils/explorerHelpers'
import { Activity, Clock, Users, Zap, Database, Shield, TrendingUp } from 'lucide-react'

interface NetworkStatsProps {
  stats: NetworkStats | null
  loading?: boolean
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Network Statistics</h3>
        <p className="text-gray-500">Network statistics unavailable</p>
      </div>
    )
  }

  const health = calculateNetworkHealth(stats)
  const healthColor = getNetworkHealthColor(health)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Network Statistics</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${healthColor}`}>
          {health.charAt(0).toUpperCase() + health.slice(1)} Health
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Network Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Activity className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium">Network Status</span>
          </div>
          <div className="text-2xl font-bold text-green-600 capitalize">
            {stats.networkStatus}
          </div>
        </div>

        {/* Current Ledger */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Database className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium">Current Ledger</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.currentLedger.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            Latest: {stats.latestLedger.toLocaleString()}
          </div>
        </div>

        {/* Ledger Close Time */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium">Close Time</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {(stats.ledgerCloseTime / 1000).toFixed(1)}s
          </div>
        </div>

        {/* Total Accounts */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-indigo-600 mr-2" />
            <span className="text-sm font-medium">Total Accounts</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {(stats.accountsCount / 1000).toFixed(0)}K
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Zap className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm font-medium">Transactions</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            stats.transactionCount.toLocaleString()
          </div>
        </div>

        {/* Operations */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium">Operations</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {stats.operationsCount.toLocaleString()}
          </div>
        </div>

        {/* Base Fee */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Shield className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm font-medium">Base Fee</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {stats.baseFee} stroops
          </div>
        </div>

        {/* Protocol Version */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Activity className="w-5 h-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium">Protocol</span>
          </div>
          <div className="text-2xl font-bold text-gray-600">
            v{stats.protocolVersion}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Base Reserve:</span>
            <span className="ml-2 font-medium">{stats.baseReserve} XLM</span>
          </div>
          <div>
            <span className="text-gray-500">Max Tx Set Size:</span>
            <span className="ml-2 font-medium">{stats.maxTxSetSize}</span>
          </div>
          <div>
            <span className="text-gray-500">Ledger Lag:</span>
            <span className="ml-2 font-medium">
              {stats.latestLedger - stats.currentLedger} ledgers
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
