import React from 'react';
import { cn } from './SoftCard';

export interface SoftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const SoftButton = React.forwardRef<HTMLButtonElement, SoftButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-3 rounded-[20px] font-medium text-[#4A5568] transition-all duration-200 outline-none focus:ring-2 focus:ring-[#A3B1C6]/50 disabled:opacity-50 disabled:pointer-events-none active:soft-shadow-active active:text-primary";
    
    const variants = {
      primary: "bg-primary text-white hover:text-white soft-shadow hover:soft-shadow-hover shadow-primary/30 active:text-white/90",
      secondary: "bg-soft-bg text-soft-text soft-shadow hover:soft-shadow-hover",
      danger: "bg-danger text-white hover:text-white soft-shadow hover:soft-shadow-hover shadow-danger/30 active:text-white/90",
      ghost: "bg-transparent text-soft-text hover:bg-black/5 active:bg-black/10",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SoftButton.displayName = 'SoftButton';
