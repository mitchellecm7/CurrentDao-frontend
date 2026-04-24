import React, { useState } from 'react';
import { Shield, Settings, Key, Smartphone, Mail, Monitor, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { TwoFactorSetup } from './TwoFactorSetup';
import { TwoFactorMethods } from './TwoFactorMethods';
import { BackupCodes } from './BackupCodes';
import { SecurityRecovery } from './SecurityRecovery';
import { TrustedDevices } from './TrustedDevices';
import { useTwoFactor } from '../../hooks/useTwoFactor';

interface TwoFactorAuthExampleProps {
  userId: string;
}

export const TwoFactorAuthExample: React.FC<TwoFactorAuthExampleProps> = ({ userId }) => {
  const { state, clearError } = useTwoFactor({ userId });
  const [activeTab, setActiveTab] = useState<'setup' | 'methods' | 'backup' | 'devices' | 'recovery'>('setup');
  const [showRecovery, setShowRecovery] = useState(false);

  const tabs = [
    { id: 'setup', label: 'Setup', icon: <Shield className="h-4 w-4" /> },
    { id: 'methods', label: 'Methods', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'backup', label: 'Backup Codes', icon: <Key className="h-4 w-4" /> },
    { id: 'devices', label: 'Trusted Devices', icon: <Monitor className="h-4 w-4" /> },
    { id: 'recovery', label: 'Recovery', icon: <AlertTriangle className="h-4 w-4" /> }
  ];

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    clearError();
  };

  const renderTabContent = () => {
    if (showRecovery) {
      return (
        <SecurityRecovery
          userId={userId}
          onRecoveryComplete={() => setShowRecovery(false)}
        />
      );
    }

    switch (activeTab) {
      case 'setup':
        return state.isEnabled ? (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">2FA is Enabled</h3>
            <p className="text-gray-600 mb-6">
              Your account is protected with two-factor authentication.
            </p>
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-2">Active Methods:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {state.methods.map(method => (
                      <li key={method.id}>
                        {method.name} {method.isPrimary && '(Primary)'}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={() => handleTabChange('methods')}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Methods
              </button>
            </div>
          </div>
        ) : (
          <TwoFactorSetup
            userId={userId}
            onComplete={() => handleTabChange('methods')}
            onCancel={() => handleTabChange('methods')}
          />
        );

      case 'methods':
        return <TwoFactorMethods userId={userId} />;

      case 'backup':
        return <BackupCodes userId={userId} />;

      case 'devices':
        return <TrustedDevices userId={userId} />;

      case 'recovery':
        return (
          <SecurityRecovery
            userId={userId}
            onRecoveryComplete={() => handleTabChange('setup')}
          />
        );

      default:
        return null;
    }
  };

  const renderSecurityStatus = () => (
    <div className={`border rounded-lg p-4 mb-6 ${
      state.isEnabled 
        ? 'border-green-200 bg-green-50' 
        : 'border-yellow-200 bg-yellow-50'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {state.isEnabled ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
          )}
          <div>
            <h3 className={`font-semibold ${
              state.isEnabled ? 'text-green-900' : 'text-yellow-900'
            }`}>
              {state.isEnabled ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled'}
            </h3>
            <p className={`text-sm ${
              state.isEnabled ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {state.isEnabled 
                ? `Your account is protected with ${state.methods.length} method${state.methods.length > 1 ? 's' : ''}`
                : 'Your account is not protected with two-factor authentication'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{state.methods.length}</div>
            <div className="text-gray-600">Methods</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {state.backupCodes.filter(c => !c.isUsed).length}
            </div>
            <div className="text-gray-600">Backup Codes</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {state.trustedDevices.filter(d => d.isActive).length}
            </div>
            <div className="text-gray-600">Trusted Devices</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <button
        onClick={() => handleTabChange('setup')}
        className={`p-4 border rounded-lg text-left transition-colors ${
          activeTab === 'setup'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            activeTab === 'setup'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-600'
          }`}>
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Setup 2FA</h4>
            <p className="text-sm text-gray-600">
              {state.isEnabled ? 'View status' : 'Enable protection'}
            </p>
          </div>
        </div>
      </button>

      <button
        onClick={() => handleTabChange('backup')}
        className={`p-4 border rounded-lg text-left transition-colors ${
          activeTab === 'backup'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            activeTab === 'backup'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-600'
          }`}>
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Backup Codes</h4>
            <p className="text-sm text-gray-600">
              {state.backupCodes.filter(c => !c.isUsed).length} available
            </p>
          </div>
        </div>
      </button>

      <button
        onClick={() => handleTabChange('devices')}
        className={`p-4 border rounded-lg text-left transition-colors ${
          activeTab === 'devices'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            activeTab === 'devices'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-600'
          }`}>
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Trusted Devices</h4>
            <p className="text-sm text-gray-600">
              {state.trustedDevices.filter(d => d.isActive).length} active
            </p>
          </div>
        </div>
      </button>
    </div>
  );

  const renderMobileWarning = () => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Smartphone className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <h4 className="font-semibold mb-1">Mobile Experience</h4>
            <p>
              This interface is optimized for mobile devices. You can easily manage your 
              two-factor authentication settings on the go.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h1>
          <p className="text-gray-600">
            Manage your account security with two-factor authentication
          </p>
        </div>

        {renderSecurityStatus()}
        {renderQuickActions()}
        {renderMobileWarning()}

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as typeof activeTab)}
                  className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Need help? Contact support or visit our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              security documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
