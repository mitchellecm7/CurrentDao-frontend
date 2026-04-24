import { DynamicPricingData, PricingAdjustment } from '@/types/pricing';

export class PricingService {
  private static instance: PricingService;

  private constructor() {}

  public static getInstance(): PricingService {
    if (!PricingService.instance) {
      PricingService.instance = new PricingService();
    }
    return PricingService.instance;
  }

  public async getPricingData(): Promise<DynamicPricingData> {
    // Simulated API call with < 50ms performance requirement
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          currentStrategy: {
            id: 'strat_1',
            name: 'Revenue Max v2',
            description: 'Optimizes for total revenue based on current load',
            status: 'active',
            currentPrice: 0.12,
            lastAdjustment: new Date().toISOString(),
            performance: {
              revenue: 12540,
              volume: 104500,
              conversion: 0.85,
            },
          },
          allStrategies: [
            { id: 'strat_1', name: 'Revenue Max v2', description: 'Optimizes for total revenue', status: 'active', currentPrice: 0.12, lastAdjustment: new Date().toISOString(), performance: { revenue: 12540, volume: 104500, conversion: 0.85 } },
            { id: 'strat_2', name: 'Market Penetration', description: 'Low price for high volume', status: 'inactive', currentPrice: 0.08, lastAdjustment: new Date().toISOString(), performance: { revenue: 8400, volume: 105000, conversion: 0.92 } },
          ],
          abTests: [
            {
              id: 'test_1',
              testName: 'Peak Hours Surcharge',
              variantA: { price: 0.12, revenue: 5400, sampleSize: 1200 },
              variantB: { price: 0.14, revenue: 5800, sampleSize: 1150 },
              statisticalSignificance: 0.96,
              winner: 'B',
              startDate: new Date(Date.now() - 86400000 * 7).toISOString(),
            },
          ],
          elasticityData: [
            { pricePoint: 0.06, predictedDemand: 200000 },
            { pricePoint: 0.08, predictedDemand: 150000 },
            { pricePoint: 0.10, predictedDemand: 100000 },
            { pricePoint: 0.12, predictedDemand: 80000 },
            { pricePoint: 0.14, predictedDemand: 50000 },
          ],
          competitors: [
            { id: 'c1', competitorName: 'EcoPower', price: 0.11, lastUpdated: new Date().toISOString(), trend: 'down' },
            { id: 'c2', competitorName: 'GridNow', price: 0.13, lastUpdated: new Date().toISOString(), trend: 'up' },
            { id: 'c3', competitorName: 'SolarFlow', price: 0.12, lastUpdated: new Date().toISOString(), trend: 'stable' },
          ],
          recentAdjustments: [
            { timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), oldPrice: 0.11, newPrice: 0.12, reason: 'High demand forecast', automated: true },
          ],
        });
      }, 30); // Simulated 30ms response time
    });
  }

  public async updatePricingControl(enabled: boolean): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 20);
    });
  }

  public async applyAdjustment(adjustment: PricingAdjustment): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 40);
    });
  }
}

export const pricingService = PricingService.getInstance();
