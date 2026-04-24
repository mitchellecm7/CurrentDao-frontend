import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Users, Crown, Medal, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  points: number;
  trades: number;
  volume: number;
  avatar: string;
  trend: 'up' | 'down' | 'stable';
  weeklyChange?: number;
  monthlyChange?: number;
}

interface LeaderboardStats {
  totalParticipants: number;
  activeToday: number;
  averagePoints: number;
  topPercentile: number;
}

export const Leaderboards: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<'points' | 'trades' | 'volume'>('points');
  const [userRank, setUserRank] = useState<number | null>(null);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);

  // Mock leaderboard data
  useEffect(() => {
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        userId: 'user-001',
        username: 'EnergyMaster',
        rank: 1,
        points: 5420,
        trades: 456,
        volume: 32100.00,
        avatar: '🥇',
        trend: 'up',
        weeklyChange: 12.5,
        monthlyChange: 28.3
      },
      {
        userId: 'user-002',
        username: 'TradeKing',
        rank: 2,
        points: 4890,
        trades: 398,
        volume: 28900.00,
        avatar: '🥈',
        trend: 'up',
        weeklyChange: 8.2,
        monthlyChange: 15.7
      },
      {
        userId: 'user-003',
        username: 'EcoTrader',
        rank: 3,
        points: 4230,
        trades: 312,
        volume: 23400.00,
        avatar: '🥉',
        trend: 'stable',
        weeklyChange: -2.1,
        monthlyChange: 5.3
      },
      {
        userId: 'user-004',
        username: 'SolarPower',
        rank: 4,
        points: 3890,
        trades: 287,
        volume: 19800.00,
        avatar: '🏅',
        trend: 'down',
        weeklyChange: -5.4,
        monthlyChange: -8.9
      },
      {
        userId: 'user-005',
        username: 'WindWizard',
        rank: 5,
        points: 3560,
        trades: 265,
        volume: 17600.00,
        avatar: '🏆',
        trend: 'up',
        weeklyChange: 3.8,
        monthlyChange: 12.1
      }
    ];

    const mockStats: LeaderboardStats = {
      totalParticipants: 1247,
      activeToday: 89,
      averagePoints: 2847,
      topPercentile: 15.2
    };

    setLeaderboard(mockLeaderboard);
    setStats(mockStats);
    
    // Find current user's rank (mock)
    setUserRank(42);
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-50';
    if (rank === 2) return 'text-gray-600 bg-gray-50';
    if (rank === 3) return 'text-orange-600 bg-orange-50';
    return 'text-gray-900';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getFilteredLeaderboard = () => {
    return leaderboard.slice(0, 20); // Show top 20
  };

  return (
    <div className="energy-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Trophy className="w-6 h-6 text-yellow-500 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Leaderboards</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Your Rank</p>
            <p className="text-2xl font-bold text-purple-600">#{userRank || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Points</p>
            <p className="text-2xl font-bold text-blue-600">
              {leaderboard.find(u => u.userId === 'current-User')?.points.toLocaleString() || '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Period and Category Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
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
        <div className="flex space-x-2">
          {(['points', 'trades', 'volume'] as const).map(category => (
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
      </div>

      {/* Leaderboard Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Traders</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.activeToday}</p>
            <p className="text-sm text-gray-600">Active Today</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.averagePoints.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Average Points</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Crown className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">Top {stats.topPercentile}%</p>
            <p className="text-sm text-gray-600">Percentile</p>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trader</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {selectedCategory === 'points' ? 'Points' : selectedCategory === 'trades' ? 'Trades' : 'Volume'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredLeaderboard().map((entry) => (
                <tr key={entry.userId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center font-bold ${getRankColor(entry.rank)}`}>
                      <span className="text-lg mr-2">#{entry.rank}</span>
                      <span className="text-2xl">{entry.avatar}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{entry.username}</span>
                      {entry.userId === 'Current-User' && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">You</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      {selectedCategory === 'points' 
                        ? entry.points.toLocaleString()
                        : selectedCategory === 'trades'
                        ? entry.trades.toLocaleString()
                        : `$${entry.volume.toLocaleString()}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(entry.trend)}
                      <span className={`text-sm font-medium ${getChangeColor(entry.weeklyChange || 0)}`}>
                        {entry.weeklyChange && entry.weeklyChange > 0 ? '+' : ''}{entry.weeklyChange?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={leaderboard.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="username" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `${name}: ${value}`,
                selectedCategory === 'points' ? 'points' : selectedCategory === 'trades' ? 'trades' : 'volume'
              ]}
            />
            <Bar 
              dataKey={selectedCategory} 
              fill="#3B82F6"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Motivational Message */}
      {userRank && userRank <= 10 && (
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Crown className="w-6 h-6 text-orange-500 mr-3" />
            <div>
              <h4 className="font-semibold text-gray-900">Top 10 Performer!</h4>
              <p className="text-sm text-gray-600">
                You're ranked #{userRank} globally! Keep up the excellent work to maintain your elite status.
              </p>
            </div>
          </div>
      )}

      {userRank && userRank > 100 && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-blue-500 mr-3" />
            <div>
              <h4 className="font-semibold text-gray-900">Room to Grow!</h4>
              <p className="text-sm text-gray-600">
                You're ranked #{userRank}. Focus on consistency and you'll climb the leaderboard quickly!
              </p>
            </div>
          </div>
      )}
    </div>
  );
};
