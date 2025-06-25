import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface TaskCardProps {
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate?: string;
  stepsLeft?: number;
  onAction?: () => void;
  actionLabel?: string;
}

export function TaskCard({ 
  title, 
  description, 
  status, 
  dueDate, 
  stepsLeft, 
  onAction, 
  actionLabel 
}: TaskCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'overdue': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      case 'overdue': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'in-progress': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
      default: return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
    }
  };

  return (
    <Card className={`p-4 border-l-4 ${getStatusColor()}`} hover>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {getStatusIcon()}
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {description}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
              {dueDate && <span>Due: {dueDate}</span>}
              {stepsLeft && <span>{stepsLeft} steps left</span>}
            </div>
          </div>
        </div>
        {onAction && (
          <Button variant="ghost" size="sm" onClick={onAction}>
            {actionLabel || 'Continue'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </Card>
  );
}