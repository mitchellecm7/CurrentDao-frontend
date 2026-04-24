import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Plus, 
  X, 
  Bell, 
  BellOff, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit,
  Save,
  DollarSign,
  Activity,
  Target,
  Clock,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { usePushNotifications } from '../../hooks/usePushNotifications';

interface PriceAlert {
  id: string;
  commodity: string;
  type: 'above' | 'below' | 'change_percent' | 'change_absolute';
  value: number;
  threshold: number;
  isActive: boolean;
  repeat: boolean;
  repeatInterval: number; // in minutes
  lastTriggered?: Date;
  createdAt: Date;
  region?: string;
  timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  conditions?: {
    volume?: number;
    marketCap?: number;
    liquidity?: number;
  };
}

interface PriceAlertsProps {
  className?: string;
}

const PriceAlerts: React.FC<PriceAlertsProps> = ({ className = '' }) => {
  const { addNotification } = useNotifications();
  const { isSubscribed } = usePushNotifications();
  
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});

  // Form state
  const [formData, setFormData] = useState({
    commodity: 'electricity',
    type: 'above' as PriceAlert['type'],
    value: 0,
    threshold: 5,
    repeat: false,
    repeatInterval: 60,
    region: 'global',
    timeframe: '1h' as const
  });

  // Mock commodities
  const commodities = [
    { id: 'electricity', name: 'Electricity', unit: 'MWh', icon: Zap },
    { id: 'natural-gas', name: 'Natural Gas', unit: 'MMBtu', icon: Activity },
    { id: 'crude-oil', name: 'Crude Oil', unit: 'Barrel', icon: BarChart3 },
    { id: 'solar', name: 'Solar Energy', unit: 'MWh', icon: Target },
    { id: 'wind', name: 'Wind Energy', unit: 'MWh', icon: Activity }
  ];

  // Initialize with sample alerts
  useEffect(() => {
    const sampleAlerts: PriceAlert[] = [
      {
        id: '1',
        commodity: 'electricity',
        type: 'above',
        value: 50,
        threshold: 5,
        isActive: true,
        repeat: true,
        repeatInterval: 60,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        region: 'US-East',
        timeframe: '1h'
      },
      {
        id: '2',
        commodity: 'natural-gas',
        type: 'change_percent',
        value: 3,
        threshold: 3,
        isActive: false,
        repeat: false,
        repeatInterval: 120,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        timeframe: '4h'
      }
    ];
    setAlerts(sampleAlerts);
  }, []);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newPrices: Record<string, number> = {};
      const newHistory: Record<string, number[]> = { ...priceHistory };

      commodities.forEach(commodity => {
        const basePrice = Math.random() * 100 + 20;
        newPrices[commodity.id] = basePrice;
        
        if (!newHistory[commodity.id]) {
          newHistory[commodity.id] = [];
        }
        newHistory[commodity.id].push(basePrice);
        
        // Keep only last 100 prices
        if (newHistory[commodity.id].length > 100) {
          newHistory[commodity.id].shift();
        }
      });

      setCurrentPrices(newPrices);
      setPriceHistory(newHistory);
      
      // Check alerts
      checkAlerts(newPrices, newHistory);
    }, 5000); // Update every 5 seconds for demo

    return () => clearInterval(interval);
  }, [priceHistory]);

  // Check price alerts
  const checkAlerts = useCallback((prices: Record<string, number>, history: Record<string, number[]>) => {
    const now = new Date();
    
    alerts.forEach(alert => {
      if (!alert.isActive) return;
      
      const currentPrice = prices[alert.commodity];
      if (!currentPrice) return;
      
      const commodityHistory = history[alert.commodity] || [];
      if (commodityHistory.length < 2) return;
      
      const previousPrice = commodityHistory[commodityHistory.length - 2];
      let shouldTrigger = false;
      let message = '';

      switch (alert.type) {
        case 'above':
          shouldTrigger = currentPrice > alert.value;
          message = `${alert.commodity} price is $${currentPrice.toFixed(2)}/MWh, above your alert of $${alert.value}`;
          break;
          
        case 'below':
          shouldTrigger = currentPrice < alert.value;
          message = `${alert.commodity} price is $${currentPrice.toFixed(2)}/MWh, below your alert of $${alert.value}`;
          break;
          
        case 'change_percent':
          const percentChange = ((currentPrice - previousPrice) / previousPrice) * 100;
          shouldTrigger = Math.abs(percentChange) >= alert.value;
          message = `${alert.commodity} price changed by ${percentChange.toFixed(2)}%`;
          break;
          
        case 'change_absolute':
          const absoluteChange = Math.abs(currentPrice - previousPrice);
          shouldTrigger = absoluteChange >= alert.value;
          message = `${alert.commodity} price changed by $${absoluteChange.toFixed(2)}/MWh`;
          break;
      }

      // Check repeat interval
      if (shouldTrigger) {
        const timeSinceLastTrigger = alert.lastTriggered 
          ? now.getTime() - alert.lastTriggered.getTime()
          : Infinity;
          
        const shouldRepeat = !alert.repeat || timeSinceLastTrigger > alert.repeatInterval * 60 * 1000;
        
        if (shouldRepeat) {
          triggerAlert(alert, message);
          
          // Update last triggered
          setAlerts(prev => prev.map(a => 
            a.id === alert.id 
              ? { ...a, lastTriggered: now }
              : a
          ));
        }
      }
    });
  }, [alerts]);

  // Trigger alert
  const triggerAlert = useCallback((alert: PriceAlert, message: string) => {
    // Add in-app notification
    addNotification({
      type: 'warning',
      category: 'trading',
      title: 'Price Alert Triggered',
      message,
      priority: 'high',
      read: false,
      source: 'price-alerts',
      metadata: {
        alertId: alert.id,
        commodity: alert.commodity,
        currentValue: currentPrices[alert.commodity],
        alertType: alert.type
      }
    });

    // Send push notification if subscribed
    if (isSubscribed) {
      // Push notification would be handled by the push notification system
      console.log('Push notification sent:', message);
    }
  }, [addNotification, isSubscribed, currentPrices]);

  // Create new alert
  const handleCreateAlert = () => {
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      ...formData,
      isActive: true,
      createdAt: new Date()
    };

    setAlerts(prev => [...prev, newAlert]);
    setShowCreateForm(false);
    resetForm();
  };

  // Update alert
  const handleUpdateAlert = () => {
    if (!editingAlert) return;

    setAlerts(prev => prev.map(alert => 
      alert.id === editingAlert.id 
        ? { ...alert, ...formData }
        : alert
    ));

    setEditingAlert(null);
    resetForm();
  };

  // Delete alert
  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Toggle alert
  const handleToggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id 
        ? { ...alert, isActive: !alert.isActive }
        : alert
    ));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      commodity: 'electricity',
      type: 'above',
      value: 0,
      threshold: 5,
      repeat: false,
      repeatInterval: 60,
      region: 'global',
      timeframe: '1h'
    });
  };

  // Get alert type icon
  const getAlertTypeIcon = (type: PriceAlert['type']) => {
    switch (type) {
      case 'above': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'below': return <ArrowDown className="w-4 h-4 text-red-500" />;
      case 'change_percent': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'change_absolute': return <Activity className="w-4 h-4 text-purple-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get commodity icon
  const getCommodityIcon = (commodityId: string) => {
    const commodity = commodities.find(c => c.id === commodityId);
    return commodity ? commodity.icon : DollarSign;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Price Alerts
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {alerts.filter(a => a.isActive).length} active alerts
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">New Alert</span>
        </button>
      </div>

      {/* Alerts List */}
      <div className="p-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No price alerts set</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Create your first alert to get notified when prices change
            </p>
          </div>
        ) : (
          alerts.map(alert => {
            const Icon = getCommodityIcon(alert.commodity);
            const TypeIcon = getAlertTypeIcon(alert.type);
            const currentPrice = currentPrices[alert.commodity];
            
            return (
              <motion.div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <TypeIcon />
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {alert.commodity.replace('-', ' ')}
                        </h4>
                        {!alert.isActive && (
                          <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {alert.type === 'above' && `Alert when price goes above $${alert.value}`}
                        {alert.type === 'below' && `Alert when price goes below $${alert.value}`}
                        {alert.type === 'change_percent' && `Alert when price changes by ${alert.value}%`}
                        {alert.type === 'change_absolute' && `Alert when price changes by $${alert.value}`}
                      </p>
                      
                      {currentPrice && (
                        <div className="flex items-center space-x-2 mt-2">
                          <DollarSign className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Current: ${currentPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Created {alert.createdAt.toLocaleDateString()}</span>
                        </div>
                        {alert.repeat && (
                          <div className="flex items-center space-x-1">
                            <Activity className="w-3 h-3" />
                            <span>Repeat every {alert.repeatInterval}m</span>
                          </div>
                        )}
                        {alert.lastTriggered && (
                          <div className="flex items-center space-x-1">
                            <Bell className="w-3 h-3" />
                            <span>Last: {alert.lastTriggered.toLocaleTimeString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleAlert(alert.id)}
                      className={`p-2 rounded transition-colors ${
                        alert.isActive 
                          ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20' 
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {alert.isActive ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingAlert(alert);
                        setFormData({
                          commodity: alert.commodity,
                          type: alert.type,
                          value: alert.value,
                          threshold: alert.threshold,
                          repeat: alert.repeat,
                          repeatInterval: alert.repeatInterval,
                          region: alert.region || 'global',
                          timeframe: alert.timeframe || '1h'
                        });
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create/Edit Form Modal */}
      <AnimatePresence>
        {(showCreateForm || editingAlert) && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowCreateForm(false);
              setEditingAlert(null);
              resetForm();
            }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingAlert ? 'Edit Alert' : 'Create Price Alert'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingAlert(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Commodity Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commodity
                  </label>
                  <select
                    value={formData.commodity}
                    onChange={(e) => setFormData(prev => ({ ...prev, commodity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {commodities.map(commodity => (
                      <option key={commodity.id} value={commodity.id}>
                        {commodity.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Alert Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alert Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PriceAlert['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="above">Price goes above</option>
                    <option value="below">Price goes below</option>
                    <option value="change_percent">Price changes by %</option>
                    <option value="change_absolute">Price changes by $</option>
                  </select>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {formData.type === 'change_percent' ? 'Percentage Change (%)' : 'Price Threshold ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Repeat Settings */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Repeat Alert
                    </label>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, repeat: !prev.repeat }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        formData.repeat ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          formData.repeat ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {formData.repeat && (
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Repeat Interval (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.repeatInterval}
                        onChange={(e) => setFormData(prev => ({ ...prev, repeatInterval: parseInt(e.target.value) || 60 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingAlert(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={editingAlert ? handleUpdateAlert : handleCreateAlert}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingAlert ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PriceAlerts;
