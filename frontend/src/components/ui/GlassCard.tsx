import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { HTMLAttributes, ReactNode } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  tone?: 'default' | 'subtle' | 'solid';
}

export function GlassCard({ children, className, noPadding = false, tone = 'default', ...props }: GlassCardProps) {
  const tones = {
    default: 'bg-surface/88 backdrop-blur-xl border border-line/80 shadow-[0_18px_44px_rgba(20,24,18,0.08)]',
    subtle: 'bg-[#f7f8f3]/82 backdrop-blur-lg border border-line/70 shadow-[0_12px_28px_rgba(20,24,18,0.06)]',
    solid: 'bg-surface border border-line shadow-[0_10px_26px_rgba(20,24,18,0.07)]',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'relative overflow-hidden rounded-lg transition-all duration-300',
          tones[tone],
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
