import React from 'react';
import { Input, type InputProps } from './Input';

export interface SoftInputProps extends Omit<InputProps, 'leftIcon'> {
  icon?: React.ReactNode;
}

export const SoftInput = React.forwardRef<HTMLInputElement, SoftInputProps>(
  ({ icon, ...props }, ref) => {
    return <Input ref={ref} leftIcon={icon} {...props} />;
  }
);

SoftInput.displayName = 'SoftInput';
