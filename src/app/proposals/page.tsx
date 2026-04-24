'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Eye,
  Settings,
  Bell,
  ChevronDown,
  Grid,
  List,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useProposals } from '@/hooks/useProposals';
import { Proposal } from '@/types/proposals';
import { ProposalHelpers } from '@/utils/proposalHelpers';
import { cn } from '@/lib/utils';

interface ProposalsPageProps {}

export default function ProposalsPage({}: ProposalsPageProps) {
  const { 
    proposals, 
    createProposal, 
    getProposal, 
    vote, 
    getVoteHistory,
    setFilters, 
    clearFilters, 
    setSortBy,
    refresh,
    stats 
  } = useProposals();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortByLocal] = useState<'newest' | 'oldest' | 'popular' | 'ending-soon'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [votingNotification, setVotingNotification] = useState<string | null>(null);

  // Categories
  const categories = [
    { id: 'all', name: 'All Categories', count: proposals.length },
    { id: 'governance', name: 'Governance', count: proposals.filter(p => p.category === 'governance').length },
    { id: 'technical', name: 'Technical', count: proposals.filter(p => p.category === 'technical').length },
    { id: 'financial', name: 'Financial', count: proposals.filter(p => p.category === 'financial').length },
    { id: 'community', name: 'Community', count: proposals.filter(p => p.category === 'community').length },
    { id: 'marketing', name: 'Marketing', count: proposals.filter(p => p.category === 'marketing').length },
    { id: 'security', name: 'Security', count: proposals.filter(p => p.category === 'security').length }
  ];

  // Status options
  const statusOptions = [
    { id: 'all', name: 'All Status', count: proposals.length },
    { id: 'draft', name: 'Draft', count: proposals.filter(p => p.status === 'draft').length },
    { id: 'discussion', name: 'Discussion', count: proposals.filter(p => p.status === 'discussion').length },
    { id: 'voting', name: 'Voting', count: proposals.filter(p => p.status === 'voting').length },
    { id: 'executed', name: 'Executed', count: proposals.filter(p => p.status === 'executed').length },
    { id: 'rejected', name: 'Rejected', count: proposals.filter(p => p.status === 'rejected').length },
    { id: 'expired', name: 'Expired', count: proposals.filter(p => p.status === 'expired').length }
  ];

  // Apply filters and sorting
  const filteredProposals = proposals
    .filter(proposal => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTitle = proposal.title.toLowerCase().includes(searchLower);
        const matchesDescription = proposal.description.toLowerCase().includes(searchLower);
        const matchesContent = proposal.content.toLowerCase().includes(searchLower);
        const matchesAuthor = proposal.author.name.toLowerCase().includes(searchLower);
        const matchesTags = proposal.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        return matchesTitle || matchesDescription || matchesContent || matchesAuthor || matchesTags;
      }
      
      // Category filter
      if (selectedCategory !== 'all' && proposal.category !== selectedCategory) {
        return false;
      }
      
      // Status filter
      if (selectedStatus !== 'all' && proposal.status !== selectedStatus) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'popular':
          return b.metrics.views - a.metrics.views;
        case 'ending-soon':
          return a.voting.deadline.getTime() - b.voting.deadline.getTime();
        default:
          return 0;
      }
    });

  // Handle proposal selection
  const handleProposalClick = async (proposal: Proposal) => {
    try {
      const fullProposal = await getProposal(proposal.id);
      setSelectedProposal(fullProposal || proposal);
    } catch (err) {
      console.error('Failed to load proposal:', err);
    }
  };

  // Handle voting
  const handleVote = async (proposal: Proposal, voteType: 'support' | 'oppose' | 'abstain') => {
    try {
      await vote(proposal.id, voteType);
      setVotingNotification(`You have voted to ${voteType} the proposal "${proposal.title}"`);
      
      // Clear notification after 5 seconds
      setTimeout(() => setVotingNotification(null), 5000);
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    clearFilters();
  };

  // Get status color
  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'discussion':
        return 'text-blue-600 bg-blue-100';
      case 'voting':
        return 'text-orange-600 bg-orange-100';
      case 'executed':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'expired':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status: Proposal['status']) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'discussion':
        return <MessageSquare className="w-4 h-4" />;
      case 'voting':
        return <AlertCircle className="w-4 h-4" />;
      case 'executed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <Clock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Proposal Card Component
  const ProposalCard = ({ proposal }: { proposal: Proposal }) => {
    const votingStatus = ProposalHelpers.getVotingStatus(proposal);
    const canVote = ProposalHelpers.canVote(proposal, '0x123...');
    const timeRemaining = ProposalHelpers.formatTimeRemaining(proposal.voting.deadline);

    return (
      <div 
        className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
        onClick={() => handleProposalClick(proposal)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              proposal.category === 'governance' && "bg-blue-500",
              proposal.category === 'technical' && "bg-purple-500",
              proposal.category === 'financial' && "bg-green-500",
              proposal.category === 'community' && "bg-yellow-500",
              proposal.category === 'marketing' && "bg-pink-500",
              proposal.category === 'security' && "bg-red-500"
            )} />
            <div>
              <h3 className="font-semibold text-lg">{proposal.title}</h3>
              <p className="text-sm text-muted-foreground">{proposal.author.name}</p>
            </div>
          </div>
          
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            getStatusColor(proposal.status)
          )}>
            {getStatusIcon(proposal.status)}
            <span className="ml-1 capitalize">{proposal.status}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {proposal.description}
        </p>

        {/* Tags */}
        {proposal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {proposal.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-muted rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Voting Status */}
        {proposal.status === 'voting' && (
          <div className="mb-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{timeRemaining}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {proposal.voting.total} votes
                </span>
                <span className={cn(
                  "text-sm font-medium",
                  votingStatus.status === 'passed' && "text-green-600",
                  votingStatus.status === 'rejected' && "text-red-600",
                  votingStatus.status === 'active' && "text-orange-600"
                )}>
                  {votingStatus.status === 'passed' && 'Will Pass'}
                  {votingStatus.status === 'rejected' && 'Will Fail'}
                  {votingStatus.status === 'active' && 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {canVote && (
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(proposal, 'support');
                }}
                className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
              >
                Support
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(proposal, 'oppose');
                }}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
              >
                Oppose
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(proposal, 'abstain');
                }}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                Abstain
              </button>
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('View details');
            }}
            className="p-2 hover:bg-accent rounded-lg"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-2">
            <Eye className="w-3 h-3" />
            <span>{proposal.metrics.views} views</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3 h-3" />
            <span>{proposal.metrics.comments} comments</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{ProposalHelpers.formatDate(proposal.createdAt, 'UTC')}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Proposals</h1>
          <p className="text-lg text-muted-foreground">
            Participate in DAO governance and shape the future
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Create Proposal
          </button>
          
          <button className="p-2 hover:bg-accent rounded-lg">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voting Notification */}
      {votingNotification && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{votingNotification}</span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-semibold">Total Proposals</span>
          </div>
          <div className="text-3xl font-bold">{stats?.totalScheduled || 0}</div>
        </div>

        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="font-semibold">Active Voting</span>
          </div>
          <div className="text-3xl font-bold">{stats?.pendingExecutions || 0}</div>
        </div>

        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="font-semibold">Success Rate</span>
          </div>
          <div className="text-3xl font-bold">{stats?.successRate?.toFixed(1) || 0}%</div>
        </div>

        <div className="p-6 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">24h Volume</span>
          </div>
          <div className="text-3xl font-bold">{stats?.totalVolume24h?.toLocaleString() || 0}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search proposals..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            className="pl-10 pr-8 py-2 border rounded-lg appearance-none bg-background"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            className="pl-10 pr-8 py-2 border rounded-lg appearance-none bg-background"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statusOptions.map(status => (
              <option key={status.id} value={status.id}>
                {status.name} ({status.count})
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="relative">
          <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            className="pl-10 pr-8 py-2 border rounded-lg appearance-none bg-background"
            value={sortBy}
            onChange={(e) => {
              setSortByLocal(e.target.value as any);
              setSortBy(e.target.value as any);
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
            <option value="ending-soon">Ending Soon</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="p-2 hover:bg-accent rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-accent rounded-lg"
          >
            <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Clear Filters */}
      {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
        <div className="flex items-center justify-between mb-6 p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">
            Active filters: {[
              searchTerm && `Search: "${searchTerm}"`,
              selectedCategory !== 'all' && `Category: ${selectedCategory}`,
              selectedStatus !== 'all' && `Status: ${selectedStatus}`
            ].filter(Boolean).join(', ')}
          </div>
          <button
            onClick={handleClearFilters}
            className="text-sm text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No proposals found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your search terms or filters'
              : 'Be the first to create a proposal!'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && selectedStatus === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Your First Proposal
            </button>
          )}
        </div>
      ) : (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredProposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex justify-center mt-8">
        <div className="inline-flex items-center gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded",
              viewMode === 'grid' ? "bg-background" : "hover:bg-accent"
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded",
              viewMode === 'list' ? "bg-background" : "hover:bg-accent"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create Proposal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Create New Proposal</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-accent rounded-lg"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <p className="text-muted-foreground mb-4">
                Proposal creation wizard would go here. This is a placeholder for the actual ProposalCreation component.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-accent"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">{selectedProposal.title}</h2>
              <button
                onClick={() => setSelectedProposal(null)}
                className="p-2 hover:bg-accent rounded-lg"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p>{selectedProposal.description}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Content</h3>
                  <div className="prose prose max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: selectedProposal.content.replace(/\n/g, '<br>') 
                    }} />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Voting Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium ml-2 capitalize">{selectedProposal.status}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium ml-2 capitalize">{selectedProposal.category}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Support:</span>
                      <span className="font-medium ml-2">{selectedProposal.voting.support}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Oppose:</span>
                      <span className="font-medium ml-2">{selectedProposal.voting.oppose}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Abstain:</span>
                      <span className="font-medium ml-2">{selectedProposal.voting.abstain}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className="font-medium ml-2">{selectedProposal.voting.deadline.toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Author:</span>
                      <span className="font-medium ml-2">{selectedProposal.author.name}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-accent"
                >
                  Close
                </button>
                {ProposalHelpers.canVote(selectedProposal, '0x123...') && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVote(selectedProposal, 'support')}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Support
                    </button>
                    <button
                      onClick={() => handleVote(selectedProposal, 'oppose')}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Oppose
                    </button>
                    <button
                      onClick={() => handleVote(selectedProposal, 'abstain')}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Abstain
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
