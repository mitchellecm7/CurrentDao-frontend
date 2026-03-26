'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PieChart,
  Activity,
  Filter,
  Calendar,
  Download,
  Share2,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Target,
  Zap,
  Shield,
  Award,
  Timer
} from 'lucide-react';
import { useProposals } from '@/hooks/useProposals';
import { Proposal } from '@/types/proposals';
import { ProposalHelpers } from '@/utils/proposalHelpers';
import { cn } from '@/lib/utils';

interface VotingResultsProps {
  proposal: Proposal;
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
  autoRefresh?: boolean;
}

interface VoteData {
  type: 'support' | 'oppose' | 'abstain';
  count: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
}

interface TimeSeriesData {
  timestamp: Date;
  support: number;
  oppose: number;
  abstain: number;
  total: number;
}

interface VoterSegment {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export function VotingResults({ 
  proposal, 
  className, 
  showDetails = true,
  compact = false,
  autoRefresh = false 
}: VotingResultsProps) {
  const { getVoteHistory, votingPower } = useProposals();
  const [voteHistory, setVoteHistory] = useState<any[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [viewMode, setViewMode] = useState<'overview' | 'breakdown' | 'timeline' | 'voters'>('overview');
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Calculate voting data
  const totalVotes = proposal.voting.total;
  const supportPercentage = totalVotes > 0 ? (proposal.voting.support / totalVotes) * 100 : 0;
  const opposePercentage = totalVotes > 0 ? (proposal.voting.oppose / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (proposal.voting.abstain / totalVotes) * 100 : 0;
  const approvalRate = ProposalHelpers.calculateApproval(proposal);
  const quorumMet = votingPower ? ProposalHelpers.calculateQuorum(proposal, votingPower) : false;
  const votingStatus = ProposalHelpers.getVotingStatus(proposal);

  const voteData: VoteData[] = [
    {
      type: 'support',
      count: proposal.voting.support,
      percentage: supportPercentage,
      color: 'text-green-600',
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      type: 'oppose',
      count: proposal.voting.oppose,
      percentage: opposePercentage,
      color: 'text-red-600',
      icon: <XCircle className="w-5 h-5" />
    },
    {
      type: 'abstain',
      count: proposal.voting.abstain,
      percentage: abstainPercentage,
      color: 'text-gray-600',
      icon: <AlertCircle className="w-5 h-5" />
    }
  ];

  // Load vote history
  useEffect(() => {
    const loadVoteHistory = async () => {
      try {
        const history = await getVoteHistory(proposal.id);
        setVoteHistory(history);
        
        // Generate time series data
        const timeData: TimeSeriesData[] = history.map(vote => ({
          timestamp: new Date(vote.timestamp),
          support: vote.vote === 'support' ? 1 : 0,
          oppose: vote.vote === 'oppose' ? 1 : 0,
          abstain: vote.vote === 'abstain' ? 1 : 0,
          total: 1
        }));
        
        setTimeSeriesData(timeData);
      } catch (err) {
        console.error('Failed to load vote history:', err);
      }
    };

    loadVoteHistory();
  }, [proposal.id, getVoteHistory]);

  // Generate time series data based on selected range
  const getFilteredTimeSeries = () => {
    const now = new Date();
    const ranges = {
      '1h': 60 * 60 * 1000, // 1 hour in ms
      '24h': 24 * 60 * 60 * 1000, // 24 hours in ms
      '7d': 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      '30d': 30 * 24 * 60 * 60 * 1000 // 30 days in ms
    };

    const cutoff = new Date(now.getTime() - ranges[selectedTimeRange]);
    return timeSeriesData.filter(data => data.timestamp >= cutoff);
  };

  // Calculate voter segments
  const voterSegments: VoterSegment[] = [
    {
      name: 'Token Holders',
      count: votingPower ? Math.floor(votingPower.tokenHolders * 0.3) : 0,
      percentage: 30,
      color: 'bg-blue-500'
    },
    {
      name: 'Delegates',
      count: votingPower ? Math.floor(votingPower.tokenHolders * 0.15) : 0,
      percentage: 15,
      color: 'bg-purple-500'
    },
    {
      name: 'Active Voters',
      count: totalVotes,
      percentage: votingPower ? (totalVotes / votingPower.tokenHolders) * 100 : 0,
      color: 'bg-green-500'
    },
    {
      name: 'Non-Voters',
      count: votingPower ? votingPower.tokenHolders - totalVotes : 0,
      percentage: votingPower ? ((votingPower.tokenHolders - totalVotes) / votingPower.tokenHolders) * 100 : 0,
      color: 'bg-gray-500'
    }
  ];

  // Export functions
  const exportResults = (format: 'json' | 'csv' | 'pdf') => {
    const data = {
      proposal: {
        id: proposal.id,
        title: proposal.title,
        description: proposal.description,
        category: proposal.category,
        status: proposal.status,
        voting: proposal.voting,
        createdAt: proposal.createdAt
      },
      results: {
        totalVotes,
        supportPercentage,
        opposePercentage,
        abstainPercentage,
        approvalRate,
        quorumMet,
        votingStatus
      },
      voteHistory,
      timestamp: new Date().toISOString()
    };

    switch (format) {
      case 'json':
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadFile(blob, `voting-results-${proposal.id}.json`);
        break;
      case 'csv':
        const csvContent = generateCSV(data);
        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        downloadFile(csvBlob, `voting-results-${proposal.id}.csv`);
        break;
      case 'pdf':
        // In a real implementation, use a PDF library
        console.log('PDF export not implemented');
        break;
    }
  };

  const generateCSV = (data: any) => {
    const headers = ['Timestamp', 'Voter', 'Vote Type', 'Voting Power'];
    const rows = data.voteHistory.map((vote: any) => [
      new Date(vote.timestamp).toISOString(),
      vote.voter,
      vote.vote,
      vote.votingPower
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Compact view
  if (compact) {
    return (
      <div className={cn("p-4 bg-card border rounded-lg", className)}>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {voteData.map((vote) => (
            <div key={vote.type} className="text-center">
              <div className={cn("text-2xl font-bold", vote.color)}>
                {vote.icon}
              </div>
              <div className="text-lg font-bold">{vote.count}</div>
              <div className="text-sm text-muted-foreground">{vote.percentage.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground capitalize">{vote.type}</div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className={cn(
            "font-medium",
            quorumMet ? "text-green-600" : "text-orange-600"
          )}>
            Quorum: {quorumMet ? 'Met' : 'Not Met'}
          </span>
          <span className="text-muted-foreground">
            {totalVotes} total votes
          </span>
        </div>
      </div>
    );
  }

  // Overview view
  const OverviewView = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Support</span>
          </div>
          <div className="text-3xl font-bold text-green-800">{proposal.voting.support}</div>
          <div className="text-sm text-green-600">{supportPercentage.toFixed(1)}%</div>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">Oppose</span>
          </div>
          <div className="text-3xl font-bold text-red-800">{proposal.voting.oppose}</div>
          <div className="text-sm text-red-600">{opposePercentage.toFixed(1)}%</div>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Abstain</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{proposal.voting.abstain}</div>
          <div className="text-sm text-gray-600">{abstainPercentage.toFixed(1)}%</div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">Total Votes</span>
          </div>
          <div className="text-3xl font-bold text-blue-800">{totalVotes}</div>
          <div className="text-sm text-blue-600">100%</div>
        </div>
      </div>

      {/* Approval Rate */}
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Approval Rate
        </h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-3xl font-bold">{approvalRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">
              {approvalRate >= 50 ? 'Proposal will pass' : 'Proposal will fail'}
            </div>
          </div>
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            approvalRate >= 50 ? "bg-green-100" : "bg-red-100"
          )}>
            {approvalRate >= 50 ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
        </div>
      </div>

      {/* Quorum Status */}
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Quorum Status
        </h4>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-medium">
              Required: {proposal.voting.quorum}
            </div>
            <div className="text-sm text-muted-foreground">
              Current: {votingPower ? ((totalVotes / votingPower.totalSupply) * 100).toFixed(1) : '0'}%
            </div>
          </div>
          <div className={cn(
            "px-4 py-2 rounded-lg font-medium",
            quorumMet ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
          )}>
            {quorumMet ? 'Quorum Met' : 'Quorum Not Met'}
          </div>
        </div>
      </div>
    </div>
  );

  // Breakdown view
  const BreakdownView = () => (
    <div className="space-y-6">
      {/* Pie Chart */}
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-4">Vote Distribution</h4>
        <div className="relative h-64">
          {/* Simple pie chart visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Support slice */}
              <div
                className="absolute inset-0 bg-green-500 rounded-full"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 360 * supportPercentage / 100}% 0%)`
                }}
              />
              {/* Oppose slice */}
              <div
                className="absolute inset-0 bg-red-500 rounded-full"
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 360 * supportPercentage / 100}% 0%, ${50 + 360 * (supportPercentage + opposePercentage) / 100}% 0%)`
                }}
              />
              {/* Abstain slice */}
              <div
                className="absolute inset-0 bg-gray-500 rounded-full"
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 360 * (supportPercentage + opposePercentage) / 100}% 0%, ${50 + 360 * (supportPercentage + opposePercentage + abstainPercentage) / 100}% 0%)`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {voteData.map((vote) => (
          <div key={vote.type} className="flex items-center gap-2">
            <div className={cn("w-4 h-4 rounded", vote.color.replace('text', 'bg'))} />
            <div>
              <div className="font-medium capitalize">{vote.type}</div>
              <div className="text-sm text-muted-foreground">
                {vote.count} votes ({vote.percentage.toFixed(1)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

      {/* Voter Segments */}
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-4">Voter Segments</h4>
        <div className="space-y-3">
          {voterSegments.map((segment) => (
            <div key={segment.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded", segment.color)} />
                <span className="font-medium">{segment.name}</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{segment.count.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">{segment.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Timeline view
  const TimelineView = () => (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Voting Timeline
        </h4>
        <div className="flex gap-2">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={cn(
                "px-3 py-1 border rounded-lg text-sm",
                selectedTimeRange === range ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="h-64 flex items-end justify-between gap-2">
          {getFilteredTimeSeries().map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="text-xs text-muted-foreground mb-1">
                {data.timestamp.toLocaleTimeString()}
              </div>
              <div className="flex-1 h-40 bg-muted rounded relative">
                <div className="absolute bottom-0 left-0 right-0 flex">
                  <div
                    className="flex-1 bg-green-500"
                    style={{ height: `${(data.support / 1) * 100}%` }}
                  />
                  <div
                    className="flex-1 bg-red-500"
                    style={{ height: `${(data.oppose / 1) * 100}%` }}
                  />
                  <div
                    className="flex-1 bg-gray-500"
                    style={{ height: `${(data.abstain / 1) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Voters view
  const VotersView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Users className="w-4 h-4" />
          Voter Details
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => exportResults('json')}
            className="flex items-center gap-2 px-3 py-1 border rounded-lg text-sm hover:bg-accent"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={() => exportResults('csv')}
            className="flex items-center gap-2 px-3 py-1 border rounded-lg text-sm hover:bg-accent"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Voter List */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="space-y-3">
          {voteHistory.slice(0, 10).map((vote, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-background rounded">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">
                    {vote.voter === '0x123...' ? 'You' : `${vote.voter.slice(0, 6)}...`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {vote.votingPower} voting power
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  vote.vote === 'support' && "bg-green-100 text-green-700",
                  vote.vote === 'oppose' && "bg-red-100 text-red-700",
                  vote.vote === 'abstain' && "bg-gray-100 text-gray-700"
                )}>
                  {vote.vote.toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(vote.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {voteHistory.length > 10 && (
          <div className="text-center mt-4">
            <button className="text-primary hover:underline">
              Show all {voteHistory.length} voters
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("bg-card border rounded-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Voting Results</h3>
          <span className="text-sm text-muted-foreground">
            {totalVotes} total votes
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-accent"
            >
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className={cn("w-4 h-4 transition-transform", showExportOptions && "rotate-180")} />
            </button>

            {showExportOptions && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-background border rounded-lg shadow-lg z-10">
                <button
                  onClick={() => exportResults('json')}
                  className="w-full px-4 py-2 text-left hover:bg-accent"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => exportResults('csv')}
                  className="w-full px-4 py-2 text-left hover:bg-accent"
                >
                  Export as CSV
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-accent rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={cn(
        "p-4 mb-6",
        votingStatus.status === 'passed' && "bg-green-50 border-green-200",
        votingStatus.status === 'rejected' && "bg-red-50 border-red-200",
        votingStatus.status === 'active' && "bg-blue-50 border-blue-200",
        votingStatus.status === 'expired' && "bg-gray-50 border-gray-200"
      )}>
        <div className="flex items-center gap-3">
          {votingStatus.status === 'passed' && (
            <CheckCircle className="w-6 h-6 text-green-600" />
          )}
          {votingStatus.status === 'rejected' && (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
          {votingStatus.status === 'active' && (
            <AlertCircle className="w-6 h-6 text-blue-600" />
          )}
          {votingStatus.status === 'expired' && (
            <Clock className="w-6 h-6 text-gray-600" />
          )}
          
          <div>
            <p className="text-lg font-semibold">{votingStatus.message}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Voting ended on {proposal.voting.deadline.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      {showDetails && (
        <div className="flex items-center justify-center gap-2 mb-6 border-b pb-4">
          {(['overview', 'breakdown', 'timeline', 'voters'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                viewMode === mode 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent"
              )}
            >
              {mode === 'overview' && <BarChart3 className="w-4 h-4 inline mr-2" />}
              {mode === 'breakdown' && <PieChart className="w-4 h-4 inline mr-2" />}
              {mode === 'timeline' && <Activity className="w-4 h-4 inline mr-2" />}
              {mode === 'voters' && <Users className="w-4 h-4 inline mr-2" />}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {viewMode === 'overview' && <OverviewView />}
        {viewMode === 'breakdown' && <BreakdownView />}
        {viewMode === 'timeline' && <TimelineView />}
        {viewMode === 'voters' && <VotersView />}
      </div>
    </div>
  );
}

export default VotingResults;
