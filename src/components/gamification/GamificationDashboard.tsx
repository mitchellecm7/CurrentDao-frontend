import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Users, Gift, TrendingUp, Share2, Bell, Settings, Target, Award, Zap, Shield } from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';
import AchievementSystem from './AchievementSystem';
import TradingStreaks from './TradingStreaks';
import Leaderboards from './Leaderboards';
import RewardSystem from './RewardSystem';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface GamificationStats {
  totalPoints: number;
  currentLevel: number;
  experience: number;
  nextLevelExp: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  currentStreak: number;
  longestStreak: number;
  tokensEarned: number;
  challengesCompleted: number;
  rank: number;
  percentile: number;
  weeklyProgress: number;
  monthlyProgress: number;
  socialShares: number;
  engagementRate: number;
}

interface SocialShareData {
  type: 'achievement' | 'streak' | 'milestone' | 'rank' | 'reward';
  title: string;
  description: string;
  points?: number;
  badge?: string;
  achievement?: string;
  image?: string;
  url: string;
}

const GamificationDashboard: React.FC = () => {
  const { 
    userStats, 
    achievements, 
    tradingStreaks, 
    leaderboard, 
    rewards,
    loading,
    error 
  } = useGamification();

  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'streaks' | 'leaderboards' | 'rewards'>('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<SocialShareData | null>(null);

  // Mock comprehensive stats
  const gamificationStats: GamificationStats = {
    totalPoints: userStats?.totalPoints || 3750,
    currentLevel: userStats?.level || 24,
    experience: userStats?.experience || 6850,
    nextLevelExp: 7500,
    achievementsUnlocked: achievements?.filter(a => a.unlocked).length || 12,
    totalAchievements: achievements?.length || 50,
    currentStreak: tradingStreaks?.find(s => s.category === 'daily')?.currentStreak || 7,
    longestStreak: tradingStreaks?.find(s => s.category === 'daily')?.bestStreak || 45,
    tokensEarned: 2850,
    challengesCompleted: 8,
    rank: 42,
    percentile: 72.8,
    weeklyProgress: 85,
    monthlyProgress: 67,
    socialShares: 15,
    engagementRate: 89.2
  };

  const performanceData = [
    { name: 'Mon', points: 120, achievements: 2, streak: 1 },
    { name: 'Tue', points: 180, achievements: 1, streak: 2 },
    { name: 'Wed', points: 95, achievements: 0, streak: 3 },
    { name: 'Thu', points: 220, achievements: 3, streak: 4 },
    { name: 'Fri', points: 160, achievements: 1, streak: 5 },
    { name: 'Sat', points: 140, achievements: 1, streak: 6 },
    { name: 'Sun', points: 200, achievements: 2, streak: 7 }
  ];

  const engagementData = [
    { name: 'Week 1', rate: 75 },
    { name: 'Week 2', rate: 82 },
    { name: 'Week 3', rate: 88 },
    { name: 'Week 4', rate: 91 },
    { name: 'Week 5', rate: 89.2 }
  ];

  const notifications = [
    { id: 1, type: 'achievement', message: 'New achievement unlocked: Energy Saver!', time: '2 hours ago', read: false },
    { id: 2, type: 'streak', message: 'Your 7-day trading streak is active!', time: '5 hours ago', read: false },
    { id: 3, type: 'reward', message: 'New reward available: Week Warrior Badge', time: '1 day ago', read: true },
    { id: 4, type: 'leaderboard', message: 'You moved up 3 ranks in weekly leaderboard!', time: '2 days ago', read: true }
  ];

  const getLevelProgress = () => {
    return (gamificationStats.experience / gamificationStats.nextLevelExp) * 100;
  };

  const getAchievementProgress = () => {
    return (gamificationStats.achievementsUnlocked / gamificationStats.totalAchievements) * 100;
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-100';
    if (rate >= 75) return 'text-blue-600 bg-blue-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handleSocialShare = (type: 'achievement' | 'streak' | 'milestone' | 'rank' | 'reward') => {
    let shareData: SocialShareData;

    switch (type) {
      case 'achievement':
        shareData = {
          type: 'achievement',
          title: 'New Achievement Unlocked! 🏆',
          description: `I just unlocked the "Energy Saver" achievement on CurrentDao! Join me in the energy trading revolution.`,
          points: 100,
          badge: '⚡',
          achievement: 'Energy Saver',
          url: 'https://currentdao.com/achievements'
        };
        break;
      case 'streak':
        shareData = {
          type: 'streak',
          title: `🔥 ${gamificationStats.currentStreak} Day Trading Streak!`,
          description: `I'm on a ${gamificationStats.currentStreak}-day trading streak on CurrentDao! Consistency pays off in energy trading.`,
          url: 'https://currentdao.com/streaks'
        };
        break;
      case 'milestone':
        shareData = {
          type: 'milestone',
          title: '🎯 Milestone Reached!',
          description: `I just reached Level ${gamificationStats.currentLevel} on CurrentDao! ${gamificationStats.totalPoints} total points earned.`,
          points: gamificationStats.totalPoints,
          url: 'https://currentdao.com/profile'
        };
        break;
      case 'rank':
        shareData = {
          type: 'rank',
          title: `🏅 Top ${gamificationStats.percentile.toFixed(0)}% Trader!`,
          description: `I'm ranked #${gamificationStats.rank} globally on CurrentDao! Join the energy trading platform that rewards consistency.`,
          url: 'https://currentdao.com/leaderboards'
        };
        break;
      case 'reward':
        shareData = {
          type: 'reward',
          title: '💰 Reward Claimed!',
          description: `Just claimed ${gamificationStats.tokensEarned} tokens in rewards on CurrentDao! Energy trading has never been more rewarding.`,
          points: gamificationStats.tokensEarned,
          url: 'https://currentdao.com/rewards'
        };
        break;
    }

    setShareData(shareData);
    setShowShareModal(true);
  };

  const shareToSocial = (platform: 'twitter' | 'facebook' | 'linkedin' | 'telegram') => {
    if (!shareData) return;

    const { title, description, url } = shareData;
    const shareText = `${title} ${description} ${url}`;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title + ' ' + description)}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Target className="w-4 h-4" /> },
    { id: 'achievements', name: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
    { id: 'streaks', name: 'Streaks', icon: <Flame className="w-4 h-4" /> },
    { id: 'leaderboards', name: 'Leaderboards', icon: <Users className="w-4 h-4" /> },
    { id: 'rewards', name: 'Rewards', icon: <Gift className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4" />
          <p>Error loading gamification data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-900">Gamification Hub</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Social Share Button */}
              <button
                onClick={() => handleSocialShare('milestone')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Progress</span>
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'achievement' ? 'bg-yellow-500' :
                              notification.type === 'streak' ? 'bg-orange-500' :
                              notification.type === 'reward' ? 'bg-green-500' :
                              'bg-blue-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Points</p>
                    <p className="text-3xl font-bold text-gray-900">{gamificationStats.totalPoints.toLocaleString()}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
                    style={{ width: `${getLevelProgress()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Level {gamificationStats.currentLevel} • {gamificationStats.nextLevelExp - gamificationStats.experience} XP to next</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Achievements</p>
                    <p className="text-3xl font-bold text-gray-900">{gamificationStats.achievementsUnlocked}/{gamificationStats.totalAchievements}</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                    style={{ width: `${getAchievementProgress()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{getAchievementProgress().toFixed(1)}% completed</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Streak</p>
                    <p className="text-3xl font-bold text-gray-900">{gamificationStats.currentStreak} days</p>
                  </div>
                  <Flame className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Best: {gamificationStats.longestStreak} days</span>
                  <span>•</span>
                  <span>Rank #{gamificationStats.rank}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Engagement Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{gamificationStats.engagementRate.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(gamificationStats.engagementRate)}`}>
                  <Shield className="w-3 h-3" />
                  <span>Highly Engaged</span>
                </div>
              </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="points" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                      name="Points"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Engagement %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => handleSocialShare('achievement')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Share Achievement</p>
                </button>
                <button
                  onClick={() => handleSocialShare('streak')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Share Streak</p>
                </button>
                <button
                  onClick={() => handleSocialShare('rank')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Share Rank</p>
                </button>
                <button
                  onClick={() => handleSocialShare('reward')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <Gift className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Share Reward</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'achievements' && <AchievementSystem />}
        {activeTab === 'streaks' && <TradingStreaks />}
        {activeTab === 'leaderboards' && <Leaderboards />}
        {activeTab === 'rewards' && <RewardSystem />}
      </div>

      {/* Share Modal */}
      {showShareModal && shareData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Share Your Success</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{shareData.badge || '🏆'}</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{shareData.title}</h4>
              <p className="text-gray-600 text-sm">{shareData.description}</p>
              {shareData.points && (
                <p className="text-blue-600 font-medium mt-2">{shareData.points} points earned!</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => shareToSocial('twitter')}
                className="flex items-center justify-center space-x-2 p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                <span>𝕏</span>
                <span>Twitter</span>
              </button>
              <button
                onClick={() => shareToSocial('facebook')}
                className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>f</span>
                <span>Facebook</span>
              </button>
              <button
                onClick={() => shareToSocial('linkedin')}
                className="flex items-center justify-center space-x-2 p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                <span>in</span>
                <span>LinkedIn</span>
              </button>
              <button
                onClick={() => shareToSocial('telegram')}
                className="flex items-center justify-center space-x-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <span>✈️</span>
                <span>Telegram</span>
              </button>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                Sharing your achievements increases engagement by 25% and helps grow the CurrentDao community!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationDashboard;
