/**
 * Pull to Refresh Component
 * Provides pull-to-refresh functionality for all scrollable areas
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { GestureRecognitionService, GestureEvent } from '../../services/gestures/gesture-recognition';
import { HapticFeedbackService } from '../../services/gestures/haptic-feedback';
import { GestureAccessibilityService } from '../../utils/gestures/accessibility';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  enabled?: boolean;
  pullThreshold?: number;
  maxPullDistance?: number;
  refreshIndicatorHeight?: number;
  showPullHint?: boolean;
  className?: string;
  contentClassName?: string;
}

interface RefreshIndicatorProps {
  isPulling: boolean;
  pullProgress: number;
  isRefreshing: boolean;
  canRefresh: boolean;
  maxPullDistance: number;
  height: number;
}

const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  isPulling,
  pullProgress,
  isRefreshing,
  canRefresh,
  maxPullDistance,
  height
}) => {
  const iconRotation = pullProgress * 360;
  const iconScale = 0.8 + (pullProgress * 0.4);

  return (
    <motion.div
      className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white"
      style={{ height: `${height * pullProgress}px` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isPulling || isRefreshing ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        <motion.div
          animate={{
            rotate: isRefreshing ? 360 : iconRotation,
            scale: isRefreshing ? 1 : iconScale
          }}
          transition={{
            rotate: isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { type: "spring", stiffness: 200 },
            scale: { type: "spring", stiffness: 200 }
          }}
          className={`
            ${canRefresh ? 'text-blue-500' : 'text-gray-400'}
            ${isRefreshing ? 'animate-spin' : ''}
          `}
        >
          {isRefreshing ? (
            <RefreshCw size={24} />
          ) : (
            <ChevronDown size={24} />
          )}
        </motion.div>
        
        {isPulling && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap"
          >
            {canRefresh ? 'Release to refresh' : 'Pull to refresh'}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  enabled = true,
  pullThreshold = 100,
  maxPullDistance = 150,
  refreshIndicatorHeight = 60,
  showPullHint = true,
  className = '',
  contentClassName = ''
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gestureService = useRef(GestureRecognitionService.getInstance());
  const hapticService = useRef(HapticFeedbackService.getInstance());
  const accessibilityService = useRef(GestureAccessibilityService.getInstance());
  const cleanupGesture = useRef<(() => void) | null>(null);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  const lastTouchTime = useRef(0);

  // Handle pull gesture
  const handlePullGesture = useCallback(async (gesture: GestureEvent) => {
    if (!enabled || gesture.type !== 'pull' || isRefreshing) return;

    const { distance, velocity } = gesture;
    
    // Calculate pull progress
    const progress = Math.min(distance / pullThreshold, 1);
    setPullProgress(progress);
    setIsPulling(true);
    setCanRefresh(distance >= pullThreshold);

    // Provide haptic feedback at threshold
    if (distance >= pullThreshold && !canRefresh) {
      await hapticService.current.onPullToRefresh();
    }
  }, [enabled, isRefreshing, pullThreshold, canRefresh]);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled || isRefreshing) return;
    
    const touch = e.touches[0];
    startY.current = touch.clientY;
    currentY.current = touch.clientY;
    isDragging.current = true;
    lastTouchTime.current = Date.now();

    // Check if we're at the top of the scrollable content
    if (contentRef.current) {
      const scrollTop = contentRef.current.scrollTop;
      if (scrollTop > 0) {
        isDragging.current = false;
        return;
      }
    }
  }, [enabled, isRefreshing]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !enabled || isRefreshing) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - startY.current;
    
    // Only allow pulling down
    if (deltaY < 0) return;

    // Check if we're still at the top
    if (contentRef.current && contentRef.current.scrollTop > 0) {
      isDragging.current = false;
      setIsPulling(false);
      setPullProgress(0);
      return;
    }

    currentY.current = touch.clientY;
    const distance = Math.abs(deltaY);
    const progress = Math.min(distance / pullThreshold, 1);
    
    setPullProgress(progress);
    setIsPulling(true);
    setCanRefresh(distance >= pullThreshold);

    // Prevent default scrolling behavior
    e.preventDefault();
  }, [enabled, isRefreshing, pullThreshold]);

  // Handle touch end
  const handleTouchEnd = useCallback(async (e: React.TouchEvent) => {
    if (!isDragging.current || !enabled) return;

    isDragging.current = false;
    const deltaY = currentY.current - startY.current;
    
    if (canRefresh && deltaY >= pullThreshold) {
      // Trigger refresh
      setIsRefreshing(true);
      setCanRefresh(false);
      await hapticService.current.onGestureSuccess();
      accessibilityService.current.announceGesture('pull_to_refresh', true);
      
      try {
        await onRefresh();
      } catch (error) {
        await hapticService.current.onGestureError();
        accessibilityService.current.announceGesture('pull_to_refresh', false);
      } finally {
        setIsRefreshing(false);
        setIsPulling(false);
        setPullProgress(0);
      }
    } else {
      // Reset pull state
      setIsPulling(false);
      setPullProgress(0);
      setCanRefresh(false);
      
      if (deltaY > 0) {
        await hapticService.current.onGestureWarning();
      }
    }
  }, [enabled, canRefresh, pullThreshold, onRefresh]);

  // Setup gesture recognition
  useEffect(() => {
    if (!containerRef.current || !enabled) return;

    const element = containerRef.current;
    cleanupGesture.current = gestureService.current.startTracking(element, handlePullGesture);

    // Show pull hint for new users
    if (showPullHint) {
      const hasSeenHint = localStorage.getItem('pull-to-refresh-hint-seen');
      if (!hasSeenHint) {
        setTimeout(() => {
          setShowHint(true);
          setTimeout(() => {
            setShowHint(false);
            localStorage.setItem('pull-to-refresh-hint-seen', 'true');
          }, 3000);
        }, 1000);
      }
    }

    return () => {
      if (cleanupGesture.current) {
        cleanupGesture.current();
      }
    };
  }, [handlePullGesture, enabled, showPullHint]);

  // Handle keyboard refresh for accessibility
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!enabled || isRefreshing) return;
      
      if ((e.key === 'F5' || (e.ctrlKey && e.key === 'r'))) {
        e.preventDefault();
        setIsRefreshing(true);
        await hapticService.current.onPullToRefresh();
        accessibilityService.current.announceGesture('pull_to_refresh', true);
        
        try {
          await onRefresh();
        } catch (error) {
          await hapticService.current.onGestureError();
          accessibilityService.current.announceGesture('pull_to_refresh', false);
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, isRefreshing, onRefresh]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      role="region"
      aria-label="Pull to refresh container"
      aria-busy={isRefreshing}
    >
      {/* Refresh Indicator */}
      <RefreshIndicator
        isPulling={isPulling}
        pullProgress={pullProgress}
        isRefreshing={isRefreshing}
        canRefresh={canRefresh}
        maxPullDistance={maxPullDistance}
        height={refreshIndicatorHeight}
      />

      {/* Content Container */}
      <div
        ref={contentRef}
        className={`
          relative w-full h-full overflow-y-auto
          transition-transform duration-200 ease-out
          ${isPulling ? '' : 'transform-none'}
          ${contentClassName}
        `}
        style={{
          transform: isPulling ? `translateY(${pullProgress * refreshIndicatorHeight}px)` : 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Pull to Refresh Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronDown size={16} />
              </motion.div>
              <span className="text-sm">Pull down to refresh</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-40"
          >
            <div className="flex flex-col items-center space-y-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <RefreshCw className="text-blue-500" size={32} />
              </motion.div>
              <span className="text-gray-600 text-sm">Refreshing...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PullToRefresh;
