'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { TrendingUp, TrendingDown, Maximize2, RotateCw } from 'lucide-react'

interface TouchChartsProps {
  data?: any
  isLoading?: boolean
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export function TouchCharts({ data, isLoading }: TouchChartsProps) {
  const [selectedChart, setSelectedChart] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  const charts = [
    { name: 'Portfolio Value', type: 'line' },
    { name: 'Asset Distribution', type: 'pie' },
    { name: 'Volume Analysis', type: 'bar' },
    { name: 'Performance', type: 'area' }
  ]

  const generateMockData = (type: string) => {
    switch (type) {
      case 'line':
        return Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          value: Math.random() * 10000 + 50000,
          change: Math.random() * 2000 - 1000
        }))
      case 'pie':
        return [
          { name: 'Energy', value: 35, color: '#10B981' },
          { name: 'Stellar', value: 25, color: '#8B5CF6' },
          { name: 'Carbon Credits', value: 20, color: '#3B82F6' },
          { name: 'Treasury', value: 15, color: '#F59E0B' },
          { name: 'Other', value: 5, color: '#6B7280' }
        ]
      case 'bar':
        return Array.from({ length: 7 }, (_, i) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          volume: Math.random() * 5000 + 1000,
          trades: Math.floor(Math.random() * 100 + 20)
        }))
      case 'area':
        return Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          performance: Math.random() * 20 + 80,
          benchmark: 100
        }))
      default:
        return []
    }
  }

  const [chartData, setChartData] = useState(generateMockData('line'))

  useEffect(() => {
    const chartType = charts[selectedChart].type
    setChartData(generateMockData(chartType))
  }, [selectedChart])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    }

    const deltaX = touchEnd.x - touchStart.x
    const deltaY = touchEnd.y - touchStart.y

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        setSelectedChart((prev) => (prev - 1 + charts.length) % charts.length)
      } else {
        setSelectedChart((prev) => (prev + 1) % charts.length)
      }
    }

    setTouchStart(null)
  }

  const renderChart = () => {
    const chartType = charts[selectedChart].type

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={isFullscreen ? '70vh' : 250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#3B82F6' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={isFullscreen ? '70vh' : 250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={isFullscreen ? 120 : 80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={isFullscreen ? '70vh' : 250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="volume" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="trades" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={isFullscreen ? '70vh' : 250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="performance" 
                stackId="1"
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="benchmark" 
                stackId="2"
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      <div className="bg-white rounded-lg shadow-sm p-4" ref={chartRef}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{charts[selectedChart].name}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const chartType = charts[selectedChart].type
                setChartData(generateMockData(chartType))
              }}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div 
          className="touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {renderChart()}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-1">
            {charts.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedChart(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === selectedChart ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500">
            Swipe to change charts
          </div>
        </div>

        {charts[selectedChart].type === 'line' && chartData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                {chartData[chartData.length - 1].value > chartData[0].value ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className="font-medium">
                  {((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value * 100).toFixed(2)}%
                </span>
              </div>
              <span className="text-gray-500">30 day change</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
