'use client'

import { useState, useCallback, useRef, TouchEvent, MouseEvent } from 'react'

interface GestureOptions {
  threshold?: number
  timeThreshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  onPinch?: (scale: number) => void
}

interface TouchPoint {
  x: number
  y: number
  time: number
}

export function useGestures(options: GestureOptions = {}) {
  const {
    threshold = 50,
    timeThreshold = 300,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    onPinch
  } = options

  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null)
  const [touchEnd, setTouchEnd] = useState<TouchPoint | null>(null)
  const [lastTap, setLastTap] = useState<number>(0)
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [initialDistance, setInitialDistance] = useState<number>(0)
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isSwiping = useRef(false)
  const isPinching = useRef(false)

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    const now = Date.now()
    
    setTouchEnd(null)
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: now
    })

    isSwiping.current = true

    // Handle double tap
    if (onDoubleTap && now - lastTap < 300) {
      onDoubleTap()
      setLastTap(0)
      return
    }
    setLastTap(now)

    // Handle long press
    if (onLongPress) {
      setIsLongPressing(false)
      longPressTimerRef.current = setTimeout(() => {
        setIsLongPressing(true)
        onLongPress()
      }, 500)
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch) {
      isPinching.current = true
      setInitialDistance(getDistance(e.touches[0], e.touches[1]))
    }
  }, [onDoubleTap, onLongPress, onPinch, lastTap])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwiping.current && !isPinching.current) return

    // Handle pinch gesture
    if (e.touches.length === 2 && isPinching.current && onPinch) {
      const currentDistance = getDistance(e.touches[0], e.touches[1])
      const scale = currentDistance / initialDistance
      onPinch(scale)
      return
    }

    // Handle swipe gesture
    if (e.touches.length === 1 && isSwiping.current) {
      const touch = e.touches[0]
      setTouchEnd({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      })

      // Cancel long press if moved
      if (longPressTimerRef.current) {
        const deltaX = Math.abs(touch.clientX - (touchStart?.x || 0))
        const deltaY = Math.abs(touch.clientY - (touchStart?.y || 0))
        if (deltaX > 10 || deltaY > 10) {
          clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
        }
      }
    }
  }, [touchStart, initialDistance, onPinch])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart || !touchEnd) {
      resetState()
      return
    }

    const deltaX = touchEnd.x - touchStart.x
    const deltaY = touchEnd.y - touchStart.y
    const deltaTime = touchEnd.time - touchStart.time
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // Handle swipe gestures
    if (deltaTime < timeThreshold && !isLongPressing) {
      if (isHorizontalSwipe) {
        if (Math.abs(deltaX) >= threshold) {
          if (deltaX > 0) {
            onSwipeRight?.()
          } else {
            onSwipeLeft?.()
          }
        } else if (onTap && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
          onTap()
        }
      } else {
        if (Math.abs(deltaY) >= threshold) {
          if (deltaY > 0) {
            onSwipeDown?.()
          } else {
            onSwipeUp?.()
          }
        } else if (onTap && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
          onTap()
        }
      }
    }

    resetState()
  }, [touchStart, touchEnd, threshold, timeThreshold, isLongPressing, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap])

  const resetState = useCallback(() => {
    setTouchStart(null)
    setTouchEnd(null)
    setIsLongPressing(false)
    isSwiping.current = false
    isPinching.current = false
    setInitialDistance(0)
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: resetState
  }

  return {
    swipeHandlers,
    resetState,
    isSwiping: isSwiping.current,
    isLongPressing,
    isPinching: isPinching.current
  }
}
