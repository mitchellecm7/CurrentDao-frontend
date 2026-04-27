import { 
  UserGoals, 
  UserProfile, 
  InteractiveTutorial, 
  Achievement, 
  ProgressTracker 
} from '../../types/onboarding';

export interface PersonalizationOptions {
  enableAdaptiveContent: boolean;
  enableRecommendations: boolean;
  enableDynamicDifficulty: boolean;
  maxRecommendations: number;
}

export interface PersonalizationResult {
  personalizedTutorials: InteractiveTutorial[];
  recommendedNextSteps: string[];
  adaptiveContent: Record<string, any>;
  difficultyAdjustment: 'easier' | 'same' | 'harder';
  estimatedCompletionTime: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  tutorials: string[];
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  outcomes: string[];
}

export interface UserPersona {
  type: 'trader' | 'producer' | 'consumer' | 'explorer';
  characteristics: string[];
  preferences: {
    learningStyle: 'visual' | 'hands-on' | 'reading' | 'mixed';
    pace: 'quick' | 'moderate' | 'thorough';
    complexity: 'simple' | 'moderate' | 'complex';
    guidance: 'minimal' | 'moderate' | 'extensive';
  };
  motivations: string[];
  painPoints: string[];
}

export class PersonalizationEngine {
  private options: PersonalizationOptions;
  private userPersonas: Map<string, UserPersona> = new Map();
  private learningPaths: LearningPath[] = [];
  private adaptiveContentCache: Map<string, any> = new Map();

  constructor(options: PersonalizationOptions = {}) {
    this.options = {
      enableAdaptiveContent: true,
      enableRecommendations: true,
      enableDynamicDifficulty: true,
      maxRecommendations: 5,
      ...options
    };

    this.initializePersonas();
    this.initializeLearningPaths();
  }

  // Initialize predefined user personas
  private initializePersonas(): void {
    this.userPersonas.set('trader', {
      type: 'trader',
      characteristics: ['analytical', 'goal-oriented', 'competitive'],
      preferences: {
        learningStyle: 'hands-on',
        pace: 'quick',
        complexity: 'moderate',
        guidance: 'minimal'
      },
      motivations: ['profit', 'efficiency', 'market insights'],
      painPoints: ['complex interfaces', 'slow processes', 'unclear pricing']
    });

    this.userPersonas.set('producer', {
      type: 'producer',
      characteristics: ['technical', 'quality-focused', 'sustainability-minded'],
      preferences: {
        learningStyle: 'visual',
        pace: 'thorough',
        complexity: 'complex',
        guidance: 'extensive'
      },
      motivations: ['revenue', 'grid contribution', 'sustainability'],
      painPoints: ['monitoring complexity', 'regulatory compliance', 'market access']
    });

    this.userPersonas.set('consumer', {
      type: 'consumer',
      characteristics: ['price-sensitive', 'convenience-focused', 'eco-conscious'],
      preferences: {
        learningStyle: 'simple',
        pace: 'moderate',
        complexity: 'simple',
        guidance: 'moderate'
      },
      motivations: ['cost savings', 'renewable energy', 'simplicity'],
      painPoints: ['hidden fees', 'complex contracts', 'technical jargon']
    });

    this.userPersonas.set('explorer', {
      type: 'explorer',
      characteristics: ['curious', 'experimental', 'early adopter'],
      preferences: {
        learningStyle: 'mixed',
        pace: 'quick',
        complexity: 'complex',
        guidance: 'minimal'
      },
      motivations: ['innovation', 'learning', 'community'],
      painPoints: ['limited features', 'restrictive rules', 'slow updates']
    });
  }

  // Initialize learning paths
  private initializeLearningPaths(): void {
    this.learningPaths = [
      {
        id: 'energy-trader-path',
        title: 'Energy Trading Mastery',
        description: 'Complete path to become a proficient energy trader',
        tutorials: ['getting-started', 'advanced-trading', 'market-analysis', 'risk-management'],
        estimatedTime: 45,
        difficulty: 'intermediate',
        prerequisites: [],
        outcomes: ['Execute profitable trades', 'Analyze market trends', 'Manage risks effectively']
      },
      {
        id: 'producer-starter-path',
        title: 'Energy Producer Quick Start',
        description: 'Essential skills for energy producers',
        tutorials: ['getting-started', 'producer-setup', 'grid-integration', 'revenue-optimization'],
        estimatedTime: 30,
        difficulty: 'beginner',
        prerequisites: [],
        outcomes: ['Connect to grid', 'Monitor production', 'Optimize revenue']
      },
      {
        id: 'consumer-basics-path',
        title: 'Smart Consumer Guide',
        description: 'Learn to save money with renewable energy',
        tutorials: ['getting-started', 'consumer-basics', 'bill-optimization', 'green-energy'],
        estimatedTime: 20,
        difficulty: 'beginner',
        prerequisites: [],
        outcomes: ['Reduce energy costs', 'Choose green energy', 'Understand billing']
      }
    ];
  }

  // Personalize tutorials based on user goals and profile
  personalizeTutorials(
    tutorials: InteractiveTutorial[], 
    userGoals: UserGoals, 
    userProfile?: UserProfile
  ): PersonalizationResult {
    const persona = this.userPersonas.get(userGoals.primaryGoal);
    if (!persona) {
      return this.getDefaultPersonalization(tutorials);
    }

    // Filter tutorials based on user preferences
    let personalizedTutorials = this.filterTutorialsByPreferences(tutorials, persona, userGoals);
    
    // Sort tutorials by relevance
    personalizedTutorials = this.sortTutorialsByRelevance(personalizedTutorials, persona, userGoals);
    
    // Generate recommendations
    const recommendedNextSteps = this.generateRecommendations(personalizedTutorials, userGoals, userProfile);
    
    // Create adaptive content
    const adaptiveContent = this.createAdaptiveContent(personalizedTutorials, persona, userGoals);
    
    // Determine difficulty adjustment
    const difficultyAdjustment = this.calculateDifficultyAdjustment(userGoals, userProfile);
    
    // Estimate completion time
    const estimatedCompletionTime = this.estimateCompletionTime(personalizedTutorials, persona);

    return {
      personalizedTutorials,
      recommendedNextSteps,
      adaptiveContent,
      difficultyAdjustment,
      estimatedCompletionTime
    };
  }

  // Filter tutorials by user preferences
  private filterTutorialsByPreferences(
    tutorials: InteractiveTutorial[], 
    persona: UserPersona, 
    userGoals: UserGoals
  ): InteractiveTutorial[] {
    return tutorials.filter(tutorial => {
      // Filter by experience level
      if (userGoals.experienceLevel === 'expert' && tutorial.difficulty === 'beginner') {
        return false;
      }
      
      // Filter by time commitment
      if (userGoals.timeCommitment === 'quick' && tutorial.estimatedTime > 15) {
        return false;
      }
      
      // Filter by learning style preferences
      if (persona.preferences.learningStyle === 'hands-on' && !tutorial.handsOn) {
        return false;
      }
      
      // Filter by primary goal relevance
      if (!this.isTutorialRelevantToGoal(tutorial, userGoals.primaryGoal)) {
        return false;
      }
      
      return true;
    });
  }

  // Check if tutorial is relevant to user's primary goal
  private isTutorialRelevantToGoal(tutorial: InteractiveTutorial, goal: UserGoals['primaryGoal']): boolean {
    const goalRelevance: Record<UserGoals['primaryGoal'], string[]> = {
      trader: ['trading', 'market', 'analysis', 'advanced'],
      producer: ['producer', 'setup', 'integration', 'monitoring'],
      consumer: ['consumer', 'basics', 'billing', 'savings'],
      explorer: ['getting-started', 'advanced', 'innovation']
    };

    const relevantKeywords = goalRelevance[goal] || [];
    const tutorialText = `${tutorial.title} ${tutorial.description} ${tutorial.category}`.toLowerCase();
    
    return relevantKeywords.some(keyword => tutorialText.includes(keyword));
  }

  // Sort tutorials by relevance
  private sortTutorialsByRelevance(
    tutorials: InteractiveTutorial[], 
    persona: UserPersona, 
    userGoals: UserGoals
  ): InteractiveTutorial[] {
    return tutorials.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, persona, userGoals);
      const scoreB = this.calculateRelevanceScore(b, persona, userGoals);
      return scoreB - scoreA;
    });
  }

  // Calculate relevance score for a tutorial
  private calculateRelevanceScore(
    tutorial: InteractiveTutorial, 
    persona: UserPersona, 
    userGoals: UserGoals
  ): number {
    let score = 0;

    // Base score for matching category
    if (this.isTutorialRelevantToGoal(tutorial, userGoals.primaryGoal)) {
      score += 50;
    }

    // Experience level matching
    if (tutorial.difficulty === userGoals.experienceLevel) {
      score += 20;
    } else if (this.isDifficultyAppropriate(tutorial.difficulty, userGoals.experienceLevel)) {
      score += 10;
    }

    // Time preference matching
    if (tutorial.estimatedTime <= this.getMaxTimeForCommitment(userGoals.timeCommitment)) {
      score += 15;
    }

    // Learning style matching
    if (persona.preferences.learningStyle === 'hands-on' && tutorial.handsOn) {
      score += 10;
    }
    if (persona.preferences.learningStyle === 'visual' && tutorial.interactive) {
      score += 10;
    }

    // Interest matching
    if (userGoals.interests.some(interest => 
      tutorial.title.toLowerCase().includes(interest.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(interest.toLowerCase())
    )) {
      score += 15;
    }

    return score;
  }

  // Check if difficulty is appropriate for experience level
  private isDifficultyAppropriate(tutorialDifficulty: string, experienceLevel: UserGoals['experienceLevel']): boolean {
    const difficultyProgression = {
      beginner: ['beginner'],
      intermediate: ['beginner', 'intermediate'],
      advanced: ['intermediate', 'advanced']
    };

    return difficultyProgression[experienceLevel]?.includes(tutorialDifficulty) || false;
  }

  // Get max time for time commitment
  private getMaxTimeForCommitment(commitment: UserGoals['timeCommitment']): number {
    const timeLimits = {
      quick: 10,
      thorough: 25,
      comprehensive: 60
    };
    return timeLimits[commitment] || 30;
  }

  // Generate recommendations
  private generateRecommendations(
    tutorials: InteractiveTutorial[], 
    userGoals: UserGoals, 
    userProfile?: UserProfile
  ): string[] {
    const recommendations: string[] = [];
    const persona = this.userPersonas.get(userGoals.primaryGoal);

    if (!persona) return recommendations;

    // Recommend based on completed tutorials
    if (userProfile?.previousExperience === 'none') {
      recommendations.push('Start with "Getting Started" tutorial');
    }

    // Recommend based on interests
    if (userGoals.interests.includes('market analysis')) {
      recommendations.push('Explore advanced trading tutorials');
    }

    // Recommend based on persona motivations
    if (persona.motivations.includes('profit')) {
      recommendations.push('Focus on trading strategy tutorials');
    }

    // Recommend based on pain points
    if (persona.painPoints.includes('complex interfaces')) {
      recommendations.push('Try tutorials with guided step-by-step instructions');
    }

    return recommendations.slice(0, this.options.maxRecommendations);
  }

  // Create adaptive content
  private createAdaptiveContent(
    tutorials: InteractiveTutorial[], 
    persona: UserPersona, 
    userGoals: UserGoals
  ): Record<string, any> {
    const adaptiveContent: Record<string, any> = {};

    tutorials.forEach(tutorial => {
      const cacheKey = `${tutorial.id}_${userGoals.primaryGoal}_${userGoals.experienceLevel}`;
      
      if (this.adaptiveContentCache.has(cacheKey)) {
        adaptiveContent[tutorial.id] = this.adaptiveContentCache.get(cacheKey);
      } else {
        adaptiveContent[tutorial.id] = this.generateAdaptiveContentForTutorial(tutorial, persona, userGoals);
        this.adaptiveContentCache.set(cacheKey, adaptiveContent[tutorial.id]);
      }
    });

    return adaptiveContent;
  }

  // Generate adaptive content for a specific tutorial
  private generateAdaptiveContentForTutorial(
    tutorial: InteractiveTutorial, 
    persona: UserPersona, 
    userGoals: UserGoals
  ): any {
    const content = {
      customIntro: '',
      emphasisPoints: [],
      additionalResources: [],
      pacingAdjustments: {},
      visualAids: []
    };

    // Customize intro based on persona
    content.customIntro = this.generateCustomIntro(tutorial, persona, userGoals);

    // Add emphasis points based on motivations
    content.emphasisPoints = this.generateEmphasisPoints(tutorial, persona);

    // Add additional resources based on pain points
    content.additionalResources = this.generateAdditionalResources(tutorial, persona);

    // Adjust pacing based on pace preference
    content.pacingAdjustments = this.generatePacingAdjustments(tutorial, persona);

    // Add visual aids based on learning style
    content.visualAids = this.generateVisualAids(tutorial, persona);

    return content;
  }

  // Generate custom intro
  private generateCustomIntro(tutorial: InteractiveTutorial, persona: UserPersona, userGoals: UserGoals): string {
    const intros: Record<UserPersona['type'], string> = {
      trader: `As a trader focused on ${persona.motivations.join(' and ')}, this tutorial will help you ${tutorial.outcomes[0]?.toLowerCase() || 'achieve your goals'}.`,
      producer: `For energy producers like you, this guide covers essential aspects of ${tutorial.category} to maximize your ${persona.motivations.join(' and ')}.`,
      consumer: `This tutorial is designed to help you save money and achieve ${persona.motivations.join(' and ')} through ${tutorial.category}.`,
      explorer: `As an early adopter, you'll discover innovative approaches to ${tutorial.category} that align with your interest in ${persona.motivations.join(' and ')}.`
    };

    return intros[persona.type] || tutorial.description;
  }

  // Generate emphasis points
  private generateEmphasisPoints(tutorial: InteractiveTutorial, persona: UserPersona): string[] {
    const points: string[] = [];

    if (persona.motivations.includes('profit')) {
      points.push('Pay special attention to cost-saving opportunities');
    }
    if (persona.motivations.includes('efficiency')) {
      points.push('Focus on time-saving techniques and shortcuts');
    }
    if (persona.motivations.includes('sustainability')) {
      points.push('Note the environmental impact sections');
    }

    return points;
  }

  // Generate additional resources
  private generateAdditionalResources(tutorial: InteractiveTutorial, persona: UserPersona): string[] {
    const resources: string[] = [];

    if (persona.painPoints.includes('complex interfaces')) {
      resources.push('Visual guides and cheat sheets');
    }
    if (persona.painPoints.includes('technical jargon')) {
      resources.push('Glossary of terms and concepts');
    }
    if (persona.painPoints.includes('slow processes')) {
      resources.push('Quick start tips and shortcuts');
    }

    return resources;
  }

  // Generate pacing adjustments
  private generatePacingAdjustments(tutorial: InteractiveTutorial, persona: UserPersona): Record<string, any> {
    const adjustments: Record<string, any> = {};

    switch (persona.preferences.pace) {
      case 'quick':
        adjustments.skipOptionalSteps = true;
        adjustments.reduceExplanations = true;
        break;
      case 'thorough':
        adjustments.addDetail = true;
        adjustments.includeExamples = true;
        break;
      case 'moderate':
        adjustments.balancedApproach = true;
        break;
    }

    return adjustments;
  }

  // Generate visual aids
  private generateVisualAids(tutorial: InteractiveTutorial, persona: UserPersona): string[] {
    const aids: string[] = [];

    if (persona.preferences.learningStyle === 'visual') {
      aids.push('Diagrams and flowcharts');
      aids.push('Screenshot walkthroughs');
    }
    if (persona.preferences.learningStyle === 'hands-on') {
      aids.push('Interactive exercises');
      aids.push('Step-by-step demos');
    }

    return aids;
  }

  // Calculate difficulty adjustment
  private calculateDifficultyAdjustment(userGoals: UserGoals, userProfile?: UserProfile): 'easier' | 'same' | 'harder' {
    // If user is struggling, make it easier
    if (userProfile?.previousExperience === 'none') {
      return 'easier';
    }

    // If user is experienced, make it harder
    if (userGoals.experienceLevel === 'advanced') {
      return 'harder';
    }

    // If user wants quick results, keep it simple
    if (userGoals.timeCommitment === 'quick') {
      return 'easier';
    }

    return 'same';
  }

  // Estimate completion time
  private estimateCompletionTime(tutorials: InteractiveTutorial[], persona: UserPersona): number {
    let totalTime = tutorials.reduce((sum, tutorial) => sum + tutorial.estimatedTime, 0);

    // Adjust based on pace preference
    switch (persona.preferences.pace) {
      case 'quick':
        totalTime *= 0.7;
        break;
      case 'thorough':
        totalTime *= 1.3;
        break;
    }

    // Adjust based on experience level
    if (persona.type === 'trader') {
      totalTime *= 0.9; // Traders tend to be faster
    } else if (persona.type === 'producer') {
      totalTime *= 1.2; // Producers tend to be more thorough
    }

    return Math.round(totalTime);
  }

  // Get default personalization
  private getDefaultPersonalization(tutorials: InteractiveTutorial[]): PersonalizationResult {
    return {
      personalizedTutorials: tutorials,
      recommendedNextSteps: ['Start with the getting started tutorial'],
      adaptiveContent: {},
      difficultyAdjustment: 'same',
      estimatedCompletionTime: tutorials.reduce((sum, t) => sum + t.estimatedTime, 0)
    };
  }

  // Get learning path recommendations
  getLearningPathRecommendations(userGoals: UserGoals, userProfile?: UserProfile): LearningPath[] {
    const persona = this.userPersonas.get(userGoals.primaryGoal);
    if (!persona) return [];

    return this.learningPaths
      .filter(path => this.isPathSuitableForUser(path, userGoals, userProfile))
      .sort((a, b) => this.calculatePathRelevance(a, userGoals) - this.calculatePathRelevance(b, userGoals))
      .slice(0, 3);
  }

  // Check if learning path is suitable for user
  private isPathSuitableForUser(path: LearningPath, userGoals: UserGoals, userProfile?: UserProfile): boolean {
    // Check difficulty match
    if (userGoals.experienceLevel === 'beginner' && path.difficulty === 'advanced') {
      return false;
    }

    // Check time commitment
    if (userGoals.timeCommitment === 'quick' && path.estimatedTime > 30) {
      return false;
    }

    // Check relevance to primary goal
    const pathText = `${path.title} ${path.description}`.toLowerCase();
    const goalKeywords = userGoals.primaryGoal;
    
    return pathText.includes(goalKeywords) || path.outcomes.some(outcome => 
      outcome.toLowerCase().includes(goalKeywords)
    );
  }

  // Calculate path relevance score
  private calculatePathRelevance(path: LearningPath, userGoals: UserGoals): number {
    let score = 0;

    // Base score for matching difficulty
    if (path.difficulty === userGoals.experienceLevel) {
      score += 30;
    }

    // Score for time alignment
    if (path.estimatedTime <= this.getMaxTimeForCommitment(userGoals.timeCommitment)) {
      score += 20;
    }

    // Score for outcome alignment with interests
    const matchingOutcomes = path.outcomes.filter(outcome =>
      userGoals.interests.some(interest => outcome.toLowerCase().includes(interest.toLowerCase()))
    );
    score += matchingOutcomes.length * 10;

    return score;
  }

  // Update user persona based on behavior
  updateUserPersona(userId: string, behavior: any): UserPersona | null {
    // Analyze user behavior to determine or update persona
    // This would typically use ML or rule-based analysis
    // For now, return a basic implementation
    
    const detectedPersona = this.detectPersonaFromBehavior(behavior);
    if (detectedPersona) {
      this.userPersonas.set(userId, detectedPersona);
      return detectedPersona;
    }

    return null;
  }

  // Detect persona from user behavior
  private detectPersonaFromBehavior(behavior: any): UserPersona | null {
    // Simple rule-based persona detection
    // In a real implementation, this would be more sophisticated
    
    if (behavior.tradingActivity > 0.7) {
      return this.userPersonas.get('trader') || null;
    }
    
    if (behavior.productionFocus > 0.7) {
      return this.userPersonas.get('producer') || null;
    }
    
    if (behavior.costSensitivity > 0.7) {
      return this.userPersonas.get('consumer') || null;
    }
    
    if (behavior.explorationRate > 0.7) {
      return this.userPersonas.get('explorer') || null;
    }

    return null;
  }

  // Get personalized content recommendations
  getContentRecommendations(
    userGoals: UserGoals, 
    currentProgress: ProgressTracker,
    userProfile?: UserProfile
  ): any[] {
    const recommendations: any[] = [];
    const persona = this.userPersonas.get(userGoals.primaryGoal);

    if (!persona) return recommendations;

    // Recommend based on current step
    const currentStepIndex = currentProgress.currentStep;
    const completionRate = currentProgress.completedSteps.length / currentProgress.totalSteps;

    if (completionRate < 0.3) {
      recommendations.push({
        type: 'help',
        title: 'Getting Started Guide',
        description: 'Extra help for beginners',
        priority: 'high'
      });
    } else if (completionRate > 0.7) {
      recommendations.push({
        type: 'advanced',
        title: 'Advanced Topics',
        description: 'Ready for the next level?',
        priority: 'medium'
      });
    }

    // Recommend based on engagement
    if (currentProgress.engagement.clicks < 5) {
      recommendations.push({
        type: 'engagement',
        title: 'Interactive Elements',
        description: 'Try clicking on highlighted areas',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  // Clear cache
  clearCache(): void {
    this.adaptiveContentCache.clear();
  }

  // Get personalization statistics
  getPersonalizationStats(): any {
    return {
      totalPersonas: this.userPersonas.size,
      totalLearningPaths: this.learningPaths.length,
      cacheSize: this.adaptiveContentCache.size,
      options: this.options
    };
  }
}

// Singleton instance
export const personalizationEngine = new PersonalizationEngine();
