import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  Settings,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  BarChart3,
  Globe,
  Shield,
  Wifi,
  Battery,
  Sun,
  Wind,
  Droplet,
  Flame,
} from 'lucide-react';

interface EnergyProvider {
  id: string;
  name: string;
  type: 'utility' | 'renewable' | 'grid' | 'market';
  region: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  apiKey?: string;
  lastSync?: Date;
  realTimeData: boolean;
  supportedMarkets: string[];
  pricingModel: 'fixed' | 'dynamic' | 'time-of-use' | 'demand-response';
  dataEndpoints: {
    pricing: string;
    consumption: string;
    generation: string;
    forecasting: string;
  };
  rateLimits: {
    requestsPerMinute: number;
    dailyLimit: number;
  };
}

interface ProviderData {
  providerId: string;
  timestamp: Date;
  pricing: {
    currentPrice: number;
    forecast: Array<{ time: Date; price: number }>;
    demandCharge: number;
  };
  consumption: {
    current: number;
    daily: number;
    monthly: number;
    forecast: Array<{ time: Date; consumption: number }>;
  };
  generation?: {
    solar: number;
    wind: number;
    hydro: number;
    other: number;
  };
  gridStatus: {
    stability: 'stable' | 'unstable' | 'critical';
    load: number;
    capacity: number;
    outages: Array<{ area: string; type: string; estimatedResolution: Date }>;
  };
}

interface EnergyProvidersProps {
  className?: string;
  onProviderSelect?: (provider: EnergyProvider) => void;
}

const PROVIDER_TYPES = {
  utility: { icon: Zap, color: 'blue', label: 'Utility Company' },
  renewable: { icon: Sun, color: 'green', label: 'Renewable Provider' },
  grid: { icon: Wifi, color: 'purple', label: 'Grid Operator' },
  market: { icon: BarChart3, color: 'orange', label: 'Energy Market' },
};

const STATUS_COLORS = {
  connected: 'green',
  disconnected: 'gray',
  error: 'red',
  syncing: 'yellow',
};

const MAJOR_PROVIDERS: Partial<EnergyProvider>[] = [
  {
    name: 'Pacific Gas & Electric',
    type: 'utility',
    region: 'California, USA',
    supportedMarkets: ['CAISO', 'PJM'],
    pricingModel: 'time-of-use',
  },
  {
    name: 'National Grid',
    type: 'utility',
    region: 'Northeast USA',
    supportedMarkets: ['ISO-NE', 'NYISO'],
    pricingModel: 'dynamic',
  },
  {
    name: 'E.ON',
    type: 'utility',
    region: 'Europe',
    supportedMarkets: ['EPEX', 'Nord Pool'],
    pricingModel: 'time-of-use',
  },
  {
    name: 'Tesla Energy',
    type: 'renewable',
    region: 'Global',
    supportedMarkets: ['CAISO', 'ERCOT', 'PJM'],
    pricingModel: 'dynamic',
  },
  {
    name: 'Vattenfall',
    type: 'renewable',
    region: 'Europe',
    supportedMarkets: ['EPEX', 'Nord Pool'],
    pricingModel: 'fixed',
  },
  {
    name: 'NextEra Energy',
    type: 'renewable',
    region: 'North America',
    supportedMarkets: ['CAISO', 'ERCOT', 'PJM'],
    pricingModel: 'time-of-use',
  },
];

export const EnergyProviders: React.FC<EnergyProvidersProps> = ({
  className = '',
  onProviderSelect,
}) => {
  const [providers, setProviders] = useState<EnergyProvider[]>([]);
  const [providerData, setProviderData] = useState<Map<string, ProviderData>>(new Map());
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<EnergyProvider | null>(null);
  const [filter, setFilter] = useState<'all' | 'connected' | 'disconnected'>('all');

  useEffect(() => {
    loadProviders();
    const interval = setInterval(() => {
      syncAllProviders();
    }, 60000); // Sync every minute

    return () => clearInterval(interval);
  }, []);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      // Simulate loading providers from storage/API
      const savedProviders = localStorage.getItem('energyProviders');
      if (savedProviders) {
        setProviders(JSON.parse(savedProviders));
      } else {
        // Initialize with demo providers
        const demoProviders = MAJOR_PROVIDERS.slice(0, 3).map((p, i) => ({
          ...p,
          id: `provider-${i}`,
          status: 'connected' as const,
          lastSync: new Date(),
          realTimeData: true,
          dataEndpoints: {
            pricing: `/api/providers/${i}/pricing`,
            consumption: `/api/providers/${i}/consumption`,
            generation: `/api/providers/${i}/generation`,
            forecasting: `/api/providers/${i}/forecasting`,
          },
          rateLimits: {
            requestsPerMinute: 60,
            dailyLimit: 10000,
          },
        }));
        setProviders(demoProviders as EnergyProvider[]);
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncAllProviders = async () => {
    const updatedData = new Map<string, ProviderData>();
    
    for (const provider of providers) {
      if (provider.status === 'connected') {
        try {
          const data = await fetchProviderData(provider.id);
          updatedData.set(provider.id, data);
        } catch (error) {
          console.error(`Failed to sync ${provider.name}:`, error);
        }
      }
    }
    
    setProviderData(updatedData);
  };

  const fetchProviderData = async (providerId: string): Promise<ProviderData> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      providerId,
      timestamp: new Date(),
      pricing: {
        currentPrice: Math.random() * 0.5 + 0.1,
        forecast: Array.from({ length: 24 }, (_, i) => ({
          time: new Date(Date.now() + i * 3600000),
          price: Math.random() * 0.5 + 0.1,
        })),
        demandCharge: Math.random() * 20 + 5,
      },
      consumption: {
        current: Math.random() * 1000 + 500,
        daily: Math.random() * 50000 + 20000,
        monthly: Math.random() * 1000000 + 500000,
        forecast: Array.from({ length: 24 }, (_, i) => ({
          time: new Date(Date.now() + i * 3600000),
          consumption: Math.random() * 1000 + 500,
        })),
      },
      generation: {
        solar: Math.random() * 500,
        wind: Math.random() * 300,
        hydro: Math.random() * 200,
        other: Math.random() * 100,
      },
      gridStatus: {
        stability: Math.random() > 0.1 ? 'stable' : Math.random() > 0.5 ? 'unstable' : 'critical',
        load: Math.random() * 80 + 10,
        capacity: 100,
        outages: Math.random() > 0.8 ? [{
          area: 'Downtown',
          type: 'Maintenance',
          estimatedResolution: new Date(Date.now() + 3600000 * 4),
        }] : [],
      },
    };
  };

  const addProvider = async (providerData: Partial<EnergyProvider>) => {
    const newProvider: EnergyProvider = {
      id: `provider-${Date.now()}`,
      name: providerData.name || 'New Provider',
      type: providerData.type || 'utility',
      region: providerData.region || 'Unknown',
      status: 'disconnected',
      realTimeData: providerData.realTimeData || false,
      supportedMarkets: providerData.supportedMarkets || [],
      pricingModel: providerData.pricingModel || 'fixed',
      dataEndpoints: {
        pricing: '',
        consumption: '',
        generation: '',
        forecasting: '',
      },
      rateLimits: {
        requestsPerMinute: 60,
        dailyLimit: 10000,
      },
    };

    setProviders(prev => [...prev, newProvider]);
    setShowAddModal(false);
  };

  const removeProvider = (providerId: string) => {
    setProviders(prev => prev.filter(p => p.id !== providerId));
    setProviderData(prev => {
      const newData = new Map(prev);
      newData.delete(providerId);
      return newData;
    });
  };

  const toggleProviderStatus = async (providerId: string) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId 
        ? { ...p, status: p.status === 'connected' ? 'disconnected' : 'connected' }
        : p
    ));
  };

  const filteredProviders = providers.filter(provider => {
    if (filter === 'all') return true;
    return provider.status === filter;
  });

  const getStatusIcon = (status: EnergyProvider['status']) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'disconnected': return AlertCircle;
      case 'error': return AlertCircle;
      case 'syncing': return RefreshCw;
      default: return Clock;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Energy Providers</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage energy provider integrations and real-time data connections
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Providers</option>
              <option value="connected">Connected</option>
              <option value="disconnected">Disconnected</option>
            </select>

            {/* Add Provider */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Provider
            </button>

            {/* Sync All */}
            <button
              onClick={syncAllProviders}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Sync All
            </button>
          </div>
        </div>
      </div>

      {/* Provider Grid */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading providers...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => {
              const TypeIcon = PROVIDER_TYPES[provider.type].icon;
              const StatusIcon = getStatusIcon(provider.status);
              const data = providerData.get(provider.id);
              
              return (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Provider Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-${PROVIDER_TYPES[provider.type].color}-100 rounded-lg`}>
                        <TypeIcon className={`w-5 h-5 text-${PROVIDER_TYPES[provider.type].color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                        <p className="text-sm text-gray-500">{provider.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <StatusIcon className={`w-4 h-4 text-${STATUS_COLORS[provider.status]}-600`} />
                      <span className={`text-xs font-medium text-${STATUS_COLORS[provider.status]}-600`}>
                        {provider.status}
                      </span>
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">{PROVIDER_TYPES[provider.type].label}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Pricing:</span>
                      <span className="font-medium capitalize">{provider.pricingModel}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Real-time:</span>
                      <span className={`font-medium ${provider.realTimeData ? 'text-green-600' : 'text-gray-600'}`}>
                        {provider.realTimeData ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    {provider.lastSync && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Last Sync:</span>
                        <span className="font-medium">
                          {new Date(provider.lastSync).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Real-time Data */}
                  {data && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Current Price:</span>
                          <div className="font-semibold">
                            ${data.pricing.currentPrice.toFixed(3)}/kWh
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Consumption:</span>
                          <div className="font-semibold">
                            {data.consumption.current.toFixed(0)} kW
                          </div>
                        </div>
                        {data.generation && (
                          <>
                            <div>
                              <span className="text-gray-500">Generation:</span>
                              <div className="font-semibold">
                                {(data.generation.solar + data.generation.wind).toFixed(0)} kW
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Grid Status:</span>
                              <div className={`font-semibold capitalize ${
                                data.gridStatus.stability === 'stable' ? 'text-green-600' :
                                data.gridStatus.stability === 'unstable' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {data.gridStatus.stability}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleProviderStatus(provider.id)}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                        provider.status === 'connected'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {provider.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </button>
                    <button
                      onClick={() => onProviderSelect?.(provider)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingProvider(provider)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeProvider(provider.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredProviders.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Energy Providers</h3>
            <p className="text-gray-500 mb-4">
              Connect energy providers to access real-time pricing and consumption data
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Provider
            </button>
          </div>
        )}
      </div>

      {/* Add Provider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Energy Provider</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Name
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a provider...</option>
                  {MAJOR_PROVIDERS.map((provider, index) => (
                    <option key={index} value={provider.name}>
                      {provider.name} - {provider.region}
                    </option>
                  ))}
                  <option value="custom">Custom Provider</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="utility">Utility Company</option>
                  <option value="renewable">Renewable Provider</option>
                  <option value="grid">Grid Operator</option>
                  <option value="market">Energy Market</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <input
                  type="text"
                  placeholder="e.g., California, USA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Enter API key for real-time data"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                onClick={() => addProvider({})}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Provider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyProviders;
