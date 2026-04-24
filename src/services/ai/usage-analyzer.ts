export interface UsagePattern {
  deviceId: string;
  deviceName: string;
  hourlyConsumption: Record<string, number>;
  dailyConsumption: Record<string, number>;
  monthlyConsumption: Record<string, number>;
  peakHours: string[];
  averageConsumption: number;
  efficiency: number;
}

export interface AnomalyDetection {
  deviceId: string;
  anomalyType: 'spike' | 'drop' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: Date;
  suggestedAction: string;
}

export interface OptimizationOpportunity {
  deviceId: string;
  opportunity: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
  description: string;
}

export interface ForecastData {
  deviceId: string;
  forecast: Array<{
    date: string;
    predictedConsumption: number;
    confidence: number;
  }>;
  accuracy: number;
}

class UsageAnalyzer {
  private initialized = false;
  private usageData: Map<string, UsagePattern> = new Map();
  private historicalData: Map<string, Array<{ timestamp: Date; consumption: number }>> = new Map();

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize with mock data
    await this.generateMockData();
    this.initialized = true;
  }

  private async generateMockData(): Promise<void> {
    const devices = [
      'hvac-001',
      'water-heater-001',
      'lighting-001',
      'kitchen-001',
      'entertainment-001'
    ];

    for (const deviceId of devices) {
      const hourlyConsumption: Record<string, number> = {};
      const dailyConsumption: Record<string, number> = {};
      const monthlyConsumption: Record<string, number> = {};

      // Generate hourly data (24 hours)
      for (let hour = 0; hour < 24; hour++) {
        hourlyConsumption[hour.toString()] = Math.random() * 2 + 0.5;
      }

      // Generate daily data (30 days)
      for (let day = 1; day <= 30; day++) {
        dailyConsumption[day.toString()] = Math.random() * 10 + 5;
      }

      // Generate monthly data (12 months)
      for (let month = 1; month <= 12; month++) {
        monthlyConsumption[month.toString()] = Math.random() * 100 + 50;
      }

      const usagePattern: UsagePattern = {
        deviceId,
        deviceName: this.getDeviceName(deviceId),
        hourlyConsumption,
        dailyConsumption,
        monthlyConsumption,
        peakHours: this.calculatePeakHours(hourlyConsumption),
        averageConsumption: this.calculateAverageConsumption(hourlyConsumption),
        efficiency: Math.random() * 30 + 70 // 70-100%
      };

      this.usageData.set(deviceId, usagePattern);

      // Generate historical data for anomaly detection
      const historicalPoints = [];
      for (let i = 0; i < 100; i++) {
        historicalPoints.push({
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          consumption: Math.random() * 5 + 1
        });
      }
      this.historicalData.set(deviceId, historicalPoints);
    }
  }

  private getDeviceName(deviceId: string): string {
    const names: Record<string, string> = {
      'hvac-001': 'HVAC System',
      'water-heater-001': 'Water Heater',
      'lighting-001': 'Lighting System',
      'kitchen-001': 'Kitchen Appliances',
      'entertainment-001': 'Entertainment System'
    };
    return names[deviceId] || 'Unknown Device';
  }

  private calculatePeakHours(hourlyConsumption: Record<string, number>): string[] {
    const entries = Object.entries(hourlyConsumption);
    const threshold = this.calculateAverageConsumption(hourlyConsumption) * 1.5;
    
    return entries
      .filter(([_, consumption]) => consumption > threshold)
      .map(([hour, _]) => `${hour.padStart(2, '0')}:00`);
  }

  private calculateAverageConsumption(hourlyConsumption: Record<string, number>): number {
    const values = Object.values(hourlyConsumption);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  async analyzeUsagePatterns(deviceId?: string): Promise<UsagePattern[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (deviceId) {
      const pattern = this.usageData.get(deviceId);
      return pattern ? [pattern] : [];
    }

    return Array.from(this.usageData.values());
  }

  async detectAnomalies(deviceId?: string): Promise<AnomalyDetection[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const anomalies: AnomalyDetection[] = [];
    const devicesToCheck = deviceId ? [deviceId] : Array.from(this.usageData.keys());

    for (const id of devicesToCheck) {
      const historicalData = this.historicalData.get(id);
      if (!historicalData || historicalData.length < 10) continue;

      const recentData = historicalData.slice(0, 10);
      const olderData = historicalData.slice(10, 30);
      
      const recentAvg = recentData.reduce((sum, point) => sum + point.consumption, 0) / recentData.length;
      const olderAvg = olderData.reduce((sum, point) => sum + point.consumption, 0) / olderData.length;

      const deviation = Math.abs(recentAvg - olderAvg) / olderAvg;

      if (deviation > 0.3) {
        anomalies.push({
          deviceId: id,
          anomalyType: recentAvg > olderAvg ? 'spike' : 'drop',
          severity: deviation > 0.5 ? 'high' : deviation > 0.3 ? 'medium' : 'low',
          description: `Unusual ${recentAvg > olderAvg ? 'increase' : 'decrease'} in energy consumption detected`,
          timestamp: new Date(),
          suggestedAction: this.getSuggestedAction(recentAvg > olderAvg ? 'spike' : 'drop', id)
        });
      }
    }

    return anomalies;
  }

  private getSuggestedAction(anomalyType: string, deviceId: string): string {
    const actions: Record<string, Record<string, string>> = {
      'spike': {
        'hvac-001': 'Check thermostat settings and replace air filters',
        'water-heater-001': 'Inspect for leaks and check temperature settings',
        'lighting-001': 'Check for lights left on and consider motion sensors',
        'default': 'Review recent usage patterns and check for malfunctioning equipment'
      },
      'drop': {
        'default': 'Verify meter readings and check for equipment malfunction'
      }
    };

    return actions[anomalyType]?.[deviceId] || actions[anomalyType]?.['default'] || 'Schedule professional inspection';
  }

  async identifyOptimizationOpportunities(deviceId?: string): Promise<OptimizationOpportunity[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const opportunities: OptimizationOpportunity[] = [];
    const devicesToAnalyze = deviceId ? [deviceId] : Array.from(this.usageData.keys());

    for (const id of devicesToAnalyze) {
      const pattern = this.usageData.get(id);
      if (!pattern) continue;

      // Check for peak hour optimization
      if (pattern.peakHours.length > 2) {
        opportunities.push({
          deviceId: id,
          opportunity: 'Peak Hour Optimization',
          potentialSavings: pattern.averageConsumption * 0.15,
          difficulty: 'medium',
          timeframe: '1-2 weeks',
          description: 'Shift usage away from peak hours to reduce costs and grid strain'
        });
      }

      // Check for efficiency improvements
      if (pattern.efficiency < 80) {
        opportunities.push({
          deviceId: id,
          opportunity: 'Efficiency Upgrade',
          potentialSavings: pattern.averageConsumption * (100 - pattern.efficiency) / 100,
          difficulty: 'hard',
          timeframe: '1-3 months',
          description: 'Upgrade to more efficient equipment or improve maintenance'
        });
      }

      // Check for scheduling optimization
      if (pattern.averageConsumption > 2) {
        opportunities.push({
          deviceId: id,
          opportunity: 'Smart Scheduling',
          potentialSavings: pattern.averageConsumption * 0.1,
          difficulty: 'easy',
          timeframe: 'Immediate',
          description: 'Implement smart scheduling to optimize usage patterns'
        });
      }
    }

    return opportunities;
  }

  async forecastUsage(deviceId: string, days: number = 30): Promise<ForecastData> {
    if (!this.initialized) {
      await this.initialize();
    }

    const pattern = this.usageData.get(deviceId);
    if (!pattern) {
      throw new Error(`Device ${deviceId} not found`);
    }

    const forecast = [];
    const baseConsumption = pattern.averageConsumption;

    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const seasonalFactor = this.getSeasonalFactor(date);
      const randomVariation = 0.9 + Math.random() * 0.2; // ±10% variation
      
      const predictedConsumption = baseConsumption * seasonalFactor * randomVariation;
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predictedConsumption,
        confidence: Math.max(0.7, 0.95 - (i * 0.01)) // Decreasing confidence over time
      });
    }

    return {
      deviceId,
      forecast,
      accuracy: 0.85 // Mock accuracy
    };
  }

  private getSeasonalFactor(date: Date): number {
    const month = date.getMonth();
    // Simple seasonal factors (higher in winter and summer for HVAC)
    const seasonalFactors = [1.2, 1.1, 0.9, 0.8, 0.8, 0.9, 1.0, 1.0, 0.9, 0.9, 1.1, 1.2];
    return seasonalFactors[month];
  }

  async getUsageInsights(deviceId?: string): Promise<{
    totalConsumption: number;
    peakUsage: number;
    efficiencyScore: number;
    optimizationPotential: number;
    recommendations: string[];
  }> {
    if (!this.initialized) {
      await this.initialize();
    }

    const devicesToAnalyze = deviceId ? [deviceId] : Array.from(this.usageData.keys());
    let totalConsumption = 0;
    let peakUsage = 0;
    let totalEfficiency = 0;
    let deviceCount = 0;

    for (const id of devicesToAnalyze) {
      const pattern = this.usageData.get(id);
      if (!pattern) continue;

      totalConsumption += pattern.averageConsumption * 24; // Daily total
      peakUsage = Math.max(peakUsage, ...Object.values(pattern.hourlyConsumption));
      totalEfficiency += pattern.efficiency;
      deviceCount++;
    }

    const avgEfficiency = deviceCount > 0 ? totalEfficiency / deviceCount : 0;
    const optimizationPotential = (100 - avgEfficiency) / 100 * totalConsumption;

    const recommendations = this.generateInsightRecommendations(avgEfficiency, peakUsage, optimizationPotential);

    return {
      totalConsumption,
      peakUsage,
      efficiencyScore: avgEfficiency,
      optimizationPotential,
      recommendations
    };
  }

  private generateInsightRecommendations(efficiency: number, peakUsage: number, potential: number): string[] {
    const recommendations: string[] = [];

    if (efficiency < 75) {
      recommendations.push('Consider upgrading to more efficient equipment');
    }

    if (peakUsage > 5) {
      recommendations.push('Implement peak hour optimization strategies');
    }

    if (potential > 10) {
      recommendations.push('Significant savings potential through optimization');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your energy usage is well optimized');
    }

    return recommendations;
  }
}

// Singleton instance
let usageAnalyzerInstance: UsageAnalyzer | null = null;

export const getUsageAnalyzer = (): UsageAnalyzer => {
  if (!usageAnalyzerInstance) {
    usageAnalyzerInstance = new UsageAnalyzer();
  }
  return usageAnalyzerInstance;
};

export { UsageAnalyzer };
