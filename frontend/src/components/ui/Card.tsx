import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => (
  <div className={`bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow duration-200 ${className}`} {...props}>
    {children}
  </div>
);
