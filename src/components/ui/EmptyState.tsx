import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'success' | 'warning';
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  variant = 'default'
}: EmptyStateProps) {
  const variants = {
    default: 'text-gray-400',
    success: 'text-green-500',
    warning: 'text-yellow-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <Icon className={`w-16 h-16 mx-auto mb-4 ${variants[variant]}`} />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}