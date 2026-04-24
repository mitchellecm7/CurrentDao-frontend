'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BiometricAuth } from './BiometricAuth'
import { QRScanner } from './QRScanner'

interface WalletOnboardingProps {
  onComplete: (walletData: any) => void
  onSkip?: () => void
}

type OnboardingStep = 'welcome' | 'create-wallet' | 'backup-phrase' | 'biometric-setup' | 'qr-setup' | 'complete'

export const WalletOnboarding: React.FC<WalletOnboardingProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [isLoading, setIsLoading] = useState(false)
  const [walletData, setWalletData] = useState<any>(null)
  const [mnemonic, setMnemonic] = useState<string>('')
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [qrScanned, setQrScanned] = useState(false)

  const steps: OnboardingStep[] = ['welcome', 'create-wallet', 'backup-phrase', 'biometric-setup', 'qr-setup', 'complete']
  const currentStepIndex = steps.indexOf(currentStep)

  const generateWallet = async () => {
    setIsLoading(true)
    try {
      // Simulate wallet generation - in real app, use Stellar SDK
      const mockWallet = {
        publicKey: 'G' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        privateKey: 'S' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      }
      setWalletData(mockWallet)
      setMnemonic(mockWallet.mnemonic)
      setCurrentStep('backup-phrase')
    } catch (error) {
      console.error('Failed to generate wallet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometricSetup = (success: boolean) => {
    setBiometricEnabled(success)
    if (success) {
      setCurrentStep('qr-setup')
    }
  }

  const handleQRScan = (scanned: boolean) => {
    setQrScanned(scanned)
    if (scanned) {
      setTimeout(() => setCurrentStep('complete'), 1000)
    }
  }

  const handleComplete = () => {
    onComplete({
      ...walletData,
      biometricEnabled,
      qrScanned,
      setupCompleted: new Date().toISOString()
    })
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to CurrentDao</h1>
            <p className="text-gray-600">Your mobile wallet for Stellar energy trading</p>
            
            <button
              onClick={() => setCurrentStep('create-wallet')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create New Wallet
            </button>
            
            <button
              onClick={() => setCurrentStep('qr-setup')}
              className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Import with QR Code
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

      case 'create-wallet':
        return (
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Your Wallet</h1>
            <p className="text-gray-600">Setting up your secure Stellar wallet</p>
            
            {isLoading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            ) : (
              <button
                onClick={generateWallet}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Generate Wallet
              </button>
            )}
            
            <button
              onClick={() => setCurrentStep('welcome')}
              className="w-full text-gray-500 py-3 px-4 rounded-lg font-medium hover:text-gray-700 transition-colors"
            >
              Back
            </button>
          </div>
        )

      case 'backup-phrase':
        return (
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Backup Your Recovery Phrase</h1>
            <p className="text-gray-600">Save this phrase in a secure location</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm text-gray-700">
              {mnemonic}
            </div>
            
            <button
              onClick={() => setCurrentStep('biometric-setup')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              I've Saved My Phrase
            </button>
            
            <button
              onClick={() => setCurrentStep('create-wallet')}
              className="w-full text-gray-500 py-3 px-4 rounded-lg font-medium hover:text-gray-700 transition-colors"
            >
              Back
            </button>
          </div>
        )

      case 'biometric-setup':
        return (
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Enable Biometric Security</h1>
            <p className="text-gray-600">Secure your wallet with Face ID or Touch ID</p>
            
            <BiometricAuth 
              onSuccess={handleBiometricSetup}
              onSkip={() => setCurrentStep('qr-setup')}
            />
          </div>
        )

      case 'qr-setup':
        return (
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Scan QR Code</h1>
            <p className="text-gray-600">Scan a QR code to import existing wallet or test the scanner</p>
            
            <QRScanner 
              onScan={handleQRScan}
              onClose={() => setCurrentStep('complete')}
            />
          </div>
        )

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Wallet Ready!</h1>
            <p className="text-gray-600">Your CurrentDao wallet is set up and ready to use</p>
            
            <button
              onClick={handleComplete}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Using Wallet
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-xl">
        <div className="flex justify-center space-x-2 mb-8">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                index < currentStepIndex ? 'bg-green-500' :
                step === currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  )
}
