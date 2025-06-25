import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useSearch } from '../../hooks/useSearch';
import { SearchScope, SearchInput } from '../../types/search';
import { SearchResults } from './SearchResults';
import { SearchFacets } from './SearchFacets';

interface SearchScopeOption {
  id: SearchScope;
  label: string;
  count?: number;
}

const SEARCH_SCOPES: SearchScopeOption[] = [
  { id: SearchScope.ALL, label: 'All Results' },
  { id: SearchScope.CATALOG, label: 'My Catalog' },
  { id: SearchScope.RELEASE, label: 'Releases' },
  { id: SearchScope.ARTIST, label: 'Artists' },
  { id: SearchScope.PRODUCT, label: 'Products' },
  { id: SearchScope.POST, label: 'Community' },
];

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeScope, setActiveScope] = useState<SearchScope>(SearchScope.ALL);
  const [showFacets, setShowFacets] = useState(false);
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({});
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const { results, facets, loading, search, loadMore, reset } = useSearch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        reset();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [reset]);

  useEffect(() => {
    if (query.length > 2) {
      const searchInput: SearchInput = {
        query,
        scopes: activeScope === SearchScope.ALL ? Object.values(SearchScope) : [activeScope],
        first: 20
      };
      search(searchInput);
    } else {
      reset();
    }
  }, [query, activeScope, search, reset]);

  const getUserRole = () => {
    if (user?.email === 'artistdemo@truindee.com') return 'artist';
    if (user?.email === 'fandemo@truindee.com') return 'fan';
    return user?.role || 'artist';
  };

  const getFilteredScopes = () => {
    const role = getUserRole();
    if (role === 'fan') {
      return SEARCH_SCOPES.filter(scope => 
        [SearchScope.ALL, SearchScope.ARTIST, SearchScope.PRODUCT, SearchScope.POST].includes(scope.id)
      );
    }
    return SEARCH_SCOPES;
  };

  const handleLoadMore = () => {
    if (results?.pageInfo.hasNextPage) {
      const searchInput: SearchInput = {
        query,
        scopes: activeScope === SearchScope.ALL ? Object.values(SearchScope) : [activeScope],
        first: 20,
        after: results.pageInfo.endCursor
      };
      loadMore(searchInput);
    }
  };

  const handleFacetChange = (field: string, value: string, selected: boolean) => {
    setSelectedFacets(prev => {
      const fieldValues = prev[field] || [];
      if (selected) {
        return { ...prev, [field]: [...fieldValues, value] };
      } else {
        return { ...prev, [field]: fieldValues.filter(v => v !== value) };
      }
    });
  };

  const handleClearAllFacets = () => {
    setSelectedFacets({});
  };

  return (
    <>
      {/* Search Trigger */}
      <div className="relative flex-1 max-w-2xl">
        <div
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-text flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Search className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400 flex-1">
            Search tracks, releases, artists...
          </span>
          <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[80vh] flex flex-col"
            >
              {/* Search Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search everything..."
                  className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setShowFacets(!showFacets)}
                  className={`p-2 rounded-lg transition-colors ${
                    showFacets 
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Search Scopes */}
              <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                {getFilteredScopes().map((scope) => (
                  <button
                    key={scope.id}
                    onClick={() => setActiveScope(scope.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      activeScope === scope.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {scope.label}
                    {scope.count && (
                      <span className="ml-1 opacity-75">({scope.count})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search Content */}
              <div className="flex-1 overflow-hidden flex">
                {/* Results */}
                <div className="flex-1 overflow-y-auto p-4">
                  {loading && query.length <= 2 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : results && results.edges.length > 0 ? (
                    <SearchResults
                      results={results.edges.map(edge => edge.node)}
                      loading={loading}
                      onLoadMore={handleLoadMore}
                      hasNextPage={results.pageInfo.hasNextPage}
                    />
                  ) : query.length > 2 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        No results found for "{query}"
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        Start typing to search...
                      </p>
                      <div className="mt-4 text-xs text-gray-400">
                        <p><strong>Tips:</strong> Search by title, artist, genre, or use filters like "genre:electronic" or "bpm:120-140"</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Facets Sidebar */}
                <AnimatePresence>
                  {showFacets && facets && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="border-l border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="w-70 p-4 overflow-y-auto h-full">
                        <SearchFacets
                          facets={facets}
                          onFacetChange={handleFacetChange}
                          onClearAll={handleClearAllFacets}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}