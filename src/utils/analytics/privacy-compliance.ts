interface PrivacyConfig {
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  anonymizeIP: boolean;
  anonymizeUserAgent: boolean;
  excludeSensitiveData: boolean;
  dataRetentionDays: number;
  cookieConsentRequired: boolean;
  doNotTrackRespect: boolean;
  rightToDeletion: boolean;
  dataProcessingAgreement: boolean;
  encryptionEnabled: boolean;
  auditLogging: boolean;
}

interface SensitiveDataPattern {
  pattern: RegExp;
  type: 'email' | 'phone' | 'ssn' | 'creditcard' | 'password' | 'personal' | 'health' | 'financial';
  severity: 'low' | 'medium' | 'high' | 'critical';
  replacement: string;
}

interface ConsentRecord {
  id: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  consent: boolean;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  dataTypes: string[];
  retentionPeriod: number;
  withdrawnAt?: string;
  ipAddress: string;
  userAgent: string;
}

interface DataProcessingRecord {
  id: string;
  timestamp: string;
  operation: 'collect' | 'process' | 'store' | 'share' | 'delete';
  dataType: string;
  purpose: string;
  legalBasis: string;
  dataSubject?: string;
  processor: string;
  safeguards: string[];
  retentionPeriod: number;
}

class PrivacyComplianceManager {
  private config: PrivacyConfig;
  private consentRecords: ConsentRecord[] = [];
  private processingRecords: DataProcessingRecord[] = [];
  private sensitivePatterns: SensitiveDataPattern[] = [];
  private consentStorageKey = 'analytics_consent';
  private auditLogKey = 'privacy_audit_log';

  constructor(config: Partial<PrivacyConfig> = {}) {
    this.config = {
      gdprCompliant: true,
      ccpaCompliant: true,
      anonymizeIP: true,
      anonymizeUserAgent: true,
      excludeSensitiveData: true,
      dataRetentionDays: 365,
      cookieConsentRequired: true,
      doNotTrackRespect: true,
      rightToDeletion: true,
      dataProcessingAgreement: true,
      encryptionEnabled: true,
      auditLogging: true,
      ...config,
    };

    this.initializeSensitivePatterns();
    this.loadConsentRecords();
    this.loadAuditLog();
  }

  // Initialize sensitive data patterns
  private initializeSensitivePatterns(): void {
    this.sensitivePatterns = [
      // Email addresses
      {
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        type: 'email',
        severity: 'medium',
        replacement: '[EMAIL]',
      },
      // Phone numbers (US format)
      {
        pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
        type: 'phone',
        severity: 'medium',
        replacement: '[PHONE]',
      },
      // Social Security Numbers
      {
        pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
        type: 'ssn',
        severity: 'critical',
        replacement: '[SSN]',
      },
      // Credit card numbers
      {
        pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
        type: 'creditcard',
        severity: 'critical',
        replacement: '[CARD]',
      },
      // Password fields (indicators)
      {
        pattern: /password|pwd|pass/i,
        type: 'password',
        severity: 'critical',
        replacement: '[PASSWORD_FIELD]',
      },
      // Health information keywords
      {
        pattern: /\b(medical|health|diagnosis|treatment|prescription|doctor|hospital)\b/gi,
        type: 'health',
        severity: 'high',
        replacement: '[HEALTH]',
      },
      // Financial information keywords
      {
        pattern: /\b(bank|account|routing|swift|iban|credit|debit|loan|mortgage)\b/gi,
        type: 'financial',
        severity: 'high',
        replacement: '[FINANCIAL]',
      },
      // Personal identifiers
      {
        pattern: /\b(name|first|last|middle|surname|fullname|address|street|city|state|zip|postal)\b/gi,
        type: 'personal',
        severity: 'medium',
        replacement: '[PERSONAL]',
      },
    ];
  }

  // Check if user has given consent
  hasConsent(): boolean {
    if (this.config.doNotTrackRespect && navigator.doNotTrack === '1') {
      return false;
    }

    try {
      const consent = localStorage.getItem(this.consentStorageKey);
      return consent === 'granted';
    } catch {
      return false;
    }
  }

  // Record user consent
  recordConsent(
    consent: boolean,
    purpose: string = 'analytics',
    dataTypes: string[] = ['interaction', 'session', 'performance'],
    legalBasis: ConsentRecord['legalBasis'] = 'consent'
  ): ConsentRecord {
    const record: ConsentRecord = {
      id: this.generateId(),
      sessionId: this.getSessionId(),
      timestamp: new Date().toISOString(),
      consent,
      purpose,
      legalBasis,
      dataTypes,
      retentionPeriod: this.config.dataRetentionDays,
      ipAddress: this.anonymizeIP(this.getClientIP()),
      userAgent: this.config.anonymizeUserAgent 
        ? this.anonymizeUserAgentString(navigator.userAgent)
        : navigator.userAgent,
    };

    this.consentRecords.push(record);
    this.saveConsentRecords();

    try {
      localStorage.setItem(this.consentStorageKey, consent ? 'granted' : 'denied');
    } catch (error) {
      console.error('Failed to save consent to localStorage:', error);
    }

    this.logAuditEvent('consent_recorded', {
      consentId: record.id,
      consent,
      purpose,
      legalBasis,
    });

    return record;
  }

  // Withdraw consent
  withdrawConsent(): void {
    const consent = this.recordConsent(false, 'withdrawal');
    consent.withdrawnAt = new Date().toISOString();
    this.saveConsentRecords();

    try {
      localStorage.setItem(this.consentStorageKey, 'denied');
    } catch (error) {
      console.error('Failed to update consent in localStorage:', error);
    }

    this.logAuditEvent('consent_withdrawn', {
      consentId: consent.id,
    });
  }

  // Sanitize data for privacy compliance
  sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    // Remove sensitive fields
    if (this.config.excludeSensitiveData) {
      this.removeSensitiveFields(sanitized);
    }

    // Anonymize IP address
    if (this.config.anonymizeIP && sanitized.ip) {
      sanitized.ip = this.anonymizeIP(sanitized.ip);
    }

    // Anonymize user agent
    if (this.config.anonymizeUserAgent && sanitized.userAgent) {
      sanitized.userAgent = this.anonymizeUserAgentString(sanitized.userAgent);
    }

    // Apply sensitive data patterns
    this.applySensitivePatterns(sanitized);

    return sanitized;
  }

  // Remove sensitive fields from data
  private removeSensitiveFields(data: any): void {
    const sensitiveFields = [
      'email', 'phone', 'ssn', 'socialSecurity', 'creditCard', 'password',
      'address', 'fullName', 'firstName', 'lastName', 'name', 'zip',
      'postalCode', 'account', 'routing', 'swift', 'iban',
    ];

    const removeField = (obj: any, field: string): void => {
      if (obj && typeof obj === 'object' && field in obj) {
        delete obj[field];
      }
    };

    const removeNestedFields = (obj: any): void => {
      if (!obj || typeof obj !== 'object') return;

      sensitiveFields.forEach(field => {
        removeField(obj, field);
      });

      Object.values(obj).forEach(value => {
        if (Array.isArray(value)) {
          value.forEach(item => removeNestedFields(item));
        } else if (value && typeof value === 'object') {
          removeNestedFields(value);
        }
      });
    };

    removeNestedFields(data);
  }

  // Apply sensitive data patterns to text fields
  private applySensitivePatterns(data: any): void {
    const applyToStrings = (obj: any): void => {
      if (!obj || typeof obj !== 'object') return;

      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'string') {
          let sanitized = value;
          this.sensitivePatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern.pattern, pattern.replacement);
          });
          obj[key] = sanitized;
        } else if (Array.isArray(value)) {
          value.forEach(item => applyToStrings(item));
        } else if (value && typeof value === 'object') {
          applyToStrings(value);
        }
      });
    };

    applyToStrings(data);
  }

  // Anonymize IP address
  anonymizeIP(ip: string): string {
    if (!ip) return '';
    
    // For IPv4, remove the last octet
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
      }
    }
    
    // For IPv6, remove the last 64 bits
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 4) {
        return parts.slice(0, 4).join(':') + '::';
      }
    }
    
    return ip;
  }

  // Anonymize user agent string
  anonymizeUserAgentString(userAgent: string): string {
    if (!userAgent) return '';
    
    // Extract browser and OS information, remove unique identifiers
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
    const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS) [\d._]+/);
    
    const browser = browserMatch ? browserMatch[0] : 'Unknown';
    const os = osMatch ? osMatch[0] : 'Unknown';
    
    return `${browser} on ${os}`;
  }

  // Get client IP (simplified - in production would use server-side detection)
  private getClientIP(): string {
    // This would typically come from server headers or a geolocation service
    return '127.0.0.1'; // Placeholder
  }

  // Get session ID
  private getSessionId(): string {
    try {
      let sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = this.generateId();
        sessionStorage.setItem('session_id', sessionId);
      }
      return sessionId;
    } catch {
      return this.generateId();
    }
  }

  // Generate unique ID
  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log audit event
  private logAuditEvent(event: string, data: any): void {
    if (!this.config.auditLogging) return;

    const auditRecord = {
      timestamp: new Date().toISOString(),
      event,
      data,
      sessionId: this.getSessionId(),
    };

    try {
      const auditLog = this.getAuditLog();
      auditLog.push(auditRecord);
      
      // Keep only last 1000 records
      if (auditLog.length > 1000) {
        auditLog.splice(0, auditLog.length - 1000);
      }
      
      localStorage.setItem(this.auditLogKey, JSON.stringify(auditLog));
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  // Get audit log
  private getAuditLog(): any[] {
    try {
      const log = localStorage.getItem(this.auditLogKey);
      return log ? JSON.parse(log) : [];
    } catch {
      return [];
    }
  }

  // Load consent records
  private loadConsentRecords(): void {
    try {
      const stored = localStorage.getItem('consent_records');
      if (stored) {
        this.consentRecords = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load consent records:', error);
    }
  }

  // Save consent records
  private saveConsentRecords(): void {
    try {
      localStorage.setItem('consent_records', JSON.stringify(this.consentRecords));
    } catch (error) {
      console.error('Failed to save consent records:', error);
    }
  }

  // Load audit log
  private loadAuditLog(): void {
    try {
      const stored = localStorage.getItem(this.auditLogKey);
      if (stored) {
        this.processingRecords = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load audit log:', error);
    }
  }

  // Check if data processing is allowed
  canProcessData(dataType: string): boolean {
    if (!this.hasConsent()) return false;

    const latestConsent = this.consentRecords
      .filter(record => !record.withdrawnAt)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (!latestConsent || !latestConsent.consent) return false;

    return latestConsent.dataTypes.includes(dataType);
  }

  // Record data processing activity
  recordDataProcessing(
    operation: DataProcessingRecord['operation'],
    dataType: string,
    purpose: string,
    legalBasis: string,
    dataSubject?: string
  ): DataProcessingRecord {
    const record: DataProcessingRecord = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      operation,
      dataType,
      purpose,
      legalBasis,
      dataSubject,
      processor: 'CurrentDao Analytics',
      safeguards: this.config.encryptionEnabled ? ['encryption', 'access_control'] : ['access_control'],
      retentionPeriod: this.config.dataRetentionDays,
    };

    this.processingRecords.push(record);
    this.logAuditEvent('data_processed', {
      recordId: record.id,
      operation,
      dataType,
      purpose,
    });

    return record;
  }

  // Handle data deletion request (GDPR Article 17)
  requestDeletion(userId?: string): boolean {
    if (!this.config.rightToDeletion) return false;

    this.logAuditEvent('deletion_requested', { userId });

    // In a real implementation, this would trigger actual data deletion
    // For now, we'll just log the request and clear local data
    try {
      // Clear local storage data related to the user
      if (userId) {
        this.consentRecords = this.consentRecords.filter(record => record.userId !== userId);
        this.processingRecords = this.processingRecords.filter(record => record.dataSubject !== userId);
        this.saveConsentRecords();
      } else {
        // Clear all data if no specific user
        this.consentRecords = [];
        this.processingRecords = [];
        localStorage.clear();
      }

      this.logAuditEvent('deletion_completed', { userId });
      return true;
    } catch (error) {
      console.error('Failed to process deletion request:', error);
      this.logAuditEvent('deletion_failed', { userId, error: error.message });
      return false;
    }
  }

  // Export user data (GDPR Article 20)
  exportUserData(userId?: string): any {
    const userConsentRecords = userId
      ? this.consentRecords.filter(record => record.userId === userId)
      : this.consentRecords;

    const userProcessingRecords = userId
      ? this.processingRecords.filter(record => record.dataSubject === userId)
      : this.processingRecords;

    return {
      consentRecords: userConsentRecords,
      processingRecords: userProcessingRecords,
      exportTimestamp: new Date().toISOString(),
      dataRetentionDays: this.config.dataRetentionDays,
    };
  }

  // Check data retention compliance
  checkRetentionCompliance(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.dataRetentionDays);

    const expiredConsent = this.consentRecords.filter(
      record => new Date(record.timestamp) < cutoffDate
    );

    const expiredProcessing = this.processingRecords.filter(
      record => new Date(record.timestamp) < cutoffDate
    );

    if (expiredConsent.length > 0 || expiredProcessing.length > 0) {
      this.logAuditEvent('retention_cleanup', {
        expiredConsent: expiredConsent.length,
        expiredProcessing: expiredProcessing.length,
      });

      // Remove expired records
      this.consentRecords = this.consentRecords.filter(
        record => new Date(record.timestamp) >= cutoffDate
      );
      this.processingRecords = this.processingRecords.filter(
        record => new Date(record.timestamp) >= cutoffDate
      );
      this.saveConsentRecords();
    }
  }

  // Generate privacy compliance report
  generateComplianceReport(): {
    complianceScore: number;
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    issues: string[];
    recommendations: string[];
    dataPoints: {
      totalConsentRecords: number;
      activeConsents: number;
      processingRecords: number;
      dataRetentionDays: number;
    };
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let complianceScore = 100;

    // Check GDPR compliance
    const gdprIssues = this.checkGDPRCompliance();
    issues.push(...gdprIssues.issues);
    recommendations.push(...gdprIssues.recommendations);
    complianceScore -= gdprIssues.penalty;

    // Check CCPA compliance
    const ccpaIssues = this.checkCCPACompliance();
    issues.push(...ccpaIssues.issues);
    recommendations.push(...ccpaIssues.recommendations);
    complianceScore -= ccpaIssues.penalty;

    // Check data retention
    this.checkRetentionCompliance();

    const activeConsents = this.consentRecords.filter(record => 
      record.consent && !record.withdrawnAt
    ).length;

    return {
      complianceScore: Math.max(0, complianceScore),
      gdprCompliant: gdprIssues.compliant,
      ccpaCompliant: ccpaIssues.compliant,
      issues,
      recommendations,
      dataPoints: {
        totalConsentRecords: this.consentRecords.length,
        activeConsents,
        processingRecords: this.processingRecords.length,
        dataRetentionDays: this.config.dataRetentionDays,
      },
    };
  }

  // Check GDPR compliance
  private checkGDPRCompliance(): {
    compliant: boolean;
    issues: string[];
    recommendations: string[];
    penalty: number;
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let penalty = 0;

    if (!this.config.gdprCompliant) {
      issues.push('GDPR compliance is not enabled');
      recommendations.push('Enable GDPR compliance in configuration');
      penalty += 30;
    }

    if (!this.config.cookieConsentRequired) {
      issues.push('Cookie consent is not required');
      recommendations.push('Enable cookie consent requirement');
      penalty += 20;
    }

    if (!this.config.rightToDeletion) {
      issues.push('Right to deletion is not supported');
      recommendations.push('Implement right to deletion functionality');
      penalty += 25;
    }

    if (this.config.dataRetentionDays > 365) {
      issues.push('Data retention period exceeds GDPR recommendations');
      recommendations.push('Reduce data retention period to 365 days or less');
      penalty += 15;
    }

    return {
      compliant: issues.length === 0,
      issues,
      recommendations,
      penalty,
    };
  }

  // Check CCPA compliance
  private checkCCPACompliance(): {
    compliant: boolean;
    issues: string[];
    recommendations: string[];
    penalty: number;
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let penalty = 0;

    if (!this.config.ccpaCompliant) {
      issues.push('CCPA compliance is not enabled');
      recommendations.push('Enable CCPA compliance in configuration');
      penalty += 30;
    }

    if (!this.config.doNotTrackRespect) {
      issues.push('Do Not Track preference is not respected');
      recommendations.push('Enable Do Not Track respect');
      penalty += 20;
    }

    if (!this.config.rightToDeletion) {
      issues.push('Right to deletion is not supported');
      recommendations.push('Implement right to deletion functionality');
      penalty += 25;
    }

    return {
      compliant: issues.length === 0,
      issues,
      recommendations,
      penalty,
    };
  }

  // Get current configuration
  getConfig(): PrivacyConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(newConfig: Partial<PrivacyConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logAuditEvent('config_updated', { newConfig });
  }
}

// Singleton instance
let privacyComplianceInstance: PrivacyComplianceManager | null = null;

export const getPrivacyComplianceManager = (config?: Partial<PrivacyConfig>): PrivacyComplianceManager => {
  if (!privacyComplianceInstance) {
    privacyComplianceInstance = new PrivacyComplianceManager(config);
  }
  return privacyComplianceInstance;
};

export { PrivacyComplianceManager, type PrivacyConfig, type ConsentRecord, type DataProcessingRecord };
