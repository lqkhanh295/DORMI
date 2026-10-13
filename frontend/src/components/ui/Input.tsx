import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', disabled, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-caption font-semibold text-[#0F172A] flex items-center justify-between">
            <span>{label}</span>
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#64748B] pointer-events-none z-10 flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={twMerge(
              clsx(
                "w-full rounded-[12px] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] font-normal min-h-[42px] transition-[border-color,box-shadow,background-color] duration-150 ease-out outline-none",
                error 
                  ? "border-2 border-[#C62828] bg-white focus:ring-2 focus:ring-[#C62828]/20" 
                  : "bg-white border border-[#CBD5E1] shadow-2xs focus:border-[#00153D] focus:ring-2 focus:ring-[#00153D]/10",
                disabled && "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed",
                leftIcon && "pl-10",
                rightIcon && "pr-10",
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#64748B] z-10 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-caption text-[#C62828] font-medium">{error}</p>}
        {helperText && !error && <p className="text-caption text-[#64748B]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
