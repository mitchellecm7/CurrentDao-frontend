'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { 
  Smartphone, 
  QrCode, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Copy, 
  ExternalLink,
  Wifi,
  WifiOff,
  Shield,
  Users,
  Globe,
  Zap,
  Settings,
  X,
  ChevronRight,
  Info,
  Download,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'

// Types
interface WalletConnectSession {
  topic: string
  version: string
  bridge: string
  key: string
  clientId: string
  clientData: {
    name: string
    description: string
    url: string
    icons: string[]
  }
  peerId: string
  peerData: {
    name: string
    description: string
    url: string
    icons: string[]
  }
  chainId: number
  accounts: string[]
  handshakeTopic: string
  handshakeId: number
  approved: boolean
  connected: boolean
  createdAt: Date
  lastActivity: Date
}

interface MobileWallet {
  id: string
  name: string
  description: string
  homepage: string
  chains: string[]
  icons: string[]
  mobile: {
    native: string
    universal: string
  }
  supportedMethods: string[]
  supportedEvents: string[]
  isInstalled?: boolean
}

interface WalletConnectProps {
  onSessionConnected: (session: WalletConnectSession) => void
  onSessionDisconnected: (sessionTopic: string) => void
  onAccountSelected: (account: string) => void
}

// Supported mobile wallets
const SUPPORTED_WALLETS: MobileWallet[] = [
  {
    id: 'trust',
    name: 'Trust Wallet',
    description: 'Trust Wallet - Multi-cryptocurrency wallet',
    homepage: 'https://trustwallet.com',
    chains: ['stellar:1', 'stellar:3'],
    icons: ['https://trustwallet.com/images/favicon.png'],
    mobile: {
      native: 'trust://',
      universal: 'https://link.trustwallet.com/'
    },
    supportedMethods: [
      'stellar_signTransaction',
      'stellar_signMessage',
      'stellar_getAddress',
      'stellar_getPublicKey'
    ],
    supportedEvents: [
      'accountsChanged',
      'chainChanged',
      'disconnect'
    ]
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'MetaMask - Ethereum & Stellar wallet',
    homepage: 'https://metamask.io',
    chains: ['stellar:1', 'stellar:3'],
    icons: ['https://metamask.io/images/favicon.png'],
    mobile: {
      native: 'metamask://',
      universal: 'https://metamask.app.link/'
    },
    supportedMethods: [
      'stellar_signTransaction',
      'stellar_signMessage',
      'stellar_getAddress',
      'stellar_getPublicKey'
    ],
    supportedEvents: [
      'accountsChanged',
      'chainChanged',
      'disconnect'
    ]
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Coinbase Wallet - Secure crypto wallet',
    homepage: 'https://wallet.coinbase.com',
    chains: ['stellar:1', 'stellar:3'],
    icons: ['https://wallet.coinbase.com/favicon.ico'],
    mobile: {
      native: 'cbwallet://',
      universal: 'https://go.cb-wallet.com/'
    },
    supportedMethods: [
      'stellar_signTransaction',
      'stellar_signMessage',
      'stellar_getAddress',
      'stellar_getPublicKey'
    ],
    supportedEvents: [
      'accountsChanged',
      'chainChanged',
      'disconnect'
    ]
  },
  {
    id: 'ledger',
    name: 'Ledger Live',
    description: 'Ledger Live - Hardware wallet companion',
    homepage: 'https://www.ledger.com/ledger-live',
    chains: ['stellar:1', 'stellar:3'],
    icons: ['https://www.ledger.com/favicon.ico'],
    mobile: {
      native: 'ledgerlive://',
      universal: 'https://ledger.com/'
    },
    supportedMethods: [
      'stellar_signTransaction',
      'stellar_signMessage',
      'stellar_getAddress',
      'stellar_getPublicKey'
    ],
    supportedEvents: [
      'accountsChanged',
      'chainChanged',
      'disconnect'
    ]
  },
  {
    id: 'exodus',
    name: 'Exodus',
    description: 'Exodus - Multi-asset wallet',
    homepage: 'https://www.exodus.com',
    chains: ['stellar:1', 'stellar:3'],
    icons: ['https://www.exodus.com/favicon.ico'],
    mobile: {
      native: 'exodus://',
      universal: 'https://exodus.io/'
    },
    supportedMethods: [
      'stellar_signTransaction',
      'stellar_signMessage',
      'stellar_getAddress',
      'stellar_getPublicKey'
    ],
    supportedEvents: [
      'accountsChanged',
      'chainChanged',
      'disconnect'
    ]
  }
]

export const WalletConnect: React.FC<WalletConnectProps> = ({
  onSessionConnected,
  onSessionDisconnected,
  onAccountSelected
}) => {
  const [state, setState] = useState({
    sessions: [] as WalletConnectSession[],
    qrCodeUri: '',
    selectedWallet: null as MobileWallet | null,
    isConnecting: false,
    showQRCode: false,
    connectionStatus: 'idle' as 'idle' | 'connecting' | 'connected' | 'error',
    timeRemaining: 0,
    error: null as string | null,
    showWalletList: true,
    copiedToClipboard: false
  })

  // Mock sessions data
  const mockSessions: WalletConnectSession[] = [
    {
      topic: 'topic-abc123',
      version: '2.0',
      bridge: 'https://bridge.walletconnect.org',
      key: 'key-xyz789',
      clientId: 'client-123',
      clientData: {
        name: 'CurrentDao',
        description: 'Decentralized energy marketplace',
        url: 'https://currentdao.org',
        icons: ['https://currentdao.org/icon.png']
      },
      peerId: 'peer-456',
      peerData: {
        name: 'Trust Wallet',
        description: 'Trust Wallet - Multi-cryptocurrency wallet',
        url: 'https://trustwallet.com',
        icons: ['https://trustwallet.com/images/favicon.png']
      },
      chainId: 1,
      accounts: ['G' + Math.random().toString(36).substr(2, 55).toUpperCase()],
      handshakeTopic: 'handshake-789',
      handshakeId: Date.now(),
      approved: true,
      connected: true,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      lastActivity: new Date()
    }
  ]

  useEffect(() => {
    setState(prev => ({ ...prev, sessions: mockSessions }))
  }, [])

  // Generate QR Code URI
  const generateQRCode = useCallback(async (walletId?: string) => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Simulate QR code generation
      await new Promise(resolve => setTimeout(resolve, 1000))

      const handshakeTopic = 'topic-' + Math.random().toString(36).substr(2, 32)
      const clientId = 'client-' + Math.random().toString(36).substr(2, 32)
      
      const uri = `wc:${handshakeTopic}@2?` +
        `relay-protocol=irn&` +
        `symKey=${Math.random().toString(36).substr(2, 64)}&` +
        `client-id=${clientId}&` +
        `client-name=CurrentDao&` +
        `client-desc=Decentralized energy marketplace&` +
        `client-url=https://currentdao.org&` +
        `client-icons=https://currentdao.org/icon.png&` +
        `chainId=stellar:1`

      setState(prev => ({
        ...prev,
        qrCodeUri: uri,
        showQRCode: true,
        isConnecting: false,
        connectionStatus: 'connecting',
        timeRemaining: 300 // 5 minutes
      }))

      // Start countdown
      startCountdown()

      // If specific wallet selected, try to open it
      if (walletId) {
        const wallet = SUPPORTED_WALLETS.find(w => w.id === walletId)
        if (wallet) {
          openMobileWallet(wallet, uri)
        }
      }

      // Simulate connection after delay
      setTimeout(() => {
        handleConnectionSuccess()
      }, 5000)

    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        connectionStatus: 'error',
        error: 'Failed to generate QR code'
      }))
      toast.error('Failed to generate QR code')
    }
  }, [])

  // Start countdown timer
  const startCountdown = useCallback(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const newTime = prev.timeRemaining - 1
        if (newTime <= 0) {
          clearInterval(interval)
          return {
            ...prev,
            timeRemaining: 0,
            showQRCode: false,
            connectionStatus: 'idle'
          }
        }
        return { ...prev, timeRemaining: newTime }
      })
    }, 1000)
  }, [])

  // Handle connection success
  const handleConnectionSuccess = useCallback(() => {
    const newSession: WalletConnectSession = {
      topic: 'topic-' + Math.random().toString(36).substr(2, 32),
      version: '2.0',
      bridge: 'https://bridge.walletconnect.org',
      key: 'key-' + Math.random().toString(36).substr(2, 32),
      clientId: 'client-' + Math.random().toString(36).substr(2, 32),
      clientData: {
        name: 'CurrentDao',
        description: 'Decentralized energy marketplace',
        url: 'https://currentdao.org',
        icons: ['https://currentdao.org/icon.png']
      },
      peerId: 'peer-' + Math.random().toString(36).substr(2, 32),
      peerData: {
        name: state.selectedWallet?.name || 'Mobile Wallet',
        description: state.selectedWallet?.description || 'Mobile wallet',
        url: state.selectedWallet?.homepage || '',
        icons: state.selectedWallet?.icons || []
      },
      chainId: 1,
      accounts: ['G' + Math.random().toString(36).substr(2, 55).toUpperCase()],
      handshakeTopic: 'handshake-' + Math.random().toString(36).substr(2, 32),
      handshakeId: Date.now(),
      approved: true,
      connected: true,
      createdAt: new Date(),
      lastActivity: new Date()
    }

    setState(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
      showQRCode: false,
      connectionStatus: 'connected',
      selectedWallet: null,
      showWalletList: true
    }))

    onSessionConnected(newSession)
    toast.success('Successfully connected to mobile wallet')
  }, [state.selectedWallet, onSessionConnected])

  // Open mobile wallet
  const openMobileWallet = useCallback((wallet: MobileWallet, uri: string) => {
    try {
      // Try universal link first
      const universalLink = `${wallet.mobile.universal}wc?uri=${encodeURIComponent(uri)}`
      
      if (typeof window !== 'undefined') {
        // Try to open universal link
        window.open(universalLink, '_blank')
        
        // Fallback to deep link after delay
        setTimeout(() => {
          const deepLink = `${wallet.mobile.native}wc?uri=${encodeURIComponent(uri)}`
          window.location.href = deepLink
        }, 2000)
      }

      toast.info(`Opening ${wallet.name}...`)
    } catch (error) {
      toast.error(`Failed to open ${wallet.name}`)
    }
  }, [])

  // Disconnect session
  const disconnectSession = useCallback(async (sessionTopic: string) => {
    try {
      // Simulate disconnection
      await new Promise(resolve => setTimeout(resolve, 500))

      setState(prev => ({
        ...prev,
        sessions: prev.sessions.filter(s => s.topic !== sessionTopic)
      }))

      onSessionDisconnected(sessionTopic)
      toast.success('Disconnected from mobile wallet')
    } catch (error) {
      toast.error('Failed to disconnect')
    }
  }, [onSessionDisconnected])

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

  // Format time
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Get wallet icon
  const getWalletIcon = (wallet: MobileWallet) => {
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
        {wallet.name.charAt(0)}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">WalletConnect</h2>
          <p className="text-gray-600 mt-1">Connect your mobile wallet via QR code</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            state.connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
            state.connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {state.connectionStatus === 'connected' && 'Connected'}
            {state.connectionStatus === 'connecting' && 'Connecting...'}
            {state.connectionStatus === 'idle' && 'Disconnected'}
            {state.connectionStatus === 'error' && 'Error'}
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      {state.sessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
          
          {state.sessions.map(session => (
            <motion.div
              key={session.topic}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{session.peerData.name}</h4>
                    <p className="text-sm text-gray-500">{session.accounts.length} accounts</p>
                    <p className="text-xs text-gray-400">
                      Connected {session.createdAt.toLocaleDateString()} at {session.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-green-600">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm">Connected</span>
                  </div>
                  
                  <button
                    onClick={() => disconnectSession(session.topic)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Accounts */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  {session.accounts.map((account, index) => (
                    <div
                      key={account}
                      onClick={() => onAccountSelected(account)}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">Account {index + 1}</p>
                        <p className="text-sm text-gray-500 font-mono">{account}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      <AnimatePresence>
        {state.showQRCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setState(prev => ({ ...prev, showQRCode: false }))}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Connect Mobile Wallet</h3>
                <button
                  onClick={() => setState(prev => ({ ...prev, showQRCode: false }))}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  {state.qrCodeUri && (
                    <QRCodeSVG
                      value={state.qrCodeUri}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  )}
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Expires in {formatTime(state.timeRemaining)}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How to connect:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Open your mobile wallet app</li>
                      <li>Scan the QR code with your wallet</li>
                      <li>Approve the connection request</li>
                      <li>Select your account to continue</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => copyToClipboard(state.qrCodeUri)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  {state.copiedToClipboard ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{state.copiedToClipboard ? 'Copied!' : 'Copy URI'}</span>
                </button>
                
                <button
                  onClick={() => generateQRCode()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Selection */}
      {state.showWalletList && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Wallet</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUPPORTED_WALLETS.map(wallet => (
              <motion.button
                key={wallet.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setState(prev => ({ ...prev, selectedWallet: wallet }))
                  generateQRCode(wallet.id)
                }}
                className="bg-white rounded-lg border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-4">
                  {getWalletIcon(wallet)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{wallet.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{wallet.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Shield className="w-3 h-3" />
                        <span>Secure</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Quick Connect */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Connect</h4>
            <button
              onClick={() => generateQRCode()}
              disabled={state.isConnecting}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
            >
              <QrCode className="w-5 h-5" />
              <span>{state.isConnecting ? 'Generating...' : 'Generate QR Code'}</span>
            </button>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Scan with any WalletConnect-compatible mobile wallet
            </p>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">About WalletConnect</h4>
            <p className="text-sm text-blue-800 mb-2">
              WalletConnect is an open protocol for connecting decentralized applications to mobile wallets.
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Connect without installing browser extensions</li>
              <li>• Your private keys never leave your mobile device</li>
              <li>• Support for 50+ mobile wallets</li>
              <li>• End-to-end encrypted connection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletConnect
