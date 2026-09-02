import React from 'react';
import { cn } from './SoftCard';

export interface SoftInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

export const SoftInput = React.forwardRef<HTMLInputElement, SoftInputProps>(
  ({ className, icon, error, disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-4 text-[#64748B] pointer-events-none z-10 flex items-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full text-[#0F172A] placeholder-[#94A3B8] font-normal min-h-[44px]",
            "rounded-[12px] px-4 py-2.5 outline-none transition-all duration-150",
            error ? "border-2 border-[#C62828] bg-white" : "shadow-clay-inset bg-[#F5F7FA] border border-[#E2E8F0] focus:bg-white focus:border-[#00153D] focus:ring-1 focus:ring-[#00153D]",
            disabled && "bg-[#EEF2F6] text-[#94A3B8]",
            icon && "pl-11",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
SoftInput.displayName = 'SoftInput';
