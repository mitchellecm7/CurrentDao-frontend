'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  TrendingUp, 
  Target, 
  Award,
  BarChart3,
  Users,
  Zap,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Timer,
  Activity,
  Eye,
  MousePointer
} from 'lucide-react';
import { ProgressTracker as IProgressTracker, Achievement } from '../../types/onboarding';

interface ProgressTrackerProps {
  progress: IProgressTracker;
  achievements: Achievement[];
  showDetailed?: boolean;
  showAnalytics?: boolean;
  compact?: boolean;
  className?: string;
}

interface StepProgressProps {
  stepId: string;
  isCompleted: boolean;
  isCurrent: boolean;
  title: string;
  timeSpent?: number;
  index: number;
  totalSteps: number;
}

interface EngagementMetricsProps {
  engagement: IProgressTracker['engagement'];
  timeSpent: number;
  accuracy: number;
}

interface MilestoneCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress?: number;
}

const StepProgress: React.FC<StepProgressProps> = ({
  stepId,
  isCompleted,
  isCurrent,
  title,
  timeSpent,
  index,
  totalSteps
}) => {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
        isCompleted 
          ? 'bg-green-50 border border-green-200' 
          : isCurrent 
          ? 'bg-blue-50 border border-blue-200' 
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="relative">
        {isCompleted ? (
          <CheckCircle className="w-6 h-6 text-green-600" />
        ) : isCurrent ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Circle className="w-6 h-6 text-blue-600" />
          </motion.div>
        ) : (
          <Circle className="w-6 h-6 text-gray-400" />
        )}
        
        {/* Connection line */}
        {index < totalSteps - 1 && (
          <div
            className={`absolute top-6 left-6 w-8 h-0.5 ${
              isCompleted ? 'bg-green-400' : 'bg-gray-300'
            }`}
            style={{ transform: 'translateY(-50%)' }}
          />
        )}
      </div>

      <div className="flex-1">
        <h4 className={`font-medium ${
          isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-600'
        }`}>
          {title}
        </h4>
        {timeSpent && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Timer className="w-3 h-3" />
            {formatTime(timeSpent)}
          </div>
        )}
      </div>

      {isCurrent && (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 bg-blue-600 rounded-full"
        />
      )}
    </motion.div>
  );
};

const EngagementMetrics: React.FC<EngagementMetricsProps> = ({
  engagement,
  timeSpent,
  accuracy
}) => {
  const metrics = [
    {
      icon: <MousePointer className="w-4 h-4" />,
      label: 'Clicks',
      value: engagement.clicks,
      color: 'text-blue-600'
    },
    {
      icon: <Eye className="w-4 h-4" />,
      label: 'Hover Time',
      value: `${Math.round(engagement.hoverTime / 1000)}s`,
      color: 'text-purple-600'
    },
    {
      icon: <Activity className="w-4 h-4" />,
      label: 'Scroll Depth',
      value: `${engagement.scrollDepth}%`,
      color: 'text-green-600'
    },
    {
      icon: <Target className="w-4 h-4" />,
      label: 'Accuracy',
      value: `${Math.round(accuracy)}%`,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-50 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={metric.color}>{metric.icon}</div>
            <span className="text-xs text-gray-600">{metric.label}</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{metric.value}</div>
        </motion.div>
      ))}
    </div>
  );
};

const MilestoneCard: React.FC<MilestoneCardProps> = ({
  achievement,
  isUnlocked,
  progress = 0
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative rounded-xl border-2 p-4 transition-all ${
        isUnlocked 
          ? 'border-yellow-400 bg-yellow-50' 
          : 'border-gray-200 bg-white'
      }`}
    >
      {isUnlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold"
        >
          UNLOCKED
        </motion.div>
      )}

      <div className="flex items-start gap-3">
        <div className={`text-3xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${
            isUnlocked ? 'text-yellow-800' : 'text-gray-700'
          }`}>
            {achievement.title}
          </h3>
          <p className={`text-sm mt-1 ${
            isUnlocked ? 'text-yellow-700' : 'text-gray-600'
          }`}>
            {achievement.description}
          </p>
          
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-600">
                +{achievement.points} pts
              </span>
            </div>
            
            {achievement.unlockedAt && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {!isUnlocked && progress > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="bg-yellow-400 h-2 rounded-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  achievements,
  showDetailed = false,
  showAnalytics = false,
  compact = false,
  className = ''
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'steps' | 'achievements' | 'analytics'>('overview');
  const [isExpanded, setIsExpanded] = useState(!compact);
  
  const completionPercentage = useMemo(() => {
    return (progress.completedSteps.length / progress.totalSteps) * 100;
  }, [progress.completedSteps.length, progress.totalSteps]);

  const unlockedAchievements = useMemo(() => {
    return achievements.filter(a => a.unlockedAt);
  }, [achievements]);

  const totalPoints = useMemo(() => {
    return unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
  }, [unlockedAchievements]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const getStepTitle = (stepId: string) => {
    const titles: Record<string, string> = {
      'welcome': 'Welcome to CurrentDao',
      'goals': 'Set Your Goals',
      'dashboard': 'Explore Dashboard',
      'trading': 'Energy Trading',
      'wallet': 'Connect Wallet',
      'first-trade': 'First Trade'
    };
    return titles[stepId] || stepId;
  };

  if (compact && !isExpanded) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200">
                <div 
                  className="w-full h-full rounded-full bg-blue-500"
                  style={{ 
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + completionPercentage/2}% 0%, ${50 + completionPercentage/2}% 100%, 50% 100%)` 
                  }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700">
                  {Math.round(completionPercentage)}%
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Progress</h3>
              <p className="text-sm text-gray-600">
                {progress.completedSteps.length} of {progress.totalSteps} steps
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(true)}
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
            <h2 className="text-2xl font-bold text-gray-900">Onboarding Progress</h2>
            <p className="text-gray-600 mt-1">
              Track your journey through CurrentDao
            </p>
          </div>
          
          {compact && (
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(completionPercentage)}%
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {progress.completedSteps.length}/{progress.totalSteps}
            </div>
            <div className="text-sm text-gray-600">Steps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatTime(progress.timeSpent)}
            </div>
            <div className="text-sm text-gray-600">Time Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {totalPoints}
            </div>
            <div className="text-sm text-gray-600">Points</div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'steps', label: 'Steps', icon: <Target className="w-4 h-4" /> },
          { id: 'achievements', label: 'Achievements', icon: <Award className="w-4 h-4" /> },
          ...(showAnalytics ? [{ id: 'analytics', label: 'Analytics', icon: <Activity className="w-4 h-4" /> }] : [])
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              selectedView === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {selectedView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Progress Overview */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercentage}%` }}
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>Started</span>
                    <span>{Math.round(completionPercentage)}% Complete</span>
                    <span>Mastered</span>
                  </div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                <div className="grid gap-4">
                  {unlockedAchievements.slice(-3).map((achievement) => (
                    <MilestoneCard
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={true}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'steps' && (
            <motion.div
              key="steps"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tutorial Steps</h3>
              <div className="space-y-2">
                {progress.completedSteps.map((stepId, index) => (
                  <StepProgress
                    key={stepId}
                    stepId={stepId}
                    isCompleted={true}
                    isCurrent={false}
                    title={getStepTitle(stepId)}
                    index={index}
                    totalSteps={progress.totalSteps}
                  />
                ))}
                
                {/* Current step */}
                {progress.currentStep < progress.totalSteps && (
                  <StepProgress
                    stepId={`step-${progress.currentStep}`}
                    isCompleted={false}
                    isCurrent={true}
                    title={`Step ${progress.currentStep + 1}`}
                    index={progress.completedSteps.length}
                    totalSteps={progress.totalSteps}
                  />
                )}
                
                {/* Remaining steps */}
                {Array.from({ length: progress.totalSteps - progress.completedSteps.length - (progress.currentStep < progress.totalSteps ? 1 : 0) }).map((_, index) => (
                  <StepProgress
                    key={`remaining-${index}`}
                    stepId={`remaining-${index}`}
                    isCompleted={false}
                    isCurrent={false}
                    title={`Step ${progress.completedSteps.length + index + 2}`}
                    index={progress.completedSteps.length + index + 1}
                    totalSteps={progress.totalSteps}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {selectedView === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="grid gap-4">
                {achievements.map((achievement) => {
                  const progress = achievement.requirements.steps.length > 0 
                    ? (progress.completedSteps.filter(step => 
                        achievement.requirements.steps.includes(step)
                      ).length / achievement.requirements.steps.length) * 100
                    : 0;
                  
                  return (
                    <MilestoneCard
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={!!achievement.unlockedAt}
                      progress={progress}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {selectedView === 'analytics' && showAnalytics && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Analytics</h3>
              <EngagementMetrics
                engagement={progress.engagement}
                timeSpent={progress.timeSpent}
                accuracy={progress.accuracy}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProgressTracker;
