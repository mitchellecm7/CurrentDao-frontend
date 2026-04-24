import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Calendar, Award, Flame, Target, Clock, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useGamification } from '../../hooks/useGamification';

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

interface StreakReward {
  streak: number;
  reward: number;
  bonus: string;
  unlocked: boolean;
}

export const TradingStreaks: React.FC = () => {
  const { tradingStreaks, userStats, updateStreak } = useGamification();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showRewards, setShowRewards] = useState(true);

  const streakRewards: StreakReward[] = [
    { streak: 3, reward: 50, bonus: '+5% Trading Fee Discount', unlocked: true },
    { streak: 7, reward: 150, bonus: '+10% Bonus Rewards', unlocked: true },
    { streak: 14, reward: 300, bonus: '+15% Consistency Bonus', unlocked: true },
    { streak: 30, reward: 750, bonus: '+20% Elite Status', unlocked: true },
    { streak: 60, reward: 2000, bonus: '+25% Legendary Rewards', unlocked: true },
    { streak: 100, reward: 5000, bonus: '+30% Diamond Status', unlocked: true },
    { streak: 365, reward: 25000, bonus: '+50% Immortal Status', unlocked: false }
  ];

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 3) return 'text-purple-600 bg-purple-100';
    if (multiplier >= 2) return 'text-blue-600 bg-blue-100';
    if (multiplier >= 1.5) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStreakColor = (streak: number, maxStreak: number) => {
    const percentage = (streak / maxStreak) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    if (percentage >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const currentStreak = tradingStreaks.find(s => s.category === selectedPeriod);
  const streakData = [
    { day: 'Mon', trades: 12 },
    { day: 'Tue', trades: 8 },
    { day: 'Wed', trades: 15 },
    { day: 'Thu', trades: 10 },
    { day: 'Fri', trades: 18 },
    { day: 'Sat', trades: 6 },
    { day: 'Sun', trades: 9 }
  ];

  useEffect(() => {
    // Simulate real-time streak updates
    const interval = setInterval(() => {
      // This would connect to real-time trading data
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="energy-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Flame className="w-6 h-6 text-orange-500 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Trading Streaks</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowRewards(!showRewards)}
            className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
          >
            {showRewards ? 'Hide Rewards' : 'Show Rewards'}
          </button>
        </div>
      </div>

      {/* Current Streak Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {currentStreak && (
          <>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6 text-center">
              <Flame className="w-12 h-12 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">{currentStreak.currentStreak}</p>
              <p className="text-sm opacity-90">Current Streak</p>
              <p className="text-xs opacity-75 mt-1">{selectedPeriod} trades</p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-6 text-center">
              <Award className="w-12 h-12 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">{currentStreak.bestStreak}</p>
              <p className="text-sm opacity-90">Best Streak</p>
              <p className="text-xs opacity-75 mt-1">All time record</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-6 text-center">
              <Target className="w-12 h-12 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">{currentStreak.multiplier}x</p>
              <p className="text-sm opacity-90">Multiplier</p>
              <p className="text-xs opacity-75 mt-1">Bonus rewards</p>
            </div>
          </>
        )}
      </div>

      {/* Period Selector */}
      <div className="flex space-x-2 mb-6">
        {(['daily', 'weekly', 'monthly'] as const).map(period => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === period
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="capitalize">{period}</span>
          </button>
        ))}
      </div>

      {/* Streak Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trading Activity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={streakData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="trades"
              stroke="#3B82F6"
              fill="#93BBFC"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Streak Rewards */}
      {showRewards && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Streak Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streakRewards.map((reward) => (
              <div
                key={reward.streak}
                className={`border rounded-lg p-4 transition-all ${
                  reward.unlocked
                    ? 'border-green-300 bg-green-50 hover:bg-green-100'
                    : 'border-gray-300 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      reward.unlocked ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <span className="ml-2 font-medium text-gray-900">
                      {reward.streak} Day Streak
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      reward.unlocked ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {reward.reward}
                    </p>
                    <p className="text-xs text-gray-500">tokens</p>
                  </div>
                </div>
                <div className={`text-sm font-medium px-2 py-1 rounded ${
                  reward.unlocked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {reward.bonus}
                </div>
                {!reward.unlocked && (
                  <p className="text-xs text-gray-500 mt-2">
                    Trade consistently for {reward.streak} days to unlock
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consistency Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {currentStreak?.currentStreak || 0}
          </p>
          <p className="text-sm text-gray-600">Days Active</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {Math.round((currentStreak?.consistencyBonus || 0) * 100)}%
          </p>
          <p className="text-sm text-gray-600">Consistency</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {currentStreak?.multiplier || 1}x
          </p>
          <p className="text-sm text-gray-600">Multiplier</p>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {currentStreak?.bestStreak || 0}
          </p>
          <p className="text-sm text-gray-600">Best Streak</p>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <Flame className="w-6 h-6 text-orange-500 mr-3" />
          <div>
            <h4 className="font-semibold text-gray-900">Keep the Streak Alive!</h4>
            <p className="text-sm text-gray-600">
              {currentStreak?.currentStreak === 0
                ? 'Start your trading streak today to unlock bonus rewards and multipliers!'
                : currentStreak?.currentStreak >= 30
                ? `Amazing ${currentStreak.currentStreak}-day streak! You're earning elite rewards!`
                : `You're on a ${currentStreak.currentStreak}-day streak. Keep trading daily to maintain your bonus multiplier!`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
