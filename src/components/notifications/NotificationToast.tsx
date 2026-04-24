import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  ExternalLink
} from 'lucide-react';
import { Notification, NotificationType } from '../../types/notifications';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  duration = 5000,
  position = 'top-right',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  // Get position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  // Get notification type styling
  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/90',
          border: 'border-green-200 dark:border-green-700',
          icon: 'text-green-600 dark:text-green-400',
          progress: 'bg-green-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/90',
          border: 'border-yellow-200 dark:border-yellow-700',
          icon: 'text-yellow-600 dark:text-yellow-400',
          progress: 'bg-yellow-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/90',
          border: 'border-red-200 dark:border-red-700',
          icon: 'text-red-600 dark:text-red-400',
          progress: 'bg-red-500'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/90',
          border: 'border-blue-200 dark:border-blue-700',
          icon: 'text-blue-600 dark:text-blue-400',
          progress: 'bg-blue-500'
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

  const typeStyles = getTypeStyles(notification.type);

  // Auto-dismiss timer
  useEffect(() => {
    if (isPaused || duration === 0) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, isPaused]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleActionClick = (action: any) => {
    action.handler();
    handleClose();
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`
            fixed z-50 w-full max-w-sm p-4 rounded-lg shadow-lg backdrop-blur-sm border
            ${typeStyles.bg} ${typeStyles.border}
            ${getPositionStyles()} ${className}
          `}
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Progress Bar */}
          {duration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
              <motion.div
                className={`h-full ${typeStyles.progress}`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className={`flex-shrink-0 ${typeStyles.icon}`}>
              {getTypeIcon(notification.type)}
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {notification.title}
                </h4>
                <button
                  onClick={handleClose}
                  className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {notification.message}
              </p>

              {/* Actions */}
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {notification.actions.slice(0, 2).map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleActionClick(action)}
                      className={`
                        inline-flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors
                        ${action.action === 'primary' 
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300' 
                          : action.action === 'danger'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      <span>{action.label}</span>
                      {action.action === 'primary' && <ExternalLink className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="capitalize">{notification.category}</span>
                <span>{notification.source}</span>
              </div>
            </div>
          </div>

          {/* Priority Indicator */}
          {notification.priority === 'urgent' && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationToast;
