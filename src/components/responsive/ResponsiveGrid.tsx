'use client'

import { forwardRef, ReactNode, CSSProperties } from 'react'
import { useResponsiveDesign, ResponsiveValue } from '@/hooks/useResponsiveDesign'

export interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  
  // Grid configuration
  columns?: ResponsiveValue<number>
  rows?: ResponsiveValue<number>
  gap?: ResponsiveValue<string | number>
  autoFlow?: ResponsiveValue<'row' | 'column' | 'row dense' | 'column dense'>
  
  // Item positioning
  area?: ResponsiveValue<string>
  column?: ResponsiveValue<string>
  row?: ResponsiveValue<string>
  
  // Container settings
  maxWidth?: ResponsiveValue<string | number>
  padding?: ResponsiveValue<string | number>
  margin?: ResponsiveValue<string | number>
  
  // Responsive behavior
  autoFit?: boolean
  minColumnWidth?: ResponsiveValue<string | number>
  maxColumnWidth?: ResponsiveValue<string | number>
  
  // Performance
  virtualized?: boolean
  itemHeight?: ResponsiveValue<string | number>
  overscan?: number
}

export interface ResponsiveGridItemProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  
  // Item positioning
  column?: ResponsiveValue<string>
  row?: ResponsiveValue<string>
  area?: ResponsiveValue<string>
  
  // Item sizing
  width?: ResponsiveValue<string | number>
  height?: ResponsiveValue<string | number>
  minWidth?: ResponsiveValue<string | number>
  maxWidth?: ResponsiveValue<string | number>
  minHeight?: ResponsiveValue<string | number>
  maxHeight?: ResponsiveValue<string | number>
  
  // Alignment
  justifySelf?: ResponsiveValue<'start' | 'end' | 'center' | 'stretch'>
  alignSelf?: ResponsiveValue<'start' | 'end' | 'center' | 'stretch'>
  placeSelf?: ResponsiveValue<'start' | 'end' | 'center' | 'stretch'>
  
  // Responsive behavior
  order?: ResponsiveValue<number>
}

export const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({
    children,
    className = '',
    style: propStyle = {},
    columns,
    rows,
    gap,
    autoFlow,
    area,
    column,
    row,
    maxWidth,
    padding,
    margin,
    autoFit = false,
    minColumnWidth,
    maxColumnWidth,
    virtualized = false,
    itemHeight,
    overscan = 5,
  }, ref) => {
    const {
      getResponsiveValue,
      getResponsiveStyle,
      getContainerStyles,
      breakpoint,
      deviceInfo
    } = useResponsiveDesign()

    // Generate responsive grid styles
    const gridStyles = getResponsiveStyle({}, {
      mobile: {
        display: 'grid',
        gridTemplateColumns: autoFit 
          ? `repeat(auto-fit, minmax(${getResponsiveValue(minColumnWidth) || '280px'}, 1fr))`
          : `repeat(${getResponsiveValue(columns) || 1}, 1fr)`,
        gridTemplateRows: rows && `repeat(${getResponsiveValue(rows)}, 1fr)`,
        gap: getResponsiveValue(gap) || '16px',
        gridAutoFlow: getResponsiveValue(autoFlow),
        gridArea: getResponsiveValue(area),
        gridColumn: getResponsiveValue(column),
        gridRow: getResponsiveValue(row),
      },
      tablet: {
        gridTemplateColumns: autoFit 
          ? `repeat(auto-fit, minmax(${getResponsiveValue(minColumnWidth) || '320px'}, 1fr))`
          : `repeat(${getResponsiveValue(columns) || 2}, 1fr)`,
        gap: getResponsiveValue(gap) || '24px',
      },
      desktop: {
        gridTemplateColumns: autoFit 
          ? `repeat(auto-fit, minmax(${getResponsiveValue(minColumnWidth) || '250px'}, 1fr))`
          : `repeat(${getResponsiveValue(columns) || 3}, 1fr)`,
        gap: getResponsiveValue(gap) || '24px',
      },
      wide: {
        gridTemplateColumns: autoFit 
          ? `repeat(auto-fit, minmax(${getResponsiveValue(minColumnWidth) || '280px'}, 1fr))`
          : `repeat(${getResponsiveValue(columns) || 4}, 1fr)`,
        gap: getResponsiveValue(gap) || '32px',
      },
      ultrawide: {
        gridTemplateColumns: autoFit 
          ? `repeat(auto-fit, minmax(${getResponsiveValue(minColumnWidth) || '300px'}, 1fr))`
          : `repeat(${getResponsiveValue(columns) || 6}, 1fr)`,
        gap: getResponsiveValue(gap) || '32px',
      }
    })

    // Generate container styles
    const containerStyles = getResponsiveStyle({}, {
      mobile: {
        maxWidth: getResponsiveValue(maxWidth),
        padding: getResponsiveValue(padding) || '16px',
        margin: getResponsiveValue(margin),
      },
      tablet: {
        padding: getResponsiveValue(padding) || '24px',
      },
      desktop: {
        padding: getResponsiveValue(padding) || '32px',
      },
      wide: {
        padding: getResponsiveValue(padding) || '40px',
      },
      ultrawide: {
        padding: getResponsiveValue(padding) || '48px',
      }
    })

    // Combine all styles
    const combinedStyles = {
      ...containerStyles,
      ...gridStyles,
      ...propStyle,
    }

    // Performance optimizations
    const shouldVirtualize = virtualized && deviceInfo.isTouch

    const gridClasses = [
      'responsive-grid',
      `responsive-grid--${breakpoint}`,
      autoFit && 'responsive-grid--auto-fit',
      shouldVirtualize && 'responsive-grid--virtualized',
      className
    ].filter(Boolean).join(' ')

    if (shouldVirtualize) {
      return (
        <div
          ref={ref}
          className={gridClasses}
          style={combinedStyles}
          data-overscan={overscan}
          data-item-height={getResponsiveValue(itemHeight)}
        >
          {children}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={gridClasses}
        style={combinedStyles}
      >
        {children}
      </div>
    )
  }
)

ResponsiveGrid.displayName = 'ResponsiveGrid'

export const ResponsiveGridItem = forwardRef<HTMLDivElement, ResponsiveGridItemProps>(
  ({
    children,
    className = '',
    style: propStyle = {},
    column,
    row,
    area,
    width,
    height,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    justifySelf,
    alignSelf,
    placeSelf,
    order,
  }, ref) => {
    const {
      getResponsiveValue,
      getResponsiveStyle,
      breakpoint
    } = useResponsiveDesign()

    // Generate responsive item styles
    const itemStyles = getResponsiveStyle({}, {
      mobile: {
        gridColumn: getResponsiveValue(column),
        gridRow: getResponsiveValue(row),
        gridArea: getResponsiveValue(area),
        width: getResponsiveValue(width),
        height: getResponsiveValue(height),
        minWidth: getResponsiveValue(minWidth),
        maxWidth: getResponsiveValue(maxWidth),
        minHeight: getResponsiveValue(minHeight),
        maxHeight: getResponsiveValue(maxHeight),
        justifySelf: getResponsiveValue(justifySelf),
        alignSelf: getResponsiveValue(alignSelf),
        placeSelf: getResponsiveValue(placeSelf),
        order: getResponsiveValue(order),
      },
      tablet: {
        // Tablet-specific overrides can be added here
      },
      desktop: {
        // Desktop-specific overrides can be added here
      },
      wide: {
        // Wide-specific overrides can be added here
      },
      ultrawide: {
        // Ultrawide-specific overrides can be added here
      }
    })

    // Combine all styles
    const combinedStyles = {
      ...itemStyles,
      ...propStyle,
    }

    const itemClasses = [
      'responsive-grid-item',
      `responsive-grid-item--${breakpoint}`,
      className
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={ref}
        className={itemClasses}
        style={combinedStyles}
      >
        {children}
      </div>
    )
  }
)

ResponsiveGridItem.displayName = 'ResponsiveGridItem'

// Specialized grid components for common patterns

export interface MasonryGridProps extends Omit<ResponsiveGridProps, 'columns' | 'rows'> {
  columnCount?: ResponsiveValue<number>
  columnWidth?: ResponsiveValue<string | number>
  gutter?: ResponsiveValue<string | number>
}

export const MasonryGrid = forwardRef<HTMLDivElement, MasonryGridProps>(
  ({
    children,
    columnCount,
    columnWidth = '300px',
    gutter = '16px',
    ...props
  }, ref) => {
    const { getResponsiveValue, breakpoint } = useResponsiveDesign()

    const columns = getResponsiveValue(columnCount) || 
      (breakpoint === 'mobile' ? 1 : 
       breakpoint === 'tablet' ? 2 : 
       breakpoint === 'desktop' ? 3 : 4)

    return (
      <ResponsiveGrid
        ref={ref}
        columns={columns}
        gap={gutter}
        autoFit={true}
        minColumnWidth={columnWidth}
        className="masonry-grid"
        {...props}
      >
        {children}
      </ResponsiveGrid>
    )
  }
)

MasonryGrid.displayName = 'MasonryGrid'

export interface CardGridProps extends Omit<ResponsiveGridProps, 'columns' | 'gap'> {
  minCardWidth?: ResponsiveValue<string | number>
  maxCardWidth?: ResponsiveValue<string | number>
  cardHeight?: ResponsiveValue<string | number>
}

export const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(
  ({
    children,
    minCardWidth = '280px',
    maxCardWidth = '400px',
    cardHeight = 'auto',
    ...props
  }, ref) => {
    return (
      <ResponsiveGrid
        ref={ref}
        autoFit={true}
        minColumnWidth={minCardWidth}
        maxColumnWidth={maxCardWidth}
        className="card-grid"
        {...props}
      >
        {children}
      </ResponsiveGrid>
    )
  }
)

CardGrid.displayName = 'CardGrid'

export interface ImageGridProps extends Omit<ResponsiveGridProps, 'columns' | 'gap'> {
  minImageWidth?: ResponsiveValue<string | number>
  aspectRatio?: ResponsiveValue<string>
}

export const ImageGrid = forwardRef<HTMLDivElement, ImageGridProps>(
  ({
    children,
    minImageWidth = '200px',
    aspectRatio = '1/1',
    ...props
  }, ref) => {
    const { getResponsiveValue } = useResponsiveDesign()

    return (
      <ResponsiveGrid
        ref={ref}
        autoFit={true}
        minColumnWidth={minImageWidth}
        gap="4px"
        className="image-grid"
        style={{
          aspectRatio: getResponsiveValue(aspectRatio),
        }}
        {...props}
      >
        {children}
      </ResponsiveGrid>
    )
  }
)

ImageGrid.displayName = 'ImageGrid'

// Utility components for grid debugging
export interface GridDebugOverlayProps {
  showColumns?: boolean
  showGutters?: boolean
  showBreakpoints?: boolean
}

export const GridDebugOverlay = ({ 
  showColumns = true, 
  showGutters = true, 
  showBreakpoints = true 
}: GridDebugOverlayProps) => {
  const { breakpoint, width, getGridColumns } = useResponsiveDesign()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="grid-debug-overlay fixed top-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-xs font-mono">
      {showBreakpoints && (
        <div>
          <div>Breakpoint: {breakpoint}</div>
          <div>Width: {width}px</div>
          <div>Columns: {getGridColumns()}</div>
        </div>
      )}
      {showColumns && (
        <div className="mt-2">
          <div>Grid Columns: Active</div>
        </div>
      )}
      {showGutters && (
        <div className="mt-2">
          <div>Gutters: Active</div>
        </div>
      )}
    </div>
  )
}

// Hook for grid-specific utilities
export interface UseGridOptions {
  columns?: ResponsiveValue<number>
  gap?: ResponsiveValue<string | number>
  autoFit?: boolean
  minColumnWidth?: ResponsiveValue<string | number>
}

export const useGrid = (options: UseGridOptions = {}) => {
  const { getResponsiveValue, breakpoint, getGridStyles } = useResponsiveDesign()

  const gridStyles = getGridStyles()
  const columns = getResponsiveValue(options.columns) || getGridColumns()
  const gap = getResponsiveValue(options.gap) || gridStyles.gap
  const autoFit = options.autoFit || false
  const minColumnWidth = getResponsiveValue(options.minColumnWidth)

  return {
    columns,
    gap,
    autoFit,
    minColumnWidth,
    breakpoint,
    gridStyles,
    itemStyle: {
      display: 'flex',
      flexDirection: 'column',
    }
  }
}
