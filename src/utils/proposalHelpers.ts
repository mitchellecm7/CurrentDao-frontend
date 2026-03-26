import { 
  Proposal, 
  ProposalComment, 
  ProposalTemplate, 
  VotingPower, 
  QuorumParameters,
  ProposalMetrics 
} from '@/types/proposals';

export class ProposalHelpers {
  // Validation helpers
  static validateProposal(proposal: Partial<Proposal>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!proposal.title || proposal.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long');
    }

    if (!proposal.description || proposal.description.trim().length < 20) {
      errors.push('Description must be at least 20 characters long');
    }

    if (!proposal.content || proposal.content.trim().length < 50) {
      errors.push('Content must be at least 50 characters long');
    }

    if (!proposal.category) {
      errors.push('Category is required');
    }

    if (!proposal.author?.id || !proposal.author?.name || !proposal.author?.address) {
      errors.push('Author information is incomplete');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateComment(comment: Partial<ProposalComment>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!comment.content || comment.content.trim().length < 3) {
      errors.push('Comment must be at least 3 characters long');
    }

    if (!comment.author?.id || !comment.author?.name || !comment.author?.address) {
      errors.push('Author information is incomplete');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Status helpers
  static canVote(proposal: Proposal, userAddress: string): boolean {
    return proposal.status === 'voting' && 
           proposal.voting.deadline > new Date() &&
           !this.hasVoted(proposal, userAddress);
  }

  static hasVoted(proposal: Proposal, userAddress: string): boolean {
    // This would typically check against a voting record
    // For now, return false as a placeholder
    return false;
  }

  static isExpired(proposal: Proposal): boolean {
    return proposal.status === 'expired' || proposal.voting.deadline < new Date();
  }

  static canExecute(proposal: Proposal): boolean {
    return proposal.status === 'executed' && 
           proposal.voting.support > proposal.voting.oppose;
  }

  // Voting calculations
  static calculateQuorum(proposal: Proposal, votingPower: VotingPower): boolean {
    const totalVotes = proposal.voting.support + proposal.voting.oppose + proposal.voting.abstain;
    const quorumPercentage = (totalVotes / votingPower.totalSupply) * 100;
    return quorumPercentage >= votingPower.quorum;
  }

  static calculateApproval(proposal: Proposal): number {
    const totalVotes = proposal.voting.support + proposal.voting.oppose;
    if (totalVotes === 0) return 0;
    return (proposal.voting.support / totalVotes) * 100;
  }

  static getVotingStatus(proposal: Proposal): {
    status: 'pending' | 'active' | 'passed' | 'rejected' | 'expired';
    message: string;
  } {
    const now = new Date();
    
    if (now < proposal.timeline.voting.start) {
      return {
        status: 'pending',
        message: 'Voting has not started yet'
      };
    }

    if (now > proposal.voting.deadline) {
      const approval = this.calculateApproval(proposal);
      if (approval >= 50) {
        return {
          status: 'passed',
          message: `Proposal passed with ${approval.toFixed(1)}% approval`
        };
      } else {
        return {
          status: 'rejected',
          message: `Proposal rejected with ${approval.toFixed(1)}% approval`
        };
      }
    }

    return {
      status: 'active',
      message: 'Voting is currently active'
    };
  }

  // Time helpers
  static getTimeRemaining(deadline: Date): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const isExpired = diff <= 0;

    if (isExpired) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isExpired: false };
  }

  static formatTimeRemaining(deadline: Date): string {
    const { days, hours, minutes, seconds, isExpired } = this.getTimeRemaining(deadline);
    
    if (isExpired) {
      return 'Expired';
    }

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Proposal lifecycle helpers
  static getNextStage(proposal: Proposal): {
    stage: 'discussion' | 'voting' | 'execution' | 'completed';
    start: Date;
    end?: Date;
  } {
    const now = new Date();
    
    if (now < proposal.timeline.discussion.end || now < proposal.timeline.voting.start) {
      return {
        stage: 'discussion',
        start: proposal.timeline.discussion.start,
        end: proposal.timeline.discussion.end
      };
    } else if (now < proposal.timeline.voting.end || now < proposal.timeline.execution.start) {
      return {
        stage: 'voting',
        start: proposal.timeline.voting.start,
        end: proposal.timeline.voting.end
      };
    } else if (now < proposal.timeline.execution.end) {
      return {
        stage: 'execution',
        start: proposal.timeline.execution.start,
        end: proposal.timeline.execution.end
      };
    } else {
      return {
        stage: 'completed',
        start: proposal.timeline.created
      };
    }
  }

  // Template helpers
  static applyTemplate(template: ProposalTemplate, variables: Record<string, any>): Proposal {
    let content = template.content;
    
    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return {
      id: '', // Will be assigned when creating
      title: variables.title || template.name,
      description: variables.description || template.description,
      content,
      author: {
        id: '',
        name: '',
        address: ''
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      category: template.category,
      tags: template.tags,
      attachments: [],
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
  }

  // Sorting helpers
  static sortProposals(proposals: Proposal[], sortBy: 'newest' | 'oldest' | 'popular' | 'ending-soon'): Proposal[] {
    const sorted = [...proposals];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'oldest':
        return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      case 'popular':
        return sorted.sort((a, b) => b.metrics.views - a.metrics.views);
      case 'ending-soon':
        return sorted.sort((a, b) => a.voting.deadline.getTime() - b.voting.deadline.getTime());
      default:
        return sorted;
    }
  }

  // Filter helpers
  static filterProposals(proposals: Proposal[], filters: {
    status?: Proposal['status'][];
    category?: Proposal['category'][];
    tags?: string[];
    author?: string;
    search?: string;
  }): Proposal[] {
    return proposals.filter(proposal => {
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(proposal.status)) return false;
      }

      // Category filter
      if (filters.category && filters.category.length > 0) {
        if (!filters.category.includes(proposal.category)) return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          proposal.tags.some(proposalTag => 
            proposalTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) return false;
      }

      // Author filter
      if (filters.author) {
        if (proposal.author.name.toLowerCase().indexOf(filters.author.toLowerCase()) === -1) {
          return false;
        }
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${proposal.title} ${proposal.description} ${proposal.content}`.toLowerCase();
        if (searchableText.indexOf(searchTerm) === -1) return false;
      }

      return true;
    });
  }

  // Attachment helpers
  static validateAttachment(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/markdown',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not supported' };
    }

    return { isValid: true };
  }

  static async uploadAttachment(file: File): Promise<ProposalAttachment> {
    // In a real implementation, this would upload to a server
    // For now, return a mock attachment
    return {
      id: Date.now().toString(),
      name: file.name,
      type: this.getAttachmentType(file.type),
      url: URL.createObjectURL(file),
      size: file.size,
      mimeType: file.type,
      description: '',
      hash: await this.generateFileHash(file)
    };
  }

  private static getAttachmentType(mimeType: string): ProposalAttachment['type'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return 'document';
    }
    return 'other';
  }

  private static async generateFileHash(file: File): Promise<string> {
    // In a real implementation, this would generate a proper hash
    // For now, return a mock hash
    return btoa(file.name + Date.now().toString()).substring(0, 32);
  }

  // Metrics helpers
  static calculateProposalMetrics(proposals: Proposal[]): ProposalMetrics {
    const totalViews = proposals.reduce((sum, p) => sum + p.metrics.views, 0);
    const totalComments = proposals.reduce((sum, p) => sum + p.metrics.comments, 0);
    const totalVoters = proposals.reduce((sum, p) => sum + p.voting.total, 0);
    const totalVotes = proposals.reduce((sum, p) => 
      sum + p.voting.support + p.voting.oppose + p.voting.abstain, 0
    );

    return {
      engagement: {
        views: totalViews,
        uniqueVoters: totalVoters,
        participationRate: totalVoters > 0 ? (totalVoters / proposals.length) * 100 : 0,
        discussionQuality: totalComments > 0 ? (totalComments / proposals.length) : 0,
        sentimentScore: 0 // Would be calculated from comment sentiment analysis
      },
      votingPatterns: {
        support: proposals.reduce((sum, p) => sum + p.voting.support, 0),
        oppose: proposals.reduce((sum, p) => sum + p.voting.oppose, 0),
        abstain: proposals.reduce((sum, p) => sum + p.voting.abstain, 0),
        total: totalVotes
      }
    };
  }

  // Notification helpers
  static generateProposalNotification(proposal: Proposal, type: 'created' | 'updated' | 'voting-started' | 'voting-ended' | 'executed'): {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  } {
    switch (type) {
      case 'created':
        return {
          title: 'New Proposal Created',
          message: `"${proposal.title}" has been created and is now in discussion phase`,
          type: 'info'
        };
      case 'updated':
        return {
          title: 'Proposal Updated',
          message: `"${proposal.title}" has been updated`,
          type: 'info'
        };
      case 'voting-started':
        return {
          title: 'Voting Started',
          message: `Voting has started for "${proposal.title}"`,
          type: 'info'
        };
      case 'voting-ended':
        const status = this.getVotingStatus(proposal);
        return {
          title: 'Voting Ended',
          message: status.message,
          type: status.status === 'passed' ? 'success' : 'warning'
        };
      case 'executed':
        return {
          title: 'Proposal Executed',
          message: `"${proposal.title}" has been successfully executed`,
          type: 'success'
        };
      default:
        return {
          title: 'Proposal Update',
          message: 'Proposal status has changed',
          type: 'info'
        };
    }
  }
}
