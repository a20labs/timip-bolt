import React from 'react';
import { VocabularySelect } from './VocabularySelect';

interface MoodSelectProps {
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

export function MoodSelect(props: MoodSelectProps) {
  return (
    <VocabularySelect
      categoryKey="MOOD"
      placeholder="Select mood(s)..."
      label="Mood"
      multiple={true}
      {...props}
    />
  );
}