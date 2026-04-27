/**
 * Accessibility utilities for CurrentDao Component Library
 * WCAG 2.1 AA compliance helpers and testing utilities
 */

// ARIA roles and properties
export const ARIA_ROLES = {
  button: 'button',
  link: 'link',
  navigation: 'navigation',
  main: 'main',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  banner: 'banner',
  search: 'search',
  form: 'form',
  application: 'application',
  document: 'document',
  presentation: 'presentation',
  none: 'none',
} as const;

// ARIA states and properties
export const ARIA_STATES = {
  busy: 'aria-busy',
  checked: 'aria-checked',
  disabled: 'aria-disabled',
  expanded: 'aria-expanded',
  grabbed: 'aria-grabbed',
  hidden: 'aria-hidden',
  invalid: 'aria-invalid',
  pressed: 'aria-pressed',
  selected: 'aria-selected',
} as const;

// Keyboard navigation patterns
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

// Focus management utilities
export class FocusManager {
  private static focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    'area[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'iframe',
    'summary',
    'audio[controls]',
    'video[controls]',
    '[role="button"]:not([disabled])',
    '[role="link"]',
    '[role="menuitem"]',
    '[role="option"]',
    '[role="tab"]',
  ].join(', ');

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors))
      .filter((element): element is HTMLElement => {
        // Check if element is visible and not disabled
        const style = window.getComputedStyle(element);
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          !element.hasAttribute('disabled') &&
          !element.getAttribute('aria-hidden')
        );
      });
  }

  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== KEYBOARD_KEYS.TAB) return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  static restoreFocus(previousElement: HTMLElement | null): void {
    if (previousElement && previousElement.focus) {
      previousElement.focus();
    }
  }
}

// Screen reader utilities
export class ScreenReader {
  private static liveRegionId = 'sr-live-region';

  static createLiveRegion(): HTMLElement {
    const existingRegion = document.getElementById(this.liveRegionId);
    if (existingRegion) return existingRegion;

    const liveRegion = document.createElement('div');
    liveRegion.id = this.liveRegionId;
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(liveRegion);
    return liveRegion;
  }

  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const liveRegion = this.createLiveRegion();
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }

  static hideVisually(element: HTMLElement): void {
    element.style.position = 'absolute';
    element.style.width = '1px';
    element.style.height = '1px';
    element.style.padding = '0';
    element.style.margin = '-1px';
    element.style.overflow = 'hidden';
    element.style.clip = 'rect(0, 0, 0, 0)';
    element.style.whiteSpace = 'nowrap';
    element.style.border = '0';
  }

  static showVisually(element: HTMLElement): void {
    element.style.position = '';
    element.style.width = '';
    element.style.height = '';
    element.style.padding = '';
    element.style.margin = '';
    element.style.overflow = '';
    element.style.clip = '';
    element.style.whiteSpace = '';
    element.style.border = '';
  }
}

// Color contrast utilities
export class ColorContrast {
  /**
   * Calculate relative luminance of a color
   */
  static getLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map(value => {
      value = value / 255;
      return value <= 0.03928
        ? value / 12.92
        : Math.pow((value + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Check if contrast meets WCAG AA standards
   */
  static meetsWCAGAA(foreground: string, background: string, largeText = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return largeText ? ratio >= 3.0 : ratio >= 4.5;
  }

  /**
   * Check if contrast meets WCAG AAA standards
   */
  static meetsWCAGAAA(foreground: string, background: string, largeText = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return largeText ? ratio >= 4.5 : ratio >= 7.0;
  }

  private static hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : null;
  }
}

// Accessibility testing utilities
export class AccessibilityTester {
  /**
   * Check if element has proper ARIA attributes
   */
  static checkAriaAttributes(element: HTMLElement): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check for required ARIA attributes based on role
    const role = element.getAttribute('role');
    if (role) {
      switch (role) {
        case 'button':
          if (!element.getAttribute('aria-label') && !element.textContent?.trim()) {
            issues.push('Button role requires aria-label or text content');
          }
          break;
        case 'link':
          if (!element.getAttribute('href') && !element.getAttribute('aria-label')) {
            issues.push('Link role requires href or aria-label');
          }
          break;
        case 'img':
          if (!element.getAttribute('aria-label') && !element.getAttribute('alt')) {
            issues.push('Image role requires aria-label or alt attribute');
          }
          break;
      }
    }

    // Check for invalid ARIA attributes
    const invalidAria = Array.from(element.attributes)
      .filter(attr => attr.name.startsWith('aria-'))
      .filter(attr => {
        const value = attr.value;
        return value === '' || value === 'true' || value === 'false';
      })
      .map(attr => `Invalid ARIA attribute: ${attr.name}`);

    issues.push(...invalidAria);

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Check keyboard accessibility
   */
  static checkKeyboardAccessibility(element: HTMLElement): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check if element is focusable
    const isFocusable = FocusManager.getFocusableElements(document.body).includes(element);
    
    if (!isFocusable && element.tabIndex >= 0) {
      issues.push('Element has tabIndex >= 0 but is not focusable');
    }

    // Check for interactive elements without keyboard handlers
    const interactiveRoles = ['button', 'link', 'menuitem', 'option', 'tab'];
    const role = element.getAttribute('role');
    
    if (interactiveRoles.includes(role || '') && !element.hasAttribute('tabindex')) {
      issues.push('Interactive element missing tabindex');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Run comprehensive accessibility audit
   */
  static audit(container: HTMLElement = document.body): {
    score: number;
    issues: Array<{
      element: HTMLElement;
      type: string;
      message: string;
      severity: 'error' | 'warning' | 'info';
    }>;
  } {
    const issues: Array<{
      element: HTMLElement;
      type: string;
      message: string;
      severity: 'error' | 'warning' | 'info';
    }> = [];

    // Check all focusable elements
    const focusableElements = FocusManager.getFocusableElements(container);
    
    focusableElements.forEach(element => {
      // ARIA checks
      const ariaCheck = this.checkAriaAttributes(element);
      if (!ariaCheck.valid) {
        ariaCheck.issues.forEach(message => {
          issues.push({
            element,
            type: 'aria',
            message,
            severity: 'error',
          });
        });
      }

      // Keyboard checks
      const keyboardCheck = this.checkKeyboardAccessibility(element);
      if (!keyboardCheck.valid) {
        keyboardCheck.issues.forEach(message => {
          issues.push({
            element,
            type: 'keyboard',
            message,
            severity: 'error',
          });
        });
      }

      // Color contrast checks (for text elements)
      const computedStyle = window.getComputedStyle(element);
      if (element.textContent && element.textContent.trim()) {
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;
        
        if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const rgbToHex = (rgb: string) => {
            const match = rgb.match(/\d+/g);
            if (!match) return '#000000';
            return '#' + match.slice(0, 3).map(x => {
              const hex = parseInt(x).toString(16);
              return hex.length === 1 ? '0' + hex : hex;
            }).join('');
          };

          const contrastRatio = ColorContrast.getContrastRatio(
            rgbToHex(color),
            rgbToHex(backgroundColor)
          );

          if (contrastRatio < 4.5) {
            issues.push({
              element,
              type: 'contrast',
              message: `Insufficient color contrast: ${contrastRatio.toFixed(2)}:1 (minimum 4.5:1)`,
              severity: 'error',
            });
          }
        }
      }
    });

    // Calculate score (0-100)
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const totalElements = focusableElements.length;
    
    const score = totalElements > 0 
      ? Math.max(0, 100 - (errorCount * 10) - (warningCount * 5))
      : 100;

    return {
      score,
      issues,
    };
  }
}

// React hooks for accessibility
export const useAccessibility = () => {
  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    ScreenReader.announce(message, priority);
  };

  const trapFocus = (container: HTMLElement | null) => {
    if (!container) return () => {};
    return FocusManager.trapFocus(container);
  };

  return {
    announceMessage,
    trapFocus,
    ScreenReader,
    FocusManager,
    ColorContrast,
  };
};

// Accessibility guidelines reference
export const WCAG_GUIDELINES = {
  '1.1.1': {
    title: 'Non-text Content',
    description: 'All non-text content has a text alternative',
    level: 'A',
  },
  '1.2.1': {
    title: 'Audio-only and Video-only (Prerecorded)',
    description: 'Prerecorded audio-only and video-only content has alternatives',
    level: 'A',
  },
  '1.3.1': {
    title: 'Info and Relationships',
    description: 'Information, structure, and relationships can be programmatically determined',
    level: 'A',
  },
  '1.3.2': {
    title: 'Meaningful Sequence',
    description: 'The order of content is meaningful and can be programmatically determined',
    level: 'A',
  },
  '1.4.1': {
    title: 'Use of Color',
    description: 'Color is not used as the only visual means of conveying information',
    level: 'A',
  },
  '1.4.3': {
    title: 'Contrast (Minimum)',
    description: 'Text has a contrast ratio of at least 4.5:1',
    level: 'AA',
  },
  '1.4.4': {
    title: 'Resize text',
    description: 'Text can be resized without assistive technology up to 200%',
    level: 'AA',
  },
  '2.1.1': {
    title: 'Keyboard',
    description: 'All functionality is available using a keyboard',
    level: 'A',
  },
  '2.1.2': {
    title: 'No Keyboard Trap',
    description: 'Keyboard focus does not get trapped',
    level: 'A',
  },
  '2.4.1': {
    title: 'Bypass Blocks',
    description: 'Mechanisms are available to bypass blocks of content',
    level: 'A',
  },
  '2.4.2': {
    title: 'Page Titled',
    description: 'Web pages have titles that describe topic or purpose',
    level: 'A',
  },
  '3.1.1': {
    title: 'Language of Page',
    description: 'The default human language of each page can be programmatically determined',
    level: 'A',
  },
  '3.2.1': {
    title: 'On Focus',
    description: 'When any component receives focus, it does not cause a context change',
    level: 'A',
  },
  '3.2.2': {
    title: 'On Input',
    description: 'Changing the setting of any user interface component does not automatically cause a context change',
    level: 'A',
  },
  '4.1.1': {
    title: 'Parsing',
    description: 'Content can be parsed without syntax errors',
    level: 'A',
  },
  '4.1.2': {
    title: 'Name, Role, Value',
    description: 'All UI components have name, role, and can be set programmatically',
    level: 'A',
  },
} as const;

export default {
  ARIA_ROLES,
  ARIA_STATES,
  KEYBOARD_KEYS,
  FocusManager,
  ScreenReader,
  ColorContrast,
  AccessibilityTester,
  useAccessibility,
  WCAG_GUIDELINES,
};
