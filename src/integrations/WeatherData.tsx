import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplet,
  Thermometer,
  Eye,
  Gauge,
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Settings,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Zap,
  Activity,
} from 'lucide-react';

interface WeatherProvider {
  id: string;
  name: string;
  type: 'openweathermap' | 'weatherapi' | 'accuweather' | 'noaa' | 'custom';
  apiKey?: string;
  location: {
    lat: number;
    lon: number;
    name: string;
    country: string;
  };
  status: 'connected' | 'disconnected' | 'error';
  lastUpdate?: Date;
  updateFrequency: number; // minutes
  features: {
    current: boolean;
    forecast: boolean;
    historical: boolean;
    alerts: boolean;
    satellite: boolean;
  };
}

interface CurrentWeather {
  timestamp: Date;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  uvIndex: number;
  cloudCover: number;
  condition: string;
  icon: string;
  precipitation: {
    lastHour: number;
    last24Hours: number;
  };
}

interface WeatherForecast {
  date: Date;
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipitation: {
    probability: number;
    amount: number;
  };
  wind: {
    speed: number;
    direction: number;
  };
  humidity: number;
  uvIndex: number;
}

interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  startTime: Date;
  endTime: Date;
  areas: string[];
  type: string;
}

interface WeatherEnergyImpact {
  timestamp: Date;
  solarGeneration: {
    potential: number; // kW
    efficiency: number; // percentage
    forecast: Array<{ time: Date; generation: number }>;
  };
  windGeneration: {
    potential: number; // kW
    efficiency: number; // percentage
    forecast: Array<{ time: Date; generation: number }>;
  };
  consumption: {
    heating: number; // kW
    cooling: number; // kW
    baseline: number; // kW
    forecast: Array<{ time: Date; consumption: number }>;
  };
  gridImpact: {
    demand: number; // MW
    supply: number; // MW
    stability: 'stable' | 'strained' | 'critical';
  };
}

interface WeatherDataProps {
  className?: string;
  onLocationSelect?: (location: { lat: number; lon: number }) => void;
}

const WEATHER_PROVIDERS = [
  { id: 'openweathermap', name: 'OpenWeatherMap', type: 'openweathermap' as const },
  { id: 'weatherapi', name: 'WeatherAPI', type: 'weatherapi' as const },
  { id: 'accuweather', name: 'AccuWeather', type: 'accuweather' as const },
  { id: 'noaa', name: 'NOAA', type: 'noaa' as const },
];

const WEATHER_CONDITIONS = {
  clear: { icon: Sun, color: 'yellow', label: 'Clear' },
  clouds: { icon: Cloud, color: 'gray', label: 'Cloudy' },
  rain: { icon: CloudRain, color: 'blue', label: 'Rain' },
  snow: { icon: CloudSnow, color: 'blue', label: 'Snow' },
  wind: { icon: Wind, color: 'teal', label: 'Windy' },
};

const ALERT_SEVERITY = {
  minor: { color: 'yellow', label: 'Minor' },
  moderate: { color: 'orange', label: 'Moderate' },
  severe: { color: 'red', label: 'Severe' },
  extreme: { color: 'purple', label: 'Extreme' },
};

export const WeatherData: React.FC<WeatherDataProps> = ({
  className = '',
  onLocationSelect,
}) => {
  const [providers, setProviders] = useState<WeatherProvider[]>([]);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [energyImpact, setEnergyImpact] = useState<WeatherEnergyImpact | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [forecastDays, setForecastDays] = useState(7);

  useEffect(() => {
    loadProviders();
    if (providers.length > 0) {
      const interval = setInterval(() => {
        syncWeatherData();
      }, 60000 * 10); // Sync every 10 minutes

      return () => clearInterval(interval);
    }
  }, [providers.length]);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const savedProviders = localStorage.getItem('weatherProviders');
      if (savedProviders) {
        setProviders(JSON.parse(savedProviders));
      } else {
        // Initialize with demo provider
        const demoProvider: WeatherProvider = {
          id: 'demo-provider',
          name: 'OpenWeatherMap Demo',
          type: 'openweathermap',
          location: {
            lat: 37.7749,
            lon: -122.4194,
            name: 'San Francisco',
            country: 'USA',
          },
          status: 'connected',
          updateFrequency: 10,
          features: {
            current: true,
            forecast: true,
            historical: true,
            alerts: true,
            satellite: false,
          },
        };
        setProviders([demoProvider]);
        setSelectedProvider(demoProvider.id);
        await fetchWeatherData(demoProvider);
      }
    } catch (error) {
      console.error('Failed to load weather providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeatherData = async (provider: WeatherProvider) => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock current weather
      const current: CurrentWeather = {
        timestamp: new Date(),
        temperature: 22 + Math.random() * 10,
        feelsLike: 20 + Math.random() * 12,
        humidity: 40 + Math.random() * 40,
        pressure: 1000 + Math.random() * 30,
        windSpeed: Math.random() * 20,
        windDirection: Math.random() * 360,
        visibility: 8 + Math.random() * 4,
        uvIndex: Math.random() * 11,
        cloudCover: Math.random() * 100,
        condition: ['clear', 'clouds', 'rain'][Math.floor(Math.random() * 3)],
        icon: '01d',
        precipitation: {
          lastHour: Math.random() * 5,
          last24Hours: Math.random() * 20,
        },
      };

      // Mock forecast
      const forecastData: WeatherForecast[] = Array.from({ length: forecastDays }, (_, i) => ({
        date: new Date(Date.now() + i * 86400000),
        high: 20 + Math.random() * 15,
        low: 10 + Math.random() * 10,
        condition: ['clear', 'clouds', 'rain'][Math.floor(Math.random() * 3)],
        icon: '01d',
        precipitation: {
          probability: Math.random() * 100,
          amount: Math.random() * 10,
        },
        wind: {
          speed: Math.random() * 25,
          direction: Math.random() * 360,
        },
        humidity: 30 + Math.random() * 50,
        uvIndex: Math.random() * 11,
      }));

      // Mock energy impact
      const impact: WeatherEnergyImpact = {
        timestamp: new Date(),
        solarGeneration: {
          potential: 100 + Math.random() * 400,
          efficiency: 0.7 + Math.random() * 0.25,
          forecast: Array.from({ length: 24 }, (_, i) => ({
            time: new Date(Date.now() + i * 3600000),
            generation: Math.max(0, 100 * Math.sin((i / 24) * Math.PI * 2 - Math.PI / 2) + Math.random() * 50),
          })),
        },
        windGeneration: {
          potential: 50 + Math.random() * 200,
          efficiency: 0.6 + Math.random() * 0.3,
          forecast: Array.from({ length: 24 }, (_, i) => ({
            time: new Date(Date.now() + i * 3600000),
            generation: Math.random() * 150,
          })),
        },
        consumption: {
          heating: current.temperature < 15 ? Math.random() * 100 : 0,
          cooling: current.temperature > 25 ? Math.random() * 150 : 0,
          baseline: 200 + Math.random() * 100,
          forecast: Array.from({ length: 24 }, (_, i) => ({
            time: new Date(Date.now() + i * 3600000),
            consumption: 200 + Math.random() * 150,
          })),
        },
        gridImpact: {
          demand: 1000 + Math.random() * 500,
          supply: 1200 + Math.random() * 400,
          stability: Math.random() > 0.2 ? 'stable' : Math.random() > 0.5 ? 'strained' : 'critical',
        },
      };

      // Mock alerts
      const mockAlerts: WeatherAlert[] = Math.random() > 0.7 ? [{
        id: 'alert-1',
        title: 'Heat Advisory',
        description: 'High temperatures expected. Increased energy demand for cooling.',
        severity: 'moderate',
        startTime: new Date(),
        endTime: new Date(Date.now() + 86400000),
        areas: [provider.location.name],
        type: 'heat',
      }] : [];

      setCurrentWeather(current);
      setForecast(forecastData);
      setAlerts(mockAlerts);
      setEnergyImpact(impact);

      // Update provider last update
      setProviders(prev => prev.map(p => 
        p.id === provider.id 
          ? { ...p, lastUpdate: new Date(), status: 'connected' }
          : p
      ));
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      setProviders(prev => prev.map(p => 
        p.id === provider.id 
          ? { ...p, status: 'error' }
          : p
      ));
    }
  };

  const syncWeatherData = async () => {
    if (selectedProvider) {
      const provider = providers.find(p => p.id === selectedProvider);
      if (provider) {
        await fetchWeatherData(provider);
      }
    }
  };

  const addProvider = async (providerData: Partial<WeatherProvider>) => {
    const newProvider: WeatherProvider = {
      id: `provider-${Date.now()}`,
      name: providerData.name || 'New Weather Provider',
      type: providerData.type || 'openweathermap',
      location: providerData.location || {
        lat: 37.7749,
        lon: -122.4194,
        name: 'San Francisco',
        country: 'USA',
      },
      status: 'disconnected',
      updateFrequency: 10,
      features: {
        current: true,
        forecast: true,
        historical: false,
        alerts: true,
        satellite: false,
      },
    };

    setProviders(prev => [...prev, newProvider]);
    setShowAddModal(false);
  };

  const removeProvider = (providerId: string) => {
    setProviders(prev => prev.filter(p => p.id !== providerId));
    if (selectedProvider === providerId) {
      setSelectedProvider(null);
      setCurrentWeather(null);
      setForecast([]);
      setAlerts([]);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const conditionKey = condition.toLowerCase() as keyof typeof WEATHER_CONDITIONS;
    return WEATHER_CONDITIONS[conditionKey]?.icon || Sun;
  };

  const getSeverityColor = (severity: WeatherAlert['severity']) => {
    return ALERT_SEVERITY[severity]?.color || 'gray';
  };

  const activeProvider = providers.find(p => p.id === selectedProvider);

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Weather Data Integration</h2>
            <p className="text-sm text-gray-500 mt-1">
              Real-time weather data and energy impact analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Provider Selector */}
            <select
              value={selectedProvider || ''}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                const provider = providers.find(p => p.id === e.target.value);
                if (provider) {
                  fetchWeatherData(provider);
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} - {provider.location.name}
                </option>
              ))}
            </select>

            {/* Add Provider */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Provider
            </button>

            {/* Refresh */}
            <button
              onClick={syncWeatherData}
              disabled={!selectedProvider}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading weather data...</span>
          </div>
        ) : !selectedProvider ? (
          <div className="text-center py-12">
            <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Weather Provider Selected</h3>
            <p className="text-gray-500 mb-4">
              Add a weather provider to access real-time weather data and energy impact analysis
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Weather Provider
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Weather */}
            {currentWeather && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Main Weather Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {activeProvider?.location.name}, {activeProvider?.location.country}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {currentWeather.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {(() => {
                        const Icon = getWeatherIcon(currentWeather.condition);
                        return <Icon className="w-12 h-12" />;
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-4xl font-bold mb-2">
                        {Math.round(currentWeather.temperature)}°C
                      </div>
                      <div className="text-blue-100">
                        Feels like {Math.round(currentWeather.feelsLike)}°C
                      </div>
                      <div className="text-blue-100 capitalize">
                        {currentWeather.condition}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100">Humidity:</span>
                        <span>{currentWeather.humidity}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100">Wind:</span>
                        <span>{currentWeather.windSpeed.toFixed(1)} km/h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100">Pressure:</span>
                        <span>{currentWeather.pressure.toFixed(0)} hPa</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100">UV Index:</span>
                        <span>{currentWeather.uvIndex.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Energy Impact Card */}
                {energyImpact && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Energy Impact
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-green-700 mb-1">Solar Generation</div>
                        <div className="text-2xl font-bold text-green-900">
                          {energyImpact.solarGeneration.potential.toFixed(0)} kW
                        </div>
                        <div className="text-sm text-green-600">
                          {(energyImpact.solarGeneration.efficiency * 100).toFixed(1)}% efficiency
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-green-700 mb-1">Wind Generation</div>
                        <div className="text-2xl font-bold text-green-900">
                          {energyImpact.windGeneration.potential.toFixed(0)} kW
                        </div>
                        <div className="text-sm text-green-600">
                          {(energyImpact.windGeneration.efficiency * 100).toFixed(1)}% efficiency
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-green-700 mb-1">Grid Status</div>
                        <div className={`text-sm font-medium ${
                          energyImpact.gridImpact.stability === 'stable' ? 'text-green-600' :
                          energyImpact.gridImpact.stability === 'strained' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {energyImpact.gridImpact.stability.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Weather Alerts */}
            {alerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Alerts</h3>
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`border-l-4 border-${getSeverityColor(alert.severity)}-500 bg-${getSeverityColor(alert.severity)}-50 p-4 rounded-r-lg`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Severity: {alert.severity}</span>
                            <span>Areas: {alert.areas.join(', ')}</span>
                          </div>
                        </div>
                        <AlertTriangle className={`w-5 h-5 text-${getSeverityColor(alert.severity)}-500`} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 7-Day Forecast */}
            {forecast.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">7-Day Forecast</h3>
                  <select
                    value={forecastDays}
                    onChange={(e) => setForecastDays(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {forecast.slice(0, forecastDays).map((day, index) => {
                    const Icon = getWeatherIcon(day.condition);
                    return (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-600 mb-2">
                          {day.date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <Icon className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                        <div className="text-sm font-semibold text-gray-900">
                          {Math.round(day.high)}° / {Math.round(day.low)}°
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {day.precipitation.probability.toFixed(0)}% rain
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Add Provider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Weather Provider</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {WEATHER_PROVIDERS.map(provider => (
                    <option key={provider.id} value={provider.type}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., San Francisco, CA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Frequency (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  defaultValue="10"
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

export default WeatherData;
