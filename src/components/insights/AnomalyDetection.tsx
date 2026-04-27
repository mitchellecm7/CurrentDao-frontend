'use client'

import { useState, useMemo } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts'
import { 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Clock,
  Zap,
  Info,
  Bell,
  Shield
} from 'lucide-react'
import { useEnergyInsights } from '../../hooks/useEnergyInsights'

interface AnomalyDetectionProps {
  userId?: string
  sensitivity?: 'low' | 'medium' | 'high'
  alertThreshold?: number
}

interface Anomaly {
  id: string
  timestamp: Date
  type: 'spike' | 'drop' | 'unusual_pattern'
  severity: 'low' | 'medium' | 'high' | 'critical'
  value: number
  expectedValue: number
  deviation: number
  description: string
  possibleCauses: string[]
  recommendations: string[]
  resolved?: boolean
}

export function AnomalyDetection({ 
  userId, 
  sensitivity = 'medium',
  alertThreshold = 2.0 
}: AnomalyDetectionProps) {
  const { consumptionData, anomalies, isLoading, error } = useEnergyInsights(userId)
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)
  const [showResolved, setShowResolved] = useState(false)

  const processedAnomalies = useMemo(() => {
    if (!anomalies) return []
    
    return anomalies
      .filter(anomaly => showResolved || !anomaly.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [anomalies, showResolved])

  const anomalyStats = useMemo(() => {
    if (!processedAnomalies.length) return null

    const total = processedAnomalies.length
    const critical = processedAnomalies.filter(a => a.severity === 'critical').length
    const high = processedAnomalies.filter(a => a.severity === 'high').length
    const medium = processedAnomalies.filter(a => a.severity === 'medium').length
    const low = processedAnomalies.filter(a => a.severity === 'low').length
    const resolved = processedAnomalies.filter(a => a.resolved).length

    return { total, critical, high, medium, low, resolved }
  }, [processedAnomalies])

  const chartData = useMemo(() => {
    if (!consumptionData) return []

    // Generate mock data with anomalies
    return Array.from({ length: 168 }, (_, i) => { // 7 days * 24 hours
      const hour = i % 24
      const day = Math.floor(i / 24)
      const baseConsumption = 2 + Math.sin(hour / 24 * Math.PI * 2) * 1.5
      
      // Add some anomalies
      let consumption = baseConsumption + (Math.random() - 0.5) * 0.5
      if (i === 42) consumption = baseConsumption * 3.5 // Spike
      if (i === 85) consumption = baseConsumption * 0.2 // Drop
      
      return {
        time: `${day}d ${hour}h`,
        consumption,
        expected: baseConsumption,
        isAnomaly: consumption > baseConsumption * 2 || consumption < baseConsumption * 0.5
      }
    })
  }, [consumptionData])

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load anomaly detection data</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Anomaly Detection</h3>
            <p className="text-sm text-gray-600">Unusual energy usage patterns</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sensitivity}
            onChange={(e) => {/* Handle sensitivity change */}}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="low">Low Sensitivity</option>
            <option value="medium">Medium Sensitivity</option>
            <option value="high">High Sensitivity</option>
          </select>
          <button
            onClick={() => setShowResolved(!showResolved)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              showResolved
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showResolved ? 'Hide Resolved' : 'Show Resolved'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {anomalyStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-xs text-red-600 font-medium">Critical</span>
            </div>
            <p className="text-2xl font-bold text-red-900">{anomalyStats.critical}</p>
            <p className="text-xs text-red-700">Immediate attention</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-xs text-orange-600 font-medium">High</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">{anomalyStats.high}</p>
            <p className="text-xs text-orange-700">Monitor closely</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <Info className="w-5 h-5 text-yellow-600" />
              <span className="text-xs text-yellow-600 font-medium">Medium</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900">{anomalyStats.medium}</p>
            <p className="text-xs text-yellow-700">Investigate soon</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Resolved</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{anomalyStats.resolved}</p>
            <p className="text-xs text-green-700">Issues fixed</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Consumption vs Expected</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval={23} // Show every 24th point (daily)
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value.toFixed(2)} kWh`, 
                name === 'consumption' ? 'Actual' : 'Expected'
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="expected"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
              strokeDasharray="5 5"
            />
            <Area
              type="monotone"
              dataKey="consumption"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
            />
            {chartData.filter(d => d.isAnomaly).map((anomaly, index) => (
              <ReferenceLine
                key={index}
                x={anomaly.time}
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Anomalies List */}
      <div className="space-y-3">
        <h4 className="text-lg font-medium text-gray-900">Detected Anomalies</h4>
        
        {processedAnomalies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No anomalies detected</p>
            <p className="text-sm">Your energy usage is within normal parameters</p>
          </div>
        ) : (
          processedAnomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedAnomaly?.id === anomaly.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${anomaly.resolved ? 'opacity-60' : ''}`}
              onClick={() => setSelectedAnomaly(anomaly)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    anomaly.severity === 'critical' ? 'bg-red-100' :
                    anomaly.severity === 'high' ? 'bg-orange-100' :
                    anomaly.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {anomaly.type === 'spike' ? (
                      <TrendingUp className={`w-4 h-4 ${
                        anomaly.severity === 'critical' ? 'text-red-600' :
                        anomaly.severity === 'high' ? 'text-orange-600' :
                        anomaly.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                    ) : (
                      <AlertTriangle className={`w-4 h-4 ${
                        anomaly.severity === 'critical' ? 'text-red-600' :
                        anomaly.severity === 'high' ? 'text-orange-600' :
                        anomaly.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {anomaly.type === 'spike' ? 'Consumption Spike' : 
                         anomaly.type === 'drop' ? 'Consumption Drop' : 
                         'Unusual Pattern'}
                      </span>
                      {anomaly.resolved && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Resolved
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{anomaly.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{anomaly.timestamp.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>{anomaly.value.toFixed(2)} kWh (expected: {anomaly.expectedValue.toFixed(2)})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{(anomaly.deviation * 100).toFixed(1)}% deviation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedAnomaly?.id === anomaly.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Possible Causes</h5>
                      <ul className="space-y-1">
                        {anomaly.possibleCauses.map((cause, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                            {cause}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Recommendations</h5>
                      <ul className="space-y-1">
                        {anomaly.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {!anomaly.resolved && (
                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Investigate
                      </button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Alert Settings */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Alert Settings</p>
              <p className="text-xs text-gray-600">
                Get notified when anomalies are detected
              </p>
            </div>
          </div>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
            Configure
          </button>
        </div>
      </div>
    </div>
  )
}
