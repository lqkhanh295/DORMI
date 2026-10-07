import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => (
  <div 
    // ponytail: Level 2 Soft Clay card with 18px radius, GPU-accelerated hover and active feedback
    className={`bg-white rounded-[18px] shadow-clay-soft p-6 motion-gpu transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-clay-card active:scale-[0.995] ${className}`} 
    {...props}
  >
    {children}
  </div>
);
