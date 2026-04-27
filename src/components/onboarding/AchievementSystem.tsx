'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Zap, 
  Crown, 
  Medal,
  Gem,
  Fire,
  Rocket,
  Shield,
  Heart,
  Sparkles,
  ChevronRight,
  X,
  Share2,
  Download,
  Calendar,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Achievement } from '../../types/onboarding';

interface AchievementSystemProps {
  achievements: Achievement[];
  userPoints: number;
  onAchievementUnlock?: (achievement: Achievement) => void;
  showNotifications?: boolean;
  compact?: boolean;
  className?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress?: number;
  onClick?: () => void;
  showProgress?: boolean;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  onShare?: () => void;
}

interface AchievementStatsProps {
  achievements: Achievement[];
  userPoints: number;
}

interface AchievementCategoryProps {
  category: Achievement['category'];
  achievements: Achievement[];
  onAchievementClick?: (achievement: Achievement) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked,
  progress = 0,
  onClick,
  showProgress = true
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'progress': return 'from-blue-500 to-cyan-500';
      case 'milestone': return 'from-purple-500 to-pink-500';
      case 'skill': return 'from-green-500 to-emerald-500';
      case 'social': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'progress': return <TrendingUp className="w-5 h-5" />;
      case 'milestone': return <Trophy className="w-5 h-5" />;
      case 'skill': return <Target className="w-5 h-5" />;
      case 'social': return <Heart className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
        isUnlocked 
          ? 'border-transparent bg-gradient-to-br ' + getCategoryColor(achievement.category) + ' text-white shadow-lg'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {/* Unlock Animation */}
      <AnimatePresence>
        {isUnlocked && isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 rounded-xl bg-white/20 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Achievement Icon */}
      <div className="flex items-start gap-3">
        <div className={`text-3xl ${!isUnlocked && 'grayscale opacity-50'}`}>
          {achievement.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Title and Category */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold truncate ${
              isUnlocked ? 'text-white' : 'text-gray-900'
            }`}>
              {achievement.title}
            </h3>
            <div className={`p-1 rounded-full ${
              isUnlocked ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {getCategoryIcon(achievement.category)}
            </div>
          </div>

          {/* Description */}
          <p className={`text-sm mb-3 line-clamp-2 ${
            isUnlocked ? 'text-white/90' : 'text-gray-600'
          }`}>
            {achievement.description}
          </p>

          {/* Points and Rewards */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${
                isUnlocked ? 'text-white' : 'text-yellow-600'
              }`}>
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{achievement.points}</span>
              </div>
              
              {achievement.rewards?.badge && (
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isUnlocked ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {achievement.rewards.badge}
                </div>
              )}
            </div>

            {/* Unlock Date */}
            {isUnlocked && achievement.unlockedAt && (
              <div className={`flex items-center gap-1 text-xs ${
                isUnlocked ? 'text-white/70' : 'text-gray-500'
              }`}>
                <Calendar className="w-3 h-3" />
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {!isUnlocked && showProgress && progress > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={isUnlocked ? 'text-white/70' : 'text-gray-600'}>
                  Progress
                </span>
                <span className={isUnlocked ? 'text-white/70' : 'text-gray-600'}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-2 rounded-full ${
                    isUnlocked ? 'bg-white' : 'bg-gradient-to-r ' + getCategoryColor(achievement.category)
                  }`}
                />
              </div>
            </div>
          )}

          {/* Requirements */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs"
            >
              <div className={`font-medium mb-1 ${
                isUnlocked ? 'text-white/90' : 'text-gray-700'
              }`}>
                Requirements:
              </div>
              <ul className={`space-y-1 ${
                isUnlocked ? 'text-white/70' : 'text-gray-600'
              }`}>
                {achievement.requirements.steps.map((step, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <div className={`w-1 h-1 rounded-full ${
                      isUnlocked ? 'bg-white' : 'bg-gray-400'
                    }`} />
                    {step}
                  </li>
                ))}
                {achievement.requirements.timeLimit && (
                  <li className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Complete within {Math.round(achievement.requirements.timeLimit / 60000)} minutes
                  </li>
                )}
                {achievement.requirements.accuracy && (
                  <li className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {achievement.requirements.accuracy}% accuracy required
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </div>
      </div>

      {/* Unlock Effect */}
      <AnimatePresence>
        {isUnlocked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2"
          >
            <div className="relative">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <Star className="w-6 h-6 text-yellow-400" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
  onShare
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          className="fixed bottom-8 right-8 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-2xl p-4 text-white">
            <div className="flex items-start gap-3">
              <div className="text-4xl animate-bounce">
                {achievement.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                
                <p className="text-white/90 font-medium mb-2">
                  {achievement.title}
                </p>
                
                <p className="text-white/80 text-sm mb-3">
                  {achievement.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold">+{achievement.points} points</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onShare && (
                      <button
                        onClick={onShare}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        title="Share achievement"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={handleClose}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AchievementStats: React.FC<AchievementStatsProps> = ({
  achievements,
  userPoints
}) => {
  const stats = useMemo(() => {
    const unlocked = achievements.filter(a => a.unlockedAt);
    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    const earnedPoints = unlocked.reduce((sum, a) => sum + a.points, 0);
    
    const byCategory = achievements.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = { total: 0, unlocked: 0 };
      }
      acc[achievement.category].total++;
      if (achievement.unlockedAt) {
        acc[achievement.category].unlocked++;
      }
      return acc;
    }, {} as Record<Achievement['category'], { total: number; unlocked: number }>);

    return {
      total: achievements.length,
      unlocked: unlocked.length,
      completionRate: (unlocked.length / achievements.length) * 100,
      totalPoints,
      earnedPoints,
      pointsProgress: (earnedPoints / totalPoints) * 100,
      byCategory
    };
  }, [achievements]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5" />
          <span className="text-sm font-medium">Achievements</span>
        </div>
        <div className="text-2xl font-bold">{stats.unlocked}/{stats.total}</div>
        <div className="text-xs opacity-80">{Math.round(stats.completionRate)}% complete</div>
      </div>

      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-5 h-5" />
          <span className="text-sm font-medium">Points</span>
        </div>
        <div className="text-2xl font-bold">{stats.earnedPoints}</div>
        <div className="text-xs opacity-80">of {stats.totalPoints} total</div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5" />
          <span className="text-sm font-medium">Progress</span>
        </div>
        <div className="text-2xl font-bold">{Math.round(stats.completionRate)}%</div>
        <div className="text-xs opacity-80">completion rate</div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5" />
          <span className="text-sm font-medium">Rank</span>
        </div>
        <div className="text-2xl font-bold">Gold</div>
        <div className="text-xs opacity-80">Top 10% performer</div>
      </div>
    </div>
  );
};

const AchievementCategory: React.FC<AchievementCategoryProps> = ({
  category,
  achievements,
  onAchievementClick
}) => {
  const getCategoryInfo = (cat: Achievement['category']) => {
    switch (cat) {
      case 'progress':
        return {
          title: 'Progress Achievements',
          description: 'Milestones for completing tutorials and learning',
          icon: <TrendingUp className="w-6 h-6" />,
          color: 'from-blue-500 to-cyan-500'
        };
      case 'milestone':
        return {
          title: 'Milestone Achievements',
          description: 'Major accomplishments and special moments',
          icon: <Trophy className="w-6 h-6" />,
          color: 'from-purple-500 to-pink-500'
        };
      case 'skill':
        return {
          title: 'Skill Achievements',
          description: 'Demonstrate mastery of platform features',
          icon: <Target className="w-6 h-6" />,
          color: 'from-green-500 to-emerald-500'
        };
      case 'social':
        return {
          title: 'Social Achievements',
          description: 'Community engagement and collaboration',
          icon: <Heart className="w-6 h-6" />,
          color: 'from-orange-500 to-red-500'
        };
      default:
        return {
          title: 'Other Achievements',
          description: 'Various accomplishments',
          icon: <Star className="w-6 h-6" />,
          color: 'from-gray-500 to-gray-600'
        };
    }
  };

  const categoryInfo = getCategoryInfo(category);
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className={`bg-gradient-to-r ${categoryInfo.color} p-4 text-white`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            {categoryInfo.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg">{categoryInfo.title}</h3>
            <p className="text-white/80 text-sm">{categoryInfo.description}</p>
          </div>
        </div>
        <div className="mt-3 text-sm">
          {unlockedCount} of {achievements.length} unlocked
        </div>
      </div>

      <div className="p-4 space-y-3">
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            isUnlocked={!!achievement.unlockedAt}
            onClick={() => onAchievementClick?.(achievement)}
            showProgress={true}
          />
        ))}
      </div>
    </div>
  );
};

export const AchievementSystem: React.FC<AchievementSystemProps> = ({
  achievements,
  userPoints,
  onAchievementUnlock,
  showNotifications = true,
  compact = false,
  className = ''
}) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'categories'>('grid');
  const [showNotification, setShowNotification] = useState(false);

  const achievementsByCategory = useMemo(() => {
    return achievements.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    }, {} as Record<Achievement['category'], Achievement[]>);
  }, [achievements]);

  const unlockedAchievements = useMemo(() => {
    return achievements.filter(a => a.unlockedAt);
  }, [achievements]);

  const lockedAchievements = useMemo(() => {
    return achievements.filter(a => !a.unlockedAt);
  }, [achievements]);

  const handleAchievementUnlock = (achievement: Achievement) => {
    setNewAchievement(achievement);
    setShowNotification(true);
    onAchievementUnlock?.(achievement);
  };

  const handleShareAchievement = () => {
    if (newAchievement) {
      // Implement share functionality
      console.log('Sharing achievement:', newAchievement.title);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    setNewAchievement(null);
  };

  if (compact) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              {unlockedAchievements.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unlockedAchievements.length}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Achievements</h3>
              <p className="text-sm text-gray-600">
                {unlockedAchievements.length} unlocked • {userPoints} points
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setSelectedAchievement(unlockedAchievements[0] || null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Achievement System</h2>
            <p className="text-gray-600 mt-1">
              Track your progress and earn rewards
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('categories')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'categories'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Categories
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <AchievementStats achievements={achievements} userPoints={userPoints} />
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'grid' ? (
          <div className="grid gap-4">
            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Unlocked ({unlockedAchievements.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unlockedAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={true}
                      onClick={() => setSelectedAchievement(achievement)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Locked ({lockedAchievements.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lockedAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={false}
                      onClick={() => setSelectedAchievement(achievement)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
              <AchievementCategory
                key={category}
                category={category as Achievement['category']}
                achievements={categoryAchievements}
                onAchievementClick={setSelectedAchievement}
              />
            ))}
          </div>
        )}
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedAchievement.title}
                </h3>
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{selectedAchievement.icon}</div>
                <p className="text-gray-600">{selectedAchievement.description}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Points</span>
                  <span className="font-bold text-yellow-600">{selectedAchievement.points}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium capitalize">{selectedAchievement.category}</span>
                </div>

                {selectedAchievement.unlockedAt && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Unlocked</span>
                    <span className="font-medium">
                      {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {selectedAchievement.rewards && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Rewards</h4>
                    {selectedAchievement.rewards.badge && (
                      <div className="text-yellow-700">{selectedAchievement.rewards.badge}</div>
                    )}
                    {selectedAchievement.rewards.title && (
                      <div className="text-yellow-700">{selectedAchievement.rewards.title}</div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Notification */}
      <AnimatePresence>
        {showNotifications && showNotification && newAchievement && (
          <AchievementNotification
            achievement={newAchievement}
            onClose={handleCloseNotification}
            onShare={handleShareAchievement}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementSystem;
