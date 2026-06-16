import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function GlassCard({ children, className, noPadding = false, ...props }: GlassCardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'glass-panel overflow-hidden transition-all duration-300',
          !noPadding && 'p-6',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
