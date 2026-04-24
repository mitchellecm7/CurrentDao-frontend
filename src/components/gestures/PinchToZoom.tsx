/**
 * Pinch to Zoom Component
 * Provides pinch-to-zoom functionality for charts and detailed views with 0.5x to 3x magnification
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, RotateCcw } from 'lucide-react';
import { GestureRecognitionService, GestureEvent } from '../../services/gestures/gesture-recognition';
import { HapticFeedbackService } from '../../services/gestures/haptic-feedback';
import { GestureAccessibilityService } from '../../utils/gestures/accessibility';

interface PinchToZoomProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  enabled?: boolean;
  showControls?: boolean;
  showZoomHint?: boolean;
  allowRotation?: boolean;
  constrainToBounds?: boolean;
  className?: string;
  onZoomChange?: (scale: number) => void;
}

interface ZoomControlsProps {
  scale: number;
  minScale: number;
  maxScale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  show: boolean;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  minScale,
  maxScale,
  onZoomIn,
  onZoomOut,
  onReset,
  show
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 flex items-center space-x-2 z-50"
        >
          <button
            onClick={onZoomOut}
            disabled={scale <= minScale}
            className={`
              p-2 rounded transition-colors
              ${scale <= minScale 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            aria-label="Zoom out"
          >
            <X size={16} />
          </button>
          
          <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={onZoomIn}
            disabled={scale >= maxScale}
            className={`
              p-2 rounded transition-colors
              ${scale >= maxScale 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            aria-label="Zoom in"
          >
            <Search size={16} />
          </button>
          
          <button
            onClick={onReset}
            disabled={scale === 1}
            className={`
              p-2 rounded transition-colors
              ${scale === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            aria-label="Reset zoom"
          >
            <RotateCcw size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ZoomHintProps {
  show: boolean;
  onDismiss: () => void;
}

const ZoomHint: React.FC<ZoomHintProps> = ({ show, onDismiss }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Search size={16} />
            </motion.div>
            <span className="text-sm">Pinch to zoom in/out</span>
            <button
              onClick={onDismiss}
              className="ml-2 text-gray-400 hover:text-white"
              aria-label="Dismiss hint"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const PinchToZoom: React.FC<PinchToZoomProps> = ({
  children,
  minScale = 0.5,
  maxScale = 3.0,
  initialScale = 1.0,
  enabled = true,
  showControls = true,
  showZoomHint = true,
  allowRotation = false,
  constrainToBounds = true,
  className = '',
  onZoomChange
}) => {
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isPinching, setIsPinching] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gestureService = useRef(GestureRecognitionService.getInstance());
  const hapticService = useRef(HapticFeedbackService.getInstance());
  const accessibilityService = useRef(GestureAccessibilityService.getInstance());
  const cleanupGesture = useRef<(() => void) | null>(null);
  
  const lastDistance = useRef(0);
  const lastScale = useRef(initialScale);
  const animationFrameRef = useRef<number | null>(null);

  // Handle pinch gesture
  const handlePinchGesture = useCallback(async (gesture: GestureEvent) => {
    if (!enabled || gesture.type !== 'pinch' || !gesture.scale) return;

    const newScale = Math.max(minScale, Math.min(maxScale, scale * gesture.scale));
    
    if (newScale !== scale) {
      setScale(newScale);
      await hapticService.current.onPinchGesture(newScale);
      accessibilityService.current.announceGesture('pinch_zoom', true);
      onZoomChange?.(newScale);
    }
  }, [enabled, scale, minScale, maxScale, onZoomChange]);

  // Handle touch events for pinch detection
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled || e.touches.length !== 2) return;

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    lastDistance.current = distance;
    lastScale.current = scale;
    setIsPinching(true);
  }, [enabled, scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || !isPinching || e.touches.length !== 2) return;

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    const scaleDelta = distance / lastDistance.current;
    const newScale = Math.max(minScale, Math.min(maxScale, lastScale.current * scaleDelta));
    
    if (newScale !== scale) {
      setScale(newScale);
      onZoomChange?.(newScale);
    }
  }, [enabled, isPinching, scale, minScale, maxScale, onZoomChange]);

  const handleTouchEnd = useCallback(() => {
    if (isPinching) {
      setIsPinching(false);
      lastDistance.current = 0;
    }
  }, [isPinching]);

  // Zoom control functions
  const zoomIn = useCallback(async () => {
    const newScale = Math.min(maxScale, scale + 0.25);
    if (newScale !== scale) {
      setScale(newScale);
      await hapticService.current.onPinchGesture(newScale);
      accessibilityService.current.announceGesture('pinch_zoom', true);
      onZoomChange?.(newScale);
    }
  }, [scale, maxScale, onZoomChange]);

  const zoomOut = useCallback(async () => {
    const newScale = Math.max(minScale, scale - 0.25);
    if (newScale !== scale) {
      setScale(newScale);
      await hapticService.current.onPinchGesture(newScale);
      accessibilityService.current.announceGesture('pinch_zoom', true);
      onZoomChange?.(newScale);
    }
  }, [scale, minScale, onZoomChange]);

  const resetZoom = useCallback(async () => {
    if (scale !== 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      await hapticService.current.onGestureSuccess();
      accessibilityService.current.announceGesture('pinch_zoom', true);
      onZoomChange?.(1);
    }
  }, [scale, onZoomChange]);

  // Handle keyboard zoom for accessibility
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!enabled) return;

      switch (e.key) {
        case '+':
        case '=':
          await zoomIn();
          break;
        case '-':
        case '_':
          await zoomOut();
          break;
        case '0':
          await resetZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, zoomIn, zoomOut, resetZoom]);

  // Setup gesture recognition
  useEffect(() => {
    if (!containerRef.current || !enabled) return;

    const element = containerRef.current;
    cleanupGesture.current = gestureService.current.startTracking(element, handlePinchGesture);

    // Show zoom hint for new users
    if (showZoomHint) {
      const hasSeenHint = localStorage.getItem('pinch-zoom-hint-seen');
      if (!hasSeenHint) {
        setTimeout(() => {
          setShowHint(true);
        }, 2000);
      }
    }

    return () => {
      if (cleanupGesture.current) {
        cleanupGesture.current();
      }
    };
  }, [handlePinchGesture, enabled, showZoomHint]);

  // Update bounds when container size changes
  useEffect(() => {
    const updateBounds = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setBounds({ width: rect.width, height: rect.height });
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  // Calculate transform styles
  const transformStyle = {
    transform: `
      scale(${scale})
      translate(${position.x}px, ${position.y}px)
      ${allowRotation ? `rotate(${rotation}deg)` : ''}
    `,
    transformOrigin: 'center',
    transition: isPinching ? 'none' : 'transform 0.3s ease-out',
    cursor: enabled ? (scale > 1 ? 'grab' : 'default') : 'default'
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      role="region"
      aria-label="Pinch to zoom container"
      aria-valuemin={minScale}
      aria-valuemax={maxScale}
      aria-valuenow={scale}
    >
      {/* Zoom Hint */}
      <ZoomHint 
        show={showHint} 
        onDismiss={() => {
          setShowHint(false);
          localStorage.setItem('pinch-zoom-hint-seen', 'true');
        }} 
      />

      {/* Zoom Content */}
      <div 
        ref={contentRef}
        className="relative w-full h-full flex items-center justify-center"
        style={transformStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Zoom Controls */}
      <ZoomControls
        scale={scale}
        minScale={minScale}
        maxScale={maxScale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetZoom}
        show={showControls && enabled}
      />

      {/* Zoom Level Indicator */}
      {showControls && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Zoom:</span>
            <span className="text-sm font-bold text-blue-600">{Math.round(scale * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-200"
              style={{ 
                width: `${((scale - minScale) / (maxScale - minScale)) * 100}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Accessibility: Boundary indicators */}
      {accessibilityService.current.getSettings().visualIndicators && (
        <div className="absolute inset-0 pointer-events-none">
          {scale === minScale && (
            <div className="absolute inset-0 border-2 border-red-500 border-opacity-30 rounded-lg" />
          )}
          {scale === maxScale && (
            <div className="absolute inset-0 border-2 border-green-500 border-opacity-30 rounded-lg" />
          )}
        </div>
      )}
    </div>
  );
};

export default PinchToZoom;
