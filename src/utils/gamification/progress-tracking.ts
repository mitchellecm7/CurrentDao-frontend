interface ProgressEvent {
  id: string;
  userId: string;
  eventType: 'trade' | 'energy_save' | 'carbon_reduction' | 'login' | 'achievement' | 'challenge_join' | 'challenge_complete';
  timestamp: Date;
  data: {
    value?: number;
    category?: string;
    metadata?: Record<string, any>;
  };
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  category: 'trading' | 'energy' | 'sustainability' | 'social' | 'milestone';
  achieved: boolean;
  achievedAt?: Date;
  nextMilestone?: Milestone;
}

interface ProgressAnalytics {
  userId: string;
  timeRange: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  metrics: {
    trades: number;
    volume: number;
    energySaved: number;
    carbonReduced: number;
    achievements: number;
    challengesCompleted: number;
    streakDays: number;
  };
  trends: {
    trading: 'increasing' | 'decreasing' | 'stable';
    energy: 'improving' | 'declining' | 'stable';
    sustainability: 'enhancing' | 'worsening' | 'stable';
  };
  insights: string[];
  recommendations: string[];
}

interface UserProgress {
  userId: string;
  currentLevel: number;
  currentExp: number;
  expToNextLevel: number;
  totalTrades: number;
  totalVolume: number;
  totalEnergySaved: number;
  totalCarbonReduced: number;
  currentStreak: number;
  bestStreak: number;
  achievementsUnlocked: number;
  challengesCompleted: number;
  lastActiveDate: Date;
  weeklyProgress: number;
  monthlyProgress: number;
}

class ProgressTracker {
  private progressEvents: ProgressEvent[] = [];
  private userProgress: Map<string, UserProgress> = new Map();
  private milestones: Map<string, Milestone[]> = new Map();

  constructor() {
    this.initializeMilestones();
  }

  private initializeMilestones() {
    // Trading milestones
    this.milestones.set('trading', [
      {
        id: 'trading-novice',
        title: 'Trading Novice',
        description: 'Complete your first 10 trades',
        target: 10,
        current: 0,
        category: 'trading',
        achieved: false
      },
      {
        id: 'trading-intermediate',
        title: 'Trading Intermediate',
        description: 'Complete 50 successful trades',
        target: 50,
        current: 0,
        category: 'trading',
        achieved: false,
        nextMilestone: undefined
      },
      {
        id: 'trading-advanced',
        title: 'Trading Advanced',
        description: 'Complete 200 successful trades',
        target: 200,
        current: 0,
        category: 'trading',
        achieved: false
      },
      {
        id: 'trading-expert',
        title: 'Trading Expert',
        description: 'Complete 500 successful trades',
        target: 500,
        current: 0,
        category: 'trading',
        achieved: false
      },
      {
        id: 'trading-master',
        title: 'Trading Master',
        description: 'Complete 1000 successful trades',
        target: 1000,
        current: 0,
        category: 'trading',
        achieved: false
      }
    ]);

    // Energy milestones
    this.milestones.set('energy', [
      {
        id: 'energy-starter',
        title: 'Energy Starter',
        description: 'Save 100 kWh of energy',
        target: 100,
        current: 0,
        category: 'energy',
        achieved: false
      },
      {
        id: 'energy-saver',
        title: 'Energy Saver',
        description: 'Save 500 kWh of energy',
        target: 500,
        current: 0,
        category: 'energy',
        achieved: false
      },
      {
        id: 'energy-guardian',
        title: 'Energy Guardian',
        description: 'Save 2000 kWh of energy',
        target: 2000,
        current: 0,
        category: 'energy',
        achieved: false
      },
      {
        id: 'energy-master',
        title: 'Energy Master',
        description: 'Save 5000 kWh of energy',
        target: 5000,
        current: 0,
        category: 'energy',
        achieved: false
      }
    ]);

    // Sustainability milestones
    this.milestones.set('sustainability', [
      {
        id: 'sustainability-beginner',
        title: 'Sustainability Beginner',
        description: 'Reduce carbon footprint by 5%',
        target: 5,
        current: 0,
        category: 'sustainability',
        achieved: false
      },
      {
        id: 'sustainability-intermediate',
        title: 'Sustainability Intermediate',
        description: 'Reduce carbon footprint by 15%',
        target: 15,
        current: 0,
        category: 'sustainability',
        achieved: false
      },
      {
        id: 'sustainability-advanced',
        title: 'Sustainability Advanced',
        description: 'Reduce carbon footprint by 30%',
        target: 30,
        current: 0,
        category: 'sustainability',
        achieved: false
      },
      {
        id: 'sustainability-expert',
        title: 'Sustainability Expert',
        description: 'Reduce carbon footprint by 50%',
        target: 50,
        current: 0,
        category: 'sustainability',
        achieved: false
      }
    ]);

    // Social milestones
    this.milestones.set('social', [
      {
        id: 'social-connector',
        title: 'Social Connector',
        description: 'Refer 5 friends to CurrentDao',
        target: 5,
        current: 0,
        category: 'social',
        achieved: false
      },
      {
        id: 'social-networker',
        title: 'Social Networker',
        description: 'Refer 15 friends to CurrentDao',
        target: 15,
        current: 0,
        category: 'social',
        achieved: false
      },
      {
        id: 'social-influencer',
        title: 'Social Influencer',
        description: 'Refer 50 friends to CurrentDao',
        target: 50,
        current: 0,
        category: 'social',
        achieved: false
      }
    ]);
  }

  public trackEvent(event: ProgressEvent): void {
    this.progressEvents.push(event);
    this.updateUserProgress(event);
    this.checkMilestones(event);
  }

  private updateUserProgress(event: ProgressEvent): void {
    const userId = event.userId;
    let progress = this.userProgress.get(userId);

    if (!progress) {
      progress = this.initializeUserProgress(userId);
      this.userProgress.set(userId, progress);
    }

    switch (event.eventType) {
      case 'trade':
        progress.totalTrades += (event.data.value || 1);
        progress.totalVolume += (event.data.metadata?.volume || 0);
        progress.currentExp += (event.data.metadata?.exp || 10);
        break;
      case 'energy_save':
        progress.totalEnergySaved += (event.data.value || 0);
        progress.currentExp += (event.data.metadata?.exp || 5);
        break;
      case 'carbon_reduction':
        progress.totalCarbonReduced += (event.data.value || 0);
        progress.currentExp += (event.data.metadata?.exp || 15);
        break;
      case 'login':
        this.updateStreak(progress, event.timestamp);
        progress.currentExp += 5;
        break;
      case 'achievement':
        progress.achievementsUnlocked += 1;
        progress.currentExp += 50;
        break;
      case 'challenge_complete':
        progress.challengesCompleted += 1;
        progress.currentExp += (event.data.metadata?.exp || 100);
        break;
    }

    progress.lastActiveDate = event.timestamp;
    this.updateLevel(progress);
    this.calculateProgressRates(progress);
    this.userProgress.set(userId, progress);
  }

  private updateStreak(progress: UserProgress, timestamp: Date): void {
    const today = new Date(timestamp);
    today.setHours(0, 0, 0, 0);
    
    const lastActive = new Date(progress.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      progress.currentStreak += 1;
      if (progress.currentStreak > progress.bestStreak) {
        progress.bestStreak = progress.currentStreak;
      }
    } else if (daysDiff > 1) {
      progress.currentStreak = 1;
    }
  }

  private updateLevel(progress: UserProgress): void {
    const expPerLevel = 1000;
    const newLevel = Math.floor(progress.currentExp / expPerLevel) + 1;
    
    if (newLevel > progress.currentLevel) {
      progress.currentLevel = newLevel;
    }
    
    progress.expToNextLevel = (newLevel * expPerLevel) - progress.currentExp;
  }

  private calculateProgressRates(progress: UserProgress): void {
    // Calculate weekly and monthly progress rates
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setMonth(now.getMonth() - 1);

    const recentEvents = this.progressEvents.filter(event => 
      event.userId === progress.userId && 
      event.timestamp >= weekStart
    );

    const weeklyTrades = recentEvents.filter(e => e.eventType === 'trade').length;
    const weeklyChallenges = recentEvents.filter(e => e.eventType === 'challenge_complete').length;
    
    progress.weeklyProgress = Math.min(100, (weeklyTrades / 10) * 100 + (weeklyChallenges / 3) * 100);
    progress.monthlyProgress = Math.min(100, (weeklyTrades / 40) * 100 + (weeklyChallenges / 12) * 100);
  }

  private checkMilestones(event: ProgressEvent): void {
    const userId = event.userId;
    const progress = this.userProgress.get(userId);
    if (!progress) return;

    for (const [category, milestones] of this.milestones) {
      for (const milestone of milestones) {
        if (milestone.achieved) continue;

        let currentValue = 0;
        switch (category) {
          case 'trading':
            currentValue = progress.totalTrades;
            break;
          case 'energy':
            currentValue = progress.totalEnergySaved;
            break;
          case 'sustainability':
            currentValue = progress.totalCarbonReduced;
            break;
          case 'social':
            currentValue = event.data.metadata?.referrals || 0;
            break;
        }

        if (currentValue >= milestone.target) {
          milestone.current = currentValue;
          milestone.achieved = true;
          milestone.achievedAt = event.timestamp;
          
          // Award milestone bonus
          progress.currentExp += 200;
        } else {
          milestone.current = currentValue;
        }
      }
    }
  }

  private initializeUserProgress(userId: string): UserProgress {
    return {
      userId,
      currentLevel: 1,
      currentExp: 0,
      expToNextLevel: 1000,
      totalTrades: 0,
      totalVolume: 0,
      totalEnergySaved: 0,
      totalCarbonReduced: 0,
      currentStreak: 0,
      bestStreak: 0,
      achievementsUnlocked: 0,
      challengesCompleted: 0,
      lastActiveDate: new Date(),
      weeklyProgress: 0,
      monthlyProgress: 0
    };
  }

  public getUserProgress(userId: string): UserProgress | undefined {
    return this.userProgress.get(userId);
  }

  public getMilestones(userId: string, category?: string): Milestone[] {
    const userMilestones: Milestone[] = [];
    
    for (const [cat, milestones] of this.milestones) {
      if (category && cat !== category) continue;
      
      userMilestones.push(...milestones);
    }
    
    return userMilestones;
  }

  public getProgressAnalytics(userId: string, timeRange: 'daily' | 'weekly' | 'monthly' | 'yearly'): ProgressAnalytics {
    const progress = this.userProgress.get(userId);
    if (!progress) {
      throw new Error(`No progress found for user ${userId}`);
    }

    const now = new Date();
    const startDate = new Date(now);
    
    switch (timeRange) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const eventsInRange = this.progressEvents.filter(event => 
      event.userId === userId && 
      event.timestamp >= startDate && 
      event.timestamp <= now
    );

    const metrics = {
      trades: eventsInRange.filter(e => e.eventType === 'trade').length,
      volume: eventsInRange.filter(e => e.eventType === 'trade')
        .reduce((sum, e) => sum + (e.data.metadata?.volume || 0), 0),
      energySaved: eventsInRange.filter(e => e.eventType === 'energy_save')
        .reduce((sum, e) => sum + (e.data.value || 0), 0),
      carbonReduced: eventsInRange.filter(e => e.eventType === 'carbon_reduction')
        .reduce((sum, e) => sum + (e.data.value || 0), 0),
      achievements: eventsInRange.filter(e => e.eventType === 'achievement').length,
      challengesCompleted: eventsInRange.filter(e => e.eventType === 'challenge_complete').length,
      streakDays: this.calculateStreakDays(eventsInRange)
    };

    const trends = this.calculateTrends(eventsInRange, timeRange);
    const insights = this.generateInsights(metrics, trends);
    const recommendations = this.generateRecommendations(metrics, trends);

    return {
      userId,
      timeRange,
      startDate,
      endDate: now,
      metrics,
      trends,
      insights,
      recommendations
    };
  }

  private calculateStreakDays(events: ProgressEvent[]): number {
    const tradingDays = new Set(
      events
        .filter(e => e.eventType === 'trade')
        .map(e => {
          const date = new Date(e.timestamp);
          return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        })
    );
    
    return tradingDays.size;
  }

  private calculateTrends(events: ProgressEvent[], timeRange: string): ProgressAnalytics['trends'] {
    const tradingEvents = events.filter(e => e.eventType === 'trade');
    const energyEvents = events.filter(e => e.eventType === 'energy_save');
    const carbonEvents = events.filter(e => e.eventType === 'carbon_reduction');

    return {
      trading: this.calculateTrend(tradingEvents, 'volume'),
      energy: this.calculateTrend(energyEvents, 'value'),
      sustainability: this.calculateTrend(carbonEvents, 'value')
    };
  }

  private calculateTrend(events: ProgressEvent[], valueField: string): 'increasing' | 'decreasing' | 'stable' {
    if (events.length < 2) return 'stable';

    const sortedEvents = events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const firstHalf = sortedEvents.slice(0, Math.floor(sortedEvents.length / 2));
    const secondHalf = sortedEvents.slice(Math.floor(sortedEvents.length / 2));

    const firstAvg = firstHalf.reduce((sum, e) => sum + (e.data[valueField] || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, e) => sum + (e.data[valueField] || 0), 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;
    const threshold = Math.max(Math.abs(firstAvg), Math.abs(secondAvg)) * 0.1;

    if (Math.abs(difference) < threshold) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }

  private generateInsights(metrics: ProgressAnalytics['metrics'], trends: ProgressAnalytics['trends']): string[] {
    const insights: string[] = [];

    if (metrics.trades > 0) {
      insights.push(`You've completed ${metrics.trades} trades in this period.`);
    }

    if (trends.trading === 'increasing') {
      insights.push('Your trading volume is consistently increasing.');
    } else if (trends.trading === 'decreasing') {
      insights.push('Your trading activity has decreased recently.');
    }

    if (metrics.energySaved > 100) {
      insights.push(`Great job! You've saved ${metrics.energySaved} kWh of energy.`);
    }

    if (trends.sustainability === 'enhancing') {
      insights.push('Your sustainability efforts are showing positive results.');
    }

    if (metrics.streakDays > 5) {
      insights.push(`You've been active for ${metrics.streakDays} days this period.`);
    }

    return insights;
  }

  private generateRecommendations(metrics: ProgressAnalytics['metrics'], trends: ProgressAnalytics['trends']): string[] {
    const recommendations: string[] = [];

    if (trends.trading === 'decreasing') {
      recommendations.push('Consider setting daily trading goals to maintain consistency.');
    }

    if (metrics.energySaved < 50) {
      recommendations.push('Focus on energy optimization to increase your savings.');
    }

    if (trends.sustainability === 'worsening') {
      recommendations.push('Review your energy consumption patterns for improvement opportunities.');
    }

    if (metrics.challengesCompleted < 2) {
      recommendations.push('Join more challenges to accelerate your progress.');
    }

    if (metrics.achievements === 0) {
      recommendations.push('Start unlocking achievements to earn bonus rewards.');
    }

    return recommendations;
  }

  public getProgressSummary(userId: string): {
    totalProgress: UserProgress;
    milestones: Milestone[];
    recentActivity: ProgressEvent[];
    nextGoals: string[];
  } {
    const progress = this.userProgress.get(userId);
    if (!progress) {
      throw new Error(`No progress found for user ${userId}`);
    }

    const milestones = this.getMilestones(userId);
    const recentActivity = this.progressEvents
      .filter(e => e.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    const nextGoals = this.generateNextGoals(progress, milestones);

    return {
      totalProgress: progress,
      milestones,
      recentActivity,
      nextGoals
    };
  }

  private generateNextGoals(progress: UserProgress, milestones: Milestone[]): string[] {
    const goals: string[] = [];

    // Next level goal
    if (progress.expToNextLevel > 0) {
      goals.push(`Earn ${progress.expToNextLevel} more experience to reach level ${progress.currentLevel + 1}`);
    }

    // Next milestone goals
    for (const milestone of milestones) {
      if (!milestone.achieved) {
        const remaining = milestone.target - milestone.current;
        goals.push(`${milestone.title}: ${remaining} more to complete`);
      }
    }

    // Streak goal
    if (progress.currentStreak < 7) {
      goals.push(`Maintain trading streak for ${7 - progress.currentStreak} more days`);
    }

    return goals;
  }

  public exportProgressData(userId: string): {
    progress: UserProgress;
    events: ProgressEvent[];
    milestones: Milestone[];
    analytics: ProgressAnalytics;
  } {
    const progress = this.userProgress.get(userId);
    if (!progress) {
      throw new Error(`No progress found for user ${userId}`);
    }

    const events = this.progressEvents.filter(e => e.userId === userId);
    const milestones = this.getMilestones(userId);
    const analytics = this.getProgressAnalytics(userId, 'monthly');

    return {
      progress,
      events,
      milestones,
      analytics
    };
  }
}

export default ProgressTracker;
