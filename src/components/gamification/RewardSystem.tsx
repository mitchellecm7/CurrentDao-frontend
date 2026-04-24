import React, { useState, useEffect } from 'react';
import { Gift, Coins, Award, Star, Zap, Crown, TrendingUp, Package } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'achievement' | 'streak' | 'milestone' | 'referral' | 'daily' | 'weekly';
  amount: number;
  currency: 'tokens' | 'points' | 'discount';
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  claimed: boolean;
  claimedAt?: Date;
  expiresAt?: Date;
  multiplier?: number;
}

interface RewardStats {
  totalEarned: number;
  totalClaimed: number;
  availableToClaim: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  nextRewardIn: string;
}

interface TokenBalance {
  tokens: number;
  points: number;
  discounts: number;
  bonusMultiplier: number;
}

export const RewardSystem: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [rewardStats, setRewardStats] = useState<RewardStats | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock reward data
  useEffect(() => {
    const mockRewards: Reward[] = [
      {
        id: 'first-trade-bonus',
        name: 'First Trade Bonus',
        description: 'Complete your first energy trade to earn bonus tokens',
        type: 'achievement',
        amount: 100,
        currency: 'tokens',
        icon: <Gift className="w-5 h-5" />,
        rarity: 'common',
        claimed: true,
        claimedAt: new Date('2024-01-15')
      },
      {
        id: 'streak-master',
        name: 'Streak Master',
        description: 'Maintain a 7-day trading streak for bonus rewards',
        type: 'streak',
        amount: 250,
        currency: 'tokens',
        icon: <Zap className="w-5 h-5" />,
        rarity: 'rare',
        claimed: true,
        claimedAt: new Date('2024-02-20')
      },
      {
        id: 'energy-saver',
        name: 'Energy Saver',
        description: 'Save 1000 kWh through optimization',
        type: 'milestone',
        amount: 500,
        currency: 'points',
        icon: <Award className="w-5 h-5" />,
        rarity: 'epic',
        claimed: false,
        expiresAt: new Date('2024-04-30')
      },
      {
        id: 'referral-champion',
        name: 'Referral Champion',
        description: 'Refer 10 friends to CurrentDao',
        type: 'referral',
        amount: 1000,
        currency: 'tokens',
        icon: <TrendingUp className="w-5 h-5" />,
        rarity: 'legendary',
        claimed: false,
        multiplier: 2.0
      },
      {
        id: 'daily-login',
        name: 'Daily Login Bonus',
        description: 'Log in daily to earn bonus tokens',
        type: 'daily',
        amount: 25,
        currency: 'tokens',
        icon: <Star className="w-5 h-5" />,
        rarity: 'common',
        claimed: false
      },
      {
        id: 'weekly-trader',
        name: 'Weekly Trader',
        description: 'Complete 10 trades in a week',
        type: 'weekly',
        amount: 150,
        currency: 'tokens',
        icon: <Package className="w-5 h-5" />,
        rarity: 'rare',
        claimed: false
      }
    ];

    const mockTokenBalance: TokenBalance = {
      tokens: 2850,
      points: 1420,
      discounts: 3,
      bonusMultiplier: 1.5
    };

    const mockRewardStats: RewardStats = {
      totalEarned: 5425,
      totalClaimed: 3975,
      availableToClaim: 1450,
      weeklyEarnings: 325,
      monthlyEarnings: 1300,
      nextRewardIn: '2 days 14 hours'
    };

    setRewards(mockRewards);
    setTokenBalance(mockTokenBalance);
    setRewardStats(mockRewardStats);
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-50';
      case 'rare': return 'border-blue-400 bg-blue-50';
      case 'epic': return 'border-purple-400 bg-purple-50';
      case 'legendary': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const claimReward = (rewardId: string) => {
    setRewards(prev =>
      prev.map(reward =>
        reward.id === rewardId
          ? { ...reward, claimed: true, claimedAt: new Date() }
          : reward
      )
    );
    
    // Update token balance
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && !reward.claimed) {
      setTokenBalance(prev => prev ? ({
        ...prev,
        tokens: prev.tokens + reward.amount,
        points: prev.points + (reward.currency === 'points' ? reward.amount : 0)
      }) : null);
    }
  };

  const filteredRewards = rewards.filter(reward => {
    const categoryMatch = selectedFilter === 'all' || reward.type === selectedFilter;
    const unclaimedOnly = selectedFilter === 'unclaimed';
    return categoryMatch && (unclaimedOnly ? !reward.claimed : true);
  });

  const rewardDistribution = [
    { name: 'Achievements', value: 35, color: '#3B82F6' },
    { name: 'Streaks', value: 25, color: '#10B981' },
    { name: 'Milestones', value: 20, color: '#8B5CF6' },
    { name: 'Referrals', value: 15, color: '#F59E0B' },
    { name: 'Daily', value: 5, color: '#6B7280' }
  ];

  return (
    <div className="energy-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Gift className="w-6 h-6 text-purple-500 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Reward System</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Available</p>
            <p className="text-2xl font-bold text-purple-600">
              {tokenBalance?.tokens.toLocaleString() || '0'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Points</p>
            <p className="text-2xl font-bold text-blue-600">
              {tokenBalance?.points.toLocaleString() || '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Token Balance */}
      {tokenBalance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
            <Coins className="w-8 h-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{tokenBalance.tokens.toLocaleString()}</p>
            <p className="text-sm opacity-90">Tokens</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg">
            <Star className="w-8 h-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{tokenBalance.points.toLocaleString()}</p>
            <p className="text-sm opacity-90">Points</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg">
            <Crown className="w-8 h-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{tokenBalance.bonusMultiplier}x</p>
            <p className="text-sm opacity-90">Multiplier</p>
          </div>
        </div>
      )}

      {/* Reward Stats */}
      {rewardStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{rewardStats.totalEarned.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Earned</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{rewardStats.totalClaimed.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Claimed</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{rewardStats.availableToClaim.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Available</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{rewardStats.weeklyEarnings.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Weekly Earnings</p>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          {(['all', 'achievement', 'streak', 'milestone', 'referral', 'daily', 'weekly', 'unclaimed'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="capitalize">{filter}</span>
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          Next reward in: {rewardStats?.nextRewardIn}
        </div>
      </div>

      {/* Reward Distribution Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reward Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={rewardDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${percent}%`}
              outerRadius={80}
              fill="#8884d8"
            >
              {rewardDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Available Rewards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRewards.map((reward) => (
            <div
              key={reward.id}
              className={`border rounded-lg p-4 transition-all ${
                reward.claimed
                  ? 'border-gray-300 bg-gray-50 opacity-60'
                  : getRarityColor(reward.rarity)
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${
                    reward.claimed ? 'bg-gray-300' : 'bg-white'
                  }`}>
                    {reward.icon}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">{reward.name}</h4>
                    <span className={`text-xs font-medium ml-2 ${getRarityTextColor(reward.rarity)}`}>
                      {reward.rarity.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">
                    {reward.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{reward.currency}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{reward.description}</p>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {reward.expiresAt && (
                    <span>Expires: {reward.expiresAt.toLocaleDateString()}</span>
                  )}
                </div>
                {reward.claimed ? (
                  <div className="flex items-center text-green-600">
                    <Award className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Claimed</span>
                    {reward.claimedAt && (
                      <span className="text-xs text-gray-500 ml-2">
                        {reward.claimedAt.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => claimReward(reward.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Claim Reward
                  </button>
                )}
              </div>

              {reward.multiplier && (
                <div className="mt-2 flex items-center">
                  <Crown className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-sm font-medium text-yellow-600">
                    {reward.multiplier}x Multiplier Active
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[
            { month: 'Jan', earnings: 800 },
            { month: 'Feb', earnings: 1200 },
            { month: 'Mar', earnings: 950 },
            { month: 'Apr', earnings: 1400 },
            { month: 'May', earnings: 1600 },
            { month: 'Jun', earnings: 1300 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `${value} tokens`} />
            <Bar dataKey="earnings" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
