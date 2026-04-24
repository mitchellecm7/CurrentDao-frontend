import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Activity,
  Target,
  Bell,
  BellOff,
  Settings,
  RefreshCw,
  Eye,
  ExternalLink,
  Filter,
  Search
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { usePushNotifications } from '../../hooks/usePushNotifications';

interface TradeNotification {
  id: string;
  type: 'order_filled' | 'order_cancelled' | 'order_partial' | 'price_match' | 'execution_failed' | 'confirmation_required';
  status: 'success' | 'pending' | 'failed' | 'warning';
  orderId: string;
  userId: string;
  commodity: string;
  amount: number;
  price: number;
  totalValue: number;
  direction: 'buy' | 'sell';
  timestamp: Date;
  exchange?: string;
  region?: string;
  counterpart?: string;
  executionTime?: number; // in milliseconds
  confirmationRequired?: boolean;
  confirmationDeadline?: Date;
  metadata?: {
    originalAmount?: number;
    filledAmount?: number;
    remainingAmount?: number;
    averagePrice?: number;
    fees?: number;
    gasUsed?: number;
    transactionHash?: string;
    blockNumber?: number;
  };
  actions?: TradeAction[];
}

interface TradeAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  handler: () => void | Promise<void>;
  icon?: string;
  url?: string;
}

interface TradeNotificationsProps {
  className?: string;
}

const TradeNotifications: React.FC<TradeNotificationsProps> = ({ className = '' }) => {
  const { addNotification } = useNotifications();
  const { isSubscribed } = usePushNotifications();
  
  const [notifications, setNotifications] = useState<TradeNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'pending' | 'failed' | 'warning'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize with sample notifications
  useEffect(() => {
    const sampleNotifications: TradeNotification[] = [
      {
        id: '1',
        type: 'order_filled',
        status: 'success',
        orderId: 'ORD-2024-001',
        userId: 'user-123',
        commodity: 'electricity',
        amount: 100,
        price: 45.50,
        totalValue: 4550,
        direction: 'buy',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        exchange: 'CurrentDAO',
        region: 'US-East',
        counterpart: 'EnergyCorp',
        executionTime: 250,
        metadata: {
          originalAmount: 100,
          filledAmount: 100,
          averagePrice: 45.50,
          fees: 2.25,
          transactionHash: '0x1234...5678',
          blockNumber: 18500000
        },
        actions: [
          {
            id: 'view-details',
            label: 'View Details',
            type: 'primary',
            handler: () => console.log('View trade details'),
            url: '/trades/ORD-2024-001'
          },
          {
            id: 'view-receipt',
            label: 'Download Receipt',
            type: 'secondary',
            handler: () => console.log('Download receipt')
          }
        ]
      },
      {
        id: '2',
        type: 'confirmation_required',
        status: 'pending',
        orderId: 'ORD-2024-002',
        userId: 'user-123',
        commodity: 'natural-gas',
        amount: 500,
        price: 3.25,
        totalValue: 1625,
        direction: 'sell',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        exchange: 'CurrentDAO',
        region: 'EU-West',
        confirmationRequired: true,
        confirmationDeadline: new Date(Date.now() + 30 * 60 * 1000),
        metadata: {
          originalAmount: 500,
          fees: 8.12
        },
        actions: [
          {
            id: 'confirm',
            label: 'Confirm Trade',
            type: 'primary',
            handler: () => console.log('Confirm trade')
          },
          {
            id: 'cancel',
            label: 'Cancel',
            type: 'danger',
            handler: () => console.log('Cancel trade')
          }
        ]
      },
      {
        id: '3',
        type: 'execution_failed',
        status: 'failed',
        orderId: 'ORD-2024-003',
        userId: 'user-123',
        commodity: 'solar',
        amount: 200,
        price: 38.75,
        totalValue: 7750,
        direction: 'buy',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        exchange: 'CurrentDAO',
        metadata: {
          originalAmount: 200,
          gasUsed: 21000,
          errorMessage: 'Insufficient liquidity'
        },
        actions: [
          {
            id: 'retry',
            label: 'Retry Order',
            type: 'primary',
            handler: () => console.log('Retry order')
          },
          {
            id: 'modify',
            label: 'Modify Order',
            type: 'secondary',
            handler: () => console.log('Modify order')
          }
        ]
      }
    ];
    setNotifications(sampleNotifications);
  }, []);

  // Simulate real-time trade updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Randomly generate new trade notifications for demo
      if (Math.random() > 0.8) {
        const types: TradeNotification['type'][] = ['order_filled', 'order_partial', 'price_match'];
        const statuses: TradeNotification['status'][] = ['success', 'pending'];
        const directions: TradeNotification['direction'][] = ['buy', 'sell'];
        const commodities = ['electricity', 'natural-gas', 'solar', 'wind'];
        
        const newNotification: TradeNotification = {
          id: Date.now().toString(),
          type: types[Math.floor(Math.random() * types.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          orderId: `ORD-${Date.now()}`,
          userId: 'user-123',
          commodity: commodities[Math.floor(Math.random() * commodities.length)],
          amount: Math.floor(Math.random() * 500) + 50,
          price: Math.random() * 100 + 20,
          totalValue: 0,
          direction: directions[Math.floor(Math.random() * directions.length)],
          timestamp: new Date(),
          exchange: 'CurrentDAO',
          executionTime: Math.floor(Math.random() * 1000) + 100
        };

        newNotification.totalValue = newNotification.amount * newNotification.price;

        setNotifications(prev => [newNotification, ...prev]);
        
        // Trigger in-app notification
        triggerTradeNotification(newNotification);
      }
    }, 20000); // Check every 20 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Trigger trade notification
  const triggerTradeNotification = useCallback((notification: TradeNotification) => {
    const typeMap = {
      order_filled: 'success',
      order_cancelled: 'warning',
      order_partial: 'info',
      price_match: 'info',
      execution_failed: 'error',
      confirmation_required: 'warning'
    } as const;

    const titleMap = {
      order_filled: `Order ${notification.orderId} Filled`,
      order_cancelled: `Order ${notification.orderId} Cancelled`,
      order_partial: `Order ${notification.orderId} Partially Filled`,
      price_match: `Price Match Found for ${notification.orderId}`,
      execution_failed: `Order ${notification.orderId} Failed`,
      confirmation_required: `Confirmation Required for ${notification.orderId}`
    };

    const messageMap = {
      order_filled: `${notification.direction === 'buy' ? 'Bought' : 'Sold'} ${notification.amount} MWh at $${notification.price}/MWh`,
      order_cancelled: `Order for ${notification.amount} MWh was cancelled`,
      order_partial: `${notification.metadata?.filledAmount || 0} of ${notification.amount} MWh filled`,
      price_match: `Matching price found: $${notification.price}/MWh`,
      execution_failed: `Failed to execute order: ${notification.metadata?.errorMessage || 'Unknown error'}`,
      confirmation_required: `Please confirm your ${notification.direction} order for ${notification.amount} MWh`
    };

    addNotification({
      type: typeMap[notification.type],
      category: 'trading',
      title: titleMap[notification.type],
      message: messageMap[notification.type],
      priority: notification.status === 'failed' ? 'high' : 'medium',
      read: false,
      source: 'trade-notifications',
      metadata: {
        orderId: notification.orderId,
        commodity: notification.commodity,
        amount: notification.amount,
        price: notification.price,
        direction: notification.direction
      },
      actions: notification.actions?.map(action => ({
        id: action.id,
        label: action.label,
        action: action.type,
        handler: action.handler
      }))
    });

    // Send push notification if subscribed
    if (isSubscribed) {
      console.log('Push notification sent:', titleMap[notification.type]);
    }
  }, [addNotification, isSubscribed]);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.status === filter;
  }).filter(notification => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      notification.orderId.toLowerCase().includes(query) ||
      notification.commodity.toLowerCase().includes(query) ||
      notification.direction.toLowerCase().includes(query) ||
      notification.type.toLowerCase().includes(query)
    );
  });

  // Get status icon
  const getStatusIcon = (status: TradeNotification['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get type icon
  const getTypeIcon = (type: TradeNotification['type']) => {
    switch (type) {
      case 'order_filled': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'order_cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'order_partial': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'price_match': return <Target className="w-4 h-4 text-purple-500" />;
      case 'execution_failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'confirmation_required': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get direction icon
  const getDirectionIcon = (direction: TradeNotification['direction']) => {
    return direction === 'buy' 
      ? <ArrowUp className="w-4 h-4 text-green-500" />
      : <ArrowDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Trade Notifications
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {notifications.length} recent notifications
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Auto Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Sound"
          >
            {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, commodity, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="flex flex-wrap gap-2">
            {(['all', 'success', 'pending', 'failed', 'warning'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === status
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No trade notifications</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Your trade activity will appear here
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <motion.div
              key={notification.id}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getStatusIcon(notification.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getTypeIcon(notification.type)}
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.orderId}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        notification.status === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' :
                        notification.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' :
                        notification.status === 'failed' ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' :
                        'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
                      }`}>
                        {notification.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <div className="flex items-center space-x-1">
                        {getDirectionIcon(notification.direction)}
                        <span className="capitalize">{notification.direction}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>{notification.amount} MWh</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>${notification.price}/MWh</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span className="font-medium">${notification.totalValue.toFixed(2)}</span>
                      </div>
                    </div>

                    {notification.confirmationRequired && (
                      <div className="flex items-center space-x-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded mb-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-orange-700 dark:text-orange-300">
                          Confirmation required by {notification.confirmationDeadline?.toLocaleTimeString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{notification.timestamp.toLocaleString()}</span>
                      {notification.executionTime && (
                        <span>Executed in {notification.executionTime}ms</span>
                      )}
                      {notification.exchange && (
                        <span>{notification.exchange}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {notification.actions && notification.actions.length > 0 && (
                    <div className="flex items-center space-x-1">
                      {notification.actions.map(action => (
                        <button
                          key={action.id}
                          onClick={action.handler}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            action.type === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                            action.type === 'secondary' ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500' :
                            'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TradeNotifications;
