import { useState, useEffect, useCallback, useRef } from 'react';
import { SearchQuery, SearchResult, SearchFilter, SavedSearch, SearchHistoryItem } from '@/types/search';
import { searchEngine } from '@/services/search/search-engine';

interface UseAdvancedSearchOptions {
  debounceMs?: number;
  enableHistory?: boolean;
  enableAnalytics?: boolean;
  maxHistoryItems?: number;
}

interface UseAdvancedSearchReturn {
  query: SearchQuery;
  setQuery: (query: SearchQuery) => void;
  results: SearchResult | null;
  loading: boolean;
  error: string | null;
  suggestions: string[];
  autocompleteSuggestions: string[];
  searchHistory: SearchHistoryItem[];
  savedSearches: SavedSearch[];
  performSearch: (query?: SearchQuery) => Promise<void>;
  updateFilter: (filter: SearchFilter) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  saveSearch: (name: string) => Promise<void>;
  loadSavedSearch: (savedSearch: SavedSearch) => void;
  deleteSavedSearch: (id: string) => Promise<void>;
  clearHistory: () => void;
  getAnalytics: () => any;
}

export function useAdvancedSearch(options: UseAdvancedSearchOptions = {}): UseAdvancedSearchReturn {
  const {
    debounceMs = 300,
    enableHistory = true,
    enableAnalytics = true,
    maxHistoryItems = 50
  } = options;

  const [query, setQuery] = useState<SearchQuery>({});
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  const debounceRef = useRef<any>();
  const searchAbortRef = useRef<AbortController>();

  // Load saved searches and history from localStorage
  useEffect(() => {
    if (enableHistory) {
      const history = localStorage.getItem('search_history');
      if (history) {
        try {
          setSearchHistory(JSON.parse(history));
        } catch (e) {
          console.error('Failed to load search history:', e);
        }
      }
    }

    const saved = localStorage.getItem('saved_searches');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved searches:', e);
      }
    }
  }, [enableHistory]);

  // Debounced search effect
  useEffect(() => {
    if (query.text || (query.filters && query.filters.length > 0)) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        performSearch();
      }, debounceMs);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query.text, query.filters, debounceMs]);

  // Autocomplete suggestions effect
  useEffect(() => {
    if (query.text && query.text.length >= 2) {
      searchEngine.getAutocompleteSuggestions(query.text).then(setAutocompleteSuggestions);
    } else {
      setAutocompleteSuggestions([]);
    }
  }, [query.text]);

  const performSearch = useCallback(async (searchQuery?: SearchQuery) => {
    const queryToSearch = searchQuery || query;
    
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    searchAbortRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchEngine.search(queryToSearch);
      setResults(searchResults);
      setSuggestions(searchResults.suggestions);

      // Add to search history
      if (enableHistory && (queryToSearch.text || (queryToSearch.filters && queryToSearch.filters.length > 0))) {
        const historyItem: SearchHistoryItem = {
          id: Date.now().toString(),
          query: queryToSearch,
          timestamp: new Date(),
          resultCount: searchResults.total
        };

        setSearchHistory(prev => {
          const updated = [historyItem, ...prev.filter(item => 
            JSON.stringify(item.query) !== JSON.stringify(queryToSearch)
          )].slice(0, maxHistoryItems);
          
          localStorage.setItem('search_history', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [query, enableHistory, maxHistoryItems]);

  const updateFilter = useCallback((filter: SearchFilter) => {
    setQuery(prev => {
      const existingFilterIndex = prev.filters?.findIndex(f => f.field === filter.field);
      
      if (existingFilterIndex !== undefined && existingFilterIndex >= 0) {
        const newFilters = [...(prev.filters || [])];
        newFilters[existingFilterIndex] = filter;
        return { ...prev, filters: newFilters };
      } else {
        return { 
          ...prev, 
          filters: [...(prev.filters || []), filter] 
        };
      }
    });
  }, []);

  const removeFilter = useCallback((field: string) => {
    setQuery(prev => ({
      ...prev,
      filters: prev.filters?.filter(f => f.field !== field) || []
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setQuery(prev => ({ ...prev, filters: [] }));
  }, []);

  const saveSearch = useCallback(async (name: string) => {
    const savedSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query: { ...query },
      createdAt: new Date(),
      useCount: 0
    };

    setSavedSearches(prev => {
      const updated = [...prev, savedSearch];
      localStorage.setItem('saved_searches', JSON.stringify(updated));
      return updated;
    });
  }, [query]);

  const loadSavedSearch = useCallback((savedSearch: SavedSearch) => {
    setQuery(savedSearch.query);
    
    // Update use count
    setSavedSearches(prev => {
      const updated = prev.map(search => 
        search.id === savedSearch.id 
          ? { ...search, lastUsed: new Date(), useCount: search.useCount + 1 }
          : search
      );
      localStorage.setItem('saved_searches', JSON.stringify(updated));
      return updated;
    });

    performSearch(savedSearch.query);
  }, [performSearch]);

  const deleteSavedSearch = useCallback(async (id: string) => {
    setSavedSearches(prev => {
      const updated = prev.filter(search => search.id !== id);
      localStorage.setItem('saved_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('search_history');
  }, []);

  const getAnalytics = useCallback(() => {
    if (enableAnalytics) {
      return searchEngine.getAnalytics();
    }
    return null;
  }, [enableAnalytics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    suggestions,
    autocompleteSuggestions,
    searchHistory,
    savedSearches,
    performSearch,
    updateFilter,
    removeFilter,
    clearFilters,
    saveSearch,
    loadSavedSearch,
    deleteSavedSearch,
    clearHistory,
    getAnalytics
  };
}
