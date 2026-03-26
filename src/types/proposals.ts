export interface Proposal {
  id: string;
  title: string;
  description: string;
  content: string;
  author: {
    id: string;
    name: string;
    address: string;
    reputation?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'discussion' | 'voting' | 'executed' | 'rejected' | 'expired';
  category: 'governance' | 'technical' | 'financial' | 'community' | 'marketing' | 'security';
  tags: string[];
  attachments: ProposalAttachment[];
  voting: {
    support: number;
    oppose: number;
    abstain: number;
    total: number;
    deadline: Date;
    quorum: string;
    results: {
      [key: string]: number;
      total: number;
      percentage: number;
      breakdown: Record<string, {
        support: number;
        oppose: number;
        abstain: number;
      }>;
    };
  };
  execution: {
    executedAt?: Date;
    transactionHash?: string;
    blockNumber?: number;
    gasUsed?: number;
  };
  metrics: {
    views: number;
    comments: number;
    shares: number;
    reactions: {
      [key: string]: {
        emoji: string;
        count: number;
      };
    };
  };
  budget?: {
    requested: number;
    allocated: number;
    spent: number;
    currency: string;
  };
  timeline: {
    created: Date;
    discussion: {
      start: Date;
      end?: Date;
    };
    voting: {
      start: Date;
      end?: Date;
    };
    execution: {
      start: Date;
      end?: Date;
    };
  };
}

export interface ProposalAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'link' | 'video' | 'code' | 'other';
  url?: string;
  size: number;
  mimeType: string;
  description: string;
  hash: string;
}

export interface ProposalComment {
  id: string;
  proposalId: string;
  author: {
    id: string;
    name: string;
    address: string;
    reputation?: number;
  };
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parentCommentId?: string;
  reactions: {
    [key: string]: {
      emoji: string;
      count: number;
    };
  };
  votes: {
    support: number;
    oppose: number;
    abstain: number;
    total: number;
  };
}

export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  category: Proposal['category'];
  tags: string[];
  content: string;
  variables: {
    [key: string]: {
      description: string;
      type: 'text' | 'number' | 'date' | 'select';
    };
  };
}

export interface VotingPower {
  tokenHolders: number;
  votingPower: number;
  totalSupply: number;
  quorum: string;
}

export interface QuorumParameters {
  votingPeriod: number;
  quorum: number;
  minApproval: number;
  proposalThreshold: number;
  executionDelay: number;
  emergencyQuorum: number;
}

export interface ProposalMetrics {
  engagement: {
    views: number;
    uniqueVoters: number;
    participationRate: number;
    discussionQuality: number;
    sentimentScore: number;
  };
  votingPatterns: {
    support: number;
    oppose: number;
    abstain: number;
    total: number;
  };
}
