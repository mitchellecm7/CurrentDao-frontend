'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  BellRing,
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Settings,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  Zap,
  Activity,
  MessageSquare,
  Star,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

import { alertManager, Alert, AlertPreferences, NotificationChannel } from '@/services/notifications/alert-manager'

interface RealTimeAlertsProps {
  className?: string
  showControls?: boolean
  maxVisible?: number
  autoHide?: boolean
  autoHideDelay?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  soundEnabled?: boolean
  compact?: boolean
}

export const RealTimeAlerts: React.FC<RealTimeAlertsProps> = ({
  className = '',
  showControls = true,
  maxVisible = 5,
  autoHide = true,
  autoHideDelay = 5000,
  position = 'top-right',
  soundEnabled = true,
  compact = false
}) => {
  const [localState, setLocalState] = useState({
    alerts: [] as Alert[],
    unreadCount: 0,
    preferences: alertManager.getPreferences(),
    channels: alertManager.getChannels(),
    showPanel: false,
    showSettings: false,
    soundEnabled: soundEnabled,
    isOnline: navigator.onLine,
    lastChecked: new Date()
  })

  const [filterState, setFilterState] = useState({
    type: 'all' as Alert['type'] | 'all',
    severity: 'all' as Alert['severity'] | 'all',
    unread: false
  })

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'breaking-news': return <Zap className="w-5 h-5" />
      case 'sentiment-shift': return <TrendingUp className="w-5 h-5" />
      case 'price-alert': return <Activity className="w-5 h-5" />
      case 'impact-alert': return <AlertTriangle className="w-5 h-5" />
      case 'expert-commentary': return <MessageSquare className="w-5 h-5" />
      case 'system': return <Info className="w-5 h-5" />
      default: return <Bell className="w-5 h-5" />
    }
  }

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-900'
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-900'
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-900'
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-900'
      default: return 'bg-gray-100 border-gray-300 text-gray-900'
    }
  }

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      case 'high': return <TrendingUp className="w-4 h-4" />
      case 'medium': return <Info className="w-4 h-4" />
      case 'low': return <Activity className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  // Load initial alerts
  useEffect(() => {
    const loadInitialAlerts = () => {
      const alerts = alertManager.getAlerts({ limit: 50 })
      const unreadCount = alerts.filter(a => !a.read).length
      
      setLocalState(prev => ({
        ...prev,
        alerts,
        unreadCount
      }))
    }

    loadInitialAlerts()

    // Set up event listeners
    const handleAlertCreated = (alert: Alert) => {
      setLocalState(prev => {
        const newAlerts = [alert, ...prev.alerts].slice(0, 50)
        const newUnreadCount = newAlerts.filter(a => !a.read).length
        
        // Play sound if enabled
        if (prev.soundEnabled && alert.severity !== 'low') {
          playAlertSound(alert.severity)
        }
        
        // Show toast for critical alerts
        if (alert.severity === 'critical') {
          toast.error(alert.title, {
            duration: 10000,
            icon: getSeverityIcon(alert.severity)
          })
        }
        
        return {
          ...prev,
          alerts: newAlerts,
          unreadCount: newUnreadCount
        }
      })
    }

    const handleAlertUpdated = (alert: Alert) => {
      setLocalState(prev => {
        const updatedAlerts = prev.alerts.map(a => a.id === alert.id ? alert : a)
        const newUnreadCount = updatedAlerts.filter(a => !a.read).length
        
        return {
          ...prev,
          alerts: updatedAlerts,
          unreadCount: newUnreadCount
        }
      })
    }

    const handleAlertAcknowledged = (alert: Alert) => {
      setLocalState(prev => {
        const updatedAlerts = prev.alerts.map(a => a.id === alert.id ? alert : a)
        const newUnreadCount = updatedAlerts.filter(a => !a.read).length
        
        return {
          ...prev,
          alerts: updatedAlerts,
          unreadCount: newUnreadCount
        }
      })
    }

    const handleAllAlertsRead = () => {
      setLocalState(prev => ({
        ...prev,
        alerts: prev.alerts.map(a => ({ ...a, read: true })),
        unreadCount: 0
      }))
    }

    const handlePreferencesUpdated = (preferences: AlertPreferences) => {
      setLocalState(prev => ({ ...prev, preferences }))
    }

    const handlePushNotification = (alert: Alert) => {
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(alert.title, {
          body: alert.message,
          icon: '/favicon.ico',
          tag: alert.id,
          requireInteraction: alert.severity === 'critical'
        })
      }
    }

    // Register event listeners
    alertManager.on('alertCreated', handleAlertCreated)
    alertManager.on('alertUpdated', handleAlertUpdated)
    alertManager.on('alertAcknowledged', handleAlertAcknowledged)
    alertManager.on('allAlertsRead', handleAllAlertsRead)
    alertManager.on('preferencesUpdated', handlePreferencesUpdated)
    alertManager.on('pushNotification', handlePushNotification)

    // Cleanup
    return () => {
      alertManager.off('alertCreated', handleAlertCreated)
      alertManager.off('alertUpdated', handleAlertUpdated)
      alertManager.off('alertAcknowledged', handleAlertAcknowledged)
      alertManager.off('allAlertsRead', handleAllAlertsRead)
      alertManager.off('preferencesUpdated', handlePreferencesUpdated)
      alertManager.off('pushNotification', handlePushNotification)
    }
  }, [])

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setLocalState(prev => ({ ...prev, isOnline: true }))
      toast.success('Connection restored')
    }

    const handleOffline = () => {
      setLocalState(prev => ({ ...prev, isOnline: false }))
      toast.error('Connection lost')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-hide alerts
  useEffect(() => {
    if (!autoHide) return

    const timer = setInterval(() => {
      setLocalState(prev => {
        const now = Date.now()
        const updatedAlerts = prev.alerts.map(alert => {
          if (alert.severity === 'critical' || alert.acknowledged) return alert
          
          const age = now - alert.timestamp.getTime()
          if (age > autoHideDelay && !alert.read) {
            return { ...alert, read: true }
          }
          return alert
        })
        
        return { ...prev, alerts: updatedAlerts }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [autoHide, autoHideDelay])

  const playAlertSound = (severity: Alert['severity']) => {
    if (!localState.soundEnabled) return

    // Create audio context for alert sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Different frequencies for different severities
    const frequencies = {
      critical: 1000,
      high: 800,
      medium: 600,
      low: 400
    }

    oscillator.frequency.value = frequencies[severity] || 600
    gainNode.gain.value = 0.1

    oscillator.start()
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    oscillator.stop(audioContext.currentTime + 0.2)
  }

  const handleAlertClick = useCallback((alert: Alert) => {
    if (!alert.read) {
      alertManager.markAsRead(alert.id)
    }
    
    // Handle alert actions
    if (alert.actions && alert.actions.length > 0) {
      alert.actions[0].action()
    }
  }, [])

  const handleAlertDismiss = useCallback((alertId: string) => {
    alertManager.markAsRead(alertId)
  }, [])

  const handleAlertAcknowledge = useCallback((alertId: string) => {
    alertManager.markAsAcknowledged(alertId)
  }, [])

  const handleMarkAllAsRead = useCallback(() => {
    alertManager.markAllAsRead()
  }, [])

  const handleDeleteAlert = useCallback((alertId: string) => {
    alertManager.deleteAlert(alertId)
    setLocalState(prev => ({
      ...prev,
      alerts: prev.alerts.filter(a => a.id !== alertId)
    }))
  }, [])

  const toggleSound = useCallback(() => {
    setLocalState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))
  }, [])

  const togglePanel = useCallback(() => {
    setLocalState(prev => ({ ...prev, showPanel: !prev.showPanel }))
  }, [])

  const toggleSettings = useCallback(() => {
    setLocalState(prev => ({ ...prev, showSettings: !prev.showSettings }))
  }, [])

  const refreshAlerts = useCallback(() => {
    const alerts = alertManager.getAlerts({ limit: 50 })
    const unreadCount = alerts.filter(a => !a.read).length
    
    setLocalState(prev => ({
      ...prev,
      alerts,
      unreadCount,
      lastChecked: new Date()
    }))
    
    toast.success('Alerts refreshed')
  }, [])

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    let alerts = [...localState.alerts]

    if (filterState.type !== 'all') {
      alerts = alerts.filter(a => a.type === filterState.type)
    }

    if (filterState.severity !== 'all') {
      alerts = alerts.filter(a => a.severity === filterState.severity)
    }

    if (filterState.unread) {
      alerts = alerts.filter(a => !a.read)
    }

    return alerts.slice(0, maxVisible)
  }, [localState.alerts, filterState, maxVisible])

  const visibleAlerts = useMemo(() => {
    return filteredAlerts.filter(alert => !alert.read || alert.severity === 'critical')
  }, [filteredAlerts])

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      {/* Alert Bell Icon */}
      <div className="relative">
        <button
          onClick={togglePanel}
          className={`p-3 rounded-full transition-colors ${
            localState.showPanel ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          } shadow-lg border border-gray-200`}
        >
          {localState.unreadCount > 0 ? (
            <BellRing className="w-6 h-6" />
          ) : (
            <Bell className="w-6 h-6" />
          )}
          
          {localState.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {localState.unreadCount > 99 ? '99+' : localState.unreadCount}
            </span>
          )}
        </button>

        {/* Connection Status */}
        {!localState.isOnline && (
          <div className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full p-1">
            <WifiOff className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Alert Panel */}
      <AnimatePresence>
        {localState.showPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 right-0 w-96 max-h-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Alerts & Notifications</h3>
                <button
                  onClick={togglePanel}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Controls */}
              {showControls && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={refreshAlerts}
                      className="p-1 text-gray-600 hover:text-gray-900"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={toggleSound}
                      className="p-1 text-gray-600 hover:text-gray-900"
                    >
                      {localState.soundEnabled ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={toggleSettings}
                      className="p-1 text-gray-600 hover:text-gray-900"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {localState.unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterState.type}
                  onChange={(e) => setFilterState(prev => ({ ...prev, type: e.target.value as any }))}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Types</option>
                  <option value="breaking-news">Breaking News</option>
                  <option value="sentiment-shift">Sentiment Shift</option>
                  <option value="price-alert">Price Alert</option>
                  <option value="impact-alert">Impact Alert</option>
                  <option value="expert-commentary">Expert Commentary</option>
                  <option value="system">System</option>
                </select>

                <select
                  value={filterState.severity}
                  onChange={(e) => setFilterState(prev => ({ ...prev, severity: e.target.value as any }))}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={filterState.unread}
                    onChange={(e) => setFilterState(prev => ({ ...prev, unread: e.target.checked }))}
                    className="mr-1"
                  />
                  Unread only
                </label>
              </div>
            </div>

            {/* Alerts List */}
            <div className="max-h-64 overflow-y-auto">
              <AnimatePresence>
                {filteredAlerts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center text-gray-500"
                  >
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No alerts found</p>
                  </motion.div>
                ) : (
                  filteredAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        !alert.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleAlertClick(alert)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                          {getAlertIcon(alert.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {alert.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAlertAcknowledge(alert.id)
                                }}
                                className="p-1 text-gray-400 hover:text-green-600"
                                title="Acknowledge"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteAlert(alert.id)
                                }}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Delete"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {alert.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{alert.timestamp.toLocaleTimeString()}</span>
                              {alert.source && (
                                <span>• {alert.source}</span>
                              )}
                            </div>
                            
                            {alert.actions && alert.actions.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  alert.actions[0].action()
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                {alert.actions[0].label}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {localState.unreadCount} unread • {filteredAlerts.length} total
                </span>
                <span>
                  Last checked: {localState.lastChecked.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Alerts */}
      <AnimatePresence>
        {visibleAlerts.slice(0, maxVisible).map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: index * 80, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`w-80 p-4 rounded-lg shadow-lg border ${getSeverityColor(alert.severity)} ${
              compact ? 'py-2' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                {getAlertIcon(alert.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm">
                    {alert.title}
                  </h4>
                  <button
                    onClick={() => handleAlertDismiss(alert.id)}
                    className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                {!compact && (
                  <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                    {alert.message}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    {alert.actions && alert.actions.length > 0 && (
                      <button
                        onClick={() => alert.actions![0].action()}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        {alert.actions[0].label}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default RealTimeAlerts
