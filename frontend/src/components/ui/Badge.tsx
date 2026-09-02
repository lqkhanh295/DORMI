import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
  text: string;
}

export function Badge({ className = '', variant = 'secondary', icon, text, ...props }: BadgeProps) {
  // ponytail: Flat badge with 24px height, 12px radius, no shadow, WCAG contrast colors
  const variants = {
    primary: 'bg-[#EEF2FF] text-[#4F46E5]',
    secondary: 'bg-[#F3F4F6] text-[#4B5563]',
    outline: 'bg-white text-[#1F2937] border border-[#D1D5DB]',
    success: 'bg-[#D1FAE5] text-[#065F46]',
    warning: 'bg-[#FEF3C7] text-[#92400E]',
    error: 'bg-[#FEE2E2] text-[#991B1B]'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 h-[24px] px-2.5 rounded-[12px] text-[12px] font-semibold select-none ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {text}
    </span>
  );
}
