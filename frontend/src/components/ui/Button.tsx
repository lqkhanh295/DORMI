import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
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
  // ponytail: Functional Clay button with 12px radius, top highlight and tactile press depth
  const baseStyle = "inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus-visible:outline-2 focus-visible:outline-[#00153D] focus-visible:outline-offset-2 rounded-[12px] touch-target select-none disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "btn-clay-primary",
    secondary: "bg-white text-[#0F172A] border border-[#E2E8F0] shadow-clay-soft hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-clay-inset",
    accent: "bg-[#F2A900] text-[#00153D] font-bold shadow-clay-primary hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-clay-inset",
    outline: "border border-[#E2E8F0] text-[#0F172A] bg-transparent hover:bg-white active:translate-y-0.5",
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
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
