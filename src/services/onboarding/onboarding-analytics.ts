import { 
  OnboardingAnalytics, 
  ProgressTracker, 
  Achievement, 
  UserGoals,
  UserProfile,
  InteractiveTutorial 
} from '../../types/onboarding';

export interface AnalyticsEvent {
  type: 'tutorial_start' | 'tutorial_complete' | 'step_start' | 'step_complete' | 'step_skip' | 'help_request' | 'achievement_unlock' | 'engagement';
  timestamp: Date;
  userId: string;
  sessionId: string;
  data: any;
}

export interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  completionRate: number;
  averageTimeToComplete: number;
  dropoffRate: number;
  mostPopularTutorial: string;
  leastPopularTutorial: string;
  averageEngagementScore: number;
  helpRequestRate: number;
  achievementUnlockRate: number;
  userSatisfactionScore: number;
}

export interface UserAnalytics {
  userId: string;
  sessions: OnboardingAnalytics[];
  totalSessions: number;
  totalTimeSpent: number;
  completionRate: number;
  averageSessionTime: number;
  lastActivity: Date;
  achievements: Achievement[];
  helpRequests: number;
  engagementScore: number;
  progressMetrics: any;
}

export interface TutorialAnalytics {
  tutorialId: string;
  totalAttempts: number;
  completions: number;
  averageTimeToComplete: number;
  dropoffPoints: number[];
  averageEngagement: any;
  difficultyRating: number;
  userSatisfaction: number;
  improvementSuggestions: string[];
}

export interface RealtimeAnalytics {
  activeUsers: number;
  currentSessions: number;
  popularTutorials: Array<{ tutorialId: string; activeUsers: number }>;
  recentCompletions: Array<{ userId: string; tutorialId: string; timestamp: Date }>;
  recentAchievements: Array<{ userId: string; achievementId: string; timestamp: Date }>;
}

export class OnboardingAnalyticsService {
  private events: AnalyticsEvent[] = [];
  private userAnalytics: Map<string, UserAnalytics> = new Map();
  private tutorialAnalytics: Map<string, TutorialAnalytics> = new Map();
  private realtimeData: RealtimeAnalytics;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.realtimeData = {
      activeUsers: 0,
      currentSessions: 0,
      popularTutorials: [],
      recentCompletions: [],
      recentAchievements: []
    };
  }

  // Track analytics event
  trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date()
    };

    this.events.push(fullEvent);
    this.updateAnalytics(fullEvent);
    this.emit('event-tracked', fullEvent);
  }

  // Update analytics based on event
  private updateAnalytics(event: AnalyticsEvent): void {
    switch (event.type) {
      case 'tutorial_start':
        this.handleTutorialStart(event);
        break;
      case 'tutorial_complete':
        this.handleTutorialComplete(event);
        break;
      case 'step_start':
        this.handleStepStart(event);
        break;
      case 'step_complete':
        this.handleStepComplete(event);
        break;
      case 'step_skip':
        this.handleStepSkip(event);
        break;
      case 'help_request':
        this.handleHelpRequest(event);
        break;
      case 'achievement_unlock':
        this.handleAchievementUnlock(event);
        break;
      case 'engagement':
        this.handleEngagement(event);
        break;
    }
  }

  // Handle tutorial start event
  private handleTutorialStart(event: AnalyticsEvent): void {
    // Update user analytics
    this.updateUserAnalytics(event.userId, (userAnalytics) => {
      userAnalytics.totalSessions++;
      userAnalytics.lastActivity = event.timestamp;
    });

    // Update tutorial analytics
    this.updateTutorialAnalytics(event.data.tutorialId, (tutorialAnalytics) => {
      tutorialAnalytics.totalAttempts++;
    });

    // Update realtime data
    this.realtimeData.activeUsers++;
    this.realtimeData.currentSessions++;
    this.updatePopularTutorials(event.data.tutorialId, 1);
  }

  // Handle tutorial complete event
  private handleTutorialComplete(event: AnalyticsEvent): void {
    // Update user analytics
    this.updateUserAnalytics(event.userId, (userAnalytics) => {
      const sessionDuration = event.data.timeSpent || 0;
      userAnalytics.totalTimeSpent += sessionDuration;
      userAnalytics.averageSessionTime = userAnalytics.totalTimeSpent / userAnalytics.totalSessions;
      userAnalytics.lastActivity = event.timestamp;
      
      // Recalculate completion rate
      const completedSessions = this.events.filter(e => 
        e.userId === event.userId && e.type === 'tutorial_complete'
      ).length;
      userAnalytics.completionRate = completedSessions / userAnalytics.totalSessions;
    });

    // Update tutorial analytics
    this.updateTutorialAnalytics(event.data.tutorialId, (tutorialAnalytics) => {
      tutorialAnalytics.completions++;
      const timeSpent = event.data.timeSpent || 0;
      tutorialAnalytics.averageTimeToComplete = 
        (tutorialAnalytics.averageTimeToComplete * (tutorialAnalytics.completions - 1) + timeSpent) / 
        tutorialAnalytics.completions;
    });

    // Update realtime data
    this.realtimeData.currentSessions--;
    this.realtimeData.recentCompletions.push({
      userId: event.userId,
      tutorialId: event.data.tutorialId,
      timestamp: event.timestamp
    });

    // Keep only recent completions (last 10)
    if (this.realtimeData.recentCompletions.length > 10) {
      this.realtimeData.recentCompletions = this.realtimeData.recentCompletions.slice(-10);
    }
  }

  // Handle step start event
  private handleStepStart(event: AnalyticsEvent): void {
    this.updateUserAnalytics(event.userId, (userAnalytics) => {
      userAnalytics.lastActivity = event.timestamp;
    });
  }

  // Handle step complete event
  private handleStepComplete(event: AnalyticsEvent): void {
    this.updateUserAnalytics(event.userId, (userAnalytics) => {
      userAnalytics.lastActivity = event.timestamp;
      userAnalytics.engagementScore += 5; // Points for completing steps
    });
  }

  // Handle step skip event
  private handleStepSkip(event: AnalyticsEvent): void {
    // Update tutorial analytics dropoff points
    this.updateTutorialAnalytics(event.data.tutorialId, (tutorialAnalytics) => {
      tutorialAnalytics.dropoffPoints.push(event.data.stepIndex);
    });
  }

  // Handle help request event
  private handleHelpRequest(event: AnalyticsEvent): void {
    this.updateUserAnalytics(event.userId, (userAnalytics) => {
      userAnalytics.helpRequests++;
      userAnalytics.lastActivity = event.timestamp;
    });
  }

  // Handle achievement unlock event
  private handleAchievementUnlock(event: AnalyticsEvent): void {
    this.updateUserAnalytics(event.userId, (userAnalytics) => {
      userAnalytics.achievements.push(event.data.achievement);
      userAnalytics.lastActivity = event.timestamp;
      userAnalytics.engagementScore += 20; // Bonus points for achievements
    });

    // Update realtime data
    this.realtimeData.recentAchievements.push({
      userId: event.userId,
      achievementId: event.data.achievement.id,
      timestamp: event.timestamp
    });

    // Keep only recent achievements (last 10)
    if (this.realtimeData.recentAchievements.length > 10) {
      this.realtimeData.recentAchievements = this.realtimeData.recentAchievements.slice(-10);
    }
  }

  // Handle engagement event
  private handleEngagement(event: AnalyticsEvent): void {
    this.updateUserAnalytics(event.userId, (userAnalytics) => {
      userAnalytics.lastActivity = event.timestamp;
      
      // Add engagement points based on type
      const engagementPoints = {
        click: 1,
        hover: 0.5,
        scroll: 0.3,
        help_request: 2
      };
      
      const points = engagementPoints[event.data.engagementType] || 0;
      userAnalytics.engagementScore += points;
    });
  }

  // Update user analytics
  private updateUserAnalytics(userId: string, updateFn: (analytics: UserAnalytics) => void): void {
    if (!this.userAnalytics.has(userId)) {
      this.userAnalytics.set(userId, {
        userId,
        sessions: [],
        totalSessions: 0,
        totalTimeSpent: 0,
        completionRate: 0,
        averageSessionTime: 0,
        lastActivity: new Date(),
        achievements: [],
        helpRequests: 0,
        engagementScore: 0,
        progressMetrics: {}
      });
    }

    const userAnalytics = this.userAnalytics.get(userId)!;
    updateFn(userAnalytics);
  }

  // Update tutorial analytics
  private updateTutorialAnalytics(tutorialId: string, updateFn: (analytics: TutorialAnalytics) => void): void {
    if (!this.tutorialAnalytics.has(tutorialId)) {
      this.tutorialAnalytics.set(tutorialId, {
        tutorialId,
        totalAttempts: 0,
        completions: 0,
        averageTimeToComplete: 0,
        dropoffPoints: [],
        averageEngagement: {},
        difficultyRating: 0,
        userSatisfaction: 0,
        improvementSuggestions: []
      });
    }

    const tutorialAnalytics = this.tutorialAnalytics.get(tutorialId)!;
    updateFn(tutorialAnalytics);
  }

  // Update popular tutorials
  private updatePopularTutorials(tutorialId: string, delta: number): void {
    const existing = this.realtimeData.popularTutorials.find(t => t.tutorialId === tutorialId);
    if (existing) {
      existing.activeUsers += delta;
    } else {
      this.realtimeData.popularTutorials.push({ tutorialId, activeUsers: delta });
    }

    // Sort by active users and keep top 5
    this.realtimeData.popularTutorials.sort((a, b) => b.activeUsers - a.activeUsers);
    this.realtimeData.popularTutorials = this.realtimeData.popularTutorials.slice(0, 5);
  }

  // Get overall analytics metrics
  getOverallMetrics(): AnalyticsMetrics {
    const totalUsers = this.userAnalytics.size;
    const activeUsers = this.realtimeData.activeUsers;
    
    // Calculate completion rate
    const totalSessions = Array.from(this.userAnalytics.values())
      .reduce((sum, user) => sum + user.totalSessions, 0);
    const totalCompletions = this.events.filter(e => e.type === 'tutorial_complete').length;
    const completionRate = totalSessions > 0 ? (totalCompletions / totalSessions) * 100 : 0;

    // Calculate average time to complete
    const completedTutorials = Array.from(this.tutorialAnalytics.values())
      .filter(t => t.completions > 0);
    const averageTimeToComplete = completedTutorials.length > 0
      ? completedTutorials.reduce((sum, t) => sum + t.averageTimeToComplete, 0) / completedTutorials.length
      : 0;

    // Calculate dropoff rate
    const dropoffRate = 100 - completionRate;

    // Find most and least popular tutorials
    const tutorialStats = Array.from(this.tutorialAnalytics.entries())
      .map(([id, analytics]) => ({ id, attempts: analytics.totalAttempts }));
    
    const mostPopularTutorial = tutorialStats.length > 0
      ? tutorialStats.reduce((max, current) => current.attempts > max.attempts ? current : max).id
      : '';
    
    const leastPopularTutorial = tutorialStats.length > 0
      ? tutorialStats.reduce((min, current) => current.attempts < min.attempts ? current : min).id
      : '';

    // Calculate average engagement score
    const totalEngagement = Array.from(this.userAnalytics.values())
      .reduce((sum, user) => sum + user.engagementScore, 0);
    const averageEngagementScore = totalUsers > 0 ? totalEngagement / totalUsers : 0;

    // Calculate help request rate
    const totalHelpRequests = Array.from(this.userAnalytics.values())
      .reduce((sum, user) => sum + user.helpRequests, 0);
    const helpRequestRate = totalSessions > 0 ? (totalHelpRequests / totalSessions) * 100 : 0;

    // Calculate achievement unlock rate
    const totalAchievements = Array.from(this.userAnalytics.values())
      .reduce((sum, user) => sum + user.achievements.length, 0);
    const achievementUnlockRate = totalUsers > 0 ? (totalAchievements / totalUsers) : 0;

    // User satisfaction score (mock calculation based on engagement and completion)
    const userSatisfactionScore = (completionRate + averageEngagementScore) / 2;

    return {
      totalUsers,
      activeUsers,
      completionRate,
      averageTimeToComplete,
      dropoffRate,
      mostPopularTutorial,
      leastPopularTutorial,
      averageEngagementScore,
      helpRequestRate,
      achievementUnlockRate,
      userSatisfactionScore
    };
  }

  // Get user analytics
  getUserAnalytics(userId: string): UserAnalytics | null {
    return this.userAnalytics.get(userId) || null;
  }

  // Get tutorial analytics
  getTutorialAnalytics(tutorialId: string): TutorialAnalytics | null {
    return this.tutorialAnalytics.get(tutorialId) || null;
  }

  // Get realtime analytics
  getRealtimeAnalytics(): RealtimeAnalytics {
    return { ...this.realtimeData };
  }

  // Generate insights and recommendations
  generateInsights(): any {
    const metrics = this.getOverallMetrics();
    const insights = [];

    // Completion rate insights
    if (metrics.completionRate < 70) {
      insights.push({
        type: 'low_completion_rate',
        severity: 'high',
        message: `Completion rate is only ${metrics.completionRate.toFixed(1)}%. Consider simplifying tutorials or adding more guidance.`,
        recommendations: ['Add more interactive elements', 'Break down complex steps', 'Provide better onboarding support']
      });
    }

    // Help request insights
    if (metrics.helpRequestRate > 30) {
      insights.push({
        type: 'high_help_requests',
        severity: 'medium',
        message: `Help request rate is ${metrics.helpRequestRate.toFixed(1)}%. Users may need additional support.`,
        recommendations: ['Improve tutorial clarity', 'Add contextual help', 'Create video tutorials']
      });
    }

    // Engagement insights
    if (metrics.averageEngagementScore < 50) {
      insights.push({
        type: 'low_engagement',
        severity: 'medium',
        message: `Average engagement score is ${metrics.averageEngagementScore.toFixed(1)}. Tutorials may not be engaging enough.`,
        recommendations: ['Add gamification elements', 'Include more interactive content', 'Personalize content based on user goals']
      });
    }

    // Time to complete insights
    if (metrics.averageTimeToComplete > 1800000) { // 30 minutes
      insights.push({
        type: 'long_completion_time',
        severity: 'medium',
        message: `Average completion time is ${Math.round(metrics.averageTimeToComplete / 60000)} minutes. Tutorials may be too long.`,
        recommendations: ['Break tutorials into smaller modules', 'Add progress checkpoints', 'Provide estimated time upfront']
      });
    }

    return insights;
  }

  // Get tutorial performance comparison
  getTutorialComparison(): any {
    const tutorials = Array.from(this.tutorialAnalytics.values());
    
    return tutorials
      .map(tutorial => ({
        tutorialId: tutorial.tutorialId,
        completionRate: tutorial.totalAttempts > 0 ? (tutorial.completions / tutorial.totalAttempts) * 100 : 0,
        averageTime: tutorial.averageTimeToComplete,
        dropoffRate: this.calculateDropoffRate(tutorial.dropoffPoints, tutorial.totalAttempts),
        engagement: tutorial.averageEngagement,
        difficulty: this.assessDifficulty(tutorial)
      }))
      .sort((a, b) => b.completionRate - a.completionRate);
  }

  // Calculate dropoff rate
  private calculateDropoffRate(dropoffPoints: number[], totalAttempts: number): number {
    if (totalAttempts === 0) return 0;
    return (dropoffPoints.length / totalAttempts) * 100;
  }

  // Assess tutorial difficulty
  private assessDifficulty(tutorial: TutorialAnalytics): 'easy' | 'medium' | 'hard' {
    const completionRate = tutorial.totalAttempts > 0 ? (tutorial.completions / tutorial.totalAttempts) * 100 : 0;
    const avgTime = tutorial.averageTimeToComplete;
    const dropoffRate = this.calculateDropoffRate(tutorial.dropoffPoints, tutorial.totalAttempts);

    if (completionRate > 80 && avgTime < 600000 && dropoffRate < 20) return 'easy';
    if (completionRate > 50 && avgTime < 1200000 && dropoffRate < 40) return 'medium';
    return 'hard';
  }

  // Get user segmentation
  getUserSegmentation(): any {
    const users = Array.from(this.userAnalytics.values());
    
    const segments = {
      new_users: users.filter(u => u.totalSessions <= 1).length,
      active_users: users.filter(u => u.totalSessions > 1 && u.completionRate > 50).length,
      struggling_users: users.filter(u => u.completionRate < 30 && u.helpRequests > 3).length,
      power_users: users.filter(u => u.completionRate > 80 && u.engagementScore > 100).length,
      inactive_users: users.filter(u => {
        const daysSinceLastActivity = (Date.now() - u.lastActivity.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLastActivity > 7;
      }).length
    };

    const total = users.length;
    
    return Object.entries(segments).reduce((acc, [segment, count]) => {
      acc[segment] = {
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      };
      return acc;
    }, {} as any);
  }

  // Get cohort analysis
  getCohortAnalysis(): any {
    const cohorts = new Map<string, any>();
    
    this.userAnalytics.forEach((userAnalytics, userId) => {
      // Group by signup month (mock implementation)
      const signupMonth = new Date(userAnalytics.lastActivity).toISOString().slice(0, 7);
      
      if (!cohorts.has(signupMonth)) {
        cohorts.set(signupMonth, {
          month: signupMonth,
          users: [],
          averageCompletionRate: 0,
          averageEngagement: 0,
          retentionRate: 0
        });
      }
      
      cohorts.get(signupMonth)!.users.push(userAnalytics);
    });

    // Calculate cohort metrics
    cohorts.forEach(cohort => {
      const users = cohort.users;
      const totalUsers = users.length;
      
      if (totalUsers > 0) {
        cohort.averageCompletionRate = users.reduce((sum, u) => sum + u.completionRate, 0) / totalUsers;
        cohort.averageEngagement = users.reduce((sum, u) => sum + u.engagementScore, 0) / totalUsers;
        
        // Calculate retention (users active in last 7 days)
        const activeUsers = users.filter(u => {
          const daysSinceLastActivity = (Date.now() - u.lastActivity.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceLastActivity <= 7;
        }).length;
        
        cohort.retentionRate = (activeUsers / totalUsers) * 100;
      }
    });

    return Array.from(cohorts.values()).sort((a, b) => b.month.localeCompare(a.month));
  }

  // Export analytics data
  exportData(): any {
    return {
      events: this.events,
      userAnalytics: Array.from(this.userAnalytics.entries()),
      tutorialAnalytics: Array.from(this.tutorialAnalytics.entries()),
      realtimeData: this.realtimeData,
      metrics: this.getOverallMetrics(),
      insights: this.generateInsights(),
      tutorialComparison: this.getTutorialComparison(),
      userSegmentation: this.getUserSegmentation(),
      cohortAnalysis: this.getCohortAnalysis()
    };
  }

  // Import analytics data
  importData(data: any): void {
    if (data.events) {
      this.events = data.events;
    }
    
    if (data.userAnalytics) {
      this.userAnalytics = new Map(data.userAnalytics);
    }
    
    if (data.tutorialAnalytics) {
      this.tutorialAnalytics = new Map(data.tutorialAnalytics);
    }
    
    if (data.realtimeData) {
      this.realtimeData = data.realtimeData;
    }
  }

  // Clear analytics data
  clearData(): void {
    this.events = [];
    this.userAnalytics.clear();
    this.tutorialAnalytics.clear();
    this.realtimeData = {
      activeUsers: 0,
      currentSessions: 0,
      popularTutorials: [],
      recentCompletions: [],
      recentAchievements: []
    };
  }

  // Event emitter methods
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

// Singleton instance
export const onboardingAnalytics = new OnboardingAnalyticsService();
