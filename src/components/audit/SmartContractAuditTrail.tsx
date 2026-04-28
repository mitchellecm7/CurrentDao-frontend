'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Search,
  Shield,
  TrendingDown,
  TrendingUp,
  User,
  X,
  Copy,
  AlertTriangle,
  Info
} from 'lucide-react'
import { 
  ContractAuditTrail, 
  ContractVersion, 
  AuditReport, 
  AuditAlert,
  VerificationStatus,
  ContractDiff
} from '@/types/smart-contract'
import { contractAuditService } from '@/services/smart-contract/contract-audit-service'

interface SmartContractAuditTrailProps {
  contractAddress: string
  showAlerts?: boolean
  showDiff?: boolean
}

const severityColors = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-blue-600 bg-blue-50 border-blue-200',
  informational: 'text-gray-600 bg-gray-50 border-gray-200',
}

const auditStatusColors = {
  audited: 'text-green-600 bg-green-50 border-green-200',
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  rejected: 'text-red-600 bg-red-50 border-red-200',
  not_audited: 'text-gray-600 bg-gray-50 border-gray-200',
}

const riskLevelColors = {
  low: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
}

export function SmartContractAuditTrail({ 
  contractAddress, 
  showAlerts = true, 
  showDiff = true 
}: SmartContractAuditTrailProps) {
  const [auditTrail, setAuditTrail] = useState<ContractAuditTrail | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<ContractVersion | null>(null)
  const [contractDiff, setContractDiff] = useState<ContractDiff | null>(null)
  const [alerts, setAlerts] = useState<AuditAlert[]>([])
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['versions', 'audits']))
  const [selectedVersions, setSelectedVersions] = useState<[string, string] | null>(null)
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadAuditTrail()
    if (showAlerts) {
      loadAlerts()
    }
    loadVerificationStatus()
  }, [contractAddress, showAlerts])

  const loadAuditTrail = async () => {
    try {
      setLoading(true)
      setError(null)
      const trail = await contractAuditService.getContractAuditTrail(contractAddress)
      setAuditTrail(trail)
      setSelectedVersion(trail.currentVersion)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit trail')
    } finally {
      setLoading(false)
    }
  }

  const loadAlerts = async () => {
    try {
      const alertData = await contractAuditService.getAuditAlerts()
      setAlerts(alertData.filter(alert => alert.contractId === contractAddress))
    } catch (err) {
      console.error('Failed to load alerts:', err)
    }
  }

  const loadVerificationStatus = async () => {
    try {
      const status = await contractAuditService.getVerificationStatus(contractAddress)
      setVerificationStatus(status)
    } catch (err) {
      console.error('Failed to load verification status:', err)
    }
  }

  const loadContractDiff = async (fromVersion: string, toVersion: string) => {
    try {
      const diff = await contractAuditService.getContractDiff(contractAddress, fromVersion, toVersion)
      setContractDiff(diff)
      setSelectedVersions([fromVersion, toVersion])
    } catch (err) {
      console.error('Failed to load contract diff:', err)
    }
  }

  const downloadAuditReport = async (reportId: string, reportName: string) => {
    try {
      const blob = await contractAuditService.downloadAuditReport(reportId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportName}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download audit report:', err)
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await contractAuditService.acknowledgeAlert(alertId)
      setAcknowledgedAlerts(prev => new Set([...prev, alertId]))
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ))
    } catch (err) {
      console.error('Failed to acknowledge alert:', err)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getBlockExplorerUrl = (type: 'contract' | 'tx' | 'block', hash: string) => {
    const baseUrl = auditTrail?.contract.network === 'mainnet' 
      ? 'https://steexp.com' 
      : 'https://steexp.com'
    
    const paths = {
      contract: '/contract',
      tx: '/tx',
      block: '/block'
    }
    
    return `${baseUrl}${paths[type]}/${hash}`
  }

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSecurityScoreIcon = (score: number) => {
    return score >= 70 ? TrendingUp : TrendingDown
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  if (!auditTrail) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <p className="text-gray-600">No audit trail data available for this contract.</p>
      </div>
    )
  }

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged && !acknowledgedAlerts.has(alert.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="space-y-6 rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-2xl md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-200">
              Smart Contract Audit Trail
            </p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              {auditTrail.contract.name}
            </h2>
            <div className="mt-2 flex items-center gap-4">
              <code className="rounded-lg bg-white/10 px-3 py-1 text-sm font-mono">
                {auditTrail.contract.address}
              </code>
              <button
                onClick={() => copyToClipboard(auditTrail.contract.address)}
                className="rounded-lg bg-white/10 p-2 text-emerald-300 transition hover:bg-white/20"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {verificationStatus?.isVerified && (
              <div className="rounded-2xl bg-emerald-500/20 p-3">
                <CheckCircle className="h-6 w-6 text-emerald-300" />
              </div>
            )}
            <div className="rounded-2xl bg-emerald-500/20 p-3">
              <Shield className="h-8 w-8 text-emerald-300" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
              Security Score
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-3xl font-semibold ${getSecurityScoreColor(auditTrail.securityMetrics.securityScore)}`}>
                {auditTrail.securityMetrics.securityScore}
              </span>
              {(() => {
                const Icon = getSecurityScoreIcon(auditTrail.securityMetrics.securityScore)
                return <Icon className={`h-5 w-5 ${getSecurityScoreColor(auditTrail.securityMetrics.securityScore)}`} />
              })()}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
              Risk Level
            </p>
            <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-medium ${riskLevelColors[auditTrail.securityMetrics.riskLevel]}`}>
              {auditTrail.securityMetrics.riskLevel.toUpperCase()}
            </span>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
              Total Versions
            </p>
            <p className="mt-2 text-3xl font-semibold">{auditTrail.versions.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
              Audit Reports
            </p>
            <p className="mt-2 text-3xl font-semibold">{auditTrail.auditHistory.length}</p>
          </div>
        </div>

        {/* Verification Status */}
        {verificationStatus && (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {verificationStatus.isVerified ? (
                  <CheckCircle className="h-5 w-5 text-emerald-300" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-300" />
                )}
                <div>
                  <p className="font-medium text-white">
                    {verificationStatus.isVerified ? 'Verified Contract' : 'Unverified Contract'}
                  </p>
                  {verificationStatus.verifiedAt && (
                    <p className="text-sm text-emerald-200">
                      Verified by {verificationStatus.verifiedBy} on {format(verificationStatus.verifiedAt, 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-emerald-200">Confidence</p>
                <p className="text-lg font-semibold text-white">{verificationStatus.confidence}%</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Alerts */}
      {showAlerts && unacknowledgedAlerts.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
          {unacknowledgedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl border p-4 ${
                alert.severity === 'critical' 
                  ? 'border-red-200 bg-red-50' 
                  : alert.severity === 'warning'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {alert.severity === 'critical' ? (
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                ) : alert.severity === 'warning' ? (
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                ) : (
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{alert.message}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {format(alert.createdAt, 'MMM dd, yyyy HH:mm')}
                  </p>
                  {alert.actionRequired && (
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="rounded-lg bg-gray-800 px-3 py-1 text-sm text-white transition hover:bg-gray-700"
                      >
                        Acknowledge
                      </button>
                      {alert.actionUrl && (
                        <a
                          href={alert.actionUrl}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white transition hover:bg-blue-700"
                        >
                          Take Action
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Contract Versions */}
      <section className="space-y-4 rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-2xl md:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Contract Versions</h3>
          <button
            onClick={() => toggleSection('versions')}
            className="rounded-full border border-white/20 bg-white/10 p-2 text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
          >
            {expandedSections.has('versions') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>

        {expandedSections.has('versions') && (
          <div className="space-y-4">
            {auditTrail.versions.map((version, index) => (
              <div
                key={version.version}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition-all hover:border-emerald-400/50"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-emerald-300" />
                        <h4 className="font-semibold text-white">Version {version.version}</h4>
                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${auditStatusColors[version.auditStatus]}`}>
                          {version.auditStatus.replace('_', ' ').toUpperCase()}
                        </span>
                        {index === 0 && (
                          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
                            CURRENT
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-3 grid gap-2 text-sm text-emerald-200">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          Deployed: {format(version.deployedAt, 'MMM dd, yyyy HH:mm')}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          Deployed by: {version.deployedBy}
                        </div>
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-3 w-3" />
                          <a
                            href={getBlockExplorerUrl('tx', version.deploymentTxHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-300 transition hover:text-emerald-200"
                          >
                            View Transaction
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          Block: {version.blockNumber}
                        </div>
                      </div>

                      {version.auditReports.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-white mb-2">Audit Reports</p>
                          <div className="space-y-2">
                            {version.auditReports.map((report) => (
                              <div key={report.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-white">{report.auditFirm}</p>
                                    <p className="text-xs text-emerald-200">
                                      Score: {report.overallScore}/100 • {format(report.auditDate, 'MMM dd, yyyy')}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => downloadAuditReport(report.id, `${auditTrail.contract.name}-v${version.version}-audit`)}
                                    className="rounded-lg border border-white/20 bg-white/10 p-2 text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {showDiff && index < auditTrail.versions.length - 1 && (
                      <button
                        onClick={() => loadContractDiff(version.version, auditTrail.versions[index + 1].version)}
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Compare with v{auditTrail.versions[index + 1].version}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contract Diff */}
      {showDiff && contractDiff && selectedVersions && (
        <section className="space-y-4 rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-2xl md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Version Comparison</h3>
              <p className="text-sm text-emerald-200">
                Comparing v{selectedVersions[0]} → v{selectedVersions[1]}
              </p>
            </div>
            <button
              onClick={() => setContractDiff(null)}
              className="rounded-full border border-white/20 bg-white/10 p-2 text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
                Total Changes
              </p>
              <p className="mt-2 text-3xl font-semibold">{contractDiff.summary.totalChanges}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
                Added Lines
              </p>
              <p className="mt-2 text-3xl font-semibold text-green-400">{contractDiff.summary.addedLines}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
                Removed Lines
              </p>
              <p className="mt-2 text-3xl font-semibold text-red-400">{contractDiff.summary.removedLines}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
                Risk Level
              </p>
              <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-medium ${riskLevelColors[contractDiff.summary.riskLevel]}`}>
                {contractDiff.summary.riskLevel.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {contractDiff.additions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Additions</h4>
                <div className="space-y-2">
                  {contractDiff.additions.map((addition, index) => (
                    <div key={index} className="rounded-xl border border-green-400/30 bg-green-500/10 p-3">
                      <div className="flex items-start gap-3">
                        <div className="text-green-400">+</div>
                        <div className="flex-1">
                          <p className="text-sm font-mono text-green-300">{addition.newCode}</p>
                          {addition.function && (
                            <p className="mt-1 text-xs text-emerald-200">Function: {addition.function}</p>
                          )}
                        </div>
                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${severityColors[addition.impact]}`}>
                          {addition.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contractDiff.modifications.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Modifications</h4>
                <div className="space-y-2">
                  {contractDiff.modifications.map((modification, index) => (
                    <div key={index} className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-3">
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="text-red-400">-</div>
                          <p className="text-sm font-mono text-red-300">{modification.oldCode}</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="text-green-400">+</div>
                          <p className="text-sm font-mono text-green-300">{modification.newCode}</p>
                        </div>
                        {modification.function && (
                          <p className="text-xs text-emerald-200">Function: {modification.function}</p>
                        )}
                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${severityColors[modification.impact]}`}>
                          {modification.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Audit History */}
      <section className="space-y-4 rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-2xl md:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Audit History</h3>
          <button
            onClick={() => toggleSection('audits')}
            className="rounded-full border border-white/20 bg-white/10 p-2 text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
          >
            {expandedSections.has('audits') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>

        {expandedSections.has('audits') && (
          <div className="space-y-4">
            {auditTrail.auditHistory.map((audit) => (
              <div
                key={audit.id}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition-all hover:border-emerald-400/50"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-emerald-300" />
                        <h4 className="font-semibold text-white">{audit.auditFirm}</h4>
                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${severityColors[audit.severity]}`}>
                          {audit.severity.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="mt-3 grid gap-2 text-sm text-emerald-200">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {format(audit.auditDate, 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3" />
                          Score: {audit.overallScore}/100
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3" />
                          {audit.findings.length} findings
                        </div>
                      </div>

                      {audit.findings.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-white mb-2">Key Findings</p>
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
                      )}

                      <div className="mt-3 flex items-center gap-3">
                        <button
                          onClick={() => downloadAuditReport(audit.id, `${audit.contractName}-audit-${format(audit.auditDate, 'yyyy-MM-dd')}`)}
                          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Report
                        </button>
                        <a
                          href={`${contractAuditService['ipfsGateway']}${audit.ipfsHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View on IPFS
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Security Metrics */}
      <section className="space-y-4 rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-2xl md:p-8">
        <h3 className="text-lg font-semibold text-white">Security Metrics</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm font-medium text-white mb-3">Findings by Severity</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-200">Critical</span>
                <span className="rounded-full border border-red-400/30 bg-red-500/20 px-2 py-1 text-xs font-medium text-red-300">
                  {auditTrail.securityMetrics.criticalFindings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-200">High</span>
                <span className="rounded-full border border-orange-400/30 bg-orange-500/20 px-2 py-1 text-xs font-medium text-orange-300">
                  {auditTrail.securityMetrics.highFindings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-200">Medium</span>
                <span className="rounded-full border border-yellow-400/30 bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-300">
                  {auditTrail.securityMetrics.mediumFindings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-200">Low</span>
                <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-300">
                  {auditTrail.securityMetrics.lowFindings}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm font-medium text-white mb-3">Audit Statistics</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-200">Average Score</span>
                <span className="text-sm font-medium text-white">
                  {auditTrail.securityMetrics.averageAuditScore.toFixed(1)}/100
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-200">Last Audit</span>
                <span className="text-sm text-white">
                  {format(auditTrail.securityMetrics.lastAuditDate, 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-200">Total Findings</span>
                <span className="text-sm font-medium text-white">
                  {auditTrail.securityMetrics.totalFindings}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
