import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { HTMLAttributes, ReactNode } from 'react';

export interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  blur?: boolean;
  hoverEffect?: boolean;
}

export function BentoCard({ 
  children, 
  className, 
  noPadding = false, 
  blur = false,
  hoverEffect = false,
  ...props 
}: BentoCardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'relative overflow-hidden rounded-[32px] bg-white shadow-[0_20px_40px_-15px_rgba(99,102,241,0.15),inset_0_-8px_0_0_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8)] transition-all duration-300',
          blur && 'bg-white/80 backdrop-blur-[20px]',
          hoverEffect && 'hover:-translate-y-0.5 hover:shadow-[0_25px_50px_-12px_rgba(99,102,241,0.2),inset_0_-8px_0_0_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.9)] cursor-pointer',
          !noPadding && 'p-6 md:p-8',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
