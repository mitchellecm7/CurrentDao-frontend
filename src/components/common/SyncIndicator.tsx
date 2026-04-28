import React from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useSyncIndicator, SyncStatus } from '@/hooks/useSyncIndicator';

interface SyncIndicatorProps {
  queryKey: any[];
  staleTime?: number;
  refetchInterval?: number;
  enableBackgroundSync?: boolean;
  maxRetries?: number;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function SyncIndicator({
  queryKey,
  staleTime,
  refetchInterval,
  enableBackgroundSync,
  maxRetries,
  className = '',
  showLabel = true,
  compact = false,
  position = 'top-right'
}: SyncIndicatorProps) {
  const {
    syncStatus,
    refresh,
    retry,
    formatLastUpdated,
    shouldShowStaleWarning,
    canRetry,
    isBackgroundSyncEnabled
  } = useSyncIndicator({
    queryKey,
    staleTime,
    refetchInterval,
    enableBackgroundSync,
    maxRetries
  });

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <SyncStatusIcon syncStatus={syncStatus} size="sm" />
        {showLabel && (
          <span className="text-xs text-muted-foreground">
            {formatLastUpdated()}
          </span>
        )}
        <RefreshButton
          isSyncing={syncStatus.isSyncing}
          onRefresh={refresh}
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background border border-border rounded-lg shadow-lg p-3 max-w-xs"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SyncStatusIcon syncStatus={syncStatus} />
            {showLabel && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">Data Sync</span>
                <span className="text-xs text-muted-foreground">
                  {formatLastUpdated()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {shouldShowStaleWarning && (
              <StaleDataWarning onRefresh={refresh} />
            )}
            
            {syncStatus.hasError && canRetry && (
              <RetryButton onRetry={retry} />
            )}
            
            <RefreshButton
              isSyncing={syncStatus.isSyncing}
              onRefresh={refresh}
            />
          </div>
        </div>

        {syncStatus.hasError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 pt-2 border-t border-border"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-destructive font-medium">Sync Error</p>
                <p className="text-xs text-muted-foreground">
                  {syncStatus.error || 'Failed to sync data'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {isBackgroundSyncEnabled && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="text-xs text-muted-foreground">
                Background sync enabled
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface SyncStatusIconProps {
  syncStatus: SyncStatus;
  size?: 'sm' | 'md' | 'lg';
}

function SyncStatusIcon({ syncStatus, size = 'md' }: SyncStatusIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (syncStatus.isSyncing) {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <RefreshCw className={`${sizeClasses[size]} text-blue-500`} />
      </motion.div>
    );
  }

  if (syncStatus.hasError) {
    return <WifiOff className={`${sizeClasses[size]} text-destructive`} />;
  }

  if (syncStatus.isStale) {
    return <AlertTriangle className={`${sizeClasses[size]} text-yellow-500`} />;
  }

  return <CheckCircle className={`${sizeClasses[size]} text-green-500`} />;
}

interface RefreshButtonProps {
  isSyncing: boolean;
  onRefresh: () => void;
  size?: 'sm' | 'md' | 'lg';
}

function RefreshButton({ isSyncing, onRefresh, size = 'md' }: RefreshButtonProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-2',
    lg: 'w-10 h-10 p-2.5'
  };

  return (
    <button
      onClick={onRefresh}
      disabled={isSyncing}
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        border border-border 
        bg-background 
        hover:bg-muted 
        disabled:opacity-50 
        disabled:cursor-not-allowed 
        transition-colors
        flex items-center justify-center
      `}
      title={isSyncing ? 'Syncing...' : 'Refresh data'}
    >
      <motion.div
        animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 1, repeat: isSyncing ? Infinity : 0, ease: 'linear' }}
      >
        <RefreshCw className="w-3 h-3" />
      </motion.div>
    </button>
  );
}

interface StaleDataWarningProps {
  onRefresh: () => void;
}

function StaleDataWarning({ onRefresh }: StaleDataWarningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <button
        onClick={onRefresh}
        className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors flex items-center justify-center"
        title="Data is stale - Click to refresh"
      >
        <Clock className="w-3 h-3" />
      </button>
      
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap"
      >
        Data is stale
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </motion.div>
    </motion.div>
  );
}

interface RetryButtonProps {
  onRetry: () => void;
}

function RetryButton({ onRetry }: RetryButtonProps) {
  return (
    <button
      onClick={onRetry}
      className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center justify-center"
      title="Retry failed sync"
    >
      <RefreshCw className="w-3 h-3" />
    </button>
  );
}

// Standalone sync status badge for inline use
export function SyncStatusBadge({
  syncStatus,
  className = ''
}: {
  syncStatus: SyncStatus;
  className?: string;
}) {
  const getStatusColor = () => {
    if (syncStatus.isSyncing) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (syncStatus.hasError) return 'bg-red-100 text-red-700 border-red-200';
    if (syncStatus.isStale) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) return 'Syncing';
    if (syncStatus.hasError) return 'Error';
    if (syncStatus.isStale) return 'Stale';
    return 'Synced';
  };

  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border
      ${getStatusColor()}
      ${className}
    `}>
      <SyncStatusIcon syncStatus={syncStatus} size="sm" />
      {getStatusText()}
    </div>
  );
}
