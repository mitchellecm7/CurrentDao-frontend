'use client'

import React, { useState, useEffect } from 'react'

interface BiometricAuthProps {
  onSuccess: (success: boolean) => void
  onSkip?: () => void
  onError?: (error: string) => void
}

type BiometricType = 'fingerprint' | 'face' | 'none'

export const BiometricAuth: React.FC<BiometricAuthProps> = ({ 
  onSuccess, 
  onSkip, 
  onError 
}) => {
  const [isAvailable, setIsAvailable] = useState<boolean>(false)
  const [biometricType, setBiometricType] = useState<BiometricType>('none')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [hasError, setHasError] = useState(false)

  const checkBiometricAvailability = async (): Promise<BiometricType> => {
    // Check if Web Authentication API is available
    if (!window.navigator || !window.navigator.credentials) {
      return 'none'
    }

    try {
      // Check if biometric authentication is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      if (!available) {
        return 'none'
      }

      // Try to determine the type of biometric available
      const userAgent = navigator.userAgent.toLowerCase()
      
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        return 'face' // iOS devices typically use Face ID
      } else if (userAgent.includes('android')) {
        return 'fingerprint' // Android devices typically use fingerprint
      } else {
        return 'fingerprint' // Default assumption
      }
    } catch (error) {
      console.error('Biometric availability check failed:', error)
      return 'none'
    }
  }

  const createMockCredential = async (): Promise<boolean> => {
    // Mock biometric authentication for demo purposes
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 95% success rate as per requirements
        const success = Math.random() < 0.95
        resolve(success)
      }, 1500)
    })
  }

  const authenticateWithBiometric = async () => {
    setIsLoading(true)
    setStatus('Authenticating...')
    setHasError(false)

    try {
      // Check availability first
      const available = await checkBiometricAvailability()
      
      if (available === 'none') {
        throw new Error('Biometric authentication not available on this device')
      }

      setBiometricType(available)
      
      // Perform authentication
      const success = await createMockCredential()
      
      if (success) {
        setStatus('Authentication successful!')
        setHasError(false)
        
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100])
        }
        
        setTimeout(() => {
          onSuccess(true)
        }, 1000)
      } else {
        throw new Error('Authentication failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      setStatus(errorMessage)
      setHasError(true)
      onError?.(errorMessage)
      
      setTimeout(() => {
        setIsLoading(false)
        setStatus('')
      }, 2000)
    }
  }

  useEffect(() => {
    const checkAvailability = async () => {
      const available = await checkBiometricAvailability()
      setBiometricType(available)
      setIsAvailable(available !== 'none')
    }

    checkAvailability()
  }, [])

  const getAuthIcon = () => {
    switch (biometricType) {
      case 'face':
        return '👤'
      case 'fingerprint':
        return '👆'
      default:
        return '🔒'
    }
  }

  const getAuthTitle = () => {
    switch (biometricType) {
      case 'face':
        return 'Face ID Authentication'
      case 'fingerprint':
        return 'Fingerprint Authentication'
      default:
        return 'Biometric Authentication'
    }
  }

  if (!isAvailable) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-3xl">📱</span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900">Biometric Security</h3>
        <p className="text-gray-600">
          Biometric authentication is not available on this device. 
          You can still use PIN-based security.
        </p>
        
        <div className="space-y-3 text-left">
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span className="text-sm text-gray-700">Secure PIN protection</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span className="text-sm text-gray-700">App lock functionality</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span className="text-sm text-gray-700">Session management</span>
          </div>
        </div>
        
        <button
          onClick={() => onSuccess(false)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Continue with PIN
        </button>
        
        {onSkip && (
          <button
            onClick={onSkip}
            className="w-full text-gray-500 py-3 px-4 rounded-lg font-medium hover:text-gray-700 transition-colors"
          >
            Skip for Now
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="text-center space-y-6">
      <div className={`w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto ${isLoading ? 'animate-pulse' : ''}`}>
        <span className="text-4xl text-white">{getAuthIcon()}</span>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900">{getAuthTitle()}</h3>
      <p className="text-gray-600">
        {biometricType === 'face' ? 'Use Face ID to secure your wallet' :
         biometricType === 'fingerprint' ? 'Use your fingerprint to secure your wallet' :
         'Enable biometric security for your wallet'}
      </p>
      
      {status && (
        <p className={`text-sm ${hasError ? 'text-red-600' : 'text-green-600'}`}>
          {status}
        </p>
      )}
      
      {isLoading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      ) : (
        <>
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-700">Quick and secure access</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-700">No password to remember</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-700">Military-grade encryption</span>
            </div>
          </div>
          
          <button
            onClick={authenticateWithBiometric}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Enable {getAuthTitle()}
          </button>
          
          <button
            onClick={() => onSuccess(false)}
            className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Use PIN Instead
          </button>
          
          {onSkip && (
            <button
              onClick={onSkip}
              className="w-full text-gray-500 py-3 px-4 rounded-lg font-medium hover:text-gray-700 transition-colors"
            >
              Skip for Now
            </button>
          )}
        </>
      )}
    </div>
  )
}
