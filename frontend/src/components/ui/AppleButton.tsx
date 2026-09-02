import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface AppleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function AppleButton({
  className,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  children,
  disabled,
  fullWidth,
  ...props
}: AppleButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-[12px] font-semibold transition-all duration-150 focus:outline-none focus-visible:outline-2 focus-visible:outline-[#00153D] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  const variants = {
    primary: 'btn-clay-primary',
    secondary: 'bg-white text-[#0F172A] border border-[#E2E8F0] shadow-clay-soft hover:-translate-y-0.5 active:translate-y-0.5',
    ghost: 'bg-transparent text-[#64748B] hover:text-[#0F172A] hover:bg-[#EEF2F6]',
    outline: 'bg-transparent border border-[#E2E8F0] text-[#0F172A] hover:bg-white active:translate-y-0.5',
    dark: 'btn-clay-primary',
  };

  const sizes = {
    sm: 'min-h-[36px] px-3 text-caption',
    md: 'min-h-[44px] px-4 text-body', 
    lg: 'min-h-[52px] px-6 text-body',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
