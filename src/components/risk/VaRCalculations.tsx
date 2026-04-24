'use client'

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'
import { AlertTriangle, Info, TrendingDown } from 'lucide-react'
import { RiskAssessment } from '@/types/risk'

interface VaRCalculationsProps {
  assessment: RiskAssessment | null
  isLoading: boolean
}

/**
 * VaR Calculations Component
 * Displays Value at Risk metrics and stress testing results with confidence intervals
 */
export function VaRCalculations({ assessment, isLoading }: VaRCalculationsProps) {
  if (isLoading && !assessment) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-96 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">No VaR data available</p>
      </div>
    )
  }

  const varMetrics = assessment.VaRMetrics

  // Generate VaR distribution chart data (simulated historical distribution)
  const varDistributionData = Array.from({ length: 51 }, (_, i) => {
    const x = -50 + i * 2
    // Normal distribution approximation
    const sigma = 15
    const mu = 0
    const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)))
    return {
      return: x,
      probability: parseFloat((pdf * 100).toFixed(4)),
      var95: x === -35 ? pdf * 100 : 0,
      var99: x === -45 ? pdf * 100 : 0,
    }
  })

  // VaR confidence intervals data
  const confidenceData = [
    { confidence: '90%', var: varMetrics.value * 0.85, label: 'VaR 90%' },
    { confidence: '95%', var: varMetrics.confidence95, label: 'VaR 95%' },
    { confidence: '99%', var: varMetrics.confidence99, label: 'VaR 99%' },
  ]

  // Stress scenario results
  const stressScenarios = [
    { scenario: 'Normal', loss: -2, probability: 0.68, description: 'Expected daily movement' },
    { scenario: 'Moderate Stress', loss: -5, probability: 0.27, description: '1-2 std dev move' },
    { scenario: 'High Stress', loss: -10, probability: 0.04, description: '>2 std dev move' },
    { scenario: 'Extreme Event', loss: -18, probability: 0.01, description: 'Market shock' },
  ]

  const totalRiskMetrics = [
    {
      label: 'Value at Risk (95%)',
      value: (varMetrics.value * 100).toFixed(2),
      unit: '%',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      threshold: 5,
      status: varMetrics.value > 0.05 ? 'Warning' : 'Normal',
    },
    {
      label: 'Expected Shortfall (CVaR)',
      value: (varMetrics.expectedShortfall * 100).toFixed(2),
      unit: '%',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      threshold: 6.5,
      status: varMetrics.expectedShortfall > 0.065 ? 'Critical' : 'Normal',
    },
    {
      label: 'VaR 99% Confidence',
      value: (varMetrics.confidence99 * 100).toFixed(2),
      unit: '%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      threshold: 7,
      status: varMetrics.confidence99 > 0.07 ? 'Critical' : 'Normal',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Key VaR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {totalRiskMetrics.map((metric, i) => (
          <div key={i} className={`rounded-lg border border-gray-200 p-4 ${metric.bgColor}`}>
            <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
            <div className="flex items-baseline gap-2 mb-3">
              <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
              <p className="text-lg text-gray-600">{metric.unit}</p>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Threshold: {metric.threshold}%</span>
              <span className={`font-semibold ${metric.status === 'Critical' ? 'text-red-600' : metric.status === 'Warning' ? 'text-orange-600' : 'text-green-600'}`}>
                {metric.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* VaR Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">VaR Distribution Analysis</h3>
        <p className="text-sm text-gray-600 mb-4">
          Value at Risk represents the potential loss under normal market conditions. The chart shows the probability distribution of returns with VaR thresholds marked.
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={varDistributionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="return" label={{ value: 'Daily Return (%)', position: 'insideBottomRight', offset: -5 }} />
            <YAxis label={{ value: 'Probability', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: any) => value.toFixed(4)} />
            <Legend />
            <Area type="monotone" dataKey="probability" fill="#3b82f6" stroke="#3b82f6" name="Return Distribution" opacity={0.6} />
            <Line type="monotone" dataKey="var95" stroke="#f59e0b" strokeWidth={2} name="VaR 95%" dot={false} />
            <Line type="monotone" dataKey="var99" stroke="#ef4444" strokeWidth={2} name="VaR 99%" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Confidence Intervals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Confidence Intervals</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="confidence" />
              <YAxis label={{ value: 'VaR Value (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: any) => `${(value * 100).toFixed(2)}%`} />
              <Bar dataKey="var" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-3">
              <Info className="inline w-4 h-4 mr-1" />
              Higher confidence levels (99%) indicate more extreme loss scenarios
            </p>
          </div>
        </div>

        {/* Calculation Methods */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">VaR Calculation Method</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded border border-blue-200">
              <p className="font-semibold text-blue-900 mb-1">Historical Method</p>
              <p className="text-sm text-blue-800">
                Uses actual historical returns to estimate VaR. Current: <span className="font-bold">{(varMetrics.value * 100).toFixed(2)}%</span>
              </p>
              <p className="text-xs text-blue-700 mt-2">Fast, non-parametric, captures actual distributions</p>
            </div>

            <div className="p-4 bg-green-50 rounded border border-green-200">
              <p className="font-semibold text-green-900 mb-1">Parametric Method</p>
              <p className="text-sm text-green-800">
                Assumes normal distribution based on mean and volatility
              </p>
              <p className="text-xs text-green-700 mt-2">Efficient for normally distributed returns</p>
            </div>

            <div className="p-4 bg-purple-50 rounded border border-purple-200">
              <p className="font-semibold text-purple-900 mb-1">Monte Carlo Method</p>
              <p className="text-sm text-purple-800">
                Runs 10,000+ simulations to estimate VaR under various scenarios
              </p>
              <p className="text-xs text-purple-700 mt-2">Most flexible, handles complex positions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stress Testing Scenarios */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Stress Testing Scenarios
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Projected portfolio losses under different market stress scenarios
        </p>
        <div className="space-y-3">
          {stressScenarios.map((scenario, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{scenario.scenario}</p>
                <p className="text-sm text-gray-600">{scenario.description}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{scenario.loss}%</p>
                  <p className="text-xs text-gray-500">Probability: {(scenario.probability * 100).toFixed(1)}%</p>
                </div>
                <div
                  className="w-24 h-16 bg-white rounded border border-gray-300"
                  style={{
                    background: `linear-gradient(to right, #fee2e2 ${scenario.probability * 100}%, #f0f0f0 ${scenario.probability * 100}%)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Decomposition */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Decomposition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">VaR Components</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Market Risk</span>
                  <span className="text-sm font-semibold text-gray-900">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Credit Risk</span>
                  <span className="text-sm font-semibold text-gray-900">25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Liquidity Risk</span>
                  <span className="text-sm font-semibold text-gray-900">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Other Risks</span>
                  <span className="text-sm font-semibold text-gray-900">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Key Statistics</h4>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Daily VaR (95%)</dt>
                <dd className="text-sm font-semibold text-gray-900">{(varMetrics.value * 100).toFixed(2)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Expected Shortfall</dt>
                <dd className="text-sm font-semibold text-gray-900">{(varMetrics.expectedShortfall * 100).toFixed(2)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Worst Case (99%)</dt>
                <dd className="text-sm font-semibold text-red-600">{(varMetrics.confidence99 * 100).toFixed(2)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Calculation Method</dt>
                <dd className="text-sm font-semibold text-gray-900 capitalize">{varMetrics.calculationMethod}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Last Calculated</dt>
                <dd className="text-sm font-semibold text-gray-900">{varMetrics.timestamp.toLocaleTimeString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">About VaR</p>
            <p className="text-sm text-blue-800 mt-1">
              Value at Risk (VaR) measures the maximum potential loss over a given time period at a specified confidence level. A 95% VaR of 2% means there's a 95% probability that daily losses won't exceed 2%.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
