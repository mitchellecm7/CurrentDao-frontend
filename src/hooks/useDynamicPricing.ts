import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingService } from '@/services/pricing/pricing-service';
import { DynamicPricingData } from '@/types/pricing';

export function useDynamicPricing() {
  const queryClient = useQueryClient();
  const [isAutomated, setIsAutomated] = useState(true);

  const { data, isLoading, error, refetch } = useQuery<DynamicPricingData>({
    queryKey: ['dynamicPricing'],
    queryFn: () => pricingService.getPricingData(),
    refetchInterval: 5000, // Real-time updates every 5 seconds
    staleTime: 4000,
  });

  const toggleAutomation = useMutation({
    mutationFn: (enabled: boolean) => pricingService.updatePricingControl(enabled),
    onSuccess: (enabled) => {
      setIsAutomated(enabled);
      queryClient.invalidateQueries({ queryKey: ['dynamicPricing'] });
    },
  });

  const handleToggleAutomation = useCallback(() => {
    toggleAutomation.mutate(!isAutomated);
  }, [isAutomated, toggleAutomation]);

  return {
    data,
    isLoading,
    error,
    isAutomated,
    handleToggleAutomation,
    refetch,
  };
}
