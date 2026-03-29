export interface TwoFactorMethod {
  id: string;
  type: TwoFactorMethodType;
  name: string;
  isEnabled: boolean;
  isPrimary: boolean;
  lastUsed?: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export enum TwoFactorMethodType {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  BACKUP_CODE = 'backup_code'
}

export interface TOTPSetup {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
  issuer: string;
  accountName: string;
}

export interface BackupCode {
  id: string;
  code: string;
  isUsed: boolean;
  usedAt?: Date;
  createdAt: Date;
}

export interface TrustedDevice {
  id: string;
  name: string;
  userAgent: string;
  ipAddress: string;
  location?: string;
  createdAt: Date;
  lastUsedAt: Date;
  isActive: boolean;
}

export interface SecurityAuditLog {
  id: string;
  action: SecurityAction;
  userId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export enum SecurityAction {
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  BACKUP_CODES_GENERATED = 'backup_codes_generated',
  BACKUP_CODE_USED = 'backup_code_used',
  TRUSTED_DEVICE_ADDED = 'trusted_device_added',
  TRUSTED_DEVICE_REMOVED = 'trusted_device_removed',
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  RECOVERY_INITIATED = 'recovery_initiated',
  RECOVERY_COMPLETED = 'recovery_completed',
  METHOD_CHANGED = 'method_changed'
}

export interface TwoFactorVerification {
  method: TwoFactorMethodType;
  code: string;
  rememberDevice?: boolean;
}

export interface SecurityRecoveryRequest {
  reason: RecoveryReason;
  contactMethod: string;
  additionalInfo?: string;
}

export enum RecoveryReason {
  LOST_DEVICE = 'lost_device',
  LOST_PHONE = 'lost_phone',
  APP_NOT_WORKING = 'app_not_working',
  PHONE_NUMBER_CHANGED = 'phone_number_changed',
  EMAIL_CHANGED = 'email_changed',
  BACKUP_CODES_LOST = 'backup_codes_lost',
  OTHER = 'other'
}

export interface TwoFactorSetupProgress {
  currentStep: SetupStep;
  completedSteps: SetupStep[];
  selectedMethod?: TwoFactorMethodType;
  verificationData?: any;
}

export enum SetupStep {
  METHOD_SELECTION = 'method_selection',
  SETUP_TOTP = 'setup_totp',
  SETUP_SMS = 'setup_sms',
  SETUP_EMAIL = 'setup_email',
  VERIFICATION = 'verification',
  BACKUP_CODES = 'backup_codes',
  COMPLETION = 'completion'
}

export interface TwoFactorState {
  isEnabled: boolean;
  methods: TwoFactorMethod[];
  primaryMethod?: TwoFactorMethod;
  backupCodes: BackupCode[];
  trustedDevices: TrustedDevice[];
  auditLogs: SecurityAuditLog[];
  setupProgress?: TwoFactorSetupProgress;
}

export interface TwoFactorConfig {
  requireTwoFactor: boolean;
  allowedMethods: TwoFactorMethodType[];
  sessionTimeout: number;
  maxTrustedDevices: number;
  backupCodeCount: number;
  enableRecovery: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export enum AuthErrorCode {
  INVALID_CODE = 'invalid_code',
  CODE_EXPIRED = 'code_expired',
  METHOD_NOT_ENABLED = 'method_not_enabled',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  BACKUP_CODE_USED = 'backup_code_used',
  NO_BACKUP_CODES = 'no_backup_codes',
  DEVICE_NOT_TRUSTED = 'device_not_trusted',
  RECOVERY_NOT_ALLOWED = 'recovery_not_allowed',
  SETUP_INCOMPLETE = 'setup_incomplete'
}
