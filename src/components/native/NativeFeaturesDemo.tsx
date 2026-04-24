'use client'

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Shield, Camera, Users, Share2, Settings } from 'lucide-react';
import CameraIntegration from './CameraIntegration';
import ContactsSync from './ContactsSync';
import NativeSharing from './NativeSharing';
import HardwareSecurity from './HardwareSecurity';
import useNativeFeatures from '../../hooks/useNativeFeatures';
import { platformAdaptation } from '../../utils/native/platform-adaptation';

const NativeFeaturesDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'camera' | 'contacts' | 'sharing' | 'security' | 'overview'>('overview');
  const [platformInitialized, setPlatformInitialized] = useState(false);
  
  const nativeFeatures = useNativeFeatures();

  useEffect(() => {
    // Initialize platform adaptation
    platformAdaptation.initialize().then(() => {
      setPlatformInitialized(true);
    });
  }, []);

  const handleQRScan = (decodedText: string) => {
    console.log('QR Code scanned:', decodedText);
  };

  const handleDocumentCapture = (imageData: string) => {
    console.log('Document captured:', imageData);
  };

  const handlePartnersUpdate = (partners: any[]) => {
    console.log('Trading partners updated:', partners);
  };

  const handleShareComplete = (result: 'success' | 'error' | 'cancelled') => {
    console.log('Share result:', result);
  };

  const handleKeyRegistered = (key: any) => {
    console.log('Security key registered:', key);
  };

  const handleKeyRemoved = (keyId: string) => {
    console.log('Security key removed:', keyId);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Settings },
    { id: 'camera', name: 'Camera', icon: Camera },
    { id: 'contacts', name: 'Contacts', icon: Users },
    { id: 'sharing', name: 'Sharing', icon: Share2 },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-white font-bold text-lg mb-4">Native Features Status</h3>
        
        {nativeFeatures.isLoading ? (
          <div className="text-center py-8 text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Detecting native features...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(nativeFeatures.features).map(([key, feature]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    feature.isSupported ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <div className="text-white font-medium">{feature.name}</div>
                    <div className="text-sm text-gray-400">
                      Status: {feature.permission === 'granted' ? 'Granted' : 
                              feature.permission === 'denied' ? 'Denied' : 'Prompt'}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {feature.isSupported ? '✓ Supported' : '✗ Not Supported'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-white font-bold text-lg mb-4">Device Information</h3>
        
        {platformInitialized ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Platform:</span>
              <span className="text-white">{nativeFeatures.deviceCapabilities.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Camera Available:</span>
              <span className={nativeFeatures.deviceCapabilities.hasCamera ? 'text-green-400' : 'text-red-400'}>
                {nativeFeatures.deviceCapabilities.hasCamera ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Biometric Available:</span>
              <span className={nativeFeatures.deviceCapabilities.hasBiometric ? 'text-green-400' : 'text-red-400'}>
                {nativeFeatures.deviceCapabilities.hasBiometric ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">WebAuthn Support:</span>
              <span className={nativeFeatures.deviceCapabilities.hasWebAuthn ? 'text-green-400' : 'text-red-400'}>
                {nativeFeatures.deviceCapabilities.hasWebAuthn ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Battery Level:</span>
              <span className="text-white">
                {nativeFeatures.deviceCapabilities.batteryLevel 
                  ? `${Math.round(nativeFeatures.deviceCapabilities.batteryLevel * 100)}%`
                  : 'Unknown'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p>Loading device information...</p>
          </div>
        )}
      </div>

      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-white font-bold text-lg mb-4">Platform Optimizations</h3>
        
        {platformInitialized ? (
          <div className="space-y-3">
            {(() => {
              const config = platformAdaptation.getPlatformConfig();
              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Scan Frequency:</span>
                    <span className="text-white">{config.performance.scanFrequency} fps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Animation Duration:</span>
                    <span className="text-white">{config.performance.animationDuration}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Battery Optimization:</span>
                    <span className="text-white">{config.battery.optimizationLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">UI Theme:</span>
                    <span className="text-white">{config.ui.theme}</span>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">
            <p>Loading platform optimizations...</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'camera':
        return (
          <CameraIntegration
            onScanSuccess={handleQRScan}
            enableDocumentCapture={true}
            onDocumentCapture={handleDocumentCapture}
          />
        );
      case 'contacts':
        return (
          <ContactsSync
            onPartnersUpdate={handlePartnersUpdate}
            enableAutoSync={false}
          />
        );
      case 'sharing':
        return (
          <NativeSharing
            onShareComplete={handleShareComplete}
            enableFileSharing={true}
          />
        );
      case 'security':
        return (
          <HardwareSecurity
            onKeyRegistered={handleKeyRegistered}
            onKeyRemoved={handleKeyRemoved}
            enableBiometric={true}
          />
        );
      case 'overview':
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Native Features Demo</h1>
          <p className="text-gray-400">
            Test and validate native app features for CurrentDao mobile experience
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {renderContent()}
        </div>

        {/* Status Bar */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                platformInitialized ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-gray-400">
                Platform: {platformInitialized ? nativeFeatures.deviceCapabilities.platform : 'Initializing...'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <span>Features: {Object.keys(nativeFeatures.features).length}</span>
              <span>Status: {nativeFeatures.isLoading ? 'Loading' : 'Ready'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NativeFeaturesDemo;
