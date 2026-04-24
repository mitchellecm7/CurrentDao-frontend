import React, { useState } from 'react';
import { Shield, Smartphone, Mail, Key, Settings, Trash2, Check, X, AlertTriangle, Clock } from 'lucide-react';
import { useTwoFactor } from '../../hooks/useTwoFactor';
import { TwoFactorMethodType, TwoFactorMethod } from '../../types/auth';
import { AuthHelpers } from '../../utils/authHelpers';

interface TwoFactorMethodsProps {
  userId: string;
}

export const TwoFactorMethods: React.FC<TwoFactorMethodsProps> = ({ userId }) => {
  const { 
    state, 
    isLoading, 
    error, 
    disableTwoFactor, 
    clearError 
  } = useTwoFactor({ userId });

  const [confirmingDisable, setConfirmingDisable] = useState<string | null>(null);
  const [showAddMethod, setShowAddMethod] = useState(false);

  const handleDisableMethod = async (methodId: string) => {
    const success = await disableTwoFactor(methodId);
    if (success) {
      setConfirmingDisable(null);
    }
  };

  const handleSetPrimary = async (methodId: string) => {
    const updatedMethods = state.methods.map(method => ({
      ...method,
      isPrimary: method.id === methodId
    }));

    setState(prev => ({
      ...prev,
      methods: updatedMethods
    }));
  };

  const getMethodIcon = (type: TwoFactorMethodType) => {
    switch (type) {
      case TwoFactorMethodType.TOTP:
        return <Smartphone className="h-5 w-5" />;
      case TwoFactorMethodType.SMS:
        return <Mail className="h-5 w-5" />;
      case TwoFactorMethodType.EMAIL:
        return <Mail className="h-5 w-5" />;
      default:
        return <Key className="h-5 w-5" />;
    }
  };

  const getMethodColor = (type: TwoFactorMethodType) => {
    switch (type) {
      case TwoFactorMethodType.TOTP:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case TwoFactorMethodType.SMS:
        return 'text-green-600 bg-green-50 border-green-200';
      case TwoFactorMethodType.EMAIL:
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderMethodCard = (method: TwoFactorMethod) => (
    <div
      key={method.id}
      className="border border-gray-200 rounded-lg p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg border ${getMethodColor(method.type)}`}>
            {getMethodIcon(method.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{method.name}</h3>
            <p className="text-sm text-gray-600">
              {AuthHelpers.getMethodDescription(method.type)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {method.isPrimary && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Primary
            </span>
          )}
          
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            method.isEnabled 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {method.isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          {method.lastUsed && (
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Last used: {method.lastUsed.toLocaleDateString()}</span>
            </div>
          )}
          <div>
            Added: {method.createdAt.toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        {!method.isPrimary && state.methods.length > 1 && (
          <button
            onClick={() => handleSetPrimary(method.id)}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center"
          >
            <Check className="h-4 w-4 mr-1" />
            Set as Primary
          </button>
        )}
        
        <button
          onClick={() => setConfirmingDisable(method.id)}
          className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center justify-center"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remove
        </button>
      </div>

      {confirmingDisable === method.id && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-3">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">Remove this authentication method?</p>
              <p>This will disable two-factor authentication if this is your only method.</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleDisableMethod(method.id)}
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Yes, Remove
            </button>
            <button
              onClick={() => setConfirmingDisable(null)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderAddMethodOptions = () => (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Add New Method</h3>
      
      <div className="space-y-3">
        {[
          { type: TwoFactorMethodType.TOTP, name: 'Authenticator App', description: 'Use Google Authenticator or similar apps' },
          { type: TwoFactorMethodType.SMS, name: 'SMS Text Message', description: 'Receive codes via text message' },
          { type: TwoFactorMethodType.EMAIL, name: 'Email Code', description: 'Receive codes via email' }
        ].map(({ type, name, description }) => {
          const isAlreadyAdded = state.methods.some(m => m.type === type);
          
          return (
            <button
              key={type}
              onClick={() => {
                if (!isAlreadyAdded) {
                  setShowAddMethod(false);
                }
              }}
              disabled={isAlreadyAdded}
              className={`w-full flex items-center p-3 border rounded-lg transition-colors ${
                isAlreadyAdded
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className={`p-2 rounded-lg border mr-3 ${getMethodColor(type)}`}>
                {getMethodIcon(type)}
              </div>
              <div className="text-left flex-1">
                <h4 className="font-medium text-gray-900">{name}</h4>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
              {isAlreadyAdded && (
                <span className="text-sm text-gray-500">Already added</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Authentication Methods</h3>
      <p className="text-gray-600 mb-6">
        Add a two-factor authentication method to secure your account
      </p>
      <button
        onClick={() => setShowAddMethod(true)}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Add Authentication Method
      </button>
    </div>
  );

  const renderSecurityStatus = () => (
    <div className={`border rounded-lg p-4 mb-6 ${
      state.isEnabled 
        ? 'border-green-200 bg-green-50' 
        : 'border-yellow-200 bg-yellow-50'
    }`}>
      <div className="flex items-center">
        {state.isEnabled ? (
          <Shield className="h-5 w-5 text-green-600 mr-2" />
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
              ? `Your account is protected with ${state.methods.length} authentication method${state.methods.length > 1 ? 's' : ''}`
              : 'Your account is not protected with two-factor authentication'
            }
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Authentication Methods</h2>
        <button
          onClick={() => setShowAddMethod(!showAddMethod)}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Methods
        </button>
      </div>

      {renderSecurityStatus()}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <X className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{error.message}</p>
          </div>
        </div>
      )}

      {state.methods.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-4">
          {state.methods.map(renderMethodCard)}
          
          {showAddMethod && renderAddMethodOptions()}
        </div>
      )}

      {state.methods.length > 0 && !showAddMethod && (
        <button
          onClick={() => setShowAddMethod(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center text-gray-600 hover:text-blue-600"
        >
          <Settings className="h-5 w-5 mr-2" />
          Add Another Method
        </button>
      )}
    </div>
  );
};
