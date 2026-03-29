import React, { useState } from 'react';
import { Key, Download, Copy, RefreshCw, Eye, EyeOff, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useTwoFactor } from '../../hooks/useTwoFactor';
import { BackupCode } from '../../types/auth';
import { AuthHelpers } from '../../utils/authHelpers';

interface BackupCodesProps {
  userId: string;
}

export const BackupCodes: React.FC<BackupCodesProps> = ({ userId }) => {
  const { 
    state, 
    isLoading, 
    error, 
    generateBackupCodes, 
    clearError 
  } = useTwoFactor({ userId });

  const [showCodes, setShowCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [confirmingRegenerate, setConfirmingRegenerate] = useState(false);

  const availableCodes = state.backupCodes.filter(code => !code.isUsed);
  const usedCodes = state.backupCodes.filter(code => code.isUsed);

  const handleGenerateCodes = async () => {
    const codes = await generateBackupCodes();
    if (codes.length > 0) {
      setShowCodes(true);
      setConfirmingRegenerate(false);
    }
  };

  const handleCopyAllCodes = () => {
    const allCodes = availableCodes.map(code => code.code).join('\n');
    navigator.clipboard.writeText(allCodes);
    setCopiedCode('all');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopySingleCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadCodes = () => {
    const content = availableCodes.map(code => code.code).join('\n');
    const blob = new Blob([content, '\n\nCurrentDAO Backup Codes\nGenerated: ' + new Date().toLocaleString()], { 
      type: 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderCodeCard = (code: BackupCode) => (
    <div
      key={code.id}
      className={`border rounded-lg p-3 font-mono text-sm transition-all ${
        code.isUsed 
          ? 'border-gray-200 bg-gray-50 opacity-60' 
          : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${
            code.isUsed ? 'bg-gray-400' : 'bg-green-500'
          }`} />
          <span className={code.isUsed ? 'text-gray-500 line-through' : 'text-gray-900'}>
            {showCodes ? code.code : '••••-••••'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {code.isUsed && code.usedAt && (
            <span className="text-xs text-gray-500">
              Used {code.usedAt.toLocaleDateString()}
            </span>
          )}
          
          {!code.isUsed && (
            <>
              <button
                onClick={() => handleCopySingleCode(code.code)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy code"
              >
                {copiedCode === code.code ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-600" />
                )}
              </button>
              
              <button
                onClick={() => setShowCodes(!showCodes)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title={showCodes ? 'Hide code' : 'Show code'}
              >
                {showCodes ? (
                  <EyeOff className="h-4 w-4 text-gray-600" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-600" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderSecurityWarning = () => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-yellow-800">
          <h4 className="font-semibold mb-2">Important Security Information</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Store these codes in a secure, offline location</li>
            <li>Each backup code can only be used once</li>
            <li>Keep them separate from your main device</li>
            <li>Consider printing them or storing them encrypted</li>
            <li>Regenerate codes if you suspect they've been compromised</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Backup Codes</h3>
      <p className="text-gray-600 mb-6">
        Generate backup codes to ensure you can always access your account
      </p>
      <button
        onClick={handleGenerateCodes}
        disabled={isLoading}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Generate Backup Codes
      </button>
    </div>
  );

  const renderCodeStats = () => (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-600">{availableCodes.length}</div>
        <div className="text-sm text-green-700">Available Codes</div>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-gray-600">{usedCodes.length}</div>
        <div className="text-sm text-gray-700">Used Codes</div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">{state.backupCodes.length}</div>
        <div className="text-sm text-blue-700">Total Generated</div>
      </div>
    </div>
  );

  const renderAvailableCodes = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Available Backup Codes</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCodes(!showCodes)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={showCodes ? 'Hide all codes' : 'Show all codes'}
          >
            {showCodes ? (
              <EyeOff className="h-4 w-4 text-gray-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-600" />
            )}
          </button>
          
          <button
            onClick={handleCopyAllCodes}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Copy all codes"
          >
            {copiedCode === 'all' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-600" />
            )}
          </button>
          
          <button
            onClick={handleDownloadCodes}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Download codes"
          >
            <Download className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {availableCodes.map(renderCodeCard)}
      </div>
    </div>
  );

  const renderUsedCodes = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Used Backup Codes</h3>
      
      {usedCodes.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No backup codes have been used yet</p>
      ) : (
        <div className="grid gap-3">
          {usedCodes.map(renderCodeCard)}
        </div>
      )}
    </div>
  );

  const renderRegenerateWarning = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-red-800">
          <h4 className="font-semibold mb-2">Regenerate Backup Codes?</h4>
          <p className="mb-3">
            This will invalidate all existing backup codes. Make sure you have saved the new codes in a secure location.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={handleGenerateCodes}
              disabled={isLoading}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Yes, Regenerate
            </button>
            <button
              onClick={() => setConfirmingRegenerate(false)}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Backup Codes</h2>
        
        {state.backupCodes.length > 0 && (
          <button
            onClick={() => setConfirmingRegenerate(true)}
            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate Codes
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <X className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{error.message}</p>
          </div>
        </div>
      )}

      {state.backupCodes.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {renderCodeStats()}
          {renderSecurityWarning()}
          
          {availableCodes.length > 0 && renderAvailableCodes()}
          {usedCodes.length > 0 && renderUsedCodes()}
          
          {availableCodes.length < 3 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-800">
                  <h4 className="font-semibold mb-1">Low Backup Codes</h4>
                  <p>You only have {availableCodes.length} backup code{availableCodes.length !== 1 ? 's' : ''} remaining. Consider generating new codes for better security.</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {confirmingRegenerate && renderRegenerateWarning()}
    </div>
  );
};
