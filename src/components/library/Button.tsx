import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { colors, spacing, typography, borderRadius, shadows, componentTokens } from '../../styles/design-system/tokens';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  asChild = false,
  ...props
}, ref) => {
  const baseStyles = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none',
  ];

  const variantStyles = {
    primary: [
      'bg-primary-600',
      'text-white',
      'hover:bg-primary-700',
      'active:bg-primary-800',
      'focus:ring-primary-500',
      'shadow-sm',
      'hover:shadow-md',
    ],
    secondary: [
      'bg-secondary-100',
      'text-secondary-900',
      'hover:bg-secondary-200',
      'active:bg-secondary-300',
      'focus:ring-secondary-500',
      'border',
      'border-secondary-300',
    ],
    outline: [
      'bg-transparent',
      'text-primary-700',
      'border',
      'border-primary-300',
      'hover:bg-primary-50',
      'active:bg-primary-100',
      'focus:ring-primary-500',
    ],
    ghost: [
      'bg-transparent',
      'text-secondary-700',
      'hover:bg-secondary-100',
      'active:bg-secondary-200',
      'focus:ring-secondary-500',
    ],
    destructive: [
      'bg-error-600',
      'text-white',
      'hover:bg-error-700',
      'active:bg-error-800',
      'focus:ring-error-500',
      'shadow-sm',
      'hover:shadow-md',
    ],
    success: [
      'bg-success-600',
      'text-white',
      'hover:bg-success-700',
      'active:bg-success-800',
      'focus:ring-success-500',
      'shadow-sm',
      'hover:shadow-md',
    ],
  };

  const sizeStyles = {
    sm: [
      'text-sm',
      'h-8',
      'px-3',
      'rounded-md',
    ],
    md: [
      'text-base',
      'h-10',
      'px-4',
      'rounded-lg',
    ],
    lg: [
      'text-lg',
      'h-12',
      'px-6',
      'rounded-lg',
    ],
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  const classes = clsx(
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    widthStyles,
    className
  );

  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (asChild) {
    return (
      <span className={classes} ref={ref} {...props}>
        {loading && <LoadingSpinner />}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </span>
    );
  }

  return (
    <button
      className={classes}
      ref={ref}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
