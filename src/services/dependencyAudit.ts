import { 
  DependencyInfo, 
  Vulnerability, 
  AuditReport, 
  PRDescription,
  DependencyAuditResponse,
  VulnerabilitySeverity 
} from '../types/dependencies';

export class DependencyAuditService {
  private static cache: Map<string, { data: AuditReport; timestamp: number }> = new Map();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getAuditReport(forceRefresh = false): Promise<DependencyAuditResponse> {
    try {
      const cacheKey = 'dependency-audit';
      const cached = this.cache.get(cacheKey);
      
      if (!forceRefresh && cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return {
          success: true,
          report: cached.data
        };
      }

      const response = await fetch('/api/dependencies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin', // Will be set by AuthUtils in production
          'x-api-key': 'demo-api-key', // Will be set by AuthUtils in production
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: DependencyAuditResponse = await response.json();
      
      if (result.success) {
        this.cache.set(cacheKey, { data: result.report, timestamp: Date.now() });
      }

      return result;
    } catch (error) {
      console.error('Error fetching dependency audit:', error);
      return {
        success: false,
        report: this.getEmptyReport(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static getEmptyReport(): AuditReport {
    return {
      metadata: {
        totalDependencies: 0,
        vulnerableDependencies: 0,
        criticalVulnerabilities: 0,
        highVulnerabilities: 0,
        mediumVulnerabilities: 0,
        lowVulnerabilities: 0,
        lastUpdated: new Date()
      },
      dependencies: [],
      summary: {
        outdatedPackages: 0,
        packagesWithVulnerabilities: 0,
        totalVulnerabilities: 0
      }
    };
  }

  static generatePRDescription(dependencies: DependencyInfo[], securityOnly = false): PRDescription {
    const depsToUpdate = securityOnly 
      ? dependencies.filter(d => d.vulnerabilities.length > 0)
      : dependencies.filter(d => d.outdated || d.vulnerabilities.length > 0);

    const securityUpdates = depsToUpdate
      .filter(d => d.vulnerabilities.length > 0)
      .map(d => d.name);

    const versionUpdates = depsToUpdate.map(d => ({
      name: d.name,
      from: d.currentVersion,
      to: d.latestVersion
    }));

    const criticalCount = depsToUpdate.reduce((count, d) => 
      count + d.vulnerabilities.filter(v => v.severity === 'critical').length, 0);

    const highCount = depsToUpdate.reduce((count, d) => 
      count + d.vulnerabilities.filter(v => v.severity === 'high').length, 0);

    let title = securityOnly ? 'Security: ' : 'chore(deps): ';
    
    if (criticalCount > 0) {
      title += `Fix ${criticalCount} critical vulnerability${criticalCount > 1 ? 'ies' : ''}`;
    } else if (highCount > 0) {
      title += `Fix ${highCount} high vulnerability${highCount > 1 ? 'ies' : ''}`;
    } else {
      title += `Update ${depsToUpdate.length} package${depsToUpdate.length > 1 ? 's' : ''}`;
    }

    const body = this.generatePRBody(depsToUpdate, securityOnly);

    return {
      title,
      body,
      dependencies: depsToUpdate.map(d => d.name),
      securityUpdates,
      versionUpdates
    };
  }

  private static generatePRBody(dependencies: DependencyInfo[], securityOnly: boolean): string {
    const sections: string[] = [];

    // Header
    sections.push('## 📦 Dependency Updates\n');
    
    if (securityOnly) {
      sections.push('This PR addresses security vulnerabilities in project dependencies.\n');
    } else {
      sections.push('This PR updates project dependencies to their latest versions.\n');
    }

    // Security vulnerabilities section
    const depsWithVulns = dependencies.filter(d => d.vulnerabilities.length > 0);
    if (depsWithVulns.length > 0) {
      sections.push('### 🔒 Security Vulnerabilities\n');
      depsWithVulns.forEach(dep => {
        sections.push(`**${dep.name}** (${dep.currentVersion} → ${dep.latestVersion})`);
        dep.vulnerabilities.forEach(vuln => {
          sections.push(`- **${vuln.severity.toUpperCase()}**: [${vuln.title}](${vuln.url})`);
          if (vuln.cve) {
            sections.push(`  - CVE: ${vuln.cve}`);
          }
          if (vuln.patchedIn) {
            sections.push(`  - Patched in: ${vuln.patchedIn}`);
          }
        });
        sections.push('');
      });
    }

    // Regular updates section
    const regularUpdates = dependencies.filter(d => d.outdated && d.vulnerabilities.length === 0);
    if (regularUpdates.length > 0 && !securityOnly) {
      sections.push('### 🔄 Version Updates\n');
      regularUpdates.forEach(dep => {
        sections.push(`- **${dep.name}**: ${dep.currentVersion} → ${dep.latestVersion}`);
      });
      sections.push('');
    }

    // Summary
    const totalVulns = dependencies.reduce((count, d) => count + d.vulnerabilities.length, 0);
    const criticalCount = dependencies.reduce((count, d) => 
      count + d.vulnerabilities.filter(v => v.severity === 'critical').length, 0);
    const highCount = dependencies.reduce((count, d) => 
      count + d.vulnerabilities.filter(v => v.severity === 'high').length, 0);

    sections.push('### 📊 Summary\n');
    sections.push(`- **Packages updated**: ${dependencies.length}`);
    if (totalVulns > 0) {
      sections.push(`- **Vulnerabilities fixed**: ${totalVulns}`);
      if (criticalCount > 0) sections.push(`  - Critical: ${criticalCount}`);
      if (highCount > 0) sections.push(`  - High: ${highCount}`);
    }

    // Testing instructions
    sections.push('\n### 🧪 Testing\n');
    sections.push('- [ ] All tests pass');
    sections.push('- [ ] Application builds successfully');
    sections.push('- [ ] No runtime errors in development');
    sections.push('- [ ] Manual testing of core functionality');

    // Automation notice
    sections.push('\n---\n');
    sections.push('*This PR was automatically generated using the dependency dashboard.*');

    return sections.join('\n');
  }

  static async refreshAudit(): Promise<DependencyAuditResponse> {
    return this.getAuditReport(true);
  }

  static clearCache(): void {
    this.cache.clear();
  }
}
