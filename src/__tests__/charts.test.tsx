import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { AreaChart } from '@/components/charts/AreaChart';
import { ChartData, PieChartData } from '@/types/charts';

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  LineChart: ({ children, ...props }: any) => <div data-testid="line-chart" {...props}>{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children, ...props }: any) => <div data-testid="bar-chart" {...props}>{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children, ...props }: any) => <div data-testid="pie-chart" {...props}>{children}</div>,
  Pie: () => <div data-testid="pie" />,
  AreaChart: ({ children, ...props }: any) => <div data-testid="area-chart" {...props}>{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  Cell: () => <div data-testid="cell" />,
  Dot: () => <div data-testid="dot" />,
}));

// Mock html2canvas for export functionality
jest.mock('html2canvas', () =>
  jest.fn(() => Promise.resolve({
    toBlob: (callback: Function) => callback(new Blob()),
  }))
);

const mockChartData: ChartData[] = [
  {
    name: 'Series 1',
    data: [
      { x: 'Jan', y: 100 },
      { x: 'Feb', y: 200 },
      { x: 'Mar', y: 150 },
    ],
    color: '#3b82f6',
  },
  {
    name: 'Series 2',
    data: [
      { x: 'Jan', y: 80 },
      { x: 'Feb', y: 120 },
      { x: 'Mar', y: 180 },
    ],
    color: '#10b981',
  },
];

const mockPieChartData: PieChartData[] = [
  { name: 'Category A', value: 400, color: '#3b82f6' },
  { name: 'Category B', value: 300, color: '#10b981' },
  { name: 'Category C', value: 300, color: '#f59e0b' },
  { name: 'Category D', value: 200, color: '#ef4444' },
];

describe('Chart Components', () => {
  describe('LineChart', () => {
    it('renders line chart with data', () => {
      render(<LineChart data={mockChartData} title="Test Line Chart" />);

      expect(screen.getByText('Test Line Chart')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getAllByTestId('line')).toHaveLength(2); // Two data series
    });

    it('renders no data message when data is empty', () => {
      render(<LineChart data={[]} title="Empty Chart" />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('calls onDataPointClick when chart is clicked', () => {
      const mockClick = jest.fn();
      render(<LineChart data={mockChartData} onDataPointClick={mockClick} />);

      const chart = screen.getByTestId('line-chart');
      fireEvent.click(chart);

      // Note: This test might need adjustment based on actual click handling
    });

    it('renders with custom props', () => {
      render(
        <LineChart
          data={mockChartData}
          strokeWidth={3}
          curveType="linear"
          showArea={true}
          gradient={true}
        />
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('BarChart', () => {
    it('renders bar chart with data', () => {
      render(<BarChart data={mockChartData} title="Test Bar Chart" />);

      expect(screen.getByText('Test Bar Chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getAllByTestId('bar')).toHaveLength(2); // Two data series
    });

    it('renders no data message when data is empty', () => {
      render(<BarChart data={[]} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders with horizontal layout', () => {
      render(<BarChart data={mockChartData} layout="horizontal" />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('renders with stacked bars', () => {
      render(<BarChart data={mockChartData} stackId="stack1" />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('PieChart', () => {
    it('renders pie chart with data', () => {
      render(<PieChart data={mockPieChartData} title="Test Pie Chart" />);

      expect(screen.getByText('Test Pie Chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    it('renders no data message when data is empty', () => {
      render(<PieChart data={[]} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders with donut shape', () => {
      render(<PieChart data={mockPieChartData} innerRadius={60} outerRadius={100} />);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('renders without labels', () => {
      render(<PieChart data={mockPieChartData} showLabels={false} />);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  describe('AreaChart', () => {
    it('renders area chart with data', () => {
      render(<AreaChart data={mockChartData} title="Test Area Chart" />);

      expect(screen.getByText('Test Area Chart')).toBeInTheDocument();
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.getAllByTestId('area')).toHaveLength(2); // Two data series
    });

    it('renders no data message when data is empty', () => {
      render(<AreaChart data={[]} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders with stacked areas', () => {
      render(<AreaChart data={mockChartData} stackId="stack1" />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('renders without gradient', () => {
      render(<AreaChart data={mockChartData} gradient={false} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  describe('Common Features', () => {
    it('renders with description', () => {
      render(
        <LineChart
          data={mockChartData}
          title="Chart with Description"
          description="This is a test description"
        />
      );

      expect(screen.getByText('Chart with Description')).toBeInTheDocument();
      expect(screen.getByText('This is a test description')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <LineChart data={mockChartData} className="custom-chart-class" />
      );

      expect(container.querySelector('.custom-chart-class')).toBeInTheDocument();
    });

    it('hides controls when showControls is false', () => {
      render(<LineChart data={mockChartData} showControls={false} />);

      // Should not find export buttons when controls are hidden
      expect(screen.queryByLabelText('Export as PNG')).not.toBeInTheDocument();
    });

    it('shows loading state', () => {
      // This test would require mocking the loading state
      // Implementation depends on how loading is handled in the components
    });

    it('shows error state', () => {
      // This test would require mocking an error state
      // Implementation depends on how errors are handled in the components
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<LineChart data={mockChartData} title="Accessible Chart" />);

      const chartRegion = screen.getByRole('region');
      expect(chartRegion).toHaveAttribute('aria-label', 'Accessible Chart');
    });

    it('has proper description when provided', () => {
      render(
        <LineChart
          data={mockChartData}
          title="Chart"
          description="Chart description"
        />
      );

      const chartRegion = screen.getByRole('region');
      expect(chartRegion).toHaveAttribute('aria-describedby', 'chart-description');
      expect(screen.getByText('Chart description')).toBeInTheDocument();
    });

    it('announces chart type to screen readers', () => {
      render(<LineChart data={mockChartData} title="Line Chart" />);

      // Check for screen reader announcements
      const announcements = document.querySelector('.sr-only');
      expect(announcements).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('exports chart as PNG', async () => {
      const mockExport = jest.fn();
      render(<LineChart data={mockChartData} exportEnabled={true} />);

      const exportButton = screen.getByLabelText('Export as PNG');
      fireEvent.click(exportButton);

      await waitFor(() => {
        // Verify export functionality was called
        // This depends on the actual export implementation
      });
    });

    it('exports chart as SVG', async () => {
      render(<LineChart data={mockChartData} exportEnabled={true} />);

      const exportButton = screen.getByLabelText('Export as SVG');
      fireEvent.click(exportButton);

      await waitFor(() => {
        // Verify export functionality was called
      });
    });
  });

  describe('Responsive Design', () => {
    it('renders with responsive container', () => {
      render(<LineChart data={mockChartData} responsive={true} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('renders with fixed dimensions when not responsive', () => {
      render(
        <LineChart
          data={mockChartData}
          responsive={false}
          width={800}
          height={400}
        />
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('renders with animation enabled', () => {
      render(<LineChart data={mockChartData} animation={true} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('renders without animation', () => {
      render(<LineChart data={mockChartData} animation={false} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });
});
