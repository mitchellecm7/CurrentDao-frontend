import React from 'react';
import { LineChart, BarChart, PieChart, AreaChart } from '@/components/charts';
import { ChartData, PieChartData } from '@/types/charts';

// Sample data for demonstration
const energyTradingData: ChartData[] = [
  {
    name: 'Solar Energy',
    data: [
      { x: 'Jan', y: 120 },
      { x: 'Feb', y: 150 },
      { x: 'Mar', y: 180 },
      { x: 'Apr', y: 200 },
      { x: 'May', y: 220 },
      { x: 'Jun', y: 250 },
    ],
    color: '#f59e0b',
  },
  {
    name: 'Wind Energy',
    data: [
      { x: 'Jan', y: 80 },
      { x: 'Feb', y: 90 },
      { x: 'Mar', y: 110 },
      { x: 'Apr', y: 140 },
      { x: 'May', y: 160 },
      { x: 'Jun', y: 180 },
    ],
    color: '#3b82f6',
  },
];

const priceData: ChartData[] = [
  {
    name: 'Energy Price ($/MWh)',
    data: [
      { x: '00:00', y: 45 },
      { x: '04:00', y: 38 },
      { x: '08:00', y: 65 },
      { x: '12:00', y: 85 },
      { x: '16:00', y: 75 },
      { x: '20:00', y: 55 },
      { x: '23:59', y: 42 },
    ],
    color: '#10b981',
  },
];

const marketShareData: PieChartData[] = [
  { name: 'Solar', value: 35, color: '#f59e0b' },
  { name: 'Wind', value: 28, color: '#3b82f6' },
  { name: 'Hydro', value: 20, color: '#06b6d4' },
  { name: 'Natural Gas', value: 12, color: '#8b5cf6' },
  { name: 'Other', value: 5, color: '#6b7280' },
];

const consumptionData: ChartData[] = [
  {
    name: 'Residential',
    data: [
      { x: 'Mon', y: 120 },
      { x: 'Tue', y: 135 },
      { x: 'Wed', y: 125 },
      { x: 'Thu', y: 140 },
      { x: 'Fri', y: 155 },
      { x: 'Sat', y: 110 },
      { x: 'Sun', y: 95 },
    ],
    color: '#ef4444',
  },
  {
    name: 'Commercial',
    data: [
      { x: 'Mon', y: 200 },
      { x: 'Tue', y: 210 },
      { x: 'Wed', y: 205 },
      { x: 'Thu', y: 220 },
      { x: 'Fri', y: 230 },
      { x: 'Sat', y: 150 },
      { x: 'Sun', y: 130 },
    ],
    color: '#10b981',
  },
  {
    name: 'Industrial',
    data: [
      { x: 'Mon', y: 350 },
      { x: 'Tue', y: 360 },
      { x: 'Wed', y: 355 },
      { x: 'Thu', y: 370 },
      { x: 'Fri', y: 380 },
      { x: 'Sat', y: 280 },
      { x: 'Sun', y: 250 },
    ],
    color: '#3b82f6',
  },
];

export const ChartExamples: React.FC = () => {
  const handleDataPointClick = (data: any) => {
    console.log('Data point clicked:', data);
    // Handle navigation to detail view, show modal, etc.
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Energy Trading Dashboard Examples
        </h1>

        {/* Line Chart Example */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Energy Production Trends
          </h2>
          <LineChart
            data={energyTradingData}
            title="Monthly Energy Production"
            description="Solar and wind energy production over time"
            strokeWidth={2}
            curveType="monotone"
            showArea={false}
            gradient={true}
            dot={true}
            onDataPointClick={handleDataPointClick}
            showTooltip={true}
            showLegend={true}
            animation={true}
            exportEnabled={true}
          />
        </div>

        {/* Bar Chart Example */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Daily Energy Consumption
          </h2>
          <BarChart
            data={consumptionData}
            title="Weekly Energy Consumption by Sector"
            description="Residential, commercial, and industrial consumption"
            layout="vertical"
            barSize={30}
            radius={4}
            showTooltip={true}
            showLegend={true}
            animation={true}
            exportEnabled={true}
          />
        </div>

        {/* Pie Chart Example */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Energy Market Share
          </h2>
          <PieChart
            data={marketShareData}
            title="Energy Source Distribution"
            description="Percentage breakdown of energy sources"
            innerRadius={60}
            outerRadius={120}
            showLabels={true}
            paddingAngle={2}
            showTooltip={true}
            showLegend={true}
            animation={true}
            exportEnabled={true}
          />
        </div>

        {/* Area Chart Example */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Energy Price Trends
          </h2>
          <AreaChart
            data={priceData}
            title="Hourly Energy Prices"
            description="Energy price variations throughout the day"
            gradient={true}
            strokeWidth={2}
            curveType="monotone"
            showTooltip={true}
            showLegend={true}
            animation={true}
            exportEnabled={true}
          />
        </div>

        {/* Stacked Area Chart Example */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Total Energy Consumption
          </h2>
          <AreaChart
            data={consumptionData}
            title="Stacked Energy Consumption"
            description="Combined energy consumption by sector"
            gradient={true}
            stackId="consumption"
            strokeWidth={1}
            curveType="monotone"
            showTooltip={true}
            showLegend={true}
            animation={true}
            exportEnabled={true}
          />
        </div>

        {/* Custom themed chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Custom Themed Chart
          </h2>
          <LineChart
            data={energyTradingData}
            title="Custom Styled Chart"
            description="Chart with custom theme and styling"
            strokeWidth={3}
            curveType="basis"
            showArea={true}
            gradient={true}
            dot={{ r: 6, fill: '#ffffff' }}
            onDataPointClick={handleDataPointClick}
            showTooltip={true}
            showLegend={true}
            animation={true}
            exportEnabled={true}
            className="border-2 border-blue-200 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default ChartExamples;
