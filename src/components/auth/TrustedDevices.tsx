import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet, Trash2, Shield, AlertTriangle, Clock, MapPin, CheckCircle, X, Edit2 } from 'lucide-react';
import { useTwoFactor } from '../../hooks/useTwoFactor';
import { TrustedDevice } from '../../types/auth';
import { AuthHelpers } from '../../utils/authHelpers';

interface TrustedDevicesProps {
  userId: string;
}

export const TrustedDevices: React.FC<TrustedDevicesProps> = ({ userId }) => {
  const { 
    state, 
    isLoading, 
    error, 
    addTrustedDevice, 
    removeTrustedDevice, 
    clearError 
  } = useTwoFactor({ userId });

  const [confirmingRemoval, setConfirmingRemoval] = useState<string | null>(null);
  const [editingDevice, setEditingDevice] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState('');

  const activeDevices = state.trustedDevices.filter(device => device.isActive);
  const inactiveDevices = state.trustedDevices.filter(device => !device.isActive);

  const handleAddCurrentDevice = async () => {
    const deviceName = `Current Device (${AuthHelpers.detectDeviceType()})`;
    const success = await addTrustedDevice(deviceName);
    if (success) {
      clearError();
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    const success = await removeTrustedDevice(deviceId);
    if (success) {
      setConfirmingRemoval(null);
    }
  };

  const handleUpdateDeviceName = (deviceId: string) => {
    if (deviceName.trim()) {
      setState(prev => ({
        ...prev,
        trustedDevices: prev.trustedDevices.map(device =>
          device.id === deviceId
            ? { ...device, name: deviceName.trim() }
            : device
        )
      }));
      setEditingDevice(null);
      setDeviceName('');
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
      if (/tablet|ipad/i.test(ua)) {
        return <Tablet className="h-5 w-5" />;
      }
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const getDeviceType = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
      if (/tablet|ipad/i.test(ua)) {
        return 'Tablet';
      }
      return 'Mobile';
    }
    return 'Desktop';
  };

  const getBrowserInfo = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    return 'Unknown';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isCurrentDevice = (device: TrustedDevice) => {
    return device.userAgent === AuthHelpers.getBrowserInfo() && 
           device.ipAddress === 'current-ip';
  };

  const renderDeviceCard = (device: TrustedDevice) => (
    <div
      key={device.id}
      className={`border rounded-lg p-4 space-y-3 ${
        device.isActive 
          ? 'border-gray-200 bg-white' 
          : 'border-gray-200 bg-gray-50 opacity-75'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            device.isActive 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {getDeviceIcon(device.userAgent)}
          </div>
          
          <div>
            {editingDevice === device.id ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateDeviceName(device.id);
                    } else if (e.key === 'Escape') {
                      setEditingDevice(null);
                      setDeviceName('');
                    }
                  }}
                  className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Device name"
                  autoFocus
                />
                <button
                  onClick={() => handleUpdateDeviceName(device.id)}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingDevice(null);
                    setDeviceName('');
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <h3 className="font-semibold text-gray-900">{device.name}</h3>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{getDeviceType(device.userAgent)}</span>
              <span>•</span>
              <span>{getBrowserInfo(device.userAgent)}</span>
              {isCurrentDevice(device) && (
                <>
                  <span>•</span>
                  <span className="text-blue-600 font-medium">Current Device</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            device.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {device.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4" />
          <span>IP: {device.ipAddress}</span>
          {device.location && <span>• {device.location}</span>}
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>Added: {formatDate(device.createdAt)}</span>
          <span>•</span>
          <span>Last used: {formatDate(device.lastUsedAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          {device.isActive && !isCurrentDevice(device) && (
            <>
              <button
                onClick={() => {
                  setEditingDevice(device.id);
                  setDeviceName(device.name);
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit device name"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        
        {!isCurrentDevice(device) && (
          <button
            onClick={() => setConfirmingRemoval(device.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove device"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {confirmingRemoval === device.id && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-3">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">Remove this trusted device?</p>
              <p>This device will need to complete two-factor authentication on next login.</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleRemoveDevice(device.id)}
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Yes, Remove
            </button>
            <button
              onClick={() => setConfirmingRemoval(null)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <Monitor className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Trusted Devices</h3>
      <p className="text-gray-600 mb-6">
        Add your current device to skip two-factor authentication on trusted devices
      </p>
      <button
        onClick={handleAddCurrentDevice}
        disabled={isLoading}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Add Current Device
      </button>
    </div>
  );

  const renderSecurityInfo = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <h4 className="font-semibold mb-2">Trusted Devices</h4>
          <p className="mb-2">
            Trusted devices skip two-factor authentication for easier access while maintaining security.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Only add devices you personally use and control</li>
            <li>Regularly review and remove old or unused devices</li>
            <li>Devices will be re-verified if security settings change</li>
            <li>Current device cannot be removed from this list</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderDeviceStats = () => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-600">{activeDevices.length}</div>
        <div className="text-sm text-green-700">Active Devices</div>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-gray-600">{state.trustedDevices.length}</div>
        <div className="text-sm text-gray-700">Total Devices</div>
      </div>
    </div>
  );

  const isCurrentDeviceTrusted = activeDevices.some(device => isCurrentDevice(device));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Trusted Devices</h2>
        
        {!isCurrentDeviceTrusted && (
          <button
            onClick={handleAddCurrentDevice}
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add Current Device
          </button>
        )}
      </div>

      {renderSecurityInfo()}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <X className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{error.message}</p>
          </div>
        </div>
      )}

      {state.trustedDevices.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {renderDeviceStats()}
          
          {activeDevices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Devices</h3>
              {activeDevices.map(renderDeviceCard)}
            </div>
          )}
          
          {inactiveDevices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Inactive Devices</h3>
              {inactiveDevices.map(renderDeviceCard)}
            </div>
          )}
        </>
      )}

      {activeDevices.length > 3 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <h4 className="font-semibold mb-1">Security Recommendation</h4>
              <p>
                You have {activeDevices.length} trusted devices. Consider removing devices you no longer use 
                to maintain optimal security.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
