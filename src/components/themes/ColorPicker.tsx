'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Palette,
  Droplet,
  Sun,
  Moon,
  Grid3x3,
  Sliders,
  Sparkles,
  Contrast,
  Info,
} from 'lucide-react'
import { ColorPalette, AccessibilityLevel } from '@/types/theme-engine'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  showPreview?: boolean
  showAccessibility?: boolean
  showPalettes?: boolean
  showHistory?: boolean
  allowAlpha?: boolean
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  className?: string
}

export function ColorPicker({
  value,
  onChange,
  label,
  showPreview = true,
  showAccessibility = true,
  showPalettes = true,
  showHistory = false,
  allowAlpha = false,
  size = 'medium',
  disabled = false,
  className = '',
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'picker' | 'palettes' | 'accessibility'>('picker')
  const [colorHistory, setColorHistory] = useState<string[]>([])
  const [accessibilityScore, setAccessibilityScore] = useState<number | null>(null)
  
  const pickerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Parse color value
  const parseColor = useCallback((color: string) => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const a = allowAlpha && hex.length === 8 ? parseInt(hex.substr(6, 2), 16) / 255 : 1
    return { r, g, b, a }
  }, [allowAlpha])

  // Convert RGB to Hex
  const rgbToHex = useCallback((r: number, g: number, b: number, a: number = 1) => {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0')
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`
    return allowAlpha && a < 1 ? `${hex}${toHex(a)}` : hex
  }, [allowAlpha])

  // Calculate accessibility score
  const calculateAccessibilityScore = useCallback((color: string) => {
    const { r, g, b } = parseColor(color)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    const score = Math.round(luminance * 100)
    setAccessibilityScore(score)
  }, [parseColor])

  useEffect(() => {
    setInputValue(value)
    calculateAccessibilityScore(value)
  }, [value, calculateAccessibilityScore])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleColorChange = useCallback((newColor: string) => {
    onChange(newColor)
    setInputValue(newColor)
    calculateAccessibilityScore(newColor)
    
    // Add to history
    setColorHistory(prev => {
      const filtered = prev.filter(c => c !== newColor)
      return [newColor, ...filtered].slice(0, 12)
    })
  }, [onChange, calculateAccessibilityScore])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    // Validate and apply if valid hex color
    if (/^#?[0-9A-Fa-f]{6}$/.test(value) || (allowAlpha && /^#?[0-9A-Fa-f]{8}$/.test(value))) {
      const color = value.startsWith('#') ? value : `#${value}`
      handleColorChange(color)
    }
  }, [allowAlpha, handleColorChange])

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inputValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy color:', error)
    }
  }, [inputValue])

  const generatePalette = useCallback((baseColor: string, type: ColorPalette['type']) => {
    const { r, g, b } = parseColor(baseColor)
    const colors: string[] = []

    switch (type) {
      case 'monochromatic':
        for (let i = 0; i < 5; i++) {
          const factor = 0.2 + (i * 0.15)
          colors.push(rgbToHex(r * factor, g * factor, b * factor))
        }
        break
      case 'analogous':
        colors.push(rgbToHex(r, g, b))
        colors.push(rgbToHex(Math.min(255, r + 30), g, Math.max(0, b - 30)))
        colors.push(rgbToHex(Math.max(0, r - 30), g, Math.min(255, b + 30)))
        colors.push(rgbToHex(Math.min(255, r + 60), g, Math.max(0, b - 60)))
        colors.push(rgbToHex(Math.max(0, r - 60), g, Math.min(255, b + 60)))
        break
      case 'complementary':
        colors.push(rgbToHex(r, g, b))
        colors.push(rgbToHex(255 - r, 255 - g, 255 - b))
        break
      case 'triadic':
        colors.push(rgbToHex(r, g, b))
        colors.push(rgbToHex(255 - g, Math.min(255, r + 100), b))
        colors.push(rgbToHex(g, Math.min(255, b + 100), 255 - r))
        break
      case 'tetradic':
        colors.push(rgbToHex(r, g, b))
        colors.push(rgbToHex(255 - r, g, b))
        colors.push(rgbToHex(r, 255 - g, b))
        colors.push(rgbToHex(r, g, 255 - b))
        break
    }

    return {
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Palette`,
      colors,
      type,
      harmony: 85,
    }
  }, [parseColor, rgbToHex])

  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FF8800', '#8800FF',
    '#00FF88', '#FF0088', '#88FF00', '#0088FF', '#888888',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  ]

  const accessibilityPalettes = [
    { name: 'WCAG AA Compliant', colors: ['#000000', '#FFFFFF', '#1E1E1E', '#F5F5F5'], level: 'AA' as AccessibilityLevel },
    { name: 'High Contrast', colors: ['#000000', '#FFFFFF', '#FFFF00', '#0000FF'], level: 'high-contrast' as AccessibilityLevel },
    { name: 'Colorblind Friendly', colors: ['#0066CC', '#FF6600', '#00AA00', '#9900CC'], level: 'colorblind-friendly' as AccessibilityLevel },
  ]

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
  }

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Color Display Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            ${sizeClasses[size]}
            rounded-lg border-2 border-gray-300 dark:border-gray-600
            flex items-center justify-center
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500'}
            ${isOpen ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : ''}
          `}
          style={{ backgroundColor: value }}
        >
          {showPreview && (
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  background: `linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)`,
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 4px 4px',
                }}
              />
            </div>
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={pickerRef}
            className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Color Picker</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('picker')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'picker'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                }`}
              >
                <Sliders className="w-4 h-4 inline mr-1" />
                Picker
              </button>
              {showPalettes && (
                <button
                  onClick={() => setActiveTab('palettes')}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'palettes'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4 inline mr-1" />
                  Palettes
                </button>
              )}
              {showAccessibility && (
                <button
                  onClick={() => setActiveTab('accessibility')}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'accessibility'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  <Contrast className="w-4 h-4 inline mr-1" />
                  Accessibility
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="p-3">
              {activeTab === 'picker' && (
                <div className="space-y-3">
                  {/* Current Color Display */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: value }}
                    />
                    <div className="flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="#000000"
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={copyToClipboard}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                        {accessibilityScore !== null && (
                          <span className="text-xs text-gray-500">
                            Luminance: {accessibilityScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preset Colors */}
                  <div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preset Colors
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Color History */}
                  {showHistory && colorHistory.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recent Colors
                      </div>
                      <div className="flex gap-1">
                        {colorHistory.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleColorChange(color)}
                            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'palettes' && (
                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Generate Palette
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['monochromatic', 'analogous', 'complementary', 'triadic'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          const palette = generatePalette(value, type)
                          palette.colors.forEach((color, index) => {
                            setTimeout(() => handleColorChange(color), index * 100)
                          })
                        }}
                        className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'accessibility' && (
                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Accessibility Palettes
                  </div>
                  {accessibilityPalettes.map((palette) => (
                    <div key={palette.name} className="space-y-2">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {palette.name}
                      </div>
                      <div className="flex gap-1">
                        {palette.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleColorChange(color)}
                            className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {accessibilityScore !== null && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="text-xs text-blue-800 dark:text-blue-200">
                          <div className="font-medium">Accessibility Info</div>
                          <div>
                            Luminance: {accessibilityScore}%
                            {accessibilityScore < 30 && ' - May have contrast issues'}
                            {accessibilityScore >= 30 && accessibilityScore < 70 && ' - Good balance'}
                            {accessibilityScore >= 70 && ' - Excellent contrast'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
