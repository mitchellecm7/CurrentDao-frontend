import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { formatChartValue, getColorScale } from '@/utils/chartHelpers';
import { BaseChart } from './BaseChart';
import { PieChartProps, PieChartData, ChartTooltipProps } from '@/types/charts';

const CustomTooltip: React.FC<ChartTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const percentage = ((data.value / data.payload.total) * 100).toFixed(1);

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="text-sm font-medium text-gray-900 mb-1">
        {data.name}
      </p>
      <div className="flex items-center gap-2 text-sm">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="text-gray-600">Value:</span>
        <span className="font-medium text-gray-900">
          {formatChartValue(data.value)}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1">
        Percentage: <span className="font-medium text-gray-900">{percentage}%</span>
      </p>
    </div>
  );
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
  showLabels,
}: any) => {
  if (!showLabels) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label for very small slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  description,
  className = '',
  innerRadius = 0,
  outerRadius = '80%',
  startAngle = 0,
  endAngle = 360,
  paddingAngle = 0,
  showLabels = true,
  labelLine = true,
  showTooltip = true,
  showLegend = true,
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

  // Calculate total for percentage calculations
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Transform data with total
  const transformedData = data.map(item => ({
    ...item,
    total,
  }));

  const colors = getColorScale(
    [{ name: 'data', data: data.map((item, index) => ({ x: index, y: item.value })) }],
    theme
  );

  const handleChartClick = (data: any) => {
    if (onDataPointClick && data) {
      onDataPointClick(data);
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
        <RechartsPieChart>
          <Pie
            data={transformedData}
            cx="50%"
            cy="50%"
            labelLine={labelLine}
            label={(props) => renderCustomizedLabel({ ...props, showLabels })}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
            startAngle={startAngle}
            endAngle={endAngle}
            paddingAngle={paddingAngle}
            animationDuration={animation ? 1000 : 0}
            animationEasing="ease-in-out"
            onClick={handleChartClick}
            className="cursor-pointer"
          >
            {transformedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
                className="hover:opacity-80 transition-opacity"
              />
            ))}
          </Pie>
          
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-sm text-gray-700">
                  {value} ({formatChartValue(entry.payload.value)})
                </span>
              )}
              iconType="circle"
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default PieChart;
