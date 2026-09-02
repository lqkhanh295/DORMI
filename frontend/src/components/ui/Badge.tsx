import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
  text: string;
}

export function Badge({ className = '', variant = 'secondary', icon, text, ...props }: BadgeProps) {
  // ponytail: Badge with rounded-full radius (999px), clear product colors, no gradient
  const variants = {
    primary: 'bg-[#00153D] text-white',
    secondary: 'bg-[#F1F5F9] text-[#0F172A]',
    outline: 'bg-white text-[#0F172A] border border-[#E2E8F0]',
    success: 'bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7]',
    warning: 'bg-[#FEFCE8] text-[#A16207] border border-[#FEF08A]',
    error: 'bg-[#FEF2F2] text-[#C62828] border border-[#FECACA]'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-[24px] px-3 rounded-full text-caption font-medium select-none ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {text}
    </span>
  );
}
