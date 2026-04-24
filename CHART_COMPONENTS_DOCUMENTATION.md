# Chart Components Documentation

A comprehensive, reusable data visualization component library built with React, TypeScript, and Recharts for the CurrentDao energy trading platform.

## Features

- **Multiple Chart Types**: Line, Bar, Pie, and Area charts
- **Interactive Features**: Zoom, pan, tooltips, and click handlers
- **Responsive Design**: Adapts to different screen sizes automatically
- **Accessibility**: Full screen reader support with ARIA labels
- **Export Functionality**: Export charts as PNG or SVG
- **Animation**: Smooth transitions and animations
- **Customizable Themes**: Built-in themes for energy trading data
- **Performance Optimized**: Handles large datasets efficiently

## Installation

The chart components are part of the CurrentDao frontend project. All required dependencies are already installed:

```bash
npm install recharts html2canvas date-fns framer-motion
```

## Quick Start

```tsx
import { LineChart } from '@/components/charts';
import { ChartData } from '@/types/charts';

const data: ChartData[] = [
  {
    name: 'Energy Price',
    data: [
      { x: 'Jan', y: 100 },
      { x: 'Feb', y: 120 },
      { x: 'Mar', y: 110 },
    ],
  },
];

export default function MyChart() {
  return (
    <LineChart
      data={data}
      title="Energy Trading Prices"
      description="Monthly energy price trends"
      showTooltip={true}
      showLegend={true}
      animation={true}
    />
  );
}
```

## Chart Types

### LineChart

Perfect for showing trends over time, energy prices, and market data.

```tsx
<LineChart
  data={data}
  title="Energy Price Trends"
  strokeWidth={2}
  curveType="monotone"
  showArea={false}
  gradient={true}
  dot={true}
/>
```

**Props:**
- `data`: ChartData[] - The data to display
- `strokeWidth`: number - Line thickness (default: 2)
- `curveType`: string - Curve type ('linear', 'basis', 'monotone', etc.)
- `showArea`: boolean - Show area under the line
- `gradient`: boolean - Use gradient fill
- `dot`: boolean - Show data points

### BarChart

Ideal for comparing values across categories, energy consumption by source, or trading volumes.

```tsx
<BarChart
  data={data}
  title="Energy Consumption by Source"
  layout="vertical"
  barSize={40}
  radius={4}
  stackId="stack1"
/>
```

**Props:**
- `data`: ChartData[] - The data to display
- `layout`: 'vertical' | 'horizontal' - Bar orientation
- `barSize`: number - Width/thickness of bars
- `radius`: number | [number, number, number, number] - Border radius
- `stackId`: string - Stack bars with same ID

### PieChart

Great for showing proportions, market share, or energy source distribution.

```tsx
<PieChart
  data={pieData}
  title="Energy Source Distribution"
  innerRadius={60}
  outerRadius={100}
  showLabels={true}
  paddingAngle={2}
/>
```

**Props:**
- `data`: PieChartData[] - The data to display
- `innerRadius`: number - Inner radius for donut charts
- `outerRadius`: number - Outer radius
- `showLabels`: boolean - Show percentage labels
- `paddingAngle`: number - Space between slices

### AreaChart

Perfect for showing cumulative values, total energy production, or stacked metrics.

```tsx
<AreaChart
  data={data}
  title="Cumulative Energy Production"
  gradient={true}
  stackId="stack1"
  strokeWidth={2}
/>
```

**Props:**
- `data`: ChartData[] - The data to display
- `gradient`: boolean - Use gradient fill
- `stackId`: string - Stack areas with same ID
- `strokeWidth`: number - Line thickness

## Common Props

All chart components inherit these common props from `ChartConfig`:

```tsx
interface ChartConfig {
  width?: number;
  height?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  theme?: ChartTheme;
  animation?: boolean;
  responsive?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  zoomEnabled?: boolean;
  panEnabled?: boolean;
  exportEnabled?: boolean;
}
```

## Data Formats

### ChartData (for Line, Bar, Area charts)

```tsx
interface ChartData {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  color?: string;
}
```

### PieChartData

```tsx
interface PieChartData {
  name: string;
  value: number;
  color?: string;
}
```

## Energy Trading Data Helpers

The library includes specialized helpers for energy trading data:

```tsx
import {
  processEnergyTradingData,
  processMarketTrendData,
  processUserAnalyticsData,
  energyTradingTheme
} from '@/components/charts';

// Process raw energy trading data
const chartData = processEnergyTradingData(rawEnergyData);

// Use energy trading theme
<LineChart
  data={chartData}
  theme={energyTradingTheme}
  title="Energy Trading Dashboard"
/>
```

## Custom Themes

Create custom themes for your charts:

```tsx
const customTheme: ChartTheme = {
  backgroundColor: '#ffffff',
  gridColor: '#e5e7eb',
  textColor: '#374151',
  colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
};

<LineChart data={data} theme={customTheme} />
```

## Interactivity

### Data Point Clicks

```tsx
const handleDataPointClick = (data: any) => {
  console.log('Clicked data:', data);
  // Navigate to detail view, show modal, etc.
};

<LineChart
  data={data}
  onDataPointClick={handleDataPointClick}
/>
```

### Export Functionality

```tsx
<LineChart
  data={data}
  exportEnabled={true}
  showControls={true}
/>
```

Users can export charts as PNG or SVG using the built-in controls.

## Accessibility

All chart components include comprehensive accessibility features:

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Announcements**: Dynamic announcements for interactions
- **High Contrast**: Compatible with high contrast modes
- **Focus Management**: Proper focus handling

```tsx
<LineChart
  data={data}
  title="Energy Trading Prices"
  description="Monthly energy price trends for solar and wind"
  ariaLabel="Energy trading price chart"
/>
```

## Responsive Design

Charts automatically adapt to different screen sizes:

- **Mobile**: Optimized layout and font sizes
- **Tablet**: Balanced layout for medium screens
- **Desktop**: Full-featured layout for large screens

```tsx
<LineChart
  data={data}
  responsive={true}
  // Automatically adjusts based on container size
/>
```

## Performance Optimization

- **Virtual Scrolling**: Handles large datasets efficiently
- **Debounced Updates**: Optimized resize and interaction handling
- **Lazy Loading**: Components load only when needed
- **Memoization**: Prevents unnecessary re-renders

## Advanced Usage

### Custom Hooks

```tsx
import { useChart, useChartData } from '@/components/charts';

function CustomChart() {
  const {
    chartRef,
    dimensions,
    interactionState,
    handlers,
  } = useChart({
    responsive: true,
    zoomEnabled: true,
    exportEnabled: true,
  });

  const { data, loading, error, fetchData } = useChartData();

  // Custom implementation
}
```

### Custom Tooltips

```tsx
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  
  return (
    <div className="custom-tooltip">
      {/* Custom tooltip content */}
    </div>
  );
};

<LineChart
  data={data}
  tooltip={<CustomTooltip />}
/>
```

## Testing

The chart library includes comprehensive unit tests:

```bash
npm test -- charts.test.tsx
```

Tests cover:
- Component rendering
- Data handling
- User interactions
- Accessibility features
- Export functionality
- Responsive behavior

## Best Practices

1. **Data Validation**: Always validate chart data before rendering
2. **Error Handling**: Provide fallback UI for error states
3. **Loading States**: Show loading indicators during data fetch
4. **Performance**: Use pagination or virtualization for large datasets
5. **Accessibility**: Always provide meaningful descriptions and labels

## Troubleshooting

### Common Issues

1. **Chart Not Rendering**: Check data format and ensure Recharts is properly imported
2. **Export Not Working**: Verify html2canvas is installed and properly imported
3. **Responsive Issues**: Ensure container has proper dimensions
4. **Performance Issues**: Use data pagination or virtualization for large datasets

### Debug Mode

Enable debug mode to see detailed logging:

```tsx
<LineChart
  data={data}
  debug={true}
/>
```

## Contributing

When adding new chart features:

1. Follow the existing component patterns
2. Add comprehensive TypeScript types
3. Include accessibility features
4. Write unit tests
5. Update documentation

## License

This chart component library is part of the CurrentDao project and follows the same MIT license.
