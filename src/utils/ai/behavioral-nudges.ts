export interface Nudge {
  id: string;
  type: 'prompt' | 'reminder' | 'achievement' | 'comparison' | 'goal_setting';
  title: string;
  message: string;
  trigger: string;
  timing: 'immediate' | 'daily' | 'weekly' | 'monthly';
  priority: 'low' | 'medium' | 'high';
  category: 'energy_saving' | 'cost_reduction' | 'environmental' | 'maintenance';
  actionButton?: {
    text: string;
    action: string;
  };
  dismissible: boolean;
  expiresAt?: Date;
}

export interface UserBehavior {
  userId: string;
  habits: Record<string, {
    frequency: number;
    lastAction: Date;
    streak: number;
    completionRate: number;
  }>;
  goals: Array<{
    id: string;
    type: string;
    target: number;
    current: number;
    deadline: Date;
    unit: string;
  }>;
  preferences: {
    nudgeFrequency: 'low' | 'medium' | 'high';
    preferredTime: string;
    motivations: string[];
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: Date;
  category: string;
}

class BehavioralNudges {
  private initialized = false;
  private userBehavior: UserBehavior | null = null;
  private achievements: Achievement[] = [];
  private nudgeHistory: Map<string, Date> = new Map();

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize with mock user behavior data
    this.userBehavior = {
      userId: 'user-001',
      habits: {
        'thermostat_optimization': {
          frequency: 5,
          lastAction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          streak: 3,
          completionRate: 0.75
        },
        'peak_hour_shift': {
          frequency: 3,
          lastAction: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          streak: 2,
          completionRate: 0.60
        },
        'led_lighting': {
          frequency: 8,
          lastAction: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          streak: 5,
          completionRate: 0.90
        }
      },
      goals: [
        {
          id: 'goal-001',
          type: 'monthly_savings',
          target: 50,
          current: 32,
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          unit: 'dollars'
        },
        {
          id: 'goal-002',
          type: 'carbon_reduction',
          target: 0.5,
          current: 0.3,
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          unit: 'tons'
        }
      ],
      preferences: {
        nudgeFrequency: 'medium',
        preferredTime: '09:00',
        motivations: ['cost_savings', 'environmental_impact']
      }
    };

    // Initialize achievements
    this.achievements = [
      {
        id: 'first_week',
        name: 'First Week Warrior',
        description: 'Complete energy-saving actions for 7 consecutive days',
        icon: '🏆',
        points: 100,
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        category: 'consistency'
      },
      {
        id: 'peak_master',
        name: 'Peak Hour Master',
        description: 'Successfully shift 50% of usage away from peak hours',
        icon: '⚡',
        points: 150,
        unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        category: 'optimization'
      }
    ];

    this.initialized = true;
  }

  async generateNudges(context?: {
    currentUsage?: number;
    timeOfDay?: string;
    dayOfWeek?: string;
    recentActions?: string[];
  }): Promise<Nudge[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const nudges: Nudge[] = [];
    const currentTime = new Date();
    const timeOfDay = context?.timeOfDay || this.getTimeOfDay(currentTime);
    const dayOfWeek = context?.dayOfWeek || this.getDayOfWeek(currentTime);

    // Generate context-aware nudges
    nudges.push(...this.generateTimeBasedNudges(timeOfDay, dayOfWeek));
    nudges.push(...this.generateGoalBasedNudges());
    nudges.push(...this.generateHabitBasedNudges());
    nudges.push(...this.generateComparisonNudges());
    nudges.push(...this.generateAchievementNudges());

    // Filter nudges based on user preferences and history
    return this.filterNudges(nudges);
  }

  private getTimeOfDay(date: Date): string {
    const hour = date.getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  private getDayOfWeek(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  private generateTimeBasedNudges(timeOfDay: string, dayOfWeek: string): Nudge[] {
    const nudges: Nudge[] = [];

    // Morning nudges
    if (timeOfDay === 'morning') {
      nudges.push({
        id: 'morning-routine',
        type: 'prompt',
        title: 'Start Your Day Efficiently',
        message: 'Good morning! Remember to adjust your thermostat by 2 degrees to save energy today.',
        trigger: 'time_morning',
        timing: 'immediate',
        priority: 'medium',
        category: 'energy_saving',
        actionButton: {
          text: 'Adjust Thermostat',
          action: 'thermostat_adjust'
        },
        dismissible: true
      });
    }

    // Evening nudges
    if (timeOfDay === 'evening') {
      nudges.push({
        id: 'evening-check',
        type: 'reminder',
        title: 'Evening Energy Check',
        message: 'Before bed, make sure to turn off lights and electronics not in use.',
        trigger: 'time_evening',
        timing: 'immediate',
        priority: 'medium',
        category: 'energy_saving',
        actionButton: {
          text: 'Check Devices',
          action: 'device_check'
        },
        dismissible: true
      });
    }

    // Weekend nudges
    if (dayOfWeek === 'saturday' || dayOfWeek === 'sunday') {
      nudges.push({
        id: 'weekend-maintenance',
        type: 'prompt',
        title: 'Weekend Maintenance Reminder',
        message: 'Weekend is perfect for quick maintenance tasks. Check your HVAC filters today!',
        trigger: 'weekend',
        timing: 'immediate',
        priority: 'low',
        category: 'maintenance',
        actionButton: {
          text: 'Schedule Check',
          action: 'schedule_maintenance'
        },
        dismissible: true
      });
    }

    return nudges;
  }

  private generateGoalBasedNudges(): Nudge[] {
    const nudges: Nudge[] = [];

    if (!this.userBehavior) return nudges;

    this.userBehavior.goals.forEach(goal => {
      const progress = goal.current / goal.target;
      
      if (progress < 0.3) {
        nudges.push({
          id: `goal-progress-${goal.id}`,
          type: 'goal_setting',
          title: 'Goal Progress Update',
          message: `You're ${Math.round(progress * 100)}% toward your ${goal.type} goal. Keep going!`,
          trigger: 'goal_progress',
          timing: 'weekly',
          priority: 'medium',
          category: goal.type.includes('savings') ? 'cost_reduction' : 'environmental',
          dismissible: true
        });
      } else if (progress > 0.8) {
        nudges.push({
          id: `goal-near-${goal.id}`,
          type: 'achievement',
          title: 'Almost There!',
          message: `You're ${Math.round(progress * 100)}% to your goal! Just a little more to reach it.`,
          trigger: 'goal_near_completion',
          timing: 'immediate',
          priority: 'high',
          category: goal.type.includes('savings') ? 'cost_reduction' : 'environmental',
          actionButton: {
            text: 'View Progress',
            action: 'view_goal_progress'
          },
          dismissible: false
        });
      }
    });

    return nudges;
  }

  private generateHabitBasedNudges(): Nudge[] {
    const nudges: Nudge[] = [];

    if (!this.userBehavior) return nudges;

    Object.entries(this.userBehavior.habits).forEach(([habitId, habit]) => {
      const daysSinceLastAction = Math.floor((Date.now() - habit.lastAction.getTime()) / (24 * 60 * 60 * 1000));
      
      // Streak continuation nudges
      if (habit.streak > 0 && daysSinceLastAction === 1) {
        nudges.push({
          id: `streak-continue-${habitId}`,
          type: 'prompt',
          title: 'Keep Your Streak Going!',
          message: `You're on a ${habit.streak}-day streak! Don't break it today.`,
          trigger: 'streak_at_risk',
          timing: 'immediate',
          priority: 'high',
          category: 'energy_saving',
          dismissible: true
        });
      }

      // Habit formation nudges
      if (habit.completionRate < 0.5 && habit.frequency < 5) {
        nudges.push({
          id: `habit-build-${habitId}`,
          type: 'prompt',
          title: 'Build Your Energy-Saving Habit',
          message: `Consistency is key! Try to complete this action more regularly to build a strong habit.`,
          trigger: 'low_completion_rate',
          timing: 'weekly',
          priority: 'medium',
          category: 'energy_saving',
          dismissible: true
        });
      }
    });

    return nudges;
  }

  private generateComparisonNudges(): Nudge[] {
    const nudges: Nudge[] = [];

    nudges.push({
      id: 'community-comparison',
      type: 'comparison',
      title: 'How Do You Compare?',
      message: 'Your energy usage is 15% lower than similar households in your area. Great job!',
      trigger: 'weekly_comparison',
      timing: 'weekly',
      priority: 'medium',
      category: 'energy_saving',
      actionButton: {
        text: 'View Details',
        action: 'view_comparison'
      },
      dismissible: true
    });

    nudges.push({
      id: 'personal-best',
      type: 'comparison',
      title: 'Personal Best Alert',
      message: 'This week you achieved your lowest energy consumption in 3 months!',
      trigger: 'personal_best',
      timing: 'immediate',
      priority: 'high',
      category: 'energy_saving',
      dismissible: true
    });

    return nudges;
  }

  private generateAchievementNudges(): Nudge[] {
    const nudges: Nudge[] = [];

    // Check for potential new achievements
    const potentialAchievements = [
      {
        id: 'week_streak',
        name: 'Week Warrior',
        description: 'Complete energy-saving actions for 7 consecutive days',
        condition: () => this.userBehavior?.habits['thermostat_optimization']?.streak >= 7
      },
      {
        id: 'savings_milestone',
        name: 'Savings Milestone',
        description: 'Save $100 in energy costs',
        condition: () => this.userBehavior?.goals[0]?.current >= 100
      }
    ];

    potentialAchievements.forEach(achievement => {
      if (achievement.condition() && !this.achievements.find(a => a.id === achievement.id)) {
        nudges.push({
          id: `achievement-${achievement.id}`,
          type: 'achievement',
          title: '🎉 Achievement Unlocked!',
          message: `Congratulations! You've earned the "${achievement.name}" achievement.`,
          trigger: 'achievement_unlocked',
          timing: 'immediate',
          priority: 'high',
          category: 'energy_saving',
          actionButton: {
            text: 'View Achievements',
            action: 'view_achievements'
          },
          dismissible: false
        });
      }
    });

    return nudges;
  }

  private filterNudges(nudges: Nudge[]): Nudge[] {
    if (!this.userBehavior) return nudges;

    // Filter based on frequency preferences
    let filteredNudges = nudges;

    // Remove nudges that were recently shown
    const now = Date.now();
    filteredNudges = filteredNudges.filter(nudge => {
      const lastShown = this.nudgeHistory.get(nudge.id);
      if (!lastShown) return true;
      
      const daysSinceLastShown = (now - lastShown.getTime()) / (24 * 60 * 60 * 1000);
      const minInterval = this.userBehavior!.preferences.nudgeFrequency === 'high' ? 1 :
                         this.userBehavior!.preferences.nudgeFrequency === 'medium' ? 3 : 7;
      
      return daysSinceLastShown >= minInterval;
    });

    // Prioritize high-priority nudges
    filteredNudges.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Limit number of nudges based on preferences
    const maxNudges = this.userBehavior.preferences.nudgeFrequency === 'high' ? 5 :
                    this.userBehavior.preferences.nudgeFrequency === 'medium' ? 3 : 1;

    return filteredNudges.slice(0, maxNudges);
  }

  async recordNudgeInteraction(nudgeId: string, interaction: 'viewed' | 'dismissed' | 'action_taken'): Promise<void> {
    // Record the interaction
    this.nudgeHistory.set(nudgeId, new Date());

    // Update user behavior based on interaction
    if (interaction === 'action_taken' && this.userBehavior) {
      // Increment relevant habit metrics
      // This would be expanded based on the specific nudge type
      console.log(`User took action on nudge: ${nudgeId}`);
    }
  }

  async updateGoal(goalId: string, progress: number): Promise<void> {
    if (!this.userBehavior) return;

    const goal = this.userBehavior.goals.find(g => g.id === goalId);
    if (goal) {
      goal.current = progress;
    }
  }

  async getAchievements(): Promise<Achievement[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.achievements;
  }

  async getUserBehavior(): Promise<UserBehavior | null> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.userBehavior;
  }

  async updateUserPreferences(preferences: Partial<UserBehavior['preferences']>): Promise<void> {
    if (!this.userBehavior) return;

    this.userBehavior.preferences = { ...this.userBehavior.preferences, ...preferences };
  }
}

// Singleton instance
let behavioralNudgesInstance: BehavioralNudges | null = null;

export const getBehavioralNudges = (): BehavioralNudges => {
  if (!behavioralNudgesInstance) {
    behavioralNudgesInstance = new BehavioralNudges();
  }
  return behavioralNudgesInstance;
};

export { BehavioralNudges };
