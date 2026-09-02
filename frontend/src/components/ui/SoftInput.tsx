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
          <div className="absolute left-4 text-[#6B7280] pointer-events-none z-10 flex items-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full bg-white text-[#1F2937] placeholder-[#9CA3AF] font-normal min-h-[44px]",
            "rounded-[16px] px-4 py-2.5 outline-none transition-all duration-200",
            error ? "border-2 border-[#991B1B]" : "border border-[#D1D5DB] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]",
            disabled && "bg-[#F3F4F6] text-[#6B7280]",
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
