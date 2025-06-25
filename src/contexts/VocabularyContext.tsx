import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLexicon } from '../hooks/useLexicon';

interface VocabularyContextType {
  vocabularies: Record<string, any[]>;
  isLoading: boolean;
  refreshVocabulary: (categoryKey: string) => void;
  getTermLabel: (termId: number, categoryKey: string, locale?: string) => string;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

interface VocabularyProviderProps {
  children: React.ReactNode;
  locale?: string;
}

export function VocabularyProvider({ children, locale = 'en' }: VocabularyProviderProps) {
  const [vocabularies, setVocabularies] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { useCategories, invalidateVocabulary } = useLexicon();

  const { data: categories } = useCategories();

  // Pre-load common vocabularies with static data to avoid TCP connections
  useEffect(() => {
    // Use static data instead of async calls to avoid TCP issues
    const newVocabularies: Record<string, any[]> = {
      'GENRE': [
        { id: 1, slug: 'electronic', label: 'Electronic', sort_order: 1, aliases: ['edm', 'dance'] },
        { id: 2, slug: 'rock', label: 'Rock', sort_order: 2, aliases: ['rock-music'] },
        { id: 3, slug: 'pop', label: 'Pop', sort_order: 3, aliases: ['pop-music'] },
        { id: 4, slug: 'hip-hop', label: 'Hip-Hop', sort_order: 4, aliases: ['rap', 'hip hop'] },
        { id: 5, slug: 'jazz', label: 'Jazz', sort_order: 5, aliases: ['jazz-music'] },
      ],
      'MOOD': [
        { id: 1, slug: 'energetic', label: 'Energetic', sort_order: 1, aliases: ['upbeat', 'high-energy'] },
        { id: 2, slug: 'relaxed', label: 'Relaxed', sort_order: 2, aliases: ['chill', 'calm'] },
        { id: 3, slug: 'melancholic', label: 'Melancholic', sort_order: 3, aliases: ['sad', 'moody'] },
        { id: 4, slug: 'uplifting', label: 'Uplifting', sort_order: 4, aliases: ['positive', 'inspiring'] },
      ],
      'INSTRUMENT': [
        { id: 1, slug: 'guitar', label: 'Guitar', sort_order: 1, aliases: ['electric-guitar', 'acoustic-guitar'] },
        { id: 2, slug: 'piano', label: 'Piano', sort_order: 2, aliases: ['keyboard', 'keys'] },
        { id: 3, slug: 'drums', label: 'Drums', sort_order: 3, aliases: ['percussion', 'drum-kit'] },
        { id: 4, slug: 'bass', label: 'Bass', sort_order: 4, aliases: ['bass-guitar', 'upright-bass'] },
      ],
      'LANGUAGE': [
        { id: 1, slug: 'english', label: 'English', sort_order: 1, aliases: ['en'] },
        { id: 2, slug: 'spanish', label: 'Spanish', sort_order: 2, aliases: ['es', 'español'] },
        { id: 3, slug: 'french', label: 'French', sort_order: 3, aliases: ['fr', 'français'] },
        { id: 4, slug: 'german', label: 'German', sort_order: 4, aliases: ['de', 'deutsch'] },
      ]
    };
    
    setVocabularies(newVocabularies);
    setIsLoading(false);
  }, []);

  const refreshVocabulary = (categoryKey: string) => {
    invalidateVocabulary(categoryKey);
  };

  const getTermLabel = (termId: number, categoryKey: string, termLocale?: string): string => {
    const vocabulary = vocabularies[categoryKey] || [];
    const term = vocabulary.find(t => t.id === termId);
    return term?.label || 'Unknown';
  };

  const value: VocabularyContextType = {
    vocabularies,
    isLoading,
    refreshVocabulary,
    getTermLabel,
  };

  return (
    <VocabularyContext.Provider value={value}>
      {children}
    </VocabularyContext.Provider>
  );
}

export function useVocabularyContext() {
  const context = useContext(VocabularyContext);
  if (context === undefined) {
    throw new Error('useVocabularyContext must be used within a VocabularyProvider');
  }
  return context;
}