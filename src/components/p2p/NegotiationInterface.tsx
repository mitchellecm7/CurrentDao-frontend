import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  DollarSign,
  Clock,
  Calendar,
  FileText,
  Paperclip,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  User,
  MapPin,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Plus,
  Minus,
  Eye,
  Download,
  Upload,
  BarChart3,
} from 'lucide-react';
import { 
  P2PNegotiation, 
  P2PMessage, 
  P2PNegotiationOffer, 
  P2PUser 
} from '@/types/p2p';

interface NegotiationInterfaceProps {
  negotiations: P2PNegotiation[];
  selectedNegotiation: P2PNegotiation | null;
  onSendMessage: (negotiationId: string, message: string, type?: P2PMessage['type']) => Promise<void>;
  onCounterOffer: (negotiationId: string, offer: Omit<P2PNegotiationOffer, 'id' | 'createdAt'>) => Promise<void>;
  onAcceptOffer: (negotiationId: string, offerId: string) => Promise<void>;
  onRejectOffer: (negotiationId: string, offerId: string) => Promise<void>;
}

export const NegotiationInterface: React.FC<NegotiationInterfaceProps> = ({
  negotiations,
  selectedNegotiation,
  onSendMessage,
  onCounterOffer,
  onAcceptOffer,
  onRejectOffer
}) => {
  const [message, setMessage] = useState('');
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [counterOfferData, setCounterOfferData] = useState({
    quantity: 0,
    pricePerUnit: 0,
    deliveryStart: '',
    deliveryEnd: '',
    customTerms: ''
  });
  const [activeTab, setActiveTab] = useState<'messages' | 'offers' | 'details'>('messages');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedNegotiation?.messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedNegotiation) return;
    
    await onSendMessage(selectedNegotiation.id, message);
    setMessage('');
  };

  const handleCounterOffer = async () => {
    if (!selectedNegotiation) return;
    
    await onCounterOffer(selectedNegotiation.id, {
      proposerId: 'current-user', // This would come from auth context
      proposerName: 'Current User',
      quantity: counterOfferData.quantity,
      pricePerUnit: counterOfferData.pricePerUnit,
      deliveryTimeframe: {
        start: counterOfferData.deliveryStart,
        end: counterOfferData.deliveryEnd
      },
      customTerms: counterOfferData.customTerms,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    setShowCounterOffer(false);
    setCounterOfferData({
      quantity: 0,
      pricePerUnit: 0,
      deliveryStart: '',
      deliveryEnd: '',
      customTerms: ''
    });
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNegotiationList = () => (
    <div className="space-y-4">
      {negotiations.map((negotiation) => (
        <motion.div
          key={negotiation.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => {
            // This would be handled by parent component
            console.log('Select negotiation:', negotiation.id);
          }}
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {negotiation.offer.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {negotiation.offer.energyType} • {negotiation.offer.quantity} MWh
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                negotiation.status === 'active' ? 'bg-green-100 text-green-800' :
                negotiation.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                negotiation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {negotiation.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {negotiation.messages.length} messages
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatMessageDate(negotiation.updatedAt)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                ${negotiation.currentOffer?.pricePerUnit || negotiation.offer.pricePerUnit}/MWh
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderMessages = () => {
    if (!selectedNegotiation) return null;

    const groupedMessages: { [date: string]: P2PMessage[] } = {};
    selectedNegotiation.messages.forEach(msg => {
      const date = formatMessageDate(msg.timestamp);
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(msg);
    });

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.entries(groupedMessages).map(([date, messages]) => (
            <div key={date}>
              <div className="text-center text-sm text-gray-500 mb-3">
                {date}
              </div>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex mb-4 ${
                    msg.senderId === 'current-user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`max-w-xs lg:max-w-md ${
                    msg.senderId === 'current-user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  } rounded-lg px-4 py-2`}>
                    {msg.type !== 'text' && (
                      <div className="flex items-center gap-2 mb-1 text-xs opacity-75">
                        {msg.type === 'offer' && <DollarSign className="w-3 h-3" />}
                        {msg.type === 'system' && <AlertCircle className="w-3 h-3" />}
                        {msg.type}
                      </div>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <div className={`text-xs mt-1 ${
                      msg.senderId === 'current-user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatMessageTime(msg.timestamp)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => document.getElementById('file-upload')?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={(e) => {
              // Handle file upload
              console.log('File upload:', e.target.files);
            }}
          />
        </div>
      </div>
    );
  };

  const renderOffers = () => {
    if (!selectedNegotiation) return null;

    return (
      <div className="space-y-4">
        {/* Original Offer */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Original Offer</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Quantity</label>
              <p className="text-lg font-semibold">{selectedNegotiation.offer.quantity} MWh</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Price per Unit</label>
              <p className="text-lg font-semibold">${selectedNegotiation.offer.pricePerUnit}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Delivery Start</label>
              <p className="text-sm">{new Date(selectedNegotiation.offer.deliveryTimeframe.start).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Delivery End</label>
              <p className="text-sm">{new Date(selectedNegotiation.offer.deliveryTimeframe.end).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Negotiation Offers */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Negotiation History</h3>
          {selectedNegotiation.offers.map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900">{offer.proposerName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(offer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {offer.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Quantity:</span>
                  <span className="ml-2 font-medium">{offer.quantity} MWh</span>
                </div>
                <div>
                  <span className="text-gray-500">Price:</span>
                  <span className="ml-2 font-medium">${offer.pricePerUnit}/MWh</span>
                </div>
              </div>
              
              {offer.customTerms && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                  {offer.customTerms}
                </div>
              )}
              
              {offer.status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onAcceptOffer(selectedNegotiation.id, offer.id)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => onRejectOffer(selectedNegotiation.id, offer.id)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Counter Offer Form */}
        {showCounterOffer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Make Counter Offer</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (MWh)
                </label>
                <input
                  type="number"
                  value={counterOfferData.quantity}
                  onChange={(e) => setCounterOfferData({...counterOfferData, quantity: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Unit ($)
                </label>
                <input
                  type="number"
                  value={counterOfferData.pricePerUnit}
                  onChange={(e) => setCounterOfferData({...counterOfferData, pricePerUnit: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Start
                </label>
                <input
                  type="date"
                  value={counterOfferData.deliveryStart}
                  onChange={(e) => setCounterOfferData({...counterOfferData, deliveryStart: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery End
                </label>
                <input
                  type="date"
                  value={counterOfferData.deliveryEnd}
                  onChange={(e) => setCounterOfferData({...counterOfferData, deliveryEnd: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Terms (Optional)
              </label>
              <textarea
                value={counterOfferData.customTerms}
                onChange={(e) => setCounterOfferData({...counterOfferData, customTerms: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional terms or conditions..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCounterOffer}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit Counter Offer
              </button>
              <button
                onClick={() => setShowCounterOffer(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {!showCounterOffer && (
          <button
            onClick={() => setShowCounterOffer(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Make Counter Offer
          </button>
        )}
      </div>
    );
  };

  const renderDetails = () => {
    if (!selectedNegotiation) return null;

    return (
      <div className="space-y-6">
        {/* Offer Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Details</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{selectedNegotiation.offer.title}</h4>
              <p className="text-gray-600">{selectedNegotiation.offer.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Energy Type</label>
                <p className="text-sm">{selectedNegotiation.offer.energyType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-sm">{selectedNegotiation.offer.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Delivery Method</label>
                <p className="text-sm">{selectedNegotiation.offer.deliveryMethod}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-sm">{selectedNegotiation.offer.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Participants</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedNegotiation.buyer.name}</p>
                  <p className="text-sm text-gray-500">Buyer</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {selectedNegotiation.buyer.reputationScore}
                </div>
                <p className="text-xs text-gray-500">
                  {selectedNegotiation.buyer.totalTrades} trades
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedNegotiation.seller.name}</p>
                  <p className="text-sm text-gray-500">Seller</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {selectedNegotiation.seller.reputationScore}
                </div>
                <p className="text-xs text-gray-500">
                  {selectedNegotiation.seller.totalTrades} trades
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Negotiation Started</p>
                <p className="text-xs text-gray-500">
                  {new Date(selectedNegotiation.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                <p className="text-xs text-gray-500">
                  {new Date(selectedNegotiation.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Expires</p>
                <p className="text-xs text-gray-500">
                  {new Date(selectedNegotiation.expiresAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!selectedNegotiation) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Negotiations</h2>
          {renderNegotiationList()}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedNegotiation.offer.title}
            </h2>
            <p className="text-sm text-gray-500">
              {selectedNegotiation.offer.energyType} • {selectedNegotiation.offer.quantity} MWh
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              selectedNegotiation.status === 'active' ? 'bg-green-100 text-green-800' :
              selectedNegotiation.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
              selectedNegotiation.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {selectedNegotiation.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-4">
          {[
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'offers', label: 'Offers', icon: DollarSign },
            { id: 'details', label: 'Details', icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-colors ${
                activeTab === id
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

      {/* Content */}
      <div className="h-96">
        {activeTab === 'messages' && renderMessages()}
        {activeTab === 'offers' && <div className="p-6 overflow-y-auto h-full">{renderOffers()}</div>}
        {activeTab === 'details' && <div className="p-6 overflow-y-auto h-full">{renderDetails()}</div>}
      </div>
    </div>
  );
};

export default NegotiationInterface;
