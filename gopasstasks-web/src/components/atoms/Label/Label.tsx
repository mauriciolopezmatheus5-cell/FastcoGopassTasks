import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({
  required = false,
  className = '',
  children,
  ...props
}) => (
  <label
    className={`block text-sm font-medium text-text-primary ${className}`}
    {...props}
  >
    {children}
    {required && <span className="ml-1 text-red-600">*</span>}
  </label>
);
