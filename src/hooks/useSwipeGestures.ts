'use client';

import { useState, TouchEvent, useCallback, useRef } from 'react';

interface SwipeGestureOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useSwipeGestures(options: SwipeGestureOptions = {}) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const isSwiping = useRef(false);

  const threshold = options.threshold || 50;

  const onTouchStart = useCallback((e: TouchEvent) => {
    isSwiping.current = true;
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwiping.current) return;
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    isSwiping.current = false;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      if (Math.abs(distanceX) < threshold) return;
      if (distanceX > 0) {
        options.onSwipeLeft?.();
      } else {
        options.onSwipeRight?.();
      }
    } else {
      if (Math.abs(distanceY) < threshold) return;
      if (distanceY > 0) {
        options.onSwipeUp?.();
      } else {
        options.onSwipeDown?.();
      }
    }
  }, [touchStart, touchEnd, threshold, options]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isSwiping: isSwiping.current,
  };
}
