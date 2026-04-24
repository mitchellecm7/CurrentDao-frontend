// Responsive Typography Utilities
// Mobile-first typography system with automatic scaling and optimization

export interface TypographyScale {
  fontSize: string
  lineHeight: string
  fontWeight: string
  letterSpacing?: string
  wordSpacing?: string
}

export interface ResponsiveTypographyConfig {
  baseSize: number
  scale: number
  minSize: number
  maxSize: number
  lineHeight: number
  fontWeight: string
  letterSpacing?: string
}

export interface FluidTypographyConfig {
  minViewport: number
  maxViewport: number
  minFontSize: number
  maxFontSize: number
  minLineHeight?: number
  maxLineHeight?: number
  unit?: 'px' | 'rem' | 'em'
}

export interface TypographySystem {
  // Heading levels
  h1: TypographyScale
  h2: TypographyScale
  h3: TypographyScale
  h4: TypographyScale
  h5: TypographyScale
  h6: TypographyScale
  
  // Text levels
  body: TypographyScale
  bodyLarge: TypographyScale
  bodySmall: TypographyScale
  caption: TypographyScale
  overline: TypographyScale
  
  // Display styles
  display1: TypographyScale
  display2: TypographyScale
  display3: TypographyScale
}

export interface ResponsiveTypographyOptions {
  optimizeForReadability?: boolean
  respectUserPreferences?: boolean
  enableFluidScaling?: boolean
  clampLineLength?: boolean
  optimizeForDevice?: boolean
}

// Base typography scales
export const TYPOGRAPHY_BASE = {
  // Modular scale (1.25 ratio)
  modular: {
    base: 16,
    scale: 1.25,
    sizes: [12, 14, 16, 20, 25, 31, 39, 48, 60, 75, 94, 117]
  },
  
  // Perfect fourth (1.333 ratio)
  perfectFourth: {
    base: 16,
    scale: 1.333,
    sizes: [12, 16, 21, 28, 37, 50, 66, 88, 117, 156, 208, 277]
  },
  
  // Major third (1.2 ratio)
  majorThird: {
    base: 16,
    scale: 1.2,
    sizes: [11, 13, 16, 19, 23, 28, 33, 40, 48, 57, 69, 83]
  },
  
  // Golden ratio (1.618 ratio)
  goldenRatio: {
    base: 16,
    scale: 1.618,
    sizes: [11, 18, 29, 47, 76, 123, 199, 322, 521, 843, 1364, 2207]
  }
} as const

// Line height ratios for optimal readability
export const LINE_HEIGHT_RATIOS = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
  loose: 1.9,
} as const

// Character count per line for optimal reading
export const OPTIMAL_LINE_LENGTH = {
  mobile: 45,    // characters
  tablet: 60,
  desktop: 75,
  wide: 85,
  ultrawide: 95,
} as const

// Font weights
export const FONT_WEIGHTS = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const

// Letter spacing values
export const LETTER_SPACING = {
  tight: '-0.05em',
  normal: '0',
  relaxed: '0.025em',
  loose: '0.05em',
  extraLoose: '0.1em',
} as const

// Generate typography scale
export const generateTypographyScale = (
  baseSize: number,
  scale: number,
  lineHeight: number = 1.5
): TypographySystem => {
  const generateSize = (multiplier: number): TypographyScale => ({
    fontSize: `${Math.round(baseSize * multiplier)}px`,
    lineHeight: `${(Math.round(baseSize * multiplier) * lineHeight).toFixed(0)}px`,
    fontWeight: FONT_WEIGHTS.normal,
  })

  return {
    h1: generateSize(2.5),
    h2: generateSize(2),
    h3: generateSize(1.75),
    h4: generateSize(1.5),
    h5: generateSize(1.25),
    h6: generateSize(1.125),
    body: generateSize(1),
    bodyLarge: generateSize(1.125),
    bodySmall: generateSize(0.875),
    caption: generateSize(0.75),
    overline: generateSize(0.625),
    display1: generateSize(4),
    display2: generateSize(3),
    display3: generateSize(2.5),
  }
}

// Create responsive typography with fluid scaling
export const createResponsiveTypography = (
  config: ResponsiveTypographyConfig,
  fluidConfig?: FluidTypographyConfig
): TypographyScale => {
  const { baseSize, scale, minSize, maxSize, lineHeight, fontWeight, letterSpacing } = config

  if (fluidConfig) {
    // Create fluid typography
    const { minViewport, maxViewport, minFontSize, maxFontSize, minLineHeight, maxLineHeight, unit = 'px' } = fluidConfig
    
    const preferredFontSize = `clamp(${minFontSize}${unit}, calc(${minFontSize}${unit} + ${maxFontSize - minFontSize} * ((100vw - ${minViewport}px) / (${maxViewport} - ${minViewport}))), ${maxFontSize}${unit})`
    
    let preferredLineHeight = `${lineHeight}`
    if (minLineHeight && maxLineHeight) {
      preferredLineHeight = `clamp(${minLineHeight}, calc(${minLineHeight} + ${maxLineHeight - minLineHeight} * ((100vw - ${minViewport}px) / (${maxViewport} - ${minViewport}))), ${maxLineHeight})`
    }

    return {
      fontSize: preferredFontSize,
      lineHeight: preferredLineHeight,
      fontWeight,
      letterSpacing,
    }
  }

  // Static responsive typography
  const size = Math.min(Math.max(baseSize * scale, minSize), maxSize)
  
  return {
    fontSize: `${Math.round(size)}px`,
    lineHeight: `${Math.round(size * lineHeight)}px`,
    fontWeight,
    letterSpacing,
  }
}

// Generate responsive typography system
export const generateResponsiveTypographySystem = (
  options: ResponsiveTypographyOptions = {}
): TypographySystem => {
  const {
    optimizeForReadability = true,
    respectUserPreferences = true,
    enableFluidScaling = true,
    clampLineLength = true,
    optimizeForDevice = true,
  } = options

  // Base configuration
  const baseConfig: ResponsiveTypographyConfig = {
    baseSize: 16,
    scale: 1.25,
    minSize: 12,
    maxSize: 48,
    lineHeight: 1.5,
    fontWeight: FONT_WEIGHTS.normal,
  }

  // Fluid configurations for different breakpoints
  const fluidConfigs = {
    h1: {
      minViewport: 320,
      maxViewport: 1920,
      minFontSize: 28,
      maxFontSize: 48,
      minLineHeight: 1.2,
      maxLineHeight: 1.3,
    },
    h2: {
      minViewport: 320,
      maxViewport: 1920,
      minFontSize: 24,
      maxFontSize: 36,
      minLineHeight: 1.2,
      maxLineHeight: 1.3,
    },
    h3: {
      minViewport: 320,
      maxViewport: 1920,
      minFontSize: 20,
      maxFontSize: 30,
      minLineHeight: 1.3,
      maxLineHeight: 1.4,
    },
    body: {
      minViewport: 320,
      maxViewport: 1920,
      minFontSize: 16,
      maxFontSize: 18,
      minLineHeight: 1.5,
      maxLineHeight: 1.6,
    },
  }

  // Generate typography scales
  const generateScale = (
    baseConfig: ResponsiveTypographyConfig,
    fluidConfig?: FluidTypographyConfig,
    fontWeight: string = FONT_WEIGHTS.normal
  ): TypographyScale => {
    return createResponsiveTypography(
      { ...baseConfig, fontWeight },
      fluidConfig
    )
  }

  return {
    h1: generateScale(
      { ...baseConfig, scale: 2.5, fontWeight: FONT_WEIGHTS.bold },
      enableFluidScaling ? fluidConfigs.h1 : undefined
    ),
    h2: generateScale(
      { ...baseConfig, scale: 2, fontWeight: FONT_WEIGHTS.semibold },
      enableFluidScaling ? fluidConfigs.h2 : undefined
    ),
    h3: generateScale(
      { ...baseConfig, scale: 1.75, fontWeight: FONT_WEIGHTS.semibold },
      enableFluidScaling ? fluidConfigs.h3 : undefined
    ),
    h4: generateScale(
      { ...baseConfig, scale: 1.5, fontWeight: FONT_WEIGHTS.medium }
    ),
    h5: generateScale(
      { ...baseConfig, scale: 1.25, fontWeight: FONT_WEIGHTS.medium }
    ),
    h6: generateScale(
      { ...baseConfig, scale: 1.125, fontWeight: FONT_WEIGHTS.medium }
    ),
    body: generateScale(
      baseConfig,
      enableFluidScaling ? fluidConfigs.body : undefined
    ),
    bodyLarge: generateScale(
      { ...baseConfig, scale: 1.125 }
    ),
    bodySmall: generateScale(
      { ...baseConfig, scale: 0.875 }
    ),
    caption: generateScale(
      { ...baseConfig, scale: 0.75, fontWeight: FONT_WEIGHTS.medium }
    ),
    overline: generateScale(
      { ...baseConfig, scale: 0.625, fontWeight: FONT_WEIGHTS.semibold, letterSpacing: LETTER_SPACING.loose }
    ),
    display1: generateScale(
      { ...baseConfig, scale: 4, fontWeight: FONT_WEIGHTS.black }
    ),
    display2: generateScale(
      { ...baseConfig, scale: 3, fontWeight: FONT_WEIGHTS.black }
    ),
    display3: generateScale(
      { ...baseConfig, scale: 2.5, fontWeight: FONT_WEIGHTS.black }
    ),
  }
}

// Calculate optimal line length
export const calculateOptimalLineLength = (
  fontSize: number,
  targetCharacters: number,
  unit: 'px' | 'rem' | 'em' = 'px'
): string => {
  const averageCharacterWidth = fontSize * 0.6 // Approximate average character width
  const maxWidth = averageCharacterWidth * targetCharacters
  
  switch (unit) {
    case 'rem':
      return `${(maxWidth / 16).toFixed(2)}rem`
    case 'em':
      return `${(maxWidth / fontSize).toFixed(2)}em`
    default:
      return `${Math.round(maxWidth)}px`
  }
}

// Generate clamp CSS for fluid typography
export const generateFluidTypography = (
  minFontSize: number,
  maxFontSize: number,
  minViewport: number = 320,
  maxViewport: number = 1920,
  unit: 'px' | 'rem' | 'em' = 'px'
): string => {
  return `clamp(${minFontSize}${unit}, calc(${minFontSize}${unit} + ${maxFontSize - minFontSize} * ((100vw - ${minViewport}px) / (${maxViewport} - ${minViewport}))), ${maxFontSize}${unit})`
}

// Generate responsive line height
export const generateResponsiveLineHeight = (
  minLineHeight: number,
  maxLineHeight: number,
  minViewport: number = 320,
  maxViewport: number = 1920
): string => {
  return `clamp(${minLineHeight}, calc(${minLineHeight} + ${maxLineHeight - minLineHeight} * ((100vw - ${minViewport}px) / (${maxViewport} - ${minViewport}))), ${maxLineHeight})`
}

// Typography optimization utilities
export const optimizeTypographyForDevice = (
  typography: TypographyScale,
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultrawide'
): TypographyScale => {
  const optimizations = {
    mobile: {
      fontSize: typography.fontSize,
      lineHeight: '1.4', // Slightly tighter for mobile
      letterSpacing: typography.letterSpacing || '0.01em', // Slightly more spacing for readability
    },
    tablet: {
      fontSize: typography.fontSize,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
    },
    desktop: {
      fontSize: typography.fontSize,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
    },
    wide: {
      fontSize: typography.fontSize,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
    },
    ultrawide: {
      fontSize: typography.fontSize,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
    },
  }

  return { ...typography, ...optimizations[deviceType] }
}

// Check user font size preference
export const getUserFontSizePreference = (): number => {
  if (typeof window === 'undefined') return 16

  const rootFontSize = getComputedStyle(document.documentElement).fontSize
  return parseFloat(rootFontSize) || 16
}

// Adjust typography based on user preferences
export const adjustForUserPreferences = (
  typography: TypographyScale,
  userFontSize: number = 16
): TypographyScale => {
  const baseFontSize = 16
  const scale = userFontSize / baseFontSize
  
  const fontSize = parseFloat(typography.fontSize)
  const lineHeight = parseFloat(typography.lineHeight)
  
  return {
    ...typography,
    fontSize: `${Math.round(fontSize * scale)}px`,
    lineHeight: `${Math.round(lineHeight * scale)}px`,
  }
}

// Generate CSS custom properties for typography
export const generateTypographyCSS = (
  typographySystem: TypographySystem,
  prefix: string = '--typography'
): Record<string, string> => {
  const cssVars: Record<string, string> = {}
  
  Object.entries(typographySystem).forEach(([key, value]) => {
    cssVars[`${prefix}-${key}-font-size`] = value.fontSize
    cssVars[`${prefix}-${key}-line-height`] = value.lineHeight
    cssVars[`${prefix}-${key}-font-weight`] = value.fontWeight
    
    if (value.letterSpacing) {
      cssVars[`${prefix}-${key}-letter-spacing`] = value.letterSpacing
    }
    
    if (value.wordSpacing) {
      cssVars[`${prefix}-${key}-word-spacing`] = value.wordSpacing
    }
  })
  
  return cssVars
}

// Typography validation utilities
export const validateTypography = (typography: TypographyScale): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  
  // Validate font size
  if (!typography.fontSize) {
    errors.push('Font size is required')
  } else if (!/^\d+(px|rem|em)$/.test(typography.fontSize)) {
    errors.push('Font size must be a valid CSS unit (px, rem, em)')
  }
  
  // Validate line height
  if (!typography.lineHeight) {
    errors.push('Line height is required')
  } else if (!/^\d+(px|rem|em)$/.test(typography.lineHeight) && !/^\d+(\.\d+)?$/.test(typography.lineHeight)) {
    errors.push('Line height must be a valid CSS unit or number')
  }
  
  // Validate font weight
  if (!typography.fontWeight) {
    errors.push('Font weight is required')
  } else if (!/^[1-9]00$/.test(typography.fontWeight)) {
    errors.push('Font weight must be a valid CSS font weight (100-900)')
  }
  
  // Validate letter spacing
  if (typography.letterSpacing && !/^-?\d+(\.\d+)?(em|px)$/.test(typography.letterSpacing)) {
    errors.push('Letter spacing must be a valid CSS unit (em, px)')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Typography performance optimization
export const optimizeTypographyPerformance = (
  typographySystem: TypographySystem
): TypographySystem => {
  const optimized: TypographySystem = {} as TypographySystem
  
  Object.entries(typographySystem).forEach(([key, value]) => {
    optimized[key] = {
      ...value,
      // Round values to reduce decimal precision
      fontSize: `${Math.round(parseFloat(value.fontSize))}px`,
      lineHeight: `${Math.round(parseFloat(value.lineHeight))}px`,
    }
  })
  
  return optimized
}

// Responsive typography hook utilities
export interface UseResponsiveTypographyOptions {
  system?: TypographySystem
  breakpoint?: string
  optimizeForDevice?: boolean
  respectUserPreferences?: boolean
}

export const getResponsiveTypography = (
  type: keyof TypographySystem,
  options: UseResponsiveTypographyOptions = {}
): TypographyScale => {
  const {
    system = generateResponsiveTypographySystem(),
    breakpoint = 'desktop',
    optimizeForDevice: optimize = true,
    respectUserPreferences: respectPrefs = true,
  } = options
  
  let typography = system[type]
  
  // Optimize for device
  if (optimize) {
    typography = optimizeTypographyForDevice(typography, breakpoint as any)
  }
  
  // Respect user preferences
  if (respectPrefs) {
    const userFontSize = getUserFontSizePreference()
    typography = adjustForUserPreferences(typography, userFontSize)
  }
  
  return typography
}

// Export all utilities
export const ResponsiveTypographyUtils = {
  TYPOGRAPHY_BASE,
  LINE_HEIGHT_RATIOS,
  OPTIMAL_LINE_LENGTH,
  FONT_WEIGHTS,
  LETTER_SPACING,
  
  generateTypographyScale,
  createResponsiveTypography,
  generateResponsiveTypographySystem,
  calculateOptimalLineLength,
  generateFluidTypography,
  generateResponsiveLineHeight,
  optimizeTypographyForDevice,
  getUserFontSizePreference,
  adjustForUserPreferences,
  generateTypographyCSS,
  validateTypography,
  optimizeTypographyPerformance,
  getResponsiveTypography,
}
