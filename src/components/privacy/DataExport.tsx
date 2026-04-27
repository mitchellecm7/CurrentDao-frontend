'use client';

import { useState } from 'react';
import { Download, FileText, Database, Calendar, Settings, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface DataExportProps {
  onExportData: (format: 'json' | 'csv' | 'pdf', includeSensitive?: boolean) => Promise<void>;
  dataSummary: {
    totalSize: string;
    recordCount: number;
    lastUpdated: string;
  };
  onUpdateDataRetention: (category: 'profile' | 'transactions' | 'activity', days: number) => void;
  retentionSettings: {
    profile: number;
    transactions: number;
    activity: number;
  };
}

export function DataExport({ 
  onExportData, 
  dataSummary, 
  onUpdateDataRetention, 
  retentionSettings 
}: DataExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [includeSensitive, setIncludeSensitive] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showRetentionSettings, setShowRetentionSettings] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExportData(selectedFormat, includeSensitive);
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    {
      value: 'json' as const,
      label: 'JSON',
      description: 'Machine-readable format for developers',
      icon: Database,
      recommended: true
    },
    {
      value: 'csv' as const,
      label: 'CSV',
      description: 'Spreadsheet-compatible format',
      icon: FileText
    },
    {
      value: 'pdf' as const,
      label: 'PDF',
      description: 'Human-readable document format',
      icon: FileText
    }
  ];

  const retentionCategories = [
    {
      key: 'profile' as const,
      label: 'Profile Data',
      description: 'Personal information and preferences',
      icon: FileText,
      currentValue: retentionSettings.profile
    },
    {
      key: 'transactions' as const,
      label: 'Transaction History',
      description: 'Energy trading records and wallet activity',
      icon: Database,
      currentValue: retentionSettings.transactions
    },
    {
      key: 'activity' as const,
      label: 'Activity Log',
      description: 'User interactions and system events',
      icon: Clock,
      currentValue: retentionSettings.activity
    }
  ];

  const getRetentionColor = (days: number) => {
    if (days === 0) return 'text-red-600 bg-red-50 border-red-200';
    if (days <= 30) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (days <= 365) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getRetentionLabel = (days: number) => {
    if (days === 0) return 'Immediate deletion';
    if (days === 30) return '30 days';
    if (days === 90) return '3 months';
    if (days === 180) return '6 months';
    if (days === 365) return '1 year';
    if (days === 730) return '2 years';
    return `${days} days`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Data Export & Management</h2>
        <p className="text-gray-600 mt-1">
          Export your data or manage retention policies
        </p>
      </div>

      {/* Data Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-2">Your Data Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Total Size:</span>
                <span className="ml-2 font-medium text-blue-900">{dataSummary.totalSize}</span>
              </div>
              <div>
                <span className="text-blue-700">Records:</span>
                <span className="ml-2 font-medium text-blue-900">{dataSummary.recordCount}</span>
              </div>
              <div>
                <span className="text-blue-700">Last Updated:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {new Date(dataSummary.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Export Your Data</h3>
          <Download className="w-5 h-5 text-gray-400" />
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formatOptions.map((format) => {
              const Icon = format.icon;
              return (
                <button
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value)}
                  className={`relative p-4 border rounded-lg transition-colors text-left ${
                    selectedFormat === format.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {format.recommended && (
                    <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded">
                      Recommended
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{format.label}</p>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sensitive Data Option */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSensitive}
              onChange={(e) => setIncludeSensitive(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900">Include sensitive information</p>
              <p className="text-sm text-gray-600">
                This may include personal identifiers and detailed transaction data
              </p>
            </div>
          </label>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export Data
            </>
          )}
        </button>
      </div>

      {/* Data Retention Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Data Retention Policies</h3>
            <p className="text-gray-600 text-sm mt-1">
              Control how long your data is stored
            </p>
          </div>
          <button
            onClick={() => setShowRetentionSettings(!showRetentionSettings)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {retentionCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{category.label}</p>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 text-sm font-medium rounded-full border ${getRetentionColor(category.currentValue)}`}>
                  {getRetentionLabel(category.currentValue)}
                </div>
              </div>
            );
          })}
        </div>

        {showRetentionSettings && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Adjust Retention Periods</h4>
            <div className="space-y-4">
              {retentionCategories.map((category) => (
                <div key={category.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{category.label}</p>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <select
                    value={category.currentValue}
                    onChange={(e) => onUpdateDataRetention(category.key, parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Immediate deletion</option>
                    <option value={30}>30 days</option>
                    <option value={90}>3 months</option>
                    <option value={180}>6 months</option>
                    <option value={365}>1 year</option>
                    <option value={730}>2 years</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data Rights Information */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-green-900 mb-2">Your Data Rights</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Right to access your personal data</li>
              <li>• Right to data portability in machine-readable format</li>
              <li>• Right to request erasure of your data</li>
              <li>• Right to know how long your data is stored</li>
            </ul>
            <p className="text-xs text-green-700 mt-3">
              Export requests are typically processed within 24 hours. For urgent requests, contact our Data Protection Officer.
            </p>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-900 mb-2">Important Notice</h4>
            <p className="text-sm text-yellow-800">
              Exported data may contain sensitive information. Keep your exported files secure and delete them when no longer needed. 
              If you believe any data is incorrect, you can request rectification through the privacy panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
