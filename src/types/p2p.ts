// P2P Energy Trading Types for CurrentDao

export interface P2PUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  reputationScore: number;
  totalTrades: number;
  successRate: number;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  location: string;
  joinedAt: string;
  lastActive: string;
  preferences: {
    preferredEnergyTypes: string[];
    maxDistance: number;
    autoAcceptThreshold: number;
  };
}

export interface P2POffer {
  id: string;
  title: string;
  description: string;
  seller: P2PUser;
  energyType: 'solar' | 'wind' | 'hydro' | 'biomass' | 'geothermal';
  quantity: number; // in MWh
  pricePerUnit: number; // in USD
  location: string;
  deliveryMethod: 'physical' | 'grid' | 'iot';
  deliveryTimeframe: {
    start: string;
    end: string;
  };
  quality: {
    certification: string;
    sourceVerification: boolean;
    carbonCredits: number;
  };
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  expiresAt: string;
  views: number;
  bookmarks: number;
  tags: string[];
  customTerms?: string;
}

export interface P2PNegotiation {
  id: string;
  offer: P2POffer;
  buyer: P2PUser;
  seller: P2PUser;
  status: 'active' | 'accepted' | 'rejected' | 'expired';
  messages: P2PMessage[];
  offers: P2PNegotiationOffer[];
  currentOffer?: P2PNegotiationOffer;
  escrowId?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  metadata: {
    totalMessages: number;
    averageResponseTime: number;
    negotiationStage: 'initial' | 'counter' | 'final' | 'closed';
  };
}

export interface P2PMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'document' | 'offer' | 'system';
  timestamp: string;
  attachments?: P2PAttachment[];
  read: boolean;
  metadata?: {
    offerId?: string;
    disputeId?: string;
    systemEventType?: 'offer_accepted' | 'offer_rejected' | 'escrow_created';
  };
}

export interface P2PAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface P2PNegotiationOffer {
  id: string;
  proposerId: string;
  proposerName: string;
  quantity: number;
  pricePerUnit: number;
  deliveryTimeframe: {
    start: string;
    end: string;
  };
  customTerms?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
  expiresAt: string;
}

export interface P2PDispute {
  id: string;
  negotiation: P2PNegotiation;
  initiator: P2PUser;
  respondent: P2PUser;
  type: 'delivery' | 'quality' | 'payment' | 'communication' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: P2PEvidence[];
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  resolution?: P2PDisputeResolution;
  mediator?: P2PUser;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  timeline: P2PDisputeEvent[];
}

export interface P2PEvidence {
  id: string;
  type: 'document' | 'image' | 'video' | 'iot_data' | 'blockchain_proof';
  name: string;
  description: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  verified: boolean;
  metadata?: Record<string, any>;
}

export interface P2PDisputeResolution {
  outcome: 'buyer_favor' | 'seller_favor' | 'compromise' | 'partial_refund';
  description: string;
  actions: string[];
  refundAmount?: number;
  reputationImpact: {
    buyer: number;
    seller: number;
  };
  resolvedBy: string;
  resolvedAt: string;
}

export interface P2PDisputeEvent {
  id: string;
  type: 'created' | 'evidence_added' | 'mediator_assigned' | 'resolved' | 'escalated';
  description: string;
  actorId: string;
  actorName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface P2PEscrow {
  id: string;
  negotiationId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'funded' | 'released' | 'refunded';
  releaseConditions: {
    deliveryVerified: boolean;
    qualityConfirmed: boolean;
    timeframeMet: boolean;
  };
  blockchainTxId?: string;
  smartContractAddress?: string;
  createdAt: string;
  fundedAt?: string;
  releasedAt?: string;
  refundedAt?: string;
}

export interface TradingFilters {
  energyType: string;
  priceRange: {
    min: number;
    max: number;
  };
  location: string;
  reputationMin: number;
  status: string;
  deliveryMethod?: string;
  sortBy?: 'price' | 'reputation' | 'quantity' | 'created';
  sortOrder?: 'asc' | 'desc';
}

export interface P2PStats {
  activeOffers: number;
  ongoingNegotiations: number;
  successRate: number;
  totalVolume: number;
  averageResponseTime: number;
  disputeResolutionRate: number;
  reputationRanking: number;
}

export interface P2PNotification {
  id: string;
  userId: string;
  type: 'new_message' | 'offer_received' | 'negotiation_update' | 'dispute_created' | 'payment_received';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface P2PAnalytics {
  tradingHistory: {
    date: string;
    volume: number;
    value: number;
    trades: number;
    successRate: number;
  }[];
  performanceMetrics: {
    averageNegotiationTime: number;
    averagePricePerUnit: number;
    customerSatisfaction: number;
    disputeRate: number;
  };
  marketInsights: {
    popularEnergyTypes: string[];
    priceTrends: {
      energyType: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      change: number;
    }[];
    demandForecast: {
      period: string;
      expectedDemand: number;
      confidence: number;
    }[];
  };
}

export interface P2PContractTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  fields: P2PContractField[];
  category: 'standard' | 'premium' | 'custom';
  isDefault: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface P2PContractField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface P2PSignedContract {
  id: string;
  templateId: string;
  negotiationId: string;
  parties: {
    buyer: P2PUser;
    seller: P2PUser;
  };
  fields: Record<string, any>;
  signatures: {
    buyer: {
      signed: boolean;
      signature: string;
      timestamp: string;
    };
    seller: {
      signed: boolean;
      signature: string;
      timestamp: string;
    };
  };
  blockchainHash?: string;
  status: 'draft' | 'pending_signatures' | 'signed' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface P2PDeliveryVerification {
  id: string;
  negotiationId: string;
  method: 'iot_sensor' | 'manual' | 'third_party' | 'blockchain_oracle';
  status: 'pending' | 'verified' | 'failed' | 'disputed';
  data: {
    actualQuantity?: number;
    qualityMetrics?: Record<string, number>;
    deliveryTime?: string;
    location?: string;
  };
  evidence: P2PEvidence[];
  verifiedBy?: string;
  verifiedAt?: string;
  iotData?: {
    sensorId: string;
    readings: Array<{
      timestamp: string;
      value: number;
      unit: string;
    }>;
  };
}

// P2P Trading Context Types
export interface P2PTradingState {
  offers: P2POffer[];
  negotiations: P2PNegotiation[];
  disputes: P2PDispute[];
  currentUser: P2PUser | null;
  stats: P2PStats;
  notifications: P2PNotification[];
  isLoading: boolean;
  error: string | null;
}

export interface P2PTradingActions {
  // Offer Management
  createOffer: (offer: Omit<P2POffer, 'id' | 'createdAt' | 'views' | 'bookmarks'>) => Promise<string>;
  updateOffer: (id: string, updates: Partial<P2POffer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  acceptOffer: (offerId: string) => Promise<string>;
  
  // Negotiation Management
  sendMessage: (negotiationId: string, message: string, type?: P2PMessage['type']) => Promise<void>;
  counterOffer: (negotiationId: string, offer: Omit<P2PNegotiationOffer, 'id' | 'createdAt'>) => Promise<void>;
  acceptNegotiationOffer: (negotiationId: string, offerId: string) => Promise<void>;
  rejectNegotiationOffer: (negotiationId: string, offerId: string) => Promise<void>;
  
  // Dispute Management
  createDispute: (negotiationId: string, type: P2PDispute['type'], description: string) => Promise<string>;
  addEvidence: (disputeId: string, evidence: Omit<P2PEvidence, 'id' | 'uploadedAt'>) => Promise<void>;
  resolveDispute: (disputeId: string, resolution: P2PDisputeResolution) => Promise<void>;
  
  // Escrow Management
  createEscrow: (negotiationId: string, amount: number) => Promise<string>;
  fundEscrow: (escrowId: string) => Promise<void>;
  releaseEscrow: (escrowId: string) => Promise<void>;
  refundEscrow: (escrowId: string) => Promise<void>;
  
  // Utility Functions
  refreshData: () => Promise<void>;
  clearError: () => void;
  markNotificationRead: (notificationId: string) => Promise<void>;
}

export interface P2PTradingContextType {
  state: P2PTradingState;
  actions: P2PTradingActions;
}

// API Response Types
export interface P2PApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// WebSocket Event Types
export interface P2PWebSocketEvent {
  type: 'new_message' | 'offer_update' | 'negotiation_update' | 'dispute_update' | 'price_change';
  data: any;
  userId?: string;
  negotiationId?: string;
  timestamp: string;
}
