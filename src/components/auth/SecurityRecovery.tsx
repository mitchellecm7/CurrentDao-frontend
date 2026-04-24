import React, { useState } from 'react';
import { Shield, AlertTriangle, Mail, Phone, MessageSquare, Send, CheckCircle, Clock, User, FileText } from 'lucide-react';
import { useTwoFactor } from '../../hooks/useTwoFactor';
import { RecoveryReason, SecurityRecoveryRequest } from '../../types/auth';
import { AuthHelpers } from '../../utils/authHelpers';

interface SecurityRecoveryProps {
  userId: string;
  onRecoveryComplete?: () => void;
}

export const SecurityRecovery: React.FC<SecurityRecoveryProps> = ({
  userId,
  onRecoveryComplete
}) => {
  const { 
    state, 
    isLoading, 
    error, 
    initiateRecovery, 
    clearError 
  } = useTwoFactor({ userId });

  const [selectedReason, setSelectedReason] = useState<RecoveryReason | null>(null);
  const [contactMethod, setContactMethod] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [recoverySubmitted, setRecoverySubmitted] = useState(false);
  const [recoveryId, setRecoveryId] = useState<string | null>(null);

  const recoveryOptions = [
    {
      reason: RecoveryReason.LOST_DEVICE,
      title: 'Lost Device with Authenticator App',
      description: 'I lost my phone/device that has my authenticator app',
      icon: <Phone className="h-5 w-5" />,
      recommendedContact: 'email'
    },
    {
      reason: RecoveryReason.LOST_PHONE,
      title: 'Lost Phone (SMS Codes)',
      description: 'I lost my phone and can\'t receive SMS verification codes',
      icon: <Phone className="h-5 w-5" />,
      recommendedContact: 'email'
    },
    {
      reason: RecoveryReason.APP_NOT_WORKING,
      title: 'Authenticator App Not Working',
      description: 'My authenticator app is not generating correct codes',
      icon: <AlertTriangle className="h-5 w-5" />,
      recommendedContact: 'email'
    },
    {
      reason: RecoveryReason.PHONE_NUMBER_CHANGED,
      title: 'Phone Number Changed',
      description: 'My phone number has changed and I can\'t receive SMS codes',
      icon: <Phone className="h-5 w-5" />,
      recommendedContact: 'email'
    },
    {
      reason: RecoveryReason.EMAIL_CHANGED,
      title: 'Email Address Changed',
      description: 'My email address has changed and I can\'t receive email codes',
      icon: <Mail className="h-5 w-5" />,
      recommendedContact: 'phone'
    },
    {
      reason: RecoveryReason.BACKUP_CODES_LOST,
      title: 'Lost Backup Codes',
      description: 'I lost or used all my backup codes',
      icon: <FileText className="h-5 w-5" />,
      recommendedContact: 'email'
    },
    {
      reason: RecoveryReason.OTHER,
      title: 'Other Issue',
      description: 'I\'m having a different problem with two-factor authentication',
      icon: <MessageSquare className="h-5 w-5" />,
      recommendedContact: 'email'
    }
  ];

  const handleReasonSelect = (reason: RecoveryReason) => {
    setSelectedReason(reason);
    const option = recoveryOptions.find(opt => opt.reason === reason);
    if (option) {
      setContactMethod(option.recommendedContact);
    }
    clearError();
  };

  const handleSubmitRecovery = async () => {
    if (!selectedReason || !contactMethod) return;

    const request: SecurityRecoveryRequest = {
      reason: selectedReason,
      contactMethod,
      additionalInfo: additionalInfo.trim() || undefined
    };

    const success = await initiateRecovery(request);
    
    if (success) {
      setRecoveryId(`REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
      setRecoverySubmitted(true);
    }
  };

  const getContactMethodIcon = () => {
    if (contactMethod.includes('@') || contactMethod === 'email') {
      return <Mail className="h-5 w-5" />;
    }
    return <Phone className="h-5 w-5" />;
  };

  const getContactMethodLabel = () => {
    if (contactMethod.includes('@') || contactMethod === 'email') {
      return 'Email Address';
    }
    return 'Phone Number';
  };

  const getContactMethodPlaceholder = () => {
    if (contactMethod.includes('@') || contactMethod === 'email') {
      return 'your@email.com';
    }
    return '+1 (555) 123-4567';
  };

  const validateContactMethod = () => {
    if (contactMethod === 'email') {
      return AuthHelpers.isValidEmail(contactMethod);
    }
    return contactMethod.length > 0;
  };

  const renderReasonSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Account Recovery</h2>
        <p className="mt-2 text-gray-600">Tell us why you need help accessing your account</p>
      </div>

      <div className="grid gap-3">
        {recoveryOptions.map((option) => (
          <button
            key={option.reason}
            onClick={() => handleReasonSelect(option.reason)}
            className={`p-4 border rounded-lg text-left transition-colors ${
              selectedReason === option.reason
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                selectedReason === option.reason
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{option.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderContactForm = () => {
    const selectedOption = recoveryOptions.find(opt => opt.reason === selectedReason);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
          <p className="mt-2 text-gray-600">
            How should we contact you about this recovery request?
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Selected Issue:</p>
              <p>{selectedOption?.title}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getContactMethodLabel()}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getContactMethodIcon()}
              </div>
              <input
                type="text"
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  contactMethod && !validateContactMethod()
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                placeholder={getContactMethodPlaceholder()}
              />
            </div>
            {contactMethod && !validateContactMethod() && (
              <p className="mt-1 text-sm text-red-600">
                Please enter a valid {contactMethod === 'email' ? 'email address' : 'phone number'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Information (Optional)
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide any additional details that might help us verify your identity..."
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setSelectedReason(null)}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSubmitRecovery}
            disabled={!validateContactMethod() || isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Request
          </button>
        </div>
      </div>
    );
  };

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Recovery Request Submitted</h2>
        <p className="mt-2 text-gray-600">
          We've received your recovery request and will contact you soon.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left max-w-sm mx-auto">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Request ID:</span>
            <span className="font-mono font-semibold">{recoveryId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Contact Method:</span>
            <span>{contactMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Submitted:</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm mx-auto">
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 text-left">
            <p className="font-semibold mb-1">What happens next?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Our support team will review your request</li>
              <li>We'll contact you at the provided information</li>
              <li>Response time is typically within 24 hours</li>
              <li>Keep your Request ID for reference</li>
            </ul>
          </div>
        </div>
      </div>

      <button
        onClick={onRecoveryComplete}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Got it
      </button>
    </div>
  );

  const renderSecurityNotice = () => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-yellow-800">
          <h4 className="font-semibold mb-2">Security Verification Required</h4>
          <p>
            For your protection, we need to verify your identity before restoring account access. 
            This process helps prevent unauthorized access to your account.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {!recoverySubmitted && renderSecurityNotice()}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{error.message}</p>
          </div>
        </div>
      )}

      {!recoverySubmitted && !selectedReason && renderReasonSelection()}
      {!recoverySubmitted && selectedReason && renderContactForm()}
      {recoverySubmitted && renderConfirmation()}
    </div>
  );
};
