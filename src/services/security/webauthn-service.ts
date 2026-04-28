import { 
  BiometricAuthenticationRequest,
  BiometricAuthenticationResult,
  TransactionConfirmationRequest,
  TransactionConfirmationResult,
  BiometricFallbackOption,
  FallbackVerificationResult
} from '@/types/biometric'

export interface BiometricSession {
  id: string
  deviceId: string
  userId: string
  createdAt: Date
  expiresAt: Date
  isValid: boolean
}

export interface BiometricSettings {
  thresholdAmount: number
  requireBiometricForSettings: boolean
  sessionDurationMinutes: number
  enabledModalities: string[]
  fallbackEnabled: boolean
}

export interface BiometricAuditLog {
  id: string
  userId: string
  deviceId: string
  action: 'authentication' | 'transaction_confirmation' | 'fallback_used'
  modality?: string
  status: 'success' | 'failure' | 'expired'
  timestamp: Date
  transactionAmount?: number
  sessionId?: string
  errorMessage?: string
}

class WebAuthnService {
  private sessions: Map<string, BiometricSession> = new Map()
  private auditLogs: BiometricAuditLog[] = []
  private defaultSettings: BiometricSettings = {
    thresholdAmount: 100,
    requireBiometricForSettings: true,
    sessionDurationMinutes: 5,
    enabledModalities: ['fingerprint', 'face'],
    fallbackEnabled: true
  }

  private async logAuditEvent(event: Omit<BiometricAuditLog, 'id' | 'timestamp'>): Promise<void> {
    const logEntry: BiometricAuditLog = {
      ...event,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }
    this.auditLogs.push(logEntry)
    
    // Store in localStorage for persistence
    try {
      const existingLogs = JSON.parse(localStorage.getItem('biometric_audit_logs') || '[]')
      existingLogs.push(logEntry)
      // Keep only last 1000 logs
      if (existingLogs.length > 1000) {
        existingLogs.splice(0, existingLogs.length - 1000)
      }
      localStorage.setItem('biometric_audit_logs', JSON.stringify(existingLogs))
    } catch (error) {
      console.warn('Failed to store audit log:', error)
    }
  }

  private isWebAuthnSupported(): boolean {
    return !!(navigator.credentials && navigator.credentials.create && navigator.credentials.get)
  }

  private async createCredentialOptions(): Promise<CredentialCreationOptions> {
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    return {
      publicKey: {
        challenge: challenge,
        rp: {
          name: 'CurrentDao',
          id: window.location.hostname
        },
        user: {
          id: new Uint8Array(16),
          name: 'user@currentdao.com',
          displayName: 'CurrentDao User'
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'direct'
      }
    }
  }

  private async getRequestOptions(challenge?: Uint8Array): Promise<CredentialRequestOptions> {
    const challengeArray = challenge || new Uint8Array(32)
    if (!challenge) {
      crypto.getRandomValues(challengeArray)
    }

    return {
      publicKey: {
        challenge: challengeArray,
        allowCredentials: [],
        userVerification: 'required',
        timeout: 60000
      }
    }
  }

  async registerBiometric(): Promise<boolean> {
    if (!this.isWebAuthnSupported()) {
      throw new Error('WebAuthn is not supported on this device')
    }

    try {
      const options = await this.createCredentialOptions()
      const credential = await navigator.credentials.create(options) as PublicKeyCredential
      
      if (credential) {
        // Store credential ID for future authentication
        const credentialId = Array.from(new Uint8Array(credential.rawId))
        localStorage.setItem('biometric_credential_id', JSON.stringify(credentialId))
        return true
      }
      
      return false
    } catch (error) {
      console.error('Biometric registration failed:', error)
      throw new Error('Failed to register biometric credentials')
    }
  }

  async authenticate(request: BiometricAuthenticationRequest): Promise<BiometricAuthenticationResult> {
    if (!this.isWebAuthnSupported()) {
      throw new Error('WebAuthn is not supported on this device')
    }

    const startTime = Date.now()
    
    try {
      const options = await this.getRequestOptions()
      const credential = await navigator.credentials.get(options) as PublicKeyCredential

      if (!credential) {
        throw new Error('No credential returned')
      }

      const verificationTime = Date.now() - startTime
      const result: BiometricAuthenticationResult = {
        deviceId: request.deviceId,
        modality: request.modality,
        useCase: request.useCase,
        status: 'verified',
        verifiedAt: new Date().toISOString(),
        verificationTimeMs: verificationTime,
        confidenceScore: 0.95 // Default confidence for WebAuthn
      }

      await this.logAuditEvent({
        userId: 'current_user', // Should come from auth context
        deviceId: request.deviceId,
        action: 'authentication',
        modality: request.modality,
        status: 'success'
      })

      return result
    } catch (error) {
      await this.logAuditEvent({
        userId: 'current_user',
        deviceId: request.deviceId,
        action: 'authentication',
        modality: request.modality,
        status: 'failure',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  async createSession(userId: string, deviceId: string): Promise<BiometricSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    const expiresAt = new Date(now.getTime() + this.defaultSettings.sessionDurationMinutes * 60 * 1000)

    const session: BiometricSession = {
      id: sessionId,
      deviceId,
      userId,
      createdAt: now,
      expiresAt,
      isValid: true
    }

    this.sessions.set(sessionId, session)
    
    // Store in localStorage for persistence
    try {
      const sessions = JSON.parse(localStorage.getItem('biometric_sessions') || '{}')
      sessions[sessionId] = session
      localStorage.setItem('biometric_sessions', JSON.stringify(sessions))
    } catch (error) {
      console.warn('Failed to store session:', error)
    }

    return session
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      // Try to retrieve from localStorage
      try {
        const sessions = JSON.parse(localStorage.getItem('biometric_sessions') || '{}')
        const storedSession = sessions[sessionId]
        if (storedSession) {
          this.sessions.set(sessionId, {
            ...storedSession,
            createdAt: new Date(storedSession.createdAt),
            expiresAt: new Date(storedSession.expiresAt)
          })
          return this.validateSession(sessionId)
        }
      } catch (error) {
        console.warn('Failed to retrieve session from storage:', error)
      }
      return false
    }

    const now = new Date()
    if (now > session.expiresAt) {
      session.isValid = false
      this.sessions.delete(sessionId)
      
      // Remove from localStorage
      try {
        const sessions = JSON.parse(localStorage.getItem('biometric_sessions') || '{}')
        delete sessions[sessionId]
        localStorage.setItem('biometric_sessions', JSON.stringify(sessions))
      } catch (error) {
        console.warn('Failed to remove session from storage:', error)
      }
      
      return false
    }

    return session.isValid
  }

  async confirmTransaction(request: TransactionConfirmationRequest): Promise<TransactionConfirmationResult> {
    const settings = this.getSettings()
    const requiresBiometric = request.amountUsd >= settings.thresholdAmount

    if (!requiresBiometric) {
      return {
        id: `tx_${Date.now()}`,
        amountUsd: request.amountUsd,
        status: 'approved',
        requiredFactors: 0,
        verifiedFactors: [],
        verificationTimeMs: 0,
        approvedAt: new Date().toISOString()
      }
    }

    // Check if there's a valid biometric session
    const sessions = Array.from(this.sessions.values()).filter(s => s.isValid)
    const validSession = sessions.find(s => s.expiresAt > new Date())

    if (validSession && await this.validateSession(validSession.id)) {
      await this.logAuditEvent({
        userId: 'current_user',
        deviceId: request.deviceId,
        action: 'transaction_confirmation',
        status: 'success',
        transactionAmount: request.amountUsd,
        sessionId: validSession.id
      })

      return {
        id: `tx_${Date.now()}`,
        amountUsd: request.amountUsd,
        status: 'approved',
        requiredFactors: 1,
        verifiedFactors: ['fingerprint'], // Default modality
        verificationTimeMs: 50, // Session validation is fast
        approvedAt: new Date().toISOString()
      }
    }

    // Require new biometric authentication
    try {
      const authResult = await this.authenticate({
        deviceId: request.deviceId,
        modality: 'fingerprint', // Default to fingerprint
        useCase: 'transaction-confirmation'
      })

      await this.logAuditEvent({
        userId: 'current_user',
        deviceId: request.deviceId,
        action: 'transaction_confirmation',
        modality: authResult.modality,
        status: 'success',
        transactionAmount: request.amountUsd
      })

      // Create new session after successful authentication
      await this.createSession('current_user', request.deviceId)

      return {
        id: `tx_${Date.now()}`,
        amountUsd: request.amountUsd,
        status: 'approved',
        requiredFactors: 1,
        verifiedFactors: [authResult.modality],
        verificationTimeMs: authResult.verificationTimeMs,
        approvedAt: new Date().toISOString()
      }
    } catch (error) {
      await this.logAuditEvent({
        userId: 'current_user',
        deviceId: request.deviceId,
        action: 'transaction_confirmation',
        status: 'failure',
        transactionAmount: request.amountUsd,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  async verifyFallback(deviceId: string, option: BiometricFallbackOption): Promise<FallbackVerificationResult> {
    const startTime = Date.now()

    try {
      // Simulate fallback verification (in real app, this would integrate with device PIN/password)
      await new Promise(resolve => setTimeout(resolve, 1000))

      const verificationTime = Date.now() - startTime

      await this.logAuditEvent({
        userId: 'current_user',
        deviceId,
        action: 'fallback_used',
        status: 'success'
      })

      return {
        deviceId,
        option,
        status: 'verified',
        verificationTimeMs: verificationTime,
        verifiedAt: new Date().toISOString()
      }
    } catch (error) {
      await this.logAuditEvent({
        userId: 'current_user',
        deviceId,
        action: 'fallback_used',
        status: 'failure',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  getSettings(): BiometricSettings {
    try {
      const stored = localStorage.getItem('biometric_settings')
      if (stored) {
        return { ...this.defaultSettings, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.warn('Failed to load biometric settings:', error)
    }
    return this.defaultSettings
  }

  updateSettings(settings: Partial<BiometricSettings>): void {
    const currentSettings = this.getSettings()
    const newSettings = { ...currentSettings, ...settings }
    
    try {
      localStorage.setItem('biometric_settings', JSON.stringify(newSettings))
    } catch (error) {
      console.warn('Failed to save biometric settings:', error)
    }
  }

  getAuditLogs(userId?: string): BiometricAuditLog[] {
    const logs = userId ? this.auditLogs.filter(log => log.userId === userId) : this.auditLogs
    
    // Also check localStorage for persisted logs
    try {
      const storedLogs = JSON.parse(localStorage.getItem('biometric_audit_logs') || '[]')
      const filteredStoredLogs = userId ? storedLogs.filter((log: BiometricAuditLog) => log.userId === userId) : storedLogs
      return [...logs, ...filteredStoredLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    } catch (error) {
      console.warn('Failed to load audit logs from storage:', error)
      return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }
  }

  clearExpiredSessions(): void {
    const now = new Date()
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId)
      }
    }
  }
}

export const webAuthnService = new WebAuthnService()
