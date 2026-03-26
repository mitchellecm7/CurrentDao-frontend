'use client';

import { useState, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  Clock,
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  Share2,
  Bell,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';
import { useProposals } from '@/hooks/useProposals';
import { Proposal } from '@/types/proposals';
import { ProposalHelpers } from '@/utils/proposalHelpers';
import { cn } from '@/lib/utils';

interface VotingInterfaceProps {
  proposal: Proposal;
  className?: string;
  compact?: boolean;
  onVote?: (voteType: 'support' | 'oppose' | 'abstain') => void;
  showResults?: boolean;
}

interface VoteOption {
  type: 'support' | 'oppose' | 'abstain';
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  hoverColor: string;
  description: string;
}

export function VotingInterface({ 
  proposal, 
  className, 
  compact = false, 
  onVote,
  showResults = false 
}: VotingInterfaceProps) {
  const { vote, getVoteHistory, votingPower } = useProposals();
  const [selectedVote, setSelectedVote] = useState<'support' | 'oppose' | 'abstain' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteHistory, setVoteHistory] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [userVotingPower, setUserVotingPower] = useState(0);

  const voteOptions: VoteOption[] = [
    {
      type: 'support',
      label: 'Support',
      icon: <ThumbsUp className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      hoverColor: 'hover:bg-green-100',
      description: 'Vote in favor of this proposal'
    },
    {
      type: 'oppose',
      label: 'Oppose',
      icon: <ThumbsDown className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200',
      hoverColor: 'hover:bg-red-100',
      description: 'Vote against this proposal'
    },
    {
      type: 'abstain',
      label: 'Abstain',
      icon: <Minus className="w-5 h-5" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 border-gray-200',
      hoverColor: 'hover:bg-gray-100',
      description: 'Abstain from voting on this proposal'
    }
  ];

  // Load vote history
  useEffect(() => {
    const loadVoteHistory = async () => {
      try {
        const history = await getVoteHistory(proposal.id);
        setVoteHistory(history);
        
        // Check if user has already voted
        const userVote = history.find(vote => vote.voter === '0x123...');
        if (userVote) {
          setSelectedVote(userVote.vote);
        }
      } catch (err) {
        console.error('Failed to load vote history:', err);
      }
    };

    loadVoteHistory();
  }, [proposal.id, getVoteHistory]);

  // Load user voting power
  useEffect(() => {
    if (votingPower) {
      setUserVotingPower(votingPower.votingPower);
    }
  }, [votingPower]);

  // Handle vote
  const handleVote = async (voteType: 'support' | 'oppose' | 'abstain') => {
    if (!ProposalHelpers.canVote(proposal, '0x123...')) {
      return;
    }

    setIsVoting(true);
    
    try {
      await vote(proposal.id, voteType);
      setSelectedVote(voteType);
      onVote?.(voteType);
    } catch (err) {
      console.error('Failed to vote:', err);
    } finally {
      setIsVoting(false);
    }
  };

  // Calculate voting statistics
  const totalVotes = proposal.voting.total;
  const supportPercentage = totalVotes > 0 ? (proposal.voting.support / totalVotes) * 100 : 0;
  const opposePercentage = totalVotes > 0 ? (proposal.voting.oppose / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (proposal.voting.abstain / totalVotes) * 100 : 0;
  const quorumMet = votingPower ? ProposalHelpers.calculateQuorum(proposal, votingPower) : false;
  const approvalRate = ProposalHelpers.calculateApproval(proposal);
  const timeRemaining = ProposalHelpers.formatTimeRemaining(proposal.voting.deadline);
  const votingStatus = ProposalHelpers.getVotingStatus(proposal);

  // Compact view
  if (compact) {
    return (
      <div className={cn("p-4 bg-card border rounded-lg", className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{timeRemaining}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{totalVotes} votes</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {voteOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => handleVote(option.type)}
              disabled={isVoting || selectedVote !== null}
              className={cn(
                "p-3 border rounded-lg transition-all",
                option.bgColor,
                selectedVote === option.type 
                  ? "ring-2 ring-offset-2 ring-primary" 
                  : option.hoverColor,
                (isVoting || selectedVote !== null) && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={cn("text-2xl", option.color)}>
                  {option.icon}
                </div>
                <span className="text-sm font-medium">{option.label}</span>
                <div className="text-xs text-muted-foreground">
                  {option.type === 'support' && `${supportPercentage.toFixed(1)}%`}
                  {option.type === 'oppose' && `${opposePercentage.toFixed(1)}%`}
                  {option.type === 'abstain' && `${abstainPercentage.toFixed(1)}%`}
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedVote && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">
              You have voted to {selectedVote}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className={cn("bg-card border rounded-lg p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Voting</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{timeRemaining}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{totalVotes} votes</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              <span>{approvalRate.toFixed(1)}% approval</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voting Status */}
      <div className={cn(
        "p-4 rounded-lg mb-6",
        votingStatus.status === 'passed' && "bg-green-50 border-green-200",
        votingStatus.status === 'rejected' && "bg-red-50 border-red-200",
        votingStatus.status === 'active' && "bg-blue-50 border-blue-200",
        votingStatus.status === 'expired' && "bg-gray-50 border-gray-200"
      )}>
        <div className="flex items-center gap-3">
          {votingStatus.status === 'passed' && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          {votingStatus.status === 'rejected' && (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          {votingStatus.status === 'active' && (
            <AlertCircle className="w-5 h-5 text-blue-600" />
          )}
          {votingStatus.status === 'expired' && (
            <Clock className="w-5 h-5 text-gray-600" />
          )}
          
          <div>
            <p className="font-medium">{votingStatus.message}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Quorum: {quorumMet ? 'Met' : 'Not Met'} • 
              Required: {proposal.voting.quorum}
            </p>
          </div>
        </div>
      </div>

      {/* Current Vote */}
      {ProposalHelpers.canVote(proposal, '0x123...') && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4">Cast Your Vote</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {voteOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleVote(option.type)}
                disabled={isVoting}
                className={cn(
                  "p-6 border-2 rounded-xl transition-all",
                  option.bgColor,
                  selectedVote === option.type 
                    ? "ring-2 ring-offset-2 ring-primary scale-105" 
                    : option.hoverColor,
                  isVoting && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={cn("text-3xl", option.color)}>
                    {option.icon}
                  </div>
                  <span className="text-lg font-semibold">{option.label}</span>
                  <p className="text-sm text-muted-foreground text-center">
                    {option.description}
                  </p>
                  
                  {showResults && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-2xl font-bold">
                        {option.type === 'support' && proposal.voting.support}
                        {option.type === 'oppose' && proposal.voting.oppose}
                        {option.type === 'abstain' && proposal.voting.abstain}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {option.type === 'support' && `${supportPercentage.toFixed(1)}%`}
                        {option.type === 'oppose' && `${opposePercentage.toFixed(1)}%`}
                        {option.type === 'abstain' && `${abstainPercentage.toFixed(1)}%`}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {isVoting && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing vote...</span>
              </div>
            </div>
          )}

          {selectedVote && !isVoting && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-medium text-green-800">
                Your vote has been recorded!
              </p>
              <p className="text-sm text-green-600 mt-1">
                You voted to <strong>{selectedVote}</strong> this proposal
              </p>
            </div>
          )}
        </div>
      )}

      {/* Voting Details */}
      {showDetails && (
        <div className="space-y-6">
          {/* Quorum Information */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Quorum Requirements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Required Quorum:</span>
                <span className="font-medium ml-2">{proposal.voting.quorum}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Current Participation:</span>
                <span className="font-medium ml-2">
                  {votingPower ? ((totalVotes / votingPower.totalSupply) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className={cn(
                  "font-medium ml-2",
                  quorumMet ? "text-green-600" : "text-orange-600"
                )}>
                  {quorumMet ? 'Met' : 'Not Met'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Votes Needed:</span>
                <span className="font-medium ml-2">
                  {votingPower ? Math.ceil(votingPower.totalSupply * 0.25) : '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Your Voting Power */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Your Voting Power
            </h4>
            <div className="text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Available Voting Power:</span>
                <span className="font-medium">{userVotingPower.toLocaleString()}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Your voting power is based on your token holdings and delegation status.
              </div>
            </div>
          </div>

          {/* Vote History */}
          {voteHistory.length > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Recent Votes
              </h4>
              <div className="space-y-2">
                {voteHistory.slice(0, 5).map((vote, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        vote.vote === 'support' && "bg-green-500",
                        vote.vote === 'oppose' && "bg-red-500",
                        vote.vote === 'abstain' && "bg-gray-500"
                      )} />
                      <span className="text-sm font-medium">
                        {vote.voter === '0x123...' ? 'You' : `${vote.voter.slice(0, 6)}...`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {vote.vote}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(vote.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => navigator.share({ 
            title: proposal.title, 
            text: `Check out this proposal: ${proposal.title}`,
            url: window.location.href 
          })}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        
        <button
          onClick={() => {
            const subscription = confirm('Subscribe to notifications for this proposal?');
            if (subscription) {
              console.log('Subscribed to notifications');
            }
          }}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
        >
          <Bell className="w-4 h-4" />
          Subscribe
        </button>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Secure Voting</p>
            <p>
              Your vote is cryptographically signed and recorded on the blockchain. 
              This ensures transparency and prevents tampering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VotingInterface;
