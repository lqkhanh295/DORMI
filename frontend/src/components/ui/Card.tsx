import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => (
  <div 
    // ponytail: Functional clay container card with 32px radius, level 2 clay shadow and hover lift
    className={`bg-white rounded-[32px] p-6 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.15),inset_0_-8px_0_0_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8)] transition-all duration-200 hover:-translate-y-0.5 focus-within:outline focus-within:outline-2 focus-within:outline-[#6366F1] focus-within:outline-offset-4 ${className}`} 
    {...props}
  >
    {children}
  </div>
);
