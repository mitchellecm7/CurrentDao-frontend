'use client';

import { useState } from 'react';
import { Shield, Download, Trash2, Settings, Eye, EyeOff, Lock, Unlock, FileText, AlertTriangle } from 'lucide-react';
import { usePrivacyControls } from '../../hooks/usePrivacyControls';
import { ConsentManager } from './ConsentManager';
import { DataExport } from './DataExport';
import { CookieManager } from './CookieManager';

interface PrivacyPanelProps {
  userId: string;
}

export function PrivacyPanel({ userId }: PrivacyPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'consent' | 'data' | 'cookies'>('overview');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const {
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
  } = usePrivacyControls(userId);

  const dataSummary = getDataSummary();

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Shield },
    { id: 'consent' as const, label: 'Consent', icon: FileText },
    { id: 'data' as const, label: 'Data Control', icon: Settings },
    { id: 'cookies' as const, label: 'Cookies', icon: Eye }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading privacy settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Privacy & Data Protection</h1>
                <p className="text-gray-600">Manage your privacy settings and data preferences</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasRequiredConsents() ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">GDPR Compliant</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Action Required</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Privacy Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-blue-900">Data Protection</h3>
                    {settings.encryptionEnabled ? (
                      <Lock className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Unlock className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-blue-700 text-sm">
                    {settings.encryptionEnabled ? 'Encryption enabled' : 'Encryption disabled'}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-900">Data Size</h3>
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-green-700 text-sm">{dataSummary.totalSize} stored</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-purple-900">Consent Status</h3>
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-purple-700 text-sm">
                    {consentRecords.filter(cr => cr.granted).length} of {consentRecords.length} granted
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('data')}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Export Your Data</p>
                      <p className="text-sm text-gray-600">Download all your personal data</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('consent')}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Manage Consent</p>
                      <p className="text-sm text-gray-600">Update your privacy preferences</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('cookies')}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <Eye className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Cookie Settings</p>
                      <p className="text-sm text-gray-600">Control tracking and cookies</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Advanced Settings</p>
                      <p className="text-sm text-gray-600">Data retention and encryption</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Advanced Settings */}
              {showAdvanced && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">End-to-End Encryption</p>
                        <p className="text-sm text-gray-600">Encrypt all sensitive data</p>
                      </div>
                      <button
                        onClick={() => toggleEncryption(!settings.encryptionEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.encryptionEnabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.encryptionEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Reset All Settings</p>
                        <p className="text-sm text-gray-600">Restore default privacy settings</p>
                      </div>
                      <button
                        onClick={resetSettings}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-900">Delete Account</p>
                      <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                    </div>
                    <button
                      onClick={deleteAccount}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consent' && (
            <ConsentManager
              consentRecords={consentRecords}
              onUpdateConsent={updateConsent}
              isConsentValid={isConsentValid}
            />
          )}

          {activeTab === 'data' && (
            <DataExport
              onExportData={exportData}
              dataSummary={dataSummary}
              onUpdateDataRetention={updateDataRetention}
              retentionSettings={settings.dataRetention}
            />
          )}

          {activeTab === 'cookies' && (
            <CookieManager
              preferences={settings.cookiePreferences}
              onUpdatePreferences={updateCookiePreferences}
              dataSharing={settings.dataSharing}
              onUpdateDataSharing={updateDataSharing}
            />
          )}
        </div>
      </div>
    </div>
  );
}
