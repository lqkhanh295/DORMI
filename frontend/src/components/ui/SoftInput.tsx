import React from 'react';
import { cn } from './SoftCard';

export interface SoftInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const SoftInput = React.forwardRef<HTMLInputElement, SoftInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-4 text-soft-text opacity-70 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-soft-bg text-[#4A5568] placeholder:text-[#4A5568]/50 font-medium",
            "rounded-[20px] px-4 py-3 outline-none transition-all duration-300",
            "soft-shadow-inset focus:ring-2 focus:ring-[#A3B1C6]/50 focus:bg-[#E0E5EC]",
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
