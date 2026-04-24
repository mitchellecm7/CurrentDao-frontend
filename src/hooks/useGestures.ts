/**
 * Enhanced Gesture Hook with 60fps Performance
 * Integrates with gesture services and provides optimized gesture handling
 */

'use client'

import { useState, useCallback, useRef, useEffect, TouchEvent, MouseEvent } from 'react'
import { GestureRecognitionService, GestureEvent } from '../services/gestures/gesture-recognition'
import { HapticFeedbackService } from '../services/gestures/haptic-feedback'
import { GestureAccessibilityService } from '../utils/gestures/accessibility'

interface GestureOptions {
  threshold?: number
  timeThreshold?: number
  enabled?: boolean
  hapticFeedback?: boolean
  voiceAnnouncements?: boolean
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  onPinch?: (scale: number) => void
  onPull?: (distance: number) => void
  onGesture?: (gesture: GestureEvent) => void
}

interface TouchPoint {
  x: number
  y: number
  time: number
}

interface GestureState {
  isActive: boolean
  currentGesture: string | null
  performance: {
    fps: number
    responseTime: number
    gestureCount: number
  }
}

export function useGestures(options: GestureOptions = {}) {
  const {
    threshold = 50,
    timeThreshold = 300,
    enabled = true,
    hapticFeedback = true,
    voiceAnnouncements = false,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    onPinch,
    onPull,
    onGesture
  } = options

  // State management
  const [gestureState, setGestureState] = useState<GestureState>({
    isActive: false,
    currentGesture: null,
    performance: {
      fps: 60,
      responseTime: 0,
      gestureCount: 0
    }
  })

  // Refs for performance optimization
  const gestureService = useRef(GestureRecognitionService.getInstance())
  const hapticService = useRef(HapticFeedbackService.getInstance())
  const accessibilityService = useRef(GestureAccessibilityService.getInstance())
  const cleanupGesture = useRef<(() => void) | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)
  
  // Performance tracking
  const frameCount = useRef(0)
  const lastFrameTime = useRef(performance.now())
  const gestureStartTime = useRef(0)
  const animationFrameId = useRef<number | null>(null)

  // Update accessibility settings
  useEffect(() => {
    if (voiceAnnouncements) {
      accessibilityService.current.updateSettings({ voiceAnnouncements: true })
    }
    if (hapticFeedback) {
      accessibilityService.current.updateSettings({ hapticFeedback: true })
    }
  }, [voiceAnnouncements, hapticFeedback])

  // Performance monitoring
  const updatePerformance = useCallback(() => {
    const now = performance.now()
    const delta = now - lastFrameTime.current
    const fps = Math.round(1000 / delta)
    
    frameCount.current++
    lastFrameTime.current = now
    
    // Update performance state every 60 frames
    if (frameCount.current % 60 === 0) {
      setGestureState(prev => ({
        ...prev,
        performance: {
          fps,
          responseTime: prev.performance.responseTime,
          gestureCount: prev.performance.gestureCount
        }
      }))
    }
  }, [])

  // Handle gesture events with performance tracking
  const handleGesture = useCallback(async (gesture: GestureEvent) => {
    if (!enabled) return

    const responseTime = Date.now() - gestureStartTime.current
    gestureStartTime.current = Date.now()

    // Update performance metrics
    setGestureState(prev => ({
      ...prev,
      isActive: true,
      currentGesture: gesture.type,
      performance: {
        ...prev.performance,
        responseTime,
        gestureCount: prev.performance.gestureCount + 1
      }
    }))

    // Provide haptic feedback
    if (hapticFeedback) {
      switch (gesture.type) {
        case 'swipe':
          await hapticService.current.onSwipeGesture(gesture.direction!)
          break
        case 'pinch':
          await hapticService.current.onPinchGesture(gesture.scale || 1)
          break
        case 'tap':
          await hapticService.current.onTapGesture()
          break
        case 'longpress':
          await hapticService.current.onLongPressGesture()
          break
        case 'pull':
          await hapticService.current.onPullToRefresh()
          break
      }
    }

    // Voice announcements
    if (voiceAnnouncements) {
      accessibilityService.current.announceGesture(gesture.type, true)
    }

    // Execute specific gesture handlers
    switch (gesture.type) {
      case 'swipe':
        switch (gesture.direction) {
          case 'left':
            onSwipeLeft?.()
            break
          case 'right':
            onSwipeRight?.()
            break
          case 'up':
            onSwipeUp?.()
            break
          case 'down':
            onSwipeDown?.()
            break
        }
        break
      case 'pinch':
        onPinch?.(gesture.scale || 1)
        break
      case 'tap':
        onTap?.()
        break
      case 'longpress':
        onLongPress?.()
        break
      case 'pull':
        onPull?.(gesture.distance || 0)
        break
    }

    // Call general gesture handler
    onGesture?.(gesture)

    // Reset gesture state after delay
    setTimeout(() => {
      setGestureState(prev => ({
        ...prev,
        isActive: false,
        currentGesture: null
      }))
    }, 100)
  }, [enabled, hapticFeedback, voiceAnnouncements, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap, onLongPress, onPinch, onPull, onGesture])

  // Setup gesture tracking on element
  const setupGestureTracking = useCallback((element: HTMLElement) => {
    if (!enabled || !element) return

    elementRef.current = element
    cleanupGesture.current = gestureService.current.startTracking(element, handleGesture)

    // Start performance monitoring
    const monitorPerformance = () => {
      updatePerformance()
      animationFrameId.current = requestAnimationFrame(monitorPerformance)
    }
    animationFrameId.current = requestAnimationFrame(monitorPerformance)
  }, [enabled, handleGesture, updatePerformance])

  // Cleanup gesture tracking
  const cleanup = useCallback(() => {
    if (cleanupGesture.current) {
      cleanupGesture.current()
      cleanupGesture.current = null
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }
    elementRef.current = null
  }, [])

  // Enhanced gesture handlers with RAF optimization
  const gestureHandlers = {
    onTouchStart: useCallback((e: TouchEvent) => {
      if (!enabled) return
      gestureStartTime.current = Date.now()
    }, [enabled]),
    
    onTouchMove: useCallback((e: TouchEvent) => {
      if (!enabled) return
      // RAF optimization handled by gesture service
    }, [enabled]),
    
    onTouchEnd: useCallback((e: TouchEvent) => {
      if (!enabled) return
      // RAF optimization handled by gesture service
    }, [enabled]),
    
    onTouchCancel: useCallback(() => {
      if (!enabled) return
      setGestureState(prev => ({
        ...prev,
        isActive: false,
        currentGesture: null
      }))
    }, [enabled])
  }

  // Keyboard gesture alternatives
  const keyboardHandlers = {
    onKeyDown: useCallback(async (e: KeyboardEvent) => {
      if (!enabled) return

      switch (e.key) {
        case 'ArrowLeft':
          await handleGesture({ type: 'swipe', direction: 'left', touchPoints: [], timestamp: Date.now() })
          break
        case 'ArrowRight':
          await handleGesture({ type: 'swipe', direction: 'right', touchPoints: [], timestamp: Date.now() })
          break
        case 'ArrowUp':
          await handleGesture({ type: 'swipe', direction: 'up', touchPoints: [], timestamp: Date.now() })
          break
        case 'ArrowDown':
          await handleGesture({ type: 'swipe', direction: 'down', touchPoints: [], timestamp: Date.now() })
          break
        case '+':
        case '=':
          await handleGesture({ type: 'pinch', scale: 1.2, touchPoints: [], timestamp: Date.now() })
          break
        case '-':
        case '_':
          await handleGesture({ type: 'pinch', scale: 0.8, touchPoints: [], timestamp: Date.now() })
          break
        case 'Enter':
        case ' ':
          await handleGesture({ type: 'tap', touchPoints: [], timestamp: Date.now() })
          break
        case 'F5':
          e.preventDefault()
          await handleGesture({ type: 'pull', distance: 100, touchPoints: [], timestamp: Date.now() })
          break
      }
    }, [enabled, handleGesture])
  }

  // Setup keyboard listeners
  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', keyboardHandlers.onKeyDown)
      return () => {
        document.removeEventListener('keydown', keyboardHandlers.onKeyDown)
      }
    }
  }, [enabled, keyboardHandlers])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    // Gesture state
    gestureState,
    
    // Event handlers
    gestureHandlers,
    keyboardHandlers,
    
    // Setup methods
    setupGestureTracking,
    cleanup,
    
    // Performance metrics
    getPerformanceMetrics: () => gestureState.performance,
    
    // Utility methods
    isGestureActive: () => gestureState.isActive,
    getCurrentGesture: () => gestureState.currentGesture,
    
    // Service access
    gestureService: gestureService.current,
    hapticService: hapticService.current,
    accessibilityService: accessibilityService.current
  }
}
