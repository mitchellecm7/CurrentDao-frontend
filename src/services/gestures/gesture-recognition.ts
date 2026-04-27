/**
 * Gesture Recognition Service
 * Handles touch gesture detection and recognition with 60fps performance
 */

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
  identifier: number;
}

export interface GestureEvent {
  type: 'swipe' | 'pinch' | 'tap' | 'longpress' | 'pull';
  direction?: 'up' | 'down' | 'left' | 'right';
  scale?: number;
  velocity?: number;
  distance?: number;
  touchPoints: TouchPoint[];
  timestamp: number;
}

export class GestureRecognitionService {
  private static instance: GestureRecognitionService;
  private activeTouches: Map<number, TouchPoint> = new Map();
  private gestureHistory: GestureEvent[] = [];
  private lastGestureTime = 0;
  private animationFrameId: number | null = null;
  
  // Performance optimization: throttle gesture processing
  private readonly GESTURE_THROTTLE_MS = 16; // ~60fps
  private readonly SWIPE_THRESHOLD = 50;
  private readonly PINCH_THRESHOLD = 20;
  private readonly TAP_TIMEOUT = 300;
  private readonly LONGPRESS_TIMEOUT = 500;
  private readonly PULL_THRESHOLD = 100;

  static getInstance(): GestureRecognitionService {
    if (!GestureRecognitionService.instance) {
      GestureRecognitionService.instance = new GestureRecognitionService();
    }
    return GestureRecognitionService.instance;
  }

  startTracking(element: HTMLElement, onGesture: (gesture: GestureEvent) => void): () => void {
    let touchStartTime = 0;
    let initialTouchPoints: TouchPoint[] = [];
    let longPressTimer: NodeJS.Timeout | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartTime = Date.now();
      this.activeTouches.clear();
      
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const point: TouchPoint = {
          x: touch.clientX,
          y: touch.clientY,
          timestamp: touchStartTime,
          identifier: touch.identifier
        };
        this.activeTouches.set(touch.identifier, point);
        initialTouchPoints.push(point);
      }

      // Start long press timer for single touch
      if (e.touches.length === 1) {
        longPressTimer = setTimeout(() => {
          const touch = Array.from(this.activeTouches.values())[0];
          if (touch) {
            onGesture({
              type: 'longpress',
              touchPoints: [touch],
              timestamp: Date.now()
            });
          }
        }, this.LONGPRESS_TIMEOUT);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Clear long press timer on move
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      // Throttle processing for 60fps performance
      if (this.animationFrameId) {
        return;
      }

      this.animationFrameId = requestAnimationFrame(() => {
        this.processTouchMove(e, initialTouchPoints, onGesture);
        this.animationFrameId = null;
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      const touchDuration = Date.now() - touchStartTime;
      const finalTouchPoints: TouchPoint[] = [];

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const point: TouchPoint = {
          x: touch.clientX,
          y: touch.clientY,
          timestamp: Date.now(),
          identifier: touch.identifier
        };
        finalTouchPoints.push(point);
        this.activeTouches.delete(touch.identifier);
      }

      this.processTouchEnd(initialTouchPoints, finalTouchPoints, touchDuration, onGesture);
      initialTouchPoints = [];
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimer) clearTimeout(longPressTimer);
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    };
  }

  private processTouchMove(
    e: TouchEvent, 
    initialPoints: TouchPoint[], 
    onGesture: (gesture: GestureEvent) => void
  ) {
    const currentPoints: TouchPoint[] = [];
    
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      currentPoints.push({
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
        identifier: touch.identifier
      });
    }

    // Detect pinch gesture
    if (currentPoints.length === 2 && initialPoints.length === 2) {
      const initialDistance = this.getDistance(initialPoints[0], initialPoints[1]);
      const currentDistance = this.getDistance(currentPoints[0], currentPoints[1]);
      const scale = currentDistance / initialDistance;

      if (Math.abs(scale - 1) > 0.1) {
        onGesture({
          type: 'pinch',
          scale,
          touchPoints: currentPoints,
          timestamp: Date.now()
        });
      }
    }

    // Detect pull-to-refresh gesture (vertical swipe at top)
    if (currentPoints.length === 1 && initialPoints.length === 1) {
      const deltaY = currentPoints[0].y - initialPoints[0].y;
      
      if (deltaY > this.PULL_THRESHOLD && initialPoints[0].y < 100) {
        onGesture({
          type: 'pull',
          direction: 'down',
          distance: deltaY,
          velocity: this.calculateVelocity(currentPoints[0], initialPoints[0]),
          touchPoints: currentPoints,
          timestamp: Date.now()
        });
      }
    }
  }

  private processTouchEnd(
    initialPoints: TouchPoint[],
    finalPoints: TouchPoint[],
    duration: number,
    onGesture: (gesture: GestureEvent) => void
  ) {
    if (initialPoints.length === 1 && finalPoints.length === 1) {
      const deltaX = finalPoints[0].x - initialPoints[0].x;
      const deltaY = finalPoints[0].y - initialPoints[0].y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Detect swipe gesture
      if (distance > this.SWIPE_THRESHOLD && duration < this.TAP_TIMEOUT * 2) {
        let direction: 'up' | 'down' | 'left' | 'right';
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        onGesture({
          type: 'swipe',
          direction,
          distance,
          velocity: this.calculateVelocity(finalPoints[0], initialPoints[0]),
          touchPoints: finalPoints,
          timestamp: Date.now()
        });
      }
      // Detect tap gesture
      else if (distance < 10 && duration < this.TAP_TIMEOUT) {
        onGesture({
          type: 'tap',
          touchPoints: finalPoints,
          timestamp: Date.now()
        });
      }
    }
  }

  private getDistance(point1: TouchPoint, point2: TouchPoint): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculateVelocity(point1: TouchPoint, point2: TouchPoint): number {
    const distance = this.getDistance(point1, point2);
    const timeDelta = point1.timestamp - point2.timestamp;
    return timeDelta > 0 ? distance / timeDelta : 0;
  }

  getGestureHistory(): GestureEvent[] {
    return [...this.gestureHistory];
  }

  clearGestureHistory(): void {
    this.gestureHistory = [];
  }
}
