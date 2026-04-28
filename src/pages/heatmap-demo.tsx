import React from 'react';
import EnergyHeatmapSimple from '../components/charts/EnergyHeatmapSimple';
import { generateMockHeatmapData, HeatmapData } from '../utils/heatmapHelpersSimple';

const HeatmapDemo: React.FC = () => {
  // Generate mock data for different view types
  const personalData = generateMockHeatmapData(new Date(), 'personal');
  const communityData = generateMockHeatmapData(new Date(), 'community');
  const gridData = generateMockHeatmapData(new Date(), 'grid');

  const handleCellClick = (data: any) => {
    console.log('Cell clicked:', data);
    alert(`Selected: ${data.day} at ${data.hour}:00 - ${data.formattedValue}`);
  };

  const handleExport = (format: 'png' | 'csv') => {
    console.log(`Exporting as ${format}`);
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    console.log('Date range changed:', { startDate, endDate });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Energy Consumption Heatmap Demo
          </h1>
          <p className="text-gray-600">
            Interactive visualization of hourly and weekly energy usage patterns
          </p>
        </div>

        <div className="space-y-8">
          {/* Personal View */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Energy Usage</h2>
            <EnergyHeatmapSimple
              data={personalData}
              viewType="personal"
              onCellClick={handleCellClick}
              onExport={handleExport}
              onDateRangeChange={handleDateRangeChange}
            />
          </section>

          {/* Community View */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Community Energy Usage</h2>
            <EnergyHeatmapSimple
              data={communityData}
              viewType="community"
              onCellClick={handleCellClick}
              onExport={handleExport}
              onDateRangeChange={handleDateRangeChange}
            />
          </section>

          {/* Grid View */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Grid-wide Energy Usage</h2>
            <EnergyHeatmapSimple
              data={gridData}
              viewType="grid"
              onCellClick={handleCellClick}
              onExport={handleExport}
              onDateRangeChange={handleDateRangeChange}
            />
          </section>
        </div>

        {/* Feature Overview */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Features Implemented</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">24h × 7 Days Grid</h3>
                <p className="text-sm text-gray-600">Complete weekly hourly visualization</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">Color Scale</h3>
                <p className="text-sm text-gray-600">Intensity-based color mapping</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">Interactive Tooltips</h3>
                <p className="text-sm text-gray-600">Hover for exact kWh values</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">Multiple Views</h3>
                <p className="text-sm text-gray-600">Personal, community, and grid-wide</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">Click Interactions</h3>
                <p className="text-sm text-gray-600">Select cells for detailed info</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">Statistics Display</h3>
                <p className="text-sm text-gray-600">Total, average, and peak consumption</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">CSV Export</h3>
                <p className="text-sm text-gray-600">Download data as CSV file</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">PNG Export</h3>
                <p className="text-sm text-gray-600">Export heatmap as image</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">Date Range Selection</h3>
                <p className="text-sm text-gray-600">Filter data by date range</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Notes */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Technical Implementation</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Rendering:</strong> CSS Grid-based layout for performance</p>
            <p><strong>Color Mapping:</strong> Dynamic scale based on data range</p>
            <p><strong>Interactions:</strong> Mouse events for hover and click</p>
            <p><strong>Accessibility:</strong> ARIA labels and keyboard navigation</p>
            <p><strong>Responsive:</strong> Mobile-friendly layout</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapDemo;
