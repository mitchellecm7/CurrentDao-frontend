export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetId?: string; // HTML ID of the element to highlight
  action?: 'click' | 'input' | 'none';
  position?: 'top' | 'bottom' | 'left' | 'right';
  duration?: number; // Time to spend on this step (ms)
  required?: boolean; // Whether this step can be skipped
  category?: 'basics' | 'trading' | 'wallet' | 'advanced';
  media?: {
    type: 'image' | 'video' | 'gif';
    url: string;
    alt?: string;
  };
  interactions?: {
    highlight?: boolean;
    spotlight?: boolean;
    overlay?: boolean;
  };
}

export interface OnboardingState {
  isTutorialActive: boolean;
  currentStepIndex: number;
  completedSteps: string[];
  isDismissed: boolean;
  startTime?: Date;
  endTime?: Date;
  totalTimeSpent?: number;
  userGoals?: UserGoals;
  userProfile?: UserProfile;
}

export interface UserGoals {
  primaryGoal: 'trader' | 'producer' | 'consumer' | 'explorer';
  secondaryGoals?: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  timeCommitment: 'quick' | 'thorough' | 'comprehensive';
}

export interface UserProfile {
  userId: string;
  name?: string;
  email?: string;
  walletConnected?: boolean;
  previousExperience?: 'none' | 'some' | 'expert';
  preferences: {
    skipBasics: boolean;
    enableAnimations: boolean;
    showProgress: boolean;
    enableSounds: boolean;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'progress' | 'milestone' | 'skill' | 'social';
  points: number;
  unlockedAt?: Date;
  requirements: {
    steps: string[];
    timeLimit?: number; // ms
    accuracy?: number; // percentage
  };
  rewards?: {
    badge: string;
    title?: string;
    features: string[];
  };
}

export interface ProgressTracker {
  tutorialId: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  timeSpent: number;
  accuracy: number;
  skippedSteps: string[];
  lastActivity: Date;
  engagement: {
    clicks: number;
    hoverTime: number;
    scrollDepth: number;
  };
}

export interface InteractiveTutorial {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'trading' | 'wallet' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  steps: TutorialStep[];
  prerequisites?: string[];
  outcomes: string[];
  interactive: boolean;
  handsOn: boolean;
}

export interface TutorialEngine {
  tutorials: InteractiveTutorial[];
  currentTutorial: InteractiveTutorial | null;
  state: OnboardingState;
  progress: ProgressTracker;
  achievements: Achievement[];
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'trading' | 'account' | 'technical' | 'general';
  helpful: number;
  views: number;
  lastUpdated: Date;
}

export interface VideoTutorialData {
  id: string;
  title: string;
  url: string;
  duration: string;
  thumbnail: string;
  category: string;
  views: number;
  likes: number;
  transcript?: string;
}

export interface OnboardingAnalytics {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  tutorialId: string;
  stepsCompleted: number;
  totalSteps: number;
  timeSpent: number;
  dropoffPoints: number[];
  engagement: {
    clicks: number;
    hovers: number;
    scrolls: number;
    skips: number;
    helpRequests: number;
  };
  feedback?: {
    rating: number;
    comments: string;
    suggestions: string[];
  };
  deviceInfo: {
    userAgent: string;
    viewport: string;
    device: string;
  };
}

export interface HelpCenterResource {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  type: 'article' | 'video' | 'faq' | 'tutorial';
  relatedTutorials: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number; // minutes
}
