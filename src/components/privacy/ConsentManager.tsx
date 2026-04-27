'use client';

import { useState } from 'react';
import { FileText, CheckCircle, XCircle, Clock, AlertTriangle, Download, Info } from 'lucide-react';
import { ConsentRecord } from '../../services/privacy/gdpr-compliance';
import { GDPRComplianceService } from '../../services/privacy/gdpr-compliance';

interface ConsentManagerProps {
  consentRecords: ConsentRecord[];
  onUpdateConsent: (consentTypeId: string, granted: boolean) => Promise<void>;
  isConsentValid: (consentTypeId: string) => boolean;
}

export function ConsentManager({ consentRecords, onUpdateConsent, isConsentValid }: ConsentManagerProps) {
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const consentTypes = GDPRComplianceService.getConsentTypes();
  const hasAllRequiredConsents = consentTypes
    .filter(ct => ct.required)
    .every(ct => {
      const consent = consentRecords.find(cr => cr.consentType.id === ct.id);
      return consent && consent.granted && isConsentValid(ct.id);
    });

  const handleConsentUpdate = async (consentTypeId: string, granted: boolean) => {
    setIsUpdating(consentTypeId);
    try {
      await onUpdateConsent(consentTypeId, granted);
    } finally {
      setIsUpdating(null);
    }
  };

  const getConsentStatus = (consentTypeId: string) => {
    const consent = consentRecords.find(cr => cr.consentType.id === consentTypeId);
    if (!consent) return 'not-granted';
    if (!consent.granted) return 'denied';
    if (!isConsentValid(consentTypeId)) return 'expired';
    return 'granted';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'expired':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'denied':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'expired':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'analytics':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'marketing':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'functional':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const generateConsentReceipt = () => {
    const receipt = GDPRComplianceService.generateConsentReceipt(consentRecords);
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent-receipt-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">GDPR Consent Management</h2>
          <p className="text-gray-600 mt-1">
            Manage your consent preferences for data processing and tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasAllRequiredConsents ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">All Required Consents Granted</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Action Required</span>
            </div>
          )}
          <button
            onClick={generateConsentReceipt}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
        </div>
      </div>

      {/* Consent Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['essential', 'analytics', 'marketing', 'functional'].map(category => {
          const categoryConsents = consentTypes.filter(ct => ct.category === category);
          const grantedCount = categoryConsents.filter(ct => {
            const status = getConsentStatus(ct.id);
            return status === 'granted';
          }).length;

          return (
            <div key={category} className={`border rounded-lg p-4 ${getCategoryColor(category)}`}>
              <h3 className="font-semibold capitalize mb-2">{category}</h3>
              <p className="text-sm opacity-75 mb-3">
                {grantedCount} of {categoryConsents.length} granted
              </p>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                <div
                  className="bg-current h-2 rounded-full transition-all"
                  style={{ width: `${(grantedCount / categoryConsents.length) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Consent List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Detailed Consents</h3>
        
        {consentTypes.map(consentType => {
          const status = getConsentStatus(consentType.id);
          const consent = consentRecords.find(cr => cr.consentType.id === consentType.id);
          const isExpanded = showDetails === consentType.id;

          return (
            <div key={consentType.id} className="border border-gray-200 rounded-lg">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{consentType.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(consentType.category)}`}>
                        {consentType.category}
                      </span>
                      {consentType.required && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-200">
                          Required
                        </span>
                      )}
                      <div className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="capitalize">{status.replace('-', ' ')}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{consentType.description}</p>
                    
                    {consent && (
                      <div className="text-xs text-gray-500">
                        Last updated: {new Date(consent.timestamp).toLocaleDateString()}
                        {consentType.retentionPeriod > 0 && (
                          <span className="ml-4">
                            Retention: {consentType.retentionPeriod} days
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDetails(isExpanded ? null : consentType.id)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    
                    {!consentType.required && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleConsentUpdate(consentType.id, false)}
                          disabled={isUpdating === consentType.id || status === 'denied'}
                          className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                            status === 'denied'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-700'
                          }`}
                        >
                          {isUpdating === consentType.id ? '...' : 'Deny'}
                        </button>
                        <button
                          onClick={() => handleConsentUpdate(consentType.id, true)}
                          disabled={isUpdating === consentType.id || status === 'granted'}
                          className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                            status === 'granted'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-green-100 hover:text-green-700'
                          }`}
                        >
                          {isUpdating === consentType.id ? '...' : 'Grant'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Purpose</h5>
                        <p className="text-gray-600">{consentType.description}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Legal Basis</h5>
                        <p className="text-gray-600">
                          {consentType.required 
                            ? 'Legitimate Interest / Contractual Necessity'
                            : 'Explicit Consent (GDPR Article 6(1)(a))'
                          }
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Data Retention</h5>
                        <p className="text-gray-600">
                          {consentType.retentionPeriod === 0 
                            ? 'Until withdrawal of consent'
                            : `${consentType.retentionPeriod} days from collection`
                          }
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Rights</h5>
                        <p className="text-gray-600">
                          Right to withdraw consent at any time
                        </p>
                      </div>
                    </div>
                    
                    {consent && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-2">Consent History</h5>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <span className="ml-2 font-medium">
                                {consent.granted ? 'Granted' : 'Denied'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Date:</span>
                              <span className="ml-2">
                                {new Date(consent.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Version:</span>
                              <span className="ml-2">{consent.version}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">IP Address:</span>
                              <span className="ml-2">{consent.ipAddress}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legal Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-2">Your GDPR Rights</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Right to withdraw consent at any time</li>
              <li>• Right to access your personal data</li>
              <li>• Right to data portability</li>
              <li>• Right to erasure ("right to be forgotten")</li>
              <li>• Right to object to processing</li>
              <li>• Right to restrict processing</li>
            </ul>
            <p className="text-xs text-blue-700 mt-3">
              For questions about your rights or to make a data subject request, contact our Data Protection Officer at privacy@currentdao.io
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
