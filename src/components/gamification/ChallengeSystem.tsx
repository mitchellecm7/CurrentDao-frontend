import React, { useState, useEffect } from 'react';
import { Target, Trophy, Calendar, Award, Clock, Zap, Star, CheckCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, Area } from 'recharts';

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

interface ChallengeStats {
  totalChallenges: number;
  completedChallenges: number;
  successRate: number;
  totalRewards: number;
  activeChallenges: number;
  weeklyProgress: number;
  monthlyProgress: number;
}

export const ChallengeSystem: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userStats, setUserStats] = useState<ChallengeStats | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});

  // Mock challenge data
  useEffect(() => {
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
        completed: false,
        category: 'trading',
        participants: 1247,
        leaderboard: [
          { rank: 1, username: 'VolumeKing', progress: 85 },
          { rank: 2, username: 'TradeMaster', progress: 72 },
          { rank: 3, username: 'Current User', progress: 64 }
        ]
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
        completed: false,
        category: 'trading',
        participants: 892,
        leaderboard: [
          { rank: 1, username: 'MarathonRunner', progress: 48 },
          { rank: 2, username: 'SpeedTrader', progress: 42 },
          { rank: 3, username: 'Current User', progress: 46 }
        ]
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
        completed: false,
        category: 'sustainability',
        participants: 567,
        leaderboard: [
          { rank: 1, username: 'EcoWarrior', progress: 75 },
          { rank: 2, username: 'GreenSaver', progress: 68 },
          { rank: 3, username: 'Current User', progress: 60 }
        ]
      },
      {
        id: 'referral-master',
        title: 'Referral Master',
        description: 'Refer 5 friends to CurrentDao',
        type: 'special',
        target: 5,
        current: 2,
        reward: 1000,
        difficulty: 'easy',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-04-30'),
        progress: 40,
        completed: false,
        category: 'social',
        participants: 234,
        leaderboard: [
          { rank: 1, username: 'Networker', progress: 100 },
          { rank: 2, username: 'Connector', progress: 60 },
          { rank: 3, username: 'Current User', progress: 40 }
        ]
      },
      {
        id: 'energy-hero',
        title: 'Energy Hero Challenge',
        description: 'Save 500 kWh through optimization this week',
        type: 'special',
        target: 500,
        current: 280,
        reward: 750,
        difficulty: 'medium',
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-04-22'),
        progress: 56,
        completed: false,
        category: 'energy',
        participants: 445,
        leaderboard: [
          { rank: 1, username: 'PowerSaver', progress: 92 },
          { rank: 2, username: 'EcoChamp', progress: 78 },
          { rank: 3, username: 'Current User', progress: 56 }
        ]
      }
    ];

    const mockStats: ChallengeStats = {
      totalChallenges: 15,
      completedChallenges: 8,
      successRate: 73.3,
      totalRewards: 4250,
      activeChallenges: 7,
      weeklyProgress: 68,
      monthlyProgress: 54
    };

    setChallenges(mockChallenges);
    setUserStats(mockStats);

    // Calculate time remaining for challenges
    const calculateTimeRemaining = () => {
      const remaining: { [key: string]: string } = {};
      
      challenges.forEach(challenge => {
        if (!challenge.completed) {
          const now = new Date();
          const end = new Date(challenge.endDate);
          const diff = end.getTime() - now.getTime();
          const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
          const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
          
          if (days > 0) {
            remaining[challenge.id] = `${days}d ${hours}h`;
          } else if (hours > 0) {
            remaining[challenge.id] = `${hours}h`;
          } else {
            remaining[challenge.id] = 'Less than 1h';
          }
        }
      });
      
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [challenges]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trading': return 'text-blue-600 bg-blue-50';
      case 'energy': return 'text-green-600 bg-green-50';
      case 'social': return 'text-purple-600 bg-purple-50';
      case 'sustainability': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const categoryMatch = selectedCategory === 'all' || challenge.category === selectedCategory;
    return categoryMatch;
  });

  const joinChallenge = (challengeId: string) => {
    // In a real app, this would handle challenge registration
    console.log(`Joining challenge: ${challengeId}`);
  };

  const getProgressColor = (progress: number, target: number) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="energy-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Target className="w-6 h-6 text-purple-500 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Challenge System</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-blue-600">{userStats?.activeChallenges || 0}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Success Rate</p>
            <p className="text-2xl font-bold text-green-600">{userStats?.successRate?.toFixed(1) || 0}%</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          {(['all', 'trading', 'energy', 'social', 'sustainability'] as const).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="capitalize">{category}</span>
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          {filteredChallenges.length} challenges available
        </div>
      </div>

      {/* Challenge Stats */}
      {userStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{userStats.totalChallenges}</p>
            <p className="text-sm text-gray-600">Total Challenges</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{userStats.completedChallenges}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{userStats.totalRewards.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Rewards</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{userStats.weeklyProgress}%</p>
            <p className="text-sm text-gray-600">Weekly Progress</p>
          </div>
        </div>
      )}

      {/* Challenge Cards */}
      <div className="space-y-4">
        {filteredChallenges.map((challenge) => (
          <div key={challenge.id} className="border rounded-lg p-4 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${getCategoryColor(challenge.category)}`}>
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(challenge.category)}`}>
                      {challenge.category.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium px-2 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.reward} tokens
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">
                  {challenge.current}/{challenge.target}
                </span>
                <span className={`text-sm font-medium ${getProgressColor(challenge.progress, challenge.target)}`}>
                  ({Math.round((challenge.progress / challenge.target) * 100)}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Time Remaining</span>
                <span className="font-medium text-red-600">
                  {timeRemaining[challenge.id] || 'Calculating...'}
                </span>
              </div>
            </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Challenge Actions */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{challenge.startDate.toLocaleDateString()} - {challenge.endDate.toLocaleDateString()}</span>
                </div>
                {challenge.participants && (
                  <span className="ml-4">{challenge.participants} participants</span>
                )}
              </div>
              {challenge.completed ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              ) : (
                <button
                  onClick={() => joinChallenge(challenge.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Join Challenge
                </button>
              )}
            </div>

            {/* Mini Leaderboard */}
            {challenge.leaderboard && challenge.leaderboard.length > 0 && (
              <div className="mt-3 border-t pt-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Top Participants</h4>
                <div className="space-y-2">
                  {challenge.leaderboard.slice(0, 3).map((entry, index) => (
                    <div key={entry.rank} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-bold text-gray-900">#{entry.rank}</span>
                        <Trophy className={`w-4 h-4 ml-2 ${
                          entry.rank === 1 ? 'text-yellow-500' : 
                          entry.rank === 2 ? 'text-gray-400' : 
                          entry.rank === 3 ? 'text-orange-600' : 'text-gray-600'
                        }`} />
                        <span className="ml-2 font-medium text-gray-900">{entry.username}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-medium ${getProgressColor(entry.progress, 100)}`}>
                          {entry.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{userStats.weeklyProgress}%</p>
            <p className="text-sm text-gray-600">Weekly Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{userStats.monthlyProgress}%</p>
            <p className="text-sm text-gray-600">Monthly Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{userStats.successRate}%</p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};
