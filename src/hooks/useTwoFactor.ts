import { useState, useEffect, useCallback } from 'react';
import { 
  TwoFactorState, 
  TwoFactorMethod, 
  TwoFactorMethodType, 
  BackupCode, 
  TrustedDevice, 
  SecurityAuditLog,
  TwoFactorVerification,
  SecurityRecoveryRequest,
  TwoFactorSetupProgress,
  SetupStep,
  TOTPSetup,
  AuthError,
  AuthErrorCode,
  SecurityAction
} from '../types/auth';
import { AuthHelpers } from '../utils/authHelpers';

interface UseTwoFactorOptions {
  userId: string;
  onStateChange?: (state: TwoFactorState) => void;
  onError?: (error: AuthError) => void;
}

export const useTwoFactor = (options: UseTwoFactorOptions) => {
  const [state, setState] = useState<TwoFactorState>({
    isEnabled: false,
    methods: [],
    backupCodes: [],
    trustedDevices: [],
    auditLogs: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    if (options.onStateChange) {
      options.onStateChange(state);
    }
  }, [state, options.onStateChange]);

  useEffect(() => {
    if (options.onError && error) {
      options.onError(error);
    }
  }, [error, options.onError]);

  const addAuditLog = useCallback((action: SecurityAction, success: boolean, errorMessage?: string, metadata?: Record<string, any>) => {
    const log = AuthHelpers.createAuditLog(
      action,
      options.userId,
      'current-ip',
      AuthHelpers.getBrowserInfo(),
      success,
      errorMessage,
      metadata
    );

    setState(prev => ({
      ...prev,
      auditLogs: [log, ...prev.auditLogs]
    }));

    return log;
  }, [options.userId]);

  const enableTwoFactor = useCallback(async (method: TwoFactorMethodType, setupData?: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      let newMethod: TwoFactorMethod | null = null;

      switch (method) {
        case TwoFactorMethodType.TOTP:
          if (!setupData?.verified) {
            throw AuthHelpers.createAuthError(AuthErrorCode.SETUP_INCOMPLETE, 'TOTP setup not verified');
          }
          newMethod = {
            id: crypto.randomUUID(),
            type: TwoFactorMethodType.TOTP,
            name: 'Authenticator App',
            isEnabled: true,
            isPrimary: state.methods.length === 0,
            createdAt: new Date(),
            metadata: { secret: setupData.secret }
          };
          break;

        case TwoFactorMethodType.SMS:
          if (!setupData?.phoneNumber || !setupData?.verified) {
            throw AuthHelpers.createAuthError(AuthErrorCode.SETUP_INCOMPLETE, 'SMS setup not verified');
          }
          newMethod = {
            id: crypto.randomUUID(),
            type: TwoFactorMethodType.SMS,
            name: `SMS (${setupData.phoneNumber})`,
            isEnabled: true,
            isPrimary: state.methods.length === 0,
            createdAt: new Date(),
            metadata: { phoneNumber: setupData.phoneNumber }
          };
          break;

        case TwoFactorMethodType.EMAIL:
          if (!setupData?.email || !setupData?.verified) {
            throw AuthHelpers.createAuthError(AuthErrorCode.SETUP_INCOMPLETE, 'Email setup not verified');
          }
          newMethod = {
            id: crypto.randomUUID(),
            type: TwoFactorMethodType.EMAIL,
            name: `Email (${setupData.email})`,
            isEnabled: true,
            isPrimary: state.methods.length === 0,
            createdAt: new Date(),
            metadata: { email: setupData.email }
          };
          break;

        default:
          throw AuthHelpers.createAuthError(AuthErrorCode.METHOD_NOT_ENABLED, 'Unsupported 2FA method');
      }

      if (newMethod) {
        setState(prev => ({
          ...prev,
          isEnabled: true,
          methods: [...prev.methods, newMethod],
          setupProgress: undefined
        }));

        addAuditLog(SecurityAction.TWO_FACTOR_ENABLED, true, undefined, { method: newMethod.type });
        return true;
      }

      return false;
    } catch (err) {
      const authError = err instanceof Error ? 
        AuthHelpers.createAuthError(AuthErrorCode.SETUP_INCOMPLETE, err.message) : 
        err as AuthError;
      
      setError(authError);
      addAuditLog(SecurityAction.TWO_FACTOR_ENABLED, false, authError.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [state.methods, addAuditLog]);

  const disableTwoFactor = useCallback(async (methodId?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      setState(prev => {
        let newMethods = prev.methods;
        
        if (methodId) {
          newMethods = prev.methods.filter(m => m.id !== methodId);
        } else {
          newMethods = [];
        }

        return {
          ...prev,
          isEnabled: newMethods.length > 0,
          methods: newMethods
        };
      });

      addAuditLog(SecurityAction.TWO_FACTOR_DISABLED, true, undefined, { methodId });
      return true;
    } catch (err) {
      const authError = err instanceof Error ? 
        AuthHelpers.createAuthError(AuthErrorCode.METHOD_NOT_ENABLED, err.message) : 
        err as AuthError;
      
      setError(authError);
      addAuditLog(SecurityAction.TWO_FACTOR_DISABLED, false, authError.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [addAuditLog]);

  const verifyCode = useCallback(async (verification: TwoFactorVerification): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const method = state.methods.find(m => m.type === verification.method);
      
      if (!method || !method.isEnabled) {
        throw AuthHelpers.createAuthError(AuthErrorCode.METHOD_NOT_ENABLED, 'Method not enabled');
      }

      let isValid = false;

      switch (verification.method) {
        case TwoFactorMethodType.TOTP:
          if (!method.metadata?.secret) {
            throw AuthHelpers.createAuthError(AuthErrorCode.INVALID_CODE, 'TOTP secret not found');
          }
          isValid = AuthHelpers.validateTOTPCode(method.metadata.secret, verification.code);
          break;

        case TwoFactorMethodType.SMS:
          isValid = AuthHelpers.validateSMSCode(method.metadata.phoneNumber, verification.code);
          break;

        case TwoFactorMethodType.EMAIL:
          isValid = AuthHelpers.validateEmailCode(method.metadata.email, verification.code);
          break;

        case TwoFactorMethodType.BACKUP_CODE:
          const backupCode = AuthHelpers.validateBackupCode(state.backupCodes, verification.code);
          if (backupCode) {
            isValid = true;
            setState(prev => ({
              ...prev,
              backupCodes: prev.backupCodes.map(code => 
                code.id === backupCode.id 
                  ? { ...code, isUsed: true, usedAt: new Date() }
                  : code
              )
            }));
            addAuditLog(SecurityAction.BACKUP_CODE_USED, true, undefined, { codeId: backupCode.id });
          } else {
            throw AuthHelpers.createAuthError(AuthErrorCode.INVALID_CODE, 'Invalid backup code');
          }
          break;

        default:
          throw AuthHelpers.createAuthError(AuthErrorCode.INVALID_CODE, 'Unsupported verification method');
      }

      if (!isValid) {
        throw AuthHelpers.createAuthError(AuthErrorCode.INVALID_CODE, 'Invalid verification code');
      }

      if (verification.rememberDevice) {
        await addTrustedDevice('Current Device');
      }

      addAuditLog(SecurityAction.LOGIN_SUCCESS, true, undefined, { method: verification.method });
      return true;
    } catch (err) {
      const authError = err instanceof Error ? 
        AuthHelpers.createAuthError(AuthErrorCode.INVALID_CODE, err.message) : 
        err as AuthError;
      
      setError(authError);
      addAuditLog(SecurityAction.LOGIN_FAILED, false, authError.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [state.methods, state.backupCodes, addAuditLog]);

  const generateBackupCodes = useCallback(async (count: number = 10): Promise<BackupCode[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const newCodes = AuthHelpers.generateBackupCodes(count);
      
      setState(prev => ({
        ...prev,
        backupCodes: newCodes
      }));

      addAuditLog(SecurityAction.BACKUP_CODES_GENERATED, true, undefined, { count });
      return newCodes;
    } catch (err) {
      const authError = err instanceof Error ? 
        AuthHelpers.createAuthError(AuthErrorCode.NO_BACKUP_CODES, err.message) : 
        err as AuthError;
      
      setError(authError);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [addAuditLog]);

  const addTrustedDevice = useCallback(async (name: string): Promise<TrustedDevice | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const device = AuthHelpers.createTrustedDevice(
        name,
        AuthHelpers.getBrowserInfo(),
        'current-ip'
      );

      setState(prev => ({
        ...prev,
        trustedDevices: [...prev.trustedDevices, device]
      }));

      addAuditLog(SecurityAction.TRUSTED_DEVICE_ADDED, true, undefined, { deviceId: device.id });
      return device;
    } catch (err) {
      const authError = err instanceof Error ? 
        AuthHelpers.createAuthError(AuthErrorCode.DEVICE_NOT_TRUSTED, err.message) : 
        err as AuthError;
      
      setError(authError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [addAuditLog]);

  const removeTrustedDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      setState(prev => ({
        ...prev,
        trustedDevices: prev.trustedDevices.filter(d => d.id !== deviceId)
      }));

      addAuditLog(SecurityAction.TRUSTED_DEVICE_REMOVED, true, undefined, { deviceId });
      return true;
    } catch (err) {
      const authError = err instanceof Error ? 
        AuthHelpers.createAuthError(AuthErrorCode.DEVICE_NOT_TRUSTED, err.message) : 
        err as AuthError;
      
      setError(authError);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [addAuditLog]);

  const initiateRecovery = useCallback(async (request: SecurityRecoveryRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      addAuditLog(SecurityAction.RECOVERY_INITIATED, true, undefined, { 
        reason: request.reason,
        contactMethod: request.contactMethod 
      });
      
      return true;
    } catch (err) {
      const authError = err instanceof Error ? 
        AuthHelpers.createAuthError(AuthErrorCode.RECOVERY_NOT_ALLOWED, err.message) : 
        err as AuthError;
      
      setError(authError);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [addAuditLog]);

  const setupTOTP = useCallback((): TOTPSetup => {
    const secret = AuthHelpers.generateTOTPSecret();
    const accountName = `user_${options.userId}`;
    const issuer = 'CurrentDAO';
    
    return {
      secret,
      qrCode: AuthHelpers.generateQRCodeURL(secret, accountName, issuer),
      manualEntryKey: secret,
      issuer,
      accountName
    };
  }, [options.userId]);

  const updateSetupProgress = useCallback((progress: Partial<TwoFactorSetupProgress>) => {
    setState(prev => ({
      ...prev,
      setupProgress: {
        currentStep: progress.currentStep || prev.setupProgress?.currentStep || SetupStep.METHOD_SELECTION,
        completedSteps: progress.completedSteps || prev.setupProgress?.completedSteps || [],
        selectedMethod: progress.selectedMethod || prev.setupProgress?.selectedMethod,
        verificationData: progress.verificationData || prev.setupProgress?.verificationData
      }
    }));
  }, []);

  const resetSetupProgress = useCallback(() => {
    setState(prev => ({
      ...prev,
      setupProgress: undefined
    }));
  }, []);

  const isDeviceTrusted = useCallback((userAgent?: string, ipAddress?: string): boolean => {
    const currentUA = userAgent || AuthHelpers.getBrowserInfo();
    const currentIP = ipAddress || 'current-ip';
    
    return AuthHelpers.isDeviceTrusted(state.trustedDevices, currentUA, currentIP);
  }, [state.trustedDevices]);

  const getPrimaryMethod = useCallback((): TwoFactorMethod | undefined => {
    return state.methods.find(m => m.isPrimary) || state.methods[0];
  }, [state.methods]);

  const getAvailableMethods = useCallback((): TwoFactorMethodType[] => {
    return state.methods.filter(m => m.isEnabled).map(m => m.type);
  }, [state.methods]);

  const getRecentAuditLogs = useCallback((limit: number = 50): SecurityAuditLog[] => {
    return state.auditLogs.slice(0, limit);
  }, [state.auditLogs]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    state,
    isLoading,
    error,
    enableTwoFactor,
    disableTwoFactor,
    verifyCode,
    generateBackupCodes,
    addTrustedDevice,
    removeTrustedDevice,
    initiateRecovery,
    setupTOTP,
    updateSetupProgress,
    resetSetupProgress,
    isDeviceTrusted,
    getPrimaryMethod,
    getAvailableMethods,
    getRecentAuditLogs,
    clearError
  };
};
