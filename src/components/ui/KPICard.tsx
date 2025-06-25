import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

export function KPICard({ title, value, change, icon: Icon, trend = 'neutral', loading }: KPICardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600 dark:text-green-400';
      case 'down': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <Card className="p-6" hover>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          {loading ? (
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {value}
            </p>
          )}
          {change && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              {TrendIcon && <TrendIcon className="w-3 h-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
      </div>
    </Card>
  );
}