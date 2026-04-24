'use client'

import { useMemo } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, AlertTriangle } from 'lucide-react'
import { PortfolioAnalysis as PortfolioAnalysisType } from '@/types/risk'

interface PortfolioAnalysisProps {
  analysis: PortfolioAnalysisType | null
  isLoading: boolean
}

/**
 * Portfolio Analysis Component
 * Displays portfolio risk decomposition, concentration analysis, and diversification metrics
 */
export function PortfolioAnalysis({ analysis, isLoading }: PortfolioAnalysisProps) {
  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  // Prepare chart data
  const riskByAssetType = useMemo(() => {
    if (!analysis) return []
    return Object.entries(analysis.riskDistribution.byAssetType).map(([type, value]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: parseFloat(value.toFixed(2)),
    }))
  }, [analysis])

  const riskByFactor = useMemo(() => {
    if (!analysis) return []
    return Object.entries(analysis.riskDistribution.byRiskFactor).map(([factor, value]) => ({
      name: factor.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      risk: parseFloat(value.toFixed(2)),
    }))
  }, [analysis])

  const positions = useMemo(() => {
    if (!analysis) return []
    return analysis.positions.map(p => ({
      name: p.assetName,
      value: p.marketValue,
      risk: p.riskContribution,
      pnl: p.unrealizedPnL,
    }))
  }, [analysis])

  const topConcentrations = useMemo(() => {
    if (!analysis) return []
    return analysis.positions
      .sort((a, b) => b.marketValue - a.marketValue)
      .slice(0, 5)
      .map(p => ({
        name: p.assetName,
        concentration: ((p.marketValue / analysis.totalValue) * 100).toFixed(1),
        value: p.marketValue,
      }))
  }, [analysis])

  if (isLoading && !analysis) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-96 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-80 bg-gray-200 rounded-lg" />
          <div className="h-80 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">No portfolio analysis data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Portfolio Value</p>
          <p className="text-2xl font-bold text-gray-900">${analysis.totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Positions</p>
          <p className="text-2xl font-bold text-gray-900">{analysis.positions.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Diversification Ratio</p>
          <p className="text-2xl font-bold text-blue-600">{analysis.diversificationRatio.toFixed(2)}x</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">HHI (Concentration)</p>
          <p className="text-2xl font-bold text-orange-600">{(analysis.concentrationRisk.hhi * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Risk Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk by Asset Type */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Risk Distribution by Asset Type
          </h3>
          {riskByAssetType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskByAssetType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {riskByAssetType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value.toFixed(2)}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No data available</p>
          )}
        </div>

        {/* Risk by Factor */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Risk by Factor
          </h3>
          {riskByFactor.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskByFactor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="risk" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No data available</p>
          )}
        </div>
      </div>

      {/* Concentration Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Concentrations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Top Position Concentrations
          </h3>
          <div className="space-y-3">
            {topConcentrations.map((pos, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{pos.name}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(parseFloat(pos.concentration), 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">{pos.concentration}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Concentration Warnings */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Top 10 Concentration:</span>
              <span className={`font-semibold ${analysis.concentrationRisk.top10Concentration > 0.5 ? 'text-orange-600' : 'text-green-600'}`}>
                {(analysis.concentrationRisk.top10Concentration * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Top 20 Concentration:</span>
              <span className={`font-semibold ${analysis.concentrationRisk.top20Concentration > 0.7 ? 'text-orange-600' : 'text-green-600'}`}>
                {(analysis.concentrationRisk.top20Concentration * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Position Size:</span>
              <span className={`font-semibold ${analysis.concentrationRisk.maxPositionSize > 0.2 ? 'text-red-600' : 'text-green-600'}`}>
                {(analysis.concentrationRisk.maxPositionSize * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Position Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Position Performance (P&L)</h3>
          {positions.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {positions.map((pos, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{pos.name}</p>
                    <p className="text-xs text-gray-500">${pos.value.toLocaleString()}</p>
                  </div>
                  <div className="flex-shrink-0 ml-2 text-right">
                    <p className={`text-sm font-semibold ${pos.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {pos.pnl >= 0 ? '+' : ''}{pos.pnl}
                    </p>
                    <p className="text-xs text-gray-500">Risk: {pos.risk.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">No positions</p>
          )}
        </div>
      </div>

      {/* Risk Attribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Attribution Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">By Asset</h4>
            {analysis.riskAttributionByAsset.slice(0, 5).map((attr, i) => (
              <div key={i} className="flex items-start justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{attr.name}</span>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${attr.value.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">{attr.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">By Risk Factor</h4>
            {analysis.riskAttributionByFactor.map((attr, i) => (
              <div key={i} className="flex items-start justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{attr.name}</span>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${attr.value.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">{attr.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
