import { pricingService } from '@/services/pricing/pricing-service';

describe('PricingService', () => {
  it('should fetch pricing data within 50ms', async () => {
    const start = performance.now();
    await pricingService.getPricingData();
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(50);
    console.log(`Price calculation performance: ${duration.toFixed(2)}ms`);
  });

  it('should return valid pricing strategy data', async () => {
    const data = await pricingService.getPricingData();
    expect(data.currentStrategy).toBeDefined();
    expect(data.currentStrategy.status).toBe('active');
    expect(data.abTests.length).toBeGreaterThan(0);
  });
});
