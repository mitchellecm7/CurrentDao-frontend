'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { breakpointManager, MediaQueryState, Breakpoint } from '@/services/responsive/breakpoint-manager'

export interface ResponsiveValue<T> {
  mobile?: T
  tablet?: T
  desktop?: T
  wide?: T
  ultrawide?: T
}

export interface ResponsiveConfig {
  debounceMs?: number
  enableOrientationChange?: boolean
  enableTouchDetection?: boolean
  customBreakpoints?: Breakpoint[]
}

export interface UseResponsiveDesignReturn extends MediaQueryState {
  // Breakpoint helpers
  isMinBreakpoint: (name: string) => boolean
  isMaxBreakpoint: (name: string) => boolean
  isBetweenBreakpoints: (min: string, max: string) => boolean
  
  // Responsive value helpers
  getResponsiveValue: <T>(values: ResponsiveValue<T>) => T | undefined
  getResponsiveClass: (baseClass: string, responsiveClasses: Partial<Record<string, string>>) => string
  getResponsiveStyle: (baseStyles: Record<string, any>, responsiveStyles: ResponsiveValue<Record<string, any>>) => Record<string, any>
  
  // Container and grid helpers
  getContainerStyles: (breakpointName?: string) => Record<string, any>
  getGridStyles: (breakpointName?: string) => Record<string, any>
  getGridColumns: (breakpointName?: string) => number
  
  // Performance helpers
  preloadBreakpointStyles: (breakpointName: string) => void
  
  // Device detection
  deviceInfo: {
    isTouch: boolean
    isMobileDevice: boolean
    isTabletDevice: boolean
    pixelRatio: number
    supportsHover: boolean
  }
}

export function useResponsiveDesign(config: ResponsiveConfig = {}): UseResponsiveDesignReturn {
  const [state, setState] = useState<MediaQueryState>(breakpointManager.getCurrentState())
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const stateRef = useRef(state)
  
  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    // Subscribe to breakpoint changes
    const unsubscribe = breakpointManager.subscribe((newState) => {
      setState(newState)
    })
    
    unsubscribeRef.current = unsubscribe

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  // Breakpoint helpers
  const isMinBreakpoint = useCallback((name: string): boolean => {
    return breakpointManager.isMinBreakpoint(name)
  }, [])

  const isMaxBreakpoint = useCallback((name: string): boolean => {
    return breakpointManager.isMaxBreakpoint(name)
  }, [])

  const isBetweenBreakpoints = useCallback((min: string, max: string): boolean => {
    return isMinBreakpoint(min) && isMaxBreakpoint(max)
  }, [isMinBreakpoint, isMaxBreakpoint])

  // Responsive value helpers
  const getResponsiveValue = useCallback(<T,>(values: ResponsiveValue<T>): T | undefined => {
    return breakpointManager.getResponsiveValue(values)
  }, [])

  const getResponsiveClass = useCallback((
    baseClass: string, 
    responsiveClasses: Partial<Record<string, string>>
  ): string => {
    const classes = [baseClass]
    const breakpointOrder = ['mobile', 'tablet', 'desktop', 'wide', 'ultrawide']
    
    // Add classes for active breakpoints
    for (let i = breakpointOrder.indexOf(state.breakpoint); i >= 0; i--) {
      const bpName = breakpointOrder[i]
      const responsiveClass = responsiveClasses[bpName]
      if (responsiveClass) {
        classes.push(responsiveClass)
      }
    }
    
    return classes.join(' ')
  }, [state.breakpoint])

  const getResponsiveStyle = useCallback((
    baseStyles: Record<string, any>,
    responsiveStyles: ResponsiveValue<Record<string, any>>
  ): Record<string, any> => {
    const responsiveValue = getResponsiveValue(responsiveStyles)
    return { ...baseStyles, ...responsiveValue }
  }, [getResponsiveValue])

  // Container and grid helpers
  const getContainerStyles = useCallback((breakpointName?: string): Record<string, any> => {
    return breakpointManager.getContainerStyles(breakpointName)
  }, [])

  const getGridStyles = useCallback((breakpointName?: string): Record<string, any> => {
    return breakpointManager.getGridStyles(breakpointName)
  }, [])

  const getGridColumns = useCallback((breakpointName?: string): number => {
    const breakpoint = breakpointName 
      ? breakpointManager.getBreakpoint(breakpointName)
      : breakpointManager.getBreakpoint(state.breakpoint)
    
    return breakpoint?.columns || 12
  }, [state.breakpoint])

  // Performance helpers
  const preloadBreakpointStyles = useCallback((breakpointName: string): void => {
    breakpointManager.preloadBreakpointStyles(breakpointName)
  }, [])

  // Device detection
  const deviceInfo = {
    isTouch: state.touchCapable,
    isMobileDevice: state.isMobile,
    isTabletDevice: state.isTablet,
    pixelRatio: window.devicePixelRatio || 1,
    supportsHover: !state.touchCapable || window.matchMedia('(hover: hover)').matches
  }

  return {
    ...state,
    isMinBreakpoint,
    isMaxBreakpoint,
    isBetweenBreakpoints,
    getResponsiveValue,
    getResponsiveClass,
    getResponsiveStyle,
    getContainerStyles,
    getGridStyles,
    getGridColumns,
    preloadBreakpointStyles,
    deviceInfo
  }
}

// Utility hooks for common responsive patterns
export function useBreakpoint(breakpointName: string): boolean {
  const { breakpoint } = useResponsiveDesign()
  return breakpoint === breakpointName
}

export function useMinBreakpoint(breakpointName: string): boolean {
  const { isMinBreakpoint } = useResponsiveDesign()
  return isMinBreakpoint(breakpointName)
}

export function useMaxBreakpoint(breakpointName: string): boolean {
  const { isMaxBreakpoint } = useResponsiveDesign()
  return isMaxBreakpoint(breakpointName)
}

export function useMobile(): boolean {
  const { isMobile } = useResponsiveDesign()
  return isMobile
}

export function useTablet(): boolean {
  const { isTablet } = useResponsiveDesign()
  return isTablet
}

export function useDesktop(): boolean {
  const { isDesktop } = useResponsiveDesign()
  return isDesktop
}

export function useTouch(): boolean {
  const { deviceInfo } = useResponsiveDesign()
  return deviceInfo.isTouch
}

export function useOrientation(): 'portrait' | 'landscape' {
  const { orientation } = useResponsiveDesign()
  return orientation
}

export function useResponsiveValue<T>(values: ResponsiveValue<T>): T | undefined {
  const { getResponsiveValue } = useResponsiveDesign()
  return getResponsiveValue(values)
}

export function useResponsiveClass(
  baseClass: string, 
  responsiveClasses: Partial<Record<string, string>>
): string {
  const { getResponsiveClass } = useResponsiveDesign()
  return getResponsiveClass(baseClass, responsiveClasses)
}

export function useResponsiveStyle(
  baseStyles: Record<string, any>,
  responsiveStyles: ResponsiveValue<Record<string, any>>
): Record<string, any> {
  const { getResponsiveStyle } = useResponsiveDesign()
  return getResponsiveStyle(baseStyles, responsiveStyles)
}

// Advanced hooks for specific use cases
export function useContainerStyles(breakpointName?: string): Record<string, any> {
  const { getContainerStyles } = useResponsiveDesign()
  return getContainerStyles(breakpointName)
}

export function useGridStyles(breakpointName?: string): Record<string, any> {
  const { getGridStyles } = useResponsiveDesign()
  return getGridStyles(breakpointName)
}

export function useGridColumns(breakpointName?: string): number {
  const { getGridColumns } = useResponsiveDesign()
  return getGridColumns(breakpointName)
}

export function useDeviceDetection() {
  const { deviceInfo } = useResponsiveDesign()
  return deviceInfo
}

// Hook for responsive images
export interface ResponsiveImageConfig {
  src: string
  alt: string
  sizes?: ResponsiveValue<string>
  srcSet?: ResponsiveValue<string>
  loading?: 'lazy' | 'eager'
  className?: string
}

export function useResponsiveImage(config: ResponsiveImageConfig) {
  const { getResponsiveValue, deviceInfo } = useResponsiveDesign()
  
  const currentSrc = getResponsiveValue(config.srcSet) || config.src
  const currentSizes = getResponsiveValue(config.sizes)
  
  return {
    src: currentSrc,
    alt: config.alt,
    sizes: currentSizes,
    loading: config.loading || 'lazy',
    className: config.className,
    deviceInfo
  }
}

// Hook for responsive animations
export interface ResponsiveAnimationConfig {
  duration?: ResponsiveValue<number>
  easing?: ResponsiveValue<string>
  delay?: ResponsiveValue<number>
}

export function useResponsiveAnimation(config: ResponsiveAnimationConfig = {}) {
  const { getResponsiveValue, breakpoint } = useResponsiveDesign()
  
  const duration = getResponsiveValue(config.duration) || 300
  const easing = getResponsiveValue(config.easing) || 'ease'
  const delay = getResponsiveValue(config.delay) || 0
  
  return {
    duration,
    easing,
    delay,
    style: {
      transitionDuration: `${duration}ms`,
      transitionTimingFunction: easing,
      transitionDelay: `${delay}ms`,
    },
    breakpoint
  }
}

// Hook for responsive layouts
export interface ResponsiveLayoutConfig {
  sidebar?: ResponsiveValue<boolean>
  header?: ResponsiveValue<boolean>
  footer?: ResponsiveValue<boolean>
  columns?: ResponsiveValue<number>
  spacing?: ResponsiveValue<number>
}

export function useResponsiveLayout(config: ResponsiveLayoutConfig = {}) {
  const { getResponsiveValue, getGridColumns, breakpoint } = useResponsiveDesign()
  
  const showSidebar = getResponsiveValue(config.sidebar) ?? false
  const showHeader = getResponsiveValue(config.header) ?? true
  const showFooter = getResponsiveValue(config.footer) ?? true
  const columns = getResponsiveValue(config.columns) ?? getGridColumns()
  const spacing = getResponsiveValue(config.spacing) ?? 24
  
  return {
    showSidebar,
    showHeader,
    showFooter,
    columns,
    spacing,
    breakpoint,
    layoutClasses: [
      showSidebar ? 'has-sidebar' : '',
      showHeader ? 'has-header' : '',
      showFooter ? 'has-footer' : '',
      `columns-${columns}`,
      `spacing-${spacing}`
    ].filter(Boolean).join(' ')
  }
}

// Performance monitoring hook
export function useResponsivePerformance() {
  const [fps, setFps] = useState(60)
  const [isLowEndDevice, setIsLowEndDevice] = useState(false)
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const animationFrameId = useRef<number>()

  useEffect(() => {
    const measureFPS = () => {
      frameCount.current++
      const currentTime = performance.now()
      
      if (currentTime >= lastTime.current + 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current))
        setFps(currentFps)
        setIsLowEndDevice(currentFps < 30)
        
        frameCount.current = 0
        lastTime.current = currentTime
      }
      
      animationFrameId.current = requestAnimationFrame(measureFPS)
    }

    animationFrameId.current = requestAnimationFrame(measureFPS)

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  return {
    fps,
    isLowEndDevice,
    shouldReduceAnimations: isLowEndDevice || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
}
