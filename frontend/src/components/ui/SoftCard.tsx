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
        "bg-white rounded-[18px] shadow-clay-soft transition-all duration-150 hover:-translate-y-[2px]",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
