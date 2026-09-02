import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  disabled,
  ...props 
}) => {
  // ponytail: Functional clay button with pill shape, 44px min touch target, inset+drop dual shadow and press shrink
  const baseStyle = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-[#4F46E5] focus-visible:outline-offset-2 rounded-full touch-target select-none disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[#6366F1] text-white shadow-[0_10px_20px_-10px_rgba(99,102,241,0.10),inset_0_-4px_0_0_rgba(0,0,0,0.02),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(99,102,241,0.25),inset_0_-4px_0_0_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,0.95)] active:scale-[0.97] active:shadow-[0_2px_6px_-1px_rgba(99,102,241,0.15),inset_0_2px_4px_rgba(0,0,0,0.1)]",
    secondary: "bg-white text-[#1F2937] border border-[#E5E7EB] hover:bg-[#F3F4F6] active:scale-[0.98]",
    outline: "border border-[#D1D5DB] text-[#1F2937] bg-transparent hover:bg-white active:scale-[0.98]",
    ghost: "text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F3F4F6] active:scale-[0.98]"
  };
  
  const sizes = {
    sm: "px-4 py-1.5 text-xs min-h-[36px]",
    md: "px-6 py-3 text-base min-h-[44px]",
    lg: "px-8 py-3.5 text-lg min-h-[52px]"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
