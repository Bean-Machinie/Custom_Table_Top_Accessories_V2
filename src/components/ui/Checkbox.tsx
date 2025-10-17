import { InputHTMLAttributes, forwardRef } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          className={`w-4 h-4 rounded border-border text-primary focus-ring-inset cursor-pointer ${className}`}
          {...props}
        />
        {label && <span className="text-sm text-text select-none">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
