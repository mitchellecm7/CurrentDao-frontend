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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts'
import { 
  Gauge, 
  TrendingUp, 
  TrendingDown, 
  Award,
  Target,
  Zap,
  Lightbulb,
  Leaf,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react'
import { useEnergyInsights } from '../../hooks/useEnergyInsights'

interface EfficiencyScoringProps {
  userId?: string
  comparisonGroup?: 'neighborhood' | 'city' | 'region' | 'national'
}

interface EfficiencyScore {
  overall: number
  categories: {
    consumption: number
    timing: number
    consistency: number
    renewable: number
    peakManagement: number
  }
  rank: {
    percentile: number
    totalUsers: number
    rank: number
  }
  improvements: {
    priority: 'high' | 'medium' | 'low'
    category: string
    description: string
    potentialSavings: number
    effort: 'easy' | 'moderate' | 'significant'
    actions: string[]
  }[]
  trends: {
    period: string
    score: number
  }[]
}

export function EfficiencyScoring({ 
  userId, 
  comparisonGroup = 'neighborhood' 
}: EfficiencyScoringProps) {
  const { efficiencyData, isLoading, error } = useEnergyInsights(userId)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showTrends, setShowTrends] = useState(false)

  const efficiencyScore: EfficiencyScore = useMemo(() => {
    if (!efficiencyData) {
      // Mock data for demonstration
      return {
        overall: 72,
        categories: {
          consumption: 68,
          timing: 85,
          consistency: 74,
          renewable: 45,
          peakManagement: 88
        },
        rank: {
          percentile: 68,
          totalUsers: 1247,
          rank: 423
        },
        improvements: [
          {
            priority: 'high',
            category: 'renewable',
            description: 'Increase renewable energy usage',
            potentialSavings: 25.50,
            effort: 'moderate',
            actions: [
              'Switch to green energy tariff',
              'Install solar panels',
              'Purchase renewable energy credits'
            ]
          },
          {
            priority: 'medium',
            category: 'consumption',
            description: 'Reduce overall consumption',
            potentialSavings: 18.75,
            effort: 'easy',
            actions: [
              'Upgrade to LED lighting',
              'Improve insulation',
              'Use energy-efficient appliances'
            ]
          },
          {
            priority: 'low',
            category: 'consistency',
            description: 'Maintain more consistent usage patterns',
            potentialSavings: 8.20,
            effort: 'easy',
            actions: [
              'Set up automated schedules',
              'Use smart thermostat',
              'Monitor standby power'
            ]
          }
        ],
        trends: [
          { period: 'Jan', score: 65 },
          { period: 'Feb', score: 67 },
          { period: 'Mar', score: 70 },
          { period: 'Apr', score: 72 },
          { period: 'May', score: 71 },
          { period: 'Jun', score: 72 }
        ]
      }
    }
    return efficiencyData
  }, [efficiencyData])

  const radarData = useMemo(() => {
    return Object.entries(efficiencyScore.categories).map(([key, value]) => ({
      category: key.charAt(0).toUpperCase() + key.slice(1),
      score: value,
      fullMark: 100
    }))
  }, [efficiencyScore.categories])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
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
          <span>Failed to load efficiency scoring data</span>
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
            <Gauge className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Efficiency Scoring</h3>
            <p className="text-sm text-gray-600">Your energy efficiency performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={comparisonGroup}
            onChange={(e) => {/* Handle comparison change */}}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="neighborhood">Neighborhood</option>
            <option value="city">City</option>
            <option value="region">Region</option>
            <option value="national">National</option>
          </select>
          <button
            onClick={() => setShowTrends(!showTrends)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              showTrends
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showTrends ? 'Hide Trends' : 'Show Trends'}
          </button>
        </div>
      </div>

      {/* Overall Score and Ranking */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={`${getScoreBgColor(efficiencyScore.overall)} p-6 rounded-lg border`}>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              <span className={getScoreColor(efficiencyScore.overall)}>
                {efficiencyScore.overall}
              </span>
              <span className="text-2xl text-gray-600">/100</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Overall Efficiency Score</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(efficiencyScore.overall / 20)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {efficiencyScore.rank.percentile}%
            </div>
            <p className="text-sm text-gray-600 font-medium">Percentile Rank</p>
            <p className="text-xs text-gray-500 mt-1">
              Better than {efficiencyScore.rank.percentile}% of users
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              #{efficiencyScore.rank.rank}
            </div>
            <p className="text-sm text-gray-600 font-medium">Your Ranking</p>
            <p className="text-xs text-gray-500 mt-1">
              Out of {efficiencyScore.rank.totalUsers.toLocaleString()} users
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Category Performance</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Your Score"
                dataKey="score"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>

          <div className="space-y-3">
            {Object.entries(efficiencyScore.categories).map(([category, score]) => (
              <div
                key={category}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedCategory(category)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getScoreBgColor(score)}`}>
                    {category === 'consumption' && <Zap className={`w-4 h-4 ${getScoreColor(score)}`} />}
                    {category === 'timing' && <Clock className={`w-4 h-4 ${getScoreColor(score)}`} />}
                    {category === 'consistency' && <Target className={`w-4 h-4 ${getScoreColor(score)}`} />}
                    {category === 'renewable' && <Leaf className={`w-4 h-4 ${getScoreColor(score)}`} />}
                    {category === 'peakManagement' && <TrendingDown className={`w-4 h-4 ${getScoreColor(score)}`} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{category}</p>
                    <p className="text-xs text-gray-500">
                      {category === 'consumption' && 'Overall energy usage efficiency'}
                      {category === 'timing' && 'Optimal usage timing'}
                      {category === 'consistency' && 'Usage pattern consistency'}
                      {category === 'renewable' && 'Renewable energy adoption'}
                      {category === 'peakManagement' && 'Peak hour management'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getScoreColor(score)}`}>{score}</p>
                  <p className="text-xs text-gray-500">/100</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trends Chart */}
      {showTrends && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Efficiency Trends</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={efficiencyScore.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Improvement Recommendations */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Improvement Recommendations</h4>
        <div className="space-y-4">
          {efficiencyScore.improvements.map((improvement, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getPriorityColor(improvement.priority)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4" />
                    <span className="font-medium capitalize">{improvement.category}</span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      improvement.priority === 'high' ? 'bg-red-200 text-red-800' :
                      improvement.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {improvement.priority} priority
                    </span>
                  </div>
                  <p className="text-sm">{improvement.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${improvement.potentialSavings.toFixed(2)}</p>
                  <p className="text-xs">potential savings/month</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium mb-2">Recommended Actions:</p>
                <ul className="space-y-1">
                  {improvement.actions.map((action, actionIndex) => (
                    <li key={actionIndex} className="text-sm flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${
                  improvement.effort === 'easy' ? 'bg-green-100 text-green-700' :
                  improvement.effort === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {improvement.effort} effort
                </span>
                <button className="px-3 py-1 bg-white bg-opacity-50 text-sm rounded hover:bg-opacity-70 transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="border-t pt-4">
        <h4 className="text-lg font-medium text-gray-900 mb-3">Achievements</h4>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">Energy Saver</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
            <Leaf className="w-4 h-4" />
            <span className="text-sm font-medium">Green Consumer</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Peak Manager</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Improving</span>
          </div>
        </div>
      </div>
    </div>
  )
}
