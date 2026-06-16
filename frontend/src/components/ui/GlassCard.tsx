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
          'relative overflow-hidden rounded-2xl transition-all duration-300',
          'bg-white/10 backdrop-blur-lg border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]',
          'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none',
          !noPadding && 'p-6',
          className
        )
      )}
      {...props}
    >
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
