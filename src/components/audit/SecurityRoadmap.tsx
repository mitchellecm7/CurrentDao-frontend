'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Filter,
  MapPin,
  Plus,
  Search,
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  XCircle,
} from 'lucide-react'
import { SecurityRoadmapItem } from '@/types/audit'

interface SecurityRoadmapProps {
  roadmapItems: SecurityRoadmapItem[]
  onCreateItem?: () => void
  onUpdateItem?: (id: string, updates: Partial<SecurityRoadmapItem>) => void
  onItemSelect?: (item: SecurityRoadmapItem) => void
}

const categoryColors = {
  infrastructure: 'text-blue-600 bg-blue-50 border-blue-200',
  application: 'text-green-600 bg-green-50 border-green-200',
  process: 'text-purple-600 bg-purple-50 border-purple-200',
  training: 'text-orange-600 bg-orange-50 border-orange-200',
  compliance: 'text-red-600 bg-red-50 border-red-200',
}

const priorityColors = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-blue-600 bg-blue-50 border-blue-200',
}

const statusColors = {
  planned: 'text-gray-600 bg-gray-50 border-gray-200',
  'in-progress': 'text-blue-600 bg-blue-50 border-blue-200',
  completed: 'text-green-600 bg-green-50 border-green-200',
  blocked: 'text-red-600 bg-red-50 border-red-200',
}

const statusIcons = {
  planned: Target,
  'in-progress': PlayCircle,
  completed: CheckCircle,
  blocked: XCircle,
}

export function SecurityRoadmap({ 
  roadmapItems, 
  onCreateItem, 
  onUpdateItem, 
  onItemSelect 
}: SecurityRoadmapProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'kanban'>('list')

  const filteredItems = roadmapItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus
  })

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const getDaysRemaining = (targetDate: Date) => {
    const now = new Date()
    const diffTime = targetDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const roadmapStats = {
    total: roadmapItems.length,
    completed: roadmapItems.filter(item => item.status === 'completed').length,
    inProgress: roadmapItems.filter(item => item.status === 'in-progress').length,
    blocked: roadmapItems.filter(item => item.status === 'blocked').length,
    totalBudget: roadmapItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0),
    spentBudget: roadmapItems.reduce((sum, item) => sum + (item.actualCost || 0), 0),
  }

  const itemsByCategory = roadmapItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const upcomingDeadlines = roadmapItems
    .filter(item => item.status !== 'completed' && item.targetDate)
    .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
    .slice(0, 5)

  return (
    <section className="space-y-6 rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-6 text-white shadow-2xl md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-purple-200">
            Security Roadmap
          </p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
            Strategic security improvement planning and tracking
          </h2>
        </div>
        <div className="rounded-2xl bg-purple-500/20 p-3">
          <MapPin className="h-8 w-8 text-purple-300" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-purple-100">
            Total Initiatives
          </p>
          <p className="mt-2 text-3xl font-semibold">{roadmapStats.total}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-purple-100">
            In Progress
          </p>
          <p className="mt-2 text-3xl font-semibold">{roadmapStats.inProgress}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-purple-100">
            Completed
          </p>
          <p className="mt-2 text-3xl font-semibold">{roadmapStats.completed}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-purple-100">
            Total Budget
          </p>
          <p className="mt-2 text-3xl font-semibold">
            ${(roadmapStats.totalBudget / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300" />
              <input
                type="text"
                placeholder="Search roadmap items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 py-2 text-white placeholder-purple-300 outline-none transition focus:border-purple-400 focus:bg-white/20"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-white outline-none transition focus:border-purple-400 focus:bg-white/20"
            >
              <option value="all">All Categories</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="application">Application</option>
              <option value="process">Process</option>
              <option value="training">Training</option>
              <option value="compliance">Compliance</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-white outline-none transition focus:border-purple-400 focus:bg-white/20"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-white outline-none transition focus:border-purple-400 focus:bg-white/20"
            >
              <option value="all">All Status</option>
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-full border border-white/20 bg-white/10 p-1">
              {(['list', 'timeline', 'kanban'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    viewMode === mode
                      ? 'bg-purple-500 text-white'
                      : 'text-purple-300 hover:bg-white/10'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {onCreateItem && (
              <button
                onClick={onCreateItem}
                className="inline-flex items-center gap-2 rounded-full bg-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-400"
              >
                <Plus className="h-4 w-4" />
                Add Initiative
              </button>
            )}
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="mt-6 space-y-4">
            {filteredItems.map((item) => {
              const isExpanded = expandedItems.has(item.id)
              const StatusIcon = statusIcons[item.status]
              const daysRemaining = getDaysRemaining(item.targetDate)
              const isOverdue = daysRemaining < 0 && item.status !== 'completed'

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition-all hover:border-purple-400/50"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                              <span className={`rounded-full border px-2 py-1 text-xs font-medium ${categoryColors[item.category]}`}>
                                {item.category}
                              </span>
                              <span className={`rounded-full border px-2 py-1 text-xs font-medium ${priorityColors[item.priority]}`}>
                                {item.priority}
                              </span>
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${statusColors[item.status]}`}>
                                <StatusIcon className="h-3 w-3" />
                                {item.status}
                              </span>
                              {isOverdue && (
                                <span className="rounded-full border border-red-400 bg-red-500/20 px-2 py-1 text-xs font-medium text-red-300">
                                  Overdue
                                </span>
                              )}
                            </div>
                            
                            <p className="mt-2 text-sm text-purple-100">{item.description}</p>
                            
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-purple-200">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {item.assignedTo}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due: {format(item.targetDate, 'MMM dd, yyyy')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : 
                                 daysRemaining === 0 ? 'Due today' :
                                 `${daysRemaining} days remaining`}
                              </div>
                              {item.estimatedCost && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ${(item.estimatedCost / 1000).toFixed(0)}k
                                </div>
                              )}
                            </div>

                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-purple-200">Progress</span>
                                <span className="text-xs font-medium text-purple-100">{item.progress}%</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(item.progress)}`}
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleItemExpansion(item.id)}
                            className="rounded-full border border-white/20 bg-white/10 p-2 text-purple-300 transition hover:border-purple-400 hover:bg-purple-500/20"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-2">Milestones</h4>
                              <div className="space-y-2">
                                {item.milestones.map((milestone) => (
                                  <div key={milestone.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                                    <div className="flex items-center gap-3">
                                      <div className={`rounded-full p-1 ${milestone.completed ? 'bg-green-500/20' : 'bg-white/10'}`}>
                                        {milestone.completed ? (
                                          <CheckCircle className="h-3 w-3 text-green-400" />
                                        ) : (
                                          <Clock className="h-3 w-3 text-purple-300" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-white">{milestone.title}</p>
                                        <p className="text-xs text-purple-200">{milestone.description}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-purple-200">
                                        {format(milestone.dueDate, 'MMM dd, yyyy')}
                                      </p>
                                      {milestone.completed && milestone.completedAt && (
                                        <p className="text-xs text-green-400">
                                          Completed {format(milestone.completedAt, 'MMM dd, yyyy')}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {item.dependencies.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-2">Dependencies</h4>
                                <div className="flex flex-wrap gap-2">
                                  {item.dependencies.map((dep, index) => (
                                    <span
                                      key={index}
                                      className="rounded-full border border-purple-400/30 bg-purple-500/20 px-3 py-1 text-xs text-purple-300"
                                    >
                                      {dep}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.actualCost && item.estimatedCost && (
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-2">Budget Tracking</h4>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <p className="text-xs text-purple-200">Estimated</p>
                                    <p className="text-sm font-semibold text-white">
                                      ${(item.estimatedCost / 1000).toFixed(0)}k
                                    </p>
                                  </div>
                                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <p className="text-xs text-purple-200">Actual</p>
                                    <p className="text-sm font-semibold text-white">
                                      ${(item.actualCost / 1000).toFixed(0)}k
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredItems.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <MapPin className="mx-auto h-12 w-12 text-purple-300" />
                <p className="mt-4 text-purple-200">No roadmap items found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'kanban' && (
          <div className="mt-6">
            <div className="grid gap-6 md:grid-cols-4">
              {(['planned', 'in-progress', 'completed', 'blocked'] as const).map((status) => (
                <div key={status} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-5 w-5 text-purple-300" />
                    <h3 className="font-semibold text-white capitalize">{status.replace('-', ' ')}</h3>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-purple-300">
                      {filteredItems.filter(item => item.status === status).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {filteredItems
                      .filter(item => item.status === status)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-white/10 bg-white/5 p-4 cursor-pointer transition hover:border-purple-400/50"
                          onClick={() => onItemSelect?.(item)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`rounded-full border px-2 py-1 text-xs font-medium ${priorityColors[item.priority]}`}>
                              {item.priority}
                            </span>
                            <span className={`rounded-full border px-2 py-1 text-xs font-medium ${categoryColors[item.category]}`}>
                              {item.category}
                            </span>
                          </div>
                          <h4 className="font-medium text-white mb-1">{item.title}</h4>
                          <p className="text-xs text-purple-200 mb-2 line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between text-xs text-purple-300">
                            <span>{item.assignedTo}</span>
                            <span>{format(item.targetDate, 'MMM dd')}</span>
                          </div>
                          <div className="mt-2">
                            <div className="h-1 overflow-hidden rounded-full bg-white/20">
                              <div
                                className={`h-full rounded-full ${getProgressColor(item.progress)}`}
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="mt-6">
            <div className="space-y-4">
              {filteredItems
                .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                .map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`rounded-full p-2 ${statusColors[item.status]}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div className="w-0.5 h-full bg-white/20" />
                    </div>
                    <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-sm text-purple-200 mb-3">{item.description}</p>
                      <div className="flex items-center gap-4 text-xs text-purple-300">
                        <span>{format(item.startDate, 'MMM dd, yyyy')} - {format(item.targetDate, 'MMM dd, yyyy')}</span>
                        <span>{item.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {upcomingDeadlines.length > 0 && (
        <div className="rounded-3xl border border-orange-400/30 bg-orange-500/10 p-6 backdrop-blur">
          <h3 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Upcoming Deadlines
          </h3>
          <div className="space-y-2">
            {upcomingDeadlines.map((item) => {
              const daysRemaining = getDaysRemaining(item.targetDate)
              return (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-orange-400/20 bg-orange-500/5 p-3">
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-orange-200">{item.assignedTo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-orange-300">
                      {format(item.targetDate, 'MMM dd, yyyy')}
                    </p>
                    <p className="text-xs font-medium text-orange-300">
                      {daysRemaining === 0 ? 'Today' : 
                       daysRemaining > 0 ? `${daysRemaining} days` : 
                       `${Math.abs(daysRemaining)} days overdue`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
