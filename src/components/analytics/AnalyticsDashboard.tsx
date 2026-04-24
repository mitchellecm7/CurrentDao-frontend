import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Activity, 
  Users, 
  Eye, 
  Beaker,
  TrendingUp,
  AlertTriangle,
  Settings,
  Download,
  RefreshCw,
  Shield,
  Target,
  Zap,
  Clock,
  MousePointer,
  CheckCircle
} from 'lucide-react';

import { HeatmapViewer } from './HeatmapViewer';
import { SessionRecorder } from './SessionRecorder';
import { UserFlowAnalysis } from './UserFlowAnalysis';
import { ABTesting } from './ABTesting';
import { useBehaviorAnalytics } from '@/hooks/useBehaviorAnalytics';
import { HeatmapData, SessionRecording as SessionRecordingType, UserFlow, ABTest as ABTestType } from '@/types/analytics';

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const {
    config,
    hasConsent,
    grantConsent,
    revokeConsent,
    isTracking,
    startTracking,
    stopTracking,
    heatmapData,
    heatmapLoading,
    heatmapError,
    fetchHeatmapData,
    isRecording,
    sessionRecordings,
    recordingsLoading,
    recordingsError,
    startRecording,
    stopRecording,
    fetchRecordings,
    userFlows,
    flowsLoading,
    flowsError,
    fetchUserFlows,
    abTests,
    testsLoading,
    testsError,
    fetchABTests,
    performanceMetrics,
    exportData,
  } = useBehaviorAnalytics();

  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'sessions' | 'flows' | 'abtesting' | 'settings'>('overview');
  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    if (hasConsent && isTracking) {
      // Fetch initial data
      fetchHeatmapData();
      fetchRecordings();
      fetchUserFlows();
      fetchABTests();
    }
  }, [hasConsent, isTracking, fetchHeatmapData, fetchRecordings, fetchUserFlows, fetchABTests]);

  const handleGrantConsent = () => {
    grantConsent();
    startTracking();
    setShowConsentModal(false);
  };

  const handleRevokeConsent = () => {
    revokeConsent();
    setShowConsentModal(false);
  };

  const refreshAllData = () => {
    if (hasConsent) {
      fetchHeatmapData();
      fetchRecordings();
      fetchUserFlows();
      fetchABTests();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Sessions</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {sessionRecordings.length.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Recorded sessions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">User Flows</span>
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {userFlows.length}
          </div>
          <div className="text-sm text-gray-500">Active funnels</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">A/B Tests</span>
            <Beaker className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {abTests.length}
          </div>
          <div className="text-sm text-gray-500">Running experiments</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Performance</span>
            <Zap className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {performanceMetrics.processingTime}ms
          </div>
          <div className="text-sm text-gray-500">Avg processing time</div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white cursor-pointer"
          onClick={() => setActiveTab('heatmap')}
        >
          <Eye className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Heatmap Analysis</h3>
          <p className="text-blue-100 text-sm">Visualize user interactions and identify hotspots</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white cursor-pointer"
          onClick={() => setActiveTab('sessions')}
        >
          <Clock className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Session Recordings</h3>
          <p className="text-green-100 text-sm">Replay user sessions to understand behavior</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white cursor-pointer"
          onClick={() => setActiveTab('abtesting')}
        >
          <Beaker className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">A/B Testing</h3>
          <p className="text-purple-100 text-sm">Run experiments to optimize conversion</p>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">Data Loss</div>
            <div className={`text-lg font-medium ${
              performanceMetrics.dataLoss < 5 ? 'text-green-600' : 'text-red-600'
            }`}>
              {performanceMetrics.dataLoss.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Memory Usage</div>
            <div className="text-lg font-medium text-gray-900">
              {(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Network Latency</div>
            <div className="text-lg font-medium text-gray-900">
              {performanceMetrics.networkLatency}ms
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-lg font-medium text-green-600">Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'heatmap':
        return (
          <HeatmapViewer
            data={heatmapData || { points: [], viewport: { width: 1920, height: 1080 }, metadata: { url: '', dateRange: { start: '', end: '' }, totalSessions: 0, totalInteractions: 0 } }}
            isLoading={heatmapLoading}
            error={heatmapError}
            onExport={(format) => exportData('heatmap', format as any)}
          />
        );
      case 'sessions':
        return (
          <SessionRecorder
            isRecording={isRecording}
            hasConsent={hasConsent}
            onConsentChange={(consent) => consent ? grantConsent() : revokeConsent()}
            onRecordingToggle={(recording) => recording ? startRecording() : stopRecording()}
            recordings={sessionRecordings}
            isLoading={recordingsLoading}
            error={recordingsError}
            onExport={(recordingId) => exportData('sessions', 'json')}
          />
        );
      case 'flows':
        return (
          <UserFlowAnalysis
            flows={userFlows}
            isLoading={flowsLoading}
            error={flowsError}
            onExport={(flowId, format) => exportData('flows', format as any)}
            onRefresh={fetchUserFlows}
          />
        );
      case 'abtesting':
        return (
          <ABTesting
            tests={abTests}
            isLoading={testsLoading}
            error={testsError}
            onExport={(testId, format) => exportData('tests', format as any)}
            onRefresh={fetchABTests}
          />
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Privacy Mode</h4>
                  <p className="text-sm text-gray-500">Anonymize all collected data</p>
                </div>
                <button
                  onClick={() => config.privacyMode ? revokeConsent() : grantConsent()}
                  className={`px-4 py-2 rounded-lg ${
                    config.privacyMode 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {config.privacyMode ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Data Collection</h4>
                  <p className="text-sm text-gray-500">Currently {isTracking ? 'active' : 'inactive'}</p>
                </div>
                <button
                  onClick={() => isTracking ? stopTracking() : startTracking()}
                  className={`px-4 py-2 rounded-lg ${
                    isTracking 
                      ? 'bg-red-600 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {isTracking ? 'Stop' : 'Start'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Consent Status</h4>
                  <p className="text-sm text-gray-500">
                    {hasConsent ? 'User has granted consent' : 'Consent not granted'}
                  </p>
                </div>
                <button
                  onClick={() => setShowConsentModal(true)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Manage Consent
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  if (!hasConsent) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-8 ${className}`}>
        <div className="text-center max-w-2xl mx-auto">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Consent Required</h2>
          <p className="text-gray-600 mb-6">
            To provide you with personalized insights and improve your experience, we need your consent to collect analytics data. All data is anonymized and processed according to privacy regulations.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-medium text-gray-900 mb-2">What we collect:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Page views and navigation patterns</li>
              <li>• Click interactions and mouse movements</li>
              <li>• Scroll behavior and time spent on pages</li>
              <li>• Session duration and device information</li>
            </ul>
            <h4 className="font-medium text-gray-900 mb-2 mt-4">How we use it:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Improve user experience and interface design</li>
              <li>• Identify and fix usability issues</li>
              <li>• Optimize conversion rates</li>
              <li>• Personalize content and features</li>
            </ul>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRevokeConsent}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleGrantConsent}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Accept & Enable Analytics
            </button>
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
            <h1 className="text-2xl font-bold text-gray-900">User Behavior Analytics</h1>
            <p className="text-sm text-gray-500">
              Comprehensive insights into user interactions and conversion optimization
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshAllData}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Tracking Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex space-x-8 px-4">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'heatmap', label: 'Heatmaps', icon: Eye },
            { id: 'sessions', label: 'Sessions', icon: Clock },
            { id: 'flows', label: 'User Flows', icon: Activity },
            { id: 'abtesting', label: 'A/B Testing', icon: Beaker },
            { id: 'settings', label: 'Settings', icon: Settings },
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
      <div className="p-6">
        {renderContent()}
      </div>

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Analytics Consent</h3>
            <p className="text-gray-600 mb-6">
              You can change your analytics preferences at any time. Disabling analytics will stop all data collection and remove previously stored data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConsentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeConsent}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Disable Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
