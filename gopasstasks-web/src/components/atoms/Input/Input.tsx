import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, leftIcon, className = '', ...props }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        className={`
          w-full px-4 py-2 rounded-md border text-sm
          ${leftIcon ? 'pl-10' : ''}
          ${error
            ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-500'
            : 'border-border bg-background-card text-text-primary focus:border-primary focus:ring-primary'
          }
          focus:outline-none focus:ring-2
          disabled:bg-background-muted disabled:cursor-not-allowed disabled:text-text-muted
          transition-colors
          ${className}
        `}
        {...props}
      />
      {leftIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          {leftIcon}
        </span>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  ),
);

Input.displayName = 'Input';
