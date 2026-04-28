export interface DependencyInfo {
  name: string;
  currentVersion: string;
  latestVersion: string;
  wantedVersion?: string;
  type: 'dependencies' | 'devDependencies' | 'peerDependencies';
  outdated: boolean;
  vulnerabilities: Vulnerability[];
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  url: string;
  cwe?: string[];
  cve?: string;
  patchedIn?: string;
  overview: string;
  recommendation: string;
  affectedPaths: string[];
}

export interface AuditReport {
  metadata: {
    totalDependencies: number;
    vulnerableDependencies: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    lastUpdated: Date;
  };
  dependencies: DependencyInfo[];
  summary: {
    outdatedPackages: number;
    packagesWithVulnerabilities: number;
    totalVulnerabilities: number;
  };
}

export interface PRDescription {
  title: string;
  body: string;
  dependencies: string[];
  securityUpdates: string[];
  versionUpdates: Array<{
    name: string;
    from: string;
    to: string;
  }>;
}

export interface DependencyAuditResponse {
  success: boolean;
  report: AuditReport;
  error?: string;
}

export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export const SEVERITY_COLORS: Record<VulnerabilitySeverity, string> = {
  critical: 'text-red-600 bg-red-100 border-red-200',
  high: 'text-orange-600 bg-orange-100 border-orange-200',
  medium: 'text-yellow-600 bg-yellow-100 border-yellow-200',
  low: 'text-blue-600 bg-blue-100 border-blue-200',
  info: 'text-gray-600 bg-gray-100 border-gray-200',
};

export const SEVERITY_PRIORITY: Record<VulnerabilitySeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
};
