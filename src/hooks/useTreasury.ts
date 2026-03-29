import { useState, useEffect, useCallback } from 'react';
import { 
  TreasuryState,
  Treasury,
  Fund,
  Budget,
  SpendingProposal,
  FundTransfer,
  TreasuryTransaction,
  TreasuryReport,
  TreasurySettings,
  TreasuryPermission,
  TreasuryAuditLog,
  FinancialMetrics,
  TreasuryAnalytics,
  FundCategory,
  ProposalStatus,
  BudgetStatus,
  TransferStatus,
  TransactionStatus,
  TreasuryFilter
} from '../types/treasury';
import { TreasuryHelpers } from '../utils/treasuryHelpers';

interface UseTreasuryOptions {
  treasuryId?: string;
  onStateChange?: (state: TreasuryState) => void;
  onError?: (error: string) => void;
}

export const useTreasury = (options: UseTreasuryOptions = {}) => {
  const [state, setState] = useState<TreasuryState>({
    treasury: null,
    funds: [],
    budgets: [],
    proposals: [],
    transfers: [],
    transactions: [],
    reports: [],
    auditLogs: [],
    settings: null,
    permissions: [],
    metrics: null,
    isLoading: false,
    error: null
  });

  const [filter, setFilter] = useState<TreasuryFilter>({});

  useEffect(() => {
    if (options.onStateChange) {
      options.onStateChange(state);
    }
  }, [state, options.onStateChange]);

  useEffect(() => {
    if (options.onError && state.error) {
      options.onError(state.error);
    }
  }, [state.error, options.onError]);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const loadTreasury = useCallback(async (treasuryId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API calls - in production, these would be actual API requests
      const mockTreasury: Treasury = {
        id: treasuryId,
        name: 'DAO Treasury',
        description: 'Main treasury for DAO operations',
        totalBalance: 10000000,
        currency: 'USD',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date(),
        isActive: true
      };

      const mockFunds: Fund[] = [
        {
          id: 'fund-1',
          treasuryId,
          name: 'Development Fund',
          description: 'Fund for development initiatives',
          category: FundCategory.DEVELOPMENT,
          allocatedAmount: 3000000,
          spentAmount: 1200000,
          currency: 'USD',
          budgetPeriod: 'monthly' as any,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        },
        {
          id: 'fund-2',
          treasuryId,
          name: 'Marketing Fund',
          description: 'Fund for marketing campaigns',
          category: FundCategory.MARKETING,
          allocatedAmount: 2000000,
          spentAmount: 800000,
          currency: 'USD',
          budgetPeriod: 'monthly' as any,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        },
        {
          id: 'fund-3',
          treasuryId,
          name: 'Community Fund',
          description: 'Fund for community initiatives',
          category: FundCategory.COMMUNITY,
          allocatedAmount: 1500000,
          spentAmount: 600000,
          currency: 'USD',
          budgetPeriod: 'monthly' as any,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        }
      ];

      const mockBudgets: Budget[] = [
        {
          id: 'budget-1',
          fundId: 'fund-1',
          name: 'Q1 Development Budget',
          description: 'Development budget for Q1 2024',
          plannedAmount: 750000,
          actualAmount: 680000,
          currency: 'USD',
          period: 'quarterly' as any,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          status: BudgetStatus.ACTIVE,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        }
      ];

      const mockProposals: SpendingProposal[] = [
        {
          id: 'proposal-1',
          title: 'New Feature Development',
          description: 'Funding for new feature development team',
          proposer: '0x123...',
          proposerAddress: '0x1234567890123456789012345678901234567890',
          fundId: 'fund-1',
          requestedAmount: 150000,
          currency: 'USD',
          category: FundCategory.DEVELOPMENT,
          priority: 'medium' as any,
          status: ProposalStatus.VOTING,
          justification: 'Critical for platform growth',
          recipient: 'Dev Team',
          recipientAddress: '0x9876543210987654321098765432109876543210',
          votes: [
            {
              id: 'vote-1',
              proposalId: 'proposal-1',
              voter: '0xabc...',
              voterAddress: '0xabcdef1234567890123456789012345678901234',
              vote: 'for' as any,
              timestamp: new Date(),
              power: 1000
            }
          ],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date(),
          deadline: new Date('2024-02-15')
        }
      ];

      const mockTransactions: TreasuryTransaction[] = [
        {
          id: 'tx-1',
          treasuryId,
          fundId: 'fund-1',
          type: 'withdrawal' as any,
          amount: 50000,
          currency: 'USD',
          toAddress: '0x9876543210987654321098765432109876543210',
          description: 'Development team payment',
          transactionHash: '0xabcdef...',
          status: TransactionStatus.CONFIRMED,
          createdAt: new Date('2024-01-10'),
          confirmedAt: new Date('2024-01-10')
        }
      ];

      const metrics = TreasuryHelpers.generateFinancialMetrics(
        mockTreasury.totalBalance,
        mockFunds,
        mockTransactions,
        mockProposals
      );

      setState(prev => ({
        ...prev,
        treasury: mockTreasury,
        funds: mockFunds,
        budgets: mockBudgets,
        proposals: mockProposals,
        transactions: mockTransactions,
        metrics,
        isLoading: false
      }));

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load treasury');
      setLoading(false);
    }
  }, [setLoading, setError]);

  const createFund = useCallback(async (fundData: Omit<Fund, 'id' | 'createdAt' | 'updatedAt'>): Promise<Fund | null> => {
    setLoading(true);
    setError(null);

    try {
      const newFund: Fund = {
        ...fundData,
        id: `fund-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setState(prev => ({
        ...prev,
        funds: [...prev.funds, newFund]
      }));

      return newFund;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create fund');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const updateFund = useCallback(async (fundId: string, updates: Partial<Fund>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      setState(prev => ({
        ...prev,
        funds: prev.funds.map(fund =>
          fund.id === fundId
            ? { ...fund, ...updates, updatedAt: new Date() }
            : fund
        )
      }));

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update fund');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const deleteFund = useCallback(async (fundId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      setState(prev => ({
        ...prev,
        funds: prev.funds.filter(fund => fund.id !== fundId)
      }));

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete fund');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const createProposal = useCallback(async (proposalData: Omit<SpendingProposal, 'id' | 'votes' | 'createdAt' | 'updatedAt'>): Promise<SpendingProposal | null> => {
    setLoading(true);
    setError(null);

    try {
      const validation = TreasuryHelpers.validateProposalData(proposalData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return null;
      }

      const newProposal: SpendingProposal = {
        ...proposalData,
        id: `proposal-${Date.now()}`,
        votes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setState(prev => ({
        ...prev,
        proposals: [...prev.proposals, newProposal]
      }));

      return newProposal;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create proposal');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const updateProposal = useCallback(async (proposalId: string, updates: Partial<SpendingProposal>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      setState(prev => ({
        ...prev,
        proposals: prev.proposals.map(proposal =>
          proposal.id === proposalId
            ? { ...proposal, ...updates, updatedAt: new Date() }
            : proposal
        )
      }));

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update proposal');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const voteOnProposal = useCallback(async (proposalId: string, vote: 'for' | 'against' | 'abstain', voterAddress: string, power: number, reason?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const newVote = {
        id: `vote-${Date.now()}`,
        proposalId,
        voter: 'Current User',
        voterAddress,
        vote: vote as any,
        reason,
        timestamp: new Date(),
        power
      };

      setState(prev => ({
        ...prev,
        proposals: prev.proposals.map(proposal =>
          proposal.id === proposalId
            ? { 
                ...proposal, 
                votes: [...proposal.votes.filter(v => v.voterAddress !== voterAddress), newVote],
                updatedAt: new Date()
              }
            : proposal
        )
      }));

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to vote on proposal');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const createTransfer = useCallback(async (transferData: Omit<FundTransfer, 'id' | 'createdAt' | 'executedAt'>): Promise<FundTransfer | null> => {
    setLoading(true);
    setError(null);

    try {
      const fromFund = state.funds.find(f => f.id === transferData.fromFundId);
      if (!fromFund) {
        setError('Source fund not found');
        return null;
      }

      const validation = TreasuryHelpers.validateTransferAmount(transferData.amount, fromFund);
      if (!validation.isValid) {
        setError(validation.error);
        return null;
      }

      const newTransfer: FundTransfer = {
        ...transferData,
        id: `transfer-${Date.now()}`,
        createdAt: new Date()
      };

      setState(prev => ({
        ...prev,
        transfers: [...prev.transfers, newTransfer]
      }));

      return newTransfer;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create transfer');
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.funds, setLoading, setError]);

  const executeTransfer = useCallback(async (transferId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const transfer = state.transfers.find(t => t.id === transferId);
      if (!transfer) {
        setError('Transfer not found');
        return false;
      }

      const transaction: TreasuryTransaction = {
        id: `tx-${Date.now()}`,
        treasuryId: state.treasury?.id || '',
        fundId: transfer.fromFundId,
        transferId,
        type: 'transfer' as any,
        amount: transfer.amount,
        currency: transfer.currency,
        description: transfer.reason,
        status: TransactionStatus.CONFIRMED,
        createdAt: new Date(),
        confirmedAt: new Date()
      };

      setState(prev => ({
        ...prev,
        transfers: prev.transfers.map(t =>
          t.id === transferId
            ? { ...t, status: TransferStatus.EXECUTED, executedAt: new Date() }
            : t
        ),
        transactions: [...prev.transactions, transaction]
      }));

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to execute transfer');
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.transfers, state.treasury, setLoading, setError]);

  const generateReport = useCallback(async (reportData: Omit<TreasuryReport, 'id' | 'generatedAt' | 'data'>): Promise<TreasuryReport | null> => {
    setLoading(true);
    setError(null);

    try {
      const analytics = TreasuryHelpers.generateTreasuryAnalytics(state.funds, state.transactions, state.proposals);
      const budgetVariances = TreasuryHelpers.generateBudgetVariances(state.funds, state.budgets);
      const spendingTrends = TreasuryHelpers.generateSpendingTrends(state.transactions);

      const newReport: TreasuryReport = {
        ...reportData,
        id: `report-${Date.now()}`,
        generatedAt: new Date(),
        data: {
          summary: state.metrics || {
            totalTreasuryValue: 0,
            totalAllocatedFunds: 0,
            totalSpentAmount: 0,
            availableBalance: 0,
            monthlyBurnRate: 0,
            runwayMonths: 0,
            budgetUtilization: 0,
            activeProposals: 0,
            pendingTransfers: 0,
            lastUpdated: new Date()
          },
          fundPerformance: budgetVariances,
          spendingTrends,
          proposals: state.proposals,
          transactions: state.transactions
        }
      };

      setState(prev => ({
        ...prev,
        reports: [...prev.reports, newReport]
      }));

      return newReport;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate report');
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.funds, state.budgets, state.proposals, state.transactions, state.metrics, setLoading, setError]);

  const getFilteredProposals = useCallback(() => {
    let filtered = state.proposals;

    if (filter.category) {
      filtered = filtered.filter(p => p.category === filter.category);
    }

    if (filter.status) {
      filtered = filtered.filter(p => p.status === filter.status);
    }

    if (filter.dateRange) {
      filtered = filtered.filter(p => 
        p.createdAt >= filter.dateRange!.start && 
        p.createdAt <= filter.dateRange!.end
      );
    }

    if (filter.amountRange) {
      filtered = filtered.filter(p => 
        p.requestedAmount >= filter.amountRange!.min && 
        p.requestedAmount <= filter.amountRange!.max
      );
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.proposer.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.proposals, filter]);

  const getFilteredFunds = useCallback(() => {
    let filtered = state.funds;

    if (filter.category) {
      filtered = filtered.filter(f => f.category === filter.category);
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(search) ||
        f.description?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.funds, filter]);

  const getFilteredTransactions = useCallback(() => {
    let filtered = state.transactions;

    if (filter.dateRange) {
      filtered = filtered.filter(t => 
        t.createdAt >= filter.dateRange!.start && 
        t.createdAt <= filter.dateRange!.end
      );
    }

    if (filter.amountRange) {
      filtered = filtered.filter(t => 
        t.amount >= filter.amountRange!.min && 
        t.amount <= filter.amountRange!.max
      );
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(search) ||
        t.fromAddress?.toLowerCase().includes(search) ||
        t.toAddress?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [state.transactions, filter]);

  const getTreasuryAnalytics = useCallback((): TreasuryAnalytics | null => {
    if (!state.funds.length || !state.transactions.length || !state.proposals.length) {
      return null;
    }

    return TreasuryHelpers.generateTreasuryAnalytics(state.funds, state.transactions, state.proposals);
  }, [state.funds, state.transactions, state.proposals]);

  const refreshMetrics = useCallback(() => {
    if (state.treasury && state.funds.length > 0) {
      const metrics = TreasuryHelpers.generateFinancialMetrics(
        state.treasury.totalBalance,
        state.funds,
        state.transactions,
        state.proposals
      );

      setState(prev => ({ ...prev, metrics }));
    }
  }, [state.treasury, state.funds, state.transactions, state.proposals]);

  useEffect(() => {
    refreshMetrics();
  }, [state.funds, state.transactions, state.proposals]);

  if (options.treasuryId && !state.treasury) {
    loadTreasury(options.treasuryId);
  }

  return {
    state,
    filter,
    setFilter,
    loadTreasury,
    createFund,
    updateFund,
    deleteFund,
    createProposal,
    updateProposal,
    voteOnProposal,
    createTransfer,
    executeTransfer,
    generateReport,
    getFilteredProposals,
    getFilteredFunds,
    getFilteredTransactions,
    getTreasuryAnalytics,
    refreshMetrics,
    setError,
    setLoading
  };
};
