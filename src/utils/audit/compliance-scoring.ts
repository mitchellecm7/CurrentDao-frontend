import { ComplianceFramework, ComplianceRequirement, SecurityAudit, Vulnerability } from '@/types/audit'

export interface ComplianceScoreResult {
  framework: string
  version: string
  overallScore: number
  requirementsScore: number
  implementationScore: number
  documentationScore: number
  testingScore: number
  monitoringScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  gaps: ComplianceGap[]
  recommendations: ComplianceRecommendation[]
  lastUpdated: Date
}

export interface ComplianceGap {
  requirementId: string
  requirementTitle: string
  currentStatus: 'compliant' | 'non-compliant' | 'partial'
  gapDescription: string
  impact: 'critical' | 'high' | 'medium' | 'low'
  estimatedEffort: 'low' | 'medium' | 'high'
  remediationSteps: string[]
}

export interface ComplianceRecommendation {
  id: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'policy' | 'technical' | 'process' | 'documentation'
  estimatedCost?: number
  estimatedTimeframe: string
  dependencies: string[]
  affectedRequirements: string[]
}

export function calculateComplianceScore(framework: ComplianceFramework): ComplianceScoreResult {
  const requirements = framework.requirements
  const totalRequirements = requirements.length
  
  if (totalRequirements === 0) {
    return createEmptyScoreResult(framework)
  }

  const compliantCount = requirements.filter(r => r.status === 'compliant').length
  const partialCount = requirements.filter(r => r.status === 'partial').length
  const nonCompliantCount = requirements.filter(r => r.status === 'non-compliant').length

  const requirementsScore = (compliantCount / totalRequirements) * 100
  
  const implementationScore = calculateImplementationScore(requirements)
  const documentationScore = calculateDocumentationScore(requirements)
  const testingScore = calculateTestingScore(requirements)
  const monitoringScore = calculateMonitoringScore(requirements)

  const overallScore = (
    requirementsScore * 0.4 +
    implementationScore * 0.25 +
    documentationScore * 0.15 +
    testingScore * 0.1 +
    monitoringScore * 0.1
  )

  const grade = determineGrade(overallScore)
  const gaps = identifyComplianceGaps(requirements)
  const recommendations = generateRecommendations(gaps, framework.name)

  return {
    framework: framework.name,
    version: framework.version,
    overallScore: Math.round(overallScore),
    requirementsScore: Math.round(requirementsScore),
    implementationScore: Math.round(implementationScore),
    documentationScore: Math.round(documentationScore),
    testingScore: Math.round(testingScore),
    monitoringScore: Math.round(monitoringScore),
    grade,
    gaps,
    recommendations,
    lastUpdated: new Date(),
  }
}

export function calculateOverallComplianceScore(frameworks: ComplianceFramework[]): number {
  if (frameworks.length === 0) return 0
  
  const totalScore = frameworks.reduce((sum, framework) => {
    const result = calculateComplianceScore(framework)
    return sum + result.overallScore
  }, 0)
  
  return Math.round(totalScore / frameworks.length)
}

export function getComplianceTrend(
  historicalData: Array<{ date: Date; frameworks: ComplianceFramework[] }>
): ComplianceTrendPoint[] {
  return historicalData.map(data => ({
    date: data.date,
    overallScore: calculateOverallComplianceScore(data.frameworks),
    frameworkScores: data.frameworks.map(fw => ({
      framework: fw.name,
      score: calculateComplianceScore(fw).overallScore,
    })),
  }))
}

export function identifyCriticalComplianceIssues(
  frameworks: ComplianceFramework[]
): CriticalComplianceIssue[] {
  const issues: CriticalComplianceIssue[] = []
  
  frameworks.forEach(framework => {
    const nonCompliantRequirements = framework.requirements.filter(
      req => req.status === 'non-compliant'
    )
    
    nonCompliantRequirements.forEach(requirement => {
      const impact = assessRequirementImpact(requirement)
      if (impact.severity === 'critical' || impact.severity === 'high') {
        issues.push({
          framework: framework.name,
          requirementId: requirement.id,
          requirementTitle: requirement.title,
          impact: impact.severity,
  riskLevel: impact.riskLevel,
          businessImpact: impact.businessImpact,
          regulatoryImpact: impact.regulatoryImpact,
          estimatedRemediationCost: impact.estimatedCost,
          recommendedDeadline: calculateRecommendedDeadline(impact.severity),
        })
      }
    })
  })
  
  return issues.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return severityOrder[b.impact] - severityOrder[a.impact]
  })
}

export function generateComplianceReport(
  frameworks: ComplianceFramework[],
  vulnerabilities: Vulnerability[],
  audits: SecurityAudit[]
): ComplianceReport {
  const frameworkResults = frameworks.map(fw => calculateComplianceScore(fw))
  const overallScore = calculateOverallComplianceScore(frameworks)
  const criticalIssues = identifyCriticalComplianceIssues(frameworks)
  
  const securityPosture = assessSecurityPosture(frameworkResults, vulnerabilities)
  const maturityLevel = calculateMaturityLevel(frameworkResults)
  const recommendations = generateStrategicRecommendations(frameworkResults, criticalIssues)
  
  return {
    executiveSummary: generateExecutiveSummary(overallScore, criticalIssues, maturityLevel),
    frameworkResults,
    overallScore,
    criticalIssues,
    securityPosture,
    maturityLevel,
    vulnerabilityImpact: assessVulnerabilityImpact(vulnerabilities),
    auditHistory: summarizeAuditHistory(audits),
    recommendations,
    nextSteps: generateNextSteps(criticalIssues, recommendations),
    reportDate: new Date(),
    reportPeriod: getLastQuarterPeriod(),
  }
}

function createEmptyScoreResult(framework: ComplianceFramework): ComplianceScoreResult {
  return {
    framework: framework.name,
    version: framework.version,
    overallScore: 0,
    requirementsScore: 0,
    implementationScore: 0,
    documentationScore: 0,
    testingScore: 0,
    monitoringScore: 0,
    grade: 'F',
    gaps: [],
    recommendations: [],
    lastUpdated: new Date(),
  }
}

function calculateImplementationScore(requirements: ComplianceRequirement[]): number {
  const implementationRequirements = requirements.filter(req =>
    req.title.toLowerCase().includes('implement') ||
    req.title.toLowerCase().includes('deploy') ||
    req.title.toLowerCase().includes('configure')
  )
  
  if (implementationRequirements.length === 0) return 100
  
  const compliantCount = implementationRequirements.filter(req => req.status === 'compliant').length
  return (compliantCount / implementationRequirements.length) * 100
}

function calculateDocumentationScore(requirements: ComplianceRequirement[]): number {
  const documentationRequirements = requirements.filter(req =>
    req.title.toLowerCase().includes('document') ||
    req.title.toLowerCase().includes('policy') ||
    req.title.toLowerCase().includes('procedure')
  )
  
  if (documentationRequirements.length === 0) return 100
  
  const compliantCount = documentationRequirements.filter(req => req.status === 'compliant').length
  return (compliantCount / documentationRequirements.length) * 100
}

function calculateTestingScore(requirements: ComplianceRequirement[]): number {
  const testingRequirements = requirements.filter(req =>
    req.title.toLowerCase().includes('test') ||
    req.title.toLowerCase().includes('validate') ||
    req.title.toLowerCase().includes('verify')
  )
  
  if (testingRequirements.length === 0) return 100
  
  const compliantCount = testingRequirements.filter(req => req.status === 'compliant').length
  return (compliantCount / testingRequirements.length) * 100
}

function calculateMonitoringScore(requirements: ComplianceRequirement[]): number {
  const monitoringRequirements = requirements.filter(req =>
    req.title.toLowerCase().includes('monitor') ||
    req.title.toLowerCase().includes('review') ||
    req.title.toLowerCase().includes('audit')
  )
  
  if (monitoringRequirements.length === 0) return 100
  
  const compliantCount = monitoringRequirements.filter(req => req.status === 'compliant').length
  return (compliantCount / monitoringRequirements.length) * 100
}

function determineGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

function identifyComplianceGaps(requirements: ComplianceRequirement[]): ComplianceGap[] {
  const gaps: ComplianceGap[] = []
  
  requirements
    .filter(req => req.status !== 'compliant')
    .forEach(requirement => {
      gaps.push({
        requirementId: requirement.id,
        requirementTitle: requirement.title,
        currentStatus: requirement.status,
        gapDescription: generateGapDescription(requirement),
        impact: assessGapImpact(requirement),
        estimatedEffort: estimateRemediationEffort(requirement),
        remediationSteps: generateRemediationSteps(requirement),
      })
    })
  
  return gaps
}

function generateGapDescription(requirement: ComplianceRequirement): string {
  const status = requirement.status
  if (status === 'non-compliant') {
    return `Requirement is not met. Current implementation does not satisfy the compliance criteria.`
  }
  if (status === 'partial') {
    return `Requirement is partially met. Some controls are in place but additional work is needed for full compliance.`
  }
  return ''
}

function assessGapImpact(requirement: ComplianceRequirement): 'critical' | 'high' | 'medium' | 'low' {
  const title = requirement.title.toLowerCase()
  
  if (title.includes('critical') || title.includes('security') || title.includes('access')) {
    return 'critical'
  }
  if (title.includes('high') || title.includes('sensitive') || title.includes('privacy')) {
    return 'high'
  }
  if (title.includes('medium') || title.includes('process')) {
    return 'medium'
  }
  return 'low'
}

function estimateRemediationEffort(requirement: ComplianceRequirement): 'low' | 'medium' | 'high' {
  const title = requirement.title.toLowerCase()
  
  if (title.includes('policy') || title.includes('document')) {
    return 'low'
  }
  if (title.includes('implement') || title.includes('configure')) {
    return 'medium'
  }
  if (title.includes('architecture') || title.includes('infrastructure')) {
    return 'high'
  }
  return 'medium'
}

function generateRemediationSteps(requirement: ComplianceRequirement): string[] {
  const steps: string[] = []
  
  steps.push('Review current implementation against requirement criteria')
  steps.push('Identify specific gaps and deficiencies')
  steps.push('Develop remediation plan with timeline')
  steps.push('Implement necessary controls and processes')
  steps.push('Document evidence of compliance')
  steps.push('Conduct internal verification testing')
  
  return steps
}

function generateRecommendations(gaps: ComplianceGap[], framework: string): ComplianceRecommendation[] {
  const recommendations: ComplianceRecommendation[] = []
  
  gaps.forEach((gap, index) => {
    recommendations.push({
      id: `rec-${framework}-${index}`,
      title: `Address ${gap.requirementTitle}`,
      description: gap.gapDescription,
      priority: gap.impact === 'critical' ? 'critical' : 
                gap.impact === 'high' ? 'high' : 
                gap.impact === 'medium' ? 'medium' : 'low',
      category: 'technical',
      estimatedTimeframe: gap.estimatedEffort === 'high' ? '3-6 months' :
                       gap.estimatedEffort === 'medium' ? '1-3 months' : '2-4 weeks',
      dependencies: [],
      affectedRequirements: [gap.requirementId],
    })
  })
  
  return recommendations
}

function assessRequirementImpact(requirement: ComplianceRequirement): {
  severity: 'critical' | 'high' | 'medium' | 'low'
  riskLevel: string
  businessImpact: string
  regulatoryImpact: string
  estimatedCost: number
} {
  const impact = assessGapImpact(requirement)
  
  return {
    severity: impact,
    riskLevel: impact === 'critical' ? 'Very High' : 
                impact === 'high' ? 'High' : 
                impact === 'medium' ? 'Medium' : 'Low',
    businessImpact: impact === 'critical' ? 'Severe business disruption possible' :
                    impact === 'high' ? 'Significant business impact' :
                    impact === 'medium' ? 'Moderate business impact' : 'Minimal business impact',
    regulatoryImpact: impact === 'critical' ? 'Major regulatory penalties likely' :
                      impact === 'high' ? 'Regulatory penalties possible' :
                      impact === 'medium' ? 'Minor regulatory impact' : 'Limited regulatory impact',
    estimatedCost: impact === 'critical' ? 50000 :
                  impact === 'high' ? 25000 :
                  impact === 'medium' ? 10000 : 5000,
  }
}

function calculateRecommendedDeadline(severity: 'critical' | 'high' | 'medium' | 'low'): Date {
  const now = new Date()
  const days = severity === 'critical' ? 30 : 
               severity === 'high' ? 60 : 
               severity === 'medium' ? 90 : 180
  now.setDate(now.getDate() + days)
  return now
}

function assessSecurityPosture(
  frameworkResults: ComplianceScoreResult[],
  vulnerabilities: Vulnerability[]
): SecurityPosture {
  const avgScore = frameworkResults.reduce((sum, result) => sum + result.overallScore, 0) / frameworkResults.length
  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical' && v.status === 'open').length
  const highVulns = vulnerabilities.filter(v => v.severity === 'high' && v.status === 'open').length
  
  let posture: 'Strong' | 'Moderate' | 'Weak' | 'Critical'
  if (avgScore >= 85 && criticalVulns === 0 && highVulns <= 2) posture = 'Strong'
  else if (avgScore >= 70 && criticalVulns <= 1 && highVulns <= 5) posture = 'Moderate'
  else if (avgScore >= 50 && criticalVulns <= 3 && highVulns <= 10) posture = 'Weak'
  else posture = 'Critical'
  
  return {
    overallPosture: posture,
    complianceStrength: avgScore,
    vulnerabilityRisk: criticalVulns * 10 + highVulns * 5,
    maturityIndicators: {
      policyCompliance: frameworkResults.every(r => r.documentationScore >= 80),
      technicalControls: frameworkResults.every(r => r.implementationScore >= 70),
      monitoringCapability: frameworkResults.every(r => r.monitoringScore >= 75),
      incidentResponse: frameworkResults.some(r => r.testingScore >= 80),
    },
  }
}

function calculateMaturityLevel(frameworkResults: ComplianceScoreResult[]): number {
  const avgScore = frameworkResults.reduce((sum, result) => sum + result.overallScore, 0) / frameworkResults.length
  return Math.round(avgScore / 20) // Convert to 1-5 scale
}

function generateStrategicRecommendations(
  frameworkResults: ComplianceScoreResult[],
  criticalIssues: CriticalComplianceIssue[]
): ComplianceRecommendation[] {
  const recommendations: ComplianceRecommendation[] = []
  
  if (criticalIssues.length > 0) {
    recommendations.push({
      id: 'strategic-1',
      title: 'Address Critical Compliance Issues',
      description: `Prioritize remediation of ${criticalIssues.length} critical compliance issues to avoid regulatory penalties and business disruption.`,
      priority: 'critical',
      category: 'process',
      estimatedCost: criticalIssues.reduce((sum, issue) => sum + issue.estimatedRemediationCost, 0),
      estimatedTimeframe: '3-6 months',
      dependencies: [],
      affectedRequirements: criticalIssues.map(issue => issue.requirementId),
    })
  }
  
  const lowScoringFrameworks = frameworkResults.filter(r => r.overallScore < 70)
  if (lowScoringFrameworks.length > 0) {
    recommendations.push({
      id: 'strategic-2',
      title: 'Improve Low-Scoring Framework Compliance',
      description: `Focus on improving compliance scores for ${lowScoringFrameworks.map(f => f.framework).join(', ')} frameworks.`,
      priority: 'high',
      category: 'policy',
      estimatedTimeframe: '6-12 months',
      dependencies: [],
      affectedRequirements: [],
    })
  }
  
  return recommendations
}

function assessVulnerabilityImpact(vulnerabilities: Vulnerability[]): VulnerabilityImpact {
  const total = vulnerabilities.length
  const critical = vulnerabilities.filter(v => v.severity === 'critical').length
  const high = vulnerabilities.filter(v => v.severity === 'high').length
  const open = vulnerabilities.filter(v => v.status === 'open').length
  
  return {
    totalVulnerabilities: total,
    criticalVulnerabilities: critical,
    highVulnerabilities: high,
    openVulnerabilities: open,
    riskScore: critical * 10 + high * 5 + open * 2,
  }
}

function summarizeAuditHistory(audits: SecurityAudit[]): AuditHistorySummary {
  const total = audits.length
  const completed = audits.filter(a => a.status === 'completed').length
  const avgScore = completed > 0 ? audits.reduce((sum, a) => sum + a.overallScore, 0) / completed : 0
  
  return {
    totalAudits: total,
    completedAudits: completed,
    averageScore: Math.round(avgScore),
    lastAuditDate: audits.length > 0 ? Math.max(...audits.map(a => a.startDate.getTime())) : null,
  }
}

function generateExecutiveSummary(
  overallScore: number,
  criticalIssues: CriticalComplianceIssue[],
  maturityLevel: number
): string {
  const grade = overallScore >= 90 ? 'excellent' : 
                overallScore >= 80 ? 'good' : 
                overallScore >= 70 ? 'satisfactory' : 
                overallScore >= 60 ? 'needs improvement' : 'poor'
  
  return `The organization's overall compliance posture is ${grade} with a score of ${overallScore}/100. 
  Current maturity level is ${maturityLevel}/5. 
  ${criticalIssues.length > 0 ? `${criticalIssues.length} critical issues require immediate attention.` : 'No critical compliance issues identified.'}`
}

function generateNextSteps(
  criticalIssues: CriticalComplianceIssue[],
  recommendations: ComplianceRecommendation[]
): string[] {
  const steps: string[] = []
  
  if (criticalIssues.length > 0) {
    steps.push(`Address ${criticalIssues.length} critical compliance issues within recommended deadlines`)
  }
  
  const priorityRecs = recommendations.filter(r => r.priority === 'critical' || r.priority === 'high')
  if (priorityRecs.length > 0) {
    steps.push(`Implement ${priorityRecs.length} high-priority strategic recommendations`)
  }
  
  steps.push('Schedule next compliance assessment cycle')
  steps.push('Update compliance documentation and evidence')
  steps.push('Conduct employee training on new policies and procedures')
  
  return steps
}

function getLastQuarterPeriod(): string {
  const now = new Date()
  const quarter = Math.floor(now.getMonth() / 3)
  const year = now.getFullYear()
  return `Q${quarter} ${year}`
}

export interface ComplianceTrendPoint {
  date: Date
  overallScore: number
  frameworkScores: Array<{
    framework: string
    score: number
  }>
}

export interface CriticalComplianceIssue {
  framework: string
  requirementId: string
  requirementTitle: string
  impact: 'critical' | 'high' | 'medium' | 'low'
  riskLevel: string
  businessImpact: string
  regulatoryImpact: string
  estimatedRemediationCost: number
  recommendedDeadline: Date
}

export interface SecurityPosture {
  overallPosture: 'Strong' | 'Moderate' | 'Weak' | 'Critical'
  complianceStrength: number
  vulnerabilityRisk: number
  maturityIndicators: {
    policyCompliance: boolean
    technicalControls: boolean
    monitoringCapability: boolean
    incidentResponse: boolean
  }
}

export interface VulnerabilityImpact {
  totalVulnerabilities: number
  criticalVulnerabilities: number
  highVulnerabilities: number
  openVulnerabilities: number
  riskScore: number
}

export interface AuditHistorySummary {
  totalAudits: number
  completedAudits: number
  averageScore: number
  lastAuditDate: number | null
}

export interface ComplianceReport {
  executiveSummary: string
  frameworkResults: ComplianceScoreResult[]
  overallScore: number
  criticalIssues: CriticalComplianceIssue[]
  securityPosture: SecurityPosture
  maturityLevel: number
  vulnerabilityImpact: VulnerabilityImpact
  auditHistory: AuditHistorySummary
  recommendations: ComplianceRecommendation[]
  nextSteps: string[]
  reportDate: Date
  reportPeriod: string
}
