import { RegionalMarketData } from '../../types/maps';

export class RegionalPricingService {
  public static async getRegionalPricing(): Promise<RegionalMarketData[]> {
    return [
      { region: 'North America', averagePrice: 0.12, priceTrend: 'up', totalListings: 1250, totalCapacity: 45000, coordinates: { lat: 40, lng: -100 }, lastUpdated: new Date().toISOString() },
      { region: 'Europe', averagePrice: 0.18, priceTrend: 'stable', totalListings: 2100, totalCapacity: 62000, coordinates: { lat: 50, lng: 10 }, lastUpdated: new Date().toISOString() },
      { region: 'Asia Pacific', averagePrice: 0.15, priceTrend: 'down', totalListings: 3400, totalCapacity: 89000, coordinates: { lat: 20, lng: 120 }, lastUpdated: new Date().toISOString() },
      { region: 'South America', averagePrice: 0.09, priceTrend: 'up', totalListings: 800, totalCapacity: 25000, coordinates: { lat: -20, lng: -60 }, lastUpdated: new Date().toISOString() },
      { region: 'Africa', averagePrice: 0.11, priceTrend: 'stable', totalListings: 600, totalCapacity: 15000, coordinates: { lat: 0, lng: 20 }, lastUpdated: new Date().toISOString() },
    ];
  }
}
