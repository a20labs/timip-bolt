import { useState, useEffect, useCallback } from 'react';
import { SearchInput, SearchConnection, SearchScope, SearchFacets } from '../types/search';
import { searchService } from '../services/searchService';

export function useSearch() {
  const [results, setResults] = useState<SearchConnection | null>(null);
  const [facets, setFacets] = useState<SearchFacets | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (input: SearchInput) => {
    if (!input.query.trim()) {
      setResults(null);
      setFacets(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [searchResults, searchFacets] = await Promise.all([
        searchService.search(input),
        searchService.searchFacets(input.query, input.scopes || [SearchScope.ALL])
      ]);

      setResults(searchResults);
      setFacets(searchFacets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults(null);
      setFacets(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async (input: SearchInput) => {
    if (!results?.pageInfo.hasNextPage || loading) return;

    setLoading(true);
    setError(null);

    try {
      const moreResults = await searchService.search({
        ...input,
        after: results.pageInfo.endCursor
      });

      setResults(prev => prev ? {
        ...moreResults,
        edges: [...prev.edges, ...moreResults.edges]
      } : moreResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more results');
    } finally {
      setLoading(false);
    }
  }, [results, loading]);

  const reset = useCallback(() => {
    setResults(null);
    setFacets(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    results,
    facets,
    loading,
    error,
    search,
    loadMore,
    reset
  };
}