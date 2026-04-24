import { 
  HelpCenterResource, 
  TutorialStep, 
  InteractiveTutorial,
  UserGoals 
} from '../../types/onboarding';

export interface HelpCenterIntegration {
  searchResources(query: string, context?: string): Promise<HelpCenterResource[]>;
  getResourcesForStep(stepId: string): HelpCenterResource[];
  getResourcesForTutorial(tutorialId: string): HelpCenterResource[];
  getContextualHelp(currentContext: string): HelpCenterResource[];
  trackHelpUsage(resourceId: string, userId: string): void;
}

export interface HelpSearchOptions {
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  type?: 'article' | 'video' | 'faq' | 'tutorial';
  limit?: number;
}

export interface HelpContext {
  currentStep?: TutorialStep;
  currentTutorial?: InteractiveTutorial;
  userGoals?: UserGoals;
  userProgress?: number;
  previousHelpRequests?: string[];
}

export class HelpCenterService implements HelpCenterIntegration {
  private resources: HelpCenterResource[] = [];
  private usageData: Map<string, { count: number; lastUsed: Date; users: Set<string> }> = new Map();
  private contextualCache: Map<string, HelpCenterResource[]> = new Map();

  constructor() {
    this.initializeHelpResources();
  }

  // Initialize help center resources
  private initializeHelpResources(): void {
    this.resources = [
      // Getting Started Resources
      {
        id: 'getting-started-basics',
        title: 'CurrentDao Platform Basics',
        content: 'Learn the fundamentals of the CurrentDao decentralized energy marketplace, including key concepts, navigation, and basic features.',
        category: 'getting-started',
        tags: ['basics', 'platform', 'navigation', 'beginner'],
        type: 'article',
        relatedTutorials: ['getting-started'],
        difficulty: 'beginner',
        estimatedReadTime: 5
      },
      {
        id: 'wallet-connection-guide',
        title: 'Wallet Connection Guide',
        content: 'Step-by-step guide to connecting your Stellar or Ethereum wallet to CurrentDao, including troubleshooting common issues.',
        category: 'wallet',
        tags: ['wallet', 'connection', 'stellar', 'ethereum', 'troubleshooting'],
        type: 'article',
        relatedTutorials: ['getting-started'],
        difficulty: 'beginner',
        estimatedReadTime: 8
      },
      {
        id: 'first-trade-video',
        title: 'Your First Energy Trade - Video Tutorial',
        content: 'Watch a comprehensive video guide showing how to execute your first energy trade on CurrentDao.',
        category: 'trading',
        tags: ['trading', 'first-trade', 'video', 'tutorial'],
        type: 'video',
        relatedTutorials: ['getting-started'],
        difficulty: 'beginner',
        estimatedReadTime: 10
      },

      // Trading Resources
      {
        id: 'trading-strategies',
        title: 'Advanced Trading Strategies',
        content: 'Explore sophisticated trading strategies for energy markets, including arbitrage, hedging, and portfolio optimization.',
        category: 'trading',
        tags: ['trading', 'strategies', 'advanced', 'analysis'],
        type: 'article',
        relatedTutorials: ['advanced-trading'],
        difficulty: 'advanced',
        estimatedReadTime: 15
      },
      {
        id: 'market-analysis-tools',
        title: 'Market Analysis Tools and Techniques',
        content: 'Learn how to use CurrentDao\'s built-in market analysis tools to make informed trading decisions.',
        category: 'trading',
        tags: ['analysis', 'tools', 'charts', 'indicators'],
        type: 'tutorial',
        relatedTutorials: ['advanced-trading'],
        difficulty: 'intermediate',
        estimatedReadTime: 12
      },
      {
        id: 'risk-management',
        title: 'Risk Management for Energy Trading',
        content: 'Essential risk management strategies to protect your investments in the volatile energy market.',
        category: 'trading',
        tags: ['risk', 'management', 'safety', 'portfolio'],
        type: 'article',
        relatedTutorials: ['advanced-trading'],
        difficulty: 'intermediate',
        estimatedReadTime: 10
      },

      // Wallet Resources
      {
        id: 'wallet-security',
        title: 'Wallet Security Best Practices',
        content: 'Comprehensive guide to securing your digital wallet and protecting your energy assets.',
        category: 'wallet',
        tags: ['security', 'protection', 'best-practices', 'safety'],
        type: 'article',
        relatedTutorials: ['getting-started'],
        difficulty: 'beginner',
        estimatedReadTime: 7
      },
      {
        id: 'multi-wallet-management',
        title: 'Managing Multiple Wallets',
        content: 'Learn how to efficiently manage multiple wallets for different trading strategies and asset segregation.',
        category: 'wallet',
        tags: ['multi-wallet', 'management', 'organization'],
        type: 'tutorial',
        relatedTutorials: ['advanced-trading'],
        difficulty: 'advanced',
        estimatedReadTime: 12
      },

      // FAQ Resources
      {
        id: 'common-trading-questions',
        title: 'Common Trading Questions Answered',
        content: 'Frequently asked questions about energy trading, fees, settlement times, and market mechanics.',
        category: 'trading',
        tags: ['faq', 'questions', 'trading', 'fees'],
        type: 'faq',
        relatedTutorials: ['getting-started', 'advanced-trading'],
        difficulty: 'beginner',
        estimatedReadTime: 5
      },
      {
        id: 'technical-troubleshooting',
        title: 'Technical Troubleshooting Guide',
        content: 'Solutions to common technical issues, including connection problems, transaction failures, and display issues.',
        category: 'technical',
        tags: ['troubleshooting', 'technical', 'support', 'issues'],
        type: 'faq',
        relatedTutorials: ['getting-started'],
        difficulty: 'beginner',
        estimatedReadTime: 8
      },

      // Advanced Topics
      {
        id: 'smart-contracts',
        title: 'Understanding Smart Contracts in Energy Trading',
        content: 'Deep dive into how smart contracts power CurrentDao\'s energy trading platform.',
        category: 'technical',
        tags: ['smart-contracts', 'blockchain', 'technical', 'advanced'],
        type: 'article',
        relatedTutorials: ['advanced-trading'],
        difficulty: 'advanced',
        estimatedReadTime: 20
      },
      {
        id: 'decentralized-finance',
        title: 'DeFi Concepts for Energy Markets',
        content: 'How decentralized finance principles apply to energy trading and marketplace dynamics.',
        category: 'technical',
        tags: ['defi', 'decentralized', 'finance', 'concepts'],
        type: 'article',
        relatedTutorials: ['advanced-trading'],
        difficulty: 'advanced',
        estimatedReadTime: 18
      }
    ];
  }

  // Search help resources
  async searchResources(query: string, options: HelpSearchOptions = {}): Promise<HelpCenterResource[]> {
    const normalizedQuery = query.toLowerCase();
    const filteredResources = this.resources.filter(resource => {
      // Text search
      const matchesQuery = 
        resource.title.toLowerCase().includes(normalizedQuery) ||
        resource.content.toLowerCase().includes(normalizedQuery) ||
        resource.tags.some(tag => tag.toLowerCase().includes(normalizedQuery));

      if (!matchesQuery) return false;

      // Category filter
      if (options.category && resource.category !== options.category) {
        return false;
      }

      // Difficulty filter
      if (options.difficulty && resource.difficulty !== options.difficulty) {
        return false;
      }

      // Type filter
      if (options.type && resource.type !== options.type) {
        return false;
      }

      return true;
    });

    // Sort by relevance
    const sortedResources = filteredResources.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, normalizedQuery);
      const bScore = this.calculateRelevanceScore(b, normalizedQuery);
      return bScore - aScore;
    });

    return sortedResources.slice(0, options.limit || 10);
  }

  // Calculate relevance score for search
  private calculateRelevanceScore(resource: HelpCenterResource, query: string): number {
    let score = 0;

    // Title matches are most important
    if (resource.title.toLowerCase().includes(query)) {
      score += 50;
    }

    // Tag matches
    const matchingTags = resource.tags.filter(tag => tag.toLowerCase().includes(query));
    score += matchingTags.length * 20;

    // Content matches
    if (resource.content.toLowerCase().includes(query)) {
      score += 10;
    }

    // Category matches
    if (resource.category.toLowerCase().includes(query)) {
      score += 15;
    }

    // Boost beginner content for general queries
    if (resource.difficulty === 'beginner' && query.length < 10) {
      score += 5;
    }

    return score;
  }

  // Get resources for specific tutorial step
  getResourcesForStep(stepId: string): HelpCenterResource[] {
    const stepResourceMap: Record<string, string[]> = {
      'welcome': ['getting-started-basics'],
      'goals': ['getting-started-basics'],
      'dashboard': ['getting-started-basics'],
      'trading': ['first-trade-video', 'common-trading-questions'],
      'wallet': ['wallet-connection-guide', 'wallet-security'],
      'first-trade': ['first-trade-video', 'trading-strategies'],
      'market-analysis': ['market-analysis-tools', 'trading-strategies'],
      'advanced-orders': ['trading-strategies', 'risk-management']
    };

    const resourceIds = stepResourceMap[stepId] || [];
    return this.resources.filter(resource => resourceIds.includes(resource.id));
  }

  // Get resources for entire tutorial
  getResourcesForTutorial(tutorialId: string): HelpCenterResource[] {
    return this.resources.filter(resource => 
      resource.relatedTutorials.includes(tutorialId)
    );
  }

  // Get contextual help based on current context
  getContextualHelp(context: HelpContext): HelpCenterResource[] {
    const cacheKey = this.generateContextKey(context);
    
    if (this.contextualCache.has(cacheKey)) {
      return this.contextualCache.get(cacheKey)!;
    }

    let relevantResources: HelpCenterResource[] = [];

    // Resources based on current step
    if (context.currentStep) {
      relevantResources.push(...this.getResourcesForStep(context.currentStep.id));
    }

    // Resources based on current tutorial
    if (context.currentTutorial) {
      relevantResources.push(...this.getResourcesForTutorial(context.currentTutorial.id));
    }

    // Resources based on user goals
    if (context.userGoals) {
      relevantResources.push(...this.getResourcesForGoals(context.userGoals));
    }

    // Resources based on progress (beginner vs advanced)
    if (context.userProgress !== undefined) {
      if (context.userProgress < 0.3) {
        // Beginners get more basic resources
        relevantResources = relevantResources.filter(r => r.difficulty === 'beginner');
      } else if (context.userProgress > 0.7) {
        // Advanced users get more complex resources
        relevantResources.push(...this.resources.filter(r => r.difficulty === 'advanced'));
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueResources = Array.from(new Set(relevantResources));
    const sortedResources = uniqueResources.sort((a, b) => {
      // Prioritize beginner content for new users
      if (context.userProgress && context.userProgress < 0.5) {
        if (a.difficulty === 'beginner' && b.difficulty !== 'beginner') return -1;
        if (b.difficulty === 'beginner' && a.difficulty !== 'beginner') return 1;
      }
      return 0;
    });

    const result = sortedResources.slice(0, 5);
    this.contextualCache.set(cacheKey, result);
    
    return result;
  }

  // Generate cache key for context
  private generateContextKey(context: HelpContext): string {
    const parts = [
      context.currentStep?.id || '',
      context.currentTutorial?.id || '',
      context.userGoals?.primaryGoal || '',
      Math.floor((context.userProgress || 0) * 10).toString()
    ];
    
    return parts.filter(Boolean).join('_');
  }

  // Get resources based on user goals
  private getResourcesForGoals(userGoals: UserGoals): HelpCenterResource[] {
    const goalResourceMap: Record<UserGoals['primaryGoal'], string[]> = {
      trader: ['trading-strategies', 'market-analysis-tools', 'risk-management', 'common-trading-questions'],
      producer: ['wallet-security', 'multi-wallet-management', 'smart-contracts'],
      consumer: ['getting-started-basics', 'wallet-connection-guide', 'common-trading-questions'],
      explorer: ['smart-contracts', 'decentralized-finance', 'market-analysis-tools']
    };

    const resourceIds = goalResourceMap[userGoals.primaryGoal] || [];
    return this.resources.filter(resource => resourceIds.includes(resource.id));
  }

  // Track help resource usage
  trackHelpUsage(resourceId: string, userId: string): void {
    if (!this.usageData.has(resourceId)) {
      this.usageData.set(resourceId, {
        count: 0,
        lastUsed: new Date(),
        users: new Set()
      });
    }

    const usage = this.usageData.get(resourceId)!;
    usage.count++;
    usage.lastUsed = new Date();
    usage.users.add(userId);
  }

  // Get popular help resources
  getPopularResources(limit: number = 10): HelpCenterResource[] {
    const resourcesWithUsage = this.resources.map(resource => ({
      resource,
      usage: this.usageData.get(resource.id) || { count: 0, lastUsed: new Date(0), users: new Set() }
    }));

    return resourcesWithUsage
      .sort((a, b) => b.usage.count - a.usage.count)
      .slice(0, limit)
      .map(item => item.resource);
  }

  // Get help resources by category
  getResourcesByCategory(category: string): HelpCenterResource[] {
    return this.resources.filter(resource => resource.category === category);
  }

  // Get help resources by difficulty
  getResourcesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): HelpCenterResource[] {
    return this.resources.filter(resource => resource.difficulty === difficulty);
  }

  // Get related resources
  getRelatedResources(resourceId: string, limit: number = 5): HelpCenterResource[] {
    const targetResource = this.resources.find(r => r.id === resourceId);
    if (!targetResource) return [];

    return this.resources
      .filter(resource => {
        if (resource.id === resourceId) return false;
        
        // Same category
        if (resource.category === targetResource.category) return true;
        
        // Shared tags
        const sharedTags = resource.tags.filter(tag => targetResource.tags.includes(tag));
        if (sharedTags.length > 0) return true;
        
        // Same difficulty
        if (resource.difficulty === targetResource.difficulty) return true;
        
        return false;
      })
      .slice(0, limit);
  }

  // Get help analytics
  getHelpAnalytics(): any {
    const totalUsage = Array.from(this.usageData.values())
      .reduce((sum, usage) => sum + usage.count, 0);

    const uniqueUsers = new Set(
      Array.from(this.usageData.values())
        .flatMap(usage => Array.from(usage.users))
    ).size;

    const categoryUsage = this.resources.reduce((acc, resource) => {
      const usage = this.usageData.get(resource.id);
      if (!usage) return acc;
      
      acc[resource.category] = (acc[resource.category] || 0) + usage.count;
      return acc;
    }, {} as Record<string, number>);

    const difficultyUsage = this.resources.reduce((acc, resource) => {
      const usage = this.usageData.get(resource.id);
      if (!usage) return acc;
      
      acc[resource.difficulty] = (acc[resource.difficulty] || 0) + usage.count;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsage,
      uniqueUsers,
      categoryUsage,
      difficultyUsage,
      mostUsedResources: this.getPopularResources(5),
      leastUsedResources: this.resources
        .filter(resource => !this.usageData.has(resource.id))
        .slice(0, 5)
        .map(r => r.id)
    };
  }

  // Update help resources
  updateResources(newResources: HelpCenterResource[]): void {
    this.resources.push(...newResources);
    this.contextualCache.clear(); // Clear cache since resources changed
  }

  // Search suggestions
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    const allTerms = new Set<string>();
    
    // Extract terms from titles
    this.resources.forEach(resource => {
      const words = resource.title.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 2 && word.includes(query.toLowerCase())) {
          allTerms.add(word);
        }
      });
    });

    // Extract terms from tags
    this.resources.forEach(resource => {
      resource.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          allTerms.add(tag);
        }
      });
    });

    // Extract terms from categories
    this.resources.forEach(resource => {
      if (resource.category.toLowerCase().includes(query.toLowerCase())) {
        allTerms.add(resource.category);
      }
    });

    return Array.from(allTerms).slice(0, limit);
  }

  // Get help for specific error or issue
  getHelpForError(errorType: string): HelpCenterResource[] {
    const errorResourceMap: Record<string, string[]> = {
      'wallet-connection': ['wallet-connection-guide', 'technical-troubleshooting'],
      'transaction-failed': ['technical-troubleshooting', 'common-trading-questions'],
      'navigation-issue': ['getting-started-basics'],
      'pricing-confusion': ['common-trading-questions', 'market-analysis-tools'],
      'security-concern': ['wallet-security'],
      'performance-issue': ['technical-troubleshooting']
    };

    const resourceIds = errorResourceMap[errorType] || ['technical-troubleshooting'];
    return this.resources.filter(resource => resourceIds.includes(resource.id));
  }

  // Clear cache
  clearCache(): void {
    this.contextualCache.clear();
  }

  // Export help data
  exportHelpData(): any {
    return {
      resources: this.resources,
      usageData: Array.from(this.usageData.entries()).map(([id, data]) => ({
        id,
        ...data,
        users: Array.from(data.users)
      })),
      analytics: this.getHelpAnalytics()
    };
  }

  // Import help data
  importHelpData(data: any): void {
    if (data.resources) {
      this.resources = data.resources;
    }
    
    if (data.usageData) {
      this.usageData = new Map(
        data.usageData.map((item: any) => [
          item.id,
          {
            count: item.count,
            lastUsed: new Date(item.lastUsed),
            users: new Set(item.users)
          }
        ])
      );
    }
    
    this.clearCache();
  }
}

// Singleton instance
export const helpCenterService = new HelpCenterService();
