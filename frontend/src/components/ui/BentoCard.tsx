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
  hoverEffect = false,
  ...props 
}: BentoCardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'relative overflow-hidden rounded-[18px] bg-white shadow-clay-soft motion-gpu transition-[transform,box-shadow] duration-200 ease-out',
          hoverEffect && 'hover:-translate-y-0.5 hover:shadow-clay-card active:scale-[0.995] cursor-pointer',
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
