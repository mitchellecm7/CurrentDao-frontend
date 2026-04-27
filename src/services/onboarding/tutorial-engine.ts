import { 
  InteractiveTutorial, 
  TutorialStep, 
  TutorialEngine, 
  ProgressTracker, 
  Achievement,
  OnboardingAnalytics,
  UserGoals,
  UserProfile 
} from '../../types/onboarding';

export class TutorialEngineService {
  private tutorials: InteractiveTutorial[] = [];
  private currentTutorial: InteractiveTutorial | null = null;
  private progress: ProgressTracker | null = null;
  private achievements: Achievement[] = [];
  private analytics: OnboardingAnalytics[] = [];
  private userGoals: UserGoals | null = null;
  private userProfile: UserProfile | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeDefaultTutorials();
    this.initializeDefaultAchievements();
  }

  // Initialize default tutorials
  private initializeDefaultTutorials(): void {
    this.tutorials = [
      {
        id: 'getting-started',
        title: 'Getting Started with CurrentDao',
        description: 'Complete beginner\'s guide to the decentralized energy marketplace',
        category: 'getting-started',
        difficulty: 'beginner',
        estimatedTime: 10,
        interactive: true,
        handsOn: true,
        steps: [
          {
            id: 'welcome',
            title: 'Welcome to CurrentDao',
            content: 'Let\'s get you started with a comprehensive tour of our decentralized energy marketplace. You\'ll learn how to trade energy, manage your portfolio, and participate in governance.',
            position: 'top',
            duration: 5000,
            required: true,
            category: 'basics',
            interactions: { highlight: true, spotlight: true }
          },
          {
            id: 'goals',
            title: 'What\'s Your Goal?',
            content: 'Tell us about your goals so we can personalize your experience. Are you here to trade energy, produce clean energy, or explore the platform?',
            position: 'bottom',
            duration: 8000,
            required: true,
            category: 'basics',
            interactions: { overlay: true }
          },
          {
            id: 'dashboard',
            title: 'Your Dashboard',
            content: 'This is your command center. Track energy production, consumption, portfolio performance, and market trends all in one place.',
            targetId: 'dashboard-overview',
            position: 'bottom',
            duration: 6000,
            required: true,
            category: 'basics',
            interactions: { highlight: true }
          },
          {
            id: 'trading',
            title: 'Energy Trading',
            content: 'Browse active orders and execute trades instantly on the blockchain. Buy and sell clean energy kWh with transparent pricing.',
            targetId: 'trading-activity',
            position: 'left',
            duration: 7000,
            required: true,
            category: 'trading',
            interactions: { highlight: true, spotlight: true }
          },
          {
            id: 'wallet',
            title: 'Connect Your Wallet',
            content: 'Securely connect your Stellar or Ethereum wallet to sign transactions and manage your digital energy assets.',
            targetId: 'wallet-connector',
            position: 'right',
            duration: 5000,
            required: true,
            category: 'wallet',
            interactions: { highlight: true }
          },
          {
            id: 'first-trade',
            title: 'Your First Trade',
            content: 'Let\'s make your first energy trade! Choose whether to buy or sell energy, set your amount and price, and execute your first blockchain transaction.',
            targetId: 'trading-form',
            position: 'top',
            duration: 10000,
            required: true,
            category: 'trading',
            interactions: { highlight: true, spotlight: true }
          }
        ],
        outcomes: ['Understand platform basics', 'Complete first trade', 'Connect wallet'],
        prerequisites: []
      },
      {
        id: 'advanced-trading',
        title: 'Advanced Energy Trading',
        description: 'Master advanced trading strategies and market analysis',
        category: 'trading',
        difficulty: 'advanced',
        estimatedTime: 15,
        interactive: true,
        handsOn: true,
        steps: [
          {
            id: 'market-analysis',
            title: 'Market Analysis',
            content: 'Learn to read market trends, analyze price patterns, and make informed trading decisions.',
            position: 'top',
            duration: 8000,
            required: true,
            category: 'advanced',
            interactions: { highlight: true }
          },
          {
            id: 'advanced-orders',
            title: 'Advanced Order Types',
            content: 'Master limit orders, stop-loss, and advanced trading strategies for maximum efficiency.',
            position: 'bottom',
            duration: 10000,
            required: true,
            category: 'advanced',
            interactions: { highlight: true }
          }
        ],
        outcomes: ['Advanced trading knowledge', 'Market analysis skills'],
        prerequisites: ['getting-started']
      }
    ];
  }

  // Initialize default achievements
  private initializeDefaultAchievements(): void {
    this.achievements = [
      {
        id: 'first-steps',
        title: 'First Steps',
        description: 'Complete the getting started tutorial',
        icon: '🎯',
        category: 'progress',
        points: 100,
        requirements: { steps: ['getting-started'], timeLimit: 1800000 },
        rewards: { badge: 'beginner', features: ['advanced-analytics'] }
      },
      {
        id: 'energy-trader',
        title: 'Energy Trader',
        description: 'Complete your first energy trade',
        icon: '⚡',
        category: 'milestone',
        points: 250,
        requirements: { steps: ['first-trade'] },
        rewards: { badge: 'trader', title: 'Energy Trader' }
      },
      {
        id: 'quick-learner',
        title: 'Quick Learner',
        description: 'Complete tutorial in under 10 minutes',
        icon: '⚡',
        category: 'skill',
        points: 150,
        requirements: { steps: ['getting-started'], timeLimit: 600000 },
        rewards: { badge: 'fast-learner' }
      },
      {
        id: 'explorer',
        title: 'Platform Explorer',
        description: 'Complete all available tutorials',
        icon: '🗺️',
        category: 'milestone',
        points: 500,
        requirements: { steps: ['getting-started', 'advanced-trading'] },
        rewards: { badge: 'expert', title: 'Platform Expert' }
      }
    ];
  }

  // Get all available tutorials
  getTutorials(): InteractiveTutorial[] {
    return this.tutorials;
  }

  // Get tutorial by ID
  getTutorialById(id: string): InteractiveTutorial | null {
    return this.tutorials.find(t => t.id === id) || null;
  }

  // Get personalized tutorials based on user goals
  getPersonalizedTutorials(userGoals: UserGoals): InteractiveTutorial[] {
    return this.tutorials.filter(tutorial => {
      // Filter based on experience level
      if (userGoals.experienceLevel === 'expert' && tutorial.difficulty === 'beginner') {
        return false;
      }
      
      // Filter based on time commitment
      if (userGoals.timeCommitment === 'quick' && tutorial.estimatedTime > 10) {
        return false;
      }
      
      // Filter based on primary goal
      if (userGoals.primaryGoal === 'trader' && tutorial.category === 'getting-started') {
        return true; // Always include getting started for traders
      }
      
      if (userGoals.primaryGoal === 'producer' && tutorial.category === 'trading') {
        return false; // Skip advanced trading for producers
      }
      
      return true;
    });
  }

  // Start a tutorial
  startTutorial(tutorialId: string, userId: string): boolean {
    const tutorial = this.getTutorialById(tutorialId);
    if (!tutorial) return false;

    // Check prerequisites
    if (tutorial.prerequisites) {
      for (const prereq of tutorial.prerequisites) {
        if (!this.isTutorialCompleted(prereq, userId)) {
          this.emit('prerequisite-not-met', { tutorialId, prerequisite: prereq });
          return false;
        }
      }
    }

    this.currentTutorial = tutorial;
    this.progress = {
      tutorialId,
      currentStep: 0,
      totalSteps: tutorial.steps.length,
      completedSteps: [],
      timeSpent: 0,
      accuracy: 0,
      skippedSteps: [],
      lastActivity: new Date(),
      engagement: { clicks: 0, hoverTime: 0, scrollDepth: 0 }
    };

    // Initialize analytics
    this.analytics.push({
      userId,
      sessionId: this.generateSessionId(),
      startTime: new Date(),
      tutorialId,
      stepsCompleted: 0,
      totalSteps: tutorial.steps.length,
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
    });

    this.emit('tutorial-started', { tutorial, progress: this.progress });
    return true;
  }

  // Navigate to next step
  nextStep(): boolean {
    if (!this.currentTutorial || !this.progress) return false;

    const currentStep = this.currentTutorial.steps[this.progress.currentStep];
    
    // Mark current step as completed
    if (!this.progress.completedSteps.includes(currentStep.id)) {
      this.progress.completedSteps.push(currentStep.id);
    }

    // Move to next step
    if (this.progress.currentStep < this.currentTutorial.steps.length - 1) {
      this.progress.currentStep++;
      this.progress.lastActivity = new Date();
      
      this.emit('step-changed', { 
        stepIndex: this.progress.currentStep, 
        step: this.currentTutorial.steps[this.progress.currentStep] 
      });
      return true;
    } else {
      // Tutorial completed
      this.completeTutorial();
      return false;
    }
  }

  // Navigate to previous step
  previousStep(): boolean {
    if (!this.currentTutorial || !this.progress || this.progress.currentStep === 0) {
      return false;
    }

    this.progress.currentStep--;
    this.progress.lastActivity = new Date();
    
    this.emit('step-changed', { 
      stepIndex: this.progress.currentStep, 
      step: this.currentTutorial.steps[this.progress.currentStep] 
    });
    return true;
  }

  // Skip current step
  skipStep(): boolean {
    if (!this.currentTutorial || !this.progress) return false;

    const currentStep = this.currentTutorial.steps[this.progress.currentStep];
    
    if (currentStep.required) {
      this.emit('step-required', { step: currentStep });
      return false;
    }

    this.progress.skippedSteps.push(currentStep.id);
    
    // Update analytics
    const currentAnalytics = this.getCurrentAnalytics();
    if (currentAnalytics) {
      currentAnalytics.engagement.skips++;
    }

    return this.nextStep();
  }

  // Complete current tutorial
  private completeTutorial(): void {
    if (!this.currentTutorial || !this.progress) return;

    this.progress.currentStep = this.currentTutorial.steps.length;
    this.progress.lastActivity = new Date();

    // Update analytics
    const currentAnalytics = this.getCurrentAnalytics();
    if (currentAnalytics) {
      currentAnalytics.endTime = new Date();
      currentAnalytics.stepsCompleted = this.progress.completedSteps.length;
      currentAnalytics.timeSpent = this.progress.timeSpent;
    }

    // Check and unlock achievements
    this.checkAchievements();

    this.emit('tutorial-completed', { 
      tutorial: this.currentTutorial, 
      progress: this.progress 
    });
  }

  // Check and unlock achievements
  private checkAchievements(): void {
    if (!this.progress) return;

    const unlockedAchievements: Achievement[] = [];

    this.achievements.forEach(achievement => {
      // Skip if already unlocked
      if (achievement.unlockedAt) return;

      // Check requirements
      const meetsRequirements = this.checkAchievementRequirements(achievement);
      
      if (meetsRequirements) {
        achievement.unlockedAt = new Date();
        unlockedAchievements.push(achievement);
        this.emit('achievement-unlocked', achievement);
      }
    });

    if (unlockedAchievements.length > 0) {
      this.emit('achievements-unlocked', unlockedAchievements);
    }
  }

  // Check if achievement requirements are met
  private checkAchievementRequirements(achievement: Achievement): boolean {
    if (!this.progress) return false;

    // Check step requirements
    const stepsCompleted = achievement.requirements.steps.every(stepId => 
      this.progress.completedSteps.includes(stepId)
    );

    if (!stepsCompleted) return false;

    // Check time limit
    if (achievement.requirements.timeLimit) {
      if (this.progress.timeSpent > achievement.requirements.timeLimit) {
        return false;
      }
    }

    // Check accuracy
    if (achievement.requirements.accuracy) {
      if (this.progress.accuracy < achievement.requirements.accuracy) {
        return false;
      }
    }

    return true;
  }

  // Get current tutorial state
  getCurrentState(): TutorialEngine {
    return {
      tutorials: this.tutorials,
      currentTutorial: this.currentTutorial,
      state: {
        isTutorialActive: !!this.currentTutorial,
        currentStepIndex: this.progress?.currentStep || 0,
        completedSteps: this.progress?.completedSteps || [],
        isDismissed: false,
        userGoals: this.userGoals,
        userProfile: this.userProfile
      },
      progress: this.progress || {
        tutorialId: '',
        currentStep: 0,
        totalSteps: 0,
        completedSteps: [],
        timeSpent: 0,
        accuracy: 0,
        skippedSteps: [],
        lastActivity: new Date(),
        engagement: { clicks: 0, hoverTime: 0, scrollDepth: 0 }
      },
      achievements: this.achievements
    };
  }

  // Update user goals
  setUserGoals(goals: UserGoals): void {
    this.userGoals = goals;
    this.emit('user-goals-updated', goals);
  }

  // Update user profile
  setUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
    this.emit('user-profile-updated', profile);
  }

  // Track engagement
  trackEngagement(event: 'click' | 'hover' | 'scroll' | 'help'): void {
    if (!this.progress) return;

    switch (event) {
      case 'click':
        this.progress.engagement.clicks++;
        break;
      case 'hover':
        this.progress.engagement.hoverTime += 100; // Assume 100ms per hover
        break;
      case 'scroll':
        this.progress.engagement.scrollDepth = Math.min(100, this.progress.engagement.scrollDepth + 10);
        break;
      case 'help':
        const currentAnalytics = this.getCurrentAnalytics();
        if (currentAnalytics) {
          currentAnalytics.engagement.helpRequests++;
        }
        break;
    }

    this.emit('engagement-tracked', { event, data: this.progress.engagement });
  }

  // Update progress time
  updateTimeSpent(): void {
    if (!this.progress) return;

    this.progress.timeSpent += 1000; // Add 1 second
    this.emit('time-updated', { timeSpent: this.progress.timeSpent });
  }

  // Get tutorial completion status
  isTutorialCompleted(tutorialId: string, userId: string): boolean {
    const userAnalytics = this.analytics.filter(a => a.userId === userId && a.tutorialId === tutorialId);
    return userAnalytics.some(a => a.endTime !== undefined);
  }

  // Get user progress summary
  getUserProgress(userId: string): any {
    const userAnalytics = this.analytics.filter(a => a.userId === userId);
    const userAchievements = this.achievements.filter(a => a.unlockedAt);
    
    return {
      tutorialsCompleted: userAnalytics.filter(a => a.endTime).length,
      totalTimeSpent: userAnalytics.reduce((sum, a) => sum + a.timeSpent, 0),
      achievementsUnlocked: userAchievements.length,
      totalPoints: userAchievements.reduce((sum, a) => sum + a.points, 0),
      averageCompletionRate: this.calculateAverageCompletionRate(userAnalytics)
    };
  }

  // Calculate average completion rate
  private calculateAverageCompletionRate(analytics: OnboardingAnalytics[]): number {
    if (analytics.length === 0) return 0;
    
    const totalRate = analytics.reduce((sum, a) => {
      return sum + (a.stepsCompleted / a.totalSteps) * 100;
    }, 0);
    
    return totalRate / analytics.length;
  }

  // Get current analytics session
  private getCurrentAnalytics(): OnboardingAnalytics | null {
    return this.analytics[this.analytics.length - 1] || null;
  }

  // Generate session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get device info
  private getDeviceInfo(): OnboardingAnalytics['deviceInfo'] {
    return {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
      device: 'web'
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

  // Reset tutorial progress
  resetTutorial(): void {
    this.currentTutorial = null;
    this.progress = null;
    this.emit('tutorial-reset');
  }

  // Dismiss tutorial
  dismissTutorial(): void {
    const currentAnalytics = this.getCurrentAnalytics();
    if (currentAnalytics) {
      currentAnalytics.endTime = new Date();
    }
    
    this.resetTutorial();
    this.emit('tutorial-dismissed');
  }

  // Export user data
  exportUserData(userId: string): any {
    return {
      progress: this.getUserProgress(userId),
      analytics: this.analytics.filter(a => a.userId === userId),
      achievements: this.achievements.filter(a => a.unlockedAt),
      userGoals: this.userGoals,
      userProfile: this.userProfile
    };
  }

  // Import user data
  importUserData(data: any): void {
    if (data.userGoals) {
      this.setUserGoals(data.userGoals);
    }
    
    if (data.userProfile) {
      this.setUserProfile(data.userProfile);
    }
    
    if (data.achievements) {
      this.achievements = data.achievements;
    }
    
    if (data.analytics) {
      this.analytics.push(...data.analytics);
    }
    
    this.emit('data-imported', data);
  }
}

// Singleton instance
export const tutorialEngine = new TutorialEngineService();
