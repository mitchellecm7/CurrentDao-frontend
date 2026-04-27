export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  version: string;
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  requestType: 'access' | 'portability' | 'erasure' | 'rectification';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestDate: Date;
  completionDate?: Date;
  reason?: string;
}

export interface ConsentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: 'essential' | 'analytics' | 'marketing' | 'functional';
  retentionPeriod: number; // days
}

export class GDPRComplianceService {
  private static readonly CONSENT_TYPES: ConsentType[] = [
    {
      id: 'essential_cookies',
      name: 'Essential Cookies',
      description: 'Required for basic website functionality',
      required: true,
      category: 'essential',
      retentionPeriod: 0
    },
    {
      id: 'analytics_cookies',
      name: 'Analytics Cookies',
      description: 'Help us improve our services by tracking usage',
      required: false,
      category: 'analytics',
      retentionPeriod: 365
    },
    {
      id: 'marketing_cookies',
      name: 'Marketing Cookies',
      description: 'Used for personalized advertising and marketing',
      required: false,
      category: 'marketing',
      retentionPeriod: 180
    },
    {
      id: 'functional_cookies',
      name: 'Functional Cookies',
      description: 'Enable enhanced features and personalization',
      required: false,
      category: 'functional',
      retentionPeriod: 90
    },
    {
      id: 'data_processing',
      name: 'Data Processing',
      description: 'Processing of personal data for service delivery',
      required: true,
      category: 'essential',
      retentionPeriod: 0
    },
    {
      id: 'third_party_sharing',
      name: 'Third Party Sharing',
      description: 'Sharing data with trusted partners',
      required: false,
      category: 'marketing',
      retentionPeriod: 365
    }
  ];

  /**
   * Records user consent for GDPR compliance
   */
  static recordConsent(
    userId: string,
    consentTypeId: string,
    granted: boolean,
    ipAddress: string,
    userAgent: string
  ): ConsentRecord {
    const consentType = this.CONSENT_TYPES.find(ct => ct.id === consentTypeId);
    if (!consentType) {
      throw new Error(`Invalid consent type: ${consentTypeId}`);
    }

    return {
      id: crypto.randomUUID(),
      userId,
      consentType,
      granted,
      timestamp: new Date(),
      ipAddress,
      userAgent,
      version: '1.0'
    };
  }

  /**
   * Creates a data subject request (DSAR)
   */
  static createDataSubjectRequest(
    userId: string,
    requestType: DataSubjectRequest['requestType'],
    reason?: string
  ): DataSubjectRequest {
    return {
      id: crypto.randomUUID(),
      userId,
      requestType,
      status: 'pending',
      requestDate: new Date(),
      reason
    };
  }

  /**
   * Validates if consent is still valid based on retention period
   */
  static isConsentValid(consentRecord: ConsentRecord): boolean {
    if (consentRecord.consentType.required) {
      return consentRecord.granted;
    }

    const retentionPeriod = consentRecord.consentType.retentionPeriod;
    if (retentionPeriod === 0) {
      return consentRecord.granted;
    }

    const expiryDate = new Date(consentRecord.timestamp);
    expiryDate.setDate(expiryDate.getDate() + retentionPeriod);
    
    return consentRecord.granted && new Date() < expiryDate;
  }

  /**
   * Gets all consent types
   */
  static getConsentTypes(): ConsentType[] {
    return [...this.CONSENT_TYPES];
  }

  /**
   * Generates privacy policy disclosure text
   */
  static generatePrivacyPolicyDisclosure(): string {
    return `
CurrentDao Privacy Policy
==========================

Data Collection and Use
------------------------
We collect and process personal information to provide our energy trading and DAO governance services. 
This includes but is not limited to:
- Account information and authentication data
- Transaction records and wallet addresses
- Usage analytics and service interactions
- Communication preferences

Your Rights Under GDPR
----------------------
As a data subject, you have the right to:
- Access your personal data
- Request data portability
- Request erasure of your data ("right to be forgotten")
- Rectify inaccurate data
- Object to processing of your data
- Restrict processing of your data

Data Retention
--------------
We retain personal data only as long as necessary for the purposes for which it was collected, 
or as required by law. You can configure your preferred retention periods in your privacy settings.

International Data Transfers
----------------------------
Your data may be transferred to and processed in countries outside the EU. We ensure appropriate 
safeguards are in place to protect your data in accordance with GDPR requirements.

Contact Information
------------------
For privacy inquiries or to exercise your rights, contact our Data Protection Officer at:
privacy@currentdao.io

Last Updated: ${new Date().toISOString().split('T')[0]}
    `.trim();
  }

  /**
   * Validates GDPR compliance for data processing
   */
  static validateDataProcessing(
    userId: string,
    processingPurpose: string,
    userConsents: ConsentRecord[]
  ): { compliant: boolean; missingConsents: string[] } {
    const requiredConsents = this.CONSENT_TYPES.filter(ct => ct.required);
    const missingConsents: string[] = [];

    for (const consentType of requiredConsents) {
      const userConsent = userConsents.find(uc => uc.consentType.id === consentType.id);
      
      if (!userConsent || !userConsent.granted || !this.isConsentValid(userConsent)) {
        missingConsents.push(consentType.name);
      }
    }

    return {
      compliant: missingConsents.length === 0,
      missingConsents
    };
  }

  /**
   * Calculates data deletion deadline (30 days from request)
   */
  static getDeletionDeadline(requestDate: Date): Date {
    const deadline = new Date(requestDate);
    deadline.setDate(deadline.getDate() + 30);
    return deadline;
  }

  /**
   * Generates consent receipt for user records
   */
  static generateConsentReceipt(consentRecords: ConsentRecord[]): string {
    const grantedConsents = consentRecords.filter(cr => cr.granted);
    const deniedConsents = consentRecords.filter(cr => !cr.granted);

    return `
GDPR Consent Receipt
====================

User ID: ${consentRecords[0]?.userId || 'N/A'}
Generated: ${new Date().toISOString()}

Granted Consents (${grantedConsents.length}):
${grantedConsents.map(gc => `- ${gc.consentType.name}: ${gc.timestamp.toISOString()}`).join('\n')}

Denied Consents (${deniedConsents.length}):
${deniedConsents.map(dc => `- ${dc.consentType.name}: ${dc.timestamp.toISOString()}`).join('\n')}

This receipt serves as proof of your consent choices under GDPR Article 7(3).
    `.trim();
  }

  /**
   * Checks if data subject request is overdue
   */
  static isRequestOverdue(request: DataSubjectRequest): boolean {
    const deadline = this.getDeletionDeadline(request.requestDate);
    return new Date() > deadline && request.status !== 'completed';
  }
}
