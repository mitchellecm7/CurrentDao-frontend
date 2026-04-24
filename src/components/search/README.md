# Advanced Search & Filtering System

This directory contains the comprehensive search and filtering system for the CurrentDao energy trading platform. The system provides intelligent discovery capabilities with full-text search, advanced filtering, saved searches, and search analytics.

## Components

### AdvancedSearch
The main search component that provides:
- Real-time search with debouncing
- Autocomplete suggestions
- Search result display with ranking
- Integration with filters and saved searches
- Responsive design with keyboard navigation

### SearchFilters
Advanced filtering component that supports:
- Multiple filter types (text, number, range, select, date)
- Collapsible filter categories
- Quick filter presets
- Active filter management
- Custom filter operators

### SavedSearches
Search persistence component that provides:
- Save current searches with custom names
- Load saved searches instantly
- Search usage analytics
- Search history management
- Persistent storage via localStorage

### SearchAnalytics
Analytics dashboard that shows:
- Search performance metrics
- Popular search queries
- Filter usage patterns
- Result engagement analytics
- Performance recommendations

## Core Services

### SearchEngine (`src/services/search/search-engine.ts`)
The core search service that provides:
- Full-text search with inverted indexing
- Advanced filtering capabilities
- Real-time search performance (< 500ms)
- Search analytics collection
- Autocomplete suggestions

### RankingAlgorithm (`src/utils/search/ranking-algorithm.ts`)
Sophisticated ranking system that considers:
- Text relevance scoring
- Recency boosts
- Rating and popularity factors
- Type-specific scoring
- Filter match relevance

### useAdvancedSearch (`src/hooks/useAdvancedSearch.ts`)
React hook that provides:
- Debounced search with cancellation
- Search history management
- Saved search persistence
- Error handling and loading states
- Analytics integration

## Features

### Full-Text Search
- Inverted index for fast text search
- Word-level matching and ranking
- Support for partial matches
- Search suggestions and autocomplete

### Advanced Filtering
- Multiple filter operators (equals, contains, greater_than, less_than, in, range)
- Filter combinations with AND logic
- Real-time filter updates
- Quick filter presets

### Saved Searches
- Persistent storage via localStorage
- Usage tracking and analytics
- Quick access to frequently used searches
- Search history management

### Search Analytics
- Performance monitoring
- Query pattern analysis
- Filter usage tracking
- Result engagement metrics
- Actionable recommendations

## Performance

The search system is optimized for performance:
- **Search Response Time**: < 500ms average
- **Indexing**: Efficient inverted index structure
- **Debouncing**: 300ms default debounce time
- **Caching**: Result caching for repeated queries
- **Lazy Loading**: Components load on demand

## Usage

### Basic Search
```tsx
import { AdvancedSearch } from '@/components/search/AdvancedSearch';

<AdvancedSearch
  onResultClick={handleResultClick}
  placeholder="Search energy trades..."
  showFilters={true}
  showSavedSearches={true}
/>
```

### Advanced Usage with Hook
```tsx
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';

const {
  query,
  setQuery,
  results,
  loading,
  performSearch,
  updateFilter,
  saveSearch
} = useAdvancedSearch({
  debounceMs: 300,
  enableHistory: true,
  enableAnalytics: true
});
```

### Custom Filtering
```tsx
const handleFilterUpdate = (filter) => {
  updateFilter({
    field: 'price',
    operator: 'range',
    value: [0.05, 0.15],
    label: 'Price Range'
  });
};
```

## Data Types

### SearchableItem
```typescript
interface SearchableItem {
  id: string;
  type: 'energy_trade' | 'dao_proposal' | 'user' | 'transaction' | 'market_data';
  title: string;
  content: string;
  metadata: Record<string, any>;
  tags: string[];
  timestamp: Date;
  relevanceScore: number;
}
```

### SearchQuery
```typescript
interface SearchQuery {
  text?: string;
  filters?: SearchFilter[];
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'rating' | 'price';
  sortOrder?: 'asc' | 'desc';
}
```

### SearchFilter
```typescript
interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'range';
  value: any;
  label?: string;
}
```

## Configuration

### Search Engine Configuration
The search engine can be configured with:
- Custom indexing strategies
- Performance tuning parameters
- Analytics collection settings
- Result ranking weights

### Filter Configuration
Filters are configured via `SearchFilterConfig`:
```typescript
interface SearchFilterConfig {
  field: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'range' | 'date';
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}
```

## Integration

### With Existing Components
The search system integrates seamlessly with:
- Map components (location-based filtering)
- Energy trading components (trade discovery)
- DAO components (proposal search)
- Analytics components (performance tracking)

### Data Sources
The search engine can index data from:
- Energy trading listings
- DAO proposals
- Market data
- User profiles
- Transaction records
- Historical data

## Testing

### Unit Tests
- Search engine functionality
- Ranking algorithm accuracy
- Filter logic validation
- Component behavior testing

### Performance Tests
- Search response time benchmarks
- Large dataset handling
- Memory usage optimization
- Concurrent search testing

## Future Enhancements

### Planned Features
- Semantic search capabilities
- Machine learning ranking improvements
- Voice search integration
- Advanced analytics dashboards
- Search result personalization

### Scalability
- Distributed search indexing
- Real-time data synchronization
- Advanced caching strategies
- Performance optimization at scale

## Troubleshooting

### Common Issues
1. **Slow Search Performance**: Check indexing and consider cache optimization
2. **Poor Result Quality**: Adjust ranking algorithm weights
3. **Filter Not Working**: Verify filter configuration and data types
4. **Saved Searches Lost**: Check localStorage availability and permissions

### Debug Tools
- Search analytics dashboard
- Performance monitoring
- Query logging
- Result ranking analysis

## Contributing

When contributing to the search system:
1. Follow the established component patterns
2. Add appropriate TypeScript types
3. Include comprehensive tests
4. Update documentation
5. Consider performance implications

## License

This search system is part of the CurrentDao project and follows the same licensing terms.
