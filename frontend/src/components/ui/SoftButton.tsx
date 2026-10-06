import React from 'react';
import { cn } from './SoftCard';
import { Loader2 } from 'lucide-react';

export interface SoftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const SoftButton = React.forwardRef<HTMLButtonElement, SoftButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, isLoading = false, disabled, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center gap-2 rounded-[12px] font-semibold transition-[transform,box-shadow,background-color,border-color,opacity] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[#00153D] focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none min-h-[44px] active:scale-[0.985]";
    
    const variants = {
      primary: "btn-clay-primary",
      secondary: "bg-white text-[#0F172A] border border-[#E2E8F0] shadow-clay-soft hover:shadow-clay-primary hover:border-[#CBD5E1]",
      danger: "bg-[#FEF2F2] text-[#C62828] border border-[#FEF2F2] hover:bg-[#FEE2E2]",
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
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span className={cn('inline-flex items-center justify-center gap-2 transition-opacity duration-150', isLoading && 'opacity-0')}>
          {children}
        </span>
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
          </span>
        )}
      </button>
    );
  }
);
SoftButton.displayName = 'SoftButton';
