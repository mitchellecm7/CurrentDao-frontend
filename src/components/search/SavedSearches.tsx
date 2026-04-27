import React, { useState } from 'react';
import { Bookmark, Trash2, Clock, Star, Plus, X } from 'lucide-react';
import { SavedSearch, SearchQuery } from '@/types/search';

interface SavedSearchesProps {
  savedSearches: SavedSearch[];
  onLoadSearch: (savedSearch: SavedSearch) => void;
  onDeleteSearch: (id: string) => void;
  onSaveSearch: (name: string) => void;
  currentQuery: SearchQuery;
  className?: string;
}

export function SavedSearches({
  savedSearches,
  onLoadSearch,
  onDeleteSearch,
  onSaveSearch,
  currentQuery,
  className = ''
}: SavedSearchesProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');
  const [showAll, setShowAll] = useState(false);

  const handleSaveSearch = () => {
    if (!newSearchName.trim()) return;
    
    // Check if search has any content
    const hasContent = currentQuery.text || (currentQuery.filters && currentQuery.filters.length > 0);
    if (!hasContent) {
      alert('Please enter a search query or add filters before saving.');
      return;
    }

    onSaveSearch(newSearchName.trim());
    setNewSearchName('');
    setShowSaveDialog(false);
  };

  const formatQueryDescription = (query: SearchQuery): string => {
    const parts: string[] = [];
    
    if (query.text) {
      parts.push(`"${query.text}"`);
    }
    
    if (query.filters && query.filters.length > 0) {
      const filterDescriptions = query.filters.map(filter => {
        const label = filter.label || filter.field;
        let value = '';
        
        if (filter.operator === 'range' && Array.isArray(filter.value)) {
          value = `${filter.value[0]}-${filter.value[1]}`;
        } else if (filter.operator === 'in' && Array.isArray(filter.value)) {
          value = filter.value.join(', ');
        } else {
          value = String(filter.value);
        }
        
        return `${label}: ${value}`;
      });
      parts.push(filterDescriptions.join(', '));
    }
    
    return parts.join(' • ') || 'Empty search';
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const isCurrentQuerySaved = (): boolean => {
    return savedSearches.some(search => 
      JSON.stringify(search.query) === JSON.stringify(currentQuery)
    );
  };

  const displayedSearches = showAll ? savedSearches : savedSearches.slice(0, 5);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Saved Searches</h3>
        <div className="flex items-center space-x-2">
          {!isCurrentQuerySaved() && (currentQuery.text || (currentQuery.filters && currentQuery.filters.length > 0)) && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-3 w-3" />
              <span>Save Current</span>
            </button>
          )}
          {savedSearches.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showAll ? 'Show Less' : `Show All (${savedSearches.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Save Search</h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Name
                </label>
                <input
                  type="text"
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  placeholder="e.g., Cheap Solar Energy in California"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-1">Search Preview:</p>
                <p className="text-sm text-gray-600">{formatQueryDescription(currentQuery)}</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveSearch}
                  disabled={!newSearchName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Search
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setNewSearchName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Searches List */}
      {displayedSearches.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Bookmark className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No saved searches yet</p>
          <p className="text-xs mt-1">Save your frequently used searches for quick access</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedSearches.map((savedSearch) => (
            <div
              key={savedSearch.id}
              className="group flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900 truncate">{savedSearch.name}</h4>
                  {savedSearch.isDefault && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {formatQueryDescription(savedSearch.query)}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(savedSearch.createdAt)}
                  </span>
                  {savedSearch.useCount > 0 && (
                    <span className="text-xs text-gray-500">
                      Used {savedSearch.useCount} times
                    </span>
                  )}
                  {savedSearch.lastUsed && (
                    <span className="text-xs text-gray-500">
                      Last used {formatDate(savedSearch.lastUsed)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onLoadSearch(savedSearch)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Load search"
                >
                  <Bookmark className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteSearch(savedSearch.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Delete search"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Stats */}
      {savedSearches.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{savedSearches.length}</p>
              <p className="text-xs text-gray-500">Total Saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {savedSearches.reduce((sum, search) => sum + search.useCount, 0)}
              </p>
              <p className="text-xs text-gray-500">Total Uses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {savedSearches.filter(search => search.lastUsed).length}
              </p>
              <p className="text-xs text-gray-500">Recently Used</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
