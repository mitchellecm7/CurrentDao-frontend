import { useState, useEffect, useCallback } from 'react';

interface Recommendation {
  id: string;
  type: 'optimization' | 'maintenance' | 'behavioral';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  implemented: boolean;
}

interface UsageData {
  deviceId: string;
  deviceName: string;
  consumption: number;
  efficiency: number;
  lastUpdated: Date;
}

interface CarbonFootprint {
  totalEmissions: number;
  sources: Array<{
    name: string;
    percentage: number;
    emissions: number;
  }>;
  reduction: number;
}

export const useAIAdvisor = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [carbonFootprint, setCarbonFootprint] = useState<CarbonFootprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data generation
  const generateMockRecommendations = useCallback((): Recommendation[] => {
    return [
      {
        id: '1',
        type: 'optimization',
        title: 'Upgrade to LED Lighting',
        description: 'Replace traditional bulbs with LED alternatives to reduce energy consumption by up to 75%',
        impact: 'high',
        savings: 25.50,
        difficulty: 'easy',
        implemented: false
      },
      {
        id: '2',
        type: 'maintenance',
        title: 'HVAC System Maintenance',
        description: 'Schedule regular maintenance to improve efficiency and extend equipment lifespan',
        impact: 'medium',
        savings: 18.75,
        difficulty: 'medium',
        implemented: false
      },
      {
        id: '3',
        type: 'behavioral',
        title: 'Optimize Thermostat Settings',
        description: 'Adjust thermostat by 2 degrees to achieve significant savings without compromising comfort',
        impact: 'medium',
        savings: 12.30,
        difficulty: 'easy',
        implemented: false
      },
      {
        id: '4',
        type: 'optimization',
        title: 'Install Smart Power Strips',
        description: 'Eliminate phantom power drain from electronics when not in use',
        impact: 'low',
        savings: 8.40,
        difficulty: 'easy',
        implemented: false
      },
      {
        id: '5',
        type: 'maintenance',
        title: 'Water Heater Insulation',
        description: 'Add insulation blanket to reduce heat loss and improve efficiency',
        impact: 'medium',
        savings: 15.60,
        difficulty: 'easy',
        implemented: false
      },
      {
        id: '6',
        type: 'behavioral',
        title: 'Peak Hour Usage Shift',
        description: 'Move heavy appliance usage to off-peak hours for lower rates',
        impact: 'high',
        savings: 32.80,
        difficulty: 'medium',
        implemented: false
      }
    ];
  }, []);

  const generateMockUsageData = useCallback((): UsageData[] => {
    return [
      {
        deviceId: 'hvac-001',
        deviceName: 'HVAC System',
        consumption: 4.2,
        efficiency: 72,
        lastUpdated: new Date()
      },
      {
        deviceId: 'wh-001',
        deviceName: 'Water Heater',
        consumption: 2.1,
        efficiency: 68,
        lastUpdated: new Date()
      },
      {
        deviceId: 'light-001',
        deviceName: 'Lighting System',
        consumption: 1.4,
        efficiency: 85,
        lastUpdated: new Date()
      },
      {
        deviceId: 'kitchen-001',
        deviceName: 'Kitchen Appliances',
        consumption: 1.1,
        efficiency: 78,
        lastUpdated: new Date()
      }
    ];
  }, []);

  const generateMockCarbonData = useCallback((): CarbonFootprint => {
    return {
      totalEmissions: 2.0,
      sources: [
        { name: 'Electricity', percentage: 45, emissions: 0.9 },
        { name: 'Natural Gas', percentage: 30, emissions: 0.6 },
        { name: 'Transportation', percentage: 15, emissions: 0.3 },
        { name: 'Waste', percentage: 10, emissions: 0.2 }
      ],
      reduction: 0.3
    };
  }, []);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setRecommendations(generateMockRecommendations());
        setUsageData(generateMockUsageData());
        setCarbonFootprint(generateMockCarbonData());
      } catch (err) {
        setError('Failed to load AI advisor data');
        console.error('AI Advisor initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [generateMockRecommendations, generateMockUsageData, generateMockCarbonData]);

  // Implement recommendation
  const implementRecommendation = useCallback(async (recommendationId: string) => {
    try {
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, implemented: true }
            : rec
        )
      );

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (err) {
      console.error('Failed to implement recommendation:', err);
      return false;
    }
  }, []);

  // Get recommendations by type
  const getRecommendationsByType = useCallback((type: 'optimization' | 'maintenance' | 'behavioral') => {
    return recommendations.filter(rec => rec.type === type);
  }, [recommendations]);

  // Get total potential savings
  const getTotalSavings = useCallback(() => {
    return recommendations
      .filter(rec => !rec.implemented)
      .reduce((total, rec) => total + rec.savings, 0);
  }, [recommendations]);

  // Get efficiency score
  const getEfficiencyScore = useCallback(() => {
    const implementedCount = recommendations.filter(rec => rec.implemented).length;
    const totalCount = recommendations.length;
    return totalCount > 0 ? Math.round((implementedCount / totalCount) * 100) : 0;
  }, [recommendations]);

  // Refresh data
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecommendations(generateMockRecommendations());
      setUsageData(generateMockUsageData());
      setCarbonFootprint(generateMockCarbonData());
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [generateMockRecommendations, generateMockUsageData, generateMockCarbonData]);

  return {
    recommendations,
    usageData,
    carbonFootprint,
    loading,
    error,
    implementRecommendation,
    getRecommendationsByType,
    getTotalSavings,
    getEfficiencyScore,
    refreshData
  };
};
