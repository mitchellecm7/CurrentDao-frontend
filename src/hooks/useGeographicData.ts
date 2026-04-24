import { useState, useEffect } from 'react';
import { EnergyFlow, EnergyFlowService } from '../services/geographic/energy-flows';
import { RegionalPricingService } from '../services/geographic/regional-pricing';
import { RegionalMarketData } from '../types/maps';

export const useGeographicData = () => {
  const [flows, setFlows] = useState<EnergyFlow[]>([]);
  const [pricing, setPricing] = useState<RegionalMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flowData, pricingData] = await Promise.all([
          EnergyFlowService.getGlobalFlows(),
          RegionalPricingService.getRegionalPricing()
        ]);
        setFlows(flowData);
        setPricing(pricingData);
      } catch (error) {
        console.error('Error fetching geographic data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return { flows, pricing, isLoading };
};
