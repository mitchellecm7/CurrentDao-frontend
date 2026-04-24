export interface SearchQuery {
  text?: string;
  filters?: SearchFilter[];
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'rating' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'range';
  value: any;
  label?: string;
}

export interface SearchResult {
  results: SearchableItem[];
  total: number;
  page: number;
  limit: number;
  responseTime: number;
  suggestions: string[];
  analytics: QueryAnalytics;
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

export interface SearchAnalytics {
  totalSearches: number;
  averageResponseTime: number;
  popularQueries: Map<string, number>;
  filterUsage: Map<string, number>;
  resultClicks: Map<string, number>;
}

export interface QueryAnalytics {
  queryLength: number;
  filterCount: number;
  hasLocationFilter: boolean;
  hasPriceFilter: boolean;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  createdAt: Date;
  lastUsed?: Date;
  useCount: number;
  isDefault?: boolean;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'filter' | 'completion';
  relevance: number;
  metadata?: Record<string, any>;
}

export interface SearchHistoryItem {
  id: string;
  query: SearchQuery;
  timestamp: Date;
  resultCount: number;
  clickedResults?: string[];
}

export interface SearchFilterConfig {
  field: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'range' | 'date';
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface SearchMetrics {
  totalResults: number;
  averageRelevanceScore: number;
  filterEffectiveness: Map<string, number>;
  popularResultTypes: Map<string, number>;
  searchTrends: Array<{
    date: Date;
    searches: number;
    uniqueQueries: number;
  }>;
}
