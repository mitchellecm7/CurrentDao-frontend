import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Thermometer,
  Activity,
  Wifi,
  Battery,
  Zap,
  Droplet,
  Wind,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Settings,
  Plus,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Shield,
  Database,
  Radio,
  Smartphone,
  Monitor,
  HardDrive,
} from 'lucide-react';

interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'gateway' | 'controller' | 'monitor' | 'meter';
  category: 'environmental' | 'energy' | 'industrial' | 'agricultural' | 'smart-city' | 'building';
  manufacturer: string;
  model: string;
  firmware: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  connectivity: {
    protocol: 'mqtt' | 'http' | 'coap' | 'websocket' | 'lorawan' | 'zigbee' | 'zwave';
    signalStrength: number; // -100 to 0 dBm
    lastSeen: Date;
  };
  location: {
    latitude: number;
    longitude: number;
    address: string;
    floor?: string;
    room?: string;
  };
  power: {
    source: 'battery' | 'mains' | 'solar' | 'poe';
    level: number; // percentage
    voltage: number;
    consumption: number; // watts
  };
  data: {
    lastReading: Date;
    readings: Array<{
      timestamp: Date;
      value: number;
      unit: string;
      quality: 'good' | 'fair' | 'poor';
    }>;
    alerts: Array<{
      id: string;
      type: 'threshold' | 'offline' | 'battery' | 'malfunction';
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      timestamp: Date;
    }>;
  };
  capabilities: string[];
  configuration: Record<string, any>;
}

interface IoTNetwork {
  id: string;
  name: string;
  type: 'lorawan' | 'zigbee' | 'zwave' | 'wifi' | 'cellular' | 'ethernet';
  gatewayId: string;
  deviceCount: number;
  status: 'active' | 'inactive' | 'error';
  coverage: {
    radius: number; // meters
    signalStrength: number;
    dataRate: number; // kbps
  };
  security: {
    encryption: boolean;
    authentication: boolean;
    firewall: boolean;
  };
}

interface DataAggregation {
  timestamp: Date;
  deviceId: string;
  deviceType: string;
  metrics: {
    totalReadings: number;
    averageValue: number;
    min: number;
    max: number;
    standardDeviation: number;
  };
  energy: {
    consumption: number; // kWh
    cost: number; // currency
    carbonFootprint: number; // kg CO2
  };
  performance: {
    uptime: number; // percentage
    responseTime: number; // milliseconds
    errorRate: number; // percentage
  };
}

interface IoTAnalytics {
  timestamp: Date;
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  errorDevices: number;
  totalNetworks: number;
  dataPoints: {
    today: number;
    week: number;
    month: number;
  };
  energy: {
    totalConsumption: number; // kWh
    renewablePercentage: number;
    costSavings: number; // currency
  };
  alerts: {
    active: number;
    resolved: number;
    critical: number;
  };
}

interface IoTDevicesProps {
  className?: string;
  onDeviceSelect?: (device: IoTDevice) => void;
}

const DEVICE_TYPES = {
  sensor: { icon: Activity, color: 'blue', label: 'Sensor' },
  actuator: { icon: Zap, color: 'green', label: 'Actuator' },
  gateway: { icon: Wifi, color: 'purple', label: 'Gateway' },
  controller: { icon: Cpu, color: 'orange', label: 'Controller' },
  monitor: { icon: Monitor, color: 'indigo', label: 'Monitor' },
  meter: { icon: Gauge, color: 'teal', label: 'Meter' },
};

const CATEGORIES = {
  environmental: { icon: Droplet, color: 'cyan', label: 'Environmental' },
  energy: { icon: Zap, color: 'yellow', label: 'Energy' },
  industrial: { icon: Cpu, color: 'red', label: 'Industrial' },
  agricultural: { icon: Wind, color: 'green', label: 'Agricultural' },
  'smart-city': { icon: MapPin, color: 'purple', label: 'Smart City' },
  building: { icon: Monitor, color: 'blue', label: 'Building' },
};

const PROTOCOLS = {
  mqtt: 'MQTT',
  http: 'HTTP',
  coap: 'CoAP',
  websocket: 'WebSocket',
  lorawan: 'LoRaWAN',
  zigbee: 'Zigbee',
  zwave: 'Z-Wave',
};

export const IoTDevices: React.FC<IoTDevicesProps> = ({
  className = '',
  onDeviceSelect,
}) => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [networks, setNetworks] = useState<IoTNetwork[]>([]);
  const [analytics, setAnalytics] = useState<IoTAnalytics | null>(null);
  const [dataAggregation, setDataAggregation] = useState<DataAggregation[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'devices' | 'networks' | 'analytics'>('devices');

  useEffect(() => {
    loadDevices();
    loadNetworks();
    loadAnalytics();
    const interval = setInterval(() => {
      syncIoTData();
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const savedDevices = localStorage.getItem('iotDevices');
      if (savedDevices) {
        setDevices(JSON.parse(savedDevices));
      } else {
        // Generate demo devices
        const demoDevices: IoTDevice[] = Array.from({ length: 20 }, (_, i) => {
          const types = Object.keys(DEVICE_TYPES) as IoTDevice['type'][];
          const categories = Object.keys(CATEGORIES) as IoTDevice['category'][];
          const protocols = Object.keys(PROTOCOLS) as IoTDevice['connectivity']['protocol'][];
          const type = types[Math.floor(Math.random() * types.length)];
          const category = categories[Math.floor(Math.random() * categories.length)];
          
          return {
            id: `iot-device-${i}`,
            name: `${DEVICE_TYPES[type].label} ${i + 1}`,
            type,
            category,
            manufacturer: ['Siemens', 'Schneider Electric', 'Honeywell', 'Philips', 'Nest'][Math.floor(Math.random() * 5)],
            model: `Model-${Math.floor(Math.random() * 1000)}`,
            firmware: `v${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
            status: Math.random() > 0.2 ? 'online' : Math.random() > 0.5 ? 'offline' : 'error',
            connectivity: {
              protocol: protocols[Math.floor(Math.random() * protocols.length)],
              signalStrength: -30 - Math.random() * 50,
              lastSeen: new Date(Date.now() - Math.random() * 3600000),
            },
            location: {
              latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
              longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
              address: `${Math.floor(Math.random() * 999)} Main St`,
              floor: `Floor ${Math.floor(Math.random() * 10) + 1}`,
              room: `Room ${Math.floor(Math.random() * 100) + 1}`,
            },
            power: {
              source: ['battery', 'mains', 'solar', 'poe'][Math.floor(Math.random() * 4)] as IoTDevice['power']['source'],
              level: Math.random() * 100,
              voltage: 3.3 + Math.random() * 10,
              consumption: Math.random() * 50,
            },
            data: {
              lastReading: new Date(Date.now() - Math.random() * 3600000),
              readings: Array.from({ length: 10 }, (_, j) => ({
                timestamp: new Date(Date.now() - j * 60000),
                value: Math.random() * 100,
                unit: ['°C', '%', 'kWh', 'Pa', 'lux'][Math.floor(Math.random() * 5)],
                quality: ['good', 'fair', 'poor'][Math.floor(Math.random() * 3)] as any,
              })),
              alerts: Math.random() > 0.7 ? [{
                id: `alert-${i}`,
                type: ['threshold', 'offline', 'battery', 'malfunction'][Math.floor(Math.random() * 4)] as any,
                severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
                message: 'Device performance issue detected',
                timestamp: new Date(Date.now() - Math.random() * 86400000),
              }] : [],
            },
            capabilities: ['temperature', 'humidity', 'pressure', 'motion'].slice(0, Math.floor(Math.random() * 4) + 1),
            configuration: {
              sampleRate: Math.floor(Math.random() * 60) + 1,
              threshold: Math.random() * 100,
              calibration: Math.random() * 10,
            },
          };
        });
        setDevices(demoDevices);
      }
    } catch (error) {
      console.error('Failed to load IoT devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNetworks = async () => {
    try {
      const demoNetworks: IoTNetwork[] = [
        {
          id: 'network-1',
          name: 'Main Building LoRaWAN',
          type: 'lorawan',
          gatewayId: 'gateway-1',
          deviceCount: 12,
          status: 'active',
          coverage: {
            radius: 5000,
            signalStrength: -45,
            dataRate: 50,
          },
          security: {
            encryption: true,
            authentication: true,
            firewall: true,
          },
        },
        {
          id: 'network-2',
          name: 'Industrial Zigbee Mesh',
          type: 'zigbee',
          gatewayId: 'gateway-2',
          deviceCount: 8,
          status: 'active',
          coverage: {
            radius: 100,
            signalStrength: -35,
            dataRate: 250,
          },
          security: {
            encryption: true,
            authentication: true,
            firewall: false,
          },
        },
      ];
      setNetworks(demoNetworks);
    } catch (error) {
      console.error('Failed to load networks:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData: IoTAnalytics = {
        timestamp: new Date(),
        totalDevices: devices.length,
        onlineDevices: devices.filter(d => d.status === 'online').length,
        offlineDevices: devices.filter(d => d.status === 'offline').length,
        errorDevices: devices.filter(d => d.status === 'error').length,
        totalNetworks: networks.length,
        dataPoints: {
          today: Math.floor(Math.random() * 10000) + 5000,
          week: Math.floor(Math.random() * 50000) + 25000,
          month: Math.floor(Math.random() * 200000) + 100000,
        },
        energy: {
          totalConsumption: devices.reduce((sum, d) => sum + d.power.consumption, 0) * 24 / 1000,
          renewablePercentage: Math.random() * 30 + 20,
          costSavings: Math.random() * 500 + 100,
        },
        alerts: {
          active: devices.reduce((sum, d) => sum + d.data.alerts.length, 0),
          resolved: Math.floor(Math.random() * 50) + 10,
          critical: devices.reduce((sum, d) => 
            sum + d.data.alerts.filter(a => a.severity === 'critical').length, 0
          ),
        },
      };
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const syncIoTData = async () => {
    try {
      // Simulate data sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update device statuses and last seen times
      setDevices(prev => prev.map(device => ({
        ...device,
        connectivity: {
          ...device.connectivity,
          lastSeen: new Date(),
          signalStrength: -30 - Math.random() * 50,
        },
        data: {
          ...device.data,
          lastReading: new Date(),
          readings: [
            {
              timestamp: new Date(),
              value: Math.random() * 100,
              unit: device.data.readings[0]?.unit || 'unit',
              quality: 'good' as const,
            },
            ...device.data.readings.slice(0, 9),
          ],
        },
      })));

      loadAnalytics();
    } catch (error) {
      console.error('Failed to sync IoT data:', error);
    }
  };

  const addDevice = async (deviceData: Partial<IoTDevice>) => {
    const newDevice: IoTDevice = {
      id: `iot-device-${Date.now()}`,
      name: deviceData.name || 'New IoT Device',
      type: deviceData.type || 'sensor',
      category: deviceData.category || 'environmental',
      manufacturer: deviceData.manufacturer || 'Unknown',
      model: deviceData.model || 'Unknown',
      firmware: deviceData.firmware || '1.0.0',
      status: 'offline',
      connectivity: {
        protocol: 'mqtt',
        signalStrength: -50,
        lastSeen: new Date(),
      },
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: 'Unknown Address',
      },
      power: {
        source: 'mains',
        level: 100,
        voltage: 12,
        consumption: 10,
      },
      data: {
        lastReading: new Date(),
        readings: [],
        alerts: [],
      },
      capabilities: [],
      configuration: {},
    };

    setDevices(prev => [...prev, newDevice]);
    setShowAddModal(false);
  };

  const removeDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    if (selectedDevice === deviceId) {
      setSelectedDevice(null);
    }
  };

  const controlDevice = async (deviceId: string, action: string, parameters: any = {}) => {
    try {
      setDevices(prev => prev.map(device => {
        if (device.id === deviceId) {
          const updatedDevice = { ...device };
          
          switch (action) {
            case 'reboot':
              updatedDevice.status = 'offline';
              setTimeout(() => {
                setDevices(prev => prev.map(d => 
                  d.id === deviceId ? { ...d, status: 'online' } : d
                ));
              }, 5000);
              break;
            case 'configure':
              updatedDevice.configuration = { ...updatedDevice.configuration, ...parameters };
              break;
            case 'calibrate':
              updatedDevice.configuration.calibration = parameters.value || 0;
              break;
          }
          
          return updatedDevice;
        }
        return device;
      }));
    } catch (error) {
      console.error('Failed to control device:', error);
    }
  };

  const filteredDevices = devices.filter(device => {
    if (selectedCategory !== 'all' && device.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && device.status !== selectedStatus) return false;
    return true;
  });

  const getDeviceIcon = (type: IoTDevice['type']) => {
    return DEVICE_TYPES[type]?.icon || Cpu;
  };

  const getStatusColor = (status: IoTDevice['status']) => {
    switch (status) {
      case 'online': return 'green';
      case 'offline': return 'gray';
      case 'error': return 'red';
      case 'maintenance': return 'yellow';
      default: return 'gray';
    }
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength > -50) return 'green';
    if (strength > -70) return 'yellow';
    return 'red';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">IoT Devices & Data Aggregation</h2>
            <p className="text-sm text-gray-500 mt-1">
              Monitor and manage IoT devices across multiple networks
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Add Device */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Device
            </button>

            {/* Sync */}
            <button
              onClick={syncIoTData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Sync Data
            </button>
          </div>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Devices</p>
                  <p className="text-2xl font-bold text-blue-900">{analytics.totalDevices}</p>
                  <p className="text-xs text-blue-500">{analytics.onlineDevices} online</p>
                </div>
                <Cpu className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Data Points Today</p>
                  <p className="text-2xl font-bold text-green-900">{analytics.dataPoints.today.toLocaleString()}</p>
                  <p className="text-xs text-green-500">This week: {analytics.dataPoints.week.toLocaleString()}</p>
                </div>
                <Database className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Energy Usage</p>
                  <p className="text-2xl font-bold text-yellow-900">{analytics.energy.totalConsumption.toFixed(1)} kWh</p>
                  <p className="text-xs text-yellow-500">${analytics.energy.costSavings.toFixed(0)} saved</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-900">{analytics.alerts.active}</p>
                  <p className="text-xs text-red-500">{analytics.alerts.critical} critical</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          {[
            { id: 'devices', label: 'Devices', icon: Cpu },
            { id: 'networks', label: 'Networks', icon: Wifi },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading IoT data...</span>
          </div>
        ) : (
          <>
            {/* Devices Tab */}
            {activeTab === 'devices' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex items-center gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {Object.entries(CATEGORIES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="error">Error</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Device Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredDevices.map(device => {
                    const DeviceIcon = getDeviceIcon(device.type);
                    const CategoryIcon = CATEGORIES[device.category]?.icon || Cpu;
                    const statusColor = getStatusColor(device.status);
                    const signalColor = getSignalStrengthColor(device.connectivity.signalStrength);
                    
                    return (
                      <motion.div
                        key={device.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 bg-${DEVICE_TYPES[device.type].color}-100 rounded-lg`}>
                              <DeviceIcon className={`w-5 h-5 text-${DEVICE_TYPES[device.type].color}-600`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{device.name}</h4>
                              <p className="text-sm text-gray-500">{device.manufacturer}</p>
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full bg-${statusColor}-500`} />
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Category:</span>
                            <span className="font-medium">{CATEGORIES[device.category].label}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Protocol:</span>
                            <span className="font-medium">{PROTOCOLS[device.connectivity.protocol]}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Signal:</span>
                            <span className={`font-medium text-${signalColor}-600`}>
                              {device.connectivity.signalStrength.toFixed(0)} dBm
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Power:</span>
                            <span className="font-medium">{device.power.consumption.toFixed(1)}W</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Battery:</span>
                            <span className={`font-medium ${
                              device.power.level > 50 ? 'text-green-600' :
                              device.power.level > 20 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {device.power.level.toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        {/* Latest Reading */}
                        {device.data.readings.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-2 mb-3">
                            <div className="text-xs text-gray-500 mb-1">Latest Reading</div>
                            <div className="text-sm font-semibold">
                              {device.data.readings[0].value.toFixed(2)} {device.data.readings[0].unit}
                            </div>
                          </div>
                        )}

                        {/* Alerts */}
                        {device.data.alerts.length > 0 && (
                          <div className="bg-red-50 rounded-lg p-2 mb-3">
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              <span className="text-xs text-red-600 font-medium">
                                {device.data.alerts.length} alert{device.data.alerts.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => controlDevice(device.id, 'reboot')}
                            className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            Reboot
                          </button>
                          <button
                            onClick={() => onDeviceSelect?.(device)}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeDevice(device.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {filteredDevices.length === 0 && (
                  <div className="text-center py-12">
                    <Cpu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No IoT Devices Found</h3>
                    <p className="text-gray-500">Add your first IoT device to start monitoring</p>
                  </div>
                )}
              </div>
            )}

            {/* Networks Tab */}
            {activeTab === 'networks' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">IoT Networks</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Network
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {networks.map(network => (
                    <motion.div
                      key={network.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{network.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{network.type.toUpperCase()}</p>
                        </div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                          network.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {network.status}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Gateway:</span>
                          <span className="font-medium">{network.gatewayId}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Devices:</span>
                          <span className="font-medium">{network.deviceCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Coverage:</span>
                          <span className="font-medium">{network.coverage.radius}m radius</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Signal:</span>
                          <span className="font-medium">{network.coverage.signalStrength} dBm</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Data Rate:</span>
                          <span className="font-medium">{network.coverage.dataRate} kbps</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Security</h5>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Shield className={`w-3 h-3 ${network.security.encryption ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className="text-gray-600">Encryption</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className={`w-3 h-3 ${network.security.authentication ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className="text-gray-600">Auth</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className={`w-3 h-3 ${network.security.firewall ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className="text-gray-600">Firewall</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">IoT Analytics & Insights</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Device Status Distribution */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Device Status Distribution</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Online</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(analytics.onlineDevices / analytics.totalDevices) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{analytics.onlineDevices}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Offline</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gray-500 h-2 rounded-full"
                              style={{ width: `${(analytics.offlineDevices / analytics.totalDevices) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{analytics.offlineDevices}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Error</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${(analytics.errorDevices / analytics.totalDevices) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{analytics.errorDevices}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Energy Consumption */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Energy Consumption</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Total Daily</span>
                          <span className="text-lg font-bold text-gray-900">
                            {analytics.energy.totalConsumption.toFixed(2)} kWh
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          ${analytics.energy.costSavings.toFixed(2)} in savings
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Renewable Energy</span>
                          <span className="text-sm font-medium text-green-600">
                            {analytics.energy.renewablePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${analytics.energy.renewablePercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Points Trend */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Data Points Collection</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Today</span>
                        <span className="text-lg font-bold text-gray-900">
                          {analytics.dataPoints.today.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">This Week</span>
                        <span className="text-lg font-bold text-gray-900">
                          {analytics.dataPoints.week.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">This Month</span>
                        <span className="text-lg font-bold text-gray-900">
                          {analytics.dataPoints.month.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Alert Summary */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Alert Summary</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Active Alerts</span>
                        <span className="text-lg font-bold text-red-600">
                          {analytics.alerts.active}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Critical</span>
                        <span className="text-lg font-bold text-red-600">
                          {analytics.alerts.critical}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Resolved Today</span>
                        <span className="text-lg font-bold text-green-600">
                          {analytics.alerts.resolved}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add IoT Device</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Temperature Sensor 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(DEVICE_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(CATEGORIES).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer
                </label>
                <input
                  type="text"
                  placeholder="e.g., Siemens"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  placeholder="e.g., SITRANS P200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Communication Protocol
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(PROTOCOLS).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => addDevice({})}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IoTDevices;
