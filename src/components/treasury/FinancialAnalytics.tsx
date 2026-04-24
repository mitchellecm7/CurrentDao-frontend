import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Activity, 
  Download,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { useTreasury } from '../../hooks/useTreasury';
import { TreasuryHelpers } from '../../utils/treasuryHelpers';
import { FundCategory, BudgetPeriod } from '../../types/treasury';

interface FinancialAnalyticsProps {
  treasuryId: string;
}

export const FinancialAnalytics: React.FC<FinancialAnalyticsProps> = ({ treasuryId }) => {
  const { state, getFilteredFunds, getFilteredTransactions, getTreasuryAnalytics } = useTreasury({ treasuryId });
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<FundCategory | 'all'>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const funds = getFilteredFunds();
  const transactions = getFilteredTransactions();
  const analytics = getTreasuryAnalytics();

  const getPeriodData = () => {
    const now = new Date();
    let daysAgo = 30;

    switch (selectedPeriod) {
      case '7d':
        daysAgo = 7;
        break;
      case '90d':
        daysAgo = 90;
        break;
      case '1y':
        daysAgo = 365;
        break;
    }

    const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    return transactions.filter(tx => tx.createdAt >= startDate);
  };

  const periodTransactions = getPeriodData();
  const periodFunds = funds.filter(fund => {
    if (selectedCategory !== 'all' && fund.category !== selectedCategory) return false;
    return true;
  });

  const calculatePeriodMetrics = () => {
    const totalInflow = periodTransactions
      .filter(tx => tx.type === 'deposit' && tx.status === 'confirmed')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalOutflow = periodTransactions
      .filter(tx => ['withdrawal', 'proposal_payout'].includes(tx.type) && tx.status === 'confirmed')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const netFlow = totalInflow - totalOutflow;
    const burnRate = totalOutflow / (daysAgo || 1);
    const runway = state.metrics?.availableBalance && burnRate > 0 ? state.metrics.availableBalance / burnRate : 0;

    return {
      totalInflow,
      totalOutflow,
      netFlow,
      burnRate,
      runway,
      transactionCount: periodTransactions.length
    };
  };

  const getCategorySpending = () => {
    const categorySpending: { [key: string]: { amount: number; count: number } } = {};
    
    periodTransactions.forEach(tx => {
      const fund = funds.find(f => f.id === tx.fundId);
      if (fund) {
        const category = fund.category;
        if (!categorySpending[category]) {
          categorySpending[category] = { amount: 0, count: 0 };
        }
        categorySpending[category].amount += tx.amount;
        categorySpending[category].count += 1;
      }
    });

    return categorySpending;
  };

  const getMonthlyTrends = () => {
    const monthlyData: { [month: string]: { inflow: number; outflow: number; net: number } } = {};
    
    periodTransactions.forEach(tx => {
      const month = tx.createdAt.toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { inflow: 0, outflow: 0, net: 0 };
      }
      
      if (tx.type === 'deposit' && tx.status === 'confirmed') {
        monthlyData[month].inflow += tx.amount;
      } else if (['withdrawal', 'proposal_payout'].includes(tx.type) && tx.status === 'confirmed') {
        monthlyData[month].outflow += tx.amount;
      }
      
      monthlyData[month].net = monthlyData[month].inflow - monthlyData[month].outflow;
    });

    return Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({ month, ...data }));
  };

  const getFundPerformance = () => {
    return periodFunds.map(fund => {
      const fundTransactions = transactions.filter(tx => tx.fundId === fund.id);
      const periodSpent = fundTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const utilization = fund.allocatedAmount > 0 ? (periodSpent / fund.allocatedAmount) * 100 : 0;
      const efficiency = fund.spentAmount > 0 ? (periodSpent / fund.spentAmount) * 100 : 100;
      
      return {
        fundName: fund.name,
        category: fund.category,
        allocated: fund.allocatedAmount,
        spent: fund.spentAmount,
        periodSpent,
        utilization,
        efficiency,
        variance: periodSpent - (fund.allocatedAmount / 12)
      };
    });
  };

  const exportAnalyticsData = () => {
    const exportData = [
      ...getFundPerformance().map(fp => ({
        'Fund Name': fp.fundName,
        'Category': TreasuryHelpers.getCategoryDisplayName(fp.category),
        'Allocated Amount': fp.allocated,
        'Total Spent': fp.spent,
        'Period Spent': fp.periodSpent,
        'Utilization %': fp.utilization,
        'Efficiency %': fp.efficiency,
        'Variance': fp.variance
      })),
      ...getMonthlyTrends().map(mt => ({
        'Month': mt.month,
        'Inflow': mt.inflow,
        'Outflow': mt.outflow,
        'Net Flow': mt.net
      })),
      ...Object.entries(getCategorySpending()).map(([category, data]) => ({
        'Category': TreasuryHelpers.getCategoryDisplayName(category as FundCategory),
        'Amount Spent': data.amount,
        'Transaction Count': data.count
      }))
    ];

    TreasuryHelpers.exportToCSV(exportData, 'financial-analytics-report');
  };

  const renderCashFlowChart = () => {
    const trends = getMonthlyTrends();
    const maxAmount = Math.max(...trends.map(t => Math.max(t.inflow, t.outflow)));

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Trend</h3>
        
        <div className="space-y-3">
          {trends.map((trend, index) => (
            <div key={trend.month} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{trend.month}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-green-600">
                    {TreasuryHelpers.formatLargeNumber(trend.inflow)}
                  </span>
                  <span className="text-red-600">
                    {TreasuryHelpers.formatLargeNumber(trend.outflow)}
                  </span>
                  <span className={`font-medium ${
                    trend.net >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend.net >= 0 ? '+' : ''}{TreasuryHelpers.formatCurrency(Math.abs(trend.net))}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded h-6 relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-green-500 opacity-50"
                    style={{ width: `${maxAmount > 0 ? (trend.inflow / maxAmount) * 100 : 0}%` }}
                  />
                  <div
                    className="absolute left-0 top-0 h-full bg-red-500"
                    style={{ width: `${maxAmount > 0 ? (trend.outflow / maxAmount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 opacity-50 rounded" />
              <span className="text-gray-600">Inflow</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-gray-600">Outflow</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryBreakdown = () => {
    const categorySpending = getCategorySpending();
    const totalSpent = Object.values(categorySpending).reduce((sum, cat) => sum + cat.amount, 0);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
        
        <div className="space-y-3">
          {Object.entries(categorySpending)
            .sort(([, a], [, b]) => b.amount - a.amount)
            .map(([category, data]) => {
              const percentage = totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${TreasuryHelpers.getCategoryColor(category as FundCategory).split(' ')[1]}`} />
                      <span className="text-sm font-medium text-gray-900">
                        {TreasuryHelpers.getCategoryDisplayName(category as FundCategory)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {TreasuryHelpers.formatCurrency(data.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{data.count} transactions</span>
                    <span>Avg: {data.count > 0 ? TreasuryHelpers.formatCurrency(data.amount / data.count) : 'N/A'}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  const renderFundPerformance = () => {
    const performance = getFundPerformance();
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fund Performance</h3>
        
        <div className="space-y-4">
          {performance.map((fund, index) => {
            const statusColor = fund.utilization > 100 ? 'text-red-600' : 
                           fund.utilization > 90 ? 'text-yellow-600' : 
                           fund.utilization > 75 ? 'text-orange-600' : 'text-green-600';
            
            const varianceColor = fund.variance > 0 ? 'text-red-600' : 'text-green-600';
            const varianceIcon = fund.variance > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{fund.fundName}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${TreasuryHelpers.getCategoryColor(fund.category)}`}>
                      {Treasury.getCategoryDisplayName(fund.category)}
                    </span>
                  </div>
                  <div className={`flex items-center ${statusColor}`}>
                    {fund.utilization > 100 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    <span className="ml-1 text-sm font-medium">{fund.utilization.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Allocated</span>
                    <div className="font-medium text-gray-900">
                      {TreasuryHelpers.formatCurrency(fund.allocated)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Spent</span>
                    <div className="font-medium text-gray-900">
                      {TreasuryHelpers.formatCurrency(fund.spent)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Period Spent</span>
                    <div className="font-medium text-gray-900">
                      {TreasuryHelpers.formatCurrency(fund.periodSpent)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Efficiency</span>
                    <div className={`font-medium ${fund.efficiency > 100 ? 'text-red-600' : 'text-green-600'}`}>
                      {fund.efficiency.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Variance</span>
                  <div className={`flex items-center ${varianceColor}`}>
                    {varianceIcon}
                    <span className="ml-1 font-medium">
                      {TreasuryHelpers.formatCurrency(Math.abs(fund.variance))}
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

  const renderKeyMetrics = () => {
    const metrics = calculatePeriodMetrics();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Net Cash Flow</span>
            <div className={`flex items-center ${metrics.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.netFlow >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {TreasuryHelpers.formatCurrency(Math.abs(metrics.netFlow))}
          </div>
          <div className={`text-sm ${metrics.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.netFlow >= 0 ? 'Positive' : 'Negative'} flow
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Burn Rate</span>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {TreasuryHelpers.formatCurrency(metrics.burnRate)}
          </div>
          <div className="text-sm text-gray-600">Per day</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Runway</span>
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.runway === Infinity ? 'Unlimited' : `${Math.floor(metrics.runway)} days`}
          </div>
          <div className="text-sm text-gray-600">At current rate</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Transactions</span>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.transactionCount}
          </div>
          <div className="text-sm text-gray-600">This period</div>
        </div>
      </div>
    );
  };

  const renderRiskAnalysis = () => {
    if (!analytics?.riskIndicators) return null;

    const risks = [
      {
        name: 'Concentration Risk',
        value: analytics.riskIndicators.concentrationRisk,
        threshold: 50,
        description: 'Largest fund concentration',
        status: analytics.riskIndicators.concentrationRisk > 50 ? 'high' : analytics.riskIndicators.concentrationRisk > 30 ? 'medium' : 'low'
      },
      {
        name: 'Liquidity Risk',
        value: analytics.riskIndicators.liquidityRisk,
        threshold: 30,
        description: 'Monthly burn rate vs available balance',
        status: analytics.riskIndicators.liquidityRisk > 30 ? 'high' : analytics.riskIndicators.liquidityRisk > 15 ? 'medium' : 'low'
      },
      {
        name: 'Budget Variance',
        value: analytics.riskIndicators.budgetVariance,
        threshold: 20,
        description: 'Budget deviation percentage',
        status: analytics.riskIndicators.budgetVariance > 20 ? 'high' : analytics.riskIndicators.budgetVariance > 10 ? 'medium' : 'low'
      },
      {
        name: 'Proposal Backlog',
        value: analytics.riskIndicators.proposalBacklog,
        threshold: 10,
        description: 'Pending proposals',
        status: analytics.riskIndicators.proposalBacklog > 10 ? 'high' : analytics.riskIndicators.proposalBacklog > 5 ? 'medium' : 'low'
      }
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
        
        <div className="space-y-4">
          {risks.map((risk, index) => {
          const statusColor = risk.status === 'high' ? 'text-red-600 bg-red-50' :
                           risk.status === 'medium' ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50';
          
          return (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{risk.name}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    {risk.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${
                      risk.value > risk.threshold ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(risk.value, 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{risk.description}</span>
                  <span className={`font-medium ${
                    risk.value > risk.threshold ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {risk.value.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {risk.status === 'high' && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
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
        <h2 className="text-2xl font-bold text-gray-900">Financial Analytics</h2>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d' | '1y')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
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
          
          <button
            onClick={exportAnalyticsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {renderKeyMetrics()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {renderCashFlowChart()}
          {renderCategoryBreakdown()}
        </div>
        
        <div className="space-y-6">
          {renderFundPerformance()}
          {renderRiskAnalysis()}
        </div>
      </div>
    </div>
  );
};
