import type { ReactNode } from 'react';

export interface SectionHeroProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  dark?: boolean;
  align?: 'center' | 'left';
  children?: ReactNode; // For buttons/links below the text
  className?: string;
}

export function SectionHero({
  eyebrow,
  title,
  subtitle,
  dark = false,
  align = 'center',
  children,
  className = ''
}: SectionHeroProps) {
  const textColor = dark ? 'text-[#F5F5F7]' : 'text-[#1D1D1F]';
  const subtitleColor = dark ? 'text-[#A1A1A6]' : 'text-[#6E6E73]';
  const eyebrowColor = dark ? 'text-[#A1A1A6]' : 'text-[#86868B]';

  return (
    <div className={`flex flex-col ${align === 'center' ? 'items-center text-center' : 'items-start text-left'} ${className}`}>
      {eyebrow && (
        <p className={`mb-2 text-[14px] font-semibold uppercase tracking-widest ${eyebrowColor}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`typography-headline ${textColor} mb-4 max-w-[800px]`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`typography-subhead ${subtitleColor} max-w-[600px]`}>
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
