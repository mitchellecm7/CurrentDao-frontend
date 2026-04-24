import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingDown, PiggyBank, Calculator } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface SavingsData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface MonthlySavings {
  month: string;
  savings: number;
  projected: number;
}

interface CostReduction {
  area: string;
  current: number;
  potential: number;
  savings: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const CostSavings: React.FC = () => {
  const [savingsData, setSavingsData] = useState<SavingsData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlySavings[]>([]);
  const [costReductions, setCostReductions] = useState<CostReduction[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [annualProjection, setAnnualProjection] = useState(0);

  useEffect(() => {
    const mockSavingsData: SavingsData[] = [
      { category: 'HVAC Optimization', amount: 45, percentage: 35, color: '#3B82F6' },
      { category: 'Lighting Upgrades', amount: 28, percentage: 22, color: '#10B981' },
      { category: 'Smart Scheduling', amount: 22, percentage: 17, color: '#F59E0B' },
      { category: 'Appliance Efficiency', amount: 18, percentage: 14, color: '#EF4444' },
      { category: 'Peak Usage Shift', amount: 15, percentage: 12, color: '#8B5CF6' },
    ];

    const mockMonthlyData: MonthlySavings[] = [
      { month: 'Jan', savings: 85, projected: 95 },
      { month: 'Feb', savings: 92, projected: 98 },
      { month: 'Mar', savings: 108, projected: 105 },
      { month: 'Apr', savings: 115, projected: 112 },
      { month: 'May', savings: 128, projected: 120 },
      { month: 'Jun', savings: 135, projected: 128 },
    ];

    const mockCostReductions: CostReduction[] = [
      { area: 'Heating & Cooling', current: 180, potential: 135, savings: 45, difficulty: 'medium' },
      { area: 'Water Heating', current: 65, potential: 48, savings: 17, difficulty: 'easy' },
      { area: 'Lighting', current: 42, potential: 28, savings: 14, difficulty: 'easy' },
      { area: 'Electronics', current: 38, potential: 29, savings: 9, difficulty: 'medium' },
      { area: 'Kitchen Appliances', current: 55, potential: 47, savings: 8, difficulty: 'hard' },
    ];

    setSavingsData(mockSavingsData);
    setMonthlyData(mockMonthlyData);
    setCostReductions(mockCostReductions);
    setTotalSavings(mockSavingsData.reduce((sum, item) => sum + item.amount, 0));
    setAnnualProjection(mockSavingsData.reduce((sum, item) => sum + item.amount, 0) * 12);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="energy-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <DollarSign className="w-6 h-6 text-green-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Cost Savings</h2>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Monthly Average</span>
          <div className="flex items-center">
            <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-sm font-medium text-green-600">${totalSavings}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <PiggyBank className="w-8 h-8" />
              <div className="text-right">
                <p className="text-2xl font-bold">${totalSavings}</p>
                <p className="text-xs opacity-80">Monthly Savings</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Calculator className="w-8 h-8" />
              <div className="text-right">
                <p className="text-2xl font-bold">${annualProjection}</p>
                <p className="text-xs opacity-80">Annual Projection</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Breakdown</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={savingsData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percentage }) => `${category}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
            >
              {savingsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Progress</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value}`} />
            <Bar dataKey="savings" fill="#10B981" name="Actual Savings" />
            <Bar dataKey="projected" fill="#3B82F6" fillOpacity={0.6} name="Projected" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Reduction Opportunities</h3>
        <div className="space-y-3">
          {costReductions.map((reduction, index) => (
            <div key={index} className="savings-item">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{reduction.area}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(reduction.difficulty)}`}>
                  {reduction.difficulty}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Current: ${reduction.current}</span>
                  <span className="text-green-600">Potential: ${reduction.potential}</span>
                </div>
                <span className="font-medium text-green-600">Save ${reduction.savings}</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                  style={{ width: `${(reduction.savings / reduction.current) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Implementation Guide</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Start with easy wins for immediate savings</li>
          <li>• Reinvest savings into higher-impact upgrades</li>
          <li>• Track progress monthly to stay motivated</li>
          <li>• Consider financing options for larger investments</li>
        </ul>
      </div>
    </div>
  );
};
