export interface Recommendation {
  id: string;
  type: 'optimization' | 'maintenance' | 'behavioral';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  implemented: boolean;
  priority: number;
  category: string;
}

export interface UserProfile {
  id: string;
  preferences: {
    budget: 'low' | 'medium' | 'high';
    difficulty: 'easy' | 'medium' | 'hard';
    interests: string[];
  };
  usagePatterns: {
    peakHours: string[];
    seasonalVariations: number;
    deviceUsage: Record<string, number>;
  };
}

export interface DeviceData {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  consumption: number;
  efficiency: number;
  age: number;
  maintenanceHistory: Array<{
    date: Date;
    type: string;
    cost: number;
  }>;
}

class RecommendationEngine {
  private initialized = false;
  private userProfile: UserProfile | null = null;
  private deviceData: DeviceData[] = [];

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize with mock data
    this.userProfile = {
      id: 'user-001',
      preferences: {
        budget: 'medium',
        difficulty: 'easy',
        interests: ['cost-savings', 'environmental-impact']
      },
      usagePatterns: {
        peakHours: ['16:00', '20:00', '23:00'],
        seasonalVariations: 0.25,
        deviceUsage: {
          'hvac': 45,
          'water-heater': 22,
          'lighting': 15,
          'kitchen': 12,
          'entertainment': 6
        }
      }
    };

    this.deviceData = [
      {
        deviceId: 'hvac-001',
        deviceName: 'HVAC System',
        deviceType: 'hvac',
        consumption: 4.2,
        efficiency: 72,
        age: 8,
        maintenanceHistory: [
          { date: new Date('2023-01-15'), type: 'filter-replacement', cost: 45 },
          { date: new Date('2023-06-20'), type: 'annual-service', cost: 150 }
        ]
      },
      {
        deviceId: 'wh-001',
        deviceName: 'Water Heater',
        deviceType: 'water-heater',
        consumption: 2.1,
        efficiency: 68,
        age: 6,
        maintenanceHistory: [
          { date: new Date('2023-03-10'), type: 'anode-rod-replacement', cost: 85 }
        ]
      }
    ];

    this.initialized = true;
  }

  async generateRecommendations(): Promise<Recommendation[]> {
    if (!this.initialized || !this.userProfile) {
      throw new Error('Recommendation engine not initialized');
    }

    const recommendations: Recommendation[] = [];

    // Generate optimization recommendations
    recommendations.push(...this.generateOptimizationRecommendations());

    // Generate maintenance recommendations
    recommendations.push(...this.generateMaintenanceRecommendations());

    // Generate behavioral recommendations
    recommendations.push(...this.generateBehavioralRecommendations());

    // Sort by priority and return
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  private generateOptimizationRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // LED Lighting Upgrade
    recommendations.push({
      id: 'opt-led-001',
      type: 'optimization',
      title: 'Upgrade to LED Lighting',
      description: 'Replace traditional bulbs with LED alternatives to reduce energy consumption by up to 75% and extend bulb lifespan significantly.',
      impact: 'high',
      savings: 25.50,
      difficulty: 'easy',
      implemented: false,
      priority: 85,
      category: 'lighting'
    });

    // Smart Thermostat
    recommendations.push({
      id: 'opt-thermostat-001',
      type: 'optimization',
      title: 'Install Smart Thermostat',
      description: 'AI-powered thermostat learns your preferences and automatically optimizes heating/cooling schedules for maximum efficiency.',
      impact: 'high',
      savings: 32.80,
      difficulty: 'medium',
      implemented: false,
      priority: 90,
      category: 'hvac'
    });

    // Smart Power Strips
    recommendations.push({
      id: 'opt-powerstrip-001',
      type: 'optimization',
      title: 'Install Smart Power Strips',
      description: 'Eliminate phantom power drain from electronics when not in use by automatically cutting power to idle devices.',
      impact: 'low',
      savings: 8.40,
      difficulty: 'easy',
      implemented: false,
      priority: 60,
      category: 'electronics'
    });

    return recommendations;
  }

  private generateMaintenanceRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // HVAC Maintenance
    const hvacDevice = this.deviceData.find(d => d.deviceType === 'hvac');
    if (hvacDevice && hvacDevice.efficiency < 80) {
      recommendations.push({
        id: 'maint-hvac-001',
        type: 'maintenance',
        title: 'HVAC System Maintenance',
        description: 'Schedule professional maintenance to improve efficiency and extend equipment lifespan. Dirty coils and filters can reduce efficiency by up to 20%.',
        impact: 'medium',
        savings: 18.75,
        difficulty: 'medium',
        implemented: false,
        priority: 75,
        category: 'hvac'
      });
    }

    // Water Heater Maintenance
    const whDevice = this.deviceData.find(d => d.deviceType === 'water-heater');
    if (whDevice && whDevice.efficiency < 75) {
      recommendations.push({
        id: 'maint-wh-001',
        type: 'maintenance',
        title: 'Water Heater Insulation',
        description: 'Add insulation blanket and insulate hot water pipes to reduce heat loss and improve efficiency by up to 10%.',
        impact: 'medium',
        savings: 15.60,
        difficulty: 'easy',
        implemented: false,
        priority: 70,
        category: 'water-heating'
      });
    }

    return recommendations;
  }

  private generateBehavioralRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Thermostat Settings
    recommendations.push({
      id: 'beh-thermostat-001',
      type: 'behavioral',
      title: 'Optimize Thermostat Settings',
      description: 'Adjust thermostat by 2 degrees (down in winter, up in summer) to achieve significant savings without compromising comfort.',
      impact: 'medium',
      savings: 12.30,
      difficulty: 'easy',
      implemented: false,
      priority: 65,
      category: 'behavior'
    });

    // Peak Hour Usage Shift
    if (this.userProfile?.usagePatterns.peakHours.length > 0) {
      recommendations.push({
        id: 'beh-peak-001',
        type: 'behavioral',
        title: 'Shift Peak Hour Usage',
        description: 'Move heavy appliance usage to off-peak hours to take advantage of lower electricity rates and reduce grid strain.',
        impact: 'high',
        savings: 32.80,
        difficulty: 'medium',
        implemented: false,
        priority: 80,
        category: 'behavior'
      });
    }

    // Laundry Habits
    recommendations.push({
      id: 'beh-laundry-001',
      type: 'behavioral',
      title: 'Optimize Laundry Routine',
      description: 'Wash clothes in cold water and always run full loads to reduce energy consumption by up to 90% per cycle.',
      impact: 'medium',
      savings: 9.20,
      difficulty: 'easy',
      implemented: false,
      priority: 55,
      category: 'behavior'
    });

    return recommendations;
  }

  async updateRecommendation(recommendationId: string, updates: Partial<Recommendation>): Promise<Recommendation> {
    const recommendations = await this.generateRecommendations();
    const recommendation = recommendations.find(r => r.id === recommendationId);
    
    if (!recommendation) {
      throw new Error(`Recommendation ${recommendationId} not found`);
    }

    return { ...recommendation, ...updates };
  }

  async getRecommendationsByCategory(category: string): Promise<Recommendation[]> {
    const recommendations = await this.generateRecommendations();
    return recommendations.filter(r => r.category === category);
  }

  async getRecommendationsByImpact(impact: 'high' | 'medium' | 'low'): Promise<Recommendation[]> {
    const recommendations = await this.generateRecommendations();
    return recommendations.filter(r => r.impact === impact);
  }

  calculatePotentialSavings(recommendations: Recommendation[]): number {
    return recommendations
      .filter(r => !r.implemented)
      .reduce((total, r) => total + r.savings, 0);
  }

  calculateROI(recommendation: Recommendation, implementationCost: number): number {
    const monthlySavings = recommendation.savings;
    const annualSavings = monthlySavings * 12;
    return (annualSavings / implementationCost) * 100;
  }
}

// Singleton instance
let recommendationEngineInstance: RecommendationEngine | null = null;

export const getRecommendationEngine = (): RecommendationEngine => {
  if (!recommendationEngineInstance) {
    recommendationEngineInstance = new RecommendationEngine();
  }
  return recommendationEngineInstance;
};

export { RecommendationEngine };
