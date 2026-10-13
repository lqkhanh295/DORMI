import type { ReactNode, HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  variant?: 'bordered' | 'elevated' | 'flat' | 'interactive';
  interactive?: boolean;
}

export const Card = ({ 
  children, 
  variant = 'bordered', 
  interactive = false, 
  className = '', 
  ...props 
}: CardProps) => {
  const isInteractive = interactive || variant === 'interactive';

  const variantStyles = {
    bordered: "bg-white border border-[#E2E8F0] rounded-[18px] shadow-xs",
    elevated: "bg-white border border-[#E2E8F0] rounded-[18px] shadow-sm",
    flat: "bg-[#F1F5F9] border border-transparent rounded-[18px]",
    interactive: "bg-white border border-[#E2E8F0] rounded-[18px] shadow-xs transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-[#CBD5E1] active:scale-[0.995] cursor-pointer motion-gpu",
  };

  const interactiveStyles = isInteractive && variant !== 'interactive' 
    ? "transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-[#CBD5E1] active:scale-[0.995] cursor-pointer motion-gpu" 
    : "";

  return (
    <div 
      className={`${variantStyles[variant]} p-6 ${interactiveStyles} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};
