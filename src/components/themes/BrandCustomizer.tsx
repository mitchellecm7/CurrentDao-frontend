'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Upload,
  X,
  Image as ImageIcon,
  Type,
  Palette,
  Box,
  Grid3x3,
  Sliders,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Plus,
  Settings,
} from 'lucide-react'
import { ColorPicker } from './ColorPicker'
import { BrandTheme } from '@/types/theme-engine'

interface BrandCustomizerProps {
  brand: BrandTheme
  onChange: (brand: BrandTheme) => void
  className?: string
}

export function BrandCustomizer({ brand, onChange, className = '' }: BrandCustomizerProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(brand.logoUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateBrand = useCallback((updates: Partial<BrandTheme>) => {
    onChange({ ...brand, ...updates })
  }, [brand, onChange])

  const handleLogoUpload = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        setLogoPreview(url)
        updateBrand({ logoUrl: url })
      }
      reader.readAsDataURL(file)
    }
  }, [updateBrand])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleLogoUpload(imageFile)
    }
  }, [handleLogoUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeLogo = useCallback(() => {
    setLogoPreview(null)
    updateBrand({ logoUrl: undefined })
  }, [updateBrand])

  const logoSizes = [
    { value: 'small', label: 'Small', description: '24px height' },
    { value: 'medium', label: 'Medium', description: '32px height' },
    { value: 'large', label: 'Large', description: '48px height' },
  ] as const

  const borderRadiusOptions = [
    { value: 'none', label: 'None', description: 'No border radius' },
    { value: 'small', label: 'Small', description: '4px radius' },
    { value: 'medium', label: 'Medium', description: '8px radius' },
    { value: 'large', label: 'Large', description: '12px radius' },
    { value: 'full', label: 'Full', description: 'Fully rounded' },
  ] as const

  const spacingOptions = [
    { value: 'compact', label: 'Compact', description: 'Tight spacing' },
    { value: 'normal', label: 'Normal', description: 'Standard spacing' },
    { value: 'comfortable', label: 'Comfortable', description: 'Relaxed spacing' },
    { value: 'spacious', label: 'Spacious', description: 'Extra spacing' },
  ] as const

  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Fira Code', label: 'Fira Code' },
    { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Logo Upload */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Brand Logo
        </h3>
        
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {logoPreview ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={logoPreview}
                  alt="Brand logo"
                  className={`max-h-32 rounded-lg ${
                    brand.logoSize === 'small' ? 'h-6' :
                    brand.logoSize === 'medium' ? 'h-8' :
                    'h-12'
                  }`}
                />
                <button
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Upload className="w-3 h-3 inline mr-1" />
                  Replace
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop your logo here, or click to browse
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  PNG, JPG, SVG up to 2MB
                </p>
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Choose File
              </button>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleLogoUpload(file)
            }}
            className="hidden"
          />
        </div>

        {/* Logo Size */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logo Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {logoSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => updateBrand({ logoSize: size.value })}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  brand.logoSize === size.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="font-medium">{size.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{size.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Colors */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Brand Colors
        </h3>
        
        <div className="space-y-4">
          <ColorPicker
            value={brand.brandColors.primary}
            onChange={(color) => updateBrand({
              brandColors: { ...brand.brandColors, primary: color }
            })}
            label="Primary Brand Color"
            showAccessibility={true}
            size="small"
          />
          
          <ColorPicker
            value={brand.brandColors.secondary}
            onChange={(color) => updateBrand({
              brandColors: { ...brand.brandColors, secondary: color }
            })}
            label="Secondary Brand Color"
            showAccessibility={true}
            size="small"
          />
          
          <ColorPicker
            value={brand.brandColors.accent}
            onChange={(color) => updateBrand({
              brandColors: { ...brand.brandColors, accent: color }
            })}
            label="Accent Brand Color"
            showAccessibility={true}
            size="small"
          />
        </div>

        {/* Color Harmony Check */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Color Harmony
            </span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Your brand colors work well together and create a cohesive visual identity.
          </div>
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Typography
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Heading Font
            </label>
            <select
              value={brand.customFonts?.heading || 'Inter'}
              onChange={(e) => updateBrand({
                customFonts: { ...brand.customFonts, heading: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Body Font
            </label>
            <select
              value={brand.customFonts?.body || 'Inter'}
              onChange={(e) => updateBrand({
                customFonts: { ...brand.customFonts, body: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monospace Font
            </label>
            <select
              value={brand.customFonts?.monospace || 'Fira Code'}
              onChange={(e) => updateBrand({
                customFonts: { ...brand.customFonts, monospace: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {fontOptions.filter(font => 
                font.value.includes('Code') || font.value.includes('Mono')
              ).map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Font Preview */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="space-y-2">
            <div 
              style={{ fontFamily: brand.customFonts?.heading || 'Inter' }}
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              Heading Text Sample
            </div>
            <div 
              style={{ fontFamily: brand.customFonts?.body || 'Inter' }}
              className="text-sm text-gray-600 dark:text-gray-400"
            >
              This is how your body text will appear with the selected font. 
              It should be readable and comfortable for extended reading.
            </div>
            <div 
              style={{ fontFamily: brand.customFonts?.monospace || 'Fira Code' }}
              className="text-xs text-gray-500 dark:text-gray-500"
            >
              const example = 'monospace text';
            </div>
          </div>
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Border Radius
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {borderRadiusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateBrand({ borderRadius: option.value })}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                brand.borderRadius === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              style={{
                borderRadius: option.value === 'none' ? '0' :
                           option.value === 'small' ? '4px' :
                           option.value === 'medium' ? '8px' :
                           option.value === 'large' ? '12px' : '9999px'
              }}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
            </button>
          ))}
        </div>

        {/* Border Radius Preview */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-4 gap-2">
            {['primary', 'secondary', 'accent', 'muted'].map((color) => (
              <div key={color} className="text-center">
                <div
                  className={`w-12 h-12 mx-auto mb-1 ${
                    color === 'primary' ? 'bg-blue-500' :
                    color === 'secondary' ? 'bg-gray-500' :
                    color === 'accent' ? 'bg-green-500' :
                    'bg-gray-300'
                  }`}
                  style={{
                    borderRadius: brand.borderRadius === 'none' ? '0' :
                               brand.borderRadius === 'small' ? '4px' :
                               brand.borderRadius === 'medium' ? '8px' :
                               brand.borderRadius === 'large' ? '12px' : '9999px'
                  }}
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {color}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Spacing
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {spacingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateBrand({ spacing: option.value })}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                brand.spacing === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
            </button>
          ))}
        </div>

        {/* Spacing Preview */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="space-y-2">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Spacing Preview:</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded" />
              <div className="w-8 h-8 bg-gray-500 rounded" />
              <div className="w-8 h-8 bg-green-500 rounded" />
            </div>
            <div 
              className="text-xs text-gray-500 dark:text-gray-400"
              style={{
                marginTop: brand.spacing === 'compact' ? '4px' :
                          brand.spacing === 'normal' ? '8px' :
                          brand.spacing === 'comfortable' ? '12px' : '16px'
              }}
            >
              Spacing affects the visual rhythm and breathing room in your interface.
            </div>
          </div>
        </div>
      </div>

      {/* Brand Guidelines */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Brand Guidelines
        </h3>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <div className="font-medium mb-1">Brand Consistency Tips</div>
              <ul className="space-y-1 text-xs">
                <li>• Use your brand colors consistently across all touchpoints</li>
                <li>• Maintain visual hierarchy with proper font sizing</li>
                <li>• Keep spacing consistent for better user experience</li>
                <li>• Ensure your logo is clear and recognizable at all sizes</li>
                <li>• Test your brand choices in both light and dark modes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
