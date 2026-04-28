import React, { useState, useEffect } from 'react';
import { Leaf, TrendingDown, Award, Calendar, ExternalLink, Info, ChevronRight } from 'lucide-react';

export interface CarbonFootprint {
  id: string;
  date: string;
  energyUsage: number; // kWh
  co2Emissions: number; // kg CO2
  region: string;
  carbonIntensity: number; // kg CO2 per kWh
}

export interface CarbonOffset {
  id: string;
  name: string;
  description: string;
  type: 'renewable' | 'reforestation' | 'energy-efficiency' | 'other';
  location: string;
  pricePerTon: number; // USD
  availableCredits: number;
  registry: 'Verra' | 'Gold Standard' | 'Other';
  imageUrl?: string;
  projectUrl?: string;
}

export interface CarbonReport {
  period: string;
  totalEmissions: number;
  totalOffset: number;
  netEmissions: number;
  isCarbonNeutral: boolean;
  monthlyData: CarbonFootprint[];
}

interface CarbonCreditDashboardProps {
  className?: string;
}

const sampleCarbonData: CarbonFootprint[] = [
  {
    id: '1',
    date: '2024-04-01',
    energyUsage: 1250,
    co2Emissions: 450,
    region: 'California',
    carbonIntensity: 0.36
  },
  {
    id: '2',
    date: '2024-04-02',
    energyUsage: 980,
    co2Emissions: 352.8,
    region: 'California',
    carbonIntensity: 0.36
  },
  {
    id: '3',
    date: '2024-04-03',
    energyUsage: 1100,
    co2Emissions: 396,
    region: 'California',
    carbonIntensity: 0.36
  }
];

const sampleOffsetProjects: CarbonOffset[] = [
  {
    id: 'proj-1',
    name: 'Solar Farm Development - Texas',
    description: 'Large-scale solar farm generating clean energy for 50,000 homes',
    type: 'renewable',
    location: 'Texas, USA',
    pricePerTon: 25,
    availableCredits: 10000,
    registry: 'Verra',
    projectUrl: 'https://example.com/solar-texas'
  },
  {
    id: 'proj-2',
    name: 'Amazon Rainforest Reforestation',
    description: 'Reforestation project protecting and restoring 10,000 hectares of Amazon rainforest',
    type: 'reforestation',
    location: 'Amazon, Brazil',
    pricePerTon: 18,
    availableCredits: 5000,
    registry: 'Gold Standard',
    projectUrl: 'https://example.com/amazon-reforest'
  },
  {
    id: 'proj-3',
    name: 'Wind Energy Project - North Sea',
    description: 'Offshore wind farm providing renewable energy to European grid',
    type: 'renewable',
    location: 'North Sea',
    pricePerTon: 22,
    availableCredits: 7500,
    registry: 'Verra',
    projectUrl: 'https://example.com/north-sea-wind'
  },
  {
    id: 'proj-4',
    name: 'Building Efficiency Program',
    description: 'Energy efficiency upgrades for commercial buildings in urban areas',
    type: 'energy-efficiency',
    location: 'Multiple Cities, USA',
    pricePerTon: 15,
    availableCredits: 3000,
    registry: 'Gold Standard',
    projectUrl: 'https://example.com/building-efficiency'
  }
];

export const CarbonCreditDashboard: React.FC<CarbonCreditDashboardProps> = ({ className }) => {
  const [footprintData, setFootprintData] = useState<CarbonFootprint[]>(sampleCarbonData);
  const [offsetProjects, setOffsetProjects] = useState<CarbonOffset[]>(sampleOffsetProjects);
  const [selectedProject, setSelectedProject] = useState<CarbonOffset | null>(null);
  const [offsetAmount, setOffsetAmount] = useState<string>('1');
  const [carbonReport, setCarbonReport] = useState<CarbonReport | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    calculateCarbonReport();
  }, [footprintData]);

  const calculateCarbonReport = () => {
    setIsCalculating(true);
    
    // Simulate API call to get carbon intensity data
    setTimeout(() => {
      const totalEmissions = footprintData.reduce((sum, data) => sum + data.co2Emissions, 0);
      const totalOffset = 0; // Will be calculated based on purchased credits
      const netEmissions = totalEmissions - totalOffset;
      
      const report: CarbonReport = {
        period: 'April 2024',
        totalEmissions,
        totalOffset,
        netEmissions,
        isCarbonNeutral: netEmissions <= 0,
        monthlyData: footprintData
      };
      
      setCarbonReport(report);
      setIsCalculating(false);
    }, 1000);
  };

  const handlePurchaseCredits = (project: CarbonOffset, amount: number) => {
    // Simulate purchase process
    console.log(`Purchasing ${amount} credits from ${project.name}`);
    // In a real app, this would integrate with Stellar blockchain or payment system
    
    // Update carbon report with new offsets
    if (carbonReport) {
      const newOffset = carbonReport.totalOffset + (amount * 1000); // 1 credit = 1 ton CO2
      const updatedReport: CarbonReport = {
        ...carbonReport,
        totalOffset: newOffset,
        netEmissions: carbonReport.totalEmissions - newOffset,
        isCarbonNeutral: carbonReport.totalEmissions - newOffset <= 0
      };
      setCarbonReport(updatedReport);
    }
  };

  const getProjectTypeColor = (type: CarbonOffset['type']) => {
    switch (type) {
      case 'renewable': return 'bg-green-100 text-green-800 border-green-200';
      case 'reforestation': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'energy-efficiency': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRegistryIcon = (registry: CarbonOffset['registry']) => {
    switch (registry) {
      case 'Verra': return '🌍';
      case 'Gold Standard': return '⭐';
      default: return '📋';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Carbon Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Emissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {carbonReport?.totalEmissions.toFixed(1)} kg
              </p>
            </div>
            <div className="bg-red-100 p-2 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Carbon Offset</p>
              <p className="text-2xl font-bold text-gray-900">
                {carbonReport?.totalOffset.toFixed(1)} kg
              </p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Emissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {carbonReport?.netEmissions.toFixed(1)} kg
              </p>
            </div>
            <div className={`${carbonReport?.isCarbonNeutral ? 'bg-green-100' : 'bg-yellow-100'} p-2 rounded-lg`}>
              <Award className={`w-5 h-5 ${carbonReport?.isCarbonNeutral ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-bold">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  carbonReport?.isCarbonNeutral 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  {carbonReport?.isCarbonNeutral ? 'Carbon Neutral' : 'Needs Offsetting'}
                </span>
              </p>
            </div>
            {carbonReport?.isCarbonNeutral && (
              <div className="text-green-600">
                <Award className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carbon Intensity Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Carbon Intensity Data</h4>
            <p className="text-sm text-blue-800 mt-1">
              Current carbon intensity for your region: <strong>0.36 kg CO₂/kWh</strong>
            </p>
            <p className="text-sm text-blue-700 mt-1">
              This data is sourced from regional grid APIs and updated hourly.
            </p>
          </div>
        </div>
      </div>

      {/* Offset Projects */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Available Carbon Offset Projects</h3>
          <p className="text-sm text-gray-600 mt-1">
            Browse certified carbon credit projects to offset your energy consumption
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offsetProjects.map(project => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  </div>
                  <span className="ml-3">
                    {getRegistryIcon(project.registry)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getProjectTypeColor(project.type)}`}>
                    {project.type}
                  </span>
                  <span className="text-sm text-gray-500">{project.location}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Price per ton</p>
                    <p className="text-lg font-bold text-gray-900">${project.pricePerTon}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-lg font-bold text-gray-900">{project.availableCredits.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Purchase Credits
                  </button>
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-1"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Purchase Carbon Credits</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedProject.name}</p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Credits (1 credit = 1 ton CO₂)
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProject.availableCredits}
                  value={offsetAmount}
                  onChange={(e) => setOffsetAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Price per credit</span>
                  <span className="text-sm font-medium">${selectedProject.pricePerTon}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Number of credits</span>
                  <span className="text-sm font-medium">{offsetAmount}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Total Cost</span>
                    <span className="font-bold text-gray-900">
                      ${(selectedProject.pricePerTon * parseInt(offsetAmount || '0')).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Credits will be tokenized on the Stellar blockchain and added to your carbon offset portfolio.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => handlePurchaseCredits(selectedProject, parseInt(offsetAmount || '0'))}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Purchase Credits
              </button>
              <button
                onClick={() => setSelectedProject(null)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Report */}
      {carbonReport && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Carbon Report</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{carbonReport.period}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {carbonReport.monthlyData.map((data, index) => (
                <div key={data.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{new Date(data.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{data.region} • {data.energyUsage} kWh</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{data.co2Emissions.toFixed(1)} kg CO₂</p>
                    <p className="text-sm text-gray-600">{data.carbonIntensity} kg/kWh</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonCreditDashboard;
