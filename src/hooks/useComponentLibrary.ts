import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccessibility } from '../utils/component/accessibility';

// Theme management hook
export interface Theme {
  name: string;
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: Record<string, any>;
}

export const useTheme = (defaultTheme: string = 'light') => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('currentdao-theme');
      return saved || defaultTheme;
    }
    return defaultTheme;
  });

  const [isDark, setIsDark] = useState(() => {
    return theme === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('currentdao-theme', theme);
  }, [theme, isDark]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const setThemeMode = useCallback((newTheme: string) => {
    setTheme(newTheme);
  }, []);

  return {
    theme,
    isDark,
    toggleTheme,
    setThemeMode,
  };
};

// Component variants hook
export interface ComponentVariant {
  size?: 'sm' | 'md' | 'lg';
  variant?: string;
  color?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const useComponentVariants = <T extends ComponentVariant>(
  defaultVariant: T
) => {
  const [variant, setVariant] = useState<T>(defaultVariant);

  const updateVariant = useCallback((updates: Partial<T>) => {
    setVariant(prev => ({ ...prev, ...updates }));
  }, []);

  const resetVariant = useCallback(() => {
    setVariant(defaultVariant);
  }, [defaultVariant]);

  return {
    variant,
    updateVariant,
    resetVariant,
  };
};

// Form validation hook
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

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, ValidationRule>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | null>>({} as any);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as any);

  const validateField = useCallback((
    field: keyof T,
    value: any
  ): string | null => {
    const rules = validationRules[field];
    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return 'This field is required';
    }

    // Min length validation
    if (rules.minLength && value && value.length < rules.minLength) {
      return `Minimum length is ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && value && value.length > rules.maxLength) {
      return `Maximum length is ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && value && !rules.pattern.test(value)) {
      return 'Invalid format';
    }

    // Custom validation
    if (rules.custom && value) {
      return rules.custom(value);
    }

    return null;
  }, [validationRules]);

  const setValue = useCallback((
    field: keyof T,
    value: any
  ) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [touched, validateField]);

  const setTouchedField = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [values, validateField]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<keyof T, string | null> = {} as any;
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field as keyof T, values[field as keyof T]);
      newErrors[field as keyof T] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, field) => ({
      ...acc,
      [field]: true,
    }), {} as any));

    return isValid;
  }, [values, validationRules, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({} as any);
    setTouched({} as any);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValue,
    setTouchedField,
    validateForm,
    resetForm,
    isValid: Object.values(errors).every(error => !error),
  };
};

// Responsive breakpoint hook
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const isMobile = breakpoint === 'sm' || breakpoint === 'md';
  const isTablet = breakpoint === 'lg';
  const isDesktop = breakpoint === 'xl' || breakpoint === '2xl';

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
  };
};

// Component lifecycle hook
export interface LifecycleCallbacks {
  onMount?: () => void | (() => void);
  onUnmount?: () => void;
  onUpdate?: (prevProps?: any) => void;
}

export const useComponentLifecycle = (callbacks: LifecycleCallbacks) => {
  const prevPropsRef = useRef();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (callbacks.onMount) {
      const cleanup = callbacks.onMount();
      if (cleanup) {
        cleanupRef.current = cleanup;
      }
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (callbacks.onUnmount) {
        callbacks.onUnmount();
      }
    };
  }, []);

  useEffect(() => {
    if (callbacks.onUpdate) {
      callbacks.onUpdate(prevPropsRef.current);
    }
    prevPropsRef.current = prevPropsRef.current;
  });
};

// Performance monitoring hook
export interface PerformanceMetrics {
  renderCount: number;
  renderTime: number;
  lastRenderTime: number;
}

export const usePerformanceMonitoring = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    renderTime: 0,
    lastRenderTime: 0,
  });

  const renderStartTime = useRef<number>(Date.now());

  useEffect(() => {
    const renderTime = Date.now() - renderStartTime.current;
    
    setMetrics(prev => ({
      renderCount: prev.renderCount + 1,
      renderTime: prev.renderTime + renderTime,
      lastRenderTime: renderTime,
    }));

    renderStartTime.current = Date.now();
  });

  const averageRenderTime = metrics.renderCount > 0 
    ? metrics.renderTime / metrics.renderCount 
    : 0;

  return {
    ...metrics,
    averageRenderTime,
    componentName,
  };
};

// Component state persistence hook
export const usePersistentState = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [state, setState] = useState<T>(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return initialValue;
      }
    }
    return initialValue;
  });

  const setPersistentState = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value;
      setState(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setPersistentState];
};

// Component composition hook
export interface ComponentComposition {
  register: (name: string, component: any) => void;
  unregister: (name: string) => void;
  get: (name: string) => any;
  list: () => string[];
}

export const useComponentRegistry = (): ComponentComposition => {
  const registryRef = useRef<Map<string, any>>(new Map());

  const register = useCallback((name: string, component: any) => {
    registryRef.current.set(name, component);
  }, []);

  const unregister = useCallback((name: string) => {
    registryRef.current.delete(name);
  }, []);

  const get = useCallback((name: string) => {
    return registryRef.current.get(name);
  }, []);

  const list = useCallback(() => {
    return Array.from(registryRef.current.keys());
  }, []);

  return {
    register,
    unregister,
    get,
    list,
  };
};

// Main component library hook
export const useComponentLibrary = () => {
  const { announceMessage, trapFocus, ScreenReader, FocusManager, ColorContrast } = useAccessibility();
  const theme = useTheme();
  const breakpoint = useBreakpoint();
  const registry = useComponentRegistry();

  return {
    // Theme utilities
    theme,
    
    // Responsive utilities
    breakpoint,
    
    // Accessibility utilities
    accessibility: {
      announceMessage,
      trapFocus,
      ScreenReader,
      FocusManager,
      ColorContrast,
    },
    
    // Component registry
    registry,
    
    // Utility hooks
    useComponentVariants,
    useFormValidation,
    useComponentLifecycle,
    usePerformanceMonitoring,
    usePersistentState,
  };
};

export default useComponentLibrary;
