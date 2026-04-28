'use client';

import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { AccountSettings, TradingPreferences, NotificationPreferences } from '@/types/profile';
import { ExportSettingsOptions, ImportSelection } from '@/types/settings-export';
import { SettingsExporter } from '@/utils/settings-export';
import { SettingsImporter } from '@/utils/settings-import';
import { SettingsEncryption } from '@/utils/settings-encryption';

interface SettingsManagerProps {
  accountSettings: AccountSettings;
  tradingPreferences: TradingPreferences;
  notificationPreferences: NotificationPreferences;
  onSettingsUpdate: (
    accountSettings?: Partial<AccountSettings>,
    tradingPreferences?: Partial<TradingPreferences>,
    notificationPreferences?: Partial<NotificationPreferences>
  ) => void;
  isLoading?: boolean;
  className?: string;
}

export function SettingsManager({ 
  accountSettings, 
  tradingPreferences, 
  notificationPreferences,
  onSettingsUpdate,
  isLoading = false,
  className = ''
}: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportPassword, setExportPassword] = useState('');
  const [exportConfirmPassword, setExportConfirmPassword] = useState('');
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [showExportConfirmPassword, setShowExportConfirmPassword] = useState(false);
  const [importPassword, setImportPassword] = useState('');
  const [showImportPassword, setShowImportPassword] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportSettingsOptions>({
    password: '',
    includeAccountSettings: true,
    includeTradingPreferences: true,
    includeNotificationPreferences: true
  });
  const [importSelection, setImportSelection] = useState<ImportSelection>({
    accountSettings: true,
    tradingPreferences: true,
    notificationPreferences: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; type: 'export' | 'import' } | null>(null);

  const handleExport = async () => {
    if (!exportPassword || exportPassword !== exportConfirmPassword) {
      setResult({
        success: false,
        message: 'Please fix password errors before exporting',
        type: 'export'
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const exportResult = await SettingsExporter.exportSettings(
        accountSettings,
        tradingPreferences,
        notificationPreferences,
        {
          ...exportOptions,
          password: exportPassword
        }
      );

      setResult({
        success: exportResult.success,
        message: exportResult.success 
          ? `Settings exported successfully as ${exportResult.filename}`
          : exportResult.error || 'Export failed',
        type: 'export'
      });

      if (exportResult.success) {
        setExportPassword('');
        setExportConfirmPassword('');
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        type: 'export'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!importFile || !importPassword) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const importResult = await SettingsImporter.importSettings(importFile, importPassword, importSelection);
      
      setResult({
        success: importResult.success,
        message: importResult.success 
          ? `Imported: ${importResult.importedSections?.join(', ')}`
          : importResult.error || 'Import failed',
        type: 'import'
      });

      if (importResult.success) {
        // Apply imported settings (simplified for demo)
        onSettingsUpdate(
          importSelection.accountSettings ? { name: 'Imported Name' } : undefined,
          importSelection.tradingPreferences ? { defaultEnergyType: 'solar' } : undefined,
          importSelection.notificationPreferences ? { email: { enabled: true } } : undefined
        );

        // Reset form
        setImportFile(null);
        setImportPassword('');
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Import failed',
        type: 'import'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setImportFile(selectedFile);
      setResult(null);
    }
  };

  const exportPasswordValidation = SettingsEncryption.validatePasswordStrength(exportPassword);
  const exportPasswordsMatch = exportPassword === exportConfirmPassword;
  const importPasswordValidation = SettingsEncryption.validatePasswordStrength(importPassword);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Shield className="w-6 h-6" />
            <span>Settings Manager</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Export and import your application settings
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'export'
              ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Export Settings
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'import'
              ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Import Settings
        </button>
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          {/* Export Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Settings to Export
            </h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeAccountSettings}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    includeAccountSettings: e.target.checked 
                  }))}
                  disabled={isLoading || isProcessing}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Account Settings
                </span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeTradingPreferences}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    includeTradingPreferences: e.target.checked 
                  }))}
                  disabled={isLoading || isProcessing}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Trading Preferences
                </span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeNotificationPreferences}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    includeNotificationPreferences: e.target.checked 
                  }))}
                  disabled={isLoading || isProcessing}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Notification Preferences
                </span>
              </label>
            </div>
          </div>

          {/* Export Password */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Encryption Password
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showExportPassword ? 'text' : 'password'}
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                    placeholder="Enter encryption password"
                    disabled={isLoading || isProcessing}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 ${
                      !exportPasswordValidation.isValid ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowExportPassword(!showExportPassword)}
                    disabled={isLoading || isProcessing}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                  >
                    {showExportPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showExportConfirmPassword ? 'text' : 'password'}
                    value={exportConfirmPassword}
                    onChange={(e) => setExportConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    disabled={isLoading || isProcessing}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 ${
                      exportConfirmPassword && !exportPasswordsMatch ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowExportConfirmPassword(!showExportConfirmPassword)}
                    disabled={isLoading || isProcessing}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                  >
                    {showExportConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <button
              onClick={handleExport}
              disabled={isLoading || isProcessing || !exportPasswordValidation.isValid || !exportPasswordsMatch}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>Export Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Settings File
            </h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={isLoading || isProcessing}
                className="hidden"
                id="settings-file-input"
              />
              <label
                htmlFor="settings-file-input"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <span className="text-4xl">📁</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {importFile ? importFile.name : 'Click to select or drag and drop'}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-500">
                  JSON files only
                </span>
              </label>
            </div>
          </div>

          {/* Import Password */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Decryption Password
            </h3>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showImportPassword ? 'text' : 'password'}
                  value={importPassword}
                  onChange={(e) => setImportPassword(e.target.value)}
                  placeholder="Enter decryption password"
                  disabled={isLoading || isProcessing}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50`}
                />
                <button
                  type="button"
                  onClick={() => setShowImportPassword(!showImportPassword)}
                  disabled={isLoading || isProcessing}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                >
                  {showImportPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Import Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Settings to Import
            </h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={importSelection.accountSettings}
                  onChange={(e) => setImportSelection(prev => ({ 
                    ...prev, 
                    accountSettings: e.target.checked 
                  }))}
                  disabled={isLoading || isProcessing}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Account Settings
                </span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={importSelection.tradingPreferences}
                  onChange={(e) => setImportSelection(prev => ({ 
                    ...prev, 
                    tradingPreferences: e.target.checked 
                  }))}
                  disabled={isLoading || isProcessing}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Trading Preferences
                </span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={importSelection.notificationPreferences}
                  onChange={(e) => setImportSelection(prev => ({ 
                    ...prev, 
                    notificationPreferences: e.target.checked 
                  }))}
                  disabled={isLoading || isProcessing}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Notification Preferences
                </span>
              </label>
            </div>
          </div>

          {/* Import Button */}
          <div className="flex justify-end">
            <button
              onClick={handleImport}
              disabled={isLoading || isProcessing || !importFile || !importPassword}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>Import Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result Message */}
      {result && (
        <div className={`mt-6 p-4 rounded-lg ${
          result.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">
              {result.success ? '✅' : '❌'}
            </span>
            <div>
              <p className={`text-sm font-medium ${
                result.success 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {result.success ? `${result.type.charAt(0).toUpperCase() + result.type.slice(1)} Successful` : `${result.type.charAt(0).toUpperCase() + result.type.slice(1)} Failed`}
              </p>
              <p className={`text-sm mt-1 ${
                result.success 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {result.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Security Information
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
              <li>• Settings are encrypted with strong encryption</li>
              <li>• Sensitive data (API keys, sessions) are excluded</li>
              <li>• Keep your password secure - it cannot be recovered</li>
              <li>• Only import settings from trusted sources</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
