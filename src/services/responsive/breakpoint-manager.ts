export interface Breakpoint {
  name: string
  min: number
  max?: number
  columns?: number
  gutter?: number
  container?: {
    padding: number
    maxWidth?: number
  }
}

export interface BreakpointConfig {
  breakpoints: Breakpoint[]
  defaultBreakpoint: string
  containerMaxWidth: number
  gutterWidth: number
}

export interface MediaQueryState {
  breakpoint: string
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isWide: boolean
  touchCapable: boolean
}

export interface CSSProperties {
  [key: string]: string | number | undefined
}

export class BreakpointManager {
  private static instance: BreakpointManager
  private config: BreakpointConfig
  private listeners: Set<(state: MediaQueryState) => void> = new Set()
  private mediaQueries: Map<string, MediaQueryList> = new Map()
  private currentState: MediaQueryState
  private resizeObserver: ResizeObserver | null = null
  private resizeTimeout: number | null = null

  private constructor() {
    this.config = this.getDefaultConfig()
    this.currentState = this.calculateCurrentState()
    this.setupMediaQueries()
    this.setupResizeObserver()
    this.setupEventListeners()
  }

  static getInstance(): BreakpointManager {
    if (!BreakpointManager.instance) {
      BreakpointManager.instance = new BreakpointManager()
    }
    return BreakpointManager.instance
  }

  private getDefaultConfig(): BreakpointConfig {
    return {
      breakpoints: [
        {
          name: 'mobile',
          min: 320,
          max: 767,
          columns: 4,
          gutter: 16,
          container: { padding: 16 }
        },
        {
          name: 'tablet',
          min: 768,
          max: 1023,
          columns: 8,
          gutter: 24,
          container: { padding: 24 }
        },
        {
          name: 'desktop',
          min: 1024,
          max: 1439,
          columns: 12,
          gutter: 24,
          container: { padding: 32, maxWidth: 1200 }
        },
        {
          name: 'wide',
          min: 1440,
          max: 1919,
          columns: 12,
          gutter: 32,
          container: { padding: 40, maxWidth: 1400 }
        },
        {
          name: 'ultrawide',
          min: 1920,
          columns: 16,
          gutter: 32,
          container: { padding: 48, maxWidth: 1600 }
        }
      ],
      defaultBreakpoint: 'desktop',
      containerMaxWidth: 1200,
      gutterWidth: 24
    }
  }

  private setupMediaQueries(): void {
    this.config.breakpoints.forEach(breakpoint => {
      const query = this.createMediaQuery(breakpoint)
      const mediaQuery = window.matchMedia(query)
      
      mediaQuery.addEventListener('change', () => {
        this.updateState()
      })
      
      this.mediaQueries.set(breakpoint.name, mediaQuery)
    })
  }

  private createMediaQuery(breakpoint: Breakpoint): string {
    let query = `(min-width: ${breakpoint.min}px)`
    if (breakpoint.max) {
      query += ` and (max-width: ${breakpoint.max}px)`
    }
    return query
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        // Debounce resize events
        if (this.resizeTimeout) {
          clearTimeout(this.resizeTimeout)
        }
        
        this.resizeTimeout = window.setTimeout(() => {
          this.updateState()
        }, 100) // 100ms debounce
      })

      // Observe the document element
      this.resizeObserver.observe(document.documentElement)
    }
  }

  private setupEventListeners(): void {
    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      // Small delay to allow the browser to update dimensions
      setTimeout(() => {
        this.updateState()
      }, 100)
    })

    // Listen for device pixel ratio changes (for zoom)
    window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
      .addEventListener('change', () => {
        this.updateState()
      })
  }

  private calculateCurrentState(): MediaQueryState {
    const width = window.innerWidth
    const height = window.innerHeight
    const orientation = width > height ? 'landscape' : 'portrait'
    
    const breakpoint = this.getCurrentBreakpoint(width)
    const touchCapable = this.isTouchCapable()

    return {
      breakpoint,
      width,
      height,
      orientation,
      isMobile: ['mobile'].includes(breakpoint),
      isTablet: ['tablet'].includes(breakpoint),
      isDesktop: ['desktop', 'wide', 'ultrawide'].includes(breakpoint),
      isWide: ['wide', 'ultrawide'].includes(breakpoint),
      touchCapable
    }
  }

  private getCurrentBreakpoint(width: number): string {
    // Find the matching breakpoint
    for (const breakpoint of this.config.breakpoints.slice().reverse()) {
      if (width >= breakpoint.min && (!breakpoint.max || width <= breakpoint.max)) {
        return breakpoint.name
      }
    }
    return this.config.defaultBreakpoint
  }

  private isTouchCapable(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    )
  }

  private updateState(): void {
    const newState = this.calculateCurrentState()
    
    if (JSON.stringify(newState) !== JSON.stringify(this.currentState)) {
      this.currentState = newState
      this.notifyListeners()
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState)
      } catch (error) {
        console.error('Error in breakpoint listener:', error)
      }
    })
  }

  // Public API
  subscribe(listener: (state: MediaQueryState) => void): () => void {
    this.listeners.add(listener)
    
    // Immediately call with current state
    listener(this.currentState)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  getCurrentState(): MediaQueryState {
    return this.currentState
  }

  getBreakpoint(name: string): Breakpoint | undefined {
    return this.config.breakpoints.find(bp => bp.name === name)
  }

  getAllBreakpoints(): Breakpoint[] {
    return [...this.config.breakpoints]
  }

  getContainerStyles(breakpointName?: string): CSSProperties {
    const breakpoint = breakpointName 
      ? this.getBreakpoint(breakpointName)
      : this.getBreakpoint(this.currentState.breakpoint)
    
    if (!breakpoint?.container) return {}

    const styles: CSSProperties = {
      padding: `0 ${breakpoint.container.padding}px`,
      margin: '0 auto',
    }

    if (breakpoint.container.maxWidth) {
      styles.maxWidth = `${breakpoint.container.maxWidth}px`
    }

    return styles
  }

  getGridStyles(breakpointName?: string): CSSProperties {
    const breakpoint = breakpointName 
      ? this.getBreakpoint(breakpointName)
      : this.getBreakpoint(this.currentState.breakpoint)
    
    if (!breakpoint) return {}

    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${breakpoint.columns}, 1fr)`,
      gap: `${breakpoint.gutter || this.config.gutterWidth}px`,
    }
  }

  getResponsiveValue<T>(values: Partial<Record<string, T>>): T | undefined {
    const currentBreakpoint = this.currentState.breakpoint
    const breakpointOrder = this.config.breakpoints.map(bp => bp.name)
    
    // Find the first matching value from current breakpoint down
    for (let i = breakpointOrder.indexOf(currentBreakpoint); i >= 0; i--) {
      const bpName = breakpointOrder[i]
      if (values[bpName] !== undefined) {
        return values[bpName]
      }
    }
    
    return undefined
  }

  isBreakpointActive(name: string): boolean {
    return this.currentState.breakpoint === name
  }

  isMinBreakpoint(name: string): boolean {
    const breakpoint = this.getBreakpoint(name)
    if (!breakpoint) return false
    
    return this.currentState.width >= breakpoint.min
  }

  isMaxBreakpoint(name: string): boolean {
    const breakpoint = this.getBreakpoint(name)
    if (!breakpoint) return false
    
    return !breakpoint.max || this.currentState.width <= breakpoint.max
  }

  updateConfig(config: Partial<BreakpointConfig>): void {
    this.config = { ...this.config, ...config }
    
    // Recreate media queries with new config
    this.mediaQueries.forEach(mq => mq.removeEventListener('change', () => {}))
    this.mediaQueries.clear()
    this.setupMediaQueries()
    
    // Update current state
    this.updateState()
  }

  getViewportMetrics(): {
    width: number
    height: number
    aspectRatio: number
    pixelRatio: number
    orientation: 'portrait' | 'landscape'
  } {
    return {
      width: this.currentState.width,
      height: this.currentState.height,
      aspectRatio: this.currentState.width / this.currentState.height,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: this.currentState.orientation
    }
  }

  // Performance optimization methods
  preloadBreakpointStyles(breakpointName: string): void {
    const breakpoint = this.getBreakpoint(breakpointName)
    if (!breakpoint) return

    // Create a temporary media query to preload styles
    const query = this.createMediaQuery(breakpoint)
    const mediaQuery = window.matchMedia(query)
    
    // This will trigger the browser to evaluate the media query
    // and potentially preload related styles
    mediaQuery.matches
  }

  destroy(): void {
    // Clean up event listeners
    this.mediaQueries.forEach(mq => {
      mq.removeEventListener('change', () => {})
    })
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
    
    this.listeners.clear()
  }
}

// Export singleton instance
export const breakpointManager = BreakpointManager.getInstance()

// Utility functions for common responsive patterns
export const createResponsiveClass = (
  baseClass: string,
  responsiveClasses: Partial<Record<string, string>>
): string => {
  const state = breakpointManager.getCurrentState()
  const classes = [baseClass]
  
  const breakpointOrder = breakpointManager.getAllBreakpoints().map(bp => bp.name)
  
  // Add classes for active breakpoints
  for (let i = breakpointOrder.indexOf(state.breakpoint); i >= 0; i--) {
    const bpName = breakpointOrder[i]
    const responsiveClass = responsiveClasses[bpName]
    if (responsiveClass) {
      classes.push(responsiveClass)
    }
  }
  
  return classes.join(' ')
}

export const createResponsiveStyle = (
  baseStyles: CSSProperties,
  responsiveStyles: Partial<Record<string, CSSProperties>>
): CSSProperties => {
  const responsiveValue = breakpointManager.getResponsiveValue(responsiveStyles)
  return { ...baseStyles, ...responsiveValue }
}
