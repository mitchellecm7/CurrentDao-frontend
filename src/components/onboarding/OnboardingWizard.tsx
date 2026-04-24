'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  PlayCircle, 
  Target, 
  Trophy, 
  Settings, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle,
  Clock,
  Star,
  Users,
  TrendingUp,
  Shield,
  Sparkles
} from 'lucide-react';
import { useOnboarding } from '../../hooks/useOnboarding';
import { UserGoals, InteractiveTutorial } from '../../types/onboarding';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  autoStart?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
}

interface GoalSelectionProps {
  onGoalsSelected: (goals: UserGoals) => void;
  onClose: () => void;
}

interface TutorialSelectionProps {
  tutorials: InteractiveTutorial[];
  onStartTutorial: (tutorialId: string) => void;
  onClose: () => void;
}

const GoalSelection: React.FC<GoalSelectionProps> = ({ onGoalsSelected, onClose }) => {
  const [selectedGoal, setSelectedGoal] = useState<UserGoals['primaryGoal'] | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<UserGoals['experienceLevel']>('beginner');
  const [timeCommitment, setTimeCommitment] = useState<UserGoals['timeCommitment']>('thorough');
  const [interests, setInterests] = useState<string[]>([]);

  const primaryGoals = [
    { 
      id: 'trader' as const, 
      title: 'Energy Trader', 
      description: 'Buy and sell energy tokens for profit',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    { 
      id: 'producer' as const, 
      title: 'Energy Producer', 
      description: 'Sell your renewable energy production',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    { 
      id: 'consumer' as const, 
      title: 'Energy Consumer', 
      description: 'Buy clean energy for your needs',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    { 
      id: 'explorer' as const, 
      title: 'Platform Explorer', 
      description: 'Learn about decentralized energy',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'bg-orange-500'
    }
  ];

  const experienceOptions = [
    { id: 'beginner' as const, title: 'Beginner', description: 'New to energy trading' },
    { id: 'intermediate' as const, title: 'Intermediate', description: 'Some trading experience' },
    { id: 'advanced' as const, title: 'Advanced', description: 'Experienced trader' }
  ];

  const timeOptions = [
    { id: 'quick' as const, title: 'Quick Start', description: '5-10 minutes overview' },
    { id: 'thorough' as const, title: 'Comprehensive', description: '15-20 minutes detailed' },
    { id: 'comprehensive' as const, title: 'Deep Dive', description: '30+ minutes complete guide' }
  ];

  const interestOptions = [
    'Trading strategies', 'Market analysis', 'Portfolio management', 
    'Renewable energy', 'Blockchain technology', 'DAO governance'
  ];

  const handleSubmit = () => {
    if (selectedGoal) {
      onGoalsSelected({
        primaryGoal: selectedGoal,
        experienceLevel,
        timeCommitment,
        interests
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to CurrentDao</h2>
            <p className="text-gray-600">Let's personalize your experience</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Primary Goal Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's your primary goal?</h3>
          <div className="grid grid-cols-2 gap-4">
            {primaryGoals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedGoal === goal.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`${goal.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3`}>
                  {goal.icon}
                </div>
                <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Level</h3>
          <div className="space-y-3">
            {experienceOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setExperienceLevel(option.id)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  experienceLevel === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900">{option.title}</h4>
                <p className="text-sm text-gray-600">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Time Commitment */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How much time do you have?</h3>
          <div className="grid grid-cols-3 gap-3">
            {timeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setTimeCommitment(option.id)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  timeCommitment === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900 text-sm">{option.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Interests (Optional)</h3>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                onClick={() => {
                  setInterests(prev => 
                    prev.includes(interest) 
                      ? prev.filter(i => i !== interest)
                      : [...prev, interest]
                  );
                }}
                className={`px-4 py-2 rounded-full border-2 transition-all ${
                  interests.includes(interest)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedGoal}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const TutorialSelection: React.FC<TutorialSelectionProps> = ({ 
  tutorials, 
  onStartTutorial, 
  onClose 
}) => {
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'getting-started': return <PlayCircle className="w-5 h-5" />;
      case 'trading': return <TrendingUp className="w-5 h-5" />;
      case 'wallet': return <Shield className="w-5 h-5" />;
      case 'advanced': return <Target className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Tutorial</h2>
            <p className="text-gray-600">Select a tutorial that matches your goals</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="grid gap-6">
          {tutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedTutorial === tutorial.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTutorial(tutorial.id)}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                  {getCategoryIcon(tutorial.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{tutorial.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tutorial.difficulty)}`}>
                      {tutorial.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{tutorial.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {tutorial.estimatedTime} min
                    </div>
                    {tutorial.interactive && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Interactive
                      </div>
                    )}
                    {tutorial.handsOn && (
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Hands-on
                      </div>
                    )}
                  </div>

                  {tutorial.outcomes.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">You'll learn:</h4>
                      <div className="flex flex-wrap gap-2">
                        {tutorial.outcomes.map((outcome, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                          >
                            {outcome}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Skip for Now
          </button>
          <button
            onClick={() => selectedTutorial && onStartTutorial(selectedTutorial)}
            disabled={!selectedTutorial}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Start Tutorial
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  autoStart = false,
  showProgress = true,
  allowSkip = true
}) => {
  const {
    isTutorialActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    completedSteps,
    isDismissed,
    isLastStep,
    isFirstStep,
    userGoals,
    userProfile,
    achievements,
    progress,
    personalizedTutorials,
    setUserGoals,
    startPersonalizedTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    getCompletionPercentage,
    checkAndUnlockAchievements
  } = useOnboarding();

  const [currentView, setCurrentView] = useState<'goals' | 'tutorials' | 'tutorial'>('goals');
  const [showAchievement, setShowAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);

  useEffect(() => {
    if (isOpen && !userGoals) {
      setCurrentView('goals');
    } else if (isOpen && userGoals && !isTutorialActive) {
      setCurrentView('tutorials');
    } else if (isTutorialActive) {
      setCurrentView('tutorial');
    }
  }, [isOpen, userGoals, isTutorialActive]);

  useEffect(() => {
    if (autoStart && isOpen && !userGoals) {
      setCurrentView('goals');
    }
  }, [autoStart, isOpen, userGoals]);

  const handleGoalsSelected = (goals: UserGoals) => {
    setUserGoals(goals);
    setCurrentView('tutorials');
  };

  const handleStartTutorial = (tutorialId: string) => {
    startPersonalizedTutorial(tutorialId);
  };

  const handleClose = () => {
    if (allowSkip) {
      onClose();
    }
  };

  const getStepIcon = (stepId: string) => {
    const icons: Record<string, React.ReactNode> = {
      welcome: <Sparkles className="w-6 h-6 text-emerald-500" />,
      goals: <Target className="w-6 h-6 text-blue-500" />,
      dashboard: <TrendingUp className="w-6 h-6 text-amber-500" />,
      trading: <Zap className="w-6 h-6 text-yellow-500" />,
      wallet: <Shield className="w-6 h-6 text-purple-500" />,
      'first-trade': <Trophy className="w-6 h-6 text-orange-500" />,
    };
    return icons[stepId] || <Sparkles className="w-6 h-6" />;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {currentView === 'goals' && (
        <GoalSelection
          key="goals"
          onGoalsSelected={handleGoalsSelected}
          onClose={handleClose}
        />
      )}
      
      {currentView === 'tutorials' && (
        <TutorialSelection
          key="tutorials"
          tutorials={personalizedTutorials}
          onStartTutorial={handleStartTutorial}
          onClose={handleClose}
        />
      )}

      {currentView === 'tutorial' && currentStep && (
        <motion.div
          key="tutorial"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
          >
            {/* Progress Bar */}
            {showProgress && (
              <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full rounded-t-2xl overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                />
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  {getStepIcon(currentStep.id)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{currentStep.title}</h3>
                  {showProgress && (
                    <p className="text-sm text-gray-500">
                      Step {currentStepIndex + 1} of {totalSteps} ({Math.round(getCompletionPercentage())}%)
                    </p>
                  )}
                </div>
              </div>
              {allowSkip && (
                <button
                  onClick={skipTutorial}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>

            {/* Step Content */}
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">{currentStep.content}</p>
              
              {currentStep.media && (
                <div className="mt-4">
                  {currentStep.media.type === 'image' && (
                    <img
                      src={currentStep.media.url}
                      alt={currentStep.media.alt}
                      className="w-full rounded-lg"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div>
                {!isFirstStep && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
              </div>

              <button
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {isLastStep ? 'Complete' : 'Next'}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Skip Option */}
            {allowSkip && !currentStep.required && (
              <button
                onClick={skipTutorial}
                className="w-full mt-4 text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip this step
              </button>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Achievement Notification */}
      <AnimatePresence>
        {showAchievement && newAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-white rounded-xl shadow-2xl p-6 border-2 border-yellow-400 max-w-sm"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{newAchievement.icon}</div>
              <div>
                <h4 className="font-bold text-gray-900">Achievement Unlocked!</h4>
                <p className="text-gray-600">{newAchievement.title}</p>
                <p className="text-sm text-yellow-600 font-medium">+{newAchievement.points} points</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default OnboardingWizard;
