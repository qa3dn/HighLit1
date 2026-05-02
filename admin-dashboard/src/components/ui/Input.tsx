import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substr(2, 9);
    
    return (
      <div className="flex flex-col gap-1.5 w-full animate-fade-in">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary font-sans">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full bg-gray text-text border rounded-md px-4 py-2 font-sans
            transition-all duration-300 placeholder:text-gray-dark
            focus:outline-none focus:border-accent focus:shadow-glow focus:ring-1 focus:ring-accent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:shadow-none focus:ring-red-500' : 'border-border hover:border-text-secondary'}
            ${className}
          `}
          {...props}
        />
        {error && <span className="text-sm text-red-500 animate-fade-in-up">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
