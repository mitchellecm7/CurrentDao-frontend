import { Transaction } from '@stellar/stellar-sdk'

// WalletConnect protocol interfaces
export interface WalletConnectSession {
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
}

export interface WalletConnectRequest {
  id: number
  jsonrpc: '2.0'
  method: string
  params: any[]
}

export interface WalletConnectResponse {
  id: number
  jsonrpc: '2.0'
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
}

export interface WalletConnectOptions {
  bridge: string
  qrcodeModal: boolean
  connectTimeout: number
  sessionTimeout: number
  network: 'mainnet' | 'testnet'
}

export interface MobileWalletInfo {
  name: string
  id: string
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
}

export interface QRCodeData {
  uri: string
  expires: number
  timestamp: number
}

export interface WalletConnectError {
  code: string
  message: string
  session?: WalletConnectSession
  request?: WalletConnectRequest
  recoverable: boolean
}

// Supported mobile wallets configuration
const SUPPORTED_WALLETS: MobileWalletInfo[] = [
  {
    name: 'Trust Wallet',
    id: 'trust',
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
    name: 'MetaMask',
    id: 'metamask',
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
    name: 'Coinbase Wallet',
    id: 'coinbase',
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
    name: 'Ledger Live',
    id: 'ledger',
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
    name: 'Exodus',
    id: 'exodus',
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

export class WalletConnectService {
  private sessions: Map<string, WalletConnectSession> = new Map()
  private pendingRequests: Map<number, (response: WalletConnectResponse) => void> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()
  private defaultOptions: WalletConnectOptions = {
    bridge: 'https://bridge.walletconnect.org',
    qrcodeModal: true,
    connectTimeout: 30000,
    sessionTimeout: 86400000, // 24 hours
    network: 'mainnet'
  }

  constructor(options?: Partial<WalletConnectOptions>) {
    this.defaultOptions = { ...this.defaultOptions, ...options }
    this.initializeEventHandlers()
  }

  // Connection Management
  async connect(walletId?: string, options?: Partial<WalletConnectOptions>): Promise<WalletConnectSession> {
    const opts = { ...this.defaultOptions, ...options }
    
    try {
      // Generate session parameters
      const handshakeTopic = this.generateTopic()
      const clientId = this.generateClientId()
      const clientData = {
        name: 'CurrentDao',
        description: 'Decentralized energy marketplace',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://currentdao.org',
        icons: ['https://currentdao.org/icon.png']
      }

      // Create QR code URI
      const qrCodeUri = this.createQRCodeUri(handshakeTopic, clientId, clientData, opts.network)

      // Generate session
      const session: WalletConnectSession = {
        topic: handshakeTopic,
        version: '2.0',
        bridge: opts.bridge,
        key: this.generateKey(),
        clientId,
        clientData,
        peerId: '',
        peerData: {
          name: '',
          description: '',
          url: '',
          icons: []
        },
        chainId: opts.network === 'mainnet' ? 1 : 3,
        accounts: [],
        handshakeTopic,
        handshakeId: Date.now(),
        approved: false,
        connected: false
      }

      // Store pending session
      this.sessions.set(handshakeTopic, session)

      // If specific wallet requested, try to open it
      if (walletId) {
        await this.openMobileWallet(walletId, qrCodeUri)
      }

      // Wait for session approval
      const approvedSession = await this.waitForSessionApproval(handshakeTopic, opts.connectTimeout)

      return approvedSession
    } catch (error) {
      throw new WalletConnectError(
        'CONNECTION_FAILED',
        `Failed to connect: ${error.message}`,
        undefined,
        undefined,
        true
      )
    }
  }

  private createQRCodeUri(
    handshakeTopic: string,
    clientId: string,
    clientData: any,
    network: 'mainnet' | 'testnet'
  ): string {
    const uri = `wc:${handshakeTopic}@2?` +
      `relay-protocol=irn&` +
      `symKey=${this.generateKey()}&` +
      `client-id=${clientId}&` +
      `client-name=${encodeURIComponent(clientData.name)}&` +
      `client-desc=${encodeURIComponent(clientData.description)}&` +
      `client-url=${encodeURIComponent(clientData.url)}&` +
      `client-icons=${encodeURIComponent(clientData.icons.join(','))}&` +
      `chainId=${network === 'mainnet' ? 'stellar:1' : 'stellar:3'}`

    return uri
  }

  private async waitForSessionApproval(
    handshakeTopic: string,
    timeout: number
  ): Promise<WalletConnectSession> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.sessions.delete(handshakeTopic)
        reject(new Error('Connection timeout'))
      }, timeout)

      const checkApproval = () => {
        const session = this.sessions.get(handshakeTopic)
        if (session && session.approved) {
          clearTimeout(timeoutId)
          resolve(session)
        } else {
          setTimeout(checkApproval, 500)
        }
      }

      checkApproval()
    })
  }

  async disconnect(sessionTopic: string): Promise<void> {
    const session = this.sessions.get(sessionTopic)
    if (!session) {
      throw new WalletConnectError(
        'SESSION_NOT_FOUND',
        'Session not found',
        undefined,
        undefined,
        false
      )
    }

    try {
      // Send disconnect request
      const disconnectRequest: WalletConnectRequest = {
        id: Date.now(),
        jsonrpc: '2.0',
        method: 'wc_sessionRequest',
        params: [{
          topic: sessionTopic,
          reason: {
            code: 6000,
            message: 'USER_DISCONNECTED'
          }
        }]
      }

      // Remove session
      this.sessions.delete(sessionTopic)

      // Emit disconnect event
      this.emitEvent('disconnected', { session })
    } catch (error) {
      throw new WalletConnectError(
        'DISCONNECT_FAILED',
        `Failed to disconnect: ${error.message}`,
        session,
        undefined,
        true
      )
    }
  }

  // Request Handling
  async sendRequest<T = any>(
    sessionTopic: string,
    method: string,
    params: any[] = []
  ): Promise<T> {
    const session = this.sessions.get(sessionTopic)
    if (!session || !session.connected) {
      throw new WalletConnectError(
        'SESSION_NOT_CONNECTED',
        'Session not connected',
        session,
        undefined,
        false
      )
    }

    return new Promise((resolve, reject) => {
      const request: WalletConnectRequest = {
        id: Date.now(),
        jsonrpc: '2.0',
        method,
        params
      }

      // Store pending request
      this.pendingRequests.set(request.id, (response) => {
        if (response.error) {
          reject(new Error(response.error.message))
        } else {
          resolve(response.result)
        }
      })

      // Simulate sending request to mobile wallet
      this.simulateRequestToMobileWallet(session, request)
    })
  }

  private simulateRequestToMobileWallet(
    session: WalletConnectSession,
    request: WalletConnectRequest
  ): void {
    // Simulate mobile wallet processing
    setTimeout(() => {
      let response: WalletConnectResponse

      switch (request.method) {
        case 'stellar_getAddress':
        case 'stellar_getPublicKey':
          response = {
            id: request.id,
            jsonrpc: '2.0',
            result: 'G' + Math.random().toString(36).substr(2, 55).toUpperCase()
          }
          break

        case 'stellar_signTransaction':
          response = {
            id: request.id,
            jsonrpc: '2.0',
            result: this.generateMockSignature(request.params[0])
          }
          break

        case 'stellar_signMessage':
          response = {
            id: request.id,
            jsonrpc: '2.0',
            result: this.generateMockSignature(request.params[0])
          }
          break

        default:
          response = {
            id: request.id,
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: 'Method not found'
            }
          }
      }

      const callback = this.pendingRequests.get(request.id)
      if (callback) {
        callback(response)
        this.pendingRequests.delete(request.id)
      }
    }, 1000)
  }

  // Stellar-specific methods
  async getStellarAddress(sessionTopic: string): Promise<string> {
    return this.sendRequest<string>(sessionTopic, 'stellar_getAddress')
  }

  async getStellarPublicKey(sessionTopic: string): Promise<string> {
    return this.sendRequest<string>(sessionTopic, 'stellar_getPublicKey')
  }

  async signStellarTransaction(
    sessionTopic: string,
    transactionXDR: string,
    network: 'mainnet' | 'testnet' = 'mainnet'
  ): Promise<string> {
    return this.sendRequest<string>(sessionTopic, 'stellar_signTransaction', [transactionXDR, network])
  }

  async signStellarMessage(
    sessionTopic: string,
    message: string
  ): Promise<string> {
    return this.sendRequest<string>(sessionTopic, 'stellar_signMessage', [message])
  }

  // QR Code Management
  generateQRCode(walletId?: string): Promise<QRCodeData> {
    const handshakeTopic = this.generateTopic()
    const clientId = this.generateClientId()
    const clientData = {
      name: 'CurrentDao',
      description: 'Decentralized energy marketplace',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://currentdao.org',
      icons: ['https://currentdao.org/icon.png']
    }

    const uri = this.createQRCodeUri(handshakeTopic, clientId, clientData, this.defaultOptions.network)

    return Promise.resolve({
      uri,
      expires: Date.now() + this.defaultOptions.connectTimeout,
      timestamp: Date.now()
    })
  }

  // Mobile Wallet Integration
  async openMobileWallet(walletId: string, uri: string): Promise<void> {
    const wallet = SUPPORTED_WALLETS.find(w => w.id === walletId)
    if (!wallet) {
      throw new WalletConnectError(
        'WALLET_NOT_SUPPORTED',
        `Wallet ${walletId} is not supported`,
        undefined,
        undefined,
        false
      )
    }

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
    } catch (error) {
      throw new WalletConnectError(
        'WALLET_OPEN_FAILED',
        `Failed to open ${wallet.name}: ${error.message}`,
        undefined,
        undefined,
        true
      )
    }
  }

  // Session Management
  getActiveSessions(): WalletConnectSession[] {
    return Array.from(this.sessions.values()).filter(session => session.connected)
  }

  getSession(sessionTopic: string): WalletConnectSession | undefined {
    return this.sessions.get(sessionTopic)
  }

  // Event Handling
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  removeEventListener(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  private initializeEventHandlers(): void {
    // Handle incoming requests from mobile wallets
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        this.handleIncomingMessage(event.data)
      })
    }
  }

  private handleIncomingMessage(data: any): void {
    try {
      const response = data as WalletConnectResponse
      const callback = this.pendingRequests.get(response.id)
      
      if (callback) {
        callback(response)
        this.pendingRequests.delete(response.id)
      }
    } catch (error) {
      console.error('Failed to handle incoming message:', error)
    }
  }

  // Utility Methods
  private generateTopic(): string {
    return 'topic-' + Math.random().toString(36).substr(2, 32)
  }

  private generateClientId(): string {
    return 'client-' + Math.random().toString(36).substr(2, 32)
  }

  private generateKey(): string {
    return Math.random().toString(36).substr(2, 64)
  }

  private generateMockSignature(data: string): string {
    // Generate deterministic mock signature
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(128, '0')
  }

  // Cleanup
  disconnectAll(): void {
    const sessionTopics = Array.from(this.sessions.keys())
    sessionTopics.forEach(topic => {
      this.disconnect(topic).catch(console.error)
    })
  }

  // Wallet Discovery
  getSupportedWallets(): MobileWalletInfo[] {
    return SUPPORTED_WALLETS
  }

  isWalletSupported(walletId: string): boolean {
    return SUPPORTED_WALLETS.some(wallet => wallet.id === walletId)
  }

  // Validation
  validateSession(session: WalletConnectSession): boolean {
    return !!(
      session.topic &&
      session.clientId &&
      session.chainId &&
      session.accounts &&
      session.connected
    )
  }

  validateRequest(request: WalletConnectRequest): boolean {
    return !!(
      request.id &&
      request.jsonrpc === '2.0' &&
      request.method
    )
  }
}

// Error class for WalletConnect operations
export class WalletConnectError extends Error {
  constructor(
    public code: string,
    message: string,
    public session?: WalletConnectSession,
    public request?: WalletConnectRequest,
    public recoverable: boolean = true
  ) {
    super(message)
    this.name = 'WalletConnectError'
  }
}

// Singleton instance
export const walletConnectService = new WalletConnectService()

// Utility functions
export const isWalletConnectSupported = (): boolean => {
  return typeof window !== 'undefined' && 
         (typeof window.fetch === 'function' || typeof window.WebSocket !== 'undefined')
}

export const generateWalletConnectURI = (
  handshakeTopic: string,
  clientId: string,
  clientData: any,
  chainId: string
): string => {
  return `wc:${handshakeTopic}@2?` +
    `relay-protocol=irn&` +
    `symKey=${Math.random().toString(36).substr(2, 64)}&` +
    `client-id=${clientId}&` +
    `client-name=${encodeURIComponent(clientData.name)}&` +
    `client-desc=${encodeURIComponent(clientData.description)}&` +
    `client-url=${encodeURIComponent(clientData.url)}&` +
    `client-icons=${encodeURIComponent(clientData.icons.join(','))}&` +
    `chainId=${chainId}`
}

export const parseWalletConnectURI = (uri: string): any => {
  const url = new URL(uri)
  const params = new URLSearchParams(url.search)
  
  return {
    handshakeTopic: url.pathname.substring(1).split('@')[0],
    version: url.pathname.substring(1).split('@')[1],
    relayProtocol: params.get('relay-protocol'),
    symKey: params.get('symKey'),
    clientId: params.get('client-id'),
    clientName: params.get('client-name'),
    clientDesc: params.get('client-desc'),
    clientUrl: params.get('client-url'),
    clientIcons: params.get('client-icons')?.split(','),
    chainId: params.get('chainId')
  }
}
