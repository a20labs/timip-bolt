import React from 'react';
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
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-3xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#35A764] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#35A764] hover:bg-[#2a8a54] text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-transparent border border-[#35A764] text-[#35A764] hover:bg-[#35A764] hover:text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-[#35A764] text-[#35A764] hover:bg-[#35A764] hover:text-white',
    ghost: 'text-[#F0F0F1] hover:text-white hover:bg-white/10',
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
    const componentProps = {
      className: classes,
      disabled: disabled || loading,
      to
    };
    
    return (
      <Component
        {...componentProps}
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
    const linkProps = {
      to,
      className: classes
    };
    
    return (
      <Link {...linkProps}>
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {children}
      </Link>
    );
  }
  
  // Otherwise render as button  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
}