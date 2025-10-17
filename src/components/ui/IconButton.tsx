import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-token-sm transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary hover:bg-border-subtle hover:text-text';

    const sizeStyles = {
      sm: 'w-7 h-7',
      md: 'w-9 h-9',
      lg: 'w-11 h-11',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
