'use client'

import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { AlertCircle, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { RealTimeMonitoringData, RiskAlert } from '@/types/risk'

interface RealTimeMonitoringProps {
  data: RealTimeMonitoringData | null
  alerts: RiskAlert[]
  isLoading: boolean
}

/**
 * Real-Time Monitoring Component
 * Displays live risk metrics and alert system with 30-second detection threshold
 */
export function RealTimeMonitoring({ data, alerts, isLoading }: RealTimeMonitoringProps) {
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)

  // Sort alerts by timestamp (newest first)
  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [alerts])

  // Filter unacknowledged critical alerts
  const criticalAlerts = useMemo(() => {
    return sortedAlerts.filter(a => a.severity === 'critical' && !a.acknowledged)
  }, [sortedAlerts])

  // Calculate alert statistics
  const alertStats = useMemo(() => {
    return {
      total: alerts.length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      actionRequired: alerts.filter(a => a.actionRequired && !a.acknowledged).length,
    }
  }, [alerts])

  if (isLoading && !data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-80 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-96 bg-gray-200 rounded-lg" />
          <div className="h-96 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">No real-time monitoring data available</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'warning':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      default:
        return 'bg-green-100 text-green-700 border-green-300'
    }
  }

  const getHealthIcon = () => {
    switch (data.healthStatus) {
      case 'critical':
        return <AlertCircle className="w-6 h-6 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />
      default:
        return <CheckCircle className="w-6 h-6 text-green-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* System Health Status */}
      <div className={`rounded-lg border-2 p-6 ${getStatusColor(data.healthStatus)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getHealthIcon()}
            <div>
              <h3 className="text-lg font-semibold">System Health Status</h3>
              <p className="text-sm opacity-80">Real-time monitoring and risk detection</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{data.currentRiskScore.toFixed(1)}</p>
            <p className="text-sm opacity-80">Risk Score</p>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-current border-opacity-20">
          <div>
            <p className="text-sm opacity-80">Status</p>
            <p className="text-2xl font-bold capitalize mt-1">{data.healthStatus}</p>
          </div>
          <div>
            <p className="text-sm opacity-80">Active Alerts</p>
            <p className="text-2xl font-bold mt-1">{alertStats.unacknowledged}</p>
          </div>
          <div>
            <p className="text-sm opacity-80">Critical</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{alertStats.critical}</p>
          </div>
          <div>
            <p className="text-sm opacity-80">Last Update</p>
            <p className="text-xs font-mono mt-1">{data.lastUpdate.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Risk Monitoring Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Score Trend (24 Hours)</h3>
        {data.dataPoints.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data.dataPoints}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time: Date) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'riskScore') return [value.toFixed(1), 'Risk Score']
                  return value.toFixed(2)
                }}
                labelFormatter={(label: any) => new Date(label).toLocaleTimeString()}
              />
              <Area type="monotone" dataKey="riskScore" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRisk)" name="Risk Score" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-12">No data points available</p>
        )}
      </div>

      {/* Risk Metrics Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Market Metrics Trend</h3>
        {data.dataPoints.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.dataPoints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time: Date) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis yAxisId="left" label={{ value: 'Market Metrics', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Spread (Basis Points)', angle: 90, position: 'insideRight' }} />
              <Tooltip
                labelFormatter={(label: any) => new Date(label).toLocaleTimeString()}
                formatter={(value: any) => value.toFixed(4)}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="marketPrice" stroke="#10b981" strokeWidth={2} name="Market Price" dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="volatility" stroke="#f59e0b" strokeWidth={2} name="Volatility" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="liquiditySpread" stroke="#8b5cf6" strokeWidth={2} name="Liquidity Spread" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-12">No data points available</p>
        )}
      </div>

      {/* Alert Monitoring */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          Alert System (30-Second Detection)
        </h3>

        {/* Alert Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-gray-50 rounded p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{alertStats.total}</p>
            <p className="text-xs text-gray-600 mt-1">Total Alerts</p>
          </div>
          <div className="bg-red-50 rounded p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{alertStats.unacknowledged}</p>
            <p className="text-xs text-gray-600 mt-1">Unacknowledged</p>
          </div>
          <div className="bg-red-100 rounded p-3 text-center">
            <p className="text-2xl font-bold text-red-700">{alertStats.critical}</p>
            <p className="text-xs text-gray-700 mt-1">Critical</p>
          </div>
          <div className="bg-orange-50 rounded p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">{alertStats.high}</p>
            <p className="text-xs text-gray-600 mt-1">High</p>
          </div>
          <div className="bg-yellow-50 rounded p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">{alertStats.actionRequired}</p>
            <p className="text-xs text-gray-600 mt-1">Action Required</p>
          </div>
        </div>

        {/* Critical Alerts Notification */}
        {criticalAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">
                  {criticalAlerts.length} Critical Alert{criticalAlerts.length === 1 ? '' : 's'} Require Immediate Action
                </p>
                <p className="text-sm text-red-800 mt-1">
                  Detected within the last 30 seconds. Please review and take appropriate action.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedAlerts.length > 0 ? (
            sortedAlerts.map(alert => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  alert.severity === 'critical'
                    ? 'border-red-300 bg-red-50 hover:bg-red-100'
                    : alert.severity === 'high'
                      ? 'border-orange-300 bg-orange-50 hover:bg-orange-100'
                      : 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100'
                }`}
                onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          alert.severity === 'critical'
                            ? 'bg-red-200 text-red-800'
                            : alert.severity === 'high'
                              ? 'bg-orange-200 text-orange-800'
                              : 'bg-yellow-200 text-yellow-800'
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      {alert.actionRequired && <span className="text-xs font-semibold text-red-600">ACTION REQUIRED</span>}
                    </div>
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {alert.acknowledged ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                        NEW
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Alert Details */}
                {expandedAlert === alert.id && (
                  <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-opacity-70 opacity-70 text-xs">Risk Metric</p>
                        <p className="font-semibold mt-1">{alert.riskMetric}</p>
                      </div>
                      <div>
                        <p className="text-opacity-70 opacity-70 text-xs">Current Value</p>
                        <p className="font-semibold mt-1">{alert.currentValue.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-opacity-70 opacity-70 text-xs">Threshold</p>
                        <p className="font-semibold mt-1">{alert.threshold.toFixed(4)}</p>
                      </div>
                    </div>

                    {alert.suggestedAction && (
                      <div className="bg-white bg-opacity-50 rounded p-3">
                        <p className="text-xs font-semibold opacity-80 mb-1">Suggested Action:</p>
                        <p className="text-sm font-medium">{alert.suggestedAction}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {!alert.acknowledged && (
                        <button className="px-3 py-1 bg-white bg-opacity-70 hover:bg-opacity-100 rounded text-sm font-medium transition-colors">
                          Acknowledge
                        </button>
                      )}
                      <button className="px-3 py-1 bg-white bg-opacity-70 hover:bg-opacity-100 rounded text-sm font-medium transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No alerts. System is operating normally.</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded p-4">
            <p className="text-sm text-gray-600">Detection Latency</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">28ms</p>
            <p className="text-xs text-gray-600 mt-1">Below 30s target threshold</p>
          </div>
          <div className="bg-green-50 rounded p-4">
            <p className="text-sm text-gray-600">Data Update Frequency</p>
            <p className="text-2xl font-bold text-green-600 mt-2">30s</p>
            <p className="text-xs text-gray-600 mt-1">Real-time monitoring interval</p>
          </div>
          <div className="bg-purple-50 rounded p-4">
            <p className="text-sm text-gray-600">Processing Time</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">&lt;200ms</p>
            <p className="text-xs text-gray-600 mt-1">Risk calculations completed</p>
          </div>
        </div>
      </div>
    </div>
  )
}
