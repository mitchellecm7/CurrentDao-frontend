import { Transaction } from '@stellar/stellar-sdk'
import Transport from '@ledgerhq/hw-transport'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import { appAssemble } from '@ledgerhq/hw-app-btc'
import type { TrezorConnect } from '@trezor/connect-web'

// Ledger Stellar App APDU commands
const LEDGER_STELLAR_CLA = 0xe0
const LEDGER_STELLAR_INS_GET_PUBLIC_KEY = 0x01
const LEDGER_STELLAR_INS_SIGN_TX = 0x04
const LEDGER_STELLAR_INS_APP_VERSION = 0x06
const LEDGER_STELLAR_INS_SIGN_MESSAGE = 0x0a
const LEDGER_STELLAR_INS_GET_APP_NAME = 0x0b

// Stellar derivation paths
export const STELLAR_DERIVATION_PATH = "44'/148'/0'"
export const STELLAR_DERIVATION_PATH_TESTNET = "44'/148'/1'"

export interface LedgerDeviceInfo {
  deviceId: string
  model: string
  firmwareVersion?: string
  appVersion?: string
  isStellarAppOpen: boolean
  batteryLevel?: number
}

export interface TrezorDeviceInfo {
  deviceId: string
  model: string
  firmwareVersion: string
  features: any
}

export interface HardwareWalletInfo {
  id: string
  type: 'ledger' | 'trezor' | 'keepkey'
  name: string
  model: string
  firmwareVersion: string
  isConnected: boolean
  isStellarAppOpen?: boolean
  connectionType: 'usb' | 'ble' | 'network'
  batteryLevel?: number
}

export interface HardwareWalletTransaction {
  transactionXDR: string
  network: 'mainnet' | 'testnet'
  fee?: number
  memo?: string
  operations: Array<{
    type: string
    [key: string]: any
  }>
}

export interface HardwareWalletSignature {
  signature: string
  publicKey: string
  derivationPath: string
}

export interface DeviceConnectionError {
  code: string
  message: string
  recoverable: boolean
}

// Ledger Transport helper functions
function encodeAPDU(ins: number, p1: number, p2: number, data: Buffer = Buffer.alloc(0)): Buffer {
  const cla = LEDGER_STELLAR_CLA
  const lc = data.length
  const le = 0 // expecting response
  return Buffer.from([cla, ins, p1, p2, lc, ...data, le])
}

function decodeAPDU(response: Buffer): Buffer {
  // Strip status word (last 2 bytes)
  if (response.length >= 2) {
    return response.slice(0, -2)
  }
  return response
}

// Parse Stellar public key from APDU response
function parsePublicKey(data: Buffer): string {
  // First byte is public key length (typically 33 or 32)
  const keyLength = data[0]
  const pubKey = data.slice(1, 1 + keyLength).toString('hex')
  // Stellar public keys are G... base32 encoded
  // The raw key from Ledger is compressed ECDSA public key (33 bytes)
  // Need to convert to Stellar G...
  // For simplicity, we'll encode as base32 with proper Stellar format
  const stellarPubKey = 'G' + Buffer.from(pubKey, 'hex').toString('base32').replace(/=+$/, '')
  return stellarPubKey.toUpperCase()
}

export class LedgerStellarService {
  private transport: Transport | null = null
  private devicePath: string | null = null

  async detectDevices(): Promise<{ id: string; path: string }[]> {
    try {
      // Check if WebUSB is supported
      if (!('usb' in navigator)) {
        throw new Error('WebUSB not supported')
      }

      // Request access to USB devices
      const devices = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x2c97 }, // Ledger vendor ID
          { productId: 0x0000 } // Accept any product
        ]
      })

      return devices.map(d => ({
        id: d.deviceId,
        path: d.deviceId
      }))
    } catch (error) {
      console.error('Ledger device detection error:', error)
      return []
    }
  }

  async connect(devicePath: string): Promise<void> {
    try {
      this.transport = await TransportWebUSB.create(devicePath)
      this.devicePath = devicePath

      // Verify Stellar app is installed
      await this.verifyStellarApp()
    } catch (error) {
      throw new Error(`Failed to connect to Ledger: ${error.message}`)
    }
  }

  private async verifyStellarApp(): Promise<void> {
    if (!this.transport) throw new Error('Not connected')

    try {
      const response = await this.sendAPDU(
        LEDGER_STELLAR_INS_GET_APP_NAME,
        0,
        0
      )
      const appName = response.toString('utf8').trim()
      if (!appName.includes('Stellar')) {
        throw new Error('Stellar app not open. Please open the Stellar app on your Ledger device.')
      }
    } catch (error) {
      if (error.message.includes('69')) {
        throw new Error('Stellar app not open. Please open the Stellar app on your Ledger device.')
      }
      throw error
    }
  }

  async getPublicKey(derivationPath: string = STELLAR_DERIVATION_PATH): Promise<string> {
    if (!this.transport) throw new Error('Not connected')

    try {
      // Encode derivation path for Ledger
      // Format: "44'/148'/0'" -> [44', 148', 0']
      const pathParts = derivationPath.split('/')
      const buffer = Buffer.alloc(1 + pathParts.length * 4)
      buffer[0] = pathParts.length // number of indexes

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i].replace("'", '')
        const index = parseInt(part, 10)
        buffer.writeUInt32BE(index, 1 + i * 4)
      }

      const response = await this.sendAPDU(
        LEDGER_STELLAR_INS_GET_PUBLIC_KEY,
        0,
        0,
        buffer
      )

      return parsePublicKey(response)
    } catch (error) {
      throw new Error(`Failed to get public key: ${error.message}`)
    }
  }

  async signTransaction(
    transactionXDR: string,
    derivationPath: string = STELLAR_DERIVATION_PATH
  ): Promise<string> {
    if (!this.transport) throw new Error('Not connected')

    try {
      // First, validate the transaction locally
      const tx = new Transaction(transactionXDR, 'PUBLIC')
      const txHash = tx.hash().toString('hex')

      // Encode derivation path
      const pathParts = derivationPath.split('/')
      const pathBuffer = Buffer.alloc(1 + pathParts.length * 4)
      pathBuffer[0] = pathParts.length

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i].replace("'", '')
        const index = parseInt(part, 10)
        pathBuffer.writeUInt32BE(index, 1 + i * 4)
      }

      // Encode transaction hash
      const txHashBuffer = Buffer.from(txHash, 'hex')

      // Combine path and hash
      const data = Buffer.concat([pathBuffer, txHashBuffer])

      // Show transaction details on device (INS_SIGN_TX with P1=0)
      const response = await this.sendAPDU(
        LEDGER_STELLAR_INS_SIGN_TX,
        0,
        0,
        data
      )

      // The response should be the signature
      return response.toString('hex')
    } catch (error) {
      throw new Error(`Failed to sign transaction: ${error.message}`)
    }
  }

  async getFirmwareVersion(): Promise<string> {
    if (!this.transport) throw new Error('Not connected')

    try {
      const response = await this.sendAPDU(
        LEDGER_STELLAR_INS_APP_VERSION,
        0,
        0
      )
      return response.toString('utf8').trim()
    } catch (error) {
      throw new Error(`Failed to get firmware version: ${error.message}`)
    }
  }

  private async sendAPDU(ins: number, p1: number, p2: number, data: Buffer = Buffer.alloc(0)): Promise<Buffer> {
    if (!this.transport) throw new Error('Not connected')

    const apdu = encodeAPDU(ins, p1, p2, data)
    let response: Buffer

    try {
      response = await this.transport.send(apdu)
    } catch (error) {
      throw new Error(`APDU command failed: ${error.message}`)
    }

    return decodeAPDU(response)
  }

  async disconnect(): Promise<void> {
    if (this.transport) {
      try {
        await this.transport.close()
      } catch (error) {
        console.error('Error closing Ledger transport:', error)
      }
      this.transport = null
      this.devicePath = null
    }
  }

  isConnected(): boolean {
    return this.transport !== null
  }
}

export class TrezorStellarService {
  private trezorConnect: any = null
  private deviceId: string | null = null
  private session: any = null

  constructor() {
    this.initializeTrezor()
  }

  private initializeTrezor(): void {
    // Dynamic import for Trezor Connect Web
    if (typeof window !== 'undefined') {
      this.loadTrezorConnect()
    }
  }

  private async loadTrezorConnect(): Promise<void> {
    try {
      const TrezorConnectModule = await import('@trezor/connect-web')
      this.trezorConnect = TrezorConnectModule.default
    } catch (error) {
      console.error('Failed to load Trezor Connect:', error)
      throw new Error('Trezor Connect library not available')
    }
  }

  async detectDevices(): Promise<{ id: string; model: string }[]> {
    if (!this.trezorConnect) {
      await this.loadTrezorConnect()
    }

    try {
      const result = await this.trezorConnect.getFeatures()
      if (result.success && result.payload) {
        return [{
          id: result.payload.device_id,
          model: result.payload.device_id?.includes('T2T1') ? 'Trezor Model T' : 'Trezor One'
        }]
      }
      return []
    } catch (error) {
      console.error('Trezor device detection error:', error)
      return []
    }
  }

  async connect(): Promise<void> {
    if (!this.trezorConnect) {
      await this.loadTrezorConnect()
    }

    try {
      const result = await this.trezorConnect.getFeatures()
      if (result.success && result.payload) {
        this.deviceId = result.payload.device_id
        this.session = result.payload
      } else {
        throw new Error('No Trezor device found')
      }
    } catch (error) {
      throw new Error(`Failed to connect to Trezor: ${error.message}`)
    }
  }

  async getPublicKey(derivationPath: string = STELLAR_DERIVATION_PATH): Promise<string> {
    if (!this.trezorConnect) {
      throw new Error('Trezor Connect not initialized')
    }

    try {
      const result = await this.trezorConnect.getPublicKey({
        path: derivationPath,
        coin: 'stellar'
      })

      if (result.success && result.payload) {
        return result.payload.address
      } else {
        throw new Error(result.error?.description || 'Failed to get public key')
      }
    } catch (error: any) {
      throw new Error(`Failed to get public key: ${error.message}`)
    }
  }

  async signTransaction(
    transactionXDR: string,
    derivationPath: string = STELLAR_DERIVATION_PATH
  ): Promise<string> {
    if (!this.trezorConnect) {
      throw new Error('Trezor Connect not initialized')
    }

    try {
      const result = await this.trezorConnect.signTransaction({
        path: derivationPath,
        transaction: transactionXDR,
        coin: 'stellar'
      })

      if (result.success && result.payload) {
        return result.payload.signature
      } else {
        throw new Error(result.error?.description || 'Failed to sign transaction')
      }
    } catch (error: any) {
      if (error.message?.includes('User')) {
        throw new Error('Transaction signing was rejected by user')
      }
      throw new Error(`Failed to sign transaction: ${error.message}`)
    }
  }

  async getFirmwareVersion(): Promise<string> {
    if (!this.session) {
      throw new Error('Not connected')
    }
    return this.session.firmware_version || 'Unknown'
  }

  async disconnect(): Promise<void> {
    this.deviceId = null
    this.session = null
  }

  isConnected(): boolean {
    return this.deviceId !== null
  }
}

// Unified hardware wallet service
export class HardwareWalletService {
  private ledgerService: LedgerStellarService
  private trezorService: TrezorStellarService
  private keepkeyService: any = null // TODO: Implement KeepKey

  constructor() {
    this.ledgerService = new LedgerStellarService()
    this.trezorService = new TrezorStellarService()
  }

  async detectAllDevices(): Promise<HardwareWalletInfo[]> {
    const devices: HardwareWalletInfo[] = []

    // Detect Ledger devices
    try {
      const ledgerDevices = await this.ledgerService.detectDevices()
      for (const device of ledgerDevices) {
        devices.push({
          id: `ledger-${device.id}`,
          type: 'ledger',
          name: 'Ledger Nano X',
          model: 'Nano X',
          firmwareVersion: 'Unknown',
          isConnected: false,
          connectionType: 'usb'
        })
      }
    } catch (error) {
      console.error('Error detecting Ledger:', error)
    }

    // Detect Trezor devices
    try {
      const trezorDevices = await this.trezorService.detectDevices()
      for (const device of trezorDevices) {
        devices.push({
          id: `trezor-${device.id}`,
          type: 'trezor',
          name: device.model,
          model: device.model,
          firmwareVersion: 'Unknown',
          isConnected: false,
          connectionType: 'usb'
        })
      }
    } catch (error) {
      console.error('Error detecting Trezor:', error)
    }

    return devices
  }

  async connectDevice(type: 'ledger' | 'trezor'): Promise<void> {
    if (type === 'ledger') {
      await this.ledgerService.connect(await this.getFirstLedgerPath())
    } else if (type === 'trezor') {
      await this.trezorService.connect()
    }
  }

  private async getFirstLedgerPath(): Promise<string> {
    const devices = await this.ledgerService.detectDevices()
    if (devices.length === 0) {
      throw new Error('No Ledger device found')
    }
    return devices[0].path
  }

  async signWithLedger(
    transactionXDR: string,
    derivationPath?: string
  ): Promise<HardwareWalletSignature> {
    try {
      const publicKey = await this.ledgerService.getPublicKey(derivationPath)
      const signature = await this.ledgerService.signTransaction(transactionXDR, derivationPath)

      return {
        signature,
        publicKey,
        derivationPath: derivationPath || STELLAR_DERIVATION_PATH
      }
    } catch (error) {
      throw error
    }
  }

  async signWithTrezor(
    transactionXDR: string,
    derivationPath?: string
  ): Promise<HardwareWalletSignature> {
    try {
      const publicKey = await this.trezorService.getPublicKey(derivationPath)
      const signature = await this.trezorService.signTransaction(transactionXDR, derivationPath)

      return {
        signature,
        publicKey,
        derivationPath: derivationPath || STELLAR_DERIVATION_PATH
      }
    } catch (error) {
      throw error
    }
  }

  async validateFirmware(type: 'ledger' | 'trezor'): Promise<{ valid: boolean; version: string }> {
    try {
      const service = type === 'ledger' ? this.ledgerService : this.trezorService
      if (!service.isConnected()) {
        throw new Error('Device not connected')
      }

      const firmwareVersion = await service.getFirmwareVersion()

      // Minimum firmware versions for Stellar app
      const minVersions: Record<string, string> = {
        ledger: '1.2.0',
        trezor: '2.4.0'
      }

      const minVersion = minVersions[type]
      const isValid = this.compareVersions(firmwareVersion, minVersion) >= 0

      return { valid: isValid, version: firmwareVersion }
    } catch (error) {
      return { valid: false, version: 'Unknown' }
    }
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0
      const part2 = parts2[i] || 0
      if (part1 > part2) return 1
      if (part1 < part2) return -1
    }
    return 0
  }

  async disconnectAll(): Promise<void> {
    await this.ledgerService.disconnect()
    await this.trezorService.disconnect()
  }
}

// Singleton instance
export const hardwareWalletService = new HardwareWalletService()