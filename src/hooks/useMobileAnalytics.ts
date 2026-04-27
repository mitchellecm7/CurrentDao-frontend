'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getMobileAnalytics } from '@/services/mobile/mobile-analytics'

interface UseMobileAnalyticsProps {
  userId?: string
  portfolioId?: string
  refreshInterval?: number
}

interface AnalyticsData {
  portfolio: {
    value: number
    change24h: number
    change7d: number
    change30d: number
  }
  assets: Array<{
    id: string
    name: string
    value: number
    change: number
    allocation: number
  }>
  performance: {
    daily: Array<{ date: string; value: number }>
    weekly: Array<{ week: string; value: number }>
    monthly: Array<{ month: string; value: number }>
  }
  transactions: Array<{
    id: string
    type: string
    amount: number
    timestamp: string
    status: string
  }>
}

export function useMobileAnalytics({ 
  userId, 
  portfolioId, 
  refreshInterval = 10000 
}: UseMobileAnalyticsProps = {}) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [cacheSize, setCacheSize] = useState<number>(0)
  const [memoryUsage, setMemoryUsage] = useState<number>(0)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async (useCache = true) => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      setIsLoading(true)
      setError(null)

      const analyticsData = await getMobileAnalytics.fetchData(
        { userId, portfolioId },
        { useCache, signal: abortControllerRef.current.signal }
      )

      setData(analyticsData)
      setLastUpdated(new Date())
      
      // Update cache size
      const cacheData = localStorage.getItem('mobile-analytics-cache')
      setCacheSize(cacheData ? new Blob([cacheData]).size / 1024 : 0)
      
      // Update memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryUsage(Math.round(memory.usedJSHeapSize / 1024 / 1024))
      }

    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
        console.error('Failed to fetch analytics data:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [userId, portfolioId])

  const refreshData = useCallback(async () => {
    await fetchData(false)
  }, [fetchData])

  const exportData = useCallback(async () => {
    if (!data) return null
    
    try {
      return await getMobileAnalytics.exportAnalytics(data)
    } catch (err) {
      console.error('Failed to export analytics:', err)
      throw err
    }
  }, [data])

  const clearCache = useCallback(() => {
    localStorage.removeItem('mobile-analytics-cache')
    setCacheSize(0)
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Set up real-time updates
  useEffect(() => {
    if (refreshInterval > 0 && isOnline) {
      intervalRef.current = setInterval(() => {
        fetchData()
      }, refreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [fetchData, refreshInterval, isOnline])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    isOnline,
    refreshData,
    exportData,
    clearCache,
    cacheSize: Math.round(cacheSize),
    memoryUsage,
    hasData: !!data,
    isEmpty: data ? data.assets.length === 0 : true
  }
}
