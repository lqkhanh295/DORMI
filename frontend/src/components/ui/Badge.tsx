import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'accent' | 'neutral' | 'info';
  icon?: React.ReactNode;
  text?: string;
  children?: React.ReactNode;
}

export function Badge({ 
  className = '', 
  variant = 'neutral', 
  icon, 
  text, 
  children,
  ...props 
}: BadgeProps) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
    outline: 'bg-white text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    error: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    primary: 'bg-[#00153D] text-white',
    accent: 'bg-amber-50 text-amber-800 border border-amber-200'
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium select-none whitespace-nowrap",
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
