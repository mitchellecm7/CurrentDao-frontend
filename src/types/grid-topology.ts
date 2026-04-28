/**
 * Grid Topology Types
 * Represents the energy grid network structure with nodes and connections
 */

/**
 * Types of grid nodes
 */
export type NodeType = 
  | 'solar_farm'
  | 'wind_farm'
  | 'hydro_plant'
  | 'nuclear_plant'
  | 'gas_plant'
  | 'coal_plant'
  | 'storage'
  | 'consumer'
  | 'substation'
  | 'transformer';

/**
 * Energy balance status for a node
 */
export type EnergyStatus = 'surplus' | 'deficit' | 'balanced';

/**
 * Geographic coordinates
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Represents a grid node (energy producer, consumer, or storage)
 */
export interface GridNode {
  id: string;
  name: string;
  type: NodeType;
  coordinates: Coordinates;
  
  // Energy metrics (in MW or MWh)
  capacity: number; // Maximum output/production capacity
  currentOutput: number; // Current production/consumption rate
  storedEnergy?: number; // For storage nodes (MWh)
  
  // Status
  status: 'online' | 'offline' | 'maintenance';
  energyStatus: EnergyStatus; // surplus, deficit, or balanced
  
  // Ownership and metadata
  owner: {
    id: string;
    name: string;
    type: 'individual' | 'cooperative' | 'utility' | 'dao';
  };
  
  // Regional information
  region: string;
  zone: string; // Grid zone/balancing authority
  
  // Renewable percentage (for producers)
  renewablePercentage?: number;
  
  // Timestamp of last update
  lastUpdated: string;
}

/**
 * Represents a connection/edge between two grid nodes
 */
export interface GridEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  
  // Capacity and flow
  capacity: number; // Maximum flow capacity in MW
  currentFlow: number; // Current flow in MW (positive = source to target)
  direction: 'forward' | 'reverse' | 'bidirectional';
  
  // Physical characteristics
  voltage: number; // kV
  distance: number; // km
  
  // Status
  status: 'active' | 'scheduled' | 'outage';
  
  // Losses
  efficiency: number; // 0-1, transmission efficiency
  
  lastUpdated: string;
}

/**
 * Complete grid topology graph
 */
export interface GridTopology {
  nodes: GridNode[];
  edges: GridEdge[];
  metadata: {
    totalCapacity: number;
    totalDemand: number;
    renewablePercentage: number;
    regions: string[];
    lastUpdated: string;
  };
}

/**
 * Node details for display in modal/detail view
 */
export interface GridNodeDetails extends GridNode {
  // Additional computed metrics
  utilizationRate: number; // currentOutput / capacity (0-1)
  surplusAmount: number; // currentOutput - demand (for producers) or consumption - allocated (for consumers)
  carbonIntensity: number; // gCO2/kWh
  projectedOutput?: number; // Forecasted output for next hour
  connectedEdges: Array<{
    edgeId: string;
    connectedNodeId: string;
    connectedNodeName: string;
    flow: number;
  }>;
  recentTransactions: Array<{
    id: string;
    type: 'buy' | 'sell';
    counterparty: string;
    amount: number;
    price: number;
    timestamp: string;
  }>;
}

/**
 * Filter criteria for grid nodes
 */
export interface GridNodeFilter {
  regions?: string[];
  nodeTypes?: NodeType[];
  energyStatus?: EnergyStatus[];
  hasSurplus?: boolean;
  minCapacity?: number;
  searchQuery?: string;
}

/**
 * Graph view state for controlling the visualization
 */
export interface GraphViewState {
  center: Coordinates;
  zoom: number;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  highlightedEdgeIds: string[];
}

/**
 * Serialized graph data for D3 force simulation
 */
export interface GraphData {
  nodes: Array<{
    id: string;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
    [key: string]: any;
  }>;
  links: Array<{
    source: string | { x: number; y: number };
    target: string | { x: number; y: number };
    [key: string]: any;
  }>;
}

/**
 * Color scheme for node types
 */
export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  solar_farm: '#F59E0B', // amber
  wind_farm: '#3B82F6', // blue
  hydro_plant: '#06B6D4', // cyan
  nuclear_plant: '#8B5CF6', // purple
  gas_plant: '#F97316', // orange
  coal_plant: '#6B7280', // gray
  storage: '#10B981', // emerald
  consumer: '#EF4444', // red
  substation: '#6366F1', // indigo
  transformer: '#EC4899', // pink
};

/**
 * Color scheme for energy status
 */
export const ENERGY_STATUS_COLORS: Record<EnergyStatus, string> = {
  surplus: '#10B981', // green
  balanced: '#3B82F6', // blue
  deficit: '#EF4444', // red
};

/**
 * Node size ranges based on capacity
 */
export const NODE_SIZE_RANGE = {
  min: 8,
  max: 40,
};

/**
 * Edge width range based on flow
 */
export const EDGE_WIDTH_RANGE = {
  min: 1,
  max: 8,
};
