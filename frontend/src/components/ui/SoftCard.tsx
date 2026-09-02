import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SoftCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function SoftCard({ children, className, padding = 'md', ...props }: SoftCardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-[32px] shadow-[0_20px_40px_-15px_rgba(99,102,241,0.15),inset_0_-8px_0_0_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8)] transition-all duration-200 hover:-translate-y-0.5",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
