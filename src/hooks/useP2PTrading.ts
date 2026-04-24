import { useState, useEffect, useCallback, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  P2PTradingState, 
  P2PTradingActions, 
  P2POffer, 
  P2PNegotiation, 
  P2PDispute, 
  P2PUser, 
  P2PStats,
  P2PMessage,
  P2PNegotiationOffer,
  P2PEvidence,
  P2PDisputeResolution,
  P2PEscrow
} from '@/types/p2p';

// Mock API functions - replace with actual API calls
const p2pApi = {
  // Offers
  getOffers: async (): Promise<P2POffer[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        title: 'Premium Solar Energy',
        description: 'High-quality solar energy from certified panels',
        seller: {
          id: 'seller1',
          name: 'SolarPro Energy',
          email: 'contact@solarpro.com',
          reputationScore: 4.8,
          totalTrades: 156,
          successRate: 98.5,
          verificationStatus: 'verified',
          location: 'California, USA',
          joinedAt: '2023-01-15',
          lastActive: '2025-01-20',
          preferences: {
            preferredEnergyTypes: ['solar', 'wind'],
            maxDistance: 500,
            autoAcceptThreshold: 0.95
          }
        },
        energyType: 'solar',
        quantity: 100,
        pricePerUnit: 45.50,
        location: 'California, USA',
        deliveryMethod: 'grid',
        deliveryTimeframe: {
          start: '2025-02-01',
          end: '2025-02-28'
        },
        quality: {
          certification: 'ISO 9001',
          sourceVerification: true,
          carbonCredits: 25
        },
        status: 'active',
        createdAt: '2025-01-15',
        expiresAt: '2025-02-15',
        views: 234,
        bookmarks: 45,
        tags: ['solar', 'premium', 'certified']
      },
      {
        id: '2',
        title: 'Wind Energy Package',
        description: 'Clean wind energy from coastal turbines',
        seller: {
          id: 'seller2',
          name: 'WindPower Co',
          email: 'info@windpower.com',
          reputationScore: 4.6,
          totalTrades: 89,
          successRate: 96.2,
          verificationStatus: 'verified',
          location: 'Texas, USA',
          joinedAt: '2023-03-20',
          lastActive: '2025-01-19',
          preferences: {
            preferredEnergyTypes: ['wind', 'solar'],
            maxDistance: 1000,
            autoAcceptThreshold: 0.90
          }
        },
        energyType: 'wind',
        quantity: 250,
        pricePerUnit: 38.75,
        location: 'Texas, USA',
        deliveryMethod: 'grid',
        deliveryTimeframe: {
          start: '2025-02-01',
          end: '2025-03-01'
        },
        quality: {
          certification: 'Green Energy Certified',
          sourceVerification: true,
          carbonCredits: 40
        },
        status: 'active',
        createdAt: '2025-01-10',
        expiresAt: '2025-02-10',
        views: 156,
        bookmarks: 32,
        tags: ['wind', 'coastal', 'renewable']
      }
    ];
  },

  createOffer: async (offer: Omit<P2POffer, 'id' | 'createdAt' | 'views' | 'bookmarks'>): Promise<string> => {
    // Mock API call
    const newId = Date.now().toString();
    return newId;
  },

  // Negotiations
  getNegotiations: async (userId?: string): Promise<P2PNegotiation[]> => {
    // Mock data
    return [
      {
        id: 'neg1',
        offer: {} as P2POffer,
        buyer: {} as P2PUser,
        seller: {} as P2PUser,
        status: 'active',
        messages: [],
        offers: [],
        createdAt: '2025-01-18',
        updatedAt: '2025-01-19',
        expiresAt: '2025-02-18',
        metadata: {
          totalMessages: 5,
          averageResponseTime: 2.5,
          negotiationStage: 'counter'
        }
      }
    ];
  },

  sendMessage: async (negotiationId: string, message: string, type: P2PMessage['type'] = 'text'): Promise<void> => {
    // Mock API call
    console.log('Sending message:', { negotiationId, message, type });
  },

  counterOffer: async (negotiationId: string, offer: Omit<P2PNegotiationOffer, 'id' | 'createdAt'>): Promise<void> => {
    // Mock API call
    console.log('Counter offer:', { negotiationId, offer });
  },

  // Disputes
  getDisputes: async (userId?: string): Promise<P2PDispute[]> => {
    // Mock data
    return [
      {
        id: 'disp1',
        negotiation: {} as P2PNegotiation,
        initiator: {} as P2PUser,
        respondent: {} as P2PUser,
        type: 'delivery',
        severity: 'medium',
        description: 'Delivery was delayed by 3 days',
        evidence: [],
        status: 'open',
        createdAt: '2025-01-17',
        updatedAt: '2025-01-18',
        timeline: []
      }
    ];
  },

  createDispute: async (negotiationId: string, type: P2PDispute['type'], description: string): Promise<string> => {
    // Mock API call
    const newId = Date.now().toString();
    return newId;
  },

  // User Profile
  getCurrentUser: async (userId?: string): Promise<P2PUser | null> => {
    // Mock data
    return {
      id: userId || 'user1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      reputationScore: 4.5,
      totalTrades: 42,
      successRate: 95.2,
      verificationStatus: 'verified',
      location: 'New York, USA',
      joinedAt: '2023-06-15',
      lastActive: '2025-01-20',
      preferences: {
        preferredEnergyTypes: ['solar', 'wind'],
        maxDistance: 300,
        autoAcceptThreshold: 0.92
      }
    };
  },

  // Stats
  getStats: async (userId?: string): Promise<P2PStats> => {
    // Mock data
    return {
      activeOffers: 12,
      ongoingNegotiations: 3,
      successRate: 95.2,
      totalVolume: 2500,
      averageResponseTime: 2.3,
      disputeResolutionRate: 88.5,
      reputationRanking: 15
    };
  }
};

export const useP2PTrading = (userId?: string) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Fetch offers
  const {
    data: offers = [],
    isLoading: offersLoading,
    refetch: refetchOffers
  } = useQuery({
    queryKey: ['p2p-offers'],
    queryFn: p2pApi.getOffers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch negotiations
  const {
    data: negotiations = [],
    isLoading: negotiationsLoading,
    refetch: refetchNegotiations
  } = useQuery({
    queryKey: ['p2p-negotiations', userId],
    queryFn: () => p2pApi.getNegotiations(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch disputes
  const {
    data: disputes = [],
    isLoading: disputesLoading,
    refetch: refetchDisputes
  } = useQuery({
    queryKey: ['p2p-disputes', userId],
    queryFn: () => p2pApi.getDisputes(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch current user
  const {
    data: currentUser,
    isLoading: userLoading,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['p2p-current-user', userId],
    queryFn: () => p2pApi.getCurrentUser(userId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch stats
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['p2p-stats', userId],
    queryFn: () => p2pApi.getStats(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutations
  const createOfferMutation = useMutation({
    mutationFn: p2pApi.createOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['p2p-offers'] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create offer');
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ negotiationId, message, type }: { negotiationId: string; message: string; type?: P2PMessage['type'] }) =>
      p2pApi.sendMessage(negotiationId, message, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['p2p-negotiations'] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to send message');
    }
  });

  const counterOfferMutation = useMutation({
    mutationFn: ({ negotiationId, offer }: { negotiationId: string; offer: Omit<P2PNegotiationOffer, 'id' | 'createdAt'> }) =>
      p2pApi.counterOffer(negotiationId, offer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['p2p-negotiations'] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to submit counter offer');
    }
  });

  const createDisputeMutation = useMutation({
    mutationFn: ({ negotiationId, type, description }: { negotiationId: string; type: P2PDispute['type']; description: string }) =>
      p2pApi.createDispute(negotiationId, type, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['p2p-disputes'] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create dispute');
    }
  });

  // Actions
  const createOffer = useCallback(async (offer: Omit<P2POffer, 'id' | 'createdAt' | 'views' | 'bookmarks'>): Promise<string> => {
    return createOfferMutation.mutateAsync(offer);
  }, [createOfferMutation]);

  const acceptOffer = useCallback(async (offerId: string): Promise<string> => {
    // This would create a negotiation from the offer
    const negotiationId = `neg_${Date.now()}`;
    queryClient.invalidateQueries({ queryKey: ['p2p-negotiations'] });
    return negotiationId;
  }, [queryClient]);

  const counterOffer = useCallback(async (negotiationId: string, offer: Omit<P2PNegotiationOffer, 'id' | 'createdAt'>): Promise<void> => {
    return counterOfferMutation.mutateAsync({ negotiationId, offer });
  }, [counterOfferMutation]);

  const rejectOffer = useCallback(async (offerId: string): Promise<void> => {
    // Mock implementation
    console.log('Rejecting offer:', offerId);
  }, []);

  const sendMessage = useCallback(async (negotiationId: string, message: string, type?: P2PMessage['type']): Promise<void> => {
    return sendMessageMutation.mutateAsync({ negotiationId, message, type });
  }, [sendMessageMutation]);

  const createDispute = useCallback(async (negotiationId: string, type: P2PDispute['type'], description: string): Promise<string> => {
    return createDisputeMutation.mutateAsync({ negotiationId, type, description });
  }, [createDisputeMutation]);

  const resolveDispute = useCallback(async (disputeId: string, resolution: P2PDisputeResolution): Promise<void> => {
    // Mock implementation
    console.log('Resolving dispute:', { disputeId, resolution });
    queryClient.invalidateQueries({ queryKey: ['p2p-disputes'] });
  }, [queryClient]);

  const refreshData = useCallback(async (): Promise<void> => {
    await Promise.all([
      refetchOffers(),
      refetchNegotiations(),
      refetchDisputes(),
      refetchUser(),
      refetchStats()
    ]);
  }, [refetchOffers, refetchNegotiations, refetchDisputes, refetchUser, refetchStats]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Combined loading state
  const isLoading = offersLoading || negotiationsLoading || disputesLoading || userLoading || statsLoading;

  return {
    // Data
    offers,
    negotiations,
    disputes,
    currentUser,
    stats,
    isLoading,
    error,
    
    // Actions
    createOffer,
    acceptOffer,
    counterOffer,
    rejectOffer,
    sendMessage,
    createDispute,
    resolveDispute,
    refreshData,
    clearError
  };
};
