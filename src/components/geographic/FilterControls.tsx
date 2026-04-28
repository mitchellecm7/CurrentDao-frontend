import React from 'react';
import { Search, Filter, RefreshCw, MapPin } from 'lucide-react';
import { GridNodeFilter, NodeType, EnergyStatus } from '../types/grid-topology';

interface FilterControlsProps {
  filter: GridNodeFilter;
  onFilterChange: (filter: GridNodeFilter) => void;
  metrics: {
    totalCapacity: number;
    totalDemand: number;
    renewablePercentage: number;
    surplusNodes: number;
    deficitNodes: number;
    averageCapacityUtilization: number;
  } | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filter,
  onFilterChange,
  metrics,
  onRefresh,
  isLoading,
}) => {
  const nodeTypes: NodeType[] = [
    'solar_farm', 'wind_farm', 'hydro_plant', 'nuclear_plant',
    'gas_plant', 'coal_plant', 'storage', 'consumer', 'substation', 'transformer'
  ];

  const energyStatuses: EnergyStatus[] = ['surplus', 'deficit', 'balanced'];

  const handleTypeToggle = (type: NodeType) => {
    const currentTypes = filter.nodeTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    onFilterChange({ ...filter, nodeTypes: newTypes.length > 0 ? newTypes : undefined });
  };

  const handleStatusToggle = (status: EnergyStatus) => {
    const currentStatuses = filter.energyStatus || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    onFilterChange({ ...filter, energyStatus: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handleRegionChange = (region: string) => {
    const currentRegions = filter.regions || [];
    const newRegions = currentRegions.includes(region)
      ? currentRegions.filter(r => r !== region)
      : [...currentRegions, region];
    onFilterChange({ ...filter, regions: newRegions.length > 0 ? newRegions : undefined });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 space-y-4">
      {/* Search and Refresh */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search nodes by name, region, or owner..."
            value={filter.searchQuery || ''}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value || undefined })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Summary */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">Total Capacity</p>
            <p className="text-lg font-bold">{metrics.totalCapacity.toFixed(0)} MW</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Demand</p>
            <p className="text-lg font-bold">{metrics.totalDemand.toFixed(0)} MW</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Renewable</p>
            <p className="text-lg font-bold text-green-600">{metrics.renewablePercentage.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Surplus Nodes</p>
            <p className="text-lg font-bold text-green-600">{metrics.surplusNodes}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Deficit Nodes</p>
            <p className="text-lg font-bold text-red-600">{metrics.deficitNodes}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        {/* Node Type Filter */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Node Type
          </p>
          <div className="flex flex-wrap gap-2">
            {nodeTypes.map(type => {
              const isActive = filter.nodeTypes?.includes(type);
              const colorMap: Record<string, string> = {
                solar_farm: 'bg-amber-100 text-amber-700 border-amber-300',
                wind_farm: 'bg-blue-100 text-blue-700 border-blue-300',
                hydro_plant: 'bg-cyan-100 text-cyan-700 border-cyan-300',
                nuclear_plant: 'bg-purple-100 text-purple-700 border-purple-300',
                gas_plant: 'bg-orange-100 text-orange-700 border-orange-300',
                coal_plant: 'bg-gray-100 text-gray-700 border-gray-300',
                storage: 'bg-emerald-100 text-emerald-700 border-emerald-300',
                consumer: 'bg-red-100 text-red-700 border-red-300',
                substation: 'bg-indigo-100 text-indigo-700 border-indigo-300',
                transformer: 'bg-pink-100 text-pink-700 border-pink-300',
              };
              
              return (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`px-3 py-1 text-xs border rounded-full transition-all ${
                    isActive 
                      ? colorMap[type] + ' ring-2 ring-offset-1'
                      : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy Status Filter */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Energy Status</p>
          <div className="flex flex-wrap gap-2">
            {energyStatuses.map(status => {
              const isActive = filter.energyStatus?.includes(status);
              const colors = {
                surplus: 'bg-green-100 text-green-700 border-green-300',
                balanced: 'bg-blue-100 text-blue-700 border-blue-300',
                deficit: 'bg-red-100 text-red-700 border-red-300',
              };
              
              return (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={`px-3 py-1 text-xs border rounded-full capitalize transition-all ${
                    isActive 
                      ? colors[status] + ' ring-2 ring-offset-1'
                      : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        {/* Region Filter (example) */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Region
          </p>
          <div className="flex flex-wrap gap-2">
            {['California', 'Southern California', 'Bay Area', 'Sierra Nevada', 'Los Angeles'].map(region => {
              const isActive = filter.regions?.includes(region);
              return (
                <button
                  key={region}
                  onClick={() => handleRegionChange(region)}
                  className={`px-3 py-1 text-xs border rounded-full transition-all ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 border-purple-300 ring-2 ring-offset-1'
                      : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
