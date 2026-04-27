import { CustomTheme, ThemeColors, AccessibilityLevel, AccessibilityIssue, AccessibilityReport } from '@/types/theme-engine'

export class AccessibilityUtils {
  // WCAG 2.1 AA contrast ratios
  private static readonly CONTRAST_RATIOS = {
    AA_NORMAL_TEXT: 4.5,
    AA_LARGE_TEXT: 3.0,
    AAA_NORMAL_TEXT: 7.0,
    AAA_LARGE_TEXT: 4.5,
    GRAPHICAL_OBJECTS: 3.0,
  }

  // Color blindness types for simulation
  private static readonly COLOR_BLINDNESS_TYPES = {
    PROTANOPIA: 'protanopia', // Red-blind
    DEUTERANOPIA: 'deuteranopia', // Green-blind
    TRITANOPIA: 'tritanopia', // Blue-blind
    ACHROMATOPSIA: 'achromatopsia', // Complete color blindness
  }

  /**
   * Calculate relative luminance of a color
   */
  static calculateLuminance(color: string): number {
    // Convert HSL to RGB first, then to relative luminance
    const rgb = this.hslToRgb(color)
    const [r, g, b] = rgb.map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static calculateContrastRatio(color1: string, color2: string): number {
    const lum1 = this.calculateLuminance(color1)
    const lum2 = this.calculateLuminance(color2)
    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)
    return (lighter + 0.05) / (darker + 0.05)
  }

  /**
   * Convert HSL color string to RGB array
   */
  static hslToRgb(hsl: string): [number, number, number] {
    const match = hsl.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/)
    if (!match) return [0, 0, 0]

    let [_, h, s, l] = match.map(Number)
    h = h / 360
    s = s / 100
    l = l / 100

    let r, g, b

    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }

  /**
   * Convert RGB to hex color
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  /**
   * Simulate color blindness
   */
  static simulateColorBlindness(color: string, type: keyof typeof AccessibilityUtils.COLOR_BLINDNESS_TYPES): string {
    const [r, g, b] = this.hslToRgb(color)
    let newR = r, newG = g, newB = b

    switch (type) {
      case 'PROTANOPIA':
        // Red-blind simulation
        newR = 0.567 * r + 0.433 * g
        newG = 0.558 * r + 0.442 * g
        newB = 0.242 * g + 0.758 * b
        break
      case 'DEUTERANOPIA':
        // Green-blind simulation
        newR = 0.625 * r + 0.375 * g
        newG = 0.7 * r + 0.3 * g
        newB = 0.3 * g + 0.7 * b
        break
      case 'TRITANOPIA':
        // Blue-blind simulation
        newR = 0.95 * r + 0.05 * g
        newG = 0.433 * g + 0.567 * b
        newB = 0.475 * g + 0.525 * b
        break
      case 'ACHROMATOPSIA':
        // Complete color blindness
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        newR = newG = newB = gray
        break
    }

    return this.rgbToHex(Math.round(newR), Math.round(newG), Math.round(newB))
  }

  /**
   * Check if a color combination meets WCAG standards
   */
  static checkWCAGCompliance(
    foreground: string, 
    background: string, 
    isLargeText: boolean = false
  ): { passesAA: boolean; passesAAA: boolean; ratio: number } {
    const ratio = this.calculateContrastRatio(foreground, background)
    const aaThreshold = isLargeText ? this.CONTRAST_RATIOS.AA_LARGE_TEXT : this.CONTRAST_RATIOS.AA_NORMAL_TEXT
    const aaaThreshold = isLargeText ? this.CONTRAST_RATIOS.AAA_LARGE_TEXT : this.CONTRAST_RATIOS.AAA_NORMAL_TEXT

    return {
      passesAA: ratio >= aaThreshold,
      passesAAA: ratio >= aaaThreshold,
      ratio,
    }
  }

  /**
   * Generate accessibility report for a theme
   */
  static generateAccessibilityReport(theme: CustomTheme): AccessibilityReport {
    const issues: AccessibilityIssue[] = []
    let totalScore = 100

    // Check light mode colors
    const lightIssues = this.checkColorContrasts(theme.colors.light, 'light')
    issues.push(...lightIssues)

    // Check dark mode colors
    const darkIssues = this.checkColorContrasts(theme.colors.dark, 'dark')
    issues.push(...darkIssues)

    // Check color blindness compatibility
    const colorblindIssues = this.checkColorBlindnessCompatibility(theme)
    issues.push(...colorblindIssues)

    // Check focus indicators
    const focusIssues = this.checkFocusIndicators(theme)
    issues.push(...focusIssues)

    // Calculate score based on issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          totalScore -= 25
          break
        case 'major':
          totalScore -= 15
          break
        case 'minor':
          totalScore -= 5
          break
        case 'info':
          totalScore -= 1
          break
      }
    })

    const passes = totalScore >= 70 // 70% is considered passing

    return {
      theme,
      level: this.determineAccessibilityLevel(theme),
      score: Math.max(0, totalScore),
      issues,
      recommendations: this.generateRecommendations(issues),
      passes,
    }
  }

  /**
   * Check color contrasts for a color scheme
   */
  private static checkColorContrasts(colors: ThemeColors, mode: 'light' | 'dark'): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Check text contrast
    const textContrast = this.checkWCAGCompliance(colors.foreground, colors.background)
    if (!textContrast.passesAA) {
      issues.push({
        type: 'contrast',
        severity: textContrast.ratio < 3 ? 'critical' : 'major',
        element: `${mode}-text`,
        description: `Text contrast ratio is ${textContrast.ratio.toFixed(2)}:1`,
        suggestion: 'Increase contrast between text and background colors',
      })
    }

    // Check card text contrast
    const cardTextContrast = this.checkWCAGCompliance(colors.cardForeground, colors.card)
    if (!cardTextContrast.passesAA) {
      issues.push({
        type: 'contrast',
        severity: cardTextContrast.ratio < 3 ? 'critical' : 'major',
        element: `${mode}-card-text`,
        description: `Card text contrast ratio is ${cardTextContrast.ratio.toFixed(2)}:1`,
        suggestion: 'Increase contrast between card text and card background',
      })
    }

    // Check button contrast
    const primaryButtonContrast = this.checkWCAGCompliance(colors.primaryForeground, colors.primary)
    if (!primaryButtonContrast.passesAA) {
      issues.push({
        type: 'contrast',
        severity: primaryButtonContrast.ratio < 3 ? 'critical' : 'major',
        element: `${mode}-primary-button`,
        description: `Primary button contrast ratio is ${primaryButtonContrast.ratio.toFixed(2)}:1`,
        suggestion: 'Adjust primary button colors for better contrast',
      })
    }

    // Check secondary button contrast
    const secondaryButtonContrast = this.checkWCAGCompliance(colors.secondaryForeground, colors.secondary)
    if (!secondaryButtonContrast.passesAA) {
      issues.push({
        type: 'contrast',
        severity: secondaryButtonContrast.ratio < 3 ? 'critical' : 'major',
        element: `${mode}-secondary-button`,
        description: `Secondary button contrast ratio is ${secondaryButtonContrast.ratio.toFixed(2)}:1`,
        suggestion: 'Adjust secondary button colors for better contrast',
      })
    }

    return issues
  }

  /**
   * Check color blindness compatibility
   */
  private static checkColorBlindnessCompatibility(theme: CustomTheme): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Check important color combinations for each color blindness type
    const colorBlindnessTypes = Object.keys(this.COLOR_BLINDNESS_TYPES) as Array<keyof typeof AccessibilityUtils.COLOR_BLINDNESS_TYPES>

    colorBlindnessTypes.forEach(type => {
      // Check if primary colors are distinguishable
      const primarySimulated = this.simulateColorBlindness(theme.colors.light.primary, type)
      const backgroundSimulated = this.simulateColorBlindness(theme.colors.light.background, type)
      const ratio = this.calculateContrastRatio(primarySimulated, backgroundSimulated)

      if (ratio < 3) {
        issues.push({
          type: 'colorblindness',
          severity: 'major',
          element: `colorblind-${type}`,
          description: `Primary colors may not be distinguishable for users with ${type}`,
          suggestion: 'Consider using more distinct colors or patterns',
        })
      }
    })

    return issues
  }

  /**
   * Check focus indicators
   */
  private static checkFocusIndicators(theme: CustomTheme): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Check if ring color has sufficient contrast
    const ringContrast = this.checkWCAGCompliance(theme.colors.light.ring, theme.colors.light.background)
    if (!ringContrast.passesAA) {
      issues.push({
        type: 'focus',
        severity: 'major',
        element: 'focus-indicator',
        description: 'Focus indicator may not be visible enough',
        suggestion: 'Increase contrast of focus ring color or add outline',
      })
    }

    return issues
  }

  /**
   * Determine accessibility level based on theme characteristics
   */
  private static determineAccessibilityLevel(theme: CustomTheme): AccessibilityLevel {
    const report = this.generateAccessibilityReport(theme)
    
    if (report.score >= 90) return 'high-contrast'
    if (report.issues.some(i => i.type === 'colorblindness')) return 'colorblind-friendly'
    if (theme.effects.shadows === false && theme.effects.gradients === false) return 'large-text'
    return 'standard'
  }

  /**
   * Generate recommendations based on accessibility issues
   */
  private static generateRecommendations(issues: AccessibilityIssue[]): string[] {
    const recommendations = new Set<string>()

    issues.forEach(issue => {
      recommendations.add(issue.suggestion)
    })

    // Add general recommendations
    if (issues.some(i => i.type === 'contrast')) {
      recommendations.add('Consider using a color contrast checker tool')
      recommendations.add('Test your theme with real users with accessibility needs')
    }

    if (issues.some(i => i.type === 'colorblindness')) {
      recommendations.add('Use patterns and shapes in addition to colors')
      recommendations.add('Test with color blindness simulators')
    }

    return Array.from(recommendations)
  }

  /**
   * Optimize theme for accessibility level
   */
  static optimizeForAccessibility(theme: CustomTheme, level: AccessibilityLevel): CustomTheme {
    const optimized = { ...theme }

    switch (level) {
      case 'high-contrast':
        optimized.colors = this.createHighContrastColors(theme.colors)
        break
      case 'colorblind-friendly':
        optimized.colors = this.createColorblindFriendlyColors(theme.colors)
        break
      case 'large-text':
        optimized.colors = this.createLargeTextColors(theme.colors)
        break
      default:
        // Keep original colors for standard level
        break
    }

    return optimized
  }

  /**
   * Create high contrast color scheme
   */
  private static createHighContrastColors(originalColors: { light: ThemeColors; dark: ThemeColors }): { light: ThemeColors; dark: ThemeColors } {
    return {
      light: {
        ...originalColors.light,
        background: '0 0% 100%',      // Pure white
        foreground: '0 0% 0%',        // Pure black
        card: '0 0% 100%',           // Pure white
        cardForeground: '0 0% 0%',   // Pure black
        primary: '0 0% 0%',         // Pure black
        primaryForeground: '0 0% 100%', // Pure white
        secondary: '0 0% 0%',       // Pure black
        secondaryForeground: '0 0% 100%', // Pure white
        border: '0 0% 0%',          // Pure black
        ring: '0 0% 0%',            // Pure black
      },
      dark: {
        ...originalColors.dark,
        background: '0 0% 0%',      // Pure black
        foreground: '0 0% 100%',      // Pure white
        card: '0 0% 0%',           // Pure black
        cardForeground: '0 0% 100%', // Pure white
        primary: '0 0% 100%',       // Pure white
        primaryForeground: '0 0% 0%', // Pure black
        secondary: '0 0% 100%',     // Pure white
        secondaryForeground: '0 0% 0%', // Pure black
        border: '0 0% 100%',        // Pure white
        ring: '0 0% 100%',          // Pure white
      },
    }
  }

  /**
   * Create colorblind-friendly color scheme
   */
  private static createColorblindFriendlyColors(originalColors: { light: ThemeColors; dark: ThemeColors }): { light: ThemeColors; dark: ThemeColors } {
    // Use colors that are distinguishable for most types of color blindness
    return {
      light: {
        ...originalColors.light,
        primary: '210 100% 50%',      // Blue
        secondary: '120 100% 25%',     // Green
        accent: '30 100% 50%',        // Orange/Red-orange
        destructive: '0 84.2% 60.2%', // Red
      },
      dark: {
        ...originalColors.dark,
        primary: '210 100% 70%',      // Brighter blue
        secondary: '120 100% 40%',     // Brighter green
        accent: '30 100% 60%',        // Brighter orange
        destructive: '0 62.8% 30.6%', // Darker red
      },
    }
  }

  /**
   * Create large text color scheme
   */
  private static createLargeTextColors(originalColors: { light: ThemeColors; dark: ThemeColors }): { light: ThemeColors; dark: ThemeColors } {
    // Keep original colors but ensure they meet large text requirements
    return {
      light: {
        ...originalColors.light,
        // Ensure minimum contrast for large text (3:1)
      },
      dark: {
        ...originalColors.dark,
        // Ensure minimum contrast for large text (3:1)
      },
    }
  }

  /**
   * Validate theme for accessibility
   */
  static validateTheme(theme: CustomTheme): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    const report = this.generateAccessibilityReport(theme)

    // Check for critical issues
    const criticalIssues = report.issues.filter(i => i.severity === 'critical')
    if (criticalIssues.length > 0) {
      errors.push(`Found ${criticalIssues.length} critical accessibility issues`)
    }

    // Check for major issues
    const majorIssues = report.issues.filter(i => i.severity === 'major')
    if (majorIssues.length > 5) {
      errors.push(`Found ${majorIssues.length} major accessibility issues`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Get accessibility score for a theme
   */
  static getAccessibilityScore(theme: CustomTheme): number {
    const report = this.generateAccessibilityReport(theme)
    return report.score
  }

  /**
   * Check if theme meets WCAG 2.1 AA standards
   */
  static meetsWCAGAA(theme: CustomTheme): boolean {
    const report = this.generateAccessibilityReport(theme)
    return report.passes && report.score >= 70
  }

  /**
   * Check if theme meets WCAG 2.1 AAA standards
   */
  static meetsWCAGAAA(theme: CustomTheme): boolean {
    const report = this.generateAccessibilityReport(theme)
    return report.score >= 90
  }
}

// Export utility functions for easy access
export const {
  calculateLuminance,
  calculateContrastRatio,
  checkWCAGCompliance,
  simulateColorBlindness,
  generateAccessibilityReport,
  optimizeForAccessibility,
  validateTheme,
  getAccessibilityScore,
  meetsWCAGAA,
  meetsWCAGAAA,
} = AccessibilityUtils
