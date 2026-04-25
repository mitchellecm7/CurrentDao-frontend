/**
 * Offline Manager Component for CurrentDao
 * Central dashboard for offline mode management, status monitoring, and control
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useOfflineMode } from '../../hooks/offline/useOfflineMode';

interface OfflineManagerProps {
  className?: string;
}

export const OfflineManager: React.FC<OfflineManagerProps> = ({ className = '' }) => {
  const offlineMode = useOfflineMode();
  const [expandedSection, setExpandedSection] = useState<string>('status');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Format duration
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  // Format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-red-600';
      case 'syncing': return 'text-blue-600';
      case 'idle': return 'text-gray-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'conflicted': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'syncing': return '🔄';
      case 'idle': return '⏸️';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'conflicted': return '⚠️';
      default: return '❓';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Offline Mode</h2>
            <p className="text-gray-600 mt-1">
              Manage offline trading, caching, and synchronization
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${getStatusColor(offlineMode.status.isOnline ? 'online' : 'offline')}`}>
              <span className="text-2xl">{getStatusIcon(offlineMode.status.isOnline ? 'online' : 'offline')}</span>
              <span className="font-medium">
                {offlineMode.status.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showAdvanced ? 'Simple' : 'Advanced'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Connection</span>
              <span className={`text-lg ${getStatusColor(offlineMode.status.isOnline ? 'online' : 'offline')}`}>
                {getStatusIcon(offlineMode.status.isOnline ? 'online' : 'offline')}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {offlineMode.status.isOnline ? 'Connected' : 'Disconnected'}
            </p>
            <p className="text-xs text-gray-500">
              {offlineMode.status.isOnline ? 'All features available' : 'Limited functionality'}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Cache Size</span>
              <span className="text-lg">💾</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {formatBytes(offlineMode.status.cacheSize)}
            </p>
            <p className="text-xs text-gray-500">
              7-day retention
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Queue Size</span>
              <span className="text-lg">📋</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {offlineMode.status.queueSize}
            </p>
            <p className="text-xs text-gray-500">
              Pending transactions
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Sync Status</span>
              <span className={`text-lg ${getStatusColor(offlineMode.sync.getStatus())}`}>
                {getStatusIcon(offlineMode.sync.getStatus())}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 capitalize">
              {offlineMode.sync.getStatus()}
            </p>
            <p className="text-xs text-gray-500">
              Last sync: {offlineMode.status.lastSync ? formatDuration(Date.now() - offlineMode.status.lastSync.getTime()) : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => offlineMode.refresh()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={offlineMode.status.syncInProgress}
          >
            Refresh Data
          </button>
          
          <button
            onClick={() => offlineMode.sync.start()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            disabled={!offlineMode.status.isOnline || offlineMode.status.syncInProgress}
          >
            Start Sync
          </button>
          
          <button
            onClick={() => offlineMode.sync.stop()}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            disabled={!offlineMode.status.syncInProgress}
          >
            Stop Sync
          </button>
          
          <button
            onClick={() => offlineMode.cache.optimize()}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Optimize Cache
          </button>
          
          <button
            onClick={() => offlineMode.cache.clear()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="p-6">
        <div className="space-y-6">
          {/* Connection Status */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'connection' ? '' : 'connection')}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Connection Status</h3>
              <span className="text-gray-400">
                {expandedSection === 'connection' ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedSection === 'connection' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Network Status</span>
                  <span className={`font-medium ${getStatusColor(offlineMode.status.isOnline ? 'online' : 'offline')}`}>
                    {offlineMode.status.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sync Progress</span>
                  <span className="font-medium">
                    {offlineMode.status.syncInProgress ? 'In Progress' : 'Idle'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Conflicts</span>
                  <span className={`font-medium ${offlineMode.status.hasConflicts ? 'text-orange-600' : 'text-green-600'}`}>
                    {offlineMode.status.hasConflicts ? 'Has Conflicts' : 'No Conflicts'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cache Management */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'cache' ? '' : 'cache')}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Cache Management</h3>
              <span className="text-gray-400">
                {expandedSection === 'cache' ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedSection === 'cache' && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Cache Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Size</p>
                      <p className="font-medium">{formatBytes(offlineMode.status.cacheSize)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hit Rate</p>
                      <p className="font-medium">85%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Entries</p>
                      <p className="font-medium">1,234</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Oldest Entry</p>
                      <p className="font-medium">2 days ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Cache Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => offlineMode.cache.optimize()}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Optimize Cache
                    </button>
                    <button
                      onClick={() => offlineMode.cache.clear()}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Clear Cache
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transaction Queue */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'queue' ? '' : 'queue')}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Transaction Queue</h3>
              <span className="text-gray-400">
                {expandedSection === 'queue' ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedSection === 'queue' && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Queue Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Transactions</span>
                      <span className="font-medium">{offlineMode.status.queueSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Processing</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Failed</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Conflicted</span>
                      <span className="font-medium">{offlineMode.status.hasConflicts ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Queue Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => offlineMode.queue.process()}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Process Queue
                    </button>
                    <button
                      onClick={() => offlineMode.queue.clear()}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Clear Queue
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sync Management */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'sync' ? '' : 'sync')}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Sync Management</h3>
              <span className="text-gray-400">
                {expandedSection === 'sync' ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedSection === 'sync' && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Sync Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Status</span>
                      <span className={`font-medium capitalize ${getStatusColor(offlineMode.sync.getStatus())}`}>
                        {offlineMode.sync.getStatus()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Auto Sync</span>
                      <span className="font-medium">Enabled</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Sync</span>
                      <span className="font-medium">
                        {offlineMode.status.lastSync ? 
                          formatDuration(Date.now() - offlineMode.status.lastSync.getTime()) + ' ago' : 
                          'Never'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Sync Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => offlineMode.sync.start()}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      disabled={!offlineMode.status.isOnline || offlineMode.status.syncInProgress}
                    >
                      Start Sync
                    </button>
                    <button
                      onClick={() => offlineMode.sync.stop()}
                      className="w-full px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
                      disabled={!offlineMode.status.syncInProgress}
                    >
                      Stop Sync
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data Freshness */}
          {showAdvanced && (
            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'freshness' ? '' : 'freshness')}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">Data Freshness</h3>
                <span className="text-gray-400">
                  {expandedSection === 'freshness' ? '▼' : '▶'}
                </span>
              </button>
              
              {expandedSection === 'freshness' && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Freshness Overview</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fresh Data</span>
                        <span className="font-medium text-green-600">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Stale Data</span>
                        <span className="font-medium text-orange-600">12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Expired Data</span>
                        <span className="font-medium text-red-600">3%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Freshness Actions</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => offlineMode.freshness.checkAll()}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Check All Freshness
                      </button>
                      <button
                        onClick={() => offlineMode.freshness.getStaleKeys()}
                        className="w-full px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
                      >
                        Get Stale Keys
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineManager;
