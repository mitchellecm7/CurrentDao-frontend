import React from 'react';
import { 
  X, 
  Zap, 
  MapPin, 
  User, 
  Battery, 
  TrendingUp, 
  TrendingDown,
  Activity,
  DollarSign,
  Calendar
} from 'lucide-react';
import { GridNodeDetails } from '../types/grid-topology';

interface NodeDetailsModalProps {
  node: GridNodeDetails;
  onClose: () => void;
  onSignTransaction: (transaction: any) => Promise<void>;
}

export const NodeDetailsModal: React.FC<NodeDetailsModalProps> = ({
  node,
  onClose,
  onSignTransaction,
}) => {
  const getEnergyStatusColor = (status: string) => {
    switch (status) {
      case 'surplus': return 'text-green-600 bg-green-100';
      case 'deficit': return 'text-red-600 bg-red-100';
      case 'balanced': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNodeTypeLabel = (type: string) => {
    return type.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getNodeColor(node.type) }}
              ></div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {getNodeTypeLabel(node.type)}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{node.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-500">Capacity</span>
              </div>
              <p className="text-xl font-bold">{node.capacity.toFixed(1)} MW</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500">Current Output</span>
              </div>
              <p className="text-xl font-bold">{node.currentOutput.toFixed(1)} MW</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEnergyStatusColor(node.energyStatus)}`}>
                {node.energyStatus === 'surplus' && <TrendingUp className="w-3 h-3" />}
                {node.energyStatus === 'deficit' && <TrendingDown className="w-3 h-3" />}
                {node.energyStatus === 'balanced' && <Activity className="w-3 h-3" />}
                {node.energyStatus.toUpperCase()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Energy Status</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Battery className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500">Utilization</span>
              </div>
              <p className="text-xl font-bold">{((node.currentOutput / node.capacity) * 100).toFixed(1)}%</p>
            </div>
          </div>

          {/* Location & Ownership */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Region</span>
                  <span className="font-medium">{node.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Grid Zone</span>
                  <span className="font-medium">{node.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Coordinates</span>
                  <span className="font-medium font-mono text-xs">
                    {node.coordinates.lat.toFixed(4)}, {node.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Ownership
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Owner</span>
                  <span className="font-medium">{node.owner.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium capitalize">{node.owner.type}</span>
                </div>
                {node.renewablePercentage !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Renewable %</span>
                    <span className="font-medium text-green-600">{node.renewablePercentage}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Storage specific info */}
          {node.type === 'storage' && node.storedEnergy !== undefined && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Battery className="w-4 h-4" />
                Storage Status
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {node.storedEnergy.toFixed(0)} MWh
                  </p>
                  <p className="text-xs text-gray-500">Stored Energy</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{node.currentOutput > 0 ? 'Discharging' : 'Charging'}</p>
                  <p className="text-xs text-gray-500">{Math.abs(node.currentOutput).toFixed(1)} MW</p>
                </div>
              </div>
              <div className="mt-3 bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(node.storedEnergy / node.capacity) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Storage Utilization: {((node.storedEnergy / node.capacity) * 100).toFixed(1)}%
              </p>
            </div>
          )}

          {/* Connected Edges */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Connected Grid Lines</h3>
            <div className="space-y-2">
              {node.connectedEdges.map(edge => (
                <div key={edge.edgeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{edge.connectedNodeName}</p>
                    <p className="text-xs text-gray-500">
                      {edge.flow > 0 ? 'Exporting' : 'Importing'} {Math.abs(edge.flow).toFixed(1)} MW
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ 
                      color: edge.flow > 0 ? '#10B981' : '#3B82F6' 
                    }}>
                      {edge.flow > 0 ? '→' : '←'} {Math.abs(edge.flow).toFixed(0)} MW
                    </p>
                    <p className="text-xs text-gray-500">{edge.edge.id.split('-')[1]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Recent Energy Transactions
            </h3>
            <div className="space-y-2">
              {node.recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      tx.type === 'sell' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {tx.type.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.counterparty}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{(tx.amount * tx.price).toFixed(2)} USD</p>
                    <p className="text-xs text-gray-500">{tx.amount} MWh @ ${tx.price}/MWh</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => {
                // Navigate to trading page for this node
                console.log('Navigate to trading for node:', node.id);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Trade Energy
            </button>
            <button
              onClick={() => onSignTransaction({
                type: 'transaction',
                nodeId: node.id,
                action: 'update_settings'
              })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for node color (inline for simplicity)
function getNodeColor(type: string): string {
  return NODE_TYPE_COLORS[type as keyof typeof NODE_TYPE_COLORS] || '#6B7280';
}

export default NodeDetailsModal;
