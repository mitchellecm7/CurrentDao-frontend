import { SecurityAudit, SecurityRoadmapItem, ComplianceFramework } from '@/types/audit'

export class AuditService {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_AUDIT_API_URL || '', apiKey: string = process.env.NEXT_PUBLIC_AUDIT_API_KEY || '') {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  async getAudits(): Promise<SecurityAudit[]> {
    try {
      const response = await fetch(`${this.baseUrl}/audits`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch audits: ${response.statusText}`)
      }

      const data = await response.json()
      return data.map(this.transformAudit)
    } catch (error) {
      console.error('Error fetching audits:', error)
      return this.getMockAudits()
    }
  }

  async createAudit(auditData: Omit<SecurityAudit, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecurityAudit> {
    try {
      const response = await fetch(`${this.baseUrl}/audits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create audit: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformAudit(data)
    } catch (error) {
      console.error('Error creating audit:', error)
      throw error
    }
  }

  async updateAudit(id: string, updates: Partial<SecurityAudit>): Promise<SecurityAudit> {
    try {
      const response = await fetch(`${this.baseUrl}/audits/${id}`, {
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
      return this.transformAudit(data)
    } catch (error) {
      console.error('Error updating audit:', error)
      throw error
    }
  }

  async deleteAudit(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/audits/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete audit: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error deleting audit:', error)
      throw error
    }
  }

  async getRoadmapItems(): Promise<SecurityRoadmapItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/roadmap-items`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch roadmap items: ${response.statusText}`)
      }

      const data = await response.json()
      return data.map(this.transformRoadmapItem)
    } catch (error) {
      console.error('Error fetching roadmap items:', error)
      return this.getMockRoadmapItems()
    }
  }

  async createRoadmapItem(itemData: Omit<SecurityRoadmapItem, 'id'>): Promise<SecurityRoadmapItem> {
    try {
      const response = await fetch(`${this.baseUrl}/roadmap-items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create roadmap item: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformRoadmapItem(data)
    } catch (error) {
      console.error('Error creating roadmap item:', error)
      throw error
    }
  }

  async updateRoadmapItem(id: string, updates: Partial<SecurityRoadmapItem>): Promise<SecurityRoadmapItem> {
    try {
      const response = await fetch(`${this.baseUrl}/roadmap-items/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`Failed to update roadmap item: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformRoadmapItem(data)
    } catch (error) {
      console.error('Error updating roadmap item:', error)
      throw error
    }
  }

  async getComplianceFrameworks(): Promise<ComplianceFramework[]> {
    try {
      const response = await fetch(`${this.baseUrl}/compliance-frameworks`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch compliance frameworks: ${response.statusText}`)
      }

      const data = await response.json()
      return data.map(this.transformComplianceFramework)
    } catch (error) {
      console.error('Error fetching compliance frameworks:', error)
      return this.getMockComplianceFrameworks()
    }
  }

  async exportAudits(auditIds: string[]): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/audits/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auditIds }),
      })

      if (!response.ok) {
        throw new Error(`Failed to export audits: ${response.statusText}`)
      }

      return await response.blob()
    } catch (error) {
      console.error('Error exporting audits:', error)
      throw error
    }
  }

  async generateComplianceReport(frameworks: ComplianceFramework[]): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/compliance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frameworks }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate compliance report: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error generating compliance report:', error)
      throw error
    }
  }

  private transformAudit(data: any): SecurityAudit {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type,
      scope: data.scope,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: data.status,
      overallScore: data.overallScore,
      findings: data.findings || [],
      documents: data.documents || [],
      createdBy: data.createdBy,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    }
  }

  private transformRoadmapItem(data: any): SecurityRoadmapItem {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: data.status,
      assignedTo: data.assignedTo,
      startDate: new Date(data.startDate),
      targetDate: new Date(data.targetDate),
      progress: data.progress,
      estimatedCost: data.estimatedCost,
      actualCost: data.actualCost,
      dependencies: data.dependencies || [],
      milestones: data.milestones || [],
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    }
  }

  private transformComplianceFramework(data: any): ComplianceFramework {
    return {
      id: data.id,
      name: data.name,
      version: data.version,
      description: data.description,
      score: data.score,
      requirements: data.requirements || [],
      lastAssessed: data.lastAssessed ? new Date(data.lastAssessed) : undefined,
      nextAssessment: data.nextAssessment ? new Date(data.nextAssessment) : undefined,
    }
  }

  private getMockAudits(): SecurityAudit[] {
    return [
      {
        id: 'audit-1',
        title: 'Q1 2024 Security Assessment',
        description: 'Comprehensive security audit covering all systems and processes',
        type: 'internal',
        scope: ['infrastructure', 'applications', 'processes'],
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-30'),
        status: 'completed',
        overallScore: 85,
        findings: [
          {
            id: 'finding-1',
            title: 'Outdated SSL Certificates',
            description: 'Several SSL certificates are nearing expiration',
            severity: 'medium',
            status: 'resolved',
            recommendation: 'Update SSL certificates and implement automated renewal',
            createdAt: '2024-01-16',
            resolvedAt: '2024-01-20',
          },
          {
            id: 'finding-2',
            title: 'Insufficient Access Controls',
            description: 'Some systems lack proper access control mechanisms',
            severity: 'high',
            status: 'open',
            recommendation: 'Implement role-based access control (RBAC)',
            createdAt: '2024-01-17',
          },
        ],
        documents: [
          {
            id: 'doc-1',
            title: 'Q1 2024 Security Audit Report',
            type: 'report',
            url: '/documents/q1-2024-audit-report.pdf',
            uploadedAt: new Date('2024-02-01'),
            uploadedBy: 'security-team@currentdao.com',
          },
        ],
        createdBy: 'security-team@currentdao.com',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-02-01'),
      },
      {
        id: 'audit-2',
        title: 'SOC 2 Type II Readiness Assessment',
        description: 'Preparation assessment for SOC 2 Type II certification',
        type: 'compliance',
        scope: ['security', 'availability', 'confidentiality'],
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-15'),
        status: 'in-progress',
        overallScore: 0,
        findings: [],
        documents: [],
        createdBy: 'compliance-team@currentdao.com',
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-02-01'),
      },
    ]
  }

  private getMockRoadmapItems(): SecurityRoadmapItem[] {
    return [
      {
        id: 'roadmap-1',
        title: 'Implement Zero Trust Architecture',
        description: 'Transition to zero trust security model across all systems',
        category: 'infrastructure',
        priority: 'high',
        status: 'in-progress',
        assignedTo: 'infra-team@currentdao.com',
        startDate: new Date('2024-01-01'),
        targetDate: new Date('2024-06-30'),
        progress: 35,
        estimatedCost: 150000,
        actualCost: 45000,
        dependencies: ['identity-provider-upgrade', 'network-segmentation'],
        milestones: [
          {
            id: 'milestone-1',
            title: 'Identity Provider Upgrade',
            description: 'Upgrade to modern identity provider with zero trust capabilities',
            dueDate: new Date('2024-02-28'),
            completed: true,
            completedAt: new Date('2024-02-25'),
          },
          {
            id: 'milestone-2',
            title: 'Network Segmentation',
            description: 'Implement micro-segmentation across network infrastructure',
            dueDate: new Date('2024-04-30'),
            completed: false,
          },
        ],
        createdAt: new Date('2023-12-15'),
        updatedAt: new Date('2024-02-26'),
      },
      {
        id: 'roadmap-2',
        title: 'Security Awareness Training Program',
        description: 'Develop and implement comprehensive security training for all employees',
        category: 'training',
        priority: 'medium',
        status: 'planned',
        assignedTo: 'hr-team@currentdao.com',
        startDate: new Date('2024-03-01'),
        targetDate: new Date('2024-05-31'),
        progress: 0,
        estimatedCost: 25000,
        dependencies: [],
        milestones: [
          {
            id: 'milestone-3',
            title: 'Training Material Development',
            description: 'Create comprehensive security training materials',
            dueDate: new Date('2024-03-31'),
            completed: false,
          },
          {
            id: 'milestone-4',
            title: 'Employee Training Rollout',
            description: 'Conduct security training for all employees',
            dueDate: new Date('2024-05-15'),
            completed: false,
          },
        ],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      },
    ]
  }

  private getMockComplianceFrameworks(): ComplianceFramework[] {
    return [
      {
        id: 'framework-1',
        name: 'SOC 2',
        version: 'Type II',
        description: 'Service Organization Control 2 Type II compliance framework',
        score: 78,
        requirements: [
          {
            id: 'req-1',
            title: 'Security - Access Control',
            description: 'Implement logical access controls to prevent unauthorized access',
            status: 'compliant',
            category: 'security',
          },
          {
            id: 'req-2',
            title: 'Security - Encryption',
            description: 'Encrypt sensitive data at rest and in transit',
            status: 'partial',
            category: 'security',
          },
          {
            id: 'req-3',
            title: 'Availability - Backup and Recovery',
            description: 'Maintain backup and recovery procedures',
            status: 'non-compliant',
            category: 'availability',
          },
        ],
        lastAssessed: new Date('2024-01-15'),
        nextAssessment: new Date('2024-07-15'),
      },
      {
        id: 'framework-2',
        name: 'ISO 27001',
        version: '2022',
        description: 'Information Security Management System standard',
        score: 82,
        requirements: [
          {
            id: 'req-4',
            title: 'Information Security Policies',
            description: 'Document and maintain information security policies',
            status: 'compliant',
            category: 'policy',
          },
          {
            id: 'req-5',
            title: 'Risk Assessment',
            description: 'Conduct regular risk assessments',
            status: 'compliant',
            category: 'risk',
          },
          {
            id: 'req-6',
            title: 'Incident Management',
            description: 'Implement incident management procedures',
            status: 'partial',
            category: 'operations',
          },
        ],
        lastAssessed: new Date('2024-01-20'),
        nextAssessment: new Date('2024-07-20'),
      },
    ]
  }
}

export const auditService = new AuditService()
