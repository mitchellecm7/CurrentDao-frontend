'use client'

import { useState, useEffect } from 'react'
import {
  Fingerprint,
  KeyRound,
  Mic,
  Radar,
  ScanFace,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Settings,
  Clock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useBiometricAuth } from '@/hooks/useBiometricAuth'
import { BiometricModality } from '@/types/biometric'
import { webAuthnService, BiometricSettings, BiometricAuditLog } from '@/services/security/webauthn-service'

const modalityMeta: Record<
  BiometricModality,
  {
    label: string
    icon: typeof Fingerprint
    accent: string
  }
> = {
  fingerprint: {
    label: 'Fingerprint',
    icon: Fingerprint,
    accent: 'from-amber-500 to-orange-500',
  },
  face: {
    label: 'Face ID',
    icon: ScanFace,
    accent: 'from-cyan-500 to-sky-500',
  },
  voice: {
    label: 'Voice',
    icon: Mic,
    accent: 'from-fuchsia-500 to-rose-500',
  },
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

export function BiometricAuth() {
  const [transactionAmount, setTransactionAmount] = useState('425')
  const [webAuthnSettings, setWebAuthnSettings] = useState<BiometricSettings | null>(null)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [isWebAuthnAuthenticating, setIsWebAuthnAuthenticating] = useState(false)
  const [webAuthnError, setWebAuthnError] = useState<string | null>(null)
  const [webAuthnSuccess, setWebAuthnSuccess] = useState(false)
  const [auditLogs, setAuditLogs] = useState<BiometricAuditLog[]>([])
  const [requiresBiometric, setRequiresBiometric] = useState(false)
  
  const {
    devices,
    analytics,
    selectedDevice,
    selectedDeviceId,
    selectedModality,
    selectedFactors,
    supportedModalities,
    fallbackOptions,
    lastAccessVerification,
    lastFallbackVerification,
    lastTransactionApproval,
    error,
    isLoading,
    isAuthenticating,
    isConfirmingTransaction,
    setSelectedDeviceId,
    setSelectedModality,
    toggleFactor,
    authenticateSelected,
    confirmTransaction,
    verifyFallback,
    fallbackCoveragePercent,
    fingerprintVerificationMs,
    faceRecognitionAccuracy,
    voiceVerificationMs,
  } = useBiometricAuth()

  useEffect(() => {
    const loadSettings = () => {
      const settings = webAuthnService.getSettings()
      setWebAuthnSettings(settings)
      setRequiresBiometric(Number(transactionAmount) >= settings.thresholdAmount)
    }

    loadSettings()
    webAuthnService.clearExpiredSessions()
    loadAuditLogs()
  }, [transactionAmount])

  const loadAuditLogs = () => {
    const logs = webAuthnService.getAuditLogs('current_user').slice(0, 10)
    setAuditLogs(logs)
  }

  const handleWebAuthnAuth = async (modality: 'fingerprint' | 'face') => {
    setIsWebAuthnAuthenticating(true)
    setWebAuthnError(null)
    setWebAuthnSuccess(false)

    try {
      const result = await webAuthnService.authenticate({
        deviceId: selectedDeviceId || 'default-device',
        modality,
        useCase: Number(transactionAmount) > 0 ? 'transaction-confirmation' : 'app-access'
      })

      setWebAuthnSuccess(true)
      toast.success(`${modality} verified via WebAuthn in ${result.verificationTimeMs}ms`)
      
      setTimeout(() => {
        setWebAuthnSuccess(false)
      }, 3000)
    } catch (error) {
      setWebAuthnError(error instanceof Error ? error.message : 'WebAuthn authentication failed')
      toast.error('WebAuthn authentication failed')
    } finally {
      setIsWebAuthnAuthenticating(false)
    }
  }

  const handleWebAuthnTransaction = async () => {
    const amount = Number(transactionAmount)
    if (!amount) {
      toast.error('Enter a transaction amount.')
      return
    }

    setIsWebAuthnAuthenticating(true)
    setWebAuthnError(null)

    try {
      const result = await webAuthnService.confirmTransaction({
        deviceId: selectedDeviceId || 'default-device',
        amountUsd: amount,
        factors: ['fingerprint'] // Default to fingerprint
      })

      toast.success(`Transaction approved via WebAuthn in ${result.verificationTimeMs}ms`)
      loadAuditLogs()
    } catch (error) {
      setWebAuthnError(error instanceof Error ? error.message : 'Transaction confirmation failed')
      toast.error('Transaction confirmation failed')
    } finally {
      setIsWebAuthnAuthenticating(false)
    }
  }

  const updateWebAuthnSettings = (newSettings: Partial<BiometricSettings>) => {
    webAuthnService.updateSettings(newSettings)
    setWebAuthnSettings({ ...webAuthnSettings!, ...newSettings })
    setRequiresBiometric(Number(transactionAmount) >= (webAuthnSettings?.thresholdAmount || 0))
  }

  async function handleAuthenticate() {
    const result = await authenticateSelected()

    if (result) {
      toast.success(
        `${modalityMeta[result.modality].label} verified in ${result.verificationTimeMs}ms`,
      )
    }
  }

  async function handleTransactionConfirmation() {
    const amountUsd = Number(transactionAmount)

    if (!amountUsd) {
      toast.error('Enter a transaction amount.')
      return
    }

    const result = await confirmTransaction(amountUsd)

    if (result) {
      toast.success(
        `Transaction approved with ${result.verifiedFactors.length} factor(s) in ${result.verificationTimeMs}ms`,
      )
    }
  }

  async function handleFallback(option: (typeof fallbackOptions)[number]) {
    const result = await verifyFallback(option)

    if (result) {
      toast.success(`Fallback verified via ${result.option}`)
    }
  }

  return (
    <section
      id="biometric-auth"
      className="space-y-6 rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 p-6 text-white shadow-2xl md:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-200">
            Biometric Authentication
          </p>
          <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
            Fingerprint, face, and voice verification for mobile access and energy trades.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-slate-200">
            CurrentDao now models app login, transaction approval, fallback recovery, and
            FIPS-aligned secure storage using device-native biometric factors.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-amber-100">
                Fingerprint speed
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {(fingerprintVerificationMs / 1000).toFixed(2)}s
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-amber-100">
                Face accuracy
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {formatPercent(faceRecognitionAccuracy)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-amber-100">
                Voice verify
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {(voiceVerificationMs / 1000).toFixed(1)}s
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-amber-100">
                Fallback coverage
              </p>
              <p className="mt-2 text-3xl font-semibold">{fallbackCoveragePercent}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-amber-100">
                Compliance posture
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {analytics?.compliance.secureStorage.fipsStandard ?? 'FIPS 140-3'}
              </h3>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <ShieldCheck className="h-6 w-6 text-amber-100" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm text-slate-100">
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <Sparkles className="h-4 w-4 text-amber-300" />
              On-device template isolation
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Multi-factor biometrics for higher-value trades
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Full fallback support across all device profiles
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
                Supported Devices
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                Choose the mobile security profile to simulate
              </h3>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3">
              <Radar className="h-6 w-6 text-amber-700" />
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {devices.map((device) => {
              const isSelected = device.id === selectedDeviceId

              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => setSelectedDeviceId(device.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:border-amber-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{device.name}</p>
                      <p className="mt-1 text-sm uppercase tracking-[0.16em] text-slate-500">
                        {device.platform}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Storage
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {device.secureStorage.fipsStandard}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                    {device.supportedModalities.map((modality) => (
                      <span key={modality} className="rounded-full bg-white px-3 py-1 capitalize">
                        {modality}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
                App Access
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                Verify mobile app access in one tap
              </h3>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3">
              <Fingerprint className="h-6 w-6 text-amber-700" />
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Selected device</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {selectedDevice?.name ?? 'Loading device profiles...'}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Secure storage: {selectedDevice?.secureStorage.storageProvider ?? 'Hardware-backed'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {supportedModalities.map((modality) => {
                const meta = modalityMeta[modality]
                const Icon = meta.icon
                const isActive = selectedModality === modality

                return (
                  <button
                    key={modality}
                    type="button"
                    onClick={() => setSelectedModality(modality)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? 'border-amber-400 bg-amber-50 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:border-amber-200 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`inline-flex rounded-2xl bg-gradient-to-r ${meta.accent} p-3 text-white`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-3 font-semibold text-slate-900">{meta.label}</p>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => void handleAuthenticate()}
              disabled={!selectedDevice || isLoading || isAuthenticating}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <ShieldCheck className="h-4 w-4" />
              {isAuthenticating ? 'Verifying...' : 'Authenticate Access'}
            </button>

            {lastAccessVerification ? (
              <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-950">
                Access verified via {lastAccessVerification.modality} in{' '}
                {lastAccessVerification.verificationTimeMs}ms with{' '}
                {formatPercent(lastAccessVerification.confidenceScore)} confidence.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
                Transaction Confirmation
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                Apply multi-factor biometrics to energy trades
              </h3>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3">
              <KeyRound className="h-6 w-6 text-amber-700" />
            </div>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Transaction amount (USD)</span>
              <input
                type="number"
                min="1"
                value={transactionAmount}
                onChange={(event) => setTransactionAmount(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-400"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              {supportedModalities.map((modality) => {
                const meta = modalityMeta[modality]
                const Icon = meta.icon
                const isActive = selectedFactors.includes(modality)

                return (
                  <button
                    key={modality}
                    type="button"
                    onClick={() => toggleFactor(modality)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? 'border-amber-400 bg-amber-50 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:border-amber-200 hover:bg-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 text-amber-700" />
                    <p className="mt-3 font-semibold text-slate-900">{meta.label}</p>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => void handleTransactionConfirmation()}
              disabled={!selectedDevice || isConfirmingTransaction}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 font-medium text-slate-900 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {isConfirmingTransaction ? 'Confirming...' : 'Confirm Transaction'}
            </button>

            {lastTransactionApproval ? (
              <div className="rounded-2xl bg-slate-900 p-4 text-white">
                <p className="text-sm uppercase tracking-[0.18em] text-amber-200">
                  Last approved transaction
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  ${lastTransactionApproval.amountUsd.toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {lastTransactionApproval.verifiedFactors.join(' + ')} in{' '}
                  {lastTransactionApproval.verificationTimeMs}ms
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-700">
            Fallback + Analytics
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            Recovery paths without weakening device security
          </h3>

          <div className="mt-5 flex flex-wrap gap-3">
            {fallbackOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => void handleFallback(option)}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-amber-200 hover:bg-amber-50"
              >
                {option}
              </button>
            ))}
          </div>

          {lastFallbackVerification ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              Fallback verified via {lastFallbackVerification.option} in{' '}
              {lastFallbackVerification.verificationTimeMs}ms.
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
            {analytics?.modalityAnalytics.map((entry) => {
              const meta = modalityMeta[entry.modality]

              return (
                <div key={entry.modality} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-slate-900">{meta.label}</p>
                    <p className="text-sm text-slate-600">
                      {formatPercent(entry.successRate)} success
                    </p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${meta.accent}`}
                      style={{ width: `${entry.adoptionRate * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Adoption {formatPercent(entry.adoptionRate)} | Avg{' '}
                    {(entry.averageVerificationMs / 1000).toFixed(2)}s
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-amber-200">Compliance</p>
            <p className="mt-2 text-xl font-semibold">
              {analytics?.compliance.auditStatus ?? 'pass'} audit
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {analytics?.compliance.standards.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {/* WebAuthn Section */}
      <section className="space-y-6 rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 p-6 text-white shadow-2xl md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">
              WebAuthn Biometric Re-authentication
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Enhanced security with configurable thresholds and session management
            </h2>
          </div>
          <button
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            className="rounded-2xl bg-white/10 p-3 backdrop-blur transition hover:bg-white/20"
          >
            <Settings className="h-6 w-6 text-blue-100" />
          </button>
        </div>

        {/* Threshold Alert */}
        {webAuthnSettings && Number(transactionAmount) >= webAuthnSettings.thresholdAmount && (
          <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3 text-yellow-200">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Biometric Authentication Required</p>
                <p className="text-sm opacity-90">
                  Transaction amount (${transactionAmount}) exceeds threshold of ${webAuthnSettings.thresholdAmount}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* WebAuthn Status */}
        {webAuthnError && (
          <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3 text-red-200">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{webAuthnError}</p>
            </div>
          </div>
        )}

        {webAuthnSuccess && (
          <div className="rounded-2xl border border-green-400/30 bg-green-400/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3 text-green-200">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm">WebAuthn authentication successful!</p>
            </div>
          </div>
        )}

        {/* WebAuthn Authentication */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
                  WebAuthn Authentication
                </p>
                <h3 className="mt-2 text-2xl font-semibold">
                  Authenticate using device biometrics
                </h3>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3">
                <ShieldCheck className="h-6 w-6 text-blue-700" />
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Session Status</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {webAuthnSettings ? `Valid for ${webAuthnSettings.sessionDurationMinutes} minutes` : 'Loading...'}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Threshold: ${webAuthnSettings?.thresholdAmount || 0}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => handleWebAuthnAuth('fingerprint')}
                  disabled={isWebAuthnAuthenticating}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <Fingerprint className="h-4 w-4" />
                  {isWebAuthnAuthenticating ? 'Authenticating...' : 'Fingerprint'}
                </button>

                <button
                  onClick={() => handleWebAuthnAuth('face')}
                  disabled={isWebAuthnAuthenticating}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <ScanFace className="h-4 w-4" />
                  {isWebAuthnAuthenticating ? 'Authenticating...' : 'Face ID'}
                </button>
              </div>

              {webAuthnSettings?.fallbackEnabled && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Fallback Options</p>
                  <div className="flex flex-wrap gap-2">
                    {['device-pin', 'passkey', 'recovery-code'].map((option) => (
                      <button
                        key={option}
                        onClick={() => webAuthnService.verifyFallback(selectedDeviceId || 'default-device', option as any)}
                        disabled={isWebAuthnAuthenticating}
                        className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                      >
                        {option.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
                  Transaction Confirmation
                </p>
                <h3 className="mt-2 text-2xl font-semibold">
                  WebAuthn-protected transactions
                </h3>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3">
                <KeyRound className="h-6 w-6 text-blue-700" />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Transaction Amount (USD)
                </label>
                <input
                  type="number"
                  min="1"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleWebAuthnTransaction}
                disabled={isWebAuthnAuthenticating || !transactionAmount}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 font-medium text-slate-900 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {isWebAuthnAuthenticating ? 'Processing...' : 'Confirm with WebAuthn'}
              </button>

              {requiresBiometric && (
                <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">Session Management</span>
                  </div>
                  <p>Biometric session valid for {webAuthnSettings?.sessionDurationMinutes || 5} minutes after successful authentication</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettingsPanel && webAuthnSettings && (
          <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-xl">
            <h3 className="text-2xl font-semibold mb-6">WebAuthn Security Settings</h3>
            
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Transaction Threshold ($)
                </label>
                <input
                  type="number"
                  value={webAuthnSettings.thresholdAmount}
                  onChange={(e) => updateWebAuthnSettings({ thresholdAmount: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Session Duration (minutes)
                </label>
                <select
                  value={webAuthnSettings.sessionDurationMinutes}
                  onChange={(e) => updateWebAuthnSettings({ sessionDurationMinutes: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Require for Settings Changes
                </label>
                <button
                  onClick={() => updateWebAuthnSettings({ requireBiometricForSettings: !webAuthnSettings.requireBiometricForSettings })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    webAuthnSettings.requireBiometricForSettings ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      webAuthnSettings.requireBiometricForSettings ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Enable Fallback Options
                </label>
                <button
                  onClick={() => updateWebAuthnSettings({ fallbackEnabled: !webAuthnSettings.fallbackEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    webAuthnSettings.fallbackEnabled ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      webAuthnSettings.fallbackEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {auditLogs.length > 0 && (
          <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-xl">
            <h3 className="text-2xl font-semibold mb-6">Recent Authentication Events</h3>
            
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      log.status === 'success' ? 'bg-green-500' : 
                      log.status === 'failure' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium text-slate-900">
                        {log.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-sm text-slate-500">
                        {log.modality && `${log.modality} • `}
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {log.transactionAmount && (
                    <span className="font-semibold text-slate-900">
                      ${log.transactionAmount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </section>
  )
}
