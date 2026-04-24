'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useTutorialProgress } from './useTutorialProgress';
import { 
  TutorialStep, 
  InteractiveTutorial, 
  UserGoals, 
  UserProfile, 
  Achievement, 
  ProgressTracker,
  OnboardingState 
} from '../types/onboarding';

const COMPREHENSIVE_TUTORIALS: InteractiveTutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with CurrentDao',
    description: 'Complete beginner\'s guide to the decentralized energy marketplace',
    category: 'getting-started',
    difficulty: 'beginner',
    estimatedTime: 10,
    interactive: true,
    handsOn: true,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to CurrentDao',
        content: 'Let\'s get you started with a comprehensive tour of our decentralized energy marketplace. You\'ll learn how to trade energy, manage your portfolio, and participate in governance.',
        position: 'top',
        duration: 5000,
        required: true,
        category: 'basics',
        interactions: { highlight: true, spotlight: true }
      },
      {
        id: 'goals',
        title: 'What\'s Your Goal?',
        content: 'Tell us about your goals so we can personalize your experience. Are you here to trade energy, produce clean energy, or explore the platform?',
        position: 'bottom',
        duration: 8000,
        required: true,
        category: 'basics',
        interactions: { overlay: true }
      },
      {
        id: 'dashboard',
        title: 'Your Dashboard',
        content: 'This is your command center. Track energy production, consumption, portfolio performance, and market trends all in one place.',
        targetId: 'dashboard-overview',
        position: 'bottom',
        duration: 6000,
        required: true,
        category: 'basics',
        interactions: { highlight: true }
      },
      {
        id: 'trading',
        title: 'Energy Trading',
        content: 'Browse active orders and execute trades instantly on the blockchain. Buy and sell clean energy kWh with transparent pricing.',
        targetId: 'trading-activity',
        position: 'left',
        duration: 7000,
        required: true,
        category: 'trading',
        interactions: { highlight: true, spotlight: true }
      },
      {
        id: 'wallet',
        title: 'Connect Your Wallet',
        content: 'Securely connect your Stellar or Ethereum wallet to sign transactions and manage your digital energy assets.',
        targetId: 'wallet-connector',
        position: 'right',
        duration: 5000,
        required: true,
        category: 'wallet',
        interactions: { highlight: true }
      },
      {
        id: 'first-trade',
        title: 'Your First Trade',
        content: 'Let\'s make your first energy trade! Choose whether to buy or sell energy, set your amount and price, and execute your first blockchain transaction.',
        targetId: 'trading-form',
        position: 'top',
        duration: 10000,
        required: true,
        category: 'trading',
        interactions: { highlight: true, spotlight: true }
      }
    ],
    outcomes: ['Understand platform basics', 'Complete first trade', 'Connect wallet'],
    prerequisites: []
  },
  {
    id: 'advanced-trading',
    title: 'Advanced Energy Trading',
    description: 'Master advanced trading strategies and market analysis',
    category: 'trading',
    difficulty: 'advanced',
    estimatedTime: 15,
    interactive: true,
    handsOn: true,
    steps: [
      {
        id: 'market-analysis',
        title: 'Market Analysis',
        content: 'Learn to read market trends, analyze price patterns, and make informed trading decisions.',
        position: 'top',
        duration: 8000,
        required: true,
        category: 'advanced',
        interactions: { highlight: true }
      },
      {
        id: 'advanced-orders',
        title: 'Advanced Order Types',
        content: 'Master limit orders, stop-loss, and advanced trading strategies for maximum efficiency.',
        position: 'bottom',
        duration: 10000,
        required: true,
        category: 'advanced',
        interactions: { highlight: true }
      }
    ],
    outcomes: ['Advanced trading knowledge', 'Market analysis skills'],
    prerequisites: ['getting-started']
  }
];

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete the getting started tutorial',
    icon: '🎯',
    category: 'progress',
    points: 100,
    requirements: { steps: ['getting-started'], timeLimit: 1800000 },
    rewards: { badge: 'beginner', features: ['advanced-analytics'] }
  },
  {
    id: 'energy-trader',
    title: 'Energy Trader',
    description: 'Complete your first energy trade',
    icon: '⚡',
    category: 'milestone',
    points: 250,
    requirements: { steps: ['first-trade'] },
    rewards: { badge: 'trader', title: 'Energy Trader' }
  },
  {
    id: 'quick-learner',
    title: 'Quick Learner',
    description: 'Complete tutorial in under 10 minutes',
    icon: '⚡',
    category: 'skill',
    points: 150,
    requirements: { steps: ['getting-started'], timeLimit: 600000 },
    rewards: { badge: 'fast-learner' }
  },
  {
    id: 'explorer',
    title: 'Platform Explorer',
    description: 'Complete all available tutorials',
    icon: '🗺️',
    category: 'milestone',
    points: 500,
    requirements: { steps: ['getting-started', 'advanced-trading'] },
    rewards: { badge: 'expert', title: 'Platform Expert' }
  }
];

export function useOnboarding() {
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentTutorial, setCurrentTutorial] = useState<InteractiveTutorial | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<ProgressTracker | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  const {
    isTutorialActive,
    currentStepIndex,
    completedSteps,
    isDismissed,
    startTutorial,
    nextStep: advance,
    prevStep,
    skipTutorial,
    resetTutorial,
  } = useTutorialProgress();

  const currentStep = useMemo(() => {
    if (!currentTutorial) return null;
    return currentTutorial.steps[currentStepIndex] || null;
  }, [currentTutorial, currentStepIndex]);

  const personalizedTutorials = useMemo(() => {
    if (!userGoals) return COMPREHENSIVE_TUTORIALS;
    
    return COMPREHENSIVE_TUTORIALS.filter(tutorial => {
      if (userGoals.experienceLevel === 'expert' && tutorial.difficulty === 'beginner') {
        return false;
      }
      if (userGoals.timeCommitment === 'quick' && tutorial.estimatedTime > 10) {
        return false;
      }
      return true;
    });
  }, [userGoals]);

  const setUserGoals = useCallback((goals: UserGoals) => {
    setUserGoals(goals);
    // Store in localStorage for persistence
    localStorage.setItem('onboarding-goals', JSON.stringify(goals));
  }, []);

  const setUserProfile = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('onboarding-profile', JSON.stringify(profile));
  }, []);

  const startPersonalizedTutorial = useCallback((tutorialId: string) => {
    const tutorial = personalizedTutorials.find(t => t.id === tutorialId);
    if (tutorial) {
      setCurrentTutorial(tutorial);
      startTutorial();
      // Initialize progress tracking
      setProgress({
        tutorialId,
        currentStep: 0,
        totalSteps: tutorial.steps.length,
        completedSteps: [],
        timeSpent: 0,
        accuracy: 0,
        skippedSteps: [],
        lastActivity: new Date(),
        engagement: { clicks: 0, hoverTime: 0, scrollDepth: 0 }
      });
    }
  }, [personalizedTutorials, startTutorial]);

  const nextStep = useCallback(() => {
    if (!currentTutorial || !progress) return;
    
    const newProgress = { ...progress };
    newProgress.currentStep = currentStepIndex + 1;
    newProgress.lastActivity = new Date();
    
    if (currentStepIndex < currentTutorial.steps.length - 1) {
      advance(currentStep?.id || '');
    } else {
      // Tutorial completed
      skipTutorial();
      checkAndUnlockAchievements();
    }
    
    setProgress(newProgress);
  }, [currentTutorial, currentStepIndex, currentStep, progress, advance, skipTutorial]);

  const checkAndUnlockAchievements = useCallback(() => {
    if (!progress || !userProfile) return;
    
    const unlockedAchievements: Achievement[] = [];
    
    ACHIEVEMENTS.forEach(achievement => {
      const isUnlocked = achievements.some(a => a.id === achievement.id);
      if (isUnlocked) return;
      
      const meetsRequirements = achievement.requirements.steps.every(stepId => 
        progress.completedSteps.includes(stepId)
      );
      
      if (meetsRequirements) {
        const unlockedAchievement = { ...achievement, unlockedAt: new Date() };
        unlockedAchievements.push(unlockedAchievement);
      }
    });
    
    if (unlockedAchievements.length > 0) {
      setAchievements(prev => [...prev, ...unlockedAchievements]);
      // Show achievement notifications
      unlockedAchievements.forEach(achievement => {
        // Trigger achievement notification
        console.log(`Achievement Unlocked: ${achievement.title}`);
      });
    }
  }, [progress, userProfile, achievements]);

  const getCompletionPercentage = useCallback(() => {
    if (!progress) return 0;
    return (progress.completedSteps.length / progress.totalSteps) * 100;
  }, [progress]);

  const getTimeSpent = useCallback(() => {
    if (!progress) return 0;
    return progress.timeSpent;
  }, [progress]);

  const skipTutorial = useCallback(() => {
    if (currentStep && !currentStep.required) {
      advance(currentStep.id);
      if (progress) {
        setProgress({
          ...progress,
          skippedSteps: [...progress.skippedSteps, currentStep.id]
        });
      }
    } else {
      // Can't skip required step
      console.warn('Cannot skip required tutorial step');
    }
  }, [currentStep, advance, progress]);

  // Load saved data on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('onboarding-goals');
    const savedProfile = localStorage.getItem('onboarding-profile');
    
    if (savedGoals) {
      setUserGoals(JSON.parse(savedGoals));
    }
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  return {
    // Basic tutorial state
    isTutorialActive,
    currentStep,
    currentStepIndex,
    totalSteps: currentTutorial?.steps.length || 0,
    completedSteps,
    isDismissed,
    isLastStep: currentStepIndex === (currentTutorial?.steps.length || 1) - 1,
    isFirstStep: currentStepIndex === 0,
    
    // Enhanced features
    currentTutorial,
    userGoals,
    userProfile,
    achievements,
    progress,
    analytics,
    
    // Personalized tutorials
    personalizedTutorials,
    
    // Actions
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    resetTutorial,
    setUserGoals,
    setUserProfile,
    startPersonalizedTutorial,
    
    // Analytics
    getCompletionPercentage,
    getTimeSpent,
    
    // Achievement system
    checkAndUnlockAchievements,
  };
}
