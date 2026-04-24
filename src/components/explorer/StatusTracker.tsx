'use client'

import React from 'react'
import { Transaction } from '@/types/explorer'
import { getStatusColor } from '@/utils/explorerHelpers'
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'

interface StatusTrackerProps {
  transactions: Transaction[]
  className?: string
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({ 
  transactions, 
  className = '' 
}) => {
  const statusCounts = transactions.reduce((acc, tx) => {
    acc[tx.status] = (acc[tx.status] || 0) + 1
    return acc
  }, {} as Record<Transaction['status'], number>)

  const totalTransactions = transactions.length

  const statusConfig = [
    {
      status: 'confirmed' as const,
      label: 'Confirmed',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300'
    },
    {
      status: 'pending' as const,
      label: 'Pending',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300'
    },
    {
      status: 'failed' as const,
      label: 'Failed',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300'
    }
  ]

  const getPercentage = (count: number) => {
    if (totalTransactions === 0) return 0
    return Math.round((count / totalTransactions) * 100)
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-6">Transaction Status Overview</h3>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statusConfig.map(({ status, label, icon: Icon, color, bgColor, borderColor }) => {
          const count = statusCounts[status] || 0
          const percentage = getPercentage(count)
          
          return (
            <div
              key={status}
              className={`border-2 ${borderColor} ${bgColor} rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 ${color} mr-2`} />
                  <span className="font-medium">{label}</span>
                </div>
                <span className={`text-2xl font-bold ${color}`}>
                  {count}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${color.replace('text', 'bg')} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="text-sm text-gray-600 mt-1">
                {percentage}% of total
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Transactions by Status */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-700">Recent Transactions</h4>
        
        {statusConfig.map(({ status, label, icon: Icon, color }) => {
          const recentTransactions = transactions
            .filter(tx => tx.status === status)
            .slice(0, 3)
          
          if (recentTransactions.length === 0) return null
          
          return (
            <div key={status} className="border rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Icon className={`w-4 h-4 ${color} mr-2`} />
                <span className="font-medium text-sm">{label}</span>
              </div>
              
              <div className="space-y-2">
                {recentTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {tx.hash.substring(0, 8)}...
                      </span>
                      <span className="text-gray-600">
                        {tx.amount} {tx.asset.code}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
              
              {statusCounts[status] > 3 && (
                <div className="text-xs text-gray-500 mt-2">
                  +{statusCounts[status] - 3} more {label.toLowerCase()} transactions
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {totalTransactions}
            </div>
            <div className="text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {getPercentage(statusCounts.confirmed || 0)}%
            </div>
            <div className="text-gray-500">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.pending || 0}
            </div>
            <div className="text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {getPercentage(statusCounts.failed || 0)}%
            </div>
            <div className="text-gray-500">Failure Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}
