import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function GlassButton({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: GlassButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/50 active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-primary/90 hover:bg-primary text-white shadow-sm backdrop-blur-md border border-white/20',
    secondary: 'bg-white/50 hover:bg-white/70 text-foreground shadow-sm backdrop-blur-md border border-white/40',
    ghost: 'hover:bg-black/5 text-foreground',
    danger: 'bg-red-500/90 hover:bg-red-500 text-white shadow-sm backdrop-blur-md border border-white/20',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-5 text-base',
    lg: 'h-14 px-8 text-lg',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          (disabled || isLoading) && 'opacity-60 cursor-not-allowed active:scale-100',
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}
