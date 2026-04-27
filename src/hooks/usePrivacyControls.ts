'use client';

import { useState, useEffect, useCallback } from 'react';
import { GDPRComplianceService, ConsentRecord, ConsentType } from '../services/privacy/gdpr-compliance';
import { EncryptionService } from '../services/privacy/encryption';
import { DataManagementUtils, UserData } from '../utils/privacy/data-management';

export interface PrivacySettings {
  dataRetention: {
    profile: number;
    transactions: number;
    activity: number;
  };
  consent: Record<string, boolean>;
  encryptionEnabled: boolean;
  cookiePreferences: Record<string, boolean>;
  dataSharing: {
    analytics: boolean;
    marketing: boolean;
    thirdParty: boolean;
  };
}

export interface UsePrivacyControlsReturn {
  settings: PrivacySettings;
  consentRecords: ConsentRecord[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateConsent: (consentTypeId: string, granted: boolean) => Promise<void>;
  updateDataRetention: (category: keyof PrivacySettings['dataRetention'], days: number) => void;
  toggleEncryption: (enabled: boolean) => void;
  updateCookiePreferences: (preferences: Record<string, boolean>) => void;
  updateDataSharing: (category: keyof PrivacySettings['dataSharing'], enabled: boolean) => void;
  exportData: (format: 'json' | 'csv' | 'pdf', includeSensitive?: boolean) => Promise<void>;
  deleteAccount: () => Promise<void>;
  resetSettings: () => void;
  
  // Utilities
  isConsentValid: (consentTypeId: string) => boolean;
  hasRequiredConsents: () => boolean;
  getDataSummary: () => any;
  generateConsentReceipt: () => string;
}

const DEFAULT_SETTINGS: PrivacySettings = {
  dataRetention: {
    profile: 365,
    transactions: 730,
    activity: 90
  },
  consent: {},
  encryptionEnabled: true,
  cookiePreferences: {
    essential: true,
    analytics: false,
    marketing: false,
    functional: false
  },
  dataSharing: {
    analytics: false,
    marketing: false,
    thirdParty: false
  }
};

export function usePrivacyControls(userId: string): UsePrivacyControlsReturn {
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_SETTINGS);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load privacy settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(`privacy-settings-${userId}`);
      const savedConsents = localStorage.getItem(`consent-records-${userId}`);
      
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      
      if (savedConsents) {
        setConsentRecords(JSON.parse(savedConsents));
      }
    } catch (err) {
      setError('Failed to load privacy settings');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: PrivacySettings) => {
    try {
      localStorage.setItem(`privacy-settings-${userId}`, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (err) {
      setError('Failed to save privacy settings');
    }
  }, [userId]);

  // Save consent records
  const saveConsentRecords = useCallback((records: ConsentRecord[]) => {
    try {
      localStorage.setItem(`consent-records-${userId}`, JSON.stringify(records));
      setConsentRecords(records);
    } catch (err) {
      setError('Failed to save consent records');
    }
  }, [userId]);

  // Update consent
  const updateConsent = useCallback(async (consentTypeId: string, granted: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const consentRecord = GDPRComplianceService.recordConsent(
        userId,
        consentTypeId,
        granted,
        '127.0.0.1', // In production, get actual IP
        navigator.userAgent
      );
      
      const newRecords = consentRecords.filter(cr => cr.consentType.id !== consentTypeId);
      newRecords.push(consentRecord);
      
      saveConsentRecords(newRecords);
      
      // Update consent settings
      const newSettings = {
        ...settings,
        consent: {
          ...settings.consent,
          [consentTypeId]: granted
        }
      };
      
      saveSettings(newSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update consent');
    } finally {
      setIsLoading(false);
    }
  }, [userId, consentRecords, settings, saveConsentRecords, saveSettings]);

  // Update data retention
  const updateDataRetention = useCallback((category: keyof PrivacySettings['dataRetention'], days: number) => {
    const newSettings = {
      ...settings,
      dataRetention: {
        ...settings.dataRetention,
        [category]: days
      }
    };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Toggle encryption
  const toggleEncryption = useCallback((enabled: boolean) => {
    const newSettings = {
      ...settings,
      encryptionEnabled: enabled
    };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Update cookie preferences
  const updateCookiePreferences = useCallback((preferences: Record<string, boolean>) => {
    const newSettings = {
      ...settings,
      cookiePreferences: {
        ...settings.cookiePreferences,
        ...preferences
      }
    };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Update data sharing preferences
  const updateDataSharing = useCallback((category: keyof PrivacySettings['dataSharing'], enabled: boolean) => {
    const newSettings = {
      ...settings,
      dataSharing: {
        ...settings.dataSharing,
        [category]: enabled
      }
    };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Export data
  const exportData = useCallback(async (format: 'json' | 'csv' | 'pdf', includeSensitive: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock user data - in production, fetch from API
      const userData: UserData = {
        id: userId,
        email: 'user@example.com',
        profile: {
          name: 'John Doe',
          preferences: settings
        },
        transactions: [],
        activity: [],
        privacySettings: settings
      };
      
      const exportResult = await DataManagementUtils.exportUserData(userData, format, includeSensitive);
      
      // Download the file
      const blob = new Blob([exportResult.content], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportResult.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setIsLoading(false);
    }
  }, [userId, settings]);

  // Delete account (right to be forgotten)
  const deleteAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create deletion request
      const deletionRequest = GDPRComplianceService.createDataSubjectRequest(
        userId,
        'erasure',
        'User requested account deletion'
      );
      
      // In production, send to backend
      console.log('Deletion request created:', deletionRequest);
      
      // Clear local data
      localStorage.removeItem(`privacy-settings-${userId}`);
      localStorage.removeItem(`consent-records-${userId}`);
      
      // Redirect to home or login page
      window.location.href = '/';
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
    setConsentRecords([]);
  }, [saveSettings]);

  // Check if consent is valid
  const isConsentValid = useCallback((consentTypeId: string): boolean => {
    const consent = consentRecords.find(cr => cr.consentType.id === consentTypeId);
    return consent ? GDPRComplianceService.isConsentValid(consent) : false;
  }, [consentRecords]);

  // Check if user has granted all required consents
  const hasRequiredConsents = useCallback((): boolean => {
    const requiredConsents = GDPRComplianceService.getConsentTypes()
      .filter(ct => ct.required)
      .map(ct => ct.id);
    
    return requiredConsents.every(consentId => {
      const consent = consentRecords.find(cr => cr.consentType.id === consentId);
      return consent && consent.granted && GDPRComplianceService.isConsentValid(consent);
    });
  }, [consentRecords]);

  // Get data summary
  const getDataSummary = useCallback(() => {
    // Mock data summary - in production, fetch from API
    return {
      totalSize: '2.5 MB',
      recordCount: 156,
      lastUpdated: new Date().toISOString()
    };
  }, []);

  // Generate consent receipt
  const generateConsentReceipt = useCallback((): string => {
    return GDPRComplianceService.generateConsentReceipt(consentRecords);
  }, [consentRecords]);

  return {
    settings,
    consentRecords,
    isLoading,
    error,
    updateConsent,
    updateDataRetention,
    toggleEncryption,
    updateCookiePreferences,
    updateDataSharing,
    exportData,
    deleteAccount,
    resetSettings,
    isConsentValid,
    hasRequiredConsents,
    getDataSummary,
    generateConsentReceipt
  };
}
