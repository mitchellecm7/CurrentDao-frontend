'use client';

import { useState } from 'react';
import { Cookie, Eye, EyeOff, Settings, AlertTriangle, Shield, BarChart, Target, Zap } from 'lucide-react';

interface CookieManagerProps {
  preferences: Record<string, boolean>;
  onUpdatePreferences: (preferences: Record<string, boolean>) => void;
  dataSharing: {
    analytics: boolean;
    marketing: boolean;
    thirdParty: boolean;
  };
  onUpdateDataSharing: (category: 'analytics' | 'marketing' | 'thirdParty', enabled: boolean) => void;
}

export function CookieManager({ 
  preferences, 
  onUpdatePreferences, 
  dataSharing, 
  onUpdateDataSharing 
}: CookieManagerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const cookieCategories = [
    {
      key: 'essential',
      name: 'Essential Cookies',
      description: 'Required for basic website functionality',
      icon: Shield,
      required: true,
      examples: ['Authentication', 'Security tokens', 'Shopping cart'],
      current: preferences.essential
    },
    {
      key: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us improve our services by tracking usage',
      icon: BarChart,
      required: false,
      examples: ['Google Analytics', 'User behavior tracking', 'Performance metrics'],
      current: preferences.analytics
    },
    {
      key: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used for personalized advertising and marketing',
      icon: Target,
      required: false,
      examples: ['Ad personalization', 'Campaign tracking', 'Conversion pixels'],
      current: preferences.marketing
    },
    {
      key: 'functional',
      name: 'Functional Cookies',
      description: 'Enable enhanced features and personalization',
      icon: Zap,
      required: false,
      examples: ['Language preferences', 'Theme settings', 'Custom features'],
      current: preferences.functional
    }
  ];

  const dataSharingCategories = [
    {
      key: 'analytics' as const,
      name: 'Analytics Data',
      description: 'Share anonymized usage data with analytics providers',
      icon: BarChart,
      current: dataSharing.analytics
    },
    {
      key: 'marketing' as const,
      name: 'Marketing Data',
      description: 'Share engagement data with marketing partners',
      icon: Target,
      current: dataSharing.marketing
    },
    {
      key: 'thirdParty' as const,
      name: 'Third Party Services',
      description: 'Share data with trusted third-party service providers',
      icon: Settings,
      current: dataSharing.thirdParty
    }
  ];

  const handleCookieToggle = (key: string, enabled: boolean) => {
    onUpdatePreferences({
      ...preferences,
      [key]: enabled
    });
  };

  const handleDataSharingToggle = (category: 'analytics' | 'marketing' | 'thirdParty', enabled: boolean) => {
    onUpdateDataSharing(category, enabled);
  };

  const getCookieStatus = (category: typeof cookieCategories[0]) => {
    if (category.required) return 'required';
    if (category.current) return 'enabled';
    return 'disabled';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'required':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'enabled':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'disabled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const acceptAll = () => {
    const allPreferences = cookieCategories.reduce((acc, cat) => ({
      ...acc,
      [cat.key]: true
    }), {});
    onUpdatePreferences(allPreferences);
    
    // Enable all data sharing
    onUpdateDataSharing('analytics', true);
    onUpdateDataSharing('marketing', true);
    onUpdateDataSharing('thirdParty', true);
  };

  const rejectAll = () => {
    const essentialOnly = cookieCategories.reduce((acc, cat) => ({
      ...acc,
      [cat.key]: cat.required
    }), {});
    onUpdatePreferences(essentialOnly);
    
    // Disable all data sharing
    onUpdateDataSharing('analytics', false);
    onUpdateDataSharing('marketing', false);
    onUpdateDataSharing('thirdParty', false);
  };

  const enabledCount = cookieCategories.filter(cat => cat.current).length;
  const requiredCount = cookieCategories.filter(cat => cat.required).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Cookie & Tracking Management</h2>
          <p className="text-gray-600 mt-1">
            Control how we use cookies and track your activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">
            {enabledCount} of {cookieCategories.length} enabled
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={acceptAll}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Accept All
        </button>
        <button
          onClick={rejectAll}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
        >
          <EyeOff className="w-4 h-4" />
          Reject All
        </button>
      </div>

      {/* Cookie Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Cookie Categories</h3>
        
        {cookieCategories.map((category) => {
          const Icon = category.icon;
          const status = getCookieStatus(category);
          
          return (
            <div key={category.key} className="border border-gray-200 rounded-lg">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
                        {status === 'required' ? 'Required' : status === 'enabled' ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                    
                    {showDetails && (
                      <div className="text-sm text-gray-500 mb-3">
                        <p className="font-medium mb-1">Examples:</p>
                        <ul className="list-disc list-inside">
                          {category.examples.map((example, index) => (
                            <li key={index}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    
                    {!category.required && (
                      <button
                        onClick={() => handleCookieToggle(category.key, !category.current)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          category.current ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            category.current ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Sharing Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Data Sharing Preferences</h3>
        
        {dataSharingCategories.map((category) => {
          const Icon = category.icon;
          
          return (
            <div key={category.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDataSharingToggle(category.key, !category.current)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    category.current ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      category.current ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Cookie Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total Cookies:</span>
                  <span className="ml-2 font-medium">{enabledCount}</span>
                </div>
                <div>
                  <span className="text-gray-500">Required Cookies:</span>
                  <span className="ml-2 font-medium">{requiredCount}</span>
                </div>
                <div>
                  <span className="text-gray-500">Optional Cookies:</span>
                  <span className="ml-2 font-medium">{cookieCategories.length - requiredCount}</span>
                </div>
                <div>
                  <span className="text-gray-500">Data Sharing Enabled:</span>
                  <span className="ml-2 font-medium">
                    {[dataSharing.analytics, dataSharing.marketing, dataSharing.thirdParty].filter(Boolean).length}/3
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Privacy Impact</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  <strong>Essential:</strong> Required for basic functionality - cannot be disabled
                </p>
                <p>
                  <strong>Analytics:</strong> Helps us improve the service - anonymous usage data only
                </p>
                <p>
                  <strong>Marketing:</strong> Personalized content and ads - may affect user experience
                </p>
                <p>
                  <strong>Functional:</strong> Enhanced features - improves user experience
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Information */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Cookie className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-green-900 mb-2">Your Cookie Rights</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Right to accept or reject non-essential cookies</li>
              <li>• Right to change your preferences at any time</li>
              <li>• Right to know what data is being collected</li>
              <li>• Right to withdraw consent for data sharing</li>
            </ul>
            <p className="text-xs text-green-700 mt-3">
              Your cookie preferences are saved locally and will persist across sessions. 
              Clearing browser data may reset these preferences.
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
              Disabling certain cookies may affect website functionality and your user experience. 
              Essential cookies cannot be disabled as they are required for basic site operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
