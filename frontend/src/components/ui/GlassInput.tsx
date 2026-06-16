import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-foreground/80 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={twMerge(
              clsx(
                'w-full h-11 bg-white/50 backdrop-blur-md border border-white/40 rounded-xl px-4 text-foreground placeholder:text-foreground/40',
                'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/70 transition-all duration-200',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error && 'border-red-500/50 focus:ring-red-500/50',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-sm text-red-500 ml-1">{error}</span>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
