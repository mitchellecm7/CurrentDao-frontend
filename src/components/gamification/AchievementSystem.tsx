import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, Zap, TrendingUp, Award, Medal, Crown, Gem, Shield } from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';

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

interface AchievementCategory {
  name: string;
  icon: React.ReactNode;
  count: number;
  totalPoints: number;
  color: string;
}

export const AchievementSystem: React.FC = () => {
  const { achievements, userStats, unlockAchievement, getTotalPoints } = useGamification();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const categories: AchievementCategory[] = [
    { name: 'Energy', icon: <Zap className="w-5 h-5" />, count: 0, totalPoints: 0, color: 'blue' },
    { name: 'Trading', icon: <TrendingUp className="w-5 h-5" />, count: 0, totalPoints: 0, color: 'green' },
    { name: 'Sustainability', icon: <Shield className="w-5 h-5" />, count: 0, totalPoints: 0, color: 'emerald' },
    { name: 'Social', icon: <Star className="w-5 h-5" />, count: 0, totalPoints: 0, color: 'purple' },
    { name: 'Milestone', icon: <Crown className="w-5 h-5" />, count: 0, totalPoints: 0, color: 'yellow' }
  ];

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

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const unlockedMatch = !showUnlockedOnly || achievement.unlocked;
    return categoryMatch && unlockedMatch;
  });

  const totalPoints = getTotalPoints();

  useEffect(() => {
    // Update category counts
    categories.forEach(category => {
      const categoryAchievements = achievements.filter(a => a.category === category.name.toLowerCase());
      category.count = categoryAchievements.length;
      category.totalPoints = categoryAchievements.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0);
    });
  }, [achievements]);

  return (
    <div className="energy-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Trophy className="w-6 h-6 text-yellow-500 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Achievement System</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Points</p>
            <p className="text-2xl font-bold text-purple-600">{totalPoints.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Unlocked</p>
            <p className="text-2xl font-bold text-green-600">
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name.toLowerCase())}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  selectedCategory === category.name.toLowerCase() 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showUnlockedOnly}
              onChange={(e) => setShowUnlockedOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Unlocked Only</span>
          </label>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-5 gap-4">
          {categories.map(category => (
            <div key={category.name} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`inline-flex p-2 rounded-full mb-2 bg-${category.color}-100`}>
                {category.icon}
              </div>
              <p className="text-sm font-medium text-gray-900">{category.name}</p>
              <p className="text-xs text-gray-500">{category.count} badges</p>
              <p className="text-sm font-bold text-gray-900">{category.totalPoints} pts</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-card ${getRarityColor(achievement.rarity)} ${
              achievement.unlocked ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${achievement.unlocked ? 'bg-white' : 'bg-gray-200'}`}>
                  {achievement.icon}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                  <span className={`text-xs font-medium ${getRarityTextColor(achievement.rarity)}`}>
                    {achievement.rarity.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-600">{achievement.points}</p>
                {achievement.bonusMultiplier && (
                  <p className="text-xs text-green-600">×{achievement.bonusMultiplier}</p>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Unlock Status */}
            <div className="flex items-center justify-between">
              {achievement.unlocked ? (
                <div className="flex items-center text-green-600">
                  <Trophy className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Unlocked</span>
                  {achievement.unlockedAt && (
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <Medal className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Locked</span>
                </div>
              )}
              <button
                onClick={() => unlockAchievement(achievement.id)}
                disabled={achievement.unlocked}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  achievement.unlocked
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {achievement.unlocked ? 'Unlocked' : 'Unlock'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Achievement Stats */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievement Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{achievements.length}</p>
            <p className="text-sm text-gray-600">Total Badges</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {achievements.filter(a => a.unlocked).length}
            </p>
            <p className="text-sm text-gray-600">Unlocked</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {achievements.filter(a => a.rarity === 'legendary').length}
            </p>
            <p className="text-sm text-gray-600">Legendary</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%
            </p>
            <p className="text-sm text-gray-600">Completion</p>
          </div>
        </div>
      </div>
    </div>
  );
};
