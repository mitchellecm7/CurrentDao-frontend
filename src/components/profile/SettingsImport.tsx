'use client';

import { useState } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, Plus } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { ImportSelection, SettingsImportResult } from '@/types/settings-export';
import { AccountSettings, TradingPreferences, NotificationPreferences } from '@/types/profile';
import { SettingsImporter } from '@/utils/settings-import';
import { SettingsEncryption } from '@/utils/settings-encryption';

interface SettingsImportProps {
  onImport: (
    accountSettings?: Partial<AccountSettings>,
    tradingPreferences?: Partial<TradingPreferences>,
    notificationPreferences?: Partial<NotificationPreferences>
  ) => void;
  isLoading?: boolean;
  className?: string;
}

export function SettingsImport({ 
  onImport, 
  isLoading = false,
  className = ''
}: SettingsImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selection, setSelection] = useState<ImportSelection>({
    accountSettings: true,
    tradingPreferences: true,
    notificationPreferences: true
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<SettingsImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    file: File;
    password: string;
    selection: ImportSelection;
    previewData: any;
  } | null>(null);

  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
      setPreviewData(null);
      setShowPreview(false);
    }
  };

  const handlePreview = async () => {
    if (!file || !password) return;

    try {
      const result = await SettingsImporter.previewImport(file, password);
      if (result.success && result.preview) {
        setPreviewData(result.preview);
        setShowPreview(true);
      } else {
        setImportResult({
          success: false,
          error: result.error || 'Failed to preview file'
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        error: error instanceof Error ? error.message : 'Preview failed'
      });
    }
  };

  const handleImport = async () => {
    if (!file || !password) return;

    // Show confirmation dialog first
    setConfirmationData({
      file,
      password,
      selection,
      previewData
    });
    setShowConfirmation(true);
  };

  const confirmImport = async () => {
    if (!confirmationData) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await SettingsImporter.importSettings(
        confirmationData.file, 
        confirmationData.password, 
        confirmationData.selection
      );
      setImportResult(result);

      if (result.success && result.importedSections) {
        // Get the actual imported data from import result
        const importedData = await SettingsImporter.previewImport(
          confirmationData.file, 
          confirmationData.password
        );
        
        if (importedData.success && importedData.preview) {
          const dataToApply: any = {};
          
          if (confirmationData.selection.accountSettings && importedData.preview.accountSettings) {
            dataToApply.accountSettings = importedData.preview.accountSettings;
          }
          if (confirmationData.selection.tradingPreferences && importedData.preview.tradingPreferences) {
            dataToApply.tradingPreferences = importedData.preview.tradingPreferences;
          }
          if (confirmationData.selection.notificationPreferences && importedData.preview.notificationPreferences) {
            dataToApply.notificationPreferences = importedData.preview.notificationPreferences;
          }

          onImport(
            dataToApply.accountSettings,
            dataToApply.tradingPreferences,
            dataToApply.notificationPreferences
          );
        }

        // Reset form
        setFile(null);
        setPassword('');
        setShowPreview(false);
        setPreviewData(null);
        setConfirmationData(null);
      }
    } catch (error) {
      setImportResult({
        success: false,
        error: error instanceof Error ? error.message : 'Import failed'
      });
    } finally {
      setIsImporting(false);
      setShowConfirmation(false);
    }
  };

  const passwordValidation = SettingsEncryption.validatePasswordStrength(password);
  const fileInfo = file ? SettingsImporter.getFileInfo(file) : null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Plus className="w-6 h-6" />
            <span>Import Settings</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Import settings from an encrypted backup file
          </p>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Settings File
        </h3>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            disabled={isLoading || isImporting}
            className="hidden"
            id="settings-file-input"
          />
          <label
            htmlFor="settings-file-input"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Plus className="w-12 h-12 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {file ? file.name : 'Click to select or drag and drop'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              JSON files only
            </span>
          </label>
        </div>

        {fileInfo && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Size:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">{fileInfo.size}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Modified:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">{fileInfo.lastModified}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Field */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Decryption Password
        </h3>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter decryption password"
              disabled={isLoading || isImporting}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 ${
                password && !passwordValidation.isValid ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading || isImporting}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && passwordValidation.errors.length > 0 && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {passwordValidation.errors[0]}
            </p>
          )}
        </div>
      </div>

      {/* Preview Button */}
      {file && password && passwordValidation.isValid && (
        <div className="mb-6">
          <button
            onClick={handlePreview}
            disabled={isLoading || isImporting}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview Settings
          </button>
        </div>
      )}

      {/* Preview */}
      {showPreview && previewData && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Settings Preview
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="space-y-3">
              {previewData.accountSettings && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Account Settings</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Name: {previewData.accountSettings.name}</div>
                    <div>Username: {previewData.accountSettings.username}</div>
                    <div>Language: {previewData.accountSettings.language}</div>
                    <div>Currency: {previewData.accountSettings.currency}</div>
                  </div>
                </div>
              )}

              {previewData.tradingPreferences && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Trading Preferences</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Energy Type: {previewData.tradingPreferences.defaultEnergyType}</div>
                    <div>Location Radius: {previewData.tradingPreferences.locationRadius}km</div>
                    <div>Auto Accept: {previewData.tradingPreferences.autoAcceptTrades ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              )}

              {previewData.notificationPreferences && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notification Preferences</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Email notifications: {previewData.notificationPreferences.email.enabled ? 'Enabled' : 'Disabled'}
                    <br />
                    Push notifications: {previewData.notificationPreferences.push.enabled ? 'Enabled' : 'Disabled'}
                    <br />
                    In-app notifications: {previewData.notificationPreferences.inApp.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Exported: {new Date(previewData.timestamp).toLocaleString()}
                <br />
                Version: {previewData.version}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Selection */}
      {showPreview && previewData && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select Settings to Import
          </h3>
          <div className="space-y-3">
            {previewData.accountSettings && (
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selection.accountSettings}
                  onChange={(e) => setSelection(prev => ({ 
                    ...prev, 
                    accountSettings: e.target.checked 
                  }))}
                  disabled={isLoading || isImporting}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Account Settings
                </span>
              </label>
            )}

            {previewData.tradingPreferences && (
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selection.tradingPreferences}
                  onChange={(e) => setSelection(prev => ({ 
                    ...prev, 
                    tradingPreferences: e.target.checked 
                  }))}
                  disabled={isLoading || isImporting}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Trading Preferences
                </span>
              </label>
            )}

            {previewData.notificationPreferences && (
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selection.notificationPreferences}
                  onChange={(e) => setSelection(prev => ({ 
                    ...prev, 
                    notificationPreferences: e.target.checked 
                  }))}
                  disabled={isLoading || isImporting}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Notification Preferences
                </span>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className={`mb-6 p-4 rounded-lg ${
          importResult.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">
              {importResult.success ? '✅' : '❌'}
            </span>
            <div>
              <p className={`text-sm font-medium ${
                importResult.success 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {importResult.success ? 'Import Successful' : 'Import Failed'}
              </p>
              <p className={`text-sm mt-1 ${
                importResult.success 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {importResult.success 
                  ? `Imported: ${importResult.importedSections?.join(', ')}`
                  : importResult.error
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Security Information
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
              <li>• Only import settings from trusted sources</li>
              <li>• Review all settings before applying them</li>
              <li>• Sensitive data will be overwritten</li>
              <li>• You can choose which sections to import</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Import Button */}
      {showPreview && (
        <div className="flex justify-end space-x-3">
          {!showConfirmation ? (
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={isLoading || isImporting || !selection.accountSettings && !selection.tradingPreferences && !selection.notificationPreferences}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import Selected Settings
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isLoading || isImporting}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={isLoading || isImporting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  'Confirm Import'
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmImport}
        title="Confirm Import Settings"
        message={`Are you sure you want to import selected settings? This will overwrite your existing settings for: ${confirmationData ? Object.entries(confirmationData.selection).filter(([_, selected]) => selected).map(([section]) => section).join(', ') : ''}. This action cannot be undone.`}
        confirmText="Import Settings"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
}
