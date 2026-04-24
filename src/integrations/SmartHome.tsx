import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Lightbulb,
  Thermometer,
  Lock,
  Camera,
  Speaker,
  Tv,
  Power,
  Wifi,
  Settings,
  Plus,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Activity,
  Zap,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Volume2,
  Wind,
  Droplet,
  Sun,
  Moon,
  Bell,
  Mic,
  Smartphone,
} from 'lucide-react';

interface SmartHomePlatform {
  id: string;
  name: string;
  type: 'google-home' | 'alexa' | 'homekit' | 'smartthings' | 'hubitat' | 'custom';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync?: Date;
  deviceCount: number;
  features: {
    lighting: boolean;
    climate: boolean;
    security: boolean;
    entertainment: boolean;
    energy: boolean;
    automation: boolean;
  };
  authCredentials?: {
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
  };
}

interface SmartDevice {
  id: string;
  platformId: string;
  name: string;
  type: 'light' | 'thermostat' | 'lock' | 'camera' | 'speaker' | 'tv' | 'switch' | 'sensor' | 'appliance';
  category: 'lighting' | 'climate' | 'security' | 'entertainment' | 'energy' | 'automation';
  room: string;
  status: 'online' | 'offline' | 'error';
  isOn: boolean;
  capabilities: string[];
  currentState: Record<string, any>;
  energyConsumption: {
    current: number; // watts
    daily: number; // watt-hours
    monthly: number; // kilowatt-hours
  };
  lastUpdated: Date;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  platformId: string;
  triggers: Array<{
    type: 'time' | 'device' | 'weather' | 'energy' | 'presence';
    conditions: Record<string, any>;
  }>;
  actions: Array<{
    deviceId: string;
    action: string;
    parameters: Record<string, any>;
  }>;
  isActive: boolean;
  lastTriggered?: Date;
  energySavings: number; // estimated monthly savings in kWh
}

interface EnergyOptimization {
  timestamp: Date;
  recommendations: Array<{
    deviceId: string;
    deviceName: string;
    action: string;
    potentialSavings: number; // kWh per month
    priority: 'low' | 'medium' | 'high';
    reason: string;
  }>;
  totalPotentialSavings: number;
  automationSuggestions: Array<{
    name: string;
    description: string;
    devices: string[];
    estimatedSavings: number;
  }>;
}

interface SmartHomeProps {
  className?: string;
  onDeviceControl?: (deviceId: string, action: string, parameters: any) => void;
}

const PLATFORMS = [
  { id: 'google-home', name: 'Google Home', type: 'google-home' as const, icon: Home },
  { id: 'alexa', name: 'Amazon Alexa', type: 'alexa' as const, icon: Mic },
  { id: 'homekit', name: 'Apple HomeKit', type: 'homekit' as const, icon: Home },
  { id: 'smartthings', name: 'Samsung SmartThings', type: 'smartthings' as const, icon: Smartphone },
  { id: 'hubitat', name: 'Hubitat', type: 'hubitat' as const, icon: Shield },
];

const DEVICE_TYPES = {
  light: { icon: Lightbulb, color: 'yellow', category: 'lighting' },
  thermostat: { icon: Thermometer, color: 'blue', category: 'climate' },
  lock: { icon: Lock, color: 'green', category: 'security' },
  camera: { icon: Camera, color: 'red', category: 'security' },
  speaker: { icon: Speaker, color: 'purple', category: 'entertainment' },
  tv: { icon: Tv, color: 'indigo', category: 'entertainment' },
  switch: { icon: Power, color: 'gray', category: 'energy' },
  sensor: { icon: Activity, color: 'teal', category: 'automation' },
  appliance: { icon: Home, color: 'orange', category: 'energy' },
};

const ROOMS = [
  'Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Office', 'Garage', 'Outdoor', 'Hallway'
];

export const SmartHome: React.FC<SmartHomeProps> = ({
  className = '',
  onDeviceControl,
}) => {
  const [platforms, setPlatforms] = useState<SmartHomePlatform[]>([]);
  const [devices, setDevices] = useState<SmartDevice[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [energyOptimization, setEnergyOptimization] = useState<EnergyOptimization | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'devices' | 'automation' | 'energy'>('devices');

  useEffect(() => {
    loadPlatforms();
    const interval = setInterval(() => {
      syncAllPlatforms();
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (platforms.length > 0) {
      loadDevices();
      loadAutomationRules();
      generateEnergyOptimization();
    }
  }, [platforms]);

  const loadPlatforms = async () => {
    setIsLoading(true);
    try {
      const savedPlatforms = localStorage.getItem('smartHomePlatforms');
      if (savedPlatforms) {
        setPlatforms(JSON.parse(savedPlatforms));
      } else {
        // Initialize with demo platform
        const demoPlatform: SmartHomePlatform = {
          id: 'demo-platform',
          name: 'Google Home Demo',
          type: 'google-home',
          status: 'connected',
          deviceCount: 0,
          features: {
            lighting: true,
            climate: true,
            security: true,
            entertainment: true,
            energy: true,
            automation: true,
          },
        };
        setPlatforms([demoPlatform]);
        setSelectedPlatform(demoPlatform.id);
      }
    } catch (error) {
      console.error('Failed to load smart home platforms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDevices = async () => {
    try {
      // Generate demo devices
      const demoDevices: SmartDevice[] = [];
      let deviceCount = 0;

      platforms.forEach(platform => {
        if (platform.status === 'connected') {
          // Add demo devices for each platform
          const deviceTypes = Object.keys(DEVICE_TYPES);
          const numDevices = Math.floor(Math.random() * 8) + 5;

          for (let i = 0; i < numDevices; i++) {
            const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)] as SmartDevice['type'];
            const deviceInfo = DEVICE_TYPES[deviceType];
            
            demoDevices.push({
              id: `${platform.id}-device-${i}`,
              platformId: platform.id,
              name: `${deviceInfo.category.charAt(0).toUpperCase() + deviceInfo.category.slice(1, -1)} ${i + 1}`,
              type: deviceType,
              category: deviceInfo.category as SmartDevice['category'],
              room: ROOMS[Math.floor(Math.random() * ROOMS.length)],
              status: Math.random() > 0.1 ? 'online' : 'offline',
              isOn: Math.random() > 0.5,
              capabilities: ['power', 'status'],
              currentState: {
                brightness: deviceType === 'light' ? Math.floor(Math.random() * 100) : undefined,
                temperature: deviceType === 'thermostat' ? 20 + Math.random() * 10 : undefined,
                volume: ['speaker', 'tv'].includes(deviceType) ? Math.floor(Math.random() * 100) : undefined,
              },
              energyConsumption: {
                current: Math.random() * 100,
                daily: Math.random() * 2000,
                monthly: Math.random() * 50000,
              },
              lastUpdated: new Date(),
            });
            deviceCount++;
          }
        }
      });

      setDevices(demoDevices);
      
      // Update platform device counts
      setPlatforms(prev => prev.map(platform => ({
        ...platform,
        deviceCount: demoDevices.filter(d => d.platformId === platform.id).length,
      })));
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const loadAutomationRules = async () => {
    try {
      const demoRules: AutomationRule[] = [
        {
          id: 'rule-1',
          name: 'Evening Lights Off',
          description: 'Turn off all lights at 11 PM',
          platformId: platforms[0]?.id || '',
          triggers: [{
            type: 'time',
            conditions: { hour: 23, minute: 0 },
          }],
          actions: devices.filter(d => d.type === 'light').slice(0, 3).map(device => ({
            deviceId: device.id,
            action: 'turnOff',
            parameters: {},
          })),
          isActive: true,
          energySavings: 15,
        },
        {
          id: 'rule-2',
          name: 'Energy Saver Mode',
          description: 'Reduce thermostat when away',
          platformId: platforms[0]?.id || '',
          triggers: [{
            type: 'presence',
            conditions: { presence: false },
          }],
          actions: devices.filter(d => d.type === 'thermostat').slice(0, 1).map(device => ({
            deviceId: device.id,
            action: 'setTemperature',
            parameters: { temperature: 18 },
          })),
          isActive: true,
          energySavings: 25,
        },
      ];
      setAutomationRules(demoRules);
    } catch (error) {
      console.error('Failed to load automation rules:', error);
    }
  };

  const generateEnergyOptimization = async () => {
    try {
      const optimization: EnergyOptimization = {
        timestamp: new Date(),
        recommendations: devices.filter(d => d.energyConsumption.current > 50).map(device => ({
          deviceId: device.id,
          deviceName: device.name,
          action: 'Schedule off during peak hours',
          potentialSavings: Math.random() * 20 + 5,
          priority: device.energyConsumption.current > 80 ? 'high' : 
                   device.energyConsumption.current > 60 ? 'medium' : 'low',
          reason: 'High energy consumption detected',
        })),
        totalPotentialSavings: 0,
        automationSuggestions: [
          {
            name: 'Peak Hour Optimization',
            description: 'Automatically reduce consumption during peak pricing hours',
            devices: devices.slice(0, 3).map(d => d.id),
            estimatedSavings: 45,
          },
          {
            name: 'Vacation Mode',
            description: 'Minimize energy usage when away from home',
            devices: devices.filter(d => ['thermostat', 'light'].includes(d.type)).map(d => d.id),
            estimatedSavings: 60,
          },
        ],
      };
      
      optimization.totalPotentialSavings = optimization.recommendations.reduce((sum, r) => sum + r.potentialSavings, 0);
      setEnergyOptimization(optimization);
    } catch (error) {
      console.error('Failed to generate energy optimization:', error);
    }
  };

  const syncAllPlatforms = async () => {
    for (const platform of platforms) {
      if (platform.status === 'connected') {
        try {
          // Simulate sync
          await new Promise(resolve => setTimeout(resolve, 500));
          setPlatforms(prev => prev.map(p => 
            p.id === platform.id 
              ? { ...p, lastSync: new Date(), status: 'connected' }
              : p
          ));
        } catch (error) {
          setPlatforms(prev => prev.map(p => 
            p.id === platform.id 
              ? { ...p, status: 'error' }
              : p
          ));
        }
      }
    }
  };

  const controlDevice = async (deviceId: string, action: string, parameters: any = {}) => {
    try {
      // Update device state
      setDevices(prev => prev.map(device => {
        if (device.id === deviceId) {
          const newState = { ...device };
          
          switch (action) {
            case 'toggle':
              newState.isOn = !device.isOn;
              break;
            case 'turnOn':
              newState.isOn = true;
              break;
            case 'turnOff':
              newState.isOn = false;
              break;
            case 'setBrightness':
              newState.currentState.brightness = parameters.brightness;
              break;
            case 'setTemperature':
              newState.currentState.temperature = parameters.temperature;
              break;
            case 'setVolume':
              newState.currentState.volume = parameters.volume;
              break;
          }
          
          newState.lastUpdated = new Date();
          return newState;
        }
        return device;
      }));

      onDeviceControl?.(deviceId, action, parameters);
    } catch (error) {
      console.error('Failed to control device:', error);
    }
  };

  const addPlatform = async (platformData: Partial<SmartHomePlatform>) => {
    const newPlatform: SmartHomePlatform = {
      id: `platform-${Date.now()}`,
      name: platformData.name || 'New Platform',
      type: platformData.type || 'google-home',
      status: 'disconnected',
      deviceCount: 0,
      features: {
        lighting: true,
        climate: true,
        security: true,
        entertainment: true,
        energy: true,
        automation: true,
      },
    };

    setPlatforms(prev => [...prev, newPlatform]);
    setShowAddModal(false);
  };

  const removePlatform = (platformId: string) => {
    setPlatforms(prev => prev.filter(p => p.id !== platformId));
    setDevices(prev => prev.filter(d => d.platformId !== platformId));
    setAutomationRules(prev => prev.filter(r => r.platformId !== platformId));
    if (selectedPlatform === platformId) {
      setSelectedPlatform(null);
    }
  };

  const filteredDevices = devices.filter(device => {
    if (selectedPlatform && device.platformId !== selectedPlatform) return false;
    if (selectedRoom !== 'all' && device.room !== selectedRoom) return false;
    if (selectedCategory !== 'all' && device.category !== selectedCategory) return false;
    return true;
  });

  const getDeviceIcon = (type: SmartDevice['type']) => {
    return DEVICE_TYPES[type]?.icon || Power;
  };

  const getStatusColor = (status: SmartDevice['status']) => {
    switch (status) {
      case 'online': return 'green';
      case 'offline': return 'gray';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const totalEnergyConsumption = devices.reduce((sum, device) => sum + device.energyConsumption.current, 0);
  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const activeDevices = devices.filter(d => d.isOn).length;

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Smart Home Integration</h2>
            <p className="text-sm text-gray-500 mt-1">
              Control devices and automate energy usage across platforms
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Platform Selector */}
            <select
              value={selectedPlatform || ''}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Platforms</option>
              {platforms.map(platform => (
                <option key={platform.id} value={platform.id}>
                  {platform.name} ({platform.deviceCount} devices)
                </option>
              ))}
            </select>

            {/* Add Platform */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Platform
            </button>

            {/* Sync */}
            <button
              onClick={syncAllPlatforms}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Sync
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Devices</p>
                <p className="text-2xl font-bold text-blue-900">{devices.length}</p>
              </div>
              <Home className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Online</p>
                <p className="text-2xl font-bold text-green-900">{onlineDevices}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Active</p>
                <p className="text-2xl font-bold text-yellow-900">{activeDevices}</p>
              </div>
              <Power className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Power Usage</p>
                <p className="text-2xl font-bold text-purple-900">{totalEnergyConsumption.toFixed(0)}W</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          {[
            { id: 'devices', label: 'Devices', icon: Home },
            { id: 'automation', label: 'Automation', icon: Settings },
            { id: 'energy', label: 'Energy Optimization', icon: Zap },
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
            <span className="ml-3 text-gray-600">Loading smart home data...</span>
          </div>
        ) : (
          <>
            {/* Devices Tab */}
            {activeTab === 'devices' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex items-center gap-4">
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Rooms</option>
                    {ROOMS.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="lighting">Lighting</option>
                    <option value="climate">Climate</option>
                    <option value="security">Security</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="energy">Energy</option>
                    <option value="automation">Automation</option>
                  </select>
                </div>

                {/* Device Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredDevices.map(device => {
                    const DeviceIcon = getDeviceIcon(device.type);
                    const statusColor = getStatusColor(device.status);
                    
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
                              <p className="text-sm text-gray-500">{device.room}</p>
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full bg-${statusColor}-500`} />
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Status:</span>
                            <span className={`font-medium capitalize text-${statusColor}-600`}>
                              {device.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Power:</span>
                            <span className={`font-medium ${device.isOn ? 'text-green-600' : 'text-gray-600'}`}>
                              {device.isOn ? 'On' : 'Off'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Usage:</span>
                            <span className="font-medium">
                              {device.energyConsumption.current.toFixed(1)}W
                            </span>
                          </div>
                        </div>

                        {/* Device Controls */}
                        <div className="space-y-2">
                          <button
                            onClick={() => controlDevice(device.id, 'toggle')}
                            className={`w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                              device.isOn
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {device.isOn ? 'Turn Off' : 'Turn On'}
                          </button>
                          
                          {device.type === 'light' && device.isOn && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Brightness:</span>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={device.currentState.brightness || 50}
                                onChange={(e) => controlDevice(device.id, 'setBrightness', { brightness: Number(e.target.value) })}
                                className="flex-1 h-1"
                              />
                              <span className="text-xs text-gray-600 w-8">
                                {device.currentState.brightness || 50}%
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {filteredDevices.length === 0 && (
                  <div className="text-center py-12">
                    <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Devices Found</h3>
                    <p className="text-gray-500">
                      Connect a smart home platform to start controlling your devices
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Automation Tab */}
            {activeTab === 'automation' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Automation Rules</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Create Rule
                  </button>
                </div>

                <div className="space-y-4">
                  {automationRules.map(rule => (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>Actions: {rule.actions.length}</span>
                            <span>Monthly Savings: {rule.energySavings} kWh</span>
                            {rule.lastTriggered && (
                              <span>Last: {new Date(rule.lastTriggered).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                              rule.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {automationRules.length === 0 && (
                  <div className="text-center py-12">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Automation Rules</h3>
                    <p className="text-gray-500">Create automation rules to optimize energy usage</p>
                  </div>
                )}
              </div>
            )}

            {/* Energy Optimization Tab */}
            {activeTab === 'energy' && energyOptimization && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">Energy Optimization Insights</h3>
                  <p className="text-green-100 mb-4">
                    AI-powered recommendations to reduce energy consumption and costs
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-green-100 text-sm">Potential Monthly Savings</p>
                      <p className="text-3xl font-bold">
                        {energyOptimization.totalPotentialSavings.toFixed(1)} kWh
                      </p>
                    </div>
                    <div>
                      <p className="text-green-100 text-sm">Active Recommendations</p>
                      <p className="text-3xl font-bold">
                        {energyOptimization.recommendations.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-100 text-sm">Automation Suggestions</p>
                      <p className="text-3xl font-bold">
                        {energyOptimization.automationSuggestions.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Device Recommendations</h4>
                  <div className="space-y-3">
                    {energyOptimization.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={`border-l-4 border-${
                          rec.priority === 'high' ? 'red' : 
                          rec.priority === 'medium' ? 'yellow' : 'green'
                        }-500 bg-gray-50 p-4 rounded-r-lg`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-900">{rec.deviceName}</h5>
                            <p className="text-sm text-gray-600 mt-1">{rec.action}</p>
                            <p className="text-xs text-gray-500 mt-2">{rec.reason}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${
                              rec.priority === 'high' ? 'text-red-600' : 
                              rec.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {rec.priority.toUpperCase()}
                            </span>
                            <div className="text-sm font-semibold text-gray-900 mt-1">
                              {rec.potentialSavings.toFixed(1)} kWh/month
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Automation Suggestions */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Automation Suggestions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {energyOptimization.automationSuggestions.map((suggestion, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 mb-2">{suggestion.name}</h5>
                        <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">
                            {suggestion.estimatedSavings} kWh/month savings
                          </span>
                          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                            Create
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Platform Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Smart Home Platform</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {PLATFORMS.map(platform => (
                    <option key={platform.id} value={platform.type}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., My Google Home"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Authentication
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Client ID (if required)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Client Secret (if required)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                onClick={() => addPlatform({})}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Platform
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartHome;
