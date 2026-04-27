'use client'

import { forwardRef, ReactNode, CSSProperties, useEffect, useState, useCallback, useRef } from 'react'
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign'

export interface OrientationHandlerProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  
  // Orientation behavior
  lockOrientation?: 'portrait' | 'landscape' | 'any'
  autoRotate?: boolean
  respectSystemPreference?: boolean
  
  // Layout adaptation
  portraitLayout?: ReactNode
  landscapeLayout?: ReactNode
  squareLayout?: ReactNode
  
  // Transition settings
  transitionDuration?: number
  transitionEasing?: string
  
  // Events
  onOrientationChange?: (orientation: 'portrait' | 'landscape' | 'square') => void
  onOrientationLock?: (locked: boolean, orientation: 'portrait' | 'landscape' | 'any') => void
  onOrientationUnlock?: () => void
  
  // Visual feedback
  showOrientationIndicator?: boolean
  indicatorPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  indicatorStyle?: CSSProperties
  
  // Performance
  debounceMs?: number
  optimizeForDevice?: boolean
}

export interface OrientationLockButtonProps {
  className?: string
  style?: CSSProperties
  lockTo?: 'portrait' | 'landscape' | 'auto'
  onLock?: (orientation: 'portrait' | 'landscape' | 'auto') => void
  onUnlock?: () => void
  showIcon?: boolean
  showLabel?: boolean
  size?: 'small' | 'medium' | 'large'
}

export interface OrientationIndicatorProps {
  orientation: 'portrait' | 'landscape' | 'square'
  className?: string
  style?: CSSProperties
  showLabel?: boolean
  showIcon?: boolean
  animated?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export const OrientationHandler = forwardRef<HTMLDivElement, OrientationHandlerProps>(
  ({
    children,
    className = '',
    style: propStyle = {},
    lockOrientation,
    autoRotate = true,
    respectSystemPreference = true,
    portraitLayout,
    landscapeLayout,
    squareLayout,
    transitionDuration = 300,
    transitionEasing = 'ease-in-out',
    onOrientationChange,
    onOrientationLock,
    onOrientationUnlock,
    showOrientationIndicator = false,
    indicatorPosition = 'top-right',
    indicatorStyle,
    debounceMs = 100,
    optimizeForDevice = true,
  }, ref) => {
    const [currentOrientation, setCurrentOrientation] = useState<'portrait' | 'landscape' | 'square'>('portrait')
    const [isLocked, setIsLocked] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [systemPreference, setSystemPreference] = useState<'portrait' | 'landscape' | 'any'>('any')
    
    const debounceTimerRef = useRef<number | null>(null)
    const previousOrientationRef = useRef<'portrait' | 'landscape' | 'square'>('portrait')
    const containerRef = useRef<HTMLDivElement>(null)
    
    const { width, height, deviceInfo } = useResponsiveDesign()
    const isTouchDevice = deviceInfo.isTouch

    // Calculate current orientation
    const calculateOrientation = useCallback(() => {
      const aspectRatio = width / height
      const tolerance = 0.1 // 10% tolerance for square detection
      
      if (Math.abs(aspectRatio - 1) <= tolerance) {
        return 'square'
      } else if (width > height) {
        return 'landscape'
      } else {
        return 'portrait'
      }
    }, [width, height])

    // Handle orientation change
    const handleOrientationChange = useCallback(() => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = window.setTimeout(() => {
        const newOrientation = calculateOrientation()
        
        if (newOrientation !== previousOrientationRef.current) {
          setIsTransitioning(true)
          setCurrentOrientation(newOrientation)
          previousOrientationRef.current = newOrientation
          
          onOrientationChange?.(newOrientation)
          
          // Reset transition state after animation
          setTimeout(() => {
            setIsTransitioning(false)
          }, transitionDuration)
        }
      }, debounceMs)
    }, [calculateOrientation, debounceMs, transitionDuration, onOrientationChange])

    // Lock orientation
    const lockOrientationToDevice = useCallback(async (orientation: 'portrait' | 'landscape' | 'any') => {
      if (!isTouchDevice || !('screen' in window) || !('orientation' in window.screen)) {
        return false
      }

      try {
        await (window.screen.orientation as any).lock(orientation)
        setIsLocked(true)
        onOrientationLock?.(true, orientation)
        return true
      } catch (error) {
        console.warn('Failed to lock orientation:', error)
        return false
      }
    }, [isTouchDevice, onOrientationLock])

    // Unlock orientation
    const unlockOrientation = useCallback(async () => {
      if (!isTouchDevice || !('screen' in window) || !('orientation' in window.screen)) {
        return
      }

      try {
        await (window.screen.orientation as any).unlock()
        setIsLocked(false)
        onOrientationUnlock?.()
      } catch (error) {
        console.warn('Failed to unlock orientation:', error)
      }
    }, [isTouchDevice, onOrientationUnlock])

    // Get system orientation preference
    useEffect(() => {
      if (!respectSystemPreference) return

      const checkSystemPreference = () => {
        if ('matchMedia' in window) {
          const portraitQuery = window.matchMedia('(orientation: portrait)')
          const landscapeQuery = window.matchMedia('(orientation: landscape)')
          
          if (portraitQuery.matches) {
            setSystemPreference('portrait')
          } else if (landscapeQuery.matches) {
            setSystemPreference('landscape')
          } else {
            setSystemPreference('any')
          }
        }
      }

      checkSystemPreference()

      // Listen for system preference changes
      const portraitQuery = window.matchMedia('(orientation: portrait)')
      const landscapeQuery = window.matchMedia('(orientation: landscape)')
      
      portraitQuery.addEventListener('change', checkSystemPreference)
      landscapeQuery.addEventListener('change', checkSystemPreference)

      return () => {
        portraitQuery.removeEventListener('change', checkSystemPreference)
        landscapeQuery.removeEventListener('change', checkSystemPreference)
      }
    }, [respectSystemPreference])

    // Handle window resize/orientation changes
    useEffect(() => {
      const handleResize = () => {
        handleOrientationChange()
      }

      const handleOrientationChange = () => {
        // Small delay to allow the browser to update dimensions
        setTimeout(handleResize, 50)
      }

      window.addEventListener('resize', handleResize)
      window.addEventListener('orientationchange', handleOrientationChange)

      return () => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('orientationchange', handleOrientationChange)
      }
    }, [handleOrientationChange])

    // Auto-lock orientation if specified
    useEffect(() => {
      if (lockOrientation && lockOrientation !== 'any' && autoRotate && isTouchDevice) {
        lockOrientationToDevice(lockOrientation)
      }

      return () => {
        if (isLocked) {
          unlockOrientation()
        }
      }
    }, [lockOrientation, autoRotate, isTouchDevice, isLocked])

    // Update orientation on mount
    useEffect(() => {
      handleOrientationChange()
    }, [handleOrientationChange])

    // Get appropriate layout based on orientation
    const getLayoutForOrientation = () => {
      switch (currentOrientation) {
        case 'portrait':
          return portraitLayout || children
        case 'landscape':
          return landscapeLayout || children
        case 'square':
          return squareLayout || children
        default:
          return children
      }
    }

    // Get container styles
    const containerStyles: CSSProperties = {
      width: '100%',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      transition: isTransitioning ? `transform ${transitionDuration}ms ${transitionEasing}` : 'none',
      transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
      ...propStyle,
    }

    // Get indicator position styles
    const getIndicatorPosition = () => {
      switch (indicatorPosition) {
        case 'top-left':
          return { top: '16px', left: '16px' }
        case 'top-right':
          return { top: '16px', right: '16px' }
        case 'bottom-left':
          return { bottom: '16px', left: '16px' }
        case 'bottom-right':
          return { bottom: '16px', right: '16px' }
        default:
          return { top: '16px', right: '16px' }
      }
    }

    const containerClasses = [
      'orientation-handler',
      `orientation-handler--${currentOrientation}`,
      isTransitioning && 'orientation-handler--transitioning',
      isLocked && 'orientation-handler--locked',
      isTouchDevice && 'orientation-handler--touch',
      className
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={(node) => {
          containerRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={containerClasses}
        style={containerStyles}
        data-orientation={currentOrientation}
        data-locked={isLocked}
      >
        {/* Layout content */}
        <div className="orientation-handler-content">
          {getLayoutForOrientation()}
        </div>

        {/* Orientation indicator */}
        {showOrientationIndicator && (
          <OrientationIndicator
            orientation={currentOrientation}
            position={indicatorPosition}
            style={indicatorStyle}
            animated={isTransitioning}
          />
        )}

        {/* Performance optimization overlay */}
        {optimizeForDevice && isTransitioning && (
          <div 
            className="orientation-handler-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        )}
      </div>
    )
  }
)

OrientationHandler.displayName = 'OrientationHandler'

export const OrientationLockButton = forwardRef<HTMLButtonElement, OrientationLockButtonProps>(
  ({
    className = '',
    style: propStyle = {},
    lockTo = 'auto',
    onLock,
    onUnlock,
    showIcon = true,
    showLabel = false,
    size = 'medium',
  }, ref) => {
    const [currentLock, setCurrentLock] = useState<'portrait' | 'landscape' | 'auto'>('auto')
    const [isLocked, setIsLocked] = useState(false)
    const { deviceInfo } = useResponsiveDesign()
    const isTouchDevice = deviceInfo.isTouch

    const handleLockToggle = async () => {
      if (!isTouchDevice) return

      try {
        if (isLocked) {
          await (window.screen.orientation as any).unlock()
          setIsLocked(false)
          setCurrentLock('auto')
          onUnlock?.()
        } else {
          const orientation = lockTo === 'auto' ? 'any' : lockTo
          await (window.screen.orientation as any).lock(orientation)
          setIsLocked(true)
          setCurrentLock(lockTo)
          onLock?.(lockTo)
        }
      } catch (error) {
        console.warn('Failed to toggle orientation lock:', error)
      }
    }

    const getSizeStyles = () => {
      switch (size) {
        case 'small':
          return { width: '32px', height: '32px', fontSize: '12px' }
        case 'medium':
          return { width: '40px', height: '40px', fontSize: '14px' }
        case 'large':
          return { width: '48px', height: '48px', fontSize: '16px' }
        default:
          return { width: '40px', height: '40px', fontSize: '14px' }
      }
    }

    const getIcon = () => {
      if (!showIcon) return null

      switch (currentLock) {
        case 'portrait':
          return '📱'
        case 'landscape':
          return '📱'
        default:
          return '🔄'
      }
    }

    const buttonStyles: CSSProperties = {
      ...getSizeStyles(),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: showLabel && showIcon ? '4px' : '0',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: isLocked ? '#3b82f6' : '#e5e7eb',
      color: isLocked ? 'white' : '#374151',
      cursor: isTouchDevice ? 'pointer' : 'not-allowed',
      transition: 'all 200ms ease',
      ...propStyle,
    }

    const buttonClasses = [
      'orientation-lock-button',
      isLocked && 'orientation-lock-button--locked',
      !isTouchDevice && 'orientation-lock-button--disabled',
      className
    ].filter(Boolean).join(' ')

    return (
      <button
        ref={ref}
        className={buttonClasses}
        style={buttonStyles}
        onClick={handleLockToggle}
        disabled={!isTouchDevice}
        title={isLocked ? 'Unlock orientation' : 'Lock orientation'}
      >
        {getIcon()}
        {showLabel && (
          <span style={{ fontSize: 'inherit' }}>
            {isLocked ? 'Locked' : 'Auto'}
          </span>
        )}
      </button>
    )
  }
)

OrientationLockButton.displayName = 'OrientationLockButton'

export const OrientationIndicator = forwardRef<HTMLDivElement, OrientationIndicatorProps>(
  ({
    orientation,
    className = '',
    style: propStyle = {},
    showLabel = true,
    showIcon = true,
    animated = false,
    position = 'top-right',
  }, ref) => {
    const getPositionStyles = () => {
      switch (position) {
        case 'top-left':
          return { top: '16px', left: '16px' }
        case 'top-right':
          return { top: '16px', right: '16px' }
        case 'bottom-left':
          return { bottom: '16px', left: '16px' }
        case 'bottom-right':
          return { bottom: '16px', right: '16px' }
        default:
          return { top: '16px', right: '16px' }
      }
    }

    const getIcon = () => {
      if (!showIcon) return null

      switch (orientation) {
        case 'portrait':
          return '📱'
        case 'landscape':
          return '📱'
        case 'square':
          return '⬜'
        default:
          return '📱'
      }
    }

    const indicatorStyles: CSSProperties = {
      position: 'fixed',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 10px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      zIndex: 1000,
      transition: animated ? 'all 300ms ease-in-out' : 'none',
      transform: animated ? 'scale(1)' : 'scale(1)',
      ...getPositionStyles(),
      ...propStyle,
    }

    const indicatorClasses = [
      'orientation-indicator',
      `orientation-indicator--${orientation}`,
      animated && 'orientation-indicator--animated',
      className
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={ref}
        className={indicatorClasses}
        style={indicatorStyles}
      >
        {getIcon()}
        {showLabel && (
          <span style={{ textTransform: 'capitalize' }}>
            {orientation}
          </span>
        )}
      </div>
    )
  }
)

OrientationIndicator.displayName = 'OrientationIndicator'

// Hook for orientation-specific utilities
export interface UseOrientationOptions {
  debounceMs?: number
  respectSystemPreference?: boolean
  autoLock?: 'portrait' | 'landscape' | 'any'
}

export const useOrientation = (options: UseOrientationOptions = {}) => {
  const {
    debounceMs = 100,
    respectSystemPreference = true,
    autoLock
  } = options

  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'square'>('portrait')
  const [isLocked, setIsLocked] = useState(false)
  const [systemPreference, setSystemPreference] = useState<'portrait' | 'landscape' | 'any'>('any')
  
  const { width, height, deviceInfo } = useResponsiveDesign()
  const isTouchDevice = deviceInfo.isTouch

  // Calculate orientation
  const calculateOrientation = useCallback(() => {
    const aspectRatio = width / height
    const tolerance = 0.1
    
    if (Math.abs(aspectRatio - 1) <= tolerance) {
      return 'square'
    } else if (width > height) {
      return 'landscape'
    } else {
      return 'portrait'
    }
  }, [width, height])

  // Lock orientation
  const lock = useCallback(async (orientation: 'portrait' | 'landscape' | 'any') => {
    if (!isTouchDevice) return false

    try {
      await (window.screen.orientation as any).lock(orientation)
      setIsLocked(true)
      return true
    } catch (error) {
      console.warn('Failed to lock orientation:', error)
      return false
    }
  }, [isTouchDevice])

  // Unlock orientation
  const unlock = useCallback(async () => {
    if (!isTouchDevice) return

    try {
      await (window.screen.orientation as any).unlock()
      setIsLocked(false)
    } catch (error) {
      console.warn('Failed to unlock orientation:', error)
    }
  }, [isTouchDevice])

  // Update orientation on resize
  useEffect(() => {
    const handleResize = () => {
      const newOrientation = calculateOrientation()
      setOrientation(newOrientation)
    }

    const handleOrientationChange = () => {
      setTimeout(handleResize, 50)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [calculateOrientation])

  // Auto-lock if specified
  useEffect(() => {
    if (autoLock && autoLock !== 'any' && isTouchDevice) {
      lock(autoLock)
    }

    return () => {
      if (isLocked) {
        unlock()
      }
    }
  }, [autoLock, isTouchDevice, isLocked])

  // Get system preference
  useEffect(() => {
    if (!respectSystemPreference) return

    const checkSystemPreference = () => {
      if ('matchMedia' in window) {
        const portraitQuery = window.matchMedia('(orientation: portrait)')
        const landscapeQuery = window.matchMedia('(orientation: landscape)')
        
        if (portraitQuery.matches) {
          setSystemPreference('portrait')
        } else if (landscapeQuery.matches) {
          setSystemPreference('landscape')
        } else {
          setSystemPreference('any')
        }
      }
    }

    checkSystemPreference()

    const portraitQuery = window.matchMedia('(orientation: portrait)')
    const landscapeQuery = window.matchMedia('(orientation: landscape)')
    
    portraitQuery.addEventListener('change', checkSystemPreference)
    landscapeQuery.addEventListener('change', checkSystemPreference)

    return () => {
      portraitQuery.removeEventListener('change', checkSystemPreference)
      landscapeQuery.removeEventListener('change', checkSystemPreference)
    }
  }, [respectSystemPreference])

  return {
    orientation,
    isLocked,
    systemPreference,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    isSquare: orientation === 'square',
    aspectRatio: width / height,
    canLock: isTouchDevice && 'screen' in window && 'orientation' in window.screen,
    lock,
    unlock,
  }
}
