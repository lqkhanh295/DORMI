import React from 'react';
import { cn } from './SoftCard';

export interface SoftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const SoftButton = React.forwardRef<HTMLButtonElement, SoftButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-[12px] font-semibold transition-all duration-150 focus:outline-none focus-visible:outline-2 focus-visible:outline-[#00153D] focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none min-h-[44px]";
    
    const variants = {
      primary: "btn-clay-primary",
      secondary: "bg-white text-[#0F172A] border border-[#E2E8F0] shadow-clay-soft hover:-translate-y-0.5 active:translate-y-0.5",
      danger: "bg-[#FEF2F2] text-[#C62828] border border-[#FEF2F2] hover:bg-[#FEE2E2] active:translate-y-0.5",
      ghost: "bg-transparent text-[#64748B] hover:text-[#0F172A] hover:bg-[#EEF2F6]",
    };

    const sizes = {
      sm: "h-9 px-4 text-caption min-h-[36px]",
      md: "min-h-[44px] px-6 text-body",
      lg: "min-h-[52px] px-8 text-body",
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
