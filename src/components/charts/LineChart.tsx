import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Dot,
  Area,
} from 'recharts';
import { formatChartDate, formatChartValue, getColorScale } from '@/utils/chartHelpers';
import { BaseChart } from './BaseChart';
import { LineChartProps, ChartTooltipProps } from '@/types/charts';

const CustomTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="text-sm font-medium text-gray-900 mb-2">
        {typeof label === 'string' ? label : formatChartDate(label)}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
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

const CustomDot = (props: any) => {
  const { cx, cy, fill, payload } = props;
  
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={4}
      fill={fill}
      className="cursor-pointer hover:r-6 transition-all"
      style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }}
    />
  );
};

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  description,
  className = '',
  strokeWidth = 2,
  dot = true,
  curveType = 'monotone',
  showArea = false,
  gradient = false,
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
        <RechartsLineChart
          data={transformedData}
          onClick={handleChartClick}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              className="opacity-50"
            />
          )}
          
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
          
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          )}

          {gradient && (
            <defs>
              {data.map((series, index) => (
                <linearGradient
                  key={`gradient-${index}`}
                  id={`gradient-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={colors[index]}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors[index]}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
          )}

          {data.map((series, index) => {
            const color = colors[index];
            const gradientId = gradient ? `url(#gradient-${index})` : color;

            return (
              <React.Fragment key={series.name}>
                {showArea && (
                  <Area
                    type={curveType}
                    dataKey={series.name}
                    stroke="none"
                    fill={gradientId}
                    fillOpacity={0.3}
                    animationDuration={animation ? 1000 : 0}
                  />
                )}
                
                <Line
                  type={curveType}
                  dataKey={series.name}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  dot={dot ? <CustomDot /> : false}
                  activeDot={{
                    r: 6,
                    fill: color,
                    style: { filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' },
                  }}
                  animationDuration={animation ? 1000 : 0}
                  animationEasing="ease-in-out"
                />
              </React.Fragment>
            );
          })}
        </RechartsLineChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default LineChart;
