import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
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
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/25 active:scale-[0.99] disabled:opacity-55 disabled:cursor-not-allowed disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-[0_12px_28px_rgba(17,24,39,0.16)] border border-primary',
    secondary: 'bg-surface hover:bg-[#f0f2ea] text-contrast shadow-sm border border-line',
    ghost: 'hover:bg-contrast/5 text-foreground shadow-none border border-transparent',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm border border-red-500',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
