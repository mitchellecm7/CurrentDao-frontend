/**
 * CurrentDao Component Library - Main Export File
 * Provides centralized access to all components, hooks, and utilities
 */

// Core Components
export { default as Button } from './Button';
export type { ButtonProps } from '../types/component-library';

export { default as Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export type { 
  CardProps, 
  CardHeaderProps, 
  CardTitleProps, 
  CardDescriptionProps, 
  CardContentProps, 
  CardFooterProps 
} from '../types/component-library';

export { 
  default as Form, 
  FormField, 
  Input, 
  Textarea, 
  Select, 
  Checkbox, 
  Radio 
} from './Form';
export type { 
  FormProps, 
  FormFieldProps, 
  InputProps, 
  TextareaProps, 
  SelectProps, 
  CheckboxProps, 
  RadioProps 
} from '../types/component-library';

export { 
  default as Navigation, 
  NavigationList, 
  NavigationItem, 
  NavigationLink, 
  NavigationButton, 
  Breadcrumb, 
  BreadcrumbItem, 
  Tab, 
  TabPanel 
} from './Navigation';
export type { 
  NavigationProps, 
  NavigationListProps, 
  NavigationItemProps, 
  NavigationLinkProps, 
  NavigationButtonProps, 
  BreadcrumbProps, 
  BreadcrumbItemProps, 
  TabProps, 
  TabPanelProps 
} from '../types/component-library';

// Hooks
export { default as useComponentLibrary } from '../../hooks/useComponentLibrary';
export type { 
  ThemeReturn, 
  ComponentVariantReturn, 
  FormValidationReturn, 
  BreakpointReturn, 
  PerformanceMetrics, 
  ComponentRegistry, 
  ComponentLibraryReturn 
} from '../types/component-library';

// Accessibility utilities
export * from '../../utils/component/accessibility';

// Design system tokens
export { default as designTokens } from '../../styles/design-system/tokens';
export type { DesignTokens, Theme, ThemeColors, ThemeSpacing, ThemeTypography } from '../types/component-library';

// Re-export commonly used React types for convenience
export type { 
  ReactNode, 
  ComponentType, 
  HTMLAttributes, 
  ButtonHTMLAttributes, 
  InputHTMLAttributes 
} from 'react';

// Component composition utilities
export const ComponentLibrary = {
  // Components
  Button,
  Card,
  Form,
  Navigation,
  
  // Component groups
  Forms: {
    Form,
    FormField,
    Input,
    Textarea,
    Select,
    Checkbox,
    Radio,
  },
  
  Navigation: {
    Navigation,
    NavigationList,
    NavigationItem,
    NavigationLink,
    NavigationButton,
    Breadcrumb,
    BreadcrumbItem,
    Tab,
    TabPanel,
  },
  
  Layout: {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  },
  
  // Hooks
  useComponentLibrary,
  
  // Utilities
  Accessibility: {
    FocusManager,
    ScreenReader,
    ColorContrast,
    AccessibilityTester,
    useAccessibility,
  },
  
  DesignTokens: designTokens,
};

// Default export for convenience
export default ComponentLibrary;
