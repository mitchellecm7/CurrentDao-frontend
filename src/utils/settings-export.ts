import { 
  ExportableSettings, 
  ExportSettingsOptions, 
  CURRENT_SETTINGS_VERSION,
  migrateSettings 
} from '@/types/settings-export';
import { 
  AccountSettings, 
  TradingPreferences, 
  NotificationPreferences 
} from '@/types/profile';
import { SettingsEncryption } from './settings-encryption';

export class SettingsExporter {
  /**
   * Create exportable settings from current settings
   */
  private static createExportableSettings(
    accountSettings: AccountSettings,
    tradingPreferences: TradingPreferences,
    notificationPreferences: NotificationPreferences,
    options: ExportSettingsOptions
  ): ExportableSettings {
    const exportable: ExportableSettings = {
      version: CURRENT_SETTINGS_VERSION,
      timestamp: new Date().toISOString(),
      accountSettings: {
        name: accountSettings.name,
        username: accountSettings.username,
        bio: accountSettings.bio,
        location: accountSettings.location,
        website: accountSettings.website,
        timezone: accountSettings.timezone,
        language: accountSettings.language,
        currency: accountSettings.currency
      },
      tradingPreferences: {
        defaultEnergyType: tradingPreferences.defaultEnergyType,
        locationRadius: tradingPreferences.locationRadius,
        autoAcceptTrades: tradingPreferences.autoAcceptTrades,
        minimumRating: tradingPreferences.minimumRating,
        priceAlerts: tradingPreferences.priceAlerts,
        tradeNotifications: tradingPreferences.tradeNotifications,
        preferredPaymentMethod: tradingPreferences.preferredPaymentMethod,
        maxTradeAmount: tradingPreferences.maxTradeAmount,
        minTradeAmount: tradingPreferences.minTradeAmount
      },
      notificationPreferences: {
        email: {
          enabled: notificationPreferences.email.enabled,
          trades: notificationPreferences.email.trades,
          messages: notificationPreferences.email.messages,
          proposals: notificationPreferences.email.proposals,
          payments: notificationPreferences.email.payments,
          security: notificationPreferences.email.security,
          marketing: notificationPreferences.email.marketing
        },
        push: {
          enabled: notificationPreferences.push.enabled,
          trades: notificationPreferences.push.trades,
          messages: notificationPreferences.push.messages,
          proposals: notificationPreferences.push.proposals,
          payments: notificationPreferences.push.payments,
          security: notificationPreferences.push.security
        },
        inApp: {
          enabled: notificationPreferences.inApp.enabled,
          trades: notificationPreferences.inApp.trades,
          messages: notificationPreferences.inApp.messages,
          proposals: notificationPreferences.inApp.proposals,
          payments: notificationPreferences.inApp.payments,
          security: notificationPreferences.inApp.security,
          system: notificationPreferences.inApp.system
        }
      }
    };

    // Remove sections based on options
    if (!options.includeAccountSettings) {
      delete exportable.accountSettings;
    }
    if (!options.includeTradingPreferences) {
      delete exportable.tradingPreferences;
    }
    if (!options.includeNotificationPreferences) {
      delete exportable.notificationPreferences;
    }

    return exportable;
  }

  /**
   * Export settings to encrypted file
   */
  static async exportSettings(
    accountSettings: AccountSettings,
    tradingPreferences: TradingPreferences,
    notificationPreferences: NotificationPreferences,
    options: ExportSettingsOptions
  ): Promise<{ success: boolean; error?: string; filename?: string }> {
    try {
      // Validate password
      const passwordValidation = SettingsEncryption.validatePasswordStrength(options.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: `Password validation failed: ${passwordValidation.errors.join(', ')}`
        };
      }

      // Create exportable settings
      const exportableSettings = this.createExportableSettings(
        accountSettings,
        tradingPreferences,
        notificationPreferences,
        options
      );

      // Encrypt the settings
      const encryptedExport = await SettingsEncryption.encrypt(exportableSettings, options.password);

      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `currentdao-settings-${timestamp}.json`;

      // Download the file
      this.downloadFile(encryptedExport, filename);

      return {
        success: true,
        filename
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during export'
      };
    }
  }

  /**
   * Download encrypted settings as JSON file
   */
  private static downloadFile(data: any, filename: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Validate exported settings data
   */
  static validateExportedSettings(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!data.version) {
      errors.push('Missing version information');
    }

    if (!data.timestamp) {
      errors.push('Missing timestamp');
    }

    if (!data.encryptedData) {
      errors.push('Missing encrypted data');
    }

    if (!data.salt) {
      errors.push('Missing encryption salt');
    }

    // Validate version format
    if (data.version && !/^\d+\.\d+\.\d+$/.test(data.version)) {
      errors.push('Invalid version format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get export summary before encryption
   */
  static getExportSummary(
    accountSettings: AccountSettings,
    tradingPreferences: TradingPreferences,
    notificationPreferences: NotificationPreferences,
    options: ExportSettingsOptions
  ): {
    totalSections: number;
    includedSections: string[];
    excludedSections: string[];
    itemCount: { [key: string]: number };
  } {
    const sections = {
      accountSettings: options.includeAccountSettings !== false,
      tradingPreferences: options.includeTradingPreferences !== false,
      notificationPreferences: options.includeNotificationPreferences !== false
    };

    const includedSections = Object.entries(sections)
      .filter(([_, included]) => included)
      .map(([section]) => section);

    const excludedSections = Object.entries(sections)
      .filter(([_, included]) => !included)
      .map(([section]) => section);

    const itemCount: { [key: string]: number } = {};

    if (sections.accountSettings) {
      itemCount.accountSettings = Object.keys(accountSettings).length;
    }

    if (sections.tradingPreferences) {
      itemCount.tradingPreferences = Object.keys(tradingPreferences).length;
    }

    if (sections.notificationPreferences) {
      let notificationCount = 0;
      notificationCount += Object.keys(notificationPreferences.email).length;
      notificationCount += Object.keys(notificationPreferences.push).length;
      notificationCount += Object.keys(notificationPreferences.inApp).length;
      itemCount.notificationPreferences = notificationCount;
    }

    return {
      totalSections: includedSections.length,
      includedSections,
      excludedSections,
      itemCount
    };
  }
}
