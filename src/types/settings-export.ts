// Settings Export/Import Types

export interface ExportableSettings {
  version: string;
  timestamp: string;
  accountSettings: {
    name: string;
    username: string;
    bio?: string;
    location?: string;
    website?: string;
    timezone: string;
    language: string;
    currency: string;
  };
  tradingPreferences: {
    defaultEnergyType: 'solar' | 'wind' | 'hydro' | 'geothermal' | 'biomass';
    locationRadius: number;
    autoAcceptTrades: boolean;
    minimumRating: number;
    priceAlerts: boolean;
    tradeNotifications: boolean;
    preferredPaymentMethod: 'stellar' | 'crypto' | 'fiat';
    maxTradeAmount: string;
    minTradeAmount: string;
  };
  notificationPreferences: {
    email: {
      enabled: boolean;
      trades: boolean;
      messages: boolean;
      proposals: boolean;
      payments: boolean;
      security: boolean;
      marketing: boolean;
    };
    push: {
      enabled: boolean;
      trades: boolean;
      messages: boolean;
      proposals: boolean;
      payments: boolean;
      security: boolean;
    };
    inApp: {
      enabled: boolean;
      trades: boolean;
      messages: boolean;
      proposals: boolean;
      payments: boolean;
      security: boolean;
      system: boolean;
    };
  };
  // Note: Security settings (API keys, sessions, 2FA) are excluded for security
}

export interface EncryptedSettingsExport {
  version: string;
  encryptedData: string;
  iv: string; // Initialization vector for encryption
  salt: string; // Salt for key derivation
  timestamp: string;
}

export interface ImportSelection {
  accountSettings: boolean;
  tradingPreferences: boolean;
  notificationPreferences: boolean;
}

export interface SettingsImportResult {
  success: boolean;
  error?: string;
  validationErrors?: string[];
  importedSections?: string[];
}

export interface ExportSettingsOptions {
  password: string;
  includeAccountSettings?: boolean;
  includeTradingPreferences?: boolean;
  includeNotificationPreferences?: boolean;
}

export const CURRENT_SETTINGS_VERSION = '1.0.0';

// Migration functions for backward compatibility
export interface SettingsMigration {
  version: string;
  migrate: (data: any) => ExportableSettings;
}

export const SETTINGS_MIGRATIONS: SettingsMigration[] = [
  {
    version: '1.0.0',
    migrate: (data: any): ExportableSettings => {
      // Current version - no migration needed
      return data;
    }
  }
  // Future migrations will be added here
];

export function migrateSettings(data: any, targetVersion: string = CURRENT_SETTINGS_VERSION): ExportableSettings {
  let currentData = data;
  
  // Apply migrations in order
  for (const migration of SETTINGS_MIGRATIONS) {
    if (currentData.version === migration.version) {
      currentData = migration.migrate(currentData);
    }
  }
  
  return currentData;
}
