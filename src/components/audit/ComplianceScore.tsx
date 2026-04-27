'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  Calendar,
  Target,
  Award,
  Activity,
} from 'lucide-react'
import { ComplianceFramework, SecurityMetrics } from '@/types/audit'

interface ComplianceScoreProps {
  frameworks: ComplianceFramework[]
  metrics: SecurityMetrics
  historicalData?: Array<{
    date: string
    overallScore: number
    frameworks: Record<string, number>
  }>
  onExport?: () => void
}

const frameworkColors = {
  'SOC 2': '#10b981',
  'ISO 27001': '#3b82f6',
  'GDPR': '#8b5cf6',
  'HIPAA': '#ef4444',
  'PCI DSS': '#f59e0b',
  'NIST': '#06b6d4',
}

const scoreLevels = {
  excellent: { min: 90, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  good: { min: 70, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  fair: { min: 50, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  poor: { min: 0, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
}

export function ComplianceScore({ frameworks, metrics, historicalData, onExport }: ComplianceScoreProps) {
  const [selectedFramework, setSelectedFramework] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('90d')

  const overallScore = frameworks.length > 0 
    ? Math.round(frameworks.reduce((sum, fw) => sum + fw.score, 0) / frameworks.length)
    : 0

  const getScoreLevel = (score: number) => {
    if (score >= 90) return scoreLevels.excellent
    if (score >= 70) return scoreLevels.good
    if (score >= 50) return scoreLevels.fair
    return scoreLevels.poor
  }

  const scoreLevel = getScoreLevel(overallScore)

  const filteredFrameworks = selectedFramework === 'all' 
    ? frameworks 
    : frameworks.filter(fw => fw.name === selectedFramework)

  const complianceDistribution = frameworks.map(fw => ({
    name: fw.name,
    value: fw.score,
    fill: frameworkColors[fw.name as keyof typeof frameworkColors] || '#6b7280',
  }))

  const trendData = historicalData?.slice(-30).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    overall: item.overallScore,
    ...item.frameworks,
  })) || []

  const requirementsByStatus = frameworks.reduce((acc, fw) => {
    fw.requirements.forEach(req => {
      acc[req.status] = (acc[req.status] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const requirementsData = Object.entries(requirementsByStatus).map(([status, count]) => ({
    name: status.replace('-', ' '),
    value: count,
    fill: status === 'compliant' ? '#10b981' : status === 'non-compliant' ? '#ef4444' : '#f59e0b',
  }))

  const criticalIssues = frameworks.reduce((issues, fw) => {
    fw.requirements
      .filter(req => req.status === 'non-compliant')
      .forEach(req => {
        issues.push({
          framework: fw.name,
          requirement: req.title,
          description: req.description,
        })
      })
    return issues
  }, [] as Array<{ framework: string; requirement: string; description: string }>)

  return (
    <section className="space-y-6 rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-2xl md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">
            Compliance Score
          </p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
            Industry-standard compliance tracking and scoring
          </h2>
        </div>
        <div className="rounded-2xl bg-blue-500/20 p-3">
          <Shield className="h-8 w-8 text-blue-300" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <div className={`rounded-3xl border ${scoreLevel.border} ${scoreLevel.bg} p-6 text-slate-900`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">
                  Overall Score
                </p>
                <p className={`mt-2 text-5xl font-bold ${scoreLevel.color}`}>
                  {overallScore}
                </p>
                <p className="mt-2 text-sm text-slate-600 capitalize">
                  {scoreLevel === scoreLevels.excellent ? 'Excellent' : 
                   scoreLevel === scoreLevels.good ? 'Good' : 
                   scoreLevel === scoreLevels.fair ? 'Fair' : 'Poor'} Compliance
                </p>
              </div>
              <div className={`rounded-2xl p-3 ${scoreLevel.bg}`}>
                {overallScore >= 70 ? (
                  <TrendingUp className={`h-8 w-8 ${scoreLevel.color}`} />
                ) : (
                  <TrendingDown className={`h-8 w-8 ${scoreLevel.color}`} />
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-white mb-4">Framework Breakdown</h3>
            <div className="space-y-3">
              {frameworks.map((framework) => {
                const fwScoreLevel = getScoreLevel(framework.score)
                const color = frameworkColors[framework.name as keyof typeof frameworkColors] || '#6b7280'
                
                return (
                  <div key={framework.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{framework.name}</span>
                      <span className={`text-sm font-bold ${fwScoreLevel.color}`}>
                        {framework.score}/100
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${framework.score}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-300" />
                  <span className="text-sm text-blue-200">Total Audits</span>
                </div>
                <span className="text-sm font-semibold text-white">{metrics.totalAudits}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span className="text-sm text-green-200">Completed</span>
                </div>
                <span className="text-sm font-semibold text-white">{metrics.completedAudits}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-300" />
                  <span className="text-sm text-red-200">Open Findings</span>
                </div>
                <span className="text-sm font-semibold text-white">{metrics.openFindings}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm text-yellow-200">Avg Resolution</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {metrics.averageResolutionTime}d
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-white">Compliance Trend</h3>
              <div className="flex gap-2">
                {(['30d', '90d', '1y'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      timeRange === range
                        ? 'bg-blue-500 text-white'
                        : 'border border-white/20 bg-white/10 text-blue-200 hover:border-blue-400'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#93c5fd"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#93c5fd"
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#93c5fd' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="overall"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-blue-200">
                <Info className="h-8 w-8 mr-2" />
                No historical data available
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <h3 className="text-lg font-semibold text-white mb-4">Score Distribution</h3>
              {complianceDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={complianceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {complianceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-blue-200">
                  No data available
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <h3 className="text-lg font-semibold text-white mb-4">Requirements Status</h3>
              {requirementsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={requirementsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#93c5fd"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#93c5fd"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-blue-200">
                  No data available
                </div>
              )}
            </div>
          </div>

          {criticalIssues.length > 0 && (
            <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 backdrop-blur">
              <h3 className="text-lg font-semibold text-red-300 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Critical Compliance Issues
              </h3>
              <div className="space-y-3">
                {criticalIssues.slice(0, 3).map((issue, index) => (
                  <div key={index} className="rounded-xl border border-red-400/20 bg-red-500/5 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{issue.requirement}</p>
                        <p className="mt-1 text-xs text-red-200">{issue.description}</p>
                      </div>
                      <span className="rounded-full border border-red-400/30 bg-red-500/20 px-2 py-1 text-xs text-red-300">
                        {issue.framework}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-white outline-none transition focus:border-blue-400 focus:bg-white/20"
          >
            <option value="all">All Frameworks</option>
            {frameworks.map((fw) => (
              <option key={fw.name} value={fw.name}>{fw.name}</option>
            ))}
          </select>
        </div>

        {onExport && (
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-full border border-blue-400 bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/30"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        )}
      </div>
    </section>
  )
}
