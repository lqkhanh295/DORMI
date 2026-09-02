import type { ReactNode } from 'react';

export interface SectionHeroProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  children?: ReactNode;
  className?: string;
}

export function SectionHero({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  children,
  className = ''
}: SectionHeroProps) {
  return (
    <div className={`flex flex-col ${align === 'center' ? 'items-center text-center' : 'items-start text-left'} ${className}`}>
      {eyebrow && (
        <p className="mb-2 text-caption font-semibold uppercase tracking-widest text-[#64748B]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-h2 text-[#0F172A] mb-4 max-w-[800px]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-body text-[#64748B] max-w-[600px]">
          {subtitle}
        </p>
      )}
      {children && (
        <div className="mt-8 flex flex-wrap gap-4 items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
