import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', disabled, ...props }, ref) => {
    // ponytail: Form fields stay flat per guidelines (Level 0), border 1px solid #D1D5DB, 16px radius, clear WCAG focus ring
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">{label}</label>}
        <input
          ref={ref}
          disabled={disabled}
          className={`w-full rounded-[16px] border ${error ? 'border-2 border-[#991B1B]' : 'border border-[#D1D5DB]'} bg-white px-4 py-2.5 text-base text-[#1F2937] placeholder-[#9CA3AF] hover:border-[#6366F1] focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1] disabled:bg-[#F3F4F6] disabled:text-[#6B7280] transition-all duration-200 min-h-[44px] ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[#991B1B] font-semibold flex items-center gap-1"><span>⚠️</span> {error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
