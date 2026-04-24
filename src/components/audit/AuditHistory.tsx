'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Filter,
  Search,
  Shield,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from 'lucide-react'
import { SecurityAudit, AuditFinding } from '@/types/audit'

interface AuditHistoryProps {
  audits: SecurityAudit[]
  onAuditSelect?: (audit: SecurityAudit) => void
  onExport?: (auditIds: string[]) => void
}

const severityColors = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-blue-600 bg-blue-50 border-blue-200',
  info: 'text-gray-600 bg-gray-50 border-gray-200',
}

const statusColors = {
  'scheduled': 'text-gray-600 bg-gray-50 border-gray-200',
  'in-progress': 'text-blue-600 bg-blue-50 border-blue-200',
  'completed': 'text-green-600 bg-green-50 border-green-200',
  'failed': 'text-red-600 bg-red-50 border-red-200',
}

export function AuditHistory({ audits, onAuditSelect, onExport }: AuditHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [expandedAudits, setExpandedAudits] = useState<Set<string>>(new Set())
  const [selectedAudits, setSelectedAudits] = useState<Set<string>>(new Set())

  const filteredAudits = audits.filter((audit) => {
    const matchesSearch = audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.auditor.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || audit.auditType === selectedType
    const matchesStatus = selectedStatus === 'all' || audit.status === selectedStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const toggleAuditExpansion = (auditId: string) => {
    setExpandedAudits((prev) => {
      const next = new Set(prev)
      if (next.has(auditId)) {
        next.delete(auditId)
      } else {
        next.add(auditId)
      }
      return next
    })
  }

  const toggleAuditSelection = (auditId: string) => {
    setSelectedAudits((prev) => {
      const next = new Set(prev)
      if (next.has(auditId)) {
        next.delete(auditId)
      } else {
        next.add(auditId)
      }
      return next
    })
  }

  const handleExport = () => {
    if (selectedAudits.size > 0 && onExport) {
      onExport(Array.from(selectedAudits))
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score: number) => {
    return score >= 70 ? TrendingUp : TrendingDown
  }

  return (
    <section className="space-y-6 rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-2xl md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-200">
            Security Audit History
          </p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
            Comprehensive audit tracking and compliance monitoring
          </h2>
        </div>
        <div className="rounded-2xl bg-emerald-500/20 p-3">
          <Shield className="h-8 w-8 text-emerald-300" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
            Total Audits
          </p>
          <p className="mt-2 text-3xl font-semibold">{audits.length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
            Completed
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {audits.filter(a => a.status === 'completed').length}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
            Avg Score
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {audits.length > 0 ? (audits.reduce((sum, a) => sum + a.overallScore, 0) / audits.length).toFixed(1) : '0'}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
            Open Findings
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {audits.reduce((sum, a) => sum + a.findings.filter(f => f.status === 'open').length, 0)}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-300" />
              <input
                type="text"
                placeholder="Search audits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 py-2 text-white placeholder-emerald-300 outline-none transition focus:border-emerald-400 focus:bg-white/20"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-white outline-none transition focus:border-emerald-400 focus:bg-white/20"
            >
              <option value="all">All Types</option>
              <option value="internal">Internal</option>
              <option value="external">External</option>
              <option value="third-party">Third Party</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-white outline-none transition focus:border-emerald-400 focus:bg-white/20"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {selectedAudits.size > 0 && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/30"
            >
              <Download className="h-4 w-4" />
              Export ({selectedAudits.size})
            </button>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {filteredAudits.map((audit) => {
            const isExpanded = expandedAudits.has(audit.id)
            const isSelected = selectedAudits.has(audit.id)
            const ScoreIcon = getScoreIcon(audit.overallScore)

            return (
              <div
                key={audit.id}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition-all hover:border-emerald-400/50"
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAuditSelection(audit.id)}
                      className="mt-1 h-4 w-4 rounded border-emerald-400 bg-emerald-500/20 text-emerald-400 focus:ring-emerald-400"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">{audit.title}</h3>
                            <span className={`rounded-full border px-2 py-1 text-xs font-medium ${statusColors[audit.status]}`}>
                              {audit.status}
                            </span>
                            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
                              {audit.auditType}
                            </span>
                          </div>
                          
                          <p className="mt-2 text-sm text-emerald-100">{audit.description}</p>
                          
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {audit.auditor}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(audit.startDate, 'MMM dd, yyyy')}
                            </div>
                            {audit.endDate && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(audit.endDate, 'MMM dd, yyyy')}
                              </div>
                            )}
                            <div className={`flex items-center gap-1 ${getScoreColor(audit.overallScore)}`}>
                              <ScoreIcon className="h-3 w-3" />
                              Score: {audit.overallScore}/100
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleAuditExpansion(audit.id)}
                          className="rounded-full border border-white/20 bg-white/10 p-2 text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
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
                            <h4 className="text-sm font-semibold text-white mb-2">Compliance Frameworks</h4>
                            <div className="flex flex-wrap gap-2">
                              {audit.complianceFrameworks.map((framework) => (
                                <div
                                  key={framework.name}
                                  className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300"
                                >
                                  {framework.name} v{framework.version} ({framework.score}/100)
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2">Findings Summary</h4>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                              {Object.entries(
                                audit.findings.reduce((acc, finding) => {
                                  acc[finding.severity] = (acc[finding.severity] || 0) + 1
                                  return acc
                                }, {} as Record<string, number>)
                              ).map(([severity, count]) => (
                                <div key={severity} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                                  <span className="text-xs capitalize text-emerald-200">{severity}</span>
                                  <span className={`rounded-full border px-2 py-1 text-xs font-medium ${severityColors[severity as keyof typeof severityColors]}`}>
                                    {count}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2">Recent Findings</h4>
                            <div className="space-y-2">
                              {audit.findings.slice(0, 3).map((finding) => (
                                <div key={finding.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-white">{finding.title}</p>
                                      <p className="mt-1 text-xs text-emerald-200 line-clamp-2">{finding.description}</p>
                                    </div>
                                    <span className={`rounded-full border px-2 py-1 text-xs font-medium ${severityColors[finding.severity]}`}>
                                      {finding.severity}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2">Documents</h4>
                            <div className="flex flex-wrap gap-2">
                              {audit.documents.map((doc) => (
                                <a
                                  key={doc.id}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                                >
                                  <FileText className="h-3 w-3" />
                                  {doc.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredAudits.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <Shield className="mx-auto h-12 w-12 text-emerald-300" />
              <p className="mt-4 text-emerald-200">No audits found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
