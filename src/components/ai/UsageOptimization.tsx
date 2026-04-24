import React, { useState, useEffect } from 'react';
import { Activity, Clock, Zap, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface UsagePattern {
  time: string;
  consumption: number;
  cost: number;
  optimal: number;
}

interface DeviceUsage {
  device: string;
  usage: number;
  efficiency: number;
  recommendation: string;
}

export const UsageOptimization: React.FC = () => {
  const [usageData, setUsageData] = useState<UsagePattern[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceUsage[]>([]);
  const [peakHours, setPeakHours] = useState<string[]>([]);
  const [optimizationPotential, setOptimizationPotential] = useState(15);

  useEffect(() => {
    // Simulate usage pattern data
    const mockUsageData: UsagePattern[] = [
      { time: '00:00', consumption: 2.1, cost: 0.42, optimal: 1.8 },
      { time: '04:00', consumption: 1.8, cost: 0.36, optimal: 1.5 },
      { time: '08:00', consumption: 4.2, cost: 0.84, optimal: 3.5 },
      { time: '12:00', consumption: 5.8, cost: 1.16, optimal: 4.8 },
      { time: '16:00', consumption: 6.2, cost: 1.24, optimal: 5.1 },
      { time: '20:00', consumption: 7.1, cost: 1.42, optimal: 5.8 },
      { time: '23:00', consumption: 3.2, cost: 0.64, optimal: 2.8 },
    ];

    const mockDeviceData: DeviceUsage[] = [
      { device: 'HVAC System', usage: 45, efficiency: 72, recommendation: 'Schedule maintenance for optimal performance' },
      { device: 'Water Heater', usage: 22, efficiency: 68, recommendation: 'Install timer to reduce standby consumption' },
      { device: 'Lighting', usage: 15, efficiency: 85, recommendation: 'Switch to LED bulbs for better efficiency' },
      { device: 'Kitchen Appliances', usage: 12, efficiency: 78, recommendation: 'Use energy-saving modes when available' },
      { device: 'Entertainment', usage: 6, efficiency: 82, recommendation: 'Enable power-saving features' },
    ];

    setUsageData(mockUsageData);
    setDeviceData(mockDeviceData);
    setPeakHours(['16:00', '20:00', '23:00']);
  }, []);

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600 bg-green-100';
    if (efficiency >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="energy-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Activity className="w-6 h-6 text-green-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Usage Optimization</h2>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Optimization Potential</span>
          <div className="flex items-center">
            <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-sm font-medium text-green-600">{optimizationPotential}%</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Usage Pattern</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={usageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="consumption" stroke="#3B82F6" strokeWidth={2} name="Current (kWh)" />
            <Line type="monotone" dataKey="optimal" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Optimal (kWh)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Usage Hours</h3>
        <div className="flex flex-wrap gap-2">
          {peakHours.map((hour) => (
            <div key={hour} className="flex items-center px-3 py-2 bg-red-50 rounded-lg">
              <Clock className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-800">{hour}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Shifting usage outside peak hours can save up to 20% on energy costs
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Efficiency Analysis</h3>
        <div className="space-y-3">
          {deviceData.map((device, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="font-medium text-gray-900">{device.device}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEfficiencyColor(device.efficiency)}`}>
                  {device.efficiency}% efficient
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Usage: {device.usage}% of total</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full"
                    style={{ width: `${device.efficiency}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-blue-600">{device.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Smart Optimization Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Run heavy appliances during off-peak hours (10 PM - 6 AM)</li>
          <li>• Use smart plugs to automatically turn off standby devices</li>
          <li>• Set your thermostat 2° lower in winter and 2° higher in summer</li>
          <li>• Use natural light during daytime hours</li>
        </ul>
      </div>
    </div>
  );
};
