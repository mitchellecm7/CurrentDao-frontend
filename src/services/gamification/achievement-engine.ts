interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'energy' | 'trading' | 'sustainability' | 'social' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  points: number;
  bonusMultiplier?: number;
}

interface UserProfile {
  userId: string;
  username: string;
  level: number;
  experience: number;
  totalTrades: number;
  totalVolume: number;
  energySaved: number;
  carbonReduced: number;
  referrals: number;
  achievements: string[];
  streakDays: number;
}

interface AchievementCriteria {
  type: 'trades' | 'volume' | 'energy' | 'carbon' | 'referrals' | 'streak' | 'level' | 'login';
  target: number;
  operator: 'equals' | 'greater_than' | 'less_than' | 'at_least' | 'at_most';
}

class AchievementEngine {
  private achievements: Achievement[] = [];
  private userProfiles: Map<string, UserProfile> = new Map();

  constructor() {
    this.initializeAchievements();
  }

  private initializeAchievements() {
    this.achievements = [
      // Trading Achievements
      {
        id: 'first-trade',
        name: 'First Trade',
        description: 'Complete your first energy trade on CurrentDao',
        icon: '🎯',
        category: 'trading',
        rarity: 'common',
        progress: 0,
        maxProgress: 1,
        unlocked: false,
        points: 50
      },
      {
        id: 'trading-novice',
        name: 'Trading Novice',
        description: 'Complete 10 successful trades',
        icon: '📈',
        category: 'trading',
        rarity: 'common',
        progress: 0,
        maxProgress: 10,
        unlocked: false,
        points: 100
      },
      {
        id: 'trading-expert',
        name: 'Trading Expert',
        description: 'Complete 100 successful trades',
        icon: '💹',
        category: 'trading',
        rarity: 'rare',
        progress: 0,
        maxProgress: 100,
        unlocked: false,
        points: 500
      },
      {
        id: 'trading-master',
        name: 'Trading Master',
        description: 'Complete 500 successful trades',
        icon: '👑',
        category: 'trading',
        rarity: 'epic',
        progress: 0,
        maxProgress: 500,
        unlocked: false,
        points: 2500
      },
      {
        id: 'trading-legend',
        name: 'Trading Legend',
        description: 'Complete 1000 successful trades',
        icon: '🏆',
        category: 'trading',
        rarity: 'legendary',
        progress: 0,
        maxProgress: 1000,
        unlocked: false,
        points: 10000
      },

      // Volume Achievements
      {
        id: 'volume-starter',
        name: 'Volume Starter',
        description: 'Reach $1,000 in total trading volume',
        icon: '💰',
        category: 'trading',
        rarity: 'common',
        progress: 0,
        maxProgress: 1000,
        unlocked: false,
        points: 75
      },
      {
        id: 'volume-champion',
        name: 'Volume Champion',
        description: 'Reach $10,000 in total trading volume',
        icon: '💎',
        category: 'trading',
        rarity: 'rare',
        progress: 0,
        maxProgress: 10000,
        unlocked: false,
        points: 750
      },
      {
        id: 'volume-titan',
        name: 'Volume Titan',
        description: 'Reach $100,000 in total trading volume',
        icon: '🏦',
        category: 'trading',
        rarity: 'epic',
        progress: 0,
        maxProgress: 100000,
        unlocked: false,
        points: 5000
      },

      // Energy Achievements
      {
        id: 'energy-saver',
        name: 'Energy Saver',
        description: 'Save 100 kWh of energy through optimization',
        icon: '⚡',
        category: 'energy',
        rarity: 'common',
        progress: 0,
        maxProgress: 100,
        unlocked: false,
        points: 150
      },
      {
        id: 'energy-guardian',
        name: 'Energy Guardian',
        description: 'Save 1000 kWh of energy through optimization',
        icon: '🛡️',
        category: 'energy',
        rarity: 'rare',
        progress: 0,
        maxProgress: 1000,
        unlocked: false,
        points: 1000
      },
      {
        id: 'energy-master',
        name: 'Energy Master',
        description: 'Save 5000 kWh of energy through optimization',
        icon: '🌟',
        category: 'energy',
        rarity: 'epic',
        progress: 0,
        maxProgress: 5000,
        unlocked: false,
        points: 5000
      },

      // Sustainability Achievements
      {
        id: 'carbon-warrior',
        name: 'Carbon Warrior',
        description: 'Reduce carbon footprint by 10%',
        icon: '🌱',
        category: 'sustainability',
        rarity: 'common',
        progress: 0,
        maxProgress: 10,
        unlocked: false,
        points: 200
      },
      {
        id: 'eco-champion',
        name: 'Eco Champion',
        description: 'Reduce carbon footprint by 25%',
        icon: '🌿',
        category: 'sustainability',
        rarity: 'rare',
        progress: 0,
        maxProgress: 25,
        unlocked: false,
        points: 800
      },
      {
        id: 'sustainability-legend',
        name: 'Sustainability Legend',
        description: 'Reduce carbon footprint by 50%',
        icon: '🌍',
        category: 'sustainability',
        rarity: 'legendary',
        progress: 0,
        maxProgress: 50,
        unlocked: false,
        points: 5000
      },

      // Social Achievements
      {
        id: 'social-butterfly',
        name: 'Social Butterfly',
        description: 'Refer 5 friends to CurrentDao',
        icon: '🦋',
        category: 'social',
        rarity: 'common',
        progress: 0,
        maxProgress: 5,
        unlocked: false,
        points: 250
      },
      {
        id: 'network-builder',
        name: 'Network Builder',
        description: 'Refer 20 friends to CurrentDao',
        icon: '🌐',
        category: 'social',
        rarity: 'rare',
        progress: 0,
        maxProgress: 20,
        unlocked: false,
        points: 1000
      },
      {
        id: 'community-legend',
        name: 'Community Legend',
        description: 'Refer 50 friends to CurrentDao',
        icon: '👥',
        category: 'social',
        rarity: 'epic',
        progress: 0,
        maxProgress: 50,
        unlocked: false,
        points: 3000
      },

      // Streak Achievements
      {
        id: 'streak-beginner',
        name: 'Streak Beginner',
        description: 'Maintain a 3-day trading streak',
        icon: '🔥',
        category: 'milestone',
        rarity: 'common',
        progress: 0,
        maxProgress: 3,
        unlocked: false,
        points: 100
      },
      {
        id: 'streak-warrior',
        name: 'Streak Warrior',
        description: 'Maintain a 14-day trading streak',
        icon: '⚔️',
        category: 'milestone',
        rarity: 'rare',
        progress: 0,
        maxProgress: 14,
        unlocked: false,
        points: 500
      },
      {
        id: 'streak-immortal',
        name: 'Streak Immortal',
        description: 'Maintain a 30-day trading streak',
        icon: '👑',
        category: 'milestone',
        rarity: 'epic',
        progress: 0,
        maxProgress: 30,
        unlocked: false,
        points: 2000
      },

      // Level Achievements
      {
        id: 'level-5',
        name: 'Level 5',
        description: 'Reach level 5 in CurrentDao',
        icon: '⭐',
        category: 'milestone',
        rarity: 'common',
        progress: 0,
        maxProgress: 5,
        unlocked: false,
        points: 300
      },
      {
        id: 'level-10',
        name: 'Level 10',
        description: 'Reach level 10 in CurrentDao',
        icon: '⭐⭐',
        category: 'milestone',
        rarity: 'rare',
        progress: 0,
        maxProgress: 10,
        unlocked: false,
        points: 1000
      },
      {
        id: 'level-25',
        name: 'Level 25',
        description: 'Reach level 25 in CurrentDao',
        icon: '⭐⭐⭐',
        category: 'milestone',
        rarity: 'epic',
        progress: 0,
        maxProgress: 25,
        unlocked: false,
        points: 5000
      },
      {
        id: 'level-50',
        name: 'Level 50',
        description: 'Reach level 50 in CurrentDao',
        icon: '🌟',
        category: 'milestone',
        rarity: 'legendary',
        progress: 0,
        maxProgress: 50,
        unlocked: false,
        points: 15000
      }
    ];
  }

  public getAllAchievements(): Achievement[] {
    return this.achievements;
  }

  public getAchievementsByCategory(category: string): Achievement[] {
    return this.achievements.filter(achievement => achievement.category === category);
  }

  public getAchievementById(id: string): Achievement | undefined {
    return this.achievements.find(achievement => achievement.id === id);
  }

  public getUnlockedAchievements(userId: string): Achievement[] {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) return [];

    return this.achievements.filter(achievement => 
      userProfile.achievements.includes(achievement.id)
    );
  }

  public getLockedAchievements(userId: string): Achievement[] {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) return this.achievements;

    return this.achievements.filter(achievement => 
      !userProfile.achievements.includes(achievement.id)
    );
  }

  public checkAndUnlockAchievements(userId: string, userProfile: UserProfile): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    const existingUnlocked = userProfile.achievements;

    for (const achievement of this.achievements) {
      if (existingUnlocked.includes(achievement.id)) continue;

      const criteria = this.getAchievementCriteria(achievement.id);
      if (this.meetsCriteria(criteria, userProfile)) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        newlyUnlocked.push(achievement);
        existingUnlocked.push(achievement.id);
      } else {
        // Update progress
        achievement.progress = this.calculateProgress(criteria, userProfile);
      }
    }

    // Update user profile
    userProfile.achievements = existingUnlocked;
    this.userProfiles.set(userId, userProfile);

    return newlyUnlocked;
  }

  private getAchievementCriteria(achievementId: string): AchievementCriteria[] {
    const criteriaMap: { [key: string]: AchievementCriteria[] } = {
      'first-trade': [
        { type: 'trades', target: 1, operator: 'at_least' }
      ],
      'trading-novice': [
        { type: 'trades', target: 10, operator: 'at_least' }
      ],
      'trading-expert': [
        { type: 'trades', target: 100, operator: 'at_least' }
      ],
      'trading-master': [
        { type: 'trades', target: 500, operator: 'at_least' }
      ],
      'trading-legend': [
        { type: 'trades', target: 1000, operator: 'at_least' }
      ],
      'volume-starter': [
        { type: 'volume', target: 1000, operator: 'at_least' }
      ],
      'volume-champion': [
        { type: 'volume', target: 10000, operator: 'at_least' }
      ],
      'volume-titan': [
        { type: 'volume', target: 100000, operator: 'at_least' }
      ],
      'energy-saver': [
        { type: 'energy', target: 100, operator: 'at_least' }
      ],
      'energy-guardian': [
        { type: 'energy', target: 1000, operator: 'at_least' }
      ],
      'energy-master': [
        { type: 'energy', target: 5000, operator: 'at_least' }
      ],
      'carbon-warrior': [
        { type: 'carbon', target: 10, operator: 'at_least' }
      ],
      'eco-champion': [
        { type: 'carbon', target: 25, operator: 'at_least' }
      ],
      'sustainability-legend': [
        { type: 'carbon', target: 50, operator: 'at_least' }
      ],
      'social-butterfly': [
        { type: 'referrals', target: 5, operator: 'at_least' }
      ],
      'network-builder': [
        { type: 'referrals', target: 20, operator: 'at_least' }
      ],
      'community-legend': [
        { type: 'referrals', target: 50, operator: 'at_least' }
      ],
      'streak-beginner': [
        { type: 'streak', target: 3, operator: 'at_least' }
      ],
      'streak-warrior': [
        { type: 'streak', target: 14, operator: 'at_least' }
      ],
      'streak-immortal': [
        { type: 'streak', target: 30, operator: 'at_least' }
      ],
      'level-5': [
        { type: 'level', target: 5, operator: 'at_least' }
      ],
      'level-10': [
        { type: 'level', target: 10, operator: 'at_least' }
      ],
      'level-25': [
        { type: 'level', target: 25, operator: 'at_least' }
      ],
      'level-50': [
        { type: 'level', target: 50, operator: 'at_least' }
      ]
    };

    return criteriaMap[achievementId] || [];
  }

  private meetsCriteria(criteria: AchievementCriteria[], userProfile: UserProfile): boolean {
    return criteria.every(criterion => {
      const userValue = this.getUserValue(criterion.type, userProfile);
      
      switch (criterion.operator) {
        case 'equals':
          return userValue === criterion.target;
        case 'greater_than':
          return userValue > criterion.target;
        case 'less_than':
          return userValue < criterion.target;
        case 'at_least':
          return userValue >= criterion.target;
        case 'at_most':
          return userValue <= criterion.target;
        default:
          return false;
      }
    });
  }

  private calculateProgress(criteria: AchievementCriteria[], userProfile: UserProfile): number {
    if (criteria.length === 0) return 0;
    
    const mainCriterion = criteria[0]; // Use first criterion for progress
    const userValue = this.getUserValue(mainCriterion.type, userProfile);
    
    return Math.min(userValue, mainCriterion.target);
  }

  private getUserValue(type: string, userProfile: UserProfile): number {
    switch (type) {
      case 'trades':
        return userProfile.totalTrades;
      case 'volume':
        return userProfile.totalVolume;
      case 'energy':
        return userProfile.energySaved;
      case 'carbon':
        return userProfile.carbonReduced;
      case 'referrals':
        return userProfile.referrals;
      case 'streak':
        return userProfile.streakDays;
      case 'level':
        return userProfile.level;
      case 'login':
        return userProfile.experience; // Using experience as login days proxy
      default:
        return 0;
    }
  }

  public getTotalPoints(userId: string): number {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) return 0;

    return this.getUnlockedAchievements(userId)
      .reduce((total, achievement) => total + achievement.points, 0);
  }

  public getAchievementStats(userId: string) {
    const unlocked = this.getUnlockedAchievements(userId);
    const locked = this.getLockedAchievements(userId);

    return {
      total: this.achievements.length,
      unlocked: unlocked.length,
      locked: locked.length,
      completionRate: (unlocked.length / this.achievements.length) * 100,
      totalPoints: unlocked.reduce((sum, a) => sum + a.points, 0),
      byCategory: {
        trading: unlocked.filter(a => a.category === 'trading').length,
        energy: unlocked.filter(a => a.category === 'energy').length,
        sustainability: unlocked.filter(a => a.category === 'sustainability').length,
        social: unlocked.filter(a => a.category === 'social').length,
        milestone: unlocked.filter(a => a.category === 'milestone').length
      },
      byRarity: {
        common: unlocked.filter(a => a.rarity === 'common').length,
        rare: unlocked.filter(a => a.rarity === 'rare').length,
        epic: unlocked.filter(a => a.rarity === 'epic').length,
        legendary: unlocked.filter(a => a.rarity === 'legendary').length
      }
    };
  }

  public getRecommendedAchievements(userId: string, limit: number = 5): Achievement[] {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) return [];

    const lockedAchievements = this.getLockedAchievements(userId);
    
    // Sort by progress and potential impact
    return lockedAchievements
      .map(achievement => ({
        ...achievement,
        progressPercentage: (achievement.progress / achievement.maxProgress) * 100,
        priority: this.calculateAchievementPriority(achievement, userProfile)
      }))
      .sort((a, b) => {
        // Prioritize achievements that are close to completion
        if (a.progressPercentage > b.progressPercentage) return -1;
        if (a.progressPercentage < b.progressPercentage) return 1;
        
        // Then by priority
        if (a.priority > b.priority) return -1;
        if (a.priority < b.priority) return 1;
        
        return 0;
      })
      .slice(0, limit);
  }

  private calculateAchievementPriority(achievement: Achievement, userProfile: UserProfile): number {
    let priority = 0;
    
    // Higher priority for achievements matching user's current focus
    if (userProfile.totalTrades > 0 && achievement.category === 'trading') {
      priority += 10;
    }
    
    if (userProfile.energySaved > 0 && achievement.category === 'energy') {
      priority += 10;
    }
    
    if (userProfile.carbonReduced > 0 && achievement.category === 'sustainability') {
      priority += 10;
    }
    
    // Higher priority for easier achievements
    switch (achievement.rarity) {
      case 'common': priority += 5; break;
      case 'rare': priority += 3; break;
      case 'epic': priority += 1; break;
      case 'legendary': priority += 0; break;
    }
    
    return priority;
  }

  public setUserProfile(userId: string, profile: UserProfile): void {
    this.userProfiles.set(userId, profile);
  }

  public getUserProfile(userId: string): UserProfile | undefined {
    return this.userProfiles.get(userId);
  }

  public updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | undefined {
    const existingProfile = this.userProfiles.get(userId);
    if (!existingProfile) return undefined;

    const updatedProfile = { ...existingProfile, ...updates };
    this.userProfiles.set(userId, updatedProfile);
    
    // Check for new achievements after update
    this.checkAndUnlockAchievements(userId, updatedProfile);
    
    return updatedProfile;
  }
}

export default AchievementEngine;
