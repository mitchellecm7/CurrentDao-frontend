// Responsive Design System Styles
// Mobile-first approach with breakpoint-based scaling

// Breakpoint definitions
export const BREAKPOINTS = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
  ultrawide: '1920px',
} as const

// Container max widths
export const CONTAINER_MAX_WIDTHS = {
  mobile: '100%',
  tablet: '728px',
  desktop: '960px',
  wide: '1140px',
  ultrawide: '1320px',
} as const

// Grid systems
export const GRID_SYSTEMS = {
  mobile: {
    columns: 4,
    gutter: '16px',
    maxWidth: '100%',
  },
  tablet: {
    columns: 8,
    gutter: '24px',
    maxWidth: '728px',
  },
  desktop: {
    columns: 12,
    gutter: '24px',
    maxWidth: '960px',
  },
  wide: {
    columns: 12,
    gutter: '32px',
    maxWidth: '1140px',
  },
  ultrawide: {
    columns: 16,
    gutter: '32px',
    maxWidth: '1320px',
  },
} as const

// Spacing scale (mobile-first)
export const SPACING_SCALE = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
} as const

// Responsive spacing
export const RESPONSIVE_SPACING = {
  padding: {
    mobile: SPACING_SCALE.md,
    tablet: SPACING_SCALE.lg,
    desktop: SPACING_SCALE.xl,
    wide: SPACING_SCALE.xxl,
    ultrawide: SPACING_SCALE.xxxl,
  },
  margin: {
    mobile: SPACING_SCALE.sm,
    tablet: SPACING_SCALE.md,
    desktop: SPACING_SCALE.lg,
    wide: SPACING_SCALE.xl,
    ultrawide: SPACING_SCALE.xxl,
  },
  gap: {
    mobile: SPACING_SCALE.sm,
    tablet: SPACING_SCALE.md,
    desktop: SPACING_SCALE.lg,
    wide: SPACING_SCALE.xl,
    ultrawide: SPACING_SCALE.xxl,
  },
} as const

// Typography scale
export const TYPOGRAPHY_SCALE = {
  // Font sizes (mobile-first)
  fontSize: {
    xs: ['12px', '16px'], // [size, line-height]
    sm: ['14px', '20px'],
    base: ['16px', '24px'],
    lg: ['18px', '28px'],
    xl: ['20px', '30px'],
    '2xl': ['24px', '36px'],
    '3xl': ['30px', '45px'],
    '4xl': ['36px', '54px'],
    '5xl': ['48px', '72px'],
    '6xl': ['60px', '90px'],
  },
  
  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const

// Responsive typography
export const RESPONSIVE_TYPOGRAPHY = {
  // Heading sizes
  h1: {
    mobile: { fontSize: '28px', lineHeight: '36px', fontWeight: '700' },
    tablet: { fontSize: '32px', lineHeight: '40px', fontWeight: '700' },
    desktop: { fontSize: '36px', lineHeight: '44px', fontWeight: '700' },
    wide: { fontSize: '40px', lineHeight: '48px', fontWeight: '700' },
    ultrawide: { fontSize: '48px', lineHeight: '56px', fontWeight: '700' },
  },
  
  h2: {
    mobile: { fontSize: '24px', lineHeight: '32px', fontWeight: '600' },
    tablet: { fontSize: '28px', lineHeight: '36px', fontWeight: '600' },
    desktop: { fontSize: '30px', lineHeight: '38px', fontWeight: '600' },
    wide: { fontSize: '32px', lineHeight: '40px', fontWeight: '600' },
    ultrawide: { fontSize: '36px', lineHeight: '44px', fontWeight: '600' },
  },
  
  h3: {
    mobile: { fontSize: '20px', lineHeight: '28px', fontWeight: '600' },
    tablet: { fontSize: '22px', lineHeight: '30px', fontWeight: '600' },
    desktop: { fontSize: '24px', lineHeight: '32px', fontWeight: '600' },
    wide: { fontSize: '26px', lineHeight: '34px', fontWeight: '600' },
    ultrawide: { fontSize: '28px', lineHeight: '36px', fontWeight: '600' },
  },
  
  h4: {
    mobile: { fontSize: '18px', lineHeight: '24px', fontWeight: '600' },
    tablet: { fontSize: '20px', lineHeight: '26px', fontWeight: '600' },
    desktop: { fontSize: '22px', lineHeight: '28px', fontWeight: '600' },
    wide: { fontSize: '24px', lineHeight: '30px', fontWeight: '600' },
    ultrawide: { fontSize: '26px', lineHeight: '32px', fontWeight: '600' },
  },
  
  body: {
    mobile: { fontSize: '16px', lineHeight: '24px', fontWeight: '400' },
    tablet: { fontSize: '16px', lineHeight: '24px', fontWeight: '400' },
    desktop: { fontSize: '16px', lineHeight: '24px', fontWeight: '400' },
    wide: { fontSize: '18px', lineHeight: '26px', fontWeight: '400' },
    ultrawide: { fontSize: '18px', lineHeight: '26px', fontWeight: '400' },
  },
  
  small: {
    mobile: { fontSize: '14px', lineHeight: '20px', fontWeight: '400' },
    tablet: { fontSize: '14px', lineHeight: '20px', fontWeight: '400' },
    desktop: { fontSize: '14px', lineHeight: '20px', fontWeight: '400' },
    wide: { fontSize: '14px', lineHeight: '20px', fontWeight: '400' },
    ultrawide: { fontSize: '14px', lineHeight: '20px', fontWeight: '400' },
  },
  
  caption: {
    mobile: { fontSize: '12px', lineHeight: '16px', fontWeight: '400' },
    tablet: { fontSize: '12px', lineHeight: '16px', fontWeight: '400' },
    desktop: { fontSize: '12px', lineHeight: '16px', fontWeight: '400' },
    wide: { fontSize: '12px', lineHeight: '16px', fontWeight: '400' },
    ultrawide: { fontSize: '12px', lineHeight: '16px', fontWeight: '400' },
  },
} as const

// Touch target sizes
export const TOUCH_TARGETS = {
  minimum: '44px',
  comfortable: '48px',
  large: '52px',
} as const

// Component-specific responsive styles
export const COMPONENT_STYLES = {
  // Button styles
  button: {
    mobile: {
      minHeight: TOUCH_TARGETS.minimum,
      paddingHorizontal: SPACING_SCALE.md,
      paddingVertical: SPACING_SCALE.sm,
      fontSize: TYPOGRAPHY_SCALE.fontSize.sm[0],
      borderRadius: '8px',
    },
    tablet: {
      minHeight: TOUCH_TARGETS.comfortable,
      paddingHorizontal: SPACING_SCALE.lg,
      paddingVertical: SPACING_SCALE.md,
      fontSize: TYPOGRAPHY_SCALE.fontSize.base[0],
      borderRadius: '8px',
    },
    desktop: {
      minHeight: TOUCH_TARGETS.comfortable,
      paddingHorizontal: SPACING_SCALE.lg,
      paddingVertical: SPACING_SCALE.md,
      fontSize: TYPOGRAPHY_SCALE.fontSize.base[0],
      borderRadius: '8px',
    },
    wide: {
      minHeight: TOUCH_TARGETS.large,
      paddingHorizontal: SPACING_SCALE.xl,
      paddingVertical: SPACING_SCALE.lg,
      fontSize: TYPOGRAPHY_SCALE.fontSize.lg[0],
      borderRadius: '12px',
    },
    ultrawide: {
      minHeight: TOUCH_TARGETS.large,
      paddingHorizontal: SPACING_SCALE.xl,
      paddingVertical: SPACING_SCALE.lg,
      fontSize: TYPOGRAPHY_SCALE.fontSize.lg[0],
      borderRadius: '12px',
    },
  },
  
  // Card styles
  card: {
    mobile: {
      padding: SPACING_SCALE.md,
      borderRadius: '12px',
      gap: SPACING_SCALE.sm,
    },
    tablet: {
      padding: SPACING_SCALE.lg,
      borderRadius: '12px',
      gap: SPACING_SCALE.md,
    },
    desktop: {
      padding: SPACING_SCALE.xl,
      borderRadius: '16px',
      gap: SPACING_SCALE.lg,
    },
    wide: {
      padding: SPACING_SCALE.xl,
      borderRadius: '16px',
      gap: SPACING_SCALE.xl,
    },
    ultrawide: {
      padding: SPACING_SCALE.xxl,
      borderRadius: '20px',
      gap: SPACING_SCALE.xl,
    },
  },
  
  // Input styles
  input: {
    mobile: {
      minHeight: TOUCH_TARGETS.minimum,
      paddingHorizontal: SPACING_SCALE.md,
      paddingVertical: SPACING_SCALE.sm,
      fontSize: TYPOGRAPHY_SCALE.fontSize.base[0],
      borderRadius: '8px',
    },
    tablet: {
      minHeight: TOUCH_TARGETS.comfortable,
      paddingHorizontal: SPACING_SCALE.md,
      paddingVertical: SPACING_SCALE.md,
      fontSize: TYPOGRAPHY_SCALE.fontSize.base[0],
      borderRadius: '8px',
    },
    desktop: {
      minHeight: TOUCH_TARGETS.comfortable,
      paddingHorizontal: SPACING_SCALE.lg,
      paddingVertical: SPACING_SCALE.md,
      fontSize: TYPOGRAPHY_SCALE.fontSize.base[0],
      borderRadius: '8px',
    },
    wide: {
      minHeight: TOUCH_TARGETS.large,
      paddingHorizontal: SPACING_SCALE.lg,
      paddingVertical: SPACING_SCALE.lg,
      fontSize: TYPOGRAPHY_SCALE.fontSize.lg[0],
      borderRadius: '12px',
    },
    ultrawide: {
      minHeight: TOUCH_TARGETS.large,
      paddingHorizontal: SPACING_SCALE.xl,
      paddingVertical: SPACING_SCALE.lg,
      fontSize: TYPOGRAPHY_SCALE.fontSize.lg[0],
      borderRadius: '12px',
    },
  },
  
  // Navigation styles
  navigation: {
    mobile: {
      height: '56px',
      paddingHorizontal: SPACING_SCALE.md,
      gap: SPACING_SCALE.sm,
    },
    tablet: {
      height: '64px',
      paddingHorizontal: SPACING_SCALE.lg,
      gap: SPACING_SCALE.md,
    },
    desktop: {
      height: '64px',
      paddingHorizontal: SPACING_SCALE.xl,
      gap: SPACING_SCALE.lg,
    },
    wide: {
      height: '72px',
      paddingHorizontal: SPACING_SCALE.xl,
      gap: SPACING_SCALE.xl,
    },
    ultrawide: {
      height: '80px',
      paddingHorizontal: SPACING_SCALE.xxl,
      gap: SPACING_SCALE.xl,
    },
  },
} as const

// Animation and transition styles
export const ANIMATION_STYLES = {
  // Transition durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  // Easing functions
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Responsive animations
  responsive: {
    mobile: {
      duration: ANIMATION_STYLES.duration.fast,
      easing: ANIMATION_STYLES.easing.easeOut,
    },
    tablet: {
      duration: ANIMATION_STYLES.duration.normal,
      easing: ANIMATION_STYLES.easing.easeInOut,
    },
    desktop: {
      duration: ANIMATION_STYLES.duration.normal,
      easing: ANIMATION_STYLES.easing.easeInOut,
    },
    wide: {
      duration: ANIMATION_STYLES.duration.slow,
      easing: ANIMATION_STYLES.easing.easeInOut,
    },
    ultrawide: {
      duration: ANIMATION_STYLES.duration.slow,
      easing: ANIMATION_STYLES.easing.easeInOut,
    },
  },
} as const

// CSS custom properties
export const CSS_CUSTOM_PROPERTIES = {
  // Breakpoint variables
  '--breakpoint-mobile': BREAKPOINTS.mobile,
  '--breakpoint-tablet': BREAKPOINTS.tablet,
  '--breakpoint-desktop': BREAKPOINTS.desktop,
  '--breakpoint-wide': BREAKPOINTS.wide,
  '--breakpoint-ultrawide': BREAKPOINTS.ultrawide,
  
  // Container variables
  '--container-max-mobile': CONTAINER_MAX_WIDTHS.mobile,
  '--container-max-tablet': CONTAINER_MAX_WIDTHS.tablet,
  '--container-max-desktop': CONTAINER_MAX_WIDTHS.desktop,
  '--container-max-wide': CONTAINER_MAX_WIDTHS.wide,
  '--container-max-ultrawide': CONTAINER_MAX_WIDTHS.ultrawide,
  
  // Spacing variables
  '--spacing-xs': SPACING_SCALE.xs,
  '--spacing-sm': SPACING_SCALE.sm,
  '--spacing-md': SPACING_SCALE.md,
  '--spacing-lg': SPACING_SCALE.lg,
  '--spacing-xl': SPACING_SCALE.xl,
  '--spacing-xxl': SPACING_SCALE.xxl,
  '--spacing-xxxl': SPACING_SCALE.xxxl,
  
  // Touch target variables
  '--touch-minimum': TOUCH_TARGETS.minimum,
  '--touch-comfortable': TOUCH_TARGETS.comfortable,
  '--touch-large': TOUCH_TARGETS.large,
  
  // Animation variables
  '--transition-fast': ANIMATION_STYLES.duration.fast,
  '--transition-normal': ANIMATION_STYLES.duration.normal,
  '--transition-slow': ANIMATION_STYLES.duration.slow,
} as const

// Media query helpers
export const MEDIA_QUERIES = {
  mobile: `@media (min-width: ${BREAKPOINTS.mobile})`,
  tablet: `@media (min-width: ${BREAKPOINTS.tablet})`,
  desktop: `@media (min-width: ${BREAKPOINTS.desktop})`,
  wide: `@media (min-width: ${BREAKPOINTS.wide})`,
  ultrawide: `@media (min-width: ${BREAKPOINTS.ultrawide})`,
  
  // Max-width queries
  mobileOnly: `@media (max-width: ${BREAKPOINTS.tablet})`,
  tabletOnly: `@media (min-width: ${BREAKPOINTS.tablet}) and (max-width: ${BREAKPOINTS.desktop})`,
  desktopOnly: `@media (min-width: ${BREAKPOINTS.desktop}) and (max-width: ${BREAKPOINTS.wide})`,
  wideOnly: `@media (min-width: ${BREAKPOINTS.wide}) and (max-width: ${BREAKPOINTS.ultrawide})`,
  
  // Orientation queries
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
  
  // Device capability queries
  hover: '@media (hover: hover)',
  noHover: '@media (hover: none)',
  pointerFine: '@media (pointer: fine)',
  pointerCoarse: '@media (pointer: coarse)',
  
  // Reduced motion
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  
  // Color scheme
  dark: '@media (prefers-color-scheme: dark)',
  light: '@media (prefers-color-scheme: light)',
} as const

// Utility functions for generating responsive styles
export const createResponsiveStyle = (styles: Record<string, any>) => {
  return {
    // Base (mobile) styles
    ...styles.mobile,
    
    // Responsive styles using media queries
    [MEDIA_QUERIES.tablet]: styles.tablet,
    [MEDIA_QUERIES.desktop]: styles.desktop,
    [MEDIA_QUERIES.wide]: styles.wide,
    [MEDIA_QUERIES.ultrawide]: styles.ultrawide,
  }
}

export const createResponsiveValue = (values: Record<string, any>) => {
  return {
    mobile: values.mobile,
    tablet: values.tablet || values.mobile,
    desktop: values.desktop || values.tablet || values.mobile,
    wide: values.wide || values.desktop || values.tablet || values.mobile,
    ultrawide: values.ultrawide || values.wide || values.desktop || values.tablet || values.mobile,
  }
}

export const getResponsiveSpacing = (type: keyof typeof RESPONSIVE_SPACING) => {
  return RESPONSIVE_SPACING[type]
}

export const getResponsiveTypography = (type: keyof typeof RESPONSIVE_TYPOGRAPHY) => {
  return RESPONSIVE_TYPOGRAPHY[type]
}

export const getComponentStyles = (type: keyof typeof COMPONENT_STYLES) => {
  return COMPONENT_STYLES[type]
}

export const getAnimationStyles = (breakpoint: keyof typeof ANIMATION_STYLES.responsive) => {
  return ANIMATION_STYLES.responsive[breakpoint]
}

// Performance optimization helpers
export const PERFORMANCE_HINTS = {
  // Use these classes to optimize rendering
  'will-change-transform': { willChange: 'transform' },
  'will-change-opacity': { willChange: 'opacity' },
  'will-change-scroll': { willChange: 'scroll-position' },
  
  // Hardware acceleration hints
  'hardware-accelerated': {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    perspective: '1000px',
  },
  
  // Containment hints
  'contain-layout': { contain: 'layout' },
  'contain-paint': { contain: 'paint' },
  'contain-size': { contain: 'size' },
  'contain-style': { contain: 'style' },
} as const

// Accessibility helpers
export const ACCESSIBILITY_STYLES = {
  // Focus styles
  focusVisible: {
    outline: '2px solid currentColor',
    outlineOffset: '2px',
  },
  
  // High contrast mode
  highContrast: {
    borderWidth: '2px',
    borderColor: 'currentColor',
  },
  
  // Reduced motion
  reducedMotion: {
    transition: 'none',
    animation: 'none',
  },
  
  // Screen reader only
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  },
} as const

// Export all styles as a single object for easy consumption
export const RESPONSIVE_DESIGN_SYSTEM = {
  BREAKPOINTS,
  CONTAINER_MAX_WIDTHS,
  GRID_SYSTEMS,
  SPACING_SCALE,
  RESPONSIVE_SPACING,
  TYPOGRAPHY_SCALE,
  RESPONSIVE_TYPOGRAPHY,
  TOUCH_TARGETS,
  COMPONENT_STYLES,
  ANIMATION_STYLES,
  CSS_CUSTOM_PROPERTIES,
  MEDIA_QUERIES,
  PERFORMANCE_HINTS,
  ACCESSIBILITY_STYLES,
  
  // Utility functions
  createResponsiveStyle,
  createResponsiveValue,
  getResponsiveSpacing,
  getResponsiveTypography,
  getComponentStyles,
  getAnimationStyles,
} as const
