import crypto from 'crypto';
import { 
  TwoFactorMethodType, 
  BackupCode, 
  TrustedDevice, 
  SecurityAuditLog,
  SecurityAction,
  AuthErrorCode,
  AuthError,
  TOTPSetup,
  RecoveryReason
} from '../types/auth';

export class AuthHelpers {
  static generateTOTPSecret(): string {
    return crypto.randomBytes(16).toString('base64').replace(/[^A-Za-z0-9]/g, '').substring(0, 32);
  }

  static generateBackupCodes(count: number = 10): BackupCode[] {
    const codes: BackupCode[] = [];
    for (let i = 0; i < count; i++) {
      const code = this.generateBackupCode();
      codes.push({
        id: crypto.randomUUID(),
        code,
        isUsed: false,
        createdAt: new Date()
      });
    }
    return codes;
  }

  private static generateBackupCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let code = '';
    for (let i = 0; i < 8; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  static validateTOTPCode(secret: string, token: string): boolean {
    try {
      const timeStep = Math.floor(Date.now() / 1000 / 30);
      const window = 1;
      
      for (let i = -window; i <= window; i++) {
        const time = timeStep + i;
        const expectedToken = this.generateTOTPToken(secret, time);
        if (token === expectedToken) {
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private static generateTOTPToken(secret: string, time: number): string {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(time), 0);
    
    const hmac = crypto.createHmac('sha1', secret);
    hmac.update(buffer);
    const hash = hmac.digest();
    
    const offset = hash[hash.length - 1] & 0x0f;
    const binary = 
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);
    
    return (binary % 1000000).toString().padStart(6, '0');
  }

  static generateQRCodeURL(secret: string, accountName: string, issuer: string): string {
    const params = new URLSearchParams({
      secret,
      issuer,
      algorithm: 'SHA1',
      digits: '6',
      period: '30'
    });
    
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?${params.toString()}`;
  }

  static validateSMSCode(phoneNumber: string, code: string): boolean {
    return /^\d{6}$/.test(code);
  }

  static validateEmailCode(email: string, code: string): boolean {
    return /^\d{6}$/.test(code);
  }

  static validateBackupCode(codes: BackupCode[], inputCode: string): BackupCode | null {
    const normalizedInput = inputCode.replace(/[-\s]/g, '').toUpperCase();
    
    for (const backupCode of codes) {
      const normalizedCode = backupCode.code.replace(/[-\s]/g, '').toUpperCase();
      if (!backupCode.isUsed && normalizedCode === normalizedInput) {
        return backupCode;
      }
    }
    return null;
  }

  static createTrustedDevice(name: string, userAgent: string, ipAddress: string): TrustedDevice {
    return {
      id: crypto.randomUUID(),
      name,
      userAgent,
      ipAddress,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      isActive: true
    };
  }

  static isDeviceTrusted(devices: TrustedDevice[], userAgent: string, ipAddress: string): boolean {
    return devices.some(device => 
      device.isActive && 
      device.userAgent === userAgent && 
      device.ipAddress === ipAddress
    );
  }

  static createAuditLog(
    action: SecurityAction,
    userId: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string,
    metadata?: Record<string, any>
  ): SecurityAuditLog {
    return {
      id: crypto.randomUUID(),
      action,
      userId,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      success,
      errorMessage,
      metadata
    };
  }

  static formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    return phoneNumber;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static sanitizeInput(input: string): string {
    return input.replace(/[<>]/g, '').trim();
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static hashDeviceFingerprint(userAgent: string, ipAddress: string): string {
    const data = `${userAgent}|${ipAddress}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static isRateLimited(lastAttempt: Date | undefined, maxAttempts: number, windowMinutes: number): boolean {
    if (!lastAttempt) return false;
    
    const windowMs = windowMinutes * 60 * 1000;
    const timeSinceLastAttempt = Date.now() - lastAttempt.getTime();
    
    return timeSinceLastAttempt < windowMs;
  }

  static createAuthError(code: AuthErrorCode, message: string, details?: any): AuthError {
    return {
      code,
      message,
      details
    };
  }

  static getMethodDisplayName(method: TwoFactorMethodType): string {
    switch (method) {
      case TwoFactorMethodType.TOTP:
        return 'Authenticator App';
      case TwoFactorMethodType.SMS:
        return 'SMS Text Message';
      case TwoFactorMethodType.EMAIL:
        return 'Email Code';
      case TwoFactorMethodType.BACKUP_CODE:
        return 'Backup Code';
      default:
        return 'Unknown Method';
    }
  }

  static getMethodDescription(method: TwoFactorMethodType): string {
    switch (method) {
      case TwoFactorMethodType.TOTP:
        return 'Use an authenticator app like Google Authenticator or Authy';
      case TwoFactorMethodType.SMS:
        return 'Receive a verification code via text message';
      case TwoFactorMethodType.EMAIL:
        return 'Receive a verification code via email';
      case TwoFactorMethodType.BACKUP_CODE:
        return 'Use a pre-generated backup code';
      default:
        return 'Unknown authentication method';
    }
  }

  static getRecoveryReasonDescription(reason: RecoveryReason): string {
    switch (reason) {
      case RecoveryReason.LOST_DEVICE:
        return 'I lost my device with the authenticator app';
      case RecoveryReason.LOST_PHONE:
        return 'I lost my phone and can\'t receive SMS codes';
      case RecoveryReason.APP_NOT_WORKING:
        return 'My authenticator app is not working';
      case RecoveryReason.PHONE_NUMBER_CHANGED:
        return 'My phone number has changed';
      case RecoveryReason.EMAIL_CHANGED:
        return 'My email address has changed';
      case RecoveryReason.BACKUP_CODES_LOST:
        return 'I lost my backup codes';
      case RecoveryReason.OTHER:
        return 'Other reason';
      default:
        return 'Unknown reason';
    }
  }

  static formatAuditLogMessage(log: SecurityAuditLog): string {
    switch (log.action) {
      case SecurityAction.TWO_FACTOR_ENABLED:
        return 'Two-factor authentication was enabled';
      case SecurityAction.TWO_FACTOR_DISABLED:
        return 'Two-factor authentication was disabled';
      case SecurityAction.BACKUP_CODES_GENERATED:
        return 'New backup codes were generated';
      case SecurityAction.BACKUP_CODE_USED:
        return 'A backup code was used for authentication';
      case SecurityAction.TRUSTED_DEVICE_ADDED:
        return 'A new trusted device was added';
      case SecurityAction.TRUSTED_DEVICE_REMOVED:
        return 'A trusted device was removed';
      case SecurityAction.LOGIN_ATTEMPT:
        return 'Login attempt initiated';
      case SecurityAction.LOGIN_SUCCESS:
        return 'Login successful';
      case SecurityAction.LOGIN_FAILED:
        return 'Login failed';
      case SecurityAction.RECOVERY_INITIATED:
        return 'Account recovery process initiated';
      case SecurityAction.RECOVERY_COMPLETED:
        return 'Account recovery process completed';
      case SecurityAction.METHOD_CHANGED:
        return 'Two-factor authentication method was changed';
      default:
        return 'Unknown security action';
    }
  }

  static isSecureConnection(): boolean {
    if (typeof window === 'undefined') return true;
    return window.location.protocol === 'https:';
  }

  static detectDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
      return /tablet|ipad/i.test(userAgent) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  }

  static getBrowserInfo(): string {
    if (typeof window === 'undefined') return 'unknown';
    return navigator.userAgent;
  }

  static getIPAddress(): Promise<string> {
    if (typeof window === 'undefined') return Promise.resolve('localhost');
    
    return fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => data.ip)
      .catch(() => 'unknown');
  }
}
