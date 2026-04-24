import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Mail, Key, CheckCircle, AlertCircle, Copy, Download } from 'lucide-react';
import { useTwoFactor } from '../../hooks/useTwoFactor';
import { TwoFactorMethodType, SetupStep, TOTPSetup } from '../../types/auth';
import { AuthHelpers } from '../../utils/authHelpers';

interface TwoFactorSetupProps {
  userId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  userId,
  onComplete,
  onCancel
}) => {
  const { 
    state, 
    isLoading, 
    error, 
    enableTwoFactor, 
    generateBackupCodes, 
    setupTOTP, 
    updateSetupProgress, 
    resetSetupProgress,
    clearError 
  } = useTwoFactor({ userId });

  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethodType | null>(null);
  const [totpSetup, setTotpSetup] = useState<TOTPSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [codesDownloaded, setCodesDownloaded] = useState(false);

  const currentStep = state.setupProgress?.currentStep || SetupStep.METHOD_SELECTION;
  const completedSteps = state.setupProgress?.completedSteps || [];

  useEffect(() => {
    updateSetupProgress({
      currentStep: SetupStep.METHOD_SELECTION,
      completedSteps: []
    });
  }, [updateSetupProgress]);

  const handleMethodSelect = (method: TwoFactorMethodType) => {
    setSelectedMethod(method);
    clearError();

    if (method === TwoFactorMethodType.TOTP) {
      const setup = setupTOTP();
      setTotpSetup(setup);
      updateSetupProgress({
        currentStep: SetupStep.SETUP_TOTP,
        completedSteps: [SetupStep.METHOD_SELECTION],
        selectedMethod: method
      });
    } else if (method === TwoFactorMethodType.SMS) {
      updateSetupProgress({
        currentStep: SetupStep.SETUP_SMS,
        completedSteps: [SetupStep.METHOD_SELECTION],
        selectedMethod: method
      });
    } else if (method === TwoFactorMethodType.EMAIL) {
      updateSetupProgress({
        currentStep: SetupStep.SETUP_EMAIL,
        completedSteps: [SetupStep.METHOD_SELECTION],
        selectedMethod: method
      });
    }
  };

  const handleTOTPSetup = async () => {
    if (!verificationCode || !totpSetup) return;

    const isValid = AuthHelpers.validateTOTPCode(totpSetup.secret, verificationCode);
    
    if (isValid) {
      const success = await enableTwoFactor(TwoFactorMethodType.TOTP, {
        secret: totpSetup.secret,
        verified: true
      });

      if (success) {
        updateSetupProgress({
          currentStep: SetupStep.BACKUP_CODES,
          completedSteps: [...completedSteps, SetupStep.SETUP_TOTP]
        });
      }
    } else {
      clearError();
    }
  };

  const handleSMSSetup = async () => {
    if (!phoneNumber) return;

    const formattedPhone = AuthHelpers.formatPhoneNumber(phoneNumber);
    
    updateSetupProgress({
      currentStep: SetupStep.VERIFICATION,
      completedSteps: [...completedSteps, SetupStep.SETUP_SMS],
      verificationData: { phoneNumber: formattedPhone }
    });
  };

  const handleEmailSetup = async () => {
    if (!email || !AuthHelpers.isValidEmail(email)) return;

    updateSetupProgress({
      currentStep: SetupStep.VERIFICATION,
      completedSteps: [...completedSteps, SetupStep.SETUP_EMAIL],
      verificationData: { email }
    });
  };

  const handleVerification = async () => {
    if (!selectedMethod || !verificationCode) return;

    let setupData: any = { verified: true };

    if (selectedMethod === TwoFactorMethodType.SMS) {
      setupData.phoneNumber = state.setupProgress?.verificationData?.phoneNumber;
    } else if (selectedMethod === TwoFactorMethodType.EMAIL) {
      setupData.email = state.setupProgress?.verificationData?.email;
    }

    const success = await enableTwoFactor(selectedMethod, setupData);

    if (success) {
      updateSetupProgress({
        currentStep: SetupStep.BACKUP_CODES,
        completedSteps: [...completedSteps, SetupStep.VERIFICATION]
      });
    }
  };

  const handleGenerateBackupCodes = async () => {
    const codes = await generateBackupCodes();
    if (codes.length > 0) {
      setBackupCodes(codes.map(c => c.code));
      setShowBackupCodes(true);
    }
  };

  const handleDownloadCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    setCodesDownloaded(true);
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  const handleCompleteSetup = () => {
    if (!codesDownloaded && backupCodes.length > 0) {
      return;
    }
    
    updateSetupProgress({
      currentStep: SetupStep.COMPLETION,
      completedSteps: [...completedSteps, SetupStep.BACKUP_CODES]
    });

    setTimeout(() => {
      onComplete?.();
    }, 2000);
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Authentication Method</h2>
        <p className="mt-2 text-gray-600">Select how you'd like to receive your verification codes</p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => handleMethodSelect(TwoFactorMethodType.TOTP)}
          className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Smartphone className="h-8 w-8 text-blue-600 mr-4" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Authenticator App</h3>
            <p className="text-sm text-gray-600">Use Google Authenticator, Authy, or similar apps</p>
          </div>
        </button>

        <button
          onClick={() => handleMethodSelect(TwoFactorMethodType.SMS)}
          className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Mail className="h-8 w-8 text-green-600 mr-4" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Text Message</h3>
            <p className="text-sm text-gray-600">Receive codes via SMS on your phone</p>
          </div>
        </button>

        <button
          onClick={() => handleMethodSelect(TwoFactorMethodType.EMAIL)}
          className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Mail className="h-8 w-8 text-purple-600 mr-4" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Email</h3>
            <p className="text-sm text-gray-600">Receive codes via email</p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderTOTPSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Smartphone className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Set Up Authenticator App</h2>
        <p className="mt-2 text-gray-600">Scan the QR code or enter the key manually</p>
      </div>

      {totpSetup && (
        <div className="space-y-4">
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-100 p-4 rounded">
                <div className="w-48 h-48 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600">QR Code</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Can't scan? Enter this code manually:</p>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all">
                {totpSetup.manualEntryKey}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter the 6-digit code
            </label>
            <input
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="000000"
            />
          </div>

          <button
            onClick={handleTOTPSetup}
            disabled={!verificationCode || verificationCode.length !== 6 || isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Verify and Enable
          </button>
        </div>
      )}
    </div>
  );

  const renderSMSSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Mail className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Set Up SMS Verification</h2>
        <p className="mt-2 text-gray-600">Enter your phone number to receive verification codes</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <button
          onClick={handleSMSSetup}
          disabled={!phoneNumber || isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Send Verification Code
        </button>
      </div>
    </div>
  );

  const renderEmailSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Mail className="mx-auto h-12 w-12 text-purple-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Set Up Email Verification</h2>
        <p className="mt-2 text-gray-600">Enter your email address to receive verification codes</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <button
          onClick={handleEmailSetup}
          disabled={!email || !AuthHelpers.isValidEmail(email) || isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Send Verification Code
        </button>
      </div>
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Enter Verification Code</h2>
        <p className="mt-2 text-gray-600">
          {selectedMethod === TwoFactorMethodType.SMS 
            ? 'Enter the 6-digit code sent to your phone'
            : 'Enter the 6-digit code sent to your email'
          }
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl"
            placeholder="000000"
          />
        </div>

        <button
          onClick={handleVerification}
          disabled={!verificationCode || verificationCode.length !== 6 || isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Verify and Enable
        </button>
      </div>
    </div>
  );

  const renderBackupCodes = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Generate Backup Codes</h2>
        <p className="mt-2 text-gray-600">Save these codes in a safe place for account recovery</p>
      </div>

      {!showBackupCodes ? (
        <button
          onClick={handleGenerateBackupCodes}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Generate Backup Codes
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Save these codes in a secure location</li>
                  <li>Each code can only be used once</li>
                  <li>Keep them away from your main device</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="bg-white p-2 rounded border border-gray-300">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopyCodes}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Codes
            </button>
            <button
              onClick={handleDownloadCodes}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          </div>

          <button
            onClick={handleCompleteSetup}
            disabled={!codesDownloaded && backupCodes.length > 0}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Setup
          </button>
        </div>
      )}
    </div>
  );

  const renderCompletion = () => (
    <div className="text-center space-y-6">
      <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication Enabled!</h2>
        <p className="mt-2 text-gray-600">Your account is now protected with an additional layer of security.</p>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {[SetupStep.METHOD_SELECTION, SetupStep.SETUP_TOTP, SetupStep.VERIFICATION, SetupStep.BACKUP_CODES, SetupStep.COMPLETION].map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                completedSteps.includes(step) || currentStep === step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {completedSteps.includes(step) ? '✓' : index + 1}
            </div>
            {index < 4 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  completedSteps.includes(step) ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>Method</span>
        <span>Setup</span>
        <span>Verify</span>
        <span>Backup</span>
        <span>Done</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      {renderProgress()}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{error.message}</p>
          </div>
        </div>
      )}

      {currentStep === SetupStep.METHOD_SELECTION && renderMethodSelection()}
      {currentStep === SetupStep.SETUP_TOTP && renderTOTPSetup()}
      {currentStep === SetupStep.SETUP_SMS && renderSMSSetup()}
      {currentStep === SetupStep.SETUP_EMAIL && renderEmailSetup()}
      {currentStep === SetupStep.VERIFICATION && renderVerification()}
      {currentStep === SetupStep.BACKUP_CODES && renderBackupCodes()}
      {currentStep === SetupStep.COMPLETION && renderCompletion()}

      {onCancel && currentStep !== SetupStep.COMPLETION && (
        <button
          onClick={onCancel}
          className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
};
