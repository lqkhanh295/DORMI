import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'accent' | 'neutral';
  icon?: React.ReactNode;
  text?: string;
  children?: React.ReactNode;
}

export function Badge({ 
  className = '', 
  variant = 'secondary', 
  icon, 
  text, 
  children,
  ...props 
}: BadgeProps) {
  const variants = {
    primary: 'bg-[#00153D] text-white',
    secondary: 'bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]',
    outline: 'bg-white text-[#0F172A] border border-[#CBD5E1]',
    success: 'bg-[#F0FDF4] text-[#16803C] border border-[#BBF7D0]',
    warning: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
    error: 'bg-[#FEF2F2] text-[#C62828] border border-[#FECACA]',
    accent: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200'
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded-full text-xs font-semibold select-none whitespace-nowrap",
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {text || children}
    </span>
  );
}
