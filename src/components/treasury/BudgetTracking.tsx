import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Eye,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useTreasury } from '../../hooks/useTreasury';
import { TreasuryHelpers } from '../../utils/treasuryHelpers';
import { Budget, BudgetStatus, BudgetPeriod, FundCategory } from '../../types/treasury';

interface BudgetTrackingProps {
  treasuryId: string;
}

export const BudgetTracking: React.FC<BudgetTrackingProps> = ({ treasuryId }) => {
  const { state, getFilteredFunds, getFilteredTransactions } = useTreasury({ treasuryId });
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<FundCategory | 'all'>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const funds = getFilteredFunds();
  const transactions = getFilteredTransactions();

  const generateBudgets = () => {
    const budgets: Budget[] = [];
    
    funds.forEach(fund => {
      const fundTransactions = transactions.filter(tx => tx.fundId === fund.id);
      const actualSpent = fundTransactions.reduce((total, tx) => total + tx.amount, 0);
      
      // Generate monthly budgets for the current year
      for (let month = 0; month < 12; month++) {
        const startDate = new Date(2024, month, 1);
        const endDate = new Date(2024, month + 1, 0);
        
        const monthlyTransactions = fundTransactions.filter(tx => 
          tx.createdAt >= startDate && tx.createdAt <= endDate
        );
        const monthlySpent = monthlyTransactions.reduce((total, tx) => total + tx.amount, 0);
        const plannedAmount = fund.allocatedAmount / 12;
        
        budgets.push({
          id: `budget-${fund.id}-${month}`,
          fundId: fund.id,
          name: `${fund.name} - ${startDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}`,
          description: `Monthly budget for ${fund.name}`,
          plannedAmount,
          actualAmount: monthlySpent,
          currency: fund.currency,
          period: BudgetPeriod.MONTHLY,
          startDate,
          endDate,
          status: endDate < new Date() ? 
            (monthlySpent > plannedAmount ? BudgetStatus.OVERDUE : BudgetStatus.COMPLETED) :
            BudgetStatus.ACTIVE,
          createdAt: startDate,
          updatedAt: new Date()
        });
      }
    });
    
    return budgets.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  };

  const budgets = generateBudgets();
  
  const filteredBudgets = budgets.filter(budget => {
    if (selectedPeriod !== 'all' && budget.period !== selectedPeriod) return false;
    if (selectedCategory !== 'all') {
      const fund = funds.find(f => f.id === budget.fundId);
      if (fund?.category !== selectedCategory) return false;
    }
    return true;
  });

  const totalPlanned = filteredBudgets.reduce((sum, budget) => sum + budget.plannedAmount, 0);
  const totalActual = filteredBudgets.reduce((sum, budget) => sum + budget.actualAmount, 0);
  const totalVariance = totalActual - totalPlanned;
  const variancePercentage = totalPlanned > 0 ? (totalVariance / totalPlanned) * 100 : 0;

  const getBudgetStatusColor = (status: BudgetStatus) => {
    switch (status) {
      case BudgetStatus.COMPLETED:
        return 'text-green-600 bg-green-50';
      case BudgetStatus.ACTIVE:
        return 'text-blue-600 bg-blue-50';
      case BudgetStatus.OVERDUE:
        return 'text-red-600 bg-red-50';
      case BudgetStatus.CANCELLED:
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getVarianceColor = (variance: number, planned: number) => {
    const percentage = planned > 0 ? (variance / planned) * 100 : 0;
    if (percentage > 10) return 'text-red-600';
    if (percentage > 5) return 'text-yellow-600';
    if (percentage < -5) return 'text-green-600';
    return 'text-gray-600';
  };

  const getVarianceIcon = (variance: number, planned: number) => {
    const percentage = planned > 0 ? (variance / planned) * 100 : 0;
    if (percentage > 5) return <TrendingUp className="h-4 w-4" />;
    if (percentage < -5) return <TrendingDown className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  const exportBudgetData = () => {
    const exportData = filteredBudgets.map(budget => {
      const fund = funds.find(f => f.id === budget.fundId);
      return {
        'Budget Name': budget.name,
        'Fund': fund?.name || 'Unknown',
        'Category': fund ? TreasuryHelpers.getCategoryDisplayName(fund.category) : 'Unknown',
        'Period': TreasuryHelpers.getPeriodDisplayName(budget.period),
        'Planned Amount': budget.plannedAmount,
        'Actual Amount': budget.actualAmount,
        'Variance': TreasuryHelpers.calculateBudgetVariance(budget),
        'Variance %': TreasuryHelpers.calculateBudgetVariancePercentage(budget),
        'Status': budget.status,
        'Start Date': budget.startDate.toLocaleDateString(),
        'End Date': budget.endDate.toLocaleDateString()
      };
    });

    TreasuryHelpers.exportToCSV(exportData, 'budget-tracking-report');
  };

  const renderBudgetCard = (budget: Budget) => {
    const fund = funds.find(f => f.id === budget.fundId);
    const variance = TreasuryHelpers.calculateBudgetVariance(budget);
    const utilization = budget.plannedAmount > 0 ? (budget.actualAmount / budget.plannedAmount) * 100 : 0;
    const isExpanded = showDetails === budget.id;

    return (
      <div key={budget.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBudgetStatusColor(budget.status)}`}>
                {budget.status}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>{fund?.name}</span>
              <span>•</span>
              <span>{TreasuryHelpers.getPeriodDisplayName(budget.period)}</span>
            </div>
          </div>
          
          <button
            onClick={() => setShowDetails(isExpanded ? null : budget.id)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Planned</p>
            <p className="text-lg font-semibold text-gray-900">
              {TreasuryHelpers.formatCurrency(budget.plannedAmount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Actual</p>
            <p className="text-lg font-semibold text-gray-900">
              {TreasuryHelpers.formatCurrency(budget.actualAmount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Variance</p>
            <div className={`flex items-center ${getVarianceColor(variance, budget.plannedAmount)}`}>
              {getVarianceIcon(variance, budget.plannedAmount)}
              <span className="ml-1 font-semibold">
                {TreasuryHelpers.formatCurrency(Math.abs(variance))}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Utilization</span>
            <span className="font-medium text-gray-900">{utilization.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                utilization > 100 ? 'bg-red-500' :
                utilization > 90 ? 'bg-orange-500' :
                utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Period</span>
              <span className="text-gray-900">
                {budget.startDate.toLocaleDateString()} - {budget.endDate.toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Variance Percentage</span>
              <span className={`font-medium ${getVarianceColor(variance, budget.plannedAmount)}`}>
                {TreasuryHelpers.calculateBudgetVariancePercentage(budget).toFixed(1)}%
              </span>
            </div>

            {fund && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Fund Category</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${TreasuryHelpers.getCategoryColor(fund.category)}`}>
                  {TreasuryHelpers.getCategoryDisplayName(fund.category)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBudgetSummary = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Summary</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Planned</span>
          <span className="text-lg font-semibold text-gray-900">
            {TreasuryHelpers.formatCurrency(totalPlanned)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Actual</span>
          <span className="text-lg font-semibold text-gray-900">
            {TreasuryHelpers.formatCurrency(totalActual)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Variance</span>
          <div className={`flex items-center ${getVarianceColor(totalVariance, totalPlanned)}`}>
            {getVarianceIcon(totalVariance, totalPlanned)}
            <span className="ml-1 font-semibold">
              {TreasuryHelpers.formatCurrency(Math.abs(totalVariance))}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Variance Percentage</span>
          <span className={`font-semibold ${getVarianceColor(totalVariance, totalPlanned)}`}>
            {variancePercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredBudgets.filter(b => b.status === BudgetStatus.ACTIVE).length}
            </div>
            <div className="text-sm text-gray-600">Active Budgets</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredBudgets.filter(b => b.status === BudgetStatus.COMPLETED).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={exportBudgetData}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Budget Data
        </button>
      </div>
    </div>
  );

  const renderBudgetChart = () => {
    const monthlyData = filteredBudgets.reduce((data, budget) => {
      const month = budget.startDate.toLocaleDateString('en', { month: 'short', year: 'numeric' });
      if (!data[month]) {
        data[month] = { planned: 0, actual: 0 };
      }
      data[month].planned += budget.plannedAmount;
      data[month].actual += budget.actualAmount;
      return data;
    }, {} as { [month: string]: { planned: number; actual: number } });

    const months = Object.keys(monthlyData).slice(-6);
    const maxAmount = Math.max(...months.map(m => Math.max(monthlyData[m].planned, monthlyData[m].actual)));

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual (6 months)</h3>
        
        <div className="space-y-3">
          {months.map(month => {
            const data = monthlyData[month];
            const plannedHeight = maxAmount > 0 ? (data.planned / maxAmount) * 100 : 0;
            const actualHeight = maxAmount > 0 ? (data.actual / maxAmount) * 100 : 0;
            
            return (
              <div key={month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-blue-600">
                      {TreasuryHelpers.formatLargeNumber(data.planned)}
                    </span>
                    <span className="text-green-600">
                      {TreasuryHelpers.formatLargeNumber(data.actual)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded h-6 relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-blue-500 opacity-50"
                      style={{ width: `${plannedHeight}%` }}
                    />
                    <div
                      className="absolute left-0 top-0 h-full bg-green-500"
                      style={{ width: `${actualHeight}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 opacity-50 rounded" />
              <span className="text-gray-600">Planned</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-gray-600">Actual</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryBreakdown = () => {
    const categoryData = filteredBudgets.reduce((data, budget) => {
      const fund = funds.find(f => f.id === budget.fundId);
      if (!fund) return data;
      
      if (!data[fund.category]) {
        data[fund.category] = { planned: 0, actual: 0, count: 0 };
      }
      data[fund.category].planned += budget.plannedAmount;
      data[fund.category].actual += budget.actualAmount;
      data[fund.category].count += 1;
      return data;
    }, {} as { [category: string]: { planned: number; actual: number; count: number } });

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
        
        <div className="space-y-3">
          {Object.entries(categoryData)
            .sort(([, a], [, b]) => b.planned - a.planned)
            .map(([category, data]) => {
              const variance = data.actual - data.planned;
              const variancePercentage = data.planned > 0 ? (variance / data.planned) * 100 : 0;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${TreasuryHelpers.getCategoryColor(category as FundCategory).split(' ')[1]}`} />
                      <span className="text-sm font-medium text-gray-900">
                        {TreasuryHelpers.getCategoryDisplayName(category as FundCategory)}
                      </span>
                      <span className="text-xs text-gray-500">({data.count} budgets)</span>
                    </div>
                    <div className={`flex items-center ${getVarianceColor(variance, data.planned)}`}>
                      {getVarianceIcon(variance, data.planned)}
                      <span className="ml-1 text-sm font-medium">
                        {variancePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Planned:</span>
                      <span className="ml-1 font-medium">{TreasuryHelpers.formatLargeNumber(data.planned)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Actual:</span>
                      <span className="ml-1 font-medium">{TreasuryHelpers.formatLargeNumber(data.actual)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Variance:</span>
                      <span className={`ml-1 font-medium ${getVarianceColor(variance, data.planned)}`}>
                        {TreasuryHelpers.formatLargeNumber(Math.abs(variance))}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Budget Tracking</h2>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as BudgetPeriod | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Periods</option>
              {Object.values(BudgetPeriod).map(period => (
                <option key={period} value={period}>
                  {TreasuryHelpers.getPeriodDisplayName(period)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as FundCategory | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Categories</option>
              {Object.values(FundCategory).map(category => (
                <option key={category} value={category}>
                  {TreasuryHelpers.getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredBudgets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Budget Data Available</h3>
          <p className="text-gray-600">
            {funds.length === 0 
              ? 'Create funds first to see budget tracking data.'
              : 'Budget data will appear once transactions are recorded.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {filteredBudgets.slice(0, 10).map(renderBudgetCard)}
                
                {filteredBudgets.length > 10 && (
                  <div className="text-center">
                    <p className="text-gray-500">
                      Showing 10 of {filteredBudgets.length} budgets
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              {renderBudgetSummary()}
              {renderBudgetChart()}
              {renderCategoryBreakdown()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
