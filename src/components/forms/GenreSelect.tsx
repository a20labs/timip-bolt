import React from 'react';
import { VocabularySelect } from './VocabularySelect';

interface GenreSelectProps {
  value?: number | number[];
  onChange: (value: number | number[]) => void;
  multiple?: boolean;
  placeholder?: string;
  locale?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export function GenreSelect(props: GenreSelectProps) {
  return (
    <VocabularySelect
      categoryKey="GENRE"
      placeholder="Select genre(s)..."
      label="Genre"
      {...props}
    />
  );
}