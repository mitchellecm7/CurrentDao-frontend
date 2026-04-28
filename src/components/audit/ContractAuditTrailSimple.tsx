'use client'

import { useState, useEffect } from 'react'

// Simplified component that demonstrates the audit trail functionality
// without complex dependencies

interface ContractAuditData {
  contractName: string
  contractAddress: string
  securityScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  versions: ContractVersion[]
  auditReports: AuditReport[]
  lastAuditDate: string
  isVerified: boolean
}

interface ContractVersion {
  version: string
  deployedAt: string
  deployedBy: string
  auditStatus: string
  blockNumber: number
  txHash: string
}

interface AuditReport {
  id: string
  auditFirm: string
  auditDate: string
  overallScore: number
  findings: number
  severity: string
}

interface ContractAuditTrailSimpleProps {
  contractAddress: string
}

export function ContractAuditTrailSimple({ contractAddress }: ContractAuditTrailSimpleProps) {
  const [auditData, setAuditData] = useState<ContractAuditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState<string>('versions')

  useEffect(() => {
    // Simulate loading audit data
    const loadAuditData = async () => {
      setLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockData: ContractAuditData = {
        contractName: 'CurrentDAO Energy Token',
        contractAddress,
        securityScore: 92,
        riskLevel: 'low',
        versions: [
          {
            version: '2.1.0',
            deployedAt: '2024-01-15T10:30:00Z',
            deployedBy: 'GDUK...ADMIN',
            auditStatus: 'audited',
            blockNumber: 123456,
            txHash: 'tx-deployment-hash'
          },
          {
            version: '2.0.0',
            deployedAt: '2023-12-01T09:15:00Z',
            deployedBy: 'GDUK...ADMIN',
            auditStatus: 'audited',
            blockNumber: 100000,
            txHash: 'tx-hash-v2.0.0'
          }
        ],
        auditReports: [
          {
            id: 'audit-1',
            auditFirm: 'CertiK',
            auditDate: '2024-01-20T00:00:00Z',
            overallScore: 92,
            findings: 3,
            severity: 'low'
          }
        ],
        lastAuditDate: '2024-01-20T00:00:00Z',
        isVerified: true
      }
      
      setAuditData(mockData)
      setLoading(false)
    }

    loadAuditData()
  }, [contractAddress])

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Contract address copied to clipboard!')
  }

  const downloadAuditReport = (reportId: string) => {
    // Simulate download
    alert(`Downloading audit report ${reportId}...`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!auditData) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">Failed to load audit trail data</p>
      </div>
    )
  }

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
              {auditData.contractName}
            </h2>
            <div className="mt-2 flex items-center gap-4">
              <code className="rounded-lg bg-white/10 px-3 py-1 text-sm font-mono">
                {auditData.contractAddress}
              </code>
              <button
                onClick={() => copyToClipboard(auditData.contractAddress)}
                className="rounded-lg bg-white/10 p-2 text-emerald-300 transition hover:bg-white/20"
              >
                📋
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {auditData.isVerified && (
              <div className="rounded-2xl bg-emerald-500/20 p-3">
                ✅
              </div>
            )}
            <div className="rounded-2xl bg-emerald-500/20 p-3">
              🛡️
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
              Security Score
            </p>
            <p className={`mt-2 text-3xl font-semibold ${getScoreColor(auditData.securityScore)}`}>
              {auditData.securityScore}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
              Risk Level
            </p>
            <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-medium ${getRiskLevelColor(auditData.riskLevel)}`}>
              {auditData.riskLevel.toUpperCase()}
            </span>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
              Total Versions
            </p>
            <p className="mt-2 text-3xl font-semibold">{auditData.versions.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
              Audit Reports
            </p>
            <p className="mt-2 text-3xl font-semibold">{auditData.auditReports.length}</p>
          </div>
        </div>
      </section>

      {/* Alert for unaudited contracts */}
      {auditData.riskLevel !== 'low' && (
        <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-800">Security Alert</h3>
              <p className="mt-1 text-yellow-700">
                This contract has a {auditData.riskLevel} risk level. Exercise caution when interacting with this contract.
              </p>
              <button className="mt-3 rounded-lg bg-yellow-600 px-4 py-2 text-white transition hover:bg-yellow-700">
                Acknowledge Alert
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Contract Versions */}
      <section className="space-y-4 rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-2xl md:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Contract Versions</h3>
          <button
            onClick={() => setExpandedSection(expandedSection === 'versions' ? '' : 'versions')}
            className="rounded-full border border-white/20 bg-white/10 p-2 text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
          >
            {expandedSection === 'versions' ? '▼' : '▶'}
          </button>
        </div>

        {expandedSection === 'versions' && (
          <div className="space-y-4">
            {auditData.versions.map((version, index) => (
              <div
                key={version.version}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition-all hover:border-emerald-400/50"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-300">📦</span>
                        <h4 className="font-semibold text-white">Version {version.version}</h4>
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
                          {version.auditStatus.toUpperCase()}
                        </span>
                        {index === 0 && (
                          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
                            CURRENT
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-3 grid gap-2 text-sm text-emerald-200">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          Deployed: {new Date(version.deployedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>👤</span>
                          Deployed by: {version.deployedBy}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🔗</span>
                          <a
                            href={`https://steexp.com/tx/${version.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-300 transition hover:text-emerald-200"
                          >
                            View Transaction
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📊</span>
                          Block: {version.blockNumber}
                        </div>
                      </div>
                    </div>

                    {index < auditData.versions.length - 1 && (
                      <button
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                      >
                        🔄 Compare with v{auditData.versions[index + 1].version}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Audit History */}
      <section className="space-y-4 rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-2xl md:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Audit History</h3>
          <button
            onClick={() => setExpandedSection(expandedSection === 'audits' ? '' : 'audits')}
            className="rounded-full border border-white/20 bg-white/10 p-2 text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
          >
            {expandedSection === 'audits' ? '▼' : '▶'}
          </button>
        </div>

        {expandedSection === 'audits' && (
          <div className="space-y-4">
            {auditData.auditReports.map((audit) => (
              <div
                key={audit.id}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition-all hover:border-emerald-400/50"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-300">📄</span>
                        <h4 className="font-semibold text-white">{audit.auditFirm}</h4>
                        <span className="rounded-full border border-green-400/30 bg-green-500/20 px-2 py-1 text-xs font-medium text-green-300">
                          {audit.severity.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="mt-3 grid gap-2 text-sm text-emerald-200">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          {new Date(audit.auditDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📈</span>
                          Score: {audit.overallScore}/100
                        </div>
                        <div className="flex items-center gap-2">
                          <span>⚠️</span>
                          {audit.findings} findings
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <button
                          onClick={() => downloadAuditReport(audit.id)}
                          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                        >
                          📥 Download Report
                        </button>
                        <a
                          href="https://ipfs.io/ipfs/QmXxx...audit-report"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                        >
                          🔗 View on IPFS
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

      {/* Verification Status */}
      <section className="space-y-4 rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-2xl md:p-8">
        <h3 className="text-lg font-semibold text-white">Verification Status</h3>
        
        <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {auditData.isVerified ? (
                <span className="text-emerald-300">✅</span>
              ) : (
                <span className="text-yellow-300">⚠️</span>
              )}
              <div>
                <p className="font-medium text-white">
                  {auditData.isVerified ? 'Verified Contract' : 'Unverified Contract'}
                </p>
                <p className="text-sm text-emerald-200">
                  {auditData.isVerified 
                    ? `Verified by CurrentDAO Security Team on ${new Date(auditData.lastAuditDate).toLocaleDateString()}`
                    : 'This contract has not been verified. Exercise caution.'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-emerald-200">Confidence</p>
              <p className="text-lg font-semibold text-white">{auditData.isVerified ? 95 : 0}%</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
