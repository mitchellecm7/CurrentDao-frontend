import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  UserX, 
  Eye, 
  Lock, 
  Unlock, 
  Key, 
  Smartphone, 
  Mail, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Globe,
  Fingerprint,
  Wifi,
  WifiOff,
  Ban,
  UserCheck,
  Settings,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { usePushNotifications } from '../../hooks/usePushNotifications';

interface SecurityAlert {
  id: string;
  type: 'unauthorized_access' | 'suspicious_login' | 'failed_attempts' | 'device_change' | 'permission_change' | 'data_breach' | 'malware_detected' | 'phishing_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'investigating';
  userId: string;
  timestamp: Date;
  title: string;
  description: string;
  ipAddress?: string;
  device?: string;
  location?: string;
  browser?: string;
  actionRequired: boolean;
  autoResolved?: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  metadata?: {
    attempts?: number;
    previousLocation?: string;
    newLocation?: string;
    userAgent?: string;
    sessionId?: string;
    threatScore?: number;
    blockedActions?: string[];
    recommendedActions?: string[];
  };
  actions?: SecurityAction[];
}

interface SecurityAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  handler: () => void | Promise<void>;
  icon?: string;
  requiresConfirmation?: boolean;
}

interface SecurityAlertsProps {
  className?: string;
}

const SecurityAlerts: React.FC<SecurityAlertsProps> = ({ className = '' }) => {
  const { addNotification } = useNotifications();
  const { isSubscribed } = usePushNotifications();
  
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoMonitoring, setAutoMonitoring] = useState(true);
  const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');

  // Initialize with sample security alerts
  useEffect(() => {
    const sampleAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'suspicious_login',
        severity: 'high',
        status: 'active',
        userId: 'user-123',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        title: 'Suspicious Login Detected',
        description: 'Login attempt from unrecognized device and location',
        ipAddress: '192.168.1.100',
        device: 'iPhone 14 Pro',
        location: 'Moscow, Russia',
        browser: 'Safari 16.0',
        actionRequired: true,
        metadata: {
          attempts: 1,
          previousLocation: 'New York, USA',
          newLocation: 'Moscow, Russia',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
          threatScore: 85,
          recommendedActions: ['verify_identity', 'change_password', 'enable_2fa']
        },
        actions: [
          {
            id: 'verify',
            label: 'Verify Identity',
            type: 'primary',
            handler: () => console.log('Verify identity'),
            requiresConfirmation: true
          },
          {
            id: 'block',
            label: 'Block Access',
            type: 'danger',
            handler: () => console.log('Block access'),
            requiresConfirmation: true
          }
        ]
      },
      {
        id: '2',
        type: 'failed_attempts',
        severity: 'medium',
        status: 'active',
        userId: 'user-123',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        title: 'Multiple Failed Login Attempts',
        description: '5 failed login attempts detected in the last 10 minutes',
        ipAddress: '203.0.113.1',
        device: 'Unknown Device',
        location: 'Beijing, China',
        actionRequired: false,
        autoResolved: false,
        metadata: {
          attempts: 5,
          threatScore: 65,
          blockedActions: ['login', 'password_reset']
        },
        actions: [
          {
            id: 'investigate',
            label: 'Investigate',
            type: 'primary',
            handler: () => console.log('Investigate failed attempts')
          },
          {
            id: 'block_ip',
            label: 'Block IP Address',
            type: 'secondary',
            handler: () => console.log('Block IP address')
          }
        ]
      },
      {
        id: '3',
        type: 'device_change',
        severity: 'low',
        status: 'resolved',
        userId: 'user-123',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        title: 'New Device Added',
        description: 'New device successfully added to your account',
        device: 'MacBook Pro M2',
        location: 'San Francisco, CA',
        actionRequired: false,
        resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        resolvedBy: 'user-123',
        metadata: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          threatScore: 15
        }
      }
    ];
    setAlerts(sampleAlerts);
  }, []);

  // Simulate real-time security monitoring
  useEffect(() => {
    if (!autoMonitoring) return;

    const interval = setInterval(() => {
      // Randomly generate security alerts for demo
      if (Math.random() > 0.9) {
        const types: SecurityAlert['type'][] = ['suspicious_login', 'failed_attempts', 'device_change'];
        const severities: SecurityAlert['severity'][] = ['low', 'medium', 'high'];
        
        const newAlert: SecurityAlert = {
          id: Date.now().toString(),
          type: types[Math.floor(Math.random() * types.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          status: 'active',
          userId: 'user-123',
          timestamp: new Date(),
          title: 'Security Alert Detected',
          description: 'Automatic security monitoring detected suspicious activity',
          actionRequired: Math.random() > 0.5,
          metadata: {
            threatScore: Math.floor(Math.random() * 100),
            attempts: Math.floor(Math.random() * 5) + 1
          }
        };

        setAlerts(prev => [newAlert, ...prev]);
        
        // Trigger security notification
        triggerSecurityNotification(newAlert);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [autoMonitoring]);

  // Trigger security notification
  const triggerSecurityNotification = useCallback((alert: SecurityAlert) => {
    const typeMap = {
      unauthorized_access: 'error',
      suspicious_login: 'error',
      failed_attempts: 'warning',
      device_change: 'info',
      permission_change: 'warning',
      data_breach: 'error',
      malware_detected: 'error',
      phishing_attempt: 'error'
    } as const;

    const priorityMap = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'urgent'
    } as const;

    addNotification({
      type: typeMap[alert.type],
      category: 'security',
      title: alert.title,
      message: alert.description,
      priority: priorityMap[alert.severity],
      read: false,
      source: 'security-alerts',
      metadata: {
        alertId: alert.id,
        severity: alert.severity,
        threatScore: alert.metadata?.threatScore,
        actionRequired: alert.actionRequired
      },
      actions: alert.actions?.map(action => ({
        id: action.id,
        label: action.label,
        action: action.type,
        handler: action.handler
      }))
    });

    // Send push notification if subscribed
    if (isSubscribed) {
      console.log('Security push notification sent:', alert.title);
    }

    // Update threat level based on alert severity
    if (alert.severity === 'critical') {
      setThreatLevel('critical');
    } else if (alert.severity === 'high' && threatLevel !== 'critical') {
      setThreatLevel('high');
    }
  }, [addNotification, isSubscribed, threatLevel]);

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'active') return alert.status === 'active';
    if (filter === 'resolved') return alert.status === 'resolved';
    if (filter === 'critical') return alert.severity === 'critical';
    return true;
  }).filter(alert => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      alert.title.toLowerCase().includes(query) ||
      alert.description.toLowerCase().includes(query) ||
      alert.type.toLowerCase().includes(query) ||
      alert.location?.toLowerCase().includes(query) ||
      alert.device?.toLowerCase().includes(query)
    );
  });

  // Get severity color
  const getSeverityColor = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'low': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
      case 'medium': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'high': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20';
      case 'critical': return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  // Get type icon
  const getTypeIcon = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'unauthorized_access': return <Ban className="w-4 h-4" />;
      case 'suspicious_login': return <UserX className="w-4 h-4" />;
      case 'failed_attempts': return <XCircle className="w-4 h-4" />;
      case 'device_change': return <Smartphone className="w-4 h-4" />;
      case 'permission_change': return <Lock className="w-4 h-4" />;
      case 'data_breach': return <AlertTriangle className="w-4 h-4" />;
      case 'malware_detected': return <Shield className="w-4 h-4" />;
      case 'phishing_attempt': return <Mail className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status: SecurityAlert['status']) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4 text-red-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'investigating': return <Eye className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get threat level color
  const getThreatLevelColor = (level: typeof threatLevel) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Security Alerts
            </h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {alerts.filter(a => a.status === 'active').length} active threats
              </p>
              <div className={`w-2 h-2 rounded-full ${getThreatLevelColor(threatLevel)}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {threatLevel} threat level
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoMonitoring(!autoMonitoring)}
            className={`p-2 rounded-lg transition-colors ${
              autoMonitoring 
                ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Auto Monitoring"
          >
            {autoMonitoring ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-50" />}
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
            placeholder="Search security alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'resolved', 'critical'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === status
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No security alerts</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Your account is secure and protected
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <motion.div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.status === 'active' 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getTypeIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {alert.title}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      {alert.actionRequired && (
                        <span className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-2 py-1 rounded">
                          Action Required
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {alert.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {alert.ipAddress && (
                        <div className="flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>{alert.ipAddress}</span>
                        </div>
                      )}
                      {alert.device && (
                        <div className="flex items-center space-x-1">
                          <Smartphone className="w-3 h-3" />
                          <span>{alert.device}</span>
                        </div>
                      )}
                      {alert.location && (
                        <div className="flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>{alert.location}</span>
                        </div>
                      )}
                      {alert.metadata?.threatScore && (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Threat Score: {alert.metadata.threatScore}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{alert.timestamp.toLocaleString()}</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(alert.status)}
                        <span className="capitalize">{alert.status}</span>
                      </div>
                      {alert.resolvedAt && (
                        <span>Resolved {alert.resolvedAt.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {alert.actions && alert.actions.length > 0 && (
                    <div className="flex flex-col space-y-1">
                      {alert.actions.map(action => (
                        <button
                          key={action.id}
                          onClick={action.handler}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            action.type === 'primary' ? 'bg-red-600 text-white hover:bg-red-700' :
                            action.type === 'secondary' ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500' :
                            'bg-red-800 text-white hover:bg-red-900'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SecurityAlerts;
