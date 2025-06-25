import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Globe,
  Tag,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  Upload,
  Download,
  History
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Category {
  id: number;
  key: string;
  label: string;
  description: string;
  icon: string;
  sort_order: number;
  active: boolean;
  term_count?: number;
}

interface Term {
  id: number;
  category_id: number;
  slug: string;
  default_label: string;
  description: string;
  status: 'ACTIVE' | 'DEPRECATED' | 'PENDING';
  sort_order: number;
  metadata: Record<string, any>;
  translations?: Translation[];
  aliases?: Alias[];
}

interface Translation {
  term_id: number;
  locale: string;
  label: string;
  description: string;
}

interface Alias {
  term_id: number;
  alias: string;
  locale: string;
}

interface ChangelogEntry {
  id: string;
  actor_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: any;
  new_values: any;
  created_at: string;
}

export function LexiconManager() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTermModal, setShowTermModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [showTranslations, setShowTranslations] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'categories' | 'terms' | 'changelog'>('categories');
  
  const queryClient = useQueryClient();

  // Mock data for demonstration since lexicon schema doesn't exist
  const mockCategories: Category[] = [
    {
      id: 1,
      key: 'GENRE',
      label: 'Genres',
      description: 'Musical genres and styles',
      icon: 'music',
      sort_order: 1,
      active: true,
      term_count: 5
    },
    {
      id: 2,
      key: 'MOOD',
      label: 'Moods',
      description: 'Emotional characteristics of music',
      icon: 'heart',
      sort_order: 2,
      active: true,
      term_count: 4
    },
    {
      id: 3,
      key: 'INSTRUMENT',
      label: 'Instruments',
      description: 'Musical instruments',
      icon: 'guitar',
      sort_order: 3,
      active: true,
      term_count: 4
    },
    {
      id: 4,
      key: 'LANGUAGE',
      label: 'Languages',
      description: 'Vocal languages',
      icon: 'globe',
      sort_order: 4,
      active: true,
      term_count: 4
    }
  ];

  const mockTerms: Record<number, Term[]> = {
    1: [ // GENRE
      {
        id: 1,
        category_id: 1,
        slug: 'electronic',
        default_label: 'Electronic',
        description: 'Electronic dance music and related genres',
        status: 'ACTIVE',
        sort_order: 1,
        metadata: {},
        aliases: [{ term_id: 1, alias: 'EDM', locale: 'en' }, { term_id: 1, alias: 'Dance', locale: 'en' }]
      },
      {
        id: 2,
        category_id: 1,
        slug: 'rock',
        default_label: 'Rock',
        description: 'Rock music and its subgenres',
        status: 'ACTIVE',
        sort_order: 2,
        metadata: {},
        aliases: [{ term_id: 2, alias: 'Rock Music', locale: 'en' }]
      }
    ],
    2: [ // MOOD
      {
        id: 3,
        category_id: 2,
        slug: 'energetic',
        default_label: 'Energetic',
        description: 'High-energy, upbeat music',
        status: 'ACTIVE',
        sort_order: 1,
        metadata: {},
        aliases: [{ term_id: 3, alias: 'Upbeat', locale: 'en' }, { term_id: 3, alias: 'High Energy', locale: 'en' }]
      }
    ]
  };

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['lexicon-categories'],
    queryFn: async (): Promise<Category[]> => {
      // Return mock data since we don't have the lexicon schema
      return mockCategories;
    },
  });

  // Fetch terms for selected category
  const { data: terms, isLoading: termsLoading } = useQuery({
    queryKey: ['lexicon-terms', selectedCategory?.id],
    queryFn: async (): Promise<Term[]> => {
      if (!selectedCategory) return [];
      // Return mock data for the selected category
      return mockTerms[selectedCategory.id] || [];
    },
    enabled: !!selectedCategory,
  });

  // Fetch changelog
  const { data: changelog } = useQuery({
    queryKey: ['lexicon-changelog'],
    queryFn: async (): Promise<ChangelogEntry[]> => {
      // Return mock changelog data
      return [
        {
          id: '1',
          actor_id: 'user-1',
          action: 'CREATE',
          resource_type: 'term',
          resource_id: '1',
          old_values: null,
          new_values: { label: 'Electronic' },
          created_at: new Date().toISOString()
        }
      ];
    },
    enabled: activeTab === 'changelog',
  });

  // Create/Update term mutation
  const termMutation = useMutation({
    mutationFn: async (termData: Partial<Term>) => {
      // Mock implementation - in real app this would call Supabase
      console.log('Saving term:', termData);
      return termData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lexicon-terms'] });
      queryClient.invalidateQueries({ queryKey: ['lexicon-categories'] });
      setShowTermModal(false);
      setEditingTerm(null);
    },
  });

  // Delete term mutation
  const deleteMutation = useMutation({
    mutationFn: async (termId: number) => {
      // Mock implementation - in real app this would call Supabase
      console.log('Deleting term:', termId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lexicon-terms'] });
      queryClient.invalidateQueries({ queryKey: ['lexicon-categories'] });
    },
  });

  const handleEditTerm = (term: Term) => {
    setEditingTerm(term);
    setShowTermModal(true);
  };

  const handleDeleteTerm = (termId: number) => {
    if (confirm('Are you sure you want to delete this term?')) {
      deleteMutation.mutate(termId);
    }
  };

  const toggleTranslations = (termId: number) => {
    setShowTranslations(prev => ({
      ...prev,
      [termId]: !prev[termId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'DEPRECATED':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const filteredTerms = terms?.filter(term =>
    term.default_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.aliases?.some(alias => alias.alias.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lexicon Manager
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage controlled vocabularies and translations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'categories', name: 'Categories', icon: Tag },
          { id: 'terms', name: 'Terms', icon: Globe },
          { id: 'changelog', name: 'Changelog', icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            categories?.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
              >
                <Card 
                  className="p-6 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => {
                    setSelectedCategory(category);
                    setActiveTab('terms');
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                      <Tag className="w-6 h-6 text-primary-600" />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {category.term_count || 0} terms
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {category.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {category.key}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Terms Tab */}
      {activeTab === 'terms' && (
        <div className="space-y-6">
          {selectedCategory ? (
            <>
              {/* Category Header */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedCategory(null)}
                    >
                      ← Back to Categories
                    </Button>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedCategory.label}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedCategory.description}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setShowTermModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Term
                  </Button>
                </div>
              </Card>

              {/* Search and Filters */}
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search terms, slugs, or aliases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      icon={<Search className="w-4 h-4" />}
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </Card>

              {/* Terms List */}
              <div className="space-y-4">
                {termsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  filteredTerms.map((term) => (
                    <Card key={term.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {term.default_label}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(term.status)}`}>
                              {term.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <span>Slug: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{term.slug}</code></span>
                            <span>Order: {term.sort_order}</span>
                          </div>

                          {term.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              {term.description}
                            </p>
                          )}

                          {/* Aliases */}
                          {term.aliases && term.aliases.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Aliases:</span>
                              {term.aliases.map((alias, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded"
                                >
                                  {alias.alias}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Translations Toggle */}
                          {term.translations && term.translations.length > 0 && (
                            <button
                              onClick={() => toggleTranslations(term.id)}
                              className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                            >
                              {showTranslations[term.id] ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              {term.translations.length} translations
                            </button>
                          )}

                          {/* Translations */}
                          {showTranslations[term.id] && term.translations && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {term.translations.map((translation) => (
                                  <div key={translation.locale} className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-8">
                                      {translation.locale}
                                    </span>
                                    <span className="text-sm text-gray-900 dark:text-white">
                                      {translation.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTerm(term)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTerm(term.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          ) : (
            <Card className="p-8 text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Select a Category
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a category from the Categories tab to manage its terms.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Changelog Tab */}
      {activeTab === 'changelog' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Changes
          </h3>
          <div className="space-y-4">
            {changelog?.map((entry) => (
              <div key={entry.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {entry.action}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {entry.resource_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Term Modal */}
      {showTermModal && (
        <TermModal
          term={editingTerm}
          categoryId={selectedCategory?.id}
          onClose={() => {
            setShowTermModal(false);
            setEditingTerm(null);
          }}
          onSave={(termData) => termMutation.mutate(termData)}
          isLoading={termMutation.isPending}
        />
      )}
    </div>
  );
}

// Term Modal Component
interface TermModalProps {
  term?: Term | null;
  categoryId?: number;
  onClose: () => void;
  onSave: (termData: Partial<Term>) => void;
  isLoading: boolean;
}

function TermModal({ term, categoryId, onClose, onSave, isLoading }: TermModalProps) {
  const [formData, setFormData] = useState({
    slug: term?.slug || '',
    default_label: term?.default_label || '',
    description: term?.description || '',
    status: term?.status || 'ACTIVE',
    sort_order: term?.sort_order || 999,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: term?.id,
      category_id: categoryId,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {term ? 'Edit Term' : 'Add Term'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="e.g., hip-hop"
            required
          />

          <Input
            label="Default Label"
            value={formData.default_label}
            onChange={(e) => setFormData(prev => ({ ...prev, default_label: e.target.value }))}
            placeholder="e.g., Hip-Hop"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="DEPRECATED">Deprecated</option>
              </select>
            </div>

            <Input
              label="Sort Order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 999 }))}
              placeholder="999"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {term ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}