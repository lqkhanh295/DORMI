import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success';
  icon?: React.ReactNode;
  text: string;
}

export function Badge({ className = '', variant = 'secondary', icon, text, ...props }: BadgeProps) {
  const variants = {
    primary: 'bg-primary-50 text-primary-600 border border-primary-100',
    secondary: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
    outline: 'bg-white text-neutral-700 border border-neutral-300',
    success: 'bg-green-50 text-green-600 border border-green-100'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {text}
    </span>
  );
}
