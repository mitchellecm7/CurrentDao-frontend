'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Eye, 
  EyeOff,
  Smartphone,
  Usb,
  Bluetooth,
  Loader2,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

// Types for external signing
interface ExternalSigningRequest {
  id: string
  type: 'transaction' | 'message'
  payload: string
  network: 'mainnet' | 'testnet'
  walletType: 'hardware' | 'mobile' | 'web'
  walletId?: string
  timestamp: Date
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  expiresAt: Date
}

interface SigningOptions {
  requireConfirmation: boolean
  timeoutMs: number
  showDetails: boolean
  verifyOnDevice: boolean
}

interface SigningResult {
  success: boolean
  signature?: string
  publicKey?: string
  error?: string
  verified: boolean
}

interface ExternalSigningProps {
  request: ExternalSigningRequest
  options?: Partial<SigningOptions>
  onResult: (result: SigningResult) => void
  onCancel: () => void
}

const defaultOptions: SigningOptions = {
  requireConfirmation: true,
  timeoutMs: 300000, // 5 minutes
  showDetails: true,
  verifyOnDevice: true
}

export const ExternalSigning: React.FC<ExternalSigningProps> = ({
  request,
  options = {},
  onResult,
  onCancel
}) => {
  const [state, setState] = useState({
    isProcessing: false,
    showDetails: options.showDetails ?? true,
    timeRemaining: 0,
    deviceConnected: false,
    verificationStatus: 'idle' as 'idle' | 'connecting' | 'connected' | 'signing' | 'verifying',
    signatureResult: null as SigningResult | null,
    copiedToClipboard: false
  })

  const opts = { ...defaultOptions, ...options }

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const remaining = request.expiresAt.getTime() - Date.now()
      setState(prev => ({ ...prev, timeRemaining: Math.max(0, remaining) }))
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [request.expiresAt])

  // Handle request expiration
  useEffect(() => {
    if (state.timeRemaining === 0 && request.status === 'pending') {
      onResult({
        success: false,
        error: 'Request expired',
        verified: false
      })
    }
  }, [state.timeRemaining, request.status, onResult])

  // Connect to external wallet
  const connectToWallet = useCallback(async () => {
    setState(prev => ({ ...prev, verificationStatus: 'connecting', isProcessing: true }))

    try {
      // Simulate wallet connection based on type
      if (request.walletType === 'hardware') {
        await connectToHardwareWallet()
      } else if (request.walletType === 'mobile') {
        await connectToMobileWallet()
      } else {
        await connectToWebWallet()
      }

      setState(prev => ({ ...prev, verificationStatus: 'connected', deviceConnected: true }))
    } catch (error: any) {
      setState(prev => ({ ...prev, verificationStatus: 'idle', isProcessing: false }))
      toast.error(`Failed to connect: ${error.message}`)
    }
  }, [request.walletType])

  const connectToHardwareWallet = async () => {
    // Simulate hardware wallet connection
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Connecting to hardware wallet...')
  }

  const connectToMobileWallet = async () => {
    // Simulate mobile wallet connection via WalletConnect
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log('Connecting to mobile wallet...')
  }

  const connectToWebWallet = async () => {
    // Simulate web wallet connection
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Connecting to web wallet...')
  }

  // Sign the request
  const signRequest = useCallback(async () => {
    if (!state.deviceConnected) {
      await connectToWallet()
    }

    setState(prev => ({ ...prev, verificationStatus: 'signing', isProcessing: true }))

    try {
      // Simulate signing process
      const signature = await performSigning(request)
      
      setState(prev => ({ ...prev, verificationStatus: 'verifying' }))

      // Verify signature
      const verified = await verifySignature(signature, request)

      const result: SigningResult = {
        success: true,
        signature,
        publicKey: request.walletId || 'G' + Math.random().toString(36).substr(2, 55).toUpperCase(),
        verified
      }

      setState(prev => ({ ...prev, signatureResult: result, verificationStatus: 'connected', isProcessing: false }))
      onResult(result)
      
      toast.success('Transaction signed successfully!')
    } catch (error: any) {
      const result: SigningResult = {
        success: false,
        error: error.message,
        verified: false
      }

      setState(prev => ({ ...prev, signatureResult: result, verificationStatus: 'idle', isProcessing: false }))
      onResult(result)
      
      toast.error(`Signing failed: ${error.message}`)
    }
  }, [request, state.deviceConnected, connectToWallet, onResult])

  const performSigning = async (req: ExternalSigningRequest): Promise<string> => {
    // Simulate signing delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generate mock signature
    let hash = 0
    for (let i = 0; i < req.payload.length; i++) {
      const char = req.payload.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(128, '0')
  }

  const verifySignature = async (signature: string, req: ExternalSigningRequest): Promise<boolean> => {
    // Simulate signature verification
    await new Promise(resolve => setTimeout(resolve, 1000))
    return true
  }

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setState(prev => ({ ...prev, copiedToClipboard: true }))
      toast.success('Copied to clipboard!')
      
      setTimeout(() => {
        setState(prev => ({ ...prev, copiedToClipboard: false }))
      }, 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }, [])

  // Format time remaining
  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Get wallet icon
  const getWalletIcon = () => {
    switch (request.walletType) {
      case 'hardware':
        return <Usb className="w-5 h-5" />
      case 'mobile':
        return <Smartphone className="w-5 h-5" />
      case 'web':
        return <ExternalLink className="w-5 h-5" />
      default:
        return <Shield className="w-5 h-5" />
    }
  }

  // Get status icon
  const getStatusIcon = () => {
    switch (state.verificationStatus) {
      case 'connecting':
        return <Loader2 className="w-5 h-5 animate-spin" />
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'signing':
        return <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
      case 'verifying':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                External Signing Required
              </h3>
              <p className="text-sm text-gray-500">
                {request.type === 'transaction' ? 'Transaction' : 'Message'} Signature Request
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getWalletIcon()}
            <span className="text-sm font-medium text-gray-700 capitalize">
              {request.walletType} Wallet
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {state.verificationStatus === 'idle' && 'Ready to sign'}
                {state.verificationStatus === 'connecting' && 'Connecting to wallet...'}
                {state.verificationStatus === 'connected' && 'Wallet connected'}
                {state.verificationStatus === 'signing' && 'Signing in progress...'}
                {state.verificationStatus === 'verifying' && 'Verifying signature...'}
              </p>
              <p className="text-xs text-gray-500">
                {state.deviceConnected ? 'Device ready' : 'Device not connected'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className={`text-sm font-medium ${
              state.timeRemaining < 60000 ? 'text-red-600' : 'text-gray-700'
            }`}>
              {formatTimeRemaining(state.timeRemaining)}
            </span>
          </div>
        </div>

        {/* Request Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Request Details</h4>
            <button
              onClick={() => setState(prev => ({ ...prev, showDetails: !prev.showDetails }))}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              {state.showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{state.showDetails ? 'Hide' : 'Show'} Details</span>
            </button>
          </div>

          <AnimatePresence>
            {state.showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Network</span>
                    <span className="text-xs font-medium text-gray-900 capitalize">
                      {request.network}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Type</span>
                    <span className="text-xs font-medium text-gray-900 capitalize">
                      {request.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Created</span>
                    <span className="text-xs font-medium text-gray-900">
                      {request.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Payload</span>
                    <button
                      onClick={() => copyToClipboard(request.payload)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      {state.copiedToClipboard ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{state.copiedToClipboard ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-white border border-gray-200 rounded text-xs font-mono text-gray-700 break-all max-h-32 overflow-y-auto">
                    {request.payload}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Result */}
        {state.signatureResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              state.signatureResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {state.signatureResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  state.signatureResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {state.signatureResult.success ? 'Signature Successful' : 'Signature Failed'}
                </p>
                {state.signatureResult.error && (
                  <p className="text-xs text-red-700 mt-1">{state.signatureResult.error}</p>
                )}
                {state.signatureResult.signature && (
                  <div className="mt-2">
                    <button
                      onClick={() => copyToClipboard(state.signatureResult!.signature!)}
                      className="text-xs text-green-700 hover:text-green-800 flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Signature</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {!state.signatureResult && (
            <>
              <button
                onClick={signRequest}
                disabled={state.isProcessing || state.timeRemaining === 0}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {state.isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                <span>
                  {state.verificationStatus === 'idle' && 'Sign'}
                  {state.verificationStatus === 'connecting' && 'Connecting...'}
                  {state.verificationStatus === 'connected' && 'Sign'}
                  {state.verificationStatus === 'signing' && 'Signing...'}
                  {state.verificationStatus === 'verifying' && 'Verifying...'}
                </span>
              </button>

              <button
                onClick={onCancel}
                disabled={state.isProcessing}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {state.signatureResult && state.signatureResult.success && (
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>New Request</span>
            </button>
          )}
        </div>

        {/* Security Notice */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">Security Notice</p>
              <p>
                This request requires external signing using your {request.walletType} wallet. 
                Please ensure you are signing on a trusted device and verify the details before proceeding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExternalSigning
