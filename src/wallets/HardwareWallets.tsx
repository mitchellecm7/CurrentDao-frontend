'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Usb, 
  Bluetooth, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Settings, 
  Eye, 
  EyeOff,
  Smartphone,
  Battery,
  Wifi,
  WifiOff,
  Zap,
  Lock,
  Unlock,
  Activity,
  Download,
  Upload,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

// Types
interface HardwareWalletDevice {
  id: string
  name: string
  type: 'ledger' | 'trezor' | 'keepkey' | 'custom'
  model: string
  version: string
  isConnected: boolean
  connectionType: 'usb' | 'ble' | 'network'
  batteryLevel?: number
  firmwareVersion: string
  supportedApps: string[]
  lastConnected?: Date
  status: 'ready' | 'busy' | 'error' | 'updating'
  features: {
    pinProtection: boolean
    passphraseProtection: boolean
    backupProtection: boolean
    deviceRecovery: boolean
  }
}

interface HardwareWalletAccount {
  publicKey: string
  derivationPath: string
  name: string
  index: number
  balance: string
  isActive: boolean
}

interface HardwareWalletProps {
  onDeviceConnected: (device: HardwareWalletDevice) => void
  onDeviceDisconnected: (deviceId: string) => void
  onAccountSelected: (account: HardwareWalletAccount) => void
}

export const HardwareWallets: React.FC<HardwareWalletProps> = ({
  onDeviceConnected,
  onDeviceDisconnected,
  onAccountSelected
}) => {
  const [state, setState] = useState({
    devices: [] as HardwareWalletDevice[],
    selectedDevice: null as HardwareWalletDevice | null,
    accounts: [] as HardwareWalletAccount[],
    isLoading: false,
    isScanning: false,
    showDetails: false,
    connectionStatus: 'idle' as 'idle' | 'connecting' | 'connected' | 'error',
    error: null as string | null,
    firmwareUpdateAvailable: false,
    batteryWarning: false
  })

  // Mock device data
  const mockDevices: HardwareWalletDevice[] = [
    {
      id: 'ledger-nano-x-001',
      name: 'Ledger Nano X',
      type: 'ledger',
      model: 'Nano X',
      version: '1.0.0',
      isConnected: true,
      connectionType: 'ble',
      batteryLevel: 85,
      firmwareVersion: '2.1.0',
      supportedApps: ['Stellar', 'Bitcoin', 'Ethereum', 'Ripple'],
      lastConnected: new Date(),
      status: 'ready',
      features: {
        pinProtection: true,
        passphraseProtection: true,
        backupProtection: true,
        deviceRecovery: true
      }
    },
    {
      id: 'trezor-model-t-001',
      name: 'Trezor Model T',
      type: 'trezor',
      model: 'Model T',
      version: '2.5.0',
      isConnected: false,
      connectionType: 'usb',
      firmwareVersion: '2.4.0',
      supportedApps: ['Stellar', 'Bitcoin', 'Ethereum', 'Litecoin'],
      lastConnected: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'ready',
      features: {
        pinProtection: true,
        passphraseProtection: true,
        backupProtection: true,
        deviceRecovery: true
      }
    },
    {
      id: 'keepkey-001',
      name: 'KeepKey',
      type: 'keepkey',
      model: 'KeepKey',
      version: '6.2.0',
      isConnected: false,
      connectionType: 'usb',
      firmwareVersion: '6.1.0',
      supportedApps: ['Stellar', 'Bitcoin', 'Ethereum'],
      lastConnected: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'ready',
      features: {
        pinProtection: true,
        passphraseProtection: false,
        backupProtection: true,
        deviceRecovery: true
      }
    }
  ]

  // Mock accounts data
  const mockAccounts: HardwareWalletAccount[] = [
    {
      publicKey: 'G' + Math.random().toString(36).substr(2, 55).toUpperCase(),
      derivationPath: "m/44'/148'/0'/0",
      name: 'Account 1',
      index: 0,
      balance: '125.750',
      isActive: true
    },
    {
      publicKey: 'G' + Math.random().toString(36).substr(2, 55).toUpperCase(),
      derivationPath: "m/44'/148'/0'/1",
      name: 'Account 2',
      index: 1,
      balance: '45.200',
      isActive: false
    },
    {
      publicKey: 'G' + Math.random().toString(36).substr(2, 55).toUpperCase(),
      derivationPath: "m/44'/148'/1'/0",
      name: 'Account 3',
      index: 0,
      balance: '890.000',
      isActive: false
    }
  ]

  useEffect(() => {
    // Initialize with mock devices
    setState(prev => ({ ...prev, devices: mockDevices }))
  }, [])

  // Scan for devices
  const scanForDevices = useCallback(async () => {
    setState(prev => ({ ...prev, isScanning: true, error: null }))

    try {
      // Simulate device scanning
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real implementation, would use hardware wallet services
      const discoveredDevices = mockDevices.map(device => ({
        ...device,
        isConnected: Math.random() > 0.5
      }))

      setState(prev => ({
        ...prev,
        devices: discoveredDevices,
        isScanning: false
      }))

      toast.success(`Found ${discoveredDevices.filter(d => d.isConnected).length} connected devices`)
    } catch (error) {
      setState(prev => ({
        ...prev,
        isScanning: false,
        error: 'Failed to scan for devices'
      }))
      toast.error('Failed to scan for hardware wallets')
    }
  }, [])

  // Connect to device
  const connectToDevice = useCallback(async (deviceId: string) => {
    const device = state.devices.find(d => d.id === deviceId)
    if (!device) return

    setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }))

    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 1500))

      const connectedDevice = {
        ...device,
        isConnected: true,
        status: 'ready' as const,
        lastConnected: new Date()
      }

      setState(prev => ({
        ...prev,
        selectedDevice: connectedDevice,
        devices: prev.devices.map(d => 
          d.id === deviceId ? connectedDevice : d
        ),
        connectionStatus: 'connected'
      }))

      // Load accounts for the device
      await loadDeviceAccounts(deviceId)

      onDeviceConnected(connectedDevice)
      toast.success(`Connected to ${device.name}`)
    } catch (error) {
      setState(prev => ({
        ...prev,
        connectionStatus: 'error',
        error: 'Failed to connect to device'
      }))
      toast.error('Failed to connect to hardware wallet')
    }
  }, [state.devices, onDeviceConnected])

  // Disconnect from device
  const disconnectFromDevice = useCallback(async (deviceId: string) => {
    const device = state.devices.find(d => d.id === deviceId)
    if (!device) return

    try {
      // Simulate disconnection
      await new Promise(resolve => setTimeout(resolve, 500))

      const disconnectedDevice = {
        ...device,
        isConnected: false,
        status: 'ready' as const
      }

      setState(prev => ({
        ...prev,
        selectedDevice: prev.selectedDevice?.id === deviceId ? null : prev.selectedDevice,
        devices: prev.devices.map(d => 
          d.id === deviceId ? disconnectedDevice : d
        ),
        accounts: prev.selectedDevice?.id === deviceId ? [] : prev.accounts,
        connectionStatus: 'idle'
      }))

      onDeviceDisconnected(deviceId)
      toast.success(`Disconnected from ${device.name}`)
    } catch (error) {
      toast.error('Failed to disconnect from device')
    }
  }, [state.devices, state.selectedDevice, onDeviceDisconnected])

  // Load device accounts
  const loadDeviceAccounts = useCallback(async (deviceId: string) => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // Simulate loading accounts
      await new Promise(resolve => setTimeout(resolve, 1000))

      setState(prev => ({
        ...prev,
        accounts: mockAccounts,
        isLoading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load accounts'
      }))
    }
  }, [])

  // Select account
  const selectAccount = useCallback((account: HardwareWalletAccount) => {
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => ({
        ...a,
        isActive: a.publicKey === account.publicKey
      }))
    }))

    onAccountSelected(account)
    toast.success(`Selected ${account.name}`)
  }, [onAccountSelected])

  // Get device icon
  const getDeviceIcon = (device: HardwareWalletDevice) => {
    switch (device.type) {
      case 'ledger':
        return <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">L</div>
      case 'trezor':
        return <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">T</div>
      case 'keepkey':
        return <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">K</div>
      default:
        return <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">?</div>
    }
  }

  // Get connection icon
  const getConnectionIcon = (device: HardwareWalletDevice) => {
    if (!device.isConnected) return <WifiOff className="w-4 h-4 text-gray-400" />
    
    switch (device.connectionType) {
      case 'usb':
        return <Usb className="w-4 h-4 text-green-500" />
      case 'ble':
        return <Bluetooth className="w-4 h-4 text-blue-500" />
      case 'network':
        return <Wifi className="w-4 h-4 text-green-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  // Get status color
  const getStatusColor = (status: HardwareWalletDevice['status']) => {
    switch (status) {
      case 'ready':
        return 'text-green-600'
      case 'busy':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      case 'updating':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hardware Wallets</h2>
          <p className="text-gray-600 mt-1">Connect and manage your hardware wallet devices</p>
        </div>
        <button
          onClick={scanForDevices}
          disabled={state.isScanning}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${state.isScanning ? 'animate-spin' : ''}`} />
          <span>{state.isScanning ? 'Scanning...' : 'Scan Devices'}</span>
        </button>
      </div>

      {/* Device List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Available Devices</h3>
        
        {state.devices.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Usb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No devices found</h4>
            <p className="text-gray-500 mb-4">Connect your hardware wallet via USB or Bluetooth</p>
            <button
              onClick={scanForDevices}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Scan for Devices
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {state.devices.map(device => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-lg border-2 transition-all ${
                  state.selectedDevice?.id === device.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  {/* Device Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {getDeviceIcon(device)}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{device.name}</h4>
                        <p className="text-sm text-gray-500">{device.model} • {device.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getConnectionIcon(device)}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        device.isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {device.isConnected ? 'Connected' : 'Disconnected'}
                      </div>
                    </div>
                  </div>

                  {/* Device Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Activity className={`w-4 h-4 ${getStatusColor(device.status)}`} />
                      <span className={`text-sm font-medium capitalize ${getStatusColor(device.status)}`}>
                        {device.status}
                      </span>
                    </div>
                    {device.batteryLevel && (
                      <div className="flex items-center space-x-2">
                        <Battery className={`w-4 h-4 ${
                          device.batteryLevel < 20 ? 'text-red-500' : 
                          device.batteryLevel < 50 ? 'text-yellow-500' : 'text-green-500'
                        }`} />
                        <span className="text-sm text-gray-600">{device.batteryLevel}%</span>
                      </div>
                    )}
                  </div>

                  {/* Device Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {device.features.pinProtection && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          <Lock className="w-3 h-3" />
                          <span>PIN Protection</span>
                        </div>
                      )}
                      {device.features.passphraseProtection && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                          <Shield className="w-3 h-3" />
                          <span>Passphrase</span>
                        </div>
                      )}
                      {device.features.backupProtection && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                          <Download className="w-3 h-3" />
                          <span>Backup</span>
                        </div>
                      )}
                      {device.features.deviceRecovery && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">
                          <RefreshCw className="w-3 h-3" />
                          <span>Recovery</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Supported Apps */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Supported Apps:</p>
                    <div className="flex flex-wrap gap-1">
                      {device.supportedApps.map(app => (
                        <span
                          key={app}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {device.lastConnected && (
                        <span>Last connected: {device.lastConnected.toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {device.isConnected ? (
                        <button
                          onClick={() => disconnectFromDevice(device.id)}
                          className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors text-sm"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => connectToDevice(device.id)}
                          disabled={state.connectionStatus === 'connecting'}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                        >
                          {state.connectionStatus === 'connecting' && state.selectedDevice?.id === device.id 
                            ? 'Connecting...' 
                            : 'Connect'
                          }
                        </button>
                      )}
                      
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Accounts Section (shown when device is connected) */}
                <AnimatePresence>
                  {state.selectedDevice?.id === device.id && state.accounts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">Accounts</h4>
                          <button className="text-sm text-blue-600 hover:text-blue-700">
                            Add Account
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {state.accounts.map(account => (
                            <div
                              key={account.publicKey}
                              onClick={() => selectAccount(account)}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                account.isActive 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h5 className="font-medium text-gray-900">{account.name}</h5>
                                    {account.isActive && (
                                      <CheckCircle className="w-4 h-4 text-blue-600" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {account.derivationPath}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1 font-mono">
                                    {account.publicKey}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">{account.balance} XLM</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Hardware Wallet Support</h4>
            <p className="text-sm text-blue-800 mb-2">
              CurrentDao supports Ledger, Trezor, and KeepKey hardware wallets for enhanced security.
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Connect your device via USB or Bluetooth</li>
              <li>• Ensure your device firmware is up to date</li>
              <li>• Keep your recovery phrase secure and offline</li>
              <li>• Verify transaction details on your device before signing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HardwareWallets
