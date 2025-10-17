import { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, children, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full h-9 px-3 py-2 bg-surface border border-border rounded-token-md text-text focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
