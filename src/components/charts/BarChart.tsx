import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatChartValue, getColorScale } from '@/utils/chartHelpers';
import { BaseChart } from './BaseChart';
import { BarChartProps, ChartTooltipProps } from '@/types/charts';

const CustomTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="text-sm font-medium text-gray-900 mb-2">
        {label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-gray-900">
            {formatChartValue(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  description,
  className = '',
  barSize,
  radius = 4,
  layout = 'vertical',
  stackId,
  showTooltip = true,
  showLegend = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  theme,
  animation = true,
  responsive = true,
  onDataPointClick,
  ...restConfig
}) => {
  if (!data || data.length === 0) {
    return (
      <BaseChart
        title={title}
        description={description}
        className={className}
        {...restConfig}
      >
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      </BaseChart>
    );
  }

  // Transform data for Recharts
  const transformedData = data[0].data.map((point, index) => {
    const dataPoint: any = {
      x: point.x,
      label: point.label || point.x,
    };

    data.forEach((series) => {
      dataPoint[series.name] = series.data[index]?.y || 0;
    });

    return dataPoint;
  });

  const colors = getColorScale(data, theme);

  const handleChartClick = (data: any) => {
    if (onDataPointClick && data && data.activePayload) {
      onDataPointClick(data.activePayload[0].payload);
    }
  };

  const getBarProps = (index: number) => {
    const color = colors[index % colors.length];
    
    if (typeof radius === 'number') {
      return {
        fill: color,
        radius: [radius, radius, 0, 0],
      };
    } else {
      return {
        fill: color,
        radius,
      };
    }
  };

  return (
    <BaseChart
      title={title}
      description={description}
      className={className}
      onDataPointClick={onDataPointClick}
      animation={animation}
      responsive={responsive}
      {...restConfig}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={transformedData}
          onClick={handleChartClick}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              className="opacity-50"
            />
          )}
          
          {layout === 'vertical' ? (
            <>
              {showXAxis && (
                <XAxis
                  type="number"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => formatChartValue(value)}
                />
              )}
              
              {showYAxis && (
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  width={100}
                />
              )}
            </>
          ) : (
            <>
              {showXAxis && (
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
              )}
              
              {showYAxis && (
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => formatChartValue(value)}
                />
              )}
            </>
          )}
          
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          )}

          {data.map((series, index) => (
            <Bar
              key={series.name}
              dataKey={series.name}
              barSize={barSize}
              stackId={stackId}
              animationDuration={animation ? 1000 : 0}
              animationEasing="ease-in-out"
              {...getBarProps(index)}
            >
              {transformedData.map((entry: any, entryIndex: number) => (
                <Cell
                  key={`cell-${entryIndex}`}
                  fill={colors[index % colors.length]}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default BarChart;
