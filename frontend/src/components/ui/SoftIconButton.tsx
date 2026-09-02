import React from 'react';
import { cn } from './SoftCard';

export interface SoftIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'protruding' | 'carved';
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
}

export const SoftIconButton = React.forwardRef<HTMLButtonElement, SoftIconButtonProps>(
  ({ className, variant = 'protruding', size = 'md', icon, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-[12px] text-[#0F172A] transition-all duration-150 outline-none focus-visible:outline-2 focus-visible:outline-[#00153D] disabled:opacity-50 disabled:pointer-events-none touch-target select-none";
    
    const variants = {
      protruding: "bg-white border border-[#E2E8F0] shadow-clay-soft hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-clay-inset",
      carved: "bg-[#F5F7FA] border border-[#E2E8F0] shadow-clay-inset hover:bg-white active:translate-y-0.5",
    };

    const sizes = {
      sm: "w-10 h-10 min-h-[44px] min-w-[44px]",
      md: "w-12 h-12 min-h-[44px] min-w-[44px]",
      lg: "w-14 h-14 min-h-[44px] min-w-[44px]",
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
