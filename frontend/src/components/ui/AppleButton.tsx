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
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-600 text-white',
    secondary: 'bg-background hover:bg-neutral-200 text-foreground',
    ghost: 'bg-transparent hover:bg-black/5 text-primary',
    outline: 'bg-transparent border border-foreground hover:bg-foreground hover:text-white text-foreground',
    dark: 'bg-foreground hover:bg-neutral-800 text-white',
  };

  const sizes = {
    sm: 'h-[28px] px-3 text-[12px]',
    md: 'h-[36px] px-4 text-[14px]', 
    lg: 'h-[44px] px-6 text-[17px]', // Standard Apple CTA size
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
