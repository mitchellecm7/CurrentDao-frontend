import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, RotateCcw, ChevronUp, File, Clock } from 'lucide-react';
import { DependencyAuditService } from '../../../src/services/dependencyAudit';
import { AuthUtils } from '../../../src/utils/authUtils';
import { 
  AuditReport, 
  DependencyInfo, 
  Vulnerability, 
  SEVERITY_COLORS,
  VulnerabilitySeverity 
} from '../../../src/types/dependencies';

interface DependencyDashboardWidgetProps {
  className?: string;
}

export const DependencyDashboardWidget: React.FC<DependencyDashboardWidgetProps> = ({ 
  className = '' 
}) => {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDependency, setSelectedDependency] = useState<DependencyInfo | null>(null);

  // Check access permissions
  const currentUser = AuthUtils.getCurrentUser();
  const hasAccess = AuthUtils.canAccessDependencyDashboard(currentUser);

  // If user doesn't have access, show restricted message
  if (!hasAccess) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
        <div className="flex items-center justify-center h-32">
          <Shield className="w-6 h-6 text-red-500 mr-2" />
          <div className="text-center">
            <div className="text-red-600 font-medium">Access Restricted</div>
            <div className="text-sm text-gray-600 mt-1">
              This dashboard is only available to administrators and maintainers
            </div>
            {currentUser && (
              <div className="text-xs text-gray-500 mt-2">
                Current role: {currentUser.role}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const loadReport = async (forceRefresh = false) => {
    try {
      setError(null);
      if (forceRefresh) setRefreshing(true);
      
      const result = await DependencyAuditService.getAuditReport(forceRefresh);
      
      if (result.success) {
        setReport(result.report);
      } else {
        setError(result.error || 'Failed to load dependency report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleRefresh = () => {
    loadReport(true);
  };

  const generatePRDescription = (securityOnly = false) => {
    if (!report) return;
    
    const prDesc = DependencyAuditService.generatePRDescription(
      report.dependencies, 
      securityOnly
    );
    
    // Copy to clipboard
    navigator.clipboard.writeText(`${prDesc.title}\n\n${prDesc.body}`);
    
    // Show success message
    alert('PR description copied to clipboard!');
  };

  const exportToCSV = () => {
    if (!report) return;
    
    const headers = ['Package', 'Current Version', 'Latest Version', 'Type', 'Vulnerabilities', 'Severity'];
    const rows = report.dependencies.map(dep => [
      dep.name,
      dep.currentVersion,
      dep.latestVersion,
      dep.type,
      dep.vulnerabilities.length.toString(),
      dep.vulnerabilities.map(v => v.severity).join(', ') || 'None'
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dependency-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
        <div className="flex items-center justify-center h-32">
          <RotateCcw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading dependency report...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
        <div className="flex items-center justify-center h-32">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <span className="ml-2 text-red-600">{error}</span>
          <button 
            onClick={() => loadReport()}
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const criticalVulns = report.metadata.criticalVulnerabilities;
  const highVulns = report.metadata.highVulnerabilities;
  const hasSecurityIssues = criticalVulns > 0 || highVulns > 0;

  return (
    <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Shield className={`w-5 h-5 mr-2 ${hasSecurityIssues ? 'text-red-500' : 'text-green-500'}`} />
          <h3 className="text-lg font-semibold">Dependency Security</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            title="Refresh"
          >
            <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportToCSV}
            className="p-2 text-gray-600 hover:text-gray-800"
            title="Export CSV"
          >
            <File className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-2xl font-bold text-blue-600">{report.metadata.totalDependencies}</div>
          <div className="text-xs text-blue-800">Total Dependencies</div>
        </div>
        <div className="bg-red-50 p-3 rounded">
          <div className="text-2xl font-bold text-red-600">{report.metadata.vulnerableDependencies}</div>
          <div className="text-xs text-red-800">Vulnerable</div>
        </div>
        <div className="bg-orange-50 p-3 rounded">
          <div className="text-2xl font-bold text-orange-600">{report.summary.outdatedPackages}</div>
          <div className="text-xs text-orange-800">Outdated</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-2xl font-bold text-gray-600">{report.summary.totalVulnerabilities}</div>
          <div className="text-xs text-gray-800">Total Issues</div>
        </div>
      </div>

      {/* Security Alert */}
      {hasSecurityIssues && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">
              Security Issues Detected: {criticalVulns} critical, {highVulns} high severity
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => generatePRDescription(true)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Generate Security PR
        </button>
        <button
          onClick={() => generatePRDescription(false)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Generate Update PR
        </button>
      </div>

      {/* Dependencies List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {report.dependencies.slice(0, 10).map((dep) => {
          const hasVulns = dep.vulnerabilities.length > 0;
          const highestSeverity = hasVulns 
            ? dep.vulnerabilities.reduce((prev, current) => 
                (prev.severity === 'critical' || current.severity === 'critical') ? 'critical' :
                (prev.severity === 'high' || current.severity === 'high') ? 'high' :
                (prev.severity === 'medium' || current.severity === 'medium') ? 'medium' : 'low'
              )
            : null;

          return (
            <div
              key={dep.name}
              className={`p-2 border rounded cursor-pointer transition-colors ${
                selectedDependency?.name === dep.name 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedDependency(dep)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-medium text-sm">{dep.name}</div>
                  <div className="text-xs text-gray-600">
                    {dep.currentVersion} → {dep.latestVersion}
                    {dep.outdated && <span className="ml-1 text-orange-600">(outdated)</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasVulns && (
                    <span className={`px-2 py-1 text-xs rounded ${SEVERITY_COLORS[highestSeverity!]}`}>
                      {dep.vulnerabilities.length} {highestSeverity}
                    </span>
                  )}
                  {dep.outdated && !hasVulns && (
                    <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                      Outdated
                    </span>
                  )}
                  {!hasVulns && !dep.outdated && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Dependency Details */}
      {selectedDependency && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">{selectedDependency.name}</h4>
            <button
              onClick={() => setSelectedDependency(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            Type: {selectedDependency.type} | 
            Current: {selectedDependency.currentVersion} | 
            Latest: {selectedDependency.latestVersion}
          </div>

          {selectedDependency.vulnerabilities.length > 0 && (
            <div className="space-y-2">
              <div className="font-medium text-sm">Vulnerabilities:</div>
              {selectedDependency.vulnerabilities.map((vuln, index) => (
                <div key={index} className={`p-2 border rounded ${SEVERITY_COLORS[vuln.severity]}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{vuln.title}</div>
                      <div className="text-xs opacity-75">{vuln.overview}</div>
                      {vuln.cve && <div className="text-xs font-mono mt-1">CVE: {vuln.cve}</div>}
                    </div>
                    <a
                      href={vuln.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-500 flex items-center">
        <Clock className="w-3 h-3 mr-1" />
        Last updated: {report.metadata.lastUpdated.toLocaleString()}
      </div>
    </div>
  );
};
