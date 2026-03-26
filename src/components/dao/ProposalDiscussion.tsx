'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Reply,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Heart,
  Bookmark,
  Share2,
  Flag,
  MoreVertical,
  User,
  Clock,
  Send,
  Paperclip,
  Smile,
  Image,
  Link,
  Bold,
  Italic,
  Code,
  Filter,
  Search,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useProposals } from '@/hooks/useProposals';
import { ProposalComment } from '@/types/proposals';
import { cn } from '@/lib/utils';

interface ProposalDiscussionProps {
  proposalId: string;
  className?: string;
  maxHeight?: string;
  enableReactions?: boolean;
  enableVoting?: boolean;
  onCommentAdded?: (comment: ProposalComment) => void;
}

interface CommentProps {
  comment: ProposalComment;
  onReply?: (commentId: string, content: string) => void;
  onReact?: (commentId: string, reaction: string) => void;
  onVote?: (commentId: string, voteType: 'support' | 'oppose' | 'abstain') => void;
  onReport?: (commentId: string) => void;
  level?: number;
}

const Comment = ({ 
  comment, 
  onReply, 
  onReact, 
  onVote, 
  onReport, 
  level = 0 
}: CommentProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const reactions = [
    { emoji: '👍', label: 'Like' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '🎉', label: 'Celebrate' },
    { emoji: '🤔', label: 'Thinking' },
    { emoji: '😂', label: 'Laugh' },
    { emoji: '😮', label: 'Wow' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😡', label: 'Angry' }
  ];

  const handleReply = () => {
    if (!replyContent.trim()) return;

    onReply?.(comment.id, replyContent);
    setReplyContent('');
    setIsReplying(false);
  };

  const handleReaction = (emoji: string) => {
    setUserReaction(emoji);
    onReact?.(comment.id, emoji);
  };

  const handleVote = (voteType: 'support' | 'oppose' | 'abstain') => {
    onVote?.(comment.id, voteType);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className={cn("border-b last:border-b-0", level > 0 && "ml-8")}>
      <div className="p-4 hover:bg-accent/50 transition-colors">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.author.name}</span>
                <span className="text-sm text-muted-foreground">
                  @{comment.author.address.slice(0, 6)}...
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {comment.author.reputation && `Reputation: ${comment.author.reputation}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatTime(comment.createdAt)}
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-background border rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => onReply?.(comment.id, '')}
                    className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </button>
                  <button
                    onClick={() => console.log('Share comment')}
                    className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    onClick={() => console.log('Bookmark comment')}
                    className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4" />
                    Bookmark
                  </button>
                  <div className="border-t my-1" />
                  <button
                    onClick={() => onReport?.(comment.id)}
                    className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 text-destructive"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comment Content */}
        <div className="prose prose-sm max-w-none mb-4">
          <div dangerouslySetInnerHTML={{ 
            __html: comment.content.replace(/\n/g, '<br>') 
          }} />
        </div>

        {/* Comment Votes */}
        {comment.votes.total > 0 && (
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleVote('support')}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs",
                  userReaction === 'support' ? "bg-green-100 text-green-700" : "hover:bg-green-50"
                )}
              >
                <ThumbsUp className="w-3 h-3" />
                {comment.votes.support}
              </button>
              <button
                onClick={() => handleVote('oppose')}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs",
                  userReaction === 'oppose' ? "bg-red-100 text-red-700" : "hover:bg-red-50"
                )}
              >
                <ThumbsDown className="w-3 h-3" />
                {comment.votes.oppose}
              </button>
              <button
                onClick={() => handleVote('abstain')}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs",
                  userReaction === 'abstain' ? "bg-gray-100 text-gray-700" : "hover:bg-gray-50"
                )}
              >
                <Minus className="w-3 h-3" />
                {comment.votes.abstain}
              </button>
            </div>
          </div>
        )}

        {/* Reactions */}
        {Object.keys(comment.reactions).length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Reactions:</span>
            <div className="flex gap-1">
              {Object.entries(comment.reactions).map(([emoji, data]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-sm",
                    userReaction === emoji ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-accent"
                  )}
                >
                  <span>{emoji}</span>
                  <span className="text-xs">{data.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reply Form */}
      {isReplying && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Replying to {comment.author.name}</span>
          </div>

          <textarea
            ref={replyRef}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none"
            rows={3}
          />

          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              <button className="p-2 hover:bg-accent rounded transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-accent rounded transition-colors">
                <Smile className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-accent rounded transition-colors">
                <Image className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-accent rounded transition-colors">
                <Link className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={!replyContent.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Button */}
      {!isReplying && (
        <button
          onClick={() => setIsReplying(true)}
          className="mt-3 flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Reply className="w-4 h-4" />
          Reply
        </button>
      )}
    </div>
  );
};

export function ProposalDiscussion({ 
  proposalId, 
  className, 
  maxHeight = '600px',
  enableReactions = true,
  enableVoting = true,
  onCommentAdded 
}: ProposalDiscussionProps) {
  const { addComment, getComments, updateComment, deleteComment } = useProposals();
  const [comments, setComments] = useState<ProposalComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'author' | 'replies'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const commentAreaRef = useRef<HTMLTextAreaElement>(null);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      setError(null);

      try {
        const commentsData = await getComments(proposalId);
        setComments(commentsData);
      } catch (err) {
        setError('Failed to load comments');
        console.error('Failed to load comments:', err);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [proposalId, getComments]);

  // Handle new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const comment = await addComment(proposalId, {
        content: newComment,
        author: {
          id: '0x123...',
          name: 'Current User',
          address: '0x1234567890123456789012345678901234567890',
          reputation: 95
        }
      });

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      onCommentAdded?.(comment);
    } catch (err) {
      setError('Failed to post comment');
      console.error('Failed to post comment:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort comments
  const filteredComments = comments
    .filter(comment => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const contentMatch = comment.content.toLowerCase().includes(searchLower);
        const authorMatch = comment.author.name.toLowerCase().includes(searchLower);
        return contentMatch || authorMatch;
      }
      return true;
    })
    .filter(comment => {
      if (filterBy === 'author') {
        return comment.parentCommentId === null;
      }
      if (filterBy === 'replies') {
        return comment.parentCommentId !== null;
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
          return (b.votes.total + Object.values(b.reactions).reduce((sum, r) => sum + r.count, 0)) - 
                 (a.votes.total + Object.values(a.reactions).reduce((sum, r) => sum + r.count, 0));
        default:
          return 0;
      }
    });

  // Build comment tree
  const buildCommentTree = (comments: ProposalComment[]) => {
    const commentMap = new Map<string, ProposalComment & { replies: ProposalComment[] }>();
    const rootComments: (ProposalComment & { replies: ProposalComment[] })[] = [];

    // Initialize map
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Build tree structure
    comments.forEach(comment => {
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies.push(commentMap.get(comment.id)!);
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    return rootComments;
  };

  const commentTree = buildCommentTree(filteredComments);

  return (
    <div className={cn("bg-card border rounded-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Discussion</h3>
          <span className="text-sm text-muted-foreground">
            ({comments.length} comment{comments.length !== 1 ? 's' : ''})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search comments..."
              className="pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 border rounded-lg"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
          >
            <option value="all">All Comments</option>
            <option value="author">Top Level Only</option>
            <option value="replies">Replies Only</option>
          </select>

          <select
            className="px-3 py-2 border rounded-lg"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* New Comment Form */}
      <div className="p-4 border-b">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <textarea
              ref={commentAreaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this proposal..."
              className="w-full p-3 border rounded-lg resize-none focus:outline-none"
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button className="p-2 hover:bg-accent rounded transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-accent rounded transition-colors">
              <Smile className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-accent rounded transition-colors">
              <Image className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-accent rounded transition-colors">
              <Link className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {newComment.length}/500 characters
            </span>
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post Comment
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}
      </div>

      {/* Comments */}
      <div 
        className="overflow-y-auto p-4 space-y-0"
        style={{ maxHeight }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : commentTree.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
            <p className="text-muted-foreground">
              Be the first to share your thoughts on this proposal
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {commentTree.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                onReply={async (commentId, content) => {
                  try {
                    await addComment(proposalId, {
                      content,
                      author: {
                        id: '0x123...',
                        name: 'Current User',
                        address: '0x1234567890123456789012345678901234567890',
                        reputation: 95
                      },
                      parentCommentId: commentId
                    });
                  } catch (err) {
                    console.error('Failed to reply:', err);
                  }
                }}
                onReact={async (commentId, reaction) => {
                  try {
                    await updateComment(commentId, {
                      reactions: {
                        ...comment.reactions,
                        [reaction]: {
                          emoji: reaction,
                          count: (comment.reactions[reaction]?.count || 0) + 1
                        }
                      }
                    });
                  } catch (err) {
                    console.error('Failed to react:', err);
                  }
                }}
                onVote={async (commentId, voteType) => {
                  try {
                    const updatedVotes = { ...comment.votes };
                    updatedVotes[voteType]++;
                    updatedVotes.total++;
                    await updateComment(commentId, { votes: updatedVotes });
                  } catch (err) {
                    console.error('Failed to vote:', err);
                  }
                }}
                onReport={(commentId) => {
                  console.log('Report comment:', commentId);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Discussion Guidelines */}
      <div className="p-4 bg-muted/50 border-t">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-500" />
          Discussion Guidelines
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p>• Be respectful and constructive</p>
            <p>• Stay on topic and relevant</p>
            <p>• Provide evidence and reasoning</p>
          </div>
          <div>
            <p>• Avoid personal attacks</p>
            <p>• No spam or self-promotion</p>
            <p>• Follow community standards</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProposalDiscussion;
