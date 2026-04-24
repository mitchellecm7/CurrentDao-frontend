// Provider APIs Service
// Handles communication with various third-party energy, weather, and IoT provider APIs

export interface ProviderConfig {
  id: string;
  name: string;
  type: 'energy' | 'weather' | 'smart-home' | 'iot';
  baseUrl: string;
  apiKey?: string;
  apiSecret?: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  timeout: number;
  retryAttempts: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    requestId: string;
    timestamp: Date;
    rateLimitRemaining?: number;
    responseTime: number;
  };
}

export interface EnergyProviderData {
  providerId: string;
  timestamp: Date;
  pricing: {
    currentPrice: number;
    currency: string;
    unit: string;
    forecast: Array<{
      timestamp: Date;
      price: number;
    }>;
  };
  consumption: {
    current: number;
    daily: number;
    monthly: number;
    unit: string;
  };
  generation?: {
    solar: number;
    wind: number;
    hydro: number;
    other: number;
    unit: string;
  };
  gridStatus: {
    load: number;
    capacity: number;
    frequency: number;
    voltage: number;
    stability: 'stable' | 'unstable' | 'critical';
    outages: Array<{
      area: string;
      type: string;
      estimatedResolution: Date;
    }>;
  };
}

export interface WeatherProviderData {
  providerId: string;
  location: {
    lat: number;
    lon: number;
    name: string;
  };
  timestamp: Date;
  current: {
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
    precipitation: {
      lastHour: number;
      last24Hours: number;
    };
  };
  forecast: Array<{
    date: Date;
    high: number;
    low: number;
    condition: string;
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
  }>;
  alerts: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'minor' | 'moderate' | 'severe' | 'extreme';
    startTime: Date;
    endTime: Date;
    areas: string[];
  }>;
}

export interface SmartHomeProviderData {
  providerId: string;
  timestamp: Date;
  devices: Array<{
    id: string;
    name: string;
    type: string;
    status: 'online' | 'offline';
    isOn: boolean;
    capabilities: string[];
    currentState: Record<string, any>;
    energyConsumption: {
      current: number;
      daily: number;
    };
  }>;
  scenes: Array<{
    id: string;
    name: string;
    devices: string[];
    actions: Array<{
      deviceId: string;
      action: string;
      parameters: any;
    }>;
  }>;
  automation: Array<{
    id: string;
    name: string;
    triggers: any[];
    actions: any[];
    isActive: boolean;
  }>;
}

class ProviderApiService {
  private configs: Map<string, ProviderConfig> = new Map();
  private rateLimiters: Map<string, { requests: number[] }> = new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs() {
    // Energy Provider Configurations
    const energyProviders = [
      {
        id: 'pge',
        name: 'Pacific Gas & Electric',
        type: 'energy' as const,
        baseUrl: 'https://api.pge.com/v1',
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 10000 },
        timeout: 10000,
        retryAttempts: 3,
      },
      {
        id: 'e-on',
        name: 'E.ON',
        type: 'energy' as const,
        baseUrl: 'https://api.eon.com/v2',
        rateLimit: { requestsPerMinute: 100, requestsPerDay: 50000 },
        timeout: 15000,
        retryAttempts: 3,
      },
      {
        id: 'tesla-energy',
        name: 'Tesla Energy',
        type: 'energy' as const,
        baseUrl: 'https://api.tesla.com/energy',
        rateLimit: { requestsPerMinute: 30, requestsPerDay: 5000 },
        timeout: 20000,
        retryAttempts: 2,
      },
    ];

    // Weather Provider Configurations
    const weatherProviders = [
      {
        id: 'openweathermap',
        name: 'OpenWeatherMap',
        type: 'weather' as const,
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 1000 },
        timeout: 5000,
        retryAttempts: 3,
      },
      {
        id: 'weatherapi',
        name: 'WeatherAPI',
        type: 'weather' as const,
        baseUrl: 'https://api.weatherapi.com/v1',
        rateLimit: { requestsPerMinute: 100, requestsPerDay: 1000000 },
        timeout: 5000,
        retryAttempts: 3,
      },
    ];

    // Smart Home Provider Configurations
    const smartHomeProviders = [
      {
        id: 'google-home',
        name: 'Google Home',
        type: 'smart-home' as const,
        baseUrl: 'https://homegraph.googleapis.com/v1',
        rateLimit: { requestsPerMinute: 100, requestsPerDay: 10000 },
        timeout: 10000,
        retryAttempts: 2,
      },
      {
        id: 'alexa',
        name: 'Amazon Alexa',
        type: 'smart-home' as const,
        baseUrl: 'https://api.amazonalexa.com/v3',
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 10000 },
        timeout: 10000,
        retryAttempts: 2,
      },
    ];

    [...energyProviders, ...weatherProviders, ...smartHomeProviders].forEach(config => {
      this.configs.set(config.id, config);
      this.rateLimiters.set(config.id, { requests: [] });
    });
  }

  // Configuration Management
  addProviderConfig(config: ProviderConfig): void {
    this.configs.set(config.id, config);
    this.rateLimiters.set(config.id, { requests: [] });
  }

  removeProviderConfig(id: string): boolean {
    this.rateLimiters.delete(id);
    return this.configs.delete(id);
  }

  getProviderConfig(id: string): ProviderConfig | undefined {
    return this.configs.get(id);
  }

  getAllProviderConfigs(): ProviderConfig[] {
    return Array.from(this.configs.values());
  }

  // Rate Limiting
  private checkRateLimit(providerId: string): boolean {
    const config = this.configs.get(providerId);
    if (!config) return false;

    const limiter = this.rateLimiters.get(providerId);
    if (!limiter) return false;

    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneDayAgo = now - 86400000;

    // Clean old requests
    limiter.requests = limiter.requests.filter(timestamp => 
      timestamp > oneDayAgo
    );

    // Check limits
    const requestsInLastMinute = limiter.requests.filter(t => t > oneMinuteAgo).length;
    const requestsInLastDay = limiter.requests.length;

    if (requestsInLastMinute >= config.rateLimit.requestsPerMinute) {
      return false;
    }

    if (requestsInLastDay >= config.rateLimit.requestsPerDay) {
      return false;
    }

    // Add current request
    limiter.requests.push(now);
    return true;
  }

  // HTTP Request Helper
  private async makeRequest<T>(
    providerId: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const config = this.configs.get(providerId);
    if (!config) {
      return {
        success: false,
        error: `Provider configuration not found for ${providerId}`,
      };
    }

    if (!this.checkRateLimit(providerId)) {
      return {
        success: false,
        error: 'Rate limit exceeded',
      };
    }

    const startTime = Date.now();
    const requestId = `${providerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const url = `${config.baseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'CurrentDAO-Integrations/1.0',
        'X-Request-ID': requestId,
        ...config.headers,
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(config.timeout),
      });

      const responseTime = Date.now() - startTime;
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          metadata: {
            requestId,
            timestamp: new Date(),
            rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined,
            responseTime,
          },
        };
      }

      const data = await response.json();

      return {
        success: true,
        data,
        metadata: {
          requestId,
          timestamp: new Date(),
          rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined,
          responseTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          requestId,
          timestamp: new Date(),
          responseTime: Date.now() - startTime,
        },
      };
    }
  }

  // Energy Provider APIs
  async getEnergyPricing(providerId: string, location?: string): Promise<ApiResponse<EnergyProviderData>> {
    const endpoint = location 
      ? `/pricing?location=${encodeURIComponent(location)}`
      : '/pricing';

    const response = await this.makeRequest(providerId, endpoint);

    if (!response.success || !response.data) {
      return response;
    }

    // Transform API response to standardized format
    const transformedData: EnergyProviderData = {
      providerId,
      timestamp: new Date(),
      pricing: {
        currentPrice: response.data.currentPrice || 0.15,
        currency: response.data.currency || 'USD',
        unit: response.data.unit || 'kWh',
        forecast: (response.data.forecast || []).map((item: any) => ({
          timestamp: new Date(item.timestamp),
          price: item.price,
        })),
      },
      consumption: {
        current: response.data.consumption?.current || 0,
        daily: response.data.consumption?.daily || 0,
        monthly: response.data.consumption?.monthly || 0,
        unit: response.data.consumption?.unit || 'kWh',
      },
      generation: response.data.generation ? {
        solar: response.data.generation.solar || 0,
        wind: response.data.generation.wind || 0,
        hydro: response.data.generation.hydro || 0,
        other: response.data.generation.other || 0,
        unit: response.data.generation.unit || 'kW',
      } : undefined,
      gridStatus: {
        load: response.data.gridStatus?.load || 0,
        capacity: response.data.gridStatus?.capacity || 100,
        frequency: response.data.gridStatus?.frequency || 60,
        voltage: response.data.gridStatus?.voltage || 120,
        stability: response.data.gridStatus?.stability || 'stable',
        outages: (response.data.gridStatus?.outages || []).map((outage: any) => ({
          area: outage.area,
          type: outage.type,
          estimatedResolution: new Date(outage.estimatedResolution),
        })),
      },
    };

    return {
      ...response,
      data: transformedData,
    };
  }

  async getEnergyConsumption(providerId: string, timeRange: string = '24h'): Promise<ApiResponse<EnergyProviderData>> {
    const response = await this.makeRequest(providerId, `/consumption?range=${timeRange}`);

    if (!response.success || !response.data) {
      return response;
    }

    // Similar transformation as above
    return {
      ...response,
      data: {
        providerId,
        timestamp: new Date(),
        pricing: {
          currentPrice: 0,
          currency: 'USD',
          unit: 'kWh',
          forecast: [],
        },
        consumption: {
          current: response.data.current || 0,
          daily: response.data.daily || 0,
          monthly: response.data.monthly || 0,
          unit: 'kWh',
        },
        gridStatus: {
          load: 0,
          capacity: 100,
          frequency: 60,
          voltage: 120,
          stability: 'stable',
          outages: [],
        },
      },
    };
  }

  // Weather Provider APIs
  async getCurrentWeather(providerId: string, lat: number, lon: number): Promise<ApiResponse<WeatherProviderData>> {
    const endpoint = `/weather?lat=${lat}&lon=${lon}`;
    const response = await this.makeRequest(providerId, endpoint);

    if (!response.success || !response.data) {
      return response;
    }

    const transformedData: WeatherProviderData = {
      providerId,
      location: {
        lat,
        lon,
        name: response.data.location?.name || 'Unknown',
      },
      timestamp: new Date(),
      current: {
        temperature: response.data.main?.temp || 0,
        feelsLike: response.data.main?.feels_like || 0,
        humidity: response.data.main?.humidity || 0,
        pressure: response.data.main?.pressure || 0,
        windSpeed: response.data.wind?.speed || 0,
        windDirection: response.data.wind?.deg || 0,
        visibility: response.data.visibility || 0,
        uvIndex: response.data.uvi || 0,
        cloudCover: response.data.clouds?.all || 0,
        condition: response.data.weather?.[0]?.description || 'unknown',
        precipitation: {
          lastHour: response.data.rain?.['1h'] || 0,
          last24Hours: response.data.rain?.['24h'] || 0,
        },
      },
      forecast: (response.data.forecast || []).map((item: any) => ({
        date: new Date(item.dt * 1000),
        high: item.temp?.max || 0,
        low: item.temp?.min || 0,
        condition: item.weather?.[0]?.description || 'unknown',
        precipitation: {
          probability: item.pop || 0,
          amount: item.rain?.['3h'] || 0,
        },
        wind: {
          speed: item.wind_speed || 0,
          direction: item.wind_deg || 0,
        },
        humidity: item.humidity || 0,
        uvIndex: item.uvi || 0,
      })),
      alerts: (response.data.alerts || []).map((alert: any) => ({
        id: alert.id || '',
        title: alert.title || '',
        description: alert.description || '',
        severity: alert.severity || 'moderate',
        startTime: new Date(alert.start),
        endTime: new Date(alert.end),
        areas: alert.areas || [],
      })),
    };

    return {
      ...response,
      data: transformedData,
    };
  }

  async getWeatherForecast(providerId: string, lat: number, lon: number, days: number = 7): Promise<ApiResponse<WeatherProviderData>> {
    const endpoint = `/forecast?lat=${lat}&lon=${lon}&days=${days}`;
    const response = await this.makeRequest(providerId, endpoint);

    if (!response.success || !response.data) {
      return response;
    }

    // Similar transformation as getCurrentWeather
    return {
      ...response,
      data: {
        providerId,
        location: { lat, lon, name: 'Unknown' },
        timestamp: new Date(),
        current: {
          temperature: 0,
          feelsLike: 0,
          humidity: 0,
          pressure: 0,
          windSpeed: 0,
          windDirection: 0,
          visibility: 0,
          uvIndex: 0,
          cloudCover: 0,
          condition: 'unknown',
          precipitation: { lastHour: 0, last24Hours: 0 },
        },
        forecast: [],
        alerts: [],
      },
    };
  }

  // Smart Home Provider APIs
  async getSmartHomeDevices(providerId: string): Promise<ApiResponse<SmartHomeProviderData>> {
    const response = await this.makeRequest(providerId, '/devices');

    if (!response.success || !response.data) {
      return response;
    }

    const transformedData: SmartHomeProviderData = {
      providerId,
      timestamp: new Date(),
      devices: (response.data.devices || []).map((device: any) => ({
        id: device.id || '',
        name: device.name || 'Unknown Device',
        type: device.type || 'unknown',
        status: device.online ? 'online' : 'offline',
        isOn: device.state?.on || false,
        capabilities: device.capabilities || [],
        currentState: device.state || {},
        energyConsumption: {
          current: device.energyConsumption?.current || 0,
          daily: device.energyConsumption?.daily || 0,
        },
      })),
      scenes: (response.data.scenes || []).map((scene: any) => ({
        id: scene.id || '',
        name: scene.name || 'Unknown Scene',
        devices: scene.devices || [],
        actions: scene.actions || [],
      })),
      automation: (response.data.automation || []).map((automation: any) => ({
        id: automation.id || '',
        name: automation.name || 'Unknown Automation',
        triggers: automation.triggers || [],
        actions: automation.actions || [],
        isActive: automation.isActive || false,
      })),
    };

    return {
      ...response,
      data: transformedData,
    };
  }

  async controlSmartHomeDevice(
    providerId: string, 
    deviceId: string, 
    action: string, 
    parameters: any = {}
  ): Promise<ApiResponse<any>> {
    const endpoint = `/devices/${deviceId}/control`;
    const response = await this.makeRequest(providerId, endpoint, {
      method: 'POST',
      body: JSON.stringify({
        action,
        parameters,
      }),
    });

    return response;
  }

  // Utility Methods
  async testConnection(providerId: string): Promise<ApiResponse<boolean>> {
    const response = await this.makeRequest(providerId, '/health');
    
    if (response.success) {
      return {
        success: true,
        data: true,
        metadata: response.metadata,
      };
    }

    return {
      success: false,
      error: response.error || 'Connection test failed',
      metadata: response.metadata,
    };
  }

  getRateLimitStatus(providerId: string): {
    requestsInLastMinute: number;
    requestsInLastDay: number;
    limitPerMinute: number;
    limitPerDay: number;
  } | null {
    const config = this.configs.get(providerId);
    const limiter = this.rateLimiters.get(providerId);

    if (!config || !limiter) {
      return null;
    }

    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneDayAgo = now - 86400000;

    const requestsInLastMinute = limiter.requests.filter(t => t > oneMinuteAgo).length;
    const requestsInLastDay = limiter.requests.filter(t > oneDayAgo).length;

    return {
      requestsInLastMinute,
      requestsInLastDay,
      limitPerMinute: config.rateLimit.requestsPerMinute,
      limitPerDay: config.rateLimit.requestsPerDay,
    };
  }

  // Batch Operations
  async batchRequest<T>(
    requests: Array<{
      providerId: string;
      endpoint: string;
      options?: RequestInit;
    }>
  ): Promise<ApiResponse<T>[]> {
    const promises = requests.map(({ providerId, endpoint, options }) =>
      this.makeRequest<T>(providerId, endpoint, options)
    );

    return Promise.all(promises);
  }
}

// Singleton instance
export const providerApiService = new ProviderApiService();

export default providerApiService;
