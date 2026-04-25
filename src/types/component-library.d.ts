/**
 * TypeScript definitions for CurrentDao Component Library
 * Ensures complete type safety and IntelliSense support
 */

// Base component props
export interface BaseComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
  ref?: React.Ref<any>;
}

// Theme system types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: Record<string, string>;
  secondary: Record<string, string>;
  success: Record<string, string>;
  warning: Record<string, string>;
  error: Record<string, string>;
  neutral: Record<string, string>;
  white: string;
  black: string;
  transparent: string;
}

export interface ThemeSpacing {
  [key: string]: string;
}

export interface ThemeTypography {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: Record<string, [string, { lineHeight: string }]>;
  fontWeight: Record<string, string>;
  letterSpacing: Record<string, string>;
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  shadows: Record<string, string>;
  borderRadius: Record<string, string>;
  breakpoints: Record<string, string>;
  zIndex: Record<string, number | string>;
  animation: {
    duration: Record<string, string>;
    timingFunction: Record<string, string>;
  };
}

// Component variant types
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
export type ColorScheme = 'light' | 'dark';

// Button component types
export interface ButtonProps extends BaseComponentProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

// Card component types
export interface CardProps extends BaseComponentProps, React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  size?: Size;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  interactive?: boolean;
}

export interface CardHeaderProps extends BaseComponentProps, React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export interface CardTitleProps extends BaseComponentProps, React.HTMLAttributes<HTMLHeadingElement> {}

export interface CardDescriptionProps extends BaseComponentProps, React.HTMLAttributes<HTMLParagraphElement> {}

export interface CardContentProps extends BaseComponentProps, React.HTMLAttributes<HTMLDivElement> {}

export interface CardFooterProps extends BaseComponentProps, React.HTMLAttributes<HTMLDivElement> {}

// Form component types
export interface FormProps extends BaseComponentProps, React.FormHTMLAttributes<HTMLFormElement> {
  disabled?: boolean;
  readonly?: boolean;
}

export interface FormFieldProps extends BaseComponentProps, React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helper?: string;
  label?: string;
}

export interface InputProps extends BaseComponentProps, React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface TextareaProps extends BaseComponentProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export interface SelectProps extends BaseComponentProps, React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

export interface CheckboxProps extends BaseComponentProps, React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  indeterminate?: boolean;
}

export interface RadioProps extends BaseComponentProps, React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
}

// Navigation component types
export interface NavigationProps extends BaseComponentProps, React.HTMLAttributes<HTMLElement> {
  orientation?: 'horizontal' | 'vertical';
  size?: Size;
  variant?: 'default' | 'pills' | 'underline';
}

export interface NavigationListProps extends BaseComponentProps, React.HTMLAttributes<HTMLUListElement> {}

export interface NavigationItemProps extends BaseComponentProps, React.LiHTMLAttributes<HTMLLIElement> {
  active?: boolean;
  disabled?: boolean;
}

export interface NavigationLinkProps extends BaseComponentProps, React.HTMLAttributes<HTMLAnchorElement> {
  href?: string;
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
}

export interface NavigationButtonProps extends BaseComponentProps, React.HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export interface BreadcrumbProps extends BaseComponentProps, React.OlHTMLAttributes<HTMLOListElement> {}

export interface BreadcrumbItemProps extends BaseComponentProps, React.LiHTMLAttributes<HTMLLIElement> {
  current?: boolean;
}

export interface TabProps extends BaseComponentProps, React.HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  disabled?: boolean;
  panelId?: string;
}

export interface TabPanelProps extends BaseComponentProps, React.HTMLAttributes<HTMLDivElement> {
  tabId?: string;
  active?: boolean;
}

// Accessibility types
export interface AriaRole {
  button: 'button';
  link: 'link';
  navigation: 'navigation';
  main: 'main';
  complementary: 'complementary';
  contentinfo: 'contentinfo';
  banner: 'banner';
  search: 'search';
  form: 'form';
  application: 'application';
  document: 'document';
  presentation: 'presentation';
  none: 'none';
}

export interface AriaState {
  busy: 'aria-busy';
  checked: 'aria-checked';
  disabled: 'aria-disabled';
  expanded: 'aria-expanded';
  grabbed: 'aria-grabbed';
  hidden: 'aria-hidden';
  invalid: 'aria-invalid';
  pressed: 'aria-pressed';
  selected: 'aria-selected';
}

export interface KeyboardKeys {
  ENTER: 'Enter';
  SPACE: ' ';
  ESCAPE: 'Escape';
  TAB: 'Tab';
  ARROW_UP: 'ArrowUp';
  ARROW_DOWN: 'ArrowDown';
  ARROW_LEFT: 'ArrowLeft';
  ARROW_RIGHT: 'ArrowRight';
  HOME: 'Home';
  END: 'End';
  PAGE_UP: 'PageUp';
  PAGE_DOWN: 'PageDown';
}

// Validation types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FieldValidation {
  isValid: boolean;
  error: string | null;
  touched: boolean;
}

export type ValidationRules<T extends Record<string, any>> = {
  [K in keyof T]: ValidationRule;
};

// Hook return types
export interface ThemeReturn {
  theme: string;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (theme: string) => void;
}

export interface ComponentVariantReturn<T> {
  variant: T;
  updateVariant: (updates: Partial<T>) => void;
  resetVariant: () => void;
}

export interface FormValidationReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string | null>>;
  touched: Partial<Record<keyof T, boolean>>;
  setValue: (field: keyof T, value: any) => void;
  setTouchedField: (field: keyof T) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  isValid: boolean;
}

export interface BreakpointReturn {
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface PerformanceMetrics {
  renderCount: number;
  renderTime: number;
  lastRenderTime: number;
  averageRenderTime: number;
  componentName: string;
}

export interface ComponentRegistry {
  register: (name: string, component: any) => void;
  unregister: (name: string) => void;
  get: (name: string) => any;
  list: () => string[];
}

export interface ComponentLibraryReturn {
  theme: ThemeReturn;
  breakpoint: BreakpointReturn;
  accessibility: {
    announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
    trapFocus: (container: HTMLElement | null) => () => void;
    ScreenReader: any;
    FocusManager: any;
    ColorContrast: any;
  };
  registry: ComponentRegistry;
  useComponentVariants: <T>(defaultVariant: T) => ComponentVariantReturn<T>;
  useFormValidation: <T extends Record<string, any>>(
    initialValues: T,
    validationRules: ValidationRules<T>
  ) => FormValidationReturn<T>;
  useComponentLifecycle: (callbacks: {
    onMount?: () => void | (() => void);
    onUnmount?: () => void;
    onUpdate?: (prevProps?: any) => void;
  }) => void;
  usePerformanceMonitoring: (componentName: string) => PerformanceMetrics;
  usePersistentState: <T>(key: string, initialValue: T) => [T, (value: T | ((prev: T) => T)) => void];
}

// Storybook types
export interface StoryMeta<T> {
  title: string;
  component: React.ComponentType<T>;
  parameters?: {
    layout?: 'centered' | 'fullscreen' | 'padded';
    docs?: {
      description?: {
        component?: string;
        story?: string;
      };
    };
    a11y?: {
      config?: any;
      manual?: boolean;
    };
  };
  tags?: string[];
  argTypes?: Record<string, any>;
  args?: Partial<T>;
}

export interface StoryObj<T> {
  args?: Partial<T>;
  render?: (args: T) => React.ReactNode;
  parameters?: any;
}

// Utility types
export type ComponentWithRef<T, P = {}> = React.ForwardRefExoticComponent<
  P & React.RefAttributes<T>
>;

export type PolymorphicComponent<T extends React.ElementType, P = {}> = {
  [K in keyof P]: P[K];
} & {
  as?: T;
};

export type MergeProps<T, U> = Omit<T, keyof U> & U;

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type MouseEventHandler = EventHandler<React.MouseEvent>;
export type KeyboardEventHandler = EventHandler<React.KeyboardEvent>;
export type FocusEventHandler = EventHandler<React.FocusEvent>;
export type ChangeEventHandler = EventHandler<React.ChangeEvent>;

// Animation types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface TransitionConfig {
  property: string | string[];
  duration: string;
  timingFunction: string;
  delay?: string;
}

// Component state types
export interface ComponentState {
  loading?: boolean;
  error?: string | null;
  data?: any;
  focused?: boolean;
  hovered?: boolean;
  active?: boolean;
  disabled?: boolean;
}

// Design token types
export interface DesignTokens {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  shadows: Record<string, string>;
  borderRadius: Record<string, string>;
  breakpoints: Record<string, string>;
  zIndex: Record<string, number | string>;
  animation: {
    duration: Record<string, string>;
    timingFunction: Record<string, string>;
  };
  layout: {
    maxWidth: Record<string, string>;
    container: {
      center: boolean;
      padding: string;
    };
  };
  componentTokens: {
    button: {
      height: Record<string, string>;
      padding: Record<string, string>;
    };
    card: {
      padding: Record<string, string>;
      gap: string;
    };
    form: {
      labelGap: string;
      fieldGap: string;
      sectionGap: string;
    };
    navigation: {
      itemHeight: string;
      itemPadding: string;
      mobileBreakpoint: string;
    };
  };
  accessibility: {
    focusRing: {
      width: string;
      color: string;
      offset: string;
    };
    reducedMotion: {
      duration: Record<string, string>;
    };
    highContrast: {
      colors: {
        text: string;
        background: string;
        border: string;
      };
    };
  };
}

// Export all types for external use
export type {
  // Re-export React types for convenience
  React,
  ReactNode,
  ReactElement,
  ComponentType,
  ForwardRefExoticComponent,
  RefAttributes,
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  FormHTMLAttributes,
  FieldsetHTMLAttributes,
  LiHTMLAttributes,
  OlHTMLAttributes,
  UlHTMLAttributes,
} from 'react';
