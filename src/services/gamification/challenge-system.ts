interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'special';
  target: number;
  current: number;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  startDate: Date;
  endDate: Date;
  progress: number;
  completed: boolean;
  category: 'trading' | 'energy' | 'social' | 'sustainability';
  participants?: number;
  leaderboard?: Array<{ rank: number; username: string; progress: number }>;
}

interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'special';
  target: number;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'trading' | 'energy' | 'social' | 'sustainability';
  duration: number; // in days
  requirements?: string[];
  bonusRewards?: number[];
}

interface UserChallenge {
  userId: string;
  challengeId: string;
  joinedAt: Date;
  currentProgress: number;
  completed: boolean;
  completedAt?: Date;
  rewardClaimed: boolean;
}

class ChallengeSystem {
  private challenges: Map<string, Challenge> = new Map();
  private userChallenges: Map<string, UserChallenge[]> = new Map();
  private challengeTemplates: ChallengeTemplate[] = [];

  constructor() {
    this.initializeChallengeTemplates();
    this.generateActiveChallenges();
  }

  private initializeChallengeTemplates() {
    this.challengeTemplates = [
      // Weekly Trading Challenges
      {
        id: 'weekly-volume-easy',
        title: 'Weekly Volume Starter',
        description: 'Complete $1,000 in trading volume this week',
        type: 'weekly',
        target: 1000,
        reward: 100,
        difficulty: 'easy',
        category: 'trading',
        duration: 7,
        requirements: ['Complete at least 1 trade']
      },
      {
        id: 'weekly-volume-medium',
        title: 'Weekly Volume Challenge',
        description: 'Complete $5,000 in trading volume this week',
        type: 'weekly',
        target: 5000,
        reward: 250,
        difficulty: 'medium',
        category: 'trading',
        duration: 7,
        requirements: ['Complete at least 5 trades']
      },
      {
        id: 'weekly-volume-hard',
        title: 'Weekly Volume Marathon',
        description: 'Complete $10,000 in trading volume this week',
        type: 'weekly',
        target: 10000,
        reward: 500,
        difficulty: 'hard',
        category: 'trading',
        duration: 7,
        requirements: ['Complete at least 10 trades'],
        bonusRewards: [100, 200] // Additional rewards for milestones
      },

      // Monthly Trading Challenges
      {
        id: 'monthly-trades-easy',
        title: 'Monthly Trading Beginner',
        description: 'Complete 10 trades this month',
        type: 'monthly',
        target: 10,
        reward: 200,
        difficulty: 'easy',
        category: 'trading',
        duration: 30
      },
      {
        id: 'monthly-trades-medium',
        title: 'Monthly Trades Marathon',
        description: 'Complete 50 trades this month',
        type: 'monthly',
        target: 50,
        reward: 500,
        difficulty: 'medium',
        category: 'trading',
        duration: 30,
        requirements: ['Maintain 80% success rate']
      },
      {
        id: 'monthly-trades-hard',
        title: 'Monthly Trading Legend',
        description: 'Complete 100 trades this month',
        type: 'monthly',
        target: 100,
        reward: 1500,
        difficulty: 'hard',
        category: 'trading',
        duration: 30,
        requirements: ['Maintain 90% success rate', 'Trade minimum $50,000 volume'],
        bonusRewards: [300, 500, 1000]
      },

      // Energy Challenges
      {
        id: 'energy-saver-weekly',
        title: 'Energy Saver Weekly',
        description: 'Save 100 kWh through optimization this week',
        type: 'weekly',
        target: 100,
        reward: 150,
        difficulty: 'medium',
        category: 'energy',
        duration: 7
      },
      {
        id: 'energy-saver-monthly',
        title: 'Energy Guardian Monthly',
        description: 'Save 500 kWh through optimization this month',
        type: 'monthly',
        target: 500,
        reward: 750,
        difficulty: 'hard',
        category: 'energy',
        duration: 30,
        bonusRewards: [200, 400]
      },

      // Sustainability Challenges
      {
        id: 'sustainability-monthly',
        title: 'Sustainability Champion',
        description: 'Reduce carbon footprint by 20% this month',
        type: 'monthly',
        target: 20,
        reward: 1000,
        difficulty: 'medium',
        category: 'sustainability',
        duration: 30
      },

      // Social Challenges
      {
        id: 'referral-monthly',
        title: 'Referral Master',
        description: 'Refer 5 friends to CurrentDao this month',
        type: 'monthly',
        target: 5,
        reward: 1000,
        difficulty: 'easy',
        category: 'social',
        duration: 30
      },

      // Special Challenges
      {
        id: 'special-weekend-warrior',
        title: 'Weekend Warrior',
        description: 'Complete 20 trades during the weekend',
        type: 'special',
        target: 20,
        reward: 300,
        difficulty: 'medium',
        category: 'trading',
        duration: 3, // Weekend only
        requirements: ['Trades must be completed on Saturday or Sunday']
      },
      {
        id: 'special-energy-hero',
        title: 'Energy Hero Challenge',
        description: 'Save 200 kWh through optimization in 7 days',
        type: 'special',
        target: 200,
        reward: 750,
        difficulty: 'hard',
        category: 'energy',
        duration: 7,
        bonusRewards: [250]
      }
    ];
  }

  private generateActiveChallenges() {
    const now = new Date();
    const activeChallenges: Challenge[] = [];

    // Generate challenges from templates
    for (const template of this.challengeTemplates) {
      const challenge = this.createChallengeFromTemplate(template, now);
      activeChallenges.push(challenge);
      this.challenges.set(challenge.id, challenge);
    }
  }

  private createChallengeFromTemplate(template: ChallengeTemplate, startDate: Date): Challenge {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + template.duration);

    return {
      id: template.id,
      title: template.title,
      description: template.description,
      type: template.type,
      target: template.target,
      current: 0,
      reward: template.reward,
      difficulty: template.difficulty,
      category: template.category,
      startDate,
      endDate,
      progress: 0,
      completed: false,
      participants: 0,
      leaderboard: []
    };
  }

  public getAllActiveChallenges(): Challenge[] {
    return Array.from(this.challenges.values());
  }

  public getChallengesByType(type: 'weekly' | 'monthly' | 'special'): Challenge[] {
    return this.getAllActiveChallenges().filter(challenge => challenge.type === type);
  }

  public getChallengesByCategory(category: 'trading' | 'energy' | 'social' | 'sustainability'): Challenge[] {
    return this.getAllActiveChallenges().filter(challenge => challenge.category === category);
  }

  public getChallengesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Challenge[] {
    return this.getAllActiveChallenges().filter(challenge => challenge.difficulty === difficulty);
  }

  public getChallengeById(id: string): Challenge | undefined {
    return this.challenges.get(id);
  }

  public joinChallenge(userId: string, challengeId: string): boolean {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return false;

    // Check if user already joined
    const userChallengeList = this.userChallenges.get(userId) || [];
    const alreadyJoined = userChallengeList.some(uc => uc.challengeId === challengeId);
    if (alreadyJoined) return false;

    // Check if challenge is still active
    const now = new Date();
    if (now > challenge.endDate) return false;

    const userChallenge: UserChallenge = {
      userId,
      challengeId,
      joinedAt: now,
      currentProgress: 0,
      completed: false,
      rewardClaimed: false
    };

    userChallengeList.push(userChallenge);
    this.userChallenges.set(userId, userChallengeList);

    // Update challenge participants count
    challenge.participants = (challenge.participants || 0) + 1;

    return true;
  }

  public updateProgress(userId: string, challengeId: string, progress: number): boolean {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return false;

    const userChallengeList = this.userChallenges.get(userId) || [];
    const userChallenge = userChallengeList.find(uc => uc.challengeId === challengeId);
    if (!userChallenge) return false;

    // Update progress
    userChallenge.currentProgress = Math.min(progress, challenge.target);
    userChallenge.completed = progress >= challenge.target;
    
    if (userChallenge.completed && !userChallenge.completedAt) {
      userChallenge.completedAt = new Date();
    }

    // Update challenge leaderboard
    this.updateLeaderboard(challenge, userId, progress);

    return true;
  }

  private updateLeaderboard(challenge: Challenge, userId: string, progress: number) {
    if (!challenge.leaderboard) {
      challenge.leaderboard = [];
    }

    const existingEntry = challenge.leaderboard.find(entry => entry.username === userId);
    const progressPercentage = (progress / challenge.target) * 100;

    if (existingEntry) {
      existingEntry.progress = progressPercentage;
    } else {
      challenge.leaderboard.push({
        rank: 0, // Will be calculated
        username: userId,
        progress: progressPercentage
      });
    }

    // Sort and assign ranks
    challenge.leaderboard.sort((a, b) => b.progress - a.progress);
    challenge.leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });
  }

  public getUserChallenges(userId: string): UserChallenge[] {
    return this.userChallenges.get(userId) || [];
  }

  public getUserCompletedChallenges(userId: string): UserChallenge[] {
    return this.getUserChallenges(userId).filter(uc => uc.completed);
  }

  public getUserActiveChallenges(userId: string): UserChallenge[] {
    const now = new Date();
    return this.getUserChallenges(userId).filter(uc => {
      const challenge = this.challenges.get(uc.challengeId);
      return challenge && !uc.completed && now <= challenge.endDate;
    });
  }

  public calculateChallengeReward(userId: string, challengeId: string): number {
    const challenge = this.challenges.get(challengeId);
    const userChallenge = this.getUserChallenges(userId).find(uc => uc.challengeId === challengeId);
    
    if (!challenge || !userChallenge || !userChallenge.completed) return 0;

    let totalReward = challenge.reward;

    // Add bonus rewards for milestones
    if (challenge.id.includes('monthly-trades-hard')) {
      const progress = (userChallenge.currentProgress / challenge.target) * 100;
      if (progress >= 100) totalReward += 1000; // Completion bonus
      if (progress >= 50) totalReward += 500;  // Halfway bonus
    }

    return totalReward;
  }

  public claimReward(userId: string, challengeId: string): boolean {
    const userChallenge = this.getUserChallenges(userId).find(uc => uc.challengeId === challengeId);
    
    if (!userChallenge || !userChallenge.completed || userChallenge.rewardClaimed) {
      return false;
    }

    userChallenge.rewardClaimed = true;
    return true;
  }

  public getChallengeStats(userId: string) {
    const userChallenges = this.getUserChallenges(userId);
    const completedChallenges = userChallenges.filter(uc => uc.completed);
    const activeChallenges = this.getUserActiveChallenges(userId);

    return {
      totalChallenges: userChallenges.length,
      completedChallenges: completedChallenges.length,
      activeChallenges: activeChallenges.length,
      successRate: userChallenges.length > 0 ? (completedChallenges.length / userChallenges.length) * 100 : 0,
      totalRewards: completedChallenges.reduce((total, uc) => {
        return total + this.calculateChallengeReward(userId, uc.challengeId);
      }, 0),
      unclaimedRewards: completedChallenges.filter(uc => !uc.rewardClaimed).length
    };
  }

  public getRecommendedChallenges(userId: string, limit: number = 3): Challenge[] {
    const userChallenges = this.getUserChallenges(userId);
    const activeChallenges = this.getUserActiveChallenges(userId);
    const completedChallenges = this.getUserCompletedChallenges(userId);

    // Get challenges user hasn't joined
    const availableChallenges = this.getAllActiveChallenges().filter(challenge => {
      return !userChallenges.some(uc => uc.challengeId === challenge.id);
    });

    // Score challenges based on user's performance and preferences
    return availableChallenges
      .map(challenge => ({
        ...challenge,
        score: this.calculateChallengeScore(challenge, completedChallenges, activeChallenges)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private calculateChallengeScore(challenge: Challenge, completedChallenges: UserChallenge[], activeChallenges: UserChallenge[]): number {
    let score = 0;

    // Prefer challenges in categories user has completed
    const completedCategories = new Set(
      completedChallenges.map(uc => {
        const ch = this.challenges.get(uc.challengeId);
        return ch?.category;
      })
    );

    if (completedCategories.has(challenge.category)) {
      score += 20;
    }

    // Prefer challenges with appropriate difficulty
    const successRate = completedChallenges.length > 0 ? 
      (completedChallenges.length / (completedChallenges.length + activeChallenges.length)) * 100 : 50;

    if (successRate >= 80 && challenge.difficulty === 'hard') score += 15;
    if (successRate >= 60 && challenge.difficulty === 'medium') score += 10;
    if (successRate < 40 && challenge.difficulty === 'easy') score += 5;

    // Prefer challenges ending soon
    const now = new Date();
    const timeUntilEnd = challenge.endDate.getTime() - now.getTime();
    const daysUntilEnd = timeUntilEnd / (1000 * 60 * 60 * 24);
    
    if (daysUntilEnd <= 3) score += 10;
    else if (daysUntilEnd <= 7) score += 5;

    // Prefer challenges with higher rewards
    score += Math.min(challenge.reward / 100, 10);

    return score;
  }

  public generateWeeklyChallenges(): Challenge[] {
    const weeklyTemplates = this.challengeTemplates.filter(t => t.type === 'weekly');
    const now = new Date();
    const newChallenges: Challenge[] = [];

    for (const template of weeklyTemplates) {
      const challenge = this.createChallengeFromTemplate(template, now);
      newChallenges.push(challenge);
      this.challenges.set(challenge.id, challenge);
    }

    return newChallenges;
  }

  public generateMonthlyChallenges(): Challenge[] {
    const monthlyTemplates = this.challengeTemplates.filter(t => t.type === 'monthly');
    const now = new Date();
    const newChallenges: Challenge[] = [];

    for (const template of monthlyTemplates) {
      const challenge = this.createChallengeFromTemplate(template, now);
      newChallenges.push(challenge);
      this.challenges.set(challenge.id, challenge);
    }

    return newChallenges;
  }

  public generateSpecialChallenges(): Challenge[] {
    const specialTemplates = this.challengeTemplates.filter(t => t.type === 'special');
    const now = new Date();
    const newChallenges: Challenge[] = [];

    for (const template of specialTemplates) {
      const challenge = this.createChallengeFromTemplate(template, now);
      newChallenges.push(challenge);
      this.challenges.set(challenge.id, challenge);
    }

    return newChallenges;
  }

  public cleanupExpiredChallenges(): Challenge[] {
    const now = new Date();
    const expiredChallenges: Challenge[] = [];

    for (const [id, challenge] of this.challenges) {
      if (now > challenge.endDate) {
        expiredChallenges.push(challenge);
        this.challenges.delete(id);
      }
    }

    return expiredChallenges;
  }

  public getChallengeLeaderboard(challengeId: string, limit: number = 10): Array<{ rank: number; username: string; progress: number }> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge || !challenge.leaderboard) return [];

    return challenge.leaderboard.slice(0, limit);
  }
}

export default ChallengeSystem;
