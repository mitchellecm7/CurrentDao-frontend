import React, { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { colors, spacing, borderRadius, shadows, componentTokens } from '../../styles/design-system/tokens';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  className,
  variant = 'default',
  size = 'md',
  padding = 'md',
  hover = false,
  interactive = false,
  children,
  ...props
}, ref) => {
  const baseStyles = [
    'rounded-lg',
    'transition-all',
    'duration-200',
  ];

  const variantStyles = {
    default: [
      'bg-white',
      'border',
      'border-neutral-200',
      'shadow-sm',
    ],
    outlined: [
      'bg-white',
      'border-2',
      'border-neutral-300',
    ],
    elevated: [
      'bg-white',
      'shadow-lg',
      'border',
      'border-neutral-100',
    ],
    flat: [
      'bg-neutral-50',
      'border-none',
    ],
  };

  const sizeStyles = {
    sm: [],
    md: [],
    lg: [],
  };

  const paddingStyles = {
    none: [],
    sm: ['p-4'],
    md: ['p-6'],
    lg: ['p-8'],
  };

  const hoverStyles = hover ? [
    'hover:shadow-md',
    'hover:border-neutral-300',
  ] : [];

  const interactiveStyles = interactive ? [
    'cursor-pointer',
    'hover:shadow-lg',
    'hover:border-primary-300',
    'active:shadow-sm',
    'active:scale-[0.98]',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:ring-offset-2',
  ] : [];

  const classes = clsx(
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...paddingStyles[padding],
    ...hoverStyles,
    ...interactiveStyles,
    className
  );

  return (
    <div
      className={classes}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card subcomponents
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({
  className,
  title,
  subtitle,
  action,
  children,
  ...props
}, ref) => {
  const classes = clsx(
    'flex',
    'flex-col',
    'space-y-1.5',
    'pb-6',
    className
  );

  return (
    <div className={classes} ref={ref} {...props}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-neutral-600">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(({
  className,
  children,
  ...props
}, ref) => {
  const classes = clsx(
    'text-lg',
    'font-semibold',
    'leading-none',
    'tracking-tight',
    className
  );

  return (
    <h3 className={classes} ref={ref} {...props}>
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(({
  className,
  children,
  ...props
}, ref) => {
  const classes = clsx(
    'text-sm',
    'text-neutral-600',
    className
  );

  return (
    <p className={classes} ref={ref} {...props}>
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(({
  className,
  children,
  ...props
}, ref) => {
  const classes = clsx(
    'pt-0',
    className
  );

  return (
    <div className={classes} ref={ref} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(({
  className,
  children,
  ...props
}, ref) => {
  const classes = clsx(
    'flex',
    'items-center',
    'pt-6',
    className
  );

  return (
    <div className={classes} ref={ref} {...props}>
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

export default Card;
