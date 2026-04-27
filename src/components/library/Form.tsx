import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, LabelHTMLAttributes, FieldsetHTMLAttributes, LegendHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { colors, spacing, typography, borderRadius, componentTokens } from '../../styles/design-system/tokens';

// Form context for managing form state
export interface FormContextValue {
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
}

const FormContext = React.createContext<FormContextValue>({});

// Base Form component
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  disabled?: boolean;
  readonly?: boolean;
}

const Form = forwardRef<HTMLFormElement, FormProps>(({
  className,
  disabled = false,
  readonly = false,
  children,
  ...props
}, ref) => {
  const contextValue: FormContextValue = {
    disabled,
    readonly,
  };

  const classes = clsx(
    'space-y-6',
    className
  );

  return (
    <FormContext.Provider value={contextValue}>
      <form
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
});

Form.displayName = 'Form';

// Form Field component
export interface FormFieldProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helper?: string;
  label?: string;
}

export const FormField = forwardRef<HTMLFieldSetElement, FormFieldProps>(({
  className,
  disabled = false,
  required = false,
  error,
  helper,
  label,
  children,
  ...props
}, ref) => {
  const context = React.useContext(FormContext);
  const isDisabled = disabled || context.disabled;
  const isReadonly = context.readonly;

  const classes = clsx(
    'space-y-2',
    isDisabled && 'opacity-50',
    className
  );

  return (
    <fieldset
      className={classes}
      ref={ref}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-error-600" role="alert">
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="text-sm text-neutral-500">
          {helper}
        </p>
      )}
    </fieldset>
  );
});

FormField.displayName = 'FormField';

// Input component
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = 'text',
  error = false,
  leftIcon,
  rightIcon,
  disabled = false,
  ...props
}, ref) => {
  const context = React.useContext(FormContext);
  const isDisabled = disabled || context.disabled;
  const isReadonly = context.readonly;

  const baseStyles = [
    'flex',
    'h-10',
    'w-full',
    'rounded-md',
    'border',
    'px-3',
    'py-2',
    'text-sm',
    'file:border-0',
    'file:bg-transparent',
    'file:text-sm',
    'file:font-medium',
    'placeholder:text-neutral-500',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:ring-offset-0',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
  ];

  const variantStyles = error
    ? [
        'border-error-500',
        'text-error-900',
        'placeholder:text-error-400',
        'focus:ring-error-500',
      ]
    : [
        'border-neutral-300',
        'focus:border-primary-500',
      ];

  const iconStyles = clsx(
    leftIcon && 'pl-10',
    rightIcon && 'pr-10'
  );

  const classes = clsx(
    ...baseStyles,
    ...variantStyles,
    iconStyles,
    className
  );

  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <div className="h-4 w-4 text-neutral-400">
            {leftIcon}
          </div>
        </div>
      )}
      <input
        type={type}
        className={classes}
        ref={ref}
        disabled={isDisabled}
        readOnly={isReadonly}
        aria-invalid={error}
        {...props}
      />
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <div className="h-4 w-4 text-neutral-400">
            {rightIcon}
          </div>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea component
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  error = false,
  disabled = false,
  ...props
}, ref) => {
  const context = React.useContext(FormContext);
  const isDisabled = disabled || context.disabled;
  const isReadonly = context.readonly;

  const baseStyles = [
    'flex',
    'min-h-[80px]',
    'w-full',
    'rounded-md',
    'border',
    'px-3',
    'py-2',
    'text-sm',
    'placeholder:text-neutral-500',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:ring-offset-0',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'resize-vertical',
  ];

  const variantStyles = error
    ? [
        'border-error-500',
        'text-error-900',
        'placeholder:text-error-400',
        'focus:ring-error-500',
      ]
    : [
        'border-neutral-300',
        'focus:border-primary-500',
      ];

  const classes = clsx(
    ...baseStyles,
    ...variantStyles,
    className
  );

  return (
    <textarea
      className={classes}
      ref={ref}
      disabled={isDisabled}
      readOnly={isReadonly}
      aria-invalid={error}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

// Select component
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  error = false,
  disabled = false,
  children,
  options,
  ...props
}, ref) => {
  const context = React.useContext(FormContext);
  const isDisabled = disabled || context.disabled;
  const isReadonly = context.readonly;

  const baseStyles = [
    'flex',
    'h-10',
    'w-full',
    'rounded-md',
    'border',
    'px-3',
    'py-2',
    'text-sm',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:ring-offset-0',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
  ];

  const variantStyles = error
    ? [
        'border-error-500',
        'text-error-900',
        'focus:ring-error-500',
      ]
    : [
        'border-neutral-300',
        'focus:border-primary-500',
      ];

  const classes = clsx(
    ...baseStyles,
    ...variantStyles,
    className
  );

  return (
    <select
      className={classes}
      ref={ref}
      disabled={isDisabled}
      aria-invalid={error}
      {...props}
    >
      {options?.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
      {children}
    </select>
  );
});

Select.displayName = 'Select';

// Checkbox component
export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  className,
  label,
  error = false,
  disabled = false,
  indeterminate = false,
  ...props
}, ref) => {
  const context = React.useContext(FormContext);
  const isDisabled = disabled || context.disabled;
  const isReadonly = context.readonly;
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useImperativeHandle(ref, () => inputRef.current!);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const baseStyles = [
    'h-4',
    'w-4',
    'rounded',
    'border',
    'text-primary-600',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:ring-offset-0',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
  ];

  const variantStyles = error
    ? [
        'border-error-500',
        'focus:ring-error-500',
      ]
    : [
        'border-neutral-300',
        'focus:border-primary-500',
      ];

  const classes = clsx(
    ...baseStyles,
    ...variantStyles,
    className
  );

  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        className={classes}
        ref={inputRef}
        disabled={isDisabled}
        readOnly={isReadonly}
        aria-invalid={error}
        {...props}
      />
      {label && (
        <label className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// Radio component
export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  className,
  label,
  error = false,
  disabled = false,
  ...props
}, ref) => {
  const context = React.useContext(FormContext);
  const isDisabled = disabled || context.disabled;
  const isReadonly = context.readonly;

  const baseStyles = [
    'h-4',
    'w-4',
    'rounded-full',
    'border',
    'text-primary-600',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:ring-offset-0',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
  ];

  const variantStyles = error
    ? [
        'border-error-500',
        'focus:ring-error-500',
      ]
    : [
        'border-neutral-300',
        'focus:border-primary-500',
      ];

  const classes = clsx(
    ...baseStyles,
    ...variantStyles,
    className
  );

  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        className={classes}
        ref={ref}
        disabled={isDisabled}
        readOnly={isReadonly}
        aria-invalid={error}
        {...props}
      />
      {label && (
        <label className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

export default Form;
