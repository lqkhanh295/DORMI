import { forwardRef } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { InputHTMLAttributes, ReactNode } from 'react';

export interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-foreground ml-1">
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
                'w-full h-11 bg-surface border border-line rounded-lg px-4 text-foreground placeholder:text-muted',
                'focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200',
                'disabled:bg-[#eef0e8] disabled:text-muted',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error && 'border-red-500 focus:ring-red-500/10',
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
