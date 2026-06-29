import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => (
  <div className={`bg-white rounded-xl shadow-card overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);
