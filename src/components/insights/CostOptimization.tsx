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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp,
  Calculator,
  Lightbulb,
  Zap,
  Clock,
  Calendar,
  Target,
  PiggyBank,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react'
import { useEnergyInsights } from '../../hooks/useEnergyInsights'

interface CostOptimizationProps {
  userId?: string
  tariffPlan?: 'standard' | 'time-of-use' | 'tiered' | 'prepaid'
}

interface CostAnalysis {
  currentMonthlyCost: number
  projectedSavings: number
  optimizedCost: number
  savingsPercentage: number
  tariffComparison: {
    current: TariffPlan
    recommended: TariffPlan
    savings: number
  }
  peakHourCosts: {
    hour: string
    cost: number
    consumption: number
    rate: number
  }[]
  monthlyBreakdown: {
    month: string
    currentCost: number
    optimizedCost: number
    savings: number
  }[]
  recommendations: {
    type: 'tariff' | 'timing' | 'usage' | 'efficiency'
    priority: 'high' | 'medium' | 'low'
    description: string
    potentialSavings: number
    implementation: string
    paybackPeriod: string
  }[]
}

interface TariffPlan {
  name: string
  type: string
  baseRate: number
  peakRate: number
  offPeakRate: number
  monthlyFee: number
}

export function CostOptimization({ 
  userId, 
  tariffPlan = 'standard' 
}: CostOptimizationProps) {
  const { costData, isLoading, error } = useEnergyInsights(userId)
  const [selectedView, setSelectedView] = useState<'overview' | 'tariffs' | 'timing' | 'recommendations'>('overview')
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month')

  const costAnalysis: CostAnalysis = useMemo(() => {
    if (!costData) {
      // Mock data for demonstration
      return {
        currentMonthlyCost: 156.80,
        projectedSavings: 42.50,
        optimizedCost: 114.30,
        savingsPercentage: 27.1,
        tariffComparison: {
          current: {
            name: 'Standard Residential',
            type: 'standard',
            baseRate: 0.12,
            peakRate: 0.15,
            offPeakRate: 0.08,
            monthlyFee: 10.00
          },
          recommended: {
            name: 'Time-of-Use Plus',
            type: 'time-of-use',
            baseRate: 0.10,
            peakRate: 0.22,
            offPeakRate: 0.06,
            monthlyFee: 8.00
          },
          savings: 28.40
        },
        peakHourCosts: Array.from({ length: 24 }, (_, hour) => ({
          hour: `${hour.toString().padStart(2, '0')}:00`,
          cost: Math.random() * 15 + 2,
          consumption: Math.random() * 5 + 1,
          rate: hour >= 18 && hour <= 22 ? 0.22 : hour >= 6 && hour <= 10 ? 0.15 : 0.06
        })),
        monthlyBreakdown: [
          { month: 'Jan', currentCost: 145.20, optimizedCost: 112.80, savings: 32.40 },
          { month: 'Feb', currentCost: 138.50, optimizedCost: 108.20, savings: 30.30 },
          { month: 'Mar', currentCost: 156.80, optimizedCost: 114.30, savings: 42.50 },
          { month: 'Apr', currentCost: 142.30, optimizedCost: 109.60, savings: 32.70 },
          { month: 'May', currentCost: 148.90, optimizedCost: 115.40, savings: 33.50 },
          { month: 'Jun', currentCost: 165.40, optimizedCost: 125.80, savings: 39.60 }
        ],
        recommendations: [
          {
            type: 'tariff',
            priority: 'high',
            description: 'Switch to Time-of-Use tariff plan',
            potentialSavings: 28.40,
            implementation: 'Contact utility provider to change tariff plan',
            paybackPeriod: 'Immediate'
          },
          {
            type: 'timing',
            priority: 'high',
            description: 'Shift heavy usage to off-peak hours',
            potentialSavings: 18.75,
            implementation: 'Run dishwasher, laundry, and charging during off-peak hours',
            paybackPeriod: '1 month'
          },
          {
            type: 'efficiency',
            priority: 'medium',
            description: 'Upgrade to energy-efficient appliances',
            potentialSavings: 15.20,
            implementation: 'Replace old appliances with ENERGY STAR certified models',
            paybackPeriod: '2-3 years'
          },
          {
            type: 'usage',
            priority: 'medium',
            description: 'Reduce standby power consumption',
            potentialSavings: 8.50,
            implementation: 'Use smart power strips and unplug devices when not in use',
            paybackPeriod: '6 months'
          }
        ]
      }
    }
    return costData
  }, [costData])

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tariff': return <Settings className="w-4 h-4" />
      case 'timing': return <Clock className="w-4 h-4" />
      case 'efficiency': return <Lightbulb className="w-4 h-4" />
      case 'usage': return <Zap className="w-4 h-4" />
      default: return <Calculator className="w-4 h-4" />
    }
  }

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
          <span>Failed to load cost optimization data</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Cost Optimization</h3>
            <p className="text-sm text-gray-600">Maximize your energy savings</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['overview', 'tariffs', 'timing', 'recommendations'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedView === view
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview View */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Cost Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Current Monthly Cost</span>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${costAnalysis.currentMonthlyCost.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Per month</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-600">Potential Savings</span>
                <TrendingDown className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">
                ${costAnalysis.projectedSavings.toFixed(2)}
              </p>
              <p className="text-xs text-green-700">
                {costAnalysis.savingsPercentage.toFixed(1)}% reduction
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-600">Optimized Cost</span>
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">
                ${costAnalysis.optimizedCost.toFixed(2)}
              </p>
              <p className="text-xs text-blue-700">After optimization</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-600">Annual Savings</span>
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900">
                ${(costAnalysis.projectedSavings * 12).toFixed(0)}
              </p>
              <p className="text-xs text-purple-700">Per year</p>
            </div>
          </div>

          {/* Monthly Cost Comparison */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Monthly Cost Comparison</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costAnalysis.monthlyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="currentCost" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Current Cost"
                />
                <Line 
                  type="monotone" 
                  dataKey="optimizedCost" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Optimized Cost"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Recommendations */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Top Recommendations</h4>
            <div className="space-y-3">
              {costAnalysis.recommendations.slice(0, 2).map((rec, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white bg-opacity-50 flex items-center justify-center">
                      {getTypeIcon(rec.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{rec.description}</span>
                        <span className="text-lg font-bold">${rec.potentialSavings.toFixed(2)}/mo</span>
                      </div>
                      <p className="text-sm mb-2">{rec.implementation}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="font-medium">Payback: {rec.paybackPeriod}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-green-200 text-green-800'
                        }`}>
                          {rec.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tariff Comparison View */}
      {selectedView === 'tariffs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current vs Recommended Tariff */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Current Tariff</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Plan Name</p>
                  <p className="font-medium">{costAnalysis.tariffComparison.current.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Base Rate</p>
                  <p className="font-medium">${costAnalysis.tariffComparison.current.baseRate}/kWh</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Peak Rate</p>
                  <p className="font-medium">${costAnalysis.tariffComparison.current.peakRate}/kWh</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Off-Peak Rate</p>
                  <p className="font-medium">${costAnalysis.tariffComparison.current.offPeakRate}/kWh</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Fee</p>
                  <p className="font-medium">${costAnalysis.tariffComparison.current.monthlyFee}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h4 className="text-lg font-medium text-green-900 mb-4">Recommended Tariff</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-green-600">Plan Name</p>
                  <p className="font-medium text-green-900">{costAnalysis.tariffComparison.recommended.name}</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Base Rate</p>
                  <p className="font-medium text-green-900">${costAnalysis.tariffComparison.recommended.baseRate}/kWh</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Peak Rate</p>
                  <p className="font-medium text-green-900">${costAnalysis.tariffComparison.recommended.peakRate}/kWh</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Off-Peak Rate</p>
                  <p className="font-medium text-green-900">${costAnalysis.tariffComparison.recommended.offPeakRate}/kWh</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Monthly Fee</p>
                  <p className="font-medium text-green-900">${costAnalysis.tariffComparison.recommended.monthlyFee}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Monthly Savings</span>
                  <span className="text-lg font-bold text-green-900">
                    ${costAnalysis.tariffComparison.savings.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tariff Comparison Chart */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Rate Comparison</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { rate: 'Base', current: costAnalysis.tariffComparison.current.baseRate * 100, recommended: costAnalysis.tariffComparison.recommended.baseRate * 100 },
                { rate: 'Peak', current: costAnalysis.tariffComparison.current.peakRate * 100, recommended: costAnalysis.tariffComparison.recommended.peakRate * 100 },
                { rate: 'Off-Peak', current: costAnalysis.tariffComparison.current.offPeakRate * 100, recommended: costAnalysis.tariffComparison.recommended.offPeakRate * 100 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rate" />
                <YAxis label={{ value: 'Rate (cents/kWh)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}¢/kWh`, '']} />
                <Bar dataKey="current" fill="#EF4444" name="Current" />
                <Bar dataKey="recommended" fill="#10B981" name="Recommended" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Timing Optimization View */}
      {selectedView === 'timing' && (
        <div className="space-y-6">
          {/* Peak Hour Costs */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Hourly Cost Analysis</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={costAnalysis.peakHourCosts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'cost' ? `$${value.toFixed(2)}` : `${value.toFixed(2)} kWh`,
                    name === 'cost' ? 'Cost' : 'Consumption'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Hourly Cost"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Peak vs Off-Peak Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-red-600">Peak Hours (6PM-10PM)</span>
                <TrendingUp className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-xl font-bold text-red-900">$2.85</p>
              <p className="text-xs text-red-700">Average hourly cost</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-600">Off-Peak Hours</span>
                <TrendingDown className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xl font-bold text-green-900">$0.95</p>
              <p className="text-xs text-green-700">Average hourly cost</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-600">Savings Opportunity</span>
                <PiggyBank className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xl font-bold text-blue-900">$18.75</p>
              <p className="text-xs text-blue-700">Monthly by shifting usage</p>
            </div>
          </div>

          {/* Usage Shifting Recommendations */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="text-lg font-medium text-yellow-900 mb-3">Smart Usage Shifting</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-yellow-800 mb-2">Move to Off-Peak:</p>
                <ul className="space-y-1 text-sm text-yellow-700">
                  <li>• Dishwasher and laundry cycles</li>
                  <li>• Electric vehicle charging</li>
                  <li>• Water heating</li>
                  <li>• Pool pump operation</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-yellow-800 mb-2">Best Off-Peak Hours:</p>
                <ul className="space-y-1 text-sm text-yellow-700">
                  <li>• 10PM - 6AM (lowest rates)</li>
                  <li>• 10AM - 4PM (moderate rates)</li>
                  <li>• Avoid 6PM - 10PM (highest rates)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Recommendations View */}
      {selectedView === 'recommendations' && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">All Optimization Recommendations</h4>
          {costAnalysis.recommendations.map((rec, index) => (
            <div key={index} className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white bg-opacity-50 flex items-center justify-center">
                  {getTypeIcon(rec.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{rec.type}: {rec.description}</span>
                    <div className="text-right">
                      <span className="text-lg font-bold">${rec.potentialSavings.toFixed(2)}/mo</span>
                      <p className="text-xs">${(rec.potentialSavings * 12).toFixed(0)}/year</p>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{rec.implementation}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-medium">Payback: {rec.paybackPeriod}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <button className="px-3 py-1 bg-white bg-opacity-50 text-sm rounded hover:bg-opacity-70 transition-colors">
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Total Potential Savings: ${costAnalysis.projectedSavings.toFixed(2)}/month
              </p>
              <p className="text-xs text-gray-600">
                ${(costAnalysis.projectedSavings * 12).toFixed(0)} annually
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Implement Optimization Plan
          </button>
        </div>
      </div>
    </div>
  )
}
