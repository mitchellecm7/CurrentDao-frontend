import { P2PUser, P2PNegotiation, P2PDispute } from '@/types/p2p';

export interface ReputationFactors {
  tradeHistory: {
    totalTrades: number;
    successfulTrades: number;
    failedTrades: number;
    averageTradeValue: number;
    tradeFrequency: number; // trades per month
  };
  disputeHistory: {
    totalDisputes: number;
    resolvedDisputes: number;
    disputesWon: number;
    disputesLost: number;
    disputeRate: number; // percentage of trades
  };
  communication: {
    averageResponseTime: number; // in hours
    messageQuality: number; // 1-5 rating
    professionalism: number; // 1-5 rating
    clarity: number; // 1-5 rating
  };
  reliability: {
    onTimeDelivery: number; // percentage
    qualityConsistency: number; // 1-5 rating
    fulfillmentAccuracy: number; // percentage
    cancellationRate: number; // percentage
  };
  verification: {
    identityVerified: boolean;
    businessVerified: boolean;
    certifications: string[];
    backgroundCheckPassed: boolean;
  };
}

export interface ReputationBreakdown {
  overall: number;
  categories: {
    tradeHistory: number;
    disputeResolution: number;
    communication: number;
    reliability: number;
    verification: number;
  };
  trend: 'improving' | 'declining' | 'stable';
  confidence: number; // 0-1
  rank: number;
  totalUsers: number;
}

export interface ReputationEvent {
  id: string;
  userId: string;
  type: 'trade_completed' | 'trade_failed' | 'dispute_won' | 'dispute_lost' | 'review_received' | 'verification_completed';
  impact: number;
  category: keyof ReputationBreakdown['categories'];
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ReputationThresholds {
  excellent: number;
  veryGood: number;
  good: number;
  fair: number;
  poor: number;
}

class ReputationCalculator {
  private weights: Record<keyof ReputationBreakdown['categories'], number> = {
    tradeHistory: 0.35,
    disputeResolution: 0.25,
    communication: 0.20,
    reliability: 0.15,
    verification: 0.05
  };

  private thresholds: ReputationThresholds = {
    excellent: 4.5,
    veryGood: 4.0,
    good: 3.5,
    fair: 3.0,
    poor: 0
  };

  private decayRate = 0.95; // Monthly decay factor for older events
  private maxHistoryMonths = 12; // Consider only last 12 months

  /**
   * Calculates comprehensive reputation score for a user
   */
  async calculateReputation(
    userId: string,
    user: P2PUser,
    negotiations: P2PNegotiation[],
    disputes: P2PDispute[]
  ): Promise<ReputationBreakdown> {
    const factors = await this.extractReputationFactors(userId, negotiations, disputes);
    const categories = this.calculateCategoryScores(factors);
    const overall = this.calculateOverallScore(categories);
    const trend = this.calculateTrend(factors);
    const confidence = this.calculateConfidence(factors);
    const { rank, totalUsers } = await this.calculateRank(userId, overall);

    return {
      overall,
      categories,
      trend,
      confidence,
      rank,
      totalUsers
    };
  }

  /**
   * Extracts reputation factors from user data
   */
  private async extractReputationFactors(
    userId: string,
    negotiations: P2PNegotiation[],
    disputes: P2PDispute[]
  ): Promise<ReputationFactors> {
    const userNegotiations = negotiations.filter(
      n => n.buyer.id === userId || n.seller.id === userId
    );
    const userDisputes = disputes.filter(
      d => d.initiator.id === userId || d.respondent.id === userId
    );

    return {
      tradeHistory: this.calculateTradeHistoryFactors(userId, userNegotiations),
      disputeHistory: this.calculateDisputeHistoryFactors(userId, userDisputes),
      communication: this.calculateCommunicationFactors(userId, userNegotiations),
      reliability: this.calculateReliabilityFactors(userId, userNegotiations),
      verification: this.calculateVerificationFactors(userId)
    };
  }

  /**
   * Calculates trade history factors
   */
  private calculateTradeHistoryFactors(
    userId: string,
    negotiations: P2PNegotiation[]
  ): ReputationFactors['tradeHistory'] {
    const userNegotiations = negotiations.filter(n => n.status === 'completed');
    const totalTrades = userNegotiations.length;
    const successfulTrades = userNegotiations.filter(n => n.status === 'completed').length;
    const failedTrades = totalTrades - successfulTrades;

    // Calculate average trade value (mock calculation)
    const averageTradeValue = userNegotiations.reduce((sum, n) => {
      const price = n.currentOffer?.pricePerUnit || n.offer.pricePerUnit;
      const quantity = n.currentOffer?.quantity || n.offer.quantity;
      return sum + (price * quantity);
    }, 0) / Math.max(totalTrades, 1);

    // Calculate trade frequency (trades per month)
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
    const recentTrades = userNegotiations.filter(
      n => new Date(n.createdAt) >= twelveMonthsAgo
    );
    const tradeFrequency = recentTrades.length / 12;

    return {
      totalTrades,
      successfulTrades,
      failedTrades,
      averageTradeValue,
      tradeFrequency
    };
  }

  /**
   * Calculates dispute history factors
   */
  private calculateDisputeHistoryFactors(
    userId: string,
    disputes: P2PDispute[]
  ): ReputationFactors['disputeHistory'] {
    const totalDisputes = disputes.length;
    const resolvedDisputes = disputes.filter(d => d.status === 'resolved').length;
    const disputesWon = disputes.filter(d => 
      d.status === 'resolved' && 
      ((d.initiator.id === userId && d.resolution?.outcome === 'buyer_favor') ||
       (d.respondent.id === userId && d.resolution?.outcome === 'seller_favor'))
    ).length;
    const disputesLost = resolvedDisputes - disputesWon;

    // Calculate dispute rate (disputes per 100 trades)
    const disputeRate = totalDisputes > 0 ? (totalDisputes / 100) * 100 : 0;

    return {
      totalDisputes,
      resolvedDisputes,
      disputesWon,
      disputesLost,
      disputeRate
    };
  }

  /**
   * Calculates communication factors
   */
  private calculateCommunicationFactors(
    userId: string,
    negotiations: P2PNegotiation[]
  ): ReputationFactors['communication'] {
    const allMessages = negotiations.flatMap(n => n.messages);
    const userMessages = allMessages.filter(m => m.senderId === userId);

    // Calculate average response time
    const responseTimes = this.calculateResponseTimes(allMessages, userId);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b) / responseTimes.length 
      : 0;

    // Mock quality ratings (would come from actual reviews)
    const messageQuality = this.getAverageRating(userMessages, 'quality');
    const professionalism = this.getAverageRating(userMessages, 'professionalism');
    const clarity = this.getAverageRating(userMessages, 'clarity');

    return {
      averageResponseTime,
      messageQuality,
      professionalism,
      clarity
    };
  }

  /**
   * Calculates reliability factors
   */
  private calculateReliabilityFactors(
    userId: string,
    negotiations: P2PNegotiation[]
  ): ReputationFactors['reliability'] {
    const completedNegotiations = negotiations.filter(n => n.status === 'completed');
    
    // Mock calculations - would come from actual delivery data
    const onTimeDelivery = completedNegotiations.length > 0 
      ? (completedNegotiations.filter(n => this.wasDeliveredOnTime(n)).length / completedNegotiations.length) * 100
      : 0;

    const qualityConsistency = this.getAverageQualityScore(completedNegotiations);
    const fulfillmentAccuracy = completedNegotiations.length > 0
      ? (completedNegotiations.filter(n => this.wasFulfilledAccurately(n)).length / completedNegotiations.length) * 100
      : 0;

    const cancelledNegotiations = negotiations.filter(n => n.status === 'cancelled');
    const cancellationRate = negotiations.length > 0
      ? (cancelledNegotiations.length / negotiations.length) * 100
      : 0;

    return {
      onTimeDelivery,
      qualityConsistency,
      fulfillmentAccuracy,
      cancellationRate
    };
  }

  /**
   * Calculates verification factors
   */
  private calculateVerificationFactors(userId: string): ReputationFactors['verification'] {
    // Mock verification data - would come from user profile
    return {
      identityVerified: true,
      businessVerified: false,
      certifications: ['ISO 9001', 'Green Energy Certified'],
      backgroundCheckPassed: true
    };
  }

  /**
   * Calculates scores for each category
   */
  private calculateCategoryScores(factors: ReputationFactors): ReputationBreakdown['categories'] {
    return {
      tradeHistory: this.calculateTradeHistoryScore(factors.tradeHistory),
      disputeResolution: this.calculateDisputeResolutionScore(factors.disputeHistory),
      communication: this.calculateCommunicationScore(factors.communication),
      reliability: this.calculateReliabilityScore(factors.reliability),
      verification: this.calculateVerificationScore(factors.verification)
    };
  }

  /**
   * Calculates trade history score (1-5)
   */
  private calculateTradeHistoryScore(tradeHistory: ReputationFactors['tradeHistory']): number {
    let score = 3.0; // Base score

    // Success rate bonus
    const successRate = tradeHistory.totalTrades > 0 
      ? tradeHistory.successfulTrades / tradeHistory.totalTrades 
      : 0;
    score += successRate * 1.5;

    // Trade volume bonus
    if (tradeHistory.totalTrades > 100) score += 0.5;
    else if (tradeHistory.totalTrades > 50) score += 0.3;
    else if (tradeHistory.totalTrades > 20) score += 0.2;

    // Frequency bonus
    if (tradeHistory.tradeFrequency > 5) score += 0.3;
    else if (tradeHistory.tradeFrequency > 2) score += 0.2;

    return Math.min(5.0, Math.max(1.0, score));
  }

  /**
   * Calculates dispute resolution score (1-5)
   */
  private calculateDisputeResolutionScore(disputeHistory: ReputationFactors['disputeHistory']): number {
    let score = 3.0; // Base score

    // Dispute rate penalty
    if (disputeHistory.disputeRate < 5) score += 1.0;
    else if (disputeHistory.disputeRate < 10) score += 0.5;
    else if (disputeHistory.disputeRate > 20) score -= 1.0;

    // Resolution rate bonus
    const resolutionRate = disputeHistory.totalDisputes > 0
      ? disputeHistory.resolvedDisputes / disputeHistory.totalDisputes
      : 1.0;
    score += resolutionRate * 0.5;

    // Win rate bonus
    const winRate = (disputeHistory.disputesWon + disputeHistory.disputesLost) > 0
      ? disputeHistory.disputesWon / (disputeHistory.disputesWon + disputeHistory.disputesLost)
      : 0.5;
    score += (winRate - 0.5) * 0.5;

    return Math.min(5.0, Math.max(1.0, score));
  }

  /**
   * Calculates communication score (1-5)
   */
  private calculateCommunicationScore(communication: ReputationFactors['communication']): number {
    let score = 3.0; // Base score

    // Response time scoring
    if (communication.averageResponseTime < 1) score += 1.0;
    else if (communication.averageResponseTime < 4) score += 0.5;
    else if (communication.averageResponseTime > 24) score -= 1.0;

    // Quality ratings
    score += (communication.messageQuality - 3.0) * 0.3;
    score += (communication.professionalism - 3.0) * 0.3;
    score += (communication.clarity - 3.0) * 0.4;

    return Math.min(5.0, Math.max(1.0, score));
  }

  /**
   * Calculates reliability score (1-5)
   */
  private calculateReliabilityScore(reliability: ReputationFactors['reliability']): number {
    let score = 3.0; // Base score

    // On-time delivery bonus
    score += (reliability.onTimeDelivery / 100 - 0.8) * 2.0;

    // Quality consistency bonus
    score += (reliability.qualityConsistency - 3.0) * 0.5;

    // Fulfillment accuracy bonus
    score += (reliability.fulfillmentAccuracy / 100 - 0.8) * 1.5;

    // Cancellation rate penalty
    if (reliability.cancellationRate > 10) score -= 1.0;
    else if (reliability.cancellationRate > 5) score -= 0.5;

    return Math.min(5.0, Math.max(1.0, score));
  }

  /**
   * Calculates verification score (1-5)
   */
  private calculateVerificationScore(verification: ReputationFactors['verification']): number {
    let score = 2.0; // Base score

    if (verification.identityVerified) score += 1.0;
    if (verification.businessVerified) score += 1.0;
    if (verification.backgroundCheckPassed) score += 0.5;
    if (verification.certifications.length > 0) score += 0.5;

    return Math.min(5.0, Math.max(1.0, score));
  }

  /**
   * Calculates overall reputation score
   */
  private calculateOverallScore(categories: ReputationBreakdown['categories']): number {
    const weightedSum = Object.entries(categories).reduce((sum, [category, score]) => {
      return sum + (score * this.weights[category as keyof typeof this.weights]);
    }, 0);

    return Math.round(weightedSum * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculates reputation trend
   */
  private calculateTrend(factors: ReputationFactors): 'improving' | 'declining' | 'stable' {
    // Simplified trend calculation based on recent performance
    const successRate = factors.tradeHistory.totalTrades > 0 
      ? factors.tradeHistory.successfulTrades / factors.tradeHistory.totalTrades 
      : 0;

    if (successRate > 0.9 && factors.disputeHistory.disputeRate < 5) {
      return 'improving';
    } else if (successRate < 0.7 || factors.disputeHistory.disputeRate > 15) {
      return 'declining';
    } else {
      return 'stable';
    }
  }

  /**
   * Calculates confidence score in the reputation calculation
   */
  private calculateConfidence(factors: ReputationFactors): number {
    let confidence = 0.5; // Base confidence

    // More trades = higher confidence
    if (factors.tradeHistory.totalTrades > 100) confidence += 0.3;
    else if (factors.tradeHistory.totalTrades > 50) confidence += 0.2;
    else if (factors.tradeHistory.totalTrades > 20) confidence += 0.1;

    // Recent activity = higher confidence
    if (factors.tradeHistory.tradeFrequency > 2) confidence += 0.2;

    return Math.min(1.0, confidence);
  }

  /**
   * Calculates user rank among all users
   */
  private async calculateRank(userId: string, score: number): Promise<{ rank: number; totalUsers: number }> {
    // Mock implementation - would query database
    const totalUsers = 1247;
    const rank = Math.floor((1 - score / 5) * totalUsers) + 1;
    
    return { rank, totalUsers };
  }

  /**
   * Calculates response times for messages
   */
  private calculateResponseTimes(messages: any[], userId: string): number[] {
    const responseTimes: number[] = [];
    
    for (let i = 1; i < messages.length; i++) {
      const currentMessage = messages[i];
      const previousMessage = messages[i - 1];
      
      if (currentMessage.senderId === userId && previousMessage.senderId !== userId) {
        const responseTime = new Date(currentMessage.timestamp).getTime() - 
                           new Date(previousMessage.timestamp).getTime();
        responseTimes.push(responseTime / (1000 * 60 * 60)); // Convert to hours
      }
    }
    
    return responseTimes;
  }

  /**
   * Gets average rating for messages (mock implementation)
   */
  private getAverageRating(messages: any[], ratingType: string): number {
    // Mock implementation - would come from actual ratings
    return 4.0;
  }

  /**
   * Checks if delivery was on time (mock implementation)
   */
  private wasDeliveredOnTime(negotiation: P2PNegotiation): boolean {
    // Mock implementation - would check actual delivery data
    return Math.random() > 0.2; // 80% on-time delivery
  }

  /**
   * Gets average quality score (mock implementation)
   */
  private getAverageQualityScore(negotiations: P2PNegotiation[]): number {
    // Mock implementation - would come from actual quality ratings
    return 4.2;
  }

  /**
   * Checks if fulfillment was accurate (mock implementation)
   */
  private wasFulfilledAccurately(negotiation: P2PNegotiation): boolean {
    // Mock implementation - would check actual fulfillment data
    return Math.random() > 0.15; // 85% accurate fulfillment
  }

  /**
   * Updates reputation based on an event
   */
  async updateReputation(
    userId: string,
    event: ReputationEvent
  ): Promise<number> {
    // This would update the user's reputation in the database
    console.log(`Updating reputation for user ${userId} with event:`, event);
    
    // Return the new reputation score
    return 4.2; // Mock implementation
  }

  /**
   * Gets reputation tier
   */
  getReputationTier(score: number): { tier: string; color: string; benefits: string[] } {
    if (score >= this.thresholds.excellent) {
      return {
        tier: 'Excellent',
        color: 'green',
        benefits: ['Priority support', 'Lower fees', 'Featured listings', 'Advanced analytics']
      };
    } else if (score >= this.thresholds.veryGood) {
      return {
        tier: 'Very Good',
        color: 'blue',
        benefits: ['Standard support', 'Reduced fees', 'Enhanced visibility']
      };
    } else if (score >= this.thresholds.good) {
      return {
        tier: 'Good',
        color: 'yellow',
        benefits: ['Basic support', 'Standard visibility']
      };
    } else if (score >= this.thresholds.fair) {
      return {
        tier: 'Fair',
        color: 'orange',
        benefits: ['Limited support', 'Basic visibility']
      };
    } else {
      return {
        tier: 'Poor',
        color: 'red',
        benefits: ['Restricted access', 'Limited visibility']
      };
    }
  }

  /**
   * Updates calculation weights
   */
  updateWeights(newWeights: Partial<typeof this.weights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  /**
   * Updates thresholds
   */
  updateThresholds(newThresholds: Partial<ReputationThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }
}

export default ReputationCalculator;
