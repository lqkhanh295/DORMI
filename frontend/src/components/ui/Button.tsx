import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  disabled,
  isLoading = false,
  ...props 
}) => {
  // ponytail: Apple-grade tactile button with explicit GPU transitions and zero layout-shift loader
  const baseStyle = "relative inline-flex items-center justify-center font-semibold transition-[transform,box-shadow,background-color,border-color,opacity] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[#00153D] focus-visible:outline-offset-2 rounded-[12px] touch-target select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.985]";
  
  const variants = {
    primary: "btn-clay-primary",
    secondary: "bg-white text-[#0F172A] border border-[#E2E8F0] shadow-clay-soft hover:shadow-clay-primary hover:border-[#CBD5E1]",
    accent: "bg-[#F2A900] text-[#00153D] font-bold shadow-clay-primary hover:bg-[#E09B00]",
    outline: "border border-[#E2E8F0] text-[#0F172A] bg-transparent hover:bg-white hover:border-[#CBD5E1]",
    ghost: "text-[#64748B] hover:text-[#0F172A] hover:bg-[#EEF2F6]"
  };
  
  const sizes = {
    sm: "px-4 py-1.5 text-caption min-h-[36px]",
    md: "px-6 py-2.5 text-body min-h-[44px]",
    lg: "px-8 py-3.5 text-body min-h-[52px]"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      <span className={`inline-flex items-center justify-center gap-2 transition-opacity duration-150 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </span>
      )}
    </button>
  );
};
