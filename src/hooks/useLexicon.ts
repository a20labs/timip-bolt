import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface VocabularyTerm {
  id: number;
  slug: string;
  label: string;
  description?: string;
  sort_order: number;
  aliases: string[];
}

interface LexiconCategory {
  id: number;
  key: string;
  label: string;
  description: string;
  icon: string;
  active: boolean;
}

export function useLexicon() {
  const queryClient = useQueryClient();

  // Get vocabulary for a specific category
  const useVocabulary = (categoryKey: string, locale: string = 'en') => {
    return useQuery({
      queryKey: ['vocabulary', categoryKey, locale],
      queryFn: async (): Promise<VocabularyTerm[]> => {
        // Since we don't have the lexicon schema tables, return mock data for now
        const mockData: VocabularyTerm[] = [];
        
        switch (categoryKey) {
          case 'GENRE':
            return [
              { id: 1, slug: 'electronic', label: 'Electronic', sort_order: 1, aliases: ['edm', 'dance'] },
              { id: 2, slug: 'rock', label: 'Rock', sort_order: 2, aliases: ['rock-music'] },
              { id: 3, slug: 'pop', label: 'Pop', sort_order: 3, aliases: ['pop-music'] },
              { id: 4, slug: 'hip-hop', label: 'Hip-Hop', sort_order: 4, aliases: ['rap', 'hip hop'] },
              { id: 5, slug: 'jazz', label: 'Jazz', sort_order: 5, aliases: ['jazz-music'] },
            ];
          case 'MOOD':
            return [
              { id: 1, slug: 'energetic', label: 'Energetic', sort_order: 1, aliases: ['upbeat', 'high-energy'] },
              { id: 2, slug: 'relaxed', label: 'Relaxed', sort_order: 2, aliases: ['chill', 'calm'] },
              { id: 3, slug: 'melancholic', label: 'Melancholic', sort_order: 3, aliases: ['sad', 'moody'] },
              { id: 4, slug: 'uplifting', label: 'Uplifting', sort_order: 4, aliases: ['positive', 'inspiring'] },
            ];
          case 'INSTRUMENT':
            return [
              { id: 1, slug: 'guitar', label: 'Guitar', sort_order: 1, aliases: ['electric-guitar', 'acoustic-guitar'] },
              { id: 2, slug: 'piano', label: 'Piano', sort_order: 2, aliases: ['keyboard', 'keys'] },
              { id: 3, slug: 'drums', label: 'Drums', sort_order: 3, aliases: ['percussion', 'drum-kit'] },
              { id: 4, slug: 'bass', label: 'Bass', sort_order: 4, aliases: ['bass-guitar', 'upright-bass'] },
            ];
          case 'LANGUAGE':
            return [
              { id: 1, slug: 'english', label: 'English', sort_order: 1, aliases: ['en'] },
              { id: 2, slug: 'spanish', label: 'Spanish', sort_order: 2, aliases: ['es', 'español'] },
              { id: 3, slug: 'french', label: 'French', sort_order: 3, aliases: ['fr', 'français'] },
              { id: 4, slug: 'german', label: 'German', sort_order: 4, aliases: ['de', 'deutsch'] },
            ];
          default:
            return mockData;
        }
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
      enabled: !!categoryKey,
    });
  };

  // Get all categories
  const useCategories = () => {
    return useQuery({
      queryKey: ['lexicon-categories'],
      queryFn: async (): Promise<LexiconCategory[]> => {
        // Return mock categories since we don't have the lexicon schema
        return [
          {
            id: 1,
            key: 'GENRE',
            label: 'Genres',
            description: 'Musical genres and styles',
            icon: 'music',
            active: true
          },
          {
            id: 2,
            key: 'MOOD',
            label: 'Moods',
            description: 'Emotional characteristics of music',
            icon: 'heart',
            active: true
          },
          {
            id: 3,
            key: 'INSTRUMENT',
            label: 'Instruments',
            description: 'Musical instruments',
            icon: 'guitar',
            active: true
          },
          {
            id: 4,
            key: 'LANGUAGE',
            label: 'Languages',
            description: 'Vocal languages',
            icon: 'globe',
            active: true
          }
        ];
      },
      staleTime: 1000 * 60 * 30, // 30 minutes
    });
  };

  // Search terms by alias
  const searchByAlias = useMutation({
    mutationFn: async ({ alias, categoryKey }: { alias: string; categoryKey?: string }) => {
      // Mock implementation for searching by alias
      const allCategories = ['GENRE', 'MOOD', 'INSTRUMENT', 'LANGUAGE'];
      const categoriesToSearch = categoryKey ? [categoryKey] : allCategories;
      
      const mockResults: Record<string, any[]> = {
        'GENRE': [
          { id: 1, slug: 'electronic', label: 'Electronic', aliases: ['edm', 'dance'] },
          { id: 2, slug: 'rock', label: 'Rock', aliases: ['rock-music'] },
          { id: 3, slug: 'pop', label: 'Pop', aliases: ['pop-music'] },
          { id: 4, slug: 'hip-hop', label: 'Hip-Hop', aliases: ['rap', 'hip hop'] },
          { id: 5, slug: 'jazz', label: 'Jazz', aliases: ['jazz-music'] },
        ],
        'MOOD': [
          { id: 1, slug: 'energetic', label: 'Energetic', aliases: ['upbeat', 'high-energy'] },
          { id: 2, slug: 'relaxed', label: 'Relaxed', aliases: ['chill', 'calm'] },
          { id: 3, slug: 'melancholic', label: 'Melancholic', aliases: ['sad', 'moody'] },
          { id: 4, slug: 'uplifting', label: 'Uplifting', aliases: ['positive', 'inspiring'] },
        ],
        'INSTRUMENT': [
          { id: 1, slug: 'guitar', label: 'Guitar', aliases: ['electric-guitar', 'acoustic-guitar'] },
          { id: 2, slug: 'piano', label: 'Piano', aliases: ['keyboard', 'keys'] },
          { id: 3, slug: 'drums', label: 'Drums', aliases: ['percussion', 'drum-kit'] },
          { id: 4, slug: 'bass', label: 'Bass', aliases: ['bass-guitar', 'upright-bass'] },
        ],
        'LANGUAGE': [
          { id: 1, slug: 'english', label: 'English', aliases: ['en'] },
          { id: 2, slug: 'spanish', label: 'Spanish', aliases: ['es', 'español'] },
          { id: 3, slug: 'french', label: 'French', aliases: ['fr', 'français'] },
          { id: 4, slug: 'german', label: 'German', aliases: ['de', 'deutsch'] },
        ]
      };
      
      for (const cat of categoriesToSearch) {
        const terms = mockResults[cat] || [];
        
        const foundTerm = terms.find(term => 
          term.aliases.some((a: string) => a.toLowerCase() === alias.toLowerCase()) ||
          term.slug.toLowerCase() === alias.toLowerCase() ||
          term.label.toLowerCase() === alias.toLowerCase()
        );
        
        if (foundTerm) {
          return foundTerm;
        }
      }
      
      return null;
    },
  });

  // Get term label with locale fallback
  const getTermLabel = async (termId: number, locale: string = 'en'): Promise<string> => {
    // Mock implementation with hardcoded values
    const mockLabels: Record<number, Record<string, string>> = {
      1: { en: 'Electronic', es: 'Electrónica' },
      2: { en: 'Rock', es: 'Rock' },
      3: { en: 'Pop', es: 'Pop' },
      4: { en: 'Hip-Hop', es: 'Hip-Hop' },
      5: { en: 'Jazz', es: 'Jazz' },
    };
    
    return mockLabels[termId]?.[locale] || mockLabels[termId]?.['en'] || 'Unknown';
  };

  // Invalidate vocabulary cache (for real-time updates)
  const invalidateVocabulary = (categoryKey?: string) => {
    if (categoryKey) {
      queryClient.invalidateQueries({ queryKey: ['vocabulary', categoryKey] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    }
  };

  return {
    useVocabulary,
    useCategories,
    searchByAlias,
    getTermLabel,
    invalidateVocabulary,
  };
}

// Hook for form components to get vocabulary options
export function useVocabularyOptions(categoryKey: string, locale?: string) {
  const { useVocabulary } = useLexicon();
  const { data: terms = [], isLoading } = useVocabulary(categoryKey, locale);

  const options = terms.map(term => ({
    value: term.id,
    label: term.label,
    slug: term.slug,
    aliases: term.aliases,
  }));

  return { options, isLoading };
}

// Hook for getting localized labels
export function useLocalizedLabels(termIds: number[], locale?: string) {
  const { getTermLabel } = useLexicon();

  return useQuery({
    queryKey: ['localized-labels', termIds, locale],
    queryFn: async () => {
      const labels: Record<number, string> = {};
      
      // Use hardcoded values instead of async calls to avoid TCP issues
      const mockLabels: Record<number, Record<string, string>> = {
        1: { en: 'Electronic', es: 'Electrónica' },
        2: { en: 'Rock', es: 'Rock' },
        3: { en: 'Pop', es: 'Pop' },
        4: { en: 'Hip-Hop', es: 'Hip-Hop' },
        5: { en: 'Jazz', es: 'Jazz' },
      };
      
      for (const id of termIds) {
        labels[id] = mockLabels[id]?.[locale || 'en'] || mockLabels[id]?.['en'] || 'Unknown';
      }
      
      return labels;
    },
    enabled: termIds.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}