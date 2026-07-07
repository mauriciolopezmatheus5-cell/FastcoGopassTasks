import React from 'react';
import { Label } from '@/components/atoms/Label';
import { Input } from '@/components/atoms/Input';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  as?: 'input' | 'textarea';
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, required, leftIcon, as = 'input', className, ...props }, ref) => (
    <div className="space-y-1">
      <Label htmlFor={props.id} required={required}>
        {label}
      </Label>
      {as === 'textarea' ? (
        <textarea
          ref={ref as any}
          className={`
            w-full px-4 py-2 rounded-md border text-sm min-h-24
            ${error
              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-1 focus:ring-red-500'
              : 'border-border bg-background-card text-text-primary focus:border-primary focus:ring-1 focus:ring-primary'
            }
            focus:outline-none
            disabled:bg-background-muted disabled:cursor-not-allowed disabled:text-text-muted
            transition-colors
            ${className || ''}
          `}
          {...(props as any)}
        />
      ) : (
        <Input
          ref={ref}
          error={error}
          leftIcon={leftIcon}
          className={className}
          {...props}
        />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  ),
);

FormField.displayName = 'FormField';
