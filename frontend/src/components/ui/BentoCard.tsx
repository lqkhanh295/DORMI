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
          'relative overflow-hidden rounded-[24px] bg-background transition-all duration-[400ms]',
          blur && 'bg-background/70 backdrop-blur-[20px] saturate-[180%]',
          hoverEffect && 'hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] cursor-pointer',
          !noPadding && 'p-8 md:p-12',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
