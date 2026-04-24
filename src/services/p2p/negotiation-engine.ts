import { 
  P2PNegotiation, 
  P2PNegotiationOffer, 
  P2PMessage, 
  P2POffer,
  P2PUser,
  P2PDispute 
} from '@/types/p2p';

export interface NegotiationConfig {
  maxOfferDuration: number; // in hours
  maxCounterOffers: number;
  autoAcceptThreshold: number; // 0-1
  responseTimeout: number; // in hours
  escalationThreshold: number; // number of messages before escalation
}

export interface NegotiationStrategy {
  type: 'aggressive' | 'moderate' | 'conservative' | 'flexible';
  priceTolerance: number; // percentage
  quantityFlexibility: number; // percentage
  deliveryFlexibility: number; // days
  communicationStyle: 'formal' | 'casual' | 'technical';
}

export interface NegotiationInsight {
  type: 'price_analysis' | 'timing_opportunity' | 'seller_behavior' | 'market_trend';
  title: string;
  description: string;
  confidence: number; // 0-1
  actionable: boolean;
  recommendation?: string;
}

export interface NegotiationAnalytics {
  averageResponseTime: number;
  successRate: number;
  averageNegotiationDuration: number;
  priceConvergenceRate: number;
  communicationQuality: number;
  disputeFrequency: number;
  satisfactionScore: number;
}

class NegotiationEngine {
  private config: NegotiationConfig;
  private strategies: Map<string, NegotiationStrategy> = new Map();
  private insights: NegotiationInsight[] = [];

  constructor(config: NegotiationConfig) {
    this.config = config;
    this.initializeDefaultStrategies();
  }

  private initializeDefaultStrategies() {
    this.strategies.set('aggressive', {
      type: 'aggressive',
      priceTolerance: 0.05,
      quantityFlexibility: 0.1,
      deliveryFlexibility: 3,
      communicationStyle: 'formal'
    });

    this.strategies.set('moderate', {
      type: 'moderate',
      priceTolerance: 0.1,
      quantityFlexibility: 0.2,
      deliveryFlexibility: 7,
      communicationStyle: 'casual'
    });

    this.strategies.set('conservative', {
      type: 'conservative',
      priceTolerance: 0.15,
      quantityFlexibility: 0.3,
      deliveryFlexibility: 14,
      communicationStyle: 'formal'
    });

    this.strategies.set('flexible', {
      type: 'flexible',
      priceTolerance: 0.2,
      quantityFlexibility: 0.4,
      deliveryFlexibility: 21,
      communicationStyle: 'casual'
    });
  }

  /**
   * Creates a new negotiation from an offer
   */
  async createNegotiation(
    offer: P2POffer,
    buyer: P2PUser,
    initialMessage?: string
  ): Promise<P2PNegotiation> {
    const negotiation: P2PNegotiation = {
      id: `neg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      offer,
      buyer,
      seller: offer.seller,
      status: 'active',
      messages: [],
      offers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.config.maxOfferDuration * 60 * 60 * 1000).toISOString(),
      metadata: {
        totalMessages: 0,
        averageResponseTime: 0,
        negotiationStage: 'initial'
      }
    };

    // Add initial message if provided
    if (initialMessage) {
      const message: P2PMessage = {
        id: `msg_${Date.now()}`,
        senderId: buyer.id,
        senderName: buyer.name,
        content: initialMessage,
        type: 'text',
        timestamp: new Date().toISOString(),
        read: false
      };
      negotiation.messages.push(message);
      negotiation.metadata.totalMessages = 1;
    }

    // Generate initial insights
    this.generateNegotiationInsights(negotiation);

    return negotiation;
  }

  /**
   * Processes a counter offer in a negotiation
   */
  async processCounterOffer(
    negotiation: P2PNegotiation,
    counterOffer: Omit<P2PNegotiationOffer, 'id' | 'createdAt'>
  ): Promise<{
    negotiation: P2PNegotiation;
    recommendation: string;
    shouldAccept: boolean;
    insights: NegotiationInsight[];
  }> {
    // Create the counter offer
    const newOffer: P2PNegotiationOffer = {
      ...counterOffer,
      id: `offer_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    negotiation.offers.push(newOffer);
    negotiation.currentOffer = newOffer;
    negotiation.updatedAt = new Date().toISOString();

    // Update negotiation stage
    negotiation.metadata.negotiationStage = this.determineNegotiationStage(negotiation);

    // Analyze the counter offer
    const analysis = this.analyzeCounterOffer(negotiation, newOffer);
    
    // Generate insights
    const insights = this.generateCounterOfferInsights(negotiation, newOffer);

    return {
      negotiation,
      recommendation: analysis.recommendation,
      shouldAccept: analysis.shouldAccept,
      insights
    };
  }

  /**
   * Adds a message to the negotiation
   */
  async addMessage(
    negotiation: P2PNegotiation,
    senderId: string,
    senderName: string,
    content: string,
    type: P2PMessage['type'] = 'text'
  ): Promise<P2PNegotiation> {
    const message: P2PMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      senderName,
      content,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };

    negotiation.messages.push(message);
    negotiation.metadata.totalMessages += 1;
    negotiation.updatedAt = new Date().toISOString();

    // Update average response time
    this.updateResponseTimeMetrics(negotiation);

    // Check for escalation triggers
    if (negotiation.metadata.totalMessages >= this.config.escalationThreshold) {
      this.triggerEscalationCheck(negotiation);
    }

    return negotiation;
  }

  /**
   * Accepts an offer in a negotiation
   */
  async acceptOffer(
    negotiation: P2PNegotiation,
    offerId: string
  ): Promise<P2PNegotiation> {
    const offer = negotiation.offers.find(o => o.id === offerId);
    if (!offer) {
      throw new Error('Offer not found');
    }

    // Update offer status
    offer.status = 'accepted';
    negotiation.currentOffer = offer;
    negotiation.status = 'accepted';
    negotiation.updatedAt = new Date().toISOString();

    // Add system message
    const systemMessage: P2PMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      content: `Offer ${offerId} has been accepted. Proceeding to escrow setup.`,
      type: 'system',
      timestamp: new Date().toISOString(),
      read: true,
      metadata: {
        systemEventType: 'offer_accepted',
        offerId
      }
    };
    negotiation.messages.push(systemMessage);

    return negotiation;
  }

  /**
   * Rejects an offer in a negotiation
   */
  async rejectOffer(
    negotiation: P2PNegotiation,
    offerId: string,
    reason?: string
  ): Promise<P2PNegotiation> {
    const offer = negotiation.offers.find(o => o.id === offerId);
    if (!offer) {
      throw new Error('Offer not found');
    }

    // Update offer status
    offer.status = 'rejected';
    negotiation.updatedAt = new Date().toISOString();

    // Add system message
    const systemMessage: P2PMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      content: `Offer ${offerId} has been rejected${reason ? `: ${reason}` : ''}.`,
      type: 'system',
      timestamp: new Date().toISOString(),
      read: true,
      metadata: {
        systemEventType: 'offer_rejected',
        offerId
      }
    };
    negotiation.messages.push(systemMessage);

    // Check if negotiation should be closed
    if (this.shouldCloseNegotiation(negotiation)) {
      negotiation.status = 'rejected';
    }

    return negotiation;
  }

  /**
   * Generates negotiation insights and recommendations
   */
  private generateNegotiationInsights(negotiation: P2PNegotiation): NegotiationInsight[] {
    const insights: NegotiationInsight[] = [];

    // Price analysis
    const priceInsight = this.analyzePricePosition(negotiation);
    if (priceInsight) {
      insights.push(priceInsight);
    }

    // Seller behavior analysis
    const behaviorInsight = this.analyzeSellerBehavior(negotiation);
    if (behaviorInsight) {
      insights.push(behaviorInsight);
    }

    // Timing analysis
    const timingInsight = this.analyzeTimingOpportunity(negotiation);
    if (timingInsight) {
      insights.push(timingInsight);
    }

    this.insights = insights;
    return insights;
  }

  private analyzePricePosition(negotiation: P2PNegotiation): NegotiationInsight | null {
    const currentPrice = negotiation.currentOffer?.pricePerUnit || negotiation.offer.pricePerUnit;
    const originalPrice = negotiation.offer.pricePerUnit;
    const priceDifference = Math.abs(currentPrice - originalPrice) / originalPrice;

    if (priceDifference > 0.1) {
      return {
        type: 'price_analysis',
        title: 'Significant Price Difference',
        description: `Current price is ${(priceDifference * 100).toFixed(1)}% different from original offer.`,
        confidence: 0.8,
        actionable: true,
        recommendation: priceDifference > 0.2 ? 'Consider compromising on price' : 'Price is within reasonable range'
      };
    }

    return null;
  }

  private analyzeSellerBehavior(negotiation: P2PNegotiation): NegotiationInsight | null {
    const sellerMessages = negotiation.messages.filter(m => m.senderId === negotiation.seller.id);
    const averageResponseTime = this.calculateAverageResponseTime(sellerMessages);

    if (averageResponseTime > 24) { // hours
      return {
        type: 'seller_behavior',
        title: 'Slow Response Time',
        description: `Seller responds in an average of ${averageResponseTime.toFixed(1)} hours.`,
        confidence: 0.9,
        actionable: true,
        recommendation: 'Consider setting response time expectations or looking for more responsive sellers'
      };
    }

    return null;
  }

  private analyzeTimingOpportunity(negotiation: P2PNegotiation): NegotiationInsight | null {
    const timeCreated = new Date(negotiation.createdAt);
    const timeUntilExpiry = new Date(negotiation.expiresAt).getTime() - Date.now();
    const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);

    if (hoursUntilExpiry < 24) {
      return {
        type: 'timing_opportunity',
        title: 'Expiring Soon',
        description: `Negotiation expires in ${hoursUntilExpiry.toFixed(1)} hours.`,
        confidence: 0.95,
        actionable: true,
        recommendation: 'Consider making final offer or requesting extension'
      };
    }

    return null;
  }

  private analyzeCounterOffer(
    negotiation: P2PNegotiation,
    counterOffer: P2PNegotiationOffer
  ): { recommendation: string; shouldAccept: boolean } {
    const originalPrice = negotiation.offer.pricePerUnit;
    const currentPrice = counterOffer.pricePerUnit;
    const priceDifference = Math.abs(currentPrice - originalPrice) / originalPrice;

    // Simple acceptance logic - can be made more sophisticated
    const shouldAccept = priceDifference <= this.config.autoAcceptThreshold;
    
    let recommendation = '';
    if (shouldAccept) {
      recommendation = 'Offer is within acceptable range - consider accepting';
    } else if (priceDifference > 0.3) {
      recommendation = 'Price difference is significant - consider counter-offering';
    } else {
      recommendation = 'Moderate price difference - negotiate further';
    }

    return { recommendation, shouldAccept };
  }

  private generateCounterOfferInsights(
    negotiation: P2PNegotiation,
    counterOffer: P2PNegotiationOffer
  ): NegotiationInsight[] {
    const insights: NegotiationInsight[] = [];

    // Compare with previous offers
    if (negotiation.offers.length > 1) {
      const previousOffer = negotiation.offers[negotiation.offers.length - 2];
      const priceMovement = counterOffer.pricePerUnit - previousOffer.pricePerUnit;
      
      if (Math.abs(priceMovement) > 0) {
        insights.push({
          type: 'price_analysis',
          title: 'Price Movement Detected',
          description: `Price moved ${priceMovement > 0 ? 'up' : 'down'} by $${Math.abs(priceMovement).toFixed(2)}/MWh`,
          confidence: 0.85,
          actionable: true,
          recommendation: priceMovement > 0 ? 'Seller is being flexible' : 'Buyer is pushing for lower price'
        });
      }
    }

    return insights;
  }

  private determineNegotiationStage(negotiation: P2PNegotiation): 'initial' | 'counter' | 'final' | 'closed' {
    const offerCount = negotiation.offers.length;
    const messageCount = negotiation.messages.length;

    if (negotiation.status === 'accepted' || negotiation.status === 'rejected') {
      return 'closed';
    } else if (offerCount === 0) {
      return 'initial';
    } else if (offerCount < 3) {
      return 'counter';
    } else {
      return 'final';
    }
  }

  private updateResponseTimeMetrics(negotiation: P2PNegotiation): void {
    if (negotiation.messages.length < 2) return;

    const responseTimes: number[] = [];
    for (let i = 1; i < negotiation.messages.length; i++) {
      const currentMessage = negotiation.messages[i];
      const previousMessage = negotiation.messages[i - 1];
      
      // Only calculate if different senders
      if (currentMessage.senderId !== previousMessage.senderId) {
        const responseTime = new Date(currentMessage.timestamp).getTime() - 
                           new Date(previousMessage.timestamp).getTime();
        responseTimes.push(responseTime / (1000 * 60 * 60)); // Convert to hours
      }
    }

    if (responseTimes.length > 0) {
      negotiation.metadata.averageResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
    }
  }

  private calculateAverageResponseTime(messages: P2PMessage[]): number {
    if (messages.length < 2) return 0;

    const responseTimes: number[] = [];
    for (let i = 1; i < messages.length; i++) {
      const responseTime = new Date(messages[i].timestamp).getTime() - 
                         new Date(messages[i - 1].timestamp).getTime();
      responseTimes.push(responseTime / (1000 * 60 * 60)); // Convert to hours
    }

    return responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b) / responseTimes.length : 0;
  }

  private shouldCloseNegotiation(negotiation: P2PNegotiation): boolean {
    const rejectedOffers = negotiation.offers.filter(o => o.status === 'rejected').length;
    const totalOffers = negotiation.offers.length;
    
    // Close if more than 70% of offers are rejected
    return totalOffers > 0 && (rejectedOffers / totalOffers) > 0.7;
  }

  private triggerEscalationCheck(negotiation: P2PNegotiation): void {
    // This would trigger a dispute creation or mediator assignment
    console.log(`Negotiation ${negotiation.id} may need escalation due to high message count`);
  }

  /**
   * Gets negotiation analytics for a user
   */
  async getNegotiationAnalytics(userId: string): Promise<NegotiationAnalytics> {
    // Mock implementation - would fetch from database
    return {
      averageResponseTime: 2.5, // hours
      successRate: 0.85, // 85%
      averageNegotiationDuration: 48, // hours
      priceConvergenceRate: 0.72, // 72%
      communicationQuality: 4.2, // out of 5
      disputeFrequency: 0.05, // 5%
      satisfactionScore: 4.1 // out of 5
    };
  }

  /**
   * Suggests optimal negotiation strategy
   */
  suggestOptimalStrategy(
    user: P2PUser,
    offer: P2POffer,
    historicalData?: NegotiationAnalytics
  ): NegotiationStrategy {
    // Simple strategy selection based on user profile and offer characteristics
    if (user.reputationScore > 4.5 && user.totalTrades > 50) {
      return this.strategies.get('moderate')!;
    } else if (user.totalTrades < 10) {
      return this.strategies.get('conservative')!;
    } else {
      return this.strategies.get('flexible')!;
    }
  }

  /**
   * Validates offer terms
   */
  validateOfferTerms(offer: P2PNegotiationOffer): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (offer.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (offer.pricePerUnit <= 0) {
      errors.push('Price must be greater than 0');
    }

    if (new Date(offer.deliveryTimeframe.start) >= new Date(offer.deliveryTimeframe.end)) {
      errors.push('Delivery start must be before delivery end');
    }

    if (new Date(offer.deliveryTimeframe.start) < new Date()) {
      errors.push('Delivery start cannot be in the past');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Gets current insights
   */
  getInsights(): NegotiationInsight[] {
    return this.insights;
  }

  /**
   * Updates configuration
   */
  updateConfig(newConfig: Partial<NegotiationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export default NegotiationEngine;
