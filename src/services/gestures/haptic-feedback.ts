/**
 * Haptic Feedback Service
 * Provides tactile feedback for gesture confirmation and user interactions
 */

export interface HapticPattern {
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'custom';
  pattern?: number[];
  intensity?: number;
}

export class HapticFeedbackService {
  private static instance: HapticFeedbackService;
  private isSupported = false;
  private isEnabled = true;
  private vibrationAPI: any = null;

  static getInstance(): HapticFeedbackService {
    if (!HapticFeedbackService.instance) {
      HapticFeedbackService.instance = new HapticFeedbackService();
    }
    return HapticFeedbackService.instance;
  }

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Check for Vibration API support
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      this.isSupported = true;
      this.vibrationAPI = navigator.vibrate;
    }

    // Check for user preference
    if (typeof localStorage !== 'undefined') {
      const savedPreference = localStorage.getItem('haptic-enabled');
      if (savedPreference !== null) {
        this.isEnabled = savedPreference === 'true';
      }
    }
  }

  async trigger(pattern: HapticPattern): Promise<void> {
    if (!this.isSupported || !this.isEnabled) {
      return;
    }

    try {
      switch (pattern.type) {
        case 'light':
          await this.vibrate([10]);
          break;
        case 'medium':
          await this.vibrate([25]);
          break;
        case 'heavy':
          await this.vibrate([50]);
          break;
        case 'success':
          await this.vibrate([10, 50, 10]);
          break;
        case 'warning':
          await this.vibrate([20, 30, 20]);
          break;
        case 'error':
          await this.vibrate([50, 30, 50, 30, 50]);
          break;
        case 'custom':
          if (pattern.pattern) {
            await this.vibrate(pattern.pattern);
          }
          break;
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  private vibrate(pattern: number[]): Promise<void> {
    return new Promise((resolve) => {
      if (this.vibrationAPI) {
        this.vibrationAPI(pattern);
        // Calculate total vibration time for the promise resolution
        const totalTime = pattern.reduce((sum, time) => sum + time, 0);
        setTimeout(resolve, totalTime);
      } else {
        resolve();
      }
    });
  }

  // Gesture-specific feedback patterns
  async onSwipeGesture(direction: 'up' | 'down' | 'left' | 'right'): Promise<void> {
    await this.trigger({ type: 'light' });
  }

  async onPinchGesture(scale: number): Promise<void> {
    // Different feedback based on zoom direction
    if (scale > 1) {
      await this.trigger({ type: 'medium' }); // Zoom in
    } else {
      await this.trigger({ type: 'light' }); // Zoom out
    }
  }

  async onTapGesture(): Promise<void> {
    await this.trigger({ type: 'light' });
  }

  async onLongPressGesture(): Promise<void> {
    await this.trigger({ type: 'heavy' });
  }

  async onPullToRefresh(): Promise<void> {
    await this.trigger({ type: 'medium' });
  }

  async onGestureSuccess(): Promise<void> {
    await this.trigger({ type: 'success' });
  }

  async onGestureError(): Promise<void> {
    await this.trigger({ type: 'error' });
  }

  async onGestureWarning(): Promise<void> {
    await this.trigger({ type: 'warning' });
  }

  // Settings management
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('haptic-enabled', enabled.toString());
    }
  }

  getEnabled(): boolean {
    return this.isEnabled;
  }

  getSupported(): boolean {
    return this.isSupported;
  }

  // Accessibility features
  async triggerAccessibilityFeedback(action: string): Promise<void> {
    switch (action) {
      case 'screen_boundary':
        await this.trigger({ type: 'warning' });
        break;
      case 'gesture_complete':
        await this.trigger({ type: 'success' });
        break;
      case 'gesture_cancel':
        await this.trigger({ type: 'error' });
        break;
      case 'focus_change':
        await this.trigger({ type: 'light' });
        break;
      default:
        await this.trigger({ type: 'light' });
    }
  }

  // Test method for development
  async testAllPatterns(): Promise<void> {
    const patterns: HapticPattern[] = [
      { type: 'light' },
      { type: 'medium' },
      { type: 'heavy' },
      { type: 'success' },
      { type: 'warning' },
      { type: 'error' }
    ];

    for (const pattern of patterns) {
      await this.trigger(pattern);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}
