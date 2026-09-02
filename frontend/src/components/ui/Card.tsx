import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => (
  <div 
    // ponytail: Level 2 Soft Clay card with 18px radius, material shadow and subtle highlight
    className={`bg-white rounded-[18px] shadow-clay-soft p-6 transition-all duration-150 hover:-translate-y-[2px] ${className}`} 
    {...props}
  >
    {children}
  </div>
);
