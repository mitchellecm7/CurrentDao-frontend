'use client'

import { forwardRef, ReactNode, CSSProperties, useState, useEffect } from 'react'
import { useResponsiveDesign, ResponsiveValue } from '@/hooks/useResponsiveDesign'

export interface AdaptiveLayoutProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  
  // Layout structure
  header?: ReactNode
  sidebar?: ReactNode
  footer?: ReactNode
  aside?: ReactNode
  
  // Layout configuration
  layout?: ResponsiveValue<'default' | 'stacked' | 'sidebar' | 'centered' | 'wide'>
  maxWidth?: ResponsiveValue<string | number>
  padding?: ResponsiveValue<string | number>
  gap?: ResponsiveValue<string | number>
  
  // Sidebar configuration
  sidebarWidth?: ResponsiveValue<string | number>
  sidebarPosition?: ResponsiveValue<'left' | 'right'>
  sidebarCollapsible?: ResponsiveValue<boolean>
  sidebarCollapsed?: boolean
  onSidebarToggle?: (collapsed: boolean) => void
  
  // Header configuration
  headerHeight?: ResponsiveValue<string | number>
  headerSticky?: ResponsiveValue<boolean>
  headerTransparent?: ResponsiveValue<boolean>
  
  // Footer configuration
  footerHeight?: ResponsiveValue<string | number>
  footerSticky?: ResponsiveValue<boolean>
  
  // Content configuration
  contentMaxWidth?: ResponsiveValue<string | number>
  contentPadding?: ResponsiveValue<string | number>
  
  // Responsive behavior
  collapseOnMobile?: boolean
  hideSidebarOnMobile?: boolean
  stackOnMobile?: boolean
  
  // Performance
  virtualizeContent?: boolean
  lazyLoadSections?: boolean
}

export interface AdaptiveLayoutSectionProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  
  // Section configuration
  section?: 'header' | 'sidebar' | 'content' | 'footer' | 'aside'
  order?: ResponsiveValue<number>
  flex?: ResponsiveValue<string | number>
  width?: ResponsiveValue<string | number>
  height?: ResponsiveValue<string | number>
  minWidth?: ResponsiveValue<string | number>
  maxWidth?: ResponsiveValue<string | number>
  minHeight?: ResponsiveValue<string | number>
  maxHeight?: ResponsiveValue<string | number>
  
  // Positioning
  position?: ResponsiveValue<'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'>
  top?: ResponsiveValue<string | number>
  right?: ResponsiveValue<string | number>
  bottom?: ResponsiveValue<string | number>
  left?: ResponsiveValue<string | number>
  zIndex?: ResponsiveValue<number>
  
  // Display
  display?: ResponsiveValue<'none' | 'block' | 'flex' | 'grid' | 'inline' | 'inline-block'>
  overflow?: ResponsiveValue<'visible' | 'hidden' | 'scroll' | 'auto'>
  
  // Responsive behavior
  hideOnMobile?: boolean
  hideOnTablet?: boolean
  hideOnDesktop?: boolean
  collapseOnMobile?: boolean
}

export const AdaptiveLayout = forwardRef<HTMLDivElement, AdaptiveLayoutProps>(
  ({
    children,
    className = '',
    style: propStyle = {},
    header,
    sidebar,
    footer,
    aside,
    layout,
    maxWidth,
    padding,
    gap,
    sidebarWidth = '280px',
    sidebarPosition = 'left',
    sidebarCollapsible = false,
    sidebarCollapsed = false,
    onSidebarToggle,
    headerHeight = '64px',
    headerSticky = false,
    headerTransparent = false,
    footerHeight = '64px',
    footerSticky = false,
    contentMaxWidth,
    contentPadding,
    collapseOnMobile = true,
    hideSidebarOnMobile = true,
    stackOnMobile = true,
    virtualizeContent = false,
    lazyLoadSections = false,
  }, ref) => {
    const {
      getResponsiveValue,
      getResponsiveStyle,
      breakpoint,
      isMobile,
      isTablet,
      deviceInfo
    } = useResponsiveDesign()

    const [localSidebarCollapsed, setLocalSidebarCollapsed] = useState(sidebarCollapsed)
    const [isTransitioning, setIsTransitioning] = useState(false)

    // Handle sidebar collapse state
    const handleSidebarToggle = () => {
      setIsTransitioning(true)
      const newCollapsed = !localSidebarCollapsed
      setLocalSidebarCollapsed(newCollapsed)
      onSidebarToggle?.(newCollapsed)
      
      // Reset transition state after animation
      setTimeout(() => setIsTransitioning(false), 300)
    }

    // Auto-collapse sidebar on mobile if enabled
    useEffect(() => {
      if (collapseOnMobile && isMobile && !localSidebarCollapsed) {
        setLocalSidebarCollapsed(true)
      }
    }, [isMobile, collapseOnMobile, localSidebarCollapsed])

    // Determine layout type based on breakpoint and configuration
    const getLayoutType = () => {
      const configuredLayout = getResponsiveValue(layout)
      
      if (stackOnMobile && isMobile) return 'stacked'
      if (configuredLayout) return configuredLayout
      
      // Default responsive layout logic
      if (isMobile) return 'stacked'
      if (isTablet) return sidebar ? 'sidebar' : 'default'
      return sidebar ? 'sidebar' : 'default'
    }

    const layoutType = getLayoutType()

    // Generate responsive container styles
    const containerStyles = getResponsiveStyle({
      display: 'flex',
      flexDirection: layoutType === 'stacked' ? 'column' : 'row',
      minHeight: '100vh',
      position: 'relative',
    }, {
      mobile: {
        flexDirection: 'column',
        padding: getResponsiveValue(padding) || '16px',
        gap: getResponsiveValue(gap) || '16px',
      },
      tablet: {
        padding: getResponsiveValue(padding) || '24px',
        gap: getResponsiveValue(gap) || '24px',
      },
      desktop: {
        padding: getResponsiveValue(padding) || '32px',
        gap: getResponsiveValue(gap) || '32px',
      },
      wide: {
        padding: getResponsiveValue(padding) || '40px',
        gap: getResponsiveValue(gap) || '40px',
      },
      ultrawide: {
        padding: getResponsiveValue(padding) || '48px',
        gap: getResponsiveValue(gap) || '48px',
      }
    })

    // Generate header styles
    const headerStyles = getResponsiveStyle({
      height: getResponsiveValue(headerHeight),
      position: getResponsiveValue(headerSticky) ? 'sticky' : 'relative',
      top: 0,
      zIndex: 100,
    }, {
      mobile: {
        height: getResponsiveValue(headerHeight) || '56px',
      }
    })

    // Generate sidebar styles
    const sidebarStyles = getResponsiveStyle({
      width: localSidebarCollapsed ? '0px' : getResponsiveValue(sidebarWidth),
      minWidth: localSidebarCollapsed ? '0px' : getResponsiveValue(sidebarWidth),
      maxWidth: localSidebarCollapsed ? '0px' : getResponsiveValue(sidebarWidth),
      height: '100%',
      position: getResponsiveValue(sidebarPosition) === 'right' ? 'sticky' : 'relative',
      top: 0,
      right: getResponsiveValue(sidebarPosition) === 'right' ? 0 : 'auto',
      overflow: 'hidden',
      transition: 'width 300ms ease-in-out, min-width 300ms ease-in-out, max-width 300ms ease-in-out',
    }, {
      mobile: {
        display: hideSidebarOnMobile ? 'none' : 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 200,
        transform: localSidebarCollapsed ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 300ms ease-in-out',
      },
      tablet: {
        position: 'relative',
      }
    })

    // Generate content styles
    const contentStyles = getResponsiveStyle({
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }, {
      mobile: {
        maxWidth: '100%',
      },
      desktop: {
        maxWidth: getResponsiveValue(contentMaxWidth),
        margin: '0 auto',
      }
    })

    const layoutClasses = [
      'adaptive-layout',
      `adaptive-layout--${layoutType}`,
      `adaptive-layout--${breakpoint}`,
      isTransitioning && 'adaptive-layout--transitioning',
      localSidebarCollapsed && 'adaptive-layout--sidebar-collapsed',
      className
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={ref}
        className={layoutClasses}
        style={{ ...containerStyles, ...propStyle }}
        data-layout={layoutType}
        data-breakpoint={breakpoint}
      >
        {/* Header */}
        {header && (
          <AdaptiveLayoutSection
            section="header"
            style={headerStyles}
            className="adaptive-layout-header"
          >
            {header}
          </AdaptiveLayoutSection>
        )}

        {/* Main Content Area */}
        <div className="adaptive-layout-main" style={contentStyles}>
          {/* Sidebar */}
          {sidebar && layoutType === 'sidebar' && (
            <AdaptiveLayoutSection
              section="sidebar"
              style={sidebarStyles}
              className="adaptive-layout-sidebar"
            >
              {sidebar}
              {getResponsiveValue(sidebarCollapsible) && (
                <button
                  onClick={handleSidebarToggle}
                  className="adaptive-layout-sidebar-toggle"
                  aria-label={localSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {localSidebarCollapsed ? '→' : '←'}
                </button>
              )}
            </AdaptiveLayoutSection>
          )}

          {/* Content */}
          <AdaptiveLayoutSection
            section="content"
            className="adaptive-layout-content"
            style={{
              padding: getResponsiveValue(contentPadding),
            }}
          >
            {children}
          </AdaptiveLayoutSection>

          {/* Aside */}
          {aside && layoutType !== 'stacked' && (
            <AdaptiveLayoutSection
              section="aside"
              className="adaptive-layout-aside"
            >
              {aside}
            </AdaptiveLayoutSection>
          )}
        </div>

        {/* Footer */}
        {footer && (
          <AdaptiveLayoutSection
            section="footer"
            style={{
              height: getResponsiveValue(footerHeight),
              position: getResponsiveValue(footerSticky) ? 'sticky' : 'relative',
              bottom: 0,
            }}
            className="adaptive-layout-footer"
          >
            {footer}
          </AdaptiveLayoutSection>
        )}

        {/* Mobile Sidebar Overlay */}
        {sidebar && isMobile && !localSidebarCollapsed && (
          <div
            className="adaptive-layout-sidebar-overlay"
            onClick={handleSidebarToggle}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 150,
            }}
          />
        )}
      </div>
    )
  }
)

AdaptiveLayout.displayName = 'AdaptiveLayout'

export const AdaptiveLayoutSection = forwardRef<HTMLDivElement, AdaptiveLayoutSectionProps>(
  ({
    children,
    className = '',
    style: propStyle = {},
    section,
    order,
    flex,
    width,
    height,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    position,
    top,
    right,
    bottom,
    left,
    zIndex,
    display,
    overflow,
    hideOnMobile = false,
    hideOnTablet = false,
    hideOnDesktop = false,
    collapseOnMobile = false,
  }, ref) => {
    const {
      getResponsiveValue,
      getResponsiveStyle,
      breakpoint,
      isMobile,
      isTablet,
      isDesktop
    } = useResponsiveDesign()

    // Check if section should be hidden
    const shouldHide = 
      (hideOnMobile && isMobile) ||
      (hideOnTablet && isTablet) ||
      (hideOnDesktop && isDesktop)

    if (shouldHide) {
      return null
    }

    // Generate responsive section styles
    const sectionStyles = getResponsiveStyle({
      order: getResponsiveValue(order),
      flex: getResponsiveValue(flex),
      width: getResponsiveValue(width),
      height: getResponsiveValue(height),
      minWidth: getResponsiveValue(minWidth),
      maxWidth: getResponsiveValue(maxWidth),
      minHeight: getResponsiveValue(minHeight),
      maxHeight: getResponsiveValue(maxHeight),
      position: getResponsiveValue(position),
      top: getResponsiveValue(top),
      right: getResponsiveValue(right),
      bottom: getResponsiveValue(bottom),
      left: getResponsiveValue(left),
      zIndex: getResponsiveValue(zIndex),
      display: getResponsiveValue(display),
      overflow: getResponsiveValue(overflow),
    }, {
      mobile: collapseOnMobile && {
        display: 'none',
      },
    })

    const sectionClasses = [
      'adaptive-layout-section',
      section && `adaptive-layout-section--${section}`,
      `adaptive-layout-section--${breakpoint}`,
      shouldHide && 'adaptive-layout-section--hidden',
      className
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={ref}
        className={sectionClasses}
        style={{ ...sectionStyles, ...propStyle }}
        data-section={section}
        data-breakpoint={breakpoint}
      >
        {children}
      </div>
    )
  }
)

AdaptiveLayoutSection.displayName = 'AdaptiveLayoutSection'

// Specialized layout components for common patterns

export interface CenteredLayoutProps extends Omit<AdaptiveLayoutProps, 'layout' | 'children'> {
  children: ReactNode
  maxWidth?: ResponsiveValue<string | number>
  centerContent?: boolean
}

export const CenteredLayout = forwardRef<HTMLDivElement, CenteredLayoutProps>(
  ({ children, maxWidth = '1200px', centerContent = true, ...props }, ref) => {
    const { getResponsiveValue } = useResponsiveDesign()

    return (
      <AdaptiveLayout
        ref={ref}
        layout="centered"
        contentMaxWidth={maxWidth}
        {...props}
      >
        <div 
          className="centered-layout-content"
          style={{
            maxWidth: getResponsiveValue(maxWidth),
            margin: centerContent ? '0 auto' : undefined,
          }}
        >
          {children}
        </div>
      </AdaptiveLayout>
    )
  }
)

CenteredLayout.displayName = 'CenteredLayout'

export interface SidebarLayoutProps extends Omit<AdaptiveLayoutProps, 'layout' | 'sidebar'> {
  sidebar: ReactNode
  sidebarWidth?: ResponsiveValue<string | number>
  collapsible?: boolean
}

export const SidebarLayout = forwardRef<HTMLDivElement, SidebarLayoutProps>(
  ({ sidebar, sidebarWidth = '280px', collapsible = false, ...props }, ref) => {
    return (
      <AdaptiveLayout
        ref={ref}
        layout="sidebar"
        sidebar={sidebar}
        sidebarWidth={sidebarWidth}
        sidebarCollapsible={collapsible}
        {...props}
      />
    )
  }
)

SidebarLayout.displayName = 'SidebarLayout'

export interface StackedLayoutProps extends Omit<AdaptiveLayoutProps, 'layout' | 'children'> {
  children: ReactNode
  verticalGap?: ResponsiveValue<string | number>
}

export const StackedLayout = forwardRef<HTMLDivElement, StackedLayoutProps>(
  ({ children, verticalGap = '24px', ...props }, ref) => {
    return (
      <AdaptiveLayout
        ref={ref}
        layout="stacked"
        gap={verticalGap}
        {...props}
      >
        {children}
      </AdaptiveLayout>
    )
  }
)

StackedLayout.displayName = 'StackedLayout'

// Hook for layout-specific utilities
export interface UseAdaptiveLayoutOptions {
  layout?: ResponsiveValue<'default' | 'stacked' | 'sidebar' | 'centered' | 'wide'>
  sidebarWidth?: ResponsiveValue<string | number>
  headerHeight?: ResponsiveValue<string | number>
  footerHeight?: ResponsiveValue<string | number>
}

export const useAdaptiveLayout = (options: UseAdaptiveLayoutOptions = {}) => {
  const { getResponsiveValue, breakpoint, isMobile, isTablet } = useResponsiveDesign()

  const layout = getResponsiveValue(options.layout) || 'default'
  const sidebarWidth = getResponsiveValue(options.sidebarWidth) || '280px'
  const headerHeight = getResponsiveValue(options.headerHeight) || '64px'
  const footerHeight = getResponsiveValue(options.footerHeight) || '64px'

  return {
    layout,
    sidebarWidth,
    headerHeight,
    footerHeight,
    breakpoint,
    isMobile,
    isTablet,
    shouldStack: isMobile || layout === 'stacked',
    shouldShowSidebar: layout === 'sidebar' && !isMobile,
    containerStyles: {
      display: 'flex',
      flexDirection: layout === 'stacked' || isMobile ? 'column' : 'row',
      minHeight: '100vh',
    },
    headerStyles: {
      height: headerHeight,
      position: 'sticky' as const,
      top: 0,
      zIndex: 100,
    },
    sidebarStyles: {
      width: sidebarWidth,
      height: '100%',
      flexShrink: 0,
    },
    contentStyles: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    footerStyles: {
      height: footerHeight,
      position: 'sticky' as const,
      bottom: 0,
    }
  }
}
