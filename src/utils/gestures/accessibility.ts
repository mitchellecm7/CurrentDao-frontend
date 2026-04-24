/**
 * Gesture Accessibility Utilities
 * Provides accessibility alternatives and adaptations for motor-impaired users
 */

export interface AccessibilitySettings {
  reducedMotion: boolean;
  increasedTouchArea: boolean;
  gestureTimeout: number;
  hapticFeedback: boolean;
  voiceAnnouncements: boolean;
  visualIndicators: boolean;
  simplifiedGestures: boolean;
  customGestureMapping: boolean;
}

export interface GestureAlternative {
  gesture: string;
  alternatives: {
    type: 'keyboard' | 'button' | 'voice' | 'simplified_gesture';
    action: string;
    description: string;
  }[];
}

export class GestureAccessibilityService {
  private static instance: GestureAccessibilityService;
  private settings: AccessibilitySettings;
  private speechSynthesis: SpeechSynthesis | null = null;

  static getInstance(): GestureAccessibilityService {
    if (!GestureAccessibilityService.instance) {
      GestureAccessibilityService.instance = new GestureAccessibilityService();
    }
    return GestureAccessibilityService.instance;
  }

  constructor() {
    this.settings = this.getDefaultSettings();
    this.initializeSpeech();
    this.loadUserPreferences();
  }

  private getDefaultSettings(): AccessibilitySettings {
    return {
      reducedMotion: false,
      increasedTouchArea: false,
      gestureTimeout: 1000,
      hapticFeedback: true,
      voiceAnnouncements: false,
      visualIndicators: true,
      simplifiedGestures: false,
      customGestureMapping: false
    };
  }

  private initializeSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  private loadUserPreferences(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('gesture-accessibility');
      if (saved) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        } catch (error) {
          console.warn('Failed to load accessibility settings:', error);
        }
      }
    }

    // Detect system preferences
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.settings.reducedMotion = prefersReducedMotion.matches;
    }
  }

  saveUserPreferences(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('gesture-accessibility', JSON.stringify(this.settings));
    }
  }

  updateSettings(newSettings: Partial<AccessibilitySettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveUserPreferences();
  }

  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  // Gesture alternatives for motor-impaired users
  getGestureAlternatives(): GestureAlternative[] {
    return [
      {
        gesture: 'swipe_left',
        alternatives: [
          {
            type: 'keyboard',
            action: 'Arrow Left',
            description: 'Use left arrow key to navigate'
          },
          {
            type: 'button',
            action: 'Previous Button',
            description: 'Tap previous button to navigate'
          },
          {
            type: 'voice',
            action: 'Go back',
            description: 'Say "go back" to navigate'
          },
          {
            type: 'simplified_gesture',
            action: 'Tap left edge',
            description: 'Tap left edge of screen instead of swiping'
          }
        ]
      },
      {
        gesture: 'swipe_right',
        alternatives: [
          {
            type: 'keyboard',
            action: 'Arrow Right',
            description: 'Use right arrow key to navigate'
          },
          {
            type: 'button',
            action: 'Next Button',
            description: 'Tap next button to navigate'
          },
          {
            type: 'voice',
            action: 'Go forward',
            description: 'Say "go forward" to navigate'
          },
          {
            type: 'simplified_gesture',
            action: 'Tap right edge',
            description: 'Tap right edge of screen instead of swiping'
          }
        ]
      },
      {
        gesture: 'swipe_up',
        alternatives: [
          {
            type: 'keyboard',
            action: 'Arrow Up',
            description: 'Use up arrow key to scroll up'
          },
          {
            type: 'button',
            action: 'Scroll Up Button',
            description: 'Tap scroll up button'
          },
          {
            type: 'voice',
            action: 'Scroll up',
            description: 'Say "scroll up" to move up'
          },
          {
            type: 'simplified_gesture',
            action: 'Double tap top',
            description: 'Double tap top of screen'
          }
        ]
      },
      {
        gesture: 'swipe_down',
        alternatives: [
          {
            type: 'keyboard',
            action: 'Arrow Down',
            description: 'Use down arrow key to scroll down'
          },
          {
            type: 'button',
            action: 'Scroll Down Button',
            description: 'Tap scroll down button'
          },
          {
            type: 'voice',
            action: 'Scroll down',
            description: 'Say "scroll down" to move down'
          },
          {
            type: 'simplified_gesture',
            action: 'Double tap bottom',
            description: 'Double tap bottom of screen'
          }
        ]
      },
      {
        gesture: 'pinch_zoom',
        alternatives: [
          {
            type: 'keyboard',
            action: '+ / - Keys',
            description: 'Use plus and minus keys to zoom'
          },
          {
            type: 'button',
            action: 'Zoom Buttons',
            description: 'Use zoom in/out buttons'
          },
          {
            type: 'voice',
            action: 'Zoom in/out',
            description: 'Say "zoom in" or "zoom out"'
          },
          {
            type: 'simplified_gesture',
            action: 'Double tap',
            description: 'Double tap to zoom in/out'
          }
        ]
      },
      {
        gesture: 'pull_to_refresh',
        alternatives: [
          {
            type: 'keyboard',
            action: 'F5 / Ctrl+R',
            description: 'Press F5 or Ctrl+R to refresh'
          },
          {
            type: 'button',
            action: 'Refresh Button',
            description: 'Tap refresh button'
          },
          {
            type: 'voice',
            action: 'Refresh',
            description: 'Say "refresh" to update content'
          },
          {
            type: 'simplified_gesture',
            action: 'Long press refresh',
            description: 'Long press refresh button'
          }
        ]
      }
    ];
  }

  // Voice announcements for gesture feedback
  announceGesture(gesture: string, success: boolean = true): void {
    if (!this.settings.voiceAnnouncements || !this.speechSynthesis) {
      return;
    }

    const messages = {
      swipe_left: success ? 'Swiped left, navigating back' : 'Swipe left failed',
      swipe_right: success ? 'Swiped right, navigating forward' : 'Swipe right failed',
      swipe_up: success ? 'Swiped up, scrolling' : 'Swipe up failed',
      swipe_down: success ? 'Swiped down, scrolling' : 'Swipe down failed',
      pinch_zoom: success ? 'Zoom adjusted' : 'Zoom failed',
      pull_to_refresh: success ? 'Refreshing content' : 'Refresh failed',
      tap: success ? 'Item selected' : 'Tap failed',
      longpress: success ? 'Long press activated' : 'Long press failed'
    };

    const message = messages[gesture as keyof typeof messages] || 'Gesture completed';
    this.speak(message);
  }

  private speak(text: string): void {
    if (!this.speechSynthesis) return;

    // Cancel any ongoing speech
    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    this.speechSynthesis.speak(utterance);
  }

  // Visual indicators for gesture feedback
  getVisualIndicatorStyles(): React.CSSProperties {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 9999,
      transition: this.settings.reducedMotion ? 'none' : 'all 0.3s ease'
    };

    if (this.settings.increasedTouchArea) {
      return {
        ...baseStyles,
        transform: 'scale(1.2)'
      };
    }

    return baseStyles;
  }

  // Simplified gesture detection
  shouldUseSimplifiedGestures(): boolean {
    return this.settings.simplifiedGestures;
  }

  // Increased touch area calculations
  getIncreasedTouchArea(originalSize: number): number {
    if (!this.settings.increasedTouchArea) {
      return originalSize;
    }
    return originalSize * 1.5; // 50% larger touch area
  }

  // Gesture timeout adjustments
  getGestureTimeout(): number {
    return this.settings.gestureTimeout;
  }

  // Check if user prefers reduced motion
  shouldReduceMotion(): boolean {
    return this.settings.reducedMotion;
  }

  // Accessibility testing utilities
  runAccessibilityTest(): {
    passed: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Test for reduced motion preference
    if (!this.settings.reducedMotion && typeof window !== 'undefined' && window.matchMedia) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (prefersReducedMotion.matches) {
        issues.push('User prefers reduced motion but it\'s not enabled');
        recommendations.push('Enable reduced motion animations');
      }
    }

    // Test for haptic feedback availability
    if (this.settings.hapticFeedback && !('vibrate' in navigator)) {
      issues.push('Haptic feedback enabled but not supported');
      recommendations.push('Consider alternative feedback methods');
    }

    // Test for speech synthesis availability
    if (this.settings.voiceAnnouncements && !this.speechSynthesis) {
      issues.push('Voice announcements enabled but not supported');
      recommendations.push('Consider visual alternatives for voice feedback');
    }

    return {
      passed: issues.length === 0,
      issues,
      recommendations
    };
  }
}
