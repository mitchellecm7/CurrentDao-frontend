import { 
  ExportableSettings, 
  EncryptedSettingsExport, 
  ImportSelection, 
  SettingsImportResult,
  migrateSettings 
} from '@/types/settings-export';
import { 
  AccountSettings, 
  TradingPreferences, 
  NotificationPreferences 
} from '@/types/profile';
import { SettingsEncryption } from './settings-encryption';

export class SettingsImporter {
  /**
   * Import settings from encrypted file
   */
  static async importSettings(
    file: File,
    password: string,
    selection: ImportSelection
  ): Promise<SettingsImportResult> {
    try {
      // Validate password
      const passwordValidation = SettingsEncryption.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: `Password validation failed: ${passwordValidation.errors.join(', ')}`
        };
      }

      // Read and parse file
      const fileContent = await this.readFileContent(file);
      let encryptedExport: EncryptedSettingsExport;

      try {
        encryptedExport = JSON.parse(fileContent);
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid file format. Please ensure you are uploading a valid settings export file.'
        };
      }

      // Validate encrypted export structure
      const validation = this.validateEncryptedExport(encryptedExport);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid export file: ${validation.errors.join(', ')}`
        };
      }

      // Decrypt settings
      let decryptedSettings: ExportableSettings;
      try {
        decryptedSettings = await SettingsEncryption.decrypt(encryptedExport, password);
      } catch (decryptError) {
        return {
          success: false,
          error: 'Failed to decrypt settings. Please check your password and try again.'
        };
      }

      // Validate decrypted settings
      const settingsValidation = this.validateDecryptedSettings(decryptedSettings);
      if (!settingsValidation.isValid) {
        return {
          success: false,
          error: `Invalid settings data: ${settingsValidation.errors.join(', ')}`
        };
      }

      // Migrate settings if needed
      const migratedSettings = migrateSettings(decryptedSettings);

      // Apply selective import
      const importResult = this.applySelectiveImport(migratedSettings, selection);

      return {
        success: true,
        importedSections: importResult.importedSections
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during import'
      };
    }
  }

  /**
   * Read file content as text
   */
  private static async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsText(file);
    });
  }

  /**
   * Validate encrypted export structure
   */
  private static validateEncryptedExport(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.version) {
      errors.push('Missing version information');
    }

    if (!data.encryptedData) {
      errors.push('Missing encrypted data');
    }

    if (!data.salt) {
      errors.push('Missing encryption salt');
    }

    if (!data.timestamp) {
      errors.push('Missing timestamp');
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
   * Validate decrypted settings structure
   */
  private static validateDecryptedSettings(settings: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!settings.version) {
      errors.push('Missing version in decrypted settings');
    }

    if (!settings.timestamp) {
      errors.push('Missing timestamp in decrypted settings');
    }

    // Validate account settings if present
    if (settings.accountSettings) {
      const accountValidation = this.validateAccountSettings(settings.accountSettings);
      if (!accountValidation.isValid) {
        errors.push(...accountValidation.errors.map(err => `Account settings: ${err}`));
      }
    }

    // Validate trading preferences if present
    if (settings.tradingPreferences) {
      const tradingValidation = this.validateTradingPreferences(settings.tradingPreferences);
      if (!tradingValidation.isValid) {
        errors.push(...tradingValidation.errors.map(err => `Trading preferences: ${err}`));
      }
    }

    // Validate notification preferences if present
    if (settings.notificationPreferences) {
      const notificationValidation = this.validateNotificationPreferences(settings.notificationPreferences);
      if (!notificationValidation.isValid) {
        errors.push(...notificationValidation.errors.map(err => `Notification preferences: ${err}`));
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate account settings structure
   */
  private static validateAccountSettings(settings: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof settings.name !== 'string' || !settings.name.trim()) {
      errors.push('Name is required');
    }

    if (typeof settings.username !== 'string' || !settings.username.trim()) {
      errors.push('Username is required');
    }

    if (settings.timezone && typeof settings.timezone !== 'string') {
      errors.push('Invalid timezone format');
    }

    if (settings.language && typeof settings.language !== 'string') {
      errors.push('Invalid language format');
    }

    if (settings.currency && typeof settings.currency !== 'string') {
      errors.push('Invalid currency format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate trading preferences structure
   */
  private static validateTradingPreferences(preferences: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (preferences.defaultEnergyType && !['solar', 'wind', 'hydro', 'geothermal', 'biomass'].includes(preferences.defaultEnergyType)) {
      errors.push('Invalid default energy type');
    }

    if (preferences.locationRadius !== undefined && (typeof preferences.locationRadius !== 'number' || preferences.locationRadius < 0)) {
      errors.push('Location radius must be a positive number');
    }

    if (preferences.autoAcceptTrades !== undefined && typeof preferences.autoAcceptTrades !== 'boolean') {
      errors.push('Auto accept trades must be a boolean');
    }

    if (preferences.minimumRating !== undefined && (typeof preferences.minimumRating !== 'number' || preferences.minimumRating < 0 || preferences.minimumRating > 5)) {
      errors.push('Minimum rating must be between 0 and 5');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate notification preferences structure
   */
  private static validateNotificationPreferences(preferences: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const channels = ['email', 'push', 'inApp'];
    const notificationTypes = ['enabled', 'trades', 'messages', 'proposals', 'payments', 'security'];

    for (const channel of channels) {
      if (preferences[channel]) {
        for (const type of notificationTypes) {
          if (preferences[channel][type] !== undefined && typeof preferences[channel][type] !== 'boolean') {
            errors.push(`${channel} ${type} must be a boolean`);
          }
        }

        // Additional validation for email channel
        if (channel === 'email' && preferences[channel].marketing !== undefined && typeof preferences[channel].marketing !== 'boolean') {
          errors.push(`${channel} marketing must be a boolean`);
        }

        // Additional validation for inApp channel
        if (channel === 'inApp' && preferences[channel].system !== undefined && typeof preferences[channel].system !== 'boolean') {
          errors.push(`${channel} system must be a boolean`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Apply selective import based on user selection
   */
  private static applySelectiveImport(
    settings: ExportableSettings,
    selection: ImportSelection
  ): { importedSections: string[]; accountSettings?: Partial<AccountSettings>; tradingPreferences?: Partial<TradingPreferences>; notificationPreferences?: Partial<NotificationPreferences> } {
    const importedSections: string[] = [];
    const result: any = {};

    if (selection.accountSettings && settings.accountSettings) {
      result.accountSettings = settings.accountSettings;
      importedSections.push('accountSettings');
    }

    if (selection.tradingPreferences && settings.tradingPreferences) {
      result.tradingPreferences = settings.tradingPreferences;
      importedSections.push('tradingPreferences');
    }

    if (selection.notificationPreferences && settings.notificationPreferences) {
      result.notificationPreferences = settings.notificationPreferences;
      importedSections.push('notificationPreferences');
    }

    return {
      importedSections,
      ...result
    };
  }

  /**
   * Preview import settings without applying them
   */
  static async previewImport(
    file: File,
    password: string
  ): Promise<{ success: boolean; error?: string; preview?: ExportableSettings }> {
    try {
      // Read and parse file
      const fileContent = await this.readFileContent(file);
      let encryptedExport: EncryptedSettingsExport;

      try {
        encryptedExport = JSON.parse(fileContent);
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid file format. Please ensure you are uploading a valid settings export file.'
        };
      }

      // Decrypt settings
      let decryptedSettings: ExportableSettings;
      try {
        decryptedSettings = await SettingsEncryption.decrypt(encryptedExport, password);
      } catch (decryptError) {
        return {
          success: false,
          error: 'Failed to decrypt settings. Please check your password and try again.'
        };
      }

      // Migrate settings if needed
      const migratedSettings = migrateSettings(decryptedSettings);

      return {
        success: true,
        preview: migratedSettings
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during preview'
      };
    }
  }

  /**
   * Get file information
   */
  static getFileInfo(file: File): { name: string; size: string; type: string; lastModified: string } {
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return {
      name: file.name,
      size: formatBytes(file.size),
      type: file.type || 'Unknown',
      lastModified: new Date(file.lastModified).toLocaleString()
    };
  }
}
