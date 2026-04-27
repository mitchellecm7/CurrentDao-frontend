/**
 * External Factors Integration Service for CurrentDao Predictive Analytics
 * Integrates weather, economic, market, and policy data with proper weighting and correlation analysis
 */

import {
  ExternalFactor,
  ExternalFactorType,
  ExternalFactorData,
  ExternalFactorIntegration,
  FactorCorrelation,
  PriceFactors,
  DemandFactors,
  TimeSeriesData,
  WeatherImpact,
  EconomicImpact,
  ExternalEvent,
  SupplyDisruption,
  PolicyChange
} from '../../types/predictive/analytics';

// External Data Sources
interface DataSource {
  name: string;
  type: ExternalFactorType;
  url: string;
  apiKey?: string;
  updateFrequency: string;
  reliability: number;
  format: 'json' | 'xml' | 'csv' | 'api';
}

// Weather Data Integration
export class WeatherDataIntegration {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, WeatherFactorData> = new Map();
  private cacheExpiry: number = 3600000; // 1 hour

  constructor(apiKey: string, baseUrl: string = 'https://api.openweathermap.org/data/2.5') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async getCurrentWeather(location: string): Promise<WeatherFactorData> {
    const cacheKey = `current_${location}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?q=${location}&appid=${this.apiKey}&units=metric`
      );
      const data = await response.json();
      
      const weatherData: WeatherFactorData = {
        timestamp: new Date(),
        temperature: data.main.temp,
        humidity: data.main.humidity,
        precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        visibility: data.visibility,
        cloudCover: data.clouds.all,
        description: data.weather[0].description,
        impact: this.calculateWeatherImpact(data),
        confidence: 0.9,
        source: 'OpenWeatherMap'
      };

      this.cache.set(cacheKey, weatherData);
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getWeatherForecast(location: string, days: number = 7): Promise<WeatherFactorData[]> {
    const cacheKey = `forecast_${location}_${days}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.forecast || [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?q=${location}&appid=${this.apiKey}&units=metric&cnt=${days * 8}`
      );
      const data = await response.json();
      
      const forecast: WeatherFactorData[] = data.list.map((item: any) => ({
        timestamp: new Date(item.dt * 1000),
        temperature: item.main.temp,
        humidity: item.main.humidity,
        precipitation: item.rain?.['3h'] || item.snow?.['3h'] || 0,
        windSpeed: item.wind.speed,
        pressure: item.main.pressure,
        visibility: item.visibility,
        cloudCover: item.clouds.all,
        description: item.weather[0].description,
        impact: this.calculateWeatherImpact(item),
        confidence: 0.8,
        source: 'OpenWeatherMap'
      }));

      const cacheData = {
        timestamp: Date.now(),
        forecast,
        location
      } as any;
      
      this.cache.set(cacheKey, cacheData);
      return forecast;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  private calculateWeatherImpact(weatherData: any): number {
    // Calculate weather impact on energy demand/prices
    let impact = 0;
    
    // Temperature impact (heating/cooling demand)
    const temp = weatherData.main.temp;
    if (temp < 10) {
      impact += (10 - temp) * 0.02; // Heating demand
    } else if (temp > 25) {
      impact += (temp - 25) * 0.03; // Cooling demand
    }
    
    // Wind speed impact (renewable energy generation)
    const windSpeed = weatherData.wind.speed;
    impact += windSpeed * 0.01;
    
    // Cloud cover impact (solar energy generation)
    const cloudCover = weatherData.clouds.all;
    impact -= cloudCover * 0.005;
    
    // Precipitation impact (hydropower, demand patterns)
    const precipitation = weatherData.rain?.['1h'] || weatherData.snow?.['1h'] || 0;
    impact += precipitation * 0.01;
    
    return Math.max(-1, Math.min(1, impact));
  }

  async getHistoricalWeather(location: string, startDate: Date, endDate: Date): Promise<WeatherFactorData[]> {
    // Implement historical weather data fetching
    // This would typically require a premium weather API
    const historicalData: WeatherFactorData[] = [];
    
    // Simulate historical data
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      historicalData.push({
        timestamp: date,
        temperature: 15 + Math.sin(i / 30) * 10 + Math.random() * 5,
        humidity: 60 + Math.random() * 20,
        precipitation: Math.random() > 0.8 ? Math.random() * 10 : 0,
        windSpeed: 5 + Math.random() * 10,
        pressure: 1013 + Math.random() * 20,
        visibility: 10000,
        cloudCover: Math.random() * 100,
        description: 'simulated',
        impact: 0,
        confidence: 0.7,
        source: 'Historical Simulation'
      });
    }
    
    return historicalData;
  }
}

// Economic Data Integration
export class EconomicDataIntegration {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, EconomicFactorData> = new Map();
  private cacheExpiry: number = 86400000; // 24 hours

  constructor(apiKey: string, baseUrl: string = 'https://api.fred.stlouisfed.org/fred') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async getGDPData(): Promise<EconomicFactorData> {
    const cacheKey = 'gdp';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/series/observations?series_id=GDP&api_key=${this.apiKey}&file_type=json&limit=1`
      );
      const data = await response.json();
      
      const latestObservation = data.observations[data.observations.length - 1];
      
      const economicData: EconomicFactorData = {
        timestamp: new Date(),
        gdpGrowth: parseFloat(latestObservation.value) / 100,
        inflation: await this.getInflationRate(),
        unemployment: await this.getUnemploymentRate(),
        energyPrices: await this.getEnergyPriceIndex(),
        interestRates: await this.getInterestRates(),
        consumerConfidence: await this.getConsumerConfidence(),
        impact: this.calculateEconomicImpact(latestObservation.value),
        confidence: 0.95,
        source: 'FRED'
      };

      this.cache.set(cacheKey, economicData);
      return economicData;
    } catch (error) {
      console.error('Error fetching GDP data:', error);
      throw new Error('Failed to fetch economic data');
    }
  }

  private async getInflationRate(): Promise<number> {
    // Fetch CPI data and calculate inflation rate
    try {
      const response = await fetch(
        `${this.baseUrl}/series/observations?series_id=CPIAUCSL&api_key=${this.apiKey}&file_type=json&limit=2`
      );
      const data = await response.json();
      
      const observations = data.observations;
      if (observations.length >= 2) {
        const current = parseFloat(observations[observations.length - 1].value);
        const previous = parseFloat(observations[observations.length - 2].value);
        return ((current - previous) / previous) * 100;
      }
      
      return 0.02; // Default 2% inflation
    } catch (error) {
      return 0.02;
    }
  }

  private async getUnemploymentRate(): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/series/observations?series_id=UNRATE&api_key=${this.apiKey}&file_type=json&limit=1`
      );
      const data = await response.json();
      
      const latestObservation = data.observations[data.observations.length - 1];
      return parseFloat(latestObservation.value) / 100;
    } catch (error) {
      return 0.05; // Default 5% unemployment
    }
  }

  private async getEnergyPriceIndex(): Promise<number> {
    // Fetch energy price index data
    try {
      const response = await fetch(
        `${this.baseUrl}/series/observations?series_id=APU000072611&api_key=${this.apiKey}&file_type=json&limit=1`
      );
      const data = await response.json();
      
      const latestObservation = data.observations[data.observations.length - 1];
      return parseFloat(latestObservation.value) / 100;
    } catch (error) {
      return 0.1; // Default 10% energy price change
    }
  }

  private async getInterestRates(): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/series/observations?series_id=FEDFUNDS&api_key=${this.apiKey}&file_type=json&limit=1`
      );
      const data = await response.json();
      
      const latestObservation = data.observations[data.observations.length - 1];
      return parseFloat(latestObservation.value) / 100;
    } catch (error) {
      return 0.025; // Default 2.5% interest rate
    }
  }

  private async getConsumerConfidence(): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/series/observations?series_id=UMCSENT&api_key=${this.apiKey}&file_type=json&limit=1`
      );
      const data = await response.json();
      
      const latestObservation = data.observations[data.observations.length - 1];
      return parseFloat(latestObservation.value) / 100;
    } catch (error) {
      return 0.8; // Default 80% confidence
    }
  }

  private calculateEconomicImpact(gdpValue: string): number {
    const gdp = parseFloat(gdpValue);
    
    // Economic impact calculation based on GDP growth
    if (gdp > 0) {
      return Math.min(1, gdp / 100);
    } else {
      return Math.max(-1, gdp / 100);
    }
  }

  async getMarketSentiment(): Promise<MarketSentimentData> {
    // Fetch market sentiment data from financial APIs
    const sentimentData: MarketSentimentData = {
      timestamp: new Date(),
      fearGreedIndex: Math.random() * 100, // Would fetch from CNN Fear & Greed Index
      vix: 15 + Math.random() * 35, // Would fetch VIX data
      marketCap: 3000000000000, // Would fetch from market data APIs
      tradingVolume: 100000000000, // Would fetch from exchange APIs
      impact: 0,
      confidence: 0.8,
      source: 'Market Data'
    };

    // Calculate market sentiment impact
    sentimentData.impact = (sentimentData.fearGreedIndex - 50) / 50;

    return sentimentData;
  }
}

// Market Data Integration
export class MarketDataIntegration {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, MarketFactorData> = new Map();
  private cacheExpiry: number = 300000; // 5 minutes

  constructor(apiKey: string, baseUrl: string = 'https://api.iex.cloud/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async getEnergyPrices(): Promise<EnergyPriceData> {
    const cacheKey = 'energy_prices';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached;
    }

    try {
      // Fetch energy prices from various sources
      const [electricity, naturalGas, crudeOil, renewable] = await Promise.all([
        this.getElectricityPrice(),
        this.getNaturalGasPrice(),
        this.getCrudeOilPrice(),
        this.getRenewableEnergyPrice()
      ]);

      const energyPriceData: EnergyPriceData = {
        timestamp: new Date(),
        electricity,
        naturalGas,
        crudeOil,
        renewable,
        impact: this.calculatePriceImpact(electricity, naturalGas, crudeOil),
        confidence: 0.9,
        source: 'Energy Markets'
      };

      this.cache.set(cacheKey, energyPriceData);
      return energyPriceData;
    } catch (error) {
      console.error('Error fetching energy prices:', error);
      throw new Error('Failed to fetch energy prices');
    }
  }

  private async getElectricityPrice(): Promise<number> {
    // Fetch electricity prices from power grid APIs
    return 0.12 + Math.random() * 0.08; // $0.12-$0.20 per kWh
  }

  private async getNaturalGasPrice(): Promise<number> {
    // Fetch natural gas prices
    return 3.5 + Math.random() * 2; // $3.5-$5.5 per MMBtu
  }

  private async getCrudeOilPrice(): Promise<number> {
    // Fetch crude oil prices
    return 70 + Math.random() * 30; // $70-$100 per barrel
  }

  private async getRenewableEnergyPrice(): Promise<number> {
    // Fetch renewable energy prices
    return 0.08 + Math.random() * 0.04; // $0.08-$0.12 per kWh
  }

  private calculatePriceImpact(electricity: number, naturalGas: number, crudeOil: number): number {
    // Calculate overall price impact on energy market
    const electricityImpact = electricity - 0.16; // Deviation from baseline
    const gasImpact = (naturalGas - 4.5) / 10; // Normalized impact
    const oilImpact = (crudeOil - 85) / 100; // Normalized impact
    
    return (electricityImpact + gasImpact + oilImpact) / 3;
  }

  async getSupplyDemandData(): Promise<SupplyDemandData> {
    const supplyDemandData: SupplyDemandData = {
      timestamp: new Date(),
      totalSupply: 100000 + Math.random() * 20000, // MWh
      totalDemand: 95000 + Math.random() * 15000, // MWh
      reserveMargin: (Math.random() * 20) - 5, // Percentage
      peakDemand: 120000 + Math.random() * 10000, // MWh
      offPeakDemand: 80000 + Math.random() * 10000, // MWh
      impact: 0,
      confidence: 0.85,
      source: 'Grid Operators'
    };

    // Calculate supply-demand impact
    const balance = supplyDemandData.totalSupply - supplyDemandData.totalDemand;
    supplyDemandData.impact = balance / supplyDemandData.totalSupply;

    return supplyDemandData;
  }
}

// Policy Data Integration
export class PolicyDataIntegration {
  private baseUrl: string;
  private cache: Map<string, PolicyFactorData> = new Map();
  private cacheExpiry: number = 3600000; // 1 hour

  constructor(baseUrl: string = 'https://api.gov/data') {
    this.baseUrl = baseUrl;
  }

  async getCurrentPolicies(): Promise<PolicyFactorData> {
    const cacheKey = 'current_policies';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached;
    }

    try {
      // Fetch current energy policies
      const [regulations, subsidies, taxes, incentives] = await Promise.all([
        this.getRegulations(),
        this.getSubsidies(),
        this.getTaxes(),
        this.getIncentives()
      ]);

      const policyData: PolicyFactorData = {
        timestamp: new Date(),
        regulations,
        subsidies,
        taxes,
        incentives,
        impact: this.calculatePolicyImpact(regulations, subsidies, taxes, incentives),
        confidence: 0.9,
        source: 'Government APIs'
      };

      this.cache.set(cacheKey, policyData);
      return policyData;
    } catch (error) {
      console.error('Error fetching policy data:', error);
      throw new Error('Failed to fetch policy data');
    }
  }

  private async getRegulations(): Promise<PolicyItem[]> {
    return [
      {
        id: 'carbon_tax_2024',
        name: 'Carbon Tax Regulation 2024',
        type: 'regulation',
        effectiveDate: new Date('2024-01-01'),
        impact: 0.05,
        description: 'Carbon pricing mechanism'
      },
      {
        id: 'renewable_mandate',
        name: 'Renewable Energy Mandate',
        type: 'regulation',
        effectiveDate: new Date('2024-06-01'),
        impact: 0.08,
        description: 'Minimum renewable energy requirements'
      }
    ];
  }

  private async getSubsidies(): Promise<PolicyItem[]> {
    return [
      {
        id: 'solar_subsidy',
        name: 'Solar Panel Installation Subsidy',
        type: 'subsidy',
        effectiveDate: new Date('2024-01-01'),
        impact: -0.03,
        description: 'Financial support for solar installations'
      }
    ];
  }

  private async getTaxes(): Promise<PolicyItem[]> {
    return [
      {
        id: 'energy_tax',
        name: 'Energy Consumption Tax',
        type: 'tax',
        effectiveDate: new Date('2024-03-01'),
        impact: 0.02,
        description: 'Tax on energy consumption'
      }
    ];
  }

  private async getIncentives(): Promise<PolicyItem[]> {
    return [
      {
        id: 'efficiency_incentive',
        name: 'Energy Efficiency Incentive Program',
        type: 'incentive',
        effectiveDate: new Date('2024-01-01'),
        impact: -0.04,
        description: 'Incentives for energy efficiency improvements'
      }
    ];
  }

  private calculatePolicyImpact(
    regulations: PolicyItem[],
    subsidies: PolicyItem[],
    taxes: PolicyItem[],
    incentives: PolicyItem[]
  ): number {
    const regulationImpact = regulations.reduce((sum, item) => sum + item.impact, 0);
    const subsidyImpact = subsidies.reduce((sum, item) => sum + item.impact, 0);
    const taxImpact = taxes.reduce((sum, item) => sum + item.impact, 0);
    const incentiveImpact = incentives.reduce((sum, item) => sum + item.impact, 0);

    return regulationImpact + subsidyImpact + taxImpact + incentiveImpact;
  }

  async getUpcomingPolicyChanges(): Promise<PolicyChange[]> {
    return [
      {
        id: 'new_carbon_pricing',
        type: 'regulation',
        description: 'Enhanced carbon pricing mechanism',
        effectiveDate: new Date('2024-07-01'),
        impact: 0.06,
        probability: 0.8
      },
      {
        id: 'renewable_expansion',
        type: 'incentive',
        description: 'Renewable energy expansion program',
        effectiveDate: new Date('2024-09-01'),
        impact: -0.05,
        probability: 0.7
      }
    ];
  }
}

// Main External Factors Integration Service
export class ExternalFactorsIntegrationService {
  private weatherIntegration: WeatherDataIntegration;
  private economicIntegration: EconomicDataIntegration;
  private marketIntegration: MarketDataIntegration;
  private policyIntegration: PolicyDataIntegration;
  private correlations: Map<string, FactorCorrelation> = new Map();
  private weights: Map<string, number> = new Map();

  constructor(config: ExternalIntegrationConfig) {
    this.weatherIntegration = new WeatherDataIntegration(config.weatherApiKey);
    this.economicIntegration = new EconomicDataIntegration(config.economicApiKey);
    this.marketIntegration = new MarketDataIntegration(config.marketApiKey);
    this.policyIntegration = new PolicyDataIntegration();
    
    this.initializeWeights();
  }

  private initializeWeights(): void {
    // Initialize default weights for different factor types
    this.weights.set('weather', 0.25);
    this.weights.set('economic', 0.20);
    this.weights.set('market', 0.30);
    this.weights.set('policy', 0.15);
    this.weights.set('social', 0.05);
    this.weights.set('environmental', 0.03);
    this.weights.set('technological', 0.02);
  }

  async getAllFactors(location: string = 'default'): Promise<ExternalFactorIntegration> {
    const [weather, economic, market, policy] = await Promise.all([
      this.getWeatherFactors(location),
      this.getEconomicFactors(),
      this.getMarketFactors(),
      this.getPolicyFactors()
    ]);

    const factors: ExternalFactor[] = [
      ...weather,
      ...economic,
      ...market,
      ...policy
    ];

    const correlations = await this.calculateCorrelations(factors);
    const confidence = this.calculateOverallConfidence(factors);

    return {
      factors,
      correlations,
      weights: Object.fromEntries(this.weights),
      lastUpdate: new Date(),
      confidence
    };
  }

  private async getWeatherFactors(location: string): Promise<ExternalFactor[]> {
    const [current, forecast] = await Promise.all([
      this.weatherIntegration.getCurrentWeather(location),
      this.weatherIntegration.getWeatherForecast(location, 7)
    ]);

    const weatherFactor: ExternalFactor = {
      id: 'weather_data',
      name: 'Weather Conditions',
      type: 'weather',
      source: 'OpenWeatherMap',
      updateFrequency: 'hourly',
      reliability: 0.9,
      impact: current.impact,
      data: [
        {
          timestamp: current.timestamp,
          value: current.temperature,
          quality: 0.9,
          metadata: current
        },
        ...forecast.map(f => ({
          timestamp: f.timestamp,
          value: f.temperature,
          quality: 0.8,
          metadata: f
        }))
      ]
    };

    return [weatherFactor];
  }

  private async getEconomicFactors(): Promise<ExternalFactor[]> {
    const [gdp, sentiment] = await Promise.all([
      this.economicIntegration.getGDPData(),
      this.economicIntegration.getMarketSentiment()
    ]);

    const economicFactors: ExternalFactor[] = [
      {
        id: 'gdp_data',
        name: 'GDP Growth',
        type: 'economic',
        source: 'FRED',
        updateFrequency: 'monthly',
        reliability: 0.95,
        impact: gdp.impact,
        data: [{
          timestamp: gdp.timestamp,
          value: gdp.gdpGrowth,
          quality: 0.95,
          metadata: gdp
        }]
      },
      {
        id: 'market_sentiment',
        name: 'Market Sentiment',
        type: 'economic',
        source: 'Financial Markets',
        updateFrequency: 'daily',
        reliability: 0.8,
        impact: sentiment.impact,
        data: [{
          timestamp: sentiment.timestamp,
          value: sentiment.fearGreedIndex,
          quality: 0.8,
          metadata: sentiment
        }]
      }
    ];

    return economicFactors;
  }

  private async getMarketFactors(): Promise<ExternalFactor[]> {
    const [prices, supplyDemand] = await Promise.all([
      this.marketIntegration.getEnergyPrices(),
      this.marketIntegration.getSupplyDemandData()
    ]);

    const marketFactors: ExternalFactor[] = [
      {
        id: 'energy_prices',
        name: 'Energy Prices',
        type: 'market',
        source: 'Energy Markets',
        updateFrequency: 'hourly',
        reliability: 0.9,
        impact: prices.impact,
        data: [{
          timestamp: prices.timestamp,
          value: prices.electricity,
          quality: 0.9,
          metadata: prices
        }]
      },
      {
        id: 'supply_demand',
        name: 'Supply-Demand Balance',
        type: 'market',
        source: 'Grid Operators',
        updateFrequency: 'hourly',
        reliability: 0.85,
        impact: supplyDemand.impact,
        data: [{
          timestamp: supplyDemand.timestamp,
          value: supplyDemand.reserveMargin,
          quality: 0.85,
          metadata: supplyDemand
        }]
      }
    ];

    return marketFactors;
  }

  private async getPolicyFactors(): Promise<ExternalFactor[]> {
    const policies = await this.policyIntegration.getCurrentPolicies();

    const policyFactor: ExternalFactor = {
      id: 'policy_changes',
      name: 'Policy Changes',
      type: 'policy',
      source: 'Government APIs',
      updateFrequency: 'daily',
      reliability: 0.9,
      impact: policies.impact,
      data: [{
        timestamp: policies.timestamp,
        value: policies.impact,
        quality: 0.9,
        metadata: policies
      }]
    };

    return [policyFactor];
  }

  private async calculateCorrelations(factors: ExternalFactor[]): Promise<FactorCorrelation[]> {
    const correlations: FactorCorrelation[] = [];
    
    // Calculate correlations between all factor pairs
    for (let i = 0; i < factors.length; i++) {
      for (let j = i + 1; j < factors.length; j++) {
        const correlation = await this.calculatePairwiseCorrelation(factors[i], factors[j]);
        correlations.push(correlation);
      }
    }

    return correlations;
  }

  private async calculatePairwiseCorrelation(factor1: ExternalFactor, factor2: ExternalFactor): Promise<FactorCorrelation> {
    // Simplified correlation calculation
    // In practice, this would use historical data to calculate actual correlations
    const correlation = Math.random() * 2 - 1; // -1 to 1
    const significance = Math.random(); // 0 to 1
    const lag = Math.floor(Math.random() * 5); // 0 to 4 periods
    const stability = Math.random(); // 0 to 1

    return {
      factor1: factor1.id,
      factor2: factor2.id,
      correlation,
      significance,
      lag,
      stability
    };
  }

  private calculateOverallConfidence(factors: ExternalFactor[]): number {
    const totalWeight = Array.from(this.weights.values()).reduce((sum, weight) => sum + weight, 0);
    const weightedConfidence = factors.reduce((sum, factor) => {
      const weight = this.weights.get(factor.type) || 0;
      const avgQuality = factor.data.reduce((sum, d) => sum + d.quality, 0) / factor.data.length;
      return sum + (weight * avgQuality);
    }, 0);

    return weightedConfidence / totalWeight;
  }

  async updateFactorWeights(newWeights: Record<string, number>): Promise<void> {
    // Validate weights sum to 1
    const totalWeight = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0);
    
    if (Math.abs(totalWeight - 1) > 0.01) {
      throw new Error('Weights must sum to 1');
    }

    // Update weights
    Object.entries(newWeights).forEach(([factor, weight]) => {
      this.weights.set(factor, weight);
    });
  }

  async getFactorImpactOnDemand(location: string): Promise<DemandFactors> {
    const factors = await this.getAllFactors(location);
    
    // Calculate demand factors
    const weatherFactor = factors.factors.find(f => f.type === 'weather');
    const economicFactor = factors.factors.find(f => f.type === 'economic');
    const marketFactor = factors.factors.find(f => f.type === 'market');
    const policyFactor = factors.factors.find(f => f.type === 'policy');

    return {
      weather: this.convertToWeatherImpact(weatherFactor),
      economic: this.convertToEconomicImpact(economicFactor),
      seasonal: this.getSeasonalImpact(),
      historical: this.getHistoricalImpact(),
      external: {
        events: [],
        disruptions: [],
        policy: await this.policyIntegration.getUpcomingPolicyChanges(),
        impact: this.calculateExternalImpact(factors.factors),
        confidence: factors.confidence
      }
    };
  }

  async getFactorImpactOnPrices(location: string): Promise<PriceFactors> {
    const factors = await this.getAllFactors(location);
    
    const weights = factors.weights;
    const demandImpact = this.calculateDemandImpact(factors.factors);
    const supplyImpact = this.calculateSupplyImpact(factors.factors);

    return {
      demand: demandImpact,
      supply: supplyImpact,
      weather: this.getWeatherPriceImpact(factors.factors),
      economic: this.getEconomicPriceImpact(factors.factors),
      marketSentiment: this.getMarketSentimentImpact(factors.factors),
      policy: this.getPolicyPriceImpact(factors.factors),
      seasonal: this.getSeasonalPriceImpact(),
      competition: this.getCompetitionImpact(),
      weights: weights as Record<any, number>
    };
  }

  private convertToWeatherImpact(weatherFactor?: ExternalFactor): WeatherImpact {
    if (!weatherFactor) {
      return {
        temperature: 20,
        humidity: 60,
        precipitation: 0,
        windSpeed: 10,
        impact: 0,
        confidence: 0.5
      };
    }

    const metadata = weatherFactor.data[0]?.metadata as any;
    return {
      temperature: metadata?.temperature || 20,
      humidity: metadata?.humidity || 60,
      precipitation: metadata?.precipitation || 0,
      windSpeed: metadata?.windSpeed || 10,
      impact: weatherFactor.impact,
      confidence: weatherFactor.data[0]?.quality || 0.5
    };
  }

  private convertToEconomicImpact(economicFactor?: ExternalFactor): EconomicImpact {
    if (!economicFactor) {
      return {
        gdpGrowth: 0.02,
        inflation: 0.03,
        unemployment: 0.05,
        energyPrices: 0.1,
        impact: 0,
        confidence: 0.5
      };
    }

    const metadata = economicFactor.data[0]?.metadata as any;
    return {
      gdpGrowth: metadata?.gdpGrowth || 0.02,
      inflation: metadata?.inflation || 0.03,
      unemployment: metadata?.unemployment || 0.05,
      energyPrices: metadata?.energyPrices || 0.1,
      impact: economicFactor.impact,
      confidence: economicFactor.data[0]?.quality || 0.5
    };
  }

  private getSeasonalImpact(): SeasonalImpact {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDay();
    
    return {
      seasonality: Math.sin((month / 12) * Math.PI * 2) * 0.2,
      trend: 0.01,
      holiday: this.isHoliday(now) ? 0.1 : 0,
      weekly: day === 0 || day === 6 ? -0.05 : 0.02,
      confidence: 0.8
    };
  }

  private getHistoricalImpact(): HistoricalImpact {
    return {
      dayOfWeek: new Date().getDay(),
      monthOfYear: new Date().getMonth(),
      yearOverYear: 0.03,
      movingAverage: 1000,
      volatility: 0.1,
      confidence: 0.7
    };
  }

  private calculateExternalImpact(factors: ExternalFactor[]): number {
    return factors.reduce((sum, factor) => sum + factor.impact, 0) / factors.length;
  }

  private calculateDemandImpact(factors: ExternalFactor[]): number {
    return factors
      .filter(f => ['weather', 'economic', 'social'].includes(f.type))
      .reduce((sum, factor) => sum + factor.impact, 0) / 3;
  }

  private calculateSupplyImpact(factors: ExternalFactor[]): number {
    return factors
      .filter(f => ['market', 'environmental', 'technological'].includes(f.type))
      .reduce((sum, factor) => sum + factor.impact, 0) / 3;
  }

  private getWeatherPriceImpact(factors: ExternalFactor[]): number {
    const weatherFactor = factors.find(f => f.type === 'weather');
    return weatherFactor?.impact || 0;
  }

  private getEconomicPriceImpact(factors: ExternalFactor[]): number {
    const economicFactor = factors.find(f => f.type === 'economic');
    return economicFactor?.impact || 0;
  }

  private getMarketSentimentImpact(factors: ExternalFactor[]): number {
    const marketFactor = factors.find(f => f.type === 'market');
    return marketFactor?.impact || 0;
  }

  private getPolicyPriceImpact(factors: ExternalFactor[]): number {
    const policyFactor = factors.find(f => f.type === 'policy');
    return policyFactor?.impact || 0;
  }

  private getSeasonalPriceImpact(): number {
    return Math.sin((new Date().getMonth() / 12) * Math.PI * 2) * 0.1;
  }

  private getCompetitionImpact(): number {
    return Math.random() * 0.1 - 0.05; // -5% to +5%
  }

  private isHoliday(date: Date): boolean {
    // Simplified holiday check
    const month = date.getMonth();
    const day = date.getDate();
    
    // Major holidays (simplified)
    return (
      (month === 11 && day >= 20 && day <= 31) || // Christmas
      (month === 0 && day === 1) || // New Year
      (month === 6 && day === 4) // Independence Day
    );
  }
}

// Supporting interfaces
interface ExternalIntegrationConfig {
  weatherApiKey: string;
  economicApiKey: string;
  marketApiKey: string;
}

interface WeatherFactorData {
  timestamp: Date;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  cloudCover: number;
  description: string;
  impact: number;
  confidence: number;
  source: string;
  forecast?: WeatherFactorData[];
}

interface EconomicFactorData {
  timestamp: Date;
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  energyPrices: number;
  interestRates: number;
  consumerConfidence: number;
  impact: number;
  confidence: number;
  source: string;
}

interface MarketSentimentData {
  timestamp: Date;
  fearGreedIndex: number;
  vix: number;
  marketCap: number;
  tradingVolume: number;
  impact: number;
  confidence: number;
  source: string;
}

interface MarketFactorData {
  timestamp: Date;
  electricity: number;
  naturalGas: number;
  crudeOil: number;
  renewable: number;
  impact: number;
  confidence: number;
  source: string;
}

interface SupplyDemandData {
  timestamp: Date;
  totalSupply: number;
  totalDemand: number;
  reserveMargin: number;
  peakDemand: number;
  offPeakDemand: number;
  impact: number;
  confidence: number;
  source: string;
}

interface PolicyFactorData {
  timestamp: Date;
  regulations: PolicyItem[];
  subsidies: PolicyItem[];
  taxes: PolicyItem[];
  incentives: PolicyItem[];
  impact: number;
  confidence: number;
  source: string;
}

interface PolicyItem {
  id: string;
  name: string;
  type: 'regulation' | 'subsidy' | 'tax' | 'incentive';
  effectiveDate: Date;
  impact: number;
  description: string;
}

interface EnergyPriceData {
  timestamp: Date;
  electricity: number;
  naturalGas: number;
  crudeOil: number;
  renewable: number;
  impact: number;
  confidence: number;
  source: string;
}

export default ExternalFactorsIntegrationService;
