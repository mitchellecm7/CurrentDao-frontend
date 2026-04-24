import { SearchQuery, SearchResult, SearchFilter, SearchAnalytics } from '@/types/search';
import { rankingAlgorithm } from '@/utils/search/ranking-algorithm';

export class SearchEngine {
  private index: Map<string, SearchableItem> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map();
  private analytics: SearchAnalytics = {
    totalSearches: 0,
    averageResponseTime: 0,
    popularQueries: new Map(),
    filterUsage: new Map(),
    resultClicks: new Map()
  };

  constructor() {
    this.initializeIndex();
  }

  private initializeIndex(): void {
    // Initialize with energy trading data
    this.indexEnergyTradingData();
  }

  private indexEnergyTradingData(): void {
    // Mock energy trading data for indexing
    const mockData: SearchableItem[] = [
      {
        id: 'energy-trade-1',
        type: 'energy_trade',
        title: 'Solar Energy Trading - California',
        content: 'High-quality solar energy available for trading in California region. Competitive rates and reliable supply.',
        metadata: {
          location: 'California',
          energyType: 'solar',
          price: 0.12,
          availability: 'immediate',
          rating: 4.8,
          volume: 1000
        },
        tags: ['solar', 'california', 'renewable', 'trading'],
        timestamp: new Date(),
        relevanceScore: 1.0
      },
      {
        id: 'energy-trade-2',
        type: 'energy_trade',
        title: 'Wind Energy - Texas',
        content: 'Wind energy trading opportunities in Texas with flexible delivery options and competitive pricing.',
        metadata: {
          location: 'Texas',
          energyType: 'wind',
          price: 0.08,
          availability: 'flexible',
          rating: 4.6,
          volume: 2500
        },
        tags: ['wind', 'texas', 'renewable', 'trading'],
        timestamp: new Date(),
        relevanceScore: 1.0
      },
      {
        id: 'dao-proposal-1',
        type: 'dao_proposal',
        title: 'Green Energy Initiative',
        content: 'Proposal to increase renewable energy trading volume by 50% through blockchain-based smart contracts.',
        metadata: {
          category: 'energy_policy',
          status: 'active',
          votes: 156,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        tags: ['renewable', 'blockchain', 'policy', 'voting'],
        timestamp: new Date(),
        relevanceScore: 1.0
      }
    ];

    mockData.forEach(item => this.indexItem(item));
  }

  private indexItem(item: SearchableItem): void {
    this.index.set(item.id, item);
    
    // Build inverted index for full-text search
    const words = this.extractWords(item.title + ' ' + item.content + ' ' + item.tags.join(' '));
    words.forEach(word => {
      if (!this.invertedIndex.has(word)) {
        this.invertedIndex.set(word, new Set());
      }
      this.invertedIndex.get(word)!.add(item.id);
    });
  }

  private extractWords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    const startTime = performance.now();
    
    this.analytics.totalSearches++;
    this.updatePopularQueries(query.text);

    let candidateIds = new Set<string>();
    
    if (query.text) {
      const words = this.extractWords(query.text);
      words.forEach(word => {
        const wordMatches = this.invertedIndex.get(word);
        if (wordMatches) {
          if (candidateIds.size === 0) {
            candidateIds = new Set(wordMatches);
          } else {
            candidateIds = new Set([...candidateIds].filter(id => wordMatches.has(id)));
          }
        }
      });
    } else {
      candidateIds = new Set(this.index.keys());
    }

    let results = Array.from(candidateIds)
      .map(id => this.index.get(id)!)
      .filter(item => item && this.matchesFilters(item, query.filters))
      .map(item => ({
        ...item,
        relevanceScore: rankingAlgorithm(item, query)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Apply pagination
    const offset = (query.page || 1) - 1;
    const limit = query.limit || 20;
    const paginatedResults = results.slice(offset * limit, (offset + 1) * limit);

    const endTime = performance.now();
    const responseTime = endTime - startTime;
    this.updateResponseTime(responseTime);

    return {
      results: paginatedResults,
      total: results.length,
      page: query.page || 1,
      limit: query.limit || 20,
      responseTime,
      suggestions: this.generateSuggestions(query.text),
      analytics: this.getQueryAnalytics(query)
    };
  }

  private matchesFilters(item: SearchableItem, filters: SearchFilter[]): boolean {
    if (!filters || filters.length === 0) return true;

    return filters.every(filter => {
      const value = item.metadata[filter.field];
      
      switch (filter.operator) {
        case 'equals':
          return value === filter.value;
        case 'contains':
          return typeof value === 'string' && value.toLowerCase().includes(filter.value.toLowerCase());
        case 'greater_than':
          return Number(value) > Number(filter.value);
        case 'less_than':
          return Number(value) < Number(filter.value);
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(value);
        case 'range':
          return Array.isArray(filter.value) && 
                 Number(value) >= filter.value[0] && 
                 Number(value) <= filter.value[1];
        default:
          return true;
      }
    });
  }

  private generateSuggestions(query: string): string[] {
    if (!query || query.length < 2) return [];

    const words = this.extractWords(query);
    const suggestions = new Set<string>();

    words.forEach(word => {
      this.invertedIndex.forEach((ids, indexedWord) => {
        if (indexedWord.includes(word) && indexedWord !== word) {
          suggestions.add(indexedWord);
        }
      });
    });

    return Array.from(suggestions).slice(0, 5);
  }

  private updatePopularQueries(query: string): void {
    const current = this.analytics.popularQueries.get(query) || 0;
    this.analytics.popularQueries.set(query, current + 1);
  }

  private updateResponseTime(time: number): void {
    const total = this.analytics.totalSearches;
    const current = this.analytics.averageResponseTime;
    this.analytics.averageResponseTime = (current * (total - 1) + time) / total;
  }

  private getQueryAnalytics(query: SearchQuery): any {
    return {
      queryLength: query.text?.length || 0,
      filterCount: query.filters?.length || 0,
      hasLocationFilter: query.filters?.some(f => f.field === 'location') || false,
      hasPriceFilter: query.filters?.some(f => f.field === 'price') || false
    };
  }

  getAnalytics(): SearchAnalytics {
    return { ...this.analytics };
  }

  async getAutocompleteSuggestions(partial: string): Promise<string[]> {
    if (!partial || partial.length < 2) return [];

    const partialLower = partial.toLowerCase();
    const suggestions = new Set<string>();

    // Search in titles, content, and tags
    this.index.forEach(item => {
      const words = this.extractWords(item.title + ' ' + item.content + ' ' + item.tags.join(' '));
      words.forEach(word => {
        if (word.includes(partialLower)) {
          suggestions.add(word);
        }
      });
    });

    return Array.from(suggestions)
      .sort()
      .slice(0, 10);
  }

  addToIndex(item: SearchableItem): void {
    this.indexItem(item);
  }

  removeFromIndex(id: string): void {
    const item = this.index.get(id);
    if (item) {
      const words = this.extractWords(item.title + ' ' + item.content + ' ' + item.tags.join(' '));
      words.forEach(word => {
        const wordSet = this.invertedIndex.get(word);
        if (wordSet) {
          wordSet.delete(id);
          if (wordSet.size === 0) {
            this.invertedIndex.delete(word);
          }
        }
      });
      this.index.delete(id);
    }
  }
}

export interface SearchableItem {
  id: string;
  type: 'energy_trade' | 'dao_proposal' | 'user' | 'transaction' | 'market_data';
  title: string;
  content: string;
  metadata: Record<string, any>;
  tags: string[];
  timestamp: Date;
  relevanceScore: number;
}

export const searchEngine = new SearchEngine();
