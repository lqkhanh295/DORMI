import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', disabled, ...props }, ref) => {
    // ponytail: Inset Clay input field with soft canvas background and inset shadow depth
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-caption font-semibold text-[#64748B]">{label}</label>}
        <input
          ref={ref}
          disabled={disabled}
          className={`w-full rounded-[12px] ${error ? 'border-2 border-[#C62828] bg-white' : 'shadow-clay-inset bg-[#F5F7FA] border border-[#E2E8F0]'} px-4 py-2.5 text-body text-[#0F172A] placeholder-[#94A3B8] focus:bg-white focus:border-[#00153D] focus:outline-none focus:ring-1 focus:ring-[#00153D] disabled:bg-[#EEF2F6] disabled:text-[#94A3B8] transition-all duration-150 min-h-[44px] ${className}`}
          {...props}
        />
        {error && <p className="text-caption text-[#C62828] font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
