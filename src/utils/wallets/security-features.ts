// Wallet Security Features and Backup Management Utilities

import crypto from 'crypto'

// Security Types
export interface SecuritySettings {
  requirePassword: boolean
  sessionTimeout: number // in minutes
  biometricAuth: boolean
  twoFactorAuth: boolean
  whitelist: string[] // allowed domains
  encryptionEnabled: boolean
  autoLock: boolean
  maxFailedAttempts: number
}

export interface BackupData {
  id: string
  walletId: string
  type: 'mnemonic' | 'private_key' | 'keystore' | 'hardware' | 'cloud'
  encrypted: boolean
  backupDate: Date
  location?: string // cloud storage path
  checksum: string
  version: string
  metadata: {
    deviceInfo?: string
    appVersion: string
    encryptionAlgorithm: string
    keyDerivationFunction: string
  }
}

export interface SecurityAudit {
  id: string
  walletId: string
  timestamp: Date
  issues: SecurityIssue[]
  score: number // 0-100
  recommendations: string[]
  lastBackupDate?: Date
  failedLoginAttempts: number
  suspiciousActivities: SecurityActivity[]
}

export interface SecurityIssue {
  type: 'weak_password' | 'old_backup' | 'suspicious_activity' | 'outdated_software' | 'unencrypted_backup' | 'public_key_exposure'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  recommendation: string
  detectedAt: Date
}

export interface SecurityActivity {
  id: string
  walletId: string
  type: 'login_attempt' | 'password_change' | 'backup_created' | 'backup_restored' | 'suspicious_login' | 'device_change'
  timestamp: Date
  ipAddress?: string
  userAgent?: string
  location?: string
  success: boolean
  details?: string
}

export interface EncryptionResult {
  encryptedData: string
  iv: string
  salt: string
  algorithm: string
  keyDerivationInfo: {
    iterations: number
    salt: string
    hashFunction: string
  }
}

// Security Configuration
const SECURITY_CONFIG = {
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
    keyDerivation: {
      algorithm: 'pbkdf2',
      iterations: 100000,
      hashFunction: 'sha256',
      saltLength: 32
    }
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 // days
  },
  session: {
    defaultTimeout: 30, // minutes
    maxTimeout: 1440, // 24 hours
    warningThreshold: 5 // minutes before timeout
  },
  backup: {
    recommendedFrequency: 7, // days
    maxRetention: 90, // days
    encryptionRequired: true
  },
  audit: {
    maxFailedAttempts: 5,
    lockoutDuration: 15, // minutes
    suspiciousActivityThreshold: 3
  }
}

// Password Security
export class PasswordSecurity {
  static validatePassword(password: string): {
    isValid: boolean
    issues: string[]
    strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  } {
    const issues: string[] = []
    const config = SECURITY_CONFIG.password

    if (password.length < config.minLength) {
      issues.push(`Password must be at least ${config.minLength} characters long`)
    }

    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter')
    }

    if (config.requireLowercase && !/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter')
    }

    if (config.requireNumbers && !/\d/.test(password)) {
      issues.push('Password must contain at least one number')
    }

    if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push('Password must contain at least one special character')
    }

    // Check for common patterns
    const commonPatterns = [
      /123456/, /password/i, /qwerty/i, /admin/i, /letmein/i,
      /(.)\1{2,}/, // repeated characters
      /012345/, /abcde/i
    ]

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        issues.push('Password contains common or weak patterns')
        break
      }
    }

    const strength = this.calculatePasswordStrength(password)

    return {
      isValid: issues.length === 0,
      issues,
      strength
    }
  }

  static calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' | 'very-strong' {
    let score = 0

    // Length
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1

    // Character variety
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1

    // Entropy (simplified)
    const uniqueChars = new Set(password).size
    if (uniqueChars >= password.length * 0.5) score += 1
    if (uniqueChars >= password.length * 0.7) score += 1

    // No common patterns
    const commonPatterns = [/123456/, /password/i, /qwerty/i]
    const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password))
    if (!hasCommonPattern) score += 1

    if (score <= 3) return 'weak'
    if (score <= 5) return 'medium'
    if (score <= 7) return 'strong'
    return 'very-strong'
  }

  static generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    password += '0123456789'[Math.floor(Math.random() * 10)]
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
    
    // Fill the rest
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }
}

// Encryption Utilities
export class WalletEncryption {
  static async encrypt(data: string, password: string): Promise<EncryptionResult> {
    const config = SECURITY_CONFIG.encryption
    
    // Generate salt for key derivation
    const salt = crypto.randomBytes(config.keyDerivation.saltLength)
    
    // Derive key from password
    const { key, iterations } = await this.deriveKey(password, salt)
    
    // Generate IV
    const iv = crypto.randomBytes(config.ivLength)
    
    // Create cipher
    const cipher = crypto.createCipher(config.algorithm, key)
    cipher.setAAD(Buffer.from('wallet-data'))
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return {
      encryptedData: encrypted + tag.toString('hex'),
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      algorithm: config.algorithm,
      keyDerivationInfo: {
        iterations,
        salt: salt.toString('hex'),
        hashFunction: config.keyDerivation.hashFunction
      }
    }
  }

  static async decrypt(encryptedData: string, password: string, iv: string, salt: string): Promise<string> {
    const config = SECURITY_CONFIG.encryption
    
    // Derive key from password
    const { key } = await this.deriveKey(password, Buffer.from(salt, 'hex'))
    
    // Create decipher
    const decipher = crypto.createDecipher(config.algorithm, key)
    decipher.setAAD(Buffer.from('wallet-data'))
    
    // Split encrypted data and tag
    const tagLength = config.tagLength * 2 // hex characters
    const encrypted = encryptedData.slice(0, -tagLength)
    const tag = encryptedData.slice(-tagLength)
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'))
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  private static async deriveKey(password: string, salt: Buffer): Promise<{ key: Buffer; iterations: number }> {
    const config = SECURITY_CONFIG.encryption.keyDerivation
    
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, config.iterations, config.keyLength, config.hashFunction, (err, derivedKey) => {
        if (err) reject(err)
        else resolve({ key: derivedKey, iterations: config.iterations })
      })
    })
  }

  static generateChecksum(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  static verifyChecksum(data: string, checksum: string): boolean {
    const calculatedChecksum = this.generateChecksum(data)
    return calculatedChecksum === checksum
  }
}

// Backup Management
export class BackupManager {
  static async createBackup(walletData: any, password: string, type: BackupData['type']): Promise<BackupData> {
    const backupId = `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const backupDate = new Date()
    
    // Serialize wallet data
    const serializedData = JSON.stringify(walletData)
    
    // Encrypt if password provided
    let encryptedData: string
    let encryptionResult: EncryptionResult | null = null
    
    if (password && type !== 'hardware') {
      encryptionResult = await WalletEncryption.encrypt(serializedData, password)
      encryptedData = JSON.stringify(encryptionResult)
    } else {
      encryptedData = serializedData
    }
    
    // Generate checksum
    const checksum = WalletEncryption.generateChecksum(encryptedData)
    
    const backup: BackupData = {
      id: backupId,
      walletId: walletData.id,
      type,
      encrypted: !!password,
      backupDate,
      checksum,
      version: '1.0.0',
      metadata: {
        appVersion: '1.0.0',
        encryptionAlgorithm: encryptionResult?.algorithm || 'none',
        keyDerivationFunction: encryptionResult?.keyDerivationInfo.hashFunction || 'none',
        deviceInfo: this.getDeviceInfo()
      }
    }
    
    // Store backup (in real implementation, would save to storage/cloud)
    console.log('Backup created:', backup)
    
    return backup
  }

  static async restoreBackup(backupId: string, password?: string): Promise<any> {
    // In real implementation, would fetch backup from storage
    const mockBackup: BackupData = {
      id: backupId,
      walletId: 'wallet-123',
      type: 'encrypted',
      encrypted: !!password,
      backupDate: new Date(),
      checksum: 'mock-checksum',
      version: '1.0.0',
      metadata: {
        appVersion: '1.0.0',
        encryptionAlgorithm: 'aes-256-gcm',
        keyDerivationFunction: 'pbkdf2'
      }
    }
    
    // Verify checksum
    // const storedData = await this.fetchBackupData(backupId)
    // if (!WalletEncryption.verifyChecksum(storedData, mockBackup.checksum)) {
    //   throw new Error('Backup integrity check failed')
    // }
    
    // Decrypt if necessary
    if (mockBackup.encrypted && password) {
      // const encryptionResult = JSON.parse(storedData)
      // const decryptedData = await WalletEncryption.decrypt(
      //   encryptionResult.encryptedData,
      //   password,
      //   encryptionResult.iv,
      //   encryptionResult.salt
      // )
      // return JSON.parse(decryptedData)
      console.log('Decrypting backup with password')
    }
    
    return { id: mockBackup.walletId, restored: true }
  }

  static async verifyBackupIntegrity(backupId: string): Promise<boolean> {
    // In real implementation, would fetch and verify backup
    return true
  }

  static getBackupRecommendations(walletId: string): string[] {
    const recommendations: string[] = []
    
    // Check last backup date
    const lastBackupDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
    const daysSinceBackup = Math.floor((Date.now() - lastBackupDate.getTime()) / (24 * 60 * 60 * 1000))
    
    if (daysSinceBackup > SECURITY_CONFIG.backup.recommendedFrequency) {
      recommendations.push(`Create a new backup (last backup was ${daysSinceBackup} days ago)`)
    }
    
    recommendations.push('Store backup in multiple secure locations')
    recommendations.push('Test your backup restoration process regularly')
    recommendations.push('Use a strong password for encrypted backups')
    
    return recommendations
  }

  private static getDeviceInfo(): string {
    if (typeof window !== 'undefined') {
      return `${navigator.platform} - ${navigator.userAgent}`
    }
    return 'Unknown device'
  }
}

// Security Audit
export class SecurityAuditor {
  static async performSecurityAudit(walletId: string, settings: SecuritySettings): Promise<SecurityAudit> {
    const issues: SecurityIssue[] = []
    const activities: SecurityActivity[] = []
    
    // Check password requirements
    if (!settings.requirePassword) {
      issues.push({
        type: 'weak_password',
        severity: 'high',
        description: 'Password protection is disabled',
        recommendation: 'Enable password protection for your wallet',
        detectedAt: new Date()
      })
    }
    
    // Check session timeout
    if (settings.sessionTimeout > SECURITY_CONFIG.session.maxTimeout) {
      issues.push({
        type: 'weak_password',
        severity: 'medium',
        description: 'Session timeout is too long',
        recommendation: 'Reduce session timeout to improve security',
        detectedAt: new Date()
      })
    }
    
    // Check two-factor authentication
    if (!settings.twoFactorAuth) {
      issues.push({
        type: 'weak_password',
        severity: 'medium',
        description: 'Two-factor authentication is disabled',
        recommendation: 'Enable 2FA for additional security',
        detectedAt: new Date()
      })
    }
    
    // Check backup status
    const lastBackupDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    const daysSinceBackup = Math.floor((Date.now() - lastBackupDate.getTime()) / (24 * 60 * 60 * 1000))
    
    if (daysSinceBackup > SECURITY_CONFIG.backup.recommendedFrequency * 2) {
      issues.push({
        type: 'old_backup',
        severity: 'high',
        description: `No recent backup found (last backup: ${daysSinceBackup} days ago)`,
        recommendation: 'Create a fresh backup of your wallet',
        detectedAt: new Date()
      })
    }
    
    // Check for suspicious activities (mock data)
    const failedAttempts = 2
    if (failedAttempts >= SECURITY_CONFIG.audit.maxFailedAttempts) {
      issues.push({
        type: 'suspicious_activity',
        severity: 'critical',
        description: 'Multiple failed login attempts detected',
        recommendation: 'Review account activity and consider changing password',
        detectedAt: new Date()
      })
      
      activities.push({
        id: `activity-${Date.now()}`,
        walletId,
        type: 'suspicious_login',
        timestamp: new Date(),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        success: false,
        details: 'Failed login attempt'
      })
    }
    
    // Calculate security score
    const score = this.calculateSecurityScore(issues, settings)
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(issues, settings)
    
    return {
      id: `audit-${Date.now()}`,
      walletId,
      timestamp: new Date(),
      issues,
      score,
      recommendations,
      lastBackupDate,
      failedLoginAttempts: failedAttempts,
      suspiciousActivities: activities
    }
  }

  private static calculateSecurityScore(issues: SecurityIssue[], settings: SecuritySettings): number {
    let score = 100
    
    // Deduct points for issues based on severity
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 25
          break
        case 'high':
          score -= 15
          break
        case 'medium':
          score -= 10
          break
        case 'low':
          score -= 5
          break
      }
    })
    
    // Add points for enabled security features
    if (settings.requirePassword) score += 5
    if (settings.twoFactorAuth) score += 10
    if (settings.biometricAuth) score += 5
    if (settings.encryptionEnabled) score += 10
    if (settings.autoLock) score += 5
    
    return Math.max(0, Math.min(100, score))
  }

  private static generateRecommendations(issues: SecurityIssue[], settings: SecuritySettings): string[] {
    const recommendations: string[] = []
    
    // Add recommendations based on issues
    issues.forEach(issue => {
      recommendations.push(issue.recommendation)
    })
    
    // Add general recommendations
    if (!settings.twoFactorAuth) {
      recommendations.push('Enable two-factor authentication for enhanced security')
    }
    
    if (settings.sessionTimeout > 60) {
      recommendations.push('Consider reducing session timeout for better security')
    }
    
    recommendations.push('Regularly review your wallet\'s security settings')
    recommendations.push('Keep your wallet software up to date')
    recommendations.push('Use unique, strong passwords for each wallet')
    
    return Array.from(new Set(recommendations)) // Remove duplicates
  }
}

// Session Management
export class SessionManager {
  private static sessions = new Map<string, { walletId: string; createdAt: Date; lastActivity: Date }>()
  
  static createSession(walletId: string, timeoutMinutes: number = SECURITY_CONFIG.session.defaultTimeout): string {
    const sessionId = crypto.randomBytes(32).toString('hex')
    const now = new Date()
    
    this.sessions.set(sessionId, {
      walletId,
      createdAt: now,
      lastActivity: now
    })
    
    // Set timeout for session expiration
    setTimeout(() => {
      this.sessions.delete(sessionId)
    }, timeoutMinutes * 60 * 1000)
    
    return sessionId
  }
  
  static validateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    
    // Update last activity
    session.lastActivity = new Date()
    return true
  }
  
  static destroySession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }
  
  static getActiveSessionCount(): number {
    return this.sessions.size
  }
  
  static cleanupExpiredSessions(): void {
    // In a real implementation, would check timestamps and remove expired sessions
    console.log('Cleaning up expired sessions')
  }
}

// Utility Functions
export const generateSecureRandom = (length: number): string => {
  return crypto.randomBytes(length).toString('hex')
}

export const isValidPublicKey = (publicKey: string): boolean => {
  // Stellar public key validation (simplified)
  return /^G[0-9A-Z]{55}$/.test(publicKey)
}

export const sanitizeInput = (input: string): string => {
  // Basic input sanitization
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim()
    .substring(0, 1000) // Limit length
}

export const detectSuspiciousActivity = (activity: SecurityActivity): boolean => {
  // Simple suspicious activity detection
  const suspiciousPatterns = [
    activity.type === 'suspicious_login',
    activity.type === 'login_attempt' && !activity.success,
    activity.ipAddress && activity.ipAddress.startsWith('10.0.0'), // Example suspicious IP range
  ]
  
  return suspiciousPatterns.some(pattern => pattern)
}

// Export all security utilities
export const WalletSecurity = {
  PasswordSecurity,
  WalletEncryption,
  BackupManager,
  SecurityAuditor,
  SessionManager,
  generateSecureRandom,
  isValidPublicKey,
  sanitizeInput,
  detectSuspiciousActivity,
  SECURITY_CONFIG
}
