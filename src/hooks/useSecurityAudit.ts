'use client'

import { useEffect, useState } from 'react'
import { 
  SecurityAudit, 
  Vulnerability, 
  SecurityRoadmapItem, 
  ComplianceFramework, 
  SecurityMetrics,
  ThirdPartyAudit 
} from '@/types/audit'
import { auditService } from '@/services/audit/audit-service'
import { vulnerabilityService } from '@/services/audit/vulnerability-management'
import { thirdPartyService } from '@/services/audit/third-party-integration'
import { calculateComplianceScore } from '@/utils/audit/compliance-scoring'

export function useSecurityAudit() {
  const [audits, setAudits] = useState<SecurityAudit[]>([])
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [roadmapItems, setRoadmapItems] = useState<SecurityRoadmapItem[]>([])
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([])
  const [thirdPartyAudits, setThirdPartyAudits] = useState<ThirdPartyAudit[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadSecurityAuditData() {
      try {
        setIsLoading(true)
        setError(null)

        const [
          auditsData,
          vulnerabilitiesData,
          roadmapData,
          frameworksData,
          thirdPartyData,
        ] = await Promise.all([
          auditService.getAudits(),
          vulnerabilityService.getVulnerabilities(),
          auditService.getRoadmapItems(),
          auditService.getComplianceFrameworks(),
          thirdPartyService.getThirdPartyAudits(),
        ])

        if (!isActive) return

        setAudits(auditsData)
        setVulnerabilities(vulnerabilitiesData)
        setRoadmapItems(roadmapData)
        setFrameworks(frameworksData)
        setThirdPartyAudits(thirdPartyData)

        const calculatedMetrics = calculateSecurityMetrics(
          auditsData,
          vulnerabilitiesData,
          frameworksData
        )
        setMetrics(calculatedMetrics)

      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Failed to load security audit data')
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadSecurityAuditData()

    return () => {
      isActive = false
    }
  }, [])

  async function refreshAudits() {
    try {
      setError(null)
      const auditsData = await auditService.getAudits()
      setAudits(auditsData)
      
      if (metrics) {
        const updatedMetrics = calculateSecurityMetrics(
          auditsData,
          vulnerabilities,
          frameworks
        )
        setMetrics(updatedMetrics)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh audits')
    }
  }

  async function refreshVulnerabilities() {
    try {
      setError(null)
      const vulnerabilitiesData = await vulnerabilityService.getVulnerabilities()
      setVulnerabilities(vulnerabilitiesData)
      
      if (metrics) {
        const updatedMetrics = calculateSecurityMetrics(
          audits,
          vulnerabilitiesData,
          frameworks
        )
        setMetrics(updatedMetrics)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh vulnerabilities')
    }
  }

  async function refreshRoadmap() {
    try {
      setError(null)
      const roadmapData = await auditService.getRoadmapItems()
      setRoadmapItems(roadmapData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh roadmap')
    }
  }

  async function refreshFrameworks() {
    try {
      setError(null)
      const frameworksData = await auditService.getComplianceFrameworks()
      setFrameworks(frameworksData)
      
      if (metrics) {
        const updatedMetrics = calculateSecurityMetrics(
          audits,
          vulnerabilities,
          frameworksData
        )
        setMetrics(updatedMetrics)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh frameworks')
    }
  }

  async function createAudit(auditData: Omit<SecurityAudit, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      setError(null)
      const newAudit = await auditService.createAudit(auditData)
      setAudits(prev => [...prev, newAudit])
      
      if (metrics) {
        const updatedMetrics = calculateSecurityMetrics(
          [...audits, newAudit],
          vulnerabilities,
          frameworks
        )
        setMetrics(updatedMetrics)
      }
      
      return newAudit
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create audit')
      throw err
    }
  }

  async function updateAudit(id: string, updates: Partial<SecurityAudit>) {
    try {
      setError(null)
      const updatedAudit = await auditService.updateAudit(id, updates)
      setAudits(prev => prev.map(audit => 
        audit.id === id ? updatedAudit : audit
      ))
      
      if (metrics) {
        const updatedAudits = audits.map(audit => 
          audit.id === id ? updatedAudit : audit
        )
        const updatedMetrics = calculateSecurityMetrics(
          updatedAudits,
          vulnerabilities,
          frameworks
        )
        setMetrics(updatedMetrics)
      }
      
      return updatedAudit
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update audit')
      throw err
    }
  }

  async function deleteAudit(id: string) {
    try {
      setError(null)
      await auditService.deleteAudit(id)
      setAudits(prev => prev.filter(audit => audit.id !== id))
      
      if (metrics) {
        const updatedAudits = audits.filter(audit => audit.id !== id)
        const updatedMetrics = calculateSecurityMetrics(
          updatedAudits,
          vulnerabilities,
          frameworks
        )
        setMetrics(updatedMetrics)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete audit')
      throw err
    }
  }

  async function createVulnerability(vulnerabilityData: Omit<Vulnerability, 'id'>) {
    try {
      setError(null)
      const newVulnerability = await vulnerabilityService.createVulnerability(vulnerabilityData)
      setVulnerabilities(prev => [...prev, newVulnerability])
      
      if (metrics) {
        const updatedMetrics = calculateSecurityMetrics(
          audits,
          [...vulnerabilities, newVulnerability],
          frameworks
        )
        setMetrics(updatedMetrics)
      }
      
      return newVulnerability
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vulnerability')
      throw err
    }
  }

  async function updateVulnerability(id: string, updates: Partial<Vulnerability>) {
    try {
      setError(null)
      const updatedVulnerability = await vulnerabilityService.updateVulnerability(id, updates)
      setVulnerabilities(prev => prev.map(vuln => 
        vuln.id === id ? updatedVulnerability : vuln
      ))
      
      if (metrics) {
        const updatedVulnerabilities = vulnerabilities.map(vuln => 
          vuln.id === id ? updatedVulnerability : vuln
        )
        const updatedMetrics = calculateSecurityMetrics(
          audits,
          updatedVulnerabilities,
          frameworks
        )
        setMetrics(updatedMetrics)
      }
      
      return updatedVulnerability
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vulnerability')
      throw err
    }
  }

  async function createRoadmapItem(itemData: Omit<SecurityRoadmapItem, 'id'>) {
    try {
      setError(null)
      const newItem = await auditService.createRoadmapItem(itemData)
      setRoadmapItems(prev => [...prev, newItem])
      return newItem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create roadmap item')
      throw err
    }
  }

  async function updateRoadmapItem(id: string, updates: Partial<SecurityRoadmapItem>) {
    try {
      setError(null)
      const updatedItem = await auditService.updateRoadmapItem(id, updates)
      setRoadmapItems(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ))
      return updatedItem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update roadmap item')
      throw err
    }
  }

  async function scheduleThirdPartyAudit(auditData: Omit<ThirdPartyAudit, 'id'>) {
    try {
      setError(null)
      const newAudit = await thirdPartyService.scheduleAudit(auditData)
      setThirdPartyAudits(prev => [...prev, newAudit])
      return newAudit
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule third-party audit')
      throw err
    }
  }

  async function exportAuditData(auditIds: string[]) {
    try {
      setError(null)
      return await auditService.exportAudits(auditIds)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export audit data')
      throw err
    }
  }

  async function generateComplianceReport() {
    try {
      setError(null)
      return await auditService.generateComplianceReport(frameworks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate compliance report')
      throw err
    }
  }

  function getVulnerabilityStats() {
    return {
      total: vulnerabilities.length,
      bySeverity: vulnerabilities.reduce((acc, vuln) => {
        acc[vuln.severity] = (acc[vuln.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byStatus: vulnerabilities.reduce((acc, vuln) => {
        acc[vuln.status] = (acc[vuln.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      openCritical: vulnerabilities.filter(v => 
        v.status === 'open' && v.severity === 'critical'
      ).length,
      overdueCount: vulnerabilities.filter(v => 
        v.dueDate && v.dueDate < new Date() && v.status !== 'resolved'
      ).length,
    }
  }

  function getRoadmapStats() {
    return {
      total: roadmapItems.length,
      byStatus: roadmapItems.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byCategory: roadmapItems.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byPriority: roadmapItems.reduce((acc, item) => {
        acc[item.priority] = (acc[item.priority] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      totalBudget: roadmapItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0),
      averageProgress: roadmapItems.length > 0 
        ? roadmapItems.reduce((sum, item) => sum + item.progress, 0) / roadmapItems.length
        : 0,
    }
  }

  function getUpcomingDeadlines(days: number = 30) {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    
    return roadmapItems
      .filter(item => 
        item.status !== 'completed' && 
        item.targetDate >= now && 
        item.targetDate <= futureDate
      )
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
  }

  return {
    data: {
      audits,
      vulnerabilities,
      roadmapItems,
      frameworks,
      thirdPartyAudits,
      metrics,
    },
    loading: isLoading,
    error,
    actions: {
      refreshAudits,
      refreshVulnerabilities,
      refreshRoadmap,
      refreshFrameworks,
      createAudit,
      updateAudit,
      deleteAudit,
      createVulnerability,
      updateVulnerability,
      createRoadmapItem,
      updateRoadmapItem,
      scheduleThirdPartyAudit,
      exportAuditData,
      generateComplianceReport,
    },
    stats: {
      getVulnerabilityStats,
      getRoadmapStats,
      getUpcomingDeadlines,
    },
  }
}

function calculateSecurityMetrics(
  audits: SecurityAudit[],
  vulnerabilities: Vulnerability[],
  frameworks: ComplianceFramework[]
): SecurityMetrics {
  const totalAudits = audits.length
  const completedAudits = audits.filter(a => a.status === 'completed').length
  const averageScore = totalAudits > 0 
    ? audits.reduce((sum, a) => sum + a.overallScore, 0) / totalAudits
    : 0

  const allFindings = audits.flatMap(a => a.findings)
  const openFindings = allFindings.filter(f => f.status === 'open').length
  const criticalFindings = allFindings.filter(f => f.severity === 'critical').length
  const resolvedFindings = allFindings.filter(f => f.status === 'resolved').length

  const averageResolutionTime = resolvedFindings > 0
    ? allFindings
        .filter(f => f.status === 'resolved' && f.resolvedAt)
        .reduce((sum, f) => {
          const resolutionTime = f.resolvedAt!.getTime() - new Date(f.createdAt).getTime()
          return sum + resolutionTime
        }, 0) / resolvedFindings / (1000 * 60 * 60 * 24)
    : 0

  const complianceScore = frameworks.length > 0
    ? frameworks.reduce((sum, fw) => sum + fw.score, 0) / frameworks.length
    : 0

  const vulnerabilitiesBySeverity = vulnerabilities.reduce((acc, vuln) => {
    acc[vuln.severity] = (acc[vuln.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const auditTrend = audits
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(-12)
    .map(audit => ({
      date: audit.startDate.toISOString().split('T')[0],
      score: audit.overallScore,
      findings: audit.findings.length,
    }))

  return {
    totalAudits,
    completedAudits,
    averageScore,
    openFindings,
    criticalFindings,
    resolvedFindings,
    averageResolutionTime,
    complianceScore,
    vulnerabilitiesBySeverity,
    auditTrend,
  }
}
