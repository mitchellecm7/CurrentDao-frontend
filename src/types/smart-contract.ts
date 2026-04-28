export interface SmartContract {
  id: string
  name: string
  address: string
  network: 'mainnet' | 'testnet'
  version: string
  deployedAt: Date
  deployedBy: string
  sourceCodeUrl?: string
  blockExplorerUrl?: string
  isVerified: boolean
  isAudited: boolean
  auditReports: AuditReport[]
  deploymentTxHash: string
  bytecodeHash: string
  compilerVersion?: string
  optimizationEnabled?: boolean
  constructorArgs?: string[]
}

export interface ContractVersion {
  version: string
  deployedAt: Date
  deployedBy: string
  deploymentTxHash: string
  blockNumber: number
  sourceCodeHash: string
  bytecodeHash: string
  changes: VersionChange[]
  auditStatus: 'audited' | 'pending' | 'rejected' | 'not_audited'
  auditReports: AuditReport[]
}

export interface VersionChange {
  type: 'added' | 'removed' | 'modified'
  category: 'function' | 'variable' | 'event' | 'modifier' | 'struct' | 'enum'
  name: string
  signature: string
  oldCode?: string
  newCode?: string
  description?: string
  impact: 'high' | 'medium' | 'low'
}

export interface AuditReport {
  id: string
  contractId: string
  contractVersion: string
  auditFirm: string
  auditDate: Date
  overallScore: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  findings: AuditFinding[]
  ipfsHash: string
  pdfUrl?: string
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  verifiedAt?: Date
  verifiedBy?: string
  recommendations: string[]
  complianceFrameworks: string[]
}

export interface AuditFinding {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational'
  category: 'security' | 'gas' | 'best_practices' | 'documentation' | 'upgradability'
  lineNumber?: number
  codeSnippet?: string
  recommendation: string
  status: 'open' | 'acknowledged' | 'resolved' | 'false_positive'
  cveId?: string
  cvssScore?: number
}

export interface ContractAuditTrail {
  contract: SmartContract
  versions: ContractVersion[]
  currentVersion: ContractVersion
  auditHistory: AuditReport[]
  securityMetrics: SecurityMetrics
  upgradeHistory: UpgradeEvent[]
}

export interface SecurityMetrics {
  totalFindings: number
  criticalFindings: number
  highFindings: number
  mediumFindings: number
  lowFindings: number
  averageAuditScore: number
  lastAuditDate: Date
  securityScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface UpgradeEvent {
  id: string
  fromVersion: string
  toVersion: string
  executedAt: Date
  executedBy: string
  txHash: string
  blockNumber: number
  reason: string
  successful: boolean
  rollbackAvailable: boolean
}

export interface BlockExplorerLink {
  network: 'mainnet' | 'testnet'
  baseUrl: string
  contractPath: string
  txPath: string
  blockPath: string
}

export interface IPFSContent {
  hash: string
  size: number
  type: string
  url: string
  gateway: string
}

export interface ContractDiff {
  additions: CodeChange[]
  deletions: CodeChange[]
  modifications: CodeChange[]
  summary: {
    totalChanges: number
    addedLines: number
    removedLines: number
    modifiedFunctions: number
    riskLevel: 'low' | 'medium' | 'high'
  }
}

export interface CodeChange {
  line: number
  oldCode?: string
  newCode?: string
  type: 'addition' | 'deletion' | 'modification'
  function?: string
  impact: 'high' | 'medium' | 'low'
}

export interface VerificationStatus {
  isVerified: boolean
  verifiedAt?: Date
  verifiedBy?: string
  verificationSource: 'official' | 'community' | 'third_party'
  confidence: number
  warnings: string[]
}

export interface AuditAlert {
  id: string
  type: 'unaudited_contract' | 'critical_finding' | 'outdated_audit' | 'upgrade_available'
  severity: 'info' | 'warning' | 'error' | 'critical'
  contractId: string
  contractName: string
  message: string
  actionRequired: boolean
  actionUrl?: string
  createdAt: Date
  acknowledged: boolean
}
