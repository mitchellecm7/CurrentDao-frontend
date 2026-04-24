import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Upload,
  Download,
  Eye,
  Search,
  Filter,
  Plus,
  Scale,
  Gavel,
  Users,
  Calendar,
  Tag,
  Paperclip,
  Send,
  BarChart3,
  TrendingUp,
  Award,
  Activity,
} from 'lucide-react';
import { 
  P2PDispute, 
  P2PDisputeResolution, 
  P2PDisputeEvent,
  P2PEvidence 
} from '@/types/p2p';

interface DisputeResolutionProps {
  disputes: P2PDispute[];
  onCreateDispute: (negotiationId: string, type: P2PDispute['type'], description: string) => Promise<string>;
  onResolveDispute: (disputeId: string, resolution: P2PDisputeResolution) => Promise<void>;
}

export const DisputeResolution: React.FC<DisputeResolutionProps> = ({
  disputes,
  onCreateDispute,
  onResolveDispute
}) => {
  const [selectedDispute, setSelectedDispute] = useState<P2PDispute | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'investigating' | 'resolved' | 'escalated'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  const [newDispute, setNewDispute] = useState({
    negotiationId: '',
    type: 'delivery' as P2PDispute['type'],
    description: ''
  });

  const [resolution, setResolution] = useState({
    outcome: 'compromise' as P2PDisputeResolution['outcome'],
    description: '',
    actions: [] as string[],
    refundAmount: 0,
    reputationImpact: {
      buyer: 0,
      seller: 0
    }
  });

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.initiator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.respondent.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || dispute.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || dispute.severity === filterSeverity;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getSeverityColor = (severity: P2PDispute['severity']) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: P2PDispute['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: P2PDispute['type']) => {
    switch (type) {
      case 'delivery': return <Activity className="w-4 h-4" />;
      case 'quality': return <Shield className="w-4 h-4" />;
      case 'payment': return <FileText className="w-4 h-4" />;
      case 'communication': return <MessageSquare className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleCreateDispute = async () => {
    if (!newDispute.negotiationId || !newDispute.description.trim()) return;
    
    await onCreateDispute(newDispute.negotiationId, newDispute.type, newDispute.description);
    setNewDispute({ negotiationId: '', type: 'delivery', description: '' });
    setShowCreateForm(false);
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute || !resolution.description.trim()) return;
    
    await onResolveDispute(selectedDispute.id, {
      ...resolution,
      resolvedBy: 'current-user', // Would come from auth context
      resolvedAt: new Date().toISOString()
    });
    setResolution({
      outcome: 'compromise',
      description: '',
      actions: [],
      refundAmount: 0,
      reputationImpact: { buyer: 0, seller: 0 }
    });
    setShowResolutionForm(false);
  };

  const renderDisputeList = () => (
    <div className="space-y-4">
      {filteredDisputes.map((dispute) => (
        <motion.div
          key={dispute.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setSelectedDispute(dispute)}
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(dispute.type)}
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {dispute.type} Dispute
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(dispute.severity)}`}>
                    {dispute.severity}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dispute.status)}`}>
                    {dispute.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{dispute.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {dispute.initiator.name} vs {dispute.respondent.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {dispute.evidence.length} evidence
                </div>
                <div className="text-sm text-gray-500">
                  {dispute.timeline.length} events
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderDisputeDetails = () => {
    if (!selectedDispute) return null;

    return (
      <div className="space-y-6">
        {/* Dispute Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {getTypeIcon(selectedDispute.type)}
              <div>
                <h2 className="text-xl font-bold text-gray-900 capitalize">
                  {selectedDispute.type} Dispute
                </h2>
                <p className="text-sm text-gray-500">
                  ID: {selectedDispute.id}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSeverityColor(selectedDispute.severity)}`}>
                {selectedDispute.severity}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedDispute.status)}`}>
                {selectedDispute.status}
              </span>
            </div>
          </div>

          <p className="text-gray-700 mb-4">{selectedDispute.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Initiator</h4>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{selectedDispute.initiator.name}</p>
                  <p className="text-sm text-gray-500">Reputation: {selectedDispute.initiator.reputationScore}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Respondent</h4>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{selectedDispute.respondent.name}</p>
                  <p className="text-sm text-gray-500">Reputation: {selectedDispute.respondent.reputationScore}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidence</h3>
          <div className="space-y-3">
            {selectedDispute.evidence.map((evidence) => (
              <div key={evidence.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{evidence.name}</p>
                    <p className="text-sm text-gray-500">{evidence.description}</p>
                    <p className="text-xs text-gray-400">
                      Uploaded by {evidence.uploadedBy} • {new Date(evidence.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {evidence.verified && (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                  <button className="text-blue-600 hover:text-blue-800">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-800">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
          <div className="space-y-4">
            {selectedDispute.timeline.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1 ${
                  event.type === 'resolved' ? 'bg-green-500' :
                  event.type === 'escalated' ? 'bg-red-500' :
                  event.type === 'investigating' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{event.description}</p>
                  <p className="text-sm text-gray-500">
                    {event.actorName} • {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Actions */}
        {selectedDispute.status !== 'resolved' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Actions</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResolutionForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Gavel className="w-4 h-4" />
                Resolve Dispute
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Upload className="w-4 h-4" />
                Add Evidence
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageSquare className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCreateForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Dispute</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Negotiation ID
          </label>
          <input
            type="text"
            value={newDispute.negotiationId}
            onChange={(e) => setNewDispute({...newDispute, negotiationId: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter negotiation ID"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dispute Type
          </label>
          <select
            value={newDispute.type}
            onChange={(e) => setNewDispute({...newDispute, type: e.target.value as P2PDispute['type']})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="delivery">Delivery Issue</option>
            <option value="quality">Quality Issue</option>
            <option value="payment">Payment Issue</option>
            <option value="communication">Communication Issue</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={newDispute.description}
            onChange={(e) => setNewDispute({...newDispute, description: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the issue in detail..."
          />
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleCreateDispute}
            disabled={!newDispute.negotiationId || !newDispute.description.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Create Dispute
          </button>
          <button
            onClick={() => setShowCreateForm(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderResolutionForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolve Dispute</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Outcome
          </label>
          <select
            value={resolution.outcome}
            onChange={(e) => setResolution({...resolution, outcome: e.target.value as P2PDisputeResolution['outcome']})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="buyer_favor">Buyer Favor</option>
            <option value="seller_favor">Seller Favor</option>
            <option value="compromise">Compromise</option>
            <option value="partial_refund">Partial Refund</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resolution Description
          </label>
          <textarea
            value={resolution.description}
            onChange={(e) => setResolution({...resolution, description: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the resolution..."
          />
        </div>
        
        {(resolution.outcome === 'partial_refund' || resolution.outcome === 'buyer_favor') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refund Amount ($)
            </label>
            <input
              type="number"
              value={resolution.refundAmount}
              onChange={(e) => setResolution({...resolution, refundAmount: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buyer Reputation Impact
            </label>
            <input
              type="number"
              value={resolution.reputationImpact.buyer}
              onChange={(e) => setResolution({
                ...resolution, 
                reputationImpact: {...resolution.reputationImpact, buyer: Number(e.target.value)}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seller Reputation Impact
            </label>
            <input
              type="number"
              value={resolution.reputationImpact.seller}
              onChange={(e) => setResolution({
                ...resolution, 
                reputationImpact: {...resolution.reputationImpact, seller: Number(e.target.value)}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.0"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleResolveDispute}
            disabled={!resolution.description.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            Resolve Dispute
          </button>
          <button
            onClick={() => setShowResolutionForm(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dispute Resolution</h2>
            <p className="text-gray-600">
              Manage and resolve trading disputes with fair and transparent processes
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Dispute
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{disputes.length}</div>
            <div className="text-sm text-gray-500">Total Disputes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {disputes.filter(d => d.status === 'investigating').length}
            </div>
            <div className="text-sm text-gray-500">Investigating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {disputes.filter(d => d.status === 'resolved').length}
            </div>
            <div className="text-sm text-gray-500">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">88.5%</div>
            <div className="text-sm text-gray-500">Resolution Rate</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search disputes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispute List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Disputes ({filteredDisputes.length})
              </h3>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {renderDisputeList()}
            </div>
          </div>
        </div>

        {/* Dispute Details */}
        <div className="lg:col-span-2">
          {selectedDispute ? (
            renderDisputeDetails()
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Dispute Selected</h3>
              <p className="text-gray-600">Select a dispute from the list to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Forms */}
      {showCreateForm && renderCreateForm()}
      {showResolutionForm && renderResolutionForm()}
    </div>
  );
};

export default DisputeResolution;
