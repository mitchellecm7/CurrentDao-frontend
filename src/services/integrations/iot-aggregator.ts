// IoT Aggregator Service
// Aggregates data from multiple IoT devices and provides unified analytics

export interface IoTDeviceReading {
  deviceId: string;
  deviceType: string;
  category: string;
  timestamp: Date;
  value: number;
  unit: string;
  quality: 'good' | 'fair' | 'poor';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  metadata?: Record<string, any>;
}

export interface AggregatedData {
  timestamp: Date;
  category: string;
  deviceCount: number;
  readings: {
    count: number;
    average: number;
    min: number;
    max: number;
    standardDeviation: number;
    unit: string;
  };
  trends: {
    hourly: Array<{ time: Date; value: number }>;
    daily: Array<{ time: Date; value: number }>;
    weekly: Array<{ time: Date; value: number }>;
  };
  alerts: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    affectedDevices: string[];
  }>;
}

export interface EnergyAggregation {
  timestamp: Date;
  totalConsumption: number; // kWh
  totalGeneration: number; // kWh
  netEnergy: number; // kWh
  cost: number; // currency
  carbonFootprint: number; // kg CO2
  efficiency: number; // percentage
  breakdown: {
    lighting: number;
    hvac: number;
    appliances: number;
    electronics: number;
    other: number;
  };
  renewablePercentage: number;
  demandResponse: {
    active: boolean;
    potentialSavings: number; // kWh
    participatingDevices: string[];
  };
}

export interface PredictiveAnalytics {
  timestamp: Date;
  predictions: {
    consumption: Array<{
      time: Date;
      value: number;
      confidence: number; // 0-1
    }>;
    generation: Array<{
      time: Date;
      value: number;
      confidence: number; // 0-1
    }>;
    cost: Array<{
      time: Date;
      value: number;
      confidence: number; // 0-1
    }>;
  };
  recommendations: Array<{
    type: 'energy_saving' | 'maintenance' | 'optimization';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    potentialSavings: number; // kWh or currency
    affectedDevices: string[];
    implementationCost?: number;
  }>;
}

export interface AggregationConfig {
  aggregationInterval: number; // minutes
  retentionPeriod: number; // days
  enablePredictions: boolean;
  enableAlerts: boolean;
  alertThresholds: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    energy: { maxConsumption: number };
    device: { maxOfflineTime: number }; // minutes
  };
  dataSources: string[]; // device IDs or categories
}

class IoTAggregatorService {
  private readings: Map<string, IoTDeviceReading[]> = new Map();
  private aggregatedData: Map<string, AggregatedData[]> = new Map();
  private energyData: EnergyAggregation[] = [];
  private config: AggregationConfig;
  private aggregationTimer?: NodeJS.Timeout;

  constructor(config: Partial<AggregationConfig> = {}) {
    this.config = {
      aggregationInterval: 15, // 15 minutes
      retentionPeriod: 30, // 30 days
      enablePredictions: true,
      enableAlerts: true,
      alertThresholds: {
        temperature: { min: -10, max: 50 },
        humidity: { min: 10, max: 90 },
        energy: { maxConsumption: 1000 }, // kWh
        device: { maxOfflineTime: 60 }, // minutes
      },
      dataSources: [],
      ...config,
    };

    this.loadData();
    this.startAggregation();
  }

  // Data Ingestion
  addReading(reading: IoTDeviceReading): void {
    const key = `${reading.deviceType}-${reading.category}`;
    const existingReadings = this.readings.get(key) || [];
    
    // Add new reading
    existingReadings.push(reading);
    
    // Keep only readings within retention period
    const cutoffTime = new Date(Date.now() - this.config.retentionPeriod * 24 * 60 * 60 * 1000);
    const filteredReadings = existingReadings.filter(r => r.timestamp > cutoffTime);
    
    this.readings.set(key, filteredReadings);
    
    // Trigger immediate aggregation if needed
    if (this.config.enableAlerts) {
      this.checkAlerts(reading);
    }
  }

  addReadingsBatch(readings: IoTDeviceReading[]): void {
    readings.forEach(reading => this.addReading(reading));
  }

  // Data Retrieval
  getReadings(
    deviceType?: string,
    category?: string,
    startTime?: Date,
    endTime?: Date
  ): IoTDeviceReading[] {
    let allReadings: IoTDeviceReading[] = [];

    if (deviceType && category) {
      const key = `${deviceType}-${category}`;
      allReadings = this.readings.get(key) || [];
    } else {
      // Get all readings
      for (const readings of this.readings.values()) {
        allReadings.push(...readings);
      }
    }

    // Filter by time range
    if (startTime || endTime) {
      allReadings = allReadings.filter(reading => {
        if (startTime && reading.timestamp < startTime) return false;
        if (endTime && reading.timestamp > endTime) return false;
        return true;
      });
    }

    return allReadings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getAggregatedData(
    category: string,
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): AggregatedData[] {
    const data = this.aggregatedData.get(category) || [];
    
    // Filter based on time range
    const now = new Date();
    let cutoffTime: Date;

    switch (timeRange) {
      case 'hour':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return data.filter(d => d.timestamp > cutoffTime);
  }

  getEnergyAggregation(timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'): EnergyAggregation[] {
    const now = new Date();
    let cutoffTime: Date;

    switch (timeRange) {
      case 'hour':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return this.energyData.filter(d => d.timestamp > cutoffTime);
  }

  // Aggregation Logic
  private performAggregation(): void {
    const now = new Date();

    // Aggregate readings by category
    for (const [key, readings] of this.readings.entries()) {
      const category = key.split('-')[1];
      const recentReadings = readings.filter(r => 
        r.timestamp > new Date(now.getTime() - this.config.aggregationInterval * 60 * 1000)
      );

      if (recentReadings.length === 0) continue;

      const aggregatedData = this.calculateAggregation(category, recentReadings, now);
      
      // Store aggregated data
      const existingData = this.aggregatedData.get(category) || [];
      existingData.push(aggregatedData);
      
      // Keep only within retention period
      const cutoffTime = new Date(now.getTime() - this.config.retentionPeriod * 24 * 60 * 60 * 1000);
      const filteredData = existingData.filter(d => d.timestamp > cutoffTime);
      
      this.aggregatedData.set(category, filteredData);
    }

    // Aggregate energy data
    this.aggregateEnergyData(now);

    // Save data
    this.saveData();
  }

  private calculateAggregation(
    category: string,
    readings: IoTDeviceReading[],
    timestamp: Date
  ): AggregatedData {
    const values = readings.map(r => r.value);
    const deviceIds = [...new Set(readings.map(r => r.deviceId))];
    
    // Calculate statistics
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    // Calculate trends
    const trends = this.calculateTrends(readings);

    // Generate alerts
    const alerts = this.generateAlerts(category, readings);

    return {
      timestamp,
      category,
      deviceCount: deviceIds.length,
      readings: {
        count: readings.length,
        average,
        min,
        max,
        standardDeviation,
        unit: readings[0]?.unit || 'unknown',
      },
      trends,
      alerts,
    };
  }

  private calculateTrends(readings: IoTDeviceReading[]): AggregatedData['trends'] {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Group readings by time intervals
    const hourlyData = this.groupReadingsByInterval(readings, oneHourAgo, now, 60 * 60 * 1000);
    const dailyData = this.groupReadingsByInterval(readings, oneDayAgo, now, 24 * 60 * 60 * 1000);
    const weeklyData = this.groupReadingsByInterval(readings, oneWeekAgo, now, 7 * 24 * 60 * 60 * 1000);

    return {
      hourly: hourlyData,
      daily: dailyData,
      weekly: weeklyData,
    };
  }

  private groupReadingsByInterval(
    readings: IoTDeviceReading[],
    startTime: Date,
    endTime: Date,
    intervalMs: number
  ): Array<{ time: Date; value: number }> {
    const grouped: Map<number, number[]> = new Map();

    readings.forEach(reading => {
      if (reading.timestamp < startTime || reading.timestamp > endTime) return;
      
      const intervalStart = Math.floor(reading.timestamp.getTime() / intervalMs) * intervalMs;
      const existing = grouped.get(intervalStart) || [];
      existing.push(reading.value);
      grouped.set(intervalStart, existing);
    });

    return Array.from(grouped.entries()).map(([timestamp, values]) => ({
      time: new Date(timestamp),
      value: values.reduce((sum, val) => sum + val, 0) / values.length,
    })).sort((a, b) => a.time.getTime() - b.time.getTime());
  }

  private generateAlerts(
    category: string,
    readings: IoTDeviceReading[]
  ): AggregatedData['alerts'] {
    const alerts: AggregatedData['alerts'] = [];

    if (!this.config.enableAlerts) return alerts;

    const latestReadings = readings.slice(-10); // Last 10 readings
    const deviceIds = [...new Set(latestReadings.map(r => r.deviceId))];

    // Temperature alerts
    if (category === 'environmental') {
      const tempReadings = latestReadings.filter(r => r.unit === '°C' || r.unit === '°F');
      if (tempReadings.length > 0) {
        const avgTemp = tempReadings.reduce((sum, r) => sum + r.value, 0) / tempReadings.length;
        
        if (avgTemp > this.config.alertThresholds.temperature.max) {
          alerts.push({
            severity: 'high',
            message: `High temperature detected: ${avgTemp.toFixed(1)}°C`,
            affectedDevices: deviceIds,
          });
        } else if (avgTemp < this.config.alertThresholds.temperature.min) {
          alerts.push({
            severity: 'medium',
            message: `Low temperature detected: ${avgTemp.toFixed(1)}°C`,
            affectedDevices: deviceIds,
          });
        }
      }
    }

    // Energy consumption alerts
    if (category === 'energy') {
      const totalConsumption = readings.reduce((sum, r) => sum + r.value, 0);
      if (totalConsumption > this.config.alertThresholds.energy.maxConsumption) {
        alerts.push({
          severity: 'high',
          message: `High energy consumption: ${totalConsumption.toFixed(1)} kWh`,
          affectedDevices: deviceIds,
        });
      }
    }

    return alerts;
  }

  private aggregateEnergyData(timestamp: Date): void {
    const energyReadings = this.getReadings(undefined, 'energy');
    
    if (energyReadings.length === 0) return;

    // Calculate energy metrics
    const totalConsumption = energyReadings
      .filter(r => r.value > 0) // Consumption is positive
      .reduce((sum, r) => sum + r.value, 0);

    const totalGeneration = Math.abs(
      energyReadings
        .filter(r => r.value < 0) // Generation is negative
        .reduce((sum, r) => sum + r.value, 0)
    );

    const netEnergy = totalConsumption - totalGeneration;
    
    // Mock cost calculation (should be based on actual rates)
    const cost = totalConsumption * 0.15; // $0.15 per kWh
    
    // Mock carbon footprint calculation
    const carbonFootprint = totalConsumption * 0.4; // 0.4 kg CO2 per kWh

    // Calculate efficiency
    const efficiency = totalGeneration > 0 ? (totalGeneration / totalConsumption) * 100 : 0;

    // Mock breakdown
    const breakdown = {
      lighting: totalConsumption * 0.2,
      hvac: totalConsumption * 0.4,
      appliances: totalConsumption * 0.25,
      electronics: totalConsumption * 0.1,
      other: totalConsumption * 0.05,
    };

    const renewablePercentage = totalGeneration > 0 ? (totalGeneration / (totalConsumption + totalGeneration)) * 100 : 0;

    // Mock demand response
    const demandResponse = {
      active: netEnergy > this.config.alertThresholds.energy.maxConsumption * 0.8,
      potentialSavings: Math.max(0, netEnergy - this.config.alertThresholds.energy.maxConsumption * 0.7),
      participatingDevices: [...new Set(energyReadings.map(r => r.deviceId))],
    };

    const energyData: EnergyAggregation = {
      timestamp,
      totalConsumption,
      totalGeneration,
      netEnergy,
      cost,
      carbonFootprint,
      efficiency,
      breakdown,
      renewablePercentage,
      demandResponse,
    };

    this.energyData.push(energyData);

    // Keep only within retention period
    const cutoffTime = new Date(timestamp.getTime() - this.config.retentionPeriod * 24 * 60 * 60 * 1000);
    this.energyData = this.energyData.filter(d => d.timestamp > cutoffTime);
  }

  // Predictive Analytics
  generatePredictions(timeHorizon: 'hour' | 'day' | 'week' = 'day'): PredictiveAnalytics {
    const now = new Date();
    let historicalData: AggregatedData[] = [];
    let predictionPoints = 24;
    let timeStep = 60 * 60 * 1000; // 1 hour

    switch (timeHorizon) {
      case 'hour':
        predictionPoints = 60;
        timeStep = 60 * 1000; // 1 minute
        // Get last day of data
        for (const data of this.aggregatedData.values()) {
          historicalData.push(...data.filter(d => d.timestamp > new Date(now.getTime() - 24 * 60 * 60 * 1000)));
        }
        break;
      case 'day':
        predictionPoints = 24;
        timeStep = 60 * 60 * 1000; // 1 hour
        // Get last week of data
        for (const data of this.aggregatedData.values()) {
          historicalData.push(...data.filter(d => d.timestamp > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)));
        }
        break;
      case 'week':
        predictionPoints = 7 * 24;
        timeStep = 60 * 60 * 1000; // 1 hour
        // Get last month of data
        for (const data of this.aggregatedData.values()) {
          historicalData.push(...data.filter(d => d.timestamp > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)));
        }
        break;
    }

    // Simple linear regression for predictions (in production, use more sophisticated models)
    const consumptionPrediction = this.generateLinearPrediction(
      historicalData.map(d => ({ time: d.timestamp, value: d.readings.average })),
      predictionPoints,
      timeStep
    );

    const generationPrediction = this.generateLinearPrediction(
      historicalData.map(d => ({ time: d.timestamp, value: d.readings.average * 0.3 })), // Mock generation
      predictionPoints,
      timeStep
    );

    const costPrediction = consumptionPrediction.map(p => ({
      time: p.time,
      value: p.value * 0.15, // $0.15 per kWh
      confidence: p.confidence,
    }));

    // Generate recommendations
    const recommendations = this.generateRecommendations(historicalData);

    return {
      timestamp: now,
      predictions: {
        consumption: consumptionPrediction,
        generation: generationPrediction,
        cost: costPrediction,
      },
      recommendations,
    };
  }

  private generateLinearPrediction(
    data: Array<{ time: Date; value: number }>,
    points: number,
    timeStep: number
  ): Array<{ time: Date; value: number; confidence: number }> {
    if (data.length < 2) {
      return Array.from({ length: points }, (_, i) => ({
        time: new Date(Date.now() + i * timeStep),
        value: 0,
        confidence: 0,
      }));
    }

    // Simple linear regression
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.value);
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate predictions
    const predictions = [];
    const lastTime = data[data.length - 1].time.getTime();
    
    for (let i = 1; i <= points; i++) {
      const predictedValue = slope * (n + i - 1) + intercept;
      const confidence = Math.max(0.1, 1 - (i / points) * 0.5); // Decreasing confidence
      
      predictions.push({
        time: new Date(lastTime + i * timeStep),
        value: Math.max(0, predictedValue), // Ensure non-negative
        confidence,
      });
    }

    return predictions;
  }

  private generateRecommendations(historicalData: AggregatedData[]): PredictiveAnalytics['recommendations'] {
    const recommendations: PredictiveAnalytics['recommendations'] = [];

    // Energy saving recommendations
    const energyData = historicalData.filter(d => d.category === 'energy');
    if (energyData.length > 0) {
      const avgConsumption = energyData.reduce((sum, d) => sum + d.readings.average, 0) / energyData.length;
      
      if (avgConsumption > 100) {
        recommendations.push({
          type: 'energy_saving',
          priority: 'high',
          title: 'Reduce Energy Consumption',
          description: `Average consumption of ${avgConsumption.toFixed(1)} kWh is above optimal levels`,
          potentialSavings: avgConsumption * 0.2, // 20% savings potential
          affectedDevices: [],
        });
      }
    }

    // Maintenance recommendations
    const environmentalData = historicalData.filter(d => d.category === 'environmental');
    if (environmentalData.length > 0) {
      const alertsCount = environmentalData.reduce((sum, d) => sum + d.alerts.length, 0);
      
      if (alertsCount > 5) {
        recommendations.push({
          type: 'maintenance',
          priority: 'medium',
          title: 'Schedule Device Maintenance',
          description: `${alertsCount} alerts detected in environmental sensors`,
          potentialSavings: 50, // Estimated cost savings
          affectedDevices: [],
        });
      }
    }

    return recommendations;
  }

  // Alert Checking
  private checkAlerts(reading: IoTDeviceReading): void {
    // Temperature alerts
    if (reading.unit === '°C' || reading.unit === '°F') {
      const tempC = reading.unit === '°F' ? (reading.value - 32) * 5/9 : reading.value;
      
      if (tempC > this.config.alertThresholds.temperature.max) {
        console.warn(`High temperature alert: ${tempC.toFixed(1)}°C from device ${reading.deviceId}`);
      } else if (tempC < this.config.alertThresholds.temperature.min) {
        console.warn(`Low temperature alert: ${tempC.toFixed(1)}°C from device ${reading.deviceId}`);
      }
    }

    // Energy consumption alerts
    if (reading.category === 'energy' && reading.value > this.config.alertThresholds.energy.maxConsumption) {
      console.warn(`High energy consumption alert: ${reading.value} kWh from device ${reading.deviceId}`);
    }
  }

  // Configuration Management
  updateConfig(newConfig: Partial<AggregationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart aggregation with new config
    if (this.aggregationTimer) {
      clearInterval(this.aggregationTimer);
    }
    this.startAggregation();
  }

  getConfig(): AggregationConfig {
    return { ...this.config };
  }

  // Data Persistence
  private saveData(): void {
    try {
      const data = {
        readings: Array.from(this.readings.entries()),
        aggregatedData: Array.from(this.aggregatedData.entries()),
        energyData: this.energyData,
        config: this.config,
      };
      
      // In a real implementation, this would save to a database
      localStorage.setItem('iotAggregatorData', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save IoT aggregator data:', error);
    }
  }

  private loadData(): void {
    try {
      const savedData = localStorage.getItem('iotAggregatorData');
      if (savedData) {
        const data = JSON.parse(savedData);
        
        // Restore readings
        if (data.readings) {
          this.readings = new Map(
            data.readings.map(([key, readings]: [string, any[]]) => [
              key,
              readings.map(r => ({
                ...r,
                timestamp: new Date(r.timestamp),
              }))
            ])
          );
        }

        // Restore aggregated data
        if (data.aggregatedData) {
          this.aggregatedData = new Map(
            data.aggregatedData.map(([key, data]: [string, any[]]) => [
              key,
              data.map(d => ({
                ...d,
                timestamp: new Date(d.timestamp),
                trends: {
                  hourly: d.trends.hourly.map((t: any) => ({
                    ...t,
                    time: new Date(t.time),
                  })),
                  daily: d.trends.daily.map((t: any) => ({
                    ...t,
                    time: new Date(t.time),
                  })),
                  weekly: d.trends.weekly.map((t: any) => ({
                    ...t,
                    time: new Date(t.time),
                  })),
                },
              }))
            ])
          );
        }

        // Restore energy data
        if (data.energyData) {
          this.energyData = data.energyData.map((d: any) => ({
            ...d,
            timestamp: new Date(d.timestamp),
          }));
        }

        // Update config
        if (data.config) {
          this.config = { ...this.config, ...data.config };
        }
      }
    } catch (error) {
      console.error('Failed to load IoT aggregator data:', error);
    }
  }

  // Aggregation Timer
  private startAggregation(): void {
    this.aggregationTimer = setInterval(() => {
      this.performAggregation();
    }, this.config.aggregationInterval * 60 * 1000);
  }

  // Cleanup
  destroy(): void {
    if (this.aggregationTimer) {
      clearInterval(this.aggregationTimer);
    }
    this.saveData();
  }
}

// Singleton instance
export const iotAggregatorService = new IoTAggregatorService();

export default iotAggregatorService;
