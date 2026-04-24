import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Shield,
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Plus,
  ArrowRight,
  Activity,
  BarChart3,
} from 'lucide-react';
import { NegotiationInterface } from './NegotiationInterface';
import { ReputationSystem } from './ReputationSystem';
import { DisputeResolution } from './DisputeResolution';
import { useP2PTrading } from '@/hooks/useP2PTrading';
import { 
  P2POffer, 
  P2PNegotiation, 
  P2PDispute, 
  P2PUser,
  TradingFilters 
} from '@/types/p2p';

interface P2PTradingProps {
  className?: string;
  userId?: string;
  initialView?: 'marketplace' | 'negotiations' | 'reputation' | 'disputes';
}

export const P2PTrading: React.FC<P2PTradingProps> = ({
  className = '',
  userId,
  initialView = 'marketplace'
}) => {
  const [activeView, setActiveView] = useState(initialView);
  const [selectedOffer, setSelectedOffer] = useState<P2POffer | null>(null);
  const [selectedNegotiation, setSelectedNegotiation] = useState<P2PNegotiation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TradingFilters>({
    energyType: 'all',
    priceRange: { min: 0, max: 1000 },
    location: 'all',
    reputationMin: 0,
    status: 'active'
  });

  const {
    offers,
    negotiations,
    disputes,
    currentUser,
    stats,
    isLoading,
    error,
    createOffer,
    acceptOffer,
    counterOffer,
    rejectOffer,
    sendMessage,
    createDispute,
    resolveDispute,
    refreshData
  } = useP2PTrading(userId);

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEnergyType = filters.energyType === 'all' || offer.energyType === filters.energyType;
    const matchesPrice = offer.pricePerUnit >= filters.priceRange.min && 
                        offer.pricePerUnit <= filters.priceRange.max;
    const matchesLocation = filters.location === 'all' || offer.location === filters.location;
    const matchesReputation = offer.seller.reputationScore >= filters.reputationMin;
    const matchesStatus = filters.status === 'all' || offer.status === filters.status;

    return matchesSearch && matchesEnergyType && matchesPrice && 
           matchesLocation && matchesReputation && matchesStatus;
  });

  const handleCreateOffer = () => {
    // This would open a modal to create a new offer
    console.log('Create new offer');
  };

  const handleViewNegotiation = (negotiation: P2PNegotiation) => {
    setSelectedNegotiation(negotiation);
    setActiveView('negotiations');
  };

  const handleViewDispute = (dispute: P2PDispute) => {
    setActiveView('disputes');
  };

  const renderMarketplace = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Active Offers</span>
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.activeOffers}</div>
          <div className="text-sm text-green-600">+12% this week</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Ongoing Negotiations</span>
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.ongoingNegotiations}</div>
          <div className="text-sm text-gray-500">3 pending responses</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Success Rate</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.successRate}%</div>
          <div className="text-sm text-green-600">Above average</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Your Reputation</span>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{currentUser?.reputationScore || 0}</div>
          <div className="text-sm text-gray-500">Top 15% trader</div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search energy offers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filters.energyType}
              onChange={(e) => setFilters({ ...filters, energyType: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Energy Types</option>
              <option value="solar">Solar</option>
              <option value="wind">Wind</option>
              <option value="hydro">Hydro</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={handleCreateOffer}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Offer
            </button>
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOffers.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{offer.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {offer.energyType}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${offer.pricePerUnit}/MWh
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      {offer.quantity} MWh
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    offer.status === 'active' ? 'bg-green-100 text-green-800' :
                    offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {offer.status}
                  </span>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {offer.seller.reputationScore}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{offer.seller.name}</p>
                    <p className="text-xs text-gray-500">{offer.location}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedOffer(offer)}
                    className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => acceptOffer(offer.id)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Negotiate
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="bg-white border-b border-gray-200">
      <div className="flex space-x-8 px-4">
        {[
          { id: 'marketplace', label: 'Marketplace', icon: BarChart3 },
          { id: 'negotiations', label: 'Negotiations', icon: MessageSquare },
          { id: 'reputation', label: 'Reputation', icon: Star },
          { id: 'disputes', label: 'Disputes', icon: Shield },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id as any)}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-colors ${
              activeView === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'marketplace':
        return renderMarketplace();
      case 'negotiations':
        return (
          <NegotiationInterface
            negotiations={negotiations}
            selectedNegotiation={selectedNegotiation}
            onSendMessage={sendMessage}
            onCounterOffer={counterOffer}
            onAcceptOffer={acceptOffer}
            onRejectOffer={rejectOffer}
          />
        );
      case 'reputation':
        return (
          <ReputationSystem
            currentUser={currentUser}
            users={offers.map(offer => offer.seller)}
          />
        );
      case 'disputes':
        return (
          <DisputeResolution
            disputes={disputes}
            onCreateDispute={createDispute}
            onResolveDispute={resolveDispute}
          />
        );
      default:
        return renderMarketplace();
    }
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Error Loading P2P Trading</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">P2P Energy Trading</h1>
            <p className="text-sm text-gray-500">
              Direct energy trading with negotiation, reputation, and dispute resolution
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Activity className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {renderNavigation()}

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Activity className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading P2P trading data...</span>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default P2PTrading;
