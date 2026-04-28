'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  Calendar,
  PieChart,
  Activity,
  Trophy,
  Filter,
  RefreshCw
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Mock data - replace with actual API calls
const mockAnalyticsData = {
  participationTrends: [
    { month: 'Jan', participation: 65, proposals: 12 },
    { month: 'Feb', participation: 72, proposals: 15 },
    { month: 'Mar', participation: 68, proposals: 10 },
    { month: 'Apr', participation: 78, proposals: 18 },
    { month: 'May', participation: 82, proposals: 22 },
    { month: 'Jun', participation: 75, proposals: 14 }
  ],
  quorumRates: [
    { type: 'Governance', achieved: 85, total: 100 },
    { type: 'Technical', achieved: 72, total: 85 },
    { type: 'Financial', achieved: 90, total: 95 },
    { type: 'Community', achieved: 68, total: 80 },
    { type: 'Marketing', achieved: 60, total: 70 }
  ],
  voterDemographics: [
    { category: 'Whale (>10K tokens)', percentage: 15, voters: 45 },
    { category: 'Large (1K-10K)', percentage: 25, voters: 75 },
    { category: 'Medium (100-1K)', percentage: 35, voters: 105 },
    { category: 'Small (<100)', percentage: 25, voters: 75 }
  ],
  activeVoters: [
    { rank: 1, address: '0x1234...5678', votes: 145, participation: 98 },
    { rank: 2, address: '0xabcd...ef12', votes: 132, participation: 95 },
    { rank: 3, address: '0x5678...9abc', votes: 128, participation: 92 },
    { rank: 4, address: '0xdef0...1234', votes: 115, participation: 88 },
    { rank: 5, address: '0x3456...7890', votes: 108, participation: 85 }
  ],
  proposalResults: [
    { status: 'Passed', count: 45, percentage: 65 },
    { status: 'Failed', count: 20, percentage: 29 },
    { status: 'Expired', count: 4, percentage: 6 }
  ]
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']

export default function GovernanceAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<'participation' | 'quorum' | 'demographics' | 'voters' | 'results'>('participation')
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = (format: 'csv' | 'json') => {
    const data = {
      participationTrends: mockAnalyticsData.participationTrends,
      quorumRates: mockAnalyticsData.quorumRates,
      voterDemographics: mockAnalyticsData.voterDemographics,
      activeVoters: mockAnalyticsData.activeVoters,
      proposalResults: mockAnalyticsData.proposalResults
    }

    if (format === 'csv') {
      // Convert to CSV and download
      const csvContent = Object.entries(data).map(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          const headers = Object.keys(value[0]).join(',')
          const rows = value.map(item => Object.values(item).join(','))
          return `${key}\n${headers}\n${rows.join('\n')}\n`
        }
        return ''
      }).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `governance-analytics-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // Download as JSON
      const jsonContent = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `governance-analytics-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Governance Analytics</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive insights into DAO voting participation and trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          <button
            onClick={refreshData}
            className="p-2 hover:bg-accent rounded-lg"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute top-full mt-1 right-0 bg-background border rounded-lg shadow-lg p-2 hidden group-hover:block">
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-3 py-2 hover:bg-accent rounded"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="block w-full text-left px-3 py-2 hover:bg-accent rounded"
              >
                Export as JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 mb-8">
        {[
          { id: 'participation', label: 'Participation Trends', icon: TrendingUp },
          { id: 'quorum', label: 'Quorum Rates', icon: Activity },
          { id: 'demographics', label: 'Voter Demographics', icon: Users },
          { id: 'voters', label: 'Active Voters', icon: Trophy },
          { id: 'results', label: 'Proposal Results', icon: PieChart }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedMetric(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedMetric === id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Analytics Content */}
      <div className="space-y-8">
        {/* Participation Trends */}
        {selectedMetric === 'participation' && (
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Participation Rate Over Time</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={mockAnalyticsData.participationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="participation" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Participation Rate (%)"
                />
                <Bar dataKey="proposals" fill="#10b981" name="Number of Proposals" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quorum Rates */}
        {selectedMetric === 'quorum' && (
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quorum Achievement by Proposal Type</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={mockAnalyticsData.quorumRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="achieved" fill="#10b981" name="Achieved Quorum" />
                <Bar dataKey="total" fill="#e5e7eb" name="Total Proposals" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Voter Demographics */}
        {selectedMetric === 'demographics' && (
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Voter Turnout by Wallet Size</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={mockAnalyticsData.voterDemographics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {mockAnalyticsData.voterDemographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                {mockAnalyticsData.voterDemographics.map((demo, index) => (
                  <div key={demo.category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{demo.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{demo.percentage}%</div>
                      <div className="text-sm text-muted-foreground">{demo.voters} voters</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Voters Leaderboard */}
        {selectedMetric === 'voters' && (
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Most Active Voters Leaderboard</h2>
            <div className="space-y-3">
              {mockAnalyticsData.activeVoters.map((voter) => (
                <div key={voter.rank} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      voter.rank === 1 ? 'bg-yellow-500' :
                      voter.rank === 2 ? 'bg-gray-400' :
                      voter.rank === 3 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {voter.rank}
                    </div>
                    <div>
                      <div className="font-medium">{voter.address}</div>
                      <div className="text-sm text-muted-foreground">
                        {voter.votes} votes • {voter.participation}% participation
                      </div>
                    </div>
                  </div>
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proposal Results */}
        {selectedMetric === 'results' && (
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Proposal Pass/Fail Rate Breakdown</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={mockAnalyticsData.proposalResults}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percentage }) => `${status}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {mockAnalyticsData.proposalResults.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.status === 'Passed' ? '#10b981' : 
                              entry.status === 'Failed' ? '#ef4444' : '#f59e0b'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                {mockAnalyticsData.proposalResults.map((result) => (
                  <div key={result.status} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-4 h-4 rounded-full ${
                          result.status === 'Passed' ? 'bg-green-500' :
                          result.status === 'Failed' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                      />
                      <span className="font-medium">{result.status}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{result.count} proposals</div>
                      <div className="text-sm text-muted-foreground">{result.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">Total Voters</span>
          </div>
          <div className="text-3xl font-bold">300</div>
          <div className="text-sm text-muted-foreground">+12% from last month</div>
        </div>

        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-green-500" />
            <span className="font-semibold">Avg Participation</span>
          </div>
          <div className="text-3xl font-bold">73.5%</div>
          <div className="text-sm text-muted-foreground">+5.2% from last month</div>
        </div>

        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span className="font-semibold">Quorum Rate</span>
          </div>
          <div className="text-3xl font-bold">75%</div>
          <div className="text-sm text-muted-foreground">+3% from last month</div>
        </div>

        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            <span className="font-semibold">Success Rate</span>
          </div>
          <div className="text-3xl font-bold">65%</div>
          <div className="text-sm text-muted-foreground">-2% from last month</div>
        </div>
      </div>
    </div>
  )
}
