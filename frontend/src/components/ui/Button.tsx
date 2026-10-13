import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  disabled,
  isLoading = false,
  leftIcon,
  rightIcon,
  ...props 
}, ref) => {
  const baseStyle = "relative inline-flex items-center justify-center font-semibold transition-[transform,box-shadow,background-color,border-color,opacity] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00153D] focus-visible:ring-offset-2 rounded-[12px] touch-target select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.985]";
  
  const variants = {
    primary: "bg-[#00153D] hover:bg-[#073372] text-white shadow-xs hover:shadow-md",
    secondary: "bg-white text-[#0F172A] border border-[#CBD5E1] shadow-xs hover:bg-[#F8FAFC] hover:border-[#94A3B8]",
    accent: "bg-[#F2A900] text-[#00153D] font-bold shadow-xs hover:bg-[#E09B00]",
    outline: "border border-[#CBD5E1] text-[#0F172A] bg-transparent hover:bg-slate-50 hover:border-[#94A3B8]",
    ghost: "text-[#475569] hover:text-[#0F172A] hover:bg-slate-100",
    danger: "bg-[#FEF2F2] text-[#C62828] border border-[#FECACA] hover:bg-[#FEE2E2] hover:border-[#FCA5A5]",
    dark: "bg-[#00153D] hover:bg-[#073372] text-white shadow-xs"
  };
  
  const sizes = {
    sm: "px-3.5 py-1.5 text-xs font-semibold min-h-[36px]",
    md: "px-5 py-2.5 text-sm font-semibold min-h-[42px]",
    lg: "px-7 py-3 text-base font-semibold min-h-[48px]"
  };

  return (
    <button 
      ref={ref}
      disabled={disabled || isLoading}
      className={twMerge(
        clsx(
          baseStyle,
          sizes[size],
          variants[variant],
          fullWidth && "w-full",
          className
        )
      )}
      {...props}
    >
      <span className={clsx("inline-flex items-center justify-center gap-2 transition-opacity duration-150", isLoading && "opacity-0")}>
        {leftIcon}
        {children}
        {rightIcon}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
