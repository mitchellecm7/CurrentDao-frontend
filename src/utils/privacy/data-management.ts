import { EncryptionService } from '../../services/privacy/encryption';

export interface UserData {
  id: string;
  email?: string;
  profile: {
    name?: string;
    avatar?: string;
    preferences: Record<string, any>;
  };
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  activity: Array<{
    type: string;
    timestamp: Date;
    details: Record<string, any>;
  }>;
  privacySettings: {
    dataRetention: {
      profile: number; // days
      transactions: number; // days
      activity: number; // days
    };
    consent: Record<string, boolean>;
    encryptionKey?: string;
  };
}

export interface ExportFormat {
  format: 'json' | 'csv' | 'pdf';
  filename: string;
  content: string | ArrayBuffer;
}

export class DataManagementUtils {
  /**
   * Exports user data in specified format
   */
  static async exportUserData(
    userData: UserData,
    format: 'json' | 'csv' | 'pdf',
    includeSensitive: boolean = false
  ): Promise<ExportFormat> {
    const sanitizedData = includeSensitive ? userData : this.sanitizeUserData(userData);
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (format) {
      case 'json':
        return {
          format: 'json',
          filename: `currentdao-data-export-${timestamp}.json`,
          content: JSON.stringify(sanitizedData, null, 2)
        };
      
      case 'csv':
        return {
          format: 'csv',
          filename: `currentdao-data-export-${timestamp}.csv`,
          content: this.convertToCSV(sanitizedData)
        };
      
      case 'pdf':
        return {
          format: 'pdf',
          filename: `currentdao-data-export-${timestamp}.pdf`,
          content: await this.convertToPDF(sanitizedData)
        };
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Sanitizes user data by removing sensitive information
   */
  static sanitizeUserData(userData: UserData): UserData {
    return {
      ...userData,
      email: userData.email ? this.maskEmail(userData.email) : undefined,
      profile: {
        ...userData.profile,
        preferences: EncryptionService.sanitizeData(userData.profile.preferences)
      },
      transactions: userData.transactions.map(tx => ({
        ...tx,
        metadata: tx.metadata ? EncryptionService.sanitizeData(tx.metadata) : undefined
      })),
      activity: userData.activity.map(activity => ({
        ...activity,
        details: EncryptionService.sanitizeData(activity.details)
      })),
      privacySettings: {
        ...userData.privacySettings,
        encryptionKey: undefined
      }
    };
  }

  /**
   * Masks email addresses for privacy
   */
  private static maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
      return `${username[0]}***@${domain}`;
    }
    return `${username.substring(0, 2)}***@${domain}`;
  }

  /**
   * Converts user data to CSV format
   */
  private static convertToCSV(userData: UserData): string {
    const headers = ['Section', 'Field', 'Value', 'Timestamp'];
    const rows: string[][] = [headers];

    // Profile data
    if (userData.profile.name) {
      rows.push(['Profile', 'Name', userData.profile.name, '']);
    }
    if (userData.email) {
      rows.push(['Profile', 'Email', userData.email, '']);
    }

    // Transactions
    userData.transactions.forEach(tx => {
      rows.push([
        'Transaction',
        tx.type,
        tx.amount.toString(),
        tx.timestamp.toISOString()
      ]);
    });

    // Activity
    userData.activity.forEach(activity => {
      rows.push([
        'Activity',
        activity.type,
        JSON.stringify(activity.details),
        activity.timestamp.toISOString()
      ]);
    });

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  /**
   * Converts user data to PDF format (simplified implementation)
   */
  private static async convertToPDF(userData: UserData): Promise<ArrayBuffer> {
    // In a real implementation, you would use a library like jsPDF
    // For now, we'll return a simple text-based representation
    const textContent = `
CurrentDao User Data Export
============================

Generated: ${new Date().toISOString()}
User ID: ${userData.id}

Profile Information:
-------------------
Name: ${userData.profile.name || 'N/A'}
Email: ${userData.email || 'N/A'}

Transactions (${userData.transactions.length}):
${userData.transactions.map(tx => 
  `- ${tx.type}: ${tx.amount} (${tx.timestamp.toISOString()})`
).join('\n')}

Activity Log (${userData.activity.length}):
${userData.activity.map(activity => 
  `- ${activity.type}: ${activity.timestamp.toISOString()}`
).join('\n')}

Privacy Settings:
----------------
Data Retention:
- Profile: ${userData.privacySettings.dataRetention.profile} days
- Transactions: ${userData.privacySettings.dataRetention.transactions} days
- Activity: ${userData.privacySettings.dataRetention.activity} days

Consent Settings:
${Object.keys(userData.privacySettings.consent).map(key => 
  `- ${key}: ${userData.privacySettings.consent[key] ? 'Granted' : 'Denied'}`
).join('\n')}
    `.trim();

    return new TextEncoder().encode(textContent).buffer;
  }

  /**
   * Deletes user data according to retention policies
   */
  static applyRetentionPolicy(userData: UserData): UserData {
    const now = new Date();
    const retention = userData.privacySettings.dataRetention;

    return {
      ...userData,
      transactions: userData.transactions.filter(tx => {
        const ageInDays = (now.getTime() - tx.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return ageInDays <= retention.transactions;
      }),
      activity: userData.activity.filter(activity => {
        const ageInDays = (now.getTime() - activity.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return ageInDays <= retention.activity;
      })
    };
  }

  /**
   * Completely anonymizes user data for deletion
   */
  static anonymizeUserData(userData: UserData): UserData {
    return {
      id: crypto.randomUUID(),
      profile: {
        name: 'Anonymous User',
        preferences: {}
      },
      transactions: userData.transactions.map(tx => ({
        ...tx,
        metadata: undefined
      })),
      activity: userData.activity.map(activity => ({
        ...activity,
        details: {}
      })),
      privacySettings: {
        dataRetention: {
          profile: 0,
          transactions: 0,
          activity: 0
        },
        consent: {}
      }
    };
  }

  /**
   * Validates data integrity
   */
  static validateDataIntegrity(userData: UserData): boolean {
    try {
      // Check required fields
      if (!userData.id || typeof userData.id !== 'string') return false;
      if (!userData.profile || typeof userData.profile !== 'object') return false;
      if (!Array.isArray(userData.transactions)) return false;
      if (!Array.isArray(userData.activity)) return false;
      if (!userData.privacySettings || typeof userData.privacySettings !== 'object') return false;

      // Validate transaction structure
      for (const tx of userData.transactions) {
        if (!tx.id || !tx.type || typeof tx.amount !== 'number' || !(tx.timestamp instanceof Date)) {
          return false;
        }
      }

      // Validate activity structure
      for (const activity of userData.activity) {
        if (!activity.type || !(activity.timestamp instanceof Date) || typeof activity.details !== 'object') {
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculates data storage size
   */
  static calculateDataSize(userData: UserData): number {
    const jsonString = JSON.stringify(userData);
    return new Blob([jsonString]).size;
  }

  /**
   * Generates data summary for user review
   */
  static generateDataSummary(userData: UserData): {
    totalSize: string;
    transactionCount: number;
    activityCount: number;
    dataAgeRange: { oldest: Date; newest: Date };
  } {
    const allDates = [
      ...userData.transactions.map(tx => tx.timestamp),
      ...userData.activity.map(a => a.timestamp)
    ];

    const oldestDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date();
    const newestDate = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date();

    return {
      totalSize: this.formatBytes(this.calculateDataSize(userData)),
      transactionCount: userData.transactions.length,
      activityCount: userData.activity.length,
      dataAgeRange: {
        oldest: oldestDate,
        newest: newestDate
      }
    };
  }

  /**
   * Formats bytes to human-readable format
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
