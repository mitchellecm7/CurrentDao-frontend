import { Transaction } from '@stellar/stellar-sdk'

// Hardware wallet types and interfaces
export interface HardwareWalletInfo {
  id: string
  name: string
  type: 'ledger' | 'trezor' | 'keepkey' | 'custom'
  version: string
  isConnected: boolean
  lastConnected?: Date
  supportedApps: string[]
}

export interface HardwareWalletConnection {
  walletId: string
  transport: 'usb' | 'ble' | 'network'
  devicePath?: string
  bluetoothId?: string
  sessionId: string
}

export interface HardwareWalletAccount {
  publicKey: string
  derivationPath: string
  name: string
  index: number
  isDefault: boolean
}

export interface HardwareWalletSignature {
  signature: string
  publicKey: string
  derivationPath: string
}

export interface HardwareWalletTransaction {
  transactionXDR: string
  network: 'mainnet' | 'testnet'
  fee: number
  memo?: string
  operations: any[]
}

export interface HardwareWalletError {
  code: string
  message: string
  walletId?: string
  operation?: string
  recoverable: boolean
}

// Hardware wallet device configurations
const HARDWARE_WALLET_CONFIGS = {
  ledger: {
    name: 'Ledger',
    supportedModels: ['Nano S', 'Nano X', 'Nano S Plus'],
    stellarApp: 'Stellar',
    minAppVersion: '1.2.0',
    derivationPath: "m/44'/148'/0'"
  },
  trezor: {
    name: 'Trezor',
    supportedModels: ['Trezor One', 'Trezor Model T'],
    stellarApp: 'Stellar',
    minAppVersion: '2.4.0',
    derivationPath: "m/44'/148'/0'"
  },
  keepkey: {
    name: 'KeepKey',
    supportedModels: ['KeepKey'],
    stellarApp: 'Stellar',
    minAppVersion: '6.2.0',
    derivationPath: "m/44'/148'/0'"
  }
}

export class HardwareWalletService {
  private connections: Map<string, HardwareWalletConnection> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()

  constructor() {
    this.initializeEventHandlers()
  }

  // Device Discovery and Connection
  async discoverDevices(): Promise<HardwareWalletInfo[]> {
    const devices: HardwareWalletInfo[] = []

    try {
      // Simulate device discovery for all supported types
      for (const [type, config] of Object.entries(HARDWARE_WALLET_CONFIGS)) {
        const connectedDevices = await this.discoverDevicesByType(type)
        devices.push(...connectedDevices)
      }

      return devices
    } catch (error) {
      throw new HardwareWalletError(
        'DEVICE_DISCOVERY_FAILED',
        'Failed to discover hardware wallet devices',
        undefined,
        'discoverDevices',
        true
      )
    }
  }

  private async discoverDevicesByType(type: string): Promise<HardwareWalletInfo[]> {
    // Simulate device discovery - in real implementation would use WebUSB/WebBluetooth APIs
    const mockDevices: HardwareWalletInfo[] = []

    if (type === 'ledger') {
      // Mock Ledger device detection
      mockDevices.push({
        id: 'ledger-nano-x-001',
        name: 'Ledger Nano X',
        type: 'ledger',
        version: '1.0.0',
        isConnected: true,
        lastConnected: new Date(),
        supportedApps: ['Stellar', 'Bitcoin', 'Ethereum']
      })
    } else if (type === 'trezor') {
      // Mock Trezor device detection
      mockDevices.push({
        id: 'trezor-model-t-001',
        name: 'Trezor Model T',
        type: 'trezor',
        version: '2.5.0',
        isConnected: true,
        lastConnected: new Date(),
        supportedApps: ['Stellar', 'Bitcoin', 'Ethereum']
      })
    }

    return mockDevices
  }

  async connectDevice(walletInfo: HardwareWalletInfo, transport: 'usb' | 'ble' = 'usb'): Promise<HardwareWalletConnection> {
    try {
      // Validate device compatibility
      await this.validateDeviceCompatibility(walletInfo)

      // Establish connection based on transport type
      const connection = await this.establishConnection(walletInfo, transport)
      
      // Store connection
      this.connections.set(walletInfo.id, connection)

      // Emit connection event
      this.emitEvent('deviceConnected', { walletInfo, connection })

      return connection
    } catch (error) {
      throw new HardwareWalletError(
        'CONNECTION_FAILED',
        `Failed to connect to ${walletInfo.name}: ${error.message}`,
        walletInfo.id,
        'connectDevice',
        true
      )
    }
  }

  private async validateDeviceCompatibility(walletInfo: HardwareWalletInfo): Promise<void> {
    const config = HARDWARE_WALLET_CONFIGS[walletInfo.type]
    if (!config) {
      throw new Error(`Unsupported wallet type: ${walletInfo.type}`)
    }

    // In real implementation, would check device version and app compatibility
    console.log(`Validating ${walletInfo.name} compatibility...`)
  }

  private async establishConnection(walletInfo: HardwareWalletInfo, transport: 'usb' | 'ble'): Promise<HardwareWalletConnection> {
    const sessionId = this.generateSessionId()

    if (transport === 'usb') {
      // Simulate USB connection
      return {
        walletId: walletInfo.id,
        transport: 'usb',
        devicePath: `/dev/${walletInfo.id}`,
        sessionId
      }
    } else if (transport === 'ble') {
      // Simulate Bluetooth connection
      return {
        walletId: walletInfo.id,
        transport: 'ble',
        bluetoothId: walletInfo.id,
        sessionId
      }
    }

    throw new Error(`Unsupported transport: ${transport}`)
  }

  async disconnectDevice(walletId: string): Promise<void> {
    const connection = this.connections.get(walletId)
    if (!connection) {
      throw new HardwareWalletError(
        'NOT_CONNECTED',
        'Device is not connected',
        walletId,
        'disconnectDevice',
        false
      )
    }

    try {
      // Close connection
      this.connections.delete(walletId)

      // Emit disconnection event
      this.emitEvent('deviceDisconnected', { walletId })
    } catch (error) {
      throw new HardwareWalletError(
        'DISCONNECTION_FAILED',
        `Failed to disconnect device: ${error.message}`,
        walletId,
        'disconnectDevice',
        true
      )
    }
  }

  // Account Management
  async getAccounts(walletId: string, derivationPath?: string): Promise<HardwareWalletAccount[]> {
    const connection = this.connections.get(walletId)
    if (!connection) {
      throw new HardwareWalletError(
        'NOT_CONNECTED',
        'Device is not connected',
        walletId,
        'getAccounts',
        false
      )
    }

    try {
      const accounts: HardwareWalletAccount[] = []
      const basePath = derivationPath || HARDWARE_WALLET_CONFIGS.ledger.derivationPath

      // Get first 5 accounts
      for (let i = 0; i < 5; i++) {
        const path = `${basePath}/${i}`
        const publicKey = await this.getPublicKey(walletId, path)
        
        accounts.push({
          publicKey,
          derivationPath: path,
          name: `Account ${i + 1}`,
          index: i,
          isDefault: i === 0
        })
      }

      return accounts
    } catch (error) {
      throw new HardwareWalletError(
        'ACCOUNT_RETRIEVAL_FAILED',
        `Failed to retrieve accounts: ${error.message}`,
        walletId,
        'getAccounts',
        true
      )
    }
  }

  async getPublicKey(walletId: string, derivationPath: string, verifyOnScreen: boolean = false): Promise<string> {
    const connection = this.connections.get(walletId)
    if (!connection) {
      throw new HardwareWalletError(
        'NOT_CONNECTED',
        'Device is not connected',
        walletId,
        'getPublicKey',
        false
      )
    }

    try {
      // Simulate public key retrieval from hardware wallet
      // In real implementation, would communicate with device via transport
      const mockPublicKey = this.generateMockPublicKey(derivationPath)
      
      if (verifyOnScreen) {
        // Simulate on-screen verification prompt
        await this.simulateUserVerification(walletId, 'Verify public key on device')
      }

      return mockPublicKey
    } catch (error) {
      throw new HardwareWalletError(
        'PUBLIC_KEY_RETRIEVAL_FAILED',
        `Failed to retrieve public key: ${error.message}`,
        walletId,
        'getPublicKey',
        true
      )
    }
  }

  // Transaction Signing
  async signTransaction(
    walletId: string, 
    transaction: HardwareWalletTransaction,
    derivationPath: string
  ): Promise<HardwareWalletSignature> {
    const connection = this.connections.get(walletId)
    if (!connection) {
      throw new HardwareWalletError(
        'NOT_CONNECTED',
        'Device is not connected',
        walletId,
        'signTransaction',
        false
      )
    }

    try {
      // Validate transaction
      await this.validateTransaction(transaction)

      // Get public key for verification
      const publicKey = await this.getPublicKey(walletId, derivationPath, true)

      // Simulate transaction signing on hardware wallet
      const signature = await this.performSigning(walletId, transaction, derivationPath)

      return {
        signature,
        publicKey,
        derivationPath
      }
    } catch (error) {
      throw new HardwareWalletError(
        'SIGNING_FAILED',
        `Failed to sign transaction: ${error.message}`,
        walletId,
        'signTransaction',
        true
      )
    }
  }

  private async validateTransaction(transaction: HardwareWalletTransaction): Promise<void> {
    try {
      // Parse and validate the transaction XDR
      const tx = new Transaction(transaction.transactionXDR, 
        transaction.network === 'mainnet' ? 'PUBLIC' : 'TESTNET')
      
      // Validate fee and operations
      if (tx.fee < 100) {
        throw new Error('Transaction fee too low')
      }

      if (tx.operations.length === 0) {
        throw new Error('Transaction has no operations')
      }

      console.log('Transaction validation passed')
    } catch (error) {
      throw new Error(`Invalid transaction: ${error.message}`)
    }
  }

  private async performSigning(
    walletId: string, 
    transaction: HardwareWalletTransaction, 
    derivationPath: string
  ): Promise<string> {
    // Simulate user confirmation on device
    await this.simulateUserVerification(walletId, 'Confirm transaction on device')

    // Simulate signature generation
    const signature = this.generateMockSignature(transaction.transactionXDR)
    
    // Emit signing event
    this.emitEvent('transactionSigned', { walletId, transaction, signature })

    return signature
  }

  // Device Management
  async getDeviceInfo(walletId: string): Promise<HardwareWalletInfo> {
    const connection = this.connections.get(walletId)
    if (!connection) {
      throw new HardwareWalletError(
        'NOT_CONNECTED',
        'Device is not connected',
        walletId,
        'getDeviceInfo',
        false
      )
    }

    // Return cached device info or fetch from device
    const deviceInfo = await this.fetchDeviceInfo(walletId)
    return deviceInfo
  }

  private async fetchDeviceInfo(walletId: string): Promise<HardwareWalletInfo> {
    // Simulate fetching device info
    return {
      id: walletId,
      name: 'Ledger Nano X',
      type: 'ledger',
      version: '1.0.0',
      isConnected: true,
      lastConnected: new Date(),
      supportedApps: ['Stellar', 'Bitcoin', 'Ethereum']
    }
  }

  async getDeviceStatus(walletId: string): Promise<{
    isConnected: boolean
    isAppOpen: boolean
    batteryLevel?: number
    firmwareVersion: string
  }> {
    const connection = this.connections.get(walletId)
    
    return {
      isConnected: !!connection,
      isAppOpen: true, // Simulate app being open
      batteryLevel: 85, // Mock battery level for BLE devices
      firmwareVersion: '1.0.0'
    }
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
    // Handle device disconnection
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      navigator.usb.addEventListener('disconnect', (event) => {
        const device = event.device
        const connection = Array.from(this.connections.values())
          .find(conn => conn.devicePath === device.deviceId)
        
        if (connection) {
          this.disconnectDevice(connection.walletId)
        }
      })
    }
  }

  // Utility Methods
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateMockPublicKey(derivationPath: string): string {
    // Generate deterministic mock public key based on derivation path
    const hash = this.simpleHash(derivationPath)
    return `G${hash.substr(0, 55)}`
  }

  private generateMockSignature(transactionXDR: string): string {
    // Generate deterministic mock signature based on transaction XDR
    const hash = this.simpleHash(transactionXDR)
    return `${hash.substr(0, 128)}`
  }

  private simpleHash(input: string): string {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(64, '0')
  }

  private async simulateUserVerification(walletId: string, message: string): Promise<void> {
    // Simulate user interaction delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`[${walletId}] ${message}`)
  }

  // Cleanup
  disconnectAll(): void {
    const walletIds = Array.from(this.connections.keys())
    walletIds.forEach(walletId => {
      this.disconnectDevice(walletId).catch(console.error)
    })
  }

  getConnectedDevices(): HardwareWalletInfo[] {
    return Array.from(this.connections.keys()).map(walletId => ({
      id: walletId,
      name: 'Connected Hardware Wallet',
      type: 'ledger' as const,
      version: '1.0.0',
      isConnected: true,
      lastConnected: new Date(),
      supportedApps: ['Stellar']
    }))
  }
}

// Error class for hardware wallet operations
export class HardwareWalletError extends Error {
  constructor(
    public code: string,
    message: string,
    public walletId?: string,
    public operation?: string,
    public recoverable: boolean = true
  ) {
    super(message)
    this.name = 'HardwareWalletError'
  }
}

// Singleton instance
export const hardwareWalletService = new HardwareWalletService()

// Utility functions
export const isHardwareWalletSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 
         (('usb' in navigator) || ('bluetooth' in navigator))
}

export const getSupportedWallets = (): string[] => {
  return Object.keys(HARDWARE_WALLET_CONFIGS)
}

export const validateDerivationPath = (path: string): boolean => {
  const stellarPathRegex = /^m\/44'\/148'\/\d+'?(\/\d+)?$/
  return stellarPathRegex.test(path)
}
