import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  DollarSign, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  X, 
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Eye,
  Filter,
  Search,
  FileText,
  Send
} from 'lucide-react';
import { useTreasury } from '../../hooks/useTreasury';
import { TreasuryHelpers } from '../../utils/treasuryHelpers';
import { SpendingProposal, ProposalStatus, ProposalPriority, FundCategory, VoteType } from '../../types/treasury';

interface SpendingProposalsProps {
  treasuryId: string;
}

export const SpendingProposals: React.FC<SpendingProposalsProps> = ({ treasuryId }) => {
  const { 
    state, 
    createProposal, 
    updateProposal, 
    voteOnProposal, 
    getFilteredProposals,
    getFilteredFunds 
  } = useTreasury({ treasuryId });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<SpendingProposal | null>(null);
  const [votingProposal, setVotingProposal] = useState<SpendingProposal | null>(null);
  const [selectedVote, setSelectedVote] = useState<'for' | 'against' | 'abstain'>('for');
  const [voteReason, setVoteReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProposalStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const proposals = getFilteredProposals();
  const funds = getFilteredFunds();

  const filteredProposals = proposals.filter(proposal => {
    if (filterStatus !== 'all' && proposal.status !== filterStatus) return false;
    if (searchTerm && !proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !proposal.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const formData = {
    title: '',
    description: '',
    fundId: '',
    requestedAmount: 0,
    currency: 'USD',
    category: FundCategory.OTHER,
    priority: ProposalPriority.MEDIUM,
    justification: '',
    recipient: '',
    recipientAddress: '',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  };

  const handleCreateProposal = async () => {
    const proposalData = {
      ...formData,
      proposer: 'Current User',
      proposerAddress: '0x1234567890123456789012345678901234567890',
      status: ProposalStatus.DRAFT
    };

    const success = await createProposal(proposalData);
    if (success) {
      setShowCreateForm(false);
    }
  };

  const handleUpdateProposal = async () => {
    if (!editingProposal) return;

    const success = await updateProposal(editingProposal.id, {
      title: editingProposal.title,
      description: editingProposal.description,
      requestedAmount: editingProposal.requestedAmount,
      category: editingProposal.category,
      priority: editingProposal.priority,
      justification: editingProposal.justification,
      recipient: editingProposal.recipient,
      recipientAddress: editingProposal.recipientAddress,
      deadline: editingProposal.deadline
    });

    if (success) {
      setEditingProposal(null);
    }
  };

  const handleSubmitProposal = async (proposalId: string) => {
    const success = await updateProposal(proposalId, {
      status: ProposalStatus.SUBMITTED
    });

    if (success) {
      // Could show a success message or navigate
    }
  };

  const handleVote = async () => {
    if (!votingProposal) return;

    const success = await voteOnProposal(
      votingProposal.id,
      selectedVote,
      '0xabcdef1234567890123456789012345678901234',
      1000, // Voting power
      voteReason
    );

    if (success) {
      setVotingProposal(null);
      setSelectedVote('for');
      setVoteReason('');
    }
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      await updateProposal(proposalId, { status: ProposalStatus.CANCELLED });
    }
  };

  const startEdit = (proposal: SpendingProposal) => {
    setEditingProposal(proposal);
  };

  const startVoting = (proposal: SpendingProposal) => {
    setVotingProposal(proposal);
  };

  const cancelEdit = () => {
    setEditingProposal(null);
  };

  const cancelVoting = () => {
    setVotingProposal(null);
    setSelectedVote('for');
    setVoteReason('');
  };

  const getProposalStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.APPROVED:
        return 'text-green-600 bg-green-50';
      case ProposalStatus.EXECUTED:
        return 'text-blue-600 bg-blue-50';
      case ProposalStatus.REJECTED:
      case ProposalStatus.CANCELLED:
        return 'text-red-600 bg-red-50';
      case ProposalStatus.VOTING:
        return 'text-yellow-600 bg-yellow-50';
      case ProposalStatus.UNDER_REVIEW:
        return 'text-purple-600 bg-purple-50';
      case ProposalStatus.SUBMITTED:
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: ProposalPriority) => {
    switch (priority) {
      case ProposalPriority.URGENT:
        return 'text-red-600 bg-red-50';
      case ProposalPriority.HIGH:
        return 'text-orange-600 bg-orange-50';
      case ProposalPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-50';
      case ProposalPriority.LOW:
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const renderProposalCard = (proposal: SpendingProposal) => {
    const voteResults = TreasuryHelpers.calculateProposalVotes(proposal);
    const isExpanded = showDetails === proposal.id;
    const fund = funds.find(f => f.id === proposal.fundId);
    const canVote = proposal.status === ProposalStatus.VOTING;
    const isCreator = proposal.proposerAddress === '0x1234567890123456789012345678901234567890';

    return (
      <div key={proposal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{proposal.title}</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProposalStatusColor(proposal.status)}`}>
                {proposal.status.replace('_', ' ').charAt(0).toUpperCase() + proposal.status.slice(1).toLowerCase()}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(proposal.priority)}`}>
                {proposal.priority.charAt(0).toUpperCase() + proposal.priority.slice(1).toLowerCase()}
              </span>
            </div>
            
            <p className="text-gray-600 mb-3 line-clamp-2">{proposal.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                {TreasuryHelpers.formatCurrency(proposal.requestedAmount)}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${TreasuryHelpers.getCategoryColor(proposal.category)}`}>
                {TreasuryHelpers.getCategoryDisplayName(proposal.category)}
              </span>
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {proposal.proposer}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {proposal.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isCreator && proposal.status === ProposalStatus.DRAFT && (
              <>
                <button
                  onClick={() => startEdit(proposal)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteProposal(proposal.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
            
            {isCreator && proposal.status === ProposalStatus.DRAFT && (
              <button
                onClick={() => handleSubmitProposal(proposal.id)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Send className="h-4 w-4 mr-1" />
                Submit
              </button>
            )}
            
            {canVote && (
              <button
                onClick={() => startVoting(proposal)}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Vote
              </button>
            )}
            
            <button
              onClick={() => setShowDetails(isExpanded ? null : proposal.id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        {proposal.status === ProposalStatus.VOTING && (
          <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-900">Voting Progress</span>
              <span className="text-sm font-semibold text-purple-900">
                {voteResults.percentage.toFixed(1)}% Support
              </span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
              <div
                className="h-2 rounded-full bg-purple-600 transition-all duration-300"
                style={{ width: `${voteResults.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-purple-700">
              <span>{voteResults.for} votes for</span>
              <span>{voteResults.against} votes against</span>
              <span>{voteResults.abstain} abstain</span>
            </div>
            {proposal.deadline && (
              <div className="mt-2 text-xs text-purple-600">
                Deadline: {proposal.deadline.toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            {proposal.justification && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Justification</h4>
                <p className="text-sm text-gray-600">{proposal.justification}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Fund:</span>
                <span className="text-gray-900 ml-2">{fund?.name || 'Unknown'}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Recipient:</span>
                <span className="text-gray-900 ml-2">{proposal.recipient || 'Not specified'}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900 ml-2">{proposal.createdAt.toLocaleString()}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-900 ml-2">{proposal.updatedAt.toLocaleString()}</span>
              </div>
            </div>

            {proposal.votes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Votes</h4>
                <div className="space-y-2">
                  {proposal.votes.slice(-3).map(vote => (
                    <div key={vote.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          vote.vote === VoteType.FOR ? 'bg-green-100 text-green-700' :
                          vote.vote === VoteType.AGAINST ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {vote.vote === VoteType.FOR ? 'For' : vote.vote === VoteType.AGAINST ? 'Against' : 'Abstain'}
                        </span>
                        <span className="text-gray-600">{vote.voter}</span>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {vote.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCreateForm = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Proposal</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={editingProposal?.title || ''}
            onChange={(e) => setEditingProposal(prev => prev ? {...prev, title: e.target.value} : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter proposal title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={editingProposal?.description || ''}
            onChange={(e) => setEditingProposal(prev => prev ? {...prev, description: e.target.value} : null)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the proposal in detail"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fund *
            </label>
            <select
              value={editingProposal?.fundId || ''}
              onChange={(e) => setEditingProposal(prev => prev ? {...prev, fundId: e.target.value} : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a fund</option>
              {funds.map(fund => (
                <option key={fund.id} value={fund.id}>
                  {fund.name} ({TreasuryHelpers.formatCurrency(fund.allocatedAmount - fund.spentAmount)} available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={editingProposal?.category || FundCategory.OTHER}
              onChange={(e) => setEditingProposal(prev => prev ? {...prev, category: e.target.value as FundCategory} : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(FundCategory).map(category => (
                <option key={category} value={category}>
                  {TreasuryHelpers.getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requested Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={editingProposal?.requestedAmount || ''}
                onChange={(e) => setEditingProposal(prev => prev ? {...prev, requestedAmount: parseFloat(e.target.value) || 0} : null)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority *
            </label>
            <select
              value={editingProposal?.priority || ProposalPriority.MEDIUM}
              onChange={(e) => setEditingProposal(prev => prev ? {...prev, priority: e.target.value as ProposalPriority} : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(ProposalPriority).map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Justification
          </label>
          <textarea
            value={editingProposal?.justification || ''}
            onChange={(e) => setEditingProposal(prev => prev ? {...prev, justification: e.target.value} : null)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Explain why this proposal is necessary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient
            </label>
            <input
              type="text"
              value={editingProposal?.recipient || ''}
              onChange={(e) => setEditingProposal(prev => prev ? {...prev, recipient: e.target.value} : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Recipient name or organization"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              value={editingProposal?.recipientAddress || ''}
              onChange={(e) => setEditingProposal(prev => prev ? {...prev, recipientAddress: e.target.value} : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0x..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voting Deadline
          </label>
          <input
            type="date"
            value={editingProposal?.deadline ? editingProposal.deadline.toISOString().split('T')[0] : ''}
            onChange={(e) => setEditingProposal(prev => prev ? {...prev, deadline: new Date(e.target.value)} : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 mt-6">
        <button
          onClick={cancelEdit}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdateProposal}
          disabled={!editingProposal?.title || !editingProposal.fundId || editingProposal.requestedAmount <= 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Update Proposal
        </button>
      </div>
    </div>
  );

  const renderVotingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vote on Proposal</h3>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{votingProposal?.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{votingProposal?.description}</p>
          <div className="text-sm text-gray-500">
            Amount: {votingProposal && TreasuryHelpers.formatCurrency(votingProposal.requestedAmount)}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Vote
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="for"
                  checked={selectedVote === 'for'}
                  onChange={(e) => setSelectedVote(e.target.value as 'for' | 'against' | 'abstain')}
                  className="mr-2"
                />
                <span className="text-green-600">For</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="against"
                  checked={selectedVote === 'against'}
                  onChange={(e) => setSelectedVote(e.target.value as 'for' | 'against' | 'abstain')}
                  className="mr-2"
                />
                <span className="text-red-600">Against</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="abstain"
                  checked={selectedVote === 'abstain'}
                  onChange={(e) => setSelectedVote(e.target.value as 'for' | 'against' | 'abstain')}
                  className="mr-2"
                />
                <span className="text-gray-600">Abstain</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={voteReason}
              onChange={(e) => setVoteReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Explain your vote..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={cancelVoting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleVote}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Submit Vote
          </button>
        </div>
      </div>
    </div>
  );

  const renderNewProposalForm = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Proposal</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter proposal title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the proposal in detail"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fund *
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select a fund</option>
              {funds.map(fund => (
                <option key={fund.id} value={fund.id}>
                  {fund.name} ({TreasuryHelpers.formatCurrency(fund.allocatedAmount - fund.spentAmount)} available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {Object.values(FundCategory).map(category => (
                <option key={category} value={category}>
                  {TreasuryHelpers.getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requested Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority *
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {Object.values(ProposalPriority).map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Justification
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Explain why this proposal is necessary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Recipient name or organization"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0x..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voting Deadline
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 mt-6">
        <button
          onClick={() => setShowCreateForm(false)}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateProposal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Proposal
        </button>
      </div>
    </div>
  );

  const renderProposalStats = () => {
    const stats = {
      total: filteredProposals.length,
      draft: filteredProposals.filter(p => p.status === ProposalStatus.DRAFT).length,
      submitted: filteredProposals.filter(p => p.status === ProposalStatus.SUBMITTED).length,
      voting: filteredProposals.filter(p => p.status === ProposalStatus.VOTING).length,
      approved: filteredProposals.filter(p => p.status === ProposalStatus.APPROVED).length,
      rejected: filteredProposals.filter(p => p.status === ProposalStatus.REJECTED).length,
      executed: filteredProposals.filter(p => p.status === ProposalStatus.EXECUTED).length
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposal Statistics</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Proposals</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.voting}</div>
            <div className="text-sm text-gray-600">Currently Voting</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Draft</span>
            <span className="font-medium text-gray-900">{stats.draft}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Submitted</span>
            <span className="font-medium text-gray-900">{stats.submitted}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Rejected</span>
            <span className="font-medium text-red-600">{stats.rejected}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Executed</span>
            <span className="font-medium text-blue-600">{stats.executed}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Spending Proposals</h2>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </button>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ProposalStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              {Object.values(ProposalStatus).map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search proposals..."
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {(showCreateForm || editingProposal) && (
        editingProposal ? renderCreateForm() : renderNewProposalForm()
      )}

      {votingProposal && renderVotingModal()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {filteredProposals.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Found</h3>
                <p className="text-gray-600 mb-6">
                  {funds.length === 0 
                    ? 'Create funds first to submit spending proposals.'
                    : 'Create your first spending proposal to request funding.'
                  }
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Proposal
                </button>
              </div>
            ) : (
              filteredProposals.map(renderProposalCard)
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          {renderProposalStats()}
        </div>
      </div>
    </div>
  );
};
