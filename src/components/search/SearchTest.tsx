import * as React from 'react';
import { Search } from 'lucide-react';
import { searchEngine } from '@/services/search/search-engine';

export function SearchTest() {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchResults = await searchEngine.search({ text: query });
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-4">Search Test</h2>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Test search..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
      
      {loading && <p>Loading...</p>}
      
      {results && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            Found {results.total} results in {results.responseTime.toFixed(0)}ms
          </p>
          <div className="space-y-2">
            {results.results.map((item: any) => (
              <div key={item.id} className="p-2 border border-gray-200 rounded">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.content}</p>
                <p className="text-xs text-gray-500">Score: {item.relevanceScore.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
