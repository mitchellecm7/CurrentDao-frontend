'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Battery, 
  Wifi, 
  WifiOff, 
  Activity,
  BarChart3,
  PieChart,
  Download,
  Share2,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { TouchCharts } from './TouchCharts'
import { GestureNavigation } from './GestureNavigation'
import { MobileMetrics } from './MobileMetrics'
import { useMobileAnalytics } from '@/hooks/useMobileAnalytics'
import { useGestures } from '@/hooks/useGestures'
import { getMobileAnalytics } from '@/services/mobile/mobile-analytics'

interface MobileDashboardProps {
  userId?: string
  portfolioId?: string
}

export function MobileDashboard({ userId, portfolioId }: MobileDashboardProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [isOffline, setIsOffline] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [networkType, setNetworkType] = useState<string>('unknown')

  const {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    exportData,
    cacheSize,
    memoryUsage
  } = useMobileAnalytics({ userId, portfolioId })

  const { swipeHandlers } = useGestures({
    onSwipeLeft: () => setActiveTab((prev) => (prev + 1) % 3),
    onSwipeRight: () => setActiveTab((prev) => (prev - 1 + 3) % 3),
  })

  const tabs = [
    { label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Charts', icon: <PieChart className="w-5 h-5" /> },
    { label: 'Metrics', icon: <Activity className="w-5 h-5" /> }
  ]

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
      toast.success('Data refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshData])

  const handleExport = useCallback(async () => {
    try {
      const exportData = await getMobileAnalytics.exportAnalytics(data)
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mobile-analytics-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Analytics exported successfully')
    } catch (error) {
      toast.error('Failed to export analytics')
    }
  }, [data])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mobile Analytics Dashboard',
          text: 'Check out my portfolio analytics',
          url: window.location.href
        })
      } catch (error) {
        toast.error('Failed to share')
      }
    } else {
      toast.error('Sharing not supported on this device')
    }
  }, [])

  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOffline(!navigator.onLine)
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setNetworkType(connection.effectiveType || 'unknown')
      }
    }

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

    updateNetworkStatus()
    updateBatteryLevel()

    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
    }
  }, [])

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-xs opacity-75">24h</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">
                    {data?.portfolio?.change24h ? `+${data.portfolio.change24h}%` : '+0%'}
                  </div>
                  <div className="text-xs opacity-75">Portfolio Gain</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <Activity className="w-6 h-6" />
                  <span className="text-xs opacity-75">Live</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">
                    ${data?.portfolio?.value ? data.portfolio.value.toLocaleString() : '0'}
                  </div>
                  <div className="text-xs opacity-75">Total Value</div>
                </div>
              </div>
            </div>

            {isOffline && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center space-x-2">
                <WifiOff className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">Offline mode - showing cached data</span>
              </div>
            )}

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium">
                    {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <span className="text-sm font-medium">{memoryUsage}MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cache Size</span>
                  <span className="text-sm font-medium">{cacheSize}KB</span>
                </div>
              </div>
            </div>
          </motion.div>
        )
      
      case 1:
        return <TouchCharts data={data} isLoading={isLoading} />
      
      case 2:
        return <MobileMetrics data={data} isLoading={isLoading} />
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" {...swipeHandlers}>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleExport}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {isOffline ? (
                  <WifiOff className="w-3 h-3 text-red-500" />
                ) : (
                  <Wifi className="w-3 h-3 text-green-500" />
                )}
                <span>{isOffline ? 'Offline' : networkType}</span>
              </div>
              {batteryLevel !== null && (
                <div className="flex items-center space-x-1">
                  <Battery className={`w-3 h-3 ${batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}`} />
                  <span>{batteryLevel}%</span>
                </div>
              )}
            </div>
            <span>Updated {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}</span>
          </div>
        </div>

        <GestureNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <div className="px-4 py-4">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
