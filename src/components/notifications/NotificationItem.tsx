import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Check, 
  ExternalLink,
  Clock,
  User,
  Shield,
  Zap,
  TrendingUp,
  Settings,
  MessageSquare
} from 'lucide-react';
import { Notification, NotificationType, NotificationCategory } from '../../types/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  isSelecting?: boolean;
  onMarkAsRead?: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
  onRemove?: (id: string) => void;
  className?: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onSelect,
  isSelected = false,
  isSelecting = false,
  onMarkAsRead,
  onMarkAsUnread,
  onRemove,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get notification type styling
  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: 'text-green-600 dark:text-green-400',
          iconBg: 'bg-green-100 dark:bg-green-900/50'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/50'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-900/50'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-900/50'
        };
    }
  };

  // Get notification type icon
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'info':
      default: return <Info className="w-5 h-5" />;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'trading': return <TrendingUp className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'wallet': return <Zap className="w-4 h-4" />;
      case 'dao': return <User className="w-4 h-4" />;
      case 'energy': return <Zap className="w-4 h-4" />;
      case 'marketplace': return <TrendingUp className="w-4 h-4" />;
      case 'profile': return <User className="w-4 h-4" />;
      case 'general':
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  // Get priority indicator
  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
      case 'high':
        return <div className="w-2 h-2 bg-orange-500 rounded-full" />;
      case 'medium':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'low':
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const typeStyles = getTypeStyles(notification.type);
  const isExpired = notification.expiresAt && notification.expiresAt < new Date();

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead?.(notification.id);
  };

  const handleMarkAsUnread = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsUnread?.(notification.id);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.(notification.id);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(notification.id);
  };

  const handleActionClick = (action: any, e: React.MouseEvent) => {
    e.stopPropagation();
    action.handler();
  };

  return (
    <motion.div
      className={`
        relative p-4 border-l-4 transition-all cursor-pointer
        ${typeStyles.bg} ${typeStyles.border}
        ${!notification.read ? 'font-semibold' : ''}
        ${isExpired ? 'opacity-50' : ''}
        ${isHovered ? 'shadow-md' : ''}
        ${className}
      `}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.01 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isSelecting && setIsExpanded(!isExpanded)}
    >
      {/* Selection Checkbox */}
      {isSelecting && (
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Priority Indicator */}
      <div className="absolute top-4 right-4">
        {getPriorityIndicator(notification.priority)}
      </div>

      <div className={`flex items-start space-x-3 ${isSelecting ? 'ml-8' : ''}`}>
        {/* Type Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${typeStyles.iconBg}`}>
          <div className={typeStyles.icon}>
            {getTypeIcon(notification.type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {notification.title}
              </h3>
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                {getCategoryIcon(notification.category)}
                <span className="text-xs capitalize">{notification.category}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
            {notification.message}
          </p>

          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {notification.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={(e) => handleActionClick(action, e)}
                  className={`
                    inline-flex items-center space-x-1 px-3 py-1 text-xs rounded-full transition-colors
                    ${action.action === 'primary' 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300' 
                      : action.action === 'danger'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {action.icon && <span>{action.icon}</span>}
                  <span>{action.label}</span>
                  {action.action === 'primary' && <ExternalLink className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}

          {/* Metadata */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span>Source: {notification.source}</span>
              {notification.userId && <span> • User ID: {notification.userId}</span>}
              {notification.sessionId && <span> • Session: {notification.sessionId}</span>}
            </div>
          )}

          {/* Expanded Content */}
          {isExpanded && notification.metadata && (
            <motion.div
              className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
            >
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Details</h4>
              <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {JSON.stringify(notification.metadata, null, 2)}
              </pre>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        {isHovered && !isSelecting && (
          <motion.div
            className="flex flex-col space-y-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {!notification.read ? (
              <button
                onClick={handleMarkAsRead}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Mark as read"
              >
                <Check className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            ) : (
              <button
                onClick={handleMarkAsUnread}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Mark as unread"
              >
                <div className="w-4 h-4 border-2 border-gray-600 dark:border-gray-400 rounded" />
              </button>
            )}
            <button
              onClick={handleRemove}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              title="Remove notification"
            >
              <X className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Unread Indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
      )}

      {/* Expired Indicator */}
      {isExpired && (
        <div className="absolute top-2 right-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
            Expired
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationItem;
