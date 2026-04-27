'use client'

import { forwardRef, ReactNode, CSSProperties, useRef, useEffect, useState, useCallback } from 'react'
import { useResponsiveDesign, useTouch } from '@/hooks/useResponsiveDesign'

export interface TouchButtonProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  
  // Touch-specific props
  touchSize?: 'small' | 'medium' | 'large'
  touchFeedback?: boolean
  longPressDelay?: number
  vibrationPattern?: number[]
  
  // Standard button props
  disabled?: boolean
  onClick?: (event: React.MouseEvent | React.TouchEvent) => void
  onTouchStart?: (event: React.TouchEvent) => void
  onTouchEnd?: (event: React.TouchEvent) => void
  onTouchMove?: (event: React.TouchEvent) => void
  onTouchCancel?: (event: React.TouchEvent) => void
  
  // Gesture props
  onLongPress?: (event: React.TouchEvent) => void
  onDoubleTap?: (event: React.TouchEvent) => void
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', event: React.TouchEvent) => void
  onPinch?: (scale: number, event: React.TouchEvent) => void
  
  // Visual feedback
  activeScale?: number
  activeOpacity?: number
  rippleEffect?: boolean
}

export interface TouchSliderProps {
  value: number
  min: number
  max: number
  step?: number
  disabled?: boolean
  className?: string
  style?: CSSProperties
  
  // Touch-specific props
  thumbSize?: 'small' | 'medium' | 'large'
  showValue?: boolean
  valueFormat?: (value: number) => string
  trackHeight?: number
  
  // Events
  onChange?: (value: number) => void
  onChangeStart?: (value: number) => void
  onChangeEnd?: (value: number) => void
  
  // Visual feedback
  animated?: boolean
  color?: string
}

export interface TouchSwipeCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  
  // Swipe actions
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  
  // Configuration
  swipeThreshold?: number
  snapBack?: boolean
  disableSwipe?: boolean
  
  // Visual feedback
  swipeIndicator?: boolean
  leftIndicator?: ReactNode
  rightIndicator?: ReactNode
  upIndicator?: ReactNode
  downIndicator?: ReactNode
}

export interface TouchPullToRefreshProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  
  // Pull to refresh props
  onRefresh?: () => Promise<void> | void
  refreshing?: boolean
  pullThreshold?: number
  refreshIndicator?: ReactNode
  
  // Visual feedback
  pullHeight?: number
  backgroundColor?: string
  spinnerColor?: string
}

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({
    children,
    className = '',
    style: propStyle = {},
    touchSize = 'medium',
    touchFeedback = true,
    longPressDelay = 500,
    vibrationPattern = [10],
    disabled = false,
    onClick,
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    onTouchCancel,
    onLongPress,
    onDoubleTap,
    onSwipe,
    onPinch,
    activeScale = 0.95,
    activeOpacity = 0.8,
    rippleEffect = false,
  }, ref) => {
    const [isActive, setIsActive] = useState(false)
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
    const lastTapTimeRef = useRef<number>(0)
    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const { deviceInfo } = useResponsiveDesign()
    const isTouchDevice = deviceInfo.isTouch

    // Get touch size dimensions
    const getTouchSize = () => {
      switch (touchSize) {
        case 'small': return { width: '44px', height: '44px', fontSize: '14px' }
        case 'medium': return { width: '48px', height: '48px', fontSize: '16px' }
        case 'large': return { width: '52px', height: '52px', fontSize: '18px' }
        default: return { width: '48px', height: '48px', fontSize: '16px' }
      }
    }

    // Create ripple effect
    const createRipple = useCallback((event: React.MouseEvent | React.TouchEvent) => {
      if (!rippleEffect || !buttonRef.current) return

      const rect = buttonRef.current.getBoundingClientRect()
      let x: number, y: number

      if ('touches' in event) {
        x = event.touches[0].clientX - rect.left
        y = event.touches[0].clientY - rect.top
      } else {
        x = event.clientX - rect.left
        y = event.clientY - rect.top
      }

      const newRipple = {
        id: Date.now(),
        x,
        y
      }

      setRipples(prev => [...prev, newRipple])

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }, [rippleEffect])

    // Handle touch start
    const handleTouchStart = useCallback((event: React.TouchEvent) => {
      if (disabled) return

      setIsActive(true)
      touchStartRef.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        time: Date.now()
      }

      // Start long press timer
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          onLongPress(event)
          if (isTouchDevice && 'vibrate' in navigator) {
            navigator.vibrate(vibrationPattern)
          }
        }, longPressDelay)
      }

      onTouchStart?.(event)
    }, [disabled, onLongPress, onTouchStart, longPressDelay, vibrationPattern, isTouchDevice])

    // Handle touch end
    const handleTouchEnd = useCallback((event: React.TouchEvent) => {
      if (disabled) return

      setIsActive(false)

      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      // Check for double tap
      if (onDoubleTap && touchStartRef.current) {
        const now = Date.now()
        if (now - lastTapTimeRef.current < 300) {
          onDoubleTap(event)
          if (isTouchDevice && 'vibrate' in navigator) {
            navigator.vibrate([10])
          }
        }
        lastTapTimeRef.current = now
      }

      // Check for swipe
      if (onSwipe && touchStartRef.current) {
        const deltaX = event.changedTouches[0].clientX - touchStartRef.current.x
        const deltaY = event.changedTouches[0].clientY - touchStartRef.current.y
        const deltaTime = Date.now() - touchStartRef.current.time

        if (deltaTime < 500) { // Swipe must be quick
          const absDeltaX = Math.abs(deltaX)
          const absDeltaY = Math.abs(deltaY)

          if (absDeltaX > 50 && absDeltaX > absDeltaY) {
            onSwipe(deltaX > 0 ? 'right' : 'left', event)
          } else if (absDeltaY > 50 && absDeltaY > absDeltaX) {
            onSwipe(deltaY > 0 ? 'down' : 'up', event)
          }
        }
      }

      touchStartRef.current = null
      onTouchEnd?.(event)
    }, [disabled, onDoubleTap, onSwipe, onTouchEnd, isTouchDevice])

    // Handle touch move
    const handleTouchMove = useCallback((event: React.TouchEvent) => {
      if (disabled) return

      // Cancel long press if moved too much
      if (longPressTimerRef.current && touchStartRef.current) {
        const deltaX = Math.abs(event.touches[0].clientX - touchStartRef.current.x)
        const deltaY = Math.abs(event.touches[0].clientY - touchStartRef.current.y)
        
        if (deltaX > 10 || deltaY > 10) {
          clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
        }
      }

      onTouchMove?.(event)
    }, [disabled, onTouchMove])

    // Handle touch cancel
    const handleTouchCancel = useCallback((event: React.TouchEvent) => {
      setIsActive(false)
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      touchStartRef.current = null
      onTouchCancel?.(event)
    }, [onTouchCancel])

    // Handle click (for non-touch devices)
    const handleClick = useCallback((event: React.MouseEvent) => {
      if (disabled) return
      
      createRipple(event)
      onClick?.(event)
    }, [disabled, onClick, createRipple])

    const touchSize = getTouchSize()
    const buttonStyles: CSSProperties = {
      ...touchSize,
      minHeight: touchSize.height,
      minWidth: touchSize.width,
      fontSize: touchSize.fontSize,
      transform: isActive && touchFeedback ? `scale(${activeScale})` : 'scale(1)',
      opacity: isActive && touchFeedback ? activeOpacity : 1,
      transition: 'transform 150ms ease-out, opacity 150ms ease-out',
      touchAction: 'manipulation',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      position: 'relative',
      overflow: 'hidden',
      ...propStyle,
    }

    const buttonClasses = [
      'touch-button',
      `touch-button--${touchSize}`,
      isActive && 'touch-button--active',
      disabled && 'touch-button--disabled',
      isTouchDevice && 'touch-button--touch',
      className
    ].filter(Boolean).join(' ')

    return (
      <button
        ref={(node) => {
          buttonRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={buttonClasses}
        style={buttonStyles}
        disabled={disabled}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchCancel={handleTouchCancel}
      >
        {children}
        
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="touch-button-ripple"
            style={{
              position: 'absolute',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              animation: 'ripple 0.6s ease-out',
              left: ripple.x,
              top: ripple.y,
              width: '20px',
              height: '20px',
            }}
          />
        ))}
      </button>
    )
  }
)

TouchButton.displayName = 'TouchButton'

export const TouchSlider = forwardRef<HTMLDivElement, TouchSliderProps>(
  ({
    value,
    min,
    max,
    step = 1,
    disabled = false,
    className = '',
    style: propStyle = {},
    thumbSize = 'medium',
    showValue = false,
    valueFormat = (v) => v.toString(),
    trackHeight = 4,
    onChange,
    onChangeStart,
    onChangeEnd,
    animated = true,
    color = '#3b82f6',
  }, ref) => {
    const [isDragging, setIsDragging] = useState(false)
    const [currentValue, setCurrentValue] = useState(value)
    const trackRef = useRef<HTMLDivElement>(null)
    const { deviceInfo } = useResponsiveDesign()
    const isTouchDevice = deviceInfo.isTouch

    // Get thumb size
    const getThumbSize = () => {
      switch (thumbSize) {
        case 'small': return { width: '20px', height: '20px' }
        case 'medium': return { width: '24px', height: '24px' }
        case 'large': return { width: '28px', height: '28px' }
        default: return { width: '24px', height: '24px' }
      }
    }

    // Calculate value from position
    const getValueFromPosition = useCallback((clientX: number) => {
      if (!trackRef.current) return value

      const rect = trackRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const newValue = min + percent * (max - min)
      
      // Snap to step if provided
      if (step > 0) {
        const steppedValue = Math.round(newValue / step) * step
        return Math.max(min, Math.min(max, steppedValue))
      }
      
      return Math.max(min, Math.min(max, newValue))
    }, [value, min, max, step])

    // Handle slider interaction
    const handleStart = useCallback((clientX: number) => {
      if (disabled) return
      
      setIsDragging(true)
      const newValue = getValueFromPosition(clientX)
      setCurrentValue(newValue)
      onChangeStart?.(newValue)
      onChange?.(newValue)
    }, [disabled, getValueFromPosition, onChangeStart, onChange])

    const handleMove = useCallback((clientX: number) => {
      if (!isDragging || disabled) return
      
      const newValue = getValueFromPosition(clientX)
      setCurrentValue(newValue)
      onChange?.(newValue)
    }, [isDragging, disabled, getValueFromPosition, onChange])

    const handleEnd = useCallback(() => {
      if (!isDragging) return
      
      setIsDragging(false)
      onChangeEnd?.(currentValue)
    }, [isDragging, currentValue, onChangeEnd])

    // Mouse events
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      e.preventDefault()
      handleStart(e.clientX)
    }, [handleStart])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      handleMove(e.clientX)
    }, [handleMove])

    const handleMouseUp = useCallback(() => {
      handleEnd()
    }, [handleEnd])

    // Touch events
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      e.preventDefault()
      handleStart(e.touches[0].clientX)
    }, [handleStart])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX)
    }, [handleMove])

    const handleTouchEnd = useCallback(() => {
      handleEnd()
    }, [handleEnd])

    // Global mouse/touch move and up events
    useEffect(() => {
      if (isDragging) {
        const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
          const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
          if (clientX !== undefined) {
            handleMove(clientX)
          }
        }

        const handleGlobalEnd = () => {
          handleEnd()
        }

        if (isTouchDevice) {
          document.addEventListener('touchmove', handleGlobalMove as any)
          document.addEventListener('touchend', handleGlobalEnd as any)
        } else {
          document.addEventListener('mousemove', handleGlobalMove)
          document.addEventListener('mouseup', handleGlobalEnd)
        }

        return () => {
          if (isTouchDevice) {
            document.removeEventListener('touchmove', handleGlobalMove as any)
            document.removeEventListener('touchend', handleGlobalEnd as any)
          } else {
            document.removeEventListener('mousemove', handleGlobalMove)
            document.removeEventListener('mouseup', handleGlobalEnd)
          }
        }
      }
    }, [isDragging, handleMove, handleEnd, isTouchDevice])

    // Update current value when prop changes
    useEffect(() => {
      setCurrentValue(value)
    }, [value])

    // Calculate thumb position
    const percent = ((currentValue - min) / (max - min)) * 100
    const thumbSize = getThumbSize()

    const sliderStyles: CSSProperties = {
      position: 'relative',
      height: `${Math.max(trackHeight, parseInt(thumbSize.height))}px`,
      display: 'flex',
      alignItems: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'none',
      ...propStyle,
    }

    const trackStyles: CSSProperties = {
      flex: 1,
      height: `${trackHeight}px`,
      backgroundColor: disabled ? '#e5e7eb' : '#d1d5db',
      borderRadius: `${trackHeight / 2}px`,
      position: 'relative',
      overflow: 'hidden',
    }

    const progressStyles: CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: `${percent}%`,
      backgroundColor: disabled ? '#9ca3af' : color,
      borderRadius: `${trackHeight / 2}px`,
      transition: animated && !isDragging ? 'width 150ms ease-out' : 'none',
    }

    const thumbStyles: CSSProperties = {
      position: 'absolute',
      top: '50%',
      left: `${percent}%`,
      transform: 'translate(-50%, -50%)',
      width: thumbSize.width,
      height: thumbSize.height,
      backgroundColor: disabled ? '#9ca3af' : color,
      borderRadius: '50%',
      border: '2px solid white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      cursor: disabled ? 'not-allowed' : 'grab',
      transition: animated && !isDragging ? 'left 150ms ease-out' : 'none',
      zIndex: 1,
    }

    const sliderClasses = [
      'touch-slider',
      isDragging && 'touch-slider--dragging',
      disabled && 'touch-slider--disabled',
      isTouchDevice && 'touch-slider--touch',
      className
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={(node) => {
          trackRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={sliderClasses}
        style={sliderStyles}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div style={trackStyles}>
          <div style={progressStyles} />
          <div style={thumbStyles} />
        </div>
        
        {showValue && (
          <div className="touch-slider-value" style={{
            marginLeft: '12px',
            fontSize: '14px',
            fontWeight: '500',
            color: disabled ? '#9ca3af' : '#374151',
            minWidth: '40px',
          }}>
            {valueFormat(currentValue)}
          </div>
        )}
      </div>
    )
  }
)

TouchSlider.displayName = 'TouchSlider'

export const TouchSwipeCard = forwardRef<HTMLDivElement, TouchSwipeCardProps>(
  ({
    children,
    className = '',
    style: propStyle = {},
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    swipeThreshold = 50,
    snapBack = true,
    disableSwipe = false,
    swipeIndicator = true,
    leftIndicator,
    rightIndicator,
    upIndicator,
    downIndicator,
  }, ref) => {
    const [swipeOffset, setSwipeOffset] = useState(0)
    const [isSwiping, setIsSwiping] = useState(false)
    const [showIndicators, setShowIndicators] = useState(false)
    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
    const cardRef = useRef<HTMLDivElement>(null)

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      if (disableSwipe) return
      
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      }
      setIsSwiping(true)
      setSwipeOffset(0)
    }, [disableSwipe])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (!isSwiping || !touchStartRef.current || disableSwipe) return
      
      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      
      // Only allow horizontal or vertical swipe, not diagonal
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setSwipeOffset(deltaX)
      } else {
        setSwipeOffset(deltaY)
      }
    }, [isSwiping, disableSwipe])

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
      if (!isSwiping || !touchStartRef.current || disableSwipe) return
      
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time
      
      setIsSwiping(false)
      
      // Check if it's a valid swipe
      if (deltaTime < 500) { // Quick swipe
        const absDeltaX = Math.abs(deltaX)
        const absDeltaY = Math.abs(deltaY)
        
        if (absDeltaX > swipeThreshold && absDeltaX > absDeltaY) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight()
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft()
          }
        } else if (absDeltaY > swipeThreshold && absDeltaY > absDeltaX) {
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown()
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp()
          }
        }
      }
      
      // Snap back if enabled
      if (snapBack) {
        setSwipeOffset(0)
      }
      
      touchStartRef.current = null
    }, [isSwiping, disableSwipe, swipeThreshold, snapBack, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

    const cardStyles: CSSProperties = {
      transform: `translateX(${swipeOffset}px) translateY(${swipeOffset > 0 ? '0' : swipeOffset}px)`,
      transition: isSwiping ? 'none' : 'transform 300ms ease-out',
      touchAction: 'pan-y',
      ...propStyle,
    }

    const cardClasses = [
      'touch-swipe-card',
      isSwiping && 'touch-swipe-card--swiping',
      disableSwipe && 'touch-swipe-card--disabled',
      className
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={(node) => {
          cardRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={cardClasses}
        style={cardStyles}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
        
        {/* Swipe indicators */}
        {swipeIndicator && !disableSwipe && (
          <div className="touch-swipe-indicators">
            {onSwipeLeft && (
              <div className="touch-swipe-indicator touch-swipe-indicator--left">
                {leftIndicator || <span>←</span>}
              </div>
            )}
            {onSwipeRight && (
              <div className="touch-swipe-indicator touch-swipe-indicator--right">
                {rightIndicator || <span>→</span>}
              </div>
            )}
            {onSwipeUp && (
              <div className="touch-swipe-indicator touch-swipe-indicator--up">
                {upIndicator || <span>↑</span>}
              </div>
            )}
            {onSwipeDown && (
              <div className="touch-swipe-indicator touch-swipe-indicator--down">
                {downIndicator || <span>↓</span>}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)

TouchSwipeCard.displayName = 'TouchSwipeCard'

export const TouchPullToRefresh = forwardRef<HTMLDivElement, TouchPullToRefreshProps>(
  ({
    children,
    className = '',
    style: propStyle = {},
    onRefresh,
    refreshing = false,
    pullThreshold = 80,
    refreshIndicator,
    pullHeight = 60,
    backgroundColor = '#f3f4f6',
    spinnerColor = '#3b82f6',
  }, ref) => {
    const [pullDistance, setPullDistance] = useState(0)
    const [isPulling, setIsPulling] = useState(false)
    const [canRefresh, setCanRefresh] = useState(false)
    const touchStartRef = useRef<{ y: number } | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = { y: touch.clientY }
      setIsPulling(true)
    }, [])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (!isPulling || !touchStartRef.current || refreshing) return
      
      const touch = e.touches[0]
      const deltaY = touch.clientY - touchStartRef.current.y
      
      // Only allow pulling down
      if (deltaY > 0) {
        setPullDistance(Math.min(deltaY * 0.5, pullHeight * 1.5)) // Reduce the pull distance for better UX
        setCanRefresh(deltaY > pullThreshold)
      }
    }, [isPulling, refreshing, pullThreshold, pullHeight])

    const handleTouchEnd = useCallback(() => {
      if (!isPulling) return
      
      setIsPulling(false)
      
      if (canRefresh && onRefresh) {
        onRefresh()
      }
      
      setPullDistance(0)
      setCanRefresh(false)
      touchStartRef.current = null
    }, [isPulling, canRefresh, onRefresh])

    const containerStyles: CSSProperties = {
      position: 'relative',
      minHeight: '100vh',
      backgroundColor,
      transition: isPulling ? 'none' : 'transform 300ms ease-out',
      transform: `translateY(${pullDistance}px)`,
      ...propStyle,
    }

    const containerClasses = [
      'touch-pull-to-refresh',
      isPulling && 'touch-pull-to-refresh--pulling',
      refreshing && 'touch-pull-to-refresh--refreshing',
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull indicator */}
        <div 
          className="touch-pull-indicator"
          style={{
            position: 'absolute',
            top: `${pullHeight}px`,
            left: 0,
            right: 0,
            height: pullHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `translateY(-${pullDistance}px)`,
            transition: isPulling ? 'none' : 'transform 300ms ease-out',
            opacity: pullDistance > 0 ? 1 : 0,
          }}
        >
          {refreshIndicator || (
            <div className="touch-pull-spinner" style={{
              width: '24px',
              height: '24px',
              border: `2px solid ${spinnerColor}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
            }} />
          )}
        </div>
        
        {children}
      </div>
    )
  }
)

TouchPullToRefresh.displayName = 'TouchPullToRefresh'

// Add CSS animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes ripple {
      from {
        width: 0;
        height: 0;
        opacity: 1;
      }
      to {
        width: 100px;
        height: 100px;
        opacity: 0;
      }
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `
  document.head.appendChild(style)
}
