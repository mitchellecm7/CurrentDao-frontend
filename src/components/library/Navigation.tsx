import React, { forwardRef, HTMLAttributes, LiHTMLAttributes, OlHTMLAttributes, UlHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { colors, spacing, typography, borderRadius, componentTokens } from '../../styles/design-system/tokens';

// Navigation context
export interface NavigationContextValue {
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills' | 'underline';
}

const NavigationContext = React.createContext<NavigationContextValue>({
  orientation: 'horizontal',
  size: 'md',
  variant: 'default',
});

// Base Navigation component
export interface NavigationProps extends HTMLAttributes<HTMLElement> {
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills' | 'underline';
}

const Navigation = forwardRef<HTMLElement, NavigationProps>(({
  className,
  orientation = 'horizontal',
  size = 'md',
  variant = 'default',
  children,
  ...props
}, ref) => {
  const contextValue: NavigationContextValue = {
    orientation,
    size,
    variant,
  };

  const baseStyles = [
    'relative',
    'flex',
  ];

  const orientationStyles = orientation === 'horizontal'
    ? ['flex-row', 'space-x-1']
    : ['flex-col', 'space-y-1'];

  const sizeStyles = {
    sm: orientation === 'horizontal' ? 'h-8' : 'w-full',
    md: orientation === 'horizontal' ? 'h-10' : 'w-full',
    lg: orientation === 'horizontal' ? 'h-12' : 'w-full',
  };

  const classes = clsx(
    ...baseStyles,
    ...orientationStyles,
    sizeStyles[size],
    className
  );

  return (
    <NavigationContext.Provider value={contextValue}>
      <nav
        className={classes}
        ref={ref}
        role="navigation"
        {...props}
      >
        {children}
      </nav>
    </NavigationContext.Provider>
  );
});

Navigation.displayName = 'Navigation';

// Navigation List component
export interface NavigationListProps extends UlHTMLAttributes<HTMLUListElement> {}

export const NavigationList = forwardRef<HTMLUListElement, NavigationListProps>(({
  className,
  children,
  ...props
}, ref) => {
  const context = React.useContext(NavigationContext);
  const { orientation } = context;

  const baseStyles = [
    'flex',
    'list-none',
    'm-0',
    'p-0',
  ];

  const orientationStyles = orientation === 'horizontal'
    ? ['flex-row', 'space-x-1']
    : ['flex-col', 'space-y-1'];

  const classes = clsx(
    ...baseStyles,
    ...orientationStyles,
    className
  );

  return (
    <ul className={classes} ref={ref} {...props}>
      {children}
    </ul>
  );
});

NavigationList.displayName = 'NavigationList';

// Navigation Item component
export interface NavigationItemProps extends LiHTMLAttributes<HTMLLIElement> {
  active?: boolean;
  disabled?: boolean;
}

export const NavigationItem = forwardRef<HTMLLIElement, NavigationItemProps>(({
  className,
  active = false,
  disabled = false,
  children,
  ...props
}, ref) => {
  const classes = clsx(
    'relative',
    disabled && 'opacity-50',
    className
  );

  return (
    <li
      className={classes}
      ref={ref}
      role="none"
      {...props}
    >
      {children}
    </li>
  );
});

NavigationItem.displayName = 'NavigationItem';

// Navigation Link component
export interface NavigationLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href?: string;
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
}

export const NavigationLink = forwardRef<HTMLAnchorElement, NavigationLinkProps>(({
  className,
  href = '#',
  active = false,
  disabled = false,
  external = false,
  children,
  ...props
}, ref) => {
  const context = React.useContext(NavigationContext);
  const { size, variant } = context;

  const baseStyles = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none',
  ];

  const sizeStyles = {
    sm: ['text-sm', 'px-3', 'py-1.5', 'rounded-md'],
    md: ['text-base', 'px-4', 'py-2', 'rounded-lg'],
    lg: ['text-lg', 'px-6', 'py-3', 'rounded-lg'],
  };

  const variantStyles = {
    default: active
      ? [
          'bg-primary-100',
          'text-primary-700',
          'hover:bg-primary-200',
        ]
      : [
          'text-neutral-600',
          'hover:text-neutral-900',
          'hover:bg-neutral-100',
        ],
    pills: active
      ? [
          'bg-primary-600',
          'text-white',
          'hover:bg-primary-700',
        ]
      : [
          'text-neutral-600',
          'hover:text-neutral-900',
          'hover:bg-neutral-100',
        ],
    underline: active
      ? [
          'text-primary-600',
          'border-b-2',
          'border-primary-600',
          'hover:text-primary-700',
        ]
      : [
          'text-neutral-600',
          'border-b-2',
          'border-transparent',
          'hover:text-neutral-900',
          'hover:border-neutral-300',
        ],
  };

  const classes = clsx(
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    className
  );

  const linkProps = {
    href,
    ref,
    className: classes,
    'aria-current': active ? 'page' : undefined,
    'aria-disabled': disabled,
    role: 'menuitem',
    ...props,
  };

  if (external) {
    return (
      <a {...linkProps} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return <a {...linkProps}>{children}</a>;
});

NavigationLink.displayName = 'NavigationLink';

// Navigation Button component
export interface NavigationButtonProps extends HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const NavigationButton = forwardRef<HTMLButtonElement, NavigationButtonProps>(({
  className,
  active = false,
  disabled = false,
  type = 'button',
  children,
  ...props
}, ref) => {
  const context = React.useContext(NavigationContext);
  const { size, variant } = context;

  const baseStyles = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none',
    'bg-transparent',
    'border-none',
  ];

  const sizeStyles = {
    sm: ['text-sm', 'px-3', 'py-1.5', 'rounded-md'],
    md: ['text-base', 'px-4', 'py-2', 'rounded-lg'],
    lg: ['text-lg', 'px-6', 'py-3', 'rounded-lg'],
  };

  const variantStyles = {
    default: active
      ? [
          'bg-primary-100',
          'text-primary-700',
          'hover:bg-primary-200',
        ]
      : [
          'text-neutral-600',
          'hover:text-neutral-900',
          'hover:bg-neutral-100',
        ],
    pills: active
      ? [
          'bg-primary-600',
          'text-white',
          'hover:bg-primary-700',
        ]
      : [
          'text-neutral-600',
          'hover:text-neutral-900',
          'hover:bg-neutral-100',
        ],
    underline: active
      ? [
          'text-primary-600',
          'border-b-2',
          'border-primary-600',
          'hover:text-primary-700',
        ]
      : [
          'text-neutral-600',
          'border-b-2',
          'border-transparent',
          'hover:text-neutral-900',
          'hover:border-neutral-300',
        ],
  };

  const classes = clsx(
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    className
  );

  return (
    <button
      type={type}
      className={classes}
      ref={ref}
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      role="menuitem"
      {...props}
    >
      {children}
    </button>
  );
});

NavigationButton.displayName = 'NavigationButton';

// Breadcrumb component
export interface BreadcrumbProps extends OlHTMLAttributes<HTMLOListElement> {}

export const Breadcrumb = forwardRef<HTMLOListElement, BreadcrumbProps>(({
  className,
  children,
  ...props
}, ref) => {
  const classes = clsx(
    'flex',
    'items-center',
    'space-x-2',
    'text-sm',
    'text-neutral-600',
    className
  );

  return (
    <nav aria-label="Breadcrumb">
      <ol className={classes} ref={ref} {...props}>
        {children}
      </ol>
    </nav>
  );
});

Breadcrumb.displayName = 'Breadcrumb';

// Breadcrumb Item component
export interface BreadcrumbItemProps extends LiHTMLAttributes<HTMLLIElement> {
  current?: boolean;
}

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(({
  className,
  current = false,
  children,
  ...props
}, ref) => {
  const classes = clsx(
    'flex',
    'items-center',
    current && 'text-neutral-900',
    className
  );

  return (
    <li className={classes} ref={ref} {...props}>
      {children}
      {!current && (
        <svg
          className="ml-2 h-4 w-4 text-neutral-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </li>
  );
});

BreadcrumbItem.displayName = 'BreadcrumbItem';

// Tab component
export interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  disabled?: boolean;
  panelId?: string;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(({
  className,
  active = false,
  disabled = false,
  panelId,
  children,
  ...props
}, ref) => {
  const context = React.useContext(NavigationContext);
  const { size } = context;

  const baseStyles = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none',
    'bg-transparent',
    'border-none',
    'border-b-2',
  ];

  const sizeStyles = {
    sm: ['text-sm', 'px-3', 'py-2'],
    md: ['text-base', 'px-4', 'py-2.5'],
    lg: ['text-lg', 'px-6', 'py-3'],
  };

  const activeStyles = active
    ? [
        'text-primary-600',
        'border-primary-600',
      ]
    : [
        'text-neutral-600',
        'border-transparent',
        'hover:text-neutral-900',
        'hover:border-neutral-300',
      ];

  const classes = clsx(
    ...baseStyles,
    ...sizeStyles[size],
    ...activeStyles,
    className
  );

  return (
    <button
      className={classes}
      ref={ref}
      disabled={disabled}
      role="tab"
      aria-selected={active}
      aria-controls={panelId}
      {...props}
    >
      {children}
    </button>
  );
});

Tab.displayName = 'Tab';

// Tab Panel component
export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  tabId?: string;
  active?: boolean;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(({
  className,
  tabId,
  active = false,
  children,
  ...props
}, ref) => {
  const classes = clsx(
    'py-4',
    !active && 'hidden',
    className
  );

  return (
    <div
      className={classes}
      ref={ref}
      role="tabpanel"
      aria-labelledby={tabId}
      hidden={!active}
      {...props}
    >
      {children}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';

export default Navigation;
