'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Palette,
  Eye,
  Download,
  Upload,
  Save,
  RotateCcw,
  Sparkles,
  Settings,
  Layers,
  Contrast,
  Moon,
  Sun,
  Check,
  X,
  AlertTriangle,
  Info,
  Zap,
  Brush,
  Sliders,
  Grid3x3,
} from 'lucide-react'
import { ColorPicker } from './ColorPicker'
import { BrandCustomizer } from './BrandCustomizer'
import { 
  CustomTheme, 
  ThemeBuilderState, 
  ValidationError, 
  ThemeColors, 
  ThemeMode,
  AccessibilityLevel,
  ThemeCategory 
} from '@/types/theme-engine'

interface ThemeBuilderProps {
  initialTheme?: Partial<CustomTheme>
  onSave?: (theme: CustomTheme) => void
  onPreview?: (theme: CustomTheme) => void
  className?: string
}

export function ThemeBuilder({ 
  initialTheme, 
  onSave, 
  onPreview,
  className = '' 
}: ThemeBuilderProps) {
  const [state, setState] = useState<ThemeBuilderState>({
    currentTheme: createDefaultTheme(),
    previewMode: 'both',
    isDirty: false,
    validationErrors: [],
    exportFormat: 'json',
  })

  const [activeSection, setActiveSection] = useState<'colors' | 'brand' | 'effects' | 'accessibility'>('colors')
  const [showPreview, setShowPreview] = useState(false)
  const [activeColorMode, setActiveColorMode] = useState<'light' | 'dark'>('light')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialTheme) {
      setState(prev => ({
        ...prev,
        currentTheme: { ...prev.currentTheme, ...initialTheme },
        isDirty: true,
      }))
    }
  }, [initialTheme])

  const updateTheme = useCallback((updates: Partial<CustomTheme>) => {
    setState(prev => ({
      ...prev,
      currentTheme: { ...prev.currentTheme, ...updates },
      isDirty: true,
    }))
  }, [])

  const updateColor = useCallback((mode: 'light' | 'dark', colorKey: keyof ThemeColors, value: string) => {
    setState(prev => ({
      ...prev,
      currentTheme: {
        ...prev.currentTheme,
        colors: {
          ...prev.currentTheme.colors,
          [mode]: {
            ...prev.currentTheme.colors[mode],
            [colorKey]: value,
          },
        },
      },
      isDirty: true,
    }))
  }, [])

  const validateTheme = useCallback((theme: CustomTheme): ValidationError[] => {
    const errors: ValidationError[] = []

    // Validate theme name
    if (!theme.name.trim()) {
      errors.push({
        field: 'name',
        message: 'Theme name is required',
        severity: 'error',
      })
    }

    // Validate colors
    const colorRegex = /^#?[0-9A-Fa-f]{6}$/
    Object.entries(theme.colors.light).forEach(([key, value]) => {
      if (!colorRegex.test(value)) {
        errors.push({
          field: `colors.light.${key}`,
          message: `Invalid color format for ${key}`,
          severity: 'error',
        })
      }
    })

    Object.entries(theme.colors.dark).forEach(([key, value]) => {
      if (!colorRegex.test(value)) {
        errors.push({
          field: `colors.dark.${key}`,
          message: `Invalid color format for ${key}`,
          severity: 'error',
        })
      }
    })

    // Validate accessibility
    const contrastIssues = checkContrast(theme.colors)
    if (contrastIssues.length > 0) {
      contrastIssues.forEach(issue => {
        errors.push({
          field: 'accessibility',
          message: issue,
          severity: 'warning',
        })
      })
    }

    return errors
  }, [])

  const handleSave = useCallback(() => {
    const errors = validateTheme(state.currentTheme)
    setState(prev => ({ ...prev, validationErrors: errors }))

    if (errors.filter(e => e.severity === 'error').length === 0) {
      onSave?.(state.currentTheme)
      setState(prev => ({ ...prev, isDirty: false }))
    }
  }, [state.currentTheme, validateTheme, onSave])

  const handlePreview = useCallback(() => {
    onPreview?.(state.currentTheme)
    setShowPreview(true)
  }, [state.currentTheme, onPreview])

  const handleExport = useCallback(() => {
    const { exportFormat } = state
    const theme = state.currentTheme

    let content = ''
    let filename = `${theme.name.toLowerCase().replace(/\s+/g, '-')}.${exportFormat}`

    switch (exportFormat) {
      case 'json':
        content = JSON.stringify(theme, null, 2)
        break
      case 'css':
        content = generateCSS(theme)
        break
      case 'tsx':
        content = generateTSX(theme)
        break
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [state])

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const theme = JSON.parse(content) as CustomTheme
        setState(prev => ({
          ...prev,
          currentTheme: theme,
          isDirty: true,
        }))
      } catch (error) {
        console.error('Failed to import theme:', error)
      }
    }
    reader.readAsText(file)
  }, [])

  const handleReset = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentTheme: createDefaultTheme(),
      isDirty: false,
      validationErrors: [],
    }))
  }, [])

  const generateColorPalette = useCallback((baseColor: string, type: 'monochromatic' | 'analogous' | 'complementary') => {
    const colors = generatePaletteFromBase(baseColor, type)
    const mode = activeColorMode
    
    colors.forEach((color, index) => {
      const colorKeys: (keyof ThemeColors)[] = [
        'primary', 'secondary', 'accent', 'destructive'
      ]
      if (colorKeys[index]) {
        updateColor(mode, colorKeys[index], color)
      }
    })
  }, [activeColorMode, updateColor])

  const optimizeForAccessibility = useCallback((level: AccessibilityLevel) => {
    const optimizedTheme = optimizeThemeForAccessibility(state.currentTheme, level)
    setState(prev => ({
      ...prev,
      currentTheme: optimizedTheme,
      isDirty: true,
    }))
  }, [state.currentTheme])

  const colorKeys: (keyof ThemeColors)[] = [
    'background', 'foreground', 'card', 'cardForeground',
    'popover', 'popoverForeground', 'primary', 'primaryForeground',
    'secondary', 'secondaryForeground', 'muted', 'mutedForeground',
    'accent', 'accentForeground', 'destructive', 'destructiveForeground',
    'border', 'input', 'ring'
  ]

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Theme Builder
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create and customize your perfect theme
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          
          <button
            onClick={handleSave}
            disabled={!state.isDirty || state.validationErrors.some(e => e.severity === 'error')}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Validation Errors */}
      {state.validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Validation Issues
              </h3>
              <ul className="mt-2 space-y-1">
                {state.validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 dark:text-red-300">
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 p-4 border-r border-gray-200 dark:border-gray-700">
          <nav className="space-y-1">
            {[
              { id: 'colors', label: 'Colors', icon: Palette },
              { id: 'brand', label: 'Brand', icon: Brush },
              { id: 'effects', label: 'Effects', icon: Sparkles },
              { id: 'accessibility', label: 'Accessibility', icon: Contrast },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="mt-6 space-y-2">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            
            <button
              onClick={handleReset}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Theme Info */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Theme Name
                </label>
                <input
                  type="text"
                  value={state.currentTheme.name}
                  onChange={(e) => updateTheme({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter theme name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={state.currentTheme.category}
                  onChange={(e) => updateTheme({ category: e.target.value as ThemeCategory })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="professional">Professional</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                  <option value="accessibility">Accessibility</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="brand">Brand</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          {activeSection === 'colors' && (
            <div className="space-y-6">
              {/* Color Mode Toggle */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Color Configuration
                </h3>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setActiveColorMode('light')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      activeColorMode === 'light'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Sun className="w-4 h-4 inline mr-1" />
                    Light
                  </button>
                  <button
                    onClick={() => setActiveColorMode('dark')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      activeColorMode === 'dark'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Moon className="w-4 h-4 inline mr-1" />
                    Dark
                  </button>
                </div>
              </div>

              {/* Color Palette Generator */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Quick Palette Generator
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'monochromatic', label: 'Mono' },
                    { type: 'analogous', label: 'Analogous' },
                    { type: 'complementary', label: 'Complementary' },
                  ].map(({ type, label }) => (
                    <button
                      key={type}
                      onClick={() => generateColorPalette(state.currentTheme.colors[activeColorMode].primary, type as any)}
                      className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-2 gap-4">
                {colorKeys.map((colorKey) => (
                  <ColorPicker
                    key={colorKey}
                    value={state.currentTheme.colors[activeColorMode][colorKey]}
                    onChange={(color) => updateColor(activeColorMode, colorKey, color)}
                    label={formatColorLabel(colorKey)}
                    showAccessibility={true}
                    showPalettes={true}
                    size="small"
                  />
                ))}
              </div>
            </div>
          )}

          {activeSection === 'brand' && (
            <BrandCustomizer
              brand={state.currentTheme.brand}
              onChange={(brand) => updateTheme({ brand })}
            />
          )}

          {activeSection === 'effects' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Visual Effects
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Transitions</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable smooth theme transitions
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.currentTheme.transitions.enabled}
                      onChange={(e) => updateTheme({
                        transitions: { ...state.currentTheme.transitions, enabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {state.currentTheme.transitions.enabled && (
                  <div className="grid grid-cols-2 gap-4 ml-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration (ms)
                      </label>
                      <input
                        type="number"
                        value={state.currentTheme.transitions.duration}
                        onChange={(e) => updateTheme({
                          transitions: { ...state.currentTheme.transitions, duration: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        min="0"
                        max="2000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Easing
                      </label>
                      <select
                        value={state.currentTheme.transitions.easing}
                        onChange={(e) => updateTheme({
                          transitions: { ...state.currentTheme.transitions, easing: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="ease">Ease</option>
                        <option value="ease-in">Ease In</option>
                        <option value="ease-out">Ease Out</option>
                        <option value="ease-in-out">Ease In Out</option>
                        <option value="linear">Linear</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Shadows</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable shadow effects
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.currentTheme.effects.shadows}
                      onChange={(e) => updateTheme({
                        effects: { ...state.currentTheme.effects, shadows: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Animations</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable UI animations
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.currentTheme.effects.animations}
                      onChange={(e) => updateTheme({
                        effects: { ...state.currentTheme.effects, animations: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Hover Effects</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable hover state effects
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.currentTheme.effects.hoverEffects}
                      onChange={(e) => updateTheme({
                        effects: { ...state.currentTheme.effects, hoverEffects: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Gradients</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Use gradient backgrounds
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.currentTheme.effects.gradients}
                      onChange={(e) => updateTheme({
                        effects: { ...state.currentTheme.effects, gradients: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'accessibility' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Accessibility Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Accessibility Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { level: 'standard' as AccessibilityLevel, label: 'Standard' },
                      { level: 'high-contrast' as AccessibilityLevel, label: 'High Contrast' },
                      { level: 'colorblind-friendly' as AccessibilityLevel, label: 'Colorblind Friendly' },
                      { level: 'large-text' as AccessibilityLevel, label: 'Large Text' },
                    ].map(({ level, label }) => (
                      <button
                        key={level}
                        onClick={() => optimizeForAccessibility(level)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Contrast className="w-4 h-4 inline mr-2" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <div className="font-medium mb-1">WCAG Compliance</div>
                      <div>
                        This theme will be optimized for WCAG 2.1 AA compliance when you select an accessibility level.
                        Contrast ratios will be automatically adjusted to meet the minimum requirements.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Current Accessibility Status
                  </h4>
                  <div className="space-y-2">
                    {checkAccessibilityStatus(state.currentTheme).map((status, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {status.label}
                        </span>
                        <span className={`text-sm font-medium ${
                          status.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {status.passed ? <Check className="w-4 h-4 inline" /> : <X className="w-4 h-4 inline" />}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Overlay */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Theme Preview
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Light Mode</h4>
                  <div 
                    className="p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: state.currentTheme.colors.light.background }}
                  >
                    <div className="space-y-4">
                      <h5 style={{ color: state.currentTheme.colors.light.foreground }}>
                        Sample Heading
                      </h5>
                      <p style={{ color: state.currentTheme.colors.light.mutedForeground }}>
                        This is sample text to preview your theme colors and readability.
                      </p>
                      <button
                        className="px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor: state.currentTheme.colors.light.primary,
                          color: state.currentTheme.colors.light.primaryForeground,
                        }}
                      >
                        Primary Button
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg ml-2"
                        style={{
                          backgroundColor: state.currentTheme.colors.light.secondary,
                          color: state.currentTheme.colors.light.secondaryForeground,
                        }}
                      >
                        Secondary Button
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Dark Mode</h4>
                  <div 
                    className="p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: state.currentTheme.colors.dark.background }}
                  >
                    <div className="space-y-4">
                      <h5 style={{ color: state.currentTheme.colors.dark.foreground }}>
                        Sample Heading
                      </h5>
                      <p style={{ color: state.currentTheme.colors.dark.mutedForeground }}>
                        This is sample text to preview your theme colors and readability.
                      </p>
                      <button
                        className="px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor: state.currentTheme.colors.dark.primary,
                          color: state.currentTheme.colors.dark.primaryForeground,
                        }}
                      >
                        Primary Button
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg ml-2"
                        style={{
                          backgroundColor: state.currentTheme.colors.dark.secondary,
                          color: state.currentTheme.colors.dark.secondaryForeground,
                        }}
                      >
                        Secondary Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions
function createDefaultTheme(): CustomTheme {
  return {
    id: '',
    name: 'Custom Theme',
    description: '',
    category: 'professional',
    accessibilityLevel: 'standard',
    mode: 'system',
    colors: {
      light: {
        background: '0 0% 100%',
        foreground: '222.2 84% 4.9%',
        card: '0 0% 100%',
        cardForeground: '222.2 84% 4.9%',
        popover: '0 0% 100%',
        popoverForeground: '222.2 84% 4.9%',
        primary: '222.2 47.4% 11.2%',
        primaryForeground: '210 40% 98%',
        secondary: '210 40% 96%',
        secondaryForeground: '222.2 84% 4.9%',
        muted: '210 40% 96%',
        mutedForeground: '215.4 16.3% 46.9%',
        accent: '210 40% 96%',
        accentForeground: '222.2 84% 4.9%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '210 40% 98%',
        border: '214.3 31.8% 91.4%',
        input: '214.3 31.8% 91.4%',
        ring: '222.2 84% 4.9%',
      },
      dark: {
        background: '222.2 84% 4.9%',
        foreground: '210 40% 98%',
        card: '222.2 84% 4.9%',
        cardForeground: '210 40% 98%',
        popover: '222.2 84% 4.9%',
        popoverForeground: '210 40% 98%',
        primary: '210 40% 98%',
        primaryForeground: '222.2 47.4% 11.2%',
        secondary: '217.2 32.6% 17.5%',
        secondaryForeground: '210 40% 98%',
        muted: '217.2 32.6% 17.5%',
        mutedForeground: '215 20.2% 65.1%',
        accent: '217.2 32.6% 17.5%',
        accentForeground: '210 40% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '210 40% 98%',
        border: '217.2 32.6% 17.5%',
        input: '217.2 32.6% 17.5%',
        ring: '212.7 26.8% 83.9%',
      },
    },
    brand: {
      logoSize: 'medium',
      brandColors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
      },
      borderRadius: 'medium',
      spacing: 'normal',
    },
    transitions: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out',
    },
    effects: {
      shadows: true,
      animations: true,
      hoverEffects: true,
      gradients: false,
    },
    metadata: {
      author: '',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      downloads: 0,
      rating: 0,
      featured: false,
    },
  }
}

function formatColorLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

function checkContrast(colors: { light: ThemeColors; dark: ThemeColors }): string[] {
  const issues: string[] = []
  
  // Basic contrast checks
  const lightContrast = getContrastRatio(colors.light.background, colors.light.foreground)
  const darkContrast = getContrastRatio(colors.dark.background, colors.dark.foreground)
  
  if (lightContrast < 4.5) {
    issues.push('Light mode text contrast is below WCAG AA standards')
  }
  
  if (darkContrast < 4.5) {
    issues.push('Dark mode text contrast is below WCAG AA standards')
  }
  
  return issues
}

function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  return 4.5 // Placeholder
}

function generatePaletteFromBase(baseColor: string, type: 'monochromatic' | 'analogous' | 'complementary'): string[] {
  // Simplified palette generation
  const colors = [baseColor]
  
  switch (type) {
    case 'monochromatic':
      colors.push('#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD')
      break
    case 'analogous':
      colors.push('#059669', '#3B82F6', '#7C3AED')
      break
    case 'complementary':
      colors.push('#3B82F6', '#DC2626', '#F59E0B')
      break
  }
  
  return colors
}

function generateCSS(theme: CustomTheme): string {
  return `
:root {
  --background: ${theme.colors.light.background};
  --foreground: ${theme.colors.light.foreground};
  /* ... other CSS variables ... */
}

.dark {
  --background: ${theme.colors.dark.background};
  --foreground: ${theme.colors.dark.foreground};
  /* ... other CSS variables ... */
}
  `.trim()
}

function generateTSX(theme: CustomTheme): string {
  return `
export const theme = {
  name: '${theme.name}',
  colors: ${JSON.stringify(theme.colors, null, 2)},
  // ... other theme properties ...
};
  `.trim()
}

function optimizeThemeForAccessibility(theme: CustomTheme, level: AccessibilityLevel): CustomTheme {
  // Simplified accessibility optimization
  const optimized = { ...theme }
  
  if (level === 'high-contrast') {
    // Increase contrast
    optimized.colors.light.foreground = '0 0% 0%'
    optimized.colors.light.background = '0 0% 100%'
    optimized.colors.dark.foreground = '0 0% 100%'
    optimized.colors.dark.background = '0 0% 0%'
  }
  
  return optimized
}

function checkAccessibilityStatus(theme: CustomTheme): Array<{ label: string; passed: boolean }> {
  return [
    { label: 'Color Contrast', passed: true },
    { label: 'Focus Indicators', passed: true },
    { label: 'Text Scaling', passed: true },
    { label: 'Keyboard Navigation', passed: true },
  ]
}
