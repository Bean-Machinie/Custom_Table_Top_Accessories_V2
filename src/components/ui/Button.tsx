import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-primary text-white hover:bg-primary-hover',
      secondary: 'bg-surface border border-border text-text hover:bg-border-subtle',
      ghost: 'text-text-secondary hover:bg-border-subtle hover:text-text',
    };

    const sizeStyles = {
      sm: 'h-7 px-2 text-xs rounded-token-sm',
      md: 'h-9 px-3 text-sm rounded-token-md',
      lg: 'h-11 px-4 text-base rounded-token-md',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
