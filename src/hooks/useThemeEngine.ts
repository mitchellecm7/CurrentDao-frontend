'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { 
  ThemeEngineContextType, 
  CustomTheme, 
  CommunityTheme, 
  ThemeSearchFilters,
  ThemeValidationError,
  ThemeImportResult,
  AccessibilityLevel,
  ThemeColors 
} from '@/types/theme-engine'

const ThemeEngineContext = createContext<ThemeEngineContextType | null>(null)

interface ThemeEngineProviderProps {
  children: ReactNode
  config?: {
    enableCommunityThemes?: boolean
    enableBrandCustomization?: boolean
    enableAccessibilityFeatures?: boolean
    enableThemeSharing?: boolean
    enableAutoSync?: boolean
    maxCustomThemes?: number
  }
}

export function ThemeEngineProvider({ children, config = {} }: ThemeEngineProviderProps) {
  const [themes, setThemes] = useState<CustomTheme[]>([])
  const [communityThemes, setCommunityThemes] = useState<CommunityTheme[]>([])
  const [currentTheme, setCurrentTheme] = useState<CustomTheme | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const defaultConfig = {
    enableCommunityThemes: true,
    enableBrandCustomization: true,
    enableAccessibilityFeatures: true,
    enableThemeSharing: true,
    enableAutoSync: false,
    maxCustomThemes: 10,
    ...config
  }

  // Initialize theme engine
  useEffect(() => {
    initializeThemeEngine()
  }, [])

  const initializeThemeEngine = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load saved themes from localStorage
      const savedThemes = localStorage.getItem('currentdao-custom-themes')
      if (savedThemes) {
        const parsedThemes = JSON.parse(savedThemes)
        setThemes(parsedThemes)
      }

      // Load current theme
      const savedCurrentTheme = localStorage.getItem('currentdao-current-theme')
      if (savedCurrentTheme) {
        const parsedTheme = JSON.parse(savedCurrentTheme)
        setCurrentTheme(parsedTheme)
        applyThemeToDOM(parsedTheme)
      }

      // Load community themes if enabled
      if (defaultConfig.enableCommunityThemes) {
        await loadCommunityThemes()
      }

    } catch (err) {
      console.error('Failed to initialize theme engine:', err)
      setError('Failed to initialize theme engine')
    } finally {
      setIsLoading(false)
    }
  }, [defaultConfig.enableCommunityThemes])

  const loadCommunityThemes = useCallback(async () => {
    try {
      // Mock community themes - in real app, this would fetch from API
      const mockCommunityThemes: CommunityTheme[] = []
      setCommunityThemes(mockCommunityThemes)
    } catch (err) {
      console.error('Failed to load community themes:', err)
    }
  }, [])

  const applyThemeToDOM = useCallback((theme: CustomTheme) => {
    const root = document.documentElement
    
    // Apply colors based on current mode
    const mode = theme.mode === 'system' ? 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
      theme.mode

    const colors = theme.colors[mode]

    // Apply CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVar, value)
    })

    // Apply brand settings
    if (theme.brand.logoUrl) {
      root.style.setProperty('--brand-logo-url', `url(${theme.brand.logoUrl})`)
    }

    root.style.setProperty('--brand-logo-size', 
      theme.brand.logoSize === 'small' ? '24px' :
      theme.brand.logoSize === 'medium' ? '32px' : '48px'
    )

    root.style.setProperty('--brand-border-radius',
      theme.brand.borderRadius === 'none' ? '0' :
      theme.brand.borderRadius === 'small' ? '4px' :
      theme.brand.borderRadius === 'medium' ? '8px' :
      theme.brand.borderRadius === 'large' ? '12px' : '9999px'
    )

    // Apply transitions
    if (theme.transitions.enabled) {
      root.style.setProperty('--theme-transition-duration', `${theme.transitions.duration}ms`)
      root.style.setProperty('--theme-transition-easing', theme.transitions.easing)
    }

    // Update data attributes
    root.setAttribute('data-theme', theme.id || 'custom')
    root.classList.remove('light', 'dark')
    root.classList.add(mode)
  }, [])

  const createTheme = useCallback(async (themeData: Omit<CustomTheme, 'id' | 'metadata'>): Promise<CustomTheme> => {
    try {
      // Check if user has reached max themes
      if (themes.length >= defaultConfig.maxCustomThemes) {
        throw new Error(`Maximum ${defaultConfig.maxCustomThemes} custom themes allowed`)
      }

      // Validate theme
      const validationErrors = validateTheme(themeData as CustomTheme)
      if (validationErrors.some(e => e.severity === 'error')) {
        throw new Error('Theme validation failed')
      }

      const newTheme: CustomTheme = {
        ...themeData,
        id: `custom-${Date.now()}`,
        metadata: {
          author: 'current-user', // In real app, get from auth context
          version: '1.0.0',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: themeData.metadata?.tags || [],
          downloads: 0,
          rating: 0,
          featured: false,
        }
      }

      const updatedThemes = [...themes, newTheme]
      setThemes(updatedThemes)
      localStorage.setItem('currentdao-custom-themes', JSON.stringify(updatedThemes))

      return newTheme
    } catch (err) {
      console.error('Failed to create theme:', err)
      throw err
    }
  }, [themes, defaultConfig.maxCustomThemes])

  const updateTheme = useCallback(async (id: string, updates: Partial<CustomTheme>): Promise<CustomTheme> => {
    try {
      const themeIndex = themes.findIndex(t => t.id === id)
      if (themeIndex === -1) {
        throw new Error('Theme not found')
      }

      const updatedTheme = {
        ...themes[themeIndex],
        ...updates,
        metadata: {
          ...themes[themeIndex].metadata,
          updatedAt: new Date(),
        }
      }

      // Validate updated theme
      const validationErrors = validateTheme(updatedTheme)
      if (validationErrors.some(e => e.severity === 'error')) {
        throw new Error('Theme validation failed')
      }

      const updatedThemes = [...themes]
      updatedThemes[themeIndex] = updatedTheme
      setThemes(updatedThemes)
      localStorage.setItem('currentdao-custom-themes', JSON.stringify(updatedThemes))

      // Update current theme if it's the one being modified
      if (currentTheme?.id === id) {
        setCurrentTheme(updatedTheme)
        applyThemeToDOM(updatedTheme)
        localStorage.setItem('currentdao-current-theme', JSON.stringify(updatedTheme))
      }

      return updatedTheme
    } catch (err) {
      console.error('Failed to update theme:', err)
      throw err
    }
  }, [themes, currentTheme, applyThemeToDOM])

  const deleteTheme = useCallback(async (id: string): Promise<void> => {
    try {
      const updatedThemes = themes.filter(t => t.id !== id)
      setThemes(updatedThemes)
      localStorage.setItem('currentdao-custom-themes', JSON.stringify(updatedThemes))

      // Clear current theme if it's the one being deleted
      if (currentTheme?.id === id) {
        setCurrentTheme(null)
        localStorage.removeItem('currentdao-current-theme')
        // Reset to default theme
        document.documentElement.removeAttribute('data-theme')
      }
    } catch (err) {
      console.error('Failed to delete theme:', err)
      throw err
    }
  }, [themes, currentTheme])

  const duplicateTheme = useCallback(async (id: string, name: string): Promise<CustomTheme> => {
    try {
      const originalTheme = themes.find(t => t.id === id)
      if (!originalTheme) {
        throw new Error('Theme not found')
      }

      const duplicatedTheme: CustomTheme = {
        ...originalTheme,
        id: `custom-${Date.now()}`,
        name,
        metadata: {
          ...originalTheme.metadata,
          author: 'current-user',
          createdAt: new Date(),
          updatedAt: new Date(),
          downloads: 0,
          rating: 0,
          featured: false,
        }
      }

      const updatedThemes = [...themes, duplicatedTheme]
      setThemes(updatedThemes)
      localStorage.setItem('currentdao-custom-themes', JSON.stringify(updatedThemes))

      return duplicatedTheme
    } catch (err) {
      console.error('Failed to duplicate theme:', err)
      throw err
    }
  }, [themes])

  const applyTheme = useCallback((theme: CustomTheme): void => {
    setCurrentTheme(theme)
    applyThemeToDOM(theme)
    localStorage.setItem('currentdao-current-theme', JSON.stringify(theme))
  }, [applyThemeToDOM])

  const resetToDefault = useCallback((): void => {
    setCurrentTheme(null)
    localStorage.removeItem('currentdao-current-theme')
    
    // Reset to default CSS variables
    const root = document.documentElement
    const defaultColors = {
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
    }

    Object.entries(defaultColors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVar, value)
    })

    root.removeAttribute('data-theme')
  }, [])

  const downloadCommunityTheme = useCallback(async (themeId: string): Promise<CommunityTheme> => {
    try {
      const theme = communityThemes.find(t => t.id === themeId)
      if (!theme) {
        throw new Error('Theme not found')
      }

      // Convert to custom theme
      const customTheme: CustomTheme = {
        id: `community-${theme.id}-${Date.now()}`,
        name: theme.name,
        description: theme.description,
        category: theme.category,
        accessibilityLevel: theme.accessibilityLevel,
        mode: theme.mode,
        colors: theme.colors,
        brand: theme.brand,
        transitions: theme.transitions,
        effects: theme.effects,
        metadata: {
          author: 'current-user',
          version: theme.metadata.version,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: theme.communityData.tags,
          downloads: 0,
          rating: 0,
          featured: false,
        }
      }

      const updatedThemes = [...themes, customTheme]
      setThemes(updatedThemes)
      localStorage.setItem('currentdao-custom-themes', JSON.stringify(updatedThemes))

      return theme
    } catch (err) {
      console.error('Failed to download community theme:', err)
      throw err
    }
  }, [communityThemes, themes])

  const uploadTheme = useCallback(async (theme: CustomTheme, isPublic: boolean): Promise<CommunityTheme> => {
    try {
      // In real app, this would upload to API
      const communityTheme: CommunityTheme = {
        ...theme,
        communityData: {
          authorId: 'current-user',
          authorName: 'Current User',
          authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser',
          isVerified: false,
          downloadCount: 0,
          ratingCount: 0,
          averageRating: 0,
          reviews: [],
          featured: false,
          trending: false,
          tags: theme.metadata.tags,
        },
        sharing: {
          isPublic,
          shareableLink: isPublic ? `https://themes.currentdao.com/${theme.id}` : undefined,
        }
      }

      if (isPublic) {
        const updatedCommunityThemes = [...communityThemes, communityTheme]
        setCommunityThemes(updatedCommunityThemes)
      }

      return communityTheme
    } catch (err) {
      console.error('Failed to upload theme:', err)
      throw err
    }
  }, [communityThemes])

  const rateTheme = useCallback(async (themeId: string, rating: number, review?: string): Promise<void> => {
    try {
      // In real app, this would send to API
      const updatedThemes = communityThemes.map(theme => {
        if (theme.id === themeId) {
          const newRatingCount = theme.communityData.ratingCount + 1
          const newAverageRating = (
            (theme.communityData.averageRating * theme.communityData.ratingCount + rating) / 
            newRatingCount
          )
          
          return {
            ...theme,
            communityData: {
              ...theme.communityData,
              ratingCount: newRatingCount,
              averageRating: newAverageRating,
              reviews: review ? [...theme.communityData.reviews, {
                id: `review-${Date.now()}`,
                userId: 'current-user',
                userName: 'Current User',
                rating,
                title: review.split('\n')[0] || '',
                content: review,
                createdAt: new Date(),
                helpful: 0,
                verified: false,
              }] : theme.communityData.reviews
            }
          }
        }
        return theme
      })
      
      setCommunityThemes(updatedThemes)
    } catch (err) {
      console.error('Failed to rate theme:', err)
      throw err
    }
  }, [communityThemes])

  const searchCommunityThemes = useCallback(async (query: string, filters?: ThemeSearchFilters): Promise<CommunityTheme[]> => {
    try {
      let filteredThemes = [...communityThemes]

      // Apply search query
      if (query) {
        filteredThemes = filteredThemes.filter(theme =>
          theme.name.toLowerCase().includes(query.toLowerCase()) ||
          theme.description.toLowerCase().includes(query.toLowerCase()) ||
          theme.communityData.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
      }

      // Apply filters
      if (filters) {
        if (filters.category) {
          filteredThemes = filteredThemes.filter(theme => theme.category === filters.category)
        }
        if (filters.accessibilityLevel) {
          filteredThemes = filteredThemes.filter(theme => theme.accessibilityLevel === filters.accessibilityLevel)
        }
        if (filters.rating) {
          filteredThemes = filteredThemes.filter(theme => theme.communityData.averageRating >= filters.rating!)
        }
        if (filters.featured) {
          filteredThemes = filteredThemes.filter(theme => theme.communityData.featured)
        }
        if (filters.trending) {
          filteredThemes = filteredThemes.filter(theme => theme.communityData.trending)
        }
        if (filters.tags && filters.tags.length > 0) {
          filteredThemes = filteredThemes.filter(theme =>
            filters.tags!.some(tag => theme.communityData.tags.includes(tag))
          )
        }
        if (filters.author) {
          filteredThemes = filteredThemes.filter(theme =>
            theme.communityData.authorName.toLowerCase().includes(filters.author!.toLowerCase())
          )
        }
      }

      return filteredThemes
    } catch (err) {
      console.error('Failed to search community themes:', err)
      throw err
    }
  }, [communityThemes])

  const exportTheme = useCallback(async (theme: CustomTheme, format: 'json' | 'css' | 'tsx'): Promise<string> => {
    try {
      switch (format) {
        case 'json':
          return JSON.stringify(theme, null, 2)
        
        case 'css':
          return generateCSS(theme)
        
        case 'tsx':
          return generateTSX(theme)
        
        default:
          throw new Error('Unsupported export format')
      }
    } catch (err) {
      console.error('Failed to export theme:', err)
      throw err
    }
  }, [])

  const importTheme = useCallback(async (data: string, format: 'json' | 'css' | 'tsx'): Promise<CustomTheme> => {
    try {
      let theme: CustomTheme

      switch (format) {
        case 'json':
          theme = JSON.parse(data)
          break
        
        case 'css':
          theme = parseCSS(data)
          break
        
        case 'tsx':
          theme = parseTSX(data)
          break
        
        default:
          throw new Error('Unsupported import format')
      }

      // Validate imported theme
      const validationErrors = validateTheme(theme)
      if (validationErrors.some(e => e.severity === 'error')) {
        throw new Error('Invalid theme format')
      }

      // Generate new ID and metadata
      const importedTheme: CustomTheme = {
        ...theme,
        id: `imported-${Date.now()}`,
        metadata: {
          ...theme.metadata,
          author: 'current-user',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }

      const updatedThemes = [...themes, importedTheme]
      setThemes(updatedThemes)
      localStorage.setItem('currentdao-custom-themes', JSON.stringify(updatedThemes))

      return importedTheme
    } catch (err) {
      console.error('Failed to import theme:', err)
      throw err
    }
  }, [themes])

  const syncThemes = useCallback(async (): Promise<void> => {
    try {
      if (!defaultConfig.enableAutoSync) {
        return
      }

      // In real app, this would sync with cloud storage
      console.log('Syncing themes...')
    } catch (err) {
      console.error('Failed to sync themes:', err)
      throw err
    }
  }, [defaultConfig.enableAutoSync])

  const validateTheme = useCallback((theme: CustomTheme): ThemeValidationError[] => {
    const errors: ThemeValidationError[] = []

    // Validate required fields
    if (!theme.name || theme.name.trim() === '') {
      errors.push({
        field: 'name',
        value: theme.name,
        rule: 'required',
        message: 'Theme name is required',
        severity: 'error'
      })
    }

    // Validate colors
    const colorRegex = /^#?[0-9A-Fa-f]{6}$/
    Object.entries(theme.colors.light).forEach(([key, value]) => {
      if (!colorRegex.test(value)) {
        errors.push({
          field: `colors.light.${key}`,
          value,
          rule: 'color-format',
          message: `Invalid color format for ${key}`,
          severity: 'error'
        })
      }
    })

    Object.entries(theme.colors.dark).forEach(([key, value]) => {
      if (!colorRegex.test(value)) {
        errors.push({
          field: `colors.dark.${key}`,
          value,
          rule: 'color-format',
          message: `Invalid color format for ${key}`,
          severity: 'error'
        })
      }
    })

    // Check contrast ratios
    const lightContrast = getContrastRatio(theme.colors.light.background, theme.colors.light.foreground)
    const darkContrast = getContrastRatio(theme.colors.dark.background, theme.colors.dark.foreground)

    if (lightContrast < 4.5) {
      errors.push({
        field: 'accessibility.light-contrast',
        value: lightContrast,
        rule: 'contrast-ratio',
        message: 'Light mode text contrast is below WCAG AA standards',
        severity: 'warning'
      })
    }

    if (darkContrast < 4.5) {
      errors.push({
        field: 'accessibility.dark-contrast',
        value: darkContrast,
        rule: 'contrast-ratio',
        message: 'Dark mode text contrast is below WCAG AA standards',
        severity: 'warning'
      })
    }

    return errors
  }, [])

  const generateColorPalette = useCallback((baseColor: string, type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic'): any => {
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
      case 'triadic':
        colors.push('#3B82F6', '#10B981', '#F59E0B')
        break
      case 'tetradic':
        colors.push('#3B82F6', '#10B981', '#F59E0B', '#EF4444')
        break
    }
    
    return {
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Palette`,
      colors,
      type,
      harmony: 85,
    }
  }, [])

  const optimizeForAccessibility = useCallback((theme: CustomTheme, level: AccessibilityLevel): CustomTheme => {
    const optimized = { ...theme }
    
    if (level === 'high-contrast') {
      // Increase contrast
      optimized.colors.light.foreground = '0 0% 0%'
      optimized.colors.light.background = '0 0% 100%'
      optimized.colors.dark.foreground = '0 0% 100%'
      optimized.colors.dark.background = '0 0% 0%'
    }
    
    return optimized
  }, [])

  const contextValue: ThemeEngineContextType = {
    themes,
    communityThemes,
    currentTheme,
    isLoading,
    error,
    createTheme,
    updateTheme,
    deleteTheme,
    duplicateTheme,
    applyTheme,
    resetToDefault,
    downloadCommunityTheme,
    uploadTheme,
    rateTheme,
    searchCommunityThemes,
    exportTheme,
    importTheme,
    syncThemes,
    validateTheme,
    generateColorPalette,
    optimizeForAccessibility,
  }

  return (
    <ThemeEngineContext.Provider value={contextValue}>
      {children}
    </ThemeEngineContext.Provider>
  )
}

export function useThemeEngine(): ThemeEngineContextType {
  const context = useContext(ThemeEngineContext)
  if (!context) {
    throw new Error('useThemeEngine must be used within a ThemeEngineProvider')
  }
  return context
}

// Helper functions
function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In real implementation, this would convert HSL to RGB and calculate proper contrast
  return 4.5 // Placeholder
}

function generateCSS(theme: CustomTheme): string {
  return `
:root {
  --background: ${theme.colors.light.background};
  --foreground: ${theme.colors.light.foreground};
  --card: ${theme.colors.light.card};
  --card-foreground: ${theme.colors.light.cardForeground};
  --popover: ${theme.colors.light.popover};
  --popover-foreground: ${theme.colors.light.popoverForeground};
  --primary: ${theme.colors.light.primary};
  --primary-foreground: ${theme.colors.light.primaryForeground};
  --secondary: ${theme.colors.light.secondary};
  --secondary-foreground: ${theme.colors.light.secondaryForeground};
  --muted: ${theme.colors.light.muted};
  --muted-foreground: ${theme.colors.light.mutedForeground};
  --accent: ${theme.colors.light.accent};
  --accent-foreground: ${theme.colors.light.accentForeground};
  --destructive: ${theme.colors.light.destructive};
  --destructive-foreground: ${theme.colors.light.destructiveForeground};
  --border: ${theme.colors.light.border};
  --input: ${theme.colors.light.input};
  --ring: ${theme.colors.light.ring};
}

.dark {
  --background: ${theme.colors.dark.background};
  --foreground: ${theme.colors.dark.foreground};
  --card: ${theme.colors.dark.card};
  --card-foreground: ${theme.colors.dark.cardForeground};
  --popover: ${theme.colors.dark.popover};
  --popover-foreground: ${theme.colors.dark.popoverForeground};
  --primary: ${theme.colors.dark.primary};
  --primary-foreground: ${theme.colors.dark.primaryForeground};
  --secondary: ${theme.colors.dark.secondary};
  --secondary-foreground: ${theme.colors.dark.secondaryForeground};
  --muted: ${theme.colors.dark.muted};
  --muted-foreground: ${theme.colors.dark.mutedForeground};
  --accent: ${theme.colors.dark.accent};
  --accent-foreground: ${theme.colors.dark.accentForeground};
  --destructive: ${theme.colors.dark.destructive};
  --destructive-foreground: ${theme.colors.dark.destructiveForeground};
  --border: ${theme.colors.dark.border};
  --input: ${theme.colors.dark.input};
  --ring: ${theme.colors.dark.ring};
}
  `.trim()
}

function generateTSX(theme: CustomTheme): string {
  return `
export const ${theme.name.replace(/\s+/g, '')}Theme = {
  id: '${theme.id}',
  name: '${theme.name}',
  description: '${theme.description}',
  category: '${theme.category}',
  accessibilityLevel: '${theme.accessibilityLevel}',
  mode: '${theme.mode}',
  colors: ${JSON.stringify(theme.colors, null, 2)},
  brand: ${JSON.stringify(theme.brand, null, 2)},
  transitions: ${JSON.stringify(theme.transitions, null, 2)},
  effects: ${JSON.stringify(theme.effects, null, 2)},
  metadata: ${JSON.stringify(theme.metadata, null, 2)},
}
  `.trim()
}

function parseCSS(css: string): CustomTheme {
  // Simplified CSS parsing - in real implementation, this would be more robust
  throw new Error('CSS import not yet implemented')
}

function parseTSX(tsx: string): CustomTheme {
  // Simplified TSX parsing - in real implementation, this would use AST parsing
  throw new Error('TSX import not yet implemented')
}
