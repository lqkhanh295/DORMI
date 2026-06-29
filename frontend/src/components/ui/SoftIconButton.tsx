import React from 'react';
import { cn } from './SoftCard';

export interface SoftIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'protruding' | 'carved';
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
}

export const SoftIconButton = React.forwardRef<HTMLButtonElement, SoftIconButtonProps>(
  ({ className, variant = 'protruding', size = 'md', icon, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full text-[#4A5568] transition-all duration-300 outline-none focus:ring-2 focus:ring-[#A3B1C6]/50 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      protruding: "bg-soft-bg soft-shadow hover:soft-shadow-hover active:soft-shadow-active active:text-primary",
      carved: "bg-soft-bg soft-shadow-inset hover:bg-soft-bg/90 active:bg-soft-bg/80",
    };

    const sizes = {
      sm: "w-10 h-10 text-xl",
      md: "w-14 h-14 text-2xl",
      lg: "w-16 h-16 text-3xl",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {icon}
      </button>
    );
  }
);
SoftIconButton.displayName = 'SoftIconButton';
