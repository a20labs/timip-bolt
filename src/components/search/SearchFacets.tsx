import React from 'react';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { SearchFacets as SearchFacetsType, FacetValue } from '../../types/search';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface SearchFacetsProps {
  facets: SearchFacetsType;
  onFacetChange: (field: string, value: string, selected: boolean) => void;
  onClearAll: () => void;
}

export function SearchFacets({ facets, onFacetChange, onClearAll }: SearchFacetsProps) {
  const hasSelectedFacets = Object.values(facets).some(facet => 
    facet.values.some(value => value.selected)
  );

  const renderFacetGroup = (title: string, facet: { field: string; values: FacetValue[] }) => (
    <div key={facet.field} className="space-y-3">
      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
        {title}
      </h4>
      <div className="space-y-2">
        {facet.values.map((value) => (
          <label
            key={value.value}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={value.selected || false}
              onChange={(e) => onFacetChange(facet.field, value.value, e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
              {value.value}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500 ml-auto">
              {value.count}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Filters
          </h3>
        </div>
        {hasSelectedFacets && (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {renderFacetGroup('Genre', facets.genre)}
        {renderFacetGroup('Mood', facets.mood)}
        {renderFacetGroup('BPM Range', facets.bpm)}
        {renderFacetGroup('Key', facets.key)}
        {renderFacetGroup('Year', facets.year)}
        {renderFacetGroup('Content Type', facets.type)}
        {renderFacetGroup('Price Range', facets.price)}
      </div>
    </Card>
  );
}