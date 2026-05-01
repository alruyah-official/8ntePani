import React from 'react';
import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary: 'bg-accent text-[#0A0A0A] hover:bg-[#bce628] hover:shadow-[0_0_15px_rgba(200,241,53,0.3)] border border-transparent',
  ghost: 'bg-transparent text-text-primary border border-border hover:bg-surface hover:border-muted',
  danger: 'bg-red-600 text-white border border-transparent hover:bg-red-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]',
};

const sizeClasses = {
  sm: 'px-4 py-1.5 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold tracking-wide rounded-full transition-all duration-200 outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-primary disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Only apply scale/lift animations if the button is interactive
  const interactiveClasses = (!disabled && !loading) 
    ? 'transform hover:-translate-y-0.5 active:scale-95' 
    : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${interactiveClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
