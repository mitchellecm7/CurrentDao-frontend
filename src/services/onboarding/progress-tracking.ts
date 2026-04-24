import { 
  ProgressTracker, 
  OnboardingAnalytics, 
  Achievement, 
  UserGoals,
  UserProfile 
} from '../../types/onboarding';

export interface ProgressTrackingOptions {
  enableAutoSave?: boolean;
  saveInterval?: number;
  enableAnalytics?: boolean;
  trackEngagement?: boolean;
  storageKey?: string;
}

export interface ProgressMetrics {
  completionRate: number;
  timeSpent: number;
  averageStepTime: number;
  engagementScore: number;
  accuracy: number;
  skippedSteps: number;
  helpRequests: number;
  dropoffPoints: number[];
}

export interface UserProgressSummary {
  userId: string;
  totalTutorials: number;
  completedTutorials: number;
  totalTimeSpent: number;
  totalPoints: number;
  achievementsUnlocked: number;
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
  progressMetrics: ProgressMetrics;
}

export class ProgressTrackingService {
  private options: ProgressTrackingOptions;
  private progressData: Map<string, ProgressTracker> = new Map();
  private analyticsData: Map<string, OnboardingAnalytics[]> = new Map();
  private achievementData: Map<string, Achievement[]> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private userGoals: Map<string, UserGoals> = new Map();
  private saveTimer: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(options: ProgressTrackingOptions = {}) {
    this.options = {
      enableAutoSave: true,
      saveInterval: 30000, // 30 seconds
      enableAnalytics: true,
      trackEngagement: true,
      storageKey: 'onboarding-progress',
      ...options
    };

    this.loadFromStorage();
    this.startAutoSave();
  }

  // Initialize progress tracking for a user
  initializeProgress(userId: string, tutorialId: string, totalSteps: number): ProgressTracker {
    const progress: ProgressTracker = {
      tutorialId,
      currentStep: 0,
      totalSteps,
      completedSteps: [],
      timeSpent: 0,
      accuracy: 0,
      skippedSteps: [],
      lastActivity: new Date(),
      engagement: {
        clicks: 0,
        hoverTime: 0,
        scrollDepth: 0
      }
    };

    this.progressData.set(`${userId}_${tutorialId}`, progress);
    this.emit('progress-initialized', { userId, tutorialId, progress });
    
    return progress;
  }

  // Get progress for a specific tutorial
  getProgress(userId: string, tutorialId: string): ProgressTracker | null {
    return this.progressData.get(`${userId}_${tutorialId}`) || null;
  }

  // Update progress
  updateProgress(userId: string, tutorialId: string, updates: Partial<ProgressTracker>): void {
    const key = `${userId}_${tutorialId}`;
    const existing = this.progressData.get(key);
    
    if (!existing) {
      this.initializeProgress(userId, tutorialId, updates.totalSteps || 0);
    }

    const progress = { ...existing, ...updates, lastActivity: new Date() };
    this.progressData.set(key, progress);
    
    this.emit('progress-updated', { userId, tutorialId, progress });
    
    if (this.options.enableAutoSave) {
      this.saveToStorage();
    }
  }

  // Complete a step
  completeStep(userId: string, tutorialId: string, stepId: string, timeSpent: number): void {
    const progress = this.getProgress(userId, tutorialId);
    if (!progress) return;

    // Add to completed steps if not already there
    if (!progress.completedSteps.includes(stepId)) {
      progress.completedSteps.push(stepId);
      progress.currentStep++;
      progress.timeSpent += timeSpent;
      progress.lastActivity = new Date();

      // Calculate accuracy based on skipped vs completed steps
      progress.accuracy = (progress.completedSteps.length / (progress.completedSteps.length + progress.skippedSteps.length)) * 100;

      this.updateProgress(userId, tutorialId, progress);
      this.emit('step-completed', { userId, tutorialId, stepId, progress });
    }
  }

  // Skip a step
  skipStep(userId: string, tutorialId: string, stepId: string): void {
    const progress = this.getProgress(userId, tutorialId);
    if (!progress) return;

    if (!progress.skippedSteps.includes(stepId)) {
      progress.skippedSteps.push(stepId);
      progress.currentStep++;
      progress.lastActivity = new Date();

      // Recalculate accuracy
      progress.accuracy = (progress.completedSteps.length / (progress.completedSteps.length + progress.skippedSteps.length)) * 100;

      this.updateProgress(userId, tutorialId, progress);
      this.emit('step-skipped', { userId, tutorialId, stepId, progress });
    }
  }

  // Track engagement
  trackEngagement(userId: string, tutorialId: string, type: 'click' | 'hover' | 'scroll' | 'help', value?: number): void {
    if (!this.options.trackEngagement) return;

    const progress = this.getProgress(userId, tutorialId);
    if (!progress) return;

    switch (type) {
      case 'click':
        progress.engagement.clicks++;
        break;
      case 'hover':
        progress.engagement.hoverTime += value || 100;
        break;
      case 'scroll':
        progress.engagement.scrollDepth = Math.min(100, (progress.engagement.scrollDepth || 0) + (value || 10));
        break;
      case 'help':
        // Track help requests in analytics
        this.trackAnalyticsEvent(userId, tutorialId, 'help-request');
        break;
    }

    this.updateProgress(userId, tutorialId, progress);
    this.emit('engagement-tracked', { userId, tutorialId, type, value, engagement: progress.engagement });
  }

  // Start analytics session
  startAnalyticsSession(userId: string, tutorialId: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const analytics: OnboardingAnalytics = {
      userId,
      sessionId,
      startTime: new Date(),
      tutorialId,
      stepsCompleted: 0,
      totalSteps: 0,
      timeSpent: 0,
      dropoffPoints: [],
      engagement: {
        clicks: 0,
        hovers: 0,
        scrolls: 0,
        skips: 0,
        helpRequests: 0
      },
      deviceInfo: this.getDeviceInfo()
    };

    if (!this.analyticsData.has(userId)) {
      this.analyticsData.set(userId, []);
    }
    
    this.analyticsData.get(userId)!.push(analytics);
    this.emit('analytics-session-started', { userId, tutorialId, sessionId, analytics });
    
    return sessionId;
  }

  // Track analytics event
  trackAnalyticsEvent(userId: string, tutorialId: string, event: string, data?: any): void {
    if (!this.options.enableAnalytics) return;

    const userAnalytics = this.analyticsData.get(userId);
    if (!userAnalytics) return;

    const currentSession = userAnalytics[userAnalytics.length - 1];
    if (!currentSession) return;

    switch (event) {
      case 'step-completed':
        currentSession.stepsCompleted++;
        break;
      case 'step-skipped':
        currentSession.engagement.skips++;
        currentSession.dropoffPoints.push(currentSession.stepsCompleted);
        break;
      case 'click':
        currentSession.engagement.clicks++;
        break;
      case 'hover':
        currentSession.engagement.hovers++;
        break;
      case 'scroll':
        currentSession.engagement.scrolls++;
        break;
      case 'help-request':
        currentSession.engagement.helpRequests++;
        break;
      case 'tutorial-completed':
        currentSession.endTime = new Date();
        currentSession.timeSpent = Date.now() - currentSession.startTime.getTime();
        break;
    }

    this.emit('analytics-event-tracked', { userId, tutorialId, event, data, analytics: currentSession });
  }

  // Complete analytics session
  completeAnalyticsSession(userId: string, tutorialId: string): void {
    const userAnalytics = this.analyticsData.get(userId);
    if (!userAnalytics) return;

    const currentSession = userAnalytics[userAnalytics.length - 1];
    if (!currentSession || currentSession.endTime) return;

    currentSession.endTime = new Date();
    currentSession.timeSpent = currentSession.endTime.getTime() - currentSession.startTime.getTime();
    currentSession.stepsCompleted = this.getProgress(userId, tutorialId)?.completedSteps.length || 0;

    this.emit('analytics-session-completed', { userId, tutorialId, analytics: currentSession });
  }

  // Calculate progress metrics
  calculateProgressMetrics(userId: string, tutorialId: string): ProgressMetrics {
    const progress = this.getProgress(userId, tutorialId);
    if (!progress) {
      return {
        completionRate: 0,
        timeSpent: 0,
        averageStepTime: 0,
        engagementScore: 0,
        accuracy: 0,
        skippedSteps: 0,
        helpRequests: 0,
        dropoffPoints: []
      };
    }

    const completionRate = (progress.completedSteps.length / progress.totalSteps) * 100;
    const averageStepTime = progress.completedSteps.length > 0 ? progress.timeSpent / progress.completedSteps.length : 0;
    
    // Calculate engagement score (0-100)
    const engagementScore = Math.min(100, (
      (progress.engagement.clicks * 2) +
      (progress.engagement.hoverTime / 1000) +
      (progress.engagement.scrollDepth) +
      (progress.completedSteps.length * 10)
    ) / progress.totalSteps);

    // Get help requests from analytics
    const userAnalytics = this.analyticsData.get(userId) || [];
    const helpRequests = userAnalytics.reduce((sum, session) => sum + session.engagement.helpRequests, 0);

    // Get dropoff points from analytics
    const dropoffPoints = userAnalytics.reduce((points: number[], session) => 
      points.concat(session.dropoffPoints), []);

    return {
      completionRate,
      timeSpent: progress.timeSpent,
      averageStepTime,
      engagementScore,
      accuracy: progress.accuracy,
      skippedSteps: progress.skippedSteps.length,
      helpRequests,
      dropoffPoints
    };
  }

  // Get user progress summary
  getUserProgressSummary(userId: string): UserProgressSummary {
    const userProgress = Array.from(this.progressData.entries())
      .filter(([key]) => key.startsWith(`${userId}_`))
      .map(([, progress]) => progress);

    const userAnalytics = this.analyticsData.get(userId) || [];
    const userAchievements = this.achievementData.get(userId) || [];
    const userProfile = this.userProfiles.get(userId);
    const userGoals = this.userGoals.get(userId);

    const completedTutorials = userProgress.filter(p => 
      p.completedSteps.length === p.totalSteps
    ).length;

    const totalTimeSpent = userProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    const totalPoints = userAchievements.reduce((sum, a) => sum + a.points, 0);

    // Calculate streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(userAnalytics);

    // Aggregate progress metrics
    const allMetrics = userProgress.map(p => 
      this.calculateProgressMetrics(userId, p.tutorialId)
    );

    const aggregatedMetrics: ProgressMetrics = {
      completionRate: allMetrics.reduce((sum, m) => sum + m.completionRate, 0) / allMetrics.length || 0,
      timeSpent: totalTimeSpent,
      averageStepTime: allMetrics.reduce((sum, m) => sum + m.averageStepTime, 0) / allMetrics.length || 0,
      engagementScore: allMetrics.reduce((sum, m) => sum + m.engagementScore, 0) / allMetrics.length || 0,
      accuracy: allMetrics.reduce((sum, m) => sum + m.accuracy, 0) / allMetrics.length || 0,
      skippedSteps: allMetrics.reduce((sum, m) => sum + m.skippedSteps, 0),
      helpRequests: allMetrics.reduce((sum, m) => sum + m.helpRequests, 0),
      dropoffPoints: allMetrics.flatMap(m => m.dropoffPoints)
    };

    return {
      userId,
      totalTutorials: userProgress.length,
      completedTutorials,
      totalTimeSpent,
      totalPoints,
      achievementsUnlocked: userAchievements.length,
      currentStreak,
      longestStreak,
      lastActivity: this.getLastActivity(userId),
      progressMetrics: aggregatedMetrics
    };
  }

  // Calculate user streaks
  private calculateStreaks(analytics: OnboardingAnalytics[]): { currentStreak: number; longestStreak: number } {
    if (analytics.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const completedSessions = analytics.filter(session => session.endTime);
    const dates = completedSessions.map(session => session.startTime.toDateString()).filter((date, index, arr) => arr.indexOf(date) === index);
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toDateString();
    for (let i = dates.length - 1; i >= 0; i--) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - (dates.length - 1 - i));
      
      if (dates[i] === expectedDate.toDateString()) {
        tempStreak++;
        if (dates[i] === today) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    return { currentStreak, longestStreak };
  }

  // Get last activity date
  private getLastActivity(userId: string): Date {
    const userProgress = Array.from(this.progressData.entries())
      .filter(([key]) => key.startsWith(`${userId}_`))
      .map(([, progress]) => progress.lastActivity);

    return userProgress.length > 0 ? new Date(Math.max(...userProgress.map(d => d.getTime()))) : new Date();
  }

  // Add achievement to user
  addAchievement(userId: string, achievement: Achievement): void {
    if (!this.achievementData.has(userId)) {
      this.achievementData.set(userId, []);
    }

    const userAchievements = this.achievementData.get(userId)!;
    if (!userAchievements.find(a => a.id === achievement.id)) {
      userAchievements.push(achievement);
      this.emit('achievement-added', { userId, achievement });
      
      if (this.options.enableAutoSave) {
        this.saveToStorage();
      }
    }
  }

  // Set user profile
  setUserProfile(userId: string, profile: UserProfile): void {
    this.userProfiles.set(userId, profile);
    this.emit('user-profile-set', { userId, profile });
    
    if (this.options.enableAutoSave) {
      this.saveToStorage();
    }
  }

  // Set user goals
  setUserGoals(userId: string, goals: UserGoals): void {
    this.userGoals.set(userId, goals);
    this.emit('user-goals-set', { userId, goals });
    
    if (this.options.enableAutoSave) {
      this.saveToStorage();
    }
  }

  // Get device info
  private getDeviceInfo(): OnboardingAnalytics['deviceInfo'] {
    return {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
      device: 'web'
    };
  }

  // Save to local storage
  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const data = {
        progressData: Array.from(this.progressData.entries()),
        analyticsData: Array.from(this.analyticsData.entries()),
        achievementData: Array.from(this.achievementData.entries()),
        userProfiles: Array.from(this.userProfiles.entries()),
        userGoals: Array.from(this.userGoals.entries())
      };

      localStorage.setItem(this.options.storageKey!, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save progress data:', error);
    }
  }

  // Load from local storage
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const data = localStorage.getItem(this.options.storageKey!);
      if (!data) return;

      const parsed = JSON.parse(data);
      
      if (parsed.progressData) {
        this.progressData = new Map(parsed.progressData);
      }
      
      if (parsed.analyticsData) {
        this.analyticsData = new Map(parsed.analyticsData.map(([userId, analytics]: [string, any[]]) => [
          userId,
          analytics.map(a => ({ ...a, startTime: new Date(a.startTime), endTime: a.endTime ? new Date(a.endTime) : undefined }))
        ]));
      }
      
      if (parsed.achievementData) {
        this.achievementData = new Map(parsed.achievementData.map(([userId, achievements]: [string, any[]]) => [
          userId,
          achievements.map(a => ({ ...a, unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined }))
        ]));
      }
      
      if (parsed.userProfiles) {
        this.userProfiles = new Map(parsed.userProfiles);
      }
      
      if (parsed.userGoals) {
        this.userGoals = new Map(parsed.userGoals);
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
  }

  // Start auto save
  private startAutoSave(): void {
    if (!this.options.enableAutoSave || !this.options.saveInterval) return;

    this.saveTimer = setInterval(() => {
      this.saveToStorage();
    }, this.options.saveInterval);
  }

  // Stop auto save
  stopAutoSave(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
  }

  // Export user data
  exportUserData(userId: string): any {
    return {
      progress: Array.from(this.progressData.entries())
        .filter(([key]) => key.startsWith(`${userId}_`))
        .map(([key, progress]) => [key, progress]),
      analytics: this.analyticsData.get(userId) || [],
      achievements: this.achievementData.get(userId) || [],
      profile: this.userProfiles.get(userId),
      goals: this.userGoals.get(userId),
      summary: this.getUserProgressSummary(userId)
    };
  }

  // Import user data
  importUserData(userId: string, data: any): void {
    if (data.progress) {
      data.progress.forEach(([key, progress]: [string, ProgressTracker]) => {
        if (key.startsWith(`${userId}_`)) {
          this.progressData.set(key, progress);
        }
      });
    }

    if (data.analytics) {
      this.analyticsData.set(userId, data.analytics);
    }

    if (data.achievements) {
      this.achievementData.set(userId, data.achievements);
    }

    if (data.profile) {
      this.userProfiles.set(userId, data.profile);
    }

    if (data.goals) {
      this.userGoals.set(userId, data.goals);
    }

    this.emit('data-imported', { userId, data });
    
    if (this.options.enableAutoSave) {
      this.saveToStorage();
    }
  }

  // Clear user data
  clearUserData(userId: string): void {
    // Clear progress data
    const keysToDelete = Array.from(this.progressData.keys())
      .filter(key => key.startsWith(`${userId}_`));
    keysToDelete.forEach(key => this.progressData.delete(key));

    // Clear other data
    this.analyticsData.delete(userId);
    this.achievementData.delete(userId);
    this.userProfiles.delete(userId);
    this.userGoals.delete(userId);

    this.emit('data-cleared', { userId });
    
    if (this.options.enableAutoSave) {
      this.saveToStorage();
    }
  }

  // Get analytics insights
  getAnalyticsInsights(userId: string): any {
    const userAnalytics = this.analyticsData.get(userId) || [];
    const userProgress = this.getUserProgressSummary(userId);

    return {
      completionRate: userProgress.progressMetrics.completionRate,
      averageTimePerTutorial: userProgress.totalTimeSpent / Math.max(1, userProgress.totalTutorials),
      mostActiveHour: this.getMostActiveHour(userAnalytics),
      dropoffAnalysis: this.analyzeDropoffs(userAnalytics),
      engagementPatterns: this.analyzeEngagementPatterns(userAnalytics),
      improvementSuggestions: this.generateImprovementSuggestions(userProgress)
    };
  }

  // Get most active hour
  private getMostActiveHour(analytics: OnboardingAnalytics[]): number {
    const hourCounts = new Map<number, number>();
    
    analytics.forEach(session => {
      const hour = session.startTime.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    let maxHour = 0;
    let maxCount = 0;
    
    hourCounts.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        maxHour = hour;
      }
    });

    return maxHour;
  }

  // Analyze dropoffs
  private analyzeDropoffs(analytics: OnboardingAnalytics[]): any {
    const allDropoffs = analytics.flatMap(session => session.dropoffPoints);
    const dropoffFrequency = new Map<number, number>();

    allDropoffs.forEach(point => {
      dropoffFrequency.set(point, (dropoffFrequency.get(point) || 0) + 1);
    });

    const sortedDropoffs = Array.from(dropoffFrequency.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      mostCommonDropoffs: sortedDropoffs,
      totalDropoffs: allDropoffs.length,
      dropoffRate: allDropoffs.length / Math.max(1, analytics.length)
    };
  }

  // Analyze engagement patterns
  private analyzeEngagementPatterns(analytics: OnboardingAnalytics[]): any {
    if (analytics.length === 0) return {};

    const totalEngagement = analytics.reduce((sum, session) => ({
      clicks: sum.clicks + session.engagement.clicks,
      hovers: sum.hovers + session.engagement.hovers,
      scrolls: sum.scrolls + session.engagement.scrolls,
      helpRequests: sum.helpRequests + session.engagement.helpRequests
    }), { clicks: 0, hovers: 0, scrolls: 0, helpRequests: 0 });

    const sessionCount = analytics.length;

    return {
      averageClicksPerSession: totalEngagement.clicks / sessionCount,
      averageHoversPerSession: totalEngagement.hovers / sessionCount,
      averageScrollsPerSession: totalEngagement.scrolls / sessionCount,
      averageHelpRequestsPerSession: totalEngagement.helpRequests / sessionCount,
      helpRequestRate: totalEngagement.helpRequests / Math.max(1, totalEngagement.clicks + totalEngagement.hovers + totalEngagement.scrolls)
    };
  }

  // Generate improvement suggestions
  private generateImprovementSuggestions(summary: UserProgressSummary): string[] {
    const suggestions: string[] = [];
    const metrics = summary.progressMetrics;

    if (metrics.completionRate < 50) {
      suggestions.push('Consider breaking down tutorials into smaller, more manageable steps');
    }

    if (metrics.averageStepTime > 300000) { // 5 minutes
      suggestions.push('Tutorials seem to be taking too long. Consider adding more interactive elements');
    }

    if (metrics.engagementScore < 30) {
      suggestions.push('Low engagement detected. Try adding more visual elements and interactive content');
    }

    if (metrics.helpRequests > metrics.completedTutorials * 2) {
      suggestions.push('Users are requesting help frequently. Review tutorial clarity and add more guidance');
    }

    if (metrics.dropoffPoints.length > metrics.completedTutorials) {
      suggestions.push('Multiple dropoff points detected. Analyze where users are struggling');
    }

    if (suggestions.length === 0) {
      suggestions.push('Great job! Users are progressing well through the tutorials');
    }

    return suggestions;
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

  // Cleanup
  destroy(): void {
    this.stopAutoSave();
    this.saveToStorage();
    this.progressData.clear();
    this.analyticsData.clear();
    this.achievementData.clear();
    this.userProfiles.clear();
    this.userGoals.clear();
    this.eventListeners.clear();
  }
}

// Singleton instance
export const progressTracker = new ProgressTrackingService();
