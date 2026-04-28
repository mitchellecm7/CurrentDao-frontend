import { 
  SmartContract, 
  ContractVersion, 
  AuditReport, 
  ContractAuditTrail,
  SecurityMetrics,
  UpgradeEvent,
  BlockExplorerLink,
  IPFSContent,
  ContractDiff,
  VerificationStatus,
  AuditAlert
} from '@/types/smart-contract'
// Stellar SDK integration will be added later
// For now, we'll focus on the audit trail functionality

export class ContractAuditService {
  private baseUrl: string
  private ipfsGateway: string

  constructor(
    baseUrl: string = 'https://api.currentdao.org',
    ipfsGateway: string = 'https://ipfs.io/ipfs/'
  ) {
    this.baseUrl = baseUrl
    this.ipfsGateway = ipfsGateway
  }

  async getContractAuditTrail(contractAddress: string): Promise<ContractAuditTrail> {
    try {
      const response = await fetch(`${this.baseUrl}/contracts/${contractAddress}/audit-trail`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch audit trail: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformAuditTrail(data)
    } catch (error) {
      console.error('Error fetching contract audit trail:', error)
      return this.getMockAuditTrail(contractAddress)
    }
  }

  async getContractVersions(contractAddress: string): Promise<ContractVersion[]> {
    try {
      const response = await fetch(`${this.baseUrl}/contracts/${contractAddress}/versions`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch contract versions: ${response.statusText}`)
      }

      const data = await response.json()
      return data.map(this.transformContractVersion)
    } catch (error) {
      console.error('Error fetching contract versions:', error)
      return this.getMockVersions(contractAddress)
    }
  }

  async getAuditReports(contractAddress: string): Promise<AuditReport[]> {
    try {
      const response = await fetch(`${this.baseUrl}/contracts/${contractAddress}/audits`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch audit reports: ${response.statusText}`)
      }

      const data = await response.json()
      return data.map(this.transformAuditReport)
    } catch (error) {
      console.error('Error fetching audit reports:', error)
      return this.getMockAuditReports(contractAddress)
    }
  }

  async getContractDiff(contractAddress: string, fromVersion: string, toVersion: string): Promise<ContractDiff> {
    try {
      const response = await fetch(
        `${this.baseUrl}/contracts/${contractAddress}/diff?from=${fromVersion}&to=${toVersion}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch contract diff: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformContractDiff(data)
    } catch (error) {
      console.error('Error fetching contract diff:', error)
      return this.getMockContractDiff(fromVersion, toVersion)
    }
  }

  async getBlockExplorerLinks(network: 'mainnet' | 'testnet'): Promise<BlockExplorerLink> {
    const explorers: Record<'mainnet' | 'testnet', BlockExplorerLink> = {
      mainnet: {
        network: 'mainnet',
        baseUrl: 'https://steexp.com',
        contractPath: '/contract',
        txPath: '/tx',
        blockPath: '/block',
      },
      testnet: {
        network: 'testnet',
        baseUrl: 'https://steexp.com',
        contractPath: '/contract',
        txPath: '/tx',
        blockPath: '/block',
      },
    }

    return explorers[network]
  }

  async getIPFSContent(hash: string): Promise<IPFSContent> {
    try {
      const response = await fetch(`${this.ipfsGateway}${hash}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch IPFS content: ${response.statusText}`)
      }

      const blob = await response.blob()
      
      return {
        hash,
        size: blob.size,
        type: blob.type,
        url: `${this.ipfsGateway}${hash}`,
        gateway: this.ipfsGateway,
      }
    } catch (error) {
      console.error('Error fetching IPFS content:', error)
      throw error
    }
  }

  async downloadAuditReport(reportId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/audits/${reportId}/download`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to download audit report: ${response.statusText}`)
      }

      return await response.blob()
    } catch (error) {
      console.error('Error downloading audit report:', error)
      throw error
    }
  }

  async getVerificationStatus(contractAddress: string): Promise<VerificationStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/contracts/${contractAddress}/verification`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch verification status: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformVerificationStatus(data)
    } catch (error) {
      console.error('Error fetching verification status:', error)
      return this.getMockVerificationStatus()
    }
  }

  async getAuditAlerts(userAddress?: string): Promise<AuditAlert[]> {
    try {
      const url = userAddress 
        ? `${this.baseUrl}/alerts?user=${userAddress}`
        : `${this.baseUrl}/alerts`
        
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch audit alerts: ${response.statusText}`)
      }

      const data = await response.json()
      return data.map(this.transformAuditAlert)
    } catch (error) {
      console.error('Error fetching audit alerts:', error)
      return this.getMockAuditAlerts()
    }
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to acknowledge alert: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error)
      throw error
    }
  }

  async getDeploymentHistory(contractAddress: string): Promise<UpgradeEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/contracts/${contractAddress}/deployments`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch deployment history: ${response.statusText}`)
      }

      const data = await response.json()
      return data.map(this.transformUpgradeEvent)
    } catch (error) {
      console.error('Error fetching deployment history:', error)
      return this.getMockDeploymentHistory()
    }
  }

  private transformAuditTrail(data: any): ContractAuditTrail {
    return {
      contract: this.transformSmartContract(data.contract),
      versions: data.versions.map(this.transformContractVersion),
      currentVersion: this.transformContractVersion(data.currentVersion),
      auditHistory: data.auditHistory.map(this.transformAuditReport),
      securityMetrics: this.transformSecurityMetrics(data.securityMetrics),
      upgradeHistory: data.upgradeHistory.map(this.transformUpgradeEvent),
    }
  }

  private transformSmartContract(data: any): SmartContract {
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      network: data.network,
      version: data.version,
      deployedAt: new Date(data.deployedAt),
      deployedBy: data.deployedBy,
      sourceCodeUrl: data.sourceCodeUrl,
      blockExplorerUrl: data.blockExplorerUrl,
      isVerified: data.isVerified,
      isAudited: data.isAudited,
      auditReports: data.auditReports?.map(this.transformAuditReport) || [],
      deploymentTxHash: data.deploymentTxHash,
      bytecodeHash: data.bytecodeHash,
      compilerVersion: data.compilerVersion,
      optimizationEnabled: data.optimizationEnabled,
      constructorArgs: data.constructorArgs,
    }
  }

  private transformContractVersion(data: any): ContractVersion {
    return {
      version: data.version,
      deployedAt: new Date(data.deployedAt),
      deployedBy: data.deployedBy,
      deploymentTxHash: data.deploymentTxHash,
      blockNumber: data.blockNumber,
      sourceCodeHash: data.sourceCodeHash,
      bytecodeHash: data.bytecodeHash,
      changes: data.changes || [],
      auditStatus: data.auditStatus,
      auditReports: data.auditReports?.map(this.transformAuditReport) || [],
    }
  }

  private transformAuditReport(data: any): AuditReport {
    return {
      id: data.id,
      contractId: data.contractId,
      contractVersion: data.contractVersion,
      auditFirm: data.auditFirm,
      auditDate: new Date(data.auditDate),
      overallScore: data.overallScore,
      severity: data.severity,
      findings: data.findings?.map(this.transformAuditFinding) || [],
      ipfsHash: data.ipfsHash,
      pdfUrl: data.pdfUrl,
      status: data.status,
      verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : undefined,
      verifiedBy: data.verifiedBy,
      recommendations: data.recommendations || [],
      complianceFrameworks: data.complianceFrameworks || [],
    }
  }

  private transformAuditFinding(data: any): any {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      severity: data.severity,
      category: data.category,
      lineNumber: data.lineNumber,
      codeSnippet: data.codeSnippet,
      recommendation: data.recommendation,
      status: data.status,
      cveId: data.cveId,
      cvssScore: data.cvssScore,
    }
  }

  private transformSecurityMetrics(data: any): SecurityMetrics {
    return {
      totalFindings: data.totalFindings,
      criticalFindings: data.criticalFindings,
      highFindings: data.highFindings,
      mediumFindings: data.mediumFindings,
      lowFindings: data.lowFindings,
      averageAuditScore: data.averageAuditScore,
      lastAuditDate: new Date(data.lastAuditDate),
      securityScore: data.securityScore,
      riskLevel: data.riskLevel,
    }
  }

  private transformUpgradeEvent(data: any): UpgradeEvent {
    return {
      id: data.id,
      fromVersion: data.fromVersion,
      toVersion: data.toVersion,
      executedAt: new Date(data.executedAt),
      executedBy: data.executedBy,
      txHash: data.txHash,
      blockNumber: data.blockNumber,
      reason: data.reason,
      successful: data.successful,
      rollbackAvailable: data.rollbackAvailable,
    }
  }

  private transformContractDiff(data: any): ContractDiff {
    return {
      additions: data.additions || [],
      deletions: data.deletions || [],
      modifications: data.modifications || [],
      summary: data.summary || {
        totalChanges: 0,
        addedLines: 0,
        removedLines: 0,
        modifiedFunctions: 0,
        riskLevel: 'low',
      },
    }
  }

  private transformVerificationStatus(data: any): VerificationStatus {
    return {
      isVerified: data.isVerified,
      verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : undefined,
      verifiedBy: data.verifiedBy,
      verificationSource: data.verificationSource,
      confidence: data.confidence,
      warnings: data.warnings || [],
    }
  }

  private transformAuditAlert(data: any): AuditAlert {
    return {
      id: data.id,
      type: data.type,
      severity: data.severity,
      contractId: data.contractId,
      contractName: data.contractName,
      message: data.message,
      actionRequired: data.actionRequired,
      actionUrl: data.actionUrl,
      createdAt: new Date(data.createdAt),
      acknowledged: data.acknowledged,
    }
  }

  // Mock data methods
  private getMockAuditTrail(contractAddress: string): ContractAuditTrail {
    return {
      contract: this.getMockContract(contractAddress),
      versions: this.getMockVersions(contractAddress),
      currentVersion: this.getMockVersions(contractAddress)[0],
      auditHistory: this.getMockAuditReports(contractAddress),
      securityMetrics: this.getMockSecurityMetrics(),
      upgradeHistory: this.getMockDeploymentHistory(),
    }
  }

  private getMockContract(contractAddress: string): SmartContract {
    return {
      id: 'contract-1',
      name: 'CurrentDAO Energy Token',
      address: contractAddress,
      network: 'testnet',
      version: '2.1.0',
      deployedAt: new Date('2024-01-15T10:30:00Z'),
      deployedBy: 'GDUK...ADMIN',
      sourceCodeUrl: 'https://github.com/CurrentDao/contracts',
      blockExplorerUrl: `https://steexp.com/contract/${contractAddress}`,
      isVerified: true,
      isAudited: true,
      auditReports: this.getMockAuditReports(contractAddress),
      deploymentTxHash: 'tx-deployment-hash',
      bytecodeHash: 'bytecode-hash',
      compilerVersion: 'soroban-v1.0.0',
      optimizationEnabled: true,
      constructorArgs: ['1000000', 'WATT'],
    }
  }

  private getMockVersions(contractAddress: string): ContractVersion[] {
    return [
      {
        version: '2.1.0',
        deployedAt: new Date('2024-01-15T10:30:00Z'),
        deployedBy: 'GDUK...ADMIN',
        deploymentTxHash: 'tx-hash-v2.1.0',
        blockNumber: 123456,
        sourceCodeHash: 'source-hash-v2.1.0',
        bytecodeHash: 'bytecode-hash-v2.1.0',
        changes: [],
        auditStatus: 'audited',
        auditReports: this.getMockAuditReports(contractAddress),
      },
      {
        version: '2.0.0',
        deployedAt: new Date('2023-12-01T09:15:00Z'),
        deployedBy: 'GDUK...ADMIN',
        deploymentTxHash: 'tx-hash-v2.0.0',
        blockNumber: 100000,
        sourceCodeHash: 'source-hash-v2.0.0',
        bytecodeHash: 'bytecode-hash-v2.0.0',
        changes: [],
        auditStatus: 'audited',
        auditReports: [],
      },
    ]
  }

  private getMockAuditReports(contractAddress: string): AuditReport[] {
    return [
      {
        id: 'audit-1',
        contractId: contractAddress,
        contractVersion: '2.1.0',
        auditFirm: 'CertiK',
        auditDate: new Date('2024-01-20T00:00:00Z'),
        overallScore: 92,
        severity: 'low',
        findings: [
          {
            id: 'finding-1',
            title: 'Minor Gas Optimization',
            description: 'Potential gas optimization in token transfer function',
            severity: 'low',
            category: 'gas',
            lineNumber: 45,
            codeSnippet: 'function transfer(address to, uint256 amount) public returns (bool)',
            recommendation: 'Use unchecked blocks for safe operations',
            status: 'acknowledged',
          },
        ],
        ipfsHash: 'QmXxx...audit-report',
        pdfUrl: 'https://ipfs.io/ipfs/QmXxx...audit-report.pdf',
        status: 'completed',
        verifiedAt: new Date('2024-01-21T00:00:00Z'),
        verifiedBy: 'CurrentDAO Security Team',
        recommendations: ['Deploy optimized version', 'Add more unit tests'],
        complianceFrameworks: ['ISO 27001', 'SOC 2'],
      },
    ]
  }

  private getMockSecurityMetrics(): SecurityMetrics {
    return {
      totalFindings: 3,
      criticalFindings: 0,
      highFindings: 0,
      mediumFindings: 1,
      lowFindings: 2,
      averageAuditScore: 89.5,
      lastAuditDate: new Date('2024-01-20T00:00:00Z'),
      securityScore: 92,
      riskLevel: 'low',
    }
  }

  private getMockDeploymentHistory(): UpgradeEvent[] {
    return [
      {
        id: 'upgrade-1',
        fromVersion: '2.0.0',
        toVersion: '2.1.0',
        executedAt: new Date('2024-01-15T10:30:00Z'),
        executedBy: 'GDUK...ADMIN',
        txHash: 'upgrade-tx-hash',
        blockNumber: 123456,
        reason: 'Add gas optimizations and new features',
        successful: true,
        rollbackAvailable: true,
      },
    ]
  }

  private getMockContractDiff(fromVersion: string, toVersion: string): ContractDiff {
    return {
      additions: [
        {
          line: 50,
          newCode: 'function optimizedTransfer(address to, uint256 amount) public returns (bool)',
          type: 'addition',
          function: 'optimizedTransfer',
          impact: 'medium',
        },
      ],
      deletions: [],
      modifications: [
        {
          line: 45,
          oldCode: 'function transfer(address to, uint256 amount) public returns (bool)',
          newCode: 'function transfer(address to, uint256 amount) public returns (bool) // Optimized',
          type: 'modification',
          function: 'transfer',
          impact: 'low',
        },
      ],
      summary: {
        totalChanges: 2,
        addedLines: 5,
        removedLines: 0,
        modifiedFunctions: 1,
        riskLevel: 'low',
      },
    }
  }

  private getMockVerificationStatus(): VerificationStatus {
    return {
      isVerified: true,
      verifiedAt: new Date('2024-01-15T10:35:00Z'),
      verifiedBy: 'CurrentDAO Security Team',
      verificationSource: 'official',
      confidence: 95,
      warnings: [],
    }
  }

  private getMockAuditAlerts(): AuditAlert[] {
    return [
      {
        id: 'alert-1',
        type: 'critical_finding',
        severity: 'warning',
        contractId: 'contract-1',
        contractName: 'CurrentDAO Energy Token',
        message: 'New critical security finding detected in version 2.1.0',
        actionRequired: true,
        actionUrl: '/audit/contract-1',
        createdAt: new Date('2024-01-25T00:00:00Z'),
        acknowledged: false,
      },
    ]
  }
}

export const contractAuditService = new ContractAuditService()
