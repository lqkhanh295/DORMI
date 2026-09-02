import React from 'react';
import { cn } from './SoftCard';

export interface SoftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const SoftButton = React.forwardRef<HTMLButtonElement, SoftButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
    // ponytail: Functional clay button with pill shape, Level 1 clay shadow for primary, touch target >= 44px
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-[#4F46E5] focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none";
    
    const variants = {
      primary: "bg-[#6366F1] text-white shadow-[0_10px_20px_-10px_rgba(99,102,241,0.10),inset_0_-4px_0_0_rgba(0,0,0,0.02),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(99,102,241,0.25),inset_0_-4px_0_0_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,0.95)] active:scale-[0.97] active:shadow-[0_2px_6px_-1px_rgba(99,102,241,0.15),inset_0_2px_4px_rgba(0,0,0,0.1)]",
      secondary: "bg-white text-[#1F2937] border border-[#E5E7EB] hover:bg-[#F3F4F6] active:scale-[0.98]",
      danger: "bg-[#FEE2E2] text-[#991B1B] border border-[#FEE2E2] hover:bg-[#FCA5A5]/30 active:scale-[0.98]",
      ghost: "bg-transparent text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F3F4F6] active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs min-h-[36px]",
      md: "min-h-[44px] px-6 text-base",
      lg: "min-h-[52px] px-8 text-lg",
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
