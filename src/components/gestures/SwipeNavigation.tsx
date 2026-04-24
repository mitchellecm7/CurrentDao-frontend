/**
 * Swipe Navigation Component
 * Provides swipe gesture navigation between screens and sections with 50ms response time
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GestureRecognitionService, GestureEvent } from '../../services/gestures/gesture-recognition';
import { HapticFeedbackService } from '../../services/gestures/haptic-feedback';
import { GestureAccessibilityService } from '../../utils/gestures/accessibility';

interface SwipeNavigationProps {
  children: React.ReactNode[];
  onNavigationChange?: (index: number) => void;
  initialIndex?: number;
  enabled?: boolean;
  swipeThreshold?: number;
  animationDuration?: number;
  showIndicators?: boolean;
  loop?: boolean;
  className?: string;
}

interface SwipeIndicatorProps {
  count: number;
  activeIndex: number;
  onIndicatorClick?: (index: number) => void;
  showLabels?: boolean;
  labels?: string[];
}

const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({
  count,
  activeIndex,
  onIndicatorClick,
  showLabels = false,
  labels = []
}) => {
  return (
    <div className="flex justify-center items-center space-x-2 p-4">
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          onClick={() => onIndicatorClick?.(index)}
          className={`
            relative transition-all duration-200 ease-out
            ${index === activeIndex 
              ? 'w-8 h-2 bg-blue-500 rounded-full' 
              : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
            }
            ${onIndicatorClick ? 'cursor-pointer' : 'cursor-default'}
          `}
          aria-label={showLabels && labels[index] ? labels[index] : `Slide ${index + 1}`}
        >
          {showLabels && labels[index] && (
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
              {labels[index]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export const SwipeNavigation: React.FC<SwipeNavigationProps> = ({
  children,
  onNavigationChange,
  initialIndex = 0,
  enabled = true,
  swipeThreshold = 50,
  animationDuration = 300,
  showIndicators = true,
  loop = false,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [showGestureHint, setShowGestureHint] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const gestureService = useRef(GestureRecognitionService.getInstance());
  const hapticService = useRef(HapticFeedbackService.getInstance());
  const accessibilityService = useRef(GestureAccessibilityService.getInstance());
  const cleanupGesture = useRef<(() => void) | null>(null);
  
  // Performance optimization: use RAF for smooth animations
  const animationFrameRef = useRef<number | null>(null);
  const lastGestureTime = useRef(0);

  // Handle swipe navigation with 50ms response time
  const handleSwipe = useCallback(async (gesture: GestureEvent) => {
    if (!enabled || gesture.type !== 'swipe') return;

    const now = Date.now();
    // Throttle gestures to maintain performance
    if (now - lastGestureTime.current < 50) return;
    lastGestureTime.current = now;

    let newIndex = currentIndex;

    switch (gesture.direction) {
      case 'left':
        newIndex = currentIndex + 1;
        break;
      case 'right':
        newIndex = currentIndex - 1;
        break;
      default:
        return;
    }

    // Handle loop navigation
    if (loop) {
      if (newIndex < 0) newIndex = children.length - 1;
      if (newIndex >= children.length) newIndex = 0;
    } else {
      // Boundary checks
      if (newIndex < 0 || newIndex >= children.length) {
        await hapticService.current.onGestureError();
        accessibilityService.current.announceGesture('swipe_boundary', false);
        return;
      }
    }

    // Update index with haptic feedback
    setCurrentIndex(newIndex);
    await hapticService.current.onSwipeGesture(gesture.direction!);
    accessibilityService.current.announceGesture(`swipe_${gesture.direction}`, true);
    onNavigationChange?.(newIndex);

    // Hide gesture hint after first successful swipe
    setShowGestureHint(false);
  }, [currentIndex, children.length, enabled, loop, onNavigationChange]);

  // Handle keyboard navigation for accessibility
  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    if (!enabled) return;

    let newIndex = currentIndex;
    let gestureType = '';

    switch (e.key) {
      case 'ArrowLeft':
        newIndex = currentIndex - 1;
        gestureType = 'swipe_left';
        break;
      case 'ArrowRight':
        newIndex = currentIndex + 1;
        gestureType = 'swipe_right';
        break;
      default:
        return;
    }

    if (loop) {
      if (newIndex < 0) newIndex = children.length - 1;
      if (newIndex >= children.length) newIndex = 0;
    } else {
      if (newIndex < 0 || newIndex >= children.length) return;
    }

    setCurrentIndex(newIndex);
    await hapticService.current.onSwipeGesture(gestureType === 'swipe_left' ? 'left' : 'right');
    accessibilityService.current.announceGesture(gestureType, true);
    onNavigationChange?.(newIndex);
  }, [currentIndex, children.length, enabled, loop, onNavigationChange]);

  // Handle indicator click
  const handleIndicatorClick = useCallback(async (index: number) => {
    if (!enabled || index === currentIndex) return;

    setCurrentIndex(index);
    await hapticService.current.onTapGesture();
    accessibilityService.current.announceGesture('tap', true);
    onNavigationChange?.(index);
  }, [currentIndex, enabled, onNavigationChange]);

  // Setup gesture recognition
  useEffect(() => {
    if (!containerRef.current || !enabled) return;

    const element = containerRef.current;
    cleanupGesture.current = gestureService.current.startTracking(element, handleSwipe);

    // Show gesture hint for new users
    const hasSeenHint = localStorage.getItem('swipe-gesture-hint-seen');
    if (!hasSeenHint) {
      setShowGestureHint(true);
      setTimeout(() => {
        setShowGestureHint(false);
        localStorage.setItem('swipe-gesture-hint-seen', 'true');
      }, 3000);
    }

    return () => {
      if (cleanupGesture.current) {
        cleanupGesture.current();
      }
    };
  }, [handleSwipe, enabled]);

  // Setup keyboard navigation
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const [[page, direction], setPage] = useState([initialIndex, 0]);

  const paginate = useCallback((newDirection: number) => {
    let newIndex = page + newDirection;
    
    if (loop) {
      if (newIndex < 0) newIndex = children.length - 1;
      if (newIndex >= children.length) newIndex = 0;
    } else {
      newIndex = Math.max(0, Math.min(children.length - 1, newIndex));
    }
    
    setPage([newIndex, newDirection]);
    setCurrentIndex(newIndex);
    onNavigationChange?.(newIndex);
  }, [page, children.length, loop, onNavigationChange]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      role="region"
      aria-label="Swipe navigation container"
      aria-roledescription="carousel"
    >
      {/* Gesture Hint Overlay */}
      <AnimatePresence>
        {showGestureHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  animate={{ x: [0, 20, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-4xl"
                >
                  👉
                </motion.div>
              </div>
              <p className="text-center text-gray-700">
                Swipe left or right to navigate between screens
              </p>
              <button
                onClick={() => setShowGestureHint(false)}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Got it
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Content */}
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 w-full h-full"
            drag={enabled ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(e, { offset, velocity }) => {
              setIsDragging(false);
              const swipeThreshold = 50;
              const swipePower = Math.abs(offset.x) * velocity.x;

              if (swipePower < swipeThreshold) {
                paginate(0);
              } else {
                paginate(offset.x > 0 ? -1 : 1);
              }
            }}
          >
            {children[page]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Indicators */}
      {showIndicators && children.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0">
          <SwipeIndicator
            count={children.length}
            activeIndex={page}
            onIndicatorClick={handleIndicatorClick}
          />
        </div>
      )}

      {/* Accessibility: Screen boundary indicators */}
      {accessibilityService.current.getSettings().visualIndicators && (
        <div className="absolute top-0 left-0 right-0 flex justify-between p-2 pointer-events-none">
          <div 
            className={`w-2 h-8 rounded-full transition-opacity ${
              page === 0 && !loop ? 'bg-red-500 opacity-50' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
          <div 
            className={`w-2 h-8 rounded-full transition-opacity ${
              page === children.length - 1 && !loop ? 'bg-red-500 opacity-50' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

export default SwipeNavigation;
