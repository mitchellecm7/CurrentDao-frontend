'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { AlertCircle, CheckCircle, Shield, Key, Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';

interface SecurityKey {
  id: string;
  name: string;
  type: 'yubikey' | 'solokey' | 'nitrokey' | 'platform' | 'unknown';
  isSupported: boolean;
  isRegistered: boolean;
  lastUsed?: Date;
  capabilities: string[];
}

interface HardwareSecurityProps {
  onKeyRegistered?: (key: SecurityKey) => void;
  onKeyRemoved?: (keyId: string) => void;
  enableBiometric?: boolean;
  supportedKeyTypes?: string[];
}

const HardwareSecurity: React.FC<HardwareSecurityProps> = ({
  onKeyRegistered,
  onKeyRemoved,
  enableBiometric = true,
  supportedKeyTypes = ['yubikey', 'solokey', 'nitrokey', 'platform'],
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [securityKeys, setSecurityKeys] = useState<SecurityKey[]>([]);
  const [selectedKey, setSelectedKey] = useState<SecurityKey | null>(null);
  const [authResult, setAuthResult] = useState<'success' | 'error' | 'cancelled' | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [webAuthnSupported, setWebAuthnSupported] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<'idle' | 'registering' | 'verifying' | 'complete'>('idle');

  // Check WebAuthn support
  useEffect(() => {
    const checkWebAuthnSupport = () => {
      const supported = 
        typeof window !== 'undefined' && 
        'credentials' in navigator && 
        'PublicKeyCredential' in window &&
        'PublicKeyCredential' in window;
      
      setWebAuthnSupported(supported);
      
      if (supported) {
        checkBiometricSupport();
        detectSecurityKeys();
      }
    };

    checkWebAuthnSupport();
  }, []);

  // Check biometric support
  const checkBiometricSupport = useCallback(async () => {
    if (!enableBiometric) return;

    try {
      // Check if biometric authentication is available
      if ('credentials' in navigator && 'PublicKeyCredential' in window) {
        const available = await (PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable();
        setBiometricAvailable(available);
      }
    } catch (error) {
      console.log('Biometric support check failed:', error);
      setBiometricAvailable(false);
    }
  }, [enableBiometric]);

  // Detect available security keys
  const detectSecurityKeys = useCallback(async () => {
    try {
      // This would typically involve checking connected USB devices or platform authenticators
      // For demo purposes, we'll simulate key detection
      const detectedKeys: SecurityKey[] = [
        {
          id: 'platform-authenticator',
          name: 'Platform Authenticator',
          type: 'platform',
          isSupported: true,
          isRegistered: false,
          capabilities: ['biometric', 'pin'],
        },
        {
          id: 'yubikey-demo',
          name: 'YubiKey 5 NFC',
          type: 'yubikey',
          isSupported: true,
          isRegistered: false,
          capabilities: ['nfc', 'usb', 'touch'],
        },
      ];

      setSecurityKeys(detectedKeys);
    } catch (error) {
      console.error('Failed to detect security keys:', error);
    }
  }, []);

  // Register a new security key
  const registerSecurityKey = useCallback(async (key: SecurityKey) => {
    if (!webAuthnSupported) {
      toast.error('WebAuthn is not supported on this device');
      return;
    }

    setRegistrationStep('registering');
    setIsAuthenticating(true);

    try {
      // Create credential registration request
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
          name: 'CurrentDao',
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array(16),
          name: 'CurrentDao User',
          displayName: 'CurrentDao Energy Trader',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: key.type === 'platform' ? 'platform' : 'cross-platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'direct',
      };

      setRegistrationStep('verifying');

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (credential) {
        // Update key registration status
        const updatedKey = {
          ...key,
          isRegistered: true,
          lastUsed: new Date(),
        };

        setSecurityKeys(prev => 
          prev.map(k => k.id === key.id ? updatedKey : k)
        );
        
        setSelectedKey(updatedKey);
        setAuthResult('success');
        setRegistrationStep('complete');
        
        onKeyRegistered?.(updatedKey);
        
        toast.success('Security key registered successfully!');
      }

    } catch (error: any) {
      console.error('Key registration failed:', error);
      
      if (error.name === 'NotAllowedError') {
        setAuthResult('cancelled');
        toast('Registration cancelled');
      } else {
        setAuthResult('error');
        toast.error('Failed to register security key');
      }
    } finally {
      setIsAuthenticating(false);
      setRegistrationStep('idle');
    }
  }, [webAuthnSupported, onKeyRegistered]);

  // Authenticate with security key
  const authenticateWithKey = useCallback(async (key: SecurityKey) => {
    if (!webAuthnSupported || !key.isRegistered) {
      toast.error('Key not supported or not registered');
      return;
    }

    setIsAuthenticating(true);
    setAuthResult(null);

    try {
      // Create authentication request
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge,
        allowCredentials: [
          {
            id: new Uint8Array(16), // This would be the actual credential ID
            type: 'public-key',
            transports: ['usb', 'nfc', 'ble', 'internal'],
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      };

      // Get credential
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      if (assertion) {
        // Update last used time
        const updatedKey = {
          ...key,
          lastUsed: new Date(),
        };

        setSecurityKeys(prev => 
          prev.map(k => k.id === key.id ? updatedKey : k)
        );
        
        setAuthResult('success');
        toast.success('Authentication successful!');
        
        return true;
      }

    } catch (error: any) {
      console.error('Authentication failed:', error);
      
      if (error.name === 'NotAllowedError') {
        setAuthResult('cancelled');
        toast('Authentication cancelled');
      } else {
        setAuthResult('error');
        toast.error('Authentication failed');
      }
      
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [webAuthnSupported]);

  // Remove security key
  const removeSecurityKey = useCallback(async (keyId: string) => {
    const key = securityKeys.find(k => k.id === keyId);
    if (!key) return;

    // In a real implementation, this would involve server-side removal
    setSecurityKeys(prev => prev.filter(k => k.id !== keyId));
    
    if (selectedKey?.id === keyId) {
      setSelectedKey(null);
    }
    
    onKeyRemoved?.(keyId);
    toast.success('Security key removed');
  }, [securityKeys, selectedKey, onKeyRemoved]);

  // Test biometric authentication
  const testBiometricAuth = useCallback(async () => {
    if (!biometricAvailable || !webAuthnSupported) {
      toast.error('Biometric authentication not available');
      return;
    }

    setIsAuthenticating(true);

    try {
      // Create a simple biometric test
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge,
        allowCredentials: [], // Empty for biometric test
        userVerification: 'required',
        timeout: 60000,
      };

      await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      toast.success('Biometric authentication test successful!');
      setAuthResult('success');

    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        toast('Biometric test cancelled');
      } else {
        toast.error('Biometric authentication test failed');
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, [biometricAvailable, webAuthnSupported]);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border-2 border-red-500 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-red-500" />
          <h3 className="text-white font-bold text-lg">Hardware Security</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs ${
            webAuthnSupported ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            WebAuthn {webAuthnSupported ? '✓' : '✗'}
          </span>
          {biometricAvailable && (
            <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">
              Biometric ✓
            </span>
          )}
        </div>
      </div>

      {/* Registration Status */}
      {registrationStep !== 'idle' && (
        <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-yellow-400 animate-pulse" />
            <div>
              <div className="text-yellow-400 font-medium">
                {registrationStep === 'registering' && 'Registering Security Key...'}
                {registrationStep === 'verifying' && 'Verifying Identity...'}
                {registrationStep === 'complete' && 'Registration Complete!'}
              </div>
              <div className="text-yellow-300 text-sm mt-1">
                {registrationStep === 'registering' && 'Please follow your security key instructions'}
                {registrationStep === 'verifying' && 'Touch your security key or use biometric'}
                {registrationStep === 'complete' && 'Your security key is ready to use'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Keys List */}
      <div className="space-y-3 mb-6">
        {securityKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No security keys detected</p>
            <p className="text-sm mt-2">Connect a YubiKey or similar device</p>
          </div>
        ) : (
          securityKeys.map((key) => (
            <div
              key={key.id}
              className={`p-4 rounded-lg border transition-colors ${
                selectedKey?.id === key.id 
                  ? 'bg-red-500/20 border-red-500' 
                  : 'bg-gray-700/50 border-gray-600 hover:border-red-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    key.isRegistered ? 'bg-green-500/20' : 'bg-gray-600/50'
                  }`}>
                    {key.isRegistered ? (
                      <Lock className="w-5 h-5 text-green-400" />
                    ) : (
                      <Unlock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium">{key.name}</div>
                    <div className="text-sm text-gray-400">
                      {key.type.charAt(0).toUpperCase() + key.type.slice(1)} • 
                      {key.capabilities.join(', ')}
                    </div>
                    {key.lastUsed && (
                      <div className="text-xs text-gray-500 mt-1">
                        Last used: {key.lastUsed.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {key.isRegistered ? (
                    <>
                      <button
                        onClick={() => authenticateWithKey(key)}
                        disabled={isAuthenticating}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm text-white transition-colors"
                      >
                        {isAuthenticating ? 'Authenticating...' : 'Authenticate'}
                      </button>
                      <button
                        onClick={() => removeSecurityKey(key.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white transition-colors"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => registerSecurityKey(key)}
                      disabled={isAuthenticating || !key.isSupported}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm text-white transition-colors"
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Biometric Test */}
      {enableBiometric && biometricAvailable && (
        <div className="mb-6">
          <button
            onClick={testBiometricAuth}
            disabled={isAuthenticating}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors text-white"
          >
            <Shield className="w-5 h-5" />
            <span>Test Biometric Authentication</span>
            {isAuthenticating && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        </div>
      )}

      {/* Authentication Result */}
      {authResult && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${
          authResult === 'success' ? 'bg-green-500/20 border-green-500' :
          authResult === 'error' ? 'bg-red-500/20 border-red-500' :
          'bg-yellow-500/20 border-yellow-500'
        }`}>
          {authResult === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : authResult === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          )}
          <div className="text-sm">
            <div className={`font-medium ${
              authResult === 'success' ? 'text-green-400' :
              authResult === 'error' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {authResult === 'success' ? 'Authentication Successful' :
               authResult === 'error' ? 'Authentication Failed' : 'Authentication Cancelled'}
            </div>
            <div className="text-gray-400 mt-1">
              {authResult === 'success' ? 'You have been securely authenticated.' :
               authResult === 'error' ? 'Authentication failed. Please try again.' :
               'Authentication was cancelled by the user.'}
            </div>
          </div>
        </div>
      )}

      {/* Security Features */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Security Features</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">WebAuthn Support</span>
            <span className={webAuthnSupported ? 'text-green-400' : 'text-red-400'}>
              {webAuthnSupported ? '✓ Available' : '✗ Not Available'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Biometric Authentication</span>
            <span className={biometricAvailable ? 'text-green-400' : 'text-red-400'}>
              {biometricAvailable ? '✓ Available' : '✗ Not Available'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Hardware Keys</span>
            <span className={securityKeys.length > 0 ? 'text-green-400' : 'text-yellow-400'}>
              {securityKeys.length > 0 ? `${securityKeys.length} detected` : 'None detected'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Registered Keys</span>
            <span className={securityKeys.filter(k => k.isRegistered).length > 0 ? 'text-green-400' : 'text-gray-400'}>
              {securityKeys.filter(k => k.isRegistered).length} registered
            </span>
          </div>
        </div>
      </div>

      {/* Supported Key Types */}
      <div className="mt-6 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>Supported Key Types</span>
          <span>
            {supportedKeyTypes.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HardwareSecurity;
