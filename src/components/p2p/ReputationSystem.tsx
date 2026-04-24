import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  Shield,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Filter,
  Search,
  Activity,
  Target,
  Zap,
  DollarSign,
  MapPin,
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from 'lucide-react';
import { P2PUser } from '@/types/p2p';

interface ReputationSystemProps {
  currentUser: P2PUser | null;
  users: P2PUser[];
}

interface ReputationMetrics {
  totalScore: number;
  categoryScores: {
    reliability: number;
    communication: number;
    quality: number;
    timing: number;
  };
  trend: 'improving' | 'declining' | 'stable';
  rank: number;
  totalUsers: number;
  badges: string[];
}

interface ReputationHistory {
  id: string;
  date: string;
  type: 'trade_completed' | 'dispute_resolved' | 'review_received' | 'milestone_achieved';
  description: string;
  impact: number;
  category: string;
}

export const ReputationSystem: React.FC<ReputationSystemProps> = ({
  currentUser,
  users
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<P2PUser | null>(currentUser);
  const [filterCategory, setFilterCategory] = useState<'all' | 'reliability' | 'communication' | 'quality' | 'timing'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'trades' | 'success_rate' | 'recent'>('score');
  const [showDetails, setShowDetails] = useState(false);

  // Mock reputation metrics - would come from API
  const reputationMetrics: ReputationMetrics = {
    totalScore: currentUser?.reputationScore || 0,
    categoryScores: {
      reliability: 4.8,
      communication: 4.6,
      quality: 4.9,
      timing: 4.5
    },
    trend: 'improving',
    rank: 15,
    totalUsers: 1247,
    badges: ['Verified Trader', 'Top Performer', 'Quick Responder']
  };

  const reputationHistory: ReputationHistory[] = [
    {
      id: '1',
      date: '2025-01-19',
      type: 'trade_completed',
      description: 'Successfully completed 100 MWh solar energy trade',
      impact: +0.2,
      category: 'reliability'
    },
    {
      id: '2',
      date: '2025-01-18',
      type: 'review_received',
      description: 'Received 5-star review for quality and communication',
      impact: +0.3,
      category: 'quality'
    },
    {
      id: '3',
      date: '2025-01-15',
      type: 'milestone_achieved',
      description: 'Achieved 100 successful trades milestone',
      impact: +0.5,
      category: 'reliability'
    }
  ];

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.reputationScore - a.reputationScore;
        case 'trades':
          return b.totalTrades - a.totalTrades;
        case 'success_rate':
          return b.successRate - a.successRate;
        case 'recent':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        default:
          return b.reputationScore - a.reputationScore;
      }
    });

    return sorted;
  }, [users, searchQuery, sortBy]);

  const getReputationColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 4.0) return 'text-blue-600';
    if (score >= 3.5) return 'text-yellow-600';
    if (score >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getReputationBadge = (score: number) => {
    if (score >= 4.5) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 4.0) return { text: 'Very Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 3.5) return { text: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 3.0) return { text: 'Fair', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Poor', color: 'bg-red-100 text-red-800' };
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderCurrentUserProfile = () => {
    if (!currentUser) return null;

    const badge = getReputationBadge(currentUser.reputationScore);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentUser.name}</h2>
              <p className="text-gray-600">{currentUser.location}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                  {badge.text}
                </span>
                <span className="text-sm text-gray-500">
                  Rank #{reputationMetrics.rank} of {reputationMetrics.totalUsers}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getReputationColor(currentUser.reputationScore)}`}>
              {currentUser.reputationScore.toFixed(1)}
            </div>
            {renderStars(currentUser.reputationScore, 'lg')}
            <div className="flex items-center gap-1 mt-1 text-sm">
              {reputationMetrics.trend === 'improving' && <TrendingUp className="w-4 h-4 text-green-600" />}
              {reputationMetrics.trend === 'declining' && <TrendingDown className="w-4 h-4 text-red-600" />}
              <span className="text-gray-500">
                {reputationMetrics.trend === 'improving' ? 'Improving' :
                 reputationMetrics.trend === 'declining' ? 'Declining' : 'Stable'}
              </span>
            </div>
          </div>
        </div>

        {/* Category Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(reputationMetrics.categoryScores).map(([category, score]) => (
            <div key={category} className="text-center">
              <div className="text-sm text-gray-500 capitalize mb-1">{category}</div>
              <div className={`text-lg font-semibold ${getReputationColor(score)}`}>
                {score.toFixed(1)}
              </div>
              {renderStars(score, 'sm')}
            </div>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-1">
              <Users className="w-4 h-4" />
              Total Trades
            </div>
            <div className="text-lg font-semibold">{currentUser.totalTrades}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-1">
              <Target className="w-4 h-4" />
              Success Rate
            </div>
            <div className="text-lg font-semibold">{currentUser.successRate.toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-1">
              <Shield className="w-4 h-4" />
              Verification
            </div>
            <div className="text-lg font-semibold capitalize">{currentUser.verificationStatus}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-1">
              <Award className="w-4 h-4" />
              Badges
            </div>
            <div className="text-lg font-semibold">{reputationMetrics.badges.length}</div>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {reputationMetrics.badges.map((badge, index) => (
              <span
                key={index}
                className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-full text-sm font-medium"
              >
                <Award className="w-3 h-3" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderReputationHistory = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reputation History</h3>
      <div className="space-y-3">
        {reputationHistory.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                item.impact > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.date).toLocaleDateString()} • {item.category}
                </p>
              </div>
            </div>
            <div className={`text-sm font-medium ${
              item.impact > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {item.impact > 0 ? '+' : ''}{item.impact.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderUserList = () => (
    <div className="space-y-4">
      {filteredAndSortedUsers.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setSelectedUser(user)}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(user.reputationScore, 'sm')}
                    <span className={`text-sm font-medium ${getReputationColor(user.reputationScore)}`}>
                      {user.reputationScore.toFixed(1)}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      getReputationBadge(user.reputationScore).color
                    }`}>
                      {getReputationBadge(user.reputationScore).text}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {user.totalTrades} trades
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {user.successRate.toFixed(1)}% success
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderUserDetails = () => {
    if (!selectedUser) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {selectedUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
              <p className="text-gray-600">{selectedUser.location}</p>
              <div className="flex items-center gap-2 mt-1">
                {renderStars(selectedUser.reputationScore, 'md')}
                <span className={`text-lg font-semibold ${getReputationColor(selectedUser.reputationScore)}`}>
                  {selectedUser.reputationScore.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedUser(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Total Trades</div>
            <div className="text-lg font-semibold">{selectedUser.totalTrades}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Success Rate</div>
            <div className="text-lg font-semibold">{selectedUser.successRate.toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Verification</div>
            <div className="text-lg font-semibold capitalize">{selectedUser.verificationStatus}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Member Since</div>
            <div className="text-lg font-semibold">
              {new Date(selectedUser.joinedAt).getFullYear()}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Trading Preferences</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500">Preferred Energy Types</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedUser.preferences.preferredEnergyTypes.map((type, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Max Distance</div>
              <div className="text-sm font-medium">{selectedUser.preferences.maxDistance} km</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Auto Accept Threshold</div>
              <div className="text-sm font-medium">{(selectedUser.preferences.autoAcceptThreshold * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current User Profile */}
      {renderCurrentUserProfile()}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search traders by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="score">Sort by Score</option>
              <option value="trades">Sort by Trades</option>
              <option value="success_rate">Sort by Success Rate</option>
              <option value="recent">Sort by Recent Activity</option>
            </select>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showDetails 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                All Traders ({filteredAndSortedUsers.length})
              </h3>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {renderUserList()}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {selectedUser && renderUserDetails()}
          {showDetails && renderReputationHistory()}
        </div>
      </div>
    </div>
  );
};

export default ReputationSystem;
