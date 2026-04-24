'use client'

import { useState, useMemo } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Calendar,
  Zap,
  Activity,
  AlertCircle
} from 'lucide-react'
import { useEnergyInsights } from '../../hooks/useEnergyInsights'

interface ConsumptionPatternsProps {
  userId?: string
  timeRange?: 'day' | 'week' | 'month' | 'year'
}

export function ConsumptionPatterns({ userId, timeRange = 'week' }: ConsumptionPatternsProps) {
  const { consumptionData, isLoading, error } = useEnergyInsights(userId, timeRange)
  const [selectedPattern, setSelectedPattern] = useState<'daily' | 'weekly' | 'monthly' | 'seasonal'>('daily')

  const processedData = useMemo(() => {
    if (!consumptionData) return null

    const patterns = {
      daily: processDailyPattern(consumptionData),
      weekly: processWeeklyPattern(consumptionData),
      monthly: processMonthlyPattern(consumptionData),
      seasonal: processSeasonalPattern(consumptionData)
    }

    return patterns[selectedPattern]
  }, [consumptionData, selectedPattern])

  const insights = useMemo(() => {
    if (!processedData) return null
    return generateInsights(processedData, selectedPattern)
  }, [processedData, selectedPattern])

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
          <span>Failed to load consumption patterns</span>
        </div>
      </div>
    )
  }

  if (!processedData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="text-center text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No consumption data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Consumption Patterns</h3>
            <p className="text-sm text-gray-600">Analyze your energy usage trends</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly', 'seasonal'] as const).map((pattern) => (
            <button
              key={pattern}
              onClick={() => setSelectedPattern(pattern)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedPattern === pattern
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {selectedPattern.charAt(0).toUpperCase() + selectedPattern.slice(1)} Consumption
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          {selectedPattern === 'daily' ? (
            <LineChart data={processedData.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)} kWh`, 'Consumption']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="consumption" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
              />
            </LineChart>
          ) : (
            <BarChart data={processedData.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)} kWh`, 'Consumption']}
              />
              <Bar dataKey="consumption" fill="#3B82F6" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Peak Usage</span>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {processedData.peakTime}
          </p>
          <p className="text-sm text-gray-600">
            {processedData.peakConsumption.toFixed(2)} kWh
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Average Usage</span>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {processedData.averageConsumption.toFixed(2)} kWh
          </p>
          <p className="text-sm text-gray-600">
            Per {selectedPattern === 'daily' ? 'hour' : selectedPattern.slice(0, -2)}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Usage</span>
            <Zap className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {processedData.totalConsumption.toFixed(2)} kWh
          </p>
          <p className="text-sm text-gray-600">
            This {selectedPattern}
          </p>
        </div>
      </div>

      {/* Appliance Breakdown */}
      {processedData.applianceBreakdown && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Appliance Breakdown</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={processedData.applianceBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {processedData.applianceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {processedData.applianceBreakdown.map((appliance, index) => (
                <div key={appliance.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600">{appliance.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {appliance.value.toFixed(2)} kWh
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights && (
        <div className="border-t pt-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">AI Insights</h4>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  insight.type === 'positive' ? 'bg-green-500' :
                  insight.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{insight.message}</p>
                  {insight.recommendation && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 {insight.recommendation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

function processDailyPattern(data: any) {
  // Process hourly consumption data
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    time: `${hour.toString().padStart(2, '0')}:00`,
    consumption: Math.random() * 5 + 1 // Mock data
  }))

  const peakHour = hourlyData.reduce((max, curr) => 
    curr.consumption > max.consumption ? curr : max
  )

  return {
    chartData: hourlyData,
    peakTime: peakHour.time,
    peakConsumption: peakHour.consumption,
    averageConsumption: hourlyData.reduce((sum, h) => sum + h.consumption, 0) / 24,
    totalConsumption: hourlyData.reduce((sum, h) => sum + h.consumption, 0),
    applianceBreakdown: [
      { name: 'HVAC', value: 35.2 },
      { name: 'Lighting', value: 12.8 },
      { name: 'Appliances', value: 28.5 },
      { name: 'Electronics', value: 15.3 },
      { name: 'Other', value: 8.2 }
    ]
  }
}

function processWeeklyPattern(data: any) {
  const weekData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    period: day,
    consumption: Math.random() * 50 + 20 // Mock data
  }))

  return {
    chartData: weekData,
    peakTime: weekData.reduce((max, curr) => 
      curr.consumption > max.consumption ? curr : max
    ).period,
    peakConsumption: Math.max(...weekData.map(d => d.consumption)),
    averageConsumption: weekData.reduce((sum, d) => sum + d.consumption, 0) / 7,
    totalConsumption: weekData.reduce((sum, d) => sum + d.consumption, 0)
  }
}

function processMonthlyPattern(data: any) {
  const monthData = Array.from({ length: 30 }, (_, day) => ({
    period: `Day ${day + 1}`,
    consumption: Math.random() * 40 + 15 // Mock data
  }))

  return {
    chartData: monthData,
    peakTime: `Day ${monthData.reduce((max, curr) => 
      curr.consumption > max.consumption ? curr : max
    ).period.split(' ')[1]}`,
    peakConsumption: Math.max(...monthData.map(d => d.consumption)),
    averageConsumption: monthData.reduce((sum, d) => sum + d.consumption, 0) / 30,
    totalConsumption: monthData.reduce((sum, d) => sum + d.consumption, 0)
  }
}

function processSeasonalPattern(data: any) {
  const seasonData = ['Spring', 'Summer', 'Fall', 'Winter'].map(season => ({
    period: season,
    consumption: Math.random() * 500 + 200 // Mock data
  }))

  return {
    chartData: seasonData,
    peakTime: seasonData.reduce((max, curr) => 
      curr.consumption > max.consumption ? curr : max
    ).period,
    peakConsumption: Math.max(...seasonData.map(d => d.consumption)),
    averageConsumption: seasonData.reduce((sum, d) => sum + d.consumption, 0) / 4,
    totalConsumption: seasonData.reduce((sum, d) => sum + d.consumption, 0)
  }
}

function generateInsights(data: any, pattern: string) {
  const insights = []

  if (data.peakConsumption > data.averageConsumption * 2) {
    insights.push({
      type: 'warning',
      message: `Your peak usage is significantly higher than average (${data.peakTime})`,
      recommendation: 'Consider shifting high-energy activities to off-peak hours'
    })
  }

  if (pattern === 'daily' && data.peakTime >= '18:00' && data.peakTime <= '22:00') {
    insights.push({
      type: 'positive',
      message: 'Your peak usage aligns with typical evening hours',
      recommendation: 'Pre-heating or pre-cooling before peak hours can save costs'
    })
  }

  insights.push({
    type: 'positive',
    message: `Your total consumption of ${data.totalConsumption.toFixed(2)} kWh is within normal range`,
    recommendation: 'Continue monitoring for optimization opportunities'
  })

  return insights
}
