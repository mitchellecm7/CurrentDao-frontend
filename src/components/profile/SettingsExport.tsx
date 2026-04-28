'use client';

import { useState } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { AccountSettings, TradingPreferences, NotificationPreferences } from '@/types/profile';
import { ExportSettingsOptions } from '@/types/settings-export';
import { SettingsExporter } from '@/utils/settings-export';
import { SettingsEncryption } from '@/utils/settings-encryption';

interface SettingsExportProps {
  accountSettings: AccountSettings;
  tradingPreferences: TradingPreferences;
  notificationPreferences: NotificationPreferences;
  isLoading?: boolean;
  className?: string;
}

export function SettingsExport({ 
  accountSettings, 
  tradingPreferences, 
  notificationPreferences,
  isLoading = false,
  className = ''
}: SettingsExportProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportSettingsOptions>({
    password: '',
    includeAccountSettings: true,
    includeTradingPreferences: true,
    includeNotificationPreferences: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string; filename?: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const passwordValidation = SettingsEncryption.validatePasswordStrength(password);
  const passwordsMatch = password === confirmPassword;

  const handleExport = async () => {
    if (!passwordValidation.isValid || !passwordsMatch) {
      setExportResult({
        success: false,
        message: 'Please fix password errors before exporting'
      });
      return;
    }

    setIsExporting(true);
    setExportResult(null);

    try {
      const result = await SettingsExporter.exportSettings(
        accountSettings,
        tradingPreferences,
        notificationPreferences,
        {
          ...exportOptions,
          password
        }
      );

      setExportResult({
        success: result.success,
        message: result.success 
          ? `Settings exported successfully as ${result.filename}`
          : result.error || 'Export failed',
        filename: result.filename
      });

      if (result.success) {
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setExportResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportSummary = SettingsExporter.getExportSummary(
    accountSettings,
    tradingPreferences,
    notificationPreferences,
    exportOptions
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <span>📥</span>
            <span>Export Settings</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Export your settings as an encrypted file for backup or transfer
          </p>
        </div>
      </div>

      {/* Export Options */}
      <div className="mb-6">
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
              disabled={isLoading || isExporting}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Account Settings
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Name, username, bio, location, timezone, language, currency
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={exportOptions.includeTradingPreferences}
              onChange={(e) => setExportOptions(prev => ({ 
                ...prev, 
                includeTradingPreferences: e.target.checked 
              }))}
              disabled={isLoading || isExporting}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Trading Preferences
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Energy type, location radius, auto-accept, payment methods
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={exportOptions.includeNotificationPreferences}
              onChange={(e) => setExportOptions(prev => ({ 
                ...prev, 
                includeNotificationPreferences: e.target.checked 
              }))}
              disabled={isLoading || isExporting}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Notification Preferences
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Email, push, and in-app notification settings
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Export Summary */}
      {exportSummary.totalSections > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <span>📄</span>
            <span>Export Summary ({exportSummary.totalSections} sections)</span>
          </button>
          
          {showPreview && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="text-gray-600 dark:text-gray-400">
                <strong>Included:</strong> {exportSummary.includedSections.join(', ')}
              </div>
              {exportSummary.excludedSections.length > 0 && (
                <div className="text-gray-600 dark:text-gray-400">
                  <strong>Excluded:</strong> {exportSummary.excludedSections.join(', ')}
                </div>
              )}
              <div className="text-gray-600 dark:text-gray-400">
                <strong>Items:</strong> {Object.entries(exportSummary.itemCount)
                  .map(([section, count]) => `${section}: ${count}`)
                  .join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Password Fields */}
      <div className="mb-6">
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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter encryption password"
                disabled={isLoading || isExporting}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 ${
                  !passwordValidation.isValid ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || isExporting}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordValidation.errors.length > 0 && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {passwordValidation.errors[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                disabled={isLoading || isExporting}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 ${
                  confirmPassword && !passwordsMatch ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading || isExporting}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Passwords do not match
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Export Result */}
      {exportResult && (
        <div className={`mb-6 p-4 rounded-lg ${
          exportResult.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start space-x-3">
            {exportResult.success ? (
            <span>✅</span>
            ) : (
            <span>❌</span>
            )}
            <div>
              <p className={`text-sm font-medium ${
                exportResult.success 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {exportResult.success ? 'Export Successful' : 'Export Failed'}
              </p>
              <p className={`text-sm mt-1 ${
                exportResult.success 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {exportResult.message}
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
              <li>• Settings are encrypted with AES-GCM encryption</li>
              <li>• Sensitive data (API keys, sessions) are excluded from export</li>
              <li>• Keep your password secure - it cannot be recovered</li>
              <li>• Store the exported file in a safe location</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={isLoading || isExporting || !passwordValidation.isValid || !passwordsMatch || exportSummary.totalSections === 0}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
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
  );
}
