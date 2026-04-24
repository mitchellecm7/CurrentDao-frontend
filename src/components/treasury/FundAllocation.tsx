import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  DollarSign, 
  PieChart, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  X,
  Calendar,
  Target
} from 'lucide-react';
import { useTreasury } from '../../hooks/useTreasury';
import { TreasuryHelpers } from '../../utils/treasuryHelpers';
import { Fund, FundCategory, BudgetPeriod } from '../../types/treasury';

interface FundAllocationProps {
  treasuryId: string;
}

export const FundAllocation: React.FC<FundAllocationProps> = ({ treasuryId }) => {
  const { 
    state, 
    createFund, 
    updateFund, 
    deleteFund, 
    getFilteredFunds 
  } = useTreasury({ treasuryId });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: FundCategory.OTHER,
    allocatedAmount: 0,
    currency: 'USD',
    budgetPeriod: BudgetPeriod.MONTHLY,
    startDate: new Date(),
    endDate: new Date()
  });

  const funds = getFilteredFunds();
  const totalAllocated = funds.reduce((sum, fund) => sum + fund.allocatedAmount, 0);
  const totalSpent = funds.reduce((sum, fund) => sum + fund.spentAmount, 0);

  const handleCreateFund = async () => {
    if (!formData.name || formData.allocatedAmount <= 0) return;

    const success = await createFund({
      ...formData,
      treasuryId,
      spentAmount: 0,
      isActive: true
    });

    if (success) {
      setShowCreateForm(false);
      resetForm();
    }
  };

  const handleUpdateFund = async () => {
    if (!editingFund || !formData.name || formData.allocatedAmount <= 0) return;

    const success = await updateFund(editingFund.id, {
      ...formData,
      spentAmount: editingFund.spentAmount
    });

    if (success) {
      setEditingFund(null);
      resetForm();
    }
  };

  const handleDeleteFund = async (fundId: string) => {
    if (confirm('Are you sure you want to delete this fund? This action cannot be undone.')) {
      await deleteFund(fundId);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: FundCategory.OTHER,
      allocatedAmount: 0,
      currency: 'USD',
      budgetPeriod: BudgetPeriod.MONTHLY,
      startDate: new Date(),
      endDate: new Date()
    });
  };

  const startEdit = (fund: Fund) => {
    setEditingFund(fund);
    setFormData({
      name: fund.name,
      description: fund.description || '',
      category: fund.category,
      allocatedAmount: fund.allocatedAmount,
      currency: fund.currency,
      budgetPeriod: fund.budgetPeriod,
      startDate: fund.startDate,
      endDate: fund.endDate
    });
  };

  const cancelEdit = () => {
    setEditingFund(null);
    resetForm();
  };

  const renderFundCard = (fund: Fund) => {
    const utilization = TreasuryHelpers.calculateFundUtilization(fund);
    const status = TreasuryHelpers.getFundStatus(fund);
    const remaining = fund.allocatedAmount - fund.spentAmount;
    const daysRemaining = Math.ceil((fund.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    const statusColors = {
      healthy: 'text-green-600 bg-green-50',
      warning: 'text-yellow-600 bg-yellow-50',
      critical: 'text-orange-600 bg-orange-50',
      overBudget: 'text-red-600 bg-red-50'
    };

    return (
      <div key={fund.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">{fund.name}</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            
            {fund.description && (
              <p className="text-sm text-gray-600 mt-1">{fund.description}</p>
            )}
            
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${TreasuryHelpers.getCategoryColor(fund.category)}`}>
                {TreasuryHelpers.getCategoryDisplayName(fund.category)}
              </div>
              <span>{TreasuryHelpers.getPeriodDisplayName(fund.budgetPeriod)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => startEdit(fund)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteFund(fund.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Allocated</p>
              <p className="text-lg font-semibold text-gray-900">
                {TreasuryHelpers.formatCurrency(fund.allocatedAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Spent</p>
              <p className="text-lg font-semibold text-gray-900">
                {TreasuryHelpers.formatCurrency(fund.spentAmount)}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Utilization</span>
              <span className="font-medium text-gray-900">{utilization.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  status === 'overBudget' ? 'bg-red-500' :
                  status === 'critical' ? 'bg-orange-500' :
                  status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Remaining</span>
            <span className={`font-medium ${
              remaining < 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {TreasuryHelpers.formatCurrency(remaining)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Period</span>
            <span>{fund.startDate.toLocaleDateString()} - {fund.endDate.toLocaleDateString()}</span>
          </div>

          {daysRemaining > 0 && daysRemaining <= 30 && (
            <div className="flex items-center space-x-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              <AlertTriangle className="h-4 w-4" />
              <span>{daysRemaining} days remaining in period</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFundForm = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editingFund ? 'Edit Fund' : 'Create New Fund'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fund Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter fund name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the fund's purpose"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as FundCategory })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(FundCategory).map(category => (
                <option key={category} value={category}>
                  {TreasuryHelpers.getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Period *
            </label>
            <select
              value={formData.budgetPeriod}
              onChange={(e) => setFormData({ ...formData, budgetPeriod: e.target.value as BudgetPeriod })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(BudgetPeriod).map(period => (
                <option key={period} value={period}>
                  {TreasuryHelpers.getPeriodDisplayName(period)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Allocated Amount *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={formData.allocatedAmount}
              onChange={(e) => setFormData({ ...formData, allocatedAmount: parseFloat(e.target.value) || 0 })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate.toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              value={formData.endDate.toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 mt-6">
        <button
          onClick={() => {
            setShowCreateForm(false);
            setEditingFund(null);
            resetForm();
          }}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={editingFund ? handleUpdateFund : handleCreateFund}
          disabled={!formData.name || formData.allocatedAmount <= 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {editingFund ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Fund
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Fund
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderAllocationSummary = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Allocation Summary</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Allocated</span>
          <span className="text-lg font-semibold text-gray-900">
            {TreasuryHelpers.formatCurrency(totalAllocated)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Spent</span>
          <span className="text-lg font-semibold text-gray-900">
            {TreasuryHelpers.formatCurrency(totalSpent)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Remaining Balance</span>
          <span className="text-lg font-semibold text-green-600">
            {TreasuryHelpers.formatCurrency(totalAllocated - totalSpent)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Utilization Rate</span>
          <span className="text-lg font-semibold text-blue-600">
            {totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Active Funds</span>
          <span className="font-medium text-gray-900">{funds.length}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Fund Allocation</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Fund
        </button>
      </div>

      {(showCreateForm || editingFund) && renderFundForm()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {funds.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Funds Created</h3>
                <p className="text-gray-600 mb-6">
                  Create your first fund to start allocating treasury resources.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Fund
                </button>
              </div>
            ) : (
              funds.map(renderFundCard)
            )}
          </div>
        </div>

        <div className="space-y-6">
          {renderAllocationSummary()}
        </div>
      </div>
    </div>
  );
};
