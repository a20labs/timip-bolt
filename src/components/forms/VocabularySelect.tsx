import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVocabularyContext } from '../../contexts/VocabularyContext';

interface VocabularySelectProps {
  categoryKey: string;
  value?: number | number[];
  onChange: (value: number | number[]) => void;
  placeholder?: string;
  multiple?: boolean;
  locale?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export function VocabularySelect({
  categoryKey,
  value,
  onChange,
  placeholder = 'Select...',
  multiple = false,
  locale = 'en',
  disabled = false,
  error,
  label,
  required = false,
  className = '',
}: VocabularySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { vocabularies, isLoading } = useVocabularyContext();
  
  const options = useMemo(() => {
    const terms = vocabularies[categoryKey] || [];
    return terms.map(term => ({
      value: term.id,
      label: term.label,
      slug: term.slug,
      aliases: term.aliases || [],
    }));
  }, [vocabularies, categoryKey]);

  const selectedValues = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return typeof value === 'number' ? [value] : [];
  }, [value, multiple]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    
    const term = searchTerm.toLowerCase();
    return options.filter(option => 
      option.label.toLowerCase().includes(term) ||
      option.slug.toLowerCase().includes(term) ||
      option.aliases.some(alias => alias.toLowerCase().includes(term))
    );
  }, [options, searchTerm]);

  const selectedLabels = useMemo(() => {
    return options
      .filter(option => selectedValues.includes(option.value))
      .map(option => option.label);
  }, [options, selectedValues]);

  const handleSelect = (optionValue: number) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const handleRemove = (optionValue: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      const newValues = selectedValues.filter(v => v !== optionValue);
      onChange(newValues);
    } else {
      onChange(0);
    }
  };

  const displayValue = () => {
    if (selectedLabels.length === 0) {
      return placeholder;
    }
    if (multiple) {
      return `${selectedLabels.length} selected`;
    }
    return selectedLabels[0];
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-left border rounded-lg bg-white dark:bg-gray-800 
            transition-colors duration-200 flex items-center justify-between
            ${disabled 
              ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed' 
              : error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            }
          `}
        >
          <div className="flex-1 min-w-0">
            {multiple && selectedLabels.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedLabels.slice(0, 3).map((label, index) => {
                  const optionValue = options.find(opt => opt.label === label)?.value;
                  return (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 text-xs rounded"
                    >
                      {label}
                      {!disabled && (
                        <button
                          onClick={(e) => optionValue && handleRemove(optionValue, e)}
                          className="hover:text-primary-600 dark:hover:text-primary-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  );
                })}
                {selectedLabels.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                    +{selectedLabels.length - 3} more
                  </span>
                )}
              </div>
            ) : (
              <span className={selectedLabels.length === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}>
                {displayValue()}
              </span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-hidden"
            >
              {/* Search */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="max-h-48 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredOptions.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                    {searchTerm ? 'No results found' : 'No options available'}
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`
                          w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 
                          flex items-center justify-between transition-colors
                          ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}
                        `}
                      >
                        <div>
                          <div className="font-medium">{option.label}</div>
                          {option.aliases.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Also: {option.aliases.slice(0, 3).join(', ')}
                              {option.aliases.length > 3 && '...'}
                            </div>
                          )}
                        </div>
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}