export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'high-contrast' | 'custom';
export type ThemeCategory = 'professional' | 'creative' | 'minimal' | 'accessibility' | 'seasonal' | 'brand';
export type AccessibilityLevel = 'standard' | 'high-contrast' | 'colorblind-friendly' | 'large-text';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface BrandTheme {
  logoUrl?: string;
  logoSize: 'small' | 'medium' | 'large';
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  customFonts?: {
    heading?: string;
    body?: string;
    monospace?: string;
  };
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  spacing: 'compact' | 'normal' | 'comfortable' | 'spacious';
}

export interface CustomTheme {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  accessibilityLevel: AccessibilityLevel;
  mode: ThemeMode;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  brand: BrandTheme;
  transitions: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
  effects: {
    shadows: boolean;
    animations: boolean;
    hoverEffects: boolean;
    gradients: boolean;
  };
  metadata: {
    author: string;
    version: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    downloads: number;
    rating: number;
    featured: boolean;
  };
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  colors: {
    light: Partial<ThemeColors>;
    dark: Partial<ThemeColors>;
  };
  brand: Partial<BrandTheme>;
  preview: {
    light: string;
    dark: string;
  };
}

export interface CommunityTheme extends CustomTheme {
  communityData: {
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    isVerified: boolean;
    downloadCount: number;
    ratingCount: number;
    averageRating: number;
    reviews: ThemeReview[];
    featured: boolean;
    trending: boolean;
    tags: string[];
  };
  sharing: {
    isPublic: boolean;
    shareableLink?: string;
    embedCode?: string;
    qrCode?: string;
  };
}

export interface ThemeReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  createdAt: Date;
  helpful: number;
  verified: boolean;
}

export interface ThemeBuilderState {
  currentTheme: CustomTheme;
  previewMode: 'light' | 'dark' | 'both';
  isDirty: boolean;
  validationErrors: ValidationError[];
  exportFormat: 'json' | 'css' | 'tsx';
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ColorPalette {
  name: string;
  colors: string[];
  type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic';
  harmony: number;
}

export interface ThemeSyncData {
  userId: string;
  themes: CustomTheme[];
  settings: {
    autoSync: boolean;
    syncInterval: number;
    lastSync: Date;
    deviceId: string;
  };
}

export interface ThemeEngineConfig {
  enableCommunityThemes: boolean;
  enableBrandCustomization: boolean;
  enableAccessibilityFeatures: boolean;
  enableThemeSharing: boolean;
  enableAutoSync: boolean;
  maxCustomThemes: number;
  supportedLanguages: string[];
  defaultTheme: string;
}

export interface ThemeEngineContextType {
  themes: CustomTheme[];
  communityThemes: CommunityTheme[];
  currentTheme: CustomTheme | null;
  isLoading: boolean;
  error: string | null;
  
  // Theme management
  createTheme: (theme: Omit<CustomTheme, 'id' | 'metadata'>) => Promise<CustomTheme>;
  updateTheme: (id: string, updates: Partial<CustomTheme>) => Promise<CustomTheme>;
  deleteTheme: (id: string) => Promise<void>;
  duplicateTheme: (id: string, name: string) => Promise<CustomTheme>;
  applyTheme: (theme: CustomTheme) => void;
  resetToDefault: () => void;
  
  // Community features
  downloadCommunityTheme: (themeId: string) => Promise<CommunityTheme>;
  uploadTheme: (theme: CustomTheme, isPublic: boolean) => Promise<CommunityTheme>;
  rateTheme: (themeId: string, rating: number, review?: string) => Promise<void>;
  searchCommunityThemes: (query: string, filters?: ThemeSearchFilters) => Promise<CommunityTheme[]>;
  
  // Sync and export
  exportTheme: (theme: CustomTheme, format: 'json' | 'css' | 'tsx') => Promise<string>;
  importTheme: (data: string, format: 'json' | 'css' | 'tsx') => Promise<CustomTheme>;
  syncThemes: () => Promise<void>;
  
  // Builder utilities
  validateTheme: (theme: CustomTheme) => ValidationError[];
  generateColorPalette: (baseColor: string, type: ColorPalette['type']) => ColorPalette;
  optimizeForAccessibility: (theme: CustomTheme, level: AccessibilityLevel) => CustomTheme;
}

export interface ThemeSearchFilters {
  category?: ThemeCategory;
  accessibilityLevel?: AccessibilityLevel;
  rating?: number;
  featured?: boolean;
  trending?: boolean;
  tags?: string[];
  author?: string;
}

export interface ThemePreview {
  id: string;
  name: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  screenshots: {
    light: string;
    dark: string;
  };
  demoComponents: string[];
}

export interface ThemeAnalytics {
  totalThemes: number;
  communityThemes: number;
  customThemes: number;
  downloads: number;
  ratings: number;
  averageRating: number;
  topCategories: Array<{
    category: ThemeCategory;
    count: number;
  }>;
  trendingThemes: CommunityTheme[];
}

export interface AccessibilityReport {
  theme: CustomTheme;
  level: AccessibilityLevel;
  score: number;
  issues: AccessibilityIssue[];
  recommendations: string[];
  passes: boolean;
}

export interface AccessibilityIssue {
  type: 'contrast' | 'colorblindness' | 'readability' | 'focus';
  severity: 'critical' | 'major' | 'minor' | 'info';
  element: string;
  description: string;
  suggestion: string;
}

export interface ThemeTransition {
  type: 'fade' | 'slide' | 'zoom' | 'flip' | 'none';
  duration: number;
  easing: string;
  properties: string[];
}

export interface ThemeEffect {
  name: string;
  type: 'shadow' | 'gradient' | 'animation' | 'hover';
  properties: Record<string, any>;
  enabled: boolean;
}

export interface ThemeCustomizationOptions {
  colors: {
    allowCustomColors: boolean;
    colorPickerType: 'simple' | 'advanced' | 'ai-assisted';
    palettePresets: ColorPalette[];
  };
  branding: {
    allowLogoUpload: boolean;
    allowCustomFonts: boolean;
    maxLogoSize: number;
    supportedFormats: string[];
  };
  accessibility: {
    autoContrastCheck: boolean;
    colorblindSimulation: boolean;
    largeTextMode: boolean;
    wcagCompliance: 'AA' | 'AAA' | 'none';
  };
  effects: {
    allowShadows: boolean;
    allowGradients: boolean;
    allowAnimations: boolean;
    maxAnimationDuration: number;
  };
}

export interface ThemeExportOptions {
  format: 'json' | 'css' | 'tsx' | 'scss' | 'less';
  includeMetadata: boolean;
  includeBrand: boolean;
  minify: boolean;
  variablePrefix: string;
  cssSelector: string;
}

export interface ThemeImportResult {
  theme: CustomTheme;
  warnings: string[];
  errors: string[];
  imported: boolean;
}

export interface ThemeValidationError {
  field: string;
  value: any;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ThemeColorHarmony {
  score: number;
  type: string;
  description: string;
  suggestions: string[];
}

export interface ThemeAIAssistance {
  generateTheme: (prompt: string, preferences?: Partial<CustomTheme>) => Promise<CustomTheme>;
  optimizeColors: (theme: CustomTheme, goals: string[]) => Promise<CustomTheme>;
  suggestPalette: (baseColor: string, mood: string) => Promise<ColorPalette>;
  improveAccessibility: (theme: CustomTheme) => Promise<AccessibilityReport>;
}

export interface ThemeCollaboration {
  id: string;
  name: string;
  theme: CustomTheme;
  collaborators: Array<{
    userId: string;
    userName: string;
    role: 'owner' | 'editor' | 'viewer';
    joinedAt: Date;
  }>;
  permissions: {
    canEdit: boolean;
    canShare: boolean;
    canExport: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ThemeVersion {
  id: string;
  themeId: string;
  version: string;
  name: string;
  description: string;
  theme: CustomTheme;
  changes: string[];
  author: string;
  createdAt: Date;
  isCurrent: boolean;
}

export interface ThemeTemplate {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  baseTheme: CustomTheme;
  customizationOptions: ThemeCustomizationOptions;
  preview: ThemePreview;
  isPro: boolean;
  usageCount: number;
}
