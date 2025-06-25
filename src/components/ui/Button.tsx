import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  as?: React.ElementType;
  to?: string;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  children, 
  className = '', 
  disabled,
  as,
  to,
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white',
    ghost: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  // If 'as' prop is provided, render as that component (e.g., Link)
  if (as) {
    const Component = as;
    return (
      <Component
        to={to}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {children}
      </Component>
    );
  }
  
  // If 'to' prop is provided, render as Link
  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {children}
      </Link>
    );
  }
  
  // Otherwise render as button
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </motion.button>
  );
}