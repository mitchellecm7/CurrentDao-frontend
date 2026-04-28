'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Search,
  Plus,
  X
} from 'lucide-react'

interface SnapshotProposal {
  id: string
  title: string
  description: string
  content: string
  author: string
  status: 'active' | 'closed' | 'pending'
  start: Date
  end: Date
  snapshot: number
  strategies: Array<{
    name: string
    params: Record<string, any>
  }>
  votes: Array<{
    voter: string
    choice: number
    vp: number
    reason?: string
  }>
  choices: string[]
  scores: number[]
  scores_total: number
  quorum: number
  space: {
    id: string
    name: string
  }
}

interface VotingPower {
  address: string
  vp: number
  tokens: Record<string, number>
}

const mockSnapshotProposals: SnapshotProposal[] = [
  {
    id: '0x1234...5678',
    title: 'Community Treasury Allocation for Q3 2024',
    description: 'Allocate 50,000 USDC from treasury for community development initiatives',
    content: 'This proposal outlines the allocation of community treasury funds for Q3 2024. The funds will be used for: 1) Developer grants (25,000 USDC), 2) Marketing campaigns (15,000 USDC), 3) Community events (10,000 USDC).',
    author: '0xabcd...ef12',
    status: 'active',
    start: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    snapshot: 18500000,
    strategies: [
      {
        name: 'erc20-balance-of',
        params: {
          address: '0x1234...5678',
          symbol: 'GOV',
          decimals: 18
        }
      }
    ],
    votes: [
      {
        voter: '0x1111...2222',
        choice: 1,
        vp: 15000,
        reason: 'Support the community development initiatives'
      },
      {
        voter: '0x3333...4444',
        choice: 1,
        vp: 8500,
        reason: 'Good allocation strategy'
      }
    ],
    choices: ['For', 'Against', 'Abstain'],
    scores: [23500, 12000, 3000],
    scores_total: 38500,
    quorum: 25000,
    space: {
      id: 'currentdao.eth',
      name: 'CurrentDAO'
    }
  },
  {
    id: '0x5678...9abc',
    title: 'Protocol Fee Reduction from 0.3% to 0.2%',
    description: 'Reduce protocol fees to make the platform more competitive',
    content: 'This proposal suggests reducing the protocol fee from 0.3% to 0.2% to increase competitiveness and attract more users to the platform.',
    author: '0xdef0...1234',
    status: 'closed',
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    snapshot: 18450000,
    strategies: [
      {
        name: 'erc20-balance-of',
        params: {
          address: '0x1234...5678',
          symbol: 'GOV',
          decimals: 18
        }
      }
    ],
    votes: [
      {
        voter: '0x5555...6666',
        choice: 1,
        vp: 12000
      },
      {
        voter: '0x7777...8888',
        choice: 2,
        vp: 8000
      }
    ],
    choices: ['For', 'Against'],
    scores: [45000, 32000],
    scores_total: 77000,
    quorum: 50000,
    space: {
      id: 'currentdao.eth',
      name: 'CurrentDAO'
    }
  }
]

const mockVotingPower: VotingPower = {
  address: '0x1234...5678',
  vp: 15000,
  tokens: {
    'GOV': 15000,
    'veGOV': 7500
  }
}

export function SnapshotVoting() {
  const [proposals, setProposals] = useState<SnapshotProposal[]>(mockSnapshotProposals)
  const [votingPower, setVotingPower] = useState<VotingPower>(mockVotingPower)
  const [selectedProposal, setSelectedProposal] = useState<SnapshotProposal | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'closed' | 'pending'>('all')
  const [isVoting, setIsVoting] = useState(false)
  const [votingChoice, setVotingChoice] = useState<number | null>(null)
  const [voteReason, setVoteReason] = useState('')

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = searchTerm === '' || 
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || proposal.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const handleVote = async (proposal: SnapshotProposal, choice: number, reason?: string) => {
    setIsVoting(true)
    
    try {
      // Simulate off-chain voting with signature
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update proposal with new vote
      const updatedProposals = proposals.map(p => {
        if (p.id === proposal.id) {
          const newVote = {
            voter: votingPower.address,
            choice,
            vp: votingPower.vp,
            reason
          }
          
          const updatedVotes = [...p.votes, newVote]
          const updatedScores = [...p.scores]
          updatedScores[choice - 1] += votingPower.vp
          
          return {
            ...p,
            votes: updatedVotes,
            scores: updatedScores,
            scores_total: p.scores_total + votingPower.vp
          }
        }
        return p
      })
      
      setProposals(updatedProposals)
      setVotingChoice(null)
      setVoteReason('')
      setSelectedProposal(null)
      
      alert('Vote submitted successfully!')
    } catch (error) {
      alert('Failed to submit vote. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  const getProposalStatus = (proposal: SnapshotProposal) => {
    if (proposal.status === 'closed') return { color: 'text-gray-600 bg-gray-100', text: 'Closed' }
    if (proposal.status === 'pending') return { color: 'text-yellow-600 bg-yellow-100', text: 'Pending' }
    
    const now = new Date()
    if (now < proposal.start) return { color: 'text-blue-600 bg-blue-100', text: 'Upcoming' }
    if (now > proposal.end) return { color: 'text-gray-600 bg-gray-100', text: 'Ended' }
    return { color: 'text-green-600 bg-green-100', text: 'Active' }
  }

  const getTimeRemaining = (end: Date) => {
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const exportResults = (proposal: SnapshotProposal) => {
    const results = {
      proposal: {
        id: proposal.id,
        title: proposal.title,
        description: proposal.description,
        status: proposal.status,
        start: proposal.start.toISOString(),
        end: proposal.end.toISOString(),
        snapshot: proposal.snapshot,
        quorum: proposal.quorum
      },
      votes: proposal.votes,
      choices: proposal.choices,
      scores: proposal.scores,
      scores_total: proposal.scores_total
    }
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `snapshot-results-${proposal.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasVoted = (proposal: SnapshotProposal) => {
    return proposal.votes.some(vote => vote.voter === votingPower.address)
  }

  const getUserVote = (proposal: SnapshotProposal) => {
    const userVote = proposal.votes.find(vote => vote.voter === votingPower.address)
    return userVote ? userVote.choice : null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Snapshot Voting</h2>
          <p className="text-muted-foreground">Off-chain governance voting with no gas fees</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold">{votingPower.vp.toLocaleString()} VP</div>
            <div className="text-sm text-muted-foreground">Your voting power</div>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Create Proposal
          </button>
        </div>
      </div>

      {/* Voting Power Breakdown */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Your Voting Power</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{votingPower.vp.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total VP</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{votingPower.tokens['GOV'].toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">GOV Tokens</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{votingPower.tokens['veGOV'].toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">veGOV Tokens</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Snapshot #{mockSnapshotProposals[0]?.snapshot.toLocaleString()} • Voting power calculated at snapshot block
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search proposals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map((proposal) => {
          const status = getProposalStatus(proposal)
          const userVoted = hasVoted(proposal)
          const userChoice = getUserVote(proposal)
          const quorumReached = proposal.scores_total >= proposal.quorum
          
          return (
            <div key={proposal.id} className="bg-card border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{proposal.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                    {userVoted && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                        Voted
                      </span>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground mb-3">{proposal.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{proposal.votes.length} votes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>{proposal.scores_total.toLocaleString()} VP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{getTimeRemaining(proposal.end)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Quorum: {quorumReached ? '✅' : '❌'} {proposal.scores_total.toLocaleString()}/{proposal.quorum.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedProposal(proposal)}
                    className="p-2 hover:bg-accent rounded-lg"
                  >
                    <div className="w-4 h-4">👁️</div>
                  </button>
                  <button
                    onClick={() => exportResults(proposal)}
                    className="p-2 hover:bg-accent rounded-lg"
                  >
                    <div className="w-4 h-4">📥</div>
                  </button>
                </div>
              </div>
              
              {/* Voting Results */}
              <div className="space-y-2">
                {proposal.choices.map((choice, index) => {
                  const percentage = proposal.scores_total > 0 
                    ? (proposal.scores[index] / proposal.scores_total * 100).toFixed(1)
                    : '0'
                  
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <span className="w-20 text-sm">{choice}</span>
                      <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                          {proposal.scores[index].toLocaleString()} VP ({percentage}%)
                        </span>
                      </div>
                      {userChoice === index + 1 && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* Voting Actions */}
              {proposal.status === 'active' && !userVoted && (
                <div className="mt-4 pt-4 border-t">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {proposal.choices.map((choice, index) => (
                        <button
                          key={index}
                          onClick={() => setVotingChoice(index + 1)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            votingChoice === index + 1
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-accent'
                          }`}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                    
                    <textarea
                      placeholder="Reason for your vote (optional)"
                      value={voteReason}
                      onChange={(e) => setVoteReason(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg resize-none"
                      rows={2}
                    />
                    
                    <button
                      onClick={() => votingChoice && handleVote(proposal, votingChoice, voteReason)}
                      disabled={!votingChoice || isVoting}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isVoting ? 'Submitting...' : 'Submit Vote'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

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
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p>{selectedProposal.description}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Content</h3>
                <div className="prose max-w-none">
                  <p>{selectedProposal.content}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Proposal Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Status:</strong> {getProposalStatus(selectedProposal).text}</div>
                    <div><strong>Author:</strong> {selectedProposal.author}</div>
                    <div><strong>Start:</strong> {selectedProposal.start.toLocaleDateString()}</div>
                    <div><strong>End:</strong> {selectedProposal.end.toLocaleDateString()}</div>
                    <div><strong>Snapshot:</strong> #{selectedProposal.snapshot.toLocaleString()}</div>
                    <div><strong>Quorum:</strong> {selectedProposal.quorum.toLocaleString()} VP</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Results</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Total Votes:</strong> {selectedProposal.votes.length}</div>
                    <div><strong>Total VP:</strong> {selectedProposal.scores_total.toLocaleString()}</div>
                    <div><strong>Quorum Reached:</strong> {selectedProposal.scores_total >= selectedProposal.quorum ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Votes</h3>
                <div className="space-y-2">
                  {selectedProposal.votes.map((vote, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{vote.voter}</div>
                        <div className="text-sm text-muted-foreground">
                          Voted: {selectedProposal.choices[vote.choice - 1]}
                        </div>
                        {vote.reason && (
                          <div className="text-sm text-muted-foreground mt-1">"{vote.reason}"</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{vote.vp.toLocaleString()} VP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
