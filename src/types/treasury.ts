export interface Treasury {
  id: string;
  name: string;
  description?: string;
  totalBalance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface Fund {
  id: string;
  treasuryId: string;
  name: string;
  description?: string;
  category: FundCategory;
  allocatedAmount: number;
  spentAmount: number;
  currency: string;
  budgetPeriod: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export enum FundCategory {
  OPERATIONAL = 'operational',
  DEVELOPMENT = 'development',
  MARKETING = 'marketing',
  COMMUNITY = 'community',
  RESEARCH = 'research',
  EMERGENCY = 'emergency',
  RESERVES = 'reserves',
  INCENTIVES = 'incentives',
  LEGAL = 'legal',
  OTHER = 'other'
}

export enum BudgetPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

export interface Budget {
  id: string;
  fundId: string;
  name: string;
  description?: string;
  plannedAmount: number;
  actualAmount: number;
  currency: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  status: BudgetStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export enum BudgetStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export interface SpendingProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  proposerAddress: string;
  fundId: string;
  requestedAmount: number;
  currency: string;
  category: FundCategory;
  priority: ProposalPriority;
  status: ProposalStatus;
  justification?: string;
  recipient?: string;
  recipientAddress?: string;
  executionDate?: Date;
  votes: ProposalVote[];
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  metadata?: Record<string, any>;
}

export enum ProposalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ProposalStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  VOTING = 'voting',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled'
}

export interface ProposalVote {
  id: string;
  proposalId: string;
  voter: string;
  voterAddress: string;
  vote: VoteType;
  reason?: string;
  timestamp: Date;
  power: number;
}

export enum VoteType {
  FOR = 'for',
  AGAINST = 'against',
  ABSTAIN = 'abstain'
}

export interface FundTransfer {
  id: string;
  fromFundId: string;
  toFundId: string;
  amount: number;
  currency: string;
  reason: string;
  initiatedBy: string;
  initiatedByAddress: string;
  status: TransferStatus;
  approvedBy?: string;
  approvedByAddress?: string;
  transactionHash?: string;
  createdAt: Date;
  executedAt?: Date;
  metadata?: Record<string, any>;
}

export enum TransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXECUTED = 'executed',
  FAILED = 'failed'
}

export interface TreasuryTransaction {
  id: string;
  treasuryId: string;
  fundId?: string;
  proposalId?: string;
  transferId?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  fromAddress?: string;
  toAddress?: string;
  description?: string;
  transactionHash?: string;
  status: TransactionStatus;
  createdAt: Date;
  confirmedAt?: Date;
  metadata?: Record<string, any>;
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PROPOSAL_PAYOUT = 'proposal_payout',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment'
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface FinancialMetrics {
  totalTreasuryValue: number;
  totalAllocatedFunds: number;
  totalSpentAmount: number;
  availableBalance: number;
  monthlyBurnRate: number;
  runwayMonths: number;
  budgetUtilization: number;
  activeProposals: number;
  pendingTransfers: number;
  lastUpdated: Date;
}

export interface BudgetVariance {
  fundId: string;
  fundName: string;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
}

export interface SpendingTrend {
  period: string;
  amount: number;
  category: FundCategory;
  transactionCount: number;
  averageTransactionSize: number;
}

export interface TreasuryReport {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
  generatedBy: string;
  data: {
    summary: FinancialMetrics;
    fundPerformance: BudgetVariance[];
    spendingTrends: SpendingTrend[];
    proposals: SpendingProposal[];
    transactions: TreasuryTransaction[];
  };
  fileUrl?: string;
  isPublic: boolean;
}

export enum ReportType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
  AUDIT = 'audit'
}

export enum ReportPeriod {
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom'
}

export interface TreasurySettings {
  id: string;
  treasuryId: string;
  requireMultiSig: boolean;
  requiredSignatures: number;
  allowedTokens: string[];
  spendingLimits: {
    [category: string]: number;
  };
  proposalThreshold: number;
  votingPeriod: number;
  executionDelay: number;
  autoApproveLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TreasuryPermission {
  userId: string;
  treasuryId: string;
  role: TreasuryRole;
  permissions: Permission[];
  grantedAt: Date;
  grantedBy: string;
  isActive: boolean;
}

export enum TreasuryRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  VIEWER = 'viewer',
  PROPOSER = 'proposer',
  APPROVER = 'approver'
}

export enum Permission {
  VIEW_TREASURY = 'view_treasury',
  MANAGE_FUNDS = 'manage_funds',
  CREATE_PROPOSALS = 'create_proposals',
  APPROVE_PROPOSALS = 'approve_proposals',
  EXECUTE_TRANSFERS = 'execute_transfers',
  VIEW_REPORTS = 'view_reports',
  GENERATE_REPORTS = 'generate_reports',
  MANAGE_SETTINGS = 'manage_settings',
  AUDIT_ACCESS = 'audit_access'
}

export interface TreasuryAuditLog {
  id: string;
  treasuryId: string;
  userId: string;
  userAddress: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export enum AuditAction {
  TREASURY_CREATED = 'treasury_created',
  TREASURY_UPDATED = 'treasury_updated',
  FUND_CREATED = 'fund_created',
  FUND_UPDATED = 'fund_updated',
  FUND_DELETED = 'fund_deleted',
  PROPOSAL_CREATED = 'proposal_created',
  PROPOSAL_UPDATED = 'proposal_updated',
  PROPOSAL_SUBMITTED = 'proposal_submitted',
  PROPOSAL_APPROVED = 'proposal_approved',
  PROPOSAL_REJECTED = 'proposal_rejected',
  PROPOSAL_EXECUTED = 'proposal_executed',
  TRANSFER_INITIATED = 'transfer_initiated',
  TRANSFER_APPROVED = 'transfer_approved',
  TRANSFER_EXECUTED = 'transfer_executed',
  SETTINGS_UPDATED = 'settings_updated',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_REVOKED = 'permission_revoked',
  REPORT_GENERATED = 'report_generated',
  AUDIT_EXPORTED = 'audit_exported'
}

export interface TreasuryState {
  treasury: Treasury | null;
  funds: Fund[];
  budgets: Budget[];
  proposals: SpendingProposal[];
  transfers: FundTransfer[];
  transactions: TreasuryTransaction[];
  reports: TreasuryReport[];
  auditLogs: TreasuryAuditLog[];
  settings: TreasurySettings | null;
  permissions: TreasuryPermission[];
  metrics: FinancialMetrics | null;
  isLoading: boolean;
  error: string | null;
}

export interface TreasuryFilter {
  category?: FundCategory;
  status?: ProposalStatus | BudgetStatus | TransferStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  search?: string;
}

export interface TreasuryAnalytics {
  cashFlow: {
    inflows: number;
    outflows: number;
    netFlow: number;
    trend: Array<{
      date: string;
      inflow: number;
      outflow: number;
      net: number;
    }>;
  };
  fundPerformance: {
    [fundId: string]: {
      utilization: number;
      efficiency: number;
      variance: number;
    };
  };
  proposalMetrics: {
    totalProposals: number;
    approvalRate: number;
    averageProcessingTime: number;
    topCategories: Array<{
      category: FundCategory;
      count: number;
      amount: number;
    }>;
  };
  riskIndicators: {
    concentrationRisk: number;
    liquidityRisk: number;
    budgetVariance: number;
    proposalBacklog: number;
  };
}
