import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      className={`
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        rounded-xl shadow-sm hover:shadow-md transition-all duration-200
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}