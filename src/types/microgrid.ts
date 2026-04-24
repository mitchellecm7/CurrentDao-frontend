/**
 * Microgrid Type Definitions
 * Covers grid nodes, energy flows, P2P trading, and analytics
 */

export type GridNodeStatus = 'active' | 'isolated' | 'maintenance' | 'fault' | 'offline';
export type GridNodeType = 'prosumer' | 'consumer' | 'producer' | 'storage' | 'substation';
export type EnergySourceType = 'solar' | 'wind' | 'hydro' | 'biomass' | 'grid' | 'battery';

export interface GridNode {
  id: string;
  name: string;
  type: GridNodeType;
  status: GridNodeStatus;
  location: {
    x: number;
    y: number;
    lat?: number;
    lng?: number;
  };
  capacity: number; // kW
  currentLoad: number; // kW
  currentProduction: number; // kW
  storageLevel?: number; // % (for storage nodes)
  lastUpdate: string;
  metadata: {
    manufacturer?: string;
    installDate?: string;
    firmwareVersion?: string;
    iotDeviceId?: string;
  };
}

export interface EnergyFlow {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  amount: number; // kW
  status: 'stable' | 'fluctuating' | 'critical';
  sourceType: EnergySourceType;
  timestamp: string;
}

export interface P2PTrade {
  id: string;
  buyerId: string;
  sellerId: string;
  energyAmount: number; // kWh
  price: number; // USD/kWh
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  transactionHash?: string;
}

export interface GridStatus {
  totalNodes: number;
  onlineNodes: number;
  totalLoad: number; // kW
  totalProduction: number; // kW
  storageCapacity: number; // kWh
  storageLevel: number; // %
  frequency: number; // Hz (e.g., 50.0 or 60.0)
  voltage: number; // V
  carbonIntensity: number; // gCO2/kWh
  activeAlarms: number;
  systemHealth: number; // 0-100
}

export interface CommunityAnalytics {
  dailySelfSufficiency: number; // %
  dailyRenewableShare: number; // %
  totalCarbonSaved: number; // kg
  p2pTradingVolume: number; // kWh
  historicalLoad: Array<{ timestamp: string; value: number }>;
  historicalProduction: Array<{ timestamp: string; value: number }>;
  sourceDistribution: Array<{ source: EnergySourceType; value: number }>;
}

export interface IoTDeviceData {
  deviceId: string;
  nodeId: string;
  metrics: {
    voltage: number;
    current: number;
    activePower: number;
    reactivePower: number;
    temperature: number;
    humidity?: number;
  };
  signalStrength: number; // dBm
  lastSeen: string;
}

export interface GridControlAction {
  id: string;
  action: 'isolate' | 'reconnect' | 'limit_load' | 'discharge_storage';
  targetNodeId: string;
  initiatedBy: string;
  reason: string;
  timestamp: string;
}

export interface MicrogridSnapshot {
  nodes: GridNode[];
  flows: EnergyFlow[];
  trades: P2PTrade[];
  status: GridStatus;
  analytics: CommunityAnalytics;
  timestamp: string;
}
