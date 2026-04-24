'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

interface QRScannerProps {
  onScan: (result: boolean) => void
  onClose?: () => void
  onResult?: (data: any) => void
}

interface ScanResult {
  data: string
  type: 'wallet-address' | 'transaction' | 'energy-trade' | 'text' | 'unknown'
  timestamp: number
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, onResult }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string>('')
  
  const videoRef = useRef<HTMLVideoElement>(null)

  const detectQRType = (data: string): ScanResult['type'] => {
    // Stellar wallet addresses start with 'G' and are 56 characters
    if (data.startsWith('G') && data.length === 56) {
      return 'wallet-address'
    }
    
    // Check if it's a Stellar transaction URL
    if (data.includes('stellar.expert') || data.includes('stellar') || data.includes('transaction')) {
      return 'transaction'
    }
    
    // Check if it's a JSON-encoded transaction
    try {
      const parsed = JSON.parse(data)
      if (parsed.transaction || parsed.xdr) {
        return 'transaction'
      }
    } catch {
      // Not JSON, continue
    }
    
    return 'text'
  }

  const handleScanSuccess = useCallback((result: ScanResult) => {
    setScanResult(result)
    setIsScanning(false)
    
    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(200)
    }
    
    onScan(true)
    onResult?.(result)
    
    // Auto-stop scanner after successful scan
    setTimeout(() => {
      stopScanner()
    }, 1000)
  }, [onScan, onResult])

  const startScanner = async () => {
    if (!videoRef.current) return
    
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      setHasPermission(true)
      setError('')
      
      // Clean up stream
      stream.getTracks().forEach(track => track.stop())
      
      setIsScanning(true)
      
      // Simulate successful scan after 2 seconds (as per requirements)
      setTimeout(() => {
        const mockResult: ScanResult = {
          data: 'GABC123DEFG456HIJ789KLM012NOP345QRS678TUV901WXY',
          type: 'wallet-address',
          timestamp: Date.now()
        }
        handleScanSuccess(mockResult)
      }, 2000)
      
    } catch (err) {
      setHasPermission(false)
      setError('Camera permission denied. Please enable camera access to scan QR codes.')
      console.error('Camera access error:', err)
    }
  }

  const stopScanner = () => {
    setIsScanning(false)
  }

  const requestPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      setHasPermission(true)
      startScanner()
    } catch (err) {
      setHasPermission(false)
      setError('Camera permission denied')
    }
  }

  const handleManualInput = () => {
    const input = prompt('Enter wallet address or transaction data:')
    if (input) {
      const scanData: ScanResult = {
        data: input,
        type: detectQRType(input),
        timestamp: Date.now()
      }
      setScanResult(scanData)
      onScan(true)
      onResult?.(scanData)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ display: isScanning ? 'block' : 'none' }}
        />
        
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500 rounded-lg shadow-2xl">
              <div className="absolute top-0 left-0 w-5 h-5 border-t-3 border-l-3 border-green-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-5 h-5 border-t-3 border-r-3 border-green-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-3 border-l-3 border-green-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-3 border-r-3 border-green-500 rounded-br-lg"></div>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {hasPermission === null && (
        <div className="text-center space-y-4">
          <p className="text-gray-600">Camera access is required to scan QR codes</p>
          <button
            onClick={requestPermission}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Enable Camera Access
          </button>
          <button
            onClick={handleManualInput}
            className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Enter Manually
          </button>
        </div>
      )}

      {hasPermission === false && (
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={requestPermission}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleManualInput}
            className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Enter Manually
          </button>
        </div>
      )}

      {hasPermission === true && !isScanning && !scanResult && (
        <div className="text-center space-y-4">
          <p className="text-gray-600">Position QR code within the frame</p>
          <button
            onClick={startScanner}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start Scanning
          </button>
          <button
            onClick={handleManualInput}
            className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Enter Manually
          </button>
        </div>
      )}

      {isScanning && (
        <div className="text-center space-y-4">
          <p className="text-gray-600">Scanning...</p>
          <button
            onClick={stopScanner}
            className="w-full text-gray-500 py-3 px-4 rounded-lg font-medium hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {scanResult && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium mb-2">
            {scanResult.type.toUpperCase()}
          </span>
          <p className="font-mono text-xs text-gray-700 break-all">
            {scanResult.data}
          </p>
        </div>
      )}

      {onClose && (
        <button
          onClick={onClose}
          className="w-full text-gray-500 py-3 px-4 rounded-lg font-medium hover:text-gray-700 transition-colors"
        >
          Close Scanner
        </button>
      )}
    </div>
  )
}
