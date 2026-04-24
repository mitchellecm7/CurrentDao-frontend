'use client'

import { useState } from 'react'
import { AlertCircle, RefreshCw, TrendingUp, Shield, Activity, Zap } from 'lucide-react'
import { useRiskManagement } from '@/hooks/useRiskManagement'
import { PortfolioAnalysis } from './PortfolioAnalysis'
import { VaRCalculations } from './VaRCalculations'
import { RealTimeMonitoring } from './RealTimeMonitoring'
import { HedgingStrategies } from './HedgingStrategies'
import { StatsCard } from '@/components/StatsCard'

/**
 * Risk Dashboard Component
 * Comprehensive risk management interface for energy traders
 * Displays risk assessments, portfolio analysis, hedging strategies, and real-time monitoring
 */
export function RiskDashboard() {
  const risk = useRiskManagement('portfolio-1')
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'var' | 'monitoring' | 'hedging'>('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await risk.refreshData()
    setIsRefreshing(false)
  }

  const toggleAutoRefresh = () => {
    risk.setAutoRefresh(!risk.autoRefresh)
  }

  // Determine status color based on risk level
  const getStatusColor = () => {
    if (!risk.riskAssessment) return 'bg-gray-100'
    switch (risk.riskAssessment.riskLevel) {
      case 'critical':
        return 'bg-red-50 border-red-200'
      case 'high':
        return 'bg-orange-50 border-orange-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-green-50 border-green-200'
    }
  }

  const getStatusTextColor = () => {
    if (!risk.riskAssessment) return 'text-gray-600'
    switch (risk.riskAssessment.riskLevel) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      default:
        return 'text-green-600'
    }
  }

  if (risk.isLoading && !risk.riskAssessment) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className={`rounded-lg border-2 p-6 ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className={`w-8 h-8 ${getStatusTextColor()}`} />
              Risk Management Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time risk assessments and portfolio monitoring for energy trading
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleAutoRefresh}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                risk.autoRefresh
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              {risk.autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        {risk.riskAssessment && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-300">
            <div>
              <p className="text-sm text-gray-600 mb-1">Risk Level</p>
              <p className={`text-2xl font-bold ${getStatusTextColor()}`}>
                {risk.riskAssessment.riskLevel.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Risk Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {risk.riskAssessment.overallRiskScore.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">{risk.alerts.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Last Update</p>
              <p className="text-sm font-mono text-gray-600">
                {risk.lastUpdate?.toLocaleTimeString() || 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      {risk.riskAssessment && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Value at Risk (95%)"
            value={`${(risk.riskAssessment.VaRMetrics.value * 100).toFixed(2)}%`}
            icon={TrendingUp}
            color="text-orange-600"
            bgColor="bg-orange-100"
          />
          <StatsCard
            title="Market Risk"
            value={`${risk.riskAssessment.marketRisk.value.toFixed(2)}%`}
            icon={Activity}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatsCard
            title="Credit Risk"
            value={`$${risk.riskAssessment.creditRisk.value.toFixed(0)}`}
            icon={Zap}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
          <StatsCard
            title="Liquidity Risk"
            value={`${(risk.riskAssessment.liquidityRisk.value * 100).toFixed(1)}bp`}
            icon={Shield}
            color="text-green-600"
            bgColor="bg-green-100"
          />
        </div>
      )}

      {/* Alerts Section */}
      {risk.alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Active Risk Alerts</h3>
              <div className="mt-3 space-y-2">
                {risk.alerts.slice(0, 3).map(alert => (
                  <div key={alert.id} className="flex items-center justify-between bg-white rounded p-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Threshold: {alert.threshold.toFixed(2)} | Current: {alert.currentValue.toFixed(2)}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => risk.acknowledgeAlert(alert.id)}
                        className="ml-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {(['overview', 'portfolio', 'var', 'monitoring', 'hedging'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Risk Assessment Summary</h2>
              {risk.riskAssessment && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Risk Metrics</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Overall Risk Score:</span>
                        <span className="font-semibold">{risk.riskAssessment.overallRiskScore.toFixed(1)}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">VaR (95%):</span>
                        <span className="font-semibold">{(risk.riskAssessment.VaRMetrics.value * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Shortfall:</span>
                        <span className="font-semibold">{(risk.riskAssessment.VaRMetrics.expectedShortfall * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Recommendations</h3>
                    <ul className="space-y-2 text-sm">
                      {risk.riskAssessment.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold mt-0.5">•</span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && <PortfolioAnalysis analysis={risk.portfolioAnalysis} isLoading={risk.isLoading} />}
        {activeTab === 'var' && <VaRCalculations assessment={risk.riskAssessment} isLoading={risk.isLoading} />}
        {activeTab === 'monitoring' && (
          <RealTimeMonitoring data={risk.realtimeData} alerts={risk.alerts} isLoading={risk.isLoading} />
        )}
        {activeTab === 'hedging' && (
          <HedgingStrategies
            strategies={risk.hedgingStrategies}
            onOptimize={risk.optimizeHedge}
            onUpdateStatus={risk.updateHedgeStrategy}
            isLoading={risk.isLoading}
          />
        )}
      </div>
    </div>
  )
}
