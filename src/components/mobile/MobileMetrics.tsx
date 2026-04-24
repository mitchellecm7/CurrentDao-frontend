'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Battery, 
  Wifi, 
  Cpu, 
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface MobileMetricsProps {
  data?: any
  isLoading?: boolean
}

export function MobileMetrics({ data, isLoading }: MobileMetricsProps) {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [networkType, setNetworkType] = useState<string>('unknown')
  const [memoryUsage, setMemoryUsage] = useState<number>(0)
  const [cpuUsage, setCpuUsage] = useState<number>(0)

  useEffect(() => {
    const updateBatteryLevel = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery()
          setBatteryLevel(Math.round(battery.level * 100))
        } catch (error) {
          console.log('Battery API not available')
        }
      }
    }

    const updateNetworkStatus = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setNetworkType(connection.effectiveType || 'unknown')
      }
    }

    const updatePerformanceMetrics = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryUsage(Math.round(memory.usedJSHeapSize / 1024 / 1024))
      }
    }

    updateBatteryLevel()
    updateNetworkStatus()
    updatePerformanceMetrics()

    const interval = setInterval(() => {
      updatePerformanceMetrics()
      setCpuUsage(Math.random() * 100)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      title: 'Battery Level',
      value: batteryLevel !== null ? `${batteryLevel}%` : 'N/A',
      icon: <Battery className={`w-5 h-5 ${batteryLevel && batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}`} />,
      trend: batteryLevel && batteryLevel < 20 ? 'danger' : 'safe',
      description: 'Device battery status'
    },
    {
      title: 'Network Type',
      value: networkType.charAt(0).toUpperCase() + networkType.slice(1),
      icon: <Wifi className="w-5 h-5 text-blue-500" />,
      trend: 'neutral',
      description: 'Connection quality'
    },
    {
      title: 'Memory Usage',
      value: `${memoryUsage}MB`,
      icon: <Cpu className="w-5 h-5 text-purple-500" />,
      trend: memoryUsage > 100 ? 'warning' : 'safe',
      description: 'App memory consumption'
    },
    {
      title: 'CPU Usage',
      value: `${Math.round(cpuUsage)}%`,
      icon: <Activity className="w-5 h-5 text-orange-500" />,
      trend: cpuUsage > 80 ? 'warning' : 'safe',
      description: 'Processor utilization'
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'safe':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'danger':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'safe':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'danger':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {metric.icon}
                <span className="text-sm font-medium text-gray-900">{metric.title}</span>
              </div>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metric.value}
            </div>
            <div className="text-xs text-gray-500">
              {metric.description}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-500" />
          Performance Insights
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Optimization Score</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${85 - (memoryUsage / 150) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                {Math.max(0, 85 - Math.round((memoryUsage / 150) * 100))}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Load Time</span>
            </div>
            <span className="text-sm font-medium">1.2s</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Frame Rate</span>
            </div>
            <span className="text-sm font-medium">60 FPS</span>
          </div>
        </div>
      </div>

      {memoryUsage > 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Memory Usage Alert</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Memory usage is above recommended levels. Consider closing other apps or restarting the application.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
