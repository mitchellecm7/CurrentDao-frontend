import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, Clock, Star, TrendingUp, Filter } from 'lucide-react';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { SearchFilters } from './SearchFilters';
import { SavedSearches } from './SavedSearches';
import { SearchAnalytics } from './SearchAnalytics';
import { SearchableItem } from '@/types/search';

interface AdvancedSearchProps {
  onResultClick?: (item: SearchableItem) => void;
  placeholder?: string;
  showFilters?: boolean;
  showSavedSearches?: boolean;
  showAnalytics?: boolean;
  className?: string;
}

export function AdvancedSearch({
  onResultClick,
  placeholder = 'Search energy trades, DAO proposals, and more...',
  showFilters = true,
  showSavedSearches = true,
  showAnalytics = false,
  className = ''
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
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
  } = useAdvancedSearch({
    debounceMs: 300,
    enableHistory: true,
    enableAnalytics: true
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery({ ...query, text: value });
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allSuggestions = [...autocompleteSuggestions, ...suggestions];
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && allSuggestions[selectedSuggestionIndex]) {
          handleInputChange(allSuggestions[selectedSuggestionIndex]);
          setShowSuggestions(false);
        }
        performSearch();
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange(suggestion);
    setShowSuggestions(false);
    performSearch();
  };

  const handleResultClick = (item: SearchableItem) => {
    onResultClick?.(item);
    setIsExpanded(false);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'energy_trade':
        return '⚡';
      case 'dao_proposal':
        return '🗳️';
      case 'market_data':
        return '📊';
      case 'transaction':
        return '💱';
      case 'user':
        return '👤';
      default:
        return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'energy_trade':
        return 'text-green-600 bg-green-50';
      case 'dao_proposal':
        return 'text-blue-600 bg-blue-50';
      case 'market_data':
        return 'text-purple-600 bg-purple-50';
      case 'transaction':
        return 'text-orange-600 bg-orange-50';
      case 'user':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query.text || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute right-3 flex items-center space-x-2">
            {query.filters && query.filters.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-gray-400 hover:text-gray-600"
                title="Clear filters"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {showFilters && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600"
                title="Toggle filters"
              >
                <Filter className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-12 top-3">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && (autocompleteSuggestions.length > 0 || suggestions.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {autocompleteSuggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-1">Suggestions</div>
                {autocompleteSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                      selectedSuggestionIndex === index ? 'bg-gray-100' : ''
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {suggestions.length > 0 && (
              <div className="p-2 border-t">
                <div className="text-xs font-medium text-gray-500 mb-1">Related searches</div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                      selectedSuggestionIndex === autocompleteSuggestions.length + index ? 'bg-gray-100' : ''
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Search Panel */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-40">
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Filters */}
              {showFilters && (
                <div className="lg:col-span-1">
                  <SearchFilters
                    filters={query.filters || []}
                    onFilterUpdate={updateFilter}
                    onFilterRemove={removeFilter}
                  />
                </div>
              )}

              {/* Results */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {results ? `${results.total} results` : 'Search results'}
                  </h3>
                  {results && (
                    <span className="text-sm text-gray-500">
                      {results.responseTime.toFixed(0)}ms
                    </span>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}

                {results && results.results.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {results.results.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleResultClick(item)}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-lg">{getTypeIcon(item.type)}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(item.type)}`}>
                                {item.type.replace('_', ' ')}
                              </span>
                              <h4 className="font-medium text-gray-900">{item.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(item.timestamp)}
                              </span>
                              {item.metadata.rating && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="text-xs text-gray-500">{item.metadata.rating}</span>
                                </div>
                              )}
                              <span className="text-xs text-gray-500">
                                Score: {item.relevanceScore.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {results && results.results.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No results found</p>
                  </div>
                )}

                {/* Saved Searches */}
                {showSavedSearches && savedSearches.length > 0 && (
                  <div className="mt-6">
                    <SavedSearches
                      savedSearches={savedSearches}
                      onLoadSearch={loadSavedSearch}
                      onDeleteSearch={deleteSavedSearch}
                      onSaveSearch={saveSearch}
                      currentQuery={query}
                    />
                  </div>
                )}

                {/* Search Analytics */}
                {showAnalytics && (
                  <div className="mt-6">
                    <SearchAnalytics analytics={getAnalytics()} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
