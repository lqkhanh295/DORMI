import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface AppleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
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
  isLoading = false,
  ...props
}: AppleButtonProps) {
  const baseStyles = 'relative inline-flex items-center justify-center gap-2 rounded-[12px] font-semibold transition-[transform,box-shadow,background-color,border-color,opacity] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[#00153D] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.985]';
  
  const variants = {
    primary: 'btn-clay-primary',
    secondary: 'bg-white text-[#0F172A] border border-[#E2E8F0] shadow-clay-soft hover:shadow-clay-primary hover:border-[#CBD5E1]',
    ghost: 'bg-transparent text-[#64748B] hover:text-[#0F172A] hover:bg-[#EEF2F6]',
    outline: 'bg-transparent border border-[#E2E8F0] text-[#0F172A] hover:bg-white hover:border-[#CBD5E1]',
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
      disabled={disabled || isLoading}
      {...props}
    >
      <span className={clsx('inline-flex items-center justify-center gap-2 transition-opacity duration-150', isLoading && 'opacity-0')}>
        {leftIcon}
        {children}
        {rightIcon}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </span>
      )}
    </button>
  );
}
