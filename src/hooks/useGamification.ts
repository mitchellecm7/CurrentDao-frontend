import { useState, useEffect, useCallback } from 'react';

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

interface TradingStreak {
  id: string;
  name: string;
  currentStreak: number;
  bestStreak: number;
  lastTradeDate: Date;
  consistencyBonus: number;
  multiplier: number;
  category: 'daily' | 'weekly' | 'monthly';
  icon: React.ReactNode;
  color: string;
}

interface UserStats {
  totalTrades: number;
  totalVolume: number;
  totalPoints: number;
  currentRank: number;
  level: number;
  experience: number;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  points: number;
  trades: number;
  volume: number;
  avatar: string;
  trend: 'up' | 'down' | 'stable';
}

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
}

export const useGamification = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [tradingStreaks, setTradingStreaks] = useState<TradingStreak[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Mock data generation
  useEffect(() => {
    const mockAchievements: Achievement[] = [
      {
        id: 'first-trade',
        name: 'First Trade',
        description: 'Complete your first energy trade on CurrentDao',
        icon: '🎯',
        category: 'trading',
        rarity: 'common',
        progress: 1,
        maxProgress: 1,
        unlocked: true,
        unlockedAt: new Date('2024-01-15'),
        points: 50
      },
      {
        id: 'energy-saver',
        name: 'Energy Saver',
        description: 'Save 1000 kWh of energy through optimization',
        icon: '⚡',
        category: 'energy',
        rarity: 'rare',
        progress: 750,
        maxProgress: 1000,
        unlocked: true,
        unlockedAt: new Date('2024-02-20'),
        points: 150
      },
      {
        id: 'trading-master',
        name: 'Trading Master',
        description: 'Complete 100 successful trades',
        icon: '📊',
        category: 'trading',
        rarity: 'epic',
        progress: 87,
        maxProgress: 100,
        unlocked: false,
        points: 500
      },
      {
        id: 'sustainability-champion',
        name: 'Sustainability Champion',
        description: 'Reduce carbon footprint by 50%',
        icon: '🌱',
        category: 'sustainability',
        rarity: 'legendary',
        progress: 35,
        maxProgress: 50,
        unlocked: false,
        points: 1000
      },
      {
        id: 'social-butterfly',
        name: 'Social Butterfly',
        description: 'Refer 5 friends to CurrentDao',
        icon: '🦋',
        category: 'social',
        rarity: 'rare',
        progress: 3,
        maxProgress: 5,
        unlocked: false,
        points: 200
      }
    ];

    const mockStreaks: TradingStreak[] = [
      {
        id: 'daily-streak',
        name: 'Daily Trading',
        currentStreak: 7,
        bestStreak: 14,
        lastTradeDate: new Date(),
        consistencyBonus: 1.2,
        multiplier: 1.5,
        category: 'daily',
        icon: '📅',
        color: 'blue'
      },
      {
        id: 'weekly-streak',
        name: 'Weekly Trading',
        currentStreak: 3,
        bestStreak: 8,
        lastTradeDate: new Date(),
        consistencyBonus: 1.1,
        multiplier: 1.3,
        category: 'weekly',
        icon: '📆',
        color: 'green'
      },
      {
        id: 'monthly-streak',
        name: 'Monthly Trading',
        currentStreak: 2,
        bestStreak: 4,
        lastTradeDate: new Date(),
        consistencyBonus: 1.0,
        multiplier: 1.2,
        category: 'monthly',
        icon: '🗓️',
        color: 'purple'
      }
    ];

    const mockUserStats: UserStats = {
      totalTrades: 234,
      totalVolume: 15420.50,
      totalPoints: 2850,
      currentRank: 42,
      level: 15,
      experience: 14500
    };

    const mockLeaderboard: LeaderboardEntry[] = [
      {
        userId: 'user-001',
        username: 'EnergyMaster',
        rank: 1,
        points: 5420,
        trades: 456,
        volume: 32100.00,
        avatar: '🥇',
        trend: 'up'
      },
      {
        userId: 'user-002',
        username: 'TradeKing',
        rank: 2,
        points: 4890,
        trades: 398,
        volume: 28900.00,
        avatar: '🥈',
        trend: 'up'
      },
      {
        userId: 'user-003',
        username: 'EcoTrader',
        rank: 3,
        points: 4230,
        trades: 312,
        volume: 23400.00,
        avatar: '🥉',
        trend: 'stable'
      }
    ];

    const mockChallenges: Challenge[] = [
      {
        id: 'weekly-volume',
        title: 'Weekly Volume Challenge',
        description: 'Complete $5,000 in trading volume this week',
        type: 'weekly',
        target: 5000,
        current: 3200,
        reward: 250,
        difficulty: 'medium',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-04-07'),
        progress: 64,
        completed: false
      },
      {
        id: 'monthly-trades',
        title: 'Monthly Trades Marathon',
        description: 'Complete 50 trades this month',
        type: 'monthly',
        target: 50,
        current: 23,
        reward: 500,
        difficulty: 'hard',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-04-30'),
        progress: 46,
        completed: false
      },
      {
        id: 'sustainability-goal',
        title: 'Sustainability Champion',
        description: 'Reduce energy consumption by 20% this month',
        type: 'monthly',
        target: 20,
        current: 12,
        reward: 1000,
        difficulty: 'medium',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-04-30'),
        progress: 60,
        completed: false
      }
    ];

    setAchievements(mockAchievements);
    setTradingStreaks(mockStreaks);
    setUserStats(mockUserStats);
    setLeaderboard(mockLeaderboard);
    setChallenges(mockChallenges);
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => 
      prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, unlocked: true, unlockedAt: new Date() }
          : achievement
      )
    );
  }, []);

  const updateStreak = useCallback((streakId: string, increment: number = 1) => {
    setTradingStreaks(prev =>
      prev.map(streak =>
        streak.id === streakId
          ? { ...streak, currentStreak: streak.currentStreak + increment }
          : streak
      )
    );
  }, []);

  const getTotalPoints = useCallback(() => {
    return achievements
      .filter(a => a.unlocked)
      .reduce((total, achievement) => total + achievement.points, 0);
  }, [achievements]);

  const completeChallenge = useCallback((challengeId: string) => {
    setChallenges(prev =>
      prev.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, completed: true, progress: 100 }
          : challenge
      )
    );
  }, []);

  const shareAchievement = useCallback((achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && achievement.unlocked) {
      // In a real app, this would trigger social sharing
      console.log(`Sharing achievement: ${achievement.name}`);
      return true;
    }
    return false;
  }, [achievements]);

  return {
    achievements,
    tradingStreaks,
    userStats,
    leaderboard,
    challenges,
    unlockAchievement,
    updateStreak,
    getTotalPoints,
    completeChallenge,
    shareAchievement
  };
};
