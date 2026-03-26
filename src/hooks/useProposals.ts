'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Proposal, 
  ProposalComment, 
  ProposalTemplate, 
  VotingPower, 
  QuorumParameters,
  ProposalMetrics 
} from '@/types/proposals';
import { ProposalHelpers } from '@/utils/proposalHelpers';

interface UseProposalsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseProposalsState {
  proposals: Proposal[];
  templates: ProposalTemplate[];
  comments: Record<string, ProposalComment[]>;
  votingPower: VotingPower | null;
  quorumParameters: QuorumParameters | null;
  metrics: ProposalMetrics | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: Proposal['status'][];
    category: Proposal['category'][];
    tags: string[];
    author: string;
    search: string;
  };
  sortBy: 'newest' | 'oldest' | 'popular' | 'ending-soon';
}

interface UseProposalsActions {
  // Proposal CRUD
  createProposal: (proposal: Partial<Proposal>) => Promise<Proposal>;
  updateProposal: (id: string, updates: Partial<Proposal>) => Promise<Proposal>;
  deleteProposal: (id: string) => Promise<void>;
  getProposal: (id: string) => Promise<Proposal | null>;
  
  // Voting
  vote: (proposalId: string, voteType: 'support' | 'oppose' | 'abstain') => Promise<void>;
  getVoteHistory: (proposalId: string) => Promise<any[]>;
  
  // Comments
  addComment: (proposalId: string, comment: Partial<ProposalComment>) => Promise<ProposalComment>;
  updateComment: (commentId: string, updates: Partial<ProposalComment>) => Promise<ProposalComment>;
  deleteComment: (commentId: string) => Promise<void>;
  getComments: (proposalId: string) => Promise<ProposalComment[]>;
  
  // Templates
  getTemplates: () => Promise<ProposalTemplate[]>;
  applyTemplate: (templateId: string, variables: Record<string, any>) => Promise<Proposal>;
  
  // Filtering and sorting
  setFilters: (filters: Partial<UseProposalsState['filters']>) => void;
  clearFilters: () => void;
  setSortBy: (sortBy: UseProposalsState['sortBy']) => void;
  
  // Notifications
  subscribeToProposal: (proposalId: string) => () => void;
  unsubscribeFromProposal: (proposalId: string) => void;
  
  // Data refresh
  refresh: () => Promise<void>;
  refreshVotingPower: () => Promise<void>;
}

export function useProposals(options: UseProposalsOptions = {}): UseProposalsState & UseProposalsActions {
  const [state, setState] = useState<UseProposalsState>({
    proposals: [],
    templates: [],
    comments: {},
    votingPower: null,
    quorumParameters: null,
    metrics: null,
    loading: false,
    error: null,
    filters: {
      status: [],
      category: [],
      tags: [],
      author: '',
      search: ''
    },
    sortBy: 'newest'
  });

  // Mock data - in real app, this would come from API
  const mockProposals: Proposal[] = [
    {
      id: '1',
      title: 'Implement New Governance Framework',
      description: 'Proposal to implement a comprehensive governance framework for the DAO',
      content: '# Governance Framework Proposal\n\nThis proposal outlines a new governance framework that will enhance our decision-making processes...',
      author: {
        id: '0x123...',
        name: 'Alice Johnson',
        address: '0x1234567890123456789012345678901234567890',
        reputation: 95
      },
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
      status: 'voting',
      category: 'governance',
      tags: ['governance', 'framework', 'voting'],
      attachments: [],
      voting: {
        support: 150,
        oppose: 45,
        abstain: 25,
        total: 220,
        deadline: new Date('2024-01-25T10:00:00Z'),
        quorum: '25%',
        results: {
          '': 0,
          total: 0,
          percentage: 68.2,
          breakdown: {
            'delegates': {
              support: 120,
              oppose: 30,
              abstain: 15
            },
            'community': {
              support: 30,
              oppose: 15,
              abstain: 10
            }
          }
        }
      },
      execution: {},
      metrics: {
        views: 1250,
        comments: 45,
        shares: 23,
        reactions: {
          '👍': { emoji: '👍', count: 89 },
          '👎': { emoji: '👎', count: 12 },
          '🤔': { emoji: '🤔', count: 23 }
        }
      },
      timeline: {
        created: new Date('2024-01-15T10:00:00Z'),
        discussion: {
          start: new Date('2024-01-15T10:00:00Z'),
          end: new Date('2024-01-20T10:00:00Z')
        },
        voting: {
          start: new Date('2024-01-20T10:00:00Z'),
          end: new Date('2024-01-25T10:00:00Z')
        },
        execution: {
          start: new Date('2024-01-25T10:00:00Z')
        }
      }
    },
    {
      id: '2',
      title: 'Treasury Diversification Strategy',
      description: 'Proposal to diversify DAO treasury assets',
      content: '# Treasury Diversification\n\nThis proposal aims to diversify our treasury holdings to reduce risk...',
      author: {
        id: '0x456...',
        name: 'Bob Smith',
        address: '0x456789012345678901234567890123456789012',
        reputation: 88
      },
      createdAt: new Date('2024-01-10T14:30:00Z'),
      updatedAt: new Date('2024-01-10T14:30:00Z'),
      status: 'discussion',
      category: 'financial',
      tags: ['treasury', 'diversification', 'investment'],
      attachments: [],
      voting: {
        support: 0,
        oppose: 0,
        abstain: 0,
        total: 0,
        deadline: new Date('2024-01-30T14:30:00Z'),
        quorum: '25%',
        results: {
          '': 0,
          total: 0,
          percentage: 0,
          breakdown: {}
        }
      },
      execution: {},
      metrics: {
        views: 890,
        comments: 32,
        shares: 15,
        reactions: {
          '👍': { emoji: '👍', count: 45 },
          '👎': { emoji: '👎', count: 8 },
          '🤔': { emoji: '🤔', count: 19 }
        }
      },
      timeline: {
        created: new Date('2024-01-10T14:30:00Z'),
        discussion: {
          start: new Date('2024-01-10T14:30:00Z'),
          end: new Date('2024-01-25T14:30:00Z')
        },
        voting: {
          start: new Date('2024-01-25T14:30:00Z'),
          end: new Date('2024-01-30T14:30:00Z')
        },
        execution: {
          start: new Date('2024-01-30T14:30:00Z')
        }
      }
    }
  ];

  const mockTemplates: ProposalTemplate[] = [
    {
      id: 'template-1',
      name: 'Governance Framework',
      description: 'Template for proposing governance changes',
      category: 'governance',
      tags: ['governance', 'framework'],
      content: `# {{title}}

## Background
{{background}}

## Problem Statement
{{problem}}

## Proposed Solution
{{solution}}

## Implementation Timeline
{{timeline}}

## Budget Requirements
{{budget}}

## Expected Impact
{{impact}}`,
      variables: {
        title: {
          description: 'Proposal title',
          type: 'text'
        },
        background: {
          description: 'Background information',
          type: 'text'
        },
        problem: {
          description: 'Problem statement',
          type: 'text'
        },
        solution: {
          description: 'Proposed solution',
          type: 'text'
        },
        timeline: {
          description: 'Implementation timeline',
          type: 'text'
        },
        budget: {
          description: 'Budget requirements',
          type: 'text'
        },
        impact: {
          description: 'Expected impact',
          type: 'text'
        }
      }
    },
    {
      id: 'template-2',
      name: 'Treasury Management',
      description: 'Template for treasury-related proposals',
      category: 'financial',
      tags: ['treasury', 'finance'],
      content: `# {{title}}

## Current Treasury Status
{{current_status}}

## Proposed Changes
{{proposed_changes}}

## Risk Assessment
{{risk_assessment}}

## Expected Returns
{{expected_returns}}

## Implementation Details
{{implementation}}`,
      variables: {
        title: {
          description: 'Proposal title',
          type: 'text'
        },
        current_status: {
          description: 'Current treasury status',
          type: 'text'
        },
        proposed_changes: {
          description: 'Proposed changes',
          type: 'text'
        },
        risk_assessment: {
          description: 'Risk assessment',
          type: 'text'
        },
        expected_returns: {
          description: 'Expected returns',
          type: 'text'
        },
        implementation: {
          description: 'Implementation details',
          type: 'text'
        }
      }
    }
  ];

  // Initialize data
  useEffect(() => {
    setState(prev => ({
      ...prev,
      proposals: mockProposals,
      templates: mockTemplates,
      votingPower: {
        tokenHolders: 5000,
        votingPower: 1000000,
        totalSupply: 2000000,
        quorum: '25%'
      },
      quorumParameters: {
        votingPeriod: 7, // days
        quorum: 25, // percentage
        minApproval: 50, // percentage
        proposalThreshold: 1000, // minimum tokens
        executionDelay: 2, // days
        emergencyQuorum: 50 // percentage
      }
    }));
  }, []);

  // Auto refresh
  useEffect(() => {
    if (!options.autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, options.refreshInterval || 30000); // 30 seconds default

    return () => clearInterval(interval);
  }, [options.autoRefresh, options.refreshInterval]);

  // Apply filters and sorting
  const getFilteredProposals = useCallback(() => {
    let filtered = ProposalHelpers.filterProposals(state.proposals, state.filters);
    filtered = ProposalHelpers.sortProposals(filtered, state.sortBy);
    return filtered;
  }, [state.proposals, state.filters, state.sortBy]);

  // Actions
  const createProposal = useCallback(async (proposal: Partial<Proposal>): Promise<Proposal> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const validation = ProposalHelpers.validateProposal(proposal);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const newProposal: Proposal = {
        id: Date.now().toString(),
        title: proposal.title || '',
        description: proposal.description || '',
        content: proposal.content || '',
        author: proposal.author || { id: '', name: '', address: '' },
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft',
        category: proposal.category || 'governance',
        tags: proposal.tags || [],
        attachments: proposal.attachments || [],
        voting: {
          support: 0,
          oppose: 0,
          abstain: 0,
          total: 0,
          deadline: new Date(),
          quorum: '0%',
          results: {
            '': 0,
            total: 0,
            percentage: 0,
            breakdown: {}
          }
        },
        execution: {},
        metrics: {
          views: 0,
          comments: 0,
          shares: 0,
          reactions: {}
        },
        timeline: {
          created: new Date(),
          discussion: {
            start: new Date()
          },
          voting: {
            start: new Date()
          },
          execution: {
            start: new Date()
          }
        }
      };

      setState(prev => ({
        ...prev,
        proposals: [newProposal, ...prev.proposals],
        loading: false
      }));

      return newProposal;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create proposal'
      }));
      throw error;
    }
  }, []);

  const updateProposal = useCallback(async (id: string, updates: Partial<Proposal>): Promise<Proposal> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const proposalIndex = state.proposals.findIndex(p => p.id === id);
      if (proposalIndex === -1) {
        throw new Error('Proposal not found');
      }

      const updatedProposal = { ...state.proposals[proposalIndex], ...updates };
      const newProposals = [...state.proposals];
      newProposals[proposalIndex] = updatedProposal;

      setState(prev => ({
        ...prev,
        proposals: newProposals,
        loading: false
      }));

      return updatedProposal;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update proposal'
      }));
      throw error;
    }
  }, [state.proposals]);

  const deleteProposal = useCallback(async (id: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const newProposals = state.proposals.filter(p => p.id !== id);
      
      setState(prev => ({
        ...prev,
        proposals: newProposals,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete proposal'
      }));
      throw error;
    }
  }, [state.proposals]);

  const getProposal = useCallback(async (id: string): Promise<Proposal | null> => {
    const proposal = state.proposals.find(p => p.id === id);
    return proposal || null;
  }, [state.proposals]);

  const vote = useCallback(async (proposalId: string, voteType: 'support' | 'oppose' | 'abstain'): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const proposalIndex = state.proposals.findIndex(p => p.id === proposalId);
      if (proposalIndex === -1) {
        throw new Error('Proposal not found');
      }

      const proposal = state.proposals[proposalIndex];
      if (!ProposalHelpers.canVote(proposal, '0x123...')) {
        throw new Error('Cannot vote on this proposal');
      }

      const updatedProposal = { ...proposal };
      updatedProposal.voting[voteType]++;
      updatedProposal.voting.total++;

      const newProposals = [...state.proposals];
      newProposals[proposalIndex] = updatedProposal;

      setState(prev => ({
        ...prev,
        proposals: newProposals,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to vote'
      }));
      throw error;
    }
  }, [state.proposals]);

  const getVoteHistory = useCallback(async (proposalId: string): Promise<any[]> => {
    // Mock vote history
    return [
      {
        voter: '0x123...',
        vote: 'support',
        timestamp: new Date('2024-01-20T10:30:00Z'),
        votingPower: 1000
      },
      {
        voter: '0x456...',
        vote: 'oppose',
        timestamp: new Date('2024-01-20T11:00:00Z'),
        votingPower: 500
      }
    ];
  }, []);

  const addComment = useCallback(async (proposalId: string, comment: Partial<ProposalComment>): Promise<ProposalComment> => {
    const validation = ProposalHelpers.validateComment(comment);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const newComment: ProposalComment = {
      id: Date.now().toString(),
      proposalId,
      author: comment.author || { id: '', name: '', address: '' },
      content: comment.content || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      reactions: {},
      votes: {
        support: 0,
        oppose: 0,
        abstain: 0,
        total: 0
      }
    };

    setState(prev => ({
      ...prev,
      comments: {
        ...prev.comments,
        [proposalId]: [...(prev.comments[proposalId] || []), newComment]
      }
    }));

    return newComment;
  }, [state.comments]);

  const updateComment = useCallback(async (commentId: string, updates: Partial<ProposalComment>): Promise<ProposalComment> => {
    // Find and update comment logic
    const updatedComment = {
      id: commentId,
      proposalId: '',
      author: { id: '', name: '', address: '' },
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      reactions: {},
      votes: {
        support: 0,
        oppose: 0,
        abstain: 0,
        total: 0
      },
      ...updates
    };

    return updatedComment;
  }, []);

  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    // Delete comment logic
  }, []);

  const getComments = useCallback(async (proposalId: string): Promise<ProposalComment[]> => {
    return state.comments[proposalId] || [];
  }, [state.comments]);

  const getTemplates = useCallback(async (): Promise<ProposalTemplate[]> => {
    return state.templates;
  }, [state.templates]);

  const applyTemplate = useCallback(async (templateId: string, variables: Record<string, any>): Promise<Proposal> => {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    return ProposalHelpers.applyTemplate(template, variables);
  }, [state.templates]);

  const setFilters = useCallback((filters: Partial<UseProposalsState['filters']>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters }
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        status: [],
        category: [],
        tags: [],
        author: '',
        search: ''
      }
    }));
  }, []);

  const setSortBy = useCallback((sortBy: UseProposalsState['sortBy']) => {
    setState(prev => ({ ...prev, sortBy }));
  }, []);

  const subscribeToProposal = useCallback((proposalId: string) => {
    // Subscription logic
    return () => {
      // Unsubscribe logic
    };
  }, []);

  const unsubscribeFromProposal = useCallback((proposalId: string) => {
    // Unsubscribe logic
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true }));
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  const refreshVotingPower = useCallback(async (): Promise<void> => {
    // Refresh voting power logic
  }, []);

  return {
    ...state,
    createProposal,
    updateProposal,
    deleteProposal,
    getProposal,
    vote,
    getVoteHistory,
    addComment,
    updateComment,
    deleteComment,
    getComments,
    getTemplates,
    applyTemplate,
    setFilters,
    clearFilters,
    setSortBy,
    subscribeToProposal,
    unsubscribeFromProposal,
    refresh,
    refreshVotingPower
  };
}
