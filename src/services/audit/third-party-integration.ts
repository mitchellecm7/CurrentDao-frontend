import { ThirdPartyAudit } from '@/types/audit'

export class ThirdPartyIntegrationService {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_AUDIT_API_URL || '', apiKey: string = process.env.NEXT_PUBLIC_AUDIT_API_KEY || '') {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  async getThirdPartyAudits(): Promise<ThirdPartyAudit[]> {
    try {
      const response = await fetch(`${this.baseUrl}/third-party-audits`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch third-party audits: ${response.statusText}`)
      }

      const data = await response.json()
      return data.map(this.transformThirdPartyAudit)
    } catch (error) {
      console.error('Error fetching third-party audits:', error)
      return this.getMockThirdPartyAudits()
    }
  }

  async scheduleAudit(auditData: Omit<ThirdPartyAudit, 'id'>): Promise<ThirdPartyAudit> {
    try {
      const response = await fetch(`${this.baseUrl}/third-party-audits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditData),
      })

      if (!response.ok) {
        throw new Error(`Failed to schedule audit: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformThirdPartyAudit(data)
    } catch (error) {
      console.error('Error scheduling audit:', error)
      throw error
    }
  }

  async updateAudit(id: string, updates: Partial<ThirdPartyAudit>): Promise<ThirdPartyAudit> {
    try {
      const response = await fetch(`${this.baseUrl}/third-party-audits/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`Failed to update audit: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformThirdPartyAudit(data)
    } catch (error) {
      console.error('Error updating audit:', error)
      throw error
    }
  }

  async cancelAudit(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/third-party-audits/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to cancel audit: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error canceling audit:', error)
      throw error
    }
  }

  async verifyAuditReport(auditId: string, reportUrl: string): Promise<ThirdPartyAudit> {
    try {
      const response = await fetch(`${this.baseUrl}/third-party-audits/${auditId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportUrl }),
      })

      if (!response.ok) {
        throw new Error(`Failed to verify audit report: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformThirdPartyAudit(data)
    } catch (error) {
      console.error('Error verifying audit report:', error)
      throw error
    }
  }

  async getAvailableAuditFirms(): Promise<AuditFirm[]> {
    try {
      const response = await fetch(`${this.baseUrl}/audit-firms`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch audit firms: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching audit firms:', error)
      return this.getMockAuditFirms()
    }
  }

  async getAuditFirmCalendar(firmId: string, startDate: Date, endDate: Date): Promise<CalendarSlot[]> {
    try {
      const response = await fetch(`${this.baseUrl}/audit-firms/${firmId}/calendar?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch firm calendar: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching firm calendar:', error)
      return []
    }
  }

  async requestAuditProposal(auditData: AuditProposalRequest): Promise<AuditProposal> {
    try {
      const response = await fetch(`${this.baseUrl}/audit-proposals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditData),
      })

      if (!response.ok) {
        throw new Error(`Failed to request audit proposal: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error requesting audit proposal:', error)
      throw error
    }
  }

  async integrateAuditReport(auditId: string, reportData: AuditReportData): Promise<IntegratedAudit> {
    try {
      const response = await fetch(`${this.baseUrl}/third-party-audits/${auditId}/integrate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        throw new Error(`Failed to integrate audit report: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error integrating audit report:', error)
      throw error
    }
  }

  private transformThirdPartyAudit(data: any): ThirdPartyAudit {
    return {
      id: data.id,
      firmName: data.firmName,
      auditType: data.auditType,
      scope: data.scope,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: data.status,
      contactPerson: data.contactPerson,
      contactEmail: data.contactEmail,
      cost: data.cost,
      currency: data.currency,
      reportUrl: data.reportUrl,
      verificationStatus: data.verificationStatus,
      verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : undefined,
      verifiedBy: data.verifiedBy,
    }
  }

  private getMockThirdPartyAudits(): ThirdPartyAudit[] {
    return [
      {
        id: 'tp-audit-1',
        firmName: 'Deloitte & Touche',
        auditType: 'SOC 2 Type II',
        scope: ['Security', 'Availability', 'Confidentiality'],
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-15'),
        status: 'completed',
        contactPerson: 'John Smith',
        contactEmail: 'john.smith@deloitte.com',
        cost: 25000,
        currency: 'USD',
        reportUrl: 'https://reports.deloitte.com/soc2-2024-001',
        verificationStatus: 'verified',
        verifiedAt: new Date('2024-02-20'),
        verifiedBy: 'security-team@currentdao.com',
      },
      {
        id: 'tp-audit-2',
        firmName: 'PricewaterhouseCoopers',
        auditType: 'ISO 27001',
        scope: ['Information Security Management', 'Risk Assessment'],
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-03-29'),
        status: 'in-progress',
        contactPerson: 'Sarah Johnson',
        contactEmail: 'sarah.johnson@pwc.com',
        cost: 35000,
        currency: 'USD',
        verificationStatus: 'pending',
      },
      {
        id: 'tp-audit-3',
        firmName: 'KPMG',
        auditType: 'PCI DSS',
        scope: ['Payment Security', 'Data Protection'],
        startDate: new Date('2024-04-10'),
        endDate: new Date('2024-04-24'),
        status: 'pending',
        contactPerson: 'Michael Chen',
        contactEmail: 'michael.chen@kpmg.com',
        cost: 30000,
        currency: 'USD',
        verificationStatus: 'pending',
      },
    ]
  }

  private getMockAuditFirms(): AuditFirm[] {
    return [
      {
        id: 'deloitte',
        name: 'Deloitte & Touche',
        specialties: ['SOC 2', 'ISO 27001', 'PCI DSS', 'HIPAA'],
        rating: 4.8,
        averageCost: 25000,
        location: 'New York, NY',
        contactEmail: 'audits@deloitte.com',
        available: true,
      },
      {
        id: 'pwc',
        name: 'PricewaterhouseCoopers',
        specialties: ['ISO 27001', 'SOC 2', 'GDPR', 'NIST'],
        rating: 4.7,
        averageCost: 35000,
        location: 'London, UK',
        contactEmail: 'security.audits@pwc.com',
        available: true,
      },
      {
        id: 'kpmg',
        name: 'KPMG',
        specialties: ['PCI DSS', 'SOC 2', 'ISO 27001', 'SOX'],
        rating: 4.6,
        averageCost: 30000,
        location: 'Amsterdam, NL',
        contactEmail: 'audit.services@kpmg.com',
        available: true,
      },
      {
        id: 'ernest-young',
        name: 'Ernst & Young',
        specialties: ['SOC 2', 'ISO 27001', 'HIPAA', 'GDPR'],
        rating: 4.7,
        averageCost: 28000,
        location: 'Singapore',
        contactEmail: 'cybersecurity@ey.com',
        available: false,
      },
    ]
  }
}

export const thirdPartyService = new ThirdPartyIntegrationService()

export interface AuditFirm {
  id: string
  name: string
  specialties: string[]
  rating: number
  averageCost: number
  location: string
  contactEmail: string
  available: boolean
}

export interface CalendarSlot {
  date: Date
  available: boolean
  reason?: string
}

export interface AuditProposalRequest {
  firmId: string
  auditType: string
  scope: string[]
  startDate: Date
  endDate: Date
  requirements: string[]
  budget: number
  currency: string
}

export interface AuditProposal {
  id: string
  firmId: string
  firmName: string
  auditType: string
  proposedCost: number
  currency: string
  proposedDates: {
    startDate: Date
    endDate: Date
  }
  scope: string[]
  deliverables: string[]
  timeline: string[]
  terms: string
  validUntil: Date
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
}

export interface AuditReportData {
  reportUrl: string
  reportType: string
  findings: AuditFinding[]
  recommendations: string[]
  overallScore: number
  evidence: string[]
  signOff: {
    auditorName: string
    auditorTitle: string
    signOffDate: Date
    signature: string
  }
}

export interface AuditFinding {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  recommendation: string
  evidence: string[]
}

export interface IntegratedAudit {
  id: string
  thirdPartyAuditId: string
  integratedFindings: AuditFinding[]
  mappedControls: MappedControl[]
  complianceImpact: ComplianceImpact
  actionItems: ActionItem[]
  integrationDate: Date
  integratedBy: string
}

export interface MappedControl {
  controlId: string
  controlName: string
  framework: string
  findingIds: string[]
  status: 'compliant' | 'non-compliant' | 'partial'
}

export interface ComplianceImpact {
  framework: string
  previousScore: number
  newScore: number
  impact: 'positive' | 'negative' | 'neutral'
  affectedRequirements: string[]
}

export interface ActionItem {
  id: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  assignedTo: string
  dueDate: Date
  status: 'open' | 'in-progress' | 'completed'
  relatedFindings: string[]
}
