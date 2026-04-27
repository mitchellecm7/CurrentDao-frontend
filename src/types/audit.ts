export interface SecurityAudit {
  id: string
  title: string
  description: string
  auditType: 'internal' | 'external' | 'third-party'
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed'
  startDate: Date
  endDate?: Date
  auditor: string
  auditorFirm?: string
  findings: AuditFinding[]
  overallScore: number
  complianceFrameworks: ComplianceFramework[]
  documents: AuditDocument[]
  createdAt: Date
  updatedAt: Date
}

export interface AuditFinding {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category: string
  title: string
  description: string
  recommendation: string
  status: 'open' | 'in-progress' | 'resolved' | 'accepted-risk'
  assignedTo?: string
  dueDate?: Date
  resolvedAt?: Date
  evidence: string[]
  cveId?: string
  cvssScore?: number
}

export interface ComplianceFramework {
  name: string
  version: string
  score: number
  requirements: ComplianceRequirement[]
}

export interface ComplianceRequirement {
  id: string
  title: string
  description: string
  status: 'compliant' | 'non-compliant' | 'partial'
  evidence: string[]
}

export interface AuditDocument {
  id: string
  title: string
  type: 'report' | 'evidence' | 'policy' | 'procedure'
  url: string
  uploadedAt: Date
  uploadedBy: string
  version: number
}

export interface Vulnerability {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'resolved' | 'false-positive' | 'accepted-risk'
  cveId?: string
  cvssScore?: number
  discoveredAt: Date
  discoveredBy: string
  affectedSystems: string[]
  remediation: string
  assignedTo?: string
  dueDate?: Date
  resolvedAt?: Date
  verificationRequired: boolean
  verifiedAt?: Date
  references: string[]
}

export interface SecurityRoadmapItem {
  id: string
  title: string
  description: string
  category: 'infrastructure' | 'application' | 'process' | 'training' | 'compliance'
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'planned' | 'in-progress' | 'completed' | 'blocked'
  startDate: Date
  targetDate: Date
  completedDate?: Date
  assignedTo: string
  estimatedCost?: number
  actualCost?: number
  dependencies: string[]
  progress: number
  milestones: RoadmapMilestone[]
}

export interface RoadmapMilestone {
  id: string
  title: string
  description: string
  dueDate: Date
  completed: boolean
  completedAt?: Date
}

export interface ThirdPartyAudit {
  id: string
  firmName: string
  auditType: string
  scope: string[]
  startDate: Date
  endDate: Date
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  contactPerson: string
  contactEmail: string
  cost: number
  currency: string
  reportUrl?: string
  verificationStatus: 'pending' | 'verified' | 'rejected'
  verifiedAt?: Date
  verifiedBy?: string
}

export interface SecurityMetrics {
  totalAudits: number
  completedAudits: number
  averageScore: number
  openFindings: number
  criticalFindings: number
  resolvedFindings: number
  averageResolutionTime: number
  complianceScore: number
  vulnerabilitiesBySeverity: Record<string, number>
  auditTrend: Array<{
    date: string
    score: number
    findings: number
  }>
}
