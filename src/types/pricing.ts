export interface PricingStrategy {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'testing';
  currentPrice: number;
  lastAdjustment: string;
  performance: {
    revenue: number;
    volume: number;
    conversion: number;
  };
}

export interface ABTestResult {
  id: string;
  testName: string;
  variantA: {
    price: number;
    revenue: number;
    sampleSize: number;
  };
  variantB: {
    price: number;
    revenue: number;
    sampleSize: number;
  };
  statisticalSignificance: number;
  winner?: 'A' | 'B';
  startDate: string;
  endDate?: string;
}

export interface PriceElasticity {
  pricePoint: number;
  predictedDemand: number;
  actualDemand?: number;
}

export interface CompetitorPrice {
  id: string;
  competitorName: string;
  price: number;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
}

export interface PricingAdjustment {
  timestamp: string;
  oldPrice: number;
  newPrice: number;
  reason: string;
  automated: boolean;
}

export interface DynamicPricingData {
  currentStrategy: PricingStrategy;
  allStrategies: PricingStrategy[];
  abTests: ABTestResult[];
  elasticityData: PriceElasticity[];
  competitors: CompetitorPrice[];
  recentAdjustments: PricingAdjustment[];
}
